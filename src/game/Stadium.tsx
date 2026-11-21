import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FIELD_L, FIELD_W, GOAL_DEPTH, GOAL_H, GOAL_HALF, HALF_L, HALF_W } from './constants';
import { boardTexture, fieldTexture, MARGIN, netTexture } from './textures';
import type { Stadium as StadiumT } from '../data/progression';

function Goal({ side }: { side: 1 | -1 }) {
  const gx = side * HALF_L;
  const post = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3, metalness: 0.2 }), []);
  const net = useMemo(() => {
    const t = netTexture().clone();
    t.needsUpdate = true;
    t.repeat.set(8, 3);
    return new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false });
  }, []);
  return (
    <group>
      {[GOAL_HALF, -GOAL_HALF].map((z) => (
        <mesh key={z} position={[gx, GOAL_H / 2, z]} material={post} castShadow>
          <cylinderGeometry args={[0.07, 0.07, GOAL_H, 10]} />
        </mesh>
      ))}
      <mesh position={[gx, GOAL_H, 0]} rotation-x={Math.PI / 2} material={post} castShadow>
        <cylinderGeometry args={[0.07, 0.07, GOAL_HALF * 2 + 0.14, 10]} />
      </mesh>
      {/* Red */}
      <mesh position={[gx + side * GOAL_DEPTH, GOAL_H / 2, 0]} rotation-y={Math.PI / 2} material={net}>
        <planeGeometry args={[GOAL_HALF * 2, GOAL_H]} />
      </mesh>
      {[GOAL_HALF, -GOAL_HALF].map((z) => (
        <mesh key={z} position={[gx + (side * GOAL_DEPTH) / 2, GOAL_H / 2, z]} material={net}>
          <planeGeometry args={[GOAL_DEPTH, GOAL_H]} />
        </mesh>
      ))}
      <mesh position={[gx + (side * GOAL_DEPTH) / 2, GOAL_H, 0]} rotation-x={Math.PI / 2} material={net}>
        <planeGeometry args={[GOAL_DEPTH, GOAL_HALF * 2]} />
      </mesh>
    </group>
  );
}

function Boards() {
  const tex = useMemo(() => {
    const t = boardTexture('★ FÚTBOL HABLA ★ RAZMIK #7 ★ ¡VAMOS! ★', '#0b1d3a', '#ff7a00');
    t.repeat.set(4, 1);
    return t;
  }, []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ map: tex }), [tex]);
  const bx = HALF_L + 3.2,
    bz = HALF_W + 2.6;
  useFrame((_, dt) => {
    tex.offset.x += dt * 0.05;
  });
  return (
    <group>
      {[
        [0, bz, 0, bx * 2],
        [0, -bz, Math.PI, bx * 2],
        [bx, 0, -Math.PI / 2, bz * 2],
        [-bx, 0, Math.PI / 2, bz * 2],
      ].map(([x, z, r, w], i) => (
        <mesh key={i} position={[x, 0.5, z]} rotation-y={r + Math.PI} material={mat}>
          <boxGeometry args={[w, 1, 0.2]} />
        </mesh>
      ))}
    </group>
  );
}

function Crowd({ rows, seat, excite }: { rows: number; seat: string; excite: () => number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const heads = useRef<THREE.InstancedMesh>(null);
  const uni = useRef({ uTime: { value: 0 }, uExcite: { value: 0 } });
  const { matrices, colors, count, steps } = useMemo(() => {
    const m: THREE.Matrix4[] = [];
    const c: THREE.Color[] = [];
    const palette = ['#ff7a00', '#ffffff', '#1d3f8f', '#0f9d58', '#f2c94c', '#e74c3c', '#0b1d3a', '#9b59b6'];
    const steps: { pos: [number, number, number]; size: [number, number, number] }[] = [];
    const sides = [
      { cx: 0, cz: HALF_W + 4, len: FIELD_L + 6, dir: [0, 1] },
      { cx: 0, cz: -(HALF_W + 4), len: FIELD_L + 6, dir: [0, -1] },
      { cx: HALF_L + 4.6, cz: 0, len: FIELD_W + 4, dir: [1, 0] },
      { cx: -(HALF_L + 4.6), cz: 0, len: FIELD_W + 4, dir: [-1, 0] },
    ];
    const tmp = new THREE.Object3D();
    const density = rows > 9 ? 0.9 : 0.75;
    for (const s of sides) {
      for (let r = 0; r < rows; r++) {
        const off = r * 1.1;
        const y = 0.6 + r * 0.75;
        const px = s.cx + s.dir[0] * off,
          pz = s.cz + s.dir[1] * off;
        const alongX = s.dir[0] === 0;
        steps.push({ pos: [px, y / 2, pz], size: alongX ? [s.len + r * 2, y, 1.1] : [1.1, y, s.len + r * 2] });
        const n = Math.floor((s.len + r * 2) / 0.7);
        for (let i = 0; i < n; i++) {
          if (Math.random() > density) continue;
          const t = -((s.len + r * 2) / 2) + i * 0.7 + Math.random() * 0.15;
          tmp.position.set(alongX ? px + t : px, y + 0.35, alongX ? pz : pz + t);
          tmp.scale.set(1, 0.85 + Math.random() * 0.3, 1);
          tmp.updateMatrix();
          m.push(tmp.matrix.clone());
          c.push(new THREE.Color(palette[(Math.random() * palette.length) | 0]));
        }
      }
    }
    return { matrices: m, colors: c, count: m.length, steps };
  }, [rows]);

  useEffect(() => {
    const im = ref.current!;
    const hm = heads.current!;
    const skins = ['#f0c8a0', '#e0ac85', '#c68c5f', '#8d5a3b', '#f5d6b8'].map((c) => new THREE.Color(c));
    matrices.forEach((m, i) => {
      im.setMatrixAt(i, m);
      im.setColorAt(i, colors[i]);
      hm.setMatrixAt(i, m);
      hm.setColorAt(i, skins[i % skins.length]);
    });
    im.instanceMatrix.needsUpdate = true;
    hm.instanceMatrix.needsUpdate = true;
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
    if (hm.instanceColor) hm.instanceColor.needsUpdate = true;
  }, [matrices, colors]);

  const mat = useMemo(() => {
    const m = new THREE.MeshLambertMaterial({ color: '#ffffff' });
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uTime = uni.current.uTime;
      sh.uniforms.uExcite = uni.current.uExcite;
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nuniform float uTime;\nuniform float uExcite;')
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          float seed = float(gl_InstanceID) * 12.9898;
          float bob = sin(uTime * (3.0 + fract(seed) * 3.0) + seed) * 0.06;
          float jump = max(0.0, sin(uTime * 9.0 + seed)) * 0.45 * uExcite;
          transformed.y += bob + jump;`,
        );
    };
    return m;
  }, []);

  useFrame((_, dt) => {
    uni.current.uTime.value += dt;
    const e = excite();
    uni.current.uExcite.value += (e - uni.current.uExcite.value) * Math.min(1, dt * 4);
  });

  const headGeo = useMemo(() => new THREE.SphereGeometry(0.14, 8, 6).translate(0, 0.4, 0), []);
  const stepMat = useMemo(() => new THREE.MeshLambertMaterial({ color: new THREE.Color(seat).multiplyScalar(0.55) }), [seat]);
  return (
    <group>
      {steps.map((s, i) => (
        <mesh key={i} position={s.pos} material={stepMat} receiveShadow>
          <boxGeometry args={s.size} />
        </mesh>
      ))}
      <instancedMesh ref={ref} args={[undefined, undefined, count]} material={mat} frustumCulled={false}>
        <boxGeometry args={[0.44, 0.5, 0.3]} />
      </instancedMesh>
      <instancedMesh ref={heads} args={[headGeo, mat, count]} frustumCulled={false} />
    </group>
  );
}

function Floodlights({ rows }: { rows: number }) {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#fffbe0' }), []);
  const pole = useMemo(() => new THREE.MeshLambertMaterial({ color: '#888' }), []);
  const h = 10 + rows * 0.8;
  return (
    <group>
      {[
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ].map(([sx, sz], i) => {
        const x = sx * (HALF_L + 6 + rows * 0.6),
          z = sz * (HALF_W + 6 + rows * 0.6);
        return (
          <group key={i} position={[x, 0, z]}>
            <mesh position-y={h / 2} material={pole}>
              <cylinderGeometry args={[0.25, 0.35, h, 8]} />
            </mesh>
            <mesh position-y={h + 0.8} rotation-y={Math.atan2(-x, -z)} material={mat}>
              <boxGeometry args={[3.5, 2, 0.3]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export function Stadium({ st, excite = () => 0 }: { st: StadiumT; excite?: () => number }) {
  const ftex = useMemo(() => fieldTexture(st.grassA, st.grassB), [st.grassA, st.grassB]);
  return (
    <>
      <color attach="background" args={[st.sky]} />
      <fog attach="fog" args={[st.sky, 70, 160]} />
      <group>
      <hemisphereLight args={[st.night ? '#8fa8ff' : '#dff2ff', '#2d5a27', st.night ? 0.55 : 0.9]} />
      <directionalLight
        position={[18, 32, 14]}
        intensity={st.night ? 1.6 : 2.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-36}
        shadow-camera-right={36}
        shadow-camera-top={26}
        shadow-camera-bottom={-26}
        shadow-camera-far={90}
      />
      <ambientLight intensity={st.night ? 0.35 : 0.25} />
      {/* suelo exterior */}
      <mesh rotation-x={-Math.PI / 2} position-y={-0.02}>
        <planeGeometry args={[260, 260]} />
        <meshLambertMaterial color={st.night ? '#1b3a22' : '#4a7d3a'} />
      </mesh>
      {/* césped con líneas */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[FIELD_L + MARGIN * 2, FIELD_W + MARGIN * 2]} />
        <meshLambertMaterial map={ftex} />
      </mesh>
      {/* banderines de córner */}
      {[
        [HALF_L, HALF_W],
        [HALF_L, -HALF_W],
        [-HALF_L, HALF_W],
        [-HALF_L, -HALF_W],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position-y={0.7}>
            <cylinderGeometry args={[0.03, 0.03, 1.4, 6]} />
            <meshLambertMaterial color="#fff" />
          </mesh>
          <mesh position={[0.18, 1.25, 0]}>
            <planeGeometry args={[0.36, 0.26]} />
            <meshBasicMaterial color="#ff7a00" side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
      <Goal side={1} />
      <Goal side={-1} />
      <Boards />
      <Crowd rows={st.standRows} seat={st.seat} excite={excite} />
      {st.night && <Floodlights rows={st.standRows} />}
      {/* banquillo */}
      <group position={[-6, 0, HALF_W + 1.6]}>
        <mesh position-y={0.45}>
          <boxGeometry args={[6, 0.9, 0.8]} />
          <meshLambertMaterial color="#0b1d3a" />
        </mesh>
        <mesh position={[0, 1.2, -0.3]}>
          <boxGeometry args={[6.2, 0.08, 1.4]} />
          <meshStandardMaterial color="#9fd3ff" transparent opacity={0.5} />
        </mesh>
      </group>
      </group>
    </>
  );
}
