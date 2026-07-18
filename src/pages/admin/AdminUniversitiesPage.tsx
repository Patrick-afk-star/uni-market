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
  Building2,
  Loader2,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Save,
} from "lucide-react";

interface University {
  id: string;
  name: string;
  abreviation: string;
  location?: string;
  website?: string;
  is_active?: boolean;
}

interface FormState {
  name: string;
  abreviation: string;
  location: string;
  website: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  abreviation: "",
  location: "",
  website: "",
};

export default function AdminUniversitiesPage() {
  const { accessToken } = useAuth();
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<University | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUniversities = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(getApiUrl("/api/v1/universities"), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUniversities(Array.isArray(data) ? data : data.results ?? []);
    } catch (e: any) {
      setError(e.message ?? "Failed to load universities.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchUniversities();
  }, [fetchUniversities]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (u: University) => {
    setEditing(u);
    setForm({
      name: u.name,
      abreviation: u.abreviation,
      location: u.location ?? "",
      website: u.website ?? "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!accessToken || !form.name.trim() || !form.abreviation.trim()) return;
    setSaving(true);
    try {
      const url = editing
        ? getApiUrl(`/api/v1/universities/${editing.id}/`)
        : getApiUrl("/api/v1/universities/");
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      showToast(editing ? "University updated." : "University created.");
      setShowModal(false);
      fetchUniversities();
    } catch {
      showToast("Save failed. Please try again.", "err");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u: University) => {
    if (!accessToken) return;
    if (!window.confirm(`Delete "${u.name}"? This cannot be undone.`)) return;
    setDeleting(u.id);
    try {
      const res = await fetch(
        getApiUrl(`/api/v1/universities/${u.id}/`),
        { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      showToast("University deleted.");
      fetchUniversities();
    } catch {
      showToast("Delete failed.", "err");
    } finally {
      setDeleting(null);
    }
  };

  const filtered = universities.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.abreviation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[9999] flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl border animate-in slide-in-from-top-2 ${toast.type === "ok"
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
          <h1 className="text-2xl font-bold text-foreground">Universities</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage universities available on the platform.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchUniversities}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#bb740a] text-white text-sm font-semibold hover:bg-[#bb740a]/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add University
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search universities…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#bb740a]/40 transition-colors"
        />
      </div>

      {/* Grid */}
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
          <Building2 className="w-8 h-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No universities found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((u) => (
            <div
              key={u.id}
              className="rounded-2xl border border-white/[0.06] bg-[#0d0d0d] p-5 flex flex-col gap-3 hover:border-white/[0.1] transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#bb740a]/10 border border-[#bb740a]/20 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-[#bb740a]" />
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => openEdit(u)}
                    className="p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-muted-foreground hover:text-[#bb740a] hover:border-[#bb740a]/30 transition-all"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(u)}
                    disabled={deleting === u.id}
                    className="p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-muted-foreground hover:text-red-400 hover:border-red-500/30 transition-all disabled:opacity-40"
                  >
                    {deleting === u.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{u.name}</h3>
                <span className="text-xs text-[#bb740a] font-bold">{u.abreviation}</span>
                {u.location && (
                  <p className="text-xs text-muted-foreground mt-1">{u.location}</p>
                )}
                {u.website && (
                  <a
                    href={u.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-400 hover:underline mt-0.5 block truncate"
                  >
                    {u.website}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#0d0d0d] border border-white/[0.08] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-foreground text-lg">
                {editing ? "Edit University" : "Add University"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { label: "Name *", key: "name", placeholder: "e.g. University of Rwanda" },
                { label: "Abbreviation *", key: "abreviation", placeholder: "e.g. UR" },
                { label: "Location", key: "location", placeholder: "e.g. Kigali, Rwanda" },
                { label: "Website", key: "website", placeholder: "https://..." },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    {label}
                  </label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={form[key as keyof FormState]}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#bb740a]/40 transition-colors"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim() || !form.abreviation.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#bb740a] text-white text-sm font-semibold hover:bg-[#bb740a]/90 transition-colors disabled:opacity-40"
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
