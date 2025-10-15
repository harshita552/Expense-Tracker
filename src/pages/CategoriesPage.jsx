import React, { useState } from "react";
import TabsHeader from "../components/TabsHeader";
import useStore from "../store/useStore";
import { Plus, MoreVertical } from "lucide-react";
import { nanoid } from "nanoid";

const ICONS = ["🛒", "🚗", "🎬", "🍽️", "⚡", "🏠", "💊", "🎓", "✈️", "🎮", "👕", "📱"];
const COLORS = ["#0891b2", "#d97706", "#475569", "#ec4899", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#14b8a6"];

export default function CategoriesPage() {
  const categories = useStore((state) => state.categories) || [];
  const addCategory = useStore((state) => state.addCategory);
  const updateCategory = useStore((state) => state.updateCategory);
  const deleteCategory = useStore((state) => state.deleteCategory);

  const [modalData, setModalData] = useState(null); // store category being edited or added
  const [isAddMode, setIsAddMode] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Open modal for adding
  const openAddModal = () => {
    setModalData({ name: "", icon: ICONS[0], color: COLORS[0] });
    setIsAddMode(true);
  };

  // Open modal for editing
  const openEditModal = (cat) => {
    setModalData({ ...cat });
    setIsAddMode(false);
    setOpenMenuId(null);
  };

  // Handle modal submit (add or edit)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isAddMode) {
      addCategory({
        id: nanoid(),
        ...modalData,
        date: new Date().toLocaleDateString(),
      });
    } else {
      updateCategory(modalData.id, modalData);
    }
    setModalData(null);
  };

  return (
    <div className="p-6 overflow-x-hidden">
      {/* Tabs + Import/Export Buttons */}
      <TabsHeader />

      <div className="bg-cyan-50 p-6 rounded-xl shadow space-y-6 ">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Categories</h2>
              <p className="text-sm text-gray-500">Organize your expenses by category</p>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className="relative bg-gray-50 border rounded-xl shadow p-4 flex gap-3 items-center">
                <div
                  className="w-12 h-12 flex items-center justify-center rounded-md text-2xl text-white"
                  style={{ backgroundColor: cat.color }}
                >
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base truncate">{cat.name}</h3>
                  <p className="text-xs text-gray-500">Created {cat.date}</p>
                </div>

                {/* 3-dots menu */}
                <div className="relative">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === cat.id ? null : cat.id)}
                    className="p-1 rounded hover:bg-gray-200"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {openMenuId === cat.id && (
                    <div className="absolute right-0 top-full mt-1 w-24 bg-white border rounded shadow z-10 flex flex-col text-sm">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Modal for Add/Edit */}
          {modalData && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
              <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md grid gap-4">
                <h2 className="text-lg font-semibold">{isAddMode ? "Add Category" : "Edit Category"}</h2>

                {/* Name */}
                <div className="flex flex-col gap-1">
                  <label>Name *</label>
                  <input
                    type="text"
                    className="border rounded px-3 py-1"
                    value={modalData.name}
                    onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                    required
                  />
                </div>

                {/* Icon */}
                <div className="flex flex-col gap-1">
                  <label>Icon *</label>
                  <div className="grid grid-cols-6 gap-2">
                    {ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        className={`h-12 text-2xl rounded-md border-2 ${modalData.icon === icon ? "border-blue-500" : "border-gray-300"}`}
                        onClick={() => setModalData({ ...modalData, icon })}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color */}
                <div className="flex flex-col gap-1">
                  <label>Color *</label>
                  <div className="grid grid-cols-5 gap-2">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`h-10 rounded-md border-2 ${modalData.color === color ? "border-black" : "border-gray-300"}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setModalData({ ...modalData, color })}
                      />
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-md">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md text-2xl text-white" style={{ backgroundColor: modalData.color }}>
                    {modalData.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium">Preview</p>
                    <p className="text-xs text-gray-500">This is how your category will look</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setModalData(null)} className="px-4 py-2 rounded border hover:bg-gray-100">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600">
                    {isAddMode ? "Add Category" : "Update Category"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
