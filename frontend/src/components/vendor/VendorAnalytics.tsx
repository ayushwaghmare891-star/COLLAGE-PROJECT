import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { TrendingUpIcon, EyeIcon, UsersIcon, PercentIcon, CalendarIcon, TagIcon } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

export function VendorAnalytics() {
  const { vendorDiscounts } = useAppStore();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const totalViews = vendorDiscounts.reduce((sum, d) => sum + d.totalViews, 0);
  const totalUsage = vendorDiscounts.reduce((sum, d) => sum + d.usageCount, 0);
  const conversionRate = totalViews > 0 ? ((totalUsage / totalViews) * 100).toFixed(1) : '0';
  const activeOffers = vendorDiscounts.filter(d => d.isActive).length;

  const topPerformingOffers = [...vendorDiscounts]
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 5);

  const categoryStats = vendorDiscounts.reduce((acc, offer) => {
    if (!acc[offer.category]) {
      acc[offer.category] = { views: 0, redemptions: 0, count: 0 };
    }
    acc[offer.category].views += offer.totalViews;
    acc[offer.category].redemptions += offer.usageCount;
    acc[offer.category].count += 1;
    return acc;
  }, {} as Record<string, { views: number; redemptions: number; count: number }>);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-body text-muted-foreground">
          Track your offer performance and student engagement metrics
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Views</CardTitle>
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <EyeIcon className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{totalViews}</p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">All time impressions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
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

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">Conversion Rate</CardTitle>
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <PercentIcon className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{conversionRate}%</p>
            <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">View to redemption</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-orange-900 dark:text-orange-100">Active Offers</CardTitle>
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <TagIcon className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{activeOffers}</p>
            <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">Currently running</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card text-card-foreground border-border">
          <CardHeader>
            <CardTitle className="text-h3 text-card-foreground">Top Performing Offers</CardTitle>
            <CardDescription className="text-muted-foreground">
              Your most redeemed discount offers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topPerformingOffers.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUpIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" strokeWidth={2} />
                <p className="text-muted-foreground">No data available yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topPerformingOffers.map((offer, index) => (
                  <div key={offer.id} className="flex items-center gap-4 p-4 bg-background border border-border rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full flex-shrink-0">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{offer.brand}</p>
                      <p className="text-sm text-muted-foreground">{offer.discount}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">{offer.usageCount}</p>
                      <p className="text-xs text-muted-foreground">redemptions</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground border-border">
          <CardHeader>
            <CardTitle className="text-h3 text-card-foreground">Category Performance</CardTitle>
            <CardDescription className="text-muted-foreground">
              Performance breakdown by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(categoryStats).length === 0 ? (
              <div className="text-center py-12">
                <TagIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" strokeWidth={2} />
                <p className="text-muted-foreground">No categories yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(categoryStats).map(([category, stats]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{category}</span>
                      <span className="text-sm text-muted-foreground">{stats.count} offer{stats.count !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-xs text-blue-700 dark:text-blue-300 mb-1">Views</p>
                        <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{stats.views}</p>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-xs text-green-700 dark:text-green-300 mb-1">Redemptions</p>
                        <p className="text-lg font-bold text-green-900 dark:text-green-100">{stats.redemptions}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card text-card-foreground border-border">
        <CardHeader>
          <CardTitle className="text-h3 text-card-foreground">Engagement Trends</CardTitle>
          <CardDescription className="text-muted-foreground">
            Monthly performance overview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg border-2 border-dashed border-border">
            <div className="text-center">
              <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" strokeWidth={2} />
              <p className="text-muted-foreground">Chart visualization coming soon</p>
              <p className="text-sm text-muted-foreground mt-2">Track your monthly trends and patterns</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

