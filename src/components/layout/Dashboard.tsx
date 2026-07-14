import { useEffect, useState } from "react";
import { getApiUrl } from "@/lib/api";
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

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
  image?: string;
}

interface DashboardProduct {
  id: string;
  name: string;
  price: string;
  rating: number;
  location: { university: string, campus: string };
  university: string;
  image: string;
  tag: string;
}

export default function Dashboard() {
  const [products, setProducts] = useState<DashboardProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resolveImageUrl = (url: string): string => {
    if (!url) return "https://via.placeholder.com/300";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const apiBase = getApiUrl("/");
    const cleanBase = apiBase.endsWith("/") ? apiBase.slice(0, -1) : apiBase;
    const cleanUrl = url.startsWith("/") ? url : `/${url}`;
    return `${cleanBase}${cleanUrl}`;
  };

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const response = await fetch(getApiUrl("/api/v1/listing/"));
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: ApiListingItem[] = await response.json();

        const mappedProducts: DashboardProduct[] = data.map((item, index) => {
          const imageUrl = item.image || (item.images?.length > 0 ? item.images[0].image : "");
          return {
            id: item.id || (index + 1).toString(),
            name: item.title,
            price: item.price,
            rating: 4.5,
            location: { university: "Various Universities", campus: "Campus" },
            university: "Various Universities",
            image: resolveImageUrl(imageUrl),
            tag: item.condition,
          };
        });
        setProducts(mappedProducts);
      } catch (err) {
        console.error("Failed to fetch listings:", err);
        setError("Failed to load listings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  if (loading) return <div className="p-8 text-center text-lg">Loading your dashboard...</div>;
  if (error) return <div className="p-8 text-center text-red-500 text-lg">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[#121412] dark:text-[#f4f2ee]">Marketplace Dashboard</h1>
        <p className="text-[#5f5b52] dark:text-[#b7b1a6]">Browse active student listings across all campuses.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <article
            key={product.id}
            className="bg-white dark:bg-[#151816] rounded-2xl overflow-hidden shadow-sm border border-[rgba(18,20,18,0.12)] dark:border-white/10 hover:shadow-md transition-shadow"
          >
            <Link to={`/listing/${product.id}`} className="block">
              <div className="relative h-48">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 bg-[rgba(28,110,93,0.9)] text-white px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {product.tag}
                </span>
              </div>
            </Link>
            <div className="p-4 space-y-2">
              <Link to={`/listing/${product.id}`} className="block">
                <h3 className="font-semibold text-[#121412] dark:text-[#f4f2ee] line-clamp-1 hover:text-[#d8a24a] transition-colors">{product.name}</h3>
              </Link>
              <div className="flex justify-between items-center">
                <span className="text-[#0a4e39] dark:text-[#1f7c5f] font-bold">{product.price} RWF</span>
                <span className="text-xs font-semibold bg-[rgba(241,179,92,0.2)] px-2 py-0.5 rounded-full">★ {product.rating}</span>
              </div>
              <p className="text-xs text-[#5f5b52] dark:text-[#b7b1a6]">{product.university}</p>
              <div className="flex gap-2 pt-3">
                <button className="flex-1 flex items-center justify-center gap-1.5 bg-[#d8a24a] text-[#121412] py-2 rounded-xl text-xs font-bold hover:brightness-110 transition-all cursor-pointer">
                  <ShoppingCart size={14} /> Buy
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}