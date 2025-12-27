import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { TagIcon, TrendingUpIcon, EyeIcon, UsersIcon, ClockIcon, PlusIcon, AlertCircleIcon } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';
import { fetchVendorOffers } from '../../lib/offerAPI';

export function VendorDashboard() {
  const navigate = useNavigate();
  const { vendorDiscounts, setVendorDiscounts } = useAppStore();
  const { user, token } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Fetch vendor offers on component mount
    const loadOffers = async () => {
      if (!token) return;
      try {
        const data = await fetchVendorOffers(token);
        const offers = data.offers?.map((offer: any) => ({
          id: offer._id,
          vendorId: offer.vendorId?._id || 'vendor1',
          brand: offer.title,
          discount: offer.offerType === 'percentage' ? `${offer.offerValue}% off` : `$${offer.offerValue} off`,
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
        })) || [];
        setVendorDiscounts(offers);
      } catch (error) {
        console.error('Failed to load offers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOffers();
  }, [token, setVendorDiscounts]);

  const activeDiscounts = vendorDiscounts.filter(d => d.isActive).length;
  const totalViews = vendorDiscounts.reduce((sum, d) => sum + d.totalViews, 0);
  const totalUsage = vendorDiscounts.reduce((sum, d) => sum + d.usageCount, 0);
  const expiringDiscounts = vendorDiscounts.filter(d => d.expiryDays <= 7 && d.isActive).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Welcome back, {user?.name || 'Vendor'} 👋
          </h1>
          <p className="text-body text-muted-foreground">
            Here's what's happening with your student discount offers today
          </p>
        </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => navigate('/vendor/profile')}
                  variant="outline"
                  className="bg-neutral text-neutral-foreground border-border hover:bg-muted hover:text-foreground"
                  size="lg"
                >
                  View Profile
                </Button>
                <Button
                  onClick={() => navigate('/vendor/offers/new')}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg flex items-center gap-2"
                  size="lg"
                >
                  <PlusIcon className="w-5 h-5" strokeWidth={2} />
                  Add New Offer
                </Button>
              </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Offers</CardTitle>
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <TagIcon className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{vendorDiscounts.length}</p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">All time offers created</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">Total Redemptions</CardTitle>
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <UsersIcon className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-900 dark:text-green-100">{totalUsage}</p>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">Students reached</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">Active Offers</CardTitle>
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <TrendingUpIcon className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{activeDiscounts}</p>
            <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">Currently available</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-orange-900 dark:text-orange-100">Expiring Soon</CardTitle>
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{expiringDiscounts}</p>
            <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">Within 7 days</p>
          </CardContent>
        </Card>
      </div>

      {expiringDiscounts > 0 && (
        <Card className="bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertCircleIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" strokeWidth={2} />
              <div>
                <CardTitle className="text-orange-900 dark:text-orange-100">Offers Expiring Soon</CardTitle>
                <CardDescription className="text-orange-700 dark:text-orange-300">
                  {expiringDiscounts} offer{expiringDiscounts > 1 ? 's' : ''} will expire within the next 7 days
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vendorDiscounts
                .filter(d => d.expiryDays <= 7 && d.isActive)
                .slice(0, 3)
                .map((discount) => (
                  <div
                    key={discount.id}
                    className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-800 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                        <TagIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" strokeWidth={2} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{discount.brand}</h4>
                        <p className="text-sm text-muted-foreground">{discount.discount}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400 font-medium">
                      <ClockIcon className="w-4 h-4" strokeWidth={2} />
                      <span>{discount.expiryDays} days left</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card text-card-foreground border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-h3 text-card-foreground">Recent Offers</CardTitle>
              <CardDescription className="text-muted-foreground">
                Your latest discount offers and their performance
              </CardDescription>
            </div>
            <Button
              onClick={() => navigate('/vendor/offers')}
              variant="outline"
              className="bg-neutral text-neutral-foreground border-border hover:bg-muted hover:text-foreground"
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {vendorDiscounts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <TagIcon className="w-10 h-10 text-muted-foreground" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No offers yet</h3>
              <p className="text-body text-muted-foreground mb-8 max-w-md mx-auto">
                Create your first discount offer to start reaching students and growing your business
              </p>
              <Button
                onClick={() => navigate('/vendor/offers/new')}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                size="lg"
              >
                <PlusIcon className="w-5 h-5 mr-2" strokeWidth={2} />
                Create Your First Offer
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">Offer Title</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">Discount</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">Category</th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-foreground">Views</th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-foreground">Redemptions</th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-foreground">Status</th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendorDiscounts.slice(0, 5).map((discount) => (
                    <tr key={discount.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <TagIcon className="w-5 h-5 text-primary" strokeWidth={2} />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{discount.brand}</p>
                            <p className="text-sm text-muted-foreground">{discount.description.substring(0, 40)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-primary">{discount.discount}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {discount.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <EyeIcon className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
                          <span className="text-foreground font-medium">{discount.totalViews}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <UsersIcon className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
                          <span className="text-foreground font-medium">{discount.usageCount}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {discount.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary hover:bg-primary/10"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card text-card-foreground border-border">
          <CardHeader>
            <CardTitle className="text-h3 text-card-foreground">Performance Overview</CardTitle>
            <CardDescription className="text-muted-foreground">
              Your offer performance this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Conversion Rate</span>
                  <span className="text-sm font-semibold text-primary">
                    {totalViews > 0 ? Math.round((totalUsage / totalViews) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${totalViews > 0 ? Math.round((totalUsage / totalViews) * 100) : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Active Offers</span>
                  <span className="text-sm font-semibold text-green-600">
                    {vendorDiscounts.length > 0 ? Math.round((activeDiscounts / vendorDiscounts.length) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${vendorDiscounts.length > 0 ? Math.round((activeDiscounts / vendorDiscounts.length) * 100) : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Student Engagement</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {totalViews > 0 ? Math.min(Math.round((totalViews / 100) * 100), 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${totalViews > 0 ? Math.min(Math.round((totalViews / 100) * 100), 100) : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground border-border">
          <CardHeader>
            <CardTitle className="text-h3 text-card-foreground">Quick Actions</CardTitle>
            <CardDescription className="text-muted-foreground">
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              <Button
                onClick={() => navigate('/vendor/offers/new')}
                className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90 h-auto py-4"
              >
                <PlusIcon className="w-5 h-5 mr-3" strokeWidth={2} />
                <div className="text-left">
                  <p className="font-semibold">Create New Offer</p>
                  <p className="text-xs opacity-90">Add a new student discount</p>
                </div>
              </Button>

              <Button
                onClick={() => navigate('/vendor/offers')}
                variant="outline"
                className="w-full justify-start bg-neutral text-neutral-foreground border-border hover:bg-muted hover:text-foreground h-auto py-4"
              >
                <TagIcon className="w-5 h-5 mr-3" strokeWidth={2} />
                <div className="text-left">
                  <p className="font-semibold">Manage Offers</p>
                  <p className="text-xs opacity-70">Edit or delete existing offers</p>
                </div>
              </Button>

              <Button
                onClick={() => navigate('/vendor/analytics')}
                variant="outline"
                className="w-full justify-start bg-neutral text-neutral-foreground border-border hover:bg-muted hover:text-foreground h-auto py-4"
              >
                <TrendingUpIcon className="w-5 h-5 mr-3" strokeWidth={2} />
                <div className="text-left">
                  <p className="font-semibold">View Analytics</p>
                  <p className="text-xs opacity-70">Track performance metrics</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

