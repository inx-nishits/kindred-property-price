import React from 'react'

const SuburbStats = ({ suburbInsights, suburb, formatCurrency }) => {
    if (!suburbInsights) return null;

    return (
        <div className="mb-16">
            <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#163331] mb-2 leading-tight">
                    {suburb} Sales Statistics
                </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {/* Auction Clearance Rate */}
                <div className="flex flex-col h-full bg-[#f8f9f9] rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                    <div className="flex-1 p-6 md:p-8 flex flex-col items-center justify-center text-center">
                        <div className="text-4xl md:text-5xl font-heading font-bold text-[#163331] mb-4">
                            {suburbInsights.overallClearanceRate?.toFixed(2)}%
                        </div>
                        <div className="text-[11px] md:text-xs font-bold text-[#163331]/60 uppercase tracking-[0.1em] leading-relaxed">
                            AUCTION CLEARANCE RATE
                        </div>
                    </div>
                    <div className="bg-[#ecedee] py-3 px-4 text-center">
                        <span className="text-[10px] md:text-[11px] font-bold text-[#163331]/40 uppercase tracking-wider">
                            {suburbInsights.periodRange}
                        </span>
                    </div>
                </div>

                {/* Average Days on Market */}
                <div className="flex flex-col h-full bg-[#f8f9f9] rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                    <div className="flex-1 p-6 md:p-8 flex flex-col items-center justify-center text-center">
                        <div className="text-4xl md:text-5xl font-heading font-bold text-[#163331] mb-4">
                            {suburbInsights.avgDaysOnMarket?.toFixed(2)}
                        </div>
                        <div className="text-[11px] md:text-xs font-bold text-[#163331]/60 uppercase tracking-[0.1em] leading-relaxed">
                            AVERAGE DAYS ON MARKET
                        </div>
                    </div>
                    <div className="bg-[#ecedee] py-3 px-4 text-center">
                        <span className="text-[10px] md:text-[11px] font-bold text-[#163331]/40 uppercase tracking-wider">
                            {suburbInsights.periodRange}
                        </span>
                    </div>
                </div>

                {/* Median Sold Price */}
                <div className="flex flex-col h-full bg-[#f8f9f9] rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                    <div className="flex-1 p-6 md:p-8 flex flex-col items-center justify-center text-center">
                        <div className="text-3xl md:text-4xl lg:text-4xl font-heading font-bold text-[#163331] mb-4 lg:whitespace-nowrap">
                            {formatCurrency(suburbInsights.avgMedianSoldPrice || suburbInsights.medianPrice)}
                        </div>
                        <div className="text-[11px] md:text-xs font-bold text-[#163331]/60 uppercase tracking-[0.1em] leading-relaxed">
                            MEDIAN SOLD PRICE
                        </div>
                    </div>
                    <div className="bg-[#ecedee] py-3 px-4 text-center">
                        <span className="text-[10px] md:text-[11px] font-bold text-[#163331]/40 uppercase tracking-wider">
                            {suburbInsights.periodRange}
                        </span>
                    </div>
                </div>

                {/* Average Number of Sales */}
                <div className="flex flex-col h-full bg-[#f8f9f9] rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                    <div className="flex-1 p-6 md:p-8 flex flex-col items-center justify-center text-center">
                        <div className="text-4xl md:text-5xl font-heading font-bold text-[#163331] mb-4">
                            {suburbInsights.avgNumberSold}
                        </div>
                        <div className="text-[11px] md:text-xs font-bold text-[#163331]/60 uppercase tracking-[0.1em] leading-relaxed">
                            AVERAGE NUMBER OF SALES<br />PER QUARTER
                        </div>
                    </div>
                    <div className="bg-[#ecedee] py-3 px-4 text-center">
                        <span className="text-[10px] md:text-[11px] font-bold text-[#163331]/40 uppercase tracking-wider">
                            {suburbInsights.periodRange}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SuburbStats
