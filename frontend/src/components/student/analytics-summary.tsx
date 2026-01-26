import { ShoppingBag, DollarSign, Ticket, TrendingUp } from 'lucide-react';

interface AnalyticsCard {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface AnalyticsSummaryProps {
  activeDiscounts: number;
  totalSaved: number;
  couponsClaimed: number;
  activeCoupons: number;
}

export function AnalyticsSummary({
  activeDiscounts,
  totalSaved,
  couponsClaimed,
  activeCoupons,
}: AnalyticsSummaryProps) {
  const cards: AnalyticsCard[] = [
    {
      title: 'Active Discounts',
      value: activeDiscounts,
      subtitle: 'Available to claim',
      icon: <ShoppingBag className="w-8 h-8" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Saved',
      value: `₹${totalSaved.toLocaleString()}`,
      subtitle: 'Money in your pocket',
      icon: <DollarSign className="w-8 h-8" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Coupons Claimed',
      value: couponsClaimed,
      subtitle: 'All time',
      icon: <Ticket className="w-8 h-8" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Active Coupons',
      value: activeCoupons,
      subtitle: 'Ready to use',
      icon: <TrendingUp className="w-8 h-8" />,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-purple-500"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm font-medium">{card.title}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
              <p className="text-gray-500 text-xs mt-1">{card.subtitle}</p>
            </div>
            <div className={`p-3 rounded-lg ${card.bgColor}`}>
              <div className={card.color}>{card.icon}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
