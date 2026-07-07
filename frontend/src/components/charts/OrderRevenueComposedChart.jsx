import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from "recharts";

export default function OrderRevenueComposedChart({ ordersData, revenueData }) {
  const combinedData = (ordersData || []).map((order, idx) => ({
    date: order.date,
    orders: order.orders,
    revenue: revenueData?.[idx]?.revenue || 0,
  }));

  const avgOrders = combinedData.length > 0 
    ? Math.round(combinedData.reduce((sum, d) => sum + d.orders, 0) / combinedData.length)
    : 0;

  const avgRevenue = combinedData.length > 0
    ? Math.round(combinedData.reduce((sum, d) => sum + d.revenue, 0) / combinedData.length)
    : 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-xs font-semibold text-gray-300 mb-2">{payload[0].payload.date}</p>
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <p key={index} className="text-xs" style={{ color: entry.color }}>
                <span className="font-medium">{entry.name}:</span> {entry.name === "Orders" ? entry.value : `₹${entry.value?.toLocaleString()}`}
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="section-card">
      <div className="px-5 py-4 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-gray-200">Orders vs Revenue Analysis</h3>
        <p className="text-xs text-gray-500 mt-1">Dual-axis comparison with trend analysis</p>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Avg Orders</p>
            <p className="text-lg font-bold text-blue-400">{avgOrders}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Avg Revenue</p>
            <p className="text-lg font-bold text-green-400">₹{avgRevenue?.toLocaleString()}</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={combinedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a24" vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11, fill: "#6b6b84" }} 
              axisLine={false} 
              tickLine={false}
            />
            <YAxis 
              yAxisId="left"
              tick={{ fontSize: 11, fill: "#6b6b84" }} 
              axisLine={false} 
              tickLine={false}
              label={{ value: "Orders", angle: -90, position: "insideLeft", offset: 10, fill: "#3b82f6", fontSize: 12 }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              tick={{ fontSize: 11, fill: "#6b6b84" }}
              axisLine={false}
              tickLine={false}
              label={{ value: "Revenue (₹)", angle: 90, position: "insideRight", offset: 10, fill: "#10b981", fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="line"
            />
            <ReferenceLine 
              yAxisId="left"
              y={avgOrders} 
              stroke="#3b82f6" 
              strokeDasharray="5 5" 
              opacity={0.5}
              label={{ value: `Avg: ${avgOrders}`, position: "right", fill: "#3b82f6", fontSize: 10 }}
            />
            <ReferenceLine 
              yAxisId="right"
              y={avgRevenue} 
              stroke="#10b981" 
              strokeDasharray="5 5" 
              opacity={0.5}
              label={{ value: `Avg: ₹${avgRevenue?.toLocaleString()}`, position: "right", fill: "#10b981", fontSize: 10 }}
            />
            <Area 
              yAxisId="left"
              type="monotone" 
              dataKey="orders" 
              stroke="#3b82f6" 
              strokeWidth={2.5}
              fillOpacity={1} 
              fill="url(#colorOrders)"
              name="Orders"
              isAnimationActive={true}
              animationDuration={800}
            />
            <Area 
              yAxisId="right"
              type="monotone" 
              dataKey="revenue" 
              stroke="#10b981" 
              strokeWidth={2.5}
              fillOpacity={1} 
              fill="url(#colorRevenue)"
              name="Revenue"
              isAnimationActive={true}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
            <p className="text-xs text-gray-400 mb-2">Orders Trend</p>
            <div className="flex items-end gap-1 h-12">
              {combinedData.slice(-7).map((d, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t opacity-70 hover:opacity-100 transition-opacity"
                  style={{ height: `${(d.orders / Math.max(...combinedData.map(x => x.orders))) * 100}%` }}
                  title={`${d.orders} orders`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">Last 7 days</p>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
            <p className="text-xs text-gray-400 mb-2">Revenue Trend</p>
            <div className="flex items-end gap-1 h-12">
              {combinedData.slice(-7).map((d, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-green-500 to-green-400 rounded-t opacity-70 hover:opacity-100 transition-opacity"
                  style={{ height: `${(d.revenue / Math.max(...combinedData.map(x => x.revenue))) * 100}%` }}
                  title={`₹${d.revenue?.toLocaleString()}`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">Last 7 days</p>
          </div>
        </div>
      </div>
    </div>
  );
}
