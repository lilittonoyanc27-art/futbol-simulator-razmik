import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Engine, Player } from './engine';
import { InputState } from './input';
import { PlayerModel, Look, Pose } from './PlayerModel';
import { Stadium } from './Stadium';
import { ballTexture } from './textures';
import { BALL_R, HALF_L, HALF_W } from './constants';
import type { Kit, Stadium as StadiumT } from '../data/progression';

export type Zone = { x: number; z: number; r: number; color?: string; label?: string };
export type CamMode = 'behind' | 'side';

export type SceneProps = {
  engine: Engine;
  input: InputState;
  kit: Kit;
  stadium: StadiumT;
  camMode: CamMode;
  zones?: Zone[];
  coach?: { talking: () => boolean } | null;
  labels?: () => Record<number, string | null>; // id jugador → etiqueta flotante
  onFrame?: (dt: number) => void;
};

function awayKit(home: Kit): Look {
  const red = { shirt: '#d63031', shorts: '#ffffff', socks: '#d63031', numberColor: '#ffffff' };
  const sky = { shirt: '#5dade2', shorts: '#0b1d3a', socks: '#5dade2', numberColor: '#0b1d3a' };
  return home.id === 'azul' || home.id === 'verde' ? red : home.id === 'blanca' ? red : sky;
}

function Ball({ engine }: { engine: Engine }) {
  const mesh = useRef<THREE.Mesh>(null);
  const shadow = useRef<THREE.Mesh>(null);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ map: ballTexture(), roughness: 0.45 }), []);
  useFrame(() => {
    const t = engine.ballBody.translation();
    const r = engine.ballBody.rotation();
    mesh.current!.position.set(t.x, t.y, t.z);
    mesh.current!.quaternion.set(r.x, r.y, r.z, r.w);
    const s = shadow.current!;
    s.position.set(t.x, 0.025, t.z);
    const k = Math.max(0.3, 1 - t.y * 0.25);
    s.scale.setScalar(k);
    (s.material as THREE.MeshBasicMaterial).opacity = 0.35 * k;
  });
  return (
    <>
      <mesh ref={mesh} material={mat} castShadow>
        <sphereGeometry args={[BALL_R, 24, 16]} />
      </mesh>
      <mesh ref={shadow} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[BALL_R * 1.3, 16]} />
        <meshBasicMaterial color="#000" transparent opacity={0.3} depthWrite={false} />
      </mesh>
    </>
  );
}

function AimArrow({ engine }: { engine: Engine }) {
  const g = useRef<THREE.Group>(null);
  const bar = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const sp = engine.setPiece;
    const grp = g.current!;
    grp.visible = !!sp && !sp.taken;
    if (!sp) return;
    grp.position.set(sp.ball.x, 0.06, sp.ball.z);
    grp.rotation.set(0, Math.PI / 2 - sp.aimYaw, 0);
    const len = 3 + sp.power * 4;
    bar.current!.scale.set(1, 1, len);
    bar.current!.position.set(0, sp.lift * 0.9, len / 2);
    bar.current!.rotation.x = -sp.lift * 0.35;
    (bar.current!.material as THREE.MeshBasicMaterial).color.setHSL(0.08 - sp.power * 0.08, 1, 0.55);
  });
  return (
    <group ref={g}>
      <mesh ref={bar}>
        <boxGeometry args={[0.18, 0.04, 1]} />
        <meshBasicMaterial color="#ff7a00" transparent opacity={0.85} />
      </mesh>
    </group>
  );
}

function Zones({ zones }: { zones: Zone[] }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const t = performance.now() / 300;
    ref.current?.children.forEach((c, i) => c.scale.setScalar(1 + Math.sin(t + i) * 0.06));
  });
  return (
    <group ref={ref}>
      {zones.map((z, i) => (
        <group key={i} position={[z.x, 0.04, z.z]}>
          <mesh rotation-x={-Math.PI / 2}>
            <ringGeometry args={[z.r - 0.25, z.r, 40]} />
            <meshBasicMaterial color={z.color || '#ffd23f'} transparent opacity={0.9} side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation-x={-Math.PI / 2}>
            <circleGeometry args={[z.r - 0.25, 40]} />
            <meshBasicMaterial color={z.color || '#ffd23f'} transparent opacity={0.18} depthWrite={false} />
          </mesh>
          <mesh position-y={1.5}>
            <cylinderGeometry args={[0.05, 0.05, 3, 6]} />
            <meshBasicMaterial color={z.color || '#ffd23f'} transparent opacity={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function CameraRig({ engine, mode }: { engine: Engine; mode: CamMode }) {
  const { camera, size } = useThree();
  const look = useRef(new THREE.Vector3());
  const pos = useRef(new THREE.Vector3(-14, 9, 0));
  const orbit = useRef(0);
  useFrame((_, dt) => {
    const h = engine.human;
    const b = engine.ball();
    const portrait = size.width < size.height;
    const k = 1 - Math.exp(-dt * 4);
    let target = new THREE.Vector3();
    let desired = new THREE.Vector3();
    const sp = engine.setPiece;
    if (engine.freezeLabel === 'goal') {
      orbit.current += dt * 0.5;
      const scorer = engine.players.find((p) => p.celebrate > 0) || h;
      target.set(scorer.pos.x, 1.2, scorer.pos.z);
      desired.set(target.x + Math.cos(orbit.current) * 7, 3.5, target.z + Math.sin(orbit.current) * 7);
    } else if (sp) {
      const ax = Math.cos(sp.aimYaw),
        az = Math.sin(sp.aimYaw);
      if (sp.taken) {
        target.set(b.x * 0.5 + HALF_L * 0.5, 1, b.z * 0.5);
        desired.set(sp.ball.x - ax * 5, 3.2, sp.ball.z - az * 5);
      } else {
        target.set(sp.ball.x + ax * 9, 1.0, sp.ball.z + az * 9);
        const back = portrait ? 9 : 7.5;
        desired.set(sp.ball.x - ax * back - az * 1.6, 4.2, sp.ball.z - az * back + ax * 1.6);
      }
      engine.camYaw = Math.PI / 2;
    } else if (mode === 'behind') {
      const tx = h.pos.x * 0.75 + b.x * 0.25,
        tz = h.pos.z * 0.75 + b.z * 0.25;
      const back = portrait ? 13 : 10.5;
      target.set(tx + 6, 0.8, tz * 0.92);
      desired.set(tx - back, portrait ? 9.5 : 7.5, tz * 0.85);
      engine.camYaw = Math.PI / 2;
    } else {
      const tx = h.pos.x * 0.6 + b.x * 0.4,
        tz = h.pos.z * 0.6 + b.z * 0.4;
      target.set(tx, 0, tz);
      desired.set(tx, portrait ? 17 : 19, Math.min(tz + (portrait ? 14 : 22), HALF_W + 26));
      engine.camYaw = Math.PI; // pantalla arriba = -Z
    }
    pos.current.lerp(desired, k);
    look.current.lerp(target, k * 1.3);
    camera.position.copy(pos.current);
    camera.lookAt(look.current);
  });
  return null;
}

function Players({ engine, kit, labels }: { engine: Engine; kit: Kit; labels?: () => Record<number, string | null> }) {
  const away = awayKit(kit);
  const looks = useMemo(
    () =>
      engine.players.map((p): Look => {
        if (p.role === 'GK')
          return p.team === 0
            ? { shirt: '#22c55e', shorts: '#111', socks: '#22c55e', numberColor: '#111', number: p.number, gk: true }
            : { shirt: '#f4d03f', shorts: '#111', socks: '#f4d03f', numberColor: '#111', number: p.number, gk: true };
        if (p.team === 0)
          return {
            shirt: kit.shirt,
            shorts: kit.shorts,
            socks: kit.socks,
            numberColor: kit.number,
            number: p.number,
            name: p.human ? 'RAZMIK' : p.name,
            hair: p.human ? '#1a0f08' : ['#5a3a1a', '#d9b56a', '#2b1a10'][p.id % 3],
            skin: p.human ? '#e3b18c' : ['#c68c5f', '#f0c8a0', '#8d5a3b'][p.id % 3],
          };
        return { ...away, number: p.number, hair: ['#2b1a10', '#704214', '#111'][p.id % 3], skin: ['#f0c8a0', '#a8714a', '#e0ac85'][p.id % 3] };
      }),
    [engine.players.length, kit.id],
  );
  return (
    <>
      {engine.players.map((p, i) => (
        <PlayerModel key={p.id} look={looks[i]} pose={() => poseOf(engine, p, labels?.()[p.id])} />
      ))}
    </>
  );
}

function poseOf(engine: Engine, p: Player, label?: string | null): Pose {
  return {
    x: p.pos.x,
    y: p.pos.y,
    z: p.pos.z,
    yaw: p.yaw,
    speed: Math.hypot(p.vel.x, p.vel.z),
    kick: p.kickAnim > 0 ? 1 - p.kickAnim / 0.35 : 0,
    tackle: p.tackleAnim > 0 ? p.tackleAnim / 0.45 : 0,
    dive: p.diveAnim > 0 ? 1 - p.diveAnim / 1 : 0,
    diveDir: p.diveDir,
    celebrate: p.celebrate,
    sprint: p.sprinting,
    ring: p.human ? (engine.owner === p ? '#ffd23f' : '#ff7a00') : p.highlight > 0 ? '#22c55e' : null,
    label: label ?? null,
  };
}

function Coach({ talking }: { talking: () => boolean }) {
  const look: Look = { shirt: '#0b1d3a', shorts: '#0b1d3a', socks: '#0b1d3a', numberColor: '#ff7a00', coach: true, hair: '#555', skin: '#d9a47e' };
  return (
    <PlayerModel
      look={look}
      pose={() => ({ x: -2, y: 0, z: HALF_W + 1.3, yaw: Math.PI, speed: 0, kick: 0, tackle: 0, dive: 0, diveDir: 0, celebrate: 0, talking: talking(), label: talking() ? '💬' : null })}
    />
  );
}

function Loop({ engine, input, onFrame }: { engine: Engine; input: InputState; onFrame?: (dt: number) => void }) {
  useFrame((_, dt) => {
    engine.step(dt, input);
    onFrame?.(dt);
  });
  return null;
}

export function GameScene(props: SceneProps) {
  const { engine, input, kit, stadium, camMode, zones, coach, labels, onFrame } = props;
  return (
    <Canvas
      shadows
      dpr={[1, Math.min(1.75, window.devicePixelRatio || 1)]}
      camera={{ fov: 55, near: 0.1, far: 400, position: [-14, 9, 0] }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0, touchAction: 'none' }}
    >
      <Loop engine={engine} input={input} onFrame={onFrame} />
      <Stadium st={stadium} excite={() => (engine.goalFlash > 0 ? 1 : 0.1)} />
      <Players engine={engine} kit={kit} labels={labels} />
      <Ball engine={engine} />
      <AimArrow engine={engine} />
      {zones && <Zones zones={zones} />}
      {coach && <Coach talking={coach.talking} />}
      <CameraRig engine={engine} mode={camMode} />
    </Canvas>
  );
}

export const FIELD = { HALF_L, HALF_W };
