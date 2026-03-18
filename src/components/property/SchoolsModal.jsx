import React from 'react'
import { createPortal } from 'react-dom'
import { X, School, MapPin } from 'lucide-react'

const SchoolsModal = ({ isOpen, onClose, schools }) => {
    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6"
            role="dialog"
            aria-modal="true"
        >
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col animate-scaleIn overflow-hidden border border-[#163331]/10">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h3 className="text-2xl font-heading font-bold text-[#163331] flex items-center gap-2">
                        <School className="w-6 h-6 text-[#48D98E]" />
                        All Local Schools ({schools.length})
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Scrollable List */}
                <div className="flex-1 overflow-y-auto p-0">
                    <div className="divide-y divide-gray-100 md:scrollbar-thin md:scrollbar-thumb-gray-200 md:scrollbar-track-transparent">
                        {schools.map((school, index) => (
                            <div key={index} className="p-5 hover:bg-gray-50/50 transition-colors">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                    <div>
                                        <h4 className="font-semibold text-[#163331] text-base mb-1.5">{school.name}</h4>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                                                {school.type}
                                            </span>
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-medium">
                                                {school.sector}
                                            </span>
                                            {school.yearRange && (
                                                <span className="text-gray-500 text-xs">
                                                    Years {school.yearRange}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-medium text-[#163331]">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        {school.distance < 1000
                                            ? `${Math.round(school.distance)}m`
                                            : `${(school.distance / 1000).toFixed(1)}km`}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50/50 border-t border-gray-100">
                    <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest font-medium">
                        School data provided by Domain API
                    </p>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default SchoolsModal;
