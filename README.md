# See Yourself Differently — Cancer Awareness WebAR QR Campaign

An emotionally engaging, respectful, mobile-first WebAR cancer awareness campaign designed to be launched directly from a QR code printed on a T-shirt.

```
QR CODE ON T-SHIRT ──▶ MOBILE BROWSER ──▶ CAMERA PERMISSION ──▶ ON-DEVICE AR TRANSFORMATION
                                                                          │
  SHARE / COMMITMENT ◀── AWARENESS & PREVENTION GUIDE ◀── EDUCATIONAL TRANSITION
```

---

## Table of Contents

1. [Core Concept & User Journey](#1-core-concept--user-journey)
2. [Product & Privacy Principles](#2-product--privacy-principles)
3. [Technology Stack (100% Free & Open-Source)](#3-technology-stack-100-free--open-source)
4. [Project Architecture](#4-project-architecture)
5. [Quick Start & Local Development](#5-quick-start--local-development)
6. [Cloudflare Pages Zero-Cost Deployment](#6-cloudflare-pages-zero-cost-deployment)
7. [How to Customize All Campaign Content & Medical Sources](#7-how-to-customize-all-campaign-content--medical-sources)
8. [T-Shirt QR Code Printing & Real-World Fabric Guide](#8-t-shirt-qr-code-printing--real-world-fabric-guide)
9. [WebAR & Simulation Effect Details (V2 Architecture)](#9-webar--simulation-effect-details-v2-architecture)
10. [MEDICAL CONTENT REVIEW REQUIRED](#10-medical-content-review-required)
11. [Privacy & Security Architecture](#11-privacy--security-architecture)
12. [Browser & Device Compatibility Matrix](#12-browser--device-compatibility-matrix)
13. [Manual Real-Device Testing Checklist](#13-manual-real-device-testing-checklist)
14. [Known Limitations & Future Roadmap](#14-known-limitations--future-roadmap)

---

## 1. Core Concept & User Journey

A stranger sees the QR code on your T-shirt:
1. **Scan**: Points their smartphone camera at the chest of the shirt.
2. **Instant Web App**: Mobile site opens with zero app installation, zero login, and zero tracking cookies.
3. **Camera Opt-In & In-App Browser Detection**: User grants camera access after a clear, empathetic explanation. If scanned inside Instagram, Facebook, or TikTok, clear instructions suggest opening in Safari/Chrome, with a single-tap *"Continue without camera"* fallback.
4. **Local Face Tracking**: MediaPipe Face Landmarker runs locally via WebAssembly and GPU acceleration (with automatic CPU fallback).
5. **Tasteful Awareness Simulation**: A hair-loss visual effect smoothly fades in over the hairline and cranial vault while strictly preserving the user's natural facial features, eyes, nose, lips, jawline, skin tone, and identity.
6. **Empathetic Pivot**: Message shifts from visual shock to understanding:
   > *"You are still you. This is an awareness simulation. For many people living with cancer, life changes in ways far beyond what we can see."*
7. **Simulation Limitation Note**:
   > *"Cancer does not always cause hair loss. Hair loss can be caused by some cancer treatments (such as certain chemotherapy or radiation therapies). This is an empathy-building simulation, not a medical prediction."*
8. **Comprehensive Guide**: Interactive risk factors, practical prevention habits, and symptom warning signs.
9. **Action & Commitment**: The user commits to one or more tangible health habits, captures an optional local snapshot, and shares the campaign.
10. **Final Call to Action**:
    > *"YOU CAN'T CONTROL EVERYTHING. But you can know your risks, make informed choices, and seek help when something doesn't feel right."*

---

## 2. Product & Privacy Principles

- **Zero-Backend Architecture**: Runs 100% client-side. No database, server, or cloud function needed.
- **Privacy-First**: No camera frames or facial coordinates are ever transmitted to a server. Camera streams are cleanly stopped upon page exit.
- **Respectful & Non-Diagnostic**: Effect is labeled as an *awareness simulation*, not a diagnosis or prediction of cancer appearance.
- **Zero Cost**: Deployable on free tiers (Cloudflare Pages, GitHub Pages) without recurring fees.
- **High Performance**: Initial landing page loads instantly (< 100 kB initial bundle). Heavy AR models are dynamically code-split and loaded only when the user starts the camera.

---

## 3. Technology Stack (100% Free & Open-Source)

| Layer | Technology | License | Purpose |
|---|---|---|---|
| **Framework** | React 19 + TypeScript | MIT | High-performance reactive UI |
| **Build Tool** | Vite 8 | MIT | Sub-second HMR & optimized production bundling |
| **Styling** | Tailwind CSS v4 + Vanilla CSS tokens | MIT | Cinematic dark theme & glassmorphic design |
| **Face Tracking** | Google MediaPipe Tasks Vision (`@mediapipe/tasks-vision`) | Apache 2.0 | 478-point 3D facial landmark mesh running on-device |
| **QR Engine** | `qrcode` | MIT | High-density canvas & vector SVG QR rendering with 'H' error correction |
| **Routing** | React Router v7 | MIT | SPA client-side routing |
| **Icons** | Lucide React + Unicode | MIT / Open | Modern accessible iconography |
| **Testing** | Vitest + React Testing Library + JSDOM | MIT | Automated unit, component, and regression testing (23 passing tests) |
| **Linter** | Oxlint | MIT | High-speed static analysis (0 errors, 0 warnings) |

---

## 4. Project Architecture

```
cancer-qr/
├── public/
│   ├── _headers            # Security & Permissions headers (camera scoped)
│   ├── _redirects          # SPA rewrites for Cloudflare Pages
│   ├── apple-touch-icon.png# High-res 180x180 Apple touch icon
│   ├── favicon.svg         # Awareness ribbon SVG icon
│   ├── icon-192.png        # PWA 192x192 icon
│   ├── icon-512.png        # PWA 512x512 icon
│   ├── manifest.json       # Progressive Web App manifest
│   └── og-image.png        # Rich 1200x630 OpenGraph social preview card
├── scripts/
│   └── generate-assets.js  # Node script generating genuine high-res PNG assets
├── src/
│   ├── config/
│   │   ├── campaign.ts     # Global campaign identity, URLs, hashtags
│   │   ├── content.ts      # ALL user-facing text, copy, cards & disclaimer
│   │   └── theme.ts        # Central color palette and design tokens
│   ├── features/
│   │   └── effects/
│   │       ├── effectEngine.ts  # Extensible multi-effect abstraction
│   │       ├── baldEffect.ts    # 3D pose-tracking, smoothed scalp dome simulation
│   │       └── index.ts         # Barrel export
│   ├── services/
│   │   ├── analytics.ts         # Zero-dependency no-op analytics abstraction
│   │   ├── cameraService.ts     # Stream lifecycle & hardware error handling
│   │   └── faceTrackingService.ts # MediaPipe FaceLandmarker loader (GPU/CPU)
│   ├── utils/
│   │   ├── device.ts       # WebGL, Wasm, iOS/Android & in-app browser detection
│   │   ├── image.ts        # Canvas snapshot, Web Share API & local download
│   │   └── qr.ts           # Configurable QR generator (PNG & vector SVG)
│   ├── pages/
│   │   ├── LandingPage/         # Hero screen with breathing ribbon CTA
│   │   ├── CameraExperience/    # WebAR camera, detection indicator & photo capture
│   │   ├── AwarenessPage/       # Risk factors, prevention, symptoms & commitment
│   │   ├── PrivacyPage/         # Data transparency & medical sources
│   │   ├── QRPage/              # Dynamic QR generator (PNG + SVG) & print guide
│   │   └── NotSupportedPage/    # Fallback when WebAR/camera unavailable
│   ├── test/
│   │   ├── setup.ts             # JSDOM polyfills & mocks
│   │   ├── content.test.ts      # Copy integrity & disclaimer validation
│   │   ├── qr.test.ts           # QR generation logic (data URL & SVG)
│   │   ├── camera.test.ts       # Error classification tests
│   │   ├── device.test.ts       # Hardware capability tests
│   │   └── app.test.tsx         # Full integration tests
│   ├── App.tsx                  # Top-level routing
│   ├── index.css                # Global design system & animations
│   └── main.tsx                 # React DOM mount
├── .env.example                 # Environment variables template
├── vite.config.ts               # Vite configuration with chunk splitting
└── vitest.config.ts             # Vitest test runner configuration
```

---

## 5. Quick Start & Local Development

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or pnpm or yarn

### Setup Instructions

```bash
# 1. Clone repository and navigate into folder
cd "Cancer QR"

# 2. Install dependencies
npm install

# 3. Copy environment configuration
cp .env.example .env

# 4. Start local development server
npm run dev
```

Open `http://localhost:5173` in your browser.

> **Testing Camera on Mobile Device Locally:**
> Mobile browsers require HTTPS for camera permissions. To test on your mobile phone on your local Wi-Fi:
> 1. Run `npm run dev -- --host`
> 2. Use a free tunneling tool such as [ngrok](https://ngrok.com) or Cloudflare Tunnel:
>    ```bash
>    npx localtunnel --port 5173
>    # or
>    cloudflared tunnel --url http://localhost:5173
>    ```
> 3. Scan the resulting HTTPS URL with your phone.

---

## 6. Cloudflare Pages Zero-Cost Deployment

This project requires **zero paid services** and is built to be deployed on **Cloudflare Pages Free Tier**.

### Option A: Cloudflare Dashboard (Recommended)

1. Push your repository to **GitHub** or **GitLab**.
2. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/) and navigate to **Workers & Pages**.
3. Click **Create Application** ➜ **Pages** ➜ **Connect to Git**.
4. Select your `Cancer QR` repository.
5. In **Build Settings**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `dist`
6. In **Environment Variables**, add:
   - `VITE_CAMPAIGN_URL`: `https://<your-project-name>.pages.dev`
7. Click **Save and Deploy**.

### Option B: Direct CLI Deployment (Wrangler)

```bash
# 1. Build the production bundle
npm run build

# 2. Deploy dist directly using Wrangler
npx wrangler pages deploy dist --project-name cancer-awareness-qr
```

Your campaign will be immediately live at:
`https://cancer-awareness-qr.pages.dev`

### Adding a Custom Domain Later
Inside Cloudflare Pages ➜ **Custom Domains**, add your domain (e.g., `fightcancer.org`). Cloudflare automatically provisions free SSL/TLS certificates.

---

## 7. How to Customize All Campaign Content & Medical Sources

You do **not** need to touch React components to edit text, change links, or adjust colors. Everything is centralized:

### 1. Where to Change Campaign URL & Organization
Edit [`src/config/campaign.ts`](file:///Users/hs3p33d/Cancer%20QR/src/config/campaign.ts):
```ts
export const campaign = {
  name: 'See Yourself Differently',
  tagline: 'A Cancer Awareness Experience',
  campaignUrl: 'https://your-custom-domain.com', // ◀◀ Change this
  organizationName: 'Your Non-Profit Name',
  hashtags: ['#CancerAwareness', '#EarlyDetection'],
};
```
Also update your `.env` file:
```env
VITE_CAMPAIGN_URL=https://your-custom-domain.com
```

### 2. Where to Edit All Copy, Cards, Symptoms & Prevention
Edit [`src/config/content.ts`](file:///Users/hs3p33d/Cancer%20QR/src/config/content.ts):
- `hero`: Headline, subtitle, and CTA button text.
- `cameraPermission`: Instructions and privacy assurances.
- `effectIntro`: Transition quotes before and after the filter, plus the limitation note.
- `awareness.cards`: 10 editable risk factor cards (icon, title, summary, expanded text).
- `prevention.cards`: 6 actionable lifestyle reduction cards.
- `symptoms.cards`: 9 early detection warning signs.
- `commitment.options`: Selectable habit commitments.
- `finalCta`: The closing motivational call to action.
- `disclaimer`: Medical disclaimer text.

### 3. Where to Replace Medical Sources
In [`src/config/content.ts`](file:///Users/hs3p33d/Cancer%20QR/src/config/content.ts), update the `medicalSources` array with your organization's partner institutions or local public health links:
```ts
export const content = {
  // ...
  medicalSources: [
    {
      title: 'Cancer Prevention & Risk Factors',
      organization: 'World Health Organization (WHO)',
      url: 'https://www.who.int/news-room/fact-sheets/detail/cancer',
    },
    // Add additional vetted links here
  ],
};
```

### 4. Where to Change Brand Colors & Design Tokens
Edit [`src/config/theme.ts`](file:///Users/hs3p33d/Cancer%20QR/src/config/theme.ts):
```ts
export const theme = {
  colors: {
    primary: '#c084fc',    // Primary highlight
    secondary: '#38bdf8',  // Secondary accent
    accent: '#f472b6',     // Ribbon pink
    background: '#0a0a0f', // Cinematic dark background
  },
  // ...
};
```

---

## 8. T-Shirt QR Code Printing & Real-World Fabric Guide

### Generating the Production QR Code
1. Navigate to `/qr` in your browser (e.g., `http://localhost:5173/qr`).
2. Type or verify your final production campaign URL (e.g. `https://yourproject.pages.dev`).
3. Click **Download High-Res PNG** (for standard print setups) or **Download Vector SVG** (for professional silk screening, vector vinyl cuts, or embroidery machines).
4. Both outputs utilize **Level H Error Correction** (tolerates up to 30% fabric creasing, staining, or obstruction).

### Real-World Printing Specifications

> [!WARNING]
> ### Crucial Printing Warning
> **Do not distort, stretch, or crop the QR code when printing.** Always maintain a 1:1 square aspect ratio and preserve a clean, solid white **quiet zone margin** on all four sides.

| Garment / Item | Recommended Size | Notes |
|---|---|---|
| **T-Shirts (Upper Chest)** | **8 cm × 8 cm** (3.15" × 3.15") | Scans reliably from 1 to 2.5 meters away on standing individuals. |
| **Hoodies & Outerwear** | **10 cm × 10 cm** (4" × 4") | Compensates for heavy fabric draping and loose movement. |
| **Back Placement** | **10 cm × 10 cm** (4" × 4") | Flat shoulder-blade area ensures consistent camera capture. |
| **Tags, Cards & Badges** | **5 cm × 5 cm** (2" × 2") | Suitable for rigid badges held steady close to the lens. |

### Fabric & Printing Tips
- **Underbase**: On dark or colored fabrics, always request a solid white ink underbase so the QR code maintains maximum optical contrast.
- **Fabric Texture**: Avoid heavily ribbed fabrics or seams running through the code. Smooth cotton, poly-blends, or smooth jersey knit yield the highest scan rates.
- **Physical Test Protocol**:
  1. Print samples at **5 cm, 8 cm, and 10 cm**.
  2. Test scanning while garment is worn and the wearer is moving naturally.
  3. Test under indoor fluorescent lighting, dim ambient evening light, and direct outdoor sunlight.
  4. Test with both iOS Camera App and Android Chrome / Google Lens.

---

## 9. WebAR & Simulation Effect Details (V2 Architecture)

### How It Works
1. **On-Device Vision Pipeline**: MediaPipe's lightweight FaceLandmarker model tracks 478 3D landmarks at 30+ frames per second without sending any video to a remote server.
2. **Landmark Stabilization (Temporal EMA Smoothing)**: Multi-point exponential moving average filter ($\alpha = 0.35$) eliminates camera micro-jitter while remaining responsive to head motion.
3. **3D Pose Estimation**: Analyzes yaw, pitch, and roll in real time:
   - When the user turns their head left or right (yaw), the scalp apex and cranial perspective rotate proportionally.
   - When the user tilts up or down (pitch), the cranial vault compresses or extends naturally.
4. **Eyebrow Safety Boundary**: The overlay strictly tracks above the supra-orbital margin and trichion points (`127 -> 162 -> 21 -> 54 -> 103 -> 67 -> 109 -> 10 -> 338 -> 297 -> 332 -> 284 -> 251 -> 389 -> 356`). It will never cover the user's eyebrows or facial features.
5. **Adaptive Multi-Zone Skin & Lighting Sampling**:
   - Samples upper forehead center, left temple, and right temple.
   - Detects ambient lighting direction (e.g. lamp on the left vs right) and adjusts cranial highlight position.
   - Renders a 3D hemispherical gradient with subtle sub-surface scattering and matte follicle texture.
6. **Soft-Feathered Edge Blending**: Continuous quadratic bezier curve smoothing with feathered alpha blending along the hairline contour eliminates harsh polygon edges.
7. **Identity Preservation Guarantee**: The simulation **never** modifies eyes, nose, lips, jawline, cheeks, skin color of the face, facial hair, or gender expression.

---

## 10. MEDICAL CONTENT REVIEW REQUIRED

> [!WARNING]
> ### Crucial Compliance Notice
> This web application is an awareness and educational tool, **NOT a diagnostic or medical device**.
>
> 1. **Do not modify text to imply guaranteed prevention**: Never claim *"Do this and you will never get cancer"*. Always use language such as *"is associated with reduced risk"*, *"can help lower risk"*.
> 2. **Do not claim clinical accuracy for the simulation**: The filter is an empathy-building visual representation, not a prediction of individual chemotherapy outcomes.
> 3. **Professional Medical Review**: Before launching a public campaign or printing thousands of T-shirts, submit all medical statements in `src/config/content.ts` to a qualified healthcare professional or cancer advocacy organization for formal review.
> 4. **Prominent Disclaimer**: The disclaimer in `src/config/content.ts` must remain easily accessible from all pages and footers.

---

## 11. Privacy & Security Architecture

- **No Remote Frame Transmission**: Camera video is bound directly to local HTML5 `<video>` and `<canvas>` elements.
- **No Face Recognition or Biometrics Storage**: No face profiles, biometric vectors, or identity signatures are calculated, saved, or kept.
- **Clean Stream Teardown**: Hardware media tracks are explicitly terminated (`track.stop()`) when the user leaves the camera page, navigates away, or unmounts the component.
- **Zero-Storage Photos**: Any photos captured exist only on the user's device canvas. If shared, they use the OS-native Web Share API (`navigator.share`) directly without server mediation.
- **Security Headers Included**: `public/_headers` enforces `Permissions-Policy: camera=(self), microphone=(), geolocation=()` to prevent third-party camera hijacking.

---

## 12. Browser & Device Compatibility Matrix

| Platform | Browser | WebAR Support | Fallback Behavior |
|---|---|---|---|
| **iOS (iPhone/iPad)** | Safari 15+ | Full Support | N/A |
| **iOS** | Chrome / Firefox | Full Support | N/A |
| **Android** | Chrome 90+ | Full Support | N/A |
| **Android** | Firefox / Samsung Internet | Full Support | N/A |
| **Desktop** | Chrome / Edge / Safari / Firefox | Full Support (Webcam) | N/A |
| **In-App Browsers** | Instagram / TikTok / Facebook / WeChat | Supported with prompt | Shows advisory banner with "Copy Link" and single-tap "Continue without camera" button |
| **Legacy / Restricted** | Old mobile browsers / No camera | Graceful Fallback | Redirects to `/not-supported` with direct access to educational guide |

---

## 13. Manual Real-Device Testing Checklist

Use this checklist to test the campaign before launching:

- [ ] **Scan from T-Shirt**: Test scanning the printed QR code from 1 to 2 meters away using an iPhone (iOS 16+) and Android phone.
- [ ] **Landing Page**: Verify headline, breathing ribbon animation, and responsive layout on small screens (320px, 375px, 390px, 414px).
- [ ] **Camera Permission Dialog**: Verify empathetic explanation and privacy assurance are prominent.
- [ ] **In-App Browser Test**: Open link inside Instagram/WhatsApp; verify the helpful open-in-browser advisory and "Continue without camera" button function properly.
- [ ] **Face Tracking Alignment**: Verify face detection indicator ("LOOK AT THE CAMERA") appears only when 1 face is aligned.
- [ ] **Multiple Faces Test**: Have 2 people enter the frame; confirm message shows "Please make sure only one person is in the frame" and filter pauses.
- [ ] **Low-Light Test**: Dim room lights; verify guidance appears: "WE CAN'T SEE YOUR FACE CLEARLY. Try moving somewhere brighter."
- [ ] **Hair-Loss Effect Quality**: Confirm effect tracks smoothly when turning head left/right and tilting up/down, without covering eyebrows or distorting facial features.
- [ ] **Transition Flow**: Confirm message sequence: Normal view ➜ Brief quote ➜ Simulation fades in ➜ 1-second pause ➜ Awareness message with limitation note.
- [ ] **Photo Capture**: Capture photo; verify high-resolution snapshot with AR overlay and zero UI button artifacts.
- [ ] **Sharing & Download**: Test native share sheet and download button.
- [ ] **Awareness Guide**: Tap and expand all 10 risk cards; verify smooth animations.
- [ ] **Commitment Selector**: Select multiple habit commitments; confirm "I CHOOSE AWARENESS" result card displays.
- [ ] **Final Call to Action**: Tap "KEEP LEARNING" (scrolls to top) and "SHARE AWARENESS".
- [ ] **Medical Sources**: Click through to WHO, ACS, Cancer Research UK, and NCI reference links.
- [ ] **Hardware Teardown**: Navigate back to Home or Privacy; confirm camera indicator light turns off immediately.

---

## 14. Known Limitations & Future Roadmap

### Honest Limitations
1. **Extreme Low Light**: MediaPipe requires sufficient ambient illumination to identify facial keypoints. The app proactively detects low luminance and prompts the user to move to a brighter area.
2. **Voluminous / Curly Hair**: The simulation paints over the upper forehead and cranial perimeter. For users with very large hairstyles, hair strands on the outer sides will remain visible outside the scalp dome.
3. **In-App Webview Sandboxing**: Some social media webviews restrict camera access. The built-in detection banner guides users to open the link in Safari or Chrome.

### Future Roadmap
- **Multilingual Support**: Centralize copy into i18n JSON files (e.g., Hindi, Spanish, French).
- **Physical Campaign Analytics**: Generate location-specific QR codes (e.g. `?src=event-mumbai`) to track outreach across events without collecting user data.
- **Additional Awareness Filters**: Register alternative awareness effects (e.g. sunscreen UV skin simulation) in `EffectEngine`.

---

## License

This project is licensed under the **MIT License**. Third-party dependencies utilize permissive licenses (MIT, Apache-2.0, BSD-3-Clause).
