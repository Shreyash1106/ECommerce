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
const AVATAR_COLORS = ["bg-amber-600","bg-indigo-600","bg-blue-600","bg-purple-600","bg-green-600","bg-rose-600"];
const initials = (name) => name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

export default function AdminUsers() {
  const [search, setSearch]             = useState("");
  const [roleFilter, setRoleFilter]     = useState("All");
  const [page, setPage]                 = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [profileTarget, setProfileTarget] = useState(null);
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

  const { data: profileData, isLoading: profileLoading, isError: profileError } = useQuery({
    queryKey: ["adminUserProfile", profileTarget?.id],
    queryFn: () => client.get(`/admin/users/${profileTarget?.id}/profile`).then(r => r.data),
    enabled: !!profileTarget,
    onError: () => toast.error("Failed to load user profile."),
  });

  const filtered = useMemo(() => users.filter((u) => {
    const fullName = `${u.first_name} ${u.last_name}`;
    const matchSearch = fullName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
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
    <div className="min-h-screen text-slate-900 pb-10 px-8 py-8 bg-slate-50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Users</h1>
          <p className="text-slate-500 text-sm mt-1">{filtered.length} total registered accounts</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {ROLES.map((r) => (
          <button key={r} onClick={() => { setRoleFilter(r); setPage(1); }}
            className={`px-5 py-4 text-left transition-all duration-200 rounded-2xl border ${
              roleFilter === r 
                ? "bg-amber-50 border-amber-300 shadow-sm" 
                : "bg-white border-slate-200 hover:bg-slate-50"
            }`}>
            <p className={`text-2xl font-extrabold ${roleFilter === r ? "text-amber-800" : "text-slate-900"}`}>{roleCounts[r]}</p>
            <p className="text-xs font-bold text-slate-500 tracking-wider uppercase mt-1">{r === "All" ? "Total" : r + "s"}</p>
          </button>
        ))}
      </div>

      <div className="relative max-w-sm mb-6">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search users…" className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all shadow-sm" />
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8">
            <EmptyState icon={Users} title="No users found" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Verified</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.map((u, i) => {
                    const fullName = `${u.first_name} ${u.last_name}`;
                    return (
                      <tr key={u.id} className="cursor-pointer hover:bg-slate-50/80 transition-colors group" onClick={() => setProfileTarget(u)}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                              {initials(fullName)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 group-hover:text-amber-800 transition-colors">{fullName}</p>
                              <p className="text-xs font-medium text-slate-500 mt-0.5">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4"><Badge status={u.role}>{u.role}</Badge></td>
                        <td className="px-6 py-4"><Badge status={u.is_verified ? "active" : "inactive"}>{u.is_verified ? "Yes" : "No"}</Badge></td>
                        <td className="px-6 py-4 text-slate-500 text-sm font-medium">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(u); }}
                            className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
            </div>
          </>
        )}
      </div>

      {/* Delete confirmation modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Remove User" size="sm">
        <div className="text-center py-2">
          <p className="text-sm text-slate-700 mb-1">Remove <span className="font-bold text-slate-900">"{deleteTarget ? `${deleteTarget.first_name} ${deleteTarget.last_name}` : ''}"</span>?</p>
          <p className="text-xs text-slate-500 mb-5">This action cannot be undone.</p>
          <div className="flex gap-2 justify-center">
            <button onClick={() => setDeleteTarget(null)} className="btn-secondary">Cancel</button>
            <button onClick={() => deleteMutation.mutate(deleteTarget.id)} disabled={deleteMutation.isPending}
              className="btn-danger">
              {deleteMutation.isPending
                ? <span className="w-4 h-4 border-2 border-rose-400/30 border-t-rose-600 rounded-full animate-spin" />
                : "Remove"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Profile modal */}
      <Modal open={!!profileTarget} onClose={() => setProfileTarget(null)} title="User Profile" size="md">
        <div className="p-4">
          {profileLoading && <LoadingSpinner size="lg" />}
          {profileError && <p className="text-rose-600 text-sm">Failed to load profile.</p>}
          {profileData && (
            <div className="space-y-3 text-slate-800 text-sm">
              <p><strong>Name:</strong> {profileData.first_name} {profileData.last_name}</p>
              <p><strong>Email:</strong> {profileData.email}</p>
              <p><strong>Role:</strong> {profileData.role}</p>
              <p><strong>Verified:</strong> {profileData.is_verified ? "Yes" : "No"}</p>
              <p><strong>Joined:</strong> {profileData.created_at ? new Date(profileData.created_at).toLocaleDateString() : "N/A"}</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
