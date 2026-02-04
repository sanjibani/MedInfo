import React, { useState, useEffect } from 'react';
import { getSavedMedicines, removeMedicine } from '../utils/storage';

function CabinetView({ onClose, onOpenItem }) {
    const [medicines, setMedicines] = useState([]);

    useEffect(() => {
        setMedicines(getSavedMedicines());
    }, []);

    const handleDelete = (e, id) => {
        e.stopPropagation();
        if (confirm('Remove this medicine from your cabinet?')) {
            setMedicines(removeMedicine(id));
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900 safe-area-top safe-area-bottom overflow-hidden flex flex-col animate-fade-in">
            {/* Header */}
            <div className="bg-slate-800/50 backdrop-blur-md border-b border-white/10 p-4 flex items-center justify-between shrink-0">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">🗄️</span> Medicine Cabinet
                </h2>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    aria-label="Close cabinet"
                >
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {medicines.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-white/50">
                        <span className="text-4xl mb-4">💊</span>
                        <p className="text-lg font-medium">Cabinet Empty</p>
                        <p className="text-sm mt-1">Save medicines after scanning to see them here.</p>
                    </div>
                ) : (
                    medicines.map(med => (
                        <div
                            key={med.id}
                            onClick={() => onOpenItem(med)}
                            className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-4 active:scale-98 transition-transform cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center shrink-0">
                                <span className="text-2xl">💊</span>
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-semibold text-lg truncate">{med.name}</h3>
                                <p className="text-gray-400 text-sm line-clamp-2">{med.primary_use}</p>
                                <p className="text-xs text-emerald-400 mt-2">
                                    Scanned: {new Date(med.scannedAt).toLocaleDateString()}
                                </p>
                            </div>

                            <button
                                onClick={(e) => handleDelete(e, med.id)}
                                className="p-2 hover:bg-red-500/20 rounded-lg group transition-colors"
                                aria-label="Delete"
                            >
                                <svg className="w-5 h-5 text-gray-500 group-hover:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default CabinetView;
