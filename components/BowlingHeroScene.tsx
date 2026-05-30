'use client';
import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Stars, Float, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';

/* ─── Lane ─── */
function BowlingLane() {
  const laneRef = useRef<THREE.Mesh>(null);

  const laneTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Wood gradient
    const grad = ctx.createLinearGradient(0, 0, 256, 0);
    grad.addColorStop(0, '#1A0E06');
    grad.addColorStop(0.15, '#2E1A0A');
    grad.addColorStop(0.3, '#3D2211');
    grad.addColorStop(0.5, '#4A2C15');
    grad.addColorStop(0.7, '#3D2211');
    grad.addColorStop(0.85, '#2E1A0A');
    grad.addColorStop(1, '#1A0E06');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 1024);

    // Wood grain lines
    ctx.strokeStyle = 'rgba(80,45,20,0.4)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 256;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + (Math.random() - 0.5) * 10, 1024);
      ctx.stroke();
    }

    // Arrows (targeting marks)
    ctx.fillStyle = 'rgba(150,100,50,0.6)';
    [180, 280, 380, 480, 580].forEach(y => {
      ctx.save();
      ctx.translate(128, y);
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.lineTo(8, 4);
      ctx.lineTo(0, 0);
      ctx.lineTo(-8, 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);

  return (
    <group>
      {/* Main lane surface */}
      <mesh ref={laneRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.2, 22, 4, 40]} />
        <MeshReflectorMaterial
          map={laneTexture}
          mirror={0.15}
          resolution={512}
          blur={[200, 100]}
          mixBlur={0.6}
          mixStrength={0.8}
          roughness={0.3}
          depthScale={1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#4A2C15"
          metalness={0.05}
        />
      </mesh>

      {/* Gutters */}
      {[-1.25, 1.25].map((x, i) => (
        <mesh key={i} position={[x, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[0.25, 22]} />
          <meshStandardMaterial color="#0D0D0D" roughness={0.9} />
        </mesh>
      ))}

      {/* Foul line */}
      <mesh position={[0, 0.002, 8.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.2, 0.05]} />
        <meshBasicMaterial color="#FF3366" transparent opacity={0.8} />
      </mesh>

      {/* Neon lane side strips */}
      {[-1.1, 1.1].map((x, i) => (
        <mesh key={i} position={[x, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.02, 22]} />
          <meshBasicMaterial color="#00D4FF" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Bowling Ball ─── */
function BowlingBall() {
  const ballRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ballRef.current) return;
    ballRef.current.rotation.x = state.clock.elapsedTime * 0.3;
    ballRef.current.rotation.y = state.clock.elapsedTime * 0.2;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <group position={[0, 0.2, 7]}>
        {/* Ball glow */}
        <mesh>
          <sphereGeometry args={[0.28, 32, 32]} />
          <meshBasicMaterial color="#00D4FF" transparent opacity={0.04} />
        </mesh>
        {/* Main ball */}
        <mesh ref={ballRef} castShadow>
          <sphereGeometry args={[0.22, 64, 64]} />
          <meshPhysicalMaterial
            color="#0A0A14"
            metalness={0.1}
            roughness={0.05}
            clearcoat={1}
            clearcoatRoughness={0.02}
            reflectivity={0.9}
          />
        </mesh>
        {/* Finger holes */}
        {[
          [0, 0.22, 0.04],
          [-0.07, 0.18, 0.12],
          [0.07, 0.18, 0.12],
        ].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]}>
            <sphereGeometry args={[0.025, 16, 16]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

/* ─── Bowling Pin ─── */
function BowlingPin({ position, delay = 0, knocked = false }: {
  position: [number, number, number];
  delay?: number;
  knocked?: boolean;
}) {
  const pinRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!pinRef.current) return;
    const t = state.clock.elapsedTime + delay;
    pinRef.current.position.y = position[1] + Math.sin(t * 0.8) * 0.012;
    if (knocked) {
      pinRef.current.rotation.z = Math.min(pinRef.current.rotation.z + 0.02, 1.5);
    }
  });

  return (
    <group ref={pinRef} position={position} castShadow>
      {/* Pin body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.04, 0.08, 0.3, 16]} />
        <meshPhysicalMaterial
          color="#FAFAFA"
          metalness={0.05}
          roughness={0.15}
          clearcoat={0.8}
          emissive="#FFFFFF"
          emissiveIntensity={0.02}
        />
      </mesh>
      {/* Pin neck */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.04, 0.1, 16]} />
        <meshPhysicalMaterial color="#FAFAFA" metalness={0.05} roughness={0.15} clearcoat={0.8} />
      </mesh>
      {/* Pin head */}
      <mesh position={[0, 0.32, 0]} castShadow>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshPhysicalMaterial color="#FAFAFA" metalness={0.05} roughness={0.15} clearcoat={0.8} />
      </mesh>
      {/* Red stripe */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.042, 0.075, 0.02, 16]} />
        <meshStandardMaterial color="#CC0000" />
      </mesh>
      {/* Subtle glow underneath */}
      <pointLight color="#00D4FF" intensity={0.3} distance={0.5} position={[0, -0.2, 0]} />
    </group>
  );
}

/* ─── Pins Formation ─── */
function PinsFormation() {
  const positions: [number, number, number][] = [
    [-0.22, 0, -7.5], [-0.07, 0, -7.5], [0.07, 0, -7.5], [0.22, 0, -7.5],
    [-0.15, 0, -7.0], [0, 0, -7.0], [0.15, 0, -7.0],
    [-0.08, 0, -6.5], [0.08, 0, -6.5],
    [0, 0, -6.0],
  ];

  return (
    <group>
      {positions.map((pos, i) => (
        <BowlingPin key={i} position={pos} delay={i * 0.4} />
      ))}
    </group>
  );
}

/* ─── Dynamic Lighting ─── */
function LightingRig() {
  const movingLightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (!movingLightRef.current) return;
    movingLightRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.5) * 1.5;
    movingLightRef.current.intensity = 0.8 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
  });

  return (
    <>
      {/* Ambient */}
      <ambientLight intensity={0.08} color="#0D1A2E" />

      {/* Main overhead spots */}
      {[-4, -1, 2, 5, 8].map((z, i) => (
        <spotLight
          key={i}
          position={[0, 4, z]}
          angle={0.35}
          penumbra={0.6}
          intensity={1.8}
          color={i % 2 === 0 ? '#C8E8FF' : '#D4E8FF'}
          castShadow
          shadow-mapSize-width={512}
          shadow-mapSize-height={512}
        />
      ))}

      {/* Neon side lights */}
      <pointLight position={[-1.5, 1, 0]} color="#00D4FF" intensity={0.6} distance={8} />
      <pointLight position={[1.5, 1, 0]} color="#0066FF" intensity={0.6} distance={8} />

      {/* Moving dramatic light */}
      <pointLight ref={movingLightRef} position={[0, 3, -2]} color="#00D4FF" intensity={0.8} distance={12} />

      {/* Pin area rim light */}
      <rectAreaLight
        position={[0, 2, -8]}
        rotation={[0, 0, 0]}
        width={3}
        height={1.5}
        intensity={1.5}
        color="#C8E8FF"
      />
    </>
  );
}

/* ─── HUD Particles ─── */
function HUDParticles() {
  const particlesRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const count = 120;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 1] = Math.random() * 4 - 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 24;
      colors[i * 3] = 0;
      colors[i * 3 + 1] = 0.7 + Math.random() * 0.3;
      colors[i * 3 + 2] = 1;
    }
    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (!particlesRef.current) return;
    particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.015} vertexColors transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

/* ─── Camera Rig ─── */
function CameraRig() {
  const { camera } = useThree();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    camera.position.x = Math.sin(t * 0.08) * 0.3;
    camera.position.y = 1.8 + Math.sin(t * 0.05) * 0.1;
    camera.lookAt(0, 0, -3);
  });

  return null;
}

/* ─── Main Scene Export ─── */
export default function BowlingHeroScene() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: false }}
      style={{ background: '#050508' }}
    >
      <PerspectiveCamera makeDefault position={[0, 1.8, 10]} fov={55} />
      <fog attach="fog" args={['#050508', 18, 32]} />

      <Suspense fallback={null}>
        <LightingRig />
        <BowlingLane />
        <BowlingBall />
        <PinsFormation />
        <HUDParticles />
        <Stars radius={80} depth={40} count={800} factor={2} saturation={0.5} fade speed={0.5} />
        <Environment preset="city" environmentIntensity={0.1} />
      </Suspense>

      <CameraRig />
    </Canvas>
  );
}
