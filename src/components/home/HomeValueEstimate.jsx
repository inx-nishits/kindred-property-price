import React from 'react';
import { ArrowUpRight, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HomeValueEstimate({ priceEstimate, propertyId }) {
    const router = useRouter();

    const formatCurrency = (val) => {
        if (!val) return 'N/A';
        // Round to nearest thousand for cleaner look
        const rounded = Math.round(val / 1000) * 1000;
        return new Intl.NumberFormat('en-AU', {
            style: 'currency',
            currency: 'AUD',
            maximumFractionDigits: 0
        }).format(rounded);
    };

    // Fallback if data is missing but component is rendered
    if (!priceEstimate) {
        return (
            <div className="bg-brand-dark rounded-2xl p-8 text-white relative overflow-hidden h-full flex flex-col justify-center shadow-xl border border-white/10">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-mint/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-6 text-brand-mint">
                        <TrendingUp className="w-5 h-5" />
                        <span className="font-bold tracking-wide uppercase text-sm">Property Estimate</span>
                    </div>
                    <h3 className="text-3xl font-heading font-bold mb-4 leading-tight">
                        Value not available locally
                    </h3>
                    <p className="text-white/70 mb-8">
                        We couldn't generate an automatic estimate for this property. Contact us for a precise appraisal.
                    </p>
                    <a
                        href="https://www.kindred.com.au/contact-us"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-4 bg-brand-mint hover:bg-brand-mint/90 text-brand-dark rounded-lg font-bold text-lg transition-all duration-300 shadow-[0_4px_14px_rgba(72,217,142,0.4)] block text-center"
                    >
                        Request Appraisal
                    </a>
                </div>
            </div>
        );
    }

    const { low, high, mid } = priceEstimate;

    return (
        <div className="bg-brand-dark rounded-2xl p-8 sm:p-10 text-white relative overflow-hidden h-full flex flex-col justify-between shadow-2xl border border-white/5 ring-1 ring-white/10">
            {/* Detailed Background Effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-brand-mint/5 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none"></div>

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-brand-mint">
                        <ArrowUpRight className="w-4 h-4" />
                        <span className="font-bold tracking-wide uppercase text-xs">Estimated Value</span>
                    </div>
                    {/* Confidence Tag using domain logic usually, or static for example */}
                    <div className="flex items-center gap-1.5 text-xs font-medium text-white/60">
                        <div className="w-2 h-2 rounded-full bg-brand-mint animate-pulse"></div>
                        High Confidence
                    </div>
                </div>

                {/* Main Price Display */}
                <div className="mb-8">
                    <div className="flex flex-col">
                        <span className="text-white/60 text-sm mb-1 font-medium tracking-wide">Estimated Value Range</span>
                        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold leading-tight tracking-tight text-white mb-2">
                            {formatCurrency(low)} <span className="text-white/30 font-light">-</span> {formatCurrency(high)}
                        </h3>
                    </div>
                </div>

                {/* Range Bar Visual */}
                <div className="mb-10">
                    <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="absolute top-0 left-[10%] right-[10%] h-full bg-gradient-to-r from-brand-mint/40 via-brand-mint to-brand-mint/40 rounded-full"></div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-white/40 font-medium font-mono">
                        <span>Low</span>
                        <span className="text-brand-mint">Mid: {formatCurrency(mid)}</span>
                        <span>High</span>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="relative z-10 mt-auto">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6"></div>
                <a
                    href="https://www.kindred.com.au/contact-us"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-full py-4 bg-brand-mint hover:bg-brand-mint/90 text-brand-dark rounded-xl font-heading font-bold text-lg transition-all duration-300 shadow-[0_0_20px_rgba(72,217,142,0.2)] hover:shadow-[0_0_30px_rgba(72,217,142,0.4)] relative overflow-hidden block text-center"
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        Get your free appraisal
                        <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </span>
                </a>
                <p className="text-[10px] text-center text-white/30 mt-4 max-w-xs mx-auto">
                    *Estimate based on recent market data. Actual value may vary.
                </p>
            </div>
        </div>
    );
}
