// ============================================================
// EFFECT ENGINE — Abstraction for visual effects
// ============================================================

import type { FaceLandmarkerResult } from '@mediapipe/tasks-vision';

export interface EffectConfig {
  intensity: number; // 0.0 – 1.0
  transition: number; // ms for fade-in
}

export interface Effect {
  name: string;
  description: string;
  render(
    ctx: CanvasRenderingContext2D,
    video: HTMLVideoElement,
    landmarks: FaceLandmarkerResult,
    config: EffectConfig,
    progress: number // 0.0 – 1.0 for transition
  ): void;
}

export class EffectEngine {
  private effects: Map<string, Effect> = new Map();
  private activeEffect: string | null = null;
  private config: EffectConfig = { intensity: 1.0, transition: 2000 };
  private transitionStart: number | null = null;

  registerEffect(effect: Effect): void {
    this.effects.set(effect.name, effect);
  }

  setActiveEffect(name: string): void {
    if (this.effects.has(name)) {
      this.activeEffect = name;
      this.transitionStart = null;
    }
  }

  setConfig(config: Partial<EffectConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getActiveEffectName(): string | null {
    return this.activeEffect;
  }

  getAvailableEffects(): string[] {
    return Array.from(this.effects.keys());
  }

  render(
    ctx: CanvasRenderingContext2D,
    video: HTMLVideoElement,
    landmarks: FaceLandmarkerResult,
    timestamp: number
  ): void {
    if (!this.activeEffect) return;

    const effect = this.effects.get(this.activeEffect);
    if (!effect) return;

    if (this.transitionStart === null) {
      this.transitionStart = timestamp;
    }

    const elapsed = timestamp - this.transitionStart;
    const progress = Math.min(elapsed / this.config.transition, 1.0);

    effect.render(ctx, video, landmarks, this.config, progress);
  }

  reset(): void {
    this.activeEffect = null;
    this.transitionStart = null;
  }
}
