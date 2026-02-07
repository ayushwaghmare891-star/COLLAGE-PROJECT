import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from '../../hooks/use-toast';
import { UserIcon, MailIcon, LockIcon, UserCircleIcon, SchoolIcon, SparklesIcon, UploadIcon, CheckCircleIcon, EyeIcon, EyeOffIcon, PhoneIcon, MapPinIcon, BookOpenIcon, CalendarIcon } from 'lucide-react';

export function SignupForm() {
  const navigate = useNavigate();
  const { signup } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [studentStep, setStudentStep] = useState(1);
  const [studentIdFile, setStudentIdFile] = useState<File | null>(null);

  const [studentData, setStudentData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    university: '',
    department: '',
    yearOfStudy: '1st Year',
    phone: '',
    city: '',
    country: 'United States',
    agreeToTerms: false,
  });

  const handleStudentIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStudentIdFile(file);
      toast({
        title: "✅ File uploaded",
        description: `${file.name} is ready to submit`,
      });
    }
  };

  const handleStudentSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate name length (minimum 3 characters)
    if (!studentData.name || studentData.name.trim().length < 3) {
      toast({
        title: "❌ Invalid name",
        description: "Name must be at least 3 characters long",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(studentData.email)) {
      toast({
        title: "❌ Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    // Validate password length (minimum 6 characters)
    if (!studentData.password || studentData.password.length < 6) {
      toast({
        title: "❌ Weak password",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    if (studentData.password !== studentData.confirmPassword) {
      toast({
        title: "❌ Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      return;
    }

    if (!studentData.agreeToTerms) {
      toast({
        title: "📋 Terms required",
        description: "Please agree to the terms and conditions",
        variant: "destructive",
      });
      return;
    }

    if (!studentIdFile) {
      toast({
        title: "📄 Student ID required",
        description: "Please upload your student ID to continue",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const success = await signup(
        studentData.email,
        studentData.password,
        studentData.name,
        'student',
        { university: studentData.university }
      );

      setLoading(false);

      if (success) {
        toast({
          title: "🎉 Welcome to Student Deals!",
          description: "Your account has been created. Start saving now!",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "❌ Signup failed",
          description: "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      setLoading(false);
      const errorMsg = error instanceof Error ? error.message : 'Signup failed. Please try again.';
      toast({
        title: "❌ Signup error",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];
  const countries = ['United States', 'United Kingdom', 'Canada', 'Australia', 'India', 'Other'];

  const progressPercentage = (studentStep / 4) * 100;

  const motivationalQuotes = [
    "Start saving smart! 💰",
    "Every penny saved is a penny earned! 🎓",
    "Your journey to smart savings begins here! ✨",
    "Join thousands of students saving money! 🚀"
  ];

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
              <p className="text-xs text-gray-700 dark:text-gray-300">Join the Community! 🎉</p>
            </div>
          </button>
        </div>

        <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-0 shadow-2xl">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
              Create Your Account
            </CardTitle>
            <CardDescription className="text-lg text-gray-700 dark:text-gray-300">
              {motivationalQuotes[studentStep - 1] || "Sign up & start saving 💸"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="student" className="w-full">
              <TabsList className="grid w-full grid-cols-1 mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
                <TabsTrigger 
                  value="student" 
                  className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all"
                >
                  <UserIcon className="w-4 h-4" strokeWidth={2} />
                  I'm a Student 🎓
                </TabsTrigger>
              </TabsList>

              <TabsContent value="student">
                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Step {studentStep} of 4
                    </span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {Math.round(progressPercentage)}% Complete
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-3 rounded-full" />
                </div>

                <form onSubmit={handleStudentSignup} className="space-y-6">
                  {/* Step 1: Basic Info */}
                  {studentStep === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="student-name" className="text-gray-900 dark:text-white flex items-center gap-2 text-base font-semibold">
                            <UserCircleIcon className="w-4 h-4 text-blue-600" strokeWidth={2} />
                            Full Name *
                          </Label>
                          <input
                            id="student-name"
                            type="text"
                            value={studentData.name}
                            onChange={(e) => setStudentData({ ...studentData, name: e.target.value })}
                            placeholder="John Doe"
                            required
                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="student-email" className="text-gray-900 dark:text-white flex items-center gap-2 text-base font-semibold">
                            <MailIcon className="w-4 h-4 text-blue-600" strokeWidth={2} />
                            Email ID *
                          </Label>
                          <input
                            id="student-email"
                            type="email"
                            value={studentData.email}
                            onChange={(e) => setStudentData({ ...studentData, email: e.target.value })}
                            placeholder="student@university.edu"
                            required
                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="student-password" className="text-gray-900 dark:text-white flex items-center gap-2 text-base font-semibold">
                            <LockIcon className="w-4 h-4 text-blue-600" strokeWidth={2} />
                            Password *
                          </Label>
                          <div className="relative">
                            <input
                              id="student-password"
                              type={showPassword ? "text" : "password"}
                              value={studentData.password}
                              onChange={(e) => setStudentData({ ...studentData, password: e.target.value })}
                              placeholder="••••••••"
                              required
                              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                              {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="student-confirm-password" className="text-gray-900 dark:text-white flex items-center gap-2 text-base font-semibold">
                            <LockIcon className="w-4 h-4 text-blue-600" strokeWidth={2} />
                            Confirm Password *
                          </Label>
                          <input
                            id="student-confirm-password"
                            type="password"
                            value={studentData.confirmPassword}
                            onChange={(e) => setStudentData({ ...studentData, confirmPassword: e.target.value })}
                            placeholder="••••••••"
                            required
                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>

                      <Button
                        type="button"
                        onClick={() => setStudentStep(2)}
                        className="group w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 rounded-xl text-lg font-bold shadow-lg hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300 relative overflow-hidden"
                      >
                        <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="relative flex items-center justify-center gap-2">
                          Continue →
                        </span>
                      </Button>
                    </div>
                  )}

                  {/* Step 2: Academic Info */}
                  {studentStep === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="student-university" className="text-gray-900 dark:text-white flex items-center gap-2 text-base font-semibold">
                            <SchoolIcon className="w-4 h-4 text-blue-600" strokeWidth={2} />
                            College / University *
                          </Label>
                          <input
                            id="student-university"
                            type="text"
                            value={studentData.university}
                            onChange={(e) => setStudentData({ ...studentData, university: e.target.value })}
                            placeholder="State University"
                            required
                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="student-department" className="text-gray-900 dark:text-white flex items-center gap-2 text-base font-semibold">
                            <BookOpenIcon className="w-4 h-4 text-blue-600" strokeWidth={2} />
                            Department / Course *
                          </Label>
                          <input
                            id="student-department"
                            type="text"
                            value={studentData.department}
                            onChange={(e) => setStudentData({ ...studentData, department: e.target.value })}
                            placeholder="Computer Science"
                            required
                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="student-year" className="text-gray-900 dark:text-white flex items-center gap-2 text-base font-semibold">
                          <CalendarIcon className="w-4 h-4 text-blue-600" strokeWidth={2} />
                          Year of Study *
                        </Label>
                        <select
                          id="student-year"
                          value={studentData.yearOfStudy}
                          onChange={(e) => setStudentData({ ...studentData, yearOfStudy: e.target.value })}
                          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                          {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          type="button"
                          onClick={() => setStudentStep(1)}
                          variant="outline"
                          className="flex-1 py-6 rounded-xl text-lg font-semibold border-2"
                        >
                          ← Back
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setStudentStep(3)}
                          className="group flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 rounded-xl text-lg font-bold shadow-lg hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300 relative overflow-hidden"
                        >
                          <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <span className="relative">Continue →</span>
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Contact Info */}
                  {studentStep === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="student-phone" className="text-gray-900 dark:text-white flex items-center gap-2 text-base font-semibold">
                            <PhoneIcon className="w-4 h-4 text-blue-600" strokeWidth={2} />
                            Phone Number *
                          </Label>
                          <input
                            id="student-phone"
                            type="tel"
                            value={studentData.phone}
                            onChange={(e) => setStudentData({ ...studentData, phone: e.target.value })}
                            placeholder="+1 (555) 123-4567"
                            required
                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="student-country" className="text-gray-900 dark:text-white flex items-center gap-2 text-base font-semibold">
                            <MapPinIcon className="w-4 h-4 text-blue-600" strokeWidth={2} />
                            Country *
                          </Label>
                          <select
                            id="student-country"
                            value={studentData.country}
                            onChange={(e) => setStudentData({ ...studentData, country: e.target.value })}
                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          >
                            {countries.map(country => (
                              <option key={country} value={country}>{country}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="student-city" className="text-gray-900 dark:text-white flex items-center gap-2 text-base font-semibold">
                          <MapPinIcon className="w-4 h-4 text-blue-600" strokeWidth={2} />
                          City *
                        </Label>
                        <input
                          id="student-city"
                          type="text"
                          value={studentData.city}
                          onChange={(e) => setStudentData({ ...studentData, city: e.target.value })}
                          placeholder="San Francisco"
                          required
                          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button
                          type="button"
                          onClick={() => setStudentStep(2)}
                          variant="outline"
                          className="flex-1 py-6 rounded-xl text-lg font-semibold border-2"
                        >
                          ← Back
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setStudentStep(4)}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 py-6 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                        >
                          Continue →
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Upload ID & Terms */}
                  {studentStep === 4 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                      <div className="space-y-2">
                        <Label className="text-gray-900 dark:text-white flex items-center gap-2 text-base font-semibold">
                          <UploadIcon className="w-4 h-4 text-blue-600" strokeWidth={2} />
                          Upload College ID Card *
                        </Label>
                        <div className="border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-xl p-8 text-center bg-gray-50 dark:bg-gray-800/50 hover:border-blue-500 transition-colors">
                          <input
                            id="student-id-upload"
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleStudentIdUpload}
                            className="hidden"
                          />
                          {studentIdFile ? (
                            <div className="space-y-4">
                              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" strokeWidth={2} />
                              </div>
                              <div>
                                <p className="text-gray-900 dark:text-white font-semibold mb-1">{studentIdFile.name}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {(studentIdFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                              <Button
                                type="button"
                                onClick={() => document.getElementById('student-id-upload')?.click()}
                                variant="outline"
                                className="rounded-xl border-2"
                              >
                                Change File
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
                                <UploadIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                              </div>
                              <div>
                                <p className="text-gray-900 dark:text-white font-semibold mb-2">Click to upload or drag and drop</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  PNG, JPG or PDF (max. 5MB)
                                </p>
                              </div>
                              <Button
                                type="button"
                                onClick={() => document.getElementById('student-id-upload')?.click()}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 rounded-xl"
                              >
                                <UploadIcon className="w-4 h-4 mr-2" strokeWidth={2} />
                                Select File
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-950/50 border-2 border-blue-300 dark:border-blue-700 rounded-xl p-4">
                        <p className="text-sm text-blue-900 dark:text-blue-200 font-medium">
                          📝 <strong>Note:</strong> Your student ID will be verified within 24-48 hours. You'll receive an email once approved!
                        </p>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-gray-300 dark:border-gray-600">
                        <input
                          type="checkbox"
                          id="student-terms"
                          checked={studentData.agreeToTerms}
                          onChange={(e) => setStudentData({ ...studentData, agreeToTerms: e.target.checked })}
                          className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="student-terms" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                          I agree to the <button type="button" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold">Terms & Conditions</button> and <button type="button" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold">Privacy Policy</button>
                        </label>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          type="button"
                          onClick={() => setStudentStep(3)}
                          variant="outline"
                          className="flex-1 py-6 rounded-xl text-lg font-semibold border-2"
                        >
                          ← Back
                        </Button>
                        <Button
                          type="submit"
                          disabled={loading || !studentData.agreeToTerms}
                          className="group flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 rounded-xl text-lg font-bold shadow-lg hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                          <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          {loading ? (
                            <span className="relative flex items-center gap-2">
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Creating account...
                            </span>
                          ) : (
                            <span className="relative flex items-center gap-2">
                              <SparklesIcon className="w-5 h-5 animate-pulse" strokeWidth={2.5} />
                              Create Account
                            </span>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="text-center pt-4">
                    <p className="text-gray-700 dark:text-gray-300">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-bold"
                      >
                        Sign in →
                      </button>
                    </p>
                  </div>
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
