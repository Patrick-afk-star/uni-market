import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Upload, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { currentUser } from '@/data/user';
import type { Category, Condition, DealType } from '@/types';
import { categories, conditions, dealTypes, campuses } from '@/data/products';

interface SellViewProps {
  onPublish?: () => void;
}

export function SellView({ onPublish }: SellViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<Condition | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const titleRef = useRef<HTMLHeadingElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title stagger animation
      if (titleRef.current) {
        const words = titleRef.current.querySelectorAll('.word');
        gsap.fromTo(
          words,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'expo.out' }
        );
      }

      // Composer panels animation
      if (composerRef.current) {
        const panels = composerRef.current.querySelectorAll('.composer-panel');
        gsap.fromTo(
          panels,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out', delay: 0.2 }
        );
      }

      // Preview card slide-in
      if (previewRef.current) {
        gsap.fromTo(
          previewRef.current,
          { opacity: 0, x: 60 },
          { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out', delay: 0.3 }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  const handleConditionSelect = (condition: Condition) => {
    setSelectedCondition(condition === selectedCondition ? null : condition);
  };

  const handleImageUpload = () => {
    // Simulate image upload
    if (images.length < 5) {
      const placeholderImages = [
        '/product_textbook.jpg',
        '/product_headphones.jpg',
        '/product_lamp.jpg',
      ];
      const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
      setImages([...images, randomImage]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    // Simulate publishing
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsPublishing(false);
    onPublish?.();
    // Reset form
    setTitle('');
    setPrice('');
    setDescription('');
    setSelectedCategory(null);
    setSelectedCondition(null);
    setImages([]);
  };

  const isFormValid =
    title && price && selectedCategory && selectedCondition;

  return (
    <div className="flex h-full">
      {/* Left: Composer */}
      <div ref={composerRef} className="flex-1 max-w-2xl p-7 space-y-6 overflow-auto">
        {/* Title */}
        <h1 ref={titleRef} className="text-3xl font-bold text-foreground">
          <span className="word inline-block">Create</span>{' '}
          <span className="word inline-block">a</span>{' '}
          <span className="word inline-block">listing</span>
        </h1>

        {/* Category */}
        <div className="composer-panel space-y-3">
          <Label className="text-sm font-medium text-foreground">Category</Label>
          <div className="flex flex-wrap gap-2">
            {categories.slice(1).map((category) => (
              <button
                key={category}
                onClick={() => handleCategorySelect(category as Category)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-transparent border border-[#bb740a] text-[#bb740a]'
                    : 'bg-[#0f0f0f] text-primary-foreground hover:text-foreground border border-white/[0.06]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Photos */}
        <div className="composer-panel space-y-3">
          <Label className="text-sm font-medium text-foreground">Photos</Label>
          <div
            onClick={handleImageUpload}
            className="border-2 border-dashed border-white/[0.14] rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 hover:bg-secondary/30 transition-all duration-200"
          >
            <div className="bg-[#1a1a1a] w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
              <Upload className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Click to upload</p>
              <p className="text-xs text-muted-foreground mt-1">
                JPG or PNG, up to 5 photos
              </p>
            </div>
          </div>
          {images.length > 0 && (
            <div className="flex gap-3 mt-4">
              {images.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img}
                    alt={`Upload ${index + 1}`}
                    className="w-[72px] h-[72px] object-cover rounded-xl"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Title Input */}
        <div className="composer-panel space-y-3">
          <Label className="text-sm font-medium text-foreground">Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Calculus Early Transcendentals 8th Ed"
            className="bg-[#0f0f0f] h-12 rounded-xl border border-white/[0.06] focus:border-[#bb740a] focus:ring-2 focus:ring-[#bb740a]/20"
          />
        </div>

        {/* Price & Condition */}
        <div className="composer-panel grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">Price (RWF)</Label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              className="h-12 rounded-xl bg-[#0f0f0f] border border-white/[0.06] focus:border-[#bb740a] focus:ring-2 focus:ring-[#bb740a]/20"
            />
          </div>
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">Condition</Label>
            <div className="flex flex-wrap gap-2">
              {conditions.map((condition) => (
                <button
                  key={condition}
                  onClick={() => handleConditionSelect(condition as Condition)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    selectedCondition === condition
                      ? 'bg-transparent border border-[#bb740a] text-[#bb740a]'
                      : 'bg-[#0f0f0f] text-muted-foreground hover:text-foreground border border-white/[0.06]'
                  }`}
                >
                  {condition}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="composer-panel space-y-3">
          <Label className="text-sm font-medium text-foreground">Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the item, course code, or pickup notes..."
            rows={5}
            className="rounded-xl bg-[#0f0f0f] border border-white/[0.06] focus:border-[#bb740a] focus:ring-2 focus:ring-[#bb740a]/20 resize-none"
          />
        </div>


        {/* Action Buttons */}
        <div className="composer-panel flex gap-3 pt-4">
          <Button
            variant="outline"
            className="cursor-pointer flex-1 h-12 rounded-xl border-white/10 hover:bg-[#1a1a1a] transition-all duration-200"
          >
            Save draft
          </Button>
          <Button
            onClick={handlePublish}
            disabled={!isFormValid || isPublishing}
            className="cursor-pointer flex-1 h-12 rounded-xl bg-[#bb740a] hover:bg-[#bb740a]/90 text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPublishing ? 'Publishing...' : 'Publish listing'}
          </Button>
        </div>
      </div>

      {/* Right: Preview */}
      <div className="w-[420px] p-7 hidden lg:block">
        <div
          ref={previewRef}
          className="sticky top-24 bg-[#0f0f0f] rounded-2xl p-5 card-shadow border border-[#121212]"
        >
          <p className="text-xs font-space font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Live Preview
          </p>

          {/* Preview Image */}
          <div className="aspect-square rounded-xl bg-[#1a1a1a] overflow-hidden mb-4">
            {images.length > 0 ? (
              <img
                src={images[0]}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-secondary/50">
                <Upload className="w-8 h-8 text-muted-foreground/50" />
              </div>
            )}
          </div>

          {/* Preview Content */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground line-clamp-2">
              {title || 'Title will appear here'}
            </h3>

            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-primary">
                RWF {price || '0'}
              </span>
              {selectedCondition && (
                <Badge
                  variant="secondary"
                  className="bg-secondary text-muted-foreground"
                >
                  {selectedCondition}
                </Badge>
              )}
            </div>

            {/* Seller Row */}
            <div className="flex items-center gap-3 py-3 border-y border-white/[0.06]">
              <Avatar className="w-10 h-10">
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {currentUser.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-foreground">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground">{currentUser.role}</p>
              </div>
            </div>



            {/* CTA Button */}
            <Button
              disabled
              className="w-full h-11 rounded-xl bg-[#151515] text-muted-foreground cursor-not-allowed"
            >
              Message seller
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
