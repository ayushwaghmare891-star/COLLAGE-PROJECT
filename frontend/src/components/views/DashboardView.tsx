import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

import { ShieldCheckIcon, TagIcon, TrendingUpIcon, ClockIcon, SparklesIcon, SearchIcon, MapPinIcon, HeartIcon, RefreshCwIcon } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';
import { fetchAllActiveOffers } from '../../lib/offerAPI';

export function DashboardView() {
  const navigate = useNavigate();
  const { verificationStatus, discounts, setVerificationStatus } = useAppStore();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [allDiscounts, setAllDiscounts] = useState(discounts);

  const loadOffers = async (showLoading = true) => {
    if (showLoading) setIsRefreshing(true);
    try {
      console.log('Loading offers...');
      const data = await fetchAllActiveOffers();
      console.log('Offers loaded successfully:', data);
      
      const offers = data.offers?.map((offer: any) => ({
        id: offer._id,
        vendorId: offer.vendorId?._id || offer.vendorId,
        brand: offer.title,
        discount: offer.offerType === 'percentage' ? `${offer.offerValue}% off` : `₹${offer.offerValue} off`,
        description: offer.description,
        category: offer.category,
        expiryDays: Math.ceil((new Date(offer.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
        isExpired: new Date(offer.endDate) < new Date(),
        isUsed: false,
        termsAndConditions: offer.terms || '',
        createdAt: offer.createdAt,
        usageCount: offer.usedCount || 0,
        totalViews: 0,
        isActive: offer.isActive,
        code: offer.code,
      })) || [];
      setAllDiscounts(offers);
      console.log(`Successfully loaded ${offers.length} offers`);
    } catch (error) {
      console.error('Failed to load offers:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error details:', {
        message: errorMessage,
        stack: error instanceof Error ? error.stack : 'No stack trace',
      });
      
      // Show user-friendly error message
      if (errorMessage.includes('Network error')) {
        console.warn('⚠️ Backend server may not be running. Check if the backend is started on http://localhost:5000');
      }
    } finally {
      if (showLoading) setIsRefreshing(false);
    }
  };

  // Fetch offers on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Initialize verification status from localStorage
    const storedStatus = localStorage.getItem('verification_status');
    if (storedStatus && (storedStatus === 'verified' || storedStatus === 'pending' || storedStatus === 'not-verified')) {
      setVerificationStatus(storedStatus as 'not-verified' | 'pending' | 'verified');
    } else {
      // Default to verified for students who are auto-approved
      setVerificationStatus('verified');
    }
    
    loadOffers();

    // Set up auto-refresh every 30 seconds to get new vendor offers
    const interval = setInterval(() => {
      loadOffers(false); // Silent refresh without loading state
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const activeDiscounts = allDiscounts.filter(d => !d.isExpired).length;
  const usedDiscounts = allDiscounts.filter(d => d.isUsed).length;
  const savedDiscounts = 3; // Mock data

  const categories = [
    { id: 'all', label: 'All Offers', icon: '🎯', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    { id: 'Food', label: 'Food', icon: '🍔', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
    { id: 'Fashion', label: 'Fashion', icon: '👕', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' },
    { id: 'Technology', label: 'Tech', icon: '💻', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
    { id: 'Entertainment', label: 'Entertainment', icon: '🎬', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  ];

  const filteredDiscounts = allDiscounts.filter(d => {
    const matchesSearch = d.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         d.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || d.category === selectedCategory;
    return matchesSearch && matchesCategory && !d.isExpired;
  });

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 p-8 md:p-12 text-white shadow-2xl animate-gradient">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 animate-pulse delay-1000" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <SparklesIcon className="w-8 h-8" strokeWidth={2} />
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              {verificationStatus === 'verified' ? '✅ Verified Student' : '⏳ Pending Verification'}
            </Badge>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-3 animate-in fade-in slide-in-from-bottom duration-500">
            Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl">
            Find exclusive discounts available only for verified students. Save money on everything you love!
          </p>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-3xl">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" strokeWidth={2} />
              <input
                type="text"
                placeholder="Search for discounts or brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/95 backdrop-blur-sm border-0 rounded-2xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white shadow-lg"
              />
            </div>
            <Button 
              onClick={() => loadOffers()}
              disabled={isRefreshing}
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 h-auto rounded-2xl shadow-lg font-semibold disabled:opacity-70">
              <RefreshCwIcon className={`w-5 h-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} strokeWidth={2} />
              {isRefreshing ? 'Loading...' : 'Refresh'}
            </Button>
            <Button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 h-auto rounded-2xl shadow-lg font-semibold">
              <MapPinIcon className="w-5 h-5 mr-2" strokeWidth={2} />
              Near Me
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 hover:shadow-xl transition-all hover:-translate-y-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Active Offers</CardTitle>
              <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                <TagIcon className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-blue-900 dark:text-blue-100">{activeDiscounts}</p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">Available to use now</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800 hover:shadow-xl transition-all hover:-translate-y-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">Used This Month</CardTitle>
              <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingUpIcon className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-900 dark:text-green-100">{usedDiscounts}</p>
            <p className="text-xs text-green-700 dark:text-green-300 mt-2">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800 hover:shadow-xl transition-all hover:-translate-y-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">Saved Offers</CardTitle>
              <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                <HeartIcon className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-purple-900 dark:text-purple-100">{savedDiscounts}</p>
            <p className="text-xs text-purple-700 dark:text-purple-300 mt-2">Your favorites</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800 hover:shadow-xl transition-all hover:-translate-y-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-orange-900 dark:text-orange-100">Expiring Soon</CardTitle>
              <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <ClockIcon className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-orange-900 dark:text-orange-100">
              {allDiscounts.filter(d => d.expiryDays <= 7 && !d.isExpired).length}
            </p>
            <p className="text-xs text-orange-700 dark:text-orange-300 mt-2">Within 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Verification Status */}
      {verificationStatus !== 'verified' && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-yellow-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <ShieldCheckIcon className="w-7 h-7 text-white" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-yellow-900 dark:text-yellow-100 mb-1">
                    {verificationStatus === 'pending' ? 'Verification Pending' : 'Verify Your Student Status'}
                  </h3>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    {verificationStatus === 'pending' 
                      ? 'Your student ID is being reviewed. This usually takes 1-2 business days.'
                      : 'Upload your student ID to unlock all exclusive discounts and offers!'}
                  </p>
                </div>
              </div>
                  <Button
                    onClick={() => navigate('/discounts')}
                    className="group relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl shadow-lg font-bold hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300 overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative flex items-center gap-2">
                      <TagIcon className="w-5 h-5" strokeWidth={2.5} />
                      Browse Offers
                    </span>
                  </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Browse by Category</h2>
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                px-6 py-3 rounded-2xl font-semibold transition-all hover:scale-105 shadow-md
                ${selectedCategory === category.id 
                  ? category.color + ' ring-2 ring-offset-2 ring-primary' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }
              `}
            >
              <span className="mr-2">{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Discount Offers Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            {selectedCategory === 'all' ? 'All Offers' : `${selectedCategory} Offers`}
          </h2>
          <Button
            variant="outline"
            onClick={() => navigate('/discounts')}
            className="bg-background border-border hover:bg-muted"
          >
            View All
          </Button>
        </div>

        {filteredDiscounts.length === 0 ? (
          <Card className="bg-card text-card-foreground border-border">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <TagIcon className="w-10 h-10 text-muted-foreground" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No offers found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery ? 'Try adjusting your search' : 'Check back later for new deals'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDiscounts.slice(0, 8).map((discount, index) => (
              <Card 
                key={discount.id}
                className="group bg-white dark:bg-gray-800 border-0 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden rounded-2xl"
                onClick={() => navigate('/discounts')}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative h-48 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                  {/* Animated background pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16 animate-pulse" />
                    <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full translate-x-20 translate-y-20 animate-pulse delay-500" />
                  </div>
                  
                  {/* Brand icon */}
                  <div className="relative z-10 w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <TagIcon className="w-12 h-12 text-purple-600" strokeWidth={2.5} />
                  </div>
                  
                  {/* Category badge */}
                  <Badge className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-purple-700 border-0 shadow-lg px-3 py-1 font-semibold">
                    {discount.category}
                  </Badge>
                  
                  {/* Favorite button */}
                  <button 
                    className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add to favorites logic
                    }}
                  >
                    <HeartIcon className="w-5 h-5 text-pink-500 group-hover:fill-pink-500 transition-all" strokeWidth={2} />
                  </button>
                </div>
                
                <CardHeader className="pb-3 pt-5">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-purple-600 transition-colors">
                    {discount.brand}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400 line-clamp-2 text-sm mt-2">
                    {discount.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4 pb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {discount.discount}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 font-semibold">OFF</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                      <ClockIcon className="w-4 h-4 text-orange-600 dark:text-orange-400" strokeWidth={2} />
                      <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                        {discount.expiryDays}d left
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    className={`w-full py-6 rounded-xl text-base font-bold shadow-lg transition-all duration-300 ${
                      verificationStatus === 'verified'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:shadow-xl hover:scale-105'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    }`}
                    disabled={verificationStatus !== 'verified'}
                  >
                    {verificationStatus === 'verified' ? (
                      <span className="flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5" strokeWidth={2} />
                        Get Code Now
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <ShieldCheckIcon className="w-5 h-5" strokeWidth={2} />
                        Verify to Unlock
                      </span>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {verificationStatus === 'verified' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0 hover:shadow-2xl transition-all hover:-translate-y-1">
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Explore All Discounts</h3>
                  <p className="text-blue-100">Browse through {activeDiscounts}+ exclusive student offers</p>
                </div>
                <TagIcon className="w-12 h-12 opacity-50" strokeWidth={2} />
              </div>
              <Button
                onClick={() => navigate('/discounts')}
                className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg"
              >
                Browse Offers
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-teal-600 text-white border-0 hover:shadow-2xl transition-all hover:-translate-y-1">
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Saved Favorites</h3>
                  <p className="text-green-100">Quick access to your {savedDiscounts} saved offers</p>
                </div>
                <HeartIcon className="w-12 h-12 opacity-50" strokeWidth={2} />
              </div>
                  <Button
                    onClick={() => navigate('/discounts')}
                    className="group relative bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 shadow-lg border-2 border-green-200 dark:border-green-800 font-bold hover:scale-105 transition-all duration-300"
                  >
                    <span className="relative flex items-center gap-2">
                      <HeartIcon className="w-5 h-5 group-hover:fill-green-500 transition-all" strokeWidth={2.5} />
                      View Saved
                    </span>
                  </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

