"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, setToken, setUser } from "@/lib/api";
import { TUNISIAN_CITIES } from "@/lib/constants";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [accountType, setAccountType] = useState("RENTER");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // RENTER au minimum, + OWNER si demandé
      const roles = accountType === "OWNER" ? ["OWNER", "RENTER"] : ["RENTER"];

      const data = await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          phone: phone || null,
          city: city || null,
          roles,
        }),
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

  return (
    <div className="min-h-[70vh] flex items-center justify-center fade-in py-8">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">
            Create your account
          </h1>
          <p className="text-neutral-600 text-sm mt-1.5">
            Join RentaTN to rent items or list your own.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Account type */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              I want to
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAccountType("RENTER")}
                className={`px-3 py-2.5 rounded-md border text-sm font-medium transition ${
                  accountType === "RENTER"
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400"
                }`}
              >
                Rent items
              </button>
              <button
                type="button"
                onClick={() => setAccountType("OWNER")}
                className={`px-3 py-2.5 rounded-md border text-sm font-medium transition ${
                  accountType === "OWNER"
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400"
                }`}
              >
                List my items
              </button>
            </div>
            <p className="text-xs text-neutral-500 mt-1.5">
              {accountType === "OWNER"
                ? "Owners can also rent items from others."
                : "You can upgrade to lister later."}
            </p>
          </div>

          {/* Identity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                First name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-white border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                required
                maxLength={60}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Last name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-white border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                required
                maxLength={60}
              />
            </div>
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-white border border-neutral-300 rounded-md px-3 py-2 text-sm placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Phone <span className="text-neutral-400 font-normal">(optional)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+216 ..."
                className="w-full bg-white border border-neutral-300 rounded-md px-3 py-2 text-sm placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                maxLength={20}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                City <span className="text-neutral-400 font-normal">(optional)</span>
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-white border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              >
                <option value="">Select</option>
                {TUNISIAN_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Passwords */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full bg-white border border-neutral-300 rounded-md px-3 py-2 text-sm placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              required
              minLength={6}
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Confirm password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              required
              minLength={6}
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
            className="w-full bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-400 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-md transition"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="text-xs text-neutral-500 text-center pt-2">
            By creating an account, you agree to our terms of service.
          </p>
        </form>

        <div className="mt-8 pt-6 border-t border-neutral-200 text-center">
          <p className="text-sm text-neutral-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-neutral-900 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
