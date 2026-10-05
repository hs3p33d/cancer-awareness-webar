import { describe, it, expect } from 'vitest';
import { getCameraError } from '../services/cameraService';

describe('Camera Service and Error Mapping', () => {
  it('should map NotAllowedError to permission_denied', () => {
    const error = new DOMException('Permission denied', 'NotAllowedError');
    expect(getCameraError(error)).toBe('permission_denied');
  });

  it('should map NotFoundError to not_found', () => {
    const error = new DOMException('Camera not found', 'NotFoundError');
    expect(getCameraError(error)).toBe('not_found');
  });

  it('should map NotReadableError to not_readable', () => {
    const error = new DOMException('Camera hardware in use', 'NotReadableError');
    expect(getCameraError(error)).toBe('not_readable');
  });

  it('should fallback unknown errors safely', () => {
    expect(getCameraError(new Error('Random issue'))).toBe('unknown');
    expect(getCameraError(null)).toBe('unknown');
  });
});
