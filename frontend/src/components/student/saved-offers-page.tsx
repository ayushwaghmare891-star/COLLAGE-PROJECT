import { useState, useEffect } from 'react';
import { StudentSidebar } from './dashboard/sidebar';
import { DashboardHeader } from './dashboard-header';
import { SavedOffers } from './saved-offers';
import { useAuthStore } from '../../stores/authStore';

interface SavedOffer {
  _id?: string;
  id?: string;
  title?: string;
  brandName?: string;
  vendor?: {
    name: string;
    businessName: string;
  };
  discount?: number;
  discountPercentage?: number;
  category?: string;
  expiryDate?: string;
  endDate?: string;
  description?: string;
  savedDate?: string;
  createdAt?: string;
}

export function SavedOffersPage() {
  const [activeSection, setActiveSection] = useState('saved');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [savedOffers, setSavedOffers] = useState<SavedOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuthStore();

  // Fetch saved offers from API
  useEffect(() => {
    const fetchSavedOffers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
          setError('Please login to view saved offers');
          setSavedOffers([]);
          setLoading(false);
          return;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const response = await fetch('http://localhost:5000/api/student/offers/saved', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status === 403) {
            setError('Access denied. Please verify your student account.');
          } else if (response.status === 404) {
            setError('Endpoint not found. Please try again later.');
          } else {
            setError(`Error: ${response.status} - Failed to fetch saved offers`);
          }
          setSavedOffers([]);
        } else {
          const data = await response.json();
          processAndSetOffers(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load saved offers');
        setSavedOffers([]);
      } finally {
        setLoading(false);
      }
    };

    const processAndSetOffers = (data: any) => {
      const offers = Array.isArray(data) ? data : data.offers || [];
      const transformedOffers = offers.map((offer: any) => ({
        _id: offer._id || offer.id,
        id: offer._id || offer.id,
        title: offer.title,
        brandName: offer.vendor?.businessName || offer.vendor?.name || offer.brandName || 'Brand',
        discount: offer.discountPercentage || offer.discount || 0,
        category: offer.category || 'General',
        expiryDate: offer.endDate ? new Date(offer.endDate).toLocaleDateString('en-GB') : 'No expiry',
        description: offer.description || 'Special discount offer',
        savedDate: offer.createdAt ? new Date(offer.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'),
      }));
      setSavedOffers(transformedOffers);
    };

    fetchSavedOffers();
  }, []);

  const handleRemove = (id: string) => {
    // Remove from local state
    setSavedOffers(savedOffers.filter(offer => offer._id !== id && offer.id !== id));
    // Optionally, call API to unsave the offer
    console.log('Removing saved offer:', id);
  };

  const handleViewDetails = (id: string) => {
    console.log('Viewing details for offer:', id);
    // Add navigation to details page
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <StudentSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <DashboardHeader 
          studentName={user?.name || 'Student'}
          studentEmail={user?.email || 'student@example.com'}
          verificationStatus="verified"
        />
        <div className="p-4 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Offers</h1>
            <p className="text-gray-600">Your collection of bookmarked discounts and offers</p>
          </div>

          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading saved offers...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <SavedOffers
              offers={savedOffers}
              onRemove={handleRemove}
              onViewDetails={handleViewDetails}
            />
          )}
        </div>
      </div>
    </div>
  );
}
