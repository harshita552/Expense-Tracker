import React, { useRef, useState } from "react";
import { LayoutDashboard, Receipt, FolderOpen, Upload, Download } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import useStore from "../store/useStore"; // Zustand store
import Papa from "papaparse";

export default function TabsHeader() {
    const location = useLocation();
    const fileInputRef = useRef(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const expenses = useStore((state) => state.expenses);
    const setExpenses = useStore((state) => state.setExpenses);

    const categories = useStore((s) => s.categories);

    const tabs = [
        { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" />, path: "/" },
        { id: "expenses", label: "Expenses", icon: <Receipt className="h-4 w-4" />, path: "/expenses" },
        { id: "categories", label: "Categories", icon: <FolderOpen className="h-4 w-4" />, path: "/categories" },
    ];


    // Export CSV
    const handleExportCSV = () => {
        if (!expenses.length) return alert("No expenses to export!");
        const csvData = expenses.map((exp) => {
            const date = exp.date ? new Date(exp.date) : null;
            return {
                Title: exp.title,
                Amount: exp.amount,
                Date: date ? `\t${date.toISOString().split("T")[0]}` : "",
                Category: categories.find((c) => c.id === exp.categoryId)?.name || "",
                PaymentMethod: exp.paymentMethod || "",
                Notes: exp.notes || "",
            };
        });
        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "expenses.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Import CSV
    const handleImportCSV = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                const importedExpenses = results.data.map((row) => ({
                    title: row.Title,
                    amount: Number(row.Amount),
                    currency: row.Currency || "INR",
                    categoryId: categories.find((c) => c.name === row.Category)?.id || null,
                    date: row.Date || new Date().toISOString(),
                    paymentMethod: row.PaymentMethod || "",
                    notes: row.Notes || "",
                    id: Date.now() + Math.random(),
                }));
                setExpenses([...expenses, ...importedExpenses]);
                alert("CSV imported successfully!");
                setIsModalOpen(false); // close modal after import
            },
        });
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                {/* Tabs */}
                <div className="bg-gray-50 h-9 items-center justify-center rounded-lg p-1 grid w-full max-w-md grid-cols-3">
                    {tabs.map((tab) => {
                        const isActive = location.pathname === tab.path;
                        return (
                            <Link
                                key={tab.id}
                                to={tab.path}
                                className={`flex items-center gap-2 justify-center rounded-md px-2 py-1 text-sm font-medium transition-colors
                ${isActive ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-800"}`}
                            >
                                {tab.icon}
                                <span className="hidden sm:inline">{tab.label}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center h-8 gap-2 rounded-md border bg-white px-3 text-sm font-medium shadow hover:bg-amber-500 hover:text-white transition-colors"
                    >
                        <Upload className="h-4 w-4" />
                        Import CSV
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className="inline-flex items-center h-8 gap-2 rounded-md border bg-white px-3 text-sm font-medium shadow hover:bg-amber-500 hover:text-white transition-colors"
                    >
                        <Download className="h-4 w-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-lg w-full p-6 relative">
                        <h2 className="text-lg font-semibold mb-4">Import Expenses from CSV</h2>

                        <div
                            className="flex items-center gap-3 p-4 bg-gray-100 rounded-md mb-4 cursor-pointer"
                            onClick={() => fileInputRef.current.click()}
                        >
                            <Upload className="h-8 w-8 text-primary" />
                            <div>
                                <p className="font-medium">Upload CSV File</p>
                                <p className="text-sm text-gray-500">
                                    File should include: Title, Amount, Currency, Category, Date, Payment Method, Notes
                                </p>
                            </div>
                        </div>

                        {/* Hidden file input */}
                        <input
                            type="file"
                            accept=".csv"
                            ref={fileInputRef}
                            onChange={handleImportCSV}
                            className="hidden"
                        />

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 rounded-md border bg-gray-200 hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>

                        {/* Close button */}
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
