'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
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
  const [rewardCode, setRewardCode] = useState<string | null>(null);

  const throwTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamRef     = useRef<ReturnType<typeof setInterval> | null>(null);

  // Anti-tampering: session token kept only in a closure ref — never a global
  const sessionTokenRef   = useRef<string | null>(null);
  const rewardClaimedRef  = useRef(false);

  /* Initialize a server-side session once on mount */
  useEffect(() => {
    fetch('/api/reward', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'init' }),
    })
      .then(r => r.ok ? r.json() : null)
      .then((d: { sessionToken?: string } | null) => {
        if (d?.sessionToken) sessionTokenRef.current = d.sessionToken;
      })
      .catch(() => { /* silent — game works without reward system */ });
  }, []);

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

    if (throwTimerRef.current) clearTimeout(throwTimerRef.current);
    throwTimerRef.current = setTimeout(() => {
      setGameState('impact');
      setResult({
        pinsKnocked: 0,           // ← overwritten by reportActualPins
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
   * Sends the result to the server to update the strike streak;
   * when the server confirms 4 consecutive strikes the reward is claimed.
   *
   * All session state is held in refs so this callback never needs to be
   * recreated (dependency array stays empty → no stale-closure risk).
   */
  const reportActualPins = useCallback(async (actualCount: number) => {
    // Always update UI immediately
    setResult(prev => prev ? { ...prev, pinsKnocked: actualCount } : prev);

    // Skip reward logic if no session or already claimed
    if (!sessionTokenRef.current || rewardClaimedRef.current) return;

    try {
      const res = await fetch('/api/reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'throw',
          sessionToken: sessionTokenRef.current,
          isStrike: actualCount === 10,
        }),
      });

      if (!res.ok) return;
      const data = await res.json() as { strikes?: number; qualified?: boolean };

      if (data.qualified && !rewardClaimedRef.current) {
        // Lock immediately to prevent duplicate claims
        rewardClaimedRef.current = true;

        // Short delay so the STRIKE animation plays before the reward appears
        await new Promise<void>(resolve => setTimeout(resolve, 1900));

        const claimRes = await fetch('/api/reward', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'claim', sessionToken: sessionTokenRef.current }),
        });

        if (claimRes.ok) {
          const claimData = await claimRes.json() as { code?: string };
          if (claimData.code) {
            setRewardCode(claimData.code);
          }
        }
      }
    } catch {
      /* silent — game works without network */
    }
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
    rewardCode,
  };
}
