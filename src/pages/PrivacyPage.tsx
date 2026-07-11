import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
  const navigate = useNavigate();

  const sections = [
    {
      num: "1",
      title: "Who We Are",
      content:
        "UniMarket Rwanda is a student-focused online marketplace created to help students in Rwanda safely buy, sell, and exchange products and services within a trusted university community. Our mission is \"For Students, By Students.\"",
    },
    {
      num: "2",
      title: "Information We Collect",
      content:
        "Depending on how you use the platform, we may collect the following information: Personal Information — Full name, email address, phone number, university name, profile photo, and passwords (encrypted safely). Marketplace Data — Products posted, descriptions, uploaded multimedia, saved items, chat logs, platform reviews, and safety reports. Technical Logs — IP addresses, browser agents, operating system environments, duration analytics, and date/time markers.",
    },
    {
      num: "3",
      title: "How We Use Your Information",
      content:
        "We utilize records to manage user accounts, display platform listings, secure systems against malicious activity, improve application processing times, and issue critical platform updates. We do not sell user data to advertising networks.",
    },
    {
      num: "4 & 5",
      title: "Cookies & Analytics",
      content:
        "UniMarket Rwanda sets standard session cookies to hold authorization tokens and maintain your session state. Standard analytics aggregators track interaction behaviors to improve performance but are processed anonymously.",
    },
    {
      num: "6",
      title: "Data Security",
      content:
        "We employ reasonable technical defense practices (including encrypted password stores and administrative data firewalls) to block unauthorized server operations.",
    },
    {
      num: "7",
      title: "Public Visibility Space",
      content:
        "Note that data elements intentionally pinned to listings (such as your chosen username, university node affiliation, product description text, and active contact numbers) will serve as publicly scannable assets for buyers across the marketplace.",
    },
    {
      num: "8 & 9",
      title: "User Rights & Retention Policies",
      content:
        "Users retain full privileges to update their details or initiate an explicit account removal request through dashboard profile tools. Account properties are preserved only as long as necessary to fulfill marketplace transaction safety parameters or local regulatory baselines.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0b0c0b] text-[#f4f2ee] font-sans overflow-x-hidden selection:bg-[#bb740a]/30 selection:text-white pb-20">
      {/* Grain Overlay */}
      <div className="grain-overlay opacity-30 pointer-events-none fixed inset-0 z-50" />

      <div className="max-w-4xl mx-auto px-6 pt-10">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="rounded-xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.05] text-[#b7b1a6] hover:text-[#f4f2ee] gap-2 mb-8 h-10 px-4 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <div className="flex flex-col space-y-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-[#bb740a]/10 border border-[#bb740a]/20 text-[#bb740a]">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <span className="text-xs uppercase tracking-widest text-[#b7b1a6] font-bold">Legal Portal</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-[#f4f2ee] to-[#b7b1a6] bg-clip-text text-transparent">
            Privacy Policy
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#b7b1a6]/80 font-medium">
            <span><strong>Effective Date:</strong> July 7, 2026</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#bb740a]/60" />
            <span><strong>Last Updated:</strong> July 7, 2026</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#bb740a]/60" />
            <span className="text-[#bb740a] italic font-semibold">For Students, By Students.</span>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-[#b7b1a6] mt-6 border-b border-white/[0.06] pb-8">
          Your privacy is important to us. This Privacy Policy explains how UniMarket Rwanda collects, uses, stores,
          protects, and shares your personal information when you use our website at{" "}
          <a href="https://www.uni-marketrwanda.online" className="text-[#bb740a] hover:underline font-semibold">
            https://www.uni-marketrwanda.online
          </a>{" "}
          and related services. By creating an account or using UniMarket Rwanda, you agree to the practices described
          in this Privacy Policy.
        </p>

        {/* Sections */}
        <div className="mt-8 space-y-6">
          {sections.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="p-6 rounded-2xl bg-[#0f0f0f] border border-white/[0.08] hover:border-[#bb740a]/40 transition-all duration-300 shadow-xl group"
            >
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center text-xs font-bold text-[#bb740a] group-hover:bg-[#bb740a]/10 transition-colors shrink-0">
                  {section.num}
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-base text-[#f4f2ee] tracking-tight group-hover:text-white">
                    {section.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-[#b7b1a6]">{section.content}</p>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: sections.length * 0.05 }}
            className="p-6 rounded-2xl bg-[#bb740a]/5 border border-[#bb740a]/20 hover:border-[#bb740a]/40 transition-all duration-300 shadow-xl group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#bb740a]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-8 h-8 rounded-xl bg-[#bb740a]/20 border border-[#bb740a]/30 flex items-center justify-center text-xs font-bold text-[#bb740a] shrink-0">
                10
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-base text-[#f4f2ee] tracking-tight flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#bb740a]" /> Contact Us
                </h3>
                <p className="text-xs leading-relaxed text-[#b7b1a6] pb-4">
                  If you have any inquiries regarding this Privacy Policy, please contact our privacy compliance inbox:
                </p>
                <div className="border-t border-white/[0.06] pt-4 text-xs font-medium">
                  <span className="text-muted-foreground block text-[10px] uppercase tracking-wider mb-1">Official Inbox</span>
                  <a href="mailto:support.unimarketrwanda@gmail.com" className="text-[#bb740a] hover:underline">
                    support.unimarketrwanda@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
