import { useState, useEffect } from 'react';
import { Search, MapPin, Heart, MessageSquare, Filter, ChevronDown, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Product, Condition } from '@/types';
import { sampleProducts, categories, conditions } from '@/data/products';

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
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [selectedConditions, setSelectedConditions] = useState<Condition[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' });
  const [sortBy, setSortBy] = useState<string>('Relevance');
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(sampleProducts);

  // Filter products based on search and filters
  useEffect(() => {
    let filtered = sampleProducts;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.location.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Condition filter
    if (selectedConditions.length > 0) {
      filtered = filtered.filter((p) => selectedConditions.includes(p.condition));
    }

    // Price filter
    if (priceRange.min) {
      filtered = filtered.filter((p) => p.price >= parseInt(priceRange.min));
    }
    if (priceRange.max) {
      filtered = filtered.filter((p) => p.price <= parseInt(priceRange.max));
    }

    // Sort
    if (sortBy === 'Price: Low to High') {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'Price: High to Low') {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'Newest') {
      filtered = [...filtered].reverse();
    }

    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, selectedConditions, priceRange, sortBy]);

  const toggleCondition = (condition: Condition) => {
    setSelectedConditions((prev) =>
      prev.includes(condition)
        ? prev.filter((c) => c !== condition)
        : [...prev, condition]
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
      {/* Filter Bar */}
      <div
        className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-[#0f0f0f] border border-white/[0.06]"
      >
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
                className={`cursor-pointer hover:bg-[#1a1a1a] ${selectedCategory === category ? 'bg-[#1a1a1a]' : ''}`}
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
            onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
            className="w-24 h-10 rounded-xl bg-[#0f0f0f] border border-white/[0.06] text-sm focus:border-[#bb740a] focus:ring-2 focus:ring-[#bb740a]/20 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:text-muted-foreground"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={priceRange.max}
            onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
            className="w-24 h-10 rounded-xl bg-[#0f0f0f] border border-white/[0.06] text-sm focus:border-[#bb740a] focus:ring-2 focus:ring-[#bb740a]/20 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:text-muted-foreground"
          />
        </div>

        {/* Condition Chips */}
        <div className="flex items-center gap-2">
          {conditions.map((condition) => (
            <button
              key={condition}
              onClick={() => toggleCondition(condition as Condition)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                selectedConditions.includes(condition as Condition)
                  ? 'bg-transparent border border-[#bb740a] text-[#bb740a]'
                  : 'bg-[#0f0f0f] text-muted-foreground hover:text-foreground border border-white/[0.06]'
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
            {['Relevance', 'Newest', 'Price: Low to High', 'Price: High to Low'].map((sort) => (
              <DropdownMenuItem
                key={sort}
                onClick={() => setSortBy(sort)}
                className={`cursor-pointer hover:bg-[#1a1a1a] ${sortBy === sort ? 'bg-[#1a1a1a]' : ''}`}
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

      {/* Verification Banner for Unverified Users */}
      {!isVerified && (
        <div className="bg-[#0c1816] flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-[#213732]">
          <div className="w-12 h-12 bg-[#0c4136] rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">Verify your account to message sellers</p>
            <p className="text-sm text-muted-foreground">
              Keep UniMarket safe by verifying your student status. It only takes a few minutes.
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
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
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
          <h3 className="text-lg font-semibold text-foreground mb-2">No results found</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Try adjusting your filters or search query to find what you&apos;re looking for.
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
    <div
      className="product-card group bg-[#121212] rounded-2xl p-3.5 cursor-pointer transition-shadow duration-300 border border-white/[0.06]"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Save Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave();
          }}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
            isSaved
              ? 'bg-primary text-primary-foreground'
              : 'bg-black/50 text-white hover:bg-black/70'
          }`}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Verified Badge */}
        <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-green-500/90 text-white text-xs font-medium flex items-center gap-1">
          <Shield className="w-3 h-3" />
          Verified
        </div>
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
            className="text-xs bg-secondary text-muted-foreground"
          >
            {product.condition}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-xs text-[#8f8f8f]">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {product.location}
          </span>
          <span>{product.postedAt}</span>
        </div>

        {/* Seller & Action */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
          <div className="flex items-center gap-2">
            <img
              src={product.seller.avatar}
              alt={product.seller.name}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-xs text-[#8f8f8f] truncate max-w-[80px]">
              {product.seller.name}
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onMessageClick}
            className="h-7 px-2 text-xs text-primary hover:bg-[#0a0a0a] cursor-pointer transition-colors"
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            Message
          </Button>
        </div>
      </div>
    </div>
  );
}
