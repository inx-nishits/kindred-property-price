import React from 'react';
import { Ruler, Bed, Bath, Car } from 'lucide-react';

export default function HomeComparableSales({ comparables }) {
    const formatCurrency = (val) => {
        if (!val) return 'Contact Agent';
        return new Intl.NumberFormat('en-AU', {
            style: 'currency',
            currency: 'AUD',
            maximumFractionDigits: 0
        }).format(val);
    };

    // Limit to 3 items for the card view, STRICTLY filtering for quality data
    const displayItems = comparables
        ?.filter(item =>
            item.images &&
            item.images.length > 0 &&
            item.images[0].url &&
            item.salePrice > 0 &&
            item.beds > 0 &&
            item.baths > 0
        )
        .slice(0, 3) || [];

    return (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-100 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                    <Ruler className="w-6 h-6" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-heading font-bold text-dark-green">
                    Comparable Sales <span className="text-muted-400 font-normal text-xl">({comparables?.length || 0} total)</span>
                </h3>
            </div>

            <p className="text-muted-500 mb-6 text-lg">Similar properties in the area</p>

            {/* List */}
            <div className="flex-1 space-y-4">
                {displayItems.map((item, index) => (
                    <div
                        key={item.id || index}
                        className="group flex gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 cursor-default"
                    >
                        {/* Image */}
                        <div className="w-24 h-24 sm:w-32 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                            {item.images && item.images[0] ? (
                                <img
                                    src={item.images[0].url}
                                    alt={item.address}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                            )}
                        </div>

                        {/* Details */}
                        <div className="flex flex-col justify-center min-w-0 flex-1">
                            <h4 className="font-bold text-dark-green text-lg truncate mb-1">
                                {item.shortAddress || item.address}
                            </h4>
                            <div className="text-muted-500 text-sm mb-3">
                                Sold {item.saleDate ? new Date(item.saleDate).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' }) : 'recently'}
                            </div>

                            {/* Short listing stats */}
                            <div className="flex items-center gap-4 text-muted-600 text-sm">
                                <div className="flex items-center gap-1.5">
                                    <Bed className="w-4 h-4" />
                                    <span className="font-medium">{item.beds}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Bath className="w-4 h-4" />
                                    <span className="font-medium">{item.baths}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Car className="w-4 h-4" />
                                    <span className="font-medium">{item.parking || item.cars}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {displayItems.length === 0 && (
                    <div className="text-center py-12 text-gray-400 italic">
                        No comparable sales found recently.
                    </div>
                )}
            </div>
        </div>
    );
}
