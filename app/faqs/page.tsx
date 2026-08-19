"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, Plus, Minus, Search, Sparkles } from "lucide-react";
import LuxuryFooter from "../components/LuxuryFooter";
import LuxuryNavbar from "../components/Navbar";

export default function FaqsPage() {
  const [openId, setOpenId] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: "All Questions" },
    { id: "business", label: "IBO & Opportunities" },
    { id: "products", label: "Products & Authenticity" },
    { id: "orders", label: "Orders & Shipping" },
    { id: "returns", label: "Returns & Guarantees" },
  ];

  const faqs = [
    {
      category: "business",
      q: "How do I become an EnergyMax Independent Business Owner (IBO)?",
      a: "You can register by completing our official application form online or through an existing verified IBO in your region. Applicants must provide valid identification details, comply with our direct selling code of conduct, and agree to our terms of use."
    },
    {
      category: "business",
      q: "What are the core requirements to maintain an active IBO status?",
      a: "IBOs must operate with total transparency, adhere strictly to Quality Assurance Standards (QAS), avoid unauthorized retail placement, and maintain ethical business promotion practices as outlined in our Rules of Conduct."
    },
    {
      category: "products",
      q: "Where can I buy original EnergyMax and maXilin products?",
      a: "Authentic EnergyMax products are sold exclusively through authorized Independent Business Owners (IBOs) or directly on our official website www.energymaxgroup.com. We do not authorize sales on third-party market platforms like Amazon, Flipkart, Meesho, or Healthkart."
    },
    {
      category: "products",
      q: "Why should I avoid purchasing EnergyMax products from third-party e-commerce sites?",
      a: "Purchasing through unauthorized channels poses safety and health risks because product storage, authenticity, and handling cannot be verified. Furthermore, unauthorized purchases forfeit your eligibility for our 30-day money-back guarantee."
    },
    {
      category: "orders",
      q: "What is the delivery timeline for orders placed online?",
      a: "Standard doorstep delivery typically takes 3 to 5 business days across our extensive network of 17,000+ supported pin codes throughout the Republic of India. Shipments are fully tracked and dispatched within 24–48 hours."
    },
    {
      category: "orders",
      q: "How can I track my shipment once an order is placed?",
      a: "Once your order is processed and dispatched, you will receive real-time tracking updates via SMS, registered email, and our official WhatsApp Business communication channel."
    },
    {
      category: "returns",
      q: "How does the 30-day money-back guarantee work?",
      a: "If you purchase through authorized channels and are not completely satisfied, you may return products within 30 days of the invoice date for a full refund or exchange as per our structured Product Return & Refund Policy."
    },
    {
      category: "returns",
      q: "What constitutes a 'Marketable Product' versus a 'Partially Used Product' for returns?",
      a: "Marketable Products refer to unopened, unused, non-expired items in original condition. Partially Used Products apply when no more than 30% of the contents have been consumed, leaving at least 70% remaining, accompanied by a valid invoice."
    },
    {
      category: "business",
      q: "How is Goods and Services Tax (GST) handled for direct selling transactions?",
      a: "EnergyMax Group operates under a centralized Goods and Services Tax (CGST) framework in accordance with Indian taxation laws, ensuring transparent tax invoices and compliance across all state jurisdictions."
    },
    {
      category: "returns",
      q: "What is the cooling-off period for new IBO registrations?",
      a: "New Independent Business Owners are entitled to a 90-day cooling-off period from the date of joining, during which they may terminate their contract and return all saleable products and starter materials purchased for a complete refund."
    }
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch = faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || faq.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#172B15] font-sans selection:bg-[#8CC63F]/30">
      <LuxuryNavbar />
      
      {/* Header Banner */}
      <section className="relative py-16 sm:py-20 lg:py-28 bg-[#172B15] text-white overflow-hidden border-b border-[#2D5A1E]/30">
        <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(#8CC63F_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#8CC63F]/15 border border-[#8CC63F]/30 backdrop-blur-md">
            <HelpCircle className="w-4 h-4 text-[#8CC63F]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8CC63F]">
              Help & Knowledge Base
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-light tracking-tight text-white">
            Frequently Asked <span className="font-serif italic text-[#8CC63F]">Questions</span>
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 font-normal max-w-2xl mx-auto leading-relaxed">
            Detailed answers regarding orders, direct selling guidelines, product authentication, shipping procedures, and refund policies.
          </p>
        </div>
      </section>

      {/* Main Search & FAQ Section */}
      <section className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-12 lg:py-20 space-y-10">
        
        {/* Search Bar & Category Filter */}
        <div className="space-y-6">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your questions (e.g. delivery, returns, IBO)..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-[#2D5A1E]/20 text-xs sm:text-sm focus:outline-none focus:border-[#2D5A1E] shadow-sm"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                  selectedCategory === cat.id
                    ? "bg-[#2D5A1E] text-white shadow-md"
                    : "bg-white text-neutral-600 border border-[#2D5A1E]/15 hover:border-[#639E1F]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openId === idx;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden bg-white ${
                    isOpen ? "border-[#639E1F] shadow-lg shadow-[#2D5A1E]/5" : "border-[#2D5A1E]/15 hover:border-[#639E1F]/40 shadow-sm"
                  }`}
                >
                  <button
                    onClick={() => setOpenId(isOpen ? null : idx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none group"
                  >
                    <span className="text-sm font-medium text-[#172B15] tracking-tight group-hover:text-[#639E1F] transition-colors pr-4">
                      {faq.q}
                    </span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 ${
                      isOpen ? "bg-[#2D5A1E] text-white" : "bg-[#8CC63F]/10 text-[#2D5A1E] group-hover:bg-[#8CC63F]/20"
                    }`}>
                      {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed border-t border-neutral-100">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-[#2D5A1E]/15 p-8">
              <p className="text-xs sm:text-sm text-neutral-500">No matching questions found. Please try another search term or contact support.</p>
            </div>
          )}
        </div>

        {/* Additional Help Callout */}
        <div className="mt-12 p-8 rounded-3xl bg-[#172B15] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8CC63F]">
              Need Further Assistance?
            </span>
            <h3 className="text-lg sm:text-xl font-light">
              Have a question not covered here?
            </h3>
            <p className="text-xs text-neutral-300">
              Our support team is available Monday through Saturday to help you.
            </p>
          </div>

          <a
            href="/grievance"
            className="px-6 py-3.5 rounded-xl bg-[#8CC63F] text-[#172B15] text-xs font-bold uppercase tracking-wider hover:bg-[#7AB82A] transition-all shadow-md shrink-0"
          >
            Contact Support Desk
          </a>
        </div>

      </section>

      <LuxuryFooter />
    </div>
  );
}