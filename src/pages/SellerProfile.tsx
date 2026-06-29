import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, MapPin, MessageCircle, Loader2, AlertCircle, Package } from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface SellerProfileData {
  id: string;
  display_name: string;
  avatar_url: string | null;
  is_verified: boolean;
  university_name: string | null;
  bio: string | null;
  date_joined: string | null;
  listings_count: number | null;
}

export default function SellerProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [seller, setSeller] = useState<SellerProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        setError(null);
        const headers: Record<string, string> = {};
        if (accessToken) {
          headers["Authorization"] = `Bearer ${accessToken}`;
        }
        const res = await fetch(getApiUrl(`/api/v1/profiles/${id}`), { headers });
        if (!res.ok) {
          throw new Error("Could not load this seller's profile.");
        }
        const data = await res.json();
        setSeller({
          id: data.id || id,
          display_name: data.display_name || data.first_name || "Student Seller",
          avatar_url: data.avatar_url || null,
          is_verified: data.is_verified ?? data.is_seller_verified ?? false,
          university_name: data.university_name || data.university || null,
          bio: data.bio || null,
          date_joined: data.date_joined || data.created_at || null,
          listings_count: data.listings_count ?? null,
        });
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
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

  const joinDate = (() => {
    if (!seller.date_joined) return null;
    const d = new Date(seller.date_joined);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
  })();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 md:px-6 animate-in fade-in duration-500">
      {/* Back Navigation */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      {/* Profile Card */}
      <div className="bg-[#121212] border border-white/[0.06] rounded-3xl p-8 md:p-10">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          {/* Avatar */}
          <div className="relative shrink-0">
            <Avatar className="w-24 h-24 md:w-28 md:h-28 ring-2 ring-white/[0.08]">
              <AvatarImage src={seller.avatar_url || ""} alt={seller.display_name} />
              <AvatarFallback />
            </Avatar>
            {seller.is_verified && (
              <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#177865] flex items-center justify-center border-2 border-[#121212]" title="Verified Seller">
                <ShieldCheck className="w-4 h-4 text-white" />
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{seller.display_name}</h1>
              {seller.is_verified && (
                <Badge className="bg-[#177865]/15 text-[#2aa67f] border-0 text-[10px] font-bold uppercase tracking-wider">
                  Verified
                </Badge>
              )}
            </div>

            {seller.university_name && (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-primary" /> {seller.university_name}
              </p>
            )}

            {/* Stats Row */}
            <div className="flex gap-6 mt-5 pt-5 border-t border-white/[0.06]">
              {joinDate && (
                <div>
                  <p className="text-lg font-bold text-foreground">{joinDate}</p>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Joined</p>
                </div>
              )}
              {seller.listings_count !== null && (
                <div>
                  <p className="text-lg font-bold text-foreground flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-primary" /> {seller.listings_count}
                  </p>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Listings</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {seller.bio && (
          <div className="mt-8 pt-6 border-t border-white/[0.06]">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">About</h3>
            <p className="text-muted-foreground leading-relaxed">{seller.bio}</p>
          </div>
        )}

        {/* Action */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Button className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base transition-transform active:scale-[0.98]">
            <MessageCircle className="w-5 h-5 mr-2" />
            Message {seller.display_name.split(" ")[0]}
          </Button>
        </div>
      </div>
    </div>
  );
}