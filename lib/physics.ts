import type { BallPhysics, AnalyticsFrame, OilPattern } from '@/types/bowling';

// Oil pattern friction modifiers
const OIL_FRICTION: Record<OilPattern, number> = {
  house: 1.0,
  sport: 0.85,
  challenge: 0.70,
  flooded: 0.60,
  dry: 1.25,
};

export function calculateStrikeProbability(physics: BallPhysics): number {
  const { speed, angle, spinRate, friction, oilPattern } = physics;
  const oilMod = OIL_FRICTION[oilPattern];

  // Optimal ranges: speed 18-24 km/h, angle 2-6°, spin 300-400 RPM
  const speedScore = Math.max(0, 1 - Math.abs(speed - 21) / 10);
  const angleScore = Math.max(0, 1 - Math.abs(angle - 4) / 6);
  const spinScore = Math.max(0, 1 - Math.abs(spinRate - 350) / 200);
  const frictionScore = Math.min(1, friction * oilMod);

  const probability = (speedScore * 0.35 + angleScore * 0.25 + spinScore * 0.25 + frictionScore * 0.15) * 100;
  return Math.min(98, Math.max(2, probability));
}

export function calculateImpactForce(physics: BallPhysics): number {
  const speedMs = physics.speed / 3.6;
  const force = 0.5 * physics.weight * speedMs * speedMs;
  return Math.round(force * 10) / 10;
}

export function calculateAngularVelocity(spinRate: number): number {
  return (spinRate * 2 * Math.PI) / 60;
}

export function calculateBallTrajectory(
  physics: BallPhysics,
  laneLength: number = 18.29
): [number, number, number][] {
  const { speed, angle, spinRate, friction, oilPattern } = physics;
  const oilMod = OIL_FRICTION[oilPattern];
  const speedMs = speed / 3.6;
  const angleRad = (angle * Math.PI) / 180;
  const angularVel = calculateAngularVelocity(spinRate);

  const points: [number, number, number][] = [];
  const steps = 50;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const z = -t * laneLength;

    // Lateral drift from spin and oil pattern
    const drift = Math.sin(angleRad) * laneLength * t;
    const spinDrift = (angularVel * friction * oilMod * t * t * 0.15);
    const x = drift + spinDrift;

    // Slight downward arc
    const y = 0.1 * Math.sin(t * Math.PI) * 0.1;

    points.push([x, y, z]);
  }

  return points;
}

export function generateAnalyticsFrames(physics: BallPhysics): AnalyticsFrame[] {
  const frames: AnalyticsFrame[] = [];
  const { speed, spinRate } = physics;

  for (let i = 0; i <= 30; i++) {
    const t = i / 30;
    const friction = 0.02; // rolling friction deceleration

    // Speed decelerates with friction
    const currentSpeed = speed * (1 - friction * t * 5);

    // Spin also decelerates
    const currentRpm = spinRate * (1 - friction * t * 3);

    frames.push({
      time: t * 5,
      speed: Math.max(0, Math.round(currentSpeed * 10) / 10),
      rpm: Math.max(0, Math.round(currentRpm)),
      accuracy: Math.round((1 - Math.abs(t - 0.6) * 0.3) * 100),
      energy: Math.round(0.5 * 4.5 * Math.pow(currentSpeed / 3.6, 2) * 10) / 10,
    });
  }

  return frames;
}

export function estimatePinsKnocked(strikeProbability: number): number {
  const rand = Math.random() * 100;
  if (rand < strikeProbability) return 10;
  if (rand < strikeProbability + 20) return Math.floor(Math.random() * 3) + 7;
  if (rand < strikeProbability + 40) return Math.floor(Math.random() * 4) + 4;
  return Math.floor(Math.random() * 4) + 1;
}

export function formatMetric(value: number, decimals = 1): string {
  return value.toFixed(decimals);
}
