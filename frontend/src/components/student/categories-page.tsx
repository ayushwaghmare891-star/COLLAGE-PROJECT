import { useState, useEffect } from 'react';
import { StudentSidebar } from './dashboard/sidebar';
import { StudentTopNav } from './dashboard/top-nav';
import { useAuthStore } from '../../stores/authStore';

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

interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  description: string;
  color: string;
}

// Default categories with emojis and colors
const categoryDefaults: { [key: string]: { icon: string; description: string; color: string } } = {
  'Food & Dining': { icon: '🍔', description: 'Restaurants, food delivery, cafes', color: 'from-orange-400 to-red-500' },
  'Fashion': { icon: '👕', description: 'Clothing, accessories, footwear', color: 'from-pink-400 to-purple-500' },
  'E-Commerce': { icon: '🛍️', description: 'Online shopping, electronics', color: 'from-blue-400 to-cyan-500' },
  'Education': { icon: '📚', description: 'Online courses, learning platforms', color: 'from-green-400 to-emerald-500' },
  'Travel': { icon: '✈️', description: 'Flights, hotels, travel bookings', color: 'from-sky-400 to-blue-500' },
  'Entertainment': { icon: '🎬', description: 'Movies, music, streaming services', color: 'from-purple-400 to-indigo-500' },
  'Health & Fitness': { icon: '💪', description: 'Gym, fitness apps, health products', color: 'from-red-400 to-pink-500' },
  'Subscriptions': { icon: '📱', description: 'Premium memberships, subscriptions', color: 'from-indigo-400 to-purple-500' },
  'General': { icon: '🏷️', description: 'Other discounts and offers', color: 'from-gray-400 to-slate-500' },
};

export function StudentCategoriesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuthStore();

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

  // Fetch and process categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const response = await fetch('http://localhost:5000/api/offers/active', {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const offers = await response.json();

        // Count offers by category
        const categoryCounts: { [key: string]: number } = {};
        offers.forEach((offer: any) => {
          const category = offer.category || 'General';
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });

        // Build categories array with real counts
        const processedCategories = Object.entries(categoryCounts).map(([name, count], index) => {
          const defaults = categoryDefaults[name] || categoryDefaults['General'];
          return {
            id: String(index + 1),
            name,
            icon: defaults.icon,
            count,
            description: defaults.description,
            color: defaults.color,
          };
        });

        // Sort by count (highest first)
        processedCategories.sort((a, b) => b.count - a.count);
        setCategories(processedCategories);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load categories');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <StudentSidebar 
        activeSection="categories" 
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Categories</h1>
            <p className="text-gray-600 mb-8">Browse discounts by category</p>

            {loading && (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading categories...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {!loading && categories.length === 0 && !error && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No categories available yet.</p>
              </div>
            )}

            {!loading && categories.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300 h-40"
                    >
                      {/* Background Gradient */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                      {/* Content */}
                      <div className="relative h-full bg-white group-hover:bg-opacity-0 transition-all duration-300 p-6 flex flex-col justify-between">
                        <div>
                          <div className="text-4xl mb-3">{category.icon}</div>
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-white transition-colors duration-300 mb-2">
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-600 group-hover:text-white group-hover:text-opacity-90 transition-colors duration-300">
                            {category.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-3 py-1 bg-gray-100 group-hover:bg-white group-hover:bg-opacity-20 text-gray-700 group-hover:text-white text-xs font-semibold rounded-full transition-colors duration-300">
                            {category.count} {category.count === 1 ? 'offer' : 'offers'}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Stats Section */}
                <div className="mt-12 bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Category Statistics</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                      <p className="text-gray-600 text-sm font-medium mb-2">Total Categories</p>
                      <p className="text-3xl font-bold text-blue-600">{categories.length}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                      <p className="text-gray-600 text-sm font-medium mb-2">Total Offers</p>
                      <p className="text-3xl font-bold text-green-600">
                        {categories.reduce((sum, cat) => sum + cat.count, 0)}
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                      <p className="text-gray-600 text-sm font-medium mb-2">Most Popular</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {categories.length > 0 ? categories[0].name.split(' ')[0] : 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                      <p className="text-gray-600 text-sm font-medium mb-2">Avg Offers/Category</p>
                      <p className="text-3xl font-bold text-orange-600">
                        {categories.length > 0 ? Math.round(categories.reduce((sum, cat) => sum + cat.count, 0) / categories.length) : 0}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
