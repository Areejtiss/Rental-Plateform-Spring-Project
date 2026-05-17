"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, setToken, setUser } from "@/lib/api";

const DEMO_ACCOUNTS = [
  { email: "admin@rental.com", password: "admin123", role: "Admin" },
  { email: "bob@rental.com", password: "bob123", role: "Owner" },
  { email: "carol@rental.com", password: "carol123", role: "Renter" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("bob@rental.com");
  const [password, setPassword] = useState("bob123");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(data.token);
      setUser({ id: data.userId, email: data.email, roles: data.roles });
      router.push("/items");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function quickLogin(acc) {
    setEmail(acc.email);
    setPassword(acc.password);
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center fade-in">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">
            Sign in to RentaTN
          </h1>
          <p className="text-neutral-600 text-sm mt-1.5">
            Enter your credentials to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-neutral-300 rounded-md px-3 py-2 text-sm placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-neutral-300 rounded-md px-3 py-2 text-sm placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-400 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-md transition"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-neutral-200">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">
            Demo accounts
          </p>
          <div className="space-y-1.5">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => quickLogin(acc)}
                className="w-full flex items-center justify-between bg-white hover:bg-neutral-50 border border-neutral-200 rounded-md px-3 py-2 text-left transition group"
              >
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    {acc.email}
                  </p>
                  <p className="text-xs text-neutral-500 font-mono tabular">
                    {acc.password}
                  </p>
                </div>
                <span className="text-xs font-medium text-neutral-500 group-hover:text-neutral-700">
                  {acc.role}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
