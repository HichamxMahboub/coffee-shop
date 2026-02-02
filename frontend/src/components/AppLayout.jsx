import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Coffee, LayoutDashboard, ShoppingBag, Package, BarChart3, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/pos", label: "POS", icon: ShoppingBag },
  { to: "/inventory", label: "Inventaire", icon: Package },
  { to: "/sales", label: "Ventes", icon: BarChart3 },
];

export default function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="flex">
        <aside className="w-64 min-h-screen border-r border-slate-800 bg-slate-950/80 px-6 py-8">
          <div className="flex items-center gap-3 text-coffee-200">
            <Coffee className="h-8 w-8" />
            <div>
              <p className="text-lg font-semibold">Café Premium</p>
              <p className="text-xs text-slate-400">Coffee Shop Management</p>
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
            <p className="text-xs text-slate-400">Connecté</p>
            <p className="mt-1 text-sm font-semibold text-slate-100">
              {user?.fullName || "Personnel"}
            </p>
            <button
              type="button"
              onClick={logout}
              className="mt-4 inline-flex items-center gap-2 text-xs text-slate-300 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </button>
          </div>
        </aside>

        <main className="flex-1 px-10 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
