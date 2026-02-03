import { useState, useEffect } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  SearchIcon,
  Loader2Icon,
  AlertCircleIcon,
  CheckCircle2Icon,
  XCircleIcon,
  Clock,
  Trash2
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { deleteCouponAdmin } from '../../lib/adminAPI';

interface CouponData {
  _id: string;
  code: string;
  description: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  category?: string;
  vendor?: {
    _id: string;
    name: string;
    businessName: string;
    email: string;
  };
  approvalStatus: 'pending' | 'approved' | 'rejected';
  startDate?: string;
  endDate?: string;
  maxRedemptions?: number;
  currentRedemptions?: number;
  isActive: boolean;
  createdAt: string;
  rejectionReason?: string;
}

export function AdminCoupons() {
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<CouponData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [selectedCouponId, setSelectedCouponId] = useState<string | null>(null);
  const { toast } = useToast();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Fetch coupons
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE_URL}/admin/coupons/all`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch coupons');
        }

        const data = await response.json();
        setCoupons(data.coupons || []);
        setFilteredCoupons(data.coupons || []);
      } catch (error) {
        console.error('Error fetching coupons:', error);
        toast({
          title: '❌ Error',
          description: 'Failed to fetch coupons',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  // Filter coupons
  useEffect(() => {
    let filtered = coupons;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.approvalStatus === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.vendor?.businessName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCoupons(filtered);
  }, [coupons, statusFilter, searchTerm]);

  // Approve coupon
  const handleApproveCoupon = async (couponId: string) => {
    try {
      setProcessingId(couponId);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/admin/coupons/${couponId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to approve coupon');
      }

      const data = await response.json();
      
      // Update local state
      setCoupons(prev =>
        prev.map(c => (c._id === couponId ? { ...c, approvalStatus: 'approved' } : c))
      );

      toast({
        title: '✅ Success',
        description: `Coupon ${data.coupon.code} approved successfully`,
      });
    } catch (error) {
      console.error('Error approving coupon:', error);
      toast({
        title: '❌ Error',
        description: 'Failed to approve coupon',
      });
    } finally {
      setProcessingId(null);
    }
  };

  // Reject coupon
  const handleRejectCoupon = async (couponId: string) => {
    try {
      setProcessingId(couponId);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/admin/coupons/${couponId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rejectionReason: rejectionReason || 'Rejected by admin',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject coupon');
      }

      const data = await response.json();

      // Update local state
      setCoupons(prev =>
        prev.map(c =>
          c._id === couponId
            ? {
                ...c,
                approvalStatus: 'rejected',
                rejectionReason: data.coupon.rejectionReason,
              }
            : c
        )
      );

      setRejectionReason('');
      setSelectedCouponId(null);

      toast({
        title: '✅ Success',
        description: `Coupon ${data.coupon.code} rejected`,
      });
    } catch (error) {
      console.error('Error rejecting coupon:', error);
      toast({
        title: '❌ Error',
        description: 'Failed to reject coupon',
      });
    } finally {
      setProcessingId(null);
    }
  };

  // Delete coupon
  const handleDeleteCoupon = async (couponId: string, couponCode: string) => {
    if (!window.confirm(`Are you sure you want to delete coupon "${couponCode}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setProcessingId(couponId);
      await deleteCouponAdmin(couponId);
      
      // Update local state
      setCoupons(prev => prev.filter(c => c._id !== couponId));

      toast({
        title: '✅ Success',
        description: `Coupon ${couponCode} deleted successfully`,
      });
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast({
        title: '❌ Error',
        description: 'Failed to delete coupon',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle2Icon className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircleIcon className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2Icon className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Coupon Approvals</h2>
          <p className="text-gray-600 mt-1">Manage and approve vendor coupons</p>
        </div>
        <Badge className="w-fit bg-blue-100 text-blue-700">
          {coupons.filter(c => c.approvalStatus === 'pending').length} Pending
        </Badge>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by code, description, or vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Coupons Table */}
      {filteredCoupons.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No coupons found</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Code</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Vendor</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Discount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Created</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.map((coupon) => (
                <tr key={coupon._id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono font-semibold text-gray-900">{coupon.code}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{coupon.description || '-'}</td>
                  <td className="px-6 py-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{coupon.vendor?.businessName || 'Unknown'}</p>
                      <p className="text-gray-500 text-xs">{coupon.vendor?.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    {coupon.discount}{coupon.discountType === 'percentage' ? '%' : ' USD'}
                  </td>
                  <td className="px-6 py-4 text-sm">{getStatusBadge(coupon.approvalStatus)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(coupon.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm space-y-2">
                    {coupon.approvalStatus === 'pending' ? (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApproveCoupon(coupon._id)}
                          disabled={processingId === coupon._id}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1"
                        >
                          {processingId === coupon._id ? (
                            <Loader2Icon className="w-3 h-3 animate-spin" />
                          ) : (
                            <CheckCircle2Icon className="w-3 h-3 mr-1" />
                          )}
                          Approve
                        </Button>
                        <Button
                          onClick={() => setSelectedCouponId(coupon._id)}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1"
                        >
                          <XCircleIcon className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                        <Button
                          onClick={() => handleDeleteCoupon(coupon._id, coupon.code)}
                          disabled={processingId === coupon._id}
                          className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-2 py-1"
                          title="Delete coupon"
                        >
                          {processingId === coupon._id ? (
                            <Loader2Icon className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2 items-center">
                        <p className="text-gray-500 text-xs flex-1">
                          {coupon.approvalStatus === 'approved' ? '✅ Approved' : '❌ Rejected'}
                        </p>
                        <Button
                          onClick={() => handleDeleteCoupon(coupon._id, coupon.code)}
                          disabled={processingId === coupon._id}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1"
                          title="Delete coupon"
                        >
                          {processingId === coupon._id ? (
                            <Loader2Icon className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Rejection Modal */}
      {selectedCouponId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Reject Coupon</h3>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                rows={4}
              />
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setSelectedCouponId(null);
                    setRejectionReason('');
                  }}
                  className="flex-1 bg-gray-200 text-gray-900 hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleRejectCoupon(selectedCouponId)}
                  disabled={processingId === selectedCouponId}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {processingId === selectedCouponId ? (
                    <Loader2Icon className="w-4 h-4 animate-spin" />
                  ) : (
                    'Reject'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
