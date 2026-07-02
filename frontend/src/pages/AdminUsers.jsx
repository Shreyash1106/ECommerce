import React, { useState, useMemo } from "react";
import { Search, Trash2, Users } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../api/client";
import Badge from "../components/ui/Badge";
import Pagination from "../components/ui/Pagination";
import EmptyState from "../components/ui/EmptyState";
import Modal from "../components/ui/Modal";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import toast from "react-hot-toast";

const ROLES = ["All", "admin", "vendor", "customer"];
const PAGE_SIZE = 7;
const AVATAR_COLORS = ["bg-indigo-600","bg-blue-600","bg-purple-600","bg-green-600","bg-orange-600","bg-red-600","bg-cyan-600","bg-pink-600"];
const initials = (name) => name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

export default function AdminUsers() {
  const [search, setSearch]             = useState("");
  const [roleFilter, setRoleFilter]     = useState("All");
  const [page, setPage]                 = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, isError } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: () => client.get("/admin/users").then((r) => r.data),
    retry: 1,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => client.delete(`/admin/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast.success("User removed.");
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(err.response?.data?.detail || "Failed to delete user."),
  });

  const filtered = useMemo(() => users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter === "All" || u.role === roleFilter;
    return matchSearch && matchRole;
  }), [users, search, roleFilter]);

  const roleCounts = useMemo(() => ROLES.reduce((acc, r) => {
    acc[r] = r === "All" ? users.length : users.filter((u) => u.role === r).length;
    return acc;
  }, {}), [users]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (isLoading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;

  if (isError) return (
    <div className="page-container">
      <EmptyState icon={Users} title="Could not load users" description="Backend is offline or returned an error." />
    </div>
  );

  return (
    <div className="page-container">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Users</h1>
          <p className="text-xs text-gray-500 mt-0.5">{filtered.length} users</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {ROLES.map((r) => (
          <button key={r} onClick={() => { setRoleFilter(r); setPage(1); }}
            className={`section-card px-4 py-3 text-left hover:border-gray-700 transition-all ${roleFilter === r ? "border-indigo-500/50 bg-indigo-600/5" : ""}`}>
            <p className="text-xl font-bold text-white">{roleCounts[r]}</p>
            <p className="text-xs text-gray-500 capitalize mt-0.5">{r === "All" ? "Total" : r + "s"}</p>
          </button>
        ))}
      </div>

      <div className="relative max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search users…" className="input-field pl-9 h-9 text-sm w-full" />
      </div>

      <div className="section-card">
        {filtered.length === 0 ? (
          <EmptyState icon={Users} title="No users found" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th>User</th><th>Role</th><th>Verified</th><th>Joined</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {paginated.map((u, i) => (
                    <tr key={u.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>
                            {initials(u.name)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-200">{u.name}</p>
                            <p className="text-xs text-gray-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td><Badge status={u.role}>{u.role}</Badge></td>
                      <td><Badge status={u.is_verified ? "active" : "inactive"}>{u.is_verified ? "Yes" : "No"}</Badge></td>
                      <td className="text-gray-500 text-xs">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : "N/A"}
                      </td>
                      <td>
                        <button onClick={() => setDeleteTarget(u)}
                          className="p-1.5 rounded-md hover:bg-gray-700 text-gray-500 hover:text-red-400 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
          </>
        )}
      </div>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Remove User" size="sm">
        <div className="text-center py-2">
          <p className="text-sm text-gray-300 mb-1">Remove <span className="font-semibold text-white">"{deleteTarget?.name}"</span>?</p>
          <p className="text-xs text-gray-500 mb-5">This cannot be undone.</p>
          <div className="flex gap-2 justify-center">
            <button onClick={() => setDeleteTarget(null)} className="btn-secondary">Cancel</button>
            <button onClick={() => deleteMutation.mutate(deleteTarget.id)} disabled={deleteMutation.isPending}
              className="btn-danger border-red-500/50 bg-red-600/20 text-red-400">
              {deleteMutation.isPending
                ? <span className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                : "Remove"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
