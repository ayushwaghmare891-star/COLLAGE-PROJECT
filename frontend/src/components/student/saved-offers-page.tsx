import { useState } from 'react';
import { StudentSidebar } from './dashboard/sidebar';
import { DashboardHeader } from './dashboard-header';
import { SavedOffers } from './saved-offers';

interface SavedOffer {
  id: string;
  brandName: string;
  discount: number;
  category: string;
  expiryDate: string;
  description: string;
  savedDate: string;
}

export function SavedOffersPage() {
  const [activeSection, setActiveSection] = useState('saved');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Mock data - replace with actual API call
  const mockSavedOffers: SavedOffer[] = [
    {
      id: '1',
      brandName: 'Tech Store',
      discount: 30,
      category: 'Electronics',
      expiryDate: '2026-02-28',
      description: 'Get 30% off on laptops and accessories',
      savedDate: '2026-01-10',
    },
    {
      id: '2',
      brandName: 'Fashion Hub',
      discount: 25,
      category: 'Fashion',
      expiryDate: '2026-02-15',
      description: 'Flat 25% discount on winter collection',
      savedDate: '2026-01-12',
    },
    {
      id: '3',
      brandName: 'Food Court',
      discount: 15,
      category: 'Food & Dining',
      expiryDate: '2026-01-31',
      description: 'Buy one get one offer on selected items',
      savedDate: '2026-01-14',
    },
  ];

  const handleRemove = (id: string) => {
    console.log('Removing saved offer:', id);
    // Add API call here
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
          studentName="John Doe"
          studentEmail="john@example.com"
          verificationStatus="verified"
        />
        <div className="p-4 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Offers</h1>
            <p className="text-gray-600">Your collection of bookmarked discounts and offers</p>
          </div>

          <SavedOffers
            offers={mockSavedOffers}
            onRemove={handleRemove}
            onViewDetails={handleViewDetails}
          />
        </div>
      </div>
    </div>
  );
}
