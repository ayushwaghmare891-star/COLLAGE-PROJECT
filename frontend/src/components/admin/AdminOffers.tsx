import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
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
  category: string;
  vendorId: {
    _id: string;
    businessName: string;
  };
  createdBy: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
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

  const getExpiringStatus = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return { label: 'Expired', color: 'bg-red-500/20 text-red-700' };
    if (daysLeft <= 3) return { label: `${daysLeft}d left`, color: 'bg-orange-500/20 text-orange-700' };
    if (daysLeft <= 7) return { label: `${daysLeft}d left`, color: 'bg-yellow-500/20 text-yellow-700' };
    return { label: `${daysLeft}d left`, color: 'bg-green-500/20 text-green-700' };
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
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 rounded-2xl px-8 py-12 text-white shadow-2xl border border-purple-800/50">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">
          Manage Offers 💸
        </h1>
        <p className="text-purple-200 text-lg">
          Monitor and manage all vendor discount offers on the platform
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0 shadow-lg">
          <CardContent className="pt-6">
            <p className="text-white/80 text-sm font-medium mb-1">Total Offers</p>
            <p className="text-3xl font-bold text-white mb-2">{offers.length}</p>
            <p className="text-white/70 text-xs">All offers on platform</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-600 to-green-700 border-0 shadow-lg">
          <CardContent className="pt-6">
            <p className="text-white/80 text-sm font-medium mb-1">Active Offers</p>
            <p className="text-3xl font-bold text-white mb-2">{offers.filter(o => o.isActive).length}</p>
            <p className="text-white/70 text-xs">Currently live</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-600 to-orange-700 border-0 shadow-lg">
          <CardContent className="pt-6">
            <p className="text-white/80 text-sm font-medium mb-1">Expiring Soon</p>
            <p className="text-3xl font-bold text-white mb-2">
              {offers.filter(o => {
                const daysLeft = Math.ceil((new Date(o.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                return daysLeft >= 0 && daysLeft <= 7;
              }).length}
            </p>
            <p className="text-white/70 text-xs">Within 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title, vendor, code, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Status</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>

      {/* Offers List */}
      {filteredOffers.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircleIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">No offers found</p>
          <p className="text-muted-foreground text-sm mt-2">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredOffers.map((offer) => {
            const expiringStatus = getExpiringStatus(offer.endDate);
            return (
              <Card key={offer._id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">{offer.title}</h3>
                        <Badge variant={offer.isActive ? 'default' : 'secondary'}>
                          {offer.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{offer.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Discount</p>
                      <p className="text-lg font-bold text-primary">
                        {offer.offerType === 'percentage' ? `${offer.offerValue}%` : `$${offer.offerValue}`} off
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Code</p>
                      <p className="text-sm font-mono font-semibold text-foreground">{offer.code}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Category</p>
                      <Badge variant="outline">{offer.category}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Students Redeemed</p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">{offer.studentRedemptionCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Vendor</p>
                      <p className="text-sm text-foreground">{offer.vendorId?.businessName || 'Unknown'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className={`text-sm font-medium px-2 py-1 rounded ${expiringStatus.color}`}>
                      {expiringStatus.label}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      Created: {new Date(offer.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      size="sm"
                      variant={offer.isActive ? 'outline' : 'default'}
                      onClick={() => handleToggleStatus(offer._id, offer.isActive)}
                      disabled={processingId === offer._id}
                    >
                      {processingId === offer._id ? (
                        <Loader2Icon className="w-4 h-4 animate-spin" />
                      ) : offer.isActive ? (
                        'Deactivate'
                      ) : (
                        'Activate'
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteOffer(offer._id)}
                      disabled={processingId === offer._id}
                    >
                      {processingId === offer._id ? (
                        <Loader2Icon className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <TrashIcon className="w-4 h-4 mr-2" />
                          Delete
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
