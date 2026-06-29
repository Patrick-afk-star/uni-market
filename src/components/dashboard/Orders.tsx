import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Order {
  id: string;
  itemTitle: string;
  itemImage: string;
  price: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  seller: {
    name: string;
    avatar: string;
  };
  orderDate: string;
  deliveryDate?: string;
  trackingNumber?: string;
}

const orders: Order[] = [
  {
    id: 'ORD-001',
    itemTitle: 'Calculus Early Transcendentals 8th Edition',
    itemImage: '/product_textbook.jpg',
    price: 28000,
    status: 'delivered',
    seller: { name: 'Jean Paul', avatar: '' },
    orderDate: '2024-03-15',
    deliveryDate: '2024-03-18',
  },
  {
    id: 'ORD-002',
    itemTitle: 'Sony WH-1000XM4 Wireless Headphones',
    itemImage: '/product_headphones.jpg',
    price: 85000,
    status: 'shipped',
    seller: { name: 'Marie Claire', avatar: '' },
    orderDate: '2024-03-20',
    trackingNumber: 'TRK-123456789',
  },
  {
    id: 'ORD-003',
    itemTitle: 'Minimal LED Desk Lamp',
    itemImage: '/product_lamp.jpg',
    price: 15000,
    status: 'pending',
    seller: { name: 'David K.', avatar: '' },
    orderDate: '2024-03-25',
  },
];

const getStatusConfig = (status: Order['status']) => {
  switch (status) {
    case 'pending':
      return {
        label: 'Pending',
        icon: Clock,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/20',
      };
    case 'shipped':
      return {
        label: 'Shipped',
        icon: Truck,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
      };
    case 'delivered':
      return {
        label: 'Delivered',
        icon: CheckCircle,
        color: 'text-green-400',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/20',
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        icon: Package,
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
      };
  }
};

export function Orders() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const ordersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
        );
      }

      if (ordersRef.current) {
        const cards = ordersRef.current.querySelectorAll('.order-card');
        gsap.fromTo(
          cards,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out', delay: 0.2 }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="p-7 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 ref={titleRef} className="text-2xl font-bold text-foreground">
          My Orders
        </h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <span>{orders.filter((o) => o.status === 'pending').length} Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>{orders.filter((o) => o.status === 'shipped').length} Shipped</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span>{orders.filter((o) => o.status === 'delivered').length} Delivered</span>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div ref={ordersRef} className="space-y-4">
        {orders.map((order) => {
          const statusConfig = getStatusConfig(order.status);
          const StatusIcon = statusConfig.icon;

          return (
            <Card
              key={order.id}
              className={`order-card bg-[#121212] text-card-foreground border border-white/[0.06] overflow-hidden`}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-5 ">
                  {/* Item Image */}
                  <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-secondary">
                    <img
                      src={order.itemImage}
                      alt={order.itemTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Order Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-[#a5a5a5] mb-1">{order.id}</p>
                        <h3 className="font-semibold text-foreground line-clamp-1">{order.itemTitle}</h3>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${statusConfig.bgColor}`}>
                        <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                        <span className={`text-sm font-medium ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mt-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={order.seller.avatar}
                          alt={order.seller.name}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm text-[#898989]">{order.seller.name}</span>
                      </div>
                      <span className="text-lg font-bold text-primary">
                        RWF {order.price.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.06]">
                      <div className="flex items-center gap-6 text-sm text-[#898989]">
                        <span>Ordered: {new Date(order.orderDate).toLocaleDateString()}</span>
                        {order.deliveryDate && (
                          <span>Delivered: {new Date(order.deliveryDate).toLocaleDateString()}</span>
                        )}
                        {order.trackingNumber && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {order.trackingNumber}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {order.status === 'shipped' && (
                          <Button variant="outline" size="sm" className="rounded-lg border-white/10">
                            Track Order
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg border-white/10"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No orders yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Start shopping to see your orders here.
          </p>
          <Button className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground">
            Browse Listings
          </Button>
        </div>
      )}
    </div>
  );
}
