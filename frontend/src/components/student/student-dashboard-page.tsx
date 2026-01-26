import { useState } from 'react';
import { StudentSidebar } from './dashboard/sidebar';
import { StudentTopNav } from './dashboard/top-nav';
import { DashboardHeader } from './dashboard-header';
import { AnalyticsSummary } from './analytics-summary';
import { AdvancedSearch } from './advanced-search';
import { DiscountListingCard } from './discount-listing-card';
import { MyCoupons } from './my-coupons';
import { SavedOffers } from './saved-offers';
import { NotificationsPanel } from './notifications-panel';
import { ProfileVerification } from './profile-verification';
import { HelpSupport } from './help-support';

// Mock data types
interface Discount {
  id: string;
  brandName: string;
  discount: number;
  description: string;
  expiryDate: string;
  category: string;
  isExclusive?: boolean;
  isLimitedTime?: boolean;
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

interface SavedOffer {
  id: string;
  brandName: string;
  discount: number;
  category: string;
  expiryDate: string;
  description: string;
  savedDate: string;
}

interface Notification {
  id: string;
  type: 'new_discount' | 'expiring' | 'verification' | 'announcement';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface StudentProfile {
  name: string;
  email: string;
  phone: string;
  college: string;
  course: string;
  yearOfStudy: string;
  studentId: string;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  profileImage?: string;
}

// Mock discount data
const mockDiscounts: Discount[] = [
  {
    id: '1',
    brandName: 'Dominos',
    category: 'Food',
    discount: 30,
    expiryDate: '31 Mar, 2026',
    description: 'Flat 30% off on all food orders with student ID',
    isExclusive: true,
  },
  {
    id: '2',
    brandName: 'Amazon',
    category: 'Electronics',
    discount: 25,
    expiryDate: '30 Apr, 2026',
    description: 'Special student discount on electronics and gadgets',
    isLimitedTime: true,
  },
  {
    id: '3',
    brandName: 'Myntra',
    category: 'Fashion',
    discount: 40,
    expiryDate: '15 May, 2026',
    description: 'Latest fashion collection with extra student discount',
  },
  {
    id: '4',
    brandName: 'Udemy',
    category: 'Education',
    discount: 50,
    expiryDate: '31 Dec, 2026',
    description: 'Top-rated online courses for skill enhancement',
    isExclusive: true,
  },
  {
    id: '5',
    brandName: 'MakeMyTrip',
    category: 'Travel',
    discount: 35,
    expiryDate: '30 Jun, 2026',
    description: 'Book flights and hotels with student discounts',
    isLimitedTime: true,
  },
  {
    id: '6',
    brandName: 'Spotify',
    category: 'Subscriptions',
    discount: 50,
    expiryDate: '31 Dec, 2026',
    description: 'Premium music subscription at student rates',
  },
];

// Mock coupons
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
];

// Mock saved offers
const mockSavedOffers: SavedOffer[] = [
  {
    id: '1',
    brandName: 'Myntra',
    discount: 40,
    category: 'Fashion',
    expiryDate: '15 May, 2026',
    description: 'Latest fashion collection',
    savedDate: '08 Jan, 2026',
  },
];

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'new_discount',
    title: 'New Exclusive Discount!',
    message: 'Zomato is offering 50% off for verified students',
    timestamp: '2 hours ago',
    read: false,
  },
  {
    id: '2',
    type: 'expiring',
    title: 'Offer Expiring Soon',
    message: 'Your Amazon discount expires in 5 days',
    timestamp: '1 day ago',
    read: true,
  },
];

export function StudentDashboardPage() {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'all-discounts' | 'categories' | 'my-coupons' | 'saved' | 'notifications' | 'profile' | 'help-support'
  >('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [savedOfferIds, setSavedOfferIds] = useState<Set<string>>(new Set(['1']));
  const [notifications, setNotifications] = useState(mockNotifications);

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

  const handleSaveOffer = (id: string) => {
    const newSaved = new Set(savedOfferIds);
    if (newSaved.has(id)) {
      newSaved.delete(id);
    } else {
      newSaved.add(id);
    }
    setSavedOfferIds(newSaved);
  };

  const handleClaimDiscount = (id: string) => {
    alert(`Discount ${id} claimed successfully!`);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const renderSection = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            <DashboardHeader
              studentName={studentProfile.name}
              studentEmail={studentProfile.email}
              verificationStatus={studentProfile.verificationStatus}
              lastVerificationDate="5 Jan, 2026"
            />

            <AnalyticsSummary
              activeDiscounts={mockDiscounts.length}
              totalSaved={2485}
              couponsClaimed={15}
              activeCoupons={mockCoupons.filter((c) => c.status === 'unused').length}
            />

            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Discounts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockDiscounts.slice(0, 3).map((discount) => (
                <DiscountListingCard
                  key={discount.id}
                  {...discount}
                  isSaved={savedOfferIds.has(discount.id)}
                  onSave={handleSaveOffer}
                  onClaim={handleClaimDiscount}
                />
              ))}
            </div>
          </>
        )
      case 'all-discounts':
        return (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">All Discounts</h1>
            <AdvancedSearch onSearch={() => {}} onFilterChange={() => {}} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockDiscounts.map((discount) => (
                <DiscountListingCard
                  key={discount.id}
                  {...discount}
                  isSaved={savedOfferIds.has(discount.id)}
                  onSave={handleSaveOffer}
                  onClaim={handleClaimDiscount}
                />
              ))}
            </div>
          </>
        )
      case 'my-coupons':
        return (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">My Coupons</h1>
            <MyCoupons coupons={mockCoupons} />
          </>
        )
      case 'saved':
        return (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Saved Offers</h1>
            <SavedOffers
              offers={mockSavedOffers}
              onRemove={(id) => setSavedOfferIds(new Set([...savedOfferIds].filter((x) => x !== id)))}
            />
          </>
        )
      case 'notifications':
        return (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Notifications</h1>
            <NotificationsPanel
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onDismiss={(id) => setNotifications((prev) => prev.filter((n) => n.id !== id))}
            />
          </>
        )
      case 'help-support':
        return <HelpSupport />
      case 'profile':
        return (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile & Verification</h1>
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{studentProfile.name}</h2>
                  <p className="text-gray-600">{studentProfile.email}</p>
                </div>
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all duration-200 font-medium"
                >
                  Edit Profile
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-600 text-sm">Phone</p>
                  <p className="text-lg font-semibold text-gray-900">{studentProfile.phone}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">College</p>
                  <p className="text-lg font-semibold text-gray-900">{studentProfile.college}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Course</p>
                  <p className="text-lg font-semibold text-gray-900">{studentProfile.course}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Student ID</p>
                  <p className="text-lg font-semibold text-gray-900">{studentProfile.studentId}</p>
                </div>
              </div>
            </div>
          </>
        )
      case 'categories':
      default:
        return (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">All Discounts</h1>
            <AdvancedSearch onSearch={() => {}} onFilterChange={() => {}} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockDiscounts.map((discount) => (
                <DiscountListingCard
                  key={discount.id}
                  {...discount}
                  isSaved={savedOfferIds.has(discount.id)}
                  onSave={handleSaveOffer}
                  onClaim={handleClaimDiscount}
                />
              ))}
            </div>
          </>
        )
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <StudentSidebar 
        activeSection={activeTab} 
        onSectionChange={(section: string) => setActiveTab(section as any)}
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
            {renderSection()}
          </div>
        </main>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileVerification
          profile={studentProfile}
          onClose={() => setShowProfileModal(false)}
          onUpdate={(updatedProfile) => {
            console.log('Profile updated:', updatedProfile);
            setShowProfileModal(false);
          }}
        />
      )}
    </div>
  );
}
