// ─── Auth ────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  pk?: string;
  email: string;
  first_name: string;
  last_name?: string;
  phone_number?: string;
  avatar_url?: string;
  has_completed_profile?: boolean;
  is_staff?: boolean;
  auth_status?: {
    has_password?: boolean;
    linked_providers?: string[];
    has_social?: boolean;
  };
}

/** Shape returned by POST /backend/api/v1/auth/login */
export interface LoginResponse {
  access: string;
  refresh?: string;
  user: AuthUser;
  access_expiration?: string;
  refresh_expiration?: string;
}

/** Shape returned by POST /backend/api/v1/auth/token/refresh */
export interface RefreshResponse {
  access: string;
}

// ─── Marketplace ─────────────────────────────────────────────────────────────
export type Category = 'Bicycles' | 'Clothing' | 'Electronics' | 'Furniture' | 'Kitchen' | 'Sports' | 'Stationery' | 'Textbooks';

export type Condition = 'New' | 'Like New' | 'Good' | 'Fair';

export type DealType = 'Pickup' | 'Delivery' | 'Meet on campus';

export interface Product {
  id: string;
  title: string;
  price: number;
  category: Category;
  condition: Condition;
  image: string;
  location: {
    university: string;
    campus: string;
  };
  postedAt: string;
  seller: {
    name: string;
    avatar: string;
    university?: string;
  };
  description?: string;
  dealType: DealType[];
}

export interface ListingImage {
  image: string;
}

export interface Listing {
  id: string;
  title: string;
  price: number;
  category: Category;
  condition: Condition;
  images: ListingImage[];
  description: string;
  location: {
    university: string;
    campus: string;
  };
  dealType: DealType[];
  status: 'draft' | 'published' | 'sold';
  createdAt: string;
  views: number;
  messages: number;
  seller_info?: {
    id: string;
    name?: string | null;
    avatar_url?: string | null;
    is_seller_verified?: boolean;
  };
}

export type ViewMode = 'sell' | 'buy';

export type SellSubView = 'create' | 'listings' | 'analytics' | 'payouts';

export type BuySubView = 'browse' | 'saved' | 'messages' | 'orders' | 'settings';

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  payload: Record<string, any>;
  created_at: string;
  is_read: boolean;
  read_at: string | null;
}
