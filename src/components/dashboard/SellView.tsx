import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { currentUser } from '@/data/user';
import { getApiUrl } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'like_new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
];

interface ApiCategory {
  id: string;
  name: string;
}

interface SellViewProps {
  listingId?: string;
  onPublish?: () => void;
}

export function SellView({ listingId, onPublish }: SellViewProps) {
  const { accessToken, user } = useAuth();
  const [apiCategories, setApiCategories] = useState<ApiCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const titleRef = useRef<HTMLHeadingElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(getApiUrl('/api/v1/categories'))
      .then((res) => res.json())
      .then((data) => setApiCategories(data))
      .catch((err) => console.error('Failed to fetch categories:', err));
  }, []);

  useEffect(() => {
    if (listingId) {
      fetch(getApiUrl(`/api/v1/listing/${listingId}`))
        .then((res) => res.json())
        .then((data) => {
          setTitle(data.title || '');
          setPrice(data.price ? data.price.toString() : '');
          setDescription(data.description || '');
          // The category field from API might be a string name or category object.
          // Let's try to match it with our category lists.
          setSelectedCategory(data.category_id || data.category || null);
          setSelectedCondition(data.condition || null);
          if (data.images && Array.isArray(data.images)) {
            setImagePreviews(data.images.map((img: any) => img.image));
          }
        })
        .catch((err) => console.error('Failed to fetch listing detail for edit:', err));
    }
  }, [listingId]);

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

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  const handleConditionSelect = (condition: string) => {
    setSelectedCondition(condition === selectedCondition ? null : condition);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0 && imageFiles.length + files.length <= 5) {
      const newFiles = [...imageFiles, ...files];
      setImageFiles(newFiles);
      
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews([...imagePreviews, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles(imageFiles.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handlePublish = async (status: 'published' | 'draft') => {
    if (!isFormValid) return;
    
    setIsPublishing(true);
    
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('price', price);
      formData.append('description', description);
      formData.append('condition', selectedCondition as string);
      formData.append('status', status);
      formData.append('category', selectedCategory as string);
      
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      const url = listingId 
        ? getApiUrl(`/api/v1/listing/${listingId}/`) 
        : getApiUrl('/api/v1/listing/');

      const res = await fetch(url, {
        method: listingId ? 'PUT' : 'POST',
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error(listingId ? 'Failed to update listing' : 'Failed to create listing');
      }

      onPublish?.();
      
      // Reset form if creating new listing
      if (!listingId) {
        setTitle('');
        setPrice('');
        setDescription('');
        setSelectedCategory(null);
        setSelectedCondition(null);
        setImageFiles([]);
        imagePreviews.forEach(URL.revokeObjectURL);
        setImagePreviews([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error(err);
      toast.error(listingId ? 'Failed to update listing' : 'Failed to create listing');
    } finally {
      setIsPublishing(false);
    }
  };

  const isFormValid =
    title && price && selectedCategory && selectedCondition;

  return (
    <div className="flex h-full">
      {/* Left: Composer */}
      <div ref={composerRef} className="flex-1 max-w-2xl p-7 space-y-6 overflow-auto">
        {/* Title */}
        <h1 ref={titleRef} className="text-3xl font-bold text-foreground">
          <span className="word inline-block">{listingId ? 'Edit' : 'Create'}</span>{' '}
          <span className="word inline-block">a</span>{' '}
          <span className="word inline-block">listing</span>
        </h1>

        {/* Category */}
        <div className="composer-panel space-y-3">
          <Label className="text-sm font-medium text-foreground">Category</Label>
          <div className="flex flex-wrap gap-2">
            {apiCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-transparent border border-[#bb740a] text-[#bb740a]'
                    : 'bg-[#0f0f0f] text-primary-foreground hover:text-foreground border border-white/[0.06]'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Photos */}
        <div className="composer-panel space-y-3">
          <Label className="text-sm font-medium text-foreground">Photos</Label>
          <input 
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            accept="image/png, image/jpeg, image/jpg"
            onChange={handleImageUpload}
          />
          <div
            onClick={() => fileInputRef.current?.click()}
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
          {imagePreviews.length > 0 && (
            <div className="flex gap-3 mt-4">
              {imagePreviews.map((img, index) => (
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
              {CONDITIONS.map((condition) => (
                <button
                  key={condition.value}
                  onClick={() => handleConditionSelect(condition.value)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    selectedCondition === condition.value
                      ? 'bg-transparent border border-[#bb740a] text-[#bb740a]'
                      : 'bg-[#0f0f0f] text-muted-foreground hover:text-foreground border border-white/[0.06]'
                  }`}
                >
                  {condition.label}
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
            onClick={() => handlePublish('draft')}
            disabled={!isFormValid || isPublishing}
            variant="outline"
            className="cursor-pointer flex-1 h-12 rounded-xl border-white/10 hover:bg-[#1a1a1a] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Draft
          </Button>
          <Button
            onClick={() => handlePublish('published')}
            disabled={!isFormValid || isPublishing}
            className="cursor-pointer flex-1 h-12 rounded-xl bg-[#bb740a] hover:bg-[#bb740a]/90 text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPublishing ? 'Publishing...' : 'Publish'}
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
            {imagePreviews.length > 0 ? (
              <img
                src={imagePreviews[0]}
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
                  {CONDITIONS.find(c => c.value === selectedCondition)?.label || selectedCondition}
                </Badge>
              )}
            </div>

            {/* Seller Row */}
            <div className="flex items-center gap-3 py-3 border-y border-white/[0.06]">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user?.avatar_url} alt={user?.first_name || currentUser.name} />
                <AvatarFallback />
              </Avatar>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {user ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || user.email : currentUser.name}
                </p>
                <p className="text-xs text-muted-foreground">{user?.email || currentUser.role}</p>
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
