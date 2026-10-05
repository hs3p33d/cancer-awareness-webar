import { describe, it, expect } from 'vitest';
import { content } from '../config/content';
import { campaign } from '../config/campaign';
import { theme } from '../config/theme';

describe('Campaign & Content Configuration', () => {
  it('should have required campaign metadata', () => {
    expect(campaign.name).toBeDefined();
    expect(campaign.tagline).toBeDefined();
    expect(campaign.campaignUrl).toBeDefined();
    expect(campaign.organizationName).toBeDefined();
    expect(campaign.hashtags.length).toBeGreaterThan(0);
  });

  it('should contain a clear and non-empty medical disclaimer', () => {
    expect(content.disclaimer).toBeDefined();
    expect(content.disclaimer.length).toBeGreaterThan(50);
    expect(content.disclaimer.toLowerCase()).toContain('medical advice');
  });

  it('should have all 10 risk factor awareness cards configured', () => {
    expect(content.awareness.cards).toHaveLength(10);
    content.awareness.cards.forEach((card) => {
      expect(card.id).toBeTruthy();
      expect(card.title).toBeTruthy();
      expect(card.description).toBeTruthy();
      expect(card.details).toBeTruthy();
    });
  });

  it('should have 6 prevention action cards', () => {
    expect(content.prevention.cards).toHaveLength(6);
    content.prevention.cards.forEach((card) => {
      expect(card.id).toBeTruthy();
      expect(card.title).toBeTruthy();
      expect(card.description).toBeTruthy();
    });
  });

  it('should have symptoms what-not-to-ignore warning cards', () => {
    expect(content.symptoms.cards.length).toBeGreaterThanOrEqual(8);
    content.symptoms.cards.forEach((card) => {
      expect(card.id).toBeTruthy();
      expect(card.title).toBeTruthy();
      expect(card.description).toBeTruthy();
    });
  });

  it('should have commitment options and result copy', () => {
    expect(content.commitment.options.length).toBeGreaterThanOrEqual(5);
    expect(content.commitment.resultTitle).toBe('I CHOOSE AWARENESS.');
  });

  it('should have valid theme color tokens', () => {
    expect(theme.colors.background).toBeDefined();
    expect(theme.colors.primary).toBeDefined();
    expect(theme.colors.accent).toBeDefined();
    expect(theme.colors.foreground).toBeDefined();
  });

  it('should have authoritative medical sources configured', () => {
    expect(content.medicalSources.length).toBeGreaterThanOrEqual(4);
    content.medicalSources.forEach((source) => {
      expect(source.title).toBeTruthy();
      expect(source.organization).toBeTruthy();
      expect(source.url.startsWith('https://')).toBe(true);
    });
  });

  it('should have simulation limitation notice and final CTA', () => {
    expect(content.effectIntro.limitationNote).toBeDefined();
    expect(content.effectIntro.limitationNote.toLowerCase()).toContain('not always cause hair loss');
    expect(content.finalCta.headline).toBe("YOU CAN'T CONTROL EVERYTHING.");
    expect(content.finalCta.primaryBtn).toBeTruthy();
  });
});
