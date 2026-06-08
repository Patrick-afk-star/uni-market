import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, ShieldCheck, MapPin, CheckCircle2, MessageCircle, ExternalLink } from "lucide-react";
import { sampleProducts } from "@/data/products";
import { getApiUrl } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SellerProfile() {
  const navigate = useNavigate();

  const resolveImageUrl = (url: string): string => {
    if (!url) return "https://via.placeholder.com/300";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const apiBase = getApiUrl("/");
    const cleanBase = apiBase.endsWith("/") ? apiBase.slice(0, -1) : apiBase;
    const cleanUrl = url.startsWith("/") ? url : `/${url}`;
    return `${cleanBase}${cleanUrl}`;
  };

  // Mock data for the "About Seller" functionality
  const seller = {
    name: "Jean Paul",
    university: "University of Rwanda - Gikondo",
    joined: "Jan 2024",
    rating: 4.8,
    reviews: 14,
    avatar: "/avatar_student.jpg",
    isVerified: true,
    bio: "Final year CS student. I sell well-maintained tech gear and textbooks from previous semesters. Usually available near the Gikondo campus library or the Innovation Hub.",
    responseRate: "98%",
    avgResponseTime: "15 mins",
    specialty: "Tech & Textbooks"
  };

  // Filter products by this seller name for demo purposes
  const sellerProducts = sampleProducts.filter(p => p.seller.name === seller.name);

  return (
    <div className="max-w-6xl mx-auto p-6 animate-in fade-in duration-700">
      <button 
        onClick={() => navigate(-1)} 
        className="inline-flex items-center gap-2 mb-8 text-sm font-bold text-[#5f5b52] hover:text-[#d8a24a] transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="bg-white dark:bg-[#151816] rounded-[40px] p-8 md:p-12 shadow-2xl shadow-black/5 border border-[rgba(18,20,18,0.08)]">
        <div className="flex flex-col md:flex-row gap-10 items-start md:items-center">
          <div className="relative">
            <img 
              src={resolveImageUrl(seller.avatar)} 
              alt={seller.name} 
              className="w-32 h-32 md:w-40 md:h-40 rounded-[32px] object-cover shadow-xl ring-4 ring-[#f4f5f2] dark:ring-[#1a1d1b]" 
            />
            {seller.isVerified && (
              <div className="absolute -bottom-3 -right-3 bg-[#d8a24a] text-white p-2 rounded-2xl border-4 border-white dark:border-[#151816]">
                <ShieldCheck size={24} fill="currentColor" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-4xl font-serif font-bold">{seller.name}</h1>
              <div className="flex items-center gap-1 bg-[#0a4e39] text-white text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-tighter">
                <CheckCircle2 size={12} /> Verified Student
              </div>
            </div>
            <p className="text-[#5f5b52] dark:text-[#b7b1a6] mt-2 flex items-center gap-1 font-medium">
              <MapPin size={16} className="text-[#d8a24a]" /> {seller.university}
            </p>
            
            <div className="flex gap-8 mt-6 pt-6 border-t border-gray-100">
              <div>
                <p className="text-2xl font-serif font-bold flex items-center gap-1">
                  <Star className="text-[#d8a24a] fill-[#d8a24a]" size={20} /> {seller.rating}
                </p>
                <p className="text-[10px] font-bold text-[#5f5b52] uppercase tracking-widest">Rating</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{seller.reviews}</p>
                <p className="text-[10px] font-bold text-[#5f5b52] uppercase tracking-widest">Reviews</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{seller.joined}</p>
                <p className="text-[10px] font-bold text-[#5f5b52] uppercase tracking-widest">Joined</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#f2f6f4] p-8 rounded-[32px]">
              <h3 className="font-bold text-lg mb-4">About Seller</h3>
              <p className="text-[#5f5b52] dark:text-[#b7b1a6] leading-relaxed">{seller.bio}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Badge className="bg-[#0a4e39]/10 text-[#0a4e39] border-0 px-3 py-1 rounded-lg">{seller.specialty}</Badge>
                <Badge className="bg-[#d8a24a]/10 text-[#7a4a10] border-0 px-3 py-1 rounded-lg">Top Rated</Badge>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Seller Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                  <p className="text-xs text-[#5f5b52] font-bold uppercase tracking-wider mb-1">Response Rate</p>
                  <p className="text-2xl font-serif font-bold text-[#0a4e39]">{seller.responseRate}</p>
                </div>
                <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                  <p className="text-xs text-[#5f5b52] font-bold uppercase tracking-wider mb-1">Avg. Response</p>
                  <p className="text-2xl font-serif font-bold text-[#0a4e39]">{seller.avgResponseTime}</p>
                </div>
              </div>
              <Button className="w-full h-14 bg-[#25d366] hover:bg-[#25d366]/90 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#25d366]/20">
                <MessageCircle size={20} /> Chat with {seller.name.split(' ')[0]}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Seller's Products */}
      <div className="space-y-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-serif font-bold">Listings by {seller.name}</h2>
          <Link to="/dashboard/browse" className="text-sm font-bold text-[#d8a24a] flex items-center gap-1 hover:underline">
            View all marketplace <ExternalLink size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {sellerProducts.map((product) => (
            <article
              key={product.id}
              onClick={() => navigate(`/listing/${product.id}`)}
              className="bg-white dark:bg-[#151816] rounded-3xl overflow-hidden shadow-sm border border-[rgba(18,20,18,0.06)] hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
            >
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={resolveImageUrl(product.image)} 
                  alt={product.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-white/90 backdrop-blur-md text-[#121412] border-0 font-bold px-3 py-1 rounded-xl text-[10px] uppercase">
                    {product.condition}
                  </Badge>
                </div>
              </div>
              <div className="p-6 space-y-3">
                <h3 className="font-bold text-[#121412] dark:text-[#f4f2ee] line-clamp-2 leading-snug group-hover:text-[#d8a24a] transition-colors">
                  {product.title}
                </h3>
                <div className="flex justify-between items-end pt-2">
                  <div>
                    <p className="text-[10px] font-bold text-[#5f5b52] uppercase tracking-widest mb-1">Price</p>
                    <p className="text-xl font-bold text-[#0a4e39] dark:text-[#1f7c5f]">RWF {product.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-[#f2f6f4] px-2 py-1 rounded-lg">
                    <Star size={12} className="text-[#d8a24a] fill-[#d8a24a]" />
                    <span className="text-[10px] font-bold">4.8</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
        
        {sellerProducts.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200">
            <p className="text-muted-foreground font-medium">No other active listings found for this seller.</p>
          </div>
        )}
      </div>
    </div>
  );
}