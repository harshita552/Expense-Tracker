import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import DashboardPage from "./pages/DashboardPage.jsx";
import ExpensesPage from "./pages/ExpensesPage.jsx";   // create this page
import CategoriesPage from "./pages/CategoriesPage.jsx"
import "./index.css";
import useTheme from "./hooks/useTheme";

function App() {
    const [theme, toggleTheme] = useTheme(); // <- global theme hook

  return (
    <Router>
        <Header theme={theme} toggleTheme={toggleTheme} />
      <main className="container mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
