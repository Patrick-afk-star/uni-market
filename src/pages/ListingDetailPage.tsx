import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock, Heart, AlertCircle, Flag, Loader2, Edit, Trash2, Pause, Play, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getApiUrl } from '@/lib/api';
import { toast } from 'sonner';
import type { Listing } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { startConversation } from '@/lib/messaging';

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { accessToken, user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [sellerProfile, setSellerProfile] = useState<any>(null);
  const [messagingLoading, setMessagingLoading] = useState(false);

  const handleMessageSeller = async () => {
    if (!id) return;
    if (!accessToken) {
      toast.error('Please log in to message sellers.');
      return;
    }
    setMessagingLoading(true);
    try {
      const conv = await startConversation(accessToken, id);
      navigate(`/dashboard/messages?conversation=${conv.id}`);
    } catch (err: any) {
      toast.error(err.message ?? 'Could not start conversation.');
    } finally {
      setMessagingLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !accessToken) return;
    try {
      const res = await fetch(getApiUrl(`/api/v1/listing/${id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Listing deleted');
      navigate('/dashboard/listings');
    } catch (err) {
      toast.error('Failed to delete listing');
    }
  };

  const handleToggleStatus = async () => {
    if (!id || !accessToken || !listing) return;
    const newStatus = listing.status === 'published' ? 'draft' : 'published';
    
    // optimistic update
    setListing({ ...listing, status: newStatus });
    
    try {
      const res = await fetch(getApiUrl(`/api/v1/listing/${id}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      toast.success(`Listing ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`);
    } catch (err) {
      toast.error('Failed to update listing status');
      // rollback
      setListing({ ...listing, status: listing.status });
    }
  };

  const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80";

  const resolveImageUrl = (url: string): string => {
    if (!url) return FALLBACK_IMAGE;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const apiBase = getApiUrl("/");
    const cleanBase = apiBase.endsWith("/") ? apiBase.slice(0, -1) : apiBase;
    const cleanUrl = url.startsWith("/") ? url : `/${url}`;
    return `${cleanBase}${cleanUrl}`;
  };

  useEffect(() => {
    const fetchListing = async () => {
      try {
        // Assume endpoint for public listing is /api/v1/listing/{id}
        const res = await fetch(getApiUrl(`/api/v1/listing/${id}`));
        if (!res.ok) {
          throw new Error('Listing not found or could not be loaded');
        }
        const data = await res.json();
        setListing(data);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchListing();
    }
  }, [id]);

  useEffect(() => {
    const fetchSellerProfile = async () => {
      const sellerId = listing?.seller_info?.id;
      // Fetch only if name is missing/null/empty
      if (sellerId && !listing?.seller_info?.name) {
        try {
          const res = await fetch(getApiUrl(`/api/v1/profiles/${sellerId}`));
          if (res.ok) {
            const data = await res.json();
            setSellerProfile(data);
          }
        } catch (err) {
          console.error("Failed to fetch seller profile fallback:", err);
        }
      }
    };
    if (listing) {
      fetchSellerProfile();
    }
  }, [listing]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-full min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground text-sm font-medium">Loading listing...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-full min-h-[50vh]">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold mb-2 text-foreground">Oops!</h2>
        <p className="text-muted-foreground text-center mb-6 max-w-sm">
          {error || "We couldn't find the listing you're looking for."}
        </p>
        <Button onClick={() => navigate(-1)} variant="outline" className="rounded-xl">
          Go Back
        </Button>
      </div>
    );
  }

  const isOwner = Boolean(user && listing?.seller_info && (user.id === listing.seller_info.id || user.pk === listing.seller_info.id));

  return (
    <div className="flex flex-col md:block h-full bg-background text-foreground">
      <div className="max-w-6xl mx-auto py-6 px-4 md:py-8 md:px-6">
        {/* Back Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        {/* Owner Toolbar */}
        {isOwner && (
          <div className="flex items-center gap-2 mb-6 p-3 bg-secondary/20 border border-white/[0.06] rounded-xl overflow-x-auto scrollbar-hide">
             <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-auto px-2 shrink-0">Manage Listing</span>
             <Button variant="outline" size="sm" className="h-8 shrink-0 hover:bg-[#1a1a1a]" onClick={() => navigate(`/dashboard/edit/${id}`)}>
               <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
             </Button>
             <Button variant="outline" size="sm" className="h-8 shrink-0 hover:bg-[#1a1a1a]" onClick={handleToggleStatus}>
               {listing.status === 'published' ? <><Pause className="w-3.5 h-3.5 mr-1.5" /> Unpublish</> : <><Play className="w-3.5 h-3.5 mr-1.5" /> Publish</>}
             </Button>
             <Button variant="destructive" size="sm" className="h-8 shrink-0 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border-transparent" onClick={handleDelete}>
               <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
             </Button>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          {/* Left Column: Images */}
          <div className="w-full md:w-3/5 space-y-4">
            <div className="aspect-[4/3] md:rounded-3xl bg-secondary border border-border overflow-hidden relative">
              <img
                src={listing.images && listing.images.length > 0 ? resolveImageUrl(listing.images[activeImageIndex].image) : FALLBACK_IMAGE}
                alt={listing.title}
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
                className="w-full h-full object-contain"
              />
              {listing.status === 'sold' && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider">
                  Sold
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {listing.images && listing.images.length > 1 && (
              <div className="flex gap-3 px-4 md:px-0 overflow-x-auto pb-2 scrollbar-none">
                {listing.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-secondary border border-border ${activeImageIndex === idx ? 'ring-2 ring-primary' : 'opacity-60 hover:opacity-100'} transition-all`}
                  >
                    <img
                      src={resolveImageUrl(img.image)}
                      alt={`Thumbnail ${idx + 1}`}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details */}
          <div className="w-full md:w-2/5 px-5 md:px-0 flex flex-col pb-24 md:pb-0">
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary" className="bg-secondary/50 text-foreground border-0">
                {listing.category}
              </Badge>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {(() => {
                  // Backend may return created_at (snake_case) or createdAt (camelCase)
                  const raw = (listing as any).created_at || listing.createdAt;
                  if (!raw) return 'Unknown date';
                  const d = new Date(raw);
                  if (isNaN(d.getTime())) return 'Unknown date';
                  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                })()}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight">
              {listing.title}
            </h1>

            <div className="text-3xl font-bold text-amber-500 mb-6">
              RWF {listing.price?.toLocaleString()}
            </div>

            {/* Condition */}
            <div className="flex flex-wrap items-center gap-4 py-4 border-y border-border mb-6 text-sm">
              <div className="flex flex-col">
                <span className="text-muted-foreground mb-1">Condition</span>
                <span className="font-semibold text-foreground">{listing.condition}</span>
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-card border border-border rounded-2xl p-5 mb-8">
              <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider text-muted-foreground">About the Seller</h3>
              {(() => {
                const sellerInfo = (listing as any).seller_info;
                const finalName = sellerInfo?.name || sellerProfile?.name || sellerProfile?.display_name || sellerProfile?.first_name || 'Student Seller';
                const isVerified = sellerInfo?.is_seller_verified || sellerProfile?.is_verified || sellerProfile?.is_seller_verified || false;
                const avatar = sellerInfo?.avatar_url || sellerProfile?.avatar_url || '';
                const initial = finalName ? finalName.charAt(0).toUpperCase() : 'S';
                const sellerId = sellerInfo?.id || sellerProfile?.id;

                return (
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={avatar ? resolveImageUrl(avatar) : ''} alt={finalName} className="object-cover" />
                          <AvatarFallback className="bg-secondary text-foreground text-sm font-semibold">
                            {initial}
                          </AvatarFallback>
                        </Avatar>
                        {isVerified && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#177865] flex items-center justify-center" title="Verified Seller">
                            <svg viewBox="0 0 12 12" fill="none" className="w-2.5 h-2.5">
                              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground flex items-center gap-1.5">
                          {finalName}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {isVerified ? 'Verified Student Seller' : 'Student Seller'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end shrink-0">
                      <Button
                        variant="outline"
                        className="rounded-xl text-sm h-9"
                        onClick={() => {
                          if (sellerId) {
                            navigate(`/dashboard/seller/${sellerId}`);
                          } else {
                            toast.info('Seller profile is not available.');
                          }
                        }}
                      >
                        View Profile
                      </Button>
                      <button
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-400 transition-colors"
                        onClick={() => toast.success('Report submitted. Our team will review it shortly.')}
                      >
                        <Flag className="w-3.5 h-3.5" />
                        Report Seller
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Description */}
            <div className="mb-8 space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {listing.description}
              </p>
            </div>
            {/* Action Buttons (Sticky on mobile) */}
            <div className="fixed bottom-16 md:bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t border-border md:relative md:p-0 md:bg-transparent md:border-t-0 md:backdrop-blur-none z-10 flex gap-3">
              <Button
                onClick={handleMessageSeller}
                disabled={messagingLoading || listing?.status === 'sold'}
                className="flex-1 h-12 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-base transition-transform active:scale-[0.98] disabled:opacity-60"
              >
                {messagingLoading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Opening...</>
                ) : (
                  'Message Seller'
                )}
              </Button>
              <Button
                variant="outline"
                className="hidden md:flex h-12 w-12 rounded-xl items-center justify-center border-border hover:bg-secondary transition-colors"
              >
                <Heart className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Global Transaction Safety Card */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-28 md:pb-12">
        <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base">Marketplace Safety Reminder</h3>
              <p className="text-xs text-muted-foreground mt-0.5">UniMarket is committed to keeping student transactions safe. Please follow these guidelines.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
            {[
              { icon: '🏫', title: 'Meet on Campus', body: 'Always conduct transactions in public, well-lit areas on campus or in busy common spaces.' },
              { icon: '🔍', title: 'Verify Before You Pay', body: 'Inspect the item thoroughly in person before making any payment. Never pay in advance for unseen goods.' },
              { icon: '💬', title: 'Use Platform Messaging', body: 'Keep all communication within UniMarket. Avoid switching to unmonitored channels before a deal is confirmed.' },
              { icon: '🚫', title: 'No Wire Transfers', body: 'Avoid sending money via untraceable methods. Prefer cash on delivery or verified mobile money in person.' },
              { icon: '✅', title: 'Trust Verified Sellers', body: 'Look for the Verified Student badge. Verified sellers have had their student status confirmed by UniMarket.' },
              { icon: '📦', title: 'Check Item Condition', body: 'Test electronics, check book editions, and confirm item condition matches the listing before completing a deal.' },
            ].map((tip, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl bg-secondary/50 border border-border hover:border-amber-500/20 transition-colors">
                <span className="text-xl shrink-0 mt-0.5">{tip.icon}</span>
                <div>
                  <p className="text-xs font-semibold text-foreground">{tip.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{tip.body}</p>
                </div>
              </div>
            ))}
          </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <p className="text-xs text-muted-foreground">See something suspicious? Help keep our community safe.</p>
            </div>
            <button
              onClick={() => toast.info('Thank you for helping keep UniMarket safe. Our team will review your report.')}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 px-4 py-2 rounded-xl transition-all whitespace-nowrap shrink-0"
            >
              <Flag className="w-3.5 h-3.5" /> Report Suspicious Activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
