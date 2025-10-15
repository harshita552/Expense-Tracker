import { create } from "zustand";

// helper to safely get localStorage or fallback to []
const getLocalStorage = (key, fallback = []) => {
  try {
    const stored = localStorage.getItem(key);
    return Array.isArray(JSON.parse(stored)) ? JSON.parse(stored) : fallback;
  } catch (err) {
    return fallback;
  }
};

const useStore = create((set, get) => ({
  expenses: getLocalStorage("expenses", []),
  categories: getLocalStorage("categories", []), // make sure this is always an array

  // -------- Expenses --------
  setExpenses: (newExpenses) => {
    set(() => {
      localStorage.setItem("expenses", JSON.stringify(newExpenses));
      return { expenses: newExpenses };
    });
  },

  addExpense: (expense) => {
    set((state) => {
      const newExpense = { ...expense, id: Date.now() }; // unique id
      const updated = [...state.expenses, newExpense];
      localStorage.setItem("expenses", JSON.stringify(updated));
      return { expenses: updated };
    });
  },

  updateExpense: (id, updatedData) => {
    set((state) => {
      const updated = state.expenses.map((exp) =>
        exp.id === id ? { ...exp, ...updatedData } : exp
      );
      localStorage.setItem("expenses", JSON.stringify(updated));
      return { expenses: updated };
    });
  },

  deleteExpense: (id) => {
    set((state) => {
      const updated = state.expenses.filter((exp) => exp.id !== id);
      localStorage.setItem("expenses", JSON.stringify(updated));
      return { expenses: updated };
    });
  },

  // -------- Categories --------
  addCategory: (category) => {
    set((state) => {
      const updated = [...state.categories, category];
      localStorage.setItem("categories", JSON.stringify(updated));
      return { categories: updated };
    });
  },

  updateCategory: (id, updatedData) => {
    set((state) => {
      const updated = state.categories.map((cat) =>
        cat.id === id ? { ...cat, ...updatedData } : cat
      );
      localStorage.setItem("categories", JSON.stringify(updated));
      return { categories: updated };
    });
  },

  deleteCategory: (id) => {
    set((state) => {
      const updated = state.categories.filter((cat) => cat.id !== id);
      localStorage.setItem("categories", JSON.stringify(updated));
      return { categories: updated };
    });
  },
}));

export default useStore;
