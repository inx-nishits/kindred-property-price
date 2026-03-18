import React from 'react'
import { TrendingUp, Home, Calendar } from 'lucide-react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts'

const HistoryCharts = ({ historicalData, suburb, formatCurrency }) => {
    if (!historicalData || historicalData.length === 0) return null;

    const processChartData = (items) => {
        if (!items || items.length === 0) return [];

        // Try yearly grouping
        const years = [...new Set(items.filter(d => d.year).map(d => Number(d.year)))].sort();
        const yearly = [];

        years.forEach(year => {
            const yearData = items.filter(d => Number(d.year) === year && d.medianPrice > 0);
            if (yearData.length > 0) {
                const latest = yearData.sort((a, b) => (b.month || 0) - (a.month || 0))[0];
                yearly.push({
                    ...latest,
                    name: latest.year.toString()
                });
            }
        });

        // If we have 3+ years, yearly is good
        if (yearly.length >= 3) return yearly.slice(-10);

        // Fallback to monthly/quarterly to show more detail than a single point
        return items
            .filter(d => d.medianPrice > 0)
            .map(d => ({
                ...d,
                name: d.period || d.year?.toString()
            }))
            .slice(-24);
    };

    const chartData = processChartData(historicalData);

    return (
        <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#163331] mb-6 flex items-center gap-3">
                <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-primary-500" strokeWidth={1.5} />
                5-Year Suburb Performance - {suburb}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Median Value Chart */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-[#163331] mb-4 flex items-center gap-2">
                        <Home className="w-5 h-5 text-primary-500" />
                        Median Property Value
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="name"
                                stroke="#6b7280"
                                fontSize={12}
                                tick={{ fill: '#6b7280' }}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis
                                stroke="#6b7280"
                                fontSize={12}
                                tick={{ fill: '#6b7280' }}
                                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    padding: '8px'
                                }}
                                formatter={(value) => formatCurrency(value)}
                                labelStyle={{ color: '#163331', fontWeight: 'bold' }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="medianPrice"
                                stroke="#163331"
                                strokeWidth={2}
                                dot={{ fill: '#163331', r: 3 }}
                                activeDot={{ r: 5 }}
                                name="Median Value"
                                connectNulls={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Median Rent Chart */}
                {chartData.some(d => d.medianRent && d.medianRent > 0) && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-[#163331] mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary-500" />
                            Median Weekly Rent
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="name"
                                    stroke="#6b7280"
                                    fontSize={12}
                                    tick={{ fill: '#6b7280' }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                />
                                <YAxis
                                    stroke="#6b7280"
                                    fontSize={12}
                                    tick={{ fill: '#6b7280' }}
                                    tickFormatter={(value) => `$${value}/wk`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        padding: '8px'
                                    }}
                                    formatter={(value) => value ? `$${value}/week` : 'N/A'}
                                    labelStyle={{ color: '#163331', fontWeight: 'bold' }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="medianRent"
                                    stroke="#48D98E"
                                    strokeWidth={2}
                                    dot={{ fill: '#48D98E', r: 3 }}
                                    activeDot={{ r: 5 }}
                                    name="Median Rent"
                                    connectNulls={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {!chartData.some(d => d.medianRent > 0) && (
                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600 text-center">
                        Rental data is not available for this suburb at this time.
                    </p>
                </div>
            )}
        </div>
    )
}

export default HistoryCharts
