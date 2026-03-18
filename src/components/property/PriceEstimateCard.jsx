import React from 'react'
import { ArrowUpRight } from 'lucide-react'

const PriceEstimateCard = ({ property, isUnlocked, isPriceEstimateLoading, formatCurrency, generateShareableLink, isGeneratingShareUrl }) => {
    return (
        <div className={`bg-[#163331] text-white rounded-xl p-8 md:p-10 relative overflow-hidden shadow-2xl ${!isUnlocked ? 'blur-md select-none pointer-events-none opacity-80' : ''}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#163331] via-[#163331] to-[#0d1f1e] opacity-90"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>

            <div className="relative z-10">
                {isPriceEstimateLoading ? (
                    <div className="space-y-6 animate-pulse">
                        <div>
                            <div className="h-10 bg-white/20 rounded-lg w-3/4 mb-3"></div>
                            <div className="h-6 bg-white/15 rounded-full w-32"></div>
                        </div>
                        <div className="pt-6 border-t border-white/25">
                            <div className="h-12 bg-white/10 rounded-lg"></div>
                        </div>
                    </div>
                ) : property.priceEstimate && property.priceEstimate.mid > 0 ? (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white/95 uppercase tracking-wider flex items-center gap-2 mb-4">
                                <ArrowUpRight className="w-5 h-5 text-[#48D98E]" />
                                <span className="text-lg md:text-xl">Estimated Value:</span> {formatCurrency(property.priceEstimate.mid)}
                            </h2>
                            <div className="text-xl md:text-xl text-white/80">
                                {formatCurrency(property.priceEstimate.low)} - {formatCurrency(property.priceEstimate.high)}
                            </div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full mt-4">
                                <div className="w-2 h-2 bg-[#48D98E] rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium text-white/90">
                                    {(property.priceEstimate.priceConfidence || 'Medium').charAt(0).toUpperCase() + (property.priceEstimate.priceConfidence || 'Medium').slice(1)} Confidence
                                </span>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/25">
                            <div className="space-y-4">
                                <a
                                    href="https://www.kindred.com.au/sales-property-appraisal"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block w-full text-center bg-[#48D98E] text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-[#3bc57d] transition-colors duration-200 shadow-lg"
                                >
                                    Book your appraisal today
                                </a>

                                {generateShareableLink && (
                                    <button
                                        onClick={generateShareableLink}
                                        disabled={isGeneratingShareUrl}
                                        className="inline-block w-full text-center bg-white text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                                    >
                                        {isGeneratingShareUrl ? 'Generating...' : 'Share Property'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white/95 mb-4">
                                Estimated Value
                            </h2>
                            <p className="text-white/80 mb-6">
                                Unable to generate an estimate for this property.
                            </p>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">
                                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium text-white/90">
                                    Insufficient data
                                </span>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/25">
                            <a
                                href="https://www.kindred.com.au/sales-property-appraisal"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block w-full text-center bg-[#48D98E] text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-[#3bc57d] transition-colors duration-200 shadow-lg"
                            >
                                Book your appraisal today
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default PriceEstimateCard
