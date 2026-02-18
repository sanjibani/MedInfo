import React, { useRef, useState, useEffect, useCallback } from 'react';

function CameraCapture({ onCapture, isCapturing, onOpenCabinet }) {
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [error, setError] = useState(null);
    const [facingMode, setFacingMode] = useState('environment'); // 'environment' = back, 'user' = front
    const [isReady, setIsReady] = useState(false);

    const startCamera = useCallback(async (mode) => {
        try {
            // Stop existing stream
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }

            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: mode,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: false
            });

            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setError(null);
            setIsReady(true);
        } catch (err) {
            console.error('Camera error:', err);
            if (err.name === 'NotAllowedError') {
                setError('Camera access denied. Please enable camera permissions in your browser settings.');
            } else if (err.name === 'NotFoundError') {
                setError('No camera found. Please ensure your device has a camera.');
            } else {
                setError('Unable to access camera. Please try again.');
            }
        }
    }, [stream]);

    useEffect(() => {
        startCamera(facingMode);

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [facingMode]);

    const switchCamera = () => {
        setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
    };

    const captureImage = () => {
        if (!videoRef.current || !isReady) return;

        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');

        // Mirror the image if using front camera
        if (facingMode === 'user') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }

        ctx.drawImage(video, 0, 0);

        // Convert to base64 JPEG with good quality
        const imageData = canvas.toDataURL('image/jpeg', 0.85);
        onCapture(imageData);
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full px-8 text-center bg-zinc-900 text-white">
                <div className="bg-zinc-800 rounded-3xl p-8 max-w-sm border border-zinc-700">
                    <div className="text-5xl mb-6">📸</div>
                    <h2 className="text-xl font-semibold mb-3">Camera Access Required</h2>
                    <p className="text-zinc-400 text-sm mb-8">{error}</p>
                    <button
                        onClick={() => startCamera(facingMode)}
                        className="w-full py-4 px-6 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl font-semibold transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full bg-black overflow-hidden select-none">
            {/* Camera Video */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                onLoadedMetadata={() => setIsReady(true)}
            />



            {/* Header Controls */}
            <div className="absolute top-0 left-0 right-0 z-20 pt-safe-top">
                <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/60 to-transparent">
                    {/* Brand Pill */}
                    <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md border border-white/10 rounded-full py-1.5 px-3">
                        <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-xs">+</span>
                        </div>
                        <span className="font-semibold text-white text-sm tracking-wide">MediInfo</span>
                    </div>

                    {/* Camera Flip */}
                    <button
                        onClick={switchCamera}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white active:bg-white/20 transition-all"
                        aria-label="Switch camera"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 z-20 pb-safe-bottom">

                {/* Instructions */}
                <div className="text-center mb-8 pointer-events-none">
                    <p className="text-white/90 font-medium text-sm drop-shadow-md">
                        {isCapturing ? '🔍 Decding medicine details...' : '✨ Point at any medicine to reveal its secrets'}
                    </p>
                </div>

                {/* Shutter Area */}
                <div className="bg-gradient-to-t from-black/80 via-black/40 to-transparent pb-10 pt-4 px-8">
                    <div className="flex items-center justify-between max-w-sm mx-auto">

                        {/* Cabinet Button (Left) */}
                        <div className="w-14 flex justify-center">
                            {onOpenCabinet && (
                                <button
                                    onClick={onOpenCabinet}
                                    className="flex flex-col items-center gap-1 group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-zinc-800/80 backdrop-blur border border-white/10 flex items-center justify-center text-lg group-active:scale-95 transition-transform">
                                        🗄️
                                    </div>
                                    <span className="text-[10px] text-zinc-400 font-medium">Cabinet</span>
                                </button>
                            )}
                        </div>

                        {/* Shutter Button (Center) */}
                        <div className="relative">
                            <button
                                onClick={captureImage}
                                disabled={!isReady || isCapturing}
                                className="relative w-20 h-20 rounded-full border-4 border-white flex items-center justify-center group active:scale-95 transition-transform duration-100 ease-out"
                                aria-label="Capture"
                            >
                                <div className={`w-[66px] h-[66px] rounded-full bg-white transition-all duration-200 ${isCapturing ? 'scale-75 opacity-50' : 'group-active:scale-90'}`}></div>
                            </button>
                        </div>

                        {/* Spacer/Gallery Placeholder (Right) */}
                        <div className="w-14 flex justify-center opacity-0">
                            {/* Hidden gallery button for symmetry if needed later */}
                            <div className="w-10 h-10"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CameraCapture;
