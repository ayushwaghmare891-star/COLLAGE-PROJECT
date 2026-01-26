import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { TagIcon, PercentIcon, CalendarIcon, FileTextIcon, ImageIcon, CheckCircleIcon } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from '../../hooks/use-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function AddOffer() {
  const navigate = useNavigate();
  const { addVendorDiscount } = useAppStore();
  const { token } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    expiryDate: '',
    category: 'Technology',
    terms: '',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = () => {
    if (!formData.title || !formData.description || !formData.discountValue || !formData.expiryDate) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setShowConfirmation(true);
  };

  const confirmPublish = async () => {
    setLoading(true);

    try {
      // Prepare offer data
      const offerData = {
        title: formData.title,
        description: formData.description,
        offerType: formData.discountType === 'percentage' ? 'percentage' : 'fixed',
        offerValue: parseFloat(formData.discountValue),
        category: formData.category,
        startDate: new Date().toISOString(),
        endDate: new Date(formData.expiryDate).toISOString(),
        terms: formData.terms,
      };

      // Send to backend
      const response = await fetch(`${API_BASE_URL}/offers/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(offerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create offer');
      }

      const result = await response.json();

      // Also add to local store for immediate UI update
      const expiryDays = Math.ceil(
        (new Date(formData.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      const discountText = formData.discountType === 'percentage' 
        ? `${formData.discountValue}% off`
        : `$${formData.discountValue} off`;

      addVendorDiscount({
        vendorId: result.vendor?.vendorId || 'vendor1',
        brand: formData.title,
        discount: discountText,
        description: formData.description,
        category: formData.category,
        expiryDays: expiryDays,
        isExpired: false,
        isUsed: false,
        termsAndConditions: formData.terms,
        isActive: true,
      });

      setLoading(false);
      setShowConfirmation(false);

      toast({
        title: "Offer published!",
        description: "Your discount offer is now live for students",
      });

      navigate('/vendor/offers');
    } catch (error) {
      setLoading(false);
      console.error('Error creating offer:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to create offer',
        variant: "destructive",
      });
    }
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Create New Offer
        </h1>
        <p className="text-body text-muted-foreground">
          Set up a new student discount offer for your business
        </p>
      </div>

      <Card className="bg-card text-card-foreground border-border">
        <CardHeader>
          <CardTitle className="text-h3 text-card-foreground">Offer Details</CardTitle>
          <CardDescription className="text-muted-foreground">
            Provide information about your discount offer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground flex items-center gap-2">
              <TagIcon className="w-4 h-4" strokeWidth={2} />
              Offer Title *
            </Label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Student Laptop Discount"
              className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">
              Description *
            </Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your offer and what students will get..."
              rows={4}
              className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="discountType" className="text-foreground flex items-center gap-2">
                <PercentIcon className="w-4 h-4" strokeWidth={2} />
                Discount Type *
              </Label>
              <select
                id="discountType"
                value={formData.discountType}
                onChange={(e) => handleInputChange('discountType', e.target.value)}
                className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount ($)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountValue" className="text-foreground">
                Discount Value *
              </Label>
              <input
                id="discountValue"
                type="number"
                value={formData.discountValue}
                onChange={(e) => handleInputChange('discountValue', e.target.value)}
                placeholder={formData.discountType === 'percentage' ? '20' : '50'}
                className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-foreground">
                Category *
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate" className="text-foreground flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" strokeWidth={2} />
              Expiry Date *
            </Label>
            <input
              id="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={(e) => handleInputChange('expiryDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="terms" className="text-foreground flex items-center gap-2">
              <FileTextIcon className="w-4 h-4" strokeWidth={2} />
              Terms & Conditions
            </Label>
            <textarea
              id="terms"
              value={formData.terms}
              onChange={(e) => handleInputChange('terms', e.target.value)}
              placeholder="Enter any terms, conditions, or restrictions..."
              rows={3}
              className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground flex items-center gap-2">
              <ImageIcon className="w-4 h-4" strokeWidth={2} />
              Offer Banner (Optional)
            </Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center bg-background">
              <input
                id="banner-upload"
                type="file"
                accept="image/*"
                onChange={handleBannerChange}
                className="hidden"
              />
              {bannerPreview ? (
                <div className="space-y-4">
                  <img 
                    src={bannerPreview} 
                    alt="Banner preview" 
                    className="max-h-48 mx-auto rounded-lg"
                  />
                  <Button
                    onClick={() => document.getElementById('banner-upload')?.click()}
                    variant="outline"
                    className="bg-neutral text-neutral-foreground border-border hover:bg-muted hover:text-foreground"
                  >
                    Change Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-foreground font-semibold mb-2">Upload Banner Image</p>
                    <p className="text-sm text-muted-foreground">
                      PNG, JPG (recommended: 1200x400px)
                    </p>
                  </div>
                  <Button
                    onClick={() => document.getElementById('banner-upload')?.click()}
                    variant="outline"
                    className="bg-neutral text-neutral-foreground border-border hover:bg-muted hover:text-foreground"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" strokeWidth={2} />
                    Select Image
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => navigate('/vendor/offers')}
              className="bg-neutral text-neutral-foreground border-border hover:bg-muted hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePublish}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <TagIcon className="w-4 h-4 mr-2" strokeWidth={2} />
              Publish Offer
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="bg-card text-card-foreground border-border sm:max-w-md">
          <DialogHeader>
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" strokeWidth={2} />
            </div>
            <DialogTitle className="text-h3 text-card-foreground text-center">Publish Offer?</DialogTitle>
            <DialogDescription className="text-muted-foreground text-center">
              Your offer will be immediately visible to all verified students
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="bg-background border border-border rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Offer Title:</span>
                <span className="text-sm font-semibold text-foreground">{formData.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Discount:</span>
                <span className="text-sm font-semibold text-primary">
                  {formData.discountType === 'percentage' 
                    ? `${formData.discountValue}% off`
                    : `$${formData.discountValue} off`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Expires:</span>
                <span className="text-sm font-semibold text-foreground">
                  {new Date(formData.expiryDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmation(false)}
                className="flex-1 bg-neutral text-neutral-foreground border-border hover:bg-muted hover:text-foreground"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmPublish}
                disabled={loading}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? 'Publishing...' : 'Confirm & Publish'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

