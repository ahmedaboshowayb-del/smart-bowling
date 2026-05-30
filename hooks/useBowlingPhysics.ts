'use client';
import { useState, useCallback, useRef } from 'react';
import type { BallPhysics, ThrowResult, GameState, AnalyticsFrame } from '@/types/bowling';
import { DEFAULT_PHYSICS } from '@/lib/constants';
import {
  calculateStrikeProbability,
  calculateImpactForce,
  calculateBallTrajectory,
  generateAnalyticsFrames,
} from '@/lib/physics';

export function useBowlingPhysics() {
  const [physics, setPhysics] = useState<BallPhysics>(DEFAULT_PHYSICS);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [result, setResult] = useState<ThrowResult | null>(null);
  const [liveFrames, setLiveFrames] = useState<AnalyticsFrame[]>([]);
  const throwTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamRef     = useRef<ReturnType<typeof setInterval> | null>(null);

  const updatePhysics = useCallback((key: keyof BallPhysics, value: number | string) => {
    setPhysics(prev => ({ ...prev, [key]: value }));
  }, []);

  const throwBall = useCallback(() => {
    if (gameState === 'rolling' || gameState === 'impact') return;

    setGameState('rolling');
    setResult(null);
    setLiveFrames([]);

    const frames      = generateAnalyticsFrames(physics);
    const sp          = calculateStrikeProbability(physics);
    const impactForce = calculateImpactForce(physics);
    const trajectory  = calculateBallTrajectory(physics);
    const speedMs     = physics.speed / 3.6;
    const travelMs    = Math.max(1800, Math.min(4500, (18.29 / speedMs) * 1000));

    /* Stream analytics frames live */
    if (streamRef.current) clearInterval(streamRef.current);
    let frameIdx = 0;
    streamRef.current = setInterval(() => {
      frameIdx++;
      setLiveFrames(frames.slice(0, frameIdx));
      if (frameIdx >= frames.length) {
        clearInterval(streamRef.current!);
        streamRef.current = null;
      }
    }, travelMs / frames.length);

    /*
     * After travelMs the ball has reached the pins.
     * We do NOT set pinsKnocked here — the 3D scene counts the actual
     * knocked pins and calls reportActualPins() to fill that field.
     * We set pinsKnocked to 0 as a placeholder.
     */
    if (throwTimerRef.current) clearTimeout(throwTimerRef.current);
    throwTimerRef.current = setTimeout(() => {
      setGameState('impact');
      setResult({
        pinsKnocked: 0,           // ← will be overwritten by reportActualPins
        strikeProbability: sp,
        impactForce,
        energyTransfer: impactForce * 0.72,
        trajectory,
        frames,
      });
      setTimeout(() => setGameState('complete'), 2000);
    }, travelMs);
  }, [physics, gameState]);

  /**
   * Called by the 3D simulator once all pins have settled.
   * Overwrites pinsKnocked with the real count from collision detection.
   */
  const reportActualPins = useCallback((actualCount: number) => {
    setResult(prev =>
      prev ? { ...prev, pinsKnocked: actualCount } : prev,
    );
  }, []);

  const reset = useCallback(() => {
    if (throwTimerRef.current) clearTimeout(throwTimerRef.current);
    if (streamRef.current) clearInterval(streamRef.current);
    setGameState('idle');
    setResult(null);
    setLiveFrames([]);
  }, []);

  const strikeProbability = calculateStrikeProbability(physics);

  return {
    physics,
    updatePhysics,
    gameState,
    result,
    liveFrames,
    throwBall,
    reportActualPins,
    reset,
    strikeProbability,
  };
}
