"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearToken, getUser, hasRole, isLoggedIn } from "@/lib/api";

export default function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [logged, setLogged] = useState(false);
  const [canCreate, setCanCreate] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setUser(getUser());
    setLogged(isLoggedIn());
    setCanCreate(hasRole("OWNER") || hasRole("ADMIN"));
  }, [pathname]);

  function logout() {
    clearToken();
    router.push("/login");
    router.refresh();
  }

  const linkClass = (path) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition ${
      pathname === path
        ? "bg-white/15 text-white"
        : "text-slate-300 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <header className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-800 text-white shadow-lg sticky top-0 z-40 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/items" className="flex items-center gap-2 group">
            <span className="text-2xl">🛠️</span>
            <span className="font-bold text-lg tracking-tight">RentaTN</span>
            <span className="hidden sm:inline text-xs text-indigo-200 ml-1">
              · Tunisia
            </span>
          </Link>

          {/* Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/items" className={linkClass("/items")}>
              🔍 Items
            </Link>
            {logged && (
              <Link href="/my-rentals" className={linkClass("/my-rentals")}>
                📋 Mes locations
              </Link>
            )}
            {canCreate && (
              <Link href="/create-item" className={linkClass("/create-item")}>
                ✨ Créer
              </Link>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {logged ? (
              <>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                  <div className="w-7 h-7 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center text-xs font-bold text-slate-900">
                    {user?.email?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm">{user?.email}</span>
                </div>
                <button
                  onClick={logout}
                  className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-lg text-sm font-medium transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-white text-indigo-900 hover:bg-indigo-50 px-5 py-1.5 rounded-lg text-sm font-semibold transition"
              >
                Se connecter
              </Link>
            )}
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/10"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-1">
            <Link
              href="/items"
              className={linkClass("/items")}
              onClick={() => setMobileOpen(false)}
            >
              🔍 Items
            </Link>
            {logged && (
              <Link
                href="/my-rentals"
                className={linkClass("/my-rentals")}
                onClick={() => setMobileOpen(false)}
              >
                📋 Mes locations
              </Link>
            )}
            {canCreate && (
              <Link
                href="/create-item"
                className={linkClass("/create-item")}
                onClick={() => setMobileOpen(false)}
              >
                ✨ Créer un item
              </Link>
            )}
            <div className="border-t border-white/10 pt-3 mt-2">
              {logged ? (
                <button
                  onClick={logout}
                  className="w-full bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Logout · {user?.email}
                </button>
              ) : (
                <Link
                  href="/login"
                  className="block bg-white text-indigo-900 px-4 py-2 rounded-lg text-sm font-semibold text-center"
                >
                  Se connecter
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
