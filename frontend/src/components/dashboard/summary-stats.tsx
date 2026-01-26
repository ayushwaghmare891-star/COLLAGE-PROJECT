import { Zap, TrendingUp, Clock } from 'lucide-react';

interface SummaryStatsProps {
  totalDiscounts: number;
  savedAmount: number;
  recentOffers: number;
}

export function SummaryStats({
  totalDiscounts,
  savedAmount,
  recentOffers,
}: SummaryStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Available Discounts */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Total Available</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">{totalDiscounts}</p>
            <p className="text-gray-500 text-xs mt-1">Active Discounts</p>
          </div>
          <div className="bg-purple-100 p-3 rounded-lg">
            <Zap className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Total Saved Amount */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">You've Saved</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">₹{savedAmount.toLocaleString()}</p>
            <p className="text-green-600 text-xs mt-1 font-semibold">Using StudiSave 💚</p>
          </div>
          <div className="bg-green-100 p-3 rounded-lg">
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Recently Used Offers */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-pink-500 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Recently Used</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">{recentOffers}</p>
            <p className="text-gray-500 text-xs mt-1">Last 30 Days</p>
          </div>
          <div className="bg-pink-100 p-3 rounded-lg">
            <Clock className="w-8 h-8 text-pink-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
