import { useState } from "react";
import { Heart, MapPin, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sampleProducts } from "@/data/products";
import type { Product } from "@/types";

export function SavedItems() {
  const [savedProducts, setSavedProducts] = useState<Product[]>(
    sampleProducts.slice(0, 4),
  );

  const handleRemove = (id: string) => {
    setSavedProducts((prev) => prev.filter((p) => p.id !== id));
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

      {savedProducts.length === 0 && (
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
      )}
    </div>
  );
}
