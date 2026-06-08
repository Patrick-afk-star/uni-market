import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getApiUrl } from "@/lib/api";
import { ShoppingCart, MessageCircle, ArrowLeft, MapPin, ShieldCheck } from "lucide-react";
import { sampleProducts } from "@/data/products";

interface ListingDetail {
  id: string;
  title: string;
  price: string;
  category: string;
  condition: string;
  description: string;
  location: string;
  image: string;
  seller: {
    id: string;
    name: string;
    avatar: string;
    university: string;
  };
}

export default function ListingPage() {
  const resolveImageUrl = (url: string): string => {
    if (!url) return "https://via.placeholder.com/600";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    const apiBase = getApiUrl("/");
    const cleanBase = apiBase.endsWith("/") ? apiBase.slice(0, -1) : apiBase;
    const cleanUrl = url.startsWith("/") ? url : `/${url}`;
    return `${cleanBase}${cleanUrl}`;
  };

  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        // Attempt to find in sample data first for the specific request ID
        const staticMatch = sampleProducts.find(p => p.id === id);
        
        if (staticMatch) {
          setListing({
            id: staticMatch.id,
            title: staticMatch.title,
            price: staticMatch.price.toLocaleString(),
            category: staticMatch.category,
            condition: staticMatch.condition,
            description: staticMatch.description || "No description provided.",
            location: staticMatch.location,
            image: resolveImageUrl(staticMatch.image),
            seller: {
              id: "seller-1",
              name: staticMatch.seller.name,
              avatar: staticMatch.seller.avatar,
              university: staticMatch.location
            }
          });
        } else {
            // Fallback: Fetch from API or show default for the requested UUID
            const response = await fetch(getApiUrl("/api/v1/listing/"));
            const data = await response.json();
            const item = data.find((l: any) => l.id === id) || data[0];
            
            if (item) {
                setListing({
                    id: id || "unknown",
                    title: item.title,
                    price: item.price,
                    category: item.category,
                    condition: item.condition,
                    description: item.description || "Freshly listed student item.",
                    location: item.location || "Main Campus",
                    image: resolveImageUrl(item.images?.[0]?.image),
                    seller: { id: "s1", name: "Jean Paul", avatar: "/avatar_student.jpg", university: "UR - Gikondo" }
                });
            }
        }
      } catch (err) {
        console.error("Failed to fetch listing:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  if (loading) return <div className="p-20 text-center font-serif text-xl">Loading details...</div>;
  if (!listing) return <div className="p-20 text-center">Listing not found.</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 animate-in fade-in duration-500">
      <Link to="/" className="inline-flex items-center gap-2 mb-8 text-sm font-semibold text-[#5f5b52] hover:text-[#d8a24a] transition-colors">
        <ArrowLeft size={16} /> Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="rounded-[40px] overflow-hidden bg-[#f4f5f2] aspect-square shadow-2xl shadow-black/5">
          <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
        </div>

        <div className="flex flex-col">
          <div className="pb-6 border-b border-gray-100">
            <span className="bg-[#0a4e39] text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
              {listing.condition}
            </span>
            <h1 className="text-4xl font-serif font-bold mt-4 leading-tight">{listing.title}</h1>
            <p className="text-3xl font-bold text-[#0a4e39] mt-3">{listing.price} RWF</p>
          </div>

          <div className="py-6">
            <Link to={`/seller/${listing.seller.id}`} className="flex items-center gap-4 group">
              <img src={listing.seller.avatar} alt={listing.seller.name} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-transparent group-hover:ring-[#d8a24a] transition-all" />
              <div>
                <p className="font-bold text-lg group-hover:text-[#d8a24a] transition-colors">{listing.seller.name}</p>
                <p className="text-sm text-[#5f5b52]">{listing.seller.university} • <span className="text-[#d8a24a] font-semibold">View Profile</span></p>
              </div>
            </Link>
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="font-bold text-lg">About this item</h3>
            <p className="text-[#5f5b52] leading-relaxed">{listing.description}</p>
            <div className="flex items-center gap-2 text-sm text-[#5f5b52] bg-[#f2f6f4] w-fit px-4 py-2 rounded-xl">
              <MapPin size={16} className="text-[#0a4e39]" />
              <span>Located at <span className="font-bold text-[#121412]">{listing.location}</span></span>
            </div>
          </div>

          <div className="flex gap-4 mt-auto">
            <button className="flex-1 bg-[#d8a24a] text-[#121412] py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-[#d8a24a]/20 transition-all">
              <ShoppingCart size={20} /> Instant Buy
            </button>
            <button className="flex-1 bg-[#25d366] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:brightness-105 transition-all">
              <MessageCircle size={20} /> WhatsApp Seller
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}