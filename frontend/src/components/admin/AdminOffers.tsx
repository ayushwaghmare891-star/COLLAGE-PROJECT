import { useState, useEffect } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  SearchIcon,
  Loader2Icon,
  AlertCircleIcon,
  EyeIcon,
  TrashIcon,
  Clock
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface OfferData {
  _id: string;
  title: string;
  description: string;
  offerType: 'percentage' | 'fixed';
  offerValue: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  category: string;
  vendor?: {
    _id: string;
    name: string;
    businessName: string;
    email: string;
  };
  vendorId?: {
    _id: string;
    businessName: string;
  };
  createdBy: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  status: 'active' | 'pending' | 'rejected' | 'expired';
  usageCount?: number;
  code: string;
  createdAt: string;
}

export function AdminOffers() {
  const [offers, setOffers] = useState<OfferData[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<OfferData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchOffers();
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    filterOffers();
  }, [offers, searchTerm, statusFilter]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const response = await fetch('http://localhost:5000/api/admin/offers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch offers (${response.status})`);
      }
      
      const data = await response.json();
      setOffers(data.offers || []);
    } catch (error: any) {
      console.error('Fetch offers error:', error);
      toast({
        title: '❌ Error loading offers',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterOffers = () => {
    let filtered = offers;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(o => 
        statusFilter === 'active' ? o.isActive : !o.isActive
      );
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(o => 
        (o.title && o.title.toLowerCase().includes(term)) ||
        (o.description && o.description.toLowerCase().includes(term)) ||
        (o.code && o.code.toLowerCase().includes(term)) ||
        (o.category && o.category.toLowerCase().includes(term)) ||
        (o.vendorId && o.vendorId.businessName && o.vendorId.businessName.toLowerCase().includes(term))
      );
    }

    setFilteredOffers(filtered);
  };

  const handleToggleStatus = async (offerId: string, currentStatus: boolean) => {
    try {
      setProcessingId(offerId);
      const token = localStorage.getItem('auth_token');

      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const response = await fetch(`http://localhost:5000/api/admin/offers/${offerId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update offer status');
      }

      setOffers(offers.map(o => 
        o._id === offerId ? { ...o, isActive: !currentStatus } : o
      ));

      toast({
        title: '✅ Success',
        description: `Offer ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error: any) {
      console.error('Toggle status error:', error);
      toast({
        title: '❌ Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    if (!confirm('Are you sure you want to delete this offer? This action cannot be undone.')) {
      return;
    }

    try {
      setProcessingId(offerId);
      const token = localStorage.getItem('auth_token');

      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const response = await fetch(`http://localhost:5000/api/admin/offers/${offerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete offer');
      }

      setOffers(offers.filter(o => o._id !== offerId));

      toast({
        title: '✅ Success',
        description: 'Offer deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete offer error:', error);
      toast({
        title: '❌ Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveOffer = async (offerId: string) => {
    try {
      setProcessingId(offerId);
      const token = localStorage.getItem('auth_token');

      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const response = await fetch(`http://localhost:5000/api/offers/admin/approve/${offerId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to approve offer');
      }

      setOffers(offers.map(o => 
        o._id === offerId ? { ...o, status: 'active', isActive: true } : o
      ));

      toast({
        title: '✅ Success',
        description: 'Offer approved and is now visible to students',
      });
    } catch (error: any) {
      console.error('Approve offer error:', error);
      toast({
        title: '❌ Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    try {
      setProcessingId(offerId);
      const token = localStorage.getItem('auth_token');

      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const response = await fetch(`http://localhost:5000/api/offers/admin/reject/${offerId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to reject offer');
      }

      setOffers(offers.map(o => 
        o._id === offerId ? { ...o, status: 'rejected', isActive: false } : o
      ));

      toast({
        title: '✅ Success',
        description: 'Offer rejected and removed from student view',
      });
    } catch (error: any) {
      console.error('Reject offer error:', error);
      toast({
        title: '❌ Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2Icon className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading offers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header - Student Inspired */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center text-2xl shadow-md">
            💸
          </div>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Manage Offers
            </h1>
            <p className="text-gray-600 mt-2">
              Monitor and manage all vendor discount offers on the platform
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards - Clean Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 hover:shadow-md hover:border-blue-300 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md">
              <EyeIcon className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <p className="text-gray-600 text-xs font-medium uppercase tracking-wide">Total Offers</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{offers.length}</p>
          <p className="text-xs text-gray-500 mt-1">All offers on platform</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 hover:shadow-md hover:border-yellow-300 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center shadow-md">
              <AlertCircleIcon className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <p className="text-gray-600 text-xs font-medium uppercase tracking-wide">Pending</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{offers.filter(o => o.status === 'pending').length}</p>
          <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 hover:shadow-md hover:border-green-300 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-md">
              <span className="text-lg">✓</span>
            </div>
            <p className="text-gray-600 text-xs font-medium uppercase tracking-wide">Active</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{offers.filter(o => o.status === 'active').length}</p>
          <p className="text-xs text-gray-500 mt-1">Currently live</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 hover:shadow-md hover:border-orange-300 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center shadow-md">
              <Clock className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <p className="text-gray-600 text-xs font-medium uppercase tracking-wide">Expiring Soon</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {offers.filter(o => {
              const daysLeft = Math.ceil((new Date(o.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              return daysLeft >= 0 && daysLeft <= 7;
            }).length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Expiring in 7 days</p>
        </div>
      </div>

      {/* Search and Filter - Clean Layout */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Search & Filter</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, vendor, code, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Offers List - Card View */}
      {filteredOffers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <AlertCircleIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 text-lg">No offers found</p>
          <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOffers.map((offer) => {
            return (
              <div key={offer._id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-orange-300 transition-all overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    {/* Offer Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-lg">🏷️</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{offer.title}</h3>
                          <p className="text-xs text-gray-600">{offer.description}</p>
                        </div>
                      </div>
                    </div>
                    {/* Badge */}
                    <Badge className={`${offer.isActive ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-gray-100 text-gray-800 border border-gray-300'}`}>
                      {offer.isActive ? '✓ Active' : '○ Inactive'}
                    </Badge>
                  </div>

                  {/* Offer Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-4 pb-4 border-b border-gray-100">
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-1 uppercase">Discount</p>
                      <p className="text-xl font-bold text-orange-600">
                        {offer.discountType === 'percentage' ? `${offer.discount}%` : `₹${offer.discount}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-1 uppercase">Code</p>
                      <p className="text-sm font-mono font-semibold text-gray-900 bg-gray-50 px-2 py-1 rounded">{offer.code}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-1 uppercase">Category</p>
                      <Badge variant="outline" className="text-xs">{offer.category}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-1 uppercase">Vendor</p>
                      <p className="text-sm text-gray-900">{offer.vendor?.businessName || offer.vendorId?.businessName || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-1 uppercase">Approval</p>
                      <Badge className={`text-xs ${
                        offer.status === 'active' ? 'bg-green-100 text-green-800' :
                        offer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        offer.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {offer.status === 'active' ? '✓ Approved' :
                         offer.status === 'pending' ? '⏳ Pending' :
                         offer.status === 'rejected' ? '✕ Rejected' :
                         'Unknown'}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-gray-500">
                      Created: {new Date(offer.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {offer.status === 'pending' ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApproveOffer(offer._id)}
                            disabled={processingId === offer._id}
                            className="text-xs bg-green-600 text-white hover:bg-green-700"
                          >
                            {processingId === offer._id ? (
                              <>
                                <Loader2Icon className="w-3 h-3 animate-spin mr-1" />
                                Approving...
                              </>
                            ) : (
                              '✓ Approve'
                            )}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleRejectOffer(offer._id)}
                            disabled={processingId === offer._id}
                            className="text-xs bg-red-600 text-white hover:bg-red-700"
                          >
                            {processingId === offer._id ? (
                              <>
                                <Loader2Icon className="w-3 h-3 animate-spin mr-1" />
                                Rejecting...
                              </>
                            ) : (
                              '✕ Reject'
                            )}
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleToggleStatus(offer._id, offer.isActive)}
                          disabled={processingId === offer._id}
                          className={`text-xs ${
                            offer.isActive
                              ? 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {processingId === offer._id ? (
                            <>
                              <Loader2Icon className="w-3 h-3 animate-spin mr-1" />
                              {offer.isActive ? 'Deactivating...' : 'Activating...'}
                            </>
                          ) : offer.isActive ? (
                            'Deactivate'
                          ) : (
                            'Activate'
                          )}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteOffer(offer._id)}
                        disabled={processingId === offer._id}
                        className="text-xs"
                      >
                        {processingId === offer._id ? (
                          <>
                            <Loader2Icon className="w-3 h-3 animate-spin mr-1" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <TrashIcon className="w-3 h-3 mr-1" />
                            Delete
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
