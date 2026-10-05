import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { PrivacyPage } from '../pages/PrivacyPage';
import { QRPage } from '../pages/QRPage';
import { NotSupportedPage } from '../pages/NotSupportedPage';
import { AwarenessPage } from '../pages/AwarenessPage';
import { content } from '../config/content';

describe('UI & Page Components Rendering', () => {
  it('renders LandingPage with headline and CTA button', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(content.hero.cta)).toBeInTheDocument();
    expect(screen.getByText(content.hero.privacyNote)).toBeInTheDocument();
  });

  it('renders PrivacyPage with all sections and medical disclaimer', () => {
    render(
      <MemoryRouter>
        <PrivacyPage />
      </MemoryRouter>
    );

    expect(screen.getByText(content.privacy.title)).toBeInTheDocument();
    expect(screen.getByText(content.privacy.sections[0].title)).toBeInTheDocument();
    expect(screen.getByText(content.privacy.sections[1].title)).toBeInTheDocument();
    expect(screen.getByText(/Medical Disclaimer/i)).toBeInTheDocument();
  });

  it('renders QRPage with campaign URL input and print guidelines', async () => {
    render(
      <MemoryRouter>
        <QRPage />
      </MemoryRouter>
    );

    expect(screen.getByText(content.qrPage.title)).toBeInTheDocument();
    expect(screen.getByLabelText(/Target Destination URL/i)).toBeInTheDocument();
    expect(screen.getByText(/Recommended Print Sizes/i)).toBeInTheDocument();
    expect(screen.getByText(/Suggested T-Shirt Campaign Layout/i)).toBeInTheDocument();
    expect(await screen.findByText(/Download High-Res PNG/i)).toBeInTheDocument();
    expect(await screen.findByText(/Download Vector SVG/i)).toBeInTheDocument();
  });

  it('renders NotSupportedPage with fallback instructions and awareness CTA', () => {
    render(
      <MemoryRouter>
        <NotSupportedPage />
      </MemoryRouter>
    );

    expect(screen.getByText(content.cameraPermission.unsupportedTitle)).toBeInTheDocument();
    expect(screen.getByText(content.cameraPermission.fallbackCta)).toBeInTheDocument();
  });

  it('renders AwarenessPage with risk cards and handles commitment selection', () => {
    render(
      <MemoryRouter>
        <AwarenessPage capturedImage={null} />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /RISK FACTORS/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /WHAT CAN YOU DO\?/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /WHAT NOT TO IGNORE/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: new RegExp(content.commitment.title, 'i') })).toBeInTheDocument();

    // Select commitment option
    const firstOption = content.commitment.options[0];
    const optionBtn = screen.getByText(firstOption);
    fireEvent.click(optionBtn);

    // Commit button should appear
    const commitBtn = screen.getByText('I CHOOSE AWARENESS');
    expect(commitBtn).toBeInTheDocument();
    fireEvent.click(commitBtn);

    // Result should now display
    expect(screen.getByText(content.commitment.resultTitle)).toBeInTheDocument();
  });
});
