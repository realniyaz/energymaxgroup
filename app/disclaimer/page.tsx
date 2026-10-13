"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  ShieldAlert, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  FileText, 
  Building2, 
  Phone, 
  Mail, 
  MapPin 
} from "lucide-react";
import LuxuryNavbar from "../components/Navbar";
import LuxuryFooter from "../components/LuxuryFooter";

export default function DisclaimerPage() {
  const [activeSection, setActiveSection] = useState("fda-statutory");

  const sections = [
    { id: "fda-statutory", label: "1. Statutory & Regulatory Notice" },
    { id: "medical-advice", label: "2. No Medical or Clinical Advice" },
    { id: "efficacy-results", label: "3. Individual Health Outcomes" },
    { id: "formulations-cfu", label: "4. Probiotics & Storage Protocol" },
    { id: "dietary-allergens", label: "5. Dietary Ingredients & Allergens" },
    { id: "scientific-literature", label: "6. Scientific Citations & Research" },
    { id: "business-income", label: "7. IBO Business & Earnings Disclaimer" },
    { id: "authorized-channels", label: "8. Authorized Distribution & Authenticity" },
    { id: "intellectual-property", label: "9. Proprietary Formulations & IP" },
    { id: "external-links", label: "10. Third-Party References & Links" },
    { id: "limitation-liability", label: "11. Limitation of Liability" },
    { id: "contact-support", label: "12. Regulatory & Grievance Contact" },
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
        behavior: "smooth",
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
            <ShieldAlert className="w-4 h-4 text-[#8CC63F]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8CC63F]">
              Transparency & Legal Disclosures
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-light tracking-tight text-white">
            Official<span className="font-serif italic text-[#8CC63F]"> Disclaimer</span>
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 font-normal max-w-2xl mx-auto leading-relaxed">
            Please read these statutory notices, medical guidelines, and business opportunity disclosures before engaging with EnergyMax Group products, educational content, or partner opportunities.
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
                Disclaimer Index
              </span>
              
              <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible space-x-2 lg:space-x-0 lg:space-y-1 pb-2 lg:pb-0 no-scrollbar">
                {sections.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`whitespace-nowrap lg:whitespace-normal w-full text-left px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-between shrink-0 cursor-pointer ${
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
            <div id="fda-statutory" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3 flex items-center justify-between">
                <span>1. Statutory & Regulatory Notice</span>
                <span className="text-[10px] font-mono font-bold uppercase text-[#639E1F] bg-[#8CC63F]/15 px-3 py-1 rounded-full border border-[#8CC63F]/30">
                  Global Compliance
                </span>
              </h2>
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F2F8ED] border border-[#8CC63F]/40 text-[#172B15] space-y-2">
                <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                  &ldquo;The statements and nutritional claims made on this website, in marketing materials, or on product packaging have not been evaluated by the United States Food and Drug Administration (FDA), the Food Safety and Standards Authority of India (FSSAI), the Ministry of AYUSH, or any other government healthcare authority.&rdquo;
                </p>
                <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-normal">
                  Our products—including the maXilin&reg; Probiotic MasterSeries, liquid bio-cultures, and synbiotic complexes—are classified as dietary and nutritional supplements. <strong>They are not intended to diagnose, treat, cure, mitigate, or prevent any medical condition, disease, or acute physiological disorder.</strong>
                </p>
              </div>
            </div>

            {/* Section 2 */}
            <div id="medical-advice" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                2. No Medical or Clinical Advice
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                The content published across this website—including clinical research summaries, strain explanations, dosage charts, cellular health overviews, blog posts, and customer reviews—is provided strictly for educational and general wellness informational purposes.
              </p>
              <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                <li className="flex items-start space-x-2">
                  <span className="text-[#639E1F] font-bold">&bull;</span>
                  <span><strong>Consult Qualified Professionals:</strong> Never substitute information found on this platform for professional medical advice, clinical diagnostics, or personalized treatment plans from your licensed physician.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-[#639E1F] font-bold">&bull;</span>
                  <span><strong>Pre-Existing Conditions & Medications:</strong> If you are pregnant, nursing, taking prescription pharmaceuticals (particularly immunosuppressive agents or antibiotics), or have a compromised immune system, consult your healthcare practitioner before initiating any live probiotic regimen.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-[#639E1F] font-bold">&bull;</span>
                  <span><strong>Emergency Situations:</strong> In case of an acute medical emergency or unexpected adverse reaction, discontinue use immediately and seek professional emergency medical services.</span>
                </li>
              </ul>
            </div>

            {/* Section 3 */}
            <div id="efficacy-results" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                3. Individual Health Outcomes & Testimonials
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                Human gastrointestinal microbiomes are biologically unique. Consequently, nutritional and probiotic responses vary significantly based on genetics, baseline gut flora, age, dietary habits, antibiotic history, metabolic rate, and physical activity levels.
              </p>
              <div className="p-4 rounded-2xl bg-[#FAFAF7] border border-neutral-200 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D5A1E]">No Guarantee of Specific Results</h4>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Testimonials, client reviews, or anecdotal accounts displayed on this platform reflect individual experiences only and do not constitute a guarantee, warranty, or representation that any other individual will achieve identical or comparable physiological benefits.
                </p>
              </div>
            </div>

            {/* Section 4 */}
            <div id="formulations-cfu" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                4. Probiotics, CFU Potency & Storage Protocol
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                EnergyMax formulations are engineered with high-density Colony Forming Units (CFUs) and enteric protective carriers to maximize microbial viability. However, maintaining microbial potency is contingent on customer adherence to proper storage protocols:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-[#F2F8ED]/60 border border-[#8CC63F]/30 space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D5A1E]">Temperature & Direct Heat</h4>
                  <p className="text-xs text-neutral-600">Store unopened and opened units in a cool, dry place shielded from direct sunlight. Never consume or mix live probiotic sachets with boiling water or scalding liquids.</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#F2F8ED]/60 border border-[#8CC63F]/30 space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D5A1E]">Cold-Chain Transit Notice</h4>
                  <p className="text-xs text-neutral-600">All shipments leave fulfillment hubs with temperature monitors. EnergyMax is not liable for viability degradation caused by protracted delivery delays or extreme heat exposure resulting from customer absence.</p>
                </div>
              </div>
            </div>

            {/* Section 5 */}
            <div id="dietary-allergens" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                5. Dietary Ingredients & Allergen Awareness
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                Consumers are strictly advised to review the complete list of ingredients, botanical extracts, excipients, and nutritional labeling printed on every box prior to consumption.
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                <li className="flex items-start space-x-2">
                  <span className="text-[#639E1F] font-bold">&bull;</span>
                  <span>EnergyMax formulations strive to remain hypoallergenic, non-GMO, and free of artificial additives. However, production may occur in shared GMP facilities handling natural botanical extracts.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-[#639E1F] font-bold">&bull;</span>
                  <span>If you have known hypersensitivities to tropical fruit essences (such as guava, amla, passion fruit, lemon, or pineapple) or prebiotic fibers (e.g., inulin, fructooligosaccharides), exercise caution and review product specifications.</span>
                </li>
              </ul>
            </div>

            {/* Section 6 */}
            <div id="scientific-literature" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                6. Scientific Citations & Research Data
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                References to academic peer-reviewed studies, clinical trials, or published laboratory findings regarding bacterial strains (such as <em>Lactobacillus</em>, <em>Bifidobacterium</em>, or specific postbiotic metabolites) are intended to illustrate general microbiological mechanisms.
              </p>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                The citation of scientific literature does not imply that EnergyMax finished products have undergone identical trials or that our commercial items are endorsed by the authors or clinical institutions conducting those studies.
              </p>
            </div>

            {/* Section 7 */}
            <div id="business-income" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                7. IBO Business & Earnings Disclaimer
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                EnergyMax Group offers an Independent Business Owner (&ldquo;IBO&rdquo;) collaborative distribution model. Prospective and active partners must take note of our clear business parameters:
              </p>
              <div className="p-4 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 space-y-2 text-xs text-neutral-700 leading-relaxed">
                <p>
                  <strong>No Guarantee of Financial Return:</strong> Joining the EnergyMax partnership network is not an investment, employment contract, or &ldquo;get-rich-quick&rdquo; program. Compensation, Point Value (PV), Business Volume (BV), and commissions are derived solely from verified retail and consumer product sales.
                </p>
                <p>
                  <strong>Earning Variances:</strong> Earnings and business advancement depend entirely on individual sales skill, dedication, persistence, leadership development, local market conditions, and personal effort. Typical earnings cannot be guaranteed or assumed.
                </p>
              </div>
            </div>

            {/* Section 8 */}
            <div id="authorized-channels" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                8. Authorized Distribution & Product Authenticity
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                To guarantee microbiological freshness, cold-chain provenance, and legitimate batch serialization, authentic EnergyMax products are distributed exclusively through:
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                <li className="flex items-start space-x-2">
                  <span className="text-[#639E1F] font-bold">&bull;</span>
                  <span>The official EnergyMax Storefront (<code>energymaxgroup.com</code> / <code>energymaxgroup.in</code>)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-[#639E1F] font-bold">&bull;</span>
                  <span>Registered EnergyMax Mobile Applications and Official Regional Experience Centers</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-[#639E1F] font-bold">&bull;</span>
                  <span>Authorized Independent Business Owners (IBOs) utilizing direct distributor links</span>
                </li>
              </ul>
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
                <strong>Unauthorized Resellers Notice:</strong> Products acquired through unauthorized third-party marketplaces (such as Amazon, eBay, Flipkart, or unverified auction sites) may be counterfeit, expired, or improperly stored. They are void of our 30-Day Satisfaction Guarantee and return privileges.
              </div>
            </div>

            {/* Section 9 */}
            <div id="intellectual-property" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                9. Proprietary Formulations & Intellectual Property
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                All brand marks, logos, product names (including maXilin&reg;, MasterSeries, Cellular Vitality&trade;, Vesna Nefes&trade;), packaging trade dress, formulation methodologies, graphics, and textual documentation are the exclusive intellectual property of EnergyMax Group LLC and its affiliated corporate entities.
              </p>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                Unauthorized reproduction, repackaging, reverse engineering, scraping, or commercial exploitation without written consent from EnergyMax Group is strictly prohibited.
              </p>
            </div>

            {/* Section 10 */}
            <div id="external-links" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                10. Third-Party References & External Links
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                Our digital platforms may contain links to external websites, independent research repositories, or third-party analytical articles. EnergyMax Group has no editorial control over, and assumes no responsibility for, the content, privacy practices, accuracy, or statements found on third-party domains.
              </p>
            </div>

            {/* Section 11 */}
            <div id="limitation-liability" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                11. Limitation of Liability
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                To the maximum extent permitted by applicable laws, EnergyMax Group LLC, its directors, officers, employees, laboratory affiliates, and partners shall not be held liable for any indirect, consequential, incidental, special, or punitive damages arising from the use or inability to use this website or our wellness formulations.
              </p>
            </div>

            {/* Section 12 */}
            <div id="contact-support" className="space-y-4 pt-4 scroll-mt-28 bg-[#F2F8ED] p-6 sm:p-8 rounded-3xl border border-[#8CC63F]/40">
              <div className="flex items-center space-x-2 text-[#2D5A1E]">
                <Building2 className="w-5 h-5 text-[#639E1F]" />
                <h2 className="text-base sm:text-xl font-bold tracking-tight text-[#172B15]">
                  12. Regulatory, Legal & Grievance Contact
                </h2>
              </div>
              
              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                If you have questions regarding this statutory disclaimer, require clarification regarding product certificates of analysis (CoAs), or wish to reach our Grievance Redressal Officer:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs text-[#172B15]">
                <div className="space-y-1.5 p-4 rounded-2xl bg-white border border-[#2D5A1E]/10">
                  <span className="font-bold text-[#2D5A1E] block uppercase tracking-wider text-[10px]">India Operational Headquarters</span>
                  <p className="text-neutral-600 leading-relaxed">
                    B 28, Sector 132,<br />
                    Noida, Uttar Pradesh &ndash; 201304, India
                  </p>
                  <p className="pt-1 text-[#2D5A1E] font-medium">Helpline: +91 120 466 4253</p>
                </div>

                {/* <div className="space-y-1.5 p-4 rounded-2xl bg-white border border-[#2D5A1E]/10">
                  <span className="font-bold text-[#2D5A1E] block uppercase tracking-wider text-[10px]">Global Corporate Desk</span>
                  <p className="text-neutral-600 leading-relaxed">
                    8465 W Sahara Ave, Suite 111, Unit #1327,<br />
                    Las Vegas, NV 89117, United States
                  </p>
                  <p className="pt-1 text-[#2D5A1E] font-medium">Email: care@energymaxgroup.com</p>
                </div> */}
              </div>

              <div className="pt-3 border-t border-[#2D5A1E]/15 flex items-center justify-between text-[11px] text-neutral-500">
                <span>EnergyMax Group Compliance &amp; Regulatory Division</span>
                <span>Last Revised: October 2026</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      <LuxuryFooter />
    </div>
  );
}