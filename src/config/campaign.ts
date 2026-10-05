// ============================================================
// CAMPAIGN CONFIGURATION
// Change these values to customize the entire campaign.
// ============================================================

export const campaign = {
  name: 'See Yourself Differently',
  tagline: 'A Cancer Awareness Experience',
  description:
    'An interactive awareness experience that helps you see cancer differently — and inspires one meaningful change.',
  campaignUrl:
    import.meta.env.VITE_CAMPAIGN_URL ||
    'https://cancer-awareness-webar.deepesh-gandhi28.workers.dev',
  organizationName: 'Cancer Awareness Campaign',
  hashtags: ['#CancerAwareness', '#SeeYourselfDifferently', '#EarlyDetection', '#Prevention'],
  socialHandle: '',
  year: new Date().getFullYear(),
} as const;

export type Campaign = typeof campaign;
