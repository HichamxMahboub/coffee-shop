import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  Coffee,
  LayoutDashboard,
  ShoppingBag,
  Package,
  BarChart3,
  LineChart,
  Settings,
  ClipboardList,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher.jsx";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const navItems = [
    { to: "/", label: t("nav.dashboard"), icon: LayoutDashboard },
    { to: "/pos", label: t("nav.pos"), icon: ShoppingBag },
    { to: "/inventory", label: t("nav.inventory"), icon: Package },
    { to: "/analytics", label: t("nav.analytics"), icon: BarChart3 },
    { to: "/sales", label: t("nav.sales"), icon: LineChart },
    { to: "/barista", label: t("nav.barista"), icon: Coffee },
    { to: "/z-report", label: t("nav.zreport"), icon: ClipboardList },
    { to: "/settings", label: t("nav.settings"), icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className={`flex ${isRtl ? "flex-row-reverse" : ""}`}>
        <aside
          className={`w-64 min-h-screen bg-slate-950/80 px-6 py-8 ${
            isRtl ? "border-l border-slate-800" : "border-r border-slate-800"
          }`}
        >
          <div className="flex items-center gap-3 text-coffee-200">
            <Coffee className="h-8 w-8" />
            <div>
              <p className="text-lg font-semibold">Café Premium</p>
              <p className="text-xs text-slate-400">{t("layout.management")}</p>
            </div>
          </div>

          <nav className="mt-10 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      isActive
                        ? "bg-coffee-500 text-white"
                        : "text-slate-200 hover:bg-slate-900"
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-10 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs text-slate-400">{t("layout.connected")}</p>
            <p className="mt-1 text-sm font-semibold text-slate-100">
              {user?.fullName || "Personnel"}
            </p>
            <button
              type="button"
              onClick={logout}
              className="mt-4 inline-flex items-center gap-2 text-xs text-slate-300 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              {t("layout.logout")}
            </button>
          </div>
        </aside>

        <main className="flex-1 px-10 py-8">
          <div className="mb-6 flex items-center justify-end gap-3">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={toggleTheme}
              className="button-secondary no-print"
            >
              {theme === "dark" ? (
                <Sun className="mr-2 h-4 w-4" />
              ) : (
                <Moon className="mr-2 h-4 w-4" />
              )}
              {theme === "dark" ? t("layout.lightMode") : t("layout.darkMode")}
            </button>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
