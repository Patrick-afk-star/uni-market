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
  Tag,
  Loader2,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Save,
} from "lucide-react";

interface Category {
  id: string | number;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  listing_count?: number;
}

interface FormState {
  name: string;
  slug: string;
  description: string;
  icon: string;
}

const EMPTY_FORM: FormState = { name: "", slug: "", description: "", icon: "" };

const toSlug = (s: string) =>
  s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

export default function AdminCategoriesPage() {
  const { accessToken } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCategories = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(getApiUrl("/api/v1/categories/"), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : data.results ?? []);
    } catch (e: any) {
      setError(e.message ?? "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({
      name: c.name,
      slug: c.slug ?? toSlug(c.name),
      description: c.description ?? "",
      icon: c.icon ?? "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!accessToken || !form.name.trim()) return;
    setSaving(true);
    try {
      const url = editing
        ? getApiUrl(`/api/v1/categories/${editing.id}/`)
        : getApiUrl("/api/v1/categories/");
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...form, slug: form.slug || toSlug(form.name) }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      showToast(editing ? "Category updated." : "Category created.");
      setShowModal(false);
      fetchCategories();
    } catch {
      showToast("Save failed. Please try again.", "err");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c: Category) => {
    if (!accessToken) return;
    if (!window.confirm(`Delete "${c.name}"?`)) return;
    setDeleting(c.id);
    try {
      const res = await fetch(
        getApiUrl(`/api/v1/categories/${c.id}/`),
        { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      showToast("Category deleted.");
      fetchCategories();
    } catch {
      showToast("Delete failed.", "err");
    } finally {
      setDeleting(null);
    }
  };

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // Pastel badge colors cycling
  const BADGE_COLORS = [
    "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
    "bg-pink-500/10 border-pink-500/20 text-pink-400",
    "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    "bg-amber-500/10 border-amber-500/20 text-amber-400",
    "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
    "bg-violet-500/10 border-violet-500/20 text-violet-400",
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[9999] flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl border animate-in slide-in-from-top-2 ${toast.type === "ok"
            ? "bg-card border-green-500/30 text-green-500"
            : "bg-card border-red-500/30 text-red-500"
            }`}
        >
          {toast.type === "ok" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage listing categories across the marketplace.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchCategories}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={openCreate}
            className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#bb740a] text-white text-sm font-semibold hover:bg-[#bb740a]/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search categories…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#bb740a]/40 transition-colors"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border overflow-hidden bg-card">
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
            <Tag className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No categories found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="px-5 py-3.5 text-left font-semibold">Category</th>
                  <th className="px-5 py-3.5 text-left font-semibold hidden lg:table-cell">Description</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((c, i) => {
                  const badgeCls = BADGE_COLORS[i % BADGE_COLORS.length];
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Name */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 text-base ${badgeCls}`}>
                            {c.icon || <Tag className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">
                              {c.name}
                            </p>
                            {c.listing_count !== undefined && (
                              <span className="text-xs text-muted-foreground font-medium">
                                {c.listing_count} listings
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="px-5 py-4 hidden lg:table-cell text-muted-foreground text-sm">
                        {c.description ? (
                          <span className="truncate max-w-[250px] inline-block align-bottom">{c.description}</span>
                        ) : (
                          <span>—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="relative flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(c)}
                            className="p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-muted-foreground hover:text-[#bb740a] hover:bg-white/[0.1] transition-all"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(c)}
                            disabled={deleting === c.id}
                            className="p-1.5 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-red-400 hover:border-red-500/30 transition-all disabled:opacity-40"
                          >
                            {deleting === c.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-foreground text-lg">
                {editing ? "Edit Category" : "Add Category"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { label: "Name *", key: "name", placeholder: "e.g. Electronics" },
                { label: "Icon (emoji or text)", key: "icon", placeholder: "e.g. 💻" },
                { label: "Description", key: "description", placeholder: "Short description…" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    {label}
                  </label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={form[key as keyof FormState]}
                    onChange={(e) => {
                      const val = e.target.value;
                      setForm((prev) => ({
                        ...prev,
                        [key]: val,
                        ...(key === "name" && !prev.slug
                          ? { slug: toSlug(val) }
                          : {}),
                      }));
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#bb740a]/40 transition-colors"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-secondary border border-border text-sm text-muted-foreground hover:text-foreground">
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
