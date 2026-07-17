"use client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getApiUrl } from "@/lib/api";
import {
  ShoppingCart,
  Eye,
  Search,
  MapPin,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Package,
  Zap,
  BookOpen,
  Monitor,
  Sofa,
  Shirt,
  PenLine,
  Bike,
  UtensilsCrossed,
  Trophy,
  Mail,
  ExternalLink,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Electronics: <Monitor className="w-5 h-5" />,
  Furniture: <Sofa className="w-5 h-5" />,
  Textbooks: <BookOpen className="w-5 h-5" />,
  Clothing: <Shirt className="w-5 h-5" />,
  Stationery: <PenLine className="w-5 h-5" />,
  Bicycles: <Bike className="w-5 h-5" />,
  Kitchen: <UtensilsCrossed className="w-5 h-5" />,
  Sports: <Trophy className="w-5 h-5" />,
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; glow: string }> = {
  Electronics: { bg: "rgba(99,102,241,0.12)", text: "#818cf8", glow: "rgba(99,102,241,0.3)" },
  Furniture:   { bg: "rgba(234,179,8,0.1)",   text: "#f59e0b", glow: "rgba(234,179,8,0.3)"  },
  Textbooks:   { bg: "rgba(34,197,94,0.1)",   text: "#4ade80", glow: "rgba(34,197,94,0.3)"  },
  Clothing:    { bg: "rgba(236,72,153,0.1)",  text: "#f472b6", glow: "rgba(236,72,153,0.3)" },
  Stationery:  { bg: "rgba(6,182,212,0.1)",   text: "#22d3ee", glow: "rgba(6,182,212,0.3)"  },
  Bicycles:    { bg: "rgba(249,115,22,0.1)",  text: "#fb923c", glow: "rgba(249,115,22,0.3)" },
  Kitchen:     { bg: "rgba(16,185,129,0.1)",  text: "#34d399", glow: "rgba(16,185,129,0.3)" },
  Sports:      { bg: "rgba(239,68,68,0.1)",   text: "#f87171", glow: "rgba(239,68,68,0.3)"  },
};

interface University {
  id: string;
  name: string;
  abreviation: string;
}

export default function Hero() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [dbListings, setDbListings] = useState<any[]>([]);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [apiUniversities, setApiUniversities] = useState<University[]>([]);
  const [isLoadingUnis, setIsLoadingUnis] = useState<boolean>(true);
  const [selectedUniId, setSelectedUniId] = useState<string>("All");

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await fetch(getApiUrl("/api/v1/universities"));
        if (response.ok) {
          const data = await response.json();
          setApiUniversities(data);
        }
      } catch (err) {
        console.error("Failed to fetch universities:", err);
      } finally {
        setIsLoadingUnis(false);
      }
    };
    fetchUniversities();
  }, []);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await fetch(getApiUrl("/api/v1/listing/"));
        if (res.ok) {
          const data = await res.json();
          setDbListings(data);
        }
      } catch (err) {
        console.error("Failed to fetch homepage listings:", err);
      }
    };
    fetchListings();
  }, []);

  const resolveImageUrl = (url: string): string => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return getApiUrl(`/${url}`);
  };

  const staticProducts = [
    {
      id: "1",
      name: "Wireless Headphones",
      price: "28,000 RWF",
      rating: 4.8,
      location: { university: "UR - Gikondo", campus: "KG 15 mins ago" },
      university: "UR - Gikondo",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
      tag: "Like new",
    },
    {
      id: "2",
      name: "Minimal Study Desk",
      price: "85,000 RWF",
      rating: 4.9,
      location: { university: "UR - Huye", campus: "UR Huye" },
      university: "UR - Huye",
      image: "https://plus.unsplash.com/premium_photo-1711051475117-f3a4d3ff6778?auto=format&fit=crop&w=800&q=80",
      tag: "Solid wood",
    },
    {
      id: "3",
      name: "Programming Books (set of 5)",
      price: "12,000 RWF",
      rating: 5.0,
      location: { university: "CMU Africa", campus: "CMU Africa" },
      university: "CMU Africa",
      image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80",
      tag: "Bestseller",
    },
    {
      id: "4",
      name: "MacBook Air M1",
      price: "750,000 RWF",
      rating: 4.9,
      location: { university: "African Leadership University", campus: "ALU" },
      university: "African Leadership University",
      image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80",
      tag: "Student discount",
    },
  ];

  const mappedDbProducts = dbListings.map((item: any, idx: number) => {
    const image =
      item.images && Array.isArray(item.images) && item.images.length > 0
        ? resolveImageUrl(item.images[0].image)
        : item.image
          ? resolveImageUrl(item.image)
          : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80";

    const sellerProfile = item.seller_info || item.seller || item.user || {};
    const district = sellerProfile.district || sellerProfile.profile_details?.district || "Kigali";
    const university = sellerProfile.university || sellerProfile.profile_details?.university || "UR - Gikondo";

    return {
      id: item.id || `api-${idx}`,
      name: item.title,
      price:
        typeof item.price === "number"
          ? `${item.price.toLocaleString()} RWF`
          : `${parseFloat(item.price || "0").toLocaleString()} RWF`,
      rating: 4.8,
      location: { 
        university: item.location?.university || university, 
        campus: item.location?.campus || `${district} Campus` 
      },
      university,
      image,
      tag: item.condition
        ? item.condition.charAt(0).toUpperCase() + item.condition.slice(1)
        : "Verified",
    };
  });

  const products = mappedDbProducts.length > 0 ? mappedDbProducts : staticProducts;

  const handleItemClick = (listingId: string) => {
    if (!isAuthenticated) {
      navigate(`/login?next=/dashboard/listing/${listingId}`);
    } else {
      navigate(`/dashboard/listing/${listingId}`);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    const trimmed = searchQuery.trim();
    if (trimmed) {
      if (!isAuthenticated) {
        navigate(`/login?next=/dashboard/browse?search=${encodeURIComponent(trimmed)}`);
      } else {
        navigate(`/dashboard/browse?search=${encodeURIComponent(trimmed)}`);
      }
    }
  };

  const handleCategoryClick = (categoryTitle: string) => {
    if (!isAuthenticated) {
      navigate(`/login?next=/dashboard/browse?category=${encodeURIComponent(categoryTitle)}`);
    } else {
      navigate(`/dashboard/browse?category=${encodeURIComponent(categoryTitle)}`);
    }
  };

  // Compute live category counts from fetched listings
  const categoryNames = ["Electronics", "Furniture", "Textbooks", "Clothing", "Stationery", "Bicycles", "Kitchen", "Sports"];
  const categories = categoryNames.map((name) => {
    const count = dbListings.filter(
      (item: any) => (item.category || "").toLowerCase() === name.toLowerCase()
    ).length;
    return { title: name, count };
  });

  // Filter products by selected university
  const filteredProducts = products.filter((product) => {
    if (selectedUniId === "All") return true;
    const selectedUni = apiUniversities.find((u) => u.id === selectedUniId);
    if (!selectedUni) return false;
    const pUni = (product.university || "").toLowerCase();
    const pLocUni = (product.location?.university || "").toLowerCase();
    const uName = (selectedUni.name || "").toLowerCase();
    const uAbbr = (selectedUni.abreviation || "").toLowerCase();
    const uId = (selectedUni.id || "").toLowerCase();
    return pUni.includes(uName) || uName.includes(pUni) || pUni.includes(uAbbr) || uAbbr.includes(pUni) || pUni.includes(uId) ||
           pLocUni.includes(uName) || uName.includes(pLocUni) || pLocUni.includes(uAbbr) || uAbbr.includes(pLocUni) || pLocUni.includes(uId);
  });

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterStatus("sending");
    // Simulate sending – in production wire to your backend or a mailto action
    await new Promise((r) => setTimeout(r, 900));
    setNewsletterStatus("sent");
  };

  return (
    <main
      className="home-only"
      style={{ background: "#0D0E12", minHeight: "100vh" }}
    >
      {/* ───────────────────────── HERO SECTION ───────────────────────── */}
      <section
        className="relative py-20 md:py-28 overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse at top right, rgba(234,179,8,0.07), transparent 55%), radial-gradient(ellipse at bottom left, rgba(99,102,241,0.05), transparent 60%), #0D0E12",
        }}
      >
        {/* Ambient noise grain */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
            backgroundSize: "180px",
          }}
        />
        {/* Floating accent orbs */}
        <div
          className="pointer-events-none absolute -top-20 right-0 w-[480px] h-[480px] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, rgba(234,179,8,0.18), transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-20 w-[360px] h-[360px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.22), transparent 70%)" }}
        />

        <div className="relative z-10 max-w-6xl mx-auto w-[92vw]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* LEFT — editorial copy + search */}
            <div>
              {/* Trust badge */}
              <div
                className="inline-flex items-center gap-2 text-xs px-4 py-1.5 rounded-full font-semibold mb-6"
                style={{
                  background: "rgba(234,179,8,0.08)",
                  border: "1px solid rgba(234,179,8,0.2)",
                  color: "#F59E0B",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse"
                />
                Trusted by 18,000+ students across Rwanda
              </div>

              {/* Headline */}
              <h1
                className="font-black text-5xl sm:text-6xl md:text-7xl leading-[1.05] tracking-tight mb-5"
                style={{ color: "#F1F5F9" }}
              >
                Shop smarter.{" "}
                <br className="hidden sm:block" />
                Sell faster.{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #F59E0B, #FBBF24, #D97706)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Right on campus.
                </span>
              </h1>

              <p className="text-base leading-relaxed mb-8" style={{ color: "#94A3B8" }}>
                Discover verified student listings, affordable tech, and hostel-ready
                essentials across Rwanda. Buy now, or list your item in under two minutes.
              </p>

              {/* Premium search bar */}
              <form
                className="flex gap-2 mb-7"
                onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
              >
                <div
                  className="flex flex-1 items-center gap-3 px-4 rounded-2xl transition-all duration-200 focus-within:shadow-[0_0_0_2px_rgba(234,179,8,0.4)]"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <Search className="w-4 h-4 shrink-0" style={{ color: "#64748B" }} />
                  <input
                    type="text"
                    placeholder="Search for laptops, textbooks, furniture..."
                    aria-label="Search products"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent py-3.5 text-sm outline-none placeholder:text-[#475569]"
                    style={{ color: "#E2E8F0" }}
                  />
                </div>
                <button
                  type="submit"
                  className="shrink-0 px-6 py-3 rounded-2xl font-semibold text-sm text-[#0D0E12] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(234,179,8,0.4)]"
                  style={{ background: "linear-gradient(135deg,#F59E0B,#D97706)" }}
                >
                  Search
                </button>
              </form>

              {/* Live metric ticker */}
              <div
                className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-semibold"
                style={{
                  background: "rgba(234,179,8,0.06)",
                  border: "1px solid rgba(234,179,8,0.12)",
                }}
              >
                <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
                <span style={{ color: "#F59E0B" }}>
                  {dbListings.length > 0 ? dbListings.length.toLocaleString() : "2,600+"} active listings
                </span>
                <span style={{ color: "#475569" }}>right now</span>
              </div>
            </div>

            {/* RIGHT — floating glass card */}
            <div
              className="relative p-6 rounded-3xl"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            >
              {/* Floating glow behind card */}
              <div
                className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(234,179,8,0.14), transparent 70%)" }}
              />

              {/* Card header */}
              <div className="flex items-center justify-between mb-5">
                <p className="font-bold text-sm" style={{ color: "#F1F5F9" }}>
                  Today on UniMarket
                </p>
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold animate-pulse"
                  style={{
                    background: "rgba(234,179,8,0.15)",
                    border: "1px solid rgba(234,179,8,0.3)",
                    color: "#F59E0B",
                  }}
                >
                  ● New
                </span>
              </div>

              {/* Product rows */}
              <div className="grid gap-4">
                {products.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3.5 cursor-pointer group"
                    onClick={() => handleItemClick(item.id)}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 object-cover rounded-xl shrink-0 group-hover:opacity-90 transition-opacity"
                      style={{ border: "1px solid rgba(255,255,255,0.06)" }}
                    />
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold truncate group-hover:text-[#F59E0B] transition-colors" style={{ color: "#E2E8F0" }}>
                        {item.name}
                      </h3>
                      <p className="text-xs mt-1" style={{ color: "#64748B" }}>
                        <span style={{ color: "#F59E0B" }}>{item.price}</span>
                        {" · "}
                        <MapPin className="w-3 h-3 inline-block -mt-px" />
                        {" "}{item.location.university} - {item.location.campus}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 shrink-0 mt-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" style={{ color: "#F59E0B" }} />
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="w-full mt-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(234,179,8,0.25)]"
                style={{
                  background: "rgba(234,179,8,0.08)",
                  border: "1px solid rgba(234,179,8,0.2)",
                  color: "#F59E0B",
                }}
                onClick={() => document.getElementById("featured")?.scrollIntoView({ behavior: "smooth" })}
              >
                Browse all listings →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── CATEGORIES ───────────────────────── */}
      <section className="py-20" id="categories">
        <div className="max-w-6xl mx-auto w-[92vw]">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 mb-10">
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: "#64748B" }}>
                Categories
              </p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: "#F1F5F9" }}>
                Shop by student needs
              </h2>
              <p className="text-sm mt-2 max-w-md" style={{ color: "#94A3B8" }}>
                From tech to hostel essentials, find what matters most this semester.
              </p>
            </div>
            <button
              className="text-sm font-semibold px-5 py-2.5 rounded-2xl transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#94A3B8",
              }}
              onClick={() => handleCategoryClick("All")}
            >
              View all
            </button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const colors = CATEGORY_COLORS[cat.title] || { bg: "rgba(255,255,255,0.05)", text: "#94A3B8", glow: "rgba(255,255,255,0.1)" };
              return (
                <div
                  key={cat.title}
                  onClick={() => handleCategoryClick(cat.title)}
                  className="group relative cursor-pointer p-4 rounded-2xl transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: "#16171E",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.border = `1px solid ${colors.glow}`;
                    (e.currentTarget as HTMLDivElement).style.boxShadow = `0 12px 32px ${colors.glow}40, inset 0 1px 0 rgba(255,255,255,0.04)`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.border = "1px solid rgba(255,255,255,0.05)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors"
                    style={{ background: colors.bg, color: colors.text }}
                  >
                    {CATEGORY_ICONS[cat.title]}
                  </div>
                  <h3 className="font-bold text-sm" style={{ color: "#E2E8F0" }}>{cat.title}</h3>
                  <p className="text-xs mt-1" style={{ color: "#64748B" }}>
                    {cat.count} listings
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────────────────── UNIVERSITY CAMPUS NODE ───────────────────────── */}
      <section
        className="py-20"
        id="universities"
        style={{ background: "rgba(22,23,30,0.6)" }}
      >
        <div className="max-w-6xl mx-auto w-[92vw] grid md:grid-cols-2 gap-10 items-center">
          {/* Left */}
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: "#64748B" }}>
              Your campus
            </p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3" style={{ color: "#F1F5F9" }}>
              Choose your university
            </h2>
            <p className="text-sm mb-7" style={{ color: "#94A3B8" }}>
              Filter listings and get pickup options that match your campus.
            </p>

            {/* Custom select with chip */}
            <div className="flex flex-wrap gap-3 items-center">
              <div
                className="flex-1 min-w-[14rem] relative rounded-2xl overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <select
                  aria-label="Select your university"
                  className="w-full px-4 py-3.5 text-sm bg-transparent outline-none appearance-none cursor-pointer"
                  style={{ color: "#E2E8F0" }}
                  value={selectedUniId}
                  onChange={(e) => setSelectedUniId(e.target.value)}
                  disabled={isLoadingUnis}
                >
                  {isLoadingUnis ? (
                    <option value="All" style={{ background: "#16171E" }}>Loading campuses...</option>
                  ) : (
                    <>
                      <option value="All" style={{ background: "#16171E" }}>All universities</option>
                      {apiUniversities.map((school) => (
                        <option key={school.id} value={school.id} style={{ background: "#16171E" }}>
                          {school.name}
                        </option>
                      ))}
                    </>
                  )}
                </select>
                {/* Arrow icon */}
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#64748B" }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {/* Micro-chip badge */}
              <span
                className="px-3.5 py-2 rounded-full text-xs font-bold"
                style={{
                  background: "rgba(234,179,8,0.1)",
                  border: "1px solid rgba(234,179,8,0.2)",
                  color: "#F59E0B",
                }}
              >
                Showing: {filteredProducts.length}
              </span>
            </div>
          </div>

          {/* Right — campus perks */}
          <div
            className="p-6 rounded-3xl"
            style={{
              background: "#16171E",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 24px 48px rgba(0,0,0,0.4)",
            }}
          >
            <h3 className="font-bold text-lg mb-5" style={{ color: "#F1F5F9" }}>
              Campus perks
            </h3>
            <div className="space-y-4">
              {[
                { icon: <ShieldCheck className="w-4 h-4" />, label: "Verified student badges for trusted listings" },
                { icon: <MapPin className="w-4 h-4" />, label: "Pickup points near your lecture halls" },
                { icon: <Zap className="w-4 h-4" />, label: "Deal alerts for your campus community" },
              ].map((perk, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(234,179,8,0.08)", color: "#F59E0B" }}
                  >
                    {perk.icon}
                  </div>
                  <p className="text-sm" style={{ color: "#94A3B8" }}>{perk.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── FEATURED PRODUCTS ───────────────────────── */}
      <section className="py-20 relative overflow-hidden" id="featured">
        {/* Animated background orbs */}
        <div
          className="absolute -left-20 top-[30%] w-[340px] h-[340px] rounded-full pointer-events-none animate-[featuredFloat_14s_ease-in-out_infinite]"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.07), transparent 70%)" }}
        />
        <div
          className="absolute -right-16 top-[10%] w-[280px] h-[280px] rounded-full pointer-events-none animate-[featuredFloat_12s_ease-in-out_infinite_reverse]"
          style={{ background: "radial-gradient(circle, rgba(234,179,8,0.07), transparent 70%)" }}
        />

        <div className="max-w-6xl mx-auto w-[92vw] relative z-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 mb-10">
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: "#64748B" }}>
                Featured
              </p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: "#F1F5F9" }}>
                Handpicked for high value
              </h2>
              <p className="text-sm mt-2 max-w-md" style={{ color: "#94A3B8" }}>
                Verified sellers and items in top condition with fair campus pricing.
              </p>
            </div>
            <button
              className="text-sm font-semibold px-6 py-3 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(234,179,8,0.3)]"
              style={{ background: "linear-gradient(135deg,#F59E0B,#D97706)", color: "#0D0E12" }}
            >
              See more
            </button>
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2"
                style={{
                  background: "#16171E",
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 24px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(234,179,8,0.2)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.4)";
                }}
              >
                {/* Image with gradient overlay */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Bottom gradient for price overlay */}
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(13,14,18,0.9) 0%, transparent 55%)" }}
                  />
                  {/* Tag badge */}
                  <span
                    className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold"
                    style={{
                      background: "rgba(13,14,18,0.7)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#E2E8F0",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    {product.tag}
                  </span>
                  <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 flex items-end justify-between">
                    <span className="font-black text-base" style={{ color: "#F59E0B" }}>
                      {product.price}
                    </span>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-4 pt-3">
                  <h3 className="font-bold text-sm mb-1 truncate" style={{ color: "#E2E8F0" }}>
                    {product.name}
                  </h3>
                  <p className="text-xs mb-0.5 flex items-center gap-1" style={{ color: "#64748B" }}>
                    <MapPin className="w-3 h-3" /> {product.location.university}
                  </p>
                  <p className="text-xs mb-4" style={{ color: "#475569" }}>
                    {product.location.campus}
                  </p>

                  {/* CTA buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative group/btn">
                      <button
                        type="button"
                        onClick={() => handleItemClick(product.id)}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "#94A3B8",
                        }}
                      >
                        <Eye size={13} /> View
                      </button>
                      <span
                        className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity"
                        style={{ background: "#1E2029", color: "#94A3B8", border: "1px solid rgba(255,255,255,0.08)" }}
                      >
                        Verify to view
                      </span>
                    </div>
                    <div className="relative group/btn">
                      <button
                        type="button"
                        onClick={() => handleItemClick(product.id)}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(234,179,8,0.4)]"
                        style={{ background: "linear-gradient(135deg,#F59E0B,#D97706)", color: "#0D0E12" }}
                      >
                        <ShoppingCart size={13} /> Buy
                      </button>
                      <span
                        className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity"
                        style={{ background: "#1E2029", color: "#94A3B8", border: "1px solid rgba(255,255,255,0.08)" }}
                      >
                        Verify to buy
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Beautiful empty state */}
          {products.length === 0 && (
            <div
              className="mt-6 flex flex-col items-center justify-center py-20 rounded-3xl text-center"
              style={{
                background: "#16171E",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
                style={{ background: "rgba(234,179,8,0.06)", border: "1px solid rgba(234,179,8,0.12)" }}
              >
                <Package className="w-9 h-9" style={{ color: "#F59E0B" }} />
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: "#E2E8F0" }}>No listings for this campus yet.</h3>
              <p className="text-sm" style={{ color: "#64748B" }}>Try another university or list the first item.</p>
            </div>
          )}
        </div>
      </section>

      {/* ───────────────────────── SAFETY TIPS ───────────────────────── */}
      <section
        className="py-20"
        id="safety"
        style={{ background: "rgba(22,23,30,0.6)", borderTop: "1px solid rgba(255,255,255,0.04)" }}
      >
        <div className="max-w-6xl mx-auto w-[92vw]">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: "#64748B" }}>
              Safety tips
            </p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: "#F1F5F9" }}>
              Trade safely on campus
            </h2>
            <p className="text-sm mt-2 max-w-md" style={{ color: "#94A3B8" }}>
              Simple steps that help buyers and sellers stay safe during meetups and payments.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Meet in public spots", desc: "Use campus cafés, libraries, or security desks for exchanges.", color: "#F59E0B" },
              { title: "Verify student IDs", desc: "Ask to see a student card before exchanging high-value items.", color: "#818cf8" },
              { title: "Use secure payments", desc: "MoMo and escrow help reduce cash risks.", color: "#4ade80" },
              { title: "Bring a friend", desc: "For first-time meetups, don't go alone.", color: "#f472b6" },
            ].map((tip, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl transition-all duration-200 hover:-translate-y-1"
                style={{
                  background: "#16171E",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${tip.color}12`, color: tip.color }}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm mb-1.5" style={{ color: "#E2E8F0" }}>{tip.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "#64748B" }}>{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── HELP CENTER ───────────────────────── */}
      <section className="py-20" id="help">
        <div className="max-w-6xl mx-auto w-[92vw] grid md:grid-cols-2 gap-10 items-start">
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: "#64748B" }}>
              Help center
            </p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3" style={{ color: "#F1F5F9" }}>
              Need help? We've got you.
            </h2>
            <p className="text-sm mb-7" style={{ color: "#94A3B8" }}>
              Quick answers, support channels, and guides for buying and selling.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="mailto:support.unimarketrwanda@gmail.com"
                className="flex items-center gap-2 text-sm font-semibold px-5 py-3 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(234,179,8,0.3)]"
                style={{ background: "linear-gradient(135deg,#F59E0B,#D97706)", color: "#0D0E12" }}
              >
                <Mail className="w-4 h-4" /> Contact support
              </a>
              <a
                href="mailto:support.unimarketrwanda@gmail.com?subject=Issue+Report"
                className="flex items-center gap-2 text-sm font-semibold px-5 py-3 rounded-2xl transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#94A3B8",
                }}
              >
                <ExternalLink className="w-4 h-4" /> Report an issue
              </a>
            </div>
          </div>

          <div
            className="p-6 rounded-3xl"
            style={{
              background: "#16171E",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="space-y-5">
              {[
                { q: "How do I verify a student?", a: "Ask for a student card and prefer campus pickup points." },
                { q: "What payments are supported?", a: "MTN MoMo, Airtel Money, bank transfer, and face-to-face." },
                { q: "How do refunds work?", a: "Refunds are handled by the seller; report disputes to support." },
                { q: "Can I edit my listing?", a: "Yes, open your listing and choose Edit details." },
              ].map((faq, i) => (
                <div
                  key={i}
                  className="pb-5"
                  style={{ borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none" }}
                >
                  <h4 className="font-bold text-sm mb-1.5" style={{ color: "#E2E8F0" }}>{faq.q}</h4>
                  <p className="text-xs leading-relaxed" style={{ color: "#64748B" }}>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── FOOTER / COMPLIANCE ZONE ───────────────────────── */}
      <footer
        style={{
          background: "#0A0B0F",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {/* Newsletter section */}
        <div className="max-w-6xl mx-auto w-[92vw] py-14">
          <div
            className="rounded-3xl p-8 md:p-10 flex flex-col md:flex-row gap-8 items-center justify-between"
            style={{
              background: "linear-gradient(135deg, rgba(234,179,8,0.06) 0%, rgba(99,102,241,0.04) 100%)",
              border: "1px solid rgba(234,179,8,0.12)",
            }}
          >
            {/* Left text */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="text-lg font-black tracking-tight"
                  style={{ color: "#F1F5F9" }}
                >
                  UniMarket Rwanda
                </span>
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-semibold"
                  style={{ background: "rgba(234,179,8,0.1)", color: "#F59E0B", border: "1px solid rgba(234,179,8,0.2)" }}
                >
                  For Students, By Students
                </span>
              </div>
              <p className="text-sm" style={{ color: "#94A3B8" }}>
                Stay updated with campus drops
              </p>
            </div>

            {/* Newsletter form */}
            {newsletterStatus === "sent" ? (
              <div
                className="flex items-center gap-3 px-6 py-3.5 rounded-2xl"
                style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", color: "#4ade80" }}
              >
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-semibold">You're in! Watch for campus drops.</span>
              </div>
            ) : (
              <form
                className="flex gap-2 flex-wrap md:flex-nowrap w-full md:w-auto"
                onSubmit={handleNewsletterSubmit}
              >
                <div
                  className="flex flex-1 md:w-64 items-center gap-2 px-4 rounded-2xl transition-all duration-200 focus-within:shadow-[0_0_0_2px_rgba(234,179,8,0.3)]"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <Mail className="w-4 h-4 shrink-0" style={{ color: "#64748B" }} />
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                    className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-[#475569]"
                    style={{ color: "#E2E8F0" }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={newsletterStatus === "sending"}
                  className="shrink-0 px-6 py-3 rounded-2xl text-sm font-bold text-[#0D0E12] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(234,179,8,0.4)] disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#F59E0B,#D97706)" }}
                >
                  {newsletterStatus === "sending" ? "Sending…" : "Subscribe"}
                </button>
              </form>
            )}
          </div>
        </div>
      </footer>
    </main>
  );
}
