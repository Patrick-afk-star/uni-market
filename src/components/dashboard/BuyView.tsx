import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Heart,
  MessageSquare,
  Filter,
  ChevronDown,
  Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Product, Condition, Category } from "@/types";
import { sampleProducts, categories, conditions } from "@/data/products";
import { getApiUrl } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface BuyViewProps {
  searchQuery: string;
  isVerified: boolean;
  /** Called with the listing id when the user wants to message the seller */
  onMessageClick: (listingId: string) => void;
  onVerificationRequired: () => void;
}

export function BuyView({
  searchQuery,
  isVerified,
  onMessageClick,
  onVerificationRequired,
}: BuyViewProps) {
  const { accessToken, isInitializing } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] =
    useState<string>("All Categories");
  const [selectedConditions, setSelectedConditions] = useState<Condition[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({
    min: "",
    max: "",
  });
  const [sortBy, setSortBy] = useState<string>("Relevance");
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");

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

  // Fetch listings on mount
  useEffect(() => {
    if (isInitializing || !accessToken) {
      return;
    }

    let active = true;
    const fetchListings = async () => {
      try {
        setLoading(true);
        const res = await fetch(getApiUrl("/api/v1/listing/"), {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        interface ApiListingImage {
          image: string;
        }
        
        interface ApiListingItem {
          id: string;
          title: string;
          price: string;
          category: string;
          condition: string;
          status: string;
          images: ApiListingImage[];
        }

        const data: ApiListingItem[] = await res.json();
        
        if (!active) return;

        const mapped: Product[] = data.map((item, index) => {
          const image = item.images && Array.isArray(item.images) && item.images.length > 0
            ? resolveImageUrl(item.images[0].image)
            : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80";

          return {
            id: item.id ? item.id.toString() : `api-${index}-${item.title}`,
            title: item.title,
            price: parseFloat(item.price) || 0,
            category: mapApiCategory(item.category),
            condition: mapApiCondition(item.condition),
            image,
            location: "Kigali Campus",
            postedAt: "Just now",
            seller: {
              name: "Verified Student",
              avatar: ""
            },
            description: item.title,
            dealType: ["Meet on campus"]
          };
        });

        setAllProducts(mapped);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch listings:", err);
        setError("Failed to load live listings. Showing offline demo data.");
        setAllProducts(sampleProducts);
        toast.error("Failed to load live listings. Displaying offline demo data.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    const fetchSavedListings = async () => {
      try {
        const res = await fetch(getApiUrl("/api/v1/listing/saved"), {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (active && Array.isArray(data)) {
            const savedIds = new Set<string>();
            data.forEach((item: any) => {
              if (item.listing && item.listing.id) {
                savedIds.add(item.listing.id);
              }
            });
            setSavedItems(savedIds);
          }
        }
      } catch (err) {
        console.error("Failed to fetch saved items:", err);
      }
    };

    fetchListings();
    fetchSavedListings();
    return () => {
      active = false;
    };
  }, [accessToken, isInitializing]);

  // Filter products based on search and filters
  useEffect(() => {
    let filtered = allProducts;

    // Search filter
    const activeSearchQuery = searchQuery || mobileSearchQuery;
    if (activeSearchQuery) {
      const query = activeSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.location.toLowerCase().includes(query),
      );
    }

    // Category filter
    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Condition filter
    if (selectedConditions.length > 0) {
      filtered = filtered.filter((p) =>
        selectedConditions.includes(p.condition),
      );
    }

    // Price filter
    if (priceRange.min) {
      filtered = filtered.filter((p) => p.price >= parseInt(priceRange.min));
    }
    if (priceRange.max) {
      filtered = filtered.filter((p) => p.price <= parseInt(priceRange.max));
    }

    // Sort
    if (sortBy === "Price: Low to High") {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortBy === "Price: High to Low") {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    } else if (sortBy === "Newest") {
      filtered = [...filtered].reverse();
    }

    setFilteredProducts(filtered);
  }, [searchQuery, mobileSearchQuery, selectedCategory, selectedConditions, priceRange, sortBy, allProducts]);

  const toggleCondition = (condition: Condition) => {
    setSelectedConditions((prev) =>
      prev.includes(condition)
        ? prev.filter((c) => c !== condition)
        : [...prev, condition],
    );
  };

  const toggleSave = async (id: string) => {
    if (!accessToken) {
      toast.error("Please log in to save items.");
      return;
    }

    const isCurrentlySaved = savedItems.has(id);
    
    // Optimistic update
    setSavedItems((prev) => {
      const newSet = new Set(prev);
      if (isCurrentlySaved) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });

    try {
      const res = await fetch(getApiUrl(`/api/v1/listing/${id}/save`), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to toggle save status");
      }
    } catch (err) {
      // Revert optimistic update
      setSavedItems((prev) => {
        const newSet = new Set(prev);
        if (isCurrentlySaved) {
          newSet.add(id);
        } else {
          newSet.delete(id);
        }
        return newSet;
      });
      toast.error("Failed to update saved status.");
    }
  };

  const handleMessageClick = (e: React.MouseEvent, listingId: string) => {
    e.stopPropagation();
    if (!isVerified) {
      onVerificationRequired();
    } else {
      onMessageClick(listingId);
    }
  };

  return (
    <div className="p-7 space-y-6">
      {/* Filter Bar (Desktop) */}
      <div className="hidden md:flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-[#0f0f0f] border border-white/[0.06]">
        {/* Category Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-10 px-4 rounded-xl border border-white/[0.06] bg-[#0f0f0f] hover:bg-[#0f0f0f]/80 text-foreground cursor-pointer"
            >
              {selectedCategory}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 bg-[#121212] border border-white/[0.06]">
            {categories.map((category) => (
              <DropdownMenuItem
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`cursor-pointer hover:bg-[#1a1a1a] ${selectedCategory === category ? "bg-[#1a1a1a]" : ""}`}
              >
                {category}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Price Range */}
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={priceRange.min}
            onChange={(e) =>
              setPriceRange({ ...priceRange, min: e.target.value })
            }
            className="w-24 h-10 rounded-xl bg-[#0f0f0f] border border-white/[0.06] text-sm focus:border-[#bb740a] focus:ring-2 focus:ring-[#bb740a]/20 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:text-muted-foreground"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={priceRange.max}
            onChange={(e) =>
              setPriceRange({ ...priceRange, max: e.target.value })
            }
            className="w-24 h-10 rounded-xl bg-[#0f0f0f] border border-white/[0.06] text-sm focus:border-[#bb740a] focus:ring-2 focus:ring-[#bb740a]/20 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:text-muted-foreground"
          />
        </div>

        {/* Condition Chips */}
        <div className="flex items-center gap-2">
          {conditions.map((condition) => (
            <button
              key={condition}
              onClick={() => toggleCondition(condition as Condition)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${selectedConditions.includes(condition as Condition)
                  ? "bg-transparent border border-[#bb740a] text-[#bb740a]"
                  : "bg-[#0f0f0f] text-muted-foreground hover:text-foreground border border-white/[0.06]"
                }`}
            >
              {condition}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-10 px-4 rounded-xl border border-white/[0.06] bg-[#0f0f0f] hover:bg-[#0f0f0f]/80 text-foreground cursor-pointer"
            >
              <Filter className="w-4 h-4 mr-2" />
              {sortBy}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 bg-[#121212] border border-white/[0.06]">
            {[
              "Relevance",
              "Newest",
              "Price: Low to High",
              "Price: High to Low",
            ].map((sort) => (
              <DropdownMenuItem
                key={sort}
                onClick={() => setSortBy(sort)}
                className={`cursor-pointer hover:bg-[#1a1a1a] ${sortBy === sort ? "bg-[#1a1a1a]" : ""}`}
              >
                {sort}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Result Count */}
        <span className="text-sm text-muted-foreground">
          {filteredProducts.length} results
        </span>
      </div>

      {/* Filter Bar (Mobile) */}
      <div className="flex md:hidden items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search items..." 
            value={mobileSearchQuery}
            onChange={(e) => setMobileSearchQuery(e.target.value)}
            className="pl-9 h-11 rounded-xl bg-[#0f0f0f] border-white/[0.06] focus:border-[#bb740a] focus:ring-2 focus:ring-[#bb740a]/20"
          />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl bg-[#0f0f0f] border-white/[0.06]">
              <Filter className="w-5 h-5 text-foreground" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] rounded-t-[2rem] bg-[#121212] border-t-white/[0.06] p-6 overflow-y-auto">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-xl font-bold">Filters</SheetTitle>
            </SheetHeader>
            <div className="space-y-6 pb-8">
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground">Category</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        selectedCategory === category
                          ? "bg-transparent border border-[#bb740a] text-[#bb740a]"
                          : "bg-[#0f0f0f] text-muted-foreground border border-white/[0.06]"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground">Price Range</h4>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    className="flex-1 h-11 rounded-xl bg-[#0f0f0f] border border-white/[0.06] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    className="flex-1 h-11 rounded-xl bg-[#0f0f0f] border border-white/[0.06] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground">Condition</h4>
                <div className="flex flex-wrap gap-2">
                  {conditions.map((condition) => (
                    <button
                      key={condition}
                      onClick={() => toggleCondition(condition as Condition)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        selectedConditions.includes(condition as Condition)
                          ? "bg-transparent border border-[#bb740a] text-[#bb740a]"
                          : "bg-[#0f0f0f] text-muted-foreground border border-white/[0.06]"
                      }`}
                    >
                      {condition}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground">Sort By</h4>
                <div className="flex flex-wrap gap-2">
                  {["Relevance", "Newest", "Price: Low to High", "Price: High to Low"].map((sort) => (
                    <button
                      key={sort}
                      onClick={() => setSortBy(sort)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        sortBy === sort
                          ? "bg-transparent border border-[#bb740a] text-[#bb740a]"
                          : "bg-[#0f0f0f] text-muted-foreground border border-white/[0.06]"
                      }`}
                    >
                      {sort}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Verification Banner for Unverified Users */}
      {!isVerified && (
        <div className="bg-[#0c1816] flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-[#213732]">
          <div className="w-12 h-12 bg-[#0c4136] rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">
              Verify your account to message sellers
            </p>
            <p className="text-sm text-muted-foreground">
              Keep UniMarket safe by verifying your student status. It only
              takes a few minutes.
            </p>
          </div>
          <Button
            onClick={onVerificationRequired}
            className="bg-[#1ee1ba] hover:bg-primary/90 text-black rounded-xl"
          >
            Verify Now
          </Button>
        </div>
      )}

      {/* Product Grid / Loading / Error Display */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-10 h-10 border-4 border-[#bb740a] border-t-transparent rounded-full animate-spin mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-1">Loading listings</h3>
          <p className="text-sm text-muted-foreground">Connecting to marketplace...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center w-full">
          <div className="w-16 h-16 rounded-2xl bg-[#bb740a]/10 flex items-center justify-center mb-4 text-[#bb740a]">
            <Shield className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Offline Demo Mode
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mb-8">
            {error}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 w-full text-left">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isSaved={savedItems.has(product.id)}
                onToggleSave={() => toggleSave(product.id)}
                isVerified={isVerified}
                onMessageClick={handleMessageClick}
                onVerificationRequired={onVerificationRequired}
                onClick={() => navigate(`/dashboard/listing/${product.id}`)}
              />
            ))}
          </div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No results found
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Try adjusting your filters or search query to find what you&apos;re
            looking for.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isSaved={savedItems.has(product.id)}
              onToggleSave={() => toggleSave(product.id)}
              isVerified={isVerified}
              onMessageClick={handleMessageClick}
              onVerificationRequired={onVerificationRequired}
              onClick={() => navigate(`/dashboard/listing/${product.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  isSaved: boolean;
  onToggleSave: () => void;
  isVerified: boolean;
  onMessageClick: (e: React.MouseEvent, listingId: string) => void;
  onVerificationRequired: () => void;
  onClick?: () => void;
}

function ProductCard({
  product,
  isSaved,
  onToggleSave,
  onMessageClick,
  onClick,
}: ProductCardProps) {
  return (
    <div 
      className="product-card group relative aspect-[3/4] md:aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer border border-white/[0.06]"
      onClick={onClick}
    >
      {/* Background Image */}
      <img
        src={product.image}
        alt={product.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

      {/* Top badges/buttons */}
      <div className="absolute top-3 right-3 flex justify-end items-start">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave();
          }}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-md ${isSaved
              ? "bg-primary text-primary-foreground"
              : "bg-black/50 text-white hover:bg-black/70"
            }`}
        >
          <Heart className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* Content at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">

        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          <span className="text-base sm:text-lg font-bold text-primary">
            RWF {product.price.toLocaleString()}
          </span>
          <Badge
            variant="secondary"
            className="w-fit text-[10px] bg-white/10 text-white/80 border-0 backdrop-blur-md"
          >
            {product.condition}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-[10px] sm:text-xs text-white/60">
          <span className="hidden sm:flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {product.location}
          </span>
          <span>{product.postedAt}</span>
        </div>

        {/* Seller & Action */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
          <span className="text-xs text-white/70 truncate max-w-[80px]">
            {product.seller.name}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => onMessageClick(e, product.id)}
            className="hidden sm:inline-flex h-7 px-2 text-[10px] sm:text-xs text-primary hover:bg-white/10 cursor-pointer transition-colors"
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            Message
          </Button>
        </div>
      </div>
    </div>
  );
}
