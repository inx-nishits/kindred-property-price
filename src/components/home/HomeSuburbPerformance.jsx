import React from 'react';
import { TrendingUp, Home } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

export default function HomeSuburbPerformance({ suburbStats, suburbName }) {
    if (!suburbStats || !suburbStats.historicalData || suburbStats.historicalData.length === 0) {
        return null; // Or a loading/empty state
    }

    // Format data for Recharts - Group by year but fallback to monthly if data is sparse
    const processChartData = (rawData) => {
        if (!rawData || rawData.length === 0) return [];

        // Try yearly grouping first
        const years = [...new Set(rawData.filter(d => d.year).map(d => Number(d.year)))].sort();
        const yearly = [];

        years.forEach(year => {
            const yearData = rawData.filter(d => Number(d.year) === year && d.medianPrice > 0);
            if (yearData.length > 0) {
                // Latest available month in that year
                const latest = yearData.sort((a, b) => (b.month || 0) - (a.month || 0))[0];
                yearly.push({
                    name: latest.year.toString(),
                    value: latest.medianPrice,
                    year: latest.year
                });
            }
        });

        // If we have at least 3 years, use yearly data for a clean trend
        if (yearly.length >= 3) return yearly.slice(-10);

        // Otherwise fallback to monthly/quarterly data points to show more detail than a single dot
        return rawData
            .filter(d => d.medianPrice > 0)
            .map(d => ({
                name: d.period || d.year.toString(),
                value: d.medianPrice,
                year: d.year
            }))
            .slice(-24); // Show last 2 years of available points
    };

    const data = processChartData(suburbStats.historicalData || []);

    // Custom Tick for Y Axis (Currency)
    const formatYAxis = (tickItem) => {
        if (tickItem >= 1000000) return `$${(tickItem / 1000000).toFixed(1)}m`;
        if (tickItem >= 1000) return `$${(tickItem / 1000).toFixed(0)}k`;
        return tickItem;
    };

    return (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-100 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-white rounded-lg text-primary-600">
                    <TrendingUp className="w-8 h-8 text-brand-success" />
                </div>
                <h3 className="text-xl sm:text-2xl font-heading font-bold text-dark-green leading-tight">
                    5-Year Suburb Performance
                </h3>
            </div>

            {/* Chart Container */}
            <div className="flex-1 min-h-[300px] w-full relative">
                <div className="flex items-center gap-2 mb-6">
                    <Home className="w-5 h-5 text-brand-success" />
                    <span className="font-bold text-dark-green text-lg">Median Property Value</span>
                </div>

                <div className="w-full h-[250px] sm:h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis
                                dataKey="name"
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                axisLine={{ stroke: '#9CA3AF' }}
                                tickLine={false}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis
                                tickFormatter={formatYAxis}
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                width={50}
                            />
                            <Tooltip
                                formatter={(value) => new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(value)}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#163331"
                                strokeWidth={2.5}
                                dot={{ fill: '#163331', r: 4, strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 6, fill: '#34BF77' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Decorative Bottom Element similar to design */}
                <div className="flex flex-col items-center justify-center mt-4 text-muted-500">
                    <div className="w-16 h-1 bg-dark-green/10 rounded-full mb-2"></div>
                    <span className="text-sm font-medium">Median Value</span>
                </div>
            </div>
        </div>
    );
}
