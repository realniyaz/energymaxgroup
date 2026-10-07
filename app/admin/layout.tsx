"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  ShieldCheck, 
  Menu, 
  X, 
  Network,
  LogOut,
  ShieldAlert,
  Users,
  KeyRound,
  ChevronDown,
  User,
  Settings,
  ShoppingBag
} from "lucide-react";
import { AdminAuthProvider, useAdminAuth } from "@/context/admin-auth-context";

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

function AdminLayoutContent({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAdminAuth();

  // Manage open state for collapsible sub-menus
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    "/admin/staff": pathname.startsWith("/admin/staff"),
  });

  const isLoginPage = pathname === "/admin/login";

  // Automatically keep sub-menus expanded when navigating
  useEffect(() => {
    if (pathname.startsWith("/admin/staff")) {
      setOpenMenus((prev) => ({ ...prev, "/admin/staff": true }));
    }
  }, [pathname]);

  useEffect(() => {
    if (!loading && !user && !isLoginPage) {
      router.replace("/admin/login");
    }
  }, [user, loading, isLoginPage, router]);

  const toggleSubMenu = (href: string) => {
    setOpenMenus((prev) => ({ ...prev, [href]: !prev[href] }));
  };

  // Render standalone layout for the login page without shell wrapper
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Prevent UI flashing while session is validating
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#8CC63F]/20 border-t-[#8CC63F] rounded-full animate-spin" />
        <span className="text-xs font-bold uppercase tracking-widest text-[#172B15]">
          Authenticating Admin Session...
        </span>
      </div>
    );
  }

  // Guard: Block rendering of protected pages if unauthenticated
  if (!user) {
    return null;
  }

  const navLinks: NavItem[] = [
    { href: "/admin/dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
    { 
      href: "/admin/staff", 
      label: "Staff & Governance", 
      icon: Users,
      children: [
        { href: "/admin/staff", label: "Staff Roster", icon: Users },
        { href: "/admin/staff/roles", label: "Roles & Permissions", icon: KeyRound },
        { href: "/admin/users", label: "User Management", icon: User },
        { href: "/admin/access-control", label: "Access-Control", icon: Settings },
      ]
    },
    { href: "/admin/categories", label: "Categories", icon: Network },
    { href: "/admin/products", label: "Product Inventory", icon: Package },
    { href: "/admin/products/create", label: "Add New Product", icon: PlusCircle },
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { href: "/admin/sessions", label: "Active Sessions", icon: ShieldAlert },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#172B15] font-sans selection:bg-[#8CC63F]/30 flex flex-col lg:flex-row overflow-x-hidden">
      
      {/* Mobile Header Toggle */}
      <div className="lg:hidden flex items-center justify-between px-6 py-3 bg-[#172B15] text-white border-b border-[#2D5A1E]/30 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-sm shrink-0">
            <Image
              src="/logo1.png"
              alt="EnergyMax Group"
              width={34}
              height={34}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#8CC63F] block leading-none">
              Control Panel
            </span>
            <span className="text-xs font-serif text-white tracking-tight">EnergyMax Portal</span>
          </div>
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl bg-white/10 text-white focus:outline-none hover:bg-white/20 transition-colors"
          aria-label="Toggle Menu"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Admin Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-[#172B15] text-white p-6 flex flex-col justify-between border-r border-[#2D5A1E]/30 transition-transform duration-300 lg:translate-x-0
        ${sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
      `}>
        <div className="space-y-6">
          
          {/* Brand & Logo Header Box with White Background */}
          <Link 
            href="/admin/dashboard" 
            className="flex items-center space-x-3.5 p-2 rounded-2xl hover:bg-white/5 transition-colors group"
          >
            <div className="w-12 h-12 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-md shadow-black/20 shrink-0 group-hover:scale-105 transition-transform">
              <Image
                src="/logo1.png"
                alt="EnergyMax Group Logo"
                width={42}
                height={42}
                className="object-contain"
                priority
              />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8CC63F] block">
                Control Center
              </span>
              <h2 className="text-base font-serif tracking-tight text-white group-hover:text-[#8CC63F] transition-colors leading-tight">
                EnergyMax <span className="italic font-light text-neutral-200">Portal</span>
              </h2>
            </div>
          </Link>

          {/* Navigation Links with Sub-Navigation Accordion */}
          <nav className="space-y-1.5 pt-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const hasChildren = link.children && link.children.length > 0;
              const isParentActive = pathname.startsWith(link.href);
              const isOpen = !!openMenus[link.href];

              if (hasChildren) {
                return (
                  <div key={link.href} className="space-y-1">
                    {/* Collapsible Parent Button */}
                    <button
                      type="button"
                      onClick={() => toggleSubMenu(link.href)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                        isParentActive
                          ? "bg-white/10 text-white border border-white/10"
                          : "text-neutral-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-4 h-4 ${isParentActive ? "text-[#8CC63F]" : "text-neutral-400"}`} />
                        <span>{link.label}</span>
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
                          isOpen ? "transform rotate-180 text-[#8CC63F]" : ""
                        }`}
                      />
                    </button>

                    {/* Sub-Items List */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden pl-5 pr-1 space-y-1 border-l-2 border-[#8CC63F]/20 ml-5 my-1"
                        >
                          {link.children?.map((sub) => {
                            const SubIcon = sub.icon;
                            const isSubActive = pathname === sub.href;

                            return (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-all ${
                                  isSubActive
                                    ? "bg-[#8CC63F]/20 text-[#8CC63F] border border-[#8CC63F]/30 shadow-sm"
                                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                                }`}
                              >
                                <SubIcon className="w-3.5 h-3.5" />
                                <span>{sub.label}</span>
                              </Link>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              // Standard Single Item
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    isActive
                      ? "bg-[#8CC63F]/20 text-[#8CC63F] border border-[#8CC63F]/30 shadow-sm"
                      : "text-neutral-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Security Footer & Session Management */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center space-x-2 text-[#8CC63F]">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest truncate">{user.username}</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-snug">
              {user.is_super_admin ? "Super Admin Access" : "Staff Access"}
            </p>
          </div>

          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold uppercase tracking-wider hover:bg-red-500/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for Mobile Sidebar */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
        />
      )}

      {/* Main Admin Content Wrapper */}
      <main className="flex-1 lg:ml-72 min-h-screen bg-[#FAFAF7] p-6 sm:p-10 lg:p-12">
        {children}
      </main>

    </div>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminAuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminAuthProvider>
  );
}