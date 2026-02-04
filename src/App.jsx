import React, { useState, useCallback } from 'react';
import CameraCapture from './components/CameraCapture';
import LoadingOverlay from './components/LoadingOverlay';
import ResultCard from './components/ResultCard';
import CabinetView from './components/CabinetView';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showCabinet, setShowCabinet] = useState(false);

  const handleOpenItem = (medicine) => {
    setResult(medicine);
    setShowCabinet(false);
  };

  // Debug: Expose mock trigger to window
  React.useEffect(() => {
    window.triggerMockResult = () => {
      setResult({
        name: "Acyclovir 400mg",
        is_medicine: true,
        confidence: 95,
        manufacturer: "Cipla Ltd",
        expiry_date: "12/2025",
        expiry_status: "ok",
        primary_use: "Treatment of herpes simplex infections",
        ingredients: "Acyclovir",
        precautions: "Drink plenty of water. Consult doctor if pregnant.",
        generic_alternatives: [
          { name: "Acyclovir Generic", type: "Standard Generic", price_inr: 50.00 },
          { name: "Acyclovir Generic", type: "Premium Generic", price_inr: 80.00 }
        ]
      });
    };
  }, []);

  const handleCapture = useCallback(async (imageData) => {
    setIsCapturing(true);
    setIsLoading(true);
    setResult(null);

    try {
      // Compress image before sending to reduce API latency
      const img = new Image();
      img.src = imageData;
      await new Promise((resolve) => { img.onload = resolve; });

      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 800;
      const scale = Math.min(1, MAX_WIDTH / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const compressedImage = canvas.toDataURL('image/jpeg', 0.8);

      const response = await fetch('/api/analyze-medicine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData: compressedImage }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Ensure minimum loading time for animation to complete
      await new Promise(resolve => setTimeout(resolve, 500));

      setResult(data);
    } catch (error) {
      console.error('Error analyzing medicine:', error);
      setResult({
        error: 'Unable to analyze the image. Please check your connection and try again.'
      });
    } finally {
      setIsLoading(false);
      setIsCapturing(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setResult(null);
    setIsLoading(false);
    setIsCapturing(false);
  }, []);

  return (
    <div className="w-full h-full bg-slate-900">
      {/* Camera is always mounted but may be visually hidden */}
      {/* Camera is always mounted but may be visually hidden */}
      <CameraCapture
        onCapture={handleCapture}
        isCapturing={isCapturing}
        onOpenCabinet={() => setShowCabinet(true)}
      />

      {/* Main Views Overlay */}
      {showCabinet && (
        <CabinetView
          onClose={() => setShowCabinet(false)}
          onOpenItem={handleOpenItem}
        />
      )}

      {/* Loading overlay */}
      {isLoading && <LoadingOverlay />}

      {/* Result card */}
      {result && !isLoading && <ResultCard data={result} onReset={handleReset} />}
    </div>
  );
}

export default App;
