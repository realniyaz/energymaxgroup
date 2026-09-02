"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { Shield, Monitor, Globe, Trash2 } from "lucide-react";

interface Session {
  public_id: string;
  expires_at: string;
  revoked_at: string | null;
  last_used_at: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const res = await apiClient.get<Session[]>("/api/v1/admin/auth/sessions");
      setSessions(res.data);
    } catch {
      // Handle error gracefully
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevokeAll = async () => {
    if (confirm("Are you sure you want to log out from all devices?")) {
      await apiClient.post("/api/v1/admin/auth/logout-all");
      window.location.href = "/admin/login";
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#8CC63F]">Security Controls</span>
          <h1 className="text-2xl font-serif text-[#172B15]">Active Admin Sessions</h1>
        </div>
        <button
          onClick={handleRevokeAll}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-all shadow-sm"
        >
          <Trash2 className="w-4 h-4" />
          <span>Logout All Devices</span>
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-neutral-500">Loading sessions...</div>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => (
            <div key={session.public_id} className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#172B15]">
                  <Monitor className="w-4 h-4 text-[#8CC63F]" />
                  <span className="truncate max-w-md">{session.user_agent}</span>
                </div>
                <div className="flex items-center space-x-4 text-[11px] text-neutral-500">
                  <span className="flex items-center space-x-1">
                    <Globe className="w-3.5 h-3.5" />
                    <span>{session.ip_address}</span>
                  </span>
                  <span>Last used: {new Date(session.last_used_at).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${session.revoked_at ? "bg-red-100 text-red-700" : "bg-[#8CC63F]/20 text-[#2D5A1E]"}`}>
                  {session.revoked_at ? "Revoked" : "Active"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}