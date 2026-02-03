import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useToast } from '@/hooks/use-toast';
import { getHeaders, API_BASE_URL } from '@/lib/api';

interface Vendor {
  _id: string;
  email: string;
  name: string;
  businessName: string;
  businessType: string;
  mobileNumber: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  verificationStatus: 'pending' | 'verified' | 'rejected';
  isActive: boolean;
  isSuspended: boolean;
  businessDocumentUrl?: string;
  createdAt: string;
}

interface VendorStats {
  totalVendors: number;
  approvedVendors: number;
  pendingVendors: number;
  rejectedVendors: number;
  verifiedVendors: number;
  suspendedVendors: number;
}

type ActionType = 'approve' | 'reject' | 'suspend' | 'activate' | 'verify' | null;

export function AdminVendorManagement() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [actionType, setActionType] = useState<ActionType>(null);
  const [remarks, setRemarks] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Fetch vendors on mount and when filters change
  useEffect(() => {
    fetchVendors();
    fetchStats();
  }, [filterStatus, searchTerm]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filterStatus !== 'all') {
        if (filterStatus.startsWith('approval-')) {
          params.append('approvalStatus', filterStatus.replace('approval-', ''));
        } else if (filterStatus.startsWith('verification-')) {
          params.append('verificationStatus', filterStatus.replace('verification-', ''));
        }
      }
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`${API_BASE_URL}/admin/vendors?${params.toString()}`, {
        headers: getHeaders(),
      });

      if (!response.ok) throw new Error('Failed to fetch vendors');
      
      const data = await response.json();
      if (data.success) {
        setVendors(data.data);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch vendors',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/vendors/stats`, {
        headers: getHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch vendor stats:', error);
    }
  };

  const handleAction = async () => {
    if (!selectedVendor || !actionType) return;

    try {
      let endpoint = '';
      let data: any = {};

      switch (actionType) {
        case 'approve':
          endpoint = `/admin/vendors/${selectedVendor._id}/approve`;
          data = { remarks };
          break;
        case 'reject':
          endpoint = `/admin/vendors/${selectedVendor._id}/reject`;
          data = { remarks };
          break;
        case 'suspend':
          endpoint = `/admin/vendors/${selectedVendor._id}/suspend`;
          data = { reason: remarks };
          break;
        case 'activate':
          endpoint = `/admin/vendors/${selectedVendor._id}/activate`;
          break;
        case 'verify':
          endpoint = `/admin/vendors/${selectedVendor._id}/verify`;
          data = { verificationStatus: remarks, remarks: 'Verified by admin' };
          break;
        default:
          return;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to perform action');

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'Success',
          description: `Vendor ${actionType} successfully`,
        });
        
        // Update vendor in list
        setVendors(vendors.map((v: Vendor) => v._id === selectedVendor._id ? result.data : v));
        
        // Reset dialog
        setSelectedVendor(null);
        setActionType(null);
        setRemarks('');
        
        // Refresh stats
        fetchStats();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to perform action',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const getActionButtons = (vendor: Vendor) => {
    const buttons = [];

    // Approval actions
    if (vendor.approvalStatus === 'pending') {
      buttons.push(
        <Button
          key="approve"
          size="sm"
          variant="outline"
          className="text-green-600 hover:text-green-700"
          onClick={() => {
            setSelectedVendor(vendor);
            setActionType('approve');
          }}
        >
          Approve
        </Button>
      );
      buttons.push(
        <Button
          key="reject"
          size="sm"
          variant="outline"
          className="text-red-600 hover:text-red-700"
          onClick={() => {
            setSelectedVendor(vendor);
            setActionType('reject');
          }}
        >
          Reject
        </Button>
      );
    }

    // Suspension actions
    if (!vendor.isSuspended && vendor.approvalStatus === 'approved') {
      buttons.push(
        <Button
          key="suspend"
          size="sm"
          variant="outline"
          className="text-orange-600 hover:text-orange-700"
          onClick={() => {
            setSelectedVendor(vendor);
            setActionType('suspend');
          }}
        >
          Suspend
        </Button>
      );
    }

    if (vendor.isSuspended) {
      buttons.push(
        <Button
          key="activate"
          size="sm"
          variant="outline"
          className="text-blue-600 hover:text-blue-700"
          onClick={() => {
            setSelectedVendor(vendor);
            setActionType('activate');
          }}
        >
          Activate
        </Button>
      );
    }

    // Document verification
    if (vendor.verificationStatus === 'pending' && vendor.businessDocumentUrl) {
      buttons.push(
        <Button
          key="view-docs"
          size="sm"
          variant="outline"
          onClick={() => window.open(vendor.businessDocumentUrl, '_blank')}
        >
          View Docs
        </Button>
      );
    }

    return buttons;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVendors}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingVendors}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approvedVendors}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejectedVendors}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.verifiedVendors}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.suspendedVendors}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex gap-4 flex-wrap">
        <Input
          placeholder="Search by email, name, or business..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[200px]"
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Vendors</SelectItem>
            <SelectItem value="approval-pending">Approval Pending</SelectItem>
            <SelectItem value="approval-approved">Approved</SelectItem>
            <SelectItem value="approval-rejected">Rejected</SelectItem>
            <SelectItem value="verification-pending">Verification Pending</SelectItem>
            <SelectItem value="verification-verified">Verified</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Vendors List */}
      <Card>
        <CardHeader>
          <CardTitle>All Vendors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {vendors.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                {loading ? 'Loading vendors...' : 'No vendors found'}
              </div>
            ) : (
              vendors.map((vendor) => (
                <div
                  key={vendor._id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900">{vendor.businessName}</div>
                    <div className="text-sm text-gray-600">{vendor.email}</div>
                    <div className="text-sm text-gray-600">{vendor.mobileNumber}</div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {getStatusBadge(vendor.approvalStatus)}
                    {getStatusBadge(vendor.verificationStatus)}
                    {vendor.isSuspended ? (
                      <Badge className="bg-red-100 text-red-800">Suspended</Badge>
                    ) : vendor.isActive ? (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {getActionButtons(vendor)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog
        open={!!actionType}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setActionType(null);
            setRemarks('');
            setSelectedVendor(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType && selectedVendor && `${actionType.charAt(0).toUpperCase() + actionType.slice(1)} Vendor`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedVendor && (
              <>
                <div>
                  <p className="text-sm font-medium">Business Name</p>
                  <p className="text-gray-600">{selectedVendor.businessName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-gray-600">{selectedVendor.email}</p>
                </div>
              </>
            )}

            {actionType === 'verify' ? (
              <div>
                <Label className="block text-sm font-medium mb-2">Verification Status</Label>
                <Select value={remarks} onValueChange={setRemarks}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <Label className="block text-sm font-medium mb-2">
                  {actionType === 'suspend' ? 'Reason for Suspension' : 'Remarks'}
                </Label>
                <textarea
                  placeholder="Enter your remarks..."
                  value={remarks}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRemarks(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActionType(null);
                setRemarks('');
                setSelectedVendor(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAction}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
