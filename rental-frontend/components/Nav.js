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
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setUser(getUser());
    setLogged(isLoggedIn());
    setCanCreate(hasRole("OWNER") || hasRole("ADMIN"));
    setIsAdmin(hasRole("ADMIN"));
  }, [pathname]);

  function logout() {
    clearToken();
    router.push("/login");
    router.refresh();
  }

  const linkClass = (path) => {
    const active = pathname === path;
    return `text-sm font-medium transition ${
      active
        ? "text-neutral-900"
        : "text-neutral-600 hover:text-neutral-900"
    }`;
  };

  return (
    <header className="border-b border-neutral-200 bg-white sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/items" className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-neutral-900 rounded-md flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white">
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="font-semibold text-neutral-900 tracking-tight">
              RentaTN
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/items" className={linkClass("/items")}>
              Catalog
            </Link>
            {logged && (
              <Link href="/my-rentals" className={linkClass("/my-rentals")}>
                My rentals
              </Link>
            )}
            {canCreate && (
              <Link href="/create-item" className={linkClass("/create-item")}>
                List an item
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin/rentals" className={linkClass("/admin/rentals")}>
                <span className="flex items-center gap-1.5">
                  Admin
                  <span className="text-[10px] font-bold bg-neutral-900 text-white px-1.5 py-0.5 rounded">
                    ADM
                  </span>
                </span>
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {logged ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 hover:bg-neutral-100 rounded-md px-2 py-1 transition"
                  title="Profile"
                >
                  <div className="w-7 h-7 bg-neutral-900 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                    {user?.email?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm text-neutral-700">{user?.email}</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium px-4 py-1.5 rounded-md transition"
              >
                Sign in
              </Link>
            )}
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden p-2 -mr-2 text-neutral-700"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen
                ? <path d="M18 6L6 18M6 6l12 12" />
                : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-neutral-100 py-4 space-y-3">
            <Link href="/items" className={`block ${linkClass("/items")}`} onClick={() => setMobileOpen(false)}>
              Catalog
            </Link>
            {logged && (
              <Link href="/my-rentals" className={`block ${linkClass("/my-rentals")}`} onClick={() => setMobileOpen(false)}>
                My rentals
              </Link>
            )}
            {canCreate && (
              <Link href="/create-item" className={`block ${linkClass("/create-item")}`} onClick={() => setMobileOpen(false)}>
                List an item
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin/rentals" className={`block ${linkClass("/admin/rentals")}`} onClick={() => setMobileOpen(false)}>
                Admin · Bookings
              </Link>
            )}
            <div className="pt-3 border-t border-neutral-100 space-y-3">
              {logged ? (
                <>
                  <Link
                    href="/profile"
                    className={`block ${linkClass("/profile")}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    Profile · {user?.email}
                  </Link>
                  <button
                    onClick={logout}
                    className="text-sm font-medium text-neutral-600"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="inline-block bg-neutral-900 text-white text-sm font-medium px-4 py-1.5 rounded-md"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
