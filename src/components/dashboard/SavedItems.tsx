import { useState, useEffect } from "react";
import { Heart, MapPin, Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product, Category, Condition } from "@/types";
import { getApiUrl } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export function SavedItems() {
  const { accessToken } = useAuth();
  const [savedProducts, setSavedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const resolveImageUrl = (url: string): string => {
    if (!url) return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
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
    let active = true;
    const fetchSavedItems = async () => {
      if (!accessToken) return;
      try {
        setIsLoading(true);
        const res = await fetch(getApiUrl("/api/v1/listing/saved"), {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (res.ok) {
          const data = await res.json();
          if (active && Array.isArray(data)) {
            const products: Product[] = data.map((item: any) => {
              const listing = item.listing;
              const image = listing.images && Array.isArray(listing.images) && listing.images.length > 0
                ? resolveImageUrl(listing.images[0].image)
                : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80";

              return {
                id: item.id,
                title: listing.title,
                price: parseFloat(listing.price) || 0,
                category: mapApiCategory(listing.category),
                condition: mapApiCondition(listing.condition),
                image,
                location: "Kigali Campus", // Fallback location
                postedAt: "Saved",
                seller: {
                  name: "Verified Student",
                  avatar: "/avatar_student.jpg"
                },
                description: listing.title,
                dealType: ["Meet on campus"]
              };
            });
            setSavedProducts(products);
          }
        }
      } catch (err) {
        console.error("Failed to load saved listings", err);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchSavedItems();
    return () => {
      active = false;
    };
  }, [accessToken]);

  const handleRemove = async (id: string) => {
    if (!accessToken) return;
    
    // Optimistic remove
    setSavedProducts((prev) => prev.filter((p) => p.id !== id));
    
    try {
      const res = await fetch(getApiUrl(`/api/v1/listing/${id}/delete`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!res.ok) {
        throw new Error("Failed to unsave item");
      }
    } catch (err) {
      toast.error("Failed to remove saved item. It might reappear on refresh.");
    }
  };

  return (
    <div className="p-7 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Saved Items</h1>
        <span className="text-sm text-muted-foreground">
          {savedProducts.length} items saved
        </span>
      </div>

      {/* Saved Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {savedProducts.map((product) => (
          <div
            key={product.id}
            className="saved-card group bg-[#0f0f0f] rounded-2xl p-3.5 transition-all duration-300 border border-white/[0.06]"
          >
            {/* Image */}
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Remove Button */}
              <button
                onClick={() => handleRemove(product.id)}
                className="cursor-pointer absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <h3 className="font-semibold text-[15px] text-foreground line-clamp-2 leading-snug">
                {product.title}
              </h3>

              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary">
                  RWF {product.price.toLocaleString()}
                </span>
                <Badge
                  variant="secondary"
                  className="text-xs bg-[#1a1a1a] text-[#898989]"
                >
                  {product.condition}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#898989]">
                <MapPin className="w-3 h-3" />
                {product.location}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#bb740a] mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-1">Loading saved items...</h3>
        </div>
      ) : savedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No saved items
          </h3>
          <p className="text-sm text-[#676767] max-w-sm">
            Browse listings and click the heart icon to save items you&apos;re
            interested in.
          </p>
          <Button className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground">
            Browse Listings
          </Button>
        </div>
      ) : null}
    </div>
  );
}
