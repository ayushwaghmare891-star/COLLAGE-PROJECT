import { Heart, CalendarDays, Zap } from 'lucide-react';
import { Button } from '../ui/button';

interface DiscountCardProps {
  id: string;
  brandName: string;
  brandLogo?: string;
  discountPercentage: number;
  category: string;
  validityDate: string;
  description?: string;
  isSaved?: boolean;
  onSave?: (id: string) => void;
  onViewOffer?: (id: string) => void;
  isExclusive?: boolean;
  isLimitedTime?: boolean;
}

export function DiscountCard({
  id,
  brandName,
  brandLogo,
  discountPercentage,
  category,
  validityDate,
  description,
  isSaved = false,
  onSave,
  onViewOffer,
  isExclusive = false,
  isLimitedTime = false,
}: DiscountCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 h-full flex flex-col">
      {/* Top Section with Logo and Badge */}
      <div className="relative p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="flex items-start justify-between mb-2 sm:mb-3">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
            {brandLogo ? (
              <img
                src={brandLogo}
                alt={brandName}
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <span className="text-xs sm:text-sm font-bold text-purple-600 text-center">
                {brandName.substring(0, 3).toUpperCase()}
              </span>
            )}
          </div>
          <button
            onClick={() => onSave?.(id)}
            className={`p-2 rounded-lg transition-all flex-shrink-0 ${
              isSaved
                ? 'bg-red-100 text-red-600'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
          >
            <Heart className="w-4 h-4 sm:w-5 sm:h-5" fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Brand Name */}
        <h3 className="font-bold text-gray-900 text-base sm:text-lg truncate">{brandName}</h3>
        <p className="text-xs text-gray-600 mt-0.5 sm:mt-1 truncate">{category}</p>

        {/* Badges */}
        <div className="flex gap-2 mt-2 sm:mt-3 flex-wrap">
          {isExclusive && (
            <span className="px-2 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">
              🎓 Exclusive
            </span>
          )}
          {isLimitedTime && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
              ⏰ Limited Time
            </span>
          )}
        </div>
      </div>

      {/* Middle Section with Discount */}
      <div className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2 flex-grow">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-3 sm:p-4 text-white text-center mb-2 sm:mb-3">
          <p className="text-xs sm:text-sm opacity-90">Flat Discount</p>
          <p className="text-3xl sm:text-4xl font-bold">{discountPercentage}%</p>
          <p className="text-xs opacity-90 mt-0.5 sm:mt-1">Off All Products</p>
        </div>

        {/* Description */}
        {description && (
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{description}</p>
        )}
      </div>

      {/* Validity Date */}
      <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-2 min-w-0">
        <CalendarDays className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
        <span className="text-xs text-gray-600 truncate">
          Valid until <span className="font-semibold text-gray-900">{validityDate}</span>
        </span>
      </div>

      {/* Action Button */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-2 sm:pt-2">
        <Button
          onClick={() => onViewOffer?.(id)}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 sm:py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
          View & Claim Offer
        </Button>
      </div>
    </div>
  );
}
