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
  Clock,
  XIcon,
  FileCheckIcon
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface VerificationDocument {
  _id: string;
  documentType: string;
  documentPath: string;
  documentFileName: string;
  documentSize: number;
  mimeType: string;
  uploadedAt: string;
  status: string;
}

interface PendingVerification {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  type: string;
  studentIdDocument?: string;
  studentIdFileName?: string;
  studentIdUploadedAt?: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  verificationDocument?: VerificationDocument;
}

export function AdminVerifications() {
  const [verifications, setVerifications] = useState<PendingVerification[]>([]);
  const [filteredVerifications, setFilteredVerifications] = useState<PendingVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<VerificationDocument | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
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

  const formatDocumentType = (docType: string) => {
    const typeMap: { [key: string]: string } = {
      'student-id': '🎓 Student ID',
      'business-license': '📋 Business License',
      'aadhar': '🆔 Aadhar Card',
      'pan': '📝 PAN Card',
      'passport': '🛂 Passport',
      'other': '📄 Other Document'
    };
    return typeMap[docType] || docType;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleViewDocument = (doc: VerificationDocument) => {
    setSelectedDocument(doc);
    setShowDocumentModal(true);
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

  const handleApproveAll = async () => {
    const pendingCount = verifications.filter(v => v.status === 'pending').length;
    
    if (pendingCount === 0) {
      toast({
        title: '❌ No pending verifications',
        description: 'All verifications have already been processed',
        variant: 'destructive',
      });
      return;
    }

    if (!window.confirm(`Approve all ${pendingCount} pending verification(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      setProcessingId('all');
      const token = localStorage.getItem('auth_token');
      const pendingVerifications = verifications.filter(v => v.status === 'pending');
      
      let approved = 0;
      let failed = 0;

      for (const verification of pendingVerifications) {
        try {
          const response = await fetch(`http://localhost:5000/api/verification/${verification._id}/approve`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            approved++;
          } else {
            failed++;
          }
        } catch (error) {
          failed++;
        }
      }

      // Refresh the list
      await fetchVerifications();

      toast({
        title: '✅ Bulk approval complete',
        description: `${approved} approved, ${failed} failed`,
      });
    } catch (error: any) {
      toast({
        title: '❌ Error approving verifications',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusStats = () => {
    const pending = verifications.filter(v => v.status === 'pending').length;
    const approved = verifications.filter(v => v.status === 'approved').length;
    const rejected = verifications.filter(v => v.status === 'rejected').length;
    
    return { pending, approved, rejected };
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
            <div className="flex gap-2 flex-wrap items-center justify-between">
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
              {stats.pending > 0 && (
                <Button
                  onClick={handleApproveAll}
                  disabled={processingId === 'all'}
                  className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap"
                >
                  {processingId === 'all' ? '⏳ Approving All...' : `✅ Approve All (${stats.pending})`}
                </Button>
              )}
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

                  {/* Middle Section - Status & Document Details */}
                  <div className="flex flex-col items-start md:items-center gap-3 flex-1">
                    <div>
                      {getStatusBadge(verification.status)}
                    </div>
                    {verification.verificationDocument && (
                      <div className="bg-blue-50 rounded-lg p-3 w-full md:w-auto">
                        <div className="flex items-center gap-2 mb-2">
                          <FileCheckIcon className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">
                            {formatDocumentType(verification.verificationDocument.documentType)}
                          </span>
                        </div>
                        <div className="text-xs text-blue-700 space-y-1">
                          <p>📄 {verification.verificationDocument.documentFileName}</p>
                          <p>📊 {formatFileSize(verification.verificationDocument.documentSize)}</p>
                          <p>📅 {new Date(verification.verificationDocument.uploadedAt).toLocaleDateString()}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleViewDocument(verification.verificationDocument!)}
                          className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs"
                        >
                          <FileIcon className="w-3 h-3 mr-1" />
                          Check Document
                        </Button>
                      </div>
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

      {/* Document Details Modal */}
      {showDocumentModal && selectedDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b flex flex-row items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">📄 Document Details</h2>
                <p className="text-sm text-gray-600 mt-1">{formatDocumentType(selectedDocument.documentType)}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowDocumentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XIcon className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* Document Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 font-medium mb-1">Document Type</p>
                  <p className="text-sm font-semibold text-gray-900">{formatDocumentType(selectedDocument.documentType)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 font-medium mb-1">File Name</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">{selectedDocument.documentFileName}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 font-medium mb-1">File Size</p>
                  <p className="text-sm font-semibold text-gray-900">{formatFileSize(selectedDocument.documentSize)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 font-medium mb-1">Uploaded Date</p>
                  <p className="text-sm font-semibold text-gray-900">{new Date(selectedDocument.uploadedAt).toLocaleDateString()}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 font-medium mb-1">MIME Type</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedDocument.mimeType}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 font-medium mb-1">Status</p>
                  <Badge className={`${
                    selectedDocument.status === 'verified' 
                      ? 'bg-green-500/20 text-green-700 border-green-300'
                      : selectedDocument.status === 'rejected'
                      ? 'bg-red-500/20 text-red-700 border-red-300'
                      : 'bg-yellow-500/20 text-yellow-700 border-yellow-300'
                  }`}>
                    {selectedDocument.status === 'verified' ? '✅ Verified' : selectedDocument.status === 'rejected' ? '❌ Rejected' : '⏳ Pending'}
                  </Badge>
                </div>
              </div>

              {/* Document Preview */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="text-sm font-medium text-gray-900 mb-3">📸 Document Preview</p>
                {selectedDocument.mimeType.startsWith('image/') ? (
                  <img
                    src={`http://localhost:5000${selectedDocument.documentPath}`}
                    alt="Document Preview"
                    className="w-full h-auto max-h-96 object-cover rounded-lg border"
                  />
                ) : selectedDocument.mimeType === 'application/pdf' ? (
                  <div className="bg-white rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
                    <FileIcon className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">PDF Document</p>
                    <a
                      href={`http://localhost:5000${selectedDocument.documentPath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      <DownloadIcon className="w-4 h-4" />
                      Open PDF in New Tab
                    </a>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
                    <FileIcon className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Preview not available</p>
                    <a
                      href={`http://localhost:5000${selectedDocument.documentPath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      <DownloadIcon className="w-4 h-4" />
                      Download Document
                    </a>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end border-t pt-4">
                <Button
                  onClick={() => setShowDocumentModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-900"
                >
                  Close
                </Button>
                <a
                  href={`http://localhost:5000${selectedDocument.documentPath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
