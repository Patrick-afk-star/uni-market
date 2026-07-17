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
  Shield,
  ShieldOff,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

interface AdminUser {
  id: string;
  pk?: string;
  email: string;
  first_name: string;
  last_name?: string;
  phone_number?: string;
  avatar_url?: string;
  is_staff?: boolean;
  is_active?: boolean;
  roles?: string[];
  date_joined?: string;
  has_completed_profile?: boolean;
}

type StatusFilter = "all" | "active" | "inactive" | "staff";

export default function AdminUsersPage() {
  const { accessToken } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

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
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter !== "all") params.set("filter", statusFilter);

      const res = await fetch(
        getApiUrl(`/api/v1/admin/users/?${params.toString()}`),
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
  }, [accessToken, page, search, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounce search — reset page when query changes
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const toggleStaff = async (u: AdminUser) => {
    if (!accessToken) return;
    setActionLoading(u.id);
    try {
      const res = await fetch(
        getApiUrl(`/api/v1/admin/users/${u.id}/toggle-staff/`),
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ is_staff: !u.is_staff }),
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      showToast(`${u.first_name} is now ${!u.is_staff ? "staff" : "a regular user"}.`);
      fetchUsers();
    } catch {
      showToast("Action failed. Please try again.", "err");
    } finally {
      setActionLoading(null);
    }
  };

  const toggleActive = async (u: AdminUser) => {
    if (!accessToken) return;
    setActionLoading(u.id);
    try {
      const res = await fetch(
        getApiUrl(`/api/v1/admin/users/${u.id}/toggle-active/`),
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ is_active: !u.is_active }),
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
          className={`fixed top-5 right-5 z-[9999] flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl border animate-in slide-in-from-top-2 ${
            toast.type === "ok"
              ? "bg-[#0a0a0a] border-green-500/30 text-green-400"
              : "bg-[#0a0a0a] border-red-500/30 text-red-400"
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
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Status filter chips */}
        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                statusFilter === f.value
                  ? "bg-[#bb740a] border-[#bb740a] text-white"
                  : "bg-white/[0.03] border-white/[0.06] text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email…"
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
                  <th className="px-5 py-3.5 text-left font-semibold">User</th>
                  <th className="px-5 py-3.5 text-left font-semibold hidden md:table-cell">Contact</th>
                  <th className="px-5 py-3.5 text-left font-semibold hidden lg:table-cell">Joined</th>
                  <th className="px-5 py-3.5 text-center font-semibold">Status</th>
                  <th className="px-5 py-3.5 text-center font-semibold">Roles</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    {/* User */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#bb740a]/10 border border-[#bb740a]/20 flex items-center justify-center shrink-0 overflow-hidden">
                          {u.avatar_url ? (
                            <img
                              src={u.avatar_url}
                              alt={u.first_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-4 h-4 text-[#bb740a]" />
                          )}
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

                    {/* Contact */}
                    <td className="px-5 py-4 hidden md:table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          <span className="text-xs truncate max-w-[160px]">{u.email}</span>
                        </div>
                        {u.phone_number && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Phone className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-xs">{u.phone_number}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Joined */}
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-xs">
                          {u.date_joined
                            ? new Date(u.date_joined).toLocaleDateString()
                            : "—"}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          u.is_active !== false
                            ? "bg-green-500/10 border-green-500/20 text-green-400"
                            : "bg-red-500/10 border-red-500/20 text-red-400"
                        }`}
                      >
                        {u.is_active !== false ? (
                          <><CheckCircle2 className="w-3 h-3" /> Active</>
                        ) : (
                          <><XCircle className="w-3 h-3" /> Inactive</>
                        )}
                      </span>
                    </td>

                    {/* Roles */}
                    <td className="px-5 py-4 text-center">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {u.is_staff && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#bb740a]/10 border border-[#bb740a]/20 text-[#bb740a]">
                            staff
                          </span>
                        )}
                        {u.roles?.map((r) => (
                          <span
                            key={r}
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400"
                          >
                            {r}
                          </span>
                        ))}
                        {!u.is_staff && (!u.roles || u.roles.length === 0) && (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleStaff(u)}
                          disabled={actionLoading === u.id}
                          title={u.is_staff ? "Remove staff" : "Make staff"}
                          className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-muted-foreground hover:text-[#bb740a] hover:border-[#bb740a]/30 transition-all disabled:opacity-40"
                        >
                          {actionLoading === u.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : u.is_staff ? (
                            <ShieldOff className="w-4 h-4" />
                          ) : (
                            <Shield className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => toggleActive(u)}
                          disabled={actionLoading === u.id}
                          title={u.is_active !== false ? "Deactivate" : "Activate"}
                          className={`p-2 rounded-lg border transition-all disabled:opacity-40 ${
                            u.is_active !== false
                              ? "bg-white/[0.03] border-white/[0.06] text-muted-foreground hover:text-red-400 hover:border-red-500/30"
                              : "bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20"
                          }`}
                        >
                          {actionLoading === u.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : u.is_active !== false ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                        </button>
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
              className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
