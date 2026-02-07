import { useState, useEffect } from 'react';
import { StudentSidebar } from './dashboard/sidebar';
import { StudentTopNav } from './dashboard/top-nav';
import { AdvancedSearch } from './advanced-search';
import { DiscountListingCard } from './discount-listing-card';
import { getVerificationStatus } from '../../lib/studentAPI';
import { useAuthStore } from '../../stores/authStore';

interface Discount {
  _id: string;
  id?: string;
  title?: string;
  brandName?: string;
  vendor?: {
    name: string;
    businessName: string;
  };
  discount?: number;
  discountPercentage?: number;
  description?: string;
  expiryDate?: string;
  endDate?: string;
  category?: string;
  isActive?: boolean;
  isExclusive?: boolean;
  isLimitedTime?: boolean;
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
}

export function StudentDiscountPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [savedOfferIds, setSavedOfferIds] = useState<Set<string>>(new Set());
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimLoading, setClaimLoading] = useState<string | null>(null);

  const { user, token } = useAuthStore();

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

  // Fetch real discounts from API
  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        setLoading(true);
        setError(null);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/offers/active`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
          throw new Error('Failed to fetch discounts');
        }
        const data = await response.json();
        // Transform API response to match component's Discount interface
        const transformedData = data.map((offer: any) => ({
          _id: offer._id,
          id: offer._id,
          title: offer.title,
          brandName: offer.vendor?.businessName || offer.vendor?.name || 'Brand',
          discount: offer.discountPercentage || offer.discount || 0,
          description: offer.description,
          expiryDate: offer.endDate ? new Date(offer.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No expiry',
          category: offer.category || 'General',
          isActive: offer.isActive !== false,
          isExclusive: offer.isExclusive || false,
          isLimitedTime: offer.isLimitedTime || false,
        }));
        setDiscounts(transformedData);
      } catch (err: any) {
        if (err.name === 'AbortError') {
          setError('Request timeout - please try again');
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load discounts');
        }
        setDiscounts([]);
      } finally {
        setLoading(false);
      }
    };

    // Fetch approval status from backend
    const fetchApprovalStatus = async () => {
      try {
        const status = await getVerificationStatus();
        // Approval status will be used from the user object in handleClaimDiscount
      } catch (err) {
        console.error('Error fetching approval status:', err);
      }
    };

    fetchDiscounts();
    fetchApprovalStatus();

    // Refresh approval status every 30 seconds to catch admin updates
    const approvalStatusInterval = setInterval(() => {
      fetchApprovalStatus();
    }, 30000);

    return () => clearInterval(approvalStatusInterval);
  }, []);

  const handleSaveOffer = (id: string) => {
    const newSaved = new Set(savedOfferIds);
    if (newSaved.has(id)) {
      newSaved.delete(id);
    } else {
      newSaved.add(id);
    }
    setSavedOfferIds(newSaved);
  };

  const handleClaimDiscount = async (id: string) => {
    setClaimError(null);
    
    try {
      setClaimLoading(id);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/student/offers/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ offerId: id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to claim offer');
      }

      alert(`✅ Offer claimed successfully! Your redemption code: ${data.redemptionCode}`);
    } catch (err: any) {
      setClaimError(err.message || 'Failed to claim offer');
      console.error('Claim error:', err);
    } finally {
      setClaimLoading(null);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <StudentSidebar 
        activeSection="all-discounts" 
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
            <h1 className="text-3xl font-bold text-gray-900 mb-4">All Discounts</h1>
            <AdvancedSearch onSearch={() => {}} onFilterChange={() => {}} />

            {loading && (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading discounts...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {claimError && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800">{claimError}</p>
              </div>
            )}

            {!loading && discounts.length === 0 && !error && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No discounts available yet. Please check back later!</p>
              </div>
            )}

            {!loading && discounts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {discounts.map((discount) => (
                  <DiscountListingCard
                    key={discount._id}
                    id={discount._id || discount.id || ''}
                    brandName={discount.brandName || 'Brand'}
                    discount={discount.discount || 0}
                    description={discount.description || ''}
                    expiryDate={discount.expiryDate || 'No expiry'}
                    category={discount.category || 'General'}
                    isExclusive={discount.isExclusive}
                    isLimitedTime={discount.isLimitedTime}
                    isSaved={savedOfferIds.has(discount._id || '')}
                    isApproved={true}
                    isLoading={claimLoading === (discount._id || discount.id)}
                    onSave={handleSaveOffer}
                    onClaim={handleClaimDiscount}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
