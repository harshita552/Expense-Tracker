import React, { useState, useEffect } from "react";
import { Wifi, WifiOff, Moon, Sun } from "lucide-react";
import useTheme from "../hooks/useTheme";
import "../theme.css"; // import your CSS

export default function Header() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [theme, toggleTheme] = useTheme();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <header className="header p-4 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-cyan-800 dark:text-white">
          Expense Tracker</h1>
        <p className="text-sm text-muted-foreground dark:text-gray-300">
          Manage your finances with ease</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium bg-white dark:bg-gray-700 dark:text-gray-200">
          {isOnline ? <Wifi className="h-3 w-3 text-green-500" /> : <WifiOff className="h-3 w-3 text-red-500" />}
          <span>{isOnline ? "Online" : "Offline"}</span>
        </span>
        <button onClick={toggleTheme} className="button-theme">
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}
