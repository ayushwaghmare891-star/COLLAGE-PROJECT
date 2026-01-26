import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { UploadIcon, CheckCircleIcon, ClockIcon, AlertCircleIcon, MailIcon, SparklesIcon, GiftIcon, ArrowRightIcon } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from '../../hooks/use-toast';
import { verificationAPI } from '../../lib/verificationAPI';
import { fetchAllActiveOffers } from '../../lib/offerAPI';

interface Offer {
  _id: string;
  title: string;
  description: string;
  offerType: string;
  offerValue: number;
  category: string;
  startDate: string;
  endDate: string;
  image?: string;
  code?: string;
}

export function VerificationView() {
  const { verificationStatus, setVerificationStatus } = useAppStore();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'document'>('email');
  const [email, setEmail] = useState(user?.email || '');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
    // Check current verification status when component loads
    checkVerificationStatus();

    // Set up polling to check for approval updates every 10 seconds if pending
    const pollInterval = setInterval(() => {
      checkVerificationStatus();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollInterval);
  }, []);

  // Check verification status from backend
  const checkVerificationStatus = async () => {
    try {
      const response = await verificationAPI.getVerificationStatus();
      if (response.success) {
        const status = response.verificationStatus;
        if (status === 'verified') {
          setVerificationStatus('verified');
        } else if (status === 'pending') {
          setVerificationStatus('pending');
        } else {
          setVerificationStatus('not-verified');
        }
      }
    } catch (error) {
      console.error('Failed to check verification status:', error);
      // Continue anyway, use local state
    }
  };

  useEffect(() => {
    if (verificationStatus === 'verified') {
      setCurrentStep(3);
      // Fetch offers when verified
      fetchOffers();
    } else if (verificationStatus === 'pending') {
      setCurrentStep(2);
    }
  }, [verificationStatus]);

  const fetchOffers = async () => {
    try {
      setOffersLoading(true);
      const response = await fetchAllActiveOffers();
      if (response.offers) {
        setOffers(response.offers.slice(0, 6)); // Show first 6 offers
      }
    } catch (error) {
      console.error('Failed to fetch offers:', error);
    } finally {
      setOffersLoading(false);
    }
  };

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleSendCode = async () => {
    if (!email || !email.includes('@')) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await verificationAPI.sendVerificationCode(email);
      setCodeSent(true);
      setResendCountdown(60);
      
      // For development: show test code if available
      if (import.meta.env.DEV && response.code) {
        toast({
          title: 'Code sent (Development)',
          description: `Test code: ${response.code}`,
        });
      } else {
        toast({
          title: 'Code sent',
          description: `Verification code sent to ${email}`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to send code',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: 'Invalid code',
        description: 'Please enter a 6-digit code',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await verificationAPI.verifyEmailCode(email, verificationCode);
      if (response.success) {
        setVerificationStatus('verified');
        setCurrentStep(3);
        toast({
          title: 'Verified!',
          description: 'Your email has been verified successfully',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to verify code',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Maximum file size is 5MB',
          variant: 'destructive',
        });
        return;
      }
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!uploadedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a student ID to upload',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (5MB limit)
    if (uploadedFile.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 5MB',
        variant: 'destructive',
      });
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(uploadedFile.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Only images (JPG, PNG, GIF) and PDFs are allowed',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      toast({
        title: 'Uploading...',
        description: `Uploading ${uploadedFile.name}...`,
      });

      await verificationAPI.uploadStudentId(uploadedFile);
      setVerificationStatus('verified');
      setCurrentStep(3);
      setUploadedFile(null);
      setPreviewUrl('');
      toast({
        title: '✅ Upload successful!',
        description: 'Your student ID has been uploaded and verified',
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error?.message || 'Failed to upload document. Please try again.';
      toast({
        title: '❌ Upload failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    setVerificationStatus('verified');
    setCurrentStep(3);
    toast({
      title: 'Verification complete',
      description: 'You can now access all student discounts',
    });
  };

  const steps = [
    { number: 1, title: 'Choose Method', icon: MailIcon },
    { number: 2, title: 'Verify', icon: ClockIcon },
    { number: 3, title: 'Confirmed', icon: CheckCircleIcon },
  ];

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      <div>
        <h1 className="text-h1 font-semibold text-foreground leading-heading tracking-heading mb-4">
          Student Verification
        </h1>
        <p className="text-body text-muted-foreground leading-body">
          Verify your student status to unlock exclusive discounts
        </p>
      </div>

      <Card className="bg-card text-card-foreground border-border">
        <CardHeader>
          <CardTitle className="text-h3 text-card-foreground">Verification Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <Progress value={(currentStep / 3) * 100} className="h-2" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {steps.map((step) => {
                const Icon = step.icon;
                const isActive = currentStep === step.number;
                const isComplete = currentStep > step.number;

                return (
                  <div
                    key={step.number}
                    className={`p-6 border rounded-lg text-center space-y-3 ${
                      isActive
                        ? 'border-primary bg-primary/5'
                        : isComplete
                          ? 'border-success bg-success/5'
                          : 'border-border bg-background'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : isComplete
                            ? 'bg-success text-success-foreground'
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <Icon className="w-6 h-6" strokeWidth={2} />
                    </div>
                    <h3
                      className={`font-semibold ${
                        isActive || isComplete ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {step.title}
                    </h3>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {currentStep === 1 && (
        <Card className="bg-card text-card-foreground border-border">
          <CardHeader>
            <CardTitle className="text-h3 text-card-foreground">Choose Verification Method</CardTitle>
            <CardDescription className="text-muted-foreground">
              Select how you want to verify your student status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email Verification */}
              <button
                onClick={() => setVerificationMethod('email')}
                className={`p-6 border-2 rounded-lg transition-all text-left ${
                  verificationMethod === 'email'
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-background hover:border-primary'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MailIcon className="w-6 h-6 text-primary" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Email Verification</h3>
                    <p className="text-small text-muted-foreground">
                      Get a code sent to your student email instantly
                    </p>
                  </div>
                </div>
              </button>

              {/* Document Upload */}
              <button
                onClick={() => setVerificationMethod('document')}
                className={`p-6 border-2 rounded-lg transition-all text-left ${
                  verificationMethod === 'document'
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-background hover:border-primary'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <UploadIcon className="w-6 h-6 text-primary" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Student ID Upload</h3>
                    <p className="text-small text-muted-foreground">
                      Upload your student ID for manual verification
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Email Method */}
            {verificationMethod === 'email' && (
              <div className="space-y-6 border-t pt-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Student Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@university.edu"
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {!codeSent ? (
                  <Button
                    onClick={handleSendCode}
                    disabled={loading || !email}
                    className="w-full bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground"
                  >
                    {loading ? 'Sending...' : 'Send Verification Code'}
                  </Button>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Verification Code
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.slice(0, 6))}
                          placeholder="000000"
                          maxLength={6}
                          className="flex-1 px-4 py-3 border border-border rounded-lg bg-background text-foreground text-center text-2xl letter-spacing font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Check your email for the 6-digit code
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleVerifyCode}
                        disabled={loading || verificationCode.length !== 6}
                        className="flex-1 bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground"
                      >
                        {loading ? 'Verifying...' : 'Verify Code'}
                      </Button>
                      <Button
                        onClick={handleSendCode}
                        disabled={loading || resendCountdown > 0}
                        variant="outline"
                        className="bg-neutral text-neutral-foreground border-border hover:bg-muted hover:text-foreground"
                      >
                        {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend'}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Document Method */}
            {verificationMethod === 'document' && (
              <div className="space-y-6 border-t pt-6">
                <div className="relative border-2 border-dashed border-border rounded-lg p-12 text-center bg-background">
                  {previewUrl ? (
                    <div className="space-y-4">
                      <img
                        src={previewUrl}
                        alt="Student ID preview"
                        className="max-w-md mx-auto rounded-lg"
                        loading="lazy"
                      />
                      <p className="text-small text-muted-foreground">{uploadedFile?.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                        <UploadIcon className="w-8 h-8 text-muted-foreground" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-foreground font-semibold mb-2">Click to upload or drag and drop</p>
                        <p className="text-small text-muted-foreground">PNG, JPG or PDF (max. 5MB)</p>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>

                <div className="bg-muted/50 border border-border rounded-lg p-6 space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertCircleIcon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" strokeWidth={2} />
                    <div className="space-y-2">
                      <p className="font-semibold text-foreground">Requirements:</p>
                      <ul className="text-small text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Must be a current student ID</li>
                        <li>Photo must be clear and readable</li>
                        <li>All information must be visible</li>
                        <li>Expiration date must be valid</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleUpload}
                  disabled={!uploadedFile || loading}
                  className="w-full bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground"
                >
                  {loading ? 'Uploading...' : 'Upload and Continue'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <Card className="bg-card text-card-foreground border-border">
          <CardHeader>
            <CardTitle className="text-h3 text-card-foreground">Under Review</CardTitle>
            <CardDescription className="text-muted-foreground">
              Your verification is being processed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-12 space-y-6">
              <div className="w-20 h-20 bg-warning/10 rounded-full flex items-center justify-center mx-auto">
                <ClockIcon className="w-10 h-10 text-warning" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-h3 font-semibold text-foreground mb-2">Verification in Progress</h3>
                <p className="text-body text-muted-foreground leading-body">
                  {verificationMethod === 'email'
                    ? 'Your email has been verified. Thank you!'
                    : 'This usually takes 1-2 business days. We will notify you once complete.'}
                </p>
              </div>
            </div>

            {previewUrl && (
              <div className="border border-border rounded-lg p-6 bg-background">
                <p className="text-small font-semibold text-foreground mb-4">Uploaded Document:</p>
                <img
                  src={previewUrl}
                  alt="Uploaded student ID"
                  className="max-w-sm mx-auto rounded-lg"
                  loading="lazy"
                />
              </div>
            )}

            <Button
              onClick={handleConfirm}
              variant="outline"
              className="w-full bg-neutral text-neutral-foreground border-border hover:bg-muted hover:text-foreground"
            >
              {verificationMethod === 'email' ? 'Continue' : 'Simulate Approval (Demo)'}
            </Button>
          </CardContent>
        </Card>
      )}

      {currentStep === 3 && (
        <>
          <Card className="bg-card text-card-foreground border-border">
          <CardHeader>
            <CardTitle className="text-h3 text-card-foreground">Verification Complete</CardTitle>
            <CardDescription className="text-muted-foreground">
              Your student status has been verified successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-12 space-y-6">
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircleIcon className="w-10 h-10 text-success" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-h3 font-semibold text-foreground mb-2">You're All Set!</h3>
                <p className="text-body text-muted-foreground leading-body">
                  You now have access to all exclusive student discounts
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => (window.location.href = '/discounts')}
                className="bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground"
              >
                Browse Discounts
              </Button>
              <Button
                onClick={() => (window.location.href = '/dashboard')}
                variant="outline"
                className="bg-neutral text-neutral-foreground border-border hover:bg-muted hover:text-foreground"
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/5 to-card border-success/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <GiftIcon className="w-6 h-6 text-success" />
              <div>
                <CardTitle className="text-h3 text-card-foreground">🎉 Exclusive Offers Available</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Check out amazing deals from our partner vendors
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {offersLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading offers...</p>
              </div>
            ) : offers.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {offers.map((offer) => (
                    <div
                      key={offer._id}
                      className="border border-border rounded-lg p-4 hover:shadow-md hover:border-primary/50 transition-all bg-background"
                    >
                      {offer.image && (
                        <img
                          src={offer.image}
                          alt={offer.title}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                      )}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-foreground line-clamp-2">{offer.title}</h4>
                        <p className="text-small text-muted-foreground line-clamp-2">{offer.description}</p>
                        
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2">
                            <SparklesIcon className="w-4 h-4 text-warning" />
                            <span className="font-bold text-lg text-success">
                              {offer.offerValue}
                              {offer.offerType === 'percentage' ? '%' : '₹'}
                            </span>
                          </div>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {offer.category}
                          </span>
                        </div>

                        {offer.code && (
                          <div className="bg-primary/10 rounded p-2 mt-3">
                            <p className="text-xs text-muted-foreground mb-1">Code:</p>
                            <p className="font-mono font-bold text-primary">{offer.code}</p>
                          </div>
                        )}

                        <Button
                          size="sm"
                          onClick={() => (window.location.href = '/discounts')}
                          className="w-full mt-3 bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground"
                        >
                          View Offer <ArrowRightIcon className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-6">
                  <Button
                    onClick={() => (window.location.href = '/discounts')}
                    variant="outline"
                    className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                  >
                    View All Offers ({offers.length}+)
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <GiftIcon className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">No offers available right now</p>
              </div>
            )}
          </CardContent>
        </Card>
        </>
      )}
    </div>
  );
}

