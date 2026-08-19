"use client";

import React from "react";
import Image from "next/image";

export default function LuxuryFooter() {
  return (
    <footer className="w-full bg-[#172B15] text-[#F2F7EC] font-sans pt-16 pb-12 border-t border-[#2D5A1E]/30">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Main Footer Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          
          {/* Column 1: Policies & Compliance (MLM & D2C) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-[#8CC63F]">
              Policies & Compliance
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-300 font-normal">
              <li><a href="/terms-and-conditions" className="hover:text-[#8CC63F] transition-colors">Terms Of Use & D2C Agreement</a></li>
              <li><a href="/privacy-policy" className="hover:text-[#8CC63F] transition-colors">Privacy Policy</a></li>
              <li><a href="/rules-of-conduct" className="hover:text-[#8CC63F] transition-colors">Direct Selling & Rules Of Conduct</a></li>
              <li><a href="/refund-policy" className="hover:text-[#8CC63F] transition-colors">Product Return & Refund Policy</a></li>
              <li><a href="/authorised-channels" className="hover:text-[#8CC63F] transition-colors">Authorized Sales Channels</a></li>
              <li><a href="/advisory" className="hover:text-[#8CC63F] transition-colors">Direct Seller / Distributor Advisory</a></li>
              <li><a href="/whatsapp-terms" className="hover:text-[#8CC63F] transition-colors">WhatsApp Communication T&C</a></li>
            </ul>
          </div>

          {/* Column 2: Useful Links & Direct Selling Portal */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-[#8CC63F]">
              Useful Links
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-300 font-normal">
              <li><a href="/careers" className="hover:text-[#8CC63F] transition-colors">Careers & Global Opportunity</a></li>
              <li><a href="/search-distributors" className="hover:text-[#8CC63F] transition-colors">Search Independent Business Owners</a></li>
              <li><a href="/faqs" className="hover:text-[#8CC63F] transition-colors">Frequently Asked Questions</a></li>
              <li><a href="/gst-details" className="hover:text-[#8CC63F] transition-colors">GST Registration Details</a></li>
              <li><a href="/shipping-procedures" className="hover:text-[#8CC63F] transition-colors">Shipping and Logistics Procedures</a></li>
              <li><a href="/grievance" className="hover:text-[#8CC63F] transition-colors">Consumer Helpline & Grievance Redressal</a></li>
            </ul>
          </div>

          {/* Column 3: Connect With Us & Social Media SVGs */}
          <div className="lg:col-span-3 space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-[#8CC63F]">
              Connect With Us
            </h4>

            {/* Social Media SVG Icons */}
            <div className="flex items-center space-x-3.5">
              {/* Instagram */}
              <a href="#instagram" aria-label="Instagram" className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#8CC63F] hover:text-[#172B15] text-white flex items-center justify-center transition-all">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              {/* Facebook */}
              <a href="#facebook" aria-label="Facebook" className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#8CC63F] hover:text-[#172B15] text-white flex items-center justify-center transition-all">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </a>

              {/* X / Twitter */}
              <a href="#twitter" aria-label="Twitter" className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#8CC63F] hover:text-[#172B15] text-white flex items-center justify-center transition-all">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>

              {/* YouTube */}
              <a href="#youtube" aria-label="YouTube" className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#8CC63F] hover:text-[#172B15] text-white flex items-center justify-center transition-all">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                </svg>
              </a>

              {/* Linkedin */}
              <a href="#linkedin" aria-label="Linkedin" className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#8CC63F] hover:text-[#172B15] text-white flex items-center justify-center transition-all">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
</svg>
              </a>
            </div>

            <p className="text-xs text-neutral-300 font-normal leading-relaxed pt-2">
              Write to us for compliance, complaints, and direct selling suggestions. Access the <a href="#app" className="text-[#8CC63F] underline underline-offset-2">EnergyMax Connect Mobile App</a> here for wellness support.
            </p>
          </div>

          {/* Column 4: Registered Entity & Corporate Address Details */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-[#8CC63F]">
              Corporate Headquarters
            </h4>
            
            <div className="space-y-2 text-xs text-neutral-300 font-normal leading-relaxed">
              <p className="font-semibold text-white">EnergyMax Group Global Pvt. Ltd.</p>
              <p>Regd. Office: B 28 Manaar Tower, Noida - 132, Uttar Pradesh - 201304</p>
              <p className="pt-2">For Queries, Direct Selling Inquiries, and Grievances, please contact our Compliance Officer.</p>
              <p className="pt-1">
                <span className="text-white font-medium">Email ID:</span> <a href="mailto:care@energymaxgroup.com" className="text-[#8CC63F] underline">care@energymaxgroup.com</a><br />
                <span className="text-white font-medium">Helpline:</span> +91 120 466 4253<br />
                <span className="text-white font-medium">CIN:</span> U46309UP2025PTC236460<br />
                <span className="text-white font-medium">FSSAI:</span> 12725999000778
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Sitemap */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 space-y-4 sm:space-y-0">
          <p>© 2026 EnergyMax Group International Pvt. Ltd. All Rights Reserved. Compliant with Direct Selling Guidelines & D2C Standards.</p>
          
          <div className="flex items-center space-x-6">
            <a href="#sitemap" className="hover:text-[#8CC63F] transition-colors">Site Map</a>
            <span>&bull;</span>
            <a href="#compliance-legal" className="hover:text-[#8CC63F] transition-colors">Legal Disclaimers</a>
          </div>
        </div>

      </div>
    </footer>
  );
}