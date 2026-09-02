"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  UserPlus, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  Key, 
  Edit3, 
  Trash2, 
  Loader2, 
  RefreshCw, 
  ArrowLeft,
  X,
  Save,
  CheckCircle2,
  Clock,
  Shield,
  Eye,
  EyeOff,
  User,
  Lock,
  Briefcase
} from "lucide-react";
import { 
  listStaff, 
  createStaff, 
  updateStaff, 
  deleteStaff, 
  changeStaffPassword, 
  updateStaffStatus, 
  StaffUser, 
  CreateStaffPayload, 
  UpdateStaffPayload 
} from "@/lib/services/staffService";

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStaffType, setSelectedStaffType] = useState<string>("All");

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffUser | null>(null);

  // Form States (Role ID removed from UI)
  const [createForm, setCreateForm] = useState<CreateStaffPayload>({
    username: "",
    password: "",
    staff_type: "manager",
    is_active: true,
  });

  const [editForm, setEditForm] = useState<UpdateStaffPayload>({
    username: "",
    staff_type: "manager",
    is_active: true,
  });

  const [newPassword, setNewPassword] = useState<string>("");
  const [showPassText, setShowPassText] = useState<boolean>(false);

  // Action Pending Flags
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch staff roster
  const fetchStaffRoster = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listStaff();
      setStaffList(data || []);
    } catch (err: any) {
      console.error("Failed to load staff list:", err);
      const msg = err.response?.data?.detail || err.message || "Failed to retrieve administrative users.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffRoster();
  }, []);

  // Filter staff list
  const staffTypes = useMemo(() => {
    return ["All", ...Array.from(new Set(staffList.map((s) => s.staff_type).filter(Boolean)))];
  }, [staffList]);

  const filteredStaff = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return staffList.filter((staff) => {
      const username = (staff.username || "").toLowerCase();
      const staffType = (staff.staff_type || "").toLowerCase();
      
      const matchesSearch = !q || username.includes(q) || staffType.includes(q);
      const matchesType = selectedStaffType === "All" || staff.staff_type === selectedStaffType;
      return matchesSearch && matchesType;
    });
  }, [staffList, searchQuery, selectedStaffType]);

  // KPI calculations
  const totalStaff = staffList.length;
  const activeStaff = useMemo(() => staffList.filter((s) => s.is_active).length, [staffList]);
  const superAdmins = useMemo(() => staffList.filter((s) => s.is_super_admin).length, [staffList]);

  // Handle instant status toggle
  const handleToggleStatus = async (staff: StaffUser) => {
    const newStatus = !staff.is_active;
    try {
      setTogglingId(staff.public_id);
      setStaffList((prev) =>
        prev.map((s) => (s.public_id === staff.public_id ? { ...s, is_active: newStatus } : s))
      );
      await updateStaffStatus(staff.public_id, newStatus);
    } catch (err: any) {
      setStaffList((prev) =>
        prev.map((s) => (s.public_id === staff.public_id ? { ...s, is_active: staff.is_active } : s))
      );
      const msg = err.response?.data?.detail || err.message || "Failed to update staff status.";
      alert(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setTogglingId(null);
    }
  };

  // Handle Create Staff
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.username?.trim() || !createForm.password) return;

    try {
      setSubmitting(true);
      const payload: CreateStaffPayload = {
        username: createForm.username.trim(),
        password: createForm.password,
        staff_type: createForm.staff_type?.trim() || "manager",
        is_active: createForm.is_active ?? true,
      };

      const created = await createStaff(payload);
      setStaffList((prev) => [created, ...prev]);
      setShowCreateModal(false);
      setCreateForm({
        username: "",
        password: "",
        staff_type: "manager",
        is_active: true,
      });
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || "Failed to register staff account.";
      alert(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Staff
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;

    try {
      setSubmitting(true);
      const payload: UpdateStaffPayload = {
        ...(editForm.username ? { username: editForm.username.trim() } : {}),
        staff_type: editForm.staff_type?.trim() || "manager",
        is_active: editForm.is_active ?? true,
      };

      const updated = await updateStaff(selectedStaff.public_id, payload);
      setStaffList((prev) =>
        prev.map((s) => (s.public_id === updated.public_id ? updated : s))
      );
      setShowEditModal(false);
      setSelectedStaff(null);
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || "Failed to update staff parameters.";
      alert(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Password Reset
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff || !newPassword) return;

    try {
      setSubmitting(true);
      await changeStaffPassword(selectedStaff.public_id, { password: newPassword });
      alert(`Password updated successfully for ${selectedStaff.username}`);
      setShowPasswordModal(false);
      setNewPassword("");
      setSelectedStaff(null);
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || "Failed to update password.";
      alert(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Staff
  const handleDeleteStaff = async (publicId: string, username: string) => {
    if (!confirm(`Are you sure you want to revoke administrative access for '${username}'?`)) return;

    try {
      setDeletingId(publicId);
      await deleteStaff(publicId);
      setStaffList((prev) => prev.filter((s) => s.public_id !== publicId));
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || "Failed to delete user account.";
      alert(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setDeletingId(null);
    }
  };

  const openEditModal = (staff: StaffUser) => {
    setSelectedStaff(staff);
    setEditForm({
      username: staff.username || "",
      staff_type: staff.staff_type || "manager",
      is_active: staff.is_active ?? true,
    });
    setShowEditModal(true);
  };

  const openPasswordModal = (staff: StaffUser) => {
    setSelectedStaff(staff);
    setNewPassword("");
    setShowPassText(false);
    setShowPasswordModal(true);
  };

  return (
    <div className="w-full space-y-6 pb-20">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#2D5A1E]/15">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <Link 
              href="/admin/dashboard" 
              className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-[#2D5A1E] transition-colors flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F]">Personnel & Roles</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-[#172B15] tracking-tight">
            Staff & Access <span className="font-serif italic text-[#639E1F]">Control</span>
          </h1>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={fetchStaffRoster}
            className="px-4 py-2.5 rounded-xl bg-white border border-[#2D5A1E]/20 text-[#2D5A1E] text-xs font-bold uppercase tracking-wider hover:bg-[#F2F8ED] transition-all flex items-center justify-center space-x-2 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] transition-all flex items-center justify-center space-x-2 shadow-sm shadow-[#2D5A1E]/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Total Team</span>
            <p className="text-2xl font-light text-[#172B15]">{totalStaff}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#8CC63F]/15 text-[#2D5A1E] flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Active Operators</span>
            <p className="text-2xl font-light text-[#2D5A1E]">{activeStaff}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Super Admins</span>
            <p className="text-2xl font-light text-[#172B15]">{superAdmins}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-[#2D5A1E]/15 p-4 sm:p-5 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search staff by username or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15] placeholder-neutral-400 focus:outline-none focus:border-[#639E1F] transition-all"
          />
        </div>

        {/* Staff Type Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 scrollbar-none">
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 shrink-0 mr-1">Type:</span>
          {staffTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedStaffType(type)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold tracking-wide transition-all shrink-0 capitalize ${
                selectedStaffType === type
                  ? "bg-[#2D5A1E] text-white shadow-sm"
                  : "bg-[#FAFAF7] text-neutral-600 border border-neutral-200 hover:border-[#639E1F] hover:text-[#172B15]"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 space-y-3 bg-white rounded-3xl border border-[#2D5A1E]/15 shadow-sm">
          <Loader2 className="w-7 h-7 text-[#2D5A1E] animate-spin" />
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
            Syncing administrative access roster...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-6 rounded-3xl bg-red-50/70 border border-red-200 text-center space-y-3">
          <ShieldAlert className="w-6 h-6 text-red-600 mx-auto" />
          <p className="text-xs text-red-900 font-medium">{error}</p>
          <button
            onClick={fetchStaffRoster}
            className="px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-all"
          >
            Retry Sync
          </button>
        </div>
      )}

      {/* Staff Roster Table */}
      {!loading && !error && (
        <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-[#FAFAF7] border-b border-neutral-200/80 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  <th className="py-4 px-6">Administrator</th>
                  <th className="py-4 px-6">Access Type</th>
                  <th className="py-4 px-6 text-center">Account Status</th>
                  <th className="py-4 px-6">Last Active</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs text-neutral-700">
                {filteredStaff.map((staff) => (
                  <tr key={staff.public_id} className="hover:bg-[#F2F8ED]/30 transition-colors">
                    
                    {/* User Profile */}
                    <td className="py-4 px-6 align-middle space-y-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-[#2D5A1E]/10 text-[#2D5A1E] font-bold flex items-center justify-center text-xs uppercase shadow-inner">
                          {staff.username ? staff.username.slice(0, 2) : "AD"}
                        </div>
                        <div>
                          <div className="font-semibold text-[#172B15] text-sm leading-snug flex items-center space-x-2">
                            <span>{staff.username}</span>
                            {staff.is_super_admin && (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-bold uppercase tracking-wider">
                                <Shield className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                <span>Super Admin</span>
                              </span>
                            )}
                          </div>
                          <span className="text-neutral-400 font-mono text-[10px]">ID: {staff.public_id?.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </td>

                    {/* Staff Type */}
                    <td className="py-4 px-6 align-middle">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg bg-[#FAFAF7] border border-[#2D5A1E]/15 text-[#2D5A1E] font-bold uppercase text-[10px] tracking-wider">
                        {staff.staff_type}
                      </span>
                    </td>

                    {/* Interactive Status Toggle */}
                    <td className="py-4 px-6 align-middle text-center">
                      <button
                        onClick={() => handleToggleStatus(staff)}
                        disabled={togglingId === staff.public_id}
                        className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                          staff.is_active
                            ? "bg-[#8CC63F]/20 text-[#2D5A1E] border border-[#8CC63F]/40 hover:bg-[#8CC63F]/30"
                            : "bg-neutral-100 text-neutral-400 border border-neutral-200 hover:bg-neutral-200"
                        }`}
                        title="Toggle account status"
                      >
                        {togglingId === staff.public_id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <span className={`w-1.5 h-1.5 rounded-full ${staff.is_active ? "bg-[#2D5A1E]" : "bg-neutral-400"}`} />
                        )}
                        <span>{staff.is_active ? "Active" : "Inactive"}</span>
                      </button>
                    </td>

                    {/* Last Login Timestamp */}
                    <td className="py-4 px-6 align-middle text-neutral-500 font-mono text-[11px]">
                      <div className="flex items-center space-x-1.5 text-neutral-400">
                        <Clock className="w-3.5 h-3.5 text-[#639E1F]" />
                        <span>
                          {staff.last_login_at
                            ? new Date(staff.last_login_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Never Logged In"}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 align-middle text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => openPasswordModal(staff)}
                        className="inline-flex items-center justify-center p-2 rounded-xl bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-all shadow-sm"
                        title="Reset Staff Password"
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => openEditModal(staff)}
                        className="inline-flex items-center justify-center p-2 rounded-xl bg-[#2D5A1E]/10 text-[#2D5A1E] hover:bg-[#2D5A1E] hover:text-white transition-all shadow-sm"
                        title="Edit Staff Metadata"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteStaff(staff.public_id, staff.username)}
                        disabled={deletingId === staff.public_id}
                        className="inline-flex items-center justify-center p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm disabled:opacity-50"
                        title="Revoke Staff Access"
                      >
                        {deletingId === staff.public_id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>

                  </tr>
                ))}

                {filteredStaff.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-neutral-400 text-xs">
                      No administrative users found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 1: CREATE STAFF (ROLE ID REMOVED)
         ========================================================= */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl border border-[#2D5A1E]/15"
            >
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <div className="flex items-center space-x-2 text-[#2D5A1E]">
                  <UserPlus className="w-5 h-5" />
                  <h3 className="text-xs font-bold uppercase tracking-widest">Register New Staff</h3>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-full hover:bg-neutral-100 transition-all">
                  <X className="w-4 h-4 text-neutral-500" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 flex items-center space-x-1">
                    <User className="w-3 h-3 text-[#2D5A1E]" />
                    <span>Username *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. rohit.sharma"
                    value={createForm.username}
                    onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 flex items-center space-x-1">
                    <Lock className="w-3 h-3 text-[#2D5A1E]" />
                    <span>Initial Password *</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 flex items-center space-x-1">
                    <Briefcase className="w-3 h-3 text-[#2D5A1E]" />
                    <span>Staff Type *</span>
                  </label>
                  <select
                    value={createForm.staff_type}
                    onChange={(e) => setCreateForm({ ...createForm, staff_type: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F] font-medium"
                  >
                    <option value="manager">Manager</option>
                    <option value="inventory_admin">Inventory Specialist</option>
                    <option value="support">Customer Support</option>
                    <option value="finance">Finance & Billing</option>
                    <option value="superadmin">Super Administrator</option>
                  </select>
                </div>

                <label className="flex items-center space-x-3 pt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createForm.is_active}
                    onChange={(e) => setCreateForm({ ...createForm, is_active: e.target.checked })}
                    className="w-4 h-4 rounded text-[#2D5A1E]"
                  />
                  <span className="text-xs text-[#172B15] font-semibold">Activate account immediately</span>
                </label>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-neutral-100 text-neutral-600 text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] transition-all flex items-center space-x-2 shadow-md disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Create User</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================
          MODAL 2: EDIT STAFF (ROLE ID REMOVED)
         ========================================================= */}
      <AnimatePresence>
        {showEditModal && selectedStaff && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl border border-[#2D5A1E]/15"
            >
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <div className="flex items-center space-x-2 text-[#2D5A1E]">
                  <Edit3 className="w-5 h-5" />
                  <h3 className="text-xs font-bold uppercase tracking-widest">Update Staff Parameters</h3>
                </div>
                <button onClick={() => setShowEditModal(false)} className="p-2 rounded-full hover:bg-neutral-100 transition-all">
                  <X className="w-4 h-4 text-neutral-500" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 flex items-center space-x-1">
                    <User className="w-3 h-3 text-[#2D5A1E]" />
                    <span>Username</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.username ?? ""}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 flex items-center space-x-1">
                    <Briefcase className="w-3 h-3 text-[#2D5A1E]" />
                    <span>Staff Type</span>
                  </label>
                  <select
                    value={editForm.staff_type ?? "manager"}
                    onChange={(e) => setEditForm({ ...editForm, staff_type: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F] font-medium"
                  >
                    <option value="manager">Manager</option>
                    <option value="inventory_admin">Inventory Specialist</option>
                    <option value="support">Customer Support</option>
                    <option value="finance">Finance & Billing</option>
                    <option value="superadmin">Super Administrator</option>
                  </select>
                </div>

                <label className="flex items-center space-x-3 pt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.is_active ?? true}
                    onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                    className="w-4 h-4 rounded text-[#2D5A1E]"
                  />
                  <span className="text-xs text-[#172B15] font-semibold">Account is Active</span>
                </label>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-neutral-100 text-neutral-600 text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] transition-all flex items-center space-x-2 shadow-md disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================
          MODAL 3: CHANGE PASSWORD
         ========================================================= */}
      <AnimatePresence>
        {showPasswordModal && selectedStaff && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl border border-[#2D5A1E]/15"
            >
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <div className="flex items-center space-x-2 text-[#2D5A1E]">
                  <Key className="w-5 h-5" />
                  <h3 className="text-xs font-bold uppercase tracking-widest">Reset Staff Password</h3>
                </div>
                <button onClick={() => setShowPasswordModal(false)} className="p-2 rounded-full hover:bg-neutral-100 transition-all">
                  <X className="w-4 h-4 text-neutral-500" />
                </button>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="p-4 bg-[#FAFAF7] rounded-2xl border border-[#2D5A1E]/15 space-y-0.5">
                  <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest block">Target Account</span>
                  <span className="text-sm font-bold text-[#172B15]">{selectedStaff.username}</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 flex items-center space-x-1">
                    <Lock className="w-3 h-3 text-[#2D5A1E]" />
                    <span>New Password *</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassText ? "text" : "password"}
                      required
                      placeholder="Minimum 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-11 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassText(!showPassText)}
                      className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      {showPassText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-neutral-100 text-neutral-600 text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !newPassword}
                    className="px-6 py-2.5 rounded-xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] transition-all flex items-center space-x-2 shadow-md disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    <span>Update Passcode</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}