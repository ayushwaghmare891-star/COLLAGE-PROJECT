import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { TagIcon, ClockIcon, FilterIcon, SparklesIcon, HeartIcon, CheckCircleIcon, RefreshCwIcon } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { DiscountDrawer } from '../DiscountDrawer';
import { useToast } from '../../hooks/use-toast';
import { fetchAllActiveOffers } from '../../lib/offerAPI';
import type { Discount } from '../../types';

interface DiscountOffer extends Discount {
  id: string;
  vendorId: string;
  brand: string;
  category: string;
  expiryDays: number;
  isExpired: boolean;
  isActive: boolean;
}

export function DiscountsView() {
  const { verificationStatus, setVerificationStatus } = useAppStore();
  const [allOffers, setAllOffers] = useState<DiscountOffer[]>([]);
  const [selectedDiscount, setSelectedDiscount] = useState<DiscountOffer | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popularity');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  // Get unique categories from offers
  const uniqueCategories = Array.from(
    new Set(allOffers.map((o: DiscountOffer) => o.category).filter(Boolean))
  ).sort() as string[];

  const loadOffers = async (showLoading = true, category?: string) => {
    try {
      if (showLoading) setLoading(true);
      else setIsRefreshing(true);
      
      const fetchCategory = category || (categoryFilter !== 'all' ? categoryFilter : undefined);
      console.log('🔄 DiscountsView: Loading offers with category filter:', fetchCategory || 'all');
      console.log('🔄 DiscountsView: Current allOffers in store:', allOffers.length);
      
      const data = await fetchAllActiveOffers(fetchCategory);
      console.log('✅ DiscountsView: Fetched offers data:', data);
      console.log('✅ DiscountsView: Number of offers received:', data.offers?.length || 0);
      
      if (!data.offers || data.offers.length === 0) {
        console.warn('⚠️ DiscountsView: No offers in API response!');
        console.log('⚠️ Response data:', JSON.stringify(data, null, 2));
      }
      
      const offers = data.offers?.map((offer: any) => {
        console.log('📦 Mapping offer:', offer.title, 'isActive:', offer.isActive, 'approvalStatus:', offer.approvalStatus);
        return {
          id: offer._id,
          vendorId: offer.vendorId?._id || offer.vendorId || 'vendor1',
          brand: offer.title,
          discount: offer.offerType === 'percentage' ? `${offer.offerValue}% off` : `₹${offer.offerValue} off`,
          description: offer.description,
          category: offer.category,
          expiryDays: Math.ceil((new Date(offer.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
          isExpired: new Date(offer.endDate) < new Date(),
          isUsed: false,
          termsAndConditions: offer.terms || '',
          createdAt: offer.createdAt,
          usageCount: 0,
          totalViews: 0,
          isActive: offer.isActive,
        };
      }) || [];
      console.log('✅ DiscountsView: Mapped offers count:', offers.length);
      console.log('✅ DiscountsView: Setting allOffers to:', offers.length, 'offers');
      setAllOffers(offers);
    } catch (error) {
      console.error('❌ DiscountsView: Failed to load offers:', error);
      console.error('❌ Error details:', error instanceof Error ? error.stack : error);
      // Keep showing existing offers if API fails
      if (allOffers.length > 0) {
        console.log('📚 Keeping', allOffers.length, 'cached offers');
      }
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load offers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Initialize verification status from localStorage
    const storedStatus = localStorage.getItem('verification_status');
    if (storedStatus && (storedStatus === 'verified' || storedStatus === 'pending' || storedStatus === 'not-verified')) {
      setVerificationStatus(storedStatus as 'not-verified' | 'pending' | 'verified');
    } else {
      // Default to verified for students
      setVerificationStatus('verified');
    }
    
    // Only show loading if we don't have cached offers
    if (allOffers.length === 0) {
      setLoading(true);
    }
    
    loadOffers();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadOffers(false); // Silent refresh
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const filteredDiscounts = allOffers.filter((d: DiscountOffer) => {
    if (categoryFilter === 'all') return true;
    // Case-insensitive category comparison
    return d.category?.toLowerCase() === categoryFilter.toLowerCase();
  });

  const sortedDiscounts = [...filteredDiscounts].sort((a, b) => {
    if (sortBy === 'expiry') {
      return a.expiryDays - b.expiryDays;
    }
    return 0;
  });

// Show message if no offers are loaded
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md bg-card text-card-foreground border-border">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
              <SparklesIcon className="w-8 h-8 text-muted-foreground" strokeWidth={2} />
            </div>
            <CardTitle className="text-h2 text-card-foreground">Loading Offers</CardTitle>
            <CardDescription className="text-muted-foreground">
              Please wait while we fetch the latest offers
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (sortedDiscounts.length === 0 && !loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md bg-card text-card-foreground border-border">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <TagIcon className="w-8 h-8 text-muted-foreground" strokeWidth={2} />
            </div>
            <CardTitle className="text-h2 text-card-foreground">No Active Discounts</CardTitle>
            <CardDescription className="text-muted-foreground">
              {verificationStatus !== 'verified' 
                ? 'Verify your student status to unlock exclusive offers' 
                : allOffers.length === 0 
                ? 'Try refreshing the page or check back soon for new offers'
                : 'Try adjusting your filters'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {verificationStatus !== 'verified' && (
              <Button 
                onClick={() => window.location.href = '/verification'}
                className="w-full bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground"
              >
                Verify Student Status
              </Button>
            )}
            <Button 
              onClick={() => loadOffers(true)}
              variant="outline"
              className="w-full"
            >
              <RefreshCwIcon className="w-4 h-4 mr-2" />
              Refresh Offers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 md:space-y-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-h1 font-semibold text-foreground leading-tight mb-2 sm:mb-4">
            Discounts
          </h1>
          <p className="text-sm sm:text-body text-muted-foreground leading-relaxed">
            Browse and activate your exclusive student discounts
          </p>
        </div>
        <Button 
          onClick={() => loadOffers()}
          disabled={isRefreshing}
          variant="outline"
          className="disabled:opacity-70 flex-shrink-0 h-10 w-10 p-0 sm:h-auto sm:w-auto sm:px-4"
        >
          <RefreshCwIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${isRefreshing ? 'animate-spin' : ''}`} strokeWidth={2} />
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <FilterIcon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" strokeWidth={2} />
          <div className="flex flex-wrap gap-2 sm:gap-4 flex-1">
            <Select value={categoryFilter} onValueChange={(value) => {
              setCategoryFilter(value);
              loadOffers(true, value);
            }}>
              <SelectTrigger className="w-full sm:w-40 bg-background text-foreground border-input text-sm">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground">
                <SelectItem value="all" className="text-popover-foreground cursor-pointer">All Categories ({allOffers.length})</SelectItem>
                {uniqueCategories.map((category: string) => {
                  const count = allOffers.filter((o: DiscountOffer) => o.category?.toLowerCase() === category.toLowerCase()).length;
                  return (
                    <SelectItem 
                      key={category}
                      value={category} 
                      className="text-popover-foreground cursor-pointer"
                    >
                      {category} ({count})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-40 bg-background text-foreground border-input text-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground">
                <SelectItem value="popularity" className="text-popover-foreground cursor-pointer">Popularity</SelectItem>
                <SelectItem value="expiry" className="text-popover-foreground cursor-pointer">Expiring Soon</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="text-xs sm:text-small text-muted-foreground px-6 sm:px-0">
          {sortedDiscounts.length} offers available
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {sortedDiscounts.map((discount, index) => (
          <Card 
            key={discount.id} 
            className="group bg-white dark:bg-gray-800 border-0 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden rounded-2xl"
            onClick={() => setSelectedDiscount(discount)}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="relative h-40 sm:h-52 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-white rounded-full -translate-x-12 sm:-translate-x-16 -translate-y-12 sm:-translate-y-16 animate-pulse" />
                <div className="absolute bottom-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-white rounded-full translate-x-16 sm:translate-x-20 translate-y-16 sm:translate-y-20 animate-pulse delay-500" />
              </div>
              
              {/* Brand icon */}
              <div className="relative z-10 w-20 h-20 sm:w-28 sm:h-28 bg-white rounded-3xl shadow-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <TagIcon className="w-10 h-10 sm:w-14 sm:h-14 text-purple-600" strokeWidth={2.5} />
              </div>
              
              {/* Category badge */}
              <Badge 
                variant={discount.isExpired ? "destructive" : "default"}
                className={`absolute top-3 right-3 sm:top-4 sm:right-4 backdrop-blur-sm border-0 shadow-lg px-2 sm:px-3 py-1 sm:py-1.5 font-semibold text-xs sm:text-sm ${
                  discount.isExpired 
                    ? "bg-red-500 text-white" 
                    : "bg-white/90 text-purple-700"
                }`}
              >
                {discount.category}
              </Badge>
              
              {/* Favorite button */}
              <button 
                className="absolute top-3 left-3 sm:top-4 sm:left-4 w-9 h-9 sm:w-11 sm:h-11 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <HeartIcon className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500 group-hover:fill-pink-500 transition-all" strokeWidth={2} />
              </button>
            </div>
            
            <CardHeader className="pb-2 sm:pb-3 pt-4 sm:pt-6 px-4 sm:px-6">
              <CardTitle className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors line-clamp-2">
                {discount.brand}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 sm:mt-3 line-clamp-2">
                {discount.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4 sm:space-y-5 pb-4 sm:pb-6 px-4 sm:px-6">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {discount.discount}
                  </span>
                  <span className="text-xs sm:text-base text-gray-500 dark:text-gray-400 font-semibold">OFF</span>
                </div>
                {!discount.isExpired && (
                  <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                    <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600 dark:text-orange-400 flex-shrink-0" strokeWidth={2} />
                    <span className="text-xs sm:text-sm font-semibold text-orange-600 dark:text-orange-400 whitespace-nowrap">
                      {discount.expiryDays}d left
                    </span>
                  </div>
                )}
              </div>
              
              <Button 
                className={`w-full py-4 sm:py-6 rounded-xl text-xs sm:text-base font-bold shadow-lg transition-all duration-300 ${
                  discount.isExpired
                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:shadow-xl hover:scale-105'
                }`}
                disabled={discount.isExpired}
              >
                {discount.isExpired ? (
                  <span className="flex items-center gap-1 sm:gap-2">
                    <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
                    Expired
                  </span>
                ) : discount.isUsed ? (
                  <span className="flex items-center gap-1 sm:gap-2">
                    <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
                    View Code
                  </span>
                ) : (
                  <span className="flex items-center gap-1 sm:gap-2">
                    <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
                    Get Discount Now
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <DiscountDrawer 
        discount={selectedDiscount}
        isOpen={!!selectedDiscount}
        onClose={() => setSelectedDiscount(null)}
      />
    </div>
  );
}


