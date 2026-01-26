import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '../ui/button';

interface AdvancedSearchProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: {
    categories?: string[];
    discountRange?: [number, number];
    sortBy?: 'expiry' | 'discount' | 'popularity';
  }) => void;
}

export function AdvancedSearch({ onSearch, onFilterChange }: AdvancedSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [discountRange, setDiscountRange] = useState<[number, number]>([0, 100]);
  const [sortBy, setSortBy] = useState<'expiry' | 'discount' | 'popularity'>('popularity');

  const categories = ['Food', 'Fashion', 'Electronics', 'Education', 'Travel', 'Subscriptions'];

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleCategoryToggle = (category: string) => {
    const updated = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    setSelectedCategories(updated);
  };

  const handleApplyFilters = () => {
    onFilterChange({
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      discountRange,
      sortBy,
    });
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setDiscountRange([0, 100]);
    setSortBy('popularity');
    onFilterChange({});
    setSearchQuery('');
    onSearch('');
  };

  const hasActiveFilters =
    searchQuery || selectedCategories.length > 0 || discountRange[0] > 0 || discountRange[1] < 100;

  return (
    <div className="mb-8 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by brand, product, or category..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-12 pr-12 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => handleSearch('')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Filter and Sort Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="outline"
          className="flex items-center gap-2 border-purple-300 text-purple-600 hover:bg-purple-50"
        >
          <Filter className="w-4 h-4" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'expiry' | 'discount' | 'popularity')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
        >
          <option value="popularity">Sort: Popularity</option>
          <option value="discount">Sort: Discount %</option>
          <option value="expiry">Sort: Expiry Date</option>
        </select>

        {hasActiveFilters && (
          <Button
            onClick={handleClearFilters}
            variant="outline"
            className="flex items-center gap-2 border-red-300 text-red-600 hover:bg-red-50"
          >
            <X className="w-4 h-4" />
            Clear All
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 animate-in fade-in slide-in-from-top-2">
          <div className="space-y-6">
            {/* Category Filter */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((category) => (
                  <label key={category} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => handleCategoryToggle(category)}
                      className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Discount Range Filter */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Discount Range</h3>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={discountRange[0]}
                  onChange={(e) =>
                    setDiscountRange([Math.min(parseInt(e.target.value), discountRange[1]), discountRange[1]])
                  }
                  className="flex-1"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={discountRange[1]}
                  onChange={(e) =>
                    setDiscountRange([discountRange[0], Math.max(parseInt(e.target.value), discountRange[0])])
                  }
                  className="flex-1"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {discountRange[0]}% - {discountRange[1]}%
              </p>
            </div>

            {/* Apply Button */}
            <Button
              onClick={handleApplyFilters}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
