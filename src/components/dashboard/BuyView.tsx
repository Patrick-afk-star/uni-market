import { useState, useEffect, useRef, useCallback } from "react";
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
    if (!cat) return 'Textbooks';
    const normalized = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
    const validCategories: Category[] = ['Bicycles', 'Clothing', 'Electronics', 'Furniture', 'Kitchen', 'Sports', 'Stationery', 'Textbooks'];
    if (validCategories.includes(normalized as Category)) {
      return normalized as Category;
    }
    return 'Textbooks';
  };

  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [prevPageUrl, setPrevPageUrl] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchListings = useCallback(async (url: string = getApiUrl("/api/v1/listing/"), append = false) => {
    if (isInitializing || !accessToken) return;
    
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      const res = await fetch(url, {
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

      const rawData = await res.json();
      
      let items: ApiListingItem[] = [];
      if (rawData && typeof rawData === 'object' && Array.isArray(rawData.results)) {
        items = rawData.results;
        setNextPageUrl(rawData.next);
        setPrevPageUrl(rawData.previous);
      } else if (Array.isArray(rawData)) {
        items = rawData;
        setNextPageUrl(null);
        setPrevPageUrl(null);
      } else {
        items = [];
      }

      const mapped: Product[] = items.map((item, index) => {
        const image = item.images && Array.isArray(item.images) && item.images.length > 0
          ? resolveImageUrl(item.images[0].image)
          : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80";

        const sellerProfile = (item as any).seller_info || (item as any).seller || {};
        const district = sellerProfile.district || (sellerProfile.profile_details?.district) || "Kigali";
        const university = sellerProfile.university || (sellerProfile.profile_details?.university) || "UR";

        return {
          id: item.id ? item.id.toString() : `api-${index}-${item.title}`,
          title: item.title,
          price: parseFloat(item.price) || 0,
          category: mapApiCategory(item.category),
          condition: mapApiCondition(item.condition),
          image,
          location: { university: university, campus: `${district} Campus` },
          postedAt: "Just now",
          seller: {
            name: sellerProfile.name || "Verified Student",
            avatar: sellerProfile.avatar_url || "",
            university: university
          },
          description: item.title,
          dealType: ["Meet on campus"]
        };
      });

      if (append) {
        setAllProducts(prev => [...prev, ...mapped]);
      } else {
        setAllProducts(mapped);
      }
      setError(null);
    } catch (err) {
      console.error("Failed to fetch listings:", err);
      setError("Failed to load live listings. Showing offline demo data.");
      if (!append) setAllProducts(sampleProducts);
      toast.error("Failed to load live listings. Displaying offline demo data.");
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [accessToken, isInitializing]);

  // Fetch listings on mount
  useEffect(() => {
    let active = true;

    const fetchSavedListings = async () => {
      if (isInitializing || !accessToken) return;
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
  }, [fetchListings, accessToken, isInitializing]);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || isLoadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && nextPageUrl) {
        if (window.innerWidth < 768) {
          fetchListings(nextPageUrl, true);
        }
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, isLoadingMore, nextPageUrl, fetchListings]);

  // Filter products based on search and filters
  useEffect(() => {
    let filtered = allProducts;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.location.campus.toLowerCase().includes(query) ||
          p.location.university.toLowerCase().includes(query),
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
  }, [searchQuery, selectedCategory, selectedConditions, priceRange, sortBy, allProducts]);

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
    <div className="p-4 md:p-7 space-y-4 md:space-y-6">
      {/* Filter Bar (Desktop) */}
      <div className="hidden md:flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-secondary shadow-sm">
        {/* Category Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-10 px-4 rounded-xl bg-background hover:bg-background/80 text-foreground cursor-pointer border-0 shadow-xs"
            >
              {selectedCategory}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 bg-popover text-popover-foreground shadow-lg border border-border/50">
            {categories.map((category) => (
              <DropdownMenuItem
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`cursor-pointer hover:bg-secondary ${selectedCategory === category ? "bg-secondary text-primary font-semibold" : ""}`}
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
            className="w-24 h-10 rounded-xl bg-background border-0 text-sm focus:ring-1 focus:ring-[#bb740a]/40 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={priceRange.max}
            onChange={(e) =>
              setPriceRange({ ...priceRange, max: e.target.value })
            }
            className="w-24 h-10 rounded-xl bg-background border-0 text-sm focus:ring-1 focus:ring-[#bb740a]/40 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        {/* Condition Chips */}
        <div className="flex items-center gap-2">
          {conditions.map((condition) => (
            <button
              key={condition}
              onClick={() => toggleCondition(condition as Condition)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${selectedConditions.includes(condition as Condition)
                  ? "bg-amber-500/10 text-amber-500 font-semibold"
                  : "bg-background text-muted-foreground hover:text-foreground shadow-xs"
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
              className="h-10 px-4 rounded-xl bg-background hover:bg-background/80 text-foreground cursor-pointer border-0 shadow-xs"
            >
              <Filter className="w-4 h-4 mr-2" />
              {sortBy}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 bg-popover text-popover-foreground shadow-lg border border-border/50">
            {[
              "Relevance",
              "Newest",
              "Price: Low to High",
              "Price: High to Low",
            ].map((sort) => (
              <DropdownMenuItem
                key={sort}
                onClick={() => setSortBy(sort)}
                className={`cursor-pointer hover:bg-secondary ${sortBy === sort ? "bg-secondary text-primary font-semibold" : ""}`}
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

      {/* Mobile Filter Bar Trigger (Search is handled in sticky Header) */}
      <div className="flex sm:hidden items-center justify-end gap-2 mb-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 px-3 rounded-full bg-secondary border-0 shadow-xs text-foreground gap-1.5 text-xs font-medium">
              <Filter className="w-3.5 h-3.5 text-foreground" />
              <span>Filters</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] rounded-t-[2rem] bg-popover border-t border-border p-6 overflow-y-auto text-popover-foreground">
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
                          : "bg-secondary text-muted-foreground border border-border"
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
                    className="flex-1 h-11 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    className="flex-1 h-11 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                          : "bg-secondary text-muted-foreground border border-border"
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
                          : "bg-secondary text-muted-foreground border border-border"
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
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4 w-full text-left">
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
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4">
            {filteredProducts.map((product, index) => {
              const isLastElement = index === filteredProducts.length - 1;
              return (
                <div
                  key={product.id}
                  ref={isLastElement ? lastElementRef : null}
                >
                  <ProductCard
                    product={product}
                    isSaved={savedItems.has(product.id)}
                    onToggleSave={() => toggleSave(product.id)}
                    isVerified={isVerified}
                    onMessageClick={handleMessageClick}
                    onVerificationRequired={onVerificationRequired}
                    onClick={() => navigate(`/dashboard/listing/${product.id}`)}
                  />
                </div>
              );
            })}
          </div>
          
          {isLoadingMore && (
            <div className="flex justify-center py-4 md:hidden">
              <div className="w-6 h-6 border-2 border-[#bb740a] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Desktop Pagination Controls */}
          <div className="hidden md:flex justify-center items-center gap-4 pt-8">
            <Button
              variant="outline"
              disabled={!prevPageUrl}
              onClick={() => {
                if (prevPageUrl) fetchListings(prevPageUrl, false);
              }}
              className="border-border bg-secondary hover:bg-secondary/80 text-foreground"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={!nextPageUrl}
              onClick={() => {
                if (nextPageUrl) fetchListings(nextPageUrl, false);
              }}
              className="border-border bg-secondary hover:bg-secondary/80 text-foreground"
            >
              Next
            </Button>
          </div>
        </>
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
      className="group relative bg-secondary dark:bg-zinc-900 rounded-xl overflow-hidden cursor-pointer shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border border-border/40"
      onClick={onClick}
    >
      {/* Square Product Image */}
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <img
          src={product.image}
          alt={product.title}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80";
          }}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Save Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave();
          }}
          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-md ${isSaved
              ? "bg-[#bb740a] text-white"
              : "bg-black/40 text-white hover:bg-black/60"
            }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-current" : ""}`} />
        </button>
        {/* Condition Badge */}
        <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-black/50 text-white/90 backdrop-blur-sm">
          {product.condition}
        </span>
      </div>

      {/* Card Body */}
      <div className="p-2.5 space-y-1">
        {/* Title */}
        <h3 className="text-xs font-semibold text-foreground line-clamp-2 leading-tight">
          {product.title}
        </h3>

        {/* Price */}
        <p className="text-sm font-bold text-[#bb740a]">
          RWF {product.price.toLocaleString()}
        </p>

        {/* Location */}
        <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 truncate">
          <MapPin className="w-2.5 h-2.5 shrink-0" />
          {product.location.campus}
        </p>

        {/* Message button — desktop only */}
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => onMessageClick(e, product.id)}
          className="hidden md:inline-flex w-full h-7 mt-1 text-[11px] text-[#bb740a] hover:bg-[#bb740a]/10 cursor-pointer border border-[#bb740a]/20"
        >
          <MessageSquare className="w-3 h-3 mr-1" />
          Message seller
        </Button>
      </div>
    </div>
  );
}
