import { useState, useEffect } from "react";
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
import type { Product, Condition } from "@/types";
import { sampleProducts, categories, conditions } from "@/data/products";

interface BuyViewProps {
  searchQuery: string;
  isVerified: boolean;
  onMessageClick: () => void;
  onVerificationRequired: () => void;
}

export function BuyView({
  searchQuery,
  isVerified,
  onMessageClick,
  onVerificationRequired,
}: BuyViewProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<string>("All Categories");
  const [selectedConditions, setSelectedConditions] = useState<Condition[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({
    min: "",
    max: "",
  });
  const [sortBy, setSortBy] = useState<string>("Relevance");
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());
  const [filteredProducts, setFilteredProducts] =
    useState<Product[]>(sampleProducts);
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");

  // Filter products based on search and filters
  useEffect(() => {
    let filtered = sampleProducts;

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
  }, [searchQuery, mobileSearchQuery, selectedCategory, selectedConditions, priceRange, sortBy]);

  const toggleCondition = (condition: Condition) => {
    setSelectedConditions((prev) =>
      prev.includes(condition)
        ? prev.filter((c) => c !== condition)
        : [...prev, condition],
    );
  };

  const toggleSave = (id: string) => {
    setSavedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleMessageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isVerified) {
      onVerificationRequired();
    } else {
      onMessageClick();
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

      {/* Product Grid */}
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
          />
        ))}
      </div>

      {filteredProducts.length === 0 && (
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
      )}
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  isSaved: boolean;
  onToggleSave: () => void;
  isVerified: boolean;
  onMessageClick: (e: React.MouseEvent) => void;
  onVerificationRequired: () => void;
}

function ProductCard({
  product,
  isSaved,
  onToggleSave,
  onMessageClick,
}: ProductCardProps) {
  return (
    <div className="product-card group relative aspect-[3/4] md:aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer border border-white/[0.06]">
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
            onClick={onMessageClick}
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
