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
        text: "Seuls les OWNER et ADMIN peuvent créer un item.",
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
        text: `✓ Item "${data.title}" créé (id=${data.id}). Redirection vers /items dans 2s...`,
      });
      setTimeout(() => router.push("/items"), 2000);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          ✨ Mettre un article en location
        </h1>
        <p className="text-slate-500 mt-1">
          Remplis les infos. Tu pourras le modifier plus tard.
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg border-l-4 ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-500 text-emerald-800"
              : "bg-red-50 border-red-500 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {authorized && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg p-8 space-y-6"
        >
          <section>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 pb-2 border-b">
              Informations générales
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Titre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Perceuse Bosch 18V"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="État, accessoires inclus, particularités..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Catégorie <span className="text-red-500">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">-- Choisir une catégorie --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 pb-2 border-b">
              Tarif & localisation
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Prix <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={dailyPrice}
                    onChange={(e) => setDailyPrice(e.target.value)}
                    placeholder="10.00"
                    className="w-full border border-slate-200 rounded-lg pl-3 pr-16 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                    TND/j
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Ville <span className="text-red-500">*</span>
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">-- Choisir --</option>
                  {TUNISIAN_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 border border-slate-300 hover:bg-slate-50 font-medium py-3 rounded-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition flex-1"
            >
              {loading ? "Publication..." : "Publier l'article"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
