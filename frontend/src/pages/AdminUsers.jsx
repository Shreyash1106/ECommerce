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

  // Fetch selected user's profile when modal opens
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
    <div className="min-h-screen text-white pb-10 px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Users</h1>
          <p className="text-gray-400 text-sm mt-1">{filtered.length} total users</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {ROLES.map((r) => (
          <button key={r} onClick={() => { setRoleFilter(r); setPage(1); }}
            className={`px-5 py-4 text-left transition-all duration-200 rounded-2xl border ${
              roleFilter === r 
                ? "bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_15px_rgba(79,70,229,0.15)]" 
                : "bg-gray-900/40 backdrop-blur-md border-white/5 hover:bg-white/5 hover:border-white/10"
            }`}>
            <p className={`text-2xl font-bold ${roleFilter === r ? "text-indigo-400" : "text-white"}`}>{roleCounts[r]}</p>
            <p className="text-xs font-semibold text-gray-400 tracking-wider uppercase mt-1">{r === "All" ? "Total" : r + "s"}</p>
          </button>
        ))}
      </div>

      <div className="relative max-w-sm mb-6">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search users…" className="w-full bg-gray-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all" />
      </div>

      <div className="bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8">
            <EmptyState icon={Users} title="No users found" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.01]">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Verified</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginated.map((u, i) => {
                    const fullName = `${u.first_name} ${u.last_name}`;
                    return (
                      <tr key={u.id} className="cursor-pointer hover:bg-white/[0.02] transition-colors group" onClick={() => setProfileTarget(u)}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform`}>
                              {initials(fullName)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">{fullName}</p>
                              <p className="text-xs font-medium text-gray-500 mt-0.5">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4"><Badge status={u.role}>{u.role}</Badge></td>
                        <td className="px-6 py-4"><Badge status={u.is_verified ? "active" : "inactive"}>{u.is_verified ? "Yes" : "No"}</Badge></td>
                        <td className="px-6 py-4 text-gray-400 text-sm font-medium">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(u); }}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-white/5 bg-white/[0.01]">
              <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
            </div>
          </>
        )}
      </div>

      {/* Delete confirmation modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Remove User" size="sm">
        <div className="text-center py-2">
          <p className="text-sm text-gray-300 mb-1">Remove <span className="font-semibold text-white">"{deleteTarget ? `${deleteTarget.first_name} ${deleteTarget.last_name}` : ''}"</span>?</p>
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
      {/* Profile modal */}
      <Modal open={!!profileTarget} onClose={() => setProfileTarget(null)} title="User Profile" size="md">
        <div className="p-4">
          {profileLoading && <LoadingSpinner size="lg" />}
          {profileError && <p className="text-red-400 text-sm">Failed to load profile.</p>}
          {profileData && (
            <div className="space-y-3">
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
