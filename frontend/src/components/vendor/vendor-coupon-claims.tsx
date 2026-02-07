'use client'

import { useState, useEffect } from 'react'
import { Ticket, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useRealtimeCoupons } from '../../hooks/useRealtimeCoupons'
import { getHeaders, API_BASE_URL } from '../../lib/api'

interface CouponClaimInfo {
  couponId: string;
  couponCode: string;
  studentName: string;
  studentEmail: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  totalClaims: number;
  maxRedemptions?: number;
  claimedAt: Date;
}

interface CouponData {
  _id: string;
  code: string;
  description: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  isActive: boolean;
  approvalStatus: string;
  currentRedemptions: number;
  maxRedemptions?: number;
  totalStudentsClaimedBy: number;
  redemptionPercentage: string | number;
  createdAt: Date;
}

export function VendorCouponClaims() {
  const [coupons, setCoupons] = useState<CouponData[]>([])
  const [totalClaimsToday, setTotalClaimsToday] = useState(0)
  const [recentClaims, setRecentClaims] = useState<CouponClaimInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)

  // Real-time coupon hook
  const { isConnected: rtConnected, requestCouponAnalyticsUpdate } = useRealtimeCoupons(
    // onCouponClaimedUpdated
    (claim) => {
      console.log('New coupon claim received:', claim);
      
      // Add to recent claims
      setRecentClaims(prev => {
        const updated = [
          {
            couponId: claim.couponId,
            couponCode: claim.couponCode,
            studentName: claim.studentName,
            studentEmail: claim.studentEmail,
            discount: claim.discount,
            discountType: claim.discountType,
            totalClaims: claim.totalClaims,
            maxRedemptions: claim.maxRedemptions,
            claimedAt: new Date(claim.claimedAt),
          },
          ...prev
        ];
        // Keep only last 10 claims
        return updated.slice(0, 10);
      });

      // Increment today's count
      setTotalClaimsToday(prev => prev + 1);

      // Update coupons list with new claims count
      setCoupons(prev => 
        prev.map(coupon => 
          coupon._id === claim.couponId 
            ? { ...coupon, currentRedemptions: claim.totalClaims, totalStudentsClaimedBy: claim.totalClaims }
            : coupon
        )
      );
    },
    // onCouponAnalyticsUpdated
    (update) => {
      console.log('Coupon analytics updated:', update.couponsAnalytics);
      setCoupons(update.couponsAnalytics.coupons || []);
      setLoading(false);
    },
    // onConnectionStatusChange
    (connected) => {
      setIsConnected(connected);
      console.log('Coupon WebSocket connection:', connected ? 'Connected' : 'Disconnected');
    }
  );

  // Fetch initial coupon data
  useEffect(() => {
    fetchCoupons();
  }, []);

  // Request real-time update when connected
  useEffect(() => {
    if (rtConnected) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          requestCouponAnalyticsUpdate(user.id);
        } catch (error) {
          console.error('Failed to get vendor ID:', error);
        }
      }
    }
  }, [rtConnected, requestCouponAnalyticsUpdate]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/coupons/my-coupons`, {
        headers: getHeaders(),
      });

      if (!response.ok) throw new Error('Failed to fetch coupons');

      const data = await response.json();
      if (data.success && Array.isArray(data.coupons)) {
        setCoupons(data.coupons);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter(c => c.isActive && c.approvalStatus === 'approved').length;
  const totalCouponClaims = coupons.reduce((sum, c) => sum + (c.currentRedemptions || 0), 0);

  const topCoupons = coupons
    .filter(c => c.approvalStatus === 'approved')
    .sort((a, b) => (b.currentRedemptions || 0) - (a.currentRedemptions || 0))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 rounded-lg"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Ticket className="text-blue-600" size={28} />
            Coupon Claims & Analytics
          </h2>
          <p className="text-gray-600 mt-2">
            Real-time student coupon redemptions
            {isConnected && <span className="ml-2 text-green-600 font-medium">● Live</span>}
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Coupons */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Coupons</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{totalCoupons}</p>
              <p className="text-xs text-gray-600 mt-2">{activeCoupons} active</p>
            </div>
            <Ticket size={32} className="text-blue-600 opacity-40" />
          </div>
        </div>

        {/* Total Claims */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Claims</p>
              <p className="text-3xl font-bold text-green-900 mt-2">{totalCouponClaims}</p>
              <p className="text-xs text-gray-600 mt-2">
                <span className="text-green-600 font-medium">+{totalClaimsToday}</span> today
              </p>
            </div>
            <CheckCircle2 size={32} className="text-green-600 opacity-40" />
          </div>
        </div>

        {/* Claims Per Coupon */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Avg Claims/Coupon</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">
                {totalCoupons > 0 ? (totalCouponClaims / totalCoupons).toFixed(1) : 0}
              </p>
              <p className="text-xs text-gray-600 mt-2">per coupon</p>
            </div>
            <TrendingUp size={32} className="text-purple-600 opacity-40" />
          </div>
        </div>

        {/* Redemption Rate */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Redemption Rate</p>
              <p className="text-3xl font-bold text-orange-900 mt-2">
                {coupons.length > 0 
                  ? ((coupons.filter(c => c.maxRedemptions && c.currentRedemptions >= c.maxRedemptions).length / coupons.length) * 100).toFixed(0)
                  : 0}%
              </p>
              <p className="text-xs text-gray-600 mt-2">coupons fully redeemed</p>
            </div>
            <AlertCircle size={32} className="text-orange-600 opacity-40" />
          </div>
        </div>
      </div>

      {/* Top Performing Coupons */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Top Performing Coupons</h3>
        
        {topCoupons.length > 0 ? (
          <div className="space-y-4">
            {topCoupons.map((coupon, index) => (
              <div 
                key={coupon._id} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg font-bold text-blue-600">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{coupon.code}</p>
                    <p className="text-sm text-gray-600">
                      {coupon.description || 'No description'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {coupon.currentRedemptions || 0}
                  </p>
                  <p className="text-xs text-gray-600">
                    {coupon.maxRedemptions 
                      ? `${coupon.redemptionPercentage}% of ${coupon.maxRedemptions}`
                      : 'Unlimited'}
                  </p>
                  {coupon.maxRedemptions && coupon.currentRedemptions >= coupon.maxRedemptions && (
                    <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                      ✓ Fully Redeemed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Ticket size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">No approved coupons yet</p>
          </div>
        )}
      </div>

      {/* Recent Claims */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Claims</h3>
        
        {recentClaims.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentClaims.map((claim, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-transparent rounded-lg border border-blue-100 animate-in fade-in slide-in-from-top-2"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {claim.studentName}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      Claimed <span className="font-semibold">{claim.couponCode}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right ml-2">
                  <p className="font-semibold text-gray-900">
                    {claim.discountType === 'percentage' ? `${claim.discount}%` : `₹${claim.discount}`}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(claim.claimedAt).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle2 size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">No recent claims</p>
            <p className="text-xs text-gray-400 mt-1">Claims will appear here in real-time</p>
          </div>
        )}
      </div>

      {/* All Coupons List */}
      {coupons.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">All Coupons</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-sm font-semibold text-gray-700 py-3 px-4">Code</th>
                  <th className="text-left text-sm font-semibold text-gray-700 py-3 px-4">Status</th>
                  <th className="text-left text-sm font-semibold text-gray-700 py-3 px-4">Claims</th>
                  <th className="text-left text-sm font-semibold text-gray-700 py-3 px-4">Students</th>
                  <th className="text-left text-sm font-semibold text-gray-700 py-3 px-4">Progress</th>
                  <th className="text-left text-sm font-semibold text-gray-700 py-3 px-4">Discount</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-semibold text-gray-900">{coupon.code}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        coupon.isActive && coupon.approvalStatus === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : coupon.approvalStatus === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {coupon.isActive && coupon.approvalStatus === 'approved' 
                          ? 'Active' 
                          : coupon.approvalStatus === 'pending'
                          ? 'Pending'
                          : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-gray-900">{coupon.currentRedemptions || 0}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-700">{coupon.totalStudentsClaimedBy || 0}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 rounded-full transition-all"
                            style={{ 
                              width: typeof coupon.redemptionPercentage === 'number' 
                                ? `${Math.min(coupon.redemptionPercentage, 100)}%`
                                : '0%'
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600 w-12 text-right">
                          {typeof coupon.redemptionPercentage === 'number'
                            ? `${coupon.redemptionPercentage.toFixed(0)}%`
                            : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-900">
                        {coupon.discountType === 'percentage' 
                          ? `${coupon.discount}%` 
                          : `₹${coupon.discount}`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
