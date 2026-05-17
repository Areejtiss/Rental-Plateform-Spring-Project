"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, hasRole, isLoggedIn } from "@/lib/api";

const STATUS_META = {
  PENDING:   { bg: "bg-amber-50 text-amber-800 border-amber-200",   label: "Pending"   },
  CONFIRMED: { bg: "bg-blue-50 text-blue-800 border-blue-200",      label: "Confirmed" },
  ACTIVE:    { bg: "bg-violet-50 text-violet-800 border-violet-200",label: "Active"    },
  COMPLETED: { bg: "bg-emerald-50 text-emerald-800 border-emerald-200", label: "Completed" },
  CANCELLED: { bg: "bg-neutral-100 text-neutral-700 border-neutral-200", label: "Cancelled" },
};

const ROLE_BADGE = {
  ROLE_ADMIN:  "bg-purple-50 text-purple-800 border-purple-200",
  ROLE_OWNER:  "bg-blue-50 text-blue-800 border-blue-200",
  ROLE_RENTER: "bg-emerald-50 text-emerald-800 border-emerald-200",
};

export default function ProfilePage() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [items, setItems] = useState([]);
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
      const meData = await api("/api/users/me");
      setMe(meData);

      // Items propres (only relevant for OWNER/ADMIN)
      if (hasRole("OWNER") || hasRole("ADMIN")) {
        try {
          const itemsData = await api("/api/items/mine");
          setItems(itemsData || []);
        } catch (e) { setItems([]); }
      }

      const rentalsData = await api("/api/rentals/my");
      setRentals(rentalsData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <div className="skeleton h-6 w-1/3 rounded mb-2"></div>
          <div className="skeleton h-4 w-1/2 rounded"></div>
        </div>
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white border border-neutral-200 rounded-lg p-6">
            <div className="skeleton h-5 w-1/4 rounded mb-3"></div>
            <div className="skeleton h-4 w-full rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-md text-sm">
        {error}
      </div>
    );
  }

  if (!me) return null;

  const stats = {
    totalItems: items.length,
    totalRentals: rentals.length,
    activeRentals: rentals.filter(r =>
      r.status === "PENDING" || r.status === "CONFIRMED" || r.status === "ACTIVE"
    ).length,
    completedRentals: rentals.filter(r => r.status === "COMPLETED").length,
  };

  const totalSpent = rentals
    .filter(r => r.status === "COMPLETED" || r.status === "CONFIRMED" || r.status === "ACTIVE")
    .reduce((sum, r) => sum + parseFloat(r.totalPrice || 0), 0);

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="mb-8 pb-8 border-b border-neutral-200">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 bg-neutral-900 text-white rounded-full flex items-center justify-center text-2xl font-semibold shrink-0">
            {me.firstName?.[0]?.toUpperCase()}{me.lastName?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">
              {me.firstName} {me.lastName}
            </h1>
            <p className="text-neutral-600 text-sm mt-1">{me.email}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {me.roles?.map((r) => (
                <span
                  key={r}
                  className={`text-xs font-medium px-2 py-0.5 rounded border ${ROLE_BADGE[r] || "bg-neutral-100 text-neutral-700 border-neutral-200"}`}
                >
                  {r.replace("ROLE_", "")}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard label="Listed items" value={stats.totalItems} hidden={!hasRole("OWNER") && !hasRole("ADMIN")} />
        <StatCard label="Bookings" value={stats.totalRentals} />
        <StatCard label="Active" value={stats.activeRentals} />
        <StatCard label="Total spent" value={`${totalSpent.toFixed(2)} TND`} />
      </div>

      {/* Personal info */}
      <section className="bg-white border border-neutral-200 rounded-lg p-6 mb-8">
        <h2 className="text-sm font-semibold text-neutral-900 mb-4 pb-2 border-b border-neutral-100">
          Personal information
        </h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <InfoRow label="First name" value={me.firstName} />
          <InfoRow label="Last name" value={me.lastName} />
          <InfoRow label="Phone" value={me.phone || "—"} />
          <InfoRow label="City" value={me.city || "—"} />
          <InfoRow label="Member since" value={me.createdAt ? new Date(me.createdAt).toLocaleDateString("fr-FR") : "—"} />
          <InfoRow label="User ID" value={`#${me.id}`} />
        </dl>
      </section>

      {/* My listed items */}
      {(hasRole("OWNER") || hasRole("ADMIN")) && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">
              My listed items
              <span className="text-sm font-normal text-neutral-500 ml-2 tabular">
                ({items.length})
              </span>
            </h2>
            <Link
              href="/create-item"
              className="text-sm font-medium text-neutral-700 hover:text-neutral-900 border border-neutral-300 hover:border-neutral-400 px-3 py-1.5 rounded-md transition"
            >
              + New item
            </Link>
          </div>
          {items.length === 0 ? (
            <div className="bg-white border border-dashed border-neutral-300 rounded-lg p-8 text-center">
              <p className="text-sm text-neutral-600">
                You haven't listed any items yet.
              </p>
              <Link
                href="/create-item"
                className="inline-block mt-3 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium px-4 py-2 rounded-md"
              >
                List your first item
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((item) => (
                <div key={item.id} className="bg-white border border-neutral-200 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-medium text-neutral-900 leading-tight">
                      {item.title}
                    </h3>
                    {item.available ? (
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded shrink-0">
                        Available
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-neutral-600 bg-neutral-100 border border-neutral-200 px-1.5 py-0.5 rounded shrink-0">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-neutral-500 mb-3">
                    {item.city} · {item.categoryName}
                  </div>
                  <div className="text-lg font-semibold text-neutral-900 tabular">
                    {item.dailyPrice} <span className="text-xs font-normal text-neutral-500">TND/day</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Rental history */}
      <section>
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Rental history
          <span className="text-sm font-normal text-neutral-500 ml-2 tabular">
            ({rentals.length})
          </span>
        </h2>
        {rentals.length === 0 ? (
          <div className="bg-white border border-dashed border-neutral-300 rounded-lg p-8 text-center">
            <p className="text-sm text-neutral-600 mb-3">
              No rentals on record yet.
            </p>
            <Link
              href="/items"
              className="inline-block bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium px-4 py-2 rounded-md"
            >
              Browse catalog
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left font-medium text-neutral-700 px-4 py-3">Item</th>
                  <th className="text-left font-medium text-neutral-700 px-4 py-3">Period</th>
                  <th className="text-right font-medium text-neutral-700 px-4 py-3">Total</th>
                  <th className="text-left font-medium text-neutral-700 px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {rentals.map((r) => {
                  const meta = STATUS_META[r.status] || {};
                  return (
                    <tr key={r.id} className="border-b border-neutral-100 last:border-0">
                      <td className="px-4 py-3">
                        <div className="font-medium text-neutral-900">{r.itemTitle}</div>
                        <div className="text-xs text-neutral-500">From {r.ownerName}</div>
                      </td>
                      <td className="px-4 py-3 text-neutral-700 text-xs tabular">
                        <div>{r.startDate}</div>
                        <div className="text-neutral-400">to {r.endDate}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular">
                        {r.totalPrice} <span className="text-xs font-normal text-neutral-500">TND</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded border ${meta.bg}`}>
                          {meta.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, hidden }) {
  if (hidden) return null;
  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-4">
      <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-xl font-semibold text-neutral-900 tabular">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-neutral-500 mb-0.5">{label}</dt>
      <dd className="text-neutral-900">{value}</dd>
    </div>
  );
}
