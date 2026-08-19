"use client";

import React from "react";
import { motion } from "framer-motion";
import { Headphones, MapPin, Mail, PhoneCall } from "lucide-react";
import LuxuryFooter from "../components/LuxuryFooter";
import LuxuryNavbar from "../components/Navbar";

export default function GrievanceRedressalPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#172B15] font-sans selection:bg-[#8CC63F]/30">
      <LuxuryNavbar />
      
      <section className="relative py-16 sm:py-20 lg:py-28 bg-[#172B15] text-white overflow-hidden border-b border-[#2D5A1E]/30">
        <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(#8CC63F_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#8CC63F]/15 border border-[#8CC63F]/30 backdrop-blur-md">
            <Headphones className="w-4 h-4 text-[#8CC63F]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8CC63F]">
              Support & Redressal Desk
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-light tracking-tight text-white">
            Consumer Helpline & <span className="font-serif italic text-[#8CC63F]">Grievance Redressal</span>
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 font-normal max-w-2xl mx-auto leading-relaxed">
            We are dedicated to resolving all inquiries, feedback, and grievances promptly and transparently.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-12 lg:py-24">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#2D5A1E]/15 shadow-xl shadow-[#2D5A1E]/5 space-y-6">
          <h2 className="text-xl font-light text-[#172B15] border-b border-neutral-100 pb-3">
            Grievance Redressal Mechanism
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
            In compliance with consumer protection and direct selling guidelines, EnergyMax Group maintains an active grievance redressal desk to address any customer or distributor concerns.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="p-5 rounded-2xl bg-[#F2F8ED] border border-[#8CC63F]/30 space-y-2">
              <div className="flex items-center space-x-2 text-[#2D5A1E]">
                <MapPin className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Corporate Office</h4>
              </div>
              <p className="text-xs text-neutral-700">B 28 Manaar Tower, Noida - 132, Uttar Pradesh - 201304</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F2F8ED] border border-[#8CC63F]/30 space-y-2">
              <div className="flex items-center space-x-2 text-[#2D5A1E]">
                <PhoneCall className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Helpline</h4>
              </div>
              <p className="text-xs text-neutral-700">+91 120 466 4253</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F2F8ED] border border-[#8CC63F]/30 space-y-2 sm:col-span-2">
              <div className="flex items-center space-x-2 text-[#2D5A1E]">
                <Mail className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Email Assistance</h4>
              </div>
              <p className="text-xs text-neutral-700">care@energymaxgroup.com (Mon–Sat, 9:00 AM – 6:00 PM IST)</p>
            </div>
          </div>
        </div>
      </section>

      <LuxuryFooter />
    </div>
  );
}