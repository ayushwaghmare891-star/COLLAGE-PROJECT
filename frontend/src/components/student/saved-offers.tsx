import { Trash2, Eye } from 'lucide-react';
import { Button } from '../ui/button';

interface SavedOffer {
  id: string;
  brandName: string;
  discount: number;
  category: string;
  expiryDate: string;
  description: string;
  savedDate: string;
}

interface SavedOffersProps {
  offers: SavedOffer[];
  onRemove?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

export function SavedOffers({ offers, onRemove, onViewDetails }: SavedOffersProps) {
  if (offers.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 text-center">
        <div className="text-4xl mb-4">❤️</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Saved Offers Yet</h3>
        <p className="text-gray-600">Bookmark your favorite discounts to access them later!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {offers.map((offer) => (
        <div
          key={offer.id}
          className="bg-white rounded-xl shadow-md p-6 border-l-4 border-pink-500 hover:shadow-lg transition-shadow flex flex-col"
        >
          <div className="mb-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{offer.brandName}</h3>
                <p className="text-xs text-gray-600">{offer.category}</p>
              </div>
              <div className="bg-gradient-to-br from-pink-100 to-red-100 p-2 rounded-lg">
                <span className="text-2xl font-bold text-pink-600">{offer.discount}%</span>
              </div>
            </div>

            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{offer.description}</p>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Saved: {offer.savedDate}</span>
              <span>Expires: {offer.expiryDate}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <Button
              onClick={() => onViewDetails?.(offer.id)}
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
            >
              <Eye className="w-4 h-4" />
              View
            </Button>

            <Button
              onClick={() => onRemove?.(offer.id)}
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2 border-red-300 text-red-600 hover:bg-red-50 text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
