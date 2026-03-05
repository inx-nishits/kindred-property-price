import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, X, Copy, Check } from 'lucide-react';

export default function SuccessModal({ isOpen, onClose, email, shareUrl }) {
    const [isCopied, setIsCopied] = useState(false);

    if (!isOpen) return null;

    if (typeof document === 'undefined') return null;

    const handleCopy = async () => {
        if (!shareUrl) return;
        try {
            await navigator.clipboard.writeText(shareUrl);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
        } catch (error) {
            console.error('Failed to copy:', error);
            alert('Failed to copy link. Please try again.');
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center pt-2 pb-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">Report Sent!</h3>

                    <p className="text-gray-600 mb-6 px-4 leading-relaxed">
                        We've unlocked the property details for you. <br />
                        A copy of the full report has also been sent to <span className="font-semibold text-gray-900">{email}</span>.
                    </p>

                    {shareUrl && (
                        <div className="my-6">
                            <label className="text-sm font-medium text-gray-700 mb-2 block text-left">Share this report:</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={shareUrl}
                                    className="w-full bg-gray-100 border border-gray-200 text-gray-700 text-sm rounded-lg p-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                                <button
                                    onClick={handleCopy}
                                    className={`p-2 rounded-lg transition-colors ${isCopied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                                >
                                    {isCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={onClose}
                        className="w-full bg-dark-green text-white font-medium py-3 px-4 rounded-lg hover:bg-opacity-90 transition-all shadow-md active:scale-[0.98]"
                    >
                        View Property Details
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}