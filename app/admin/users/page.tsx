"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, 
  Shield, 
  PlusCircle, 
  Search, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowLeft,
  X,
  Check,
  Mail,
  UserCheck,
  ShieldCheck
} from "lucide-react";
import { 
  getAdminUsers, 
  createAdminUser, 
  deleteAdminUser, 
  assignRoleToAdminUser, 
  removeRoleFromAdminUser,
  AdminUser 
} from "@/lib/services/adminUserService";
import { getRoles, Role } from "@/lib/services/roleService";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Create User Modal
  const [showUserModal, setShowUserModal] = useState<boolean>(false);
  const [creatingUser, setCreatingUser] = useState<boolean>(false);
  const [userForm, setUserForm] = useState({ full_name: "", email: "", password: "" });

  // Role Assignment Drawer
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userAssignedRoleIds, setUserAssignedRoleIds] = useState<string[]>([]);
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersRes, rolesRes] = await Promise.all([
        getAdminUsers().catch(() => []),
        getRoles().catch(() => [])
      ]);
      setUsers(usersRes);
      setRoles(rolesRes);
    } catch (err: any) {
      console.error("Failed to load users:", err);
      setError("Unable to sync admin user roster.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.email || !userForm.full_name) return;

    try {
      setCreatingUser(true);
      const created = await createAdminUser(userForm);
      setUsers((prev) => [created, ...prev]);
      setUserForm({ full_name: "", email: "", password: "" });
      setShowUserModal(false);
      setSuccess("Administrator account created successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to create administrator.");
    } finally {
      setCreatingUser(false);
    }
  };

  const handleDeleteUser = async (publicId: string) => {
    if (!confirm("Are you sure you want to remove this administrator?")) return;
    try {
      await deleteAdminUser(publicId);
      setUsers((prev) => prev.filter((u) => u.public_id !== publicId));
    } catch (err) {
      alert("Error deleting user.");
    }
  };

  const openRoleDrawer = (user: AdminUser) => {
    setSelectedUser(user);
    const assignedIds = (user.roles || []).map((r) => r.public_id);
    setUserAssignedRoleIds(assignedIds);
  };

  const handleToggleRole = async (rolePublicId: string) => {
    if (!selectedUser) return;
    const isAssigned = userAssignedRoleIds.includes(rolePublicId);

    try {
      setUpdatingRoleId(rolePublicId);
      if (isAssigned) {
        await removeRoleFromAdminUser(selectedUser.public_id, rolePublicId);
        setUserAssignedRoleIds((prev) => prev.filter((id) => id !== rolePublicId));
      } else {
        await assignRoleToAdminUser(selectedUser.public_id, rolePublicId);
        setUserAssignedRoleIds((prev) => [...prev, rolePublicId]);
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to update role assignment.");
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
  const query = (searchQuery || "").toLowerCase();
  const name = (u.full_name || (u as any).name || "").toLowerCase();
  const email = (u.email || "").toLowerCase();

  return name.includes(query) || email.includes(query);
});

  return (
    <div className="w-full space-y-6 pb-20">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#2D5A1E]/15">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <Link href="/admin/dashboard" className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-[#2D5A1E] transition-colors flex items-center space-x-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F]">Personnel & Roles</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-[#172B15] tracking-tight">
            Admin <span className="font-serif italic text-[#639E1F]">Users</span>
          </h1>
        </div>

        <button
          onClick={() => setShowUserModal(true)}
          className="px-5 py-2.5 rounded-xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] transition-all flex items-center justify-center space-x-2 shadow-sm shadow-[#2D5A1E]/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Administrator</span>
        </button>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-[#8CC63F]/20 border border-[#8CC63F]/40 text-[#172B15] flex items-center space-x-3">
          <CheckCircle2 className="w-5 h-5 text-[#2D5A1E]" />
          <span className="text-xs font-bold uppercase tracking-wider">{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-xs font-medium">{error}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search admins by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#2D5A1E]/15 text-xs text-[#172B15] placeholder-neutral-400 focus:outline-none focus:border-[#639E1F]"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 space-y-3 bg-white rounded-3xl border border-[#2D5A1E]/15 shadow-sm">
          <Loader2 className="w-7 h-7 text-[#2D5A1E] animate-spin" />
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Loading user roster...</p>
        </div>
      )}

      {/* Admin Users Table */}
      {!loading && (
        <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-[#FAFAF7] border-b border-neutral-200/80 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  <th className="py-4 px-6">Administrator</th>
                  <th className="py-4 px-6">Assigned Roles</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs text-neutral-700">
                {filteredUsers.map((user) => (
                  <tr key={user.public_id} className="hover:bg-[#F2F8ED]/30 transition-colors">
                    
                    <td className="py-4 px-6 align-middle space-y-0.5">
                      <div className="font-bold text-[#172B15] text-sm flex items-center space-x-2">
                            <span>{user.full_name || (user as any).name || "Unnamed User"}</span>
                            {user.is_superadmin && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[9px] font-bold uppercase">
                                SuperAdmin
                                </span>
                            )}
                            </div>
                      <div className="text-neutral-400 text-[11px] flex items-center space-x-1">
                        <Mail className="w-3 h-3" />
                        <span>{user.email}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6 align-middle">
                      <div className="flex flex-wrap gap-1.5">
                        {(user.roles || []).map((r) => (
                          <span key={r.public_id} className="px-2.5 py-0.5 rounded-lg bg-[#2D5A1E]/10 text-[#2D5A1E] text-[10px] font-bold">
                            {r.name}
                          </span>
                        ))}
                        {(!user.roles || user.roles.length === 0) && (
                          <span className="text-neutral-400 text-xs italic">No roles assigned</span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-6 align-middle text-center">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        user.is_active !== false
                          ? "bg-[#8CC63F]/20 text-[#2D5A1E] border border-[#8CC63F]/40"
                          : "bg-neutral-100 text-neutral-500"
                      }`}>
                        <Check className="w-3 h-3" />
                        <span>{user.is_active !== false ? "Active" : "Disabled"}</span>
                      </span>
                    </td>

                    <td className="py-4 px-6 align-middle text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => openRoleDrawer(user)}
                        className="px-3 py-1.5 rounded-xl bg-[#2D5A1E]/10 text-[#2D5A1E] text-xs font-bold uppercase tracking-wider hover:bg-[#234717] hover:text-white transition-all shadow-sm"
                      >
                        Manage Roles
                      </button>

                      {!user.is_superadmin && (
                        <button
                          onClick={() => handleDeleteUser(user.public_id)}
                          className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>

                  </tr>
                ))}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-neutral-400 text-xs">
                      No admin users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide-over Drawer: Role Assignment Matrix */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between p-6 sm:p-8 space-y-6 animate-in slide-in-from-right duration-300">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#639E1F]">Role Configuration</span>
                  <h3 className="text-xl font-light text-[#172B15]">
                    Assign Roles: <span className="font-serif italic text-[#2D5A1E]">{selectedUser.full_name}</span>
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {roles.map((role) => {
                  const isAssigned = userAssignedRoleIds.includes(role.public_id);
                  const isUpdating = updatingRoleId === role.public_id;

                  return (
                    <div
                      key={role.public_id}
                      onClick={() => !isUpdating && handleToggleRole(role.public_id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isAssigned
                          ? "bg-[#F2F8ED] border-[#8CC63F]/60 text-[#172B15]"
                          : "bg-[#FAFAF7] border-neutral-200 text-neutral-600 hover:border-neutral-300"
                      }`}
                    >
                      <div className="space-y-0.5 max-w-[80%]">
                        <div className="font-bold text-xs flex items-center space-x-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#2D5A1E]" />
                          <span>{role.name}</span>
                        </div>
                        <div className="text-[11px] text-neutral-500 line-clamp-1">{role.description}</div>
                      </div>

                      <div className="shrink-0 pl-3">
                        {isUpdating ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#2D5A1E]" />
                        ) : (
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                            isAssigned ? "bg-[#2D5A1E] border-[#2D5A1E] text-white" : "border-neutral-300 bg-white"
                          }`}>
                            {isAssigned && <Check className="w-3.5 h-3.5" />}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100">
              <button
                onClick={() => setSelectedUser(null)}
                className="w-full py-3.5 rounded-xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#234717] transition-all shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Administrator */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-bold text-[#172B15]">Create Administrator Account</h3>
              <button onClick={() => setShowUserModal(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={userForm.full_name}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, full_name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="admin@energymax.com"
                  value={userForm.email}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Temporary Password</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={userForm.password}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-neutral-100 text-neutral-600 text-xs font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="px-6 py-2.5 rounded-xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] disabled:opacity-50 flex items-center space-x-2"
                >
                  {creatingUser ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Save Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}