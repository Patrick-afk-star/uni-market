"use client";
import { ShoppingCart, Eye, MessageCircle } from "lucide-react";

export default function Hero() {
  // Original static data restored
  const products = [
    {
      id: 1,
      name: "Wireless Headphones",
      price: "28,000 RWF",
      rating: 4.8,
      location: "KG 15 mins ago",
      university: "UR - Gikondo",
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
      tag: "Like new",
    },
    {
      id: 2,
      name: "Minimal Study Desk",
      price: "85,000 RWF",
      rating: 4.9,
      location: "UR Huye",
      university: "UR - Huye",
      image:
        "https://plus.unsplash.com/premium_photo-1711051475117-f3a4d3ff6778?auto=format&fit=crop&w=800&q=80",
      tag: "Solid wood",
    },
    {
      id: 3,
      name: "Programming Books (set of 5)",
      price: "12,000 RWF",
      rating: 5.0,
      location: "CMU Africa",
      university: "CMU Africa",
      image:
        "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80",
      tag: "Bestseller",
    },
    {
      id: 4,
      name: "MacBook Air M1",
      price: "750,000 RWF",
      rating: 4.9,
      location: "ALU",
      university: "African Leadership University",
      image:
        "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80",
      tag: "Student discount",
    },
  ];

  const categories = [
    { title: "Electronics", count: 320 },
    { title: "Furniture", count: 180 },
    { title: "Textbooks", count: 240 },
    { title: "Clothing", count: 190 },
    { title: "Stationery", count: 95 },
    { title: "Bicycles", count: 42 },
    { title: "Kitchen", count: 78 },
    { title: "Sports", count: 64 },
  ];
  const universities = [
    "University of Rwanda - Huye",
    "University of Rwanda - Gikondo",
    "University of Rwanda - Nyarugenge",
    "CMU Africa",
    "African Leadership University",
    "INES Ruhengeri",
    "ULK",
  ];
  const deals = [
    { title: "Laptop + Backpack Bundle", detail: "Save 15% + free mouse" },
    { title: "Textbook Exchange Pack", detail: "3 books for 25,000 RWF" },
    { title: "Room Essentials Kit", detail: "Bedding, lamp, organizer" },
  ];

  const testimonials = [
    {
      name: "Clarisse I.",
      school: "UR - Huye",
      quote:
        "I sold my laptop in two hours. Met the buyer at the library – super easy!",
    },
    {
      name: "Jean Paul",
      school: "CMU Africa",
      quote:
        "Found a perfect study desk for half the price of a new one. Will definitely use again.",
    },
    {
      name: "Amina K.",
      school: "ALU",
      quote:
        "The student verification makes it feel safe. I’ve bought three items now.",
    },
  ];

  return (
    <main className="home-only">
      {/* Hero Section */}
      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto w-[92vw]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left column */}
            <div className="relative">
              {/* Decorative gradient orb */}
              <div
                className="absolute -top-5 -left-8 w-36 h-36 rounded-full -z-10"
                style={{
                  background:
                    "radial-gradient(circle, rgba(216,162,74,0.3), transparent 70%)",
                }}
              />
              <div className="inline-flex items-center gap-2 text-xs px-3.5 py-1.5 rounded-full bg-[rgba(28,110,93,0.1)] text-[#0a4e39] dark:text-[#1f7c5f] font-semibold">
                <span>Trusted by 18,000+ students</span>
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl leading-tight my-3.5">
                Shop smarter. Sell faster. Right on campus.
              </h1>
              <p className="text-[#5f5b52] dark:text-[#b7b1a6] leading-relaxed">
                Discover verified student listings, affordable tech, and
                hostel-ready essentials across Rwanda. Buy now, or list your
                item in under two minutes.
              </p>

              {/* Search */}
              <div className="flex flex-wrap gap-3 my-5">
                <input
                  type="text"
                  placeholder="Search for laptops, textbooks, furniture..."
                  aria-label="Search products"
                  className="flex-1 min-w-[14rem] px-4 py-3.5 rounded-2xl border border-[rgba(28,25,23,0.15)] dark:border-white/15 bg-white dark:bg-[#121412] text-sm focus:outline-none focus:ring-2 focus:ring-[#d8a24a]"
                />
                <button
                  className="bg-[#d8a24a] dark:bg-[#e4b363] text-[#121412] rounded-full px-4.5 py-2.75 font-semibold text-sm shadow-[0_10px_24px_rgba(216,162,74,0.25)] hover:shadow-[0_14px_24px_rgba(216,162,74,0.3)] hover:-translate-y-px transition-transform duration-200 cursor-pointer"
                  type="button"
                >
                  Search
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-2.5">
                <div>
                  <div className="text-lg font-bold">4.9/5</div>
                  <div className="text-xs text-[#5f5b52] dark:text-[#b7b1a6]">
                    Average rating
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold">2,600+</div>
                  <div className="text-xs text-[#5f5b52] dark:text-[#b7b1a6]">
                    Active listings
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold">90 min</div>
                  <div className="text-xs text-[#5f5b52] dark:text-[#b7b1a6]">
                    Avg. sell time
                  </div>
                </div>
              </div>
            </div>

            {/* Right column – featured card */}
            <div className="bg-[#ffffff] dark:bg-[#151816] p-5 rounded-3xl shadow-[0_18px_40px_rgba(10,12,11,0.08)] dark:shadow-[0_20px_45px_rgba(0,0,0,0.4)] relative overflow-hidden">
              {/* Decorative orb */}
              <div
                className="absolute -right-10 -bottom-10 w-36 h-36 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(42,166,127,0.25), transparent 70%)",
                }}
              />
              <div className="flex items-center justify-between font-semibold">
                <p>Today on UniMarket</p>
                <span className="bg-[#d8a24a] text-[#3b2a12] px-2.5 py-1 rounded-full text-xs font-bold">
                  New
                </span>
              </div>
              <div className="grid gap-4 mt-4">
                {products.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-xl"
                    />
                    <div>
                      <h3 className="text-sm font-medium">{item.name}</h3>
                      <p className="text-xs text-[#5f5b52] dark:text-[#b7b1a6] mt-1">
                        {item.price} • {item.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="w-full mt-4 bg-[#ffffff] dark:bg-[#171a18] text-[#121412] dark:text-[#f4f2ee] border border-[rgba(18,20,18,0.12)] dark:border-white/10 rounded-full px-4.5 py-[11px] font-semibold text-sm hover:-translate-y-px transition-transform"
                type="button"
                onClick={() => {
                  document
                    .getElementById("featured")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Browse all listings
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-14" id="categories">
        <div className="max-w-6xl mx-auto w-[92vw]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 mb-8">
            <div>
              <p className="uppercase tracking-widest text-xs text-[#5f5b52] dark:text-[#b7b1a6]">
                Categories
              </p>
              <h2 className="text-3xl font-bold mt-1">Shop by student needs</h2>
              <p className="text-[#5f5b52] dark:text-[#b7b1a6] max-w-lg mt-2">
                From tech to hostel essentials, find what matters most this
                semester.
              </p>
            </div>
            <button className="bg-transparent text-[#5f5b52] dark:text-[#b7b1a6] border border-[rgba(18,20,18,0.12)] dark:border-white/10 rounded-full px-4.5 py-2.75 font-semibold text-sm hover:-translate-y-px transition-transform">
              View all
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.title}
                className="bg-[#ffffff] dark:bg-[#151816] p-4 rounded-xl flex items-center gap-3 shadow-[0_12px_28px_rgba(20,12,8,0.06)] border border-[rgba(18,20,18,0.12)] dark:border-white/10"
              >
                <div className="w-11 h-11 rounded-xl bg-[rgba(28,110,93,0.12)] grid place-items-center font-bold text-[#0a4e39] dark:text-[#1f7c5f]">
                  {cat.title[0]}
                </div>
                <div>
                  <h3 className="font-semibold">{cat.title}</h3>
                  <p className="text-sm text-[#5f5b52] dark:text-[#b7b1a6]">
                    {cat.count} listings
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Universities Section */}
      <section className="py-14 bg-white dark:bg-transparent" id="universities">
        <div className="max-w-6xl mx-auto w-[92vw] grid md:grid-cols-2 gap-6 items-center">
          <div>
            <p className="uppercase tracking-widest text-xs text-[#5f5b52] dark:text-[#b7b1a6]">
              Your campus
            </p>
            <h2 className="text-3xl font-bold mt-1">Choose your university</h2>
            <p className="text-[#5f5b52] dark:text-[#b7b1a6] max-w-lg mt-2">
              Filter listings and get pickup options that match your campus.
            </p>
            <div className="flex flex-wrap gap-3 mt-4 items-center">
              <select
                aria-label="Select your university"
                className="flex-1 min-w-[14rem] px-3.5 py-3 rounded-2xl border border-[rgba(28,25,23,0.15)] dark:border-white/15 bg-white dark:bg-[#121412] text-sm focus:outline-none focus:ring-2 focus:ring-[#d8a24a]"
              >
                <option value="All">All universities</option>
                {universities.map((school) => (
                  <option key={school} value={school}>
                    {school}
                  </option>
                ))}
              </select>
              <span className="bg-[rgba(28,110,93,0.12)] text-[#0a4e39] dark:text-[#1f7c5f] px-3 py-2 rounded-full text-xs font-semibold">
                Showing: 3
              </span>
            </div>
          </div>
          <div className="bg-[#f2f6f4] dark:bg-[#151816] p-5 rounded-3xl shadow-[0_18px_40px_rgba(10,12,11,0.08)] dark:shadow-[0_20px_45px_rgba(0,0,0,0.4)]">
            <h3 className="font-bold text-xl mb-2">Campus perks</h3>
            <ul className="text-[#5f5b52] dark:text-[#b7b1a6] space-y-2 list-disc pl-5">
              <li>Verified student badges for trusted listings</li>
              <li>Pickup points near your lecture halls</li>
              <li>Deal alerts for your campus community</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section
        className="py-14 relative overflow-hidden border-t border-b border-[rgba(18,20,18,0.12)] dark:border-white/10 bg-white/65 dark:bg-[#171a18]/70"
        id="featured"
      >
        {/* Animated background orbs */}
        <div
          className="absolute w-56 h-56 -left-17.5 top-[28%] rounded-full pointer-events-none animate-[featuredFloat_12s_ease-in-out_infinite]"
          style={{
            background:
              "radial-gradient(circle, rgba(42,166,127,0.14), transparent 70%)",
          }}
        />
        <div
          className="absolute w-44 h-44 -right-12.5 top-[16%] rounded-full pointer-events-none animate-[featuredFloat_14s_ease-in-out_infinite_reverse]"
          style={{
            background:
              "radial-gradient(circle, rgba(216,162,74,0.16), transparent 70%)",
          }}
        />
        <div className="max-w-6xl mx-auto w-[92vw] relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 mb-8">
            <div>
              <p className="uppercase tracking-widest text-xs text-[#5f5b52] dark:text-[#b7b1a6]">
                Featured
              </p>
              <h2 className="text-3xl font-bold mt-1">
                Handpicked for high value
              </h2>
              <p className="text-[#5f5b52] dark:text-[#b7b1a6] max-w-lg mt-2">
                Verified sellers and items in top condition with fair campus
                pricing.
              </p>
            </div>
            <button className="bg-[#d8a24a] dark:bg-[#e4b363] text-[#121412] rounded-full px-4.5 py-2.75 font-semibold text-sm shadow-[0_10px_24px_rgba(216,162,74,0.25)] hover:shadow-[0_14px_24px_rgba(216,162,74,0.3)] hover:-translate-y-px transition-transform">
              See more
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map((product) => (
              <article
                key={product.id}
                className="bg-[#ffffff] dark:bg-[#151816] rounded-2xl overflow-hidden shadow-[0_18px_35px_rgba(20,12,8,0.08)] border border-[rgba(18,20,18,0.12)] dark:border-white/10 hover:-translate-y-1 hover:shadow-[0_24px_40px_rgba(20,12,8,0.12)] transition-transform relative group"
              >
                {/* Sheen effect on hover */}
                <div className="absolute inset-0 pointer-events-none bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[cardSheen_1.05s_ease] dark:via-white/10" />
                <div className="relative h-44">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-[rgba(28,110,93,0.9)] text-white px-3 py-1.5 rounded-full text-xs font-semibold">
                    {product.tag}
                  </span>
                </div>
                <div className="p-4 grid gap-2.5">
                  <h3 className="font-semibold text-base">{product.name}</h3>
                  <div className="flex justify-between font-semibold">
                    <span className="text-[#0a4e39] dark:text-[#1f7c5f]">
                      {product.price}
                    </span>
                    <span className="bg-[rgba(241,179,92,0.3)] px-2 py-1 rounded-full text-xs">
                      ★ {product.rating}
                    </span>
                  </div>
                  <p className="text-sm text-[#5f5b52] dark:text-[#b7b1a6]">
                    {product.location}
                  </p>
                  <p className="text-xs text-[#8a847b] dark:text-[#b7b1a6]/80">
                    {product.university}
                  </p>
                  <div className="flex flex-col gap-2 mt-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative w-full group/btn">
                        <button
                          className="w-full flex items-center justify-center gap-1.5 bg-[#ffffff] dark:bg-[#171a18] text-[#121412] dark:text-[#f4f2ee] border border-[rgba(18,20,18,0.12)] dark:border-white/10 rounded-xl px-3 py-2 font-semibold text-xs hover:-translate-y-px transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
                          type="button"
                        >
                          <Eye size={14} /> View
                        </button>
                        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#111311] dark:bg-[#f4f2ee] text-white dark:text-[#121412] text-xs px-2.5 py-1.5 rounded-md whitespace-nowrap shadow-lg opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none z-10">
                          Verify to view
                        </span>
                      </div>
                      <div className="relative w-full group/btn">
                        <button
                          className="w-full flex items-center justify-center gap-1.5 bg-[#d8a24a] dark:bg-[#e4b363] text-[#121412] rounded-xl px-3 py-2 font-semibold text-xs shadow-[0_10px_24px_rgba(216,162,74,0.25)] hover:shadow-[0_14px_24px_rgba(216,162,74,0.3)] hover:-translate-y-px transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
                          type="button"
                        >
                          <ShoppingCart size={14} /> Buy
                        </button>
                        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#111311] dark:bg-[#f4f2ee] text-white dark:text-[#121412] text-xs px-2.5 py-1.5 rounded-md whitespace-nowrap shadow-lg opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none z-10">
                          Verify to buy
                        </span>
                      </div>
                    </div>
                    <div className="relative w-full group/btn">
                      <button
                        className="w-full flex items-center justify-center gap-1.5 bg-[#25d366] text-[#0f1b12] rounded-xl px-3 py-2 font-semibold text-xs hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                        type="button"
                      >
                        <MessageCircle size={14} /> WhatsApp seller
                      </button>
                      <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#111311] dark:bg-[#f4f2ee] text-white dark:text-[#121412] text-xs px-2.5 py-1.5 rounded-md whitespace-nowrap shadow-lg opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none z-10">
                        Verify to contact
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 p-6 bg-white dark:bg-[#151816] rounded-xl shadow-[0_18px_40px_rgba(10,12,11,0.08)]">
            <h3 className="font-bold text-lg">
              No listings for this campus yet.
            </h3>
            <p className="text-[#5f5b52] dark:text-[#b7b1a6]">
              Try another university or list the first item.
            </p>
          </div>
        </div>
      </section>

      {/* Deals Section */}
      <section className="py-14 relative overflow-hidden" id="deals">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-44 h-44 -left-10 top-5 rounded-full animate-[floatOrb_10s_ease-in-out_infinite] bg-[radial-gradient(circle,rgba(216,162,74,0.5),transparent_70%)]" />
          <div className="absolute w-56 h-56 -right-15 top-[30%] rounded-full animate-[floatOrb_10s_ease-in-out_infinite_1.2s] bg-[radial-gradient(circle,rgba(42,166,127,0.38),transparent_70%)]" />
          <div className="absolute w-40 h-40 left-[35%] -bottom-12.5 rounded-full animate-[floatOrb_10s_ease-in-out_infinite_2.1s] bg-[radial-gradient(circle,rgba(74,166,207,0.32),transparent_70%)]" />
        </div>
        <div className="max-w-6xl mx-auto w-[92vw] relative z-10 grid md:grid-cols-2 gap-6 items-center">
          <article>
            <p className="uppercase tracking-widest text-xs text-[#5f5b52] dark:text-[#b7b1a6]">
              Deals of the week
            </p>
            <h2 className="text-3xl font-bold mt-1">
              Bundle up and save on essentials
            </h2>
            <p className="text-[#5f5b52] dark:text-[#b7b1a6] max-w-lg mt-2">
              Curated bundles from verified sellers with free campus delivery
              for orders over 80,000 RWF.
            </p>
            <div className="grid gap-3.5 my-5">
              {deals.map((deal) => (
                <div
                  key={deal.title}
                  className="bg-white/65 dark:bg-[#151816]/80 border border-[rgba(18,20,18,0.12)] dark:border-white/10 p-3.5 rounded-2xl shadow-[0_10px_20px_rgba(20,12,8,0.06)] hover:-translate-y-1 transition-transform"
                >
                  <h4 className="font-semibold">{deal.title}</h4>
                  <p className="text-sm text-[#5f5b52] dark:text-[#b7b1a6]">
                    {deal.detail}
                  </p>
                </div>
              ))}
            </div>
            <button className="bg-[#d8a24a] dark:bg-[#e4b363] text-[#121412] rounded-full px-4.5 py-2.75 font-semibold text-sm shadow-[0_10px_24px_rgba(216,162,74,0.25)] hover:shadow-[0_14px_24px_rgba(216,162,74,0.3)] hover:-translate-y-px transition-transform">
              Claim your deal
            </button>
          </article>
          <article className="bg-[#141312] dark:bg-[#0f0f0f] text-[#fdf7ee] p-6 rounded-3xl">
            <span className="bg-[#d8a24a] text-[#3b2a12] px-2.5 py-1 rounded-full text-xs font-bold">
              Limited
            </span>
            <h3 className="text-2xl font-bold mt-3">Flash Sale</h3>
            <p className="text-[#fdf7ee]/80 mt-1">
              Save up to 35% on electronics before Friday.
            </p>
            <div className="flex gap-3 mt-4">
              <div className="bg-white/10 p-2.5 rounded-xl text-center min-w-[70px]">
                <span className="block text-lg font-bold">08</span>
                <small className="text-white/70 text-xs">Hours</small>
              </div>
              <div className="bg-white/10 p-2.5 rounded-xl text-center min-w-[70px]">
                <span className="block text-lg font-bold">24</span>
                <small className="text-white/70 text-xs">Minutes</small>
              </div>
              <div className="bg-white/10 p-2.5 rounded-xl text-center min-w-[70px]">
                <span className="block text-lg font-bold">52</span>
                <small className="text-white/70 text-xs">Seconds</small>
              </div>
            </div>
            <button className="w-full mt-4 bg-transparent text-white border border-white/20 rounded-full px-4.5 py-2.75 font-semibold text-sm hover:-translate-y-px transition-transform">
              Shop electronics
            </button>
          </article>
        </div>
      </section>

      {/* Payments Section */}
      <section className="py-14 bg-[#f7f4ee] dark:bg-[#141615]" id="payments">
        <div className="max-w-6xl mx-auto w-[92vw]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 mb-8">
            <div>
              <p className="uppercase tracking-widest text-xs text-[#5f5b52] dark:text-[#b7b1a6]">
                Payments
              </p>
              <h2 className="text-3xl font-bold mt-1">
                Pay the way students do
              </h2>
              <p className="text-[#5f5b52] dark:text-[#b7b1a6] max-w-lg mt-2">
                Choose trusted local options including MoMo and face-to-face
                exchange on campus.
              </p>
            </div>
            <button className="bg-transparent text-[#5f5b52] dark:text-[#b7b1a6] border border-[rgba(18,20,18,0.12)] dark:border-white/10 rounded-full px-4.5 py-2.75 font-semibold text-sm hover:-translate-y-px transition-transform">
              Payment help
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "MTN MoMo",
                desc: "Instant mobile money with escrow protection.",
                tag: "Most used",
              },
              {
                title: "Airtel Money",
                desc: "Quick transfers for verified student sellers.",
                tag: null,
              },
              {
                title: "Face-to-face",
                desc: "Meet on campus and pay in person.",
                tag: "Campus pickup",
              },
              {
                title: "Bank transfer",
                desc: "For higher-value items and bundles.",
                tag: null,
              },
            ].map((method, idx) => (
              <div
                key={idx}
                className="bg-[#ffffff] dark:bg-[#151816] p-5 rounded-xl shadow-[0_16px_30px_rgba(20,12,8,0.08)] border border-[rgba(18,20,18,0.12)] dark:border-white/10 hover:-translate-y-1 hover:shadow-[0_22px_36px_rgba(20,12,8,0.12)] transition-transform"
              >
                <h3 className="font-bold">{method.title}</h3>
                <p className="text-sm text-[#5f5b52] dark:text-[#b7b1a6] mt-1">
                  {method.desc}
                </p>
                {method.tag && (
                  <span
                    className={`inline-block mt-2 text-xs px-2.5 py-1 rounded-full font-semibold ${method.tag === "Most used"
                      ? "bg-[rgba(28,110,93,0.12)] text-[#0a4e39] dark:text-[#1f7c5f]"
                      : "bg-[rgba(241,179,92,0.3)] text-[#7a4a10]"
                      }`}
                  >
                    {method.tag}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works + Testimonials */}
      <section className="py-14">
        <div className="max-w-6xl mx-auto w-[92vw] grid md:grid-cols-2 gap-6">
          <div className="bg-[#ffffff] dark:bg-[#151816] p-6 rounded-3xl shadow-[0_18px_40px_rgba(10,12,11,0.08)] border border-[rgba(18,20,18,0.12)] dark:border-white/10">
            <p className="uppercase tracking-widest text-xs text-[#5f5b52] dark:text-[#b7b1a6]">
              How it works
            </p>
            <h2 className="text-3xl font-bold mt-1">
              Secure, student-focused commerce
            </h2>
            <p className="text-[#5f5b52] dark:text-[#b7b1a6] mt-2">
              Every seller is verified, with easy chat and optional campus
              delivery to keep transactions smooth.
            </p>
            <div className="grid gap-4 mt-5">
              {[
                {
                  num: 1,
                  title: "Verify your campus",
                  desc: "Use your student email to unlock listings.",
                },
                {
                  num: 2,
                  title: "Chat and pay safely",
                  desc: "Secure chat and escrow for peace of mind.",
                },
                {
                  num: 3,
                  title: "Pick up or deliver",
                  desc: "Meet on campus or schedule delivery.",
                },
              ].map((step) => (
                <div key={step.num} className="flex gap-3">
                  <span className="w-7 h-7 rounded-full bg-[rgba(28,110,93,0.15)] text-[#0a4e39] dark:text-[#1f7c5f] grid place-items-center font-bold">
                    {step.num}
                  </span>
                  <div>
                    <h4 className="font-semibold">{step.title}</h4>
                    <p className="text-sm text-[#5f5b52] dark:text-[#b7b1a6]">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#ffffff] dark:bg-[#151816] p-6 rounded-3xl shadow-[0_18px_40px_rgba(10,12,11,0.08)] border border-[rgba(18,20,18,0.12)] dark:border-white/10">
            <p className="uppercase tracking-widest text-xs text-[#5f5b52] dark:text-[#b7b1a6]">
              Students love us
            </p>
            <h2 className="text-3xl font-bold mt-1">Trusted across Rwanda</h2>
            <div className="grid gap-4 mt-5">
              {testimonials.map((t) => (
                <div key={t.name}>
                  <p className="text-[#5f5b52] dark:text-[#b7b1a6]">
                    "{t.quote}"
                  </p>
                  <span className="block mt-1 text-xs text-[#5f5b52] dark:text-[#b7b1a6]/70">
                    {t.name} • {t.school}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16" id="support">
        <div className="max-w-6xl mx-auto w-[92vw] bg-[#d8a24a] dark:bg-[#e4b363] p-6 md:p-8 rounded-3xl grid md:grid-cols-2 gap-5 items-center">
          <div>
            <p className="uppercase tracking-widest text-xs text-[#121412]/80">
              Stay in the loop
            </p>
            <h2 className="text-3xl font-bold text-[#121412] mt-1">
              Get weekly drops and student deals
            </h2>
            <p className="text-[#121412]/80 mt-2">
              Join our newsletter for the latest campus discounts and verified
              listings.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 min-w-[12rem] px-3.5 py-3 rounded-full border border-white/20 bg-white/20 text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-[#d8a24a] rounded-full px-4.5 py-2.75 font-semibold text-sm shadow-lg hover:-translate-y-px transition-transform">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Safety Tips */}
      <section
        className="py-14 bg-white/60 dark:bg-[#171a24]/70 border-t border-[rgba(28,25,23,0.06)] dark:border-white/10"
        id="safety"
      >
        <div className="max-w-6xl mx-auto w-[92vw]">
          <div className="mb-8">
            <p className="uppercase tracking-widest text-xs text-[#5f5b52] dark:text-[#b7b1a6]">
              Safety tips
            </p>
            <h2 className="text-3xl font-bold mt-1">Trade safely on campus</h2>
            <p className="text-[#5f5b52] dark:text-[#b7b1a6] max-w-lg mt-2">
              Simple steps that help buyers and sellers stay safe during meetups
              and payments.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "Meet in public spots",
                desc: "Use campus cafés, libraries, or security desks for exchanges.",
              },
              {
                title: "Verify student IDs",
                desc: "Ask to see a student card before exchanging high‑value items.",
              },
              {
                title: "Use secure payments",
                desc: "MoMo and escrow help reduce cash risks.",
              },
              {
                title: "Bring a friend",
                desc: "For first‑time meetups, don’t go alone.",
              },
            ].map((tip, idx) => (
              <div
                key={idx}
                className="bg-[#ffffff] dark:bg-[#151816] p-4 rounded-xl shadow-[0_18px_40px_rgba(10,12,11,0.08)] border border-[rgba(18,20,18,0.12)] dark:border-white/10"
              >
                <h3 className="font-bold">{tip.title}</h3>
                <p className="text-sm text-[#5f5b52] dark:text-[#b7b1a6] mt-1">
                  {tip.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Help Center */}
      <section className="py-14 bg-[#fdf7ee] dark:bg-[#171a24]/80" id="help">
        <div className="max-w-6xl mx-auto w-[92vw] grid md:grid-cols-2 gap-6 items-start">
          <div>
            <p className="uppercase tracking-widest text-xs text-[#5f5b52] dark:text-[#b7b1a6]">
              Help center
            </p>
            <h2 className="text-3xl font-bold mt-1">
              Need help? We’ve got you.
            </h2>
            <p className="text-[#5f5b52] dark:text-[#b7b1a6] max-w-lg mt-2">
              Quick answers, support channels, and guides for buying and
              selling.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <button className="bg-[#d8a24a] dark:bg-[#e4b363] text-[#121412] rounded-full px-4.5 py-2.75 font-semibold text-sm shadow-[0_10px_24px_rgba(216,162,74,0.25)] hover:shadow-[0_14px_24px_rgba(216,162,74,0.3)] hover:-translate-y-px transition-transform">
                Contact support
              </button>
              <button className="bg-[#ffffff] dark:bg-[#171a18] text-[#121412] dark:text-[#f4f2ee] border border-[rgba(18,20,18,0.12)] dark:border-white/10 rounded-full px-4.5 py-2.75 font-semibold text-sm hover:-translate-y-px transition-transform">
                Report an issue
              </button>
            </div>
          </div>
          <div className="bg-[#ffffff] dark:bg-[#151816] p-5 rounded-xl shadow-[0_18px_40px_rgba(10,12,11,0.08)] border border-[rgba(18,20,18,0.12)] dark:border-white/10">
            <div className="space-y-3.5">
              <div>
                <h4 className="font-semibold">How do I verify a student?</h4>
                <p className="text-sm text-[#5f5b52] dark:text-[#b7b1a6]">
                  Ask for a student card and prefer campus pickup points.
                </p>
              </div>
              <div>
                <h4 className="font-semibold">What payments are supported?</h4>
                <p className="text-sm text-[#5f5b52] dark:text-[#b7b1a6]">
                  MTN MoMo, Airtel Money, bank transfer, and face‑to‑face.
                </p>
              </div>
              <div>
                <h4 className="font-semibold">How do refunds work?</h4>
                <p className="text-sm text-[#5f5b52] dark:text-[#b7b1a6]">
                  Refunds are handled by the seller; report disputes to support.
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Can I edit my listing?</h4>
                <p className="text-sm text-[#5f5b52] dark:text-[#b7b1a6]">
                  Yes, open your listing and choose Edit details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
