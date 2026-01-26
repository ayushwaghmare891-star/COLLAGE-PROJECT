import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { BuildingIcon, MailIcon, PhoneIcon, MapPinIcon, ShieldCheckIcon, UploadIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from '../../hooks/use-toast';

export function VendorProfile() {
  const { user, updateUser } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    businessName: user?.companyName || 'Tech Company Inc.',
    category: 'Technology',
    email: user?.email || 'vendor@company.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business St, San Francisco, CA 94102',
    description: 'Leading technology provider offering exclusive student discounts on laptops, software, and accessories.',
  });

  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'rejected'>('verified');
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocumentFile(file);
      toast({
        title: "Document selected",
        description: `${file.name} ready to upload`,
      });
    }
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);

    updateUser({ companyName: formData.businessName });

    toast({
      title: "Profile updated",
      description: "Your vendor profile has been saved successfully",
    });
  };

  const handleResubmitVerification = async () => {
    if (!documentFile) {
      toast({
        title: "No document selected",
        description: "Please select a verification document to upload",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);

    setVerificationStatus('pending');
    setDocumentFile(null);

    toast({
      title: "Verification submitted",
      description: "Your documents are being reviewed. This usually takes 1-2 business days.",
    });
  };

  const categories = [
    'Technology',
    'Fashion',
    'Food & Dining',
    'Entertainment',
    'Fitness & Wellness',
    'Education',
    'Travel',
    'Other'
  ];

  const getVerificationBadge = () => {
    switch (verificationStatus) {
      case 'verified':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800">
            <CheckCircleIcon className="w-4 h-4 mr-1" strokeWidth={2} />
            Verified Business
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800">
            <ClockIcon className="w-4 h-4 mr-1" strokeWidth={2} />
            Verification Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-800">
            <XCircleIcon className="w-4 h-4 mr-1" strokeWidth={2} />
            Verification Rejected
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Vendor Profile
        </h1>
        <p className="text-body text-muted-foreground">
          Manage your business information and verification status
        </p>
      </div>

      <Card className={`border-2 ${
        verificationStatus === 'verified' ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' :
        verificationStatus === 'pending' ? 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800' :
        'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
      }`}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                verificationStatus === 'verified' ? 'bg-green-500' :
                verificationStatus === 'pending' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}>
                <ShieldCheckIcon className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-foreground">Verification Status</h3>
                  {getVerificationBadge()}
                </div>
                <p className="text-sm text-muted-foreground">
                  {verificationStatus === 'verified' && 'Your business is verified and can post offers to students.'}
                  {verificationStatus === 'pending' && 'Your verification documents are being reviewed by our team.'}
                  {verificationStatus === 'rejected' && 'Your verification was rejected. Please resubmit valid documents.'}
                </p>
              </div>
            </div>
            {verificationStatus !== 'verified' && (
              <Button
                onClick={() => document.getElementById('verification-upload')?.click()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 whitespace-nowrap"
              >
                <UploadIcon className="w-4 h-4 mr-2" strokeWidth={2} />
                {verificationStatus === 'pending' ? 'Update Documents' : 'Resubmit Documents'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card text-card-foreground border-border">
        <CardHeader>
          <CardTitle className="text-h3 text-card-foreground">Business Information</CardTitle>
          <CardDescription className="text-muted-foreground">
            Update your business details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-foreground flex items-center gap-2">
                <BuildingIcon className="w-4 h-4" strokeWidth={2} />
                Business Name
              </Label>
              <input
                id="businessName"
                type="text"
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-foreground">
                Business Category
              </Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground flex items-center gap-2">
                <MailIcon className="w-4 h-4" strokeWidth={2} />
                Business Email
              </Label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground flex items-center gap-2">
                <PhoneIcon className="w-4 h-4" strokeWidth={2} />
                Phone Number
              </Label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-foreground flex items-center gap-2">
              <MapPinIcon className="w-4 h-4" strokeWidth={2} />
              Business Address
            </Label>
            <input
              id="address"
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">
              Business Description
            </Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <Separator />

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              className="bg-neutral text-neutral-foreground border-border hover:bg-muted hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveChanges}
              disabled={loading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {verificationStatus !== 'verified' && (
        <Card className="bg-card text-card-foreground border-border">
          <CardHeader>
            <CardTitle className="text-h3 text-card-foreground">Verification Documents</CardTitle>
            <CardDescription className="text-muted-foreground">
              Upload business registration or tax documents for verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-background">
              <input
                id="verification-upload"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
              {documentFile ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-foreground font-semibold mb-1">{documentFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(documentFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    onClick={() => document.getElementById('verification-upload')?.click()}
                    variant="outline"
                    className="bg-neutral text-neutral-foreground border-border hover:bg-muted hover:text-foreground"
                  >
                    Choose Different File
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <UploadIcon className="w-8 h-8 text-muted-foreground" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-foreground font-semibold mb-2">Upload Verification Document</p>
                    <p className="text-sm text-muted-foreground">
                      PDF, JPG, or PNG (max. 10MB)
                    </p>
                  </div>
                  <Button
                    onClick={() => document.getElementById('verification-upload')?.click()}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <UploadIcon className="w-4 h-4 mr-2" strokeWidth={2} />
                    Select Document
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Required Documents:
              </p>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                <li>Business registration certificate</li>
                <li>Tax identification number (TIN)</li>
                <li>Business license or permit</li>
                <li>Proof of business address</li>
              </ul>
            </div>

            {documentFile && (
              <Button
                onClick={handleResubmitVerification}
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? 'Submitting...' : 'Submit for Verification'}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

