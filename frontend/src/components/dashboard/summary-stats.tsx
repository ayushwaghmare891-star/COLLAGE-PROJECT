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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
      {/* Total Available Discounts */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-gray-600 text-xs sm:text-sm font-medium">Total Available</p>
            <p className="text-3xl sm:text-4xl font-bold text-gray-900 mt-1 sm:mt-2">{totalDiscounts}</p>
            <p className="text-gray-500 text-xs mt-1">Active Discounts</p>
          </div>
          <div className="bg-purple-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
            <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Total Saved Amount */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-gray-600 text-xs sm:text-sm font-medium">You've Saved</p>
            <p className="text-3xl sm:text-4xl font-bold text-gray-900 mt-1 sm:mt-2 break-words">₹{savedAmount.toLocaleString()}</p>
            <p className="text-green-600 text-xs mt-1 font-semibold">Using StudiSave 💚</p>
          </div>
          <div className="bg-green-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Recently Used Offers */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-pink-500 hover:shadow-xl transition-shadow sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-gray-600 text-xs sm:text-sm font-medium">Recently Used</p>
            <p className="text-3xl sm:text-4xl font-bold text-gray-900 mt-1 sm:mt-2">{recentOffers}</p>
            <p className="text-gray-500 text-xs mt-1">Last 30 Days</p>
          </div>
          <div className="bg-pink-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-pink-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
