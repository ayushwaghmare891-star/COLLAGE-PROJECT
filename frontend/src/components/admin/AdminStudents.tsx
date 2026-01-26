import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  GraduationCapIcon, 
  SearchIcon, 
  TrashIcon,
  MailIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  Loader2Icon
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface Student {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  status: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  studentIdDocument?: string;
  studentIdUploadedAt?: string;
}

export function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
    window.scrollTo(0, 0);
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const response = await fetch('http://localhost:5000/api/admin/students', {
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
        throw new Error(errorData.message || `Failed to fetch students (${response.status})`);
      }
      
      const data = await response.json();
      setStudents(data.students || []);
    } catch (error: any) {
      console.error('Fetch students error:', error);
      toast({
        title: '❌ Error loading students',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveStudent = async (id: string, name: string) => {
    if (!window.confirm(`Approve ${name}? They will be able to access offers.`)) return;

    try {
      setProcessingId(id);
      const token = localStorage.getItem('auth_token');

      const response = await fetch(`http://localhost:5000/api/admin/dashboard/students/${id}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ approvalStatus: 'approved' })
      });

      if (!response.ok) throw new Error('Failed to approve student');

      // Update local state
      setStudents(students.map(s => 
        s._id === id ? { ...s, approvalStatus: 'approved' } : s
      ));

      toast({
        title: '✅ Student approved',
        description: `${name} can now access offers`,
      });
    } catch (error: any) {
      toast({
        title: '❌ Error approving student',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteStudent = async (id: string, name: string) => {
    if (!window.confirm(`Delete ${name}? This action cannot be undone.`)) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete student');

      setStudents(students.filter(s => s._id !== id));
      toast({
        title: '✅ Student deleted',
        description: `${name} has been removed`,
      });
    } catch (error: any) {
      toast({
        title: '❌ Error deleting student',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (verifiedFilter === 'verified') return matchesSearch && student.isEmailVerified;
    if (verifiedFilter === 'unverified') return matchesSearch && !student.isEmailVerified;
    return matchesSearch;
  });

  const stats = {
    total: students.length,
    verified: students.filter(s => s.isEmailVerified).length,
    unverified: students.filter(s => !s.isEmailVerified).length,
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-blue-900 rounded-2xl px-8 py-12 text-white shadow-2xl border border-blue-800/50">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">
            <GraduationCapIcon className="w-7 h-7 text-blue-200" strokeWidth={2} />
          </div>
          <h1 className="text-4xl font-bold">Students</h1>
        </div>
        <p className="text-blue-200 text-lg">
          Manage student accounts and verify enrollments
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Total Students</p>
                <p className="text-4xl font-bold">{stats.total}</p>
              </div>
              <GraduationCapIcon className="w-12 h-12 text-blue-300 opacity-30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-600 to-emerald-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">Verified</p>
                <p className="text-4xl font-bold">{stats.verified}</p>
              </div>
              <CheckCircleIcon className="w-12 h-12 text-green-300 opacity-30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-600 to-red-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium mb-1">Not Verified</p>
                <p className="text-4xl font-bold">{stats.unverified}</p>
              </div>
              <XCircleIcon className="w-12 h-12 text-orange-300 opacity-30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-t-2xl">
          <CardTitle className="text-white">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by username, email, or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value as any)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Students</option>
              <option value="verified">Verified Only</option>
              <option value="unverified">Unverified Only</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-2xl pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">
                Student Accounts ({filteredStudents.length})
              </CardTitle>
              <CardDescription className="text-blue-100">
                {loading ? 'Loading students...' : `Showing ${filteredStudents.length} of ${students.length} students`}
              </CardDescription>
            </div>
            <GraduationCapIcon className="w-8 h-8 text-blue-200 opacity-50" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-500">Loading student data...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <GraduationCapIcon className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">
                {searchTerm || verifiedFilter !== 'all' ? 'No students found' : 'No students yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 font-semibold">Approval</th>
                    <th className="text-left py-3 px-4 font-semibold">Verification</th>
                    <th className="text-left py-3 px-4 font-semibold">Student ID</th>
                    <th className="text-left py-3 px-4 font-semibold">Joined</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium">{student.firstName} {student.lastName}</p>
                          <p className="text-sm text-gray-500">@{student.username}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <MailIcon className="w-4 h-4 text-gray-400" />
                          <a href={`mailto:${student.email}`} className="text-blue-600 hover:underline text-sm">
                            {student.email}
                          </a>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {student.approvalStatus === 'approved' ? (
                          <Badge className="bg-green-600 text-white">✅ Approved</Badge>
                        ) : student.approvalStatus === 'rejected' ? (
                          <Badge className="bg-red-600 text-white">❌ Rejected</Badge>
                        ) : (
                          <Badge className="bg-yellow-600 text-white">⏳ Pending</Badge>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {student.isEmailVerified ? (
                          <Badge className="bg-green-600 text-white">✅ Verified</Badge>
                        ) : (
                          <Badge className="bg-orange-600 text-white">⏳ Pending</Badge>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {student.studentIdDocument ? (
                          <Badge className="bg-blue-600 text-white">📄 Uploaded</Badge>
                        ) : (
                          <Badge variant="outline">- Not uploaded</Badge>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <CalendarIcon className="w-4 h-4" />
                          {new Date(student.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          {student.approvalStatus !== 'approved' && (
                            <Button
                              size="sm"
                              onClick={() => handleApproveStudent(student._id, `${student.firstName} ${student.lastName}`)}
                              disabled={processingId === student._id}
                              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                            >
                              {processingId === student._id ? (
                                <Loader2Icon className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircleIcon className="w-4 h-4" />
                              )}
                              {processingId === student._id ? 'Approving...' : 'Approve'}
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteStudent(student._id, `${student.firstName} ${student.lastName}`)}
                            className="flex items-center gap-2"
                          >
                            <TrashIcon className="w-4 h-4" />
                            Delete
                          </Button>
                        </div>
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
