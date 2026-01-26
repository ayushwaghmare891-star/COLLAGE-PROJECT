import { useState } from 'react';
import { StudentSidebar } from './dashboard/sidebar';
import { StudentTopNav } from './dashboard/top-nav';
import { MyCoupons } from './my-coupons';

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

// Mock coupons data
const mockCoupons: Coupon[] = [
  {
    id: '1',
    code: 'STUDENT30FOOD',
    brand: 'Dominos',
    discount: 30,
    expiryDate: '31 Mar, 2026',
    status: 'unused',
    claimedDate: '10 Jan, 2026',
  },
  {
    id: '2',
    code: 'AMAZON25TECH',
    brand: 'Amazon',
    discount: 25,
    expiryDate: '30 Apr, 2026',
    status: 'used',
    claimedDate: '05 Jan, 2026',
    usageDate: '08 Jan, 2026',
  },
  {
    id: '3',
    code: 'MYNTRA40FASHION',
    brand: 'Myntra',
    discount: 40,
    expiryDate: '15 May, 2026',
    status: 'unused',
    claimedDate: '12 Jan, 2026',
  },
  {
    id: '4',
    code: 'ZOMATO50FOOD',
    brand: 'Zomato',
    discount: 50,
    expiryDate: '28 Feb, 2026',
    status: 'unused',
    claimedDate: '08 Jan, 2026',
  },
  {
    id: '5',
    code: 'UDEMY50COURSE',
    brand: 'Udemy',
    discount: 50,
    expiryDate: '31 Dec, 2025',
    status: 'expired',
    claimedDate: '15 Dec, 2025',
  },
  {
    id: '6',
    code: 'SPOTIFY50MUSIC',
    brand: 'Spotify',
    discount: 50,
    expiryDate: '31 Dec, 2026',
    status: 'unused',
    claimedDate: '14 Jan, 2026',
  },
];

export function StudentCouponsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [coupons, setCoupons] = useState(mockCoupons);

  const studentProfile: StudentProfile = {
    name: 'Alex Johnson',
    email: 'alex.johnson@university.edu',
    phone: '+91 9876543210',
    college: 'Tech Institute of India',
    course: 'B.Tech Computer Science',
    yearOfStudy: '3rd',
    studentId: 'STU-2024-001234',
    verificationStatus: 'verified',
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
              onRemove={handleRemoveCoupon}
              onViewDetails={handleViewDetails}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
