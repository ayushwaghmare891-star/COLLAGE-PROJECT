import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from '../../hooks/use-toast';
import { UserIcon, BuildingIcon, MailIcon, LockIcon, SparklesIcon, ShieldIcon, EyeIcon, EyeOffIcon } from 'lucide-react';

export function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [vendorEmail, setVendorEmail] = useState('');
  const [vendorPassword, setVendorPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const success = await login(studentEmail, studentPassword, 'student');
    
    setLoading(false);

    if (success) {
      toast({
        title: "🎉 Welcome back!",
        description: "You've successfully logged in. Let's find some deals!",
      });
      navigate('/dashboard');
    } else {
      toast({
        title: "❌ Login failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVendorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const success = await login(vendorEmail, vendorPassword, 'vendor');
    
    setLoading(false);

    if (success) {
      toast({
        title: "🚀 Welcome back!",
        description: "You've successfully logged in to your vendor dashboard",
      });
      navigate('/vendor/dashboard');
    } else {
      toast({
        title: "❌ Login failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const success = await login(adminEmail, adminPassword, 'admin');
    
    setLoading(false);

    if (success) {
      toast({
        title: "🛡️ Welcome back, Admin!",
        description: "You've successfully logged in to the admin panel",
      });
      navigate('/admin/dashboard');
    } else {
      toast({
        title: "❌ Login failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl animate-pulse delay-500" />

      <div className="w-full max-w-5xl relative z-10">
        <div className="text-center mb-8">
          <button 
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-3 mb-6 group"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <SparklesIcon className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Student Deals
              </h1>
              <p className="text-xs text-gray-700 dark:text-gray-300">Welcome Back! 👋</p>
            </div>
          </button>
        </div>

        <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-0 shadow-2xl">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
              Sign In to Your Account
            </CardTitle>
            <CardDescription className="text-lg text-gray-700 dark:text-gray-300">
              Every login gets you closer to your next deal 😎
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="student" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
                <TabsTrigger 
                  value="student" 
                  className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all"
                >
                  <UserIcon className="w-4 h-4" strokeWidth={2} />
                  <span className="hidden sm:inline">Student</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="vendor"
                  className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-600 data-[state=active]:text-white transition-all"
                >
                  <BuildingIcon className="w-4 h-4" strokeWidth={2} />
                  <span className="hidden sm:inline">Vendor</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="admin"
                  className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-blue-600 data-[state=active]:text-white transition-all"
                >
                  <ShieldIcon className="w-4 h-4" strokeWidth={2} />
                  <span className="hidden sm:inline">Admin</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="student">
                <form onSubmit={handleStudentLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="student-email" className="text-gray-900 dark:text-white flex items-center gap-2 text-base font-semibold">
                      <MailIcon className="w-4 h-4 text-blue-600" strokeWidth={2} />
                      Email Address
                    </Label>
                    <input
                      id="student-email"
                      type="email"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      placeholder="your.email@university.edu"
                      required
                      autoComplete="email"
                      aria-label="Email address"
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="student-password" className="text-gray-900 dark:text-white flex items-center gap-2 text-base font-semibold">
                      <LockIcon className="w-4 h-4 text-blue-600" strokeWidth={2} />
                      Password
                    </Label>
                    <div className="relative">
                      <input
                        id="student-password"
                        type={showPassword ? "text" : "password"}
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        autoComplete="current-password"
                        aria-label="Password"
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOffIcon className="w-5 h-5" aria-hidden="true" /> : <EyeIcon className="w-5 h-5" aria-hidden="true" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Remember me</span>
                    </label>
                    <button type="button" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold">
                      Forgot password?
                    </button>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="group w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 rounded-xl text-lg font-bold shadow-lg hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {loading ? (
                      <span className="relative flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Signing in...
                      </span>
                    ) : (
                      <span className="relative flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5 animate-pulse" strokeWidth={2.5} />
                        Sign In as Student
                      </span>
                    )}
                  </Button>

                  <div className="text-center">
                    <p className="text-gray-700 dark:text-gray-300">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => navigate('/signup')}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-bold"
                      >
                        Sign up now →
                      </button>
                    </p>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="vendor">
                <form onSubmit={handleVendorLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="vendor-email" className="text-gray-900 dark:text-white flex items-center gap-2 text-base font-semibold">
                      <MailIcon className="w-4 h-4 text-green-600" strokeWidth={2} />
                      Business Email
                    </Label>
                    <input
                      id="vendor-email"
                      type="email"
                      value={vendorEmail}
                      onChange={(e) => setVendorEmail(e.target.value)}
                      placeholder="vendor@company.com"
                      required
                      autoComplete="email"
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vendor-password" className="text-gray-900 dark:text-white flex items-center gap-2 text-base font-semibold">
                      <LockIcon className="w-4 h-4 text-green-600" strokeWidth={2} />
                      Password
                    </Label>
                    <div className="relative">
                      <input
                        id="vendor-password"
                        type={showPassword ? "text" : "password"}
                        value={vendorPassword}
                        onChange={(e) => setVendorPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        autoComplete="current-password"
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Remember me</span>
                    </label>
                    <button type="button" className="text-sm text-green-600 hover:text-green-700 font-medium">
                      Forgot password?
                    </button>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="group w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-6 rounded-xl text-lg font-bold shadow-lg hover:shadow-green-500/50 hover:scale-105 transition-all duration-300 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {loading ? (
                      <span className="relative flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Signing in...
                      </span>
                    ) : (
                      <span className="relative flex items-center gap-2">
                        <BuildingIcon className="w-5 h-5" strokeWidth={2.5} />
                        Sign In as Vendor
                      </span>
                    )}
                  </Button>

                  <div className="text-center">
                    <p className="text-gray-700 dark:text-gray-300">
                      New vendor?{' '}
                      <button
                        type="button"
                        onClick={() => navigate('/signup')}
                        className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-bold"
                      >
                        Register your business →
                      </button>
                    </p>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="admin">
                <form onSubmit={handleAdminLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email" className="text-gray-900 dark:text-white flex items-center gap-2 text-base font-semibold">
                      <MailIcon className="w-4 h-4 text-indigo-600" strokeWidth={2} />
                      Admin Email
                    </Label>
                    <input
                      id="admin-email"
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@studentdeals.com"
                      required
                      autoComplete="email"
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-password" className="text-gray-900 dark:text-white flex items-center gap-2 text-base font-semibold">
                      <LockIcon className="w-4 h-4 text-indigo-600" strokeWidth={2} />
                      Password
                    </Label>
                    <div className="relative">
                      <input
                        id="admin-password"
                        type={showPassword ? "text" : "password"}
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        autoComplete="current-password"
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="group w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white py-6 rounded-xl text-lg font-bold shadow-lg hover:shadow-primary/50 hover:scale-105 transition-all duration-300 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {loading ? (
                      <span className="relative flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Signing in...
                      </span>
                    ) : (
                      <span className="relative flex items-center gap-2">
                        <ShieldIcon className="w-5 h-5" strokeWidth={2.5} />
                        Sign In to Admin Panel
                      </span>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-semibold"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
