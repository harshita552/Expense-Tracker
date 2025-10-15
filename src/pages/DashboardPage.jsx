import { useState, useMemo } from "react";
import TabsHeader from "../components/TabsHeader";
import { Wallet, TrendingUp, CreditCard, ChartPie } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import useStore from "../store/useStore";
import TopExpensesChart from "../components/TopExpensesChart"

export default function Dashboard() {
    const expenses = useStore((s) => s.expenses);
    const categories = useStore((s) => s.categories);

    const [hoverIndex, setHoverIndex] = useState(null);

    // ---- Derived Values ----
    const totalExpenses = useMemo(
        () => expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0),
        [expenses]
    );

    const currentMonth = new Date().getMonth();
    const thisMonthExpenses = useMemo(
        () =>
            expenses
                .filter(
                    (exp) => new Date(exp.date).getMonth() === currentMonth
                )
                .reduce((sum, exp) => sum + Number(exp.amount || 0), 0),
        [expenses]
    );

    const averageExpense = useMemo(
        () => (expenses.length ? totalExpenses / expenses.length : 0),
        [expenses, totalExpenses]
    );

    const topCategory = useMemo(() => {
        const catTotals = categories.map((cat) => ({
            ...cat,
            total: expenses
                .filter((exp) => exp.categoryId === cat.id)
                .reduce((sum, exp) => sum + Number(exp.amount || 0), 0),
        }));
        const top = catTotals.reduce((prev, curr) => (curr.total > prev.total ? curr : prev), { total: 0 });
        return top;
    }, [expenses, categories]);

    // ---- Monthly Spending Trend ----
    const monthlyData = useMemo(() => {
        const months = [...Array(12).keys()]; // 0-11
        return months.map((monthIndex) => {
            const amount = expenses
                .filter((exp) => new Date(exp.date).getMonth() === monthIndex)
                .reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
            const monthName = new Date(0, monthIndex).toLocaleString("default", { month: "short" });
            return { month: monthName, amount };
        }).slice(-6); // last 6 months
    }, [expenses]);

    // ---- Category Distribution ----
    const categoryDistribution = useMemo(() => {
        return categories.map((cat) => {
            const value = expenses
                .filter((exp) => exp.categoryId === cat.id)
                .reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
            return { name: cat.name, value, color: cat.color || "#0891b2" };
        }).filter(cat => cat.value > 0);
    }, [expenses, categories]);

    // ---- Top 10 Expenses ----
    const topExpenses = useMemo(() => {
        return [...expenses]
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 10)
            .map(exp => {
                const category = categories.find(cat => cat.id === exp.categoryId);
                return { ...exp, color: category?.color || "#0891b2", name: exp.title };
            });
    }, [expenses, categories]);

    const maxValue = Math.max(...topExpenses.map(e => e.amount || 0));

    // ---- Dashboard Cards ----
    const cards = [
        {
            title: "Total Expenses",
            value: `₹${totalExpenses.toFixed(2)}`,
            subtitle: `${expenses.length} transaction${expenses.length > 1 ? "s" : ""}`,
            icon: <Wallet className="h-4 w-4 text-gray-400" />,
        },
        {
            title: "This Month",
            value: `₹${thisMonthExpenses.toFixed(2)}`,
            subtitle: "Current month spending",
            icon: <TrendingUp className="h-4 w-4 text-gray-400" />,
        },
        {
            title: "Average Expense",
            value: `₹${averageExpense.toFixed(2)}`,
            subtitle: "Per transaction",
            icon: <CreditCard className="h-4 w-4 text-gray-400" />,
        },
        {
            title: "Top Category",
            value: topCategory.name ? `${topCategory.icon || ""} ${topCategory.name}` : "-",
            subtitle: "Most used category",
            icon: <ChartPie className="h-4 w-4 text-gray-400" />,
        },
    ];

    return (
        <div className="p-6 overflow-x-hidden">
            <TabsHeader />

            {/* Cards */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card, index) => (
                    <div
                        key={index}
                        className="bg-cyan-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 flex flex-col gap-6 rounded-xl border py-6 shadow-sm"
                    >
                        <div className="flex items-center justify-between px-6 pb-2">
                            <div className="text-sm font-medium text-gray-500">{card.title}</div>
                            {card.icon}
                        </div>
                        <div className="px-6">
                            <div className="text-2xl font-bold">{card.value}</div>
                            <p className="text-xs text-gray-400 mt-1">{card.subtitle}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Monthly Spending & Category Distribution */}
            <div className="flex flex-col lg:flex-row gap-6 mt-6">
                {/* Monthly Trend */}
                <div className="flex-1 bg-cyan-50 dark:bg-gray-800 border rounded-xl shadow p-6">
                    <h2 className="text-lg font-bold mb-1">Monthly Spending Trend</h2>
                    <p className="text-sm text-gray-500 mb-4">Your spending over the last 6 months</p>
                    <div className="w-full h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyData}>
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(value) => `₹${value}`} />
                                <Line type="monotone" dataKey="amount" strokeWidth={2} stroke="#0891b2" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Distribution */}
                <div className="flex-1 bg-cyan-50 dark:bg-gray-800 border rounded-xl shadow p-6">
                    <h2 className="text-lg font-bold mb-1">Category Distribution</h2>
                    <p className="text-sm text-gray-500 mb-4">Spending breakdown by category</p>
                    <div className="flex flex-col sm:flex-row items-center justify-between">
                        <svg width="200" height="200" viewBox="0 0 200 200">
                            {categoryDistribution.reduce((acc, cat, i) => {
                                const startAngle = acc.accumulatedAngle || 0;
                                const angle = (cat.value / totalExpenses) * 360;
                                const endAngle = startAngle + angle;
                                const largeArc = angle > 180 ? 1 : 0;
                                const radius = 80;
                                const x1 = 100 + radius * Math.cos((Math.PI * startAngle) / 180);
                                const y1 = 100 + radius * Math.sin((Math.PI * startAngle) / 180);
                                const x2 = 100 + radius * Math.cos((Math.PI * endAngle) / 180);
                                const y2 = 100 + radius * Math.sin((Math.PI * endAngle) / 180);
                                const path = `M100,100 L${x1},${y1} A${radius},${radius} 0 ${largeArc} 1 ${x2},${y2} Z`;
                                acc.paths.push(<path key={i} d={path} fill={cat.color} stroke="#fff" strokeWidth={1}></path>);
                                acc.accumulatedAngle = endAngle;
                                return acc;
                            }, { paths: [], accumulatedAngle: 0 }).paths}
                        </svg>

                        <div className="flex flex-col gap-2 ml-6 mt-4 sm:mt-0">
                            {categoryDistribution.map((cat, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <span className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }}></span>
                                    <span className="text-gray-600 dark:text-gray-200 text-sm">{`${cat.name} ₹${cat.value}`}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Expenses */}
            <div className="relative flex-1 bg-gradient-to-br from-cyan-50 to-white dark:from-gray-800 dark:to-gray-700 border rounded-2xl shadow-xl p-8 mt-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Top 10 Expenses</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-300">Your highest spending transactions</p>
                    </div>
                </div>

                <svg
                    width="100%"
                    height={topExpenses.length * 60 + 40} // more spacing for aesthetics
                    viewBox={`0 0 700 ${topExpenses.length * 60 + 40}`}
                >
                    {/* Y axis line */}
                    <line x1={150} y1={0} x2={150} y2={topExpenses.length * 60} stroke="#717171ff" strokeWidth={1.5} />

                    {/* X axis line */}
                    <line x1={150} y1={topExpenses.length * 60} x2={650} y2={topExpenses.length * 60} stroke="#717171ff" strokeWidth={1.5} />

                    {/* X axis ticks */}
                    {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
                        const x = 150 + f * 500;
                        return (
                            <g key={i}>
                                <line x1={x} y1={topExpenses.length * 60} x2={x} y2={topExpenses.length * 60 + 8} stroke="#333" strokeWidth={1} />
                                <text x={x} y={topExpenses.length * 60 + 25} textAnchor="middle" fontSize={12} fill="#333">
                                    {Math.round(f * maxValue)}
                                </text>
                            </g>
                        );
                    })}

                    {/* Bars and Y labels */}
                    {topExpenses.map((exp, i) => {
                        const y = 15 + i * 60;
                        const barWidth = (exp.amount / maxValue) * 500;
                        return (
                            <g
                                key={i}
                                onMouseEnter={() => setHoverIndex(i)}
                                onMouseLeave={() => setHoverIndex(null)}
                                style={{ cursor: "pointer" }}
                            >
                                {/* Y label */}
                                <text x={145} y={y + 15} textAnchor="end" alignmentBaseline="middle" fill="#333" fontSize={13} fontWeight="500">
                                    {exp.name}
                                </text>

                                {/* Horizontal grid line */}
                                <line x1={150} y1={y + 15} x2={650} y2={y + 15} stroke="#e0e0e0" strokeWidth={1} />

                                {/* Bar */}
                                <rect
                                    x={150}
                                    y={y}
                                    width={barWidth}
                                    height={35} // thicker bar
                                    fill={exp.color}
                                    rx={8} // rounded corners
                                    style={{ transition: "width 0.3s ease" }}
                                />
                            </g>
                        );
                    })}
                </svg>

                {/* Absolute Tooltip */}
                {hoverIndex !== null && (() => {
                    const exp = topExpenses[hoverIndex];
                    const y = 15 + hoverIndex * 60;
                    const barWidth = (exp.amount / maxValue) * 500;
                    return (
                        <div
                            className="absolute bg-white dark:bg-gray-800 shadow-xl rounded-lg p-4 text-sm flex flex-col gap-2 border border-gray-200 dark:border-gray-700"
                            style={{
                                top: y - 50,
                                left: 150 + barWidth + 10,
                                zIndex: 10,
                                minWidth: 180,
                            }}
                        >
                            <strong className="text-gray-800 dark:text-gray-100">{exp.name}</strong>
                            <span className="text-gray-600 dark:text-gray-300">Category: {categories.find(c => c.id === exp.categoryId)?.name}</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-100">Amount: ₹{exp.amount}</span>
                        </div>
                    );
                })()}
            </div>


        </div>
    );
}
