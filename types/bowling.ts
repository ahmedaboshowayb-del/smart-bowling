export interface BallPhysics {
  speed: number;        // km/h
  angle: number;        // degrees
  weight: number;       // kg
  spinRate: number;     // RPM
  friction: number;     // coefficient 0-1
  oilPattern: OilPattern;
  hookStrength: number; // 0-1 lateral hook force multiplier
  launchPos: number;    // -1 (left) to 1 (right) board position
}

export type OilPattern = 'house' | 'sport' | 'challenge' | 'flooded' | 'dry';
export type CameraView = 'front' | 'side' | 'top' | 'follow' | 'slowmo' | 'orbit';
export type Language = 'en' | 'ar';
export type GameState = 'idle' | 'aiming' | 'rolling' | 'impact' | 'complete';

export interface AnalyticsFrame {
  time: number;
  speed: number;
  rpm: number;
  accuracy: number;
  energy: number;
}

export interface Pin {
  id: number;
  position: [number, number, number];
  knocked: boolean;
}

export interface ThrowResult {
  pinsKnocked: number;
  strikeProbability: number;
  impactForce: number;
  energyTransfer: number;
  trajectory: [number, number, number][];
  frames: AnalyticsFrame[];
}

export interface EngineeringMetric {
  label: string;
  labelAr: string;
  value: string | number;
  unit: string;
  color: string;
  trend?: 'up' | 'down' | 'stable';
}

export interface TechCard {
  id: string;
  icon: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  color: string;
  specs: string[];
}

export interface NavItem {
  label: string;
  labelAr: string;
  href: string;
  icon?: string;
}
