"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, isLoggedIn } from "@/lib/api";

const STATUS_META = {
  PENDING:   { bg: "bg-amber-50 text-amber-800 border-amber-200",   label: "Pending"   },
  CONFIRMED: { bg: "bg-blue-50 text-blue-800 border-blue-200",      label: "Confirmed" },
  ACTIVE:    { bg: "bg-violet-50 text-violet-800 border-violet-200",label: "Active"    },
  COMPLETED: { bg: "bg-emerald-50 text-emerald-800 border-emerald-200", label: "Completed" },
  CANCELLED: { bg: "bg-neutral-100 text-neutral-700 border-neutral-200", label: "Cancelled" },
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
    const rating = prompt("Rating (1-5)?");
    if (!rating) return;
    const comment = prompt("Comment?") || "";
    try {
      await api("/api/reviews", {
        method: "POST",
        body: JSON.stringify({
          rentalId: id,
          rating: parseInt(rating, 10),
          comment,
        }),
      });
      alert("Review submitted.");
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-neutral-200 p-5">
            <div className="skeleton h-5 w-1/3 rounded mb-3"></div>
            <div className="skeleton h-4 w-full rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="mb-10 pb-8 border-b border-neutral-200">
        <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight">
          My rentals
        </h1>
        <p className="text-neutral-600 mt-2">
          {rentals.length} {rentals.length > 1 ? "bookings" : "booking"} on your account.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}

      {rentals.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center">
          <h3 className="text-base font-semibold text-neutral-900 mb-1">
            No rentals yet
          </h3>
          <p className="text-sm text-neutral-600 mb-4">
            Browse the catalog to make your first booking.
          </p>
          <a
            href="/items"
            className="inline-block bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium px-4 py-2 rounded-md"
          >
            Go to catalog
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {rentals.map((r, idx) => {
            const meta = STATUS_META[r.status] || {};
            const days = Math.max(
              1,
              Math.round((new Date(r.endDate) - new Date(r.startDate)) / 86400000) + 1
            );
            return (
              <div
                key={r.id}
                className="bg-white border border-neutral-200 rounded-lg p-5 fade-in"
                style={{ animationDelay: `${Math.min(idx * 30, 200)}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-neutral-900">{r.itemTitle}</h3>
                    <p className="text-sm text-neutral-600 mt-0.5">
                      Owned by {r.ownerName}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded border ${meta.bg}`}>
                    {meta.label}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-4 py-4 border-t border-neutral-100 text-sm">
                  <div>
                    <p className="text-xs text-neutral-500 mb-0.5">Start</p>
                    <p className="text-neutral-900 tabular">{r.startDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-0.5">End</p>
                    <p className="text-neutral-900 tabular">{r.endDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-0.5">Duration</p>
                    <p className="text-neutral-900 tabular">{days}d</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-0.5">Total</p>
                    <p className="font-semibold text-neutral-900 tabular">{r.totalPrice} TND</p>
                  </div>
                </div>

                {(r.status === "PENDING" || r.status === "CONFIRMED" || r.status === "COMPLETED") && (
                  <div className="flex gap-2 pt-4 border-t border-neutral-100">
                    {(r.status === "PENDING" || r.status === "CONFIRMED") && (
                      <button
                        onClick={() => action(r.id, "cancel")}
                        className="text-sm font-medium text-neutral-700 hover:text-neutral-900 border border-neutral-300 hover:border-neutral-400 px-3 py-1.5 rounded-md transition"
                      >
                        Cancel booking
                      </button>
                    )}
                    {r.status === "COMPLETED" && (
                      <button
                        onClick={() => review(r.id)}
                        className="text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 px-3 py-1.5 rounded-md transition"
                      >
                        Leave a review
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
