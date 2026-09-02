"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Shield, 
  Key, 
  PlusCircle, 
  Search, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowLeft,
  X,
  Check,
  Lock,
  Layers,
  Sparkles
} from "lucide-react";
import { 
  getRoles, 
  createRole, 
  deleteRole, 
  getPermissions, 
  createPermission, 
  deletePermission, 
  getRolePermissions,
  assignPermissionToRole,
  removePermissionFromRole,
  Role, 
  Permission,
  RolePermissionAssignment
} from "@/lib/services/roleService";

export default function AccessControlPage() {
  const [activeTab, setActiveTab] = useState<"roles" | "permissions">("roles");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Entities State
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Create Modals State
  const [showRoleModal, setShowRoleModal] = useState<boolean>(false);
  const [roleForm, setRoleForm] = useState({ name: "", description: "" });
  const [creatingRole, setCreatingRole] = useState<boolean>(false);

  const [showPermissionModal, setShowPermissionModal] = useState<boolean>(false);
  const [permissionForm, setPermissionForm] = useState({ name: "", description: "" });
  const [creatingPermission, setCreatingPermission] = useState<boolean>(false);

  // Manage Role Permissions Slide-over Drawer
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [rolePerms, setRolePerms] = useState<string[]>([]);
  const [loadingPerms, setLoadingPerms] = useState<boolean>(false);
  const [updatingPermId, setUpdatingPermId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [rolesRes, permsRes] = await Promise.all([
        getRoles().catch(() => []),
        getPermissions().catch(() => [])
      ]);
      setRoles(rolesRes);
      setPermissions(permsRes);
    } catch (err: any) {
      console.error("Failed to load RBAC telemetry:", err);
      setError("Unable to sync access control tables with backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.name.trim()) return;
    try {
      setCreatingRole(true);
      const created = await createRole(roleForm);
      setRoles((prev) => [created, ...prev]);
      setRoleForm({ name: "", description: "" });
      setShowRoleModal(false);
      setSuccess("Role registered successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to create role.");
    } finally {
      setCreatingRole(false);
    }
  };

  const handleDeleteRole = async (publicId: string) => {
    if (!confirm("Are you sure you want to delete this role?")) return;
    try {
      await deleteRole(publicId);
      setRoles((prev) => prev.filter((r) => r.public_id !== publicId));
    } catch (err) {
      alert("Error deleting role.");
    }
  };

  const handleCreatePermission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!permissionForm.name.trim()) return;
    try {
      setCreatingPermission(true);
      const created = await createPermission(permissionForm);
      setPermissions((prev) => [created, ...prev]);
      setPermissionForm({ name: "", description: "" });
      setShowPermissionModal(false);
      setSuccess("Permission registered successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to create permission token.");
    } finally {
      setCreatingPermission(false);
    }
  };

  const handleDeletePermission = async (publicId: string) => {
    if (!confirm("Are you sure you want to delete this permission?")) return;
    try {
      await deletePermission(publicId);
      setPermissions((prev) => prev.filter((p) => p.public_id !== publicId));
    } catch (err) {
      alert("Error deleting permission.");
    }
  };

  // Open Permission Matrix Drawer for a Role
  const openPermissionDrawer = async (role: Role) => {
    setSelectedRole(role);
    try {
      setLoadingPerms(true);
      const roleId = role.id ?? role.public_id;
      const assigned = await getRolePermissions(roleId);
      setRolePerms(assigned.map((a) => a.permission_public_id));
    } catch (err) {
      console.error("Failed to load role permissions:", err);
      setRolePerms([]);
    } finally {
      setLoadingPerms(false);
    }
  };

  // Toggle single permission assignment
  const handleTogglePermission = async (permissionPublicId: string) => {
    if (!selectedRole) return;
    const roleId = selectedRole.id ?? selectedRole.public_id;
    const isAssigned = rolePerms.includes(permissionPublicId);

    try {
      setUpdatingPermId(permissionPublicId);
      if (isAssigned) {
        await removePermissionFromRole(roleId, permissionPublicId);
        setRolePerms((prev) => prev.filter((id) => id !== permissionPublicId));
      } else {
        await assignPermissionToRole(roleId, permissionPublicId);
        setRolePerms((prev) => [...prev, permissionPublicId]);
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to update permission mapping.");
    } finally {
      setUpdatingPermId(null);
    }
  };

  // Filtering
  const filteredRoles = roles.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredPermissions = permissions.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F]">Security Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-[#172B15] tracking-tight">
            Access <span className="font-serif italic text-[#639E1F]">Control (RBAC)</span>
          </h1>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {activeTab === "roles" ? (
            <button
              onClick={() => setShowRoleModal(true)}
              className="px-5 py-2.5 rounded-xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] transition-all flex items-center justify-center space-x-2 shadow-sm shadow-[#2D5A1E]/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Role</span>
            </button>
          ) : (
            <button
              onClick={() => setShowPermissionModal(true)}
              className="px-5 py-2.5 rounded-xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] transition-all flex items-center justify-center space-x-2 shadow-sm shadow-[#2D5A1E]/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Permission</span>
            </button>
          )}
        </div>
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

      {/* Tabs & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        
        {/* Navigation Tabs */}
        <div className="flex items-center p-1 bg-white rounded-2xl border border-[#2D5A1E]/15 shadow-sm">
          <button
            onClick={() => setActiveTab("roles")}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "roles"
                ? "bg-[#2D5A1E] text-white shadow-sm"
                : "text-neutral-500 hover:text-[#172B15]"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Roles ({roles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("permissions")}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "permissions"
                ? "bg-[#2D5A1E] text-white shadow-sm"
                : "text-neutral-500 hover:text-[#172B15]"
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Permissions ({permissions.length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#2D5A1E]/15 text-xs text-[#172B15] placeholder-neutral-400 focus:outline-none focus:border-[#639E1F]"
          />
        </div>
      </div>

      {/* Loading Matrix */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 space-y-3 bg-white rounded-3xl border border-[#2D5A1E]/15 shadow-sm">
          <Loader2 className="w-7 h-7 text-[#2D5A1E] animate-spin" />
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Syncing security definitions...</p>
        </div>
      )}

      {/* Roles Tab Content */}
      {!loading && activeTab === "roles" && (
        <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-[#FAFAF7] border-b border-neutral-200/80 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  <th className="py-4 px-6">Role Name & Token</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs text-neutral-700">
                {filteredRoles.map((role) => (
                  <tr key={role.public_id} className="hover:bg-[#F2F8ED]/30 transition-colors">
                    
                    <td className="py-4 px-6 align-middle space-y-1">
                      <div className="font-bold text-[#172B15] text-sm flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-[#2D5A1E]" />
                        <span>{role.name}</span>
                      </div>
                      <div className="text-neutral-400 font-mono text-[10px]">
                        ID: {role.public_id}
                      </div>
                    </td>

                    <td className="py-4 px-6 align-middle text-neutral-600 max-w-sm">
                      {role.description || "No description assigned."}
                    </td>

                    <td className="py-4 px-6 align-middle text-center">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        role.is_active !== false
                          ? "bg-[#8CC63F]/20 text-[#2D5A1E] border border-[#8CC63F]/40"
                          : "bg-neutral-100 text-neutral-500"
                      }`}>
                        <Check className="w-3 h-3" />
                        <span>{role.is_active !== false ? "Active" : "Disabled"}</span>
                      </span>
                    </td>

                    <td className="py-4 px-6 align-middle text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => openPermissionDrawer(role)}
                        className="px-3 py-1.5 rounded-xl bg-[#2D5A1E]/10 text-[#2D5A1E] text-xs font-bold uppercase tracking-wider hover:bg-[#2D5A1E] hover:text-white transition-all shadow-sm"
                      >
                        Permissions
                      </button>

                      <button
                        onClick={() => handleDeleteRole(role.public_id)}
                        className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        title="Delete Role"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>

                  </tr>
                ))}

                {filteredRoles.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-neutral-400 text-xs">
                      No roles registered in the database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Permissions Tab Content */}
      {!loading && activeTab === "permissions" && (
        <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-[#FAFAF7] border-b border-neutral-200/80 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  <th className="py-4 px-6">Permission Token</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6">Public Identifier</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs text-neutral-700">
                {filteredPermissions.map((perm) => (
                  <tr key={perm.public_id} className="hover:bg-[#F2F8ED]/30 transition-colors">
                    
                    <td className="py-4 px-6 align-middle space-y-0.5">
                      <div className="font-mono font-bold text-[#172B15] text-xs flex items-center space-x-2">
                        <Key className="w-3.5 h-3.5 text-[#639E1F]" />
                        <span>{perm.name}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6 align-middle text-neutral-600 max-w-sm">
                      {perm.description || "System authority grant."}
                    </td>

                    <td className="py-4 px-6 align-middle font-mono text-[10px] text-neutral-400">
                      {perm.public_id}
                    </td>

                    <td className="py-4 px-6 align-middle text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleDeletePermission(perm.public_id)}
                        className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        title="Delete Permission"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>

                  </tr>
                ))}

                {filteredPermissions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-neutral-400 text-xs">
                      No permission tokens registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide-over Drawer: Role Permission Matrix */}
      {selectedRole && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between p-6 sm:p-8 space-y-6 animate-in slide-in-from-right duration-300">
            
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#639E1F]">Authority Mapping</span>
                  <h3 className="text-xl font-light text-[#172B15]">
                    Manage: <span className="font-serif italic text-[#2D5A1E]">{selectedRole.name}</span>
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedRole(null)}
                  className="p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {loadingPerms ? (
                <div className="py-20 text-center space-y-3">
                  <Loader2 className="w-6 h-6 animate-spin text-[#2D5A1E] mx-auto" />
                  <p className="text-xs text-neutral-400 uppercase tracking-wider">Syncing authority matrix...</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {permissions.map((perm) => {
                    const isGranted = rolePerms.includes(perm.public_id);
                    const isUpdating = updatingPermId === perm.public_id;

                    return (
                      <div
                        key={perm.public_id}
                        onClick={() => !isUpdating && handleTogglePermission(perm.public_id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isGranted
                            ? "bg-[#F2F8ED] border-[#8CC63F]/60 text-[#172B15]"
                            : "bg-[#FAFAF7] border-neutral-200 text-neutral-600 hover:border-neutral-300"
                        }`}
                      >
                        <div className="space-y-0.5 max-w-[80%]">
                          <div className="font-mono text-xs font-bold">{perm.name}</div>
                          <div className="text-[11px] text-neutral-500 line-clamp-1">{perm.description}</div>
                        </div>

                        <div className="shrink-0 pl-3">
                          {isUpdating ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[#2D5A1E]" />
                          ) : (
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                              isGranted ? "bg-[#2D5A1E] border-[#2D5A1E] text-white" : "border-neutral-300 bg-white"
                            }`}>
                              {isGranted && <Check className="w-3.5 h-3.5" />}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-neutral-100">
              <button
                onClick={() => setSelectedRole(null)}
                className="w-full py-3.5 rounded-xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#234717] transition-all shadow-md"
              >
                Close Matrix
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal: Create Role */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-bold text-[#172B15]">Create Security Role</h3>
              <button onClick={() => setShowRoleModal(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Role Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CatalogManager"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Description</label>
                <textarea
                  rows={3}
                  placeholder="Full scope of responsibilities..."
                  value={roleForm.description}
                  onChange={(e) => setRoleForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-neutral-100 text-neutral-600 text-xs font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingRole}
                  className="px-6 py-2.5 rounded-xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] disabled:opacity-50 flex items-center space-x-2"
                >
                  {creatingRole ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Save Role</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Permission */}
      {showPermissionModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-bold text-[#172B15]">Create Authority Token</h3>
              <button onClick={() => setShowPermissionModal(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePermission} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Token Key *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. catalog:write or orders:refund"
                  value={permissionForm.name}
                  onChange={(e) => setPermissionForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs font-mono text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Description</label>
                <textarea
                  rows={3}
                  placeholder="Specific action allowed by this token..."
                  value={permissionForm.description}
                  onChange={(e) => setPermissionForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPermissionModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-neutral-100 text-neutral-600 text-xs font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingPermission}
                  className="px-6 py-2.5 rounded-xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] disabled:opacity-50 flex items-center space-x-2"
                >
                  {creatingPermission ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Save Permission</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}