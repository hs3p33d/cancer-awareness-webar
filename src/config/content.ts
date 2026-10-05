// ============================================================
// CONTENT CONFIGURATION
// ALL campaign copy lives here. Change text without touching components.
// ============================================================

export interface ContentCard {
  id: string;
  icon: string;
  title: string;
  description: string;
  details?: string;
}

export interface SymptomCard {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface MedicalSource {
  title: string;
  organization: string;
  url: string;
}

export const content = {
  // ── Landing Page ──────────────────────────────────────────
  hero: {
    title: 'SEE YOURSELF\nDIFFERENTLY.',
    subtitle: 'This takes just a few seconds.',
    cta: 'START THE EXPERIENCE',
    privacyNote:
      'Your camera is used only for the local experience. We do not upload or store your camera image.',
  },

  // ── Camera Permission & In-App Browser Guidance ───────────
  cameraPermission: {
    title: 'We Need Your Camera',
    description: 'Your camera lets us create the awareness visual effect.',
    privacyAssurance: 'Your camera feed stays entirely on your device. Nothing is uploaded.',
    cta: 'ENABLE CAMERA',
    continueWithoutCamera: 'CONTINUE WITHOUT CAMERA',
    deniedTitle: 'Camera Access Needed',
    deniedDescription:
      'To experience the interactive visual effect, please allow camera access. If you prefer, you can skip directly to the awareness guide.',
    deniedInstructions: [
      'Open your browser settings or permissions',
      'Set Camera permission to Allow for this page',
      'Refresh this page',
    ],
    unsupportedTitle: 'Camera Not Supported Here',
    unsupportedDescription:
      'Your current browser or device does not support WebAR camera access. You can explore the complete cancer awareness guide below.',
    fallbackCta: 'CONTINUE TO AWARENESS',
    inAppNotice: {
      title: 'In-App Browser Detected',
      message:
        'For the smoothest camera experience, tap the menu (•••) and select "Open in Safari" or "Open in Chrome".',
      copyLinkCta: 'Copy Campaign Link',
      continueCta: 'Continue in this Browser',
    },
  },

  // ── Camera HUD & Guidance ─────────────────────────────────
  camera: {
    title: 'SEE YOURSELF DIFFERENTLY',
    detecting: 'Finding your face...',
    noFace: 'Move into the frame.',
    detected: 'LOOK AT THE CAMERA',
    multipleFaces: 'Please make sure only one person is in the frame.',
    lowLightTitle: "WE CAN'T SEE YOUR FACE CLEARLY.",
    lowLightSubtitle: 'Try moving somewhere brighter.',
    capture: 'TAKE PHOTO',
    switchCamera: 'Switch Camera',
    close: 'Close',
    retake: 'Retake',
  },

  // ── Effect Introduction & Transition Sequence ─────────────
  effectIntro: {
    preMessage: 'Imagine waking up one day\nand seeing a change\nyou never expected.',
    postTitle: 'You are still you.',
    postSubtitle: 'This is an awareness simulation.',
    postMessage:
      'For many people living with cancer, life changes in ways far beyond what we can see.',
    limitationNote:
      'Cancer does not always cause hair loss. Hair loss can be caused by some cancer treatments (such as certain chemotherapy or radiation therapies). This is an empathy-building simulation, not a medical prediction.',
    cta: 'TAKE A MOMENT TO LEARN',
    simulationLabel: '✦ AWARENESS SIMULATION — NOT A MEDICAL PREDICTION',
  },

  // ── Awareness Section (Calibrated, Non-absolute claims) ────
  awareness: {
    title: 'CANCER AWARENESS STARTS\nWITH KNOWING YOUR RISK.',
    description:
      'Understanding risk factors is an important first step. While no lifestyle choice can eliminate all risk, knowledge helps you make informed decisions.',
    cards: [
      {
        id: 'tobacco',
        icon: '🚬',
        title: 'Tobacco',
        description:
          'Stopping tobacco use can significantly reduce your risk of several cancers.',
        details:
          'Tobacco smoke contains thousands of chemicals, dozens of which are recognized carcinogens. Quitting at any age can help lower future risk. Consult a healthcare provider or a cessation helpline for personalized guidance.',
      },
      {
        id: 'alcohol',
        icon: '🍷',
        title: 'Alcohol',
        description:
          'Reducing alcohol consumption is associated with lower risk for several cancers.',
        details:
          'Research indicates that alcohol intake increases risk for cancers of the breast, liver, bowel, mouth, and throat. Risk generally increases with the quantity consumed.',
      },
      {
        id: 'physical-activity',
        icon: '🏃',
        title: 'Physical Activity',
        description:
          'Regular physical activity can help reduce the risk of several types of cancer.',
        details:
          'Moderate to vigorous activity helps regulate hormones, supports immune health, and aids weight management. Aim for at least 150 minutes of moderate activity weekly or as appropriate for your health.',
      },
      {
        id: 'healthy-weight',
        icon: '⚖️',
        title: 'Healthy Weight',
        description:
          'Maintaining a healthy body weight is associated with reduced risk for multiple cancers.',
        details:
          'Excess body fat can promote chronic inflammation and alter hormone balances linked to several cancers. Balanced nutrition and regular movement support long-term metabolic health.',
      },
      {
        id: 'uv-protection',
        icon: '☀️',
        title: 'UV & Sun Protection',
        description:
          'Protecting skin from ultraviolet (UV) radiation can reduce the risk of skin cancer.',
        details:
          'Use broad-spectrum sunscreen (SPF 30+), seek shade during peak midday hours, wear protective clothing, and avoid tanning beds. Periodic skin self-checks help notice unusual spots early.',
      },
      {
        id: 'infections',
        icon: '💉',
        title: 'Vaccination & Infections',
        description:
          'Vaccines are available that can help protect against viruses linked to cancer.',
        details:
          'The HPV vaccine helps protect against cervical, anal, and throat cancers. The Hepatitis B vaccine helps protect against liver cancer. Discuss recommended vaccines with a healthcare provider.',
      },
      {
        id: 'environmental',
        icon: '🏭',
        title: 'Environmental Exposures',
        description:
          'Minimizing exposure to known carcinogens at home and work helps reduce risk.',
        details:
          'Test homes for radon gas where recommended, and follow safety protocols with chemicals, asbestos, and occupational irritants.',
      },
      {
        id: 'family-history',
        icon: '🧬',
        title: 'Family History & Genetics',
        description:
          'Some cancers have hereditary risk factors that run in families.',
        details:
          'A strong pattern of certain cancers in close blood relatives may warrant genetic counseling or earlier tailored screening discussions with a physician.',
      },
      {
        id: 'screening',
        icon: '🔍',
        title: 'Screening Tests',
        description:
          'Talk with a healthcare professional about screenings appropriate for your age and individual risk.',
        details:
          'Routine screenings (such as mammograms, colonoscopies, Pap/HPV tests, and low-dose CT scans for eligible smokers) can detect changes before symptoms arise.',
      },
      {
        id: 'early-warning',
        icon: '⚡',
        title: 'Early Warning Signs',
        description:
          'Knowing what changes to watch for can lead to earlier evaluation.',
        details:
          'When cancer is diagnosed at an earlier stage, treatment options are often broader and more effective. Never hesitate to discuss new or lingering bodily changes with a doctor.',
      },
    ] as ContentCard[],
  },

  // ── Prevention / What You Can Do ──────────────────────────
  prevention: {
    title: 'WHAT CAN YOU DO?',
    description: 'Practical, evidence-based steps to support your health.',
    cards: [
      {
        id: 'quit-tobacco',
        icon: '🚭',
        title: 'QUIT TOBACCO',
        description:
          'Stopping tobacco use can significantly reduce your risk of several cancers.',
      },
      {
        id: 'move-more',
        icon: '🏃‍♂️',
        title: 'MOVE MORE',
        description:
          'Regular physical activity can help lower the risk of several cancers.',
      },
      {
        id: 'protect-skin',
        icon: '🧴',
        title: 'PROTECT YOUR SKIN',
        description:
          'Reduce unnecessary UV exposure and use appropriate sun protection.',
      },
      {
        id: 'family-history',
        icon: '🧬',
        title: 'KNOW YOUR FAMILY HISTORY',
        description: 'Some cancers have hereditary risk factors worth discussing with a doctor.',
      },
      {
        id: 'get-screened',
        icon: '🩺',
        title: 'GET APPROPRIATE SCREENING',
        description:
          'Talk with a healthcare professional about screenings appropriate for your age and individual risk.',
      },
      {
        id: 'pay-attention',
        icon: '👁️',
        title: 'PAY ATTENTION TO CHANGES',
        description:
          'Persistent or unusual bodily changes should be discussed with a healthcare professional.',
      },
    ] as ContentCard[],
  },

  // ── Symptoms / What Not to Ignore ─────────────────────────
  symptoms: {
    title: 'WHAT NOT TO IGNORE',
    description:
      'These symptoms can have many common causes and do not necessarily mean cancer. However, persistent or unexplained symptoms should always be evaluated by a healthcare professional.',
    cards: [
      { id: 'weight-loss', icon: '📉', title: 'Unexplained Weight Loss', description: 'Noticeable drop in weight without changes in diet or physical activity.' },
      { id: 'lumps', icon: '🔘', title: 'Unusual or Persistent Lumps', description: 'Any new lump or swelling in the neck, armpit, groin, breast, or testicle.' },
      { id: 'bleeding', icon: '🩸', title: 'Unexplained Bleeding', description: 'Blood in urine, stool, phlegm, or unexplained bruising.' },
      { id: 'cough', icon: '😷', title: 'Persistent Cough or Hoarseness', description: 'A cough or hoarseness lasting more than 3 weeks without explanation.' },
      { id: 'bowel', icon: '🔄', title: 'Changes in Bowel or Bladder', description: 'Prolonged diarrhea, constipation, or changes in urinary habits.' },
      { id: 'pain', icon: '⚡', title: 'Persistent Unexplained Pain', description: 'Ache or discomfort that lingers without a clear mechanical cause.' },
      { id: 'mole', icon: '🔵', title: 'Changes in a Mole or Skin Lesion', description: 'Changes in symmetry, border, color, diameter, or surface of a spot.' },
      { id: 'swallowing', icon: '🍽️', title: 'Difficulty Swallowing', description: 'Ongoing sensation of food catching or painful swallowing.' },
      { id: 'fatigue', icon: '😴', title: 'Persistent Unexplained Fatigue', description: 'Deep exhaustion that does not improve after adequate rest.' },
    ] as SymptomCard[],
  },

  // ── Commitment Options ────────────────────────────────────
  commitment: {
    title: 'WHAT WILL YOU CHANGE?',
    subtitle: 'Select one or more commitments to take charge of your awareness.',
    options: [
      'Quit or reduce tobacco',
      'Cut down on alcohol',
      'Exercise more regularly',
      'Protect my skin from UV',
      'Learn my family health history',
      'Schedule a routine check-up',
      'Ask my doctor about recommended screenings',
      'Encourage someone I love to get checked',
    ],
    resultTitle: 'I CHOOSE AWARENESS.',
    resultDescription: 'Every informed choice and honest conversation matters.',
  },

  // ── Final Call to Action ──────────────────────────────────
  finalCta: {
    headline: "YOU CAN'T CONTROL EVERYTHING.",
    message:
      "But you can know your risks, make informed choices, and seek help when something doesn't feel right.",
    primaryBtn: 'KEEP LEARNING',
    secondaryBtn: 'SHARE AWARENESS',
  },

  // ── Sharing ───────────────────────────────────────────────
  sharing: {
    photoTitle: 'YOU SAW THE CHANGE.',
    photoCta: 'NOW MAKE ONE CHANGE.',
    takePhoto: 'TAKE PHOTO',
    save: 'Download Photo',
    share: 'Share',
    copyLink: 'Copy Campaign Link',
    shareCardLine1: 'I took a moment to see cancer differently.',
    shareCardLine2: "Now I'm choosing awareness.",
    shareText:
      'I just experienced an interactive cancer awareness campaign. Take a moment to see yourself differently.',
  },

  // ── Medical Sources & Authoritative References ────────────
  medicalSources: [
    {
      title: 'Cancer Prevention & Risk Factors',
      organization: 'World Health Organization (WHO)',
      url: 'https://www.who.int/news-room/fact-sheets/detail/cancer',
    },
    {
      title: 'Cancer Prevention Guidelines',
      organization: 'American Cancer Society (ACS)',
      url: 'https://www.cancer.org/healthy/stay-away-from-cancer.html',
    },
    {
      title: 'Causes of Cancer and Reducing Your Risk',
      organization: 'Cancer Research UK',
      url: 'https://www.cancerresearchuk.org/about-cancer/causes-of-cancer',
    },
    {
      title: 'Cancer Screening Overview',
      organization: 'National Cancer Institute (NCI)',
      url: 'https://www.cancer.gov/about-cancer/screening',
    },
  ] as MedicalSource[],

  // ── QR Page Copy & Warning ────────────────────────────────
  qrPage: {
    title: 'QR Code Generator',
    subtitle: 'Configure and download production-ready QR codes for physical printing',
    printWarning:
      'IMPORTANT: Do not distort, stretch, or crop the QR code when printing. Always preserve the clean white quiet zone margin on all four sides.',
    downloadBtn: 'Download QR Code (PNG)',
  },

  // ── Disclaimer ────────────────────────────────────────────
  disclaimer:
    'This campaign is for general cancer awareness and education. It is not a medical diagnosis or a substitute for professional medical advice. Cancer risk, screening recommendations, and treatment side effects vary widely by individual. Please consult a qualified healthcare professional for personal medical concerns.',

  // ── Privacy Documentation ─────────────────────────────────
  privacy: {
    title: 'Privacy & Data Integrity',
    sections: [
      {
        title: 'Zero Camera Upload',
        content:
          'Your camera feed is accessed strictly on your device to compute visual awareness effects in real time. Video frames and pixel data are never sent to any server, cloud provider, or third party.',
      },
      {
        title: 'No Biometric Identifiers',
        content:
          'We do not perform facial recognition, identity matching, or demographic profiling. Landmark coordinates exist solely in temporary device memory to render the visual effect and are discarded frame-by-frame.',
      },
      {
        title: 'Immediate Hardware Teardown',
        content:
          'Camera tracks are immediately stopped when you leave the camera screen, navigate away, or close the browser tab. The camera hardware indicator will immediately turn off.',
      },
      {
        title: 'Zero Accounts & Zero Tracking Cookies',
        content:
          'This campaign requires no accounts, no logins, no personal identity collection, and sets no third-party advertising tracking cookies.',
      },
      {
        title: 'Local Photos Only',
        content:
          'If you choose to capture a photo of the simulation, the image is created entirely within your browser canvas. It is stored only if you download or share it using your device’s native sharing tools.',
      },
    ],
  },

  // ── Footer ────────────────────────────────────────────────
  footer: {
    text: 'Made with empathy for cancer awareness',
    privacyLink: 'Privacy',
    disclaimerLink: 'Disclaimer',
    sourcesLink: 'Medical Sources',
  },
} as const;

export type Content = typeof content;
