"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, hasRole, isLoggedIn } from "@/lib/api";
import { TUNISIAN_CITIES } from "@/lib/constants";

export default function CreateItemPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dailyPrice, setDailyPrice] = useState("");
  const [city, setCity] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }
    if (!hasRole("OWNER") && !hasRole("ADMIN")) {
      setMessage({
        type: "error",
        text: "Only OWNER or ADMIN can list items.",
      });
      return;
    }
    setAuthorized(true);
    api("/api/categories").then(setCategories).catch(console.error);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const data = await api("/api/items", {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
          dailyPrice: parseFloat(dailyPrice),
          city,
          categoryId: parseInt(categoryId, 10),
          available: true,
        }),
      });
      setMessage({
        type: "success",
        text: `Item "${data.title}" listed. Redirecting to catalog...`,
      });
      setTimeout(() => router.push("/items"), 1500);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto fade-in">
      <div className="mb-10 pb-8 border-b border-neutral-200">
        <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight">
          List an item
        </h1>
        <p className="text-neutral-600 mt-2">
          Set up your listing — you can edit it later from your account.
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 p-3 rounded-md border text-sm ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-red-50 border-red-200 text-red-900"
          }`}
        >
          {message.text}
        </div>
      )}

      {authorized && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="bg-white border border-neutral-200 rounded-lg p-6 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900 mb-4">
                Item details
              </h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Bosch 18V Cordless Drill"
                className="w-full bg-white border border-neutral-300 rounded-md px-3 py-2 text-sm placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Condition, accessories included, important notes..."
                className="w-full bg-white border border-neutral-300 rounded-md px-3 py-2 text-sm placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-white border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                required
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="bg-white border border-neutral-200 rounded-lg p-6 space-y-4">
            <h2 className="text-sm font-semibold text-neutral-900">
              Pricing & location
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Daily price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={dailyPrice}
                    onChange={(e) => setDailyPrice(e.target.value)}
                    placeholder="10.00"
                    className="w-full bg-white border border-neutral-300 rounded-md pl-3 pr-14 py-2 text-sm placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 tabular"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500">
                    TND/day
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  City <span className="text-red-500">*</span>
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                  required
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
          </section>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 border border-neutral-300 hover:bg-neutral-50 text-neutral-900 text-sm font-medium py-2.5 rounded-md transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-400 text-white text-sm font-medium py-2.5 rounded-md transition"
            >
              {loading ? "Publishing..." : "Publish listing"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
