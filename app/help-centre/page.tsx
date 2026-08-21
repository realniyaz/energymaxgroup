"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, HelpCircle, Mail, Phone, MapPin, Send, MessageSquare, CheckCircle, Clock } from "lucide-react";
import LuxuryNavbar from "../components/Navbar";
import LuxuryFooter from "../components/LuxuryFooter";

const faqs = [
  {
    category: "Products & Usage",
    question: "What makes EnergyMax probiotic formulations clinical-grade?",
    answer: "Our formulations combine 40 billion CFU active live microbial strains engineered at the molecular tier to survive gastric acidity, ensuring maximum bio-availability and targeted gut microbiome colonization."
  },
  {
    category: "Products & Usage",
    question: "How should probiotic sticks or liquid core bottles be stored?",
    answer: "Store in a cool, dry place away from direct sunlight. Our advanced packaging guarantees potency and live culture preservation throughout shelf life without requiring refrigeration."
  },
  {
    category: "Partnerships",
    question: "How can I become an official EnergyMax Group partner?",
    answer: "You can collaborate with us by reaching out through our partnership desk or contacting our regional headquarters. We equip our partners with world-class wellness products, trusted brands, and ready-to-use business tools."
  },
  {
    category: "Shipping & Orders",
    question: "What are the regional availability and shipping standards?",
    answer: "EnergyMax Group operates globally with regional offices and distribution networks across Central Asia, the UAE, and international markets. Standard orders are processed swiftly through our logistics hubs."
  }
];

export default function HelpCentrePage() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "General Inquiry",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#172B15] font-sans selection:bg-[#8CC63F]/30 overflow-x-hidden">
      <LuxuryNavbar />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-[#172B15] text-white overflow-hidden border-b border-[#2D5A1E]/30">
        <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(#8CC63F_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#8CC63F]/15 border border-[#8CC63F]/30 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-[#8CC63F]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8CC63F]">
              Global Support Desk &bull; Help Centre
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight text-white leading-[1.15]">
            How can we <span className="font-serif italic text-[#8CC63F]">assist you</span> today?
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 font-normal max-w-2xl mx-auto leading-relaxed">
            Whether you have inquiries about our clinical-grade probiotic formulations, partnership opportunities, or order tracking, our global support specialists are here to help.
          </p>
        </div>
      </section>

      {/* Help Desk Info Cards */}
      <section className="py-16 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 -mt-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 p-8 shadow-xl shadow-[#2D5A1E]/5 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center mx-auto">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold uppercase tracking-wider text-[#172B15]">Direct Support</h3>
            <p className="text-xs text-neutral-600">Available Monday through Saturday for urgent inquiries and partner assistance.</p>
            <span className="text-xs font-bold text-[#639E1F] block pt-1">+91 120 466 4253</span>
          </div>

          <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 p-8 shadow-xl shadow-[#2D5A1E]/5 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center mx-auto">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold uppercase tracking-wider text-[#172B15]">Email Desk</h3>
            <p className="text-xs text-neutral-600">Send us your detailed queries anytime and our team will respond within 24 hours.</p>
            <span className="text-xs font-bold text-[#639E1F] block pt-1">care@energymaxgroup.com</span>
          </div>

          <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 p-8 shadow-xl shadow-[#2D5A1E]/5 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center mx-auto">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold uppercase tracking-wider text-[#172B15]">Global Headquarters</h3>
            <p className="text-xs text-neutral-600">6th Floor B-28, Sector-132, Noida, Gautam Buddha Nagar, Uttar Pradesh, 201301.</p>
            <span className="text-xs font-bold text-[#639E1F] block pt-1">India &amp; International Hubs</span>
          </div>

        </div>
      </section>

      {/* Main Support & Contact Form Section */}
      <section className="py-16 lg:py-24 bg-[#F2F8ED]/40 border-t border-b border-[#2D5A1E]/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Quick FAQs */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#639E1F] block">
                  Common Answers
                </span>
                <h2 className="text-3xl font-light text-[#172B15]">
                  Frequently Asked <span className="font-serif italic text-[#639E1F]">Questions</span>
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600">
                  Quick answers regarding product potency, storage, and partnership programs.
                </p>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl border border-[#2D5A1E]/15 shadow-sm space-y-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#639E1F]">{faq.category}</span>
                    <h3 className="text-sm font-semibold text-[#172B15]">{faq.question}</h3>
                    <p className="text-xs text-neutral-600 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-[#2D5A1E]/15 shadow-xl shadow-[#2D5A1E]/5 p-8 sm:p-10">
              <div className="space-y-2 mb-8">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#8CC63F]/15 text-[#2D5A1E] text-[10px] font-bold uppercase tracking-wider">
                  <MessageSquare className="w-3 h-3" />
                  <span>Send a Message</span>
                </div>
                <h3 className="text-2xl font-light text-[#172B15]">Submit Your Query</h3>
                <p className="text-xs text-neutral-600">Fill out the form below and our support specialists will get back to you promptly.</p>
              </div>

              {formSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 rounded-2xl bg-[#F2F8ED] border border-[#639E1F]/30 text-center space-y-4"
                >
                  <CheckCircle className="w-12 h-12 text-[#639E1F] mx-auto" />
                  <h4 className="text-lg font-semibold text-[#172B15]">Inquiry Received Successfully</h4>
                  <p className="text-xs text-neutral-600">
                    Thank you, <strong className="text-[#172B15]">{formData.name}</strong>. Our support team has received your message and will contact you at <strong className="text-[#172B15]">{formData.email}</strong> shortly.
                  </p>
                  <button
                    onClick={() => {
                      setFormSubmitted(false);
                      setFormData({ name: "", email: "", phone: "", category: "General Inquiry", message: "" });
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#2D5A1E] transition-colors"
                  >
                    Send Another Inquiry
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. John Dae"
                        className="w-full px-4 py-3 rounded-xl border border-[#2D5A1E]/20 bg-[#FAFAF7] text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F] transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. partner@energymax.com"
                        className="w-full px-4 py-3 rounded-xl border border-[#2D5A1E]/20 bg-[#FAFAF7] text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 94514 44406"
                        className="w-full px-4 py-3 rounded-xl border border-[#2D5A1E]/20 bg-[#FAFAF7] text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F] transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">Inquiry Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-[#2D5A1E]/20 bg-[#FAFAF7] text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F] transition-colors"
                      >
                        <option value="General Inquiry">General Product Inquiry</option>
                        <option value="Partnership">Partnership Opportunity</option>
                        <option value="Orders & Shipping">Orders &amp; Shipping</option>
                        <option value="Compliance">Regulatory &amp; Compliance</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">Your Message *</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please describe your inquiry in detail..."
                      className="w-full px-4 py-3 rounded-xl border border-[#2D5A1E]/20 bg-[#FAFAF7] text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F] transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#2D5A1E] transition-all shadow-xl shadow-[#2D5A1E]/20 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>Submit Inquiry</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center justify-center space-x-2 text-[11px] text-neutral-500 pt-2">
                    <Clock className="w-3.5 h-3.5 text-[#639E1F]" />
                    <span>Average response time: Under 12 hours</span>
                  </div>

                </form>
              )}

            </div>

          </div>

        </div>
      </section>

      <LuxuryFooter />
    </div>
  );
}