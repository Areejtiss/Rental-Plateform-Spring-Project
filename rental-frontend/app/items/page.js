"use client";

import { useEffect, useState } from "react";
import { api, isLoggedIn } from "@/lib/api";
import { TUNISIAN_CITIES } from "@/lib/constants";

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [rentingItem, setRentingItem] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    api("/api/categories").then(setCategories).catch(console.error);
    loadItems();
  }, []);

  async function loadItems() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (city) params.set("city", city);
      if (categoryId) params.set("categoryId", categoryId);
      if (maxPrice) params.set("maxPrice", maxPrice);
      const data = await api(`/api/items?${params.toString()}`);
      setItems(data.content || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function resetFilters() {
    setQ("");
    setCity("");
    setCategoryId("");
    setMaxPrice("");
    setTimeout(loadItems, 0);
  }

  function showToast(type, text) {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4500);
  }

  async function submitRental(e) {
    e.preventDefault();
    try {
      const data = await api("/api/rentals", {
        method: "POST",
        body: JSON.stringify({
          itemId: rentingItem.id,
          startDate,
          endDate,
        }),
      });
      showToast(
        "success",
        `Booking confirmed — total ${data.totalPrice} TND, status ${data.status}.`
      );
      setRentingItem(null);
      setStartDate("");
      setEndDate("");
    } catch (err) {
      showToast("error", err.message);
    }
  }

  const hasFilters = q || city || categoryId || maxPrice;

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="mb-10 pb-8 border-b border-neutral-200">
        <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight">
          Catalog
        </h1>
        <p className="text-neutral-600 mt-2 max-w-2xl">
          Browse {items.length} {items.length > 1 ? "items" : "item"} available
          for rent across Tunisia. Filter by city, category, and price.
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-md shadow-lg border max-w-sm fade-in text-sm ${
            toast.type === "success"
              ? "bg-white border-emerald-200 text-emerald-900"
              : "bg-white border-red-200 text-red-900"
          }`}
        >
          <div className="flex items-start gap-3">
            <span
              className={`w-1 h-full rounded-full ${
                toast.type === "success" ? "bg-emerald-500" : "bg-red-500"
              }`}
              style={{ minHeight: "20px" }}
            />
            <span>{toast.text}</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
          <input
            type="text"
            placeholder="Search items..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadItems()}
            className="md:col-span-4 bg-white border border-neutral-300 rounded-md px-3 py-2 text-sm placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition"
          />
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="md:col-span-3 bg-white border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition"
          >
            <option value="">All cities</option>
            {TUNISIAN_CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="md:col-span-2 bg-white border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition"
          >
            <option value="">Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            step="0.01"
            placeholder="Max TND/day"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="md:col-span-2 bg-white border border-neutral-300 rounded-md px-3 py-2 text-sm placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition"
          />
          <button
            onClick={loadItems}
            className="md:col-span-1 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium py-2 rounded-md transition"
          >
            Search
          </button>
        </div>
        {hasFilters && (
          <button
            onClick={resetFilters}
            className="mt-2 text-xs text-neutral-500 hover:text-neutral-900 transition"
          >
            Clear filters
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-neutral-200 p-5">
              <div className="skeleton h-5 w-2/3 rounded mb-3"></div>
              <div className="skeleton h-4 w-full rounded mb-2"></div>
              <div className="skeleton h-4 w-1/2 rounded"></div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center">
          <h3 className="text-base font-semibold text-neutral-900 mb-1">
            No results
          </h3>
          <p className="text-sm text-neutral-600">
            Try changing or clearing your filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, idx) => (
            <article
              key={item.id}
              className="bg-white border border-neutral-200 rounded-lg p-5 hover:border-neutral-300 transition group fade-in"
              style={{ animationDelay: `${Math.min(idx * 30, 200)}ms` }}
            >
              <div className="flex items-start justify-between gap-3 mb-1">
                <h3 className="font-semibold text-neutral-900 leading-tight">
                  {item.title}
                </h3>
                {item.available ? (
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded shrink-0">
                    Available
                  </span>
                ) : (
                  <span className="text-xs font-medium text-neutral-600 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded shrink-0">
                    Unavailable
                  </span>
                )}
              </div>

              <p className="text-sm text-neutral-600 mb-4 line-clamp-2 min-h-[2.5em]">
                {item.description || "—"}
              </p>

              <div className="space-y-1.5 mb-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Category</span>
                  <span className="text-neutral-900">{item.categoryName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Location</span>
                  <span className="text-neutral-900">{item.city}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Owner</span>
                  <span className="text-neutral-900">{item.ownerName}</span>
                </div>
              </div>

              <div className="flex items-end justify-between pt-4 border-t border-neutral-100">
                <div>
                  <p className="text-xs text-neutral-500">Per day</p>
                  <p className="text-xl font-semibold text-neutral-900 tabular">
                    {item.dailyPrice} <span className="text-sm font-normal text-neutral-500">TND</span>
                  </p>
                </div>
                {isLoggedIn() && item.available ? (
                  <button
                    onClick={() => setRentingItem(item)}
                    className="bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium px-4 py-2 rounded-md transition"
                  >
                    Rent
                  </button>
                ) : !isLoggedIn() ? (
                  <a
                    href="/login"
                    className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
                  >
                    Sign in →
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Rent modal */}
      {rentingItem && (
        <div
          className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 fade-in"
          onClick={() => setRentingItem(null)}
        >
          <div
            className="bg-white rounded-lg max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-neutral-200">
              <h3 className="font-semibold text-neutral-900">
                Rent “{rentingItem.title}”
              </h3>
              <p className="text-sm text-neutral-600 mt-1">
                {rentingItem.city} · {rentingItem.dailyPrice} TND/day
              </p>
            </div>
            <form onSubmit={submitRental} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Start date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  End date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                  required
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRentingItem(null)}
                  className="flex-1 border border-neutral-300 hover:bg-neutral-50 text-neutral-900 text-sm font-medium py-2 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium py-2 rounded-md"
                >
                  Confirm booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
