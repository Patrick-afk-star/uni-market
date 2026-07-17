import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, MessageCircle, Loader2, AlertCircle, GraduationCap, 
  Package, MapPin, Share2, Clock, Link as LinkIcon, Star, ShieldCheck, 
  Mail, Phone, MessageSquare, Instagram, Facebook, Twitter, Github, Linkedin, Copy, ChevronRight
} from "lucide-react";
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
  phone_number?: string;
  account_type: string | null;
  student_profile: {
    university: string | null;
    campus?: string | null;
  } | null;
  bio: string | null;
  date_joined: string | null;
  province?: string;
  district?: string;
  languages?: string[];
  socialLinks?: Record<string, string>;
  contactPrefs?: string[];
  privacySettings?: Record<string, boolean>;
}

export default function SellerProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { accessToken, user } = useAuth();
  const [seller, setSeller] = useState<SellerProfileData | null>(null);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareTray, setShowShareTray] = useState(false);

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
    if (!cat) return 'Textbooks';
    const normalized = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
    const validCategories: Category[] = ['Bicycles', 'Clothing', 'Electronics', 'Furniture', 'Kitchen', 'Sports', 'Stationery', 'Textbooks'];
    if (validCategories.includes(normalized as Category)) {
      return normalized as Category;
    }
    return 'Textbooks';
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
        
        let sellerObj: SellerProfileData = {
          id: profileData.id || id,
          name: profileData.name || profileData.display_name || profileData.first_name || "Student Seller",
          avatar_url: profileData.avatar_url || null,
          phone_number: profileData.phone_number || "",
          account_type: profileData.account_type || "student",
          student_profile: profileData.student_profile ? {
            university: typeof profileData.student_profile.university === 'object' && profileData.student_profile.university !== null 
              ? profileData.student_profile.university.name 
              : profileData.student_profile.university,
            campus: profileData.student_profile.campus
          } : (profileData.university ? { university: profileData.university } : null),
          bio: profileData.bio || "",
          date_joined: profileData.date_joined || profileData.created_at || new Date().toISOString(),
          province: profileData.profile_details?.province || profileData.province || "Kigali City", // Fallback/Mock
          district: profileData.profile_details?.district || profileData.district || "Kicukiro", // Fallback/Mock
          languages: profileData.profile_details?.languages || profileData.languages_spoken || profileData.languages || ["English", "Kinyarwanda"],
          contactPrefs: profileData.profile_details?.contactPrefs || profileData.contactPrefs || ["UniMarket Chat", "WhatsApp"],
          socialLinks: profileData.profile_details?.socialLinks || profileData.social_links || profileData.socialLinks || {},
          privacySettings: profileData.privacy_settings || { showPhone: true, showUniversity: true },
        };

        // Merge with current user's profile details if viewing own profile
        const isSelf = user?.id === sellerObj.id || (user as any)?.pk === sellerObj.id;
        if (isSelf && (user as any)?.profile_details) {
          const pd = (user as any).profile_details;
          sellerObj = {
            ...sellerObj,
            phone_number: user?.phone_number || sellerObj.phone_number,
            province: pd.province || sellerObj.province,
            district: pd.district || sellerObj.district,
            languages: pd.languages && pd.languages.length > 0 ? pd.languages : sellerObj.languages,
            contactPrefs: pd.contactPrefs && pd.contactPrefs.length > 0 ? pd.contactPrefs : sellerObj.contactPrefs,
            socialLinks: pd.socialLinks || sellerObj.socialLinks,
            privacySettings: (user as any).privacy_settings || sellerObj.privacySettings,
          };
        }

        setSeller(sellerObj);

        // Fetch Seller Listings
        const listingsRes = await fetch(getApiUrl("/api/v1/listing/"), { headers });
        if (listingsRes.ok) {
          const listingsData = await listingsRes.json();
          if (Array.isArray(listingsData)) {
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
                  location: {
                    university: item.location?.university || sellerObj.student_profile?.university || "UR",
                    campus: item.location?.campus || "Kigali Campus"
                  },
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
  }, [id, accessToken, user]);

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
  const isSelf = user?.id === seller.id || (user as any)?.pk === seller.id;

  const calculateCompletion = () => {
    let score = 0;
    if (seller.avatar_url && seller.avatar_url.trim() !== '') score += 25;
    if (seller.phone_number && seller.phone_number.trim() !== '') score += 25;
    if (seller.student_profile?.university || (isSelf && user?.has_completed_profile)) score += 25;
    if (seller.province && seller.province.trim() !== '' && seller.district && seller.district.trim() !== '') score += 25;
    return Math.min(score, 100);
  };
  const completionPercent = calculateCompletion();

  const handleShare = () => {
    navigator.clipboard.writeText(`https://uni-marketrwanda.online/profile/${seller.id}`);
    toast.success("Profile link copied to clipboard!");
    setShowShareTray(false);
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin': return <Linkedin className="w-4 h-4" />;
      case 'github': return <Github className="w-4 h-4" />;
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'facebook': return <Facebook className="w-4 h-4" />;
      case 'x': return <Twitter className="w-4 h-4" />;
      default: return <LinkIcon className="w-4 h-4" />;
    }
  };

  const getContactIcon = (pref: string) => {
    switch (pref) {
      case 'UniMarket Chat': return <MessageSquare className="w-4 h-4" />;
      case 'WhatsApp': return <MessageCircle className="w-4 h-4 text-green-500" />;
      case 'Phone Call': return <Phone className="w-4 h-4" />;
      case 'Email': return <Mail className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  // Mock tenure
  const joinDate = new Date(seller.date_joined || new Date());
  const formattedDate = joinDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 md:px-6 animate-in fade-in duration-500">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6 group w-fit"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      {/* Banner / Cover */}
      <div className="w-full h-48 md:h-64 rounded-t-3xl bg-gradient-to-r from-[#0a0a0a] via-[#1a1a1a] to-[#2a2a2a] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute top-4 right-4 z-10">
          <div className="relative">
            <Button 
              variant="secondary" 
              size="icon" 
              className="rounded-full bg-black/40 backdrop-blur-md border-white/10 hover:bg-black/60 text-white shadow-lg"
              onClick={() => setShowShareTray(!showShareTray)}
            >
              <Share2 className="w-4 h-4" />
            </Button>
            {showShareTray && (
              <div className="absolute top-12 right-0 bg-[#121212] border border-white/10 rounded-xl p-2 shadow-2xl w-48 z-50 animate-in slide-in-from-top-2">
                <button onClick={handleShare} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-white/5 rounded-lg transition-colors">
                  <Copy className="w-4 h-4" /> Copy Link
                </button>
                <div className="h-px bg-white/10 my-1 mx-2" />
                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-white/5 rounded-lg transition-colors">
                  <MessageCircle className="w-4 h-4 text-green-500" /> Share via WhatsApp
                </button>
                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-white/5 rounded-lg transition-colors">
                  <Twitter className="w-4 h-4 text-sky-500" /> Share via X
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 -mt-20 relative z-20 px-2 sm:px-6">
        
        {/* LEFT COLUMN: Profile Info & Stats */}
        <div className="lg:w-[350px] shrink-0 space-y-6">
          <Card className="bg-[#0f0f0f] border-white/[0.08] p-6 rounded-3xl shadow-xl backdrop-blur-xl">
            <div className="flex flex-col items-center text-center">
              <Avatar className="w-32 h-32 ring-4 ring-[#0f0f0f] shadow-2xl mb-4 bg-background">
                <AvatarImage src={seller.avatar_url || ""} alt={seller.name} className="object-cover" />
                <AvatarFallback className="bg-[#2a2a2a] text-[#a0a0a0] text-4xl font-bold">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">{seller.name}</h1>
              
              {/* Rating Block */}
              <div className="flex items-center gap-1.5 mt-2 cursor-pointer hover:bg-white/5 px-3 py-1.5 rounded-full transition-colors">
                <Star className="w-4 h-4 fill-[#bb740a] text-[#bb740a]" />
                <span className="font-semibold text-foreground text-sm">4.9</span>
                <span className="text-muted-foreground text-sm">(32 Reviews)</span>
                <ChevronRight className="w-3 h-3 text-muted-foreground ml-1" />
              </div>

              {/* Status & Tenure */}
              <div className="flex flex-col items-center gap-1 mt-4 text-sm">
                <div className="flex items-center gap-1.5 text-green-500 font-medium">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                  </span>
                  Active Now
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs mt-1">
                  <Clock className="w-3.5 h-3.5" />
                  Member since {formattedDate}
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center gap-2 mt-5 w-full">
                {seller.account_type === "student" && (
                  <Badge className="bg-[#177865]/10 text-[#2aa67f] hover:bg-[#177865]/10 border border-[#177865]/20 px-2.5 py-1">
                    <ShieldCheck className="w-3 h-3 mr-1.5" /> Verified Student
                  </Badge>
                )}
                <Badge className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/10 border border-blue-500/20 px-2.5 py-1">
                  Good Standing
                </Badge>
              </div>

              {/* Bio */}
              <p className="text-sm text-foreground/80 mt-6 leading-relaxed">
                {seller.bio || "No bio provided yet."}
              </p>

              {/* Action Buttons */}
              {!isSelf && (
                <div className="flex gap-2 w-full mt-6">
                  <Button className="flex-1 bg-[#bb740a] hover:bg-[#bb740a]/90 text-white rounded-xl h-11 font-semibold">
                    <MessageCircle className="w-4 h-4 mr-2" /> Message
                  </Button>
                </div>
              )}

              {/* Self-View Profile Completion Meter */}
              {isSelf && (
                <div className="w-full mt-6 pt-6 border-t border-white/[0.06] text-left">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Profile Completion</span>
                    <span className="text-xs font-bold text-[#bb740a]">{completionPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#bb740a] transition-all duration-300" 
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                  {completionPercent < 100 && (
                    <Link to="/dashboard/settings" state={{ editMode: true, highlightRequired: true }} className="text-xs text-[#bb740a] hover:underline mt-2 inline-block">
                      Complete your profile →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Details Card */}
          <Card className="bg-[#0f0f0f] border-white/[0.08] p-6 rounded-3xl shadow-xl">
            <h3 className="font-bold text-foreground mb-4">About & Contact</h3>
            <div className="space-y-4">
              
              {/* University & Campus */}
              {(seller.student_profile?.university || seller.privacySettings?.showUniversity !== false) && (
                <div className="flex items-start gap-3 text-sm">
                  <GraduationCap className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">University</p>
                    <p className="text-muted-foreground">
                      {seller.student_profile?.university || "Not specified"}
                      {seller.student_profile?.campus ? ` - ${seller.student_profile.campus}` : ""}
                    </p>
                  </div>
                </div>
              )}

              {/* Residence */}
              {seller.district && seller.province && (
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Residence</p>
                    <p className="text-muted-foreground">📍 {seller.district} District, {seller.province}</p>
                  </div>
                </div>
              )}

              {/* Languages */}
              {seller.languages && seller.languages.length > 0 && (
                <div className="flex items-start gap-3 text-sm">
                  <MessageCircle className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Languages</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {seller.languages.map((lang, i) => (
                        <span key={i} className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full border border-white/5">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Preferences */}
              {seller.contactPrefs && seller.contactPrefs.length > 0 && (
                <div className="flex items-start gap-3 text-sm pt-4 border-t border-white/[0.06]">
                  <Phone className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Prefers to be contacted via</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {seller.contactPrefs.map((pref, i) => (
                        <span key={i} className="flex items-center gap-1.5 text-xs font-medium text-foreground bg-secondary px-2.5 py-1 rounded-lg border border-white/[0.08]">
                          {getContactIcon(pref)} {pref}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Social Links */}
              {seller.socialLinks && Object.values(seller.socialLinks).some(v => v) && (
                <div className="flex items-center gap-2 pt-4 border-t border-white/[0.06]">
                  {Object.entries(seller.socialLinks).filter(([_, url]) => url).map(([platform, url], i) => {
                    const validUrl = url.startsWith('http') ? url : `https://${url}`;
                    return (
                      <a 
                        key={i} 
                        href={validUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        title={platform}
                      >
                        {getSocialIcon(platform)}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: Active Listings */}
        <div className="flex-1 space-y-6 mt-8 lg:mt-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Package className="w-5 h-5 text-[#bb740a]" />
              Active Listings ({sellerProducts.length})
            </h2>
          </div>

          {sellerProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {sellerProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => navigate(`/dashboard/listing/${product.id}`)}
                  className="group bg-[#0f0f0f] rounded-2xl p-3 border border-white/[0.06] hover:border-white/[0.14] shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col h-full"
                >
                  {/* Image */}
                  <div className="relative aspect-square sm:aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-[#1a1a1a]">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-black/80 backdrop-blur-md text-foreground border-0 text-[10px] uppercase font-bold px-2 py-0.5 rounded-lg shadow-sm">
                        {product.condition}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-2 flex-1 flex flex-col">
                    <h4 className="font-semibold text-sm text-foreground line-clamp-2 group-hover:text-[#bb740a] transition-colors leading-snug">
                      {product.title}
                    </h4>
                    <div className="mt-auto pt-2 flex items-baseline justify-between gap-2 border-t border-white/[0.04]">
                      <span className="text-base font-bold text-foreground">
                        RWF {product.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-[#0f0f0f] border border-dashed border-white/[0.08] rounded-3xl">
              <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-foreground font-semibold mb-1">No active listings</p>
              <p className="text-muted-foreground text-sm max-w-[250px] mx-auto">
                {isSelf ? "You haven't posted any items for sale yet." : "This seller currently has no items available."}
              </p>
              {isSelf && (
                <Button className="mt-6 rounded-xl bg-[#bb740a] text-white hover:bg-[#bb740a]/90" onClick={() => navigate('/dashboard/create')}>
                  Create a Listing
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}