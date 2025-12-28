import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useAuthStore } from '../../stores/authStore';
import {
  ChevronDownIcon,
  LoaderIcon,
  AlertCircleIcon,
} from 'lucide-react';

interface CouponRedemption {
  id: string;
  code: string;
  description: string;
  discountType: string;
  discountValue: string;
  totalRedemptions: number;
  uniqueStudents: number;
  percentageUsed: string;
  remainingUses: string | number;
  usageLimit: number | null;
  expirationDate: string;
  isActive: boolean;
  createdAt: string;
}

interface RedemptionDetails {
  redemptionId: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    college: string;
    enrollmentYear: string;
  };
  redeemedAt: string;
  redeemedDate: string;
  redeemedTime: string;
}

export function VendorCouponRedemptions() {
  const { token } = useAuthStore();
  const [coupons, setCoupons] = useState<CouponRedemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoupon, setSelectedCoupon] = useState<string | null>(null);
  const [redemptions, setRedemptions] = useState<RedemptionDetails[]>([]);
  const [loadingRedemptions, setLoadingRedemptions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalCoupons: 0,
    activeCoupons: 0,
    totalRedemptions: 0,
    uniqueStudents: 0,
    averageRedemptionsPerCoupon: 0,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchCouponAnalytics();
  }, [token]);

  const fetchCouponAnalytics = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await fetch(
        'http://localhost:5000/api/vendor-dashboard/coupons/analytics',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setStats({
          totalCoupons: data.statistics.totalCoupons,
          activeCoupons: data.statistics.activeCoupons,
          totalRedemptions: data.statistics.totalCouponRedemptions,
          uniqueStudents: data.statistics.uniqueStudentsRedeemed,
          averageRedemptionsPerCoupon:
            data.statistics.averageRedemptionsPerCoupon,
        });
        setCoupons(data.coupons);
      }
    } catch (err) {
      setError('Failed to load coupon analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCouponRedemptions = async (couponId: string) => {
    if (!token) return;
    try {
      setLoadingRedemptions(true);
      const response = await fetch(
        `http://localhost:5000/api/coupons/redemptions/${couponId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setRedemptions(data.redemptions);
      }
    } catch (err) {
      console.error('Failed to fetch redemptions:', err);
    } finally {
      setLoadingRedemptions(false);
    }
  };

  const toggleCouponDetails = (couponId: string) => {
    if (selectedCoupon === couponId) {
      setSelectedCoupon(null);
      setRedemptions([]);
    } else {
      setSelectedCoupon(couponId);
      fetchCouponRedemptions(couponId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoaderIcon className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Coupon Redemptions 🎟️
          </h1>
          <p className="text-body text-muted-foreground">
            Track and manage student coupon redemptions
          </p>
        </div>
        <Button
          onClick={fetchCouponAnalytics}
          variant="outline"
          className="bg-neutral text-neutral-foreground border-border hover:bg-muted hover:text-foreground"
        >
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
          <CardContent className="pt-6 flex items-center gap-3">
            <AlertCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Total Coupons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {stats.totalCoupons}
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              {stats.activeCoupons} active
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">
              Total Redemptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
              {stats.totalRedemptions}
            </p>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              Across all coupons
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
              Unique Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {stats.uniqueStudents}
            </p>
            <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
              Redeemed coupons
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-900 dark:text-orange-100">
              Avg Redemptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {stats.averageRedemptionsPerCoupon.toFixed(1)}
            </p>
            <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
              Per coupon
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900 border-pink-200 dark:border-pink-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-pink-900 dark:text-pink-100">
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-pink-900 dark:text-pink-100">
              {stats.totalCoupons > 0 
                ? ((stats.activeCoupons / stats.totalCoupons) * 100).toFixed(0)
                : 0}%
            </p>
            <p className="text-xs text-pink-700 dark:text-pink-300 mt-1">
              Active coupons
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Coupons List */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>All Coupons</CardTitle>
          <CardDescription>Click on a coupon to view redemption details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {coupons.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No coupons created yet
              </p>
            ) : (
              coupons.map((coupon) => (
                <div key={coupon.id} className="border border-border rounded-lg">
                  <button
                    onClick={() => toggleCouponDetails(coupon.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg">{coupon.code}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            coupon.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                          }`}
                        >
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {coupon.description}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Discount</p>
                          <p className="font-semibold">{coupon.discountValue}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Redemptions</p>
                          <p className="font-semibold">{coupon.totalRedemptions}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">People Redeemed</p>
                          <p className="font-semibold text-green-600 dark:text-green-400">{coupon.uniqueStudents}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Usage</p>
                          <p className="font-semibold">{coupon.percentageUsed}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Expires</p>
                          <p className="font-semibold">
                            {new Date(coupon.expirationDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <ChevronDownIcon
                      className={`w-5 h-5 transition-transform ${
                        selectedCoupon === coupon.id ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Redemptions Details */}
                  {selectedCoupon === coupon.id && (
                    <div className="border-t border-border bg-muted/30 p-4">
                      <div className="mb-4 pb-3 border-b border-border">
                        <h4 className="font-semibold text-foreground">
                          Redemption Details
                          <span className="ml-2 text-sm bg-primary text-primary-foreground px-3 py-1 rounded-full">
                            {redemptions.length} {redemptions.length === 1 ? 'person' : 'people'} redeemed
                          </span>
                        </h4>
                      </div>
                      {loadingRedemptions ? (
                        <div className="flex items-center justify-center h-32">
                          <LoaderIcon className="w-5 h-5 animate-spin text-primary" />
                        </div>
                      ) : redemptions.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          No redemptions yet
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="border-b border-border">
                              <tr>
                                <th className="text-left py-2 px-4">Student Name</th>
                                <th className="text-left py-2 px-4">Email</th>
                                <th className="text-left py-2 px-4">College</th>
                                <th className="text-left py-2 px-4">Year</th>
                                <th className="text-left py-2 px-4">Redeemed Date</th>
                                <th className="text-left py-2 px-4">Time</th>
                              </tr>
                            </thead>
                            <tbody>
                              {redemptions.map((redemption) => (
                                <tr key={redemption.redemptionId} className="border-b border-border hover:bg-muted/50">
                                  <td className="py-2 px-4 font-medium">
                                    {redemption.student.firstName}{' '}
                                    {redemption.student.lastName}
                                  </td>
                                  <td className="py-2 px-4">
                                    {redemption.student.email}
                                  </td>
                                  <td className="py-2 px-4">
                                    {redemption.student.college}
                                  </td>
                                  <td className="py-2 px-4">
                                    {redemption.student.enrollmentYear}
                                  </td>
                                  <td className="py-2 px-4">
                                    {redemption.redeemedDate}
                                  </td>
                                  <td className="py-2 px-4">
                                    {redemption.redeemedTime}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
