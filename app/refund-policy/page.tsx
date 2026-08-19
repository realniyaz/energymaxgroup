"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ChevronRight, RefreshCw } from "lucide-react";
import LuxuryFooter from "../components/LuxuryFooter";
import LuxuryNavbar from "../components/Navbar";

export default function ProductReturnAndRefundPolicyPage() {
  const [activeSection, setActiveSection] = useState("satisfaction-guarantee");

  const sections = [
    { id: "satisfaction-guarantee", label: "1. Customer Satisfaction Guarantee" },
    { id: "applicability", label: "2. Applicability & Exclusions" },
    { id: "definitions", label: "3. Product Definitions" },
    { id: "returns-policy", label: "4. Returns Policy for IBOs & PCs" },
    { id: "logistics", label: "5. Return Process & Logistics" },
    { id: "assessment", label: "6. Product Condition Assessment" },
    { id: "refund-process", label: "7. Refund Process & Timelines" },
    { id: "pv-bv", label: "8. PV/BV Adjustments" },
    { id: "gst", label: "9. GST & Interstate Returns" },
    { id: "replacement", label: "10. Replacement & Exchange" },
    { id: "cooling-off", label: "11. Cooling-Off Period" },
    { id: "support", label: "12. Customer Support & Grievance" },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#172B15] font-sans selection:bg-[#8CC63F]/30">
      <LuxuryNavbar />
      
      {/* Header Banner */}
      <section className="relative py-16 sm:py-20 lg:py-28 bg-[#172B15] text-white overflow-hidden border-b border-[#2D5A1E]/30">
        <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(#8CC63F_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#8CC63F]/15 border border-[#8CC63F]/30 backdrop-blur-md">
            <RefreshCw className="w-4 h-4 text-[#8CC63F]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8CC63F]">
              Consumer Protection & Trust
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-light tracking-tight text-white">
            Product Return & <span className="font-serif italic text-[#8CC63F]">Refund Policy</span>
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 font-normal max-w-2xl mx-auto leading-relaxed">
            EnergyMax Group stands behind the quality of its products with a 30-day customer satisfaction guarantee. Read our complete return, refund, and replacement guidelines.
          </p>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Navigation Menu */}
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <div className="p-4 sm:p-6 rounded-3xl bg-white border border-[#2D5A1E]/15 shadow-sm space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block mb-3 px-2">
                Policy Index
              </span>
              
              <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible space-x-2 lg:space-x-0 lg:space-y-1 pb-2 lg:pb-0 no-scrollbar">
                {sections.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`whitespace-nowrap lg:whitespace-normal w-full text-left px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-between shrink-0 ${
                      activeSection === item.id
                        ? "bg-[#2D5A1E] text-white shadow-md"
                        : "text-neutral-700 hover:bg-[#F2F8ED] hover:text-[#2D5A1E]"
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60 hidden lg:block" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-12 rounded-3xl border border-[#2D5A1E]/15 shadow-xl shadow-[#2D5A1E]/5 space-y-12">
            
            {/* Section 1 */}
            <div id="satisfaction-guarantee" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                1. Customer Satisfaction Guarantee
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                EnergyMax Group stands behind the quality of its products and is committed to ensuring customer satisfaction. If for any reason you are not completely satisfied with the products, it may be returned within 30 days from the date of the invoice for a refund, subject to the terms of this Policy.
              </p>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                This Policy applies to returns of products by Independent Business Owners (“IBOs”), Preferred Customers, and retail customers, provided that such products are either Marketable Products or Partially Used Products, and are accompanied by a valid invoice or customer receipt. Customers and Preferred Customers may initiate returns either directly with EnergyMax or through the concerned IBO.
              </p>
            </div>

            {/* Section 2 */}
            <div id="applicability" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                2. Applicability & Exclusions
              </h2>
              <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                <li className="flex items-start space-x-2">
                  <span className="text-[#639E1F] font-bold">&bull;</span>
                  <span>This policy shall not apply to products that have been intentionally damaged or misused.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-[#639E1F] font-bold">&bull;</span>
                  <span>This Policy applies exclusively to purchases made through our authorized channels i.e. EnergyMax website, EnergyMax mobile application, EnergyMax Shops or IBOs only.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-[#639E1F] font-bold">&bull;</span>
                  <span>EnergyMax products purchased through unauthorized channels shall not be eligible for return, refund, or any benefits under this Policy.</span>
                </li>
              </ul>
            </div>

            {/* Section 3 */}
            <div id="definitions" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                3. Product Definitions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-[#F2F8ED]/60 border border-[#8CC63F]/30 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D5A1E]">Marketable Products</h4>
                  <p className="text-xs text-neutral-600">Unopened, unused, not expired, and not part of seasonal or discontinued items.</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#F2F8ED]/60 border border-[#8CC63F]/30 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D5A1E]">Partially Used</h4>
                  <p className="text-xs text-neutral-600">Products of which no more than 30% of contents have been used (at least 70% remains).</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#F2F8ED]/60 border border-[#8CC63F]/30 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D5A1E]">Excess Stock</h4>
                  <p className="text-xs text-neutral-600">Products greater than or equal to six (6) units of the same product/SKU.</p>
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div id="returns-policy" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                4. Returns Policy for IBOs / PCs
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                Summary of return conditions, time periods, invoice requirements, and refund bases (DAP = Distributor Acquisition Price):
              </p>
              
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#172B15] text-white">
                      <th className="p-3">Product Category</th>
                      <th className="p-3">Time Period</th>
                      <th className="p-3">Invoice Req.</th>
                      <th className="p-3">Refund Basis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 text-neutral-700">
                    <tr>
                      <td className="p-3 font-medium">Marketable Products</td>
                      <td className="p-3">Within 30 days</td>
                      <td className="p-3">Yes</td>
                      <td className="p-3">DAP</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Marketable Products</td>
                      <td className="p-3">Within 30 days</td>
                      <td className="p-3">No</td>
                      <td className="p-3">DAP less GST</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Partially Used Products</td>
                      <td className="p-3">Within 30 days</td>
                      <td className="p-3">Yes</td>
                      <td className="p-3">DAP less GST</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Partially Used Products</td>
                      <td className="p-3">Within 30 days</td>
                      <td className="p-3">No</td>
                      <td className="p-3">DAP less GST</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Excess Stock</td>
                      <td className="p-3">Within 60 days</td>
                      <td className="p-3">Yes</td>
                      <td className="p-3">DAP</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Excess Stock</td>
                      <td className="p-3">Within 60 days</td>
                      <td className="p-3">No</td>
                      <td className="p-3">DAP less GST</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 5 */}
            <div id="logistics" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                5. Return Process & Logistics
              </h2>
              <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                <li className="flex items-start space-x-2">
                  <span className="text-[#639E1F] font-bold">&bull;</span>
                  <span>Return requests may be raised by sending an email to <a href="mailto:returns@energymaxgroup.com" className="text-[#2D5A1E] underline font-medium">returns@energymaxgroup.com</a> or visiting an authorized Pickup Center or Store.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-[#639E1F] font-bold">&bull;</span>
                  <span>Reverse pickup may be available for home deliveries in select locations subject to operational feasibility. Where unavailable, returns must be shipped/brought to the nearest EnergyMax shop.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-[#639E1F] font-bold">&bull;</span>
                  <span>This Policy does not apply to open packs of literature, videos, or other sales aids. Excess stock returned by IBOs must comprise Marketable Products.</span>
                </li>
              </ul>
            </div>

            {/* Section 6 */}
            <div id="assessment" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                6. Product Condition Assessment
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                All returned products are subject to quality inspection and condition assessment by EnergyMax. In the event of rejection, the requester will be notified along with reasons.
              </p>
            </div>

            {/* Section 7 */}
            <div id="refund-process" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                7. Refund Process & Timelines
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                Refunds shall be processed within 7–14 working days from receipt and verification. Refunds are credited to the original payment mode or bank account, or issued via demand draft if necessary.
              </p>
            </div>

            {/* Section 8 */}
            <div id="pv-bv" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                8. PV/BV Adjustments
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                PV/BV adjustments for returns made by or on the 25th of each month are processed in the current month; returns after the 25th are processed the following month. Direct returns by customers without IBO routing will also result in deductions from the IBO account.
              </p>
            </div>

            {/* Section 9 */}
            <div id="gst" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                9. GST & Interstate Returns
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                For interstate returns, applicable GST shall be deducted. Users are advised to return products within the same state as mentioned on the invoice to avoid deductions.
              </p>
            </div>

            {/* Section 10 */}
            <div id="replacement" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                10. Replacement & Exchange
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                Products with manufacturing defects, transit damage, or incorrect delivery are eligible for replacement or exchange if notified promptly and returned within 30 days of invoice date.
              </p>
            </div>

            {/* Section 11 */}
            <div id="cooling-off" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                11. Cooling-Off Period
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                If an IBO Contract is terminated within the Cooling-Off Period of 90 days from joining, the new IBO is entitled to return all saleable products and materials purchased within that period for a full refund.
              </p>
            </div>

            {/* Section 12 */}
            <div id="support" className="space-y-4 pt-4 scroll-mt-28 bg-[#F2F8ED] p-6 rounded-2xl border border-[#8CC63F]/30">
              <h2 className="text-base sm:text-xl font-bold text-[#172B15] tracking-tight">
                12. Customer Support & Grievance Redressal
              </h2>
              <p className="text-xs sm:text-sm text-neutral-700 font-normal leading-relaxed">
                For return queries or escalations, contact EnergyMax customer support or consult the Grievance Redressal Officer in accordance with applicable laws.
              </p>
              <div className="text-xs sm:text-sm text-[#172B15] font-medium space-y-1 pt-2">
                <p><strong className="text-[#2D5A1E]">Registered Address:</strong> B 28 Manaar Tower, Noida - 132, Uttar Pradesh - 201304</p>
                <p><strong className="text-[#2D5A1E]">Support Email:</strong> care@energymaxgroup.com</p>
                <p><strong className="text-[#2D5A1E]">Helpline:</strong> +91 120 466 4253</p>
              </div>
            </div>

          </div>

        </div>
      </section>

      <LuxuryFooter />
    </div>
  );
}