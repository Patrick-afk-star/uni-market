"use client";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { getApiUrl } from "@/lib/api";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Search,
  MapPin,
  Loader2,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Save,
  ChevronDown,
} from "lucide-react";

interface Location {
  id: string | number;
  name: string;
  province?: string;
  district?: string;
  type?: string; // e.g. "campus", "city", "district"
  university?: string; // optional association
  is_active?: boolean;
}

interface FormState {
  name: string;
  province: string;
  district: string;
  type: string;
  university: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  province: "",
  district: "",
  type: "campus",
  university: "",
};

const LOCATION_TYPES = ["campus", "city", "district", "neighborhood", "other"];

export default function AdminLocationsPage() {
  const { accessToken } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Location | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchLocations = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(getApiUrl("/api/v1/admin/locations/"), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setLocations(Array.isArray(data) ? data : data.results ?? []);
    } catch (e: any) {
      setError(e.message ?? "Failed to load locations.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (loc: Location) => {
    setEditing(loc);
    setForm({
      name: loc.name,
      province: loc.province ?? "",
      district: loc.district ?? "",
      type: loc.type ?? "campus",
      university: loc.university ?? "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!accessToken || !form.name.trim()) return;
    setSaving(true);
    try {
      const url = editing
        ? getApiUrl(`/api/v1/admin/locations/${editing.id}/`)
        : getApiUrl("/api/v1/admin/locations/");
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      showToast(editing ? "Location updated." : "Location created.");
      setShowModal(false);
      fetchLocations();
    } catch {
      showToast("Save failed. Please try again.", "err");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (loc: Location) => {
    if (!accessToken) return;
    if (!window.confirm(`Delete "${loc.name}"?`)) return;
    setDeleting(loc.id);
    try {
      const res = await fetch(
        getApiUrl(`/api/v1/admin/locations/${loc.id}/`),
        { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      showToast("Location deleted.");
      fetchLocations();
    } catch {
      showToast("Delete failed.", "err");
    } finally {
      setDeleting(null);
    }
  };

  const allTypes = ["all", ...Array.from(new Set(locations.map((l) => l.type ?? "other")))];

  const filtered = locations.filter((l) => {
    const matchSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      (l.province ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (l.district ?? "").toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || (l.type ?? "other") === typeFilter;
    return matchSearch && matchType;
  });

  const TYPE_BADGE: Record<string, string> = {
    campus: "bg-[#bb740a]/10 border-[#bb740a]/20 text-[#bb740a]",
    city: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
    district: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    neighborhood: "bg-pink-500/10 border-pink-500/20 text-pink-400",
    other: "bg-white/[0.05] border-white/[0.08] text-muted-foreground",
  };

  return (
    <div className="p-6 space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[9999] flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl border animate-in slide-in-from-top-2 ${
            toast.type === "ok"
              ? "bg-[#0a0a0a] border-green-500/30 text-green-400"
              : "bg-[#0a0a0a] border-red-500/30 text-red-400"
          }`}
        >
          {toast.type === "ok" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Locations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage campus and pickup locations on the platform.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchLocations}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#bb740a] text-white text-sm font-semibold hover:bg-[#bb740a]/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Location
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 flex-wrap">
          {allTypes.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border capitalize ${
                typeFilter === t
                  ? "bg-[#bb740a] border-[#bb740a] text-white"
                  : "bg-white/[0.03] border-white/[0.06] text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search locations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#bb740a]/40 transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/[0.06] overflow-hidden bg-[#0d0d0d]">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[#bb740a]" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <MapPin className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No locations found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-xs text-muted-foreground uppercase tracking-wider">
                <th className="px-5 py-3.5 text-left font-semibold">Name</th>
                <th className="px-5 py-3.5 text-left font-semibold hidden md:table-cell">Province / District</th>
                <th className="px-5 py-3.5 text-left font-semibold hidden lg:table-cell">University</th>
                <th className="px-5 py-3.5 text-center font-semibold">Type</th>
                <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map((loc) => (
                <tr key={loc.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#bb740a]/10 border border-[#bb740a]/20 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-[#bb740a]" />
                      </div>
                      <span className="font-semibold text-foreground">{loc.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {[loc.province, loc.district].filter(Boolean).join(" › ") || "—"}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <span className="text-sm text-muted-foreground">{loc.university || "—"}</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                        TYPE_BADGE[loc.type ?? "other"] ?? TYPE_BADGE.other
                      }`}
                    >
                      {loc.type ?? "other"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(loc)}
                        className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-muted-foreground hover:text-[#bb740a] hover:border-[#bb740a]/30 transition-all"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(loc)}
                        disabled={deleting === loc.id}
                        className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-muted-foreground hover:text-red-400 hover:border-red-500/30 transition-all disabled:opacity-40"
                      >
                        {deleting === loc.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#0d0d0d] border border-white/[0.08] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-foreground text-lg">
                {editing ? "Edit Location" : "Add Location"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Name *</label>
                <input
                  type="text"
                  placeholder="e.g. UR Gikondo Campus"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#bb740a]/40 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Type</label>
                <div className="relative">
                  <select
                    value={form.type}
                    onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                    className="w-full px-4 py-2.5 pr-9 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-foreground outline-none appearance-none focus:border-[#bb740a]/40 transition-colors cursor-pointer"
                  >
                    {LOCATION_TYPES.map((t) => (
                      <option key={t} value={t} style={{ background: "#0d0d0d" }}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              {[
                { label: "Province", key: "province", placeholder: "e.g. Kigali City" },
                { label: "District", key: "district", placeholder: "e.g. Kicukiro" },
                { label: "University (optional)", key: "university", placeholder: "e.g. University of Rwanda" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">{label}</label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={form[key as keyof FormState]}
                    onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#bb740a]/40 transition-colors"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-muted-foreground hover:text-foreground">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#bb740a] text-white text-sm font-semibold hover:bg-[#bb740a]/90 disabled:opacity-40"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
