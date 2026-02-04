import React from 'react';

function LoadingOverlay() {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center animate-fade-in">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center">
                {/* Scanning animation container */}
                <div className="relative w-64 h-48 mb-8">
                    {/* Medicine icon placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="glass rounded-2xl p-6">
                            <span className="text-6xl">💊</span>
                        </div>
                    </div>

                    {/* Scanning line */}
                    <div className="absolute inset-0 overflow-hidden rounded-2xl">
                        <div className="scanning-line" />
                    </div>

                    {/* Corner brackets */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-primary-400 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-primary-400 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-primary-400 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-primary-400 rounded-br-lg" />
                </div>

                {/* Wave animation bars */}
                <div className="flex items-end gap-1.5 mb-6">
                    <div className="wave-bar" />
                    <div className="wave-bar" />
                    <div className="wave-bar" />
                    <div className="wave-bar" />
                    <div className="wave-bar" />
                </div>

                {/* Status text */}
                <div className="text-center">
                    <p className="text-white text-lg font-medium mb-1">Analyzing Medicine</p>
                    <p className="text-gray-400 text-sm">Using AI to identify ingredients...</p>
                </div>
            </div>
        </div>
    );
}

export default LoadingOverlay;
