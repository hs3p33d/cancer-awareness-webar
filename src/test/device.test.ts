import { describe, it, expect } from 'vitest';
import { getDeviceCapabilities, prefersReducedMotion } from '../utils/device';

describe('Device Capabilities & Accessibility', () => {
  it('should detect device capabilities object', () => {
    const caps = getDeviceCapabilities();
    expect(caps).toHaveProperty('mobile');
    expect(caps).toHaveProperty('camera');
    expect(caps).toHaveProperty('webgl');
    expect(caps).toHaveProperty('wasm');
    expect(caps).toHaveProperty('arSupported');
    expect(caps).toHaveProperty('reducedMotion');
  });

  it('should handle prefersReducedMotion gracefully', () => {
    const reducedMotion = prefersReducedMotion();
    expect(typeof reducedMotion).toBe('boolean');
  });
});
