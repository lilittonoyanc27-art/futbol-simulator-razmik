import RAPIER from '@dimforge/rapier3d-compat';
import {
  BALL_R,
  BOX_DEPTH,
  BOX_HALF,
  GOAL_DEPTH,
  GOAL_H,
  GOAL_HALF,
  HALF_L,
  HALF_W,
  PENALTY_DIST,
  GRAVITY,
} from './constants';
import { InputState } from './input';
import { kick as sfxKick, whistle, cheer } from '../audio/sfx';

let rapierReady: Promise<void> | null = null;
export function initPhysics() {
  if (!rapierReady) rapierReady = RAPIER.init();
  return rapierReady;
}

export type Team = 0 | 1; // 0 = Razmik FC (ataca hacia +X), 1 = rivales
export type Role = 'GK' | 'DEF' | 'MID' | 'FWD';
export type V3 = { x: number; y: number; z: number };

export type Player = {
  id: number;
  team: Team;
  role: Role;
  number: number;
  name: string;
  human: boolean;
  pos: V3;
  vel: V3;
  yaw: number;
  home: { x: number; z: number };
  speed: number;
  skill: number;
  body: RAPIER.RigidBody;
  kickAnim: number; // >0 mientras golpea
  tackleAnim: number;
  diveAnim: number;
  diveDir: number;
  celebrate: number;
  cooldown: number;
  stun: number;
  vy: number;
  holdTimer: number;
  decideTimer: number;
  aiTarget: { x: number; z: number };
  wantsBall: boolean;
  staticSpot?: { x: number; z: number }; // entrenamiento
  highlight: number; // marcador visual
  sprinting: boolean;
};

export type GameEvent =
  | { type: 'goal'; team: Team; scorer: Player | null; ownGoal: boolean }
  | { type: 'pass'; from: Player; to: Player | null }
  | { type: 'passComplete'; from: Player; to: Player }
  | { type: 'intercepted'; from: Player; by: Player }
  | { type: 'shot'; by: Player; power: number }
  | { type: 'save'; by: Player; shooter: Player | null }
  | { type: 'miss'; shooter: Player | null }
  | { type: 'gain'; player: Player; prev: Player | null }
  | { type: 'lost'; player: Player; by: Player | null }
  | { type: 'tackle'; by: Player; victim: Player; success: boolean }
  | { type: 'foul'; on: Player; by: Player; inBox: boolean }
  | { type: 'out'; kind: 'throw' | 'corner' | 'goalkick'; team: Team }
  | { type: 'jump'; player: Player }
  | { type: 'header'; player: Player }
  | { type: 'kickoff' }
  | { type: 'setPieceResult'; goal: boolean; reason: 'goal' | 'save' | 'miss' }
  | { type: 'touch'; player: Player };

export type Mode = 'match' | 'training' | 'penalties' | 'freekicks';

export type EngineConfig = {
  mode: Mode;
  difficulty: number; // 0..1
  trainingDefenders?: number;
  kitNumberHome?: number;
};

export type SetPiece = {
  kind: 'penalty' | 'freekick';
  ball: { x: number; z: number };
  aimYaw: number;
  lift: number; // 0..1
  power: number; // 0..1 cargando
  charging: boolean;
  taken: boolean;
  timer: number;
  resolved: boolean;
  gkGuess: number; // -1, 0, 1
  wall: Player[];
};

type PendingPass = { from: Player; to: Player | null; t: number };

const v3 = (x = 0, y = 0, z = 0): V3 => ({ x, y, z });
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const dist2 = (ax: number, az: number, bx: number, bz: number) => Math.hypot(ax - bx, az - bz);
const angDiff = (a: number, b: number) => {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
};
const rand = (a: number, b: number) => a + Math.random() * (b - a);

export class Engine {
  world: RAPIER.World;
  ballBody: RAPIER.RigidBody;
  players: Player[] = [];
  human!: Player;
  owner: Player | null = null;
  lastTouch: Player | null = null;
  score: [number, number] = [0, 0];
  clock = 0; // segundos jugados
  cfg: EngineConfig;
  events: GameEvent[] = [];
  listeners: ((e: GameEvent) => void)[] = [];
  pendingPass: PendingPass | null = null;
  lastShot: { by: Player; t: number } | null = null;
  freeze = 0; // pausa breve (saques, gol)
  freezeLabel = '';
  afterFreeze: (() => void) | null = null;
  paused = false;
  setPiece: SetPiece | null = null;
  camYaw = Math.PI / 2; // hacia +X
  shootCharge = 0;
  time = 0;
  acc = 0;
  aiEnabled = true;
  awayPassive = false;
  humanSprintTime = 0;
  ballTrail: V3[] = [];
  goalFlash = 0;
  private challengeTimer = 0;

  constructor(cfg: EngineConfig) {
    this.cfg = cfg;
    this.world = new RAPIER.World({ x: 0, y: -GRAVITY, z: 0 });
    this.world.timestep = 1 / 60;
    this.buildStatic();
    const bd = RAPIER.RigidBodyDesc.dynamic().setTranslation(0, BALL_R + 0.02, 0).setLinearDamping(0.6).setAngularDamping(1.2).setCcdEnabled(true);
    this.ballBody = this.world.createRigidBody(bd);
    this.world.createCollider(RAPIER.ColliderDesc.ball(BALL_R).setRestitution(0.62).setFriction(0.7).setDensity(18), this.ballBody);
    this.buildTeams();
    this.kickoff(0, false);
  }

  on(fn: (e: GameEvent) => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((f) => f !== fn);
    };
  }
  emit(e: GameEvent) {
    this.listeners.forEach((f) => f(e));
  }

  // ---------- Construcción del mundo ----------
  private buildStatic() {
    const W = this.world;
    const ground = W.createRigidBody(RAPIER.RigidBodyDesc.fixed());
    W.createCollider(RAPIER.ColliderDesc.cuboid(80, 0.5, 60).setTranslation(0, -0.5, 0).setRestitution(0.55).setFriction(0.9), ground);
    // Vallas publicitarias
    const bx = HALF_L + 3.2,
      bz = HALF_W + 2.6;
    const wall = (x: number, z: number, hx: number, hz: number) =>
      W.createCollider(RAPIER.ColliderDesc.cuboid(hx, 0.6, hz).setTranslation(x, 0.6, z).setRestitution(0.4), ground);
    wall(0, bz, bx, 0.15);
    wall(0, -bz, bx, 0.15);
    wall(bx, 0, 0.15, bz);
    wall(-bx, 0, 0.15, bz);
    // Porterías
    for (const s of [1, -1]) {
      const gx = s * HALF_L;
      const post = (z: number) =>
        W.createCollider(RAPIER.ColliderDesc.cylinder(GOAL_H / 2, 0.07).setTranslation(gx, GOAL_H / 2, z).setRestitution(0.7), ground);
      post(GOAL_HALF);
      post(-GOAL_HALF);
      // Larguero
      W.createCollider(
        RAPIER.ColliderDesc.cylinder(GOAL_HALF, 0.07).setTranslation(gx, GOAL_H, 0).setRotation({ x: Math.SQRT1_2, y: 0, z: 0, w: Math.SQRT1_2 }).setRestitution(0.7),
        ground,
      );
      // Red (poco rebote)
      const net = (x: number, y: number, z: number, hx: number, hy: number, hz: number) =>
        W.createCollider(RAPIER.ColliderDesc.cuboid(hx, hy, hz).setTranslation(x, y, z).setRestitution(0.05).setFriction(1), ground);
      net(gx + s * (GOAL_DEPTH + 0.05), GOAL_H / 2, 0, 0.05, GOAL_H / 2, GOAL_HALF);
      net(gx + s * (GOAL_DEPTH / 2), GOAL_H / 2, GOAL_HALF + 0.05, GOAL_DEPTH / 2, GOAL_H / 2, 0.05);
      net(gx + s * (GOAL_DEPTH / 2), GOAL_H / 2, -GOAL_HALF - 0.05, GOAL_DEPTH / 2, GOAL_H / 2, 0.05);
      net(gx + s * (GOAL_DEPTH / 2), GOAL_H + 0.05, 0, GOAL_DEPTH / 2, 0.05, GOAL_HALF);
    }
  }

  private addPlayer(team: Team, role: Role, number: number, name: string, x: number, z: number, human = false): Player {
    const body = this.world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(x, 0.85, z));
    this.world.createCollider(RAPIER.ColliderDesc.capsule(0.5, role === 'GK' ? 0.36 : 0.3).setRestitution(0.3).setFriction(0.5), body);
    const d = this.cfg.difficulty;
    const p: Player = {
      id: this.players.length,
      team,
      role,
      number,
      name,
      human,
      pos: v3(x, 0, z),
      vel: v3(),
      yaw: team === 0 ? Math.PI / 2 : -Math.PI / 2,
      home: { x, z },
      speed: human ? 6.6 : team === 0 ? 6.0 : 5.0 + d * 1.6,
      skill: human ? 1 : team === 0 ? 0.7 : 0.45 + d * 0.45,
      body,
      kickAnim: 0,
      tackleAnim: 0,
      diveAnim: 0,
      diveDir: 0,
      celebrate: 0,
      cooldown: 0,
      stun: 0,
      vy: 0,
      holdTimer: 0,
      decideTimer: Math.random() * 0.3,
      aiTarget: { x, z },
      wantsBall: false,
      highlight: 0,
      sprinting: false,
    };
    this.players.push(p);
    return p;
  }

  private buildTeams() {
    const m = this.cfg.mode;
    if (m === 'match') {
      this.addPlayer(0, 'GK', 1, 'Hugo', -HALF_L + 1.5, 0);
      this.addPlayer(0, 'DEF', 4, 'Diego', -15, 2);
      this.human = this.addPlayer(0, 'MID', 7, 'Razmik', -5, 0, true);
      this.addPlayer(0, 'MID', 10, 'Mateo', -6, -9);
      this.addPlayer(0, 'FWD', 9, 'Lucas', -3, 9);
      this.addPlayer(1, 'GK', 1, 'Portero', HALF_L - 1.5, 0);
      this.addPlayer(1, 'DEF', 5, 'Rival 5', 15, 5);
      this.addPlayer(1, 'DEF', 3, 'Rival 3', 14, -6);
      this.addPlayer(1, 'MID', 8, 'Rival 8', 6, 0);
      this.addPlayer(1, 'FWD', 11, 'Rival 11', 3, 4);
    } else if (m === 'training') {
      this.human = this.addPlayer(0, 'MID', 7, 'Razmik', -6, 0, true);
      const mates: [number, string, number, number][] = [
        [9, 'Lucas', 8, 9],
        [10, 'Mateo', 2, -10],
        [4, 'Diego', -14, 6],
      ];
      for (const [n, name, x, z] of mates) {
        const pl = this.addPlayer(0, n === 4 ? 'DEF' : 'MID', n, name, x, z);
        pl.staticSpot = { x, z };
      }
      this.addPlayer(1, 'GK', 1, 'Portero', HALF_L - 1.5, 0);
      const defs = this.cfg.trainingDefenders || 0;
      for (let i = 0; i < defs; i++) {
        const pl = this.addPlayer(1, 'DEF', 3 + i * 2, 'Defensa', 14, i === 0 ? 3 : -4);
        pl.speed = 3.2;
      }
      this.awayPassive = true;
    } else {
      this.awayPassive = true;
      this.human = this.addPlayer(0, 'FWD', 7, 'Razmik', HALF_L - PENALTY_DIST - 1.5, 0, true);
      this.addPlayer(1, 'GK', 1, 'Portero', HALF_L - 0.4, 0);
      if (m === 'freekicks') for (let i = 0; i < 3; i++) this.addPlayer(1, 'DEF', 2 + i * 2, 'Barrera', HALF_L - 4, HALF_W - 1 - i);
    }
  }

  // ---------- Utilidades ----------
  ball(): V3 {
    const t = this.ballBody.translation();
    return { x: t.x, y: t.y, z: t.z };
  }
  ballVel(): V3 {
    const v = this.ballBody.linvel();
    return { x: v.x, y: v.y, z: v.z };
  }
  placeBall(x: number, z: number, y = BALL_R + 0.01) {
    this.ballBody.setTranslation({ x, y, z }, true);
    this.ballBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
    this.ballBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
  }
  setBallVel(x: number, y: number, z: number) {
    this.ballBody.setLinvel({ x, y, z }, true);
  }
  teleport(p: Player, x: number, z: number, yaw?: number) {
    p.pos.x = x;
    p.pos.z = z;
    p.pos.y = 0;
    p.vel = v3();
    p.vy = 0;
    if (yaw !== undefined) p.yaw = yaw;
    p.body.setTranslation({ x, y: 0.85, z }, true);
  }
  attackDir(t: Team) {
    return t === 0 ? 1 : -1;
  }
  goalX(t: Team) {
    // portería que ataca el equipo t
    return this.attackDir(t) * HALF_L;
  }
  teammates(p: Player) {
    return this.players.filter((o) => o.team === p.team && o !== p && !this.setPiece?.wall.includes(o));
  }
  opponents(p: Player) {
    return this.players.filter((o) => o.team !== p.team);
  }
  gk(t: Team) {
    return this.players.find((p) => p.team === t && p.role === 'GK');
  }
  facing(p: Player) {
    return { x: Math.sin(p.yaw), z: Math.cos(p.yaw) };
  }
  inBox(x: number, z: number, attackingTeam: Team) {
    const gx = this.goalX(attackingTeam);
    return Math.abs(z) < BOX_HALF && Math.abs(x - gx) < BOX_DEPTH;
  }
  playerByNumber(team: Team, n: number) {
    return this.players.find((p) => p.team === team && p.number === n);
  }

  // ---------- Saque inicial y reinicios ----------
  kickoff(team: Team, announce = true) {
    this.owner = null;
    this.pendingPass = null;
    this.setPiece = null;
    for (const p of this.players) {
      const x = p.staticSpot ? p.staticSpot.x : p.home.x;
      const z = p.staticSpot ? p.staticSpot.z : p.home.z;
      this.teleport(p, x, z, p.team === 0 ? Math.PI / 2 : -Math.PI / 2);
      p.celebrate = 0;
      p.stun = 0;
    }
    if (this.cfg.mode === 'match') {
      this.placeBall(0, 0);
      const taker = team === 0 ? this.human : this.players.find((p) => p.team === 1 && p.role === 'MID')!;
      this.teleport(taker, -this.attackDir(team) * 0.7, 0, team === 0 ? Math.PI / 2 : -Math.PI / 2);
      this.owner = null;
    } else if (this.cfg.mode === 'training') {
      this.placeBall(-2, 0);
    }
    if (announce) {
      whistle();
      this.emit({ type: 'kickoff' });
    }
  }

  private restart(label: string, team: Team, bx: number, bz: number, delay = 1.2) {
    this.freeze = delay;
    this.freezeLabel = label;
    this.owner = null;
    this.pendingPass = null;
    this.placeBall(bx, bz);
    whistle();
    this.afterFreeze = () => {
      // el jugador más cercano del equipo saca
      const cands = this.players.filter((p) => p.team === team && (p.role !== 'GK' || label === 'goalkick'));
      let taker = cands[0];
      let best = 1e9;
      for (const c of cands) {
        const d = dist2(c.pos.x, c.pos.z, bx, bz);
        if (d < best) {
          best = d;
          taker = c;
        }
      }
      if (label === 'goalkick') taker = this.gk(team) || taker;
      if (team === 0 && label !== 'goalkick' && dist2(this.human.pos.x, this.human.pos.z, bx, bz) < 14) taker = this.human;
      const aimX = clamp(bx * 0.5 + this.attackDir(team) * 8, -HALF_L + 4, HALF_L - 4);
      const yaw = Math.atan2(aimX - bx, -bz * 0.6);
      const fx = Math.sin(yaw),
        fz = Math.cos(yaw);
      this.teleport(taker, bx - fx * 0.6, bz - fz * 0.6, yaw);
      this.gainBall(taker);
      taker.holdTimer = 0;
    };
  }

  // ---------- Acciones ----------
  private gainBall(p: Player) {
    const prev = this.owner;
    if (prev === p) return;
    this.owner = p;
    this.lastTouch = p;
    p.holdTimer = 0;
    if (this.pendingPass) {
      const pp = this.pendingPass;
      if (p.team === pp.from.team && p !== pp.from) this.emit({ type: 'passComplete', from: pp.from, to: p });
      else if (p.team !== pp.from.team) this.emit({ type: 'intercepted', from: pp.from, by: p });
      this.pendingPass = null;
    }
    if (prev && prev.team !== p.team) this.emit({ type: 'lost', player: prev, by: p });
    if (this.lastShot && p.role === 'GK' && p.team !== this.lastShot.by.team && this.time - this.lastShot.t < 3) {
      this.emit({ type: 'save', by: p, shooter: this.lastShot.by });
      this.lastShot = null;
    }
    if (this.setPiece && this.setPiece.taken && !this.setPiece.resolved && p.role === 'GK') this.resolveSetPiece(false, 'save');
    this.emit({ type: 'gain', player: p, prev });
    this.emit({ type: 'touch', player: p });
  }

  private release(p: Player) {
    if (this.owner === p) this.owner = null;
    p.cooldown = 0.32;
    p.kickAnim = 0.35;
    this.lastTouch = p;
  }

  /** Pase raso (o bombeado si es largo) hacia un compañero o una dirección. */
  pass(p: Player, to: Player | null, dir?: { x: number; z: number }) {
    const b = this.ball();
    let tx: number, tz: number;
    if (to) {
      const d0 = dist2(b.x, b.z, to.pos.x, to.pos.z);
      const lead = clamp(d0 / 14, 0.15, 0.9);
      tx = to.pos.x + to.vel.x * lead;
      tz = to.pos.z + to.vel.z * lead;
    } else {
      const f = dir || this.facing(p);
      tx = b.x + f.x * 14;
      tz = b.z + f.z * 14;
    }
    const dx = tx - b.x,
      dz = tz - b.z;
    const d = Math.hypot(dx, dz) || 1;
    const c = 0.6;
    const T = clamp(d / 13, 0.45, 1.7);
    let v = (d * c) / (1 - Math.exp(-c * T));
    v = clamp(v, 6, 24);
    const err = (1 - p.skill) * 0.12;
    const ang = Math.atan2(dz, dx) + rand(-err, err);
    const lob = d > 22 ? Math.min(7, d * 0.22) : 0.6;
    if (lob > 1) v *= 0.72;
    this.release(p);
    to && (to.wantsBall = true);
    this.setBallVel(Math.cos(ang) * v, lob, Math.sin(ang) * v);
    this.pendingPass = { from: p, to, t: this.time };
    sfxKick(0.4);
    this.emit({ type: 'pass', from: p, to });
    if (p.team === 0) p.highlight = 0;
  }

  /** Disparo con potencia 0..1 hacia un punto de la portería. */
  shoot(p: Player, power: number, aimZ?: number, aimY?: number) {
    const b = this.ball();
    const gx = this.goalX(p.team);
    let z = aimZ;
    if (z === undefined) {
      // dirección de la mirada proyectada sobre la línea de gol
      const f = this.facing(p);
      const dx = gx - b.x;
      if (Math.sign(f.x) === Math.sign(dx) && Math.abs(f.x) > 0.25) z = b.z + (f.z / f.x) * dx;
      else z = rand(-GOAL_HALF, GOAL_HALF) * 0.6;
      z = clamp(z, -GOAL_HALF - 1.2, GOAL_HALF + 1.2);
      // ayuda para niños: acerca un poco el tiro al centro de la portería
      if (p.human) z = z * 0.85;
    }
    const err = (1 - p.skill) * 1.6 + power * 0.4;
    z += rand(-err, err);
    const y = aimY ?? clamp(0.3 + power * 1.9 + rand(-0.25, 0.25), 0.2, 3);
    const speed = 15 + power * 15;
    const dx = gx + this.attackDir(p.team) * 0.3 - b.x,
      dz = z - b.z;
    const d = Math.hypot(dx, dz);
    const t = d / speed;
    const vy = clamp((y - b.y + 0.5 * GRAVITY * t * t) / t, 0.5, 14);
    this.release(p);
    this.setBallVel((dx / d) * speed, vy, (dz / d) * speed);
    this.ballBody.setLinearDamping(0.05);
    this.lastShot = { by: p, t: this.time };
    sfxKick(0.9);
    this.emit({ type: 'shot', by: p, power });
  }

  private clearBall(p: Player) {
    const dir = this.attackDir(p.team);
    const ang = rand(-0.5, 0.5);
    this.release(p);
    this.setBallVel(Math.cos(ang) * 17 * dir, 7, Math.sin(ang) * 17);
    sfxKick(0.8);
  }

  private tryTackle(t: Player) {
    const o = this.owner;
    t.tackleAnim = 0.45;
    t.cooldown = 0.5;
    if (!o || o.team === t.team) return;
    const d = dist2(t.pos.x, t.pos.z, o.pos.x, o.pos.z);
    if (d > 1.9) return;
    const success = Math.random() < (t.human ? 0.72 : 0.35 + t.skill * 0.35);
    // falta (solo los rivales cometen faltas sobre nosotros, para simplificar)
    if (!t.human && t.team === 1 && o.team === 0 && this.cfg.mode === 'match' && Math.random() < 0.08) {
      this.emit({ type: 'tackle', by: t, victim: o, success: false });
      const inBox = this.inBox(o.pos.x, o.pos.z, 0);
      this.emit({ type: 'foul', on: o, by: t, inBox });
      o.stun = 0.6;
      this.owner = null;
      const fx = o.pos.x,
        fz = o.pos.z;
      this.freeze = 1.3;
      this.freezeLabel = 'foul';
      whistle();
      this.afterFreeze = () => {
        if (inBox) this.startSetPiece('penalty');
        else if (fx > HALF_L - 26) this.startSetPiece('freekick', Math.min(fx, HALF_L - 13), clamp(fz, -12, 12));
        else {
          this.placeBall(fx, fz);
          this.teleport(o, fx - 0.6, fz, Math.PI / 2);
          this.gainBall(o);
        }
      };
      return;
    }
    this.emit({ type: 'tackle', by: t, victim: o, success });
    if (success) {
      o.stun = 0.7;
      this.owner = null;
      const f = this.facing(t);
      this.setBallVel(-f.x * 1.5 + rand(-1, 1), 0.3, -f.z * 1.5 + rand(-1, 1));
      this.gainBall(t);
    } else {
      t.stun = 0.4;
    }
  }

  // ---------- Bucle principal ----------
  step(dt: number, input: InputState) {
    if (this.paused) return;
    this.acc += Math.min(dt, 0.1);
    const h = 1 / 60;
    let n = 0;
    while (this.acc >= h && n < 5) {
      this.fixedStep(h, input);
      this.acc -= h;
      n++;
    }
    input.pass = false;
    input.jump = false;
  }

  private fixedStep(dt: number, input: InputState) {
    this.time += dt;
    this.goalFlash = Math.max(0, this.goalFlash - dt);
    if (this.freeze > 0) {
      this.freeze -= dt;
      this.animateOnly(dt);
      this.world.step();
      if (this.freeze <= 0) {
        this.freezeLabel = '';
        const f = this.afterFreeze;
        this.afterFreeze = null;
        f?.();
      }
      return;
    }
    if (this.cfg.mode === 'match') this.clock += dt;

    if (this.setPiece) this.stepSetPiece(dt, input);
    else this.stepHuman(dt, input);

    for (const p of this.players) {
      if (!p.human) this.stepAI(p, dt);
      this.integrate(p, dt);
    }
    this.separate();
    this.stepBallControl(dt);
    this.world.step();
    this.checkBall();
  }

  private animateOnly(dt: number) {
    for (const p of this.players) {
      p.kickAnim = Math.max(0, p.kickAnim - dt);
      p.tackleAnim = Math.max(0, p.tackleAnim - dt);
      p.celebrate = Math.max(0, p.celebrate - dt);
      p.vel.x *= 0.9;
      p.vel.z *= 0.9;
      if (p.celebrate > 0) {
        p.vy = p.pos.y <= 0.001 ? 3.2 : p.vy - GRAVITY * dt;
        p.pos.y = Math.max(0, p.pos.y + p.vy * dt);
        p.body.setNextKinematicTranslation({ x: p.pos.x, y: 0.85 + p.pos.y, z: p.pos.z });
      }
    }
  }

  private stepHuman(dt: number, input: InputState) {
    const p = this.human;
    // dirección relativa a la cámara
    const fy = this.camYaw;
    const fwd = { x: Math.sin(fy), z: Math.cos(fy) };
    const right = { x: -fwd.z, z: fwd.x };
    // con cámara mirando +X, la derecha de la pantalla es +Z
    let mx = fwd.x * input.y + right.x * input.x;
    let mz = fwd.z * input.y + right.z * input.x;
    const len = Math.hypot(mx, mz);
    if (len > 1) {
      mx /= len;
      mz /= len;
    }
    const sprint = input.sprint && len > 0.1;
    p.sprinting = sprint;
    if (sprint) this.humanSprintTime += dt;
    const maxS = p.speed * (sprint ? 1.38 : 1) * (this.owner === p ? 0.9 : 1) * (p.stun > 0 ? 0.3 : 1);
    const ax = 30;
    const tvx = mx * maxS,
      tvz = mz * maxS;
    p.vel.x += clamp(tvx - p.vel.x, -ax * dt, ax * dt);
    p.vel.z += clamp(tvz - p.vel.z, -ax * dt, ax * dt);
    if (len > 0.1) {
      const target = Math.atan2(mx, mz);
      p.yaw += angDiff(target, p.yaw) * Math.min(1, dt * 14);
    }
    // salto
    if (input.jump && p.pos.y <= 0.001) {
      p.vy = 4.6;
      this.emit({ type: 'jump', player: p });
    }
    // carga del disparo
    const b = this.ball();
    const nearBall = dist2(p.pos.x, p.pos.z, b.x, b.z) < 1.5 && b.y < 1.2;
    if (input.shootHeld) {
      this.shootCharge = Math.min(1, this.shootCharge + dt * 1.15);
    } else if (this.shootCharge > 0) {
      if ((this.owner === p || nearBall) && p.cooldown <= 0) this.shoot(p, Math.max(0.3, this.shootCharge));
      this.shootCharge = 0;
    }
    // pase / entrada
    if (input.pass) {
      if (this.owner === p || (nearBall && p.cooldown <= 0)) {
        const dir = len > 0.1 ? { x: mx, z: mz } : this.facing(p);
        this.pass(p, this.choosePassTarget(p, dir), dir);
      } else if (p.cooldown <= 0) {
        this.tryTackle(p);
      }
    }
  }

  choosePassTarget(p: Player, dir: { x: number; z: number }) {
    const ang = Math.atan2(dir.x, dir.z);
    let best: Player | null = null;
    let bestScore = 1e9;
    for (const t of this.teammates(p)) {
      if (t.role === 'GK' && this.cfg.mode === 'match' && p.pos.x * this.attackDir(p.team) > -10) continue;
      const dx = t.pos.x - p.pos.x,
        dz = t.pos.z - p.pos.z;
      const d = Math.hypot(dx, dz);
      if (d < 2 || d > 38) continue;
      const a = Math.abs(angDiff(Math.atan2(dx, dz), ang));
      if (a > 1.1) continue;
      const score = a * 12 + d * 0.25;
      if (score < bestScore) {
        bestScore = score;
        best = t;
      }
    }
    return best;
  }

  private integrate(p: Player, dt: number) {
    p.cooldown = Math.max(0, p.cooldown - dt);
    p.stun = Math.max(0, p.stun - dt);
    p.kickAnim = Math.max(0, p.kickAnim - dt);
    p.tackleAnim = Math.max(0, p.tackleAnim - dt);
    p.diveAnim = Math.max(0, p.diveAnim - dt);
    p.highlight = Math.max(0, p.highlight - dt);
    p.celebrate = Math.max(0, p.celebrate - dt);
    p.pos.x += p.vel.x * dt;
    p.pos.z += p.vel.z * dt;
    if (p.pos.y > 0 || p.vy > 0) {
      p.vy -= GRAVITY * dt;
      p.pos.y = Math.max(0, p.pos.y + p.vy * dt);
      if (p.pos.y === 0) p.vy = 0;
    }
    const lim = p.role === 'GK' ? HALF_L + 0.5 : HALF_L + 1.5;
    p.pos.x = clamp(p.pos.x, -lim, lim);
    p.pos.z = clamp(p.pos.z, -HALF_W - 1.5, HALF_W + 1.5);
    p.body.setNextKinematicTranslation({ x: p.pos.x, y: 0.85 + p.pos.y + (p.diveAnim > 0 ? -0.35 : 0), z: p.pos.z });
  }

  private separate() {
    const ps = this.players;
    for (let i = 0; i < ps.length; i++)
      for (let j = i + 1; j < ps.length; j++) {
        const a = ps[i],
          b = ps[j];
        const dx = b.pos.x - a.pos.x,
          dz = b.pos.z - a.pos.z;
        const d = Math.hypot(dx, dz);
        if (d < 0.75 && d > 0.0001) {
          const push = (0.75 - d) / 2;
          const nx = dx / d,
            nz = dz / d;
          a.pos.x -= nx * push;
          a.pos.z -= nz * push;
          b.pos.x += nx * push;
          b.pos.z += nz * push;
        }
      }
  }

  private stepBallControl(dt: number) {
    const b = this.ball();
    const bv = this.ballVel();
    // amortiguación según altura: césped vs aire
    this.ballBody.setLinearDamping(b.y < BALL_R + 0.12 ? 0.6 : 0.04);

    const o = this.owner;
    if (o) {
      const f = this.facing(o);
      const d = dist2(o.pos.x, o.pos.z, b.x, b.z);
      if (d > 2.2 || o.stun > 0 || b.y > 1.2) {
        this.owner = null;
      } else {
        o.holdTimer += dt;
        // Regate: el balón se mantiene delante del pie con pequeños toques
        const ahead = 0.62 + Math.hypot(o.vel.x, o.vel.z) * 0.06;
        const tx = o.pos.x + f.x * ahead,
          tz = o.pos.z + f.z * ahead;
        const k = 11;
        this.setBallVel(o.vel.x + (tx - b.x) * k, Math.min(bv.y, 1.5), o.vel.z + (tz - b.z) * k);
      }
    } else {
      // ¿Quién controla el balón suelto?
      const speed = Math.hypot(bv.x, bv.z);
      let best: Player | null = null;
      let bestD = 1e9;
      for (const p of this.players) {
        if (p.cooldown > 0 || p.stun > 0) continue;
        if (this.setPiece && !this.setPiece.taken) continue;
        const isGK = p.role === 'GK';
        const reach = isGK ? (p.diveAnim > 0 ? 1.7 : 1.15) : 0.85;
        const maxH = isGK ? 2.4 : 0.9;
        const d = dist2(p.pos.x, p.pos.z, b.x, b.z);
        if (d > reach || b.y > maxH + p.pos.y) continue;
        if (!isGK && speed > 17) continue;
        if (d < bestD) {
          bestD = d;
          best = p;
        }
      }
      if (best) {
        if (best.role === 'GK' && speed > 9) {
          // el portero intenta atrapar o despejar
          const shooter = this.lastShot?.by ?? null;
          const catchP = 0.35 + best.skill * 0.5 - (speed - 9) * 0.025;
          if (Math.random() < catchP) {
            this.gainBall(best);
            this.setBallVel(0, 0, 0);
          } else {
            const dir = this.attackDir(best.team);
            this.setBallVel(dir * rand(4, 8), rand(2, 5), rand(-7, 7));
            best.cooldown = 0.5;
            this.lastTouch = best;
            if (shooter && this.lastShot) {
              this.emit({ type: 'save', by: best, shooter });
              this.lastShot = null;
            }
          }
          if (this.setPiece && this.setPiece.taken && !this.setPiece.resolved) this.resolveSetPiece(false, 'save');
        } else {
          this.gainBall(best);
        }
      }
      // cabezazo del jugador humano
      const hp = this.human;
      if (hp.pos.y > 0.15 && hp.cooldown <= 0) {
        const hd = Math.hypot(hp.pos.x - b.x, hp.pos.z - b.z);
        const hy = b.y - (hp.pos.y + 1.6);
        if (hd < 0.9 && Math.abs(hy) < 0.55) {
          const gx = this.goalX(0);
          const dx = gx - b.x,
            dz = -b.z * 0.6;
          const dd = Math.hypot(dx, dz);
          const towardGoal = Math.abs(dx) < 20;
          const f = this.facing(hp);
          const vx = towardGoal ? (dx / dd) * 14 : f.x * 11;
          const vz = towardGoal ? (dz / dd) * 14 : f.z * 11;
          this.setBallVel(vx, 1.5, vz);
          hp.cooldown = 0.4;
          this.lastTouch = hp;
          if (towardGoal) this.lastShot = { by: hp, t: this.time };
          sfxKick(0.6);
          this.emit({ type: 'header', player: hp });
        }
      }
    }
    // control del pase pendiente: caduca
    if (this.pendingPass && this.time - this.pendingPass.t > 3) this.pendingPass = null;

    // estela
    this.ballTrail.push(b);
    if (this.ballTrail.length > 12) this.ballTrail.shift();
  }

  private checkBall() {
    const b = this.ball();
    const inGoalMouth = Math.abs(b.z) < GOAL_HALF - 0.02 && b.y < GOAL_H - 0.05;
    for (const s of [1, -1] as const) {
      if (s * b.x > HALF_L + BALL_R && inGoalMouth && s * b.x < HALF_L + GOAL_DEPTH + 0.3) {
        const team: Team = s === 1 ? 0 : 1;
        this.goal(team);
        return;
      }
    }
    if (this.setPiece) {
      if (this.setPiece.taken && !this.setPiece.resolved && (Math.abs(b.x) > HALF_L + 0.3 || Math.abs(b.z) > HALF_W)) this.resolveSetPiece(false, 'miss');
      return;
    }
    if (Math.abs(b.z) > HALF_W + BALL_R) {
      const team: Team = this.lastTouch ? ((1 - this.lastTouch.team) as Team) : 0;
      const z = Math.sign(b.z) * (HALF_W - 0.4);
      this.emit({ type: 'out', kind: 'throw', team });
      this.restart('throw', team, clamp(b.x, -HALF_L + 1, HALF_L - 1), z);
      return;
    }
    if (Math.abs(b.x) > HALF_L + BALL_R) {
      const s = Math.sign(b.x);
      const defending: Team = s === 1 ? 1 : 0;
      const attacking: Team = (1 - defending) as Team;
      if (this.lastShot && this.lastShot.by.team === attacking) this.emit({ type: 'miss', shooter: this.lastShot.by });
      this.lastShot = null;
      if (this.cfg.mode === 'training') {
        this.freeze = 0.8;
        this.freezeLabel = 'reset';
        this.placeBall(s * (HALF_L - 8), 0);
        this.afterFreeze = () => this.placeBall(this.human.pos.x + 1.2, this.human.pos.z);
        return;
      }
      if (this.lastTouch && this.lastTouch.team === attacking) {
        this.emit({ type: 'out', kind: 'goalkick', team: defending });
        this.restart('goalkick', defending, s * (HALF_L - 3), 0);
      } else {
        this.emit({ type: 'out', kind: 'corner', team: attacking });
        this.restart('corner', attacking, s * (HALF_L - 0.5), Math.sign(b.z || 1) * (HALF_W - 0.5));
      }
    }
  }

  private goal(team: Team) {
    const scorer = this.lastTouch;
    const ownGoal = !!scorer && scorer.team !== team;
    this.score[team]++;
    this.goalFlash = 3;
    whistle();
    cheer(team === 0 ? 1.3 : 0.6);
    for (const p of this.players) if (p.team === team && p.role !== 'GK') p.celebrate = 3;
    this.emit({ type: 'goal', team, scorer, ownGoal });
    this.lastShot = null;
    if (this.setPiece) {
      this.resolveSetPiece(true, 'goal');
      return;
    }
    this.freeze = 3.2;
    this.freezeLabel = 'goal';
    this.owner = null;
    this.afterFreeze = () => this.kickoff((1 - team) as Team);
  }

  // ---------- Inteligencia artificial ----------
  private moveTo(p: Player, tx: number, tz: number, speedMul = 1, dt = 1 / 60) {
    const dx = tx - p.pos.x,
      dz = tz - p.pos.z;
    const d = Math.hypot(dx, dz);
    const maxS = p.speed * speedMul * (p.stun > 0 ? 0.3 : 1);
    const want = d < 0.3 ? 0 : Math.min(maxS, d * 2.5);
    const tvx = d > 0.001 ? (dx / d) * want : 0,
      tvz = d > 0.001 ? (dz / d) * want : 0;
    const a = 22 * dt;
    p.vel.x += clamp(tvx - p.vel.x, -a, a);
    p.vel.z += clamp(tvz - p.vel.z, -a, a);
    p.sprinting = speedMul > 1.1 && want > p.speed;
  }
  private faceTo(p: Player, tx: number, tz: number, dt: number) {
    const target = Math.atan2(tx - p.pos.x, tz - p.pos.z);
    p.yaw += angDiff(target, p.yaw) * Math.min(1, dt * 9);
  }

  private stepAI(p: Player, dt: number) {
    const b = this.ball();
    const bv = this.ballVel();
    if (p.celebrate > 0) {
      p.vel.x *= 0.9;
      p.vel.z *= 0.9;
      return;
    }
    if (this.setPiece) {
      this.stepSetPieceAI(p, dt);
      return;
    }
    if (p.role === 'GK') {
      this.stepGK(p, dt, b, bv);
      return;
    }
    // Entrenamiento: compañeros estáticos que devuelven pases
    if (p.staticSpot) {
      if (this.owner === p) {
        p.vel.x *= 0.8;
        p.vel.z *= 0.8;
        this.faceTo(p, this.human.pos.x, this.human.pos.z, dt);
        if (p.holdTimer > 1.3 && this.aiEnabled) this.pass(p, this.human);
      } else {
        const loose = !this.owner && dist2(b.x, b.z, p.pos.x, p.pos.z) < 6 && Math.hypot(bv.x, bv.z) < 3;
        if (loose) this.moveTo(p, b.x, b.z, 1, dt);
        else this.moveTo(p, p.staticSpot.x, p.staticSpot.z, 0.8, dt);
        this.faceTo(p, b.x, b.z, dt);
      }
      return;
    }
    if (p.team === 1 && this.awayPassive) {
      // defensas pasivos: se acercan despacio si el balón está cerca
      const d = dist2(b.x, b.z, p.pos.x, p.pos.z);
      if (this.owner === p) {
        if (p.holdTimer > 0.8) this.clearBall(p);
        return;
      }
      if (d < 7) this.moveTo(p, b.x, b.z, 0.55, dt);
      else this.moveTo(p, p.home.x, p.home.z, 0.5, dt);
      this.faceTo(p, b.x, b.z, dt);
      if (this.owner && this.owner.team === 0 && d < 1.3 && p.cooldown <= 0 && Math.random() < 0.01) this.tryTackle(p);
      return;
    }

    const dir = this.attackDir(p.team);
    const owner = this.owner;
    const weHave = owner && owner.team === p.team;

    if (owner === p) {
      this.aiCarry(p, dt);
      return;
    }

    p.decideTimer -= dt;
    if (p.decideTimer <= 0) {
      p.decideTimer = 0.25 + Math.random() * 0.15;
      const shiftX = weHave ? dir * 7 : -dir * 3;
      let tx = p.home.x + shiftX + (b.x - p.home.x) * 0.4;
      let tz = p.home.z + (b.z - p.home.z) * 0.3;
      if (weHave && p.role === 'FWD') {
        tx = b.x + dir * 9;
        tz = p.home.z * 0.8 + Math.sin(this.time * 0.4 + p.id) * 4;
      }
      if (weHave && p.role === 'MID') {
        tx = b.x + dir * rand(2, 6);
      }
      if (p.role === 'DEF') tx = Math.min(tx * dir, -2) * dir;
      tx = clamp(tx, -HALF_L + 3, HALF_L - 3);
      tz = clamp(tz, -HALF_W + 2, HALF_W - 2);
      p.aiTarget = { x: tx, z: tz };
    }

    // ¿Debo ir al balón?
    const chasers = this.players
      .filter((o) => o.team === p.team && o.role !== 'GK' && !o.human)
      .sort((a, c) => dist2(a.pos.x, a.pos.z, b.x, b.z) - dist2(c.pos.x, c.pos.z, b.x, b.z));
    const iAmChaser = chasers[0] === p;
    const ballLoose = !owner;
    const pendingToMe = this.pendingPass && this.pendingPass.to === p;
    if (pendingToMe) {
      this.moveTo(p, b.x + bv.x * 0.25, b.z + bv.z * 0.25, 1.15, dt);
      this.faceTo(p, b.x, b.z, dt);
      return;
    }
    if (!weHave && (iAmChaser || (chasers[1] === p && !ballLoose && dist2(p.pos.x, p.pos.z, b.x, b.z) < 6))) {
      // presionar
      const humanHasLoose = ballLoose && p.team === 0 && dist2(this.human.pos.x, this.human.pos.z, b.x, b.z) < dist2(p.pos.x, p.pos.z, b.x, b.z);
      if (!humanHasLoose) {
        const lead = ballLoose ? 0.3 : 0.1;
        this.moveTo(p, b.x + bv.x * lead, b.z + bv.z * lead, p.team === 1 ? 1 + this.cfg.difficulty * 0.2 : 1.1, dt);
        this.faceTo(p, b.x, b.z, dt);
        if (owner && owner.team !== p.team && p.cooldown <= 0) {
          const d = dist2(p.pos.x, p.pos.z, owner.pos.x, owner.pos.z);
          this.challengeTimer -= dt;
          if (d < 1.4 && this.challengeTimer <= 0) {
            this.challengeTimer = p.team === 1 ? 1.3 - this.cfg.difficulty * 0.6 : 0.9;
            if (Math.random() < (p.team === 1 ? 0.35 + this.cfg.difficulty * 0.3 : 0.5)) this.tryTackle(p);
          }
        }
        return;
      }
    }
    this.moveTo(p, p.aiTarget.x, p.aiTarget.z, 0.85, dt);
    this.faceTo(p, weHave ? p.pos.x + dir * 5 : b.x, weHave ? p.pos.z : b.z, dt);
  }

  private aiCarry(p: Player, dt: number) {
    const dir = this.attackDir(p.team);
    const gx = this.goalX(p.team);
    const distGoal = dist2(p.pos.x, p.pos.z, gx, 0);
    // rivales cercanos
    const opps = this.opponents(p);
    let nearest = 1e9;
    let threat: Player | null = null;
    for (const o of opps) {
      const d = dist2(o.pos.x, o.pos.z, p.pos.x, p.pos.z);
      if (d < nearest) {
        nearest = d;
        threat = o;
      }
    }
    // destino: hacia la portería esquivando
    let tx = gx,
      tz = p.pos.z * 0.6;
    if (threat && nearest < 4) {
      const side = Math.sign(p.pos.z - threat.pos.z) || 1;
      tz = p.pos.z + side * 4;
    }
    tz = clamp(tz, -HALF_W + 2, HALF_W - 2);
    this.moveTo(p, tx, tz, 0.95, dt);
    this.faceTo(p, p.pos.x + dir * 3, tz, dt);

    if (p.holdTimer < 0.35 || p.cooldown > 0) return;
    // disparo
    if (distGoal < 15 && Math.abs(p.pos.z) < 12 && Math.random() < dt * 3) {
      const keeper = this.gk((1 - p.team) as Team);
      const aim = keeper && keeper.pos.z > 0 ? rand(-GOAL_HALF, -0.6) : rand(0.6, GOAL_HALF);
      this.shoot(p, rand(0.45, 0.9), aim);
      return;
    }
    // pase
    const pressured = nearest < 2.4;
    const hold = p.holdTimer > 2.2;
    if (pressured || hold || (p.team === 0 && p.holdTimer > 1 && Math.random() < dt * 1.5)) {
      const mates = this.teammates(p).filter((t) => t.role !== 'GK');
      let best: Player | null = null;
      let bestScore = -1e9;
      for (const t of mates) {
        const d = dist2(t.pos.x, t.pos.z, p.pos.x, p.pos.z);
        if (d < 3 || d > 30) continue;
        let open = 1e9;
        for (const o of opps) open = Math.min(open, dist2(o.pos.x, o.pos.z, t.pos.x, t.pos.z));
        let score = (t.pos.x - p.pos.x) * dir * 0.4 + Math.min(open, 8) * 1.2 - d * 0.1;
        if (t.human) score += 6; // ¡los compañeros buscan a Razmik!
        if (score > bestScore) {
          bestScore = score;
          best = t;
        }
      }
      if (best && (pressured || bestScore > 2)) this.pass(p, best);
      else if (pressured && p.pos.x * dir < -HALF_L + 14) this.clearBall(p);
    }
  }

  private stepGK(p: Player, dt: number, b: V3, bv: V3) {
    const own = -this.attackDir(p.team) * HALF_L; // portería propia
    const s = Math.sign(own);
    if (this.owner === p) {
      p.vel.x *= 0.8;
      p.vel.z *= 0.8;
      this.faceTo(p, 0, 0, dt);
      if (p.holdTimer > 1.1) {
        const mates = this.teammates(p);
        const free = mates.filter((m) => this.opponents(p).every((o) => dist2(o.pos.x, o.pos.z, m.pos.x, m.pos.z) > 4));
        const target = free.sort((a, c) => (a.human ? -1 : 0) - (c.human ? -1 : 0))[0];
        if (target && Math.random() < 0.7) this.pass(p, target);
        else this.clearBall(p);
      }
      return;
    }
    // ¿tiro hacia mi portería?
    const towards = (own > 0 && bv.x > 6) || (own < 0 && bv.x < -6);
    if (towards && Math.abs(b.x - own) < 30) {
      const t = (own - s * 0.8 - b.x) / bv.x;
      if (t > 0 && t < 2) {
        const zc = b.z + bv.z * t;
        const reaction = 0.5 + p.skill * 0.6;
        const tz = clamp(zc, -GOAL_HALF - 0.6, GOAL_HALF + 0.6);
        const dz = tz - p.pos.z;
        if (Math.abs(dz) > 1.1 && p.diveAnim <= 0 && t < 0.7) {
          p.diveAnim = 0.9;
          p.diveDir = Math.sign(dz);
        }
        const sp = (p.diveAnim > 0 ? 9 : 6) * reaction;
        p.vel.z += clamp(dz * 12 - p.vel.z, -60 * dt, 60 * dt);
        p.vel.z = clamp(p.vel.z, -sp, sp);
        p.vel.x *= 0.8;
        return;
      }
    }
    // salir a por balones sueltos dentro del área
    const loose = !this.owner && Math.abs(b.x - own) < 7 && Math.abs(b.z) < 8 && Math.hypot(bv.x, bv.z) < 7;
    const nearestOpp = Math.min(...this.opponents(p).map((o) => dist2(o.pos.x, o.pos.z, b.x, b.z)));
    if (loose && dist2(p.pos.x, p.pos.z, b.x, b.z) < nearestOpp + 1) {
      this.moveTo(p, b.x, b.z, 1.1, dt);
      this.faceTo(p, b.x, b.z, dt);
      return;
    }
    // posición: en la línea entre balón y centro de la portería
    const dx = b.x - own,
      dz = b.z;
    const d = Math.hypot(dx, dz) || 1;
    const out = clamp(1 + (30 - Math.min(30, Math.abs(dx))) * 0.05, 1, 2.5);
    const tx = own + (dx / d) * out;
    const tz = clamp((dz / d) * out * 2.2, -GOAL_HALF + 0.4, GOAL_HALF - 0.4);
    this.moveTo(p, tx, tz, 0.8, dt);
    this.faceTo(p, b.x, b.z, dt);
  }

  // ---------- Penaltis y tiros libres ----------
  startSetPiece(kind: 'penalty' | 'freekick', bx?: number, bz?: number) {
    const x = bx ?? (kind === 'penalty' ? HALF_L - PENALTY_DIST : HALF_L - rand(15, 20));
    const z = bz ?? (kind === 'penalty' ? 0 : rand(-7, 7));
    this.owner = null;
    this.pendingPass = null;
    // retirar muros anteriores
    if (this.setPiece) for (const w of this.setPiece.wall) this.teleport(w, w.home.x, w.home.z);
    this.placeBall(x, z);
    const gx = HALF_L;
    const yaw = Math.atan2(gx - x, -z);
    const fx = Math.sin(yaw),
      fz = Math.cos(yaw);
    this.teleport(this.human, x - fx * 1.6, z - fz * 1.6, yaw);
    const keeper = this.gk(1)!;
    this.teleport(keeper, gx - 0.4, 0, -Math.PI / 2);
    const wall: Player[] = [];
    if (kind === 'freekick') {
      const defs = this.players.filter((p) => p.team === 1 && p.role !== 'GK');
      while (defs.length < 3) {
        const np = this.addPlayer(1, 'DEF', 2 + defs.length * 2, 'Barrera', gx, 10 + defs.length);
        defs.push(np);
      }
      const dx = gx - x,
        dz = -z;
      const d = Math.hypot(dx, dz);
      const wx = x + (dx / d) * 6,
        wz = z + (dz / d) * 6;
      const px = -dz / d,
        pz = dx / d;
      defs.slice(0, 3).forEach((w, i) => {
        const off = (i - 1) * 0.72 + 0.4 * Math.sign(z || 1);
        this.teleport(w, wx + px * off, wz + pz * off, Math.atan2(-dx, -dz));
        wall.push(w);
      });
    }
    // los demás jugadores se apartan
    for (const p of this.players) {
      if (p === this.human || p === keeper || wall.includes(p)) continue;
      this.teleport(p, x - 8 + (p.id % 3) * 2, (p.id % 2 ? 1 : -1) * (6 + p.id), p.yaw);
    }
    this.setPiece = {
      kind,
      ball: { x, z },
      aimYaw: Math.atan2(-z, gx - x),
      lift: kind === 'freekick' ? 0.55 : 0.25,
      power: 0,
      charging: false,
      taken: false,
      timer: 0,
      resolved: false,
      gkGuess: Math.random() < 0.33 ? 0 : Math.random() < 0.5 ? -1 : 1,
      wall,
    };
    whistle();
  }

  private stepSetPiece(dt: number, input: InputState) {
    const sp = this.setPiece!;
    const p = this.human;
    if (!sp.taken) {
      // apuntar: izquierda/derecha cambia dirección, arriba/abajo la altura
      sp.aimYaw = clamp(sp.aimYaw + input.x * dt * 0.6, -1.2, 1.2);
      sp.lift = clamp(sp.lift + input.y * dt * 0.8, 0, 1);
      const yaw = Math.PI / 2 - sp.aimYaw; // yaw del jugador
      p.yaw = yaw;
      const fx = Math.sin(yaw),
        fz = Math.cos(yaw);
      p.pos.x = sp.ball.x - fx * 1.6;
      p.pos.z = sp.ball.z - fz * 1.6;
      p.vel = v3();
      if (input.shootHeld) {
        sp.charging = true;
        sp.power = Math.min(1, sp.power + dt * 1.1);
      } else if (sp.charging) {
        sp.taken = true;
        sp.charging = false;
        p.kickAnim = 0.4;
        // calcular punto objetivo en la línea de gol
        const dx = HALF_L - sp.ball.x;
        const z = sp.ball.z + Math.tan(sp.aimYaw) * dx;
        const y = 0.25 + sp.lift * 2.3 + (sp.power > 0.92 ? 0.6 : 0);
        const power = Math.max(0.35, sp.power);
        // para disparar hace falta estar en el balón
        p.pos.x = sp.ball.x - fx * 0.5;
        p.pos.z = sp.ball.z - fz * 0.5;
        this.shoot(p, power, z, y);
        // la barrera salta
        sp.wall.forEach((w) => (w.vy = 3.8));
        // el portero adivina el lado
        const keeper = this.gk(1)!;
        const side = z > 0.9 ? 1 : z < -0.9 ? -1 : 0;
        const d = this.cfg.difficulty;
        const guess = Math.random() < 0.25 + d * 0.35 ? side : sp.gkGuess;
        keeper.diveDir = guess;
        if (guess !== 0) keeper.diveAnim = 1;
        keeper.aiTarget = { x: HALF_L - 0.4, z: guess * (GOAL_HALF - 0.5) };
      }
    } else {
      sp.timer += dt;
      p.vel.x *= 0.9;
      p.vel.z *= 0.9;
      if (!sp.resolved && sp.timer > 3.2) {
        this.resolveSetPiece(false, 'miss');
      }
    }
  }

  private stepSetPieceAI(p: Player, dt: number) {
    const sp = this.setPiece!;
    if (p.role === 'GK' && p.team === 1) {
      if (sp.taken) {
        const sp2 = p.diveAnim > 0 ? 8 : 5;
        const dz = p.aiTarget.z - p.pos.z;
        p.vel.z = clamp(dz * 10, -sp2, sp2);
        p.vel.x = 0;
      } else {
        p.vel = v3();
        p.pos.z += (Math.sin(this.time * 3) * 0.3 - p.pos.z) * dt * 2;
      }
      return;
    }
    p.vel.x *= 0.8;
    p.vel.z *= 0.8;
  }

  private resolveSetPiece(goal: boolean, reason: 'goal' | 'save' | 'miss') {
    const sp = this.setPiece;
    if (!sp || sp.resolved) return;
    sp.resolved = true;
    if (!goal && reason === 'miss') this.emit({ type: 'miss', shooter: this.human });
    this.emit({ type: 'setPieceResult', goal, reason });
    this.freeze = goal ? 2.6 : 1.8;
    this.freezeLabel = goal ? 'goal' : reason;
    this.afterFreeze = () => {
      if (this.cfg.mode === 'match') {
        // volver al juego: saque de puerta tras fallo, saque inicial tras gol
        for (const w of sp.wall) this.teleport(w, w.home.x, w.home.z);
        this.setPiece = null;
        if (goal) this.kickoff(1);
        else {
          const keeper = this.gk(1)!;
          this.teleport(keeper, HALF_L - 2, 0, -Math.PI / 2);
          this.placeBall(HALF_L - 3, 0);
          this.gainBall(keeper);
        }
      } else {
        this.setPiece = null;
        this.onSetPieceDone?.();
      }
    };
  }
  onSetPieceDone: (() => void) | null = null;

  // ---------- Ayudas para el modo entrenamiento ----------
  resetTraining() {
    this.kickoff(0, false);
    this.placeBall(this.human.pos.x + 3, this.human.pos.z + 1);
  }

  dispose() {
    this.listeners = [];
    try {
      this.world.free();
    } catch {
      /* nada */
    }
  }
}
