import React from 'react'
import { createPortal } from 'react-dom'
import { X, Ruler, Bed, Bath, Car, ImageOff } from 'lucide-react'

const ComparablesModal = ({ isOpen, onClose, comparables, suburb, formatCurrency, formatDate }) => {
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
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col animate-scaleIn overflow-hidden border border-[#163331]/10">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h3 className="text-2xl font-heading font-bold text-[#163331] flex items-center gap-2">
                        <Ruler className="w-6 h-6 text-[#48D98E]" />
                        Comparable Sales in {suburb} ({comparables.length})
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
                        {comparables.map((sale, index) => (
                            <div key={index} className="p-5 hover:bg-gray-50/50 transition-colors">
                                <div className="flex gap-5">
                                    {/* Image */}
                                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg flex-shrink-0 overflow-hidden bg-gray-100 relative shadow-sm">
                                        {sale.images && sale.images.length > 0 && sale.images[0]?.url ? (
                                            <img
                                                src={sale.images[0].url}
                                                alt={sale.address || 'Property image'}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        {/* Fallback */}
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100"
                                            style={{ display: (sale.images && sale.images.length > 0 && sale.images[0]?.url) ? 'none' : 'flex' }}>
                                            <ImageOff className="w-8 h-8 text-gray-300" />
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                        <div>
                                            <div className="flex items-start justify-between gap-4">
                                                <h4 className="font-bold text-[#163331] text-lg sm:text-xl line-clamp-1">
                                                    {sale.address}
                                                </h4>
                                                <div className="text-right flex-shrink-0">
                                                    <div className="text-xl sm:text-2xl font-bold text-[#163331]">
                                                        {formatCurrency(sale.salePrice)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-sm text-gray-500 mt-1 mb-3 font-medium">
                                                Sold on {formatDate(sale.saleDate)}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-700">
                                            {sale.beds > 0 && (
                                                <div className="flex items-center gap-2">
                                                    <Bed className="w-4 h-4 text-gray-400" />
                                                    <span className="font-medium">{sale.beds} Bed</span>
                                                </div>
                                            )}
                                            {sale.baths > 0 && (
                                                <div className="flex items-center gap-2">
                                                    <Bath className="w-4 h-4 text-gray-400" />
                                                    <span className="font-medium">{sale.baths} Bath</span>
                                                </div>
                                            )}
                                            {(sale.parking > 0 || sale.cars > 0) && (
                                                <div className="flex items-center gap-2">
                                                    <Car className="w-4 h-4 text-gray-400" />
                                                    <span className="font-medium">{sale.parking || sale.cars} Car</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50/50 border-t border-gray-100">
                    <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest font-medium">
                        Comparable sales data provided by Town and Domain API
                    </p>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ComparablesModal;
