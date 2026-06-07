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

export function MyListings() {
  const { accessToken } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  const handleDelete = (id: string) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setListings((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, status: l.status === 'published' ? 'draft' : 'published' }
          : l
      )
    );
  };

  const getStatusBadge = (status: Listing['status']) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500/20 text-green-400 border-0">Published</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-0">Draft</Badge>;
      case 'sold':
        return <Badge className="bg-blue-500/20 text-blue-400 border-0">Sold</Badge>;
    }
  };

  return (
    <div className="p-7 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 ref={titleRef} className="text-2xl font-bold text-foreground">
          My Listings
        </h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span>{listings.filter((l) => l.status === 'published').length} Active</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <span>{listings.filter((l) => l.status === 'draft').length} Drafts</span>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="listing-card bg-[#121212] rounded-2xl p-4 border border-white/[0.06] transition-colors"
          >
            {/* Image */}
            <div className="aspect-video rounded-xl bg-secondary overflow-hidden mb-4">
              {listing.images.length > 0 ? (
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">No image</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-foreground line-clamp-1">{listing.title}</h3>
                {getStatusBadge(listing.status)}
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="text-lg font-bold text-primary">
                  RWF {listing.price.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {listing.views}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  {listing.messages}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                <span className="text-xs text-muted-foreground">
                  {new Date(listing.createdAt).toLocaleDateString()}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer hover:bg-[#1a1a1a]">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#121212] border border-white/[0.06]">
                    <DropdownMenuItem className="cursor-pointer hover:bg-[#1a1a1a]">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleStatus(listing.id)} className="cursor-pointer hover:bg-[#1a1a1a]">
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
                      onClick={() => handleDelete(listing.id)}
                      className="text-destructive cursor-pointer hover:bg-[#1a1a1a]"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ))}
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
