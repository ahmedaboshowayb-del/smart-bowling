'use client';
/**
 * BowlingGame – Zero WASM, instant rendering.
 * Full manual physics in useFrame refs.
 * Fixes:
 *   - Friction reduced from 4× to 0.55× so ball always reaches pins
 *   - Camera positions for front/side/top/follow/slowmo/orbit all show lane + pins
 *   - Pin scatter: dramatic multi-axis fall away from ball direction
 *   - Chain reaction: struck pins knock neighbours 40-100ms later
 *   - Collision detection uses separate x/z check for robustness
 */
import {
  useRef, useState, useCallback, useEffect, useMemo,
} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import type { BallPhysics, CameraView, GameState } from '@/types/bowling';

/* ─── Official pin triangle (30.48 cm spacing) ────────────────── */
const S      = 0.3048;
const SIN60  = Math.sin(Math.PI / 3);
const HEAD_Z = -6.5;            // headpin z-coordinate in scene units

/** pin index → [x, y, z] in scene space */
const PIN_ORIGINS: [number, number, number][] = [
  /* row 4 – back */
  [-1.5*S, 0, HEAD_Z - 3*S*SIN60],
  [-0.5*S, 0, HEAD_Z - 3*S*SIN60],
  [ 0.5*S, 0, HEAD_Z - 3*S*SIN60],
  [ 1.5*S, 0, HEAD_Z - 3*S*SIN60],
  /* row 3 */
  [-1.0*S, 0, HEAD_Z - 2*S*SIN60],
  [     0, 0, HEAD_Z - 2*S*SIN60],
  [ 1.0*S, 0, HEAD_Z - 2*S*SIN60],
  /* row 2 */
  [-0.5*S, 0, HEAD_Z - 1*S*SIN60],
  [ 0.5*S, 0, HEAD_Z - 1*S*SIN60],
  /* headpin  (row 1) */
  [     0, 0, HEAD_Z],
];

/* ─── Pin/ball state types (mutated in refs, never trigger re-render) ── */
interface BallSim {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  rolling: boolean;
  stopped: boolean;
}

interface PinSim {
  origin: THREE.Vector3;
  knocked: boolean;
  knockedAt: number;
  /* current tilt (animated toward target) */
  tiltX: number;
  tiltZ: number;
  /* final resting angle */
  targetTiltX: number;
  targetTiltZ: number;
  /* translation offset (pins slide as they fall) */
  slideX: number;
  slideZ: number;
}

/* ─── Procedural maple-wood lane texture ──────────────────────── */
function makeLaneTexture() {
  const W = 512, H = 2048;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const c = cv.getContext('2d')!;

  /* base wood gradient */
  const g = c.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0,    '#BF9A60'); g.addColorStop(0.2,  '#D4AE72');
  g.addColorStop(0.5,  '#E8C882'); g.addColorStop(0.8,  '#D4AE72');
  g.addColorStop(1,    '#BF9A60');
  c.fillStyle = g; c.fillRect(0, 0, W, H);

  /* 39 boards */
  c.strokeStyle = 'rgba(95,58,18,0.22)'; c.lineWidth = 1;
  for (let i = 0; i <= 39; i++) { const x = (i/39)*W; c.beginPath(); c.moveTo(x,0); c.lineTo(x,H); c.stroke(); }

  /* grain */
  c.strokeStyle = 'rgba(120,70,22,0.09)'; c.lineWidth = 0.6;
  for (let n = 0; n < 90; n++) {
    const x = Math.random()*W;
    c.beginPath(); c.moveTo(x,0);
    c.bezierCurveTo(x+(Math.random()-.5)*20, H*.33, x+(Math.random()-.5)*20, H*.66, x+(Math.random()-.5)*28, H);
    c.stroke();
  }

  /* arrows (7, at ~73 % texture = real 6.7 m mark) */
  c.fillStyle = 'rgba(110,62,18,0.72)';
  [.10,.20,.30,.50,.70,.80,.90].forEach(p => {
    const ax = p*W, ay = H*.73;
    c.beginPath(); c.moveTo(ax, ay-24); c.lineTo(ax+10, ay+10); c.lineTo(ax, ay+3); c.lineTo(ax-10, ay+10); c.closePath(); c.fill();
  });

  /* guide dots (at ~88 %) */
  c.fillStyle = 'rgba(110,62,18,0.55)';
  [.10,.20,.30,.50,.70,.80,.90].forEach(p => { c.beginPath(); c.arc(p*W, H*.88, 7, 0, Math.PI*2); c.fill(); });

  const t = new THREE.CanvasTexture(cv);
  t.anisotropy = 16; t.minFilter = THREE.LinearMipmapLinearFilter;
  return t;
}

/* ─── Bright bowling-alley lighting ──────────────────────────── */
function Lighting() {
  return (
    <>
      <ambientLight intensity={1.4} color="#EEF4FF" />
      <hemisphereLight args={['#C8DEFF', '#F5DFB8', 0.8]} />

      {/* Strong ceiling directional with good shadow frustum */}
      <directionalLight
        position={[0, 10, 2]} intensity={3.5} color="#FFF5E8"
        castShadow
        shadow-mapSize-width={2048} shadow-mapSize-height={2048}
        shadow-camera-near={0.5} shadow-camera-far={40}
        shadow-camera-left={-3} shadow-camera-right={3}
        shadow-camera-top={16} shadow-camera-bottom={-10}
        shadow-bias={-0.002}
      />

      {/* Side fill */}
      <directionalLight position={[-4, 6, -2]} intensity={1.2} color="#D8EEFF" />
      <directionalLight position={[ 4, 6, -2]} intensity={1.2} color="#D8EEFF" />

      {/* Ceiling strips along lane length */}
      {([-8,-5,-2,1,4,7] as number[]).map((z, i) => (
        <spotLight key={i}
          position={[0, 5.5, z]} angle={0.42} penumbra={0.55} intensity={4.0} color="#FFF8EE"
          castShadow={i < 3} shadow-mapSize-width={512} shadow-mapSize-height={512} shadow-bias={-0.002} />
      ))}

      {/* Pin-deck super-bright so pins are always white and visible */}
      <pointLight position={[0,   3.5, HEAD_Z - S]} color="#FFFFFF" intensity={7.0} distance={8} />
      <pointLight position={[-0.5, 2,  HEAD_Z - S]} color="#EEF4FF" intensity={3.5} distance={5} />
      <pointLight position={[ 0.5, 2,  HEAD_Z - S]} color="#EEF4FF" intensity={3.5} distance={5} />

      {/* Ball-approach warm light */}
      <pointLight position={[0, 2.5, 9]} color="#FFE8C8" intensity={2.5} distance={6} />

      {/* Neon lane edge accents */}
      <pointLight position={[-0.6, 0.3, 0]} color="#00D4FF" intensity={0.6} distance={18} />
      <pointLight position={[ 0.6, 0.3, 0]} color="#0055FF" intensity={0.6} distance={18} />
    </>
  );
}

/* ─── Static lane geometry ────────────────────────────────────── */
function Lane({ tex }: { tex: THREE.CanvasTexture }) {
  return (
    <group>
      {/* Lane surface */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[1.067, 18.29]} />
        <meshStandardMaterial map={tex} roughness={0.12} metalness={0.03} />
      </mesh>

      {/* Left gutter (slightly below lane level) */}
      <mesh position={[-0.64, -0.05, 0]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
        <planeGeometry args={[0.22, 18.29]} />
        <meshStandardMaterial color="#181828" roughness={0.9} />
      </mesh>
      <mesh position={[0.64, -0.05, 0]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
        <planeGeometry args={[0.22, 18.29]} />
        <meshStandardMaterial color="#181828" roughness={0.9} />
      </mesh>

      {/* Bumper side walls (visible from side view) */}
      <mesh position={[-0.545, 0.09, 0]} receiveShadow>
        <boxGeometry args={[0.05, 0.18, 18.3]} />
        <meshStandardMaterial color="#222232" roughness={0.85} />
      </mesh>
      <mesh position={[0.545, 0.09, 0]} receiveShadow>
        <boxGeometry args={[0.05, 0.18, 18.3]} />
        <meshStandardMaterial color="#222232" roughness={0.85} />
      </mesh>

      {/* Foul line */}
      <mesh position={[0, 0.003, 8.8]} rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[1.067, 0.055]} />
        <meshBasicMaterial color="#CC1111" />
      </mesh>

      {/* Neon edge strips */}
      {([-0.525, 0.525] as number[]).map((x, i) => (
        <mesh key={i} position={[x, 0.007, 0]} rotation={[-Math.PI/2, 0, 0]}>
          <planeGeometry args={[0.015, 18.29]} />
          <meshBasicMaterial color="#00D4FF" transparent opacity={0.55} />
        </mesh>
      ))}

      {/* Pin-deck white backdrop */}
      <mesh position={[0, 1.1, HEAD_Z - 3*S*SIN60 - 0.8]} receiveShadow>
        <boxGeometry args={[2.6, 2.4, 0.15]} />
        <meshStandardMaterial color="#EEEEE8" roughness={0.82} />
      </mesh>

      {/* Back stop */}
      <mesh position={[0, 0.6, HEAD_Z - 3*S*SIN60 - 0.9]}>
        <boxGeometry args={[2.5, 1.4, 0.2]} />
        <meshStandardMaterial color="#16162A" roughness={0.9} />
      </mesh>

      {/* Approach floor (behind foul line) */}
      <mesh position={[0, -0.01, 11.5]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
        <planeGeometry args={[3.5, 5.5]} />
        <meshStandardMaterial color="#1A1A2E" roughness={0.95} />
      </mesh>

      {/*
       * NOTE: Side walls and ceiling are intentionally OMITTED.
       * They used to block the side-view and top-view cameras entirely.
       * The bumper strips (x=±0.545, 0.18 m tall) are enough to define
       * the lane boundary without obstructing the camera.
       */}
    </group>
  );
}

/* ─── Bowling ball (visual mesh, position driven by sim ref) ──── */
function Ball({
  simRef, gameState,
}: {
  simRef: React.MutableRefObject<BallSim>;
  gameState: GameState;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, dt) => {
    if (!groupRef.current) return;
    const { pos, vel, rolling } = simRef.current;
    groupRef.current.position.set(pos.x, pos.y, pos.z);
    if (rolling) {
      const spd = Math.abs(vel.z);
      groupRef.current.rotation.x -= (spd / 0.22) * dt;
    }
  });

  const active = gameState === 'rolling' || gameState === 'impact';

  return (
    <group ref={groupRef} position={[0, 0.22, 9]}>
      {/* Aura when active */}
      {active && (
        <mesh>
          <sphereGeometry args={[0.26, 18, 18]} />
          <meshBasicMaterial color="#00D4FF" transparent opacity={0.07} />
        </mesh>
      )}

      {/* Main ball */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.22, 48, 48]} />
        <meshPhysicalMaterial
          color="#0C0C1C"
          metalness={0.09}
          roughness={0.04}
          clearcoat={1.0}
          clearcoatRoughness={0.01}
          reflectivity={1.0}
          envMapIntensity={1.6}
          emissive={active ? '#001A44' : '#000000'}
          emissiveIntensity={active ? 0.5 : 0}
        />
      </mesh>

      {/* Blue sheen */}
      <mesh>
        <sphereGeometry args={[0.222, 18, 18]} />
        <meshPhysicalMaterial color="#0044CC" transparent opacity={0.045} roughness={0} />
      </mesh>

      {/* Finger holes */}
      {([
        [0,    0.21, 0.07] as [number,number,number],
        [-0.09,0.17, 0.15] as [number,number,number],
        [ 0.09,0.17, 0.15] as [number,number,number],
      ]).map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.027, 10, 10]} />
          <meshStandardMaterial color="#000000" roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Single pin (animated by pinRef) ───────────────────────────── */
function Pin({ pinRef, origin }: {
  pinRef: React.MutableRefObject<PinSim>;
  origin: [number, number, number];
}) {
  const gRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!gRef.current) return;
    const pin = pinRef.current;

    if (pin.knocked) {
      const elapsed = state.clock.elapsedTime - pin.knockedAt;
      const t = Math.min(1, elapsed / 0.50);
      const e = t < 0.5 ? 2*t*t : -1+(4-2*t)*t; // ease-in-out quad

      pin.tiltX = THREE.MathUtils.lerp(0, pin.targetTiltX, e);
      pin.tiltZ = THREE.MathUtils.lerp(0, pin.targetTiltZ, e);

      gRef.current.rotation.x = pin.tiltX;
      gRef.current.rotation.z = pin.tiltZ;

      /* slide outward as the pin falls */
      gRef.current.position.set(
        origin[0] + pin.slideX * e,
        origin[1],
        origin[2] + pin.slideZ * e,
      );
    } else {
      /* idle subtle breath */
      gRef.current.position.set(
        origin[0],
        origin[1] + Math.sin(state.clock.elapsedTime * 0.9 + origin[0] * 5) * 0.003,
        origin[2],
      );
      gRef.current.rotation.set(0, 0, 0);
    }
  });

  /* Pin material – very bright emissive so it's visible from every camera angle */
  const pinMat = (
    <meshPhysicalMaterial
      color="#F4F4EE"
      clearcoat={0.9}
      clearcoatRoughness={0.06}
      roughness={0.12}
      metalness={0.02}
      emissive="#FFFCE8"
      emissiveIntensity={0.12}
    />
  );

  return (
    <group ref={gRef} position={origin}>
      {/* Body */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.038, 0.075, 0.28, 16]} />
        {pinMat}
      </mesh>
      {/* Neck */}
      <mesh castShadow position={[0, 0.205, 0]}>
        <cylinderGeometry args={[0.022, 0.038, 0.09, 16]} />
        {pinMat}
      </mesh>
      {/* Head */}
      <mesh castShadow position={[0, 0.285, 0]}>
        <sphereGeometry args={[0.043, 14, 14]} />
        {pinMat}
      </mesh>
      {/* Red stripe */}
      <mesh castShadow position={[0, 0.094, 0]}>
        <cylinderGeometry args={[0.040, 0.073, 0.018, 16]} />
        <meshStandardMaterial color="#CC2020" roughness={0.3} emissive="#882000" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

/* ─── Trajectory preview line ─────────────────────────────────── */
function TrajLine({ physics, visible }: { physics: BallPhysics; visible: boolean }) {
  const obj = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const aRad  = (physics.angle * Math.PI) / 180;
    const sx    = physics.launchPos * 0.4;
    for (let i = 0; i <= 50; i++) {
      const t = i / 50;
      const z = 9 - t * 17;
      const x = sx + Math.sin(aRad) * t * 8.5
               + physics.hookStrength * t * t * 0.5 * (physics.spinRate > 0 ? -1 : 1);
      pts.push(new THREE.Vector3(x, 0.06, z));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineDashedMaterial({ color: 0x00D4FF, transparent: true, opacity: 0.55, dashSize: 0.28, gapSize: 0.14 });
    const line = new THREE.Line(geo, mat);
    line.computeLineDistances();
    return line;
  }, [physics]);

  return visible ? <primitive object={obj} /> : null;
}

/* ─── Camera controller ───────────────────────────────────────── */
function GameCamera({ view, gameState, ballPosRef, orbit }: {
  view: CameraView;
  gameState: GameState;
  ballPosRef: React.MutableRefObject<THREE.Vector3>;
  orbit: boolean;
}) {
  const { camera } = useThree();
  const cPos  = useRef(new THREE.Vector3(0, 2.8, 13));
  const cLook = useRef(new THREE.Vector3(0, 0.5, -3));

  useFrame((_, dt) => {
    if (orbit) return;
    const bp = ballPosRef.current;
    let tp = new THREE.Vector3();
    let tl = new THREE.Vector3();
    let spd = 2.5;

    /*
     * COORDINATE REFERENCE:
     *   Ball start z=9  |  Foul line z=8.8  |  Head pin z≈-6.5  |  Back pins z≈-8.3
     *   Lane x: ±0.53 (surface) + ±0.64 (gutter)
     *   No ceiling / side-walls in scene → side & top cameras unobstructed.
     */
    switch (view) {
      case 'front':
        /* Classic bowler POV – behind approach, full lane in view */
        tp.set(0, 3.2, 13.5);
        tl.set(0, 0.25, HEAD_Z);
        break;

      case 'side':
        /*
         * Low wide-angle side view.
         * x=3.5 is outside the gutter (x=0.64) so nothing blocks it.
         * y=1.0 is ball-height so the ball + lane surface + pins are visible.
         * z at lane midpoint so entire length is in frame.
         */
        tp.set(3.5, 1.0, (9 + HEAD_Z) * 0.5);
        tl.set(0,   0.22, HEAD_Z);
        break;

      case 'top':
        /*
         * Pure bird's-eye.  No ceiling mesh → unobstructed.
         * Centred over lane mid-point; looks slightly past pins.
         */
        tp.set(0, 12, (9 + HEAD_Z) * 0.5 + 0.5);
        tl.set(0,  0, HEAD_Z - 1.5);
        break;

      case 'follow':
        spd = gameState === 'rolling' ? 8 : 2.5;
        if (gameState === 'rolling' || gameState === 'impact') {
          tp.set(bp.x * 0.5, bp.y + 1.8, bp.z + 4.0);
          tl.set(bp.x,       bp.y - 0.1, bp.z - 3.0);
        } else {
          tp.set(0, 3.2, 13.5); tl.set(0, 0.25, HEAD_Z);
        }
        break;

      case 'slowmo':
        /* Dramatic low angle from the side near pin deck */
        tp.set(3.8, 0.55, HEAD_Z + 1.0);
        tl.set(0,   0.22, HEAD_Z - 0.8);
        break;

      default:
        tp.set(0, 3.2, 13.5); tl.set(0, 0.25, HEAD_Z);
    }

    cPos.current.lerp(tp, dt * spd);
    cLook.current.lerp(tl, dt * spd);
    camera.position.copy(cPos.current);
    camera.lookAt(cLook.current);
  });

  return null;
}

/* ─── Physics simulation + full scene ───────────────────────────── */
interface SimProps {
  physics: BallPhysics;
  gameState: GameState;
  isPaused: boolean;
  isSlowMo: boolean;
  cameraView: CameraView;
  showTrajectory: boolean;
  onPinKnocked: (id: number) => void;
}

function SimScene({ physics, gameState, isPaused, isSlowMo, cameraView, showTrajectory, onPinKnocked }: SimProps) {
  /* ── Simulation refs ── */
  const ballSim = useRef<BallSim>({
    pos: new THREE.Vector3(physics.launchPos * 0.4, 0.22, 9),
    vel: new THREE.Vector3(),
    rolling: false,
    stopped: false,
  });

  const pinSims = useRef<PinSim[]>(
    PIN_ORIGINS.map(([x, y, z]) => ({
      origin: new THREE.Vector3(x, y, z),
      knocked: false, knockedAt: 0,
      tiltX: 0, tiltZ: 0,
      targetTiltX: 0, targetTiltZ: 0,
      slideX: 0, slideZ: 0,
    })),
  );

  const ballPosRef = useRef(new THREE.Vector3(physics.launchPos * 0.4, 0.22, 9));
  const chainQ     = useRef<{ id: number; at: number }[]>([]);

  /* ── Reset / Launch ── */
  useEffect(() => {
    if (gameState === 'idle') {
      const sx = physics.launchPos * 0.4;
      ballSim.current.pos.set(sx, 0.22, 9);
      ballSim.current.vel.set(0, 0, 0);
      ballSim.current.rolling = false;
      ballSim.current.stopped = false;
      ballPosRef.current.set(sx, 0.22, 9);
      chainQ.current = [];
      pinSims.current.forEach((p, i) => {
        const [x, y, z] = PIN_ORIGINS[i];
        p.origin.set(x, y, z);
        p.knocked = false; p.knockedAt = 0;
        p.tiltX = 0; p.tiltZ = 0;
        p.targetTiltX = 0; p.targetTiltZ = 0;
        p.slideX = 0; p.slideZ = 0;
      });
    }

    if (gameState === 'rolling') {
      const speedMs = physics.speed / 3.6;
      const aRad    = (physics.angle * Math.PI) / 180;
      const sx      = physics.launchPos * 0.4;
      ballSim.current.pos.set(sx, 0.22, 9);
      ballSim.current.vel.set(
        Math.sin(aRad) * speedMs * 0.30,   // slight lateral from angle
        0,
        -speedMs,
      );
      ballSim.current.rolling = true;
      ballSim.current.stopped = false;
      chainQ.current = [];
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  /* ── Physics loop (runs every frame) ── */
  useFrame((state, rawDt) => {
    if (isPaused) return;
    const dt = isSlowMo ? rawDt * 0.25 : rawDt;
    const ball = ballSim.current;

    /* Drain chain-reaction queue */
    chainQ.current = chainQ.current.filter(item => {
      if (state.clock.elapsedTime >= item.at) {
        knockPin(item.id, state.clock.elapsedTime, ball.pos);
        return false;
      }
      return true;
    });

    /* Camera tracking even when stopped */
    ballPosRef.current.copy(ball.pos);

    if (!ball.rolling || ball.stopped) return;

    /* ── Hook effect (gradual lateral drift from spin) ── */
    const hookAcc = physics.hookStrength
      * 0.08
      * (physics.spinRate / 400)
      * (physics.angle >= 0 ? -1 : 1);
    ball.vel.x += hookAcc * dt;

    /*
     * ── Rolling friction ──────────────────────────────────────────
     * FIXED: was 4.0 (ball stopped halfway); now 0.55
     * At default 22 km/h + friction=0.65:
     *   decel ≈ 0.36 m/s² → arrives at pins ~5.5 m/s ✓
     */
    const frictionAcc = physics.friction * 0.55;   // ← KEY FIX
    const spd3 = ball.vel.length();
    if (spd3 > frictionAcc * dt) {
      ball.vel.multiplyScalar((spd3 - frictionAcc * dt) / spd3);
    }

    /* Clamp lateral velocity to ±50 % of forward speed */
    const fwdSpd = Math.abs(ball.vel.z);
    ball.vel.x = THREE.MathUtils.clamp(ball.vel.x, -fwdSpd * 0.5, fwdSpd * 0.5);

    /* Integrate */
    ball.pos.addScaledVector(ball.vel, dt);
    ball.pos.y = 0.22;

    /* Gutter clamp */
    ball.pos.x = THREE.MathUtils.clamp(ball.pos.x, -0.50, 0.50);

    /* Stop past pin deck */
    if (ball.pos.z < HEAD_Z - 3*S*SIN60 - 1.5) {
      ball.stopped = true; ball.rolling = false;
    }

    /* ── Collision detection ── */
    const COLL_R = 0.27; // ball radius(0.22) + pin radius(0.06) + 0 margin
    pinSims.current.forEach((pin, i) => {
      if (pin.knocked) return;
      const dx = ball.pos.x - pin.origin.x;
      const dz = ball.pos.z - pin.origin.z;
      if (Math.abs(dx) < COLL_R && Math.abs(dz) < COLL_R &&
          dx*dx + dz*dz < COLL_R * COLL_R) {
        knockPin(i, state.clock.elapsedTime, ball.pos);

        /* Queue neighbours (pins within 1.3× spacing) */
        pinSims.current.forEach((p2, j) => {
          if (j === i || p2.knocked) return;
          const d2x = pin.origin.x - p2.origin.x;
          const d2z = pin.origin.z - p2.origin.z;
          if (d2x*d2x + d2z*d2z < (S*1.35)*(S*1.35)) {
            /* delay 40-100 ms so chain feels physical */
            chainQ.current.push({ id: j, at: state.clock.elapsedTime + 0.04 + Math.random()*0.06 });
          }
        });
      }
    });

    ballPosRef.current.copy(ball.pos);
  });

  /* ── Knock a pin: choose random dramatic tilt away from ball ── */
  function knockPin(id: number, now: number, ballPos: THREE.Vector3) {
    const pin = pinSims.current[id];
    if (pin.knocked) return;
    pin.knocked  = true;
    pin.knockedAt = now;

    /* Direction from ball toward pin (pin falls AWAY from ball) */
    const dx  = pin.origin.x - ballPos.x;
    const dz  = pin.origin.z - ballPos.z;
    const len = Math.sqrt(dx*dx + dz*dz) || 1;
    const nx  = dx/len, nz = dz/len;

    /* Tilt magnitude: 85-105 degrees (fully knocked over + a bit extra) */
    const tMag = (Math.PI/2) * (0.95 + Math.random()*0.25);
    /* Random side-scatter ±30 ° */
    const scatter = (Math.random()-0.5) * 0.5;

    pin.targetTiltX =  nz * tMag + scatter;
    pin.targetTiltZ = -nx * tMag + scatter;

    /* Slide the pin outward slightly as it falls */
    pin.slideX = nx * (0.08 + Math.random()*0.08);
    pin.slideZ = nz * (0.08 + Math.random()*0.06);

    onPinKnocked(id);
  }

  /* ── Memoised assets ── */
  const laneTex = useMemo(() => makeLaneTexture(), []);
  const orbit   = cameraView === 'orbit';

  /* Build stable per-pin refs from pinSims array */
  const pinRefs = useMemo(
    () => pinSims.current.map(p => ({ current: p } as React.MutableRefObject<PinSim>)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <>
      <Lighting />
      <Lane tex={laneTex} />
      <Ball simRef={ballSim} gameState={gameState} />

      {/* All 10 pins – always mounted, animation driven by pinSims ref */}
      {PIN_ORIGINS.map((origin, i) => (
        <Pin key={i} pinRef={pinRefs[i]} origin={origin} />
      ))}

      <TrajLine physics={physics} visible={showTrajectory && gameState === 'idle'} />

      <ContactShadows position={[0, 0.002, 0]} opacity={0.38} scale={[2.5, 20]} blur={3} far={0.6} />

      <GameCamera view={cameraView} gameState={gameState} ballPosRef={ballPosRef} orbit={orbit} />

      {orbit && (
        <OrbitControls makeDefault enablePan enableZoom minDistance={2} maxDistance={26}
          target={[0, 0.5, (9 + HEAD_Z) * 0.5]} />
      )}
    </>
  );
}

/* ─── Main exported canvas component ─────────────────────────── */
export interface BowlingGameProps {
  physics: BallPhysics;
  gameState: GameState;
  cameraView: CameraView;
  isPaused: boolean;
  isSlowMo: boolean;
  knocked: Set<number>;
  onKnockedChange: (s: Set<number>) => void;
  onPinKnocked: (count: number) => void;
  showTrajectory: boolean;
}

export default function BowlingGame({
  physics, gameState, cameraView, isPaused, isSlowMo,
  knocked, onKnockedChange, onPinKnocked, showTrajectory,
}: BowlingGameProps) {
  const [sceneKey, setSceneKey] = useState(0);

  /* Stable ref to avoid stale closure on knocked set */
  const knockedRef = useRef(new Set<number>());

  useEffect(() => {
    if (gameState === 'idle') {
      setSceneKey(k => k + 1);
      knockedRef.current = new Set();
      onKnockedChange(new Set());
    }
  }, [gameState, onKnockedChange]);

  const handlePinKnocked = useCallback((id: number) => {
    if (knockedRef.current.has(id)) return;
    knockedRef.current.add(id);
    const snap = new Set(knockedRef.current);
    onKnockedChange(snap);
    onPinKnocked(snap.size);
  }, [onKnockedChange, onPinKnocked]);

  return (
    <Canvas
      key={sceneKey}
      shadows={{ type: THREE.PCFSoftShadowMap }}
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.25,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      style={{ background: '#09091A', width: '100%', height: '100%' }}
    >
      <PerspectiveCamera makeDefault fov={60} near={0.1} far={90}
        position={[0, 2.8, 13]} />
      <fog attach="fog" args={['#09091A', 30, 50]} />

      <SimScene
        physics={physics}
        gameState={gameState}
        isPaused={isPaused}
        isSlowMo={isSlowMo}
        cameraView={cameraView}
        showTrajectory={showTrajectory}
        onPinKnocked={handlePinKnocked}
      />
    </Canvas>
  );
}
