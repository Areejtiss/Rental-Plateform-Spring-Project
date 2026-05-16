"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, isLoggedIn } from "@/lib/api";

const STATUS_META = {
  PENDING: {
    bg: "bg-amber-100 text-amber-800 border-amber-300",
    icon: "⏳",
    label: "En attente",
  },
  CONFIRMED: {
    bg: "bg-blue-100 text-blue-800 border-blue-300",
    icon: "✓",
    label: "Confirmée",
  },
  ACTIVE: {
    bg: "bg-indigo-100 text-indigo-800 border-indigo-300",
    icon: "🔄",
    label: "En cours",
  },
  COMPLETED: {
    bg: "bg-emerald-100 text-emerald-800 border-emerald-300",
    icon: "✓✓",
    label: "Terminée",
  },
  CANCELLED: {
    bg: "bg-slate-200 text-slate-700 border-slate-300",
    icon: "✕",
    label: "Annulée",
  },
};

export default function MyRentalsPage() {
  const router = useRouter();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await api("/api/rentals/my");
      setRentals(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function action(id, op) {
    try {
      await api(`/api/rentals/${id}/${op}`, { method: "PATCH" });
      await load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function review(id) {
    const rating = prompt("Note (1 à 5) ?");
    if (!rating) return;
    const comment = prompt("Commentaire ?") || "";
    try {
      await api("/api/reviews", {
        method: "POST",
        body: JSON.stringify({
          rentalId: id,
          rating: parseInt(rating, 10),
          comment,
        }),
      });
      alert("✓ Avis publié !");
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow p-5">
            <div className="skeleton h-6 w-1/3 rounded mb-3"></div>
            <div className="skeleton h-4 w-full rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">📋 Mes locations</h1>
        <p className="text-slate-500 mt-1">
          {rentals.length} location{rentals.length > 1 ? "s" : ""} au total
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
      )}

      {rentals.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow">
          <div className="text-6xl mb-3">📭</div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">
            Aucune location pour l'instant
          </h3>
          <p className="text-slate-500 mb-4">
            Va dans la liste des items pour faire ta première location.
          </p>
          <a
            href="/items"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded-lg"
          >
            Parcourir les items →
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {rentals.map((r, idx) => {
            const meta = STATUS_META[r.status] || {};
            const days = Math.max(
              1,
              Math.round(
                (new Date(r.endDate) - new Date(r.startDate)) /
                  86400000
              ) + 1
            );
            return (
              <div
                key={r.id}
                className="bg-white rounded-xl shadow hover:shadow-md transition border border-slate-100 fade-in"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">
                        {r.itemTitle}
                      </h3>
                      <p className="text-sm text-slate-500">
                        Loué chez <strong>{r.ownerName}</strong>
                      </p>
                    </div>
                    <span
                      className={`text-xs font-bold px-3 py-1.5 rounded-full border ${meta.bg}`}
                    >
                      {meta.icon} {meta.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4 bg-slate-50 p-3 rounded-lg">
                    <div>
                      <p className="text-xs text-slate-500">Du</p>
                      <p className="text-sm font-semibold">{r.startDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Au</p>
                      <p className="text-sm font-semibold">{r.endDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Durée</p>
                      <p className="text-sm font-semibold">
                        {days} jour{days > 1 ? "s" : ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Total</p>
                      <p className="text-sm font-bold text-indigo-600">
                        {r.totalPrice} TND
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(r.status === "PENDING" ||
                      r.status === "CONFIRMED") && (
                      <button
                        onClick={() => action(r.id, "cancel")}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-1.5 rounded-lg text-sm"
                      >
                        ✕ Annuler
                      </button>
                    )}
                    {r.status === "COMPLETED" && (
                      <button
                        onClick={() => review(r.id)}
                        className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-medium px-4 py-1.5 rounded-lg text-sm shadow"
                      >
                        ⭐ Laisser un avis
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
