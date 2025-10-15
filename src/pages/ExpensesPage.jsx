// src/pages/ExpensesPage.jsx
import React, { useState, useEffect, useRef } from "react";
import useStore from "../store/useStore";
import TabsHeader from "../components/TabsHeader";

export default function ExpensesPage() {
  const categories = useStore((s) => s.categories) || [];
  const expenses = useStore((s) => s.expenses) || [];
  const addExpense = useStore((s) => s.addExpense);
  const updateExpense = useStore((s) => s.updateExpense);
  const deleteExpense = useStore((s) => s.deleteExpense);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    currency: "INR",
    categoryId: "",
    date: "",
    paymentMethod: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openModal = () => {
    setEditingExpense(null);
    setFormData({
      title: "",
      amount: "",
      currency: "INR",
      categoryId: "",
      date: "",
      paymentMethod: "",
      notes: "",
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (expense) => {
    setEditingExpense(expense);
    setFormData({
      title: expense.title,
      amount: expense.amount,
      currency: expense.currency,
      categoryId: expense.categoryId,
      date: expense.date,
      paymentMethod: expense.paymentMethod,
      notes: expense.notes || "",
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
    setFormData({
      title: "",
      amount: "",
      currency: "INR",
      categoryId: "",
      date: "",
      paymentMethod: "",
      notes: "",
    });
    setErrors({});
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title?.trim()) newErrors.title = "Title is required";
    if (!formData.amount || isNaN(formData.amount))
      newErrors.amount = "Valid amount is required";
    if (!formData.categoryId) newErrors.categoryId = "Category is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.paymentMethod?.trim())
      newErrors.paymentMethod = "Payment method is required";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (editingExpense) {
      // UPDATE expense using store function
      updateExpense(editingExpense.id, formData);
    } else {
      // ADD new expense
      addExpense({ ...formData, id: Date.now() + Math.random() });
    }

    closeModal();
  };

  const filteredExpenses = expenses.filter(
    (exp) =>
      exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      categories
        .find((cat) => cat.id === exp.categoryId)
        ?.name.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      exp.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedExpenses = filteredExpenses.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="p-6 overflow-x-hidden">
      <TabsHeader />

      <div className="bg-cyan-50 text-gray-900 flex flex-col gap-6 rounded-xl border py-6 shadow-sm p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="font-semibold text-lg">Expenses</div>
          <button
            onClick={openModal}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            + Add Expense
          </button>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border rounded-md px-10 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute left-3 top-2 text-gray-400">🔍</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm relative">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-2 text-left font-medium">Title</th>
                <th className="p-2 text-left font-medium">Category</th>
                <th className="p-2 text-left font-medium">Amount</th>
                <th className="p-2 text-left font-medium">Currency</th>
                <th className="p-2 text-left font-medium">Date</th>
                <th className="p-2 text-left font-medium">Payment</th>
                <th className="p-2 w-12 text-center font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedExpenses.length > 0 ? (
                paginatedExpenses.map((exp) => {
                  const category = categories.find(
                    (cat) => cat.id === exp.categoryId
                  );
                  return (
                    <tr
                      key={exp.id}
                      className="hover:bg-gray-50 border-b transition-colors relative"
                    >
                      <td className="p-2 font-medium">{exp.title}</td>
                      <td className="p-2">
                        <span className="inline-block border px-2 py-0.5 rounded-md text-xs bg-gray-100">
                          {category?.icon} {category?.name}
                        </span>
                      </td>
                      <td className="p-2">₹ {exp.amount}</td>
                      <td className="p-2">{exp.currency}</td>
                      <td className="p-2">{exp.date}</td>
                      <td className="p-2">
                        <span className="inline-block border px-2 py-0.5 rounded-md text-xs bg-gray-200">
                          {exp.paymentMethod}
                        </span>
                      </td>
                      <td className="p-2 text-center relative">
                        <button
                          className="p-2 rounded-md hover:bg-gray-100"
                          onClick={() =>
                            setOpenMenuId(openMenuId === exp.id ? null : exp.id)
                          }
                        >
                          ⋮
                        </button>

                        {openMenuId === exp.id && (
                          <div
                            ref={menuRef}
                            className="absolute right-0 mt-2 w-32 bg-white border rounded-md shadow-lg z-50"
                          >
                            <button
                              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                              onClick={() => openEditModal(exp)}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                              onClick={() => {
                                deleteExpense(exp.id);
                                setOpenMenuId(null);
                              }}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="p-6 text-center text-gray-500 italic"
                  >
                    No expenses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>
              Showing {(currentPage - 1) * itemsPerPage + 1}–
              {Math.min(currentPage * itemsPerPage, filteredExpenses.length)} of{" "}
              {filteredExpenses.length}
            </span>
            <span className="hidden sm:inline">|</span>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline">Rows per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border rounded-md px-2 py-1 text-sm"
              >
                {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="border rounded-md p-1 hover:bg-gray-100 disabled:opacity-50"
            >
              ⏮
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="border rounded-md p-1 hover:bg-gray-100 disabled:opacity-50"
            >
              ⬅
            </button>

            <div className="flex items-center gap-1 px-2">
              <span className="text-sm font-medium">{currentPage}</span>
              <span className="text-sm text-gray-500">of</span>
              <span className="text-sm font-medium">{totalPages}</span>
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="border rounded-md p-1 hover:bg-gray-100 disabled:opacity-50"
            >
              ➡
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="border rounded-md p-1 hover:bg-gray-100 disabled:opacity-50"
            >
              ⏭
            </button>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div
            role="dialog"
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50"
            onClick={closeModal}
          >
            <div
              className="w-full max-w-xl rounded-lg border bg-white p-6 shadow-lg z-[1001]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  {editingExpense ? "Edit Expense" : "Add New Expense"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-1">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Grocery Shopping"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-1">Category *</label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>
                  )}
                </div>

                {/* Amount & Currency */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Amount *</label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    />
                    {errors.amount && (
                      <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Currency</label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    >
                      <option>INR</option>
                      <option>USD</option>
                      <option>EUR</option>
                    </select>
                  </div>
                </div>

                {/* Date & Payment Method */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Date *</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    />
                    {errors.date && (
                      <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Payment Method *</label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleChange}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    >
                      <option value="Credit Card">Credit Card</option>
                      <option value="Debit Card">Debit Card</option>
                      <option value="Cash">Cash</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                    {errors.paymentMethod && (
                      <p className="text-red-500 text-sm mt-1">{errors.paymentMethod}</p>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any additional information..."
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none"
                    rows={3}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingExpense ? "Update Expense" : "Add Expense"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
