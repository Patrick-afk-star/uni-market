"use client";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { getApiUrl } from "@/lib/api";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  User,

  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  ChevronDown,
  MoreVertical,
} from "lucide-react";

interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name?: string;
  is_active?: boolean;
  date_joined?: string;
}

type StatusFilter = "all" | "active" | "inactive" | "staff";

export default function AdminUsersPage() {
  const { accessToken } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    const closeMenu = () => setOpenMenuId(null);
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const PAGE_SIZE = 20;

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(PAGE_SIZE),
      });
      if (debouncedSearch.trim()) {
        params.set("search", debouncedSearch.trim());
      }
      if (statusFilter !== "all") params.set("filter", statusFilter);

      const res = await fetch(
        getApiUrl(`/api/v1/profiles/?${params.toString()}`),
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Support both paginated {results, count} and plain array
      if (Array.isArray(data)) {
        setUsers(data);
        setTotalPages(1);
      } else {
        setUsers(data.results ?? []);
        setTotalPages(Math.ceil((data.count ?? 0) / PAGE_SIZE) || 1);
      }
    } catch (e: any) {
      setError(e.message ?? "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, page, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounce search — reset page when query changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);



  const toggleActive = async (u: AdminUser) => {
    if (!accessToken) return;
    setActionLoading(u.id);
    try {
      const isDeactivating = u.is_active;
      const endpoint = isDeactivating
        ? "/api/v1/auth/account/deactivate"
        : `/api/v1/profiles/${u.id}/toggle-active/`;
      const method = isDeactivating ? "POST" : "PATCH";
      const body = isDeactivating ? { user_id: u.user_id } : { is_active: true };

      const res = await fetch(
        getApiUrl(endpoint),
        {
          method,
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      showToast(`${u.first_name} account ${!u.is_active ? "activated" : "deactivated"}.`);
      fetchUsers();
    } catch {
      showToast("Action failed. Please try again.", "err");
    } finally {
      setActionLoading(null);
    }
  };

  const filters: { label: string; value: StatusFilter }[] = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
    { label: "Staff", value: "staff" },
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
          {toast.type === "ok" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 shrink-0" />
          )}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage all registered users.
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="bg-[#ba740e] text-white cursor-pointer flex items-center justify-center w-full sm:w-auto gap-2 px-4 py-2 rounded-xl border border-border/40 hover:bg-[#ba740e]/95 transition-colors text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-row gap-2 sm:gap-3 justify-between items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#bb740a]/40 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span className="text-sm font-semibold text-muted-foreground hidden md:inline-block">Filter:</span>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-4 py-2 pr-8 rounded-xl bg-secondary border border-border text-sm text-foreground appearance-none outline-none focus:border-[#bb740a]/40 transition-colors cursor-pointer"
            >
              {filters.map(f => (
                <option key={f.value} value={f.value} className="bg-card text-foreground">
                  {f.label === "All" ? "Status" : f.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
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
            <button
              onClick={fetchUsers}
              className="text-xs text-muted-foreground underline"
            >
              Retry
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <User className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="px-5 py-3.5 text-left font-semibold">Name</th>
                  <th className="px-5 py-3.5 text-center font-semibold">Status</th>
                  <th className="px-5 py-3.5 text-left font-semibold hidden md:table-cell">Joined</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {users.map((u) => (
                  <tr
                    key={u.id}
                    onClick={() => {
                      if (window.innerWidth < 640) setSelectedUser(u);
                    }}
                    className="hover:bg-white/[0.02] transition-colors sm:cursor-default cursor-pointer"
                  >
                    {/* Name */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#bb740a]/10 border border-[#bb740a]/20 flex items-center justify-center shrink-0 overflow-hidden">
                          <User className="w-4 h-4 text-[#bb740a]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">
                            {u.first_name} {u.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 text-center">
                      {u.is_active !== false ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-xs font-semibold text-green-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-xs font-semibold text-red-400">
                          <XCircle className="w-3.5 h-3.5" /> Inactive
                        </span>
                      )}
                    </td>

                    {/* Joined */}
                    <td className="px-5 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-xs">
                          {u.date_joined
                            ? new Date(u.date_joined).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                            : "—"}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="relative flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(u);
                          }}
                          className="cursor-pointer p-1.5 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-[#bb740a] hover:bg-[#bb740a]/10 transition-all"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === u.id ? null : u.id);
                          }}
                          className="cursor-pointer p-1.5 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openMenuId === u.id && (
                          <div
                            className="absolute right-0 top-full mt-2 w-40 bg-popover rounded-xl shadow-2xl border border-border z-10 overflow-hidden animate-in fade-in slide-in-from-top-2 text-left"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground border-b border-border">
                              Actions
                            </div>
                            <button
                              onClick={() => { toggleActive(u); setOpenMenuId(null); }}
                              disabled={actionLoading === u.id}
                              className={`cursor-pointer w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors disabled:opacity-40 ${u.is_active !== false ? "text-red-400 hover:bg-red-500/10" : "text-green-400 hover:bg-green-500/10"}`}
                            >
                              {actionLoading === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : (u.is_active !== false ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />)}
                              {u.is_active !== false ? "Deactivate" : "Activate"}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">User Details</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#bb740a]/10 border border-[#bb740a]/20 flex items-center justify-center shrink-0">
                  <User className="w-8 h-8 text-[#bb740a]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    {selectedUser.first_name} {selectedUser.last_name}
                  </h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-4 rounded-xl bg-secondary/40 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  {selectedUser.is_active !== false ? (
                    <span className="inline-flex items-center gap-1.5 text-green-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-red-400 font-semibold">
                      <XCircle className="w-4 h-4" /> Inactive
                    </span>
                  )}
                </div>
                <div className="p-4 rounded-xl bg-secondary/40 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Joined</p>
                  <div className="flex items-center gap-1.5 text-foreground font-semibold">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {selectedUser.date_joined
                      ? new Date(selectedUser.date_joined).toLocaleDateString()
                      : "—"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
