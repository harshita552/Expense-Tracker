import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function TopExpensesChart({ topExpenses = [], categories = [] }) {
  const [hoverIndex, setHoverIndex] = useState(null);

  // Prepare chart data safely
  const data = topExpenses.map((exp) => ({
    name: exp.title,
    amount: Number(exp.amount),
    color: categories.find((c) => c.id === exp.categoryId)?.color || "#0891b2",
  }));

  const maxValue = Math.max(...data.map((d) => d.amount));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const exp = payload[0].payload;
      return (
        <div className="bg-white shadow-lg rounded p-3 text-xs flex flex-col gap-1 border">
          <strong>{exp.name}</strong>
          <span>Amount: ₹{exp.amount}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-cyan-50 dark:bg-gray-800 border rounded-xl shadow p-6 mt-6">
      <h2 className="text-lg font-bold mb-1">Top 10 Expenses</h2>
      <p className="text-sm text-gray-500 mb-4">Your highest spending transactions</p>

      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 20, right: 50, left: 150, bottom: 20 }}
          >
            {/* X Axis */}
            <XAxis
              type="number"
              tick={{ fill: "#333", fontSize: 12 }}
              domain={[0, maxValue * 1.1]} // make some padding on the right
            />
            {/* Y Axis */}
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fill: "#333", fontSize: 12 }}
              width={150}
            />
            {/* Tooltip */}
            <Tooltip content={<CustomTooltip />} />
            {/* Bars */}
            <Bar dataKey="amount">
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
