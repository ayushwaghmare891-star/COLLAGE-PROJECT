import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  BuildingIcon, 
  SearchIcon, 
  TrashIcon,
  MailIcon,
  CalendarIcon,
  CheckCircleIcon
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface Vendor {
  _id: string;
  businessName: string;
  email: string;
  ownerFirstName: string;
  ownerLastName: string;
  isEmailVerified: boolean;
  status: string;
  createdAt: string;
}

export function AdminVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchVendors();
    window.scrollTo(0, 0);
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const response = await fetch('http://localhost:5000/api/admin/vendors', {
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
        throw new Error(errorData.message || `Failed to fetch vendors (${response.status})`);
      }
      
      const data = await response.json();
      setVendors(data.vendors || []);
    } catch (error: any) {
      console.error('Fetch vendors error:', error);
      toast({
        title: '❌ Error loading vendors',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVendor = async (id: string, name: string) => {
    if (!window.confirm(`Delete ${name}? This action cannot be undone.`)) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete vendor');

      setVendors(vendors.filter(v => v._id !== id));
      toast({
        title: '✅ Vendor deleted',
        description: `${name} has been removed`,
      });
    } catch (error: any) {
      toast({
        title: '❌ Error deleting vendor',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${vendor.ownerFirstName} ${vendor.ownerLastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'active') return matchesSearch && vendor.status === 'active';
    if (statusFilter === 'inactive') return matchesSearch && vendor.status === 'inactive';
    return matchesSearch;
  });

  const stats = {
    total: vendors.length,
    active: vendors.filter(v => v.status === 'active').length,
    verified: vendors.filter(v => v.isEmailVerified).length,
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-purple-900 rounded-2xl px-8 py-12 text-white shadow-2xl border border-purple-800/50">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">
            <BuildingIcon className="w-7 h-7 text-purple-200" strokeWidth={2} />
          </div>
          <h1 className="text-4xl font-bold">Vendors</h1>
        </div>
        <p className="text-purple-200 text-lg">
          Manage vendor accounts and monitor store activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-600 to-purple-700 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Total Vendors</p>
                <p className="text-4xl font-bold">{stats.total}</p>
              </div>
              <BuildingIcon className="w-12 h-12 text-purple-300 opacity-30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-600 to-emerald-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">Active Vendors</p>
                <p className="text-4xl font-bold">{stats.active}</p>
              </div>
              <CheckCircleIcon className="w-12 h-12 text-green-300 opacity-30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Verified</p>
                <p className="text-4xl font-bold">{stats.verified}</p>
              </div>
              <CheckCircleIcon className="w-12 h-12 text-blue-300 opacity-30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-2xl">
          <CardTitle className="text-white">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by business name, email, or owner name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Vendors</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Vendors List */}
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-2xl pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">
                Vendor Accounts ({filteredVendors.length})
              </CardTitle>
              <CardDescription className="text-purple-100">
                {loading ? 'Loading vendors...' : `Showing ${filteredVendors.length} of ${vendors.length} vendors`}
              </CardDescription>
            </div>
            <BuildingIcon className="w-8 h-8 text-purple-200 opacity-50" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-500">Loading vendor data...</p>
            </div>
          ) : filteredVendors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <BuildingIcon className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">
                {searchTerm || statusFilter !== 'all' ? 'No vendors found' : 'No vendors yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Verification</th>
                    <th className="text-left py-3 px-4 font-semibold">Joined</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVendors.map((vendor) => (
                    <tr key={vendor._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium">{vendor.firstName} {vendor.lastName}</p>
                          <p className="text-sm text-gray-500">{vendor.businessName}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <MailIcon className="w-4 h-4 text-gray-400" />
                          <a href={`mailto:${vendor.email}`} className="text-blue-600 hover:underline text-sm">
                            {vendor.email}
                          </a>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {vendor.status === 'active' ? (
                          <Badge className="bg-green-600 text-white">🟢 Active</Badge>
                        ) : (
                          <Badge className="bg-gray-600 text-white">⚫ Inactive</Badge>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {vendor.isEmailVerified ? (
                          <Badge className="bg-blue-600 text-white">✅ Verified</Badge>
                        ) : (
                          <Badge className="bg-orange-600 text-white">⏳ Pending</Badge>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <CalendarIcon className="w-4 h-4" />
                          {new Date(vendor.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteVendor(vendor._id, `${vendor.firstName} ${vendor.lastName}`)}
                          className="flex items-center gap-2"
                        >
                          <TrashIcon className="w-4 h-4" />
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
