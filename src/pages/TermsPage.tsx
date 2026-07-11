import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Scale, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  const navigate = useNavigate();

  const sections = [
    {
      num: "1",
      title: "About UniMarket Rwanda",
      content: "UniMarket Rwanda is a student-focused online marketplace that enables students studying in Rwanda to buy, sell, exchange, and discover products and services within a trusted university community. Our mission is to provide a secure, accessible, and community-driven platform that promotes affordable student commerce while encouraging responsible and respectful interactions. UniMarket Rwanda serves only as a digital marketplace connecting buyers and sellers. Unless expressly stated otherwise, UniMarket Rwanda is not the owner, manufacturer, distributor, or seller of products listed by users."
    },
    {
      num: "2",
      title: "Eligibility",
      content: "To use UniMarket Rwanda, you must: Be at least 18 years old or have permission from a parent or legal guardian where applicable; Register using accurate and truthful information; Maintain only one personal account unless otherwise authorized; and Comply with these Terms and all applicable laws of the Republic of Rwanda."
    },
    {
      num: "3",
      title: "Student Verification & Authenticity",
      content: "Providing false, misleading, altered, or fraudulent profile configuration verification information may result in the immediate suspension or permanent termination of your account."
    },
    {
      num: "4",
      title: "User Accounts",
      content: "You are responsible for: Maintaining the confidentiality of your login credentials; Ensuring your account information remains accurate and up to date; and All activities conducted through your account. You may not transfer or sell your account to another person."
    },
    {
      num: "5",
      title: "Marketplace Rules",
      content: "Users agree to: Post only genuine products or services; Provide accurate descriptions and pricing; Upload authentic photographs or videos of listed items; Communicate respectfully with other users; Conduct transactions honestly and fairly; and Respect agreed meeting times and locations."
    },
    {
      num: "6",
      title: "Prohibited Listings",
      content: "The following items may not be listed or advertised on UniMarket Rwanda: Illegal drugs or controlled substances; Firearms, ammunition, explosives, or prohibited weapons; Counterfeit or fake products; Stolen property; Fraudulent documents; Adult or sexually explicit material; Gambling services or dangerous chemicals; or Any product or service whose sale is prohibited under the laws of Rwanda. UniMarket Rwanda reserves the right to remove any listing that violates these Terms without prior notice."
    },
    {
      num: "7",
      title: "Prohibited Conduct",
      content: "Users must not: create fake accounts; impersonate another individual or organization; attempt unauthorized access; harass, threaten, or abuse other users; or engage in deceptive scam practices. Violations result in structural bans or permanent account removal."
    },
    {
      num: "8 & 9",
      title: "Listings & Pricing",
      content: "Every listing should contain an honest title, description, real photos, and a reasonable price determined solely by the seller. UniMarket Rwanda does not set, negotiate, or participate in pricing decisions between users."
    },
    {
      num: "10 & 11",
      title: "Transactions & Meeting Safely",
      content: "Transactions take place directly between buyers and sellers. UniMarket Rwanda does not own or guarantee product condition or authenticity. Users are strongly encouraged to inspect products carefully and meet safely in public, busy locations (such as university campuses)."
    },
    {
      num: "12",
      title: "Reviews and Ratings",
      content: "Reviews must be based on genuine experiences and contain no offensive language, personal attacks, or spam."
    },
    {
      num: "13",
      title: "Intellectual Property",
      content: "The platform name, logo, branding, and original content remain the intellectual property of UniMarket Rwanda. Users grant us a non-exclusive license to display uploaded item listing info solely to run the marketplace."
    },
    {
      num: "14 & 15",
      title: "Privacy & Account Suspension",
      content: "Data is processed per our Privacy Policy. We hold the right to terminate accounts violating these parameters or threatening student safety."
    },
    {
      num: "16 & 17",
      title: "Disclaimer & Limitation of Liability",
      content: "UniMarket Rwanda provides the connection platform \"as is.\" To the maximum extent permitted by the laws of Rwanda, we are not liable for financial losses, item delivery issues, or user misconduct."
    },
    {
      num: "18 & 19",
      title: "Changes & Updates",
      content: "We reserve the right to improve platform components or revise these terms periodically by updating this public text framework."
    },
    {
      num: "20",
      title: "Governing Law",
      content: "These Terms shall be governed by and interpreted in accordance with the laws of the Republic of Rwanda."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0b0c0b] text-[#f4f2ee] font-sans overflow-x-hidden selection:bg-[#bb740a]/30 selection:text-white pb-20">
      {/* Grain Overlay */}
      <div className="grain-overlay opacity-30 pointer-events-none fixed inset-0 z-50" />

      {/* Header Container */}
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
              <Scale className="w-6 h-6" />
            </span>
            <span className="text-xs uppercase tracking-widest text-[#b7b1a6] font-bold">Legal Portal</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-[#f4f2ee] to-[#b7b1a6] bg-clip-text text-transparent">
            Terms of Service
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#b7b1a6]/80 font-medium">
            <span><strong>Effective Date:</strong> July 7, 2026</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#bb740a]/60" />
            <span><strong>Last Updated:</strong> July 7, 2026</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#bb740a]/60" />
            <span className="text-[#bb740a] italic font-semibold font-sans">For Students, By Students.</span>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-[#b7b1a6] mt-6 border-b border-white/[0.06] pb-8">
          Welcome to UniMarket Rwanda (&quot;UniMarket Rwanda,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). These Terms of Service (&quot;Terms&quot;) govern your access to and use of the UniMarket Rwanda website, available at <a href="https://www.uni-marketrwanda.online" className="text-[#bb740a] hover:underline font-semibold">https://www.uni-marketrwanda.online</a>, and all related services offered through the platform. By creating an account, accessing, or using UniMarket Rwanda, you acknowledge that you have read, understood, and agreed to be bound by these Terms. If you do not agree to these Terms, you must not access or use the platform.
        </p>

        {/* Legal Grid Sections */}
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
                  <p className="text-xs leading-relaxed text-[#b7b1a6]">
                    {section.content}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Section 21: Contact */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: sections.length * 0.05 }}
            className="p-6 rounded-2xl bg-[#bb740a]/5 border border-[#bb740a]/20 hover:border-[#bb740a]/40 transition-all duration-300 shadow-xl group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#bb740a]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-8 h-8 rounded-xl bg-[#bb740a]/20 border border-[#bb740a]/30 flex items-center justify-center text-xs font-bold text-[#bb740a] shrink-0">
                21
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-base text-[#f4f2ee] tracking-tight flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#bb740a]" /> Contact Information
                </h3>
                <p className="text-xs leading-relaxed text-[#b7b1a6] pb-4">
                  For support inquiries, clarifications, or general legal queries regarding these Terms of Service, please reach out to us at:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium border-t border-white/[0.06] pt-4">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">Support Web Address</span>
                    <a href="https://www.uni-marketrwanda.online" className="text-[#bb740a] hover:underline">https://www.uni-marketrwanda.online</a>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">Official Legal Inbox</span>
                    <a href="mailto:support.unimarketrwanda@gmail.com" className="text-[#bb740a] hover:underline">support.unimarketrwanda@gmail.com</a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
