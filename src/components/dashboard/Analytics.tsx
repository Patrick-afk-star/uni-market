import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { TrendingUp, Eye, MessageSquare, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const stats = [
  {
    title: 'Total Views',
    value: '1,247',
    change: '+12.5%',
    trend: 'up',
    icon: Eye,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  {
    title: 'Messages',
    value: '48',
    change: '+8.2%',
    trend: 'up',
    icon: MessageSquare,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
  },
  {
    title: 'Total Sales',
    value: 'RWF 485K',
    change: '+23.1%',
    trend: 'up',
    icon: DollarSign,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    title: 'Conversion Rate',
    value: '3.8%',
    change: '-2.1%',
    trend: 'down',
    icon: TrendingUp,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
  },
];

const recentActivity = [
  { action: 'Listing viewed', item: 'MacBook Pro 2020', time: '2 minutes ago', count: 5 },
  { action: 'New message', item: 'Physics Textbook Set', time: '15 minutes ago', count: 1 },
  { action: 'Price offer', item: 'Wireless Headphones', time: '1 hour ago', count: 1 },
  { action: 'Listing saved', item: 'TI-84 Calculator', time: '3 hours ago', count: 3 },
];

export function Analytics() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
        );
      }

      if (statsRef.current) {
        const cards = statsRef.current.querySelectorAll('.stat-card');
        gsap.fromTo(
          cards,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out', delay: 0.1 }
        );
      }

      if (chartsRef.current) {
        gsap.fromTo(
          chartsRef.current,
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.3 }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="p-7 space-y-6">
      {/* Header */}
      <h1 ref={titleRef} className="text-2xl font-bold text-foreground">
        Analytics
      </h1>

      {/* Stats Grid */}
      <div ref={statsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;
          
          return (
            <Card key={stat.title} className="stat-card bg-[#121212] border-[#121212]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`w-8 h-8 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className={`flex items-center gap-1 text-xs mt-1 ${
                  stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  <TrendIcon className="w-3 h-3" />
                  <span>{stat.change}</span>
                  <span className="text-muted-foreground ml-1">vs last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts & Activity */}
      <div ref={chartsRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Views Chart Placeholder */}
        <Card className="lg:col-span-2 bg-[#121212] border-[#121212]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Views Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2 px-4">
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 88].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 bg-primary/20 rounded-t-lg relative group cursor-pointer hover:bg-primary/40 transition-colors"
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-card px-2 py-1 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity border border-white/[0.06]">
                    {height * 12}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-xs text-muted-foreground px-4">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep</span>
              <span>Oct</span>
              <span>Nov</span>
              <span>Dec</span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-[#121212] border-[#121212]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-3 pb-4 border-b border-white/[0.06] last:border-0 last:pb-0"
              >
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{activity.action}</p>
                  <p className="text-xs text-muted-foreground truncate">{activity.item}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
                {activity.count > 1 && (
                  <Badge variant="secondary" className="text-xs">
                    +{activity.count}
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
