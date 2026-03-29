import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Wallet, ArrowDownLeft, ArrowUpRight, CreditCard, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Transaction {
  id: string;
  type: 'incoming' | 'outgoing';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

const transactions: Transaction[] = [
  {
    id: 'TXN-001',
    type: 'incoming',
    amount: 28000,
    description: 'Sale: Calculus Textbook',
    date: '2024-03-18',
    status: 'completed',
  },
  {
    id: 'TXN-002',
    type: 'incoming',
    amount: 85000,
    description: 'Sale: Wireless Headphones',
    date: '2024-03-20',
    status: 'completed',
  },
  {
    id: 'TXN-003',
    type: 'outgoing',
    amount: 15000,
    description: 'Purchase: Desk Lamp',
    date: '2024-03-22',
    status: 'completed',
  },
  {
    id: 'TXN-004',
    type: 'incoming',
    amount: 45000,
    description: 'Sale: Physics Textbook Set',
    date: '2024-03-24',
    status: 'pending',
  },
];

export function Payouts() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
        );
      }

      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll('.payout-card');
        gsap.fromTo(
          cards,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out', delay: 0.1 }
        );
      }

      if (listRef.current) {
        gsap.fromTo(
          listRef.current,
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.3 }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  const totalBalance = 158000;
  const pendingBalance = 45000;
  const totalEarned = 258000;

  return (
    <div className="p-7 space-y-6">
      {/* Header */}
      <h1 ref={titleRef} className="text-2xl font-bold text-foreground">
        Payouts
      </h1>

      {/* Stats Cards */}
      <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="payout-card bg-[#22debc]/5 border-[#22debc]/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available Balance
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              RWF {totalBalance.toLocaleString()}
            </div>
            <Button className="cursor-pointer mt-4 w-full bg-[#bb740a] hover:bg-[#bb740a]/90 text-white text-primary-foreground">
              Withdraw
            </Button>
          </CardContent>
        </Card>

        <Card className="payout-card bg-[#22debc]/5 border-[#22debc]/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4 text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              RWF {pendingBalance.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Will be available in 2-3 business days
            </p>
          </CardContent>
        </Card>

        <Card className="payout-card bg-[#22debc]/5 border-[#22debc]/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Earned
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              RWF {totalEarned.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Lifetime earnings on UniMarket
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods */}
      <Card className="bg-[#22debc]/5 border-[#22debc]/10">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-[#1a1a1a] flex items-center gap-4 p-4 rounded-xl bg-secondary">
            <div className="w-12 h-12 rounded-xl bg-[#1a2d2c] flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Bank of Kigali</p>
              <p className="text-sm text-muted-foreground">**** **** **** 4521</p>
            </div>
            <Badge className="bg-[#194139] text-primary border-0">Default</Badge>
            <Button variant="ghost" size="sm" className="rounded-lg">
              Edit
            </Button>
          </div>
          <Button variant="outline" className="mt-4 w-full rounded-xl border-white/10 border-dashed">
            <CreditCard className="w-4 h-4 mr-2" />
            Add Payment Method
          </Button>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <div ref={listRef}>
        <Card className="bg-[#121212] border-[#121212]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-[#141414] flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        transaction.type === 'incoming'
                          ? 'bg-green-500/10'
                          : 'bg-red-500/10'
                      }`}
                    >
                      {transaction.type === 'incoming' ? (
                        <ArrowDownLeft className="w-5 h-5 text-green-400" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.id} • {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        transaction.type === 'incoming' ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {transaction.type === 'incoming' ? '+' : '-'}RWF{' '}
                      {transaction.amount.toLocaleString()}
                    </p>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${
                        transaction.status === 'completed'
                          ? 'bg-green-500/10 text-green-400'
                          : transaction.status === 'pending'
                          ? 'bg-yellow-500/10 text-yellow-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
