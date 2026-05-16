"use client";

import { useEffect, useState } from "react";
import { api, isLoggedIn } from "@/lib/api";
import { TUNISIAN_CITIES, categoryIcon } from "@/lib/constants";

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
    setTimeout(() => setToast(null), 4000);
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
        `Location créée ! Total : ${data.totalPrice} TND (statut ${data.status})`
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
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 md:p-12 text-white mb-8 shadow-xl">
        <h1 className="text-3xl md:text-5xl font-bold mb-3">
          Louez. Économisez. Partagez.
        </h1>
        <p className="text-indigo-100 text-lg max-w-2xl">
          La 1<sup>ère</sup> plateforme de location de matériel entre particuliers
          en Tunisie. {items.length} articles disponibles partout dans le pays.
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-xl border-l-4 max-w-md fade-in ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-500 text-emerald-800"
              : "bg-red-50 border-red-500 text-red-800"
          }`}
        >
          <p className="font-medium">
            {toast.type === "success" ? "✓ " : "✗ "} {toast.text}
          </p>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-md p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <span>🎯</span> Filtres
          </h2>
          {hasFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Réinitialiser
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="Recherche..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Toutes les villes</option>
            {TUNISIAN_CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Toutes catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {categoryIcon(c.name)} {c.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            step="0.01"
            placeholder="Prix max (TND/j)"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={loadItems}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg text-sm transition"
          >
            Appliquer
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
      )}

      {/* Grid items */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-5">
              <div className="skeleton h-6 w-2/3 rounded mb-3"></div>
              <div className="skeleton h-4 w-full rounded mb-2"></div>
              <div className="skeleton h-4 w-1/2 rounded"></div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow">
          <div className="text-6xl mb-3">🔍</div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">
            Aucun article trouvé
          </h3>
          <p className="text-slate-500">
            Essaie de modifier ou réinitialiser les filtres.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item, idx) => (
            <article
              key={item.id}
              className="bg-white rounded-xl shadow hover:shadow-xl transition-all duration-200 hover:-translate-y-1 overflow-hidden border border-slate-100 fade-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 p-8 text-center relative">
                <span className="text-6xl">{categoryIcon(item.categoryName)}</span>
                {item.available ? (
                  <span className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    Disponible
                  </span>
                ) : (
                  <span className="absolute top-3 right-3 bg-slate-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    Indispo
                  </span>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg text-slate-900 leading-tight">
                    {item.title}
                  </h3>
                </div>
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                  {item.description || "—"}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-1">
                    📍 {item.city}
                  </span>
                  <span className="flex items-center gap-1">
                    🏷️ {item.categoryName}
                  </span>
                </div>
                <div className="flex items-end justify-between pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-500">Par</p>
                    <p className="text-sm font-medium text-slate-700">
                      {item.ownerName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-indigo-600">
                      {item.dailyPrice}
                      <span className="text-xs text-slate-500 font-normal ml-1">
                        TND/j
                      </span>
                    </p>
                  </div>
                </div>
                {isLoggedIn() && item.available && (
                  <button
                    onClick={() => setRentingItem(item)}
                    className="mt-4 w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-2.5 rounded-lg text-sm transition shadow hover:shadow-md"
                  >
                    Louer maintenant
                  </button>
                )}
                {!isLoggedIn() && (
                  <a
                    href="/login"
                    className="mt-4 block text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Se connecter pour louer →
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal location */}
      {rentingItem && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 fade-in"
          onClick={() => setRentingItem(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-5">
              <span className="text-4xl">
                {categoryIcon(rentingItem.categoryName)}
              </span>
              <div>
                <h3 className="text-xl font-bold">{rentingItem.title}</h3>
                <p className="text-sm text-slate-500">
                  {rentingItem.city} · {rentingItem.dailyPrice} TND/jour
                </p>
              </div>
            </div>
            <form onSubmit={submitRental} className="space-y-3">
              <div>
                <label className="block text-sm font-semibold mb-1">Du</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Au</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRentingItem(null)}
                  className="flex-1 border border-slate-300 hover:bg-slate-50 py-2.5 rounded-lg font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-2.5 rounded-lg font-semibold shadow"
                >
                  Confirmer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
