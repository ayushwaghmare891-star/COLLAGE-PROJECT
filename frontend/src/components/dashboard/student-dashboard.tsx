import { useState } from 'react';
import { Sidebar } from './sidebar';
import { WelcomeSection } from './welcome-section';
import { SummaryStats } from './summary-stats';
import { SearchAndFilter } from './search-and-filter';
import { DiscountCard } from './discount-card';
import { ProfileModal } from './profile-modal.tsx';
import { Sparkles } from 'lucide-react';

// Mock data types
interface Discount {
  id: string;
  brandName: string;
  brandLogo?: string;
  discountPercentage: number;
  category: string;
  validityDate: string;
  description: string;
  isExclusive?: boolean;
  isLimitedTime?: boolean;
}

interface StudentData {
  name: string;
  email: string;
  verificationStatus: 'verified' | 'pending';
  profileImage?: string;
  studentId?: string;
  college?: string;
  course?: string;
}

// Mock discount data
const mockDiscounts: Discount[] = [
  {
    id: '1',
    brandName: 'Dominos',
    category: 'Food',
    discountPercentage: 30,
    validityDate: '31 Mar, 2026',
    description: 'Flat 30% off on all food orders with student ID',
    isExclusive: true,
  },
  {
    id: '2',
    brandName: 'Amazon',
    category: 'Electronics',
    discountPercentage: 25,
    validityDate: '30 Apr, 2026',
    description: 'Special student discount on electronics and gadgets',
    isLimitedTime: true,
  },
  {
    id: '3',
    brandName: 'Myntra',
    category: 'Fashion',
    discountPercentage: 40,
    validityDate: '15 May, 2026',
    description: 'Latest fashion collection with extra student discount',
  },
  {
    id: '4',
    brandName: 'Udemy',
    category: 'Education',
    discountPercentage: 50,
    validityDate: '31 Dec, 2026',
    description: 'Top-rated online courses for skill enhancement',
    isExclusive: true,
  },
  {
    id: '5',
    brandName: 'MakeMyTrip',
    category: 'Travel',
    discountPercentage: 35,
    validityDate: '30 Jun, 2026',
    description: 'Book flights and hotels with student discounts',
    isLimitedTime: true,
  },
  {
    id: '6',
    brandName: 'Spotify',
    category: 'Subscriptions',
    discountPercentage: 50,
    validityDate: '31 Dec, 2026',
    description: 'Premium music subscription at student rates',
  },
  {
    id: '7',
    brandName: 'Zomato',
    category: 'Food',
    discountPercentage: 50,
    validityDate: '28 Feb, 2026',
    description: 'Extra 50% off using student coupon code',
    isExclusive: true,
    isLimitedTime: true,
  },
  {
    id: '8',
    brandName: 'H&M',
    category: 'Fashion',
    discountPercentage: 20,
    validityDate: '31 May, 2026',
    description: 'Casual and formal wear with student discount',
  },
  {
    id: '9',
    brandName: 'Coursera',
    category: 'Education',
    discountPercentage: 45,
    validityDate: '31 Dec, 2026',
    description: 'Free access to premium courses and specializations',
  },
  {
    id: '10',
    brandName: 'Netflix',
    category: 'Subscriptions',
    discountPercentage: 40,
    validityDate: '30 Nov, 2026',
    description: 'Student plan with premium features',
  },
];

export function StudentDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{
    category?: string;
    brand?: string;
    expiryDays?: number;
  }>({});
  const [savedOffers, setSavedOffers] = useState<Set<string>>(new Set());

  // Mock student data
  const studentData: StudentData = {
    name: 'Alex Johnson',
    email: 'alex.johnson@university.edu',
    verificationStatus: 'verified',
    profileImage: undefined,
    studentId: 'STU-2024-001234',
    college: 'Tech Institute of India',
    course: 'B.Tech Computer Science',
  };

  // Filter discounts based on search and filters
  const filteredDiscounts = mockDiscounts.filter((discount) => {
    const matchesSearch =
      searchQuery === '' ||
      discount.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discount.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discount.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = !filters.category || discount.category === filters.category;
    const matchesBrand = !filters.brand || discount.brandName === filters.brand;

    return matchesSearch && matchesCategory && matchesBrand;
  });

  // Get unique categories and brands
  const categories = Array.from(new Set(mockDiscounts.map((d) => d.category)));
  const brands = Array.from(new Set(mockDiscounts.map((d) => d.brandName)));

  // Separate discounts by type
  const exclusiveDeals = filteredDiscounts.filter((d) => d.isExclusive);
  const limitedTimeOffers = filteredDiscounts.filter((d) => d.isLimitedTime);
  const categoryDiscounts: Record<string, Discount[]> = {};
  categories.forEach((cat) => {
    categoryDiscounts[cat] = filteredDiscounts.filter((d) => d.category === cat);
  });

  const handleSaveOffer = (id: string) => {
    const newSaved = new Set(savedOffers);
    if (newSaved.has(id)) {
      newSaved.delete(id);
    } else {
      newSaved.add(id);
    }
    setSavedOffers(newSaved);
  };

  const handleViewOffer = (id: string) => {
    // In a real app, this would open a modal or navigate to offer details
    console.log('View offer:', id);
    alert(`Offer ${id} clicked! In a real app, this would show details or allow claiming the offer.`);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        onLogout={() => console.log('Logout')}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Main Content */}
      <div className="flex-1 w-full overflow-y-auto">
        <div className="p-4 md:p-8 max-w-full">
          {/* Welcome Section */}
          <WelcomeSection
            studentName={studentData.name}
            studentEmail={studentData.email}
            verificationStatus={studentData.verificationStatus}
            profileImage={studentData.profileImage}
            onEditProfile={() => setShowProfileModal(true)}
          />

          {/* Summary Stats */}
          <SummaryStats
            totalDiscounts={mockDiscounts.length}
            savedAmount={2485}
            recentOffers={5}
          />

          {/* Search and Filter */}
          <SearchAndFilter
            categories={categories}
            brands={brands}
            onSearch={setSearchQuery}
            onFilterChange={setFilters}
          />

          {/* Exclusive Student-Only Deals */}
          {exclusiveDeals.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  🎓 Exclusive Student Deals
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exclusiveDeals.map((discount) => (
                  <DiscountCard
                    key={discount.id}
                    {...discount}
                    isSaved={savedOffers.has(discount.id)}
                    onSave={handleSaveOffer}
                    onViewOffer={handleViewOffer}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Limited-Time Offers */}
          {limitedTimeOffers.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl">⏰</span>
                <h2 className="text-2xl font-bold text-gray-900">Limited-Time Offers</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {limitedTimeOffers.map((discount) => (
                  <DiscountCard
                    key={discount.id}
                    {...discount}
                    isSaved={savedOffers.has(discount.id)}
                    onSave={handleSaveOffer}
                    onViewOffer={handleViewOffer}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Category-Wise Discounts */}
          {categories.map((category) => {
            const discounts = categoryDiscounts[category];
            if (discounts.length === 0) return null;

            const categoryIcons: Record<string, string> = {
              Food: '🍕',
              Fashion: '👗',
              Electronics: '📱',
              Education: '📚',
              Travel: '✈️',
              Subscriptions: '🎵',
            };

            return (
              <section key={category} className="mb-10">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-2xl">{categoryIcons[category] || '🏷️'}</span>
                  <h2 className="text-2xl font-bold text-gray-900">{category} Deals</h2>
                  <span className="ml-auto text-gray-600 font-semibold">
                    {discounts.length} offers
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {discounts.map((discount) => (
                    <DiscountCard
                      key={discount.id}
                      {...discount}
                      isSaved={savedOffers.has(discount.id)}
                      onSave={handleSaveOffer}
                      onViewOffer={handleViewOffer}
                    />
                  ))}
                </div>
              </section>
            );
          })}

          {/* Empty State */}
          {filteredDiscounts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">
                No discounts found matching your search criteria. Try adjusting your filters!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          studentData={studentData}
          onClose={() => setShowProfileModal(false)}
          onSave={(updatedData: StudentData) => {
            console.log('Profile updated:', updatedData);
            setShowProfileModal(false);
          }}
        />
      )}
    </div>
  );
}
