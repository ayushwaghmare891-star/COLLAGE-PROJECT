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
  Eye
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { verifyDocument } from '../../lib/adminAPI';

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
  const [userTypeFilter, setUserTypeFilter] = useState<'all' | 'student'>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<VerificationDocument | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentView, setDocumentView] = useState<boolean>(false); // Toggle between user and document view
  const { toast } = useToast();

  useEffect(() => {
    fetchVerifications();
    window.scrollTo(0, 0);
  }, [documentView]);

  useEffect(() => {
    filterVerifications();
  }, [verifications, searchTerm, statusFilter, userTypeFilter]);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      // Fetch from the appropriate endpoint based on view
      const endpoint = documentView 
        ? 'http://localhost:5000/api/verification/pending-documents'
        : 'http://localhost:5000/api/admin/pending-verifications';

      const response = await fetch(endpoint, {
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
      
      if (documentView) {
        // Transform document data to match PendingVerification interface
        const transformedDocs = (data.documents || []).map((doc: any) => ({
          _id: doc._id,
          username: doc.user?.email || 'Unknown',
          email: doc.user?.email || '',
          firstName: doc.user?.firstName || doc.user?.name || 'Unknown',
          lastName: doc.user?.lastName || '',
          userType: doc.user?.role || 'student',
          type: doc.user?.role || 'student',
          status: doc.status,
          createdAt: doc.createdAt,
          verificationDocument: {
            _id: doc._id,
            documentType: doc.documentType,
            documentPath: doc.fileUrl,
            documentFileName: doc.fileName,
            documentSize: doc.fileSize || 0,
            mimeType: doc.mimeType,
            uploadedAt: doc.createdAt,
            status: doc.status
          }
        }));
        setVerifications(transformedDocs);
      } else {
        setVerifications(data.verifications || []);
      }
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

    // Apply user type filter
    if (userTypeFilter !== 'all') {
      filtered = filtered.filter(v => v.userType === userTypeFilter);
    }

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
      'student_id': '🎓 Student ID',
      'student-id': '🎓 Student ID',
      'business_license': '📋 Business License',
      'business-license': '📋 Business License',
      'aadhar': '🆔 Aadhar Card',
      'pan': '📝 PAN Card',
      'passport': '🛂 Passport',
      'enrollment_letter': '📜 Enrollment Letter',
      'enrollment-letter': '📜 Enrollment Letter',
      'transcript': '📊 Transcript',
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

  const handleApproveVerification = async (id: string, name: string, userType: string) => {
    if (!window.confirm(`Approve verification for ${name}?`)) return;

    try {
      setProcessingId(id);
      const token = localStorage.getItem('auth_token');
      
      // If in document view, use document verification endpoint
      if (documentView) {
        await verifyDocument(id, 'verified', `Approved by admin`);
      } else {
        // Use the correct endpoint based on user type
        const endpoint = userType === 'student' 
          ? `http://localhost:5000/api/admin/students/${id}/verify`
          : `http://localhost:5000/api/admin/vendors/${id}/status`;
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'verified' })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to approve verification');
        }
      }

      setVerifications(verifications.map(v => 
        v._id === id ? { ...v, status: 'approved' } : v
      ));

      toast({
        title: '✅ Verification approved',
        description: `${name}'s verification has been approved. They can now login.`,
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

  const handleRejectVerification = async (id: string, name: string, userType: string) => {
    const reason = prompt(`Enter rejection reason for ${name}:`);
    if (!reason) return;

    try {
      setProcessingId(id);
      const token = localStorage.getItem('auth_token');
      
      // If in document view, use document verification endpoint
      if (documentView) {
        await verifyDocument(id, 'rejected', reason);
      } else {
        // Use the correct endpoint based on user type
        const endpoint = userType === 'student' 
          ? `http://localhost:5000/api/admin/students/${id}/verify`
          : `http://localhost:5000/api/admin/vendors/${id}/status`;
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'rejected', remarks: reason })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to reject verification');
        }
      }

      setVerifications(verifications.map(v => 
        v._id === id ? { ...v, status: 'rejected' } : v
      ));

      toast({
        title: '✅ Verification rejected',
        description: `${name}'s verification has been rejected. They've been notified via email.`,
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
          const endpoint = `http://localhost:5000/api/admin/students/${verification._id}/verify`;
          
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'verified' })
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
    <div className="space-y-8 pb-8">
      {/* Header - Student Inspired */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-2xl shadow-md">
              ✅
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {documentView ? '📄 Document Verification' : 'Manage Verifications'}
              </h1>
              <p className="text-gray-600 mt-2">
                {documentView 
                  ? 'Review documents submitted by students - Check if real or fake'
                  : 'Review and approve student document verifications'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setDocumentView(!documentView)}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
                documentView
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {documentView ? '👥 Users View' : '📄 Documents View'}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards - Clean Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 hover:shadow-md hover:border-yellow-300 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-600 to-amber-600 flex items-center justify-center shadow-md">
              <Clock className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <p className="text-gray-600 text-xs font-medium uppercase tracking-wide">Pending</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 hover:shadow-md hover:border-green-300 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-md">
              <CheckCircleIcon className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <p className="text-gray-600 text-xs font-medium uppercase tracking-wide">Approved</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 hover:shadow-md hover:border-red-300 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center shadow-md">
              <XCircleIcon className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <p className="text-gray-600 text-xs font-medium uppercase tracking-wide">Rejected</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.rejected}</p>
        </div>
      </div>

      {/* Search and Filter - Clean Layout */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Search & Filter</h3>
        <div className="space-y-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* User Type Filter */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">User Type:</p>
            <div className="flex flex-wrap gap-2">
              {(['all', 'student'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setUserTypeFilter(type)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                    userTypeFilter === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type === 'student' ? '🎓 Students' : 'All'}
                </button>
              ))}
            </div>
          </div>
          
          {/* Status Filter */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Status:</p>
            <div className="flex flex-wrap gap-2">
              {(['all', 'pending', 'approved', 'rejected'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {stats.pending > 0 && (
            <Button
              onClick={handleApproveAll}
              disabled={processingId === 'all'}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {processingId === 'all' ? '⏳ Approving All...' : `✅ Approve All (${stats.pending})`}
            </Button>
          )}
        </div>
      </div>

      {/* Verifications List - Card View */}
      {filteredVerifications.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <AlertCircleIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 text-lg">No verifications found</p>
          <p className="text-gray-500 text-sm mt-1">
            {searchTerm ? 'Try adjusting your search filters' : 'All verifications have been processed'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredVerifications.map((verification) => (
            <div key={verification._id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all overflow-hidden p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* User Info + Document */}
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center font-bold text-blue-600 flex-shrink-0">
                      {verification.firstName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {verification.firstName} {verification.lastName}
                        </h3>
                        <Badge className={`text-xs ${
                          verification.userType === 'vendor' 
                            ? 'bg-purple-100 text-purple-700 border-purple-300' 
                            : 'bg-blue-100 text-blue-700 border-blue-300'
                        }`}>
                          {verification.userType === 'vendor' ? '🏪 Vendor' : '🎓 Student'}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">@{verification.username}</p>
                      <a href={`mailto:${verification.email}`} className="text-xs text-blue-600 hover:underline mt-1">
                        {verification.email}
                      </a>
                      
                      {/* Document Info - Enhanced in Document View */}
                      {documentView && verification.verificationDocument && (
                        <div className="mt-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <FileIcon className="w-4 h-4 text-blue-600" />
                            <p className="font-medium text-blue-900 text-sm">
                              {formatDocumentType(verification.verificationDocument.documentType)}
                            </p>
                          </div>
                          <p className="text-blue-700 text-xs font-mono">{verification.verificationDocument.documentFileName}</p>
                          <p className="text-blue-600 text-xs mt-1">📦 {formatFileSize(verification.verificationDocument.documentSize)}</p>
                          <p className="text-blue-600 text-xs mt-1">📅 {new Date(verification.verificationDocument.uploadedAt).toLocaleDateString()}</p>
                        </div>
                      )}
                      
                      {/* Document Info - Compact in User View */}
                      {!documentView && verification.studentIdUploadedAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          📄 Uploaded {new Date(verification.studentIdUploadedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex flex-col sm:items-end gap-3">
                  <div>
                    {getStatusBadge(verification.status)}
                  </div>
                  
                  <div className="flex gap-2 flex-wrap sm:flex-nowrap justify-start sm:justify-end">
                    {verification.verificationDocument && (
                      <Button
                        size="sm"
                        onClick={() => handleViewDocument(verification.verificationDocument!)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View Doc
                      </Button>
                    )}
                    {verification.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApproveVerification(
                            verification._id,
                            `${verification.firstName} ${verification.lastName}`,
                            verification.type || verification.userType || 'student'
                          )}
                          disabled={processingId === verification._id}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs"
                        >
                          {processingId === verification._id ? '⏳' : '✅'} {!processingId ? 'Approve' : 'Approving...'}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleRejectVerification(
                            verification._id,
                            `${verification.firstName} ${verification.lastName}`,
                            verification.type || verification.userType || 'student'
                          )}
                          disabled={processingId === verification._id}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs"
                        >
                          {processingId === verification._id ? '⏳' : '❌'} {!processingId ? 'Reject' : 'Rejecting...'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
                    src={selectedDocument.documentPath}
                    alt="Document Preview"
                    className="w-full h-auto max-h-96 object-cover rounded-lg border"
                  />
                ) : selectedDocument.mimeType === 'application/pdf' ? (
                  <div className="bg-white rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
                    <FileIcon className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">PDF Document</p>
                    <a
                      href={selectedDocument.documentPath}
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
                      href={selectedDocument.documentPath}
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
                  href={selectedDocument.documentPath}
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
