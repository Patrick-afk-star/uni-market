import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Eye, MessageSquare, MoreHorizontal, Edit, Trash2, Pause, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Listing } from '@/types';
import { getApiUrl } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function MyListings() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const titleRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await fetch(getApiUrl('/api/v1/listing/me'), {
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        });
        if (!res.ok) throw new Error('Failed to fetch listings');
        const data = await res.json();
        setListings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, [accessToken]);

  useEffect(() => {
    if (isLoading) return;

    const ctx = gsap.context(() => {
      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
        );
      }

      if (gridRef.current) {
        const cards = gridRef.current.querySelectorAll('.listing-card');
        if (cards.length > 0) {
          gsap.fromTo(
            cards,
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out', delay: 0.2 }
          );
        }
      }
    });

    return () => ctx.revert();
  }, [isLoading, listings.length]);

  const handleDelete = async (id: string) => {
    if (!accessToken) return;
    try {
      const res = await fetch(getApiUrl(`/api/v1/listing/${id}`), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!res.ok) throw new Error('Failed to delete listing');
      setListings((prev) => prev.filter((l) => l.id !== id));
      toast.success('Listing deleted successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete listing');
    }
  };

  const handleToggleStatus = async (id: string) => {
    if (!accessToken) return;
    
    // Find the listing to determine its current status
    const listing = listings.find((l) => l.id === id);
    if (!listing) return;
    
    const newStatus = listing.status === 'published' ? 'draft' : 'published';

    // Optimistic UI update
    setListings((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, status: newStatus } : l
      )
    );

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
      console.error(err);
      toast.error('Failed to update listing status');
      // Rollback optimistic update
      setListings((prev) =>
        prev.map((l) =>
          l.id === id ? { ...l, status: listing.status } : l
        )
      );
    }
  };

const DEFAULT_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80";

  const getStatusBadge = (status: Listing['status']) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 text-[10px] px-2 py-0.5">Published</Badge>;
      case 'draft':
        return <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] px-2 py-0.5">Draft</Badge>;
      case 'sold':
        return <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] px-2 py-0.5">Sold</Badge>;
    }
  };

  return (
    <div className="p-4 md:p-7 space-y-6 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 ref={titleRef} className="text-xl md:text-2xl font-bold text-foreground">
          My Listings
        </h1>
        <div className="flex items-center gap-3 text-xs md:text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span>{listings.filter((l) => l.status === 'published').length} Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>{listings.filter((l) => l.status === 'draft').length} Drafts</span>
          </div>
        </div>
      </div>

      {/* Listings Grid - 2-Column Responsive Feed */}
      <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {listings.map((listing) => {
          const imgUrl = listing.images && listing.images.length > 0 && listing.images[0]?.image
            ? resolveImageUrl(listing.images[0].image)
            : DEFAULT_FALLBACK_IMAGE;

          return (
            <div
              key={listing.id}
              onClick={() => navigate(`/dashboard/listing/${listing.id}`)}
              className="listing-card group bg-card rounded-xl border border-border/60 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer shadow-xs hover:shadow-md overflow-hidden flex flex-col justify-between"
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden bg-secondary">
                <img
                  src={imgUrl}
                  alt={listing.title || "Product listing"}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = DEFAULT_FALLBACK_IMAGE;
                  }}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-2 left-2 z-10">
                  {getStatusBadge(listing.status)}
                </div>
              </div>

              {/* Body */}
              <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-xs md:text-sm text-foreground line-clamp-2 leading-tight">
                    {listing.title}
                  </h3>
                  <p className="text-sm md:text-base font-bold text-[#bb740a] mt-1">
                    RWF {listing.price.toLocaleString()}
                  </p>
                </div>

                {/* Metrics & Actions */}
                <div className="pt-2 border-t border-border flex items-center justify-between text-muted-foreground text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5" title="Views">
                      <Eye className="w-3 h-3 text-muted-foreground" />
                      {listing.views}
                    </span>
                    <span className="flex items-center gap-0.5" title="Messages">
                      <MessageSquare className="w-3 h-3 text-muted-foreground" />
                      {listing.messages}
                    </span>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg cursor-pointer hover:bg-secondary"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="w-4 h-4 text-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground shadow-lg">
                      <DropdownMenuItem
                        onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/edit/${listing.id}`); }}
                        className="cursor-pointer hover:bg-secondary"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => { e.stopPropagation(); handleToggleStatus(listing.id); }}
                        className="cursor-pointer hover:bg-secondary"
                      >
                        {listing.status === 'published' ? (
                          <>
                            <Pause className="w-4 h-4 mr-2" />
                            Unpublish
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Publish
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => { e.stopPropagation(); handleDelete(listing.id); }}
                        className="text-destructive cursor-pointer hover:bg-secondary"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20 text-muted-foreground">Loading...</div>
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
            <Edit className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No listings yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            Start selling by creating your first listing. It only takes a few minutes!
          </p>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Create Listing
          </Button>
        </div>
      ) : null}
    </div>
  );
}
