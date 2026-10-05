import { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { CameraExperience } from './pages/CameraExperience';
import { AwarenessPage } from './pages/AwarenessPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { QRPage } from './pages/QRPage';
import { NotSupportedPage } from './pages/NotSupportedPage';
import { initializeAnalytics, trackEvent } from './services/analytics';
import { useEffect } from 'react';

import { CameraTestPage } from './pages/CameraTestPage';

export type AppScreen = 'landing' | 'camera' | 'awareness' | 'privacy' | 'qr' | 'not-supported' | 'camera-test';

function App() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    initializeAnalytics();
    trackEvent('page_loaded');
  }, []);

  const handleCapture = useCallback((image: string) => {
    setCapturedImage(image);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/experience"
          element={<CameraExperience onCapture={handleCapture} />}
        />
        <Route
          path="/awareness"
          element={<AwarenessPage capturedImage={capturedImage} />}
        />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/qr" element={<QRPage />} />
        <Route path="/not-supported" element={<NotSupportedPage />} />
        <Route path="/camera-test" element={<CameraTestPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
