import React, { useState } from 'react';
import ChatInterface from './ChatInterface';
import { saveMedicine } from '../utils/storage';

function ResultCard({ data, onReset }) {
    const [isSaved, setIsSaved] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [showChat, setShowChat] = useState(false);

    const speakResults = () => {
        if ('speechSynthesis' in window) {
            const text = `Identified ${data.name}. Used for ${data.primary_use}. Active ingredient: ${data.ingredients}. ${data.precautions ? `Precaution: ${data.precautions}` : ''}`;
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onend = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
            setIsSpeaking(true);
        }
    };

    const stopSpeaking = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    };

    const handleSave = () => {
        if (saveMedicine(data)) {
            setIsSaved(true);
        }
    };

    // Error state
    if (data.error) {
        return (
            <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ padding: '10px' }}>
                <div className="absolute inset-0 bg-black/40" onClick={onReset} />
                <div className="relative w-full max-w-md bg-white rounded-2xl p-6 safe-area-bottom animate-slide-up shadow-2xl">
                    <div className="flex flex-col items-center text-center py-4">
                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Something Went Wrong</h2>
                        <p className="text-gray-500 text-base mb-6">{data.error}</p>
                        <button onClick={onReset} className="w-full py-4 bg-slate-800 text-white rounded-xl font-medium text-base">
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Not a medicine
    if (!data.is_medicine) {
        return (
            <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ padding: '10px' }}>
                <div className="absolute inset-0 bg-black/40" onClick={onReset} />
                <div className="relative w-full max-w-md bg-white rounded-2xl p-6 safe-area-bottom animate-slide-up shadow-2xl">
                    <div className="flex flex-col items-center text-center py-4">
                        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                            <span className="text-3xl">🔍</span>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Not a Medicine</h2>
                        <p className="text-gray-500 text-base mb-6">{data.message || "Point camera at a medicine package."}</p>
                        <button onClick={onReset} className="w-full py-4 bg-slate-800 text-white rounded-xl font-medium text-base">
                            Scan Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Success - Bottom Sheet with proper padding
    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ padding: '10px' }}>
            <div className="absolute inset-0" onClick={onReset} />

            <div className="relative w-full max-w-md bg-gray-50 rounded-2xl shadow-2xl safe-area-bottom animate-slide-up max-h-[85vh] flex flex-col">

                {/* Drag Handle */}
                <div className="w-full flex justify-center pt-3 pb-2 shrink-0">
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                </div>

                {/* Scrollable Content with strict 4px grid padding */}
                <div className="flex-1 overflow-y-auto px-8 pb-8">

                    {/* Medicine Header */}
                    <div className="flex items-start gap-4 py-4">
                        <div className="w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center shrink-0">
                            <span className="text-white text-2xl font-bold">+</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-1 bg-teal-500 text-white text-[10px] font-bold uppercase rounded">Identified</span>
                                <span className="text-gray-400 text-xs">Confidence {data.confidence || 95}%</span>
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 leading-tight flex items-center gap-2">
                                <svg className="w-5 h-5 text-teal-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="truncate">{data.name}</span>
                            </h2>
                            {data.manufacturer && <p className="text-gray-400 text-xs mt-1">Manufactured by {data.manufacturer}</p>}
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <button onClick={handleSave} className={`p-2 ${isSaved ? 'text-rose-500' : 'text-gray-300'}`}>
                                <svg className="w-6 h-6" fill={isSaved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </button>
                            <button onClick={isSpeaking ? stopSpeaking : speakResults} className={`p-2 ${isSpeaking ? 'text-teal-500' : 'text-gray-300'}`}>
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Expiry Alert */}
                    {data.expiry_status === 'expired' && (
                        <div className="mb-4 bg-red-100 rounded-xl px-4 py-3 flex items-center gap-3">
                            <span className="text-xl">💊</span>
                            <div>
                                <p className="font-semibold text-red-600 text-sm">Expired</p>
                                <p className="text-red-500 text-xs">Do not use. Expired: {data.expiry_date}</p>
                            </div>
                        </div>
                    )}
                    {data.expiry_status === 'expiring_soon' && (
                        <div className="mb-4 bg-amber-100 rounded-xl px-4 py-3 flex items-center gap-3">
                            <span className="text-xl">💊</span>
                            <div>
                                <p className="font-semibold text-orange-600 text-sm">Expiring Soon</p>
                                <p className="text-orange-500 text-xs">Use with caution. Expires: {data.expiry_date}</p>
                            </div>
                        </div>
                    )}

                    {/* USAGE & ACTIVE */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-teal-500 text-sm">✦</span>
                                <span className="text-[10px] font-semibold text-gray-400 uppercase">Usage</span>
                            </div>
                            <p className="text-sm text-gray-800 leading-snug">{data.primary_use}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-orange-500 text-sm">▲</span>
                                <span className="text-[10px] font-semibold text-gray-400 uppercase">Active</span>
                            </div>
                            <p className="text-sm text-gray-800 leading-snug">{data.ingredients}</p>
                        </div>
                    </div>

                    {/* Precautions */}
                    {data.precautions && (
                        <div className="bg-white rounded-xl px-4 py-3 mb-4 flex items-center gap-3 shadow-sm">
                            <span className="text-orange-500 text-base">▲</span>
                            <div className="flex-1 min-w-0">
                                <span className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">Precautions</span>
                                <p className="text-sm text-gray-700 leading-snug">{data.precautions}</p>
                            </div>
                            <svg className="w-5 h-5 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </div>
                    )}

                    {/* Money Saver */}
                    {data.generic_alternatives && data.generic_alternatives.length > 0 && (
                        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-6 border border-teal-100 mb-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm">💰</span>
                                    </div>
                                    <span className="font-bold text-gray-800 text-base">Money Saver</span>
                                </div>
                                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wide">Generic Options</span>
                            </div>
                            <p className="text-xs text-gray-500 mb-3">Save up to 40% with these generic alternatives:</p>
                            <div className="space-y-3">
                                {data.generic_alternatives.map((alt, i) => {
                                    const name = typeof alt === 'string' ? alt : alt.name;
                                    const type = typeof alt === 'object' ? alt.type : 'Standard Generic';
                                    const price = typeof alt === 'object' ? alt.price_inr : null;
                                    return (
                                        <div key={i} className="flex items-center justify-between py-2 border-b border-teal-100 last:border-0">
                                            <div>
                                                <p className="font-medium text-gray-800 text-sm">{name}</p>
                                                <p className="text-[10px] text-gray-400">{type}</p>
                                            </div>
                                            {price && (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-teal-600 text-base">₹{price.toFixed(2)}</span>
                                                    <div className="w-1 h-5 bg-teal-400 rounded-full" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <button className="w-full mt-4 py-3 text-xs font-medium text-teal-600 bg-white rounded-lg border border-teal-200 hover:bg-teal-50 transition-colors">
                                View Full Price Comparison
                            </button>
                        </div>
                    )}

                    {/* Ask AI */}
                    <button onClick={() => setShowChat(!showChat)} className="w-full bg-white rounded-xl px-4 py-4 mb-4 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
                                <span className="text-white text-sm">💬</span>
                            </div>
                            <span className="font-medium text-gray-800 text-base">Ask AI about this medicine</span>
                        </div>
                        <svg className={`w-5 h-5 text-gray-400 transition-transform ${showChat ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>

                    {showChat && <div className="mb-4"><ChatInterface medicineData={data} /></div>}

                    {/* Scan Button */}
                    <button onClick={onReset} className="w-full py-4 bg-slate-800 text-white rounded-xl font-semibold text-base flex items-center justify-center gap-3 hover:bg-slate-700 transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        Scan Another Medicine
                    </button>
                    <p className="text-[10px] text-gray-400 text-center mt-3">AI-generated results. Medical advice not included.</p>
                </div>
            </div>
        </div>
    );
}

export default ResultCard;
