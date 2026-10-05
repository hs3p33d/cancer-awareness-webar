// ============================================================
// ANALYTICS SERVICE — No-op by default
// Replace the implementations to connect your analytics provider.
// ============================================================

export type AnalyticsEvent =
  | 'page_loaded'
  | 'camera_started'
  | 'camera_permission_granted'
  | 'camera_permission_denied'
  | 'face_detected'
  | 'effect_started'
  | 'effect_completed'
  | 'photo_taken'
  | 'photo_shared'
  | 'photo_saved'
  | 'awareness_started'
  | 'awareness_completed'
  | 'commitment_selected'
  | 'link_copied'
  | 'privacy_viewed'
  | 'unsupported_browser'
  | 'error_occurred';

export interface AnalyticsPayload {
  event: AnalyticsEvent;
  properties?: Record<string, string | number | boolean>;
  timestamp?: number;
}

const isEnabled = (): boolean => {
  return import.meta.env.VITE_ANALYTICS_ENABLED === 'true';
};

export const initializeAnalytics = (): void => {
  if (!isEnabled()) return;
  // Connect your analytics provider here
  console.debug('[Analytics] Initialized');
};

export const trackEvent = (
  event: AnalyticsEvent,
  properties?: Record<string, string | number | boolean>
): void => {
  if (!isEnabled()) return;
  const payload: AnalyticsPayload = {
    event,
    properties,
    timestamp: Date.now(),
  };
  // Replace with your analytics provider
  console.debug('[Analytics]', payload);
};
