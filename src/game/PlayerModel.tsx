import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { numberTexture, labelTexture } from './textures';

export type Look = {
  shirt: string;
  shorts: string;
  socks: string;
  numberColor: string;
  skin?: string;
  hair?: string;
  number?: number;
  name?: string;
  gk?: boolean;
  coach?: boolean;
  scale?: number;
};

export type Pose = {
  x: number;
  y: number;
  z: number;
  yaw: number;
  speed: number;
  kick: number; // 0..1 progreso del golpeo (0 = nada)
  tackle: number;
  dive: number;
  diveDir: number;
  celebrate: number;
  talking?: boolean;
  wave?: boolean;
  label?: string | null;
  ring?: string | null;
  sprint?: boolean;
};

const geo = {
  thigh: new THREE.CylinderGeometry(0.085, 0.075, 0.42, 8),
  shin: new THREE.CylinderGeometry(0.07, 0.055, 0.42, 8),
  boot: new THREE.BoxGeometry(0.12, 0.08, 0.24),
  torso: new THREE.BoxGeometry(0.44, 0.56, 0.26),
  hips: new THREE.BoxGeometry(0.4, 0.2, 0.24),
  upperArm: new THREE.CylinderGeometry(0.06, 0.055, 0.3, 8),
  foreArm: new THREE.CylinderGeometry(0.05, 0.045, 0.28, 8),
  hand: new THREE.SphereGeometry(0.055, 8, 6),
  head: new THREE.SphereGeometry(0.16, 16, 12),
  hair: new THREE.SphereGeometry(0.168, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2),
  neck: new THREE.CylinderGeometry(0.06, 0.07, 0.1, 8),
  eye: new THREE.SphereGeometry(0.022, 6, 6),
  plane: new THREE.PlaneGeometry(0.34, 0.34),
  ring: new THREE.RingGeometry(0.5, 0.65, 32),
  shadow: new THREE.CircleGeometry(0.42, 16),
};

const shadowMat = new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0.28, depthWrite: false });
const eyeMat = new THREE.MeshBasicMaterial({ color: '#1a1a1a' });

export function PlayerModel({ look, pose }: { look: Look; pose: () => Pose }) {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const kneeL = useRef<THREE.Group>(null);
  const kneeR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const label = useRef<THREE.Sprite>(null);
  const phase = useRef(Math.random() * 6);
  const lastLabel = useRef<string | null>(null);

  const mats = useMemo(() => {
    const m = (c: string, r = 0.8) => new THREE.MeshStandardMaterial({ color: c, roughness: r });
    return {
      shirt: m(look.shirt, 0.7),
      shorts: m(look.shorts),
      socks: m(look.socks),
      skin: m(look.skin || '#e0ac85', 0.6),
      hair: m(look.hair || '#2b1a10', 0.9),
      boot: m(look.coach ? '#222' : '#111', 0.4),
      glove: m('#f5f5f5'),
      num: new THREE.MeshBasicMaterial({ map: numberTexture(look.number ?? 0, look.numberColor, look.name), transparent: true }),
      numFront: new THREE.MeshBasicMaterial({ map: numberTexture(look.number ?? 0, look.numberColor), transparent: true }),
      ring: new THREE.MeshBasicMaterial({ color: '#ff7a00', transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false }),
      label: new THREE.SpriteMaterial({ depthTest: false, transparent: true }),
    };
  }, [look.shirt, look.shorts, look.socks, look.numberColor, look.number, look.name, look.skin, look.hair, look.coach]);

  useFrame((_, dt) => {
    const s = pose();
    const r = root.current!;
    r.position.set(s.x, 0, s.z);
    r.rotation.y = s.yaw;
    const b = body.current!;
    b.position.y = s.y;
    const spd = s.speed;
    phase.current += dt * (3 + spd * 1.55);
    const ph = phase.current;
    const amp = Math.min(1, spd / 6.5) * (s.sprint ? 1.05 : 0.85);
    let lL = Math.sin(ph) * amp,
      lR = -Math.sin(ph) * amp;
    let kL = Math.max(0, -Math.cos(ph)) * amp * 1.2,
      kR = Math.max(0, Math.cos(ph)) * amp * 1.2;
    let aL = -Math.sin(ph) * amp * 0.9,
      aR = Math.sin(ph) * amp * 0.9;
    let aLz = 0.12,
      aRz = -0.12;
    let lean = amp * 0.18;
    let roll = 0;
    let bodyDrop = Math.abs(Math.sin(ph)) * amp * 0.05;

    if (s.kick > 0) {
      // golpeo: atrás y luego adelante
      const t = s.kick;
      const k = t < 0.35 ? (t / 0.35) * 0.9 : 0.9 - ((t - 0.35) / 0.65) * 2.3;
      lR = k;
      kR = t < 0.35 ? 0.9 : 0.2;
      aL = -0.6;
      aR = 0.5;
      lean = -0.1;
    }
    if (s.tackle > 0) {
      lR = -1.2;
      lL = 0.3;
      kL = 0.8;
      lean = -0.5;
      bodyDrop = 0.35 * s.tackle;
    }
    if (s.dive > 0) {
      roll = -s.diveDir * Math.min(1.35, s.dive * 2.5);
      aLz = 2.6;
      aRz = -2.6;
      bodyDrop = Math.min(0.5, s.dive * 0.7);
    }
    if (s.celebrate > 0) {
      aLz = 2.7 + Math.sin(ph * 2) * 0.2;
      aRz = -2.7 - Math.sin(ph * 2) * 0.2;
      aL = aR = 0;
    }
    if (s.talking) {
      aR = -0.9 + Math.sin(performance.now() / 160) * 0.35;
      aRz = -0.4;
      head.current!.rotation.x = Math.sin(performance.now() / 120) * 0.08;
    } else if (head.current) head.current.rotation.x = 0;
    if (s.wave) {
      aRz = -2.4 + Math.sin(performance.now() / 140) * 0.4;
      aR = 0;
    }
    if (look.gk && spd < 0.5 && s.dive <= 0 && s.celebrate <= 0) {
      aLz = 0.7;
      aRz = -0.7;
      aL = aR = -0.5;
    }

    legL.current!.rotation.x = lL;
    legR.current!.rotation.x = lR;
    kneeL.current!.rotation.x = kL;
    kneeR.current!.rotation.x = kR;
    armL.current!.rotation.set(aL, 0, aLz);
    armR.current!.rotation.set(aR, 0, aRz);
    b.rotation.x = lean;
    b.rotation.z = roll;
    b.position.y = s.y - bodyDrop;

    if (ring.current) {
      ring.current.visible = !!s.ring;
      if (s.ring) {
        (ring.current.material as THREE.MeshBasicMaterial).color.set(s.ring);
        const sc = 1 + Math.sin(performance.now() / 200) * 0.08;
        ring.current.scale.set(sc, sc, sc);
      }
    }
    if (label.current) {
      if (s.label !== lastLabel.current) {
        lastLabel.current = s.label ?? null;
        if (s.label) mats.label.map = labelTexture(s.label, look.shirt === '#ff7a00' || look.shirt === '#e8b923' ? '#0b1d3a' : '#ff7a00');
        mats.label.needsUpdate = true;
      }
      label.current.visible = !!s.label;
      label.current.position.y = 2.35 + Math.sin(performance.now() / 250) * 0.06;
    }
  });

  const sc = look.scale ?? 1;
  return (
    <group ref={root} scale={sc}>
      <mesh geometry={geo.shadow} material={shadowMat} rotation-x={-Math.PI / 2} position-y={0.02} />
      <mesh ref={ring} geometry={geo.ring} material={mats.ring} rotation-x={-Math.PI / 2} position-y={0.03} visible={false} />
      <sprite ref={label} material={mats.label} scale={[1.3, 0.49, 1]} position-y={2.35} visible={false} />
      <group ref={body}>
        {/* Piernas */}
        {[
          [legL, kneeL, -0.1],
          [legR, kneeR, 0.1],
        ].map(([leg, knee, x], i) => (
          <group key={i} ref={leg as any} position={[x as number, 0.92, 0]}>
            <mesh geometry={geo.thigh} material={mats.shorts} position-y={-0.16} castShadow />
            <group ref={knee as any} position-y={-0.42}>
              <mesh geometry={geo.shin} material={mats.socks} position-y={-0.21} castShadow />
              <mesh geometry={geo.boot} material={mats.boot} position={[0, -0.44, 0.05]} castShadow />
            </group>
          </group>
        ))}
        <mesh geometry={geo.hips} material={mats.shorts} position-y={0.98} castShadow />
        <mesh geometry={geo.torso} material={mats.shirt} position-y={1.32} castShadow />
        {look.number !== undefined && (
          <>
            <mesh geometry={geo.plane} material={mats.num} position={[0, 1.34, -0.135]} rotation-y={Math.PI} />
            <mesh geometry={geo.plane} material={mats.numFront} position={[0.11, 1.44, 0.135]} scale={0.38} />
          </>
        )}
        {/* Brazos */}
        {[
          [armL, -0.28],
          [armR, 0.28],
        ].map(([arm, x], i) => (
          <group key={i} ref={arm as any} position={[x as number, 1.56, 0]}>
            <mesh geometry={geo.upperArm} material={mats.shirt} position-y={-0.14} castShadow />
            <mesh geometry={geo.foreArm} material={look.coach ? mats.shirt : mats.skin} position-y={-0.42} castShadow />
            <mesh geometry={geo.hand} material={look.gk ? mats.glove : mats.skin} position-y={-0.58} />
          </group>
        ))}
        <mesh geometry={geo.neck} material={mats.skin} position-y={1.64} />
        <group ref={head} position-y={1.82}>
          <mesh geometry={geo.head} material={mats.skin} castShadow />
          <mesh geometry={geo.hair} material={mats.hair} position-y={0.02} rotation-x={-0.25} />
          <mesh geometry={geo.eye} material={eyeMat} position={[-0.055, 0.02, 0.145]} />
          <mesh geometry={geo.eye} material={eyeMat} position={[0.055, 0.02, 0.145]} />
        </group>
      </group>
    </group>
  );
}
