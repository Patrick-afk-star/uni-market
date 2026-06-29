import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Loader2, AlertCircle, GraduationCap } from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

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
        
        // Handle nesting matching API structure
        setSeller({
          id: data.id || id,
          name: data.name || data.display_name || data.first_name || "Student Seller",
          avatar_url: data.avatar_url || null,
          account_type: data.account_type || "student",
          student_profile: data.student_profile || (data.university ? { university: data.university } : null),
          bio: data.bio || "",
          date_joined: data.date_joined || data.created_at || null,
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

  const initial = seller.name ? seller.name.charAt(0).toUpperCase() : "S";

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 md:px-6 animate-in fade-in duration-500">
      {/* Back Navigation */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      {/* Profile Overhaul Card */}
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
  );
}