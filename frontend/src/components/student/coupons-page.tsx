import { useState, useEffect } from 'react';
import { StudentSidebar } from './dashboard/sidebar';
import { StudentTopNav } from './dashboard/top-nav';
import { MyCoupons } from './my-coupons';
import { getActiveCoupons, getVerificationStatus } from '../../lib/studentAPI';
import { useAuthStore } from '../../stores/authStore';
import { useRealtimeUpdates } from '../../hooks/useRealtimeUpdates';

interface StudentProfile {
  name: string;
  email: string;
  phone: string;
  college: string;
  course: string;
  yearOfStudy: string;
  studentId: string;
  verificationStatus: 'verified' | 'pending' | 'rejected';
}

interface Coupon {
  id: string;
  code: string;
  brand: string;
  discount: number;
  expiryDate: string;
  status: 'used' | 'unused' | 'expired';
  claimedDate: string;
  usageDate?: string;
}

export function StudentCouponsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const { token, user, updateUser } = useAuthStore();

  const studentProfile: StudentProfile = {
    name: user?.name || 'Student',
    email: user?.email || 'student@university.edu',
    phone: '+91 9876543210',
    college: 'Tech Institute of India',
    course: 'B.Tech Computer Science',
    yearOfStudy: '3rd',
    studentId: 'STU-2024-001234',
    verificationStatus: 'verified',
  };

  // Listen for student approval updates from admin
  useRealtimeUpdates(
    (update) => {
      // When student status is updated by admin (approval/rejection)
      if (update.student) {
        // Update the user in auth store with new approval status
        updateUser({
          approvalStatus: update.student.approvalStatus || update.approvalStatus,
        });
        setApprovalStatus(update.student.approvalStatus || update.approvalStatus);
      }
    }
  );

  useEffect(() => {
    // Fetch latest approval status from backend
    const fetchApprovalStatus = async () => {
      try {
        const status = await getVerificationStatus();
        if (status?.approvalStatus) {
          setApprovalStatus(status.approvalStatus as 'pending' | 'approved' | 'rejected');
          // Also update the auth store
          updateUser({
            approvalStatus: status.approvalStatus,
          });
        }
      } catch (err) {
        console.error('Error fetching approval status:', err);
        // Fall back to user store if fetch fails
        if (user?.approvalStatus) {
          setApprovalStatus(user.approvalStatus as 'pending' | 'approved' | 'rejected');
        }
      }
    };

    if (token) {
      fetchApprovalStatus();
      fetchCoupons();

      // Refresh approval status every 30 seconds to catch admin updates
      const approvalStatusInterval = setInterval(() => {
        fetchApprovalStatus();
      }, 30000);

      return () => clearInterval(approvalStatusInterval);
    }
  }, [token]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getActiveCoupons();
      if (response.coupons) {
        setCoupons(response.coupons);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch coupons');
      console.error('Error fetching coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = (id: string) => {
    setCoupons((prev) => prev.filter((coupon) => coupon.id !== id));
  };

  const handleViewDetails = (id: string) => {
    alert(`Viewing details for coupon ${id}`);
  };

  // Calculate statistics
  const unusedCount = coupons.filter((c) => c.status === 'unused').length;
  const usedCount = coupons.filter((c) => c.status === 'used').length;
  const expiredCount = coupons.filter((c) => c.status === 'expired').length;
  const totalDiscount = coupons.filter((c) => c.status === 'unused').reduce((sum, c) => sum + c.discount, 0);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <StudentSidebar 
        activeSection="my-coupons" 
        onSectionChange={() => {}}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navigation */}
        <StudentTopNav 
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          studentName={studentProfile.name}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">My Coupons</h1>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                {/* Statistics Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                    <p className="text-gray-600 text-sm font-medium mb-2">Unused Coupons</p>
                    <p className="text-3xl font-bold text-green-600">{unusedCount}</p>
                    <p className="text-xs text-gray-500 mt-2">Ready to use</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                    <p className="text-gray-600 text-sm font-medium mb-2">Used Coupons</p>
                    <p className="text-3xl font-bold text-blue-600">{usedCount}</p>
                    <p className="text-xs text-gray-500 mt-2">Already redeemed</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
                    <p className="text-gray-600 text-sm font-medium mb-2">Expired Coupons</p>
                    <p className="text-3xl font-bold text-red-600">{expiredCount}</p>
                    <p className="text-xs text-gray-500 mt-2">No longer valid</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
                    <p className="text-gray-600 text-sm font-medium mb-2">Total Savings Potential</p>
                    <p className="text-3xl font-bold text-purple-600">{totalDiscount}%</p>
                    <p className="text-xs text-gray-500 mt-2">On unused coupons</p>
                  </div>
                </div>

                {/* Coupons List */}
                <MyCoupons 
                  coupons={coupons}
                  isApproved={approvalStatus === 'approved'}
                  onRemove={handleRemoveCoupon}
                  onViewDetails={handleViewDetails}
                />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
