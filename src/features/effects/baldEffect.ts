// ============================================================
// BALD / AWARENESS EFFECT (V2 — Production Real-World Refinement)
// High-fidelity, landmark-smoothed, identity-preserving awareness
// simulation. Accurately follows 3D head movement, adapts to
// ambient lighting and skin tones, and strictly preserves the user's
// facial features, eyebrows, eyes, and natural identity.
// ============================================================

import type { FaceLandmarkerResult } from '@mediapipe/tasks-vision';
import type { Effect, EffectConfig } from './effectEngine';

interface Point2D {
  x: number;
  y: number;
}

interface SmoothedState {
  landmarks: Point2D[];
  skinTone: { r: number; g: number; b: number };
  lightRatio: number; // Left vs right lighting
  yaw: number;
  pitch: number;
  roll: number;
  initialized: boolean;
}

// MediaPipe key landmark indices
// Hairline arc points (ordered right to left across forehead)
const HAIRLINE_POINTS = [
  127, 162, 21, 54, 103, 67, 109, 10, 338, 297, 332, 284, 251, 389, 356,
];

// Eyebrow top landmarks (used as safety floor — overlay must NEVER go below these)
const EYEBROW_SAFETY = [70, 63, 105, 66, 107, 336, 296, 334, 293, 300];

// Forehead skin sampling zones
const FOREHEAD_CENTER_SAMPLES = [10, 151, 9, 8, 168];
const FOREHEAD_LEFT_SAMPLES = [109, 67, 103, 54];
const FOREHEAD_RIGHT_SAMPLES = [338, 297, 332, 284];

// Temporal smoothing state
const state: SmoothedState = {
  landmarks: [],
  skinTone: { r: 210, g: 175, b: 155 },
  lightRatio: 0,
  yaw: 0,
  pitch: 0,
  roll: 0,
  initialized: false,
};

/**
 * Exponential Moving Average smoothing factor
 * 0.35 allows immediate responsiveness while eliminating micro-jitter
 */
const SMOOTHING_FACTOR = 0.35;

/**
 * Sample average color in a small patch around landmark points
 */
function samplePatch(
  ctx: CanvasRenderingContext2D,
  points: Point2D[],
  w: number,
  h: number,
  patchSize: number = 5
): { r: number; g: number; b: number; count: number } {
  let r = 0,
    g = 0,
    b = 0,
    count = 0;

  for (const pt of points) {
    const startX = Math.max(0, Math.min(Math.round(pt.x - patchSize / 2), w - patchSize));
    const startY = Math.max(0, Math.min(Math.round(pt.y - patchSize / 2), h - patchSize));

    try {
      const data = ctx.getImageData(startX, startY, patchSize, patchSize).data;
      for (let i = 0; i < data.length; i += 4) {
        // Exclude extreme darks/lights (hair strands or harsh reflections)
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (brightness > 25 && brightness < 240) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
      }
    } catch {
      // Ignore boundary sampling errors
    }
  }

  return { r, g, b, count };
}

/**
 * Robust multi-zone skin tone sampling with ambient lighting detection
 */
function sampleSkinLighting(
  ctx: CanvasRenderingContext2D,
  face: { x: number; y: number }[],
  w: number,
  h: number
): { skin: { r: number; g: number; b: number }; lightRatio: number } {
  const centerPts = FOREHEAD_CENTER_SAMPLES.map((idx) => ({
    x: face[idx].x * w,
    y: face[idx].y * h,
  }));
  const leftPts = FOREHEAD_LEFT_SAMPLES.map((idx) => ({
    x: face[idx].x * w,
    y: face[idx].y * h,
  }));
  const rightPts = FOREHEAD_RIGHT_SAMPLES.map((idx) => ({
    x: face[idx].x * w,
    y: face[idx].y * h,
  }));

  const center = samplePatch(ctx, centerPts, w, h);
  const left = samplePatch(ctx, leftPts, w, h);
  const right = samplePatch(ctx, rightPts, w, h);

  const totalCount = center.count + left.count + right.count;
  if (totalCount === 0) {
    return { skin: state.skinTone, lightRatio: state.lightRatio };
  }

  const avgR = Math.round((center.r + left.r + right.r) / totalCount);
  const avgG = Math.round((center.g + left.g + right.g) / totalCount);
  const avgB = Math.round((center.b + left.b + right.b) / totalCount);

  // Directional lighting ratio: positive = left brighter, negative = right brighter
  const leftBrightness = left.count > 0 ? (left.r + left.g + left.b) / (3 * left.count) : 128;
  const rightBrightness = right.count > 0 ? (right.r + right.g + right.b) / (3 * right.count) : 128;
  const lightRatio = Math.max(-0.5, Math.min(0.5, (leftBrightness - rightBrightness) / 255));

  return {
    skin: { r: avgR, g: avgG, b: avgB },
    lightRatio,
  };
}

export const baldEffect: Effect = {
  name: 'bald',
  description: 'Identity-preserving cancer awareness simulation',

  render(
    ctx: CanvasRenderingContext2D,
    _video: HTMLVideoElement,
    landmarks: FaceLandmarkerResult,
    config: EffectConfig,
    progress: number
  ): void {
    if (!landmarks.faceLandmarks || landmarks.faceLandmarks.length === 0) {
      state.initialized = false;
      return;
    }

    const face = landmarks.faceLandmarks[0];
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    // Convert key points to pixel space
    const currentPoints: Point2D[] = [];
    for (let i = 0; i < face.length; i++) {
      currentPoints.push({ x: face[i].x * w, y: face[i].y * h });
    }

    // Initialize or smooth points
    if (!state.initialized || state.landmarks.length !== currentPoints.length) {
      state.landmarks = currentPoints.map((p) => ({ ...p }));
      state.initialized = true;
    } else {
      // Check for sudden teleport / jump (e.g. face re-acquired across screen)
      const dist = Math.hypot(
        currentPoints[1].x - state.landmarks[1].x,
        currentPoints[1].y - state.landmarks[1].y
      );
      const lerpFactor = dist > w * 0.15 ? 1.0 : SMOOTHING_FACTOR;

      for (let i = 0; i < currentPoints.length; i++) {
        state.landmarks[i].x += (currentPoints[i].x - state.landmarks[i].x) * lerpFactor;
        state.landmarks[i].y += (currentPoints[i].y - state.landmarks[i].y) * lerpFactor;
      }
    }

    const pts = state.landmarks;

    // Head orientation estimation
    const noseTip = pts[1];
    const noseBridge = pts[6];
    const chin = pts[152];
    const rightTemple = pts[127];
    const leftTemple = pts[356];
    const foreheadTop = pts[10];

    // Roll angle (tilt side to side)
    const roll = Math.atan2(leftTemple.y - rightTemple.y, leftTemple.x - rightTemple.x);

    // Yaw (turn left to right): compare nose offset from midpoint of temples
    const templeMidX = (rightTemple.x + leftTemple.x) / 2;
    const templeSpan = Math.max(10, Math.hypot(leftTemple.x - rightTemple.x, leftTemple.y - rightTemple.y));
    const yaw = Math.max(-0.6, Math.min(0.6, (noseTip.x - templeMidX) / templeSpan));

    // Pitch (look up or down)
    const faceHeight = Math.max(20, Math.hypot(chin.x - foreheadTop.x, chin.y - foreheadTop.y));
    const noseToChin = Math.hypot(chin.x - noseBridge.x, chin.y - noseBridge.y);
    const pitch = (noseToChin / faceHeight - 0.5) * 1.5;

    // Smooth head orientation angles
    state.roll += (roll - state.roll) * 0.3;
    state.yaw += (yaw - state.yaw) * 0.3;
    state.pitch += (pitch - state.pitch) * 0.3;

    // Sample skin color and ambient lighting
    const { skin: targetSkin, lightRatio: targetLight } = sampleSkinLighting(ctx, face, w, h);
    state.skinTone.r += (targetSkin.r - state.skinTone.r) * 0.15;
    state.skinTone.g += (targetSkin.g - state.skinTone.g) * 0.15;
    state.skinTone.b += (targetSkin.b - state.skinTone.b) * 0.15;
    state.lightRatio += (targetLight - state.lightRatio) * 0.15;

    const skin = state.skinTone;
    const alpha = Math.min(1.0, progress * config.intensity);

    if (alpha <= 0.01) return;

    // Calculate maximum brow safety height (overlay must NEVER descend below this)
    const minBrowY = Math.min(...EYEBROW_SAFETY.map((idx) => pts[idx].y));

    // Scalp cranial vault geometry
    const headWidth = templeSpan * 1.15;
    const headCenterX = (rightTemple.x + leftTemple.x) / 2 + state.yaw * headWidth * 0.25;
    const baseForeheadY = Math.min(foreheadTop.y, minBrowY - faceHeight * 0.12);

    // Dynamic cranial dome height based on pitch
    const domeHeight = faceHeight * (0.85 - state.pitch * 0.3);
    const domeApexY = baseForeheadY - domeHeight;

    // Extract ordered hairline points
    const hairline = HAIRLINE_POINTS.map((idx) => ({
      x: pts[idx].x,
      // Clamp Y to be safely above the eyebrows
      y: Math.min(pts[idx].y, minBrowY - faceHeight * 0.04),
    }));

    ctx.save();
    ctx.globalAlpha = alpha;

    // ──────────────────────────────────────────────────────────
    // 1. Scalp Dome Base Path
    // ──────────────────────────────────────────────────────────
    ctx.beginPath();

    const startPt = hairline[0];
    const endPt = hairline[hairline.length - 1];

    // Start at right temple/ear
    ctx.moveTo(startPt.x - headWidth * 0.05, startPt.y);

    // Left cranial curve (from right temple up to apex)
    const ctrl1X = startPt.x - headWidth * 0.12;
    const ctrl1Y = baseForeheadY - domeHeight * 0.5;
    const ctrl2X = headCenterX - headWidth * 0.38;
    const ctrl2Y = domeApexY + domeHeight * 0.02;
    ctx.bezierCurveTo(ctrl1X, ctrl1Y, ctrl2X, ctrl2Y, headCenterX, domeApexY);

    // Right cranial curve (from apex down to left temple)
    const ctrl3X = headCenterX + headWidth * 0.38;
    const ctrl3Y = domeApexY + domeHeight * 0.02;
    const ctrl4X = endPt.x + headWidth * 0.12;
    const ctrl4Y = baseForeheadY - domeHeight * 0.5;
    ctx.bezierCurveTo(ctrl3X, ctrl3Y, ctrl4X, ctrl4Y, endPt.x + headWidth * 0.05, endPt.y);

    // Connect along the anatomical hairline contour
    for (let i = hairline.length - 1; i >= 0; i--) {
      ctx.lineTo(hairline[i].x, hairline[i].y);
    }

    ctx.closePath();

    // ──────────────────────────────────────────────────────────
    // 2. Realistic 3D Anatomical Skin Shading
    // ──────────────────────────────────────────────────────────
    // Highlight coordinates offset by yaw, pitch, and lighting bias
    const lightOffsetX = state.lightRatio * headWidth * 0.4 + state.yaw * headWidth * 0.2;
    const highlightX = headCenterX + lightOffsetX;
    const highlightY = domeApexY + domeHeight * 0.38 + state.pitch * domeHeight * 0.15;
    const radius = headWidth * 0.85;

    const radialGradient = ctx.createRadialGradient(
      highlightX,
      highlightY,
      headWidth * 0.05,
      headCenterX,
      baseForeheadY - domeHeight * 0.45,
      radius
    );

    // Multi-stop gradient for cranial hemisphere lighting
    const rBase = Math.round(skin.r);
    const gBase = Math.round(skin.g);
    const bBase = Math.round(skin.b);

    // Specular highlight on crown
    const hlR = Math.min(255, rBase + 22);
    const hlG = Math.min(255, gBase + 18);
    const hlB = Math.min(255, bBase + 15);

    // Shadow on back / perimeter of head
    const shR = Math.max(0, rBase - 28);
    const shG = Math.max(0, gBase - 26);
    const shB = Math.max(0, bBase - 24);

    radialGradient.addColorStop(0, `rgb(${hlR}, ${hlG}, ${hlB})`);
    radialGradient.addColorStop(0.35, `rgb(${rBase}, ${gBase}, ${bBase})`);
    radialGradient.addColorStop(0.75, `rgb(${Math.max(0, rBase - 14)}, ${Math.max(0, gBase - 14)}, ${Math.max(0, bBase - 12)})`);
    radialGradient.addColorStop(1, `rgb(${shR}, ${shG}, ${shB})`);

    ctx.fillStyle = radialGradient;
    ctx.fill();

    // ──────────────────────────────────────────────────────────
    // 3. Subtle Scalp Pore / Follicle Texture (Non-uniform matte)
    // ──────────────────────────────────────────────────────────
    if (alpha > 0.4) {
      ctx.save();
      ctx.clip();
      ctx.globalAlpha = alpha * 0.06;

      // Seeded-style pseudo noise across the scalp region
      const step = Math.max(6, Math.round(headWidth * 0.04));
      const leftBound = Math.round(startPt.x - headWidth * 0.1);
      const rightBound = Math.round(endPt.x + headWidth * 0.1);
      const topBound = Math.round(domeApexY);
      const bottomBound = Math.round(baseForeheadY);

      for (let x = leftBound; x < rightBound; x += step) {
        for (let y = topBound; y < bottomBound; y += step) {
          const jitterX = x + ((x * 13 + y * 7) % 5) - 2;
          const jitterY = y + ((x * 7 + y * 11) % 5) - 2;
          const isLight = (x + y) % 2 === 0;

          ctx.fillStyle = isLight ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.35)';
          ctx.fillRect(jitterX, jitterY, 1.5, 1.5);
        }
      }
      ctx.restore();
    }

    ctx.restore();

    // ──────────────────────────────────────────────────────────
    // 4. Soft-Feathered Hairline Edge Blending (Eliminates harsh line)
    // ──────────────────────────────────────────────────────────
    ctx.save();
    ctx.globalAlpha = alpha * 0.65;

    // Draw feathered stroke along the hairline contour to blend into skin
    ctx.beginPath();
    ctx.moveTo(hairline[0].x, hairline[0].y);
    for (let i = 1; i < hairline.length; i++) {
      const prev = hairline[i - 1];
      const curr = hairline[i];
      const midX = (prev.x + curr.x) / 2;
      const midY = (prev.y + curr.y) / 2;
      ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
    }
    const last = hairline[hairline.length - 1];
    ctx.lineTo(last.x, last.y);

    const featherWidth = Math.max(6, headWidth * 0.07);
    ctx.lineWidth = featherWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Soft gradient stroke blending from skin color to transparent
    ctx.strokeStyle = `rgba(${skin.r}, ${skin.g}, ${skin.b}, 0.5)`;
    if (typeof ctx.filter !== 'undefined') {
      ctx.filter = 'blur(4px)';
    }
    ctx.stroke();

    ctx.restore();
  },
};
