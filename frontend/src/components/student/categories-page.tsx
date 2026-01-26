import { useState } from 'react';
import { StudentSidebar } from './dashboard/sidebar';
import { StudentTopNav } from './dashboard/top-nav';

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

const categories: Category[] = [
  {
    id: '1',
    name: 'Food & Dining',
    icon: '🍔',
    count: 24,
    description: 'Restaurants, food delivery, cafes',
    color: 'from-orange-400 to-red-500',
  },
  {
    id: '2',
    name: 'Fashion',
    icon: '👕',
    count: 18,
    description: 'Clothing, accessories, footwear',
    color: 'from-pink-400 to-purple-500',
  },
  {
    id: '3',
    name: 'E-Commerce',
    icon: '🛍️',
    count: 15,
    description: 'Online shopping, electronics',
    color: 'from-blue-400 to-cyan-500',
  },
  {
    id: '4',
    name: 'Education',
    icon: '📚',
    count: 12,
    description: 'Online courses, learning platforms',
    color: 'from-green-400 to-emerald-500',
  },
  {
    id: '5',
    name: 'Travel',
    icon: '✈️',
    count: 9,
    description: 'Flights, hotels, travel bookings',
    color: 'from-sky-400 to-blue-500',
  },
  {
    id: '6',
    name: 'Entertainment',
    icon: '🎬',
    count: 14,
    description: 'Movies, music, streaming services',
    color: 'from-purple-400 to-indigo-500',
  },
  {
    id: '7',
    name: 'Health & Fitness',
    icon: '💪',
    count: 11,
    description: 'Gym, fitness apps, health products',
    color: 'from-red-400 to-pink-500',
  },
  {
    id: '8',
    name: 'Subscriptions',
    icon: '📱',
    count: 8,
    description: 'Premium memberships, subscriptions',
    color: 'from-indigo-400 to-purple-500',
  },
];

export function StudentCategoriesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
                        {category.count} offers
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
                    {categories.reduce((max, cat) => cat.count > max.count ? cat : max).name.split(' ')[0]}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                  <p className="text-gray-600 text-sm font-medium mb-2">Avg Offers/Category</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {Math.round(categories.reduce((sum, cat) => sum + cat.count, 0) / categories.length)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
