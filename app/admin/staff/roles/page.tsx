"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  ShieldCheck,
  ArrowLeft,
  Users,
  Check,
  X,
  Lock,
  RefreshCw,
  Loader2,
  Info,
  Layers,
  Sparkles,
  KeyRound
} from "lucide-react";
import { listStaff, StaffUser } from "@/lib/services/staffService";

interface RoleDefinition {
  id: number;
  name: string;
  staffType: string;
  badgeColor: string;
  description: string;
  permissions: {
    module: string;
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  }[];
}

const SYSTEM_ROLES: RoleDefinition[] = [
  {
    id: 1,
    name: "Super Administrator",
    staffType: "superadmin",
    badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
    description: "Complete unconstrained access across all system modules, financial ledgers, and API configurations.",
    permissions: [
      { module: "Catalog & Products", view: true, create: true, edit: true, delete: true },
      { module: "Media & Cloudinary Assets", view: true, create: true, edit: true, delete: true },
      { module: "Staff & User Access", view: true, create: true, edit: true, delete: true },
      { module: "Orders & Transactions", view: true, create: true, edit: true, delete: true },
      { module: "System Settings & Logs", view: true, create: true, edit: true, delete: true },
    ],
  },
  {
    id: 2,
    name: "Operations & Catalog Manager",
    staffType: "manager",
    badgeColor: "bg-[#8CC63F]/20 text-[#2D5A1E] border-[#8CC63F]/40",
    description: "Authority to publish new formulations, update SKU pricing, manage categories, and handle digital assets.",
    permissions: [
      { module: "Catalog & Products", view: true, create: true, edit: true, delete: true },
      { module: "Media & Cloudinary Assets", view: true, create: true, edit: true, delete: false },
      { module: "Staff & User Access", view: true, create: false, edit: false, delete: false },
      { module: "Orders & Transactions", view: true, create: false, edit: true, delete: false },
      { module: "System Settings & Logs", view: false, create: false, edit: false, delete: false },
    ],
  },
  {
    id: 3,
    name: "Inventory Specialist",
    staffType: "inventory_admin",
    badgeColor: "bg-blue-50 text-blue-800 border-blue-200",
    description: "Responsible for stock management, product availability toggles, and subcategory organization.",
    permissions: [
      { module: "Catalog & Products", view: true, create: false, edit: true, delete: false },
      { module: "Media & Cloudinary Assets", view: true, create: true, edit: false, delete: false },
      { module: "Staff & User Access", view: false, create: false, edit: false, delete: false },
      { module: "Orders & Transactions", view: true, create: false, edit: false, delete: false },
      { module: "System Settings & Logs", view: false, create: false, edit: false, delete: false },
    ],
  },
  {
    id: 4,
    name: "Support & Customer Relations",
    staffType: "support",
    badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
    description: "Read-only access to customer orders and catalogs to assist with customer queries and status checks.",
    permissions: [
      { module: "Catalog & Products", view: true, create: false, edit: false, delete: false },
      { module: "Media & Cloudinary Assets", view: true, create: false, edit: false, delete: false },
      { module: "Staff & User Access", view: false, create: false, edit: false, delete: false },
      { module: "Orders & Transactions", view: true, create: false, edit: false, delete: false },
      { module: "System Settings & Logs", view: false, create: false, edit: false, delete: false },
    ],
  },
];

export default function AdminRolesPage() {
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRole, setSelectedRole] = useState<RoleDefinition>(SYSTEM_ROLES[0]);

  const loadStaffData = async () => {
    try {
      setLoading(true);
      const data = await listStaff();
      setStaffList(data || []);
    } catch {
      setStaffList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaffData();
  }, []);

  const roleCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    staffList.forEach((s) => {
      const rid = s.role_id ?? 1;
      counts[rid] = (counts[rid] || 0) + 1;
    });
    return counts;
  }, [staffList]);

  return (
    <div className="w-full space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#2D5A1E]/15">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <Link
              href="/admin/staff"
              className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-[#2D5A1E] transition-colors flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Staff Roster</span>
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F]">
              RBAC Governance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-[#172B15] tracking-tight">
            Role & Permission <span className="font-serif italic text-[#639E1F]">Matrix</span>
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadStaffData}
            className="px-4 py-2.5 rounded-xl bg-white border border-[#2D5A1E]/20 text-[#2D5A1E] text-xs font-bold uppercase tracking-wider hover:bg-[#F2F8ED] transition-all flex items-center space-x-2 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Counts</span>
          </button>
        </div>
      </div>

      {/* Info Notice */}
      <div className="p-4 rounded-2xl bg-[#F2F8ED] border border-[#8CC63F]/40 flex items-start space-x-3 text-[#172B15]">
        <Info className="w-5 h-5 text-[#2D5A1E] shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold uppercase tracking-wider text-[11px] text-[#2D5A1E]">
            Immutable System Roles
          </p>
          <p className="text-neutral-600 leading-relaxed">
            Role scopes and access boundaries are cryptographically enforced by FastAPI route dependencies. Assign numeric <strong>role_id</strong> parameters in the Staff Roster to attach staff members to these security profiles.
          </p>
        </div>
      </div>

      {/* Two-Column Grid: Role Cards on Left, Permission Matrix on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Role Selector Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center space-x-2 pb-2">
            <Layers className="w-4 h-4 text-[#2D5A1E]" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#172B15]">Configured Roles</h2>
          </div>

          <div className="space-y-3">
            {SYSTEM_ROLES.map((role) => {
              const count = roleCounts[role.id] || 0;
              const isSelected = selectedRole.id === role.id;

              return (
                <motion.div
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? "bg-[#172B15] text-white border-[#172B15] shadow-lg shadow-[#172B15]/10"
                      : "bg-white text-neutral-800 border-[#2D5A1E]/15 hover:border-[#639E1F] shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                          isSelected ? "bg-[#8CC63F]/20 text-[#8CC63F] border border-[#8CC63F]/30" : role.badgeColor
                        }`}>
                          Role #{role.id}
                        </span>
                        <span className="text-[10px] font-mono uppercase tracking-wider opacity-60">
                          {role.staffType}
                        </span>
                      </div>
                      <h3 className="text-base font-medium tracking-tight pt-1">{role.name}</h3>
                    </div>

                    <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      isSelected ? "bg-white/10 text-white" : "bg-[#FAFAF7] text-neutral-600 border border-neutral-200"
                    }`}>
                      <Users className="w-3.5 h-3.5 opacity-70" />
                      <span>{loading ? "..." : `${count} Active`}</span>
                    </div>
                  </div>

                  <p className={`text-xs mt-3 line-clamp-2 leading-relaxed ${
                    isSelected ? "text-neutral-300 font-normal" : "text-neutral-500 font-normal"
                  }`}>
                    {role.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Permission Breakdown */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center space-x-2 pb-2">
            <KeyRound className="w-4 h-4 text-[#2D5A1E]" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#172B15]">
              Privilege Scope: <span className="text-[#639E1F]">{selectedRole.name}</span>
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-[#2D5A1E]/15 overflow-hidden shadow-sm space-y-6 p-6">
            
            <div className="space-y-2 pb-4 border-b border-neutral-100">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#2D5A1E]" />
                <h3 className="text-lg font-light text-[#172B15]">{selectedRole.name}</h3>
                <span className="font-mono text-xs text-neutral-400">({selectedRole.staffType})</span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                {selectedRole.description}
              </p>
            </div>

            {/* Permission Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-neutral-200/80 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                    <th className="py-3 px-4">System Domain</th>
                    <th className="py-3 px-3 text-center">Read</th>
                    <th className="py-3 px-3 text-center">Create</th>
                    <th className="py-3 px-3 text-center">Update</th>
                    <th className="py-3 px-3 text-center">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-xs">
                  {selectedRole.permissions.map((perm, idx) => (
                    <tr key={idx} className="hover:bg-[#FAFAF7] transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-[#172B15]">
                        {perm.module}
                      </td>

                      {/* Read */}
                      <td className="py-3.5 px-3 text-center">
                        {perm.view ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-600">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-neutral-100 text-neutral-400">
                            <X className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>

                      {/* Create */}
                      <td className="py-3.5 px-3 text-center">
                        {perm.create ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-600">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-neutral-100 text-neutral-400">
                            <X className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>

                      {/* Update */}
                      <td className="py-3.5 px-3 text-center">
                        {perm.edit ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-600">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-neutral-100 text-neutral-400">
                            <X className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>

                      {/* Delete */}
                      <td className="py-3.5 px-3 text-center">
                        {perm.delete ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-600">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-neutral-100 text-neutral-400">
                            <X className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Quick Action Footer */}
            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                To assign this profile: set role_id = {selectedRole.id}
              </span>
              <Link
                href="/admin/staff"
                className="px-4 py-2 rounded-xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] transition-all shadow-sm flex items-center space-x-1.5"
              >
                <span>Assign in Staff Roster</span>
              </Link>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}