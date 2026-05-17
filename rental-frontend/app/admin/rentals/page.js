"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, hasRole, isLoggedIn } from "@/lib/api";

const STATUS_META = {
  PENDING:   { bg: "bg-amber-50 text-amber-800 border-amber-200",   label: "Pending"   },
  CONFIRMED: { bg: "bg-blue-50 text-blue-800 border-blue-200",      label: "Confirmed" },
  ACTIVE:    { bg: "bg-violet-50 text-violet-800 border-violet-200",label: "Active"    },
  COMPLETED: { bg: "bg-emerald-50 text-emerald-800 border-emerald-200", label: "Completed" },
  CANCELLED: { bg: "bg-neutral-100 text-neutral-700 border-neutral-200", label: "Cancelled" },
};

const STATUSES = ["", "PENDING", "CONFIRMED", "ACTIVE", "COMPLETED", "CANCELLED"];

export default function AdminRentalsPage() {
  const router = useRouter();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [authorized, setAuthorized] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }
    if (!hasRole("ADMIN")) {
      setError("Access denied. ADMIN role required.");
      setLoading(false);
      return;
    }
    setAuthorized(true);
  }, []);

  useEffect(() => {
    if (authorized) load();
  }, [authorized, statusFilter]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const url = statusFilter
        ? `/api/rentals?status=${statusFilter}`
        : "/api/rentals";
      const data = await api(url);
      setRentals(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function showToast(type, text) {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  }

  async function action(id, op) {
    try {
      await api(`/api/rentals/${id}/${op}`, { method: "PATCH" });
      showToast("success", `Rental ${op}d successfully.`);
      await load();
    } catch (err) {
      showToast("error", err.message);
    }
  }

  // Compteurs pour les badges de statut
  const [counts, setCounts] = useState({});
  useEffect(() => {
    if (!authorized) return;
    (async () => {
      try {
        const all = await api("/api/rentals");
        const c = { ALL: all.length };
        for (const r of all) c[r.status] = (c[r.status] || 0) + 1;
        setCounts(c);
      } catch (e) {
        // silent
      }
    })();
  }, [authorized, rentals.length]);

  if (!authorized && error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="mb-8 pb-8 border-b border-neutral-200">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Admin
              </span>
              <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
              <span className="text-xs text-neutral-500">Bookings management</span>
            </div>
            <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight">
              All rentals
            </h1>
            <p className="text-neutral-600 mt-2">
              Review and process every booking on the platform.
            </p>
          </div>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex gap-2 flex-wrap mb-6">
        {STATUSES.map((s) => {
          const active = statusFilter === s;
          const label = s || "All";
          const count = s ? counts[s] : counts.ALL;
          return (
            <button
              key={s || "ALL"}
              onClick={() => setStatusFilter(s)}
              className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border transition ${
                active
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white text-neutral-700 border-neutral-300 hover:border-neutral-400"
              }`}
            >
              <span>{label}</span>
              {typeof count === "number" && (
                <span
                  className={`text-xs tabular px-1.5 py-0.5 rounded ${
                    active ? "bg-white/20" : "bg-neutral-100"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
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
          {toast.text}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-neutral-200 rounded-lg p-5">
              <div className="skeleton h-4 w-1/3 rounded mb-2"></div>
              <div className="skeleton h-4 w-full rounded"></div>
            </div>
          ))}
        </div>
      ) : rentals.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center">
          <h3 className="text-base font-semibold text-neutral-900 mb-1">
            No bookings in this category
          </h3>
          <p className="text-sm text-neutral-600">
            Switch filter to see other statuses.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left font-medium text-neutral-700 px-4 py-3">ID</th>
                <th className="text-left font-medium text-neutral-700 px-4 py-3">Item</th>
                <th className="text-left font-medium text-neutral-700 px-4 py-3">Renter</th>
                <th className="text-left font-medium text-neutral-700 px-4 py-3">Owner</th>
                <th className="text-left font-medium text-neutral-700 px-4 py-3">Period</th>
                <th className="text-right font-medium text-neutral-700 px-4 py-3">Total</th>
                <th className="text-left font-medium text-neutral-700 px-4 py-3">Status</th>
                <th className="text-right font-medium text-neutral-700 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rentals.map((r, idx) => {
                const meta = STATUS_META[r.status] || {};
                return (
                  <tr
                    key={r.id}
                    className={`border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition ${
                      idx % 2 === 1 ? "bg-neutral-50/30" : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-neutral-500 tabular">#{r.id}</td>
                    <td className="px-4 py-3 font-medium text-neutral-900">
                      {r.itemTitle}
                    </td>
                    <td className="px-4 py-3 text-neutral-700">{r.renterName}</td>
                    <td className="px-4 py-3 text-neutral-700">{r.ownerName}</td>
                    <td className="px-4 py-3 text-neutral-700 tabular text-xs">
                      <div>{r.startDate}</div>
                      <div className="text-neutral-400">to {r.endDate}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-neutral-900 tabular">
                      {r.totalPrice} <span className="text-xs font-normal text-neutral-500">TND</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded border ${meta.bg}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        {r.status === "PENDING" && (
                          <button
                            onClick={() => action(r.id, "confirm")}
                            className="text-xs font-medium bg-neutral-900 hover:bg-neutral-800 text-white px-2.5 py-1 rounded transition"
                          >
                            Confirm
                          </button>
                        )}
                        {(r.status === "CONFIRMED" || r.status === "ACTIVE") && (
                          <button
                            onClick={() => action(r.id, "complete")}
                            className="text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded transition"
                          >
                            Complete
                          </button>
                        )}
                        {(r.status === "PENDING" || r.status === "CONFIRMED") && (
                          <button
                            onClick={() => action(r.id, "cancel")}
                            className="text-xs font-medium text-neutral-700 hover:text-neutral-900 border border-neutral-300 hover:border-neutral-400 px-2.5 py-1 rounded transition"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
