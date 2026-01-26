import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { SparklesIcon, TagIcon, ShieldCheckIcon, TrendingUpIcon, HeartIcon, ZapIcon, GraduationCapIcon, StoreIcon, UsersIcon } from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: TagIcon,
      title: 'Save Money',
      description: 'Get exclusive discounts from top brands',
      color: 'from-blue-500 to-purple-500'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Verified Deals',
      description: 'All offers verified for students only',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: TrendingUpIcon,
      title: 'Exclusive Brands',
      description: 'Access deals from 500+ partners',
      color: 'from-pink-500 to-red-500'
    },
    {
      icon: ZapIcon,
      title: 'Instant Access',
      description: 'Claim offers in seconds',
      color: 'from-orange-500 to-yellow-500'
    }
  ];

  const brands = [
    { name: 'Apple', logo: '🍎' },
    { name: 'Nike', logo: '👟' },
    { name: 'Spotify', logo: '🎵' },
    { name: 'Amazon', logo: '📦' },
    { name: 'Netflix', logo: '🎬' },
    { name: 'Adobe', logo: '🎨' }
  ];

  const userTypes = [
    {
      icon: GraduationCapIcon,
      title: 'For Students',
      description: 'Unlock exclusive discounts and save on everything you love',
      color: 'from-blue-500 to-purple-600',
      action: () => navigate('/signup'),
      buttonText: 'Join as Student'
    },
    {
      icon: StoreIcon,
      title: 'For Vendors',
      description: 'Reach thousands of students and grow your business',
      color: 'from-green-500 to-teal-600',
      action: () => navigate('/signup'),
      buttonText: 'Join as Vendor'
    },
    {
      icon: UsersIcon,
      title: 'For Admins',
      description: 'Manage the platform and monitor all activities',
      color: 'from-indigo-600 to-blue-600',
      action: () => navigate('/login'),
      buttonText: 'Admin Login'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg" role="img" aria-label="Student Deals Logo">
                <SparklesIcon className="w-7 h-7 text-white" strokeWidth={2.5} aria-hidden="true" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Student Deals
                </span>
                <p className="text-xs text-gray-600 dark:text-gray-400">Save Smart, Live Better</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate('/signup')}
                size="lg"
                className="group relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-2xl text-lg px-10 py-7 rounded-2xl font-bold hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center gap-2">
                  <SparklesIcon className="w-6 h-6 animate-pulse" strokeWidth={2.5} />
                  Get Started Now
                </span>
              </Button>
              <Button
                onClick={() => navigate('/signup')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg"
                aria-label="Get started with Student Deals"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8" aria-labelledby="hero-heading">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-full border border-purple-200 dark:border-purple-800">
              <SparklesIcon className="w-4 h-4 text-purple-600" strokeWidth={2} />
              <span className="text-sm font-semibold text-purple-600">Trusted by 50,000+ Students</span>
            </div>

            <h1 id="hero-heading" className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Unlock Exclusive
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">Student Discounts</span>
              <br />
              <span className="text-gray-900 dark:text-white">Instantly! <span role="img" aria-label="graduation cap and money">🎓💸</span></span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Join thousands of students saving money on food, fashion, tech, and more. 
              Verify once, save forever.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={() => navigate('/signup')}
                size="lg"
                className="group relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-2xl text-lg px-10 py-7 rounded-2xl font-bold hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center gap-2">
                  <SparklesIcon className="w-6 h-6 animate-pulse" strokeWidth={2.5} />
                  Join Now - It's Free!
                </span>
              </Button>
              <Button
                onClick={() => navigate('/discounts')}
                size="lg"
                className="group relative bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 shadow-xl text-lg px-10 py-7 rounded-2xl border-2 border-purple-200 dark:border-purple-800 font-bold hover:shadow-purple-500/30 hover:scale-105 transition-all duration-300"
              >
                <span className="relative flex items-center gap-2">
                  <TagIcon className="w-6 h-6 group-hover:rotate-12 transition-transform" strokeWidth={2.5} />
                  View Offers
                </span>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 pt-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">500+</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Partner Brands</p>
              </div>
              <div className="w-px h-12 bg-gray-300 dark:bg-gray-700" />
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">50K+</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Students</p>
              </div>
              <div className="w-px h-12 bg-gray-300 dark:bg-gray-700" />
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">$2M+</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Money Saved</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm" aria-labelledby="features-heading">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 id="features-heading" className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Students Love Us <span role="img" aria-label="red heart">❤️</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Everything you need to save money as a student
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
              >
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`} role="img" aria-label={feature.title}>
                    <feature.icon className="w-8 h-8 text-white" strokeWidth={2} aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Top Brands Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Top Brands You'll Love 🌟
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Exclusive deals from your favorite companies
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {brands.map((brand, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
              >
                <CardContent className="p-8 text-center">
                  <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                    {brand.logo}
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {brand.name}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Path 🚀
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Join as a student, vendor, or admin
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {userTypes.map((type, index) => (
              <Card
                key={index}
                className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 overflow-hidden"
              >
                <div className={`h-2 bg-gradient-to-r ${type.color}`} />
                <CardContent className="p-8 text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-br ${type.color} rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <type.icon className="w-10 h-10 text-white" strokeWidth={2} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {type.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {type.description}
                  </p>
                  <Button
                    onClick={type.action}
                    className={`group w-full bg-gradient-to-r ${type.color} text-white hover:opacity-90 shadow-lg py-6 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden`}
                  >
                    <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative flex items-center justify-center gap-2">
                      <SparklesIcon className="w-5 h-5" strokeWidth={2.5} />
                      {type.buttonText}
                    </span>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white overflow-hidden">
            <CardContent className="p-12 text-center relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />
              
              <div className="relative z-10">
                <h2 className="text-4xl font-bold mb-4">
                  Ready to Start Saving? 💰
                </h2>
                <p className="text-xl mb-8 text-blue-100">
                  Join 50,000+ students already saving money every day
                </p>
                <Button
                  onClick={() => navigate('/signup')}
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50 shadow-2xl text-lg px-8 py-6 rounded-2xl"
                >
                  <SparklesIcon className="w-5 h-5 mr-2" strokeWidth={2} />
                  Get Started Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white" role="contentinfo">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <SparklesIcon className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-bold">Student Deals</h3>
              </div>
              <p className="text-gray-400">
                Your trusted platform for exclusive student discounts
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Business</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Become a Partner</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Vendor Login</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Resources</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Connect With Us</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">📷 Instagram</a></li>
                <li><a href="#" className="hover:text-white transition-colors">💼 LinkedIn</a></li>
                <li><a href="#" className="hover:text-white transition-colors">🐦 Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">📧 Email</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2025 Student Deals. All rights reserved. Made with ❤️ for students.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

