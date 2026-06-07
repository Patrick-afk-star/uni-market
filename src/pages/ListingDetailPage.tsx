import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Clock, Eye, MessageSquare, Share, Heart, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getApiUrl } from '@/lib/api';
import type { Listing } from '@/types';

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

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

  return (
    <div className="flex flex-col md:block h-full">
      <div className="max-w-6xl mx-auto py-6 px-4 md:py-8 md:px-6">
        {/* Back Navigation */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          {/* Left Column: Images */}
          <div className="w-full md:w-3/5 space-y-4">
            <div className="aspect-[4/3] md:rounded-3xl bg-[#121212] overflow-hidden relative">
              {listing.images && listing.images.length > 0 ? (
                <img 
                  src={listing.images[activeImageIndex]} 
                  alt={listing.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No images available
                </div>
              )}
              {listing.status === 'sold' && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider">
                  Sold
                </div>
              )}
            </div>
            
            {/* Thumbnails */}
            {listing.images && listing.images.length > 1 && (
              <div className="flex gap-3 px-4 md:px-0 overflow-x-auto pb-2 scrollbar-hide">
                {listing.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-[#121212] ${
                      activeImageIndex === idx ? 'ring-2 ring-primary' : 'opacity-70 hover:opacity-100'
                    } transition-all`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
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
                {new Date(listing.createdAt).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight">
              {listing.title}
            </h1>

            <div className="text-3xl font-bold text-primary mb-6">
              RWF {listing.price?.toLocaleString()}
            </div>

            {/* Condition & Views */}
            <div className="flex flex-wrap items-center gap-4 py-4 border-y border-white/[0.06] mb-6 text-sm">
              <div className="flex flex-col">
                <span className="text-muted-foreground mb-1">Condition</span>
                <span className="font-semibold text-foreground">{listing.condition}</span>
              </div>
              <div className="w-px h-8 bg-white/[0.06]" />
              <div className="flex flex-col">
                <span className="text-muted-foreground mb-1">Views</span>
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <Eye className="w-4 h-4" /> {listing.views || 0}
                </span>
              </div>
              <div className="w-px h-8 bg-white/[0.06]" />
              <div className="flex flex-col">
                <span className="text-muted-foreground mb-1">Messages</span>
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" /> {listing.messages || 0}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8 space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {listing.description}
              </p>
            </div>

            {/* Seller Info (Placeholder since actual seller info depends on API response) */}
            <div className="bg-[#121212] border border-white/[0.06] rounded-2xl p-5 mb-8">
              <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider text-muted-foreground">About the Seller</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src="/avatar-placeholder.jpg" />
                    <AvatarFallback className="bg-primary/20 text-primary">S</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">Student Seller</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> University Campus
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="rounded-xl text-sm h-9">
                  View Profile
                </Button>
              </div>
            </div>

            {/* Action Buttons (Sticky on mobile) */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-md border-t border-white/[0.06] md:relative md:p-0 md:bg-transparent md:border-t-0 md:border-0 md:backdrop-blur-none z-10 flex gap-3">
              <Button 
                className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base transition-transform active:scale-[0.98]"
              >
                Message Seller
              </Button>
              <Button 
                variant="outline" 
                className="hidden md:flex h-12 w-12 rounded-xl items-center justify-center border-white/[0.12] hover:bg-secondary transition-colors"
              >
                <Heart className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
