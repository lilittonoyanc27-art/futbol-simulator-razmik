import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { PlayerModel } from '../game/PlayerModel';
import { ballTexture } from '../game/textures';
import { Btn, Es } from '../components/Es';
import { UI } from '../i18n/ui';
import { useGame, getKit } from '../store';
import { speak } from '../audio/speech';

function Hero({ autoRotate = true }: { autoRotate?: boolean }) {
  const kit = getKit(useGame((s) => s.kit));
  const t0 = useRef(performance.now());
  const ball = useRef<THREE.Mesh>(null);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ map: ballTexture(), roughness: 0.4 }), []);
  const yaw = useRef(0);
  useFrame((_, dt) => {
    const t = (performance.now() - t0.current) / 1000;
    if (autoRotate) yaw.current += dt * 0.6;
    // toques de balón (keepie-uppie)
    const bt = (t * 1.6) % 1;
    const by = 0.35 + Math.sin(bt * Math.PI) * 1.1;
    const fx = Math.sin(yaw.current) * 0.45,
      fz = Math.cos(yaw.current) * 0.45;
    ball.current!.position.set(fx, by, fz);
    ball.current!.rotation.x += dt * 6;
  });
  return (
    <>
      <PlayerModel
        look={{ shirt: kit.shirt, shorts: kit.shorts, socks: kit.socks, numberColor: kit.number, number: 7, name: 'RAZMIK', hair: '#1a0f08', skin: '#e3b18c', scale: 1.15 }}
        pose={() => {
          const t = (performance.now() - t0.current) / 1000;
          const bt = (t * 1.6) % 1;
          return { x: 0, y: 0, z: 0, yaw: yaw.current, speed: 0, kick: bt < 0.25 ? 0.5 + bt * 2 : 0, tackle: 0, dive: 0, diveDir: 0, celebrate: 0 };
        }}
      />
      <mesh ref={ball} material={mat} castShadow>
        <sphereGeometry args={[0.17, 24, 16]} />
      </mesh>
    </>
  );
}

export function HeroCanvas({ height = 360 }: { height?: number }) {
  return (
    <div className="hero-canvas" style={{ height }}>
      <Canvas shadows dpr={[1, 1.75]} camera={{ position: [0, 1.6, 4.2], fov: 42 }}>
        <ambientLight intensity={0.5} />
        <hemisphereLight args={['#ffffff', '#1d6b2d', 0.8]} />
        <directionalLight position={[3, 6, 4]} intensity={2.4} castShadow />
        <spotLight position={[-3, 4, 2]} intensity={30} color="#ff9a3c" angle={0.6} />
        <group position={[0, -0.2, 0]}>
          <Hero />
          <mesh rotation-x={-Math.PI / 2} receiveShadow>
            <circleGeometry args={[2.2, 48]} />
            <meshStandardMaterial color="#2f9a44" />
          </mesh>
          <mesh rotation-x={-Math.PI / 2} position-y={0.005}>
            <ringGeometry args={[2.1, 2.2, 48]} />
            <meshBasicMaterial color="#fff" />
          </mesh>
        </group>
        <CamLook />
      </Canvas>
    </div>
  );
}
function CamLook() {
  useFrame(({ camera }) => camera.lookAt(0, 1.0, 0));
  return null;
}

export function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="start">
      <div className="start-bg" />
      <div className="start-content">
        <h1 className="logo">
          <Es t={UI.title} />
          <span className="logo-sub">RAZMIK #7</span>
        </h1>
        <HeroCanvas height={Math.min(420, window.innerHeight * 0.48)} />
        <Es t={UI.subtitle} as="p" className="tagline" />
        <Btn
          label={UI.start}
          icon="⚽"
          className="big start-btn"
          onClick={() => {
            speak(UI.hello.es, { force: true });
            onStart();
          }}
        />
        <div className="tip">
          💡 <Es t={UI.tipTranslate} />
        </div>
      </div>
    </div>
  );
}
