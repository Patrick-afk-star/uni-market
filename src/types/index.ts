export type Category = 'Textbooks' | 'Electronics' | 'Furniture' | 'Clothing' | 'Tickets' | 'Other';

export type Condition = 'New' | 'Like New' | 'Good' | 'Fair';

export type DealType = 'Pickup' | 'Delivery' | 'Meet on campus';

export interface Product {
  id: string;
  title: string;
  price: number;
  category: Category;
  condition: Condition;
  image: string;
  location: string;
  postedAt: string;
  seller: {
    name: string;
    avatar: string;
  };
  description?: string;
  dealType: DealType[];
}

export interface Listing {
  id: string;
  title: string;
  price: number;
  category: Category;
  condition: Condition;
  images: string[];
  description: string;
  location: string;
  dealType: DealType[];
  status: 'draft' | 'published' | 'sold';
  createdAt: string;
  views: number;
  messages: number;
}

export type ViewMode = 'sell' | 'buy';

export type SellSubView = 'create' | 'listings' | 'analytics' | 'payouts';

export type BuySubView = 'browse' | 'saved' | 'messages' | 'orders';
