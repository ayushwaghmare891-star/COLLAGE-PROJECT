import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { XIcon, CopyIcon, CheckIcon, TagIcon, ClockIcon, AlertCircleIcon, Zap } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { useAuthStore } from '../stores/authStore';
import { useToast } from '../hooks/use-toast';
import { API_BASE_URL } from '../lib/api';

interface Discount {
  id: string;
  brand: string;
  discount: string;
  description: string;
  category: string;
  expiryDays: number;
  isExpired: boolean;
  isUsed: boolean;
  code?: string;
}

interface DiscountDrawerProps {
  discount: Discount | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DiscountDrawer({ discount, isOpen, onClose }: DiscountDrawerProps) {
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [alreadyRedeemed, setAlreadyRedeemed] = useState(false);
  const { markDiscountAsUsed } = useAppStore();
  const { token } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    if (discount?.isUsed && discount.code) {
      setGeneratedCode(discount.code);
      setAlreadyRedeemed(false);
    } else {
      setGeneratedCode('');
      setAlreadyRedeemed(false);
    }
  }, [discount]);

  useEffect(() => {
    if (generatedCode && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [generatedCode, timeLeft]);

  if (!discount) return null;

  const handleGenerateCode = async () => {
    if (isRedeeming) return;
    
    if (!token) {
      toast({
        title: "Not logged in",
        description: "Please log in to redeem a discount",
        variant: "destructive",
      });
      return;
    }

    setIsRedeeming(true);
    try {
      // Call backend to register the redemption
      const response = await fetch(`${API_BASE_URL}/offers/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          offerId: discount.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Redeem error response:', { status: response.status, data, message: data.message });
        
        // Check if already redeemed
        if (response.status === 400 && data.message && data.message.includes('already redeemed')) {
          setAlreadyRedeemed(true);
          toast({
            title: "Already Redeemed",
            description: data.message,
            variant: "destructive",
          });
          return;
        }
        
        throw new Error(data.message || `Failed to redeem offer (${response.status})`);
      }

      // Use the code returned from backend
      const codeToDisplay = data.redeemedOffer?.code || 'GENERATED';
      setGeneratedCode(codeToDisplay);
      setTimeLeft(3600);
      markDiscountAsUsed(discount.id, codeToDisplay);
      toast({
        title: "Code generated",
        description: "Your discount code is ready to use",
      });
    } catch (error) {
      console.error('Error redeeming offer:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to generate code',
        variant: "destructive",
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    toast({
      title: "Code copied",
      description: "Discount code copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40"
          onClick={onClose}
        />
      )}
      <div
        className={`
          fixed right-0 top-0 h-full w-full sm:w-[90%] md:w-[480px] bg-card border-l border-border z-50
          transform transition-transform duration-300 ease-in-out overflow-y-auto
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4 flex-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <TagIcon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-h2 font-semibold text-card-foreground leading-tight truncate">{discount.brand}</h2>
                <Badge className="mt-2 bg-tertiary text-tertiary-foreground text-xs">{discount.category}</Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="bg-transparent text-card-foreground hover:bg-muted hover:text-foreground flex-shrink-0"
            >
              <XIcon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
            </Button>
          </div>

          <Separator />

          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-base sm:text-h3 font-semibold text-card-foreground mb-2">Discount Details</h3>
              <p className="text-sm sm:text-body text-muted-foreground leading-relaxed">{discount.description}</p>
            </div>

            <div className="p-4 sm:p-6 bg-background border border-border rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs sm:text-small text-muted-foreground">Discount Amount</span>
                <span className="text-xl sm:text-2xl font-semibold text-primary">{discount.discount}</span>
              </div>
              {!discount.isExpired && (
                <div className="flex items-center gap-2 text-xs sm:text-small text-muted-foreground">
                  <ClockIcon className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
                  <span>Expires in {discount.expiryDays} days</span>
                </div>
              )}
            </div>

            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-h3 font-semibold text-card-foreground">Eligibility</h3>
              <ul className="space-y-2 text-sm sm:text-body text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-success mt-0.5 flex-shrink-0" strokeWidth={2} />
                  <span>Valid student ID required</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-success mt-0.5 flex-shrink-0" strokeWidth={2} />
                  <span>One-time use per student</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-success mt-0.5 flex-shrink-0" strokeWidth={2} />
                  <span>Cannot be combined with other offers</span>
                </li>
              </ul>
            </div>

            {generatedCode ? (
              <div className="space-y-3 sm:space-y-4">
                <div className="p-4 sm:p-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-2 border-green-200 dark:border-green-800 rounded-2xl shadow-lg">
                  {/* Header */}
                  <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckIcon className="w-4 h-4 sm:w-6 sm:h-6 text-white" strokeWidth={3} />
                      </div>
                      <div>
                        <span className="text-xs sm:text-sm font-bold text-green-700 dark:text-green-300">✓ Coupon Ready!</span>
                        <p className="text-xs text-green-600 dark:text-green-400">Copy your code below</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-orange-100 dark:bg-orange-900/40 rounded-full">
                      <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600 dark:text-orange-400 flex-shrink-0" strokeWidth={2.5} />
                      <span className="text-xs sm:text-sm font-bold text-orange-700 dark:text-orange-300">{formatTime(timeLeft)}</span>
                    </div>
                  </div>

                  {/* Code Box */}
                  <div className="relative mb-4 sm:mb-6">
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 p-0 sm:p-4 bg-white dark:bg-gray-900 border-2 border-dashed border-green-300 dark:border-green-700 rounded-xl">
                      <code className="w-full sm:flex-1 px-3 sm:px-4 py-3 sm:py-4 text-center sm:text-left text-lg sm:text-2xl font-mono font-bold text-green-700 dark:text-green-400 tracking-widest break-all">
                        {generatedCode}
                      </code>
                      <Button
                        onClick={handleCopy}
                        className="w-full sm:w-auto h-12 sm:h-auto sm:px-6 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-all duration-200 active:scale-95 flex-shrink-0 flex items-center justify-center gap-2"
                      >
                        {copied ? (
                          <>
                            <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                            <span className="text-xs sm:text-sm">Copied!</span>
                          </>
                        ) : (
                          <>
                            <CopyIcon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                            <span className="text-xs sm:text-sm">Copy Code</span>
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2 text-center sm:text-left">Click to copy • Expires in 1 hour</p>
                  </div>

                  {/* Instructions */}
                  <div className="bg-white dark:bg-gray-900/50 rounded-lg p-3 sm:p-4 border border-green-200 dark:border-green-800">
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mb-2">How to use:</h4>
                    <ol className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-green-600 dark:text-green-400 flex-shrink-0">1.</span>
                        <span>Copy the code above</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-green-600 dark:text-green-400 flex-shrink-0">2.</span>
                        <span>Go to their website</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-green-600 dark:text-green-400 flex-shrink-0">3.</span>
                        <span>Paste code at checkout</span>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            ) : alreadyRedeemed ? (
              <div className="p-4 sm:p-6 bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800 rounded-2xl">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <AlertCircleIcon className="w-4 h-4 sm:w-6 sm:h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm sm:text-base font-bold text-red-700 dark:text-red-300 mb-1">Already Redeemed</h4>
                    <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 leading-relaxed">
                      You've already used this offer. Each student can redeem this offer only once. Look for other available offers!
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <Button
                onClick={handleGenerateCode}
                disabled={discount.isExpired || isRedeeming}
                className="w-full h-12 sm:h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold text-sm sm:text-base rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 shadow-lg"
              >
                {isRedeeming ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Getting Your Code...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" strokeWidth={2.5} />
                    <span>Get Discount Code</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

