import { useState } from 'react';
import { StudentSidebar } from './dashboard/sidebar';
import { StudentTopNav } from './dashboard/top-nav';
import { AdvancedSearch } from './advanced-search';
import { DiscountListingCard } from './discount-listing-card';

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

// Mock discounts data
const mockDiscounts: Discount[] = [
  {
    id: '1',
    brandName: 'Zomato',
    category: 'Food & Dining',
    discount: 50,
    expiryDate: '31 Mar, 2026',
    description: 'Get 50% off on food orders above ₹300',
    isExclusive: true,
  },
  {
    id: '2',
    brandName: 'Myntra',
    category: 'Fashion',
    discount: 40,
    expiryDate: '15 May, 2026',
    description: 'Flat 40% discount on all clothing and accessories',
  },
  {
    id: '3',
    brandName: 'Amazon',
    category: 'E-Commerce',
    discount: 25,
    expiryDate: '30 Apr, 2026',
    description: 'Student Prime membership with exclusive deals',
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

export function StudentDiscountPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [savedOfferIds, setSavedOfferIds] = useState<Set<string>>(new Set(['1']));

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
          </div>
        </main>
      </div>
    </div>
  );
}
