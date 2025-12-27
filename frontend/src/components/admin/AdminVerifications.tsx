import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  CheckCircleIcon, 
  XCircleIcon,
  SearchIcon,
  Loader2Icon,
  AlertCircleIcon,
  FileIcon,
  DownloadIcon,
  Clock
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface PendingVerification {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  studentIdDocument?: string;
  studentIdFileName?: string;
  studentIdUploadedAt?: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export function AdminVerifications() {
  const [verifications, setVerifications] = useState<PendingVerification[]>([]);
  const [filteredVerifications, setFilteredVerifications] = useState<PendingVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchVerifications();
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    filterVerifications();
  }, [verifications, searchTerm, statusFilter]);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const response = await fetch('http://localhost:5000/api/admin/pending-verifications', {
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
        throw new Error(errorData.message || `Failed to fetch verifications (${response.status})`);
      }
      
      const data = await response.json();
      setVerifications(data.verifications || []);
    } catch (error: any) {
      console.error('Fetch verifications error:', error);
      toast({
        title: '❌ Error loading verifications',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterVerifications = () => {
    let filtered = verifications;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(v => v.status === statusFilter);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(v => 
        v.username?.toLowerCase().includes(term) ||
        v.email?.toLowerCase().includes(term) ||
        v.firstName?.toLowerCase().includes(term) ||
        v.lastName?.toLowerCase().includes(term)
      );
    }

    setFilteredVerifications(filtered);
  };

  const handleApproveVerification = async (id: string, name: string) => {
    if (!window.confirm(`Approve verification for ${name}?`)) return;

    try {
      setProcessingId(id);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`http://localhost:5000/api/verification/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to approve verification');
      }

      setVerifications(verifications.map(v => 
        v._id === id ? { ...v, status: 'approved' } : v
      ));

      toast({
        title: '✅ Verification approved',
        description: `${name}'s verification has been approved`,
      });
    } catch (error: any) {
      toast({
        title: '❌ Error approving verification',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectVerification = async (id: string, name: string) => {
    const reason = prompt(`Enter rejection reason for ${name}:`);
    if (!reason) return;

    try {
      setProcessingId(id);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`http://localhost:5000/api/verification/${id}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to reject verification');
      }

      setVerifications(verifications.map(v => 
        v._id === id ? { ...v, status: 'rejected' } : v
      ));

      toast({
        title: '✅ Verification rejected',
        description: `${name}'s verification has been rejected`,
      });
    } catch (error: any) {
      toast({
        title: '❌ Error rejecting verification',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-700 border-green-300">✅ Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-700 border-red-300">❌ Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-300">⏳ Pending</Badge>;
    }
  };

  const getStatusStats = () => {
    const pending = verifications.filter(v => v.status === 'pending').length;
    const approved = verifications.filter(v => v.status === 'approved').length;
    const rejected = verifications.filter(v => v.status === 'rejected').length;
    
    return { pending, approved, rejected };
  };

  const stats = getStatusStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin mb-4">
            <Loader2Icon className="w-8 h-8 text-indigo-600" />
          </div>
          <p className="text-gray-600">Loading verifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">📋 Verifications</h1>
        <p className="text-gray-600">Manage and review student verifications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Approved</p>
                <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircleIcon className="w-10 h-10 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Rejected</p>
                <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircleIcon className="w-10 h-10 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 flex-1">
              <SearchIcon className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'pending', 'approved', 'rejected'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Verifications List */}
      <div className="space-y-4">
        {filteredVerifications.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="pt-12 pb-12 text-center">
              <AlertCircleIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No verifications found</p>
              <p className="text-gray-500 text-sm">
                {searchTerm ? 'Try adjusting your search filters' : 'All verifications have been processed'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredVerifications.map((verification) => (
            <Card key={verification._id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Left Section - User Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {verification.firstName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {verification.firstName} {verification.lastName}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">{verification.email}</p>
                        <p className="text-xs text-gray-500 mt-1">@{verification.username}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <span className="px-2 py-1 bg-gray-100 rounded">
                            {verification.userType || 'Student'}
                          </span>
                          {verification.studentIdUploadedAt && (
                            <span className="flex items-center gap-1">
                              <FileIcon className="w-3 h-3" />
                              Uploaded {new Date(verification.studentIdUploadedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Middle Section - Status & Document */}
                  <div className="flex flex-col items-start md:items-end gap-3">
                    <div>
                      {getStatusBadge(verification.status)}
                    </div>
                    {verification.studentIdDocument && (
                      <a
                        href={`http://localhost:5000${verification.studentIdDocument}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 hover:underline"
                      >
                        <DownloadIcon className="w-4 h-4" />
                        View Document
                      </a>
                    )}
                  </div>

                  {/* Right Section - Actions */}
                  {verification.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApproveVerification(
                          verification._id,
                          `${verification.firstName} ${verification.lastName}`
                        )}
                        disabled={processingId === verification._id}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {processingId === verification._id ? 'Approving...' : '✅ Approve'}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleRejectVerification(
                          verification._id,
                          `${verification.firstName} ${verification.lastName}`
                        )}
                        disabled={processingId === verification._id}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        {processingId === verification._id ? 'Rejecting...' : '❌ Reject'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
