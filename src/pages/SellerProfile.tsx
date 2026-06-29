import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Loader2, AlertCircle, GraduationCap, Package, MapPin } from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import type { Product, Category, Condition, DealType } from "@/types";

interface SellerProfileData {
  id: string;
  name: string;
  avatar_url: string | null;
  account_type: string | null;
  student_profile: {
    university: string | null;
  } | null;
  bio: string | null;
  date_joined: string | null;
}

export default function SellerProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [seller, setSeller] = useState<SellerProfileData | null>(null);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resolveImageUrl = (url: string): string => {
    if (!url) return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const apiBase = getApiUrl("/");
    const cleanBase = apiBase.endsWith("/") ? apiBase.slice(0, -1) : apiBase;
    const cleanUrl = url.startsWith("/") ? url : `/${url}`;
    return `${cleanBase}${cleanUrl}`;
  };

  const mapApiCondition = (cond: string): Condition => {
    if (!cond) return 'Good';
    const normalized = cond.toLowerCase().replace(/_/g, ' ');
    if (normalized === 'new') return 'New';
    if (normalized === 'like new') return 'Like New';
    if (normalized === 'good') return 'Good';
    if (normalized === 'fair') return 'Fair';
    return 'Good';
  };

  const mapApiCategory = (cat: string): Category => {
    if (!cat) return 'Other';
    const normalized = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
    const validCategories: Category[] = ['Textbooks', 'Electronics', 'Furniture', 'Clothing', 'Tickets', 'Other'];
    if (validCategories.includes(normalized as Category)) {
      return normalized as Category;
    }
    return 'Other';
  };

  useEffect(() => {
    const fetchProfileAndListings = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        setError(null);
        const headers: Record<string, string> = {};
        if (accessToken) {
          headers["Authorization"] = `Bearer ${accessToken}`;
        }
        
        // Fetch Profile
        const profileRes = await fetch(getApiUrl(`/api/v1/profiles/${id}`), { headers });
        if (!profileRes.ok) {
          throw new Error("Could not load this seller's profile.");
        }
        const profileData = await profileRes.json();
        
        const sellerObj = {
          id: profileData.id || id,
          name: profileData.name || profileData.display_name || profileData.first_name || "Student Seller",
          avatar_url: profileData.avatar_url || null,
          account_type: profileData.account_type || "student",
          student_profile: profileData.student_profile || (profileData.university ? { university: profileData.university } : null),
          bio: profileData.bio || "",
          date_joined: profileData.date_joined || profileData.created_at || null,
        };
        setSeller(sellerObj);

        // Fetch Seller Listings from /api/v1/listing/
        const listingsRes = await fetch(getApiUrl("/api/v1/listing/"), { headers });
        if (listingsRes.ok) {
          const listingsData = await listingsRes.json();
          if (Array.isArray(listingsData)) {
            // Filter by seller ID
            const filtered = listingsData
              .filter((item: any) => {
                const sellerId = item.seller_info?.id || item.seller_id;
                return sellerId === id;
              })
              .map((item: any, index: number) => {
                const image = item.images && Array.isArray(item.images) && item.images.length > 0
                  ? resolveImageUrl(item.images[0].image)
                  : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80";

                return {
                  id: item.id ? item.id.toString() : `seller-listing-${index}`,
                  title: item.title,
                  price: parseFloat(item.price) || 0,
                  category: mapApiCategory(item.category),
                  condition: mapApiCondition(item.condition),
                  image,
                  location: item.location || "Kigali Campus",
                  postedAt: "Recently",
                  seller: {
                    name: sellerObj.name,
                    avatar: sellerObj.avatar_url || ""
                  },
                  description: item.description || item.title,
                  dealType: ["Meet on campus"] as DealType[]
                };
              });
            setSellerProducts(filtered);
          }
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileAndListings();
  }, [id, accessToken]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-full min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-sm font-medium">Loading seller profile...</p>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-full min-h-[50vh]">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold mb-2 text-foreground">Profile not found</h2>
        <p className="text-muted-foreground text-center mb-6 max-w-sm">
          {error || "We couldn't find this seller's profile."}
        </p>
        <Button onClick={() => navigate(-1)} variant="outline" className="rounded-xl">
          Go Back
        </Button>
      </div>
    );
  }

  const initial = seller.name ? seller.name.charAt(0).toUpperCase() : "S";

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 md:px-6 animate-in fade-in duration-500 space-y-10">
      <div>
        {/* Back Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        {/* Profile Card */}
        <Card className="bg-[#0f0f0f] border-white/[0.06] p-6 md:p-8 rounded-2xl relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#bb740a]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start relative z-10">
            {/* Avatar Layout */}
            <Avatar className="w-24 h-24 md:w-28 md:h-28 ring-4 ring-white/[0.04] shrink-0">
              <AvatarImage src={seller.avatar_url || ""} alt={seller.name} className="object-cover" />
              <AvatarFallback className="bg-[#2a2a2a] text-[#a0a0a0] text-3xl font-bold">
                {initial}
              </AvatarFallback>
            </Avatar>

            {/* Identity & Bio */}
            <div className="flex-1 min-w-0 space-y-3 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 justify-center md:justify-start">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight leading-none">{seller.name}</h2>
                {seller.account_type === "student" && (
                  <Badge className="bg-[#177865]/10 text-[#2aa67f] hover:bg-[#177865]/10 border-0 text-[11px] font-semibold w-fit mx-auto md:mx-0 px-2.5 py-0.5 rounded-full">
                    Verified Student
                  </Badge>
                )}
              </div>

              {/* University */}
              {seller.student_profile?.university && (
                <div className="flex items-center justify-center md:justify-start text-muted-foreground text-sm gap-2">
                  <GraduationCap className="w-4 h-4 text-primary shrink-0" />
                  <span className="truncate">{seller.student_profile.university}</span>
                </div>
              )}

              {/* Bio Section */}
              <div className="pt-2">
                <p className="text-sm text-foreground/80 leading-relaxed font-normal">
                  {seller.bio && seller.bio.trim() !== "" 
                    ? seller.bio 
                    : "This seller hasn't added a bio yet."}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-end border-t border-white/[0.06] pt-5 relative z-10">
            <Button 
              variant="ghost" 
              className="text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl h-12 order-2 sm:order-1"
              onClick={() => toast.success("Report submitted. Our moderation team will review this account.")}
            >
              Report Seller
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 h-12 rounded-xl flex items-center justify-center gap-2 order-1 sm:order-2"
            >
              <MessageCircle className="w-5 h-5" />
              Message {seller.name.split(" ")[0]}
            </Button>
          </div>
        </Card>
      </div>

      {/* Horizontal Divider */}
      <div className="border-t border-white/[0.06] pt-6">
        <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          Other Listings from this Seller
        </h3>

        {sellerProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sellerProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => navigate(`/dashboard/listing/${product.id}`)}
                className="group bg-[#0f0f0f] rounded-2xl p-3 border border-white/[0.06] hover:border-white/[0.14] transition-all cursor-pointer"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-black/80 backdrop-blur-md text-foreground border-0 text-[10px] uppercase font-bold px-2 py-0.5 rounded-lg">
                      {product.condition}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-1.5">
                  <h4 className="font-semibold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {product.title}
                  </h4>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-base font-bold text-primary">
                      RWF {product.price.toLocaleString()}
                    </span>
                  </div>
                  {product.location && (
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span>{product.location}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/[0.02] border border-dashed border-white/[0.08] rounded-2xl">
            <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-60" />
            <p className="text-muted-foreground text-sm font-medium">No other active listings found for this seller.</p>
          </div>
        )}
      </div>
    </div>
  );
}