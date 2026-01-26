import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { UserIcon, MailIcon, SchoolIcon, CalendarIcon, ShieldCheckIcon, DownloadIcon } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from '../../hooks/use-toast';
import { ThemeSwitcher } from '../ThemeSwitcher';
import { ChangePasswordDialog } from '../ChangePasswordDialog';
import { DeleteAccountDialog } from '../DeleteAccountDialog';

export function MyAccountView() {
  const { verificationStatus } = useAppStore();
  const { user } = useAuthStore();
  const [name, setName] = useState(user?.name || 'John Student');
  const [email, setEmail] = useState(user?.email || 'john.student@university.edu');
  const [university, setUniversity] = useState(user?.university || 'State University');
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSave = () => {
    toast({
      title: "Profile updated",
      description: "Your account information has been saved",
    });
  };

  const handleDownloadData = async () => {
    toast({
      title: "Preparing download",
      description: "Your data is being prepared...",
    });

    // Simulate data preparation
    await new Promise(resolve => setTimeout(resolve, 2000));

    const userData = {
      profile: { name, email, university },
      verificationStatus,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-data-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download complete",
      description: "Your data has been downloaded successfully",
    });
  };

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      <div>
        <h1 className="text-h1 font-semibold text-foreground leading-heading tracking-heading mb-4">
          My Account
        </h1>
        <p className="text-body text-muted-foreground leading-body">
          Manage your profile and verification status
        </p>
      </div>

      <Card className="bg-card text-card-foreground border-border">
        <CardHeader>
          <CardTitle className="text-h3 text-card-foreground">Profile Information</CardTitle>
          <CardDescription className="text-muted-foreground">
            Update your personal details and university information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src="" alt={name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button 
                variant="outline"
                className="bg-neutral text-neutral-foreground border-border hover:bg-muted hover:text-foreground"
              >
                Change Photo
              </Button>
              <p className="text-small text-muted-foreground mt-2">JPG or PNG, max 2MB</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground flex items-center gap-2">
                <UserIcon className="w-4 h-4" strokeWidth={2} />
                Full Name
              </Label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground flex items-center gap-2">
                <MailIcon className="w-4 h-4" strokeWidth={2} />
                University Email
              </Label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="university" className="text-foreground flex items-center gap-2">
                <SchoolIcon className="w-4 h-4" strokeWidth={2} />
                University
              </Label>
              <input
                id="university"
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <Button 
            onClick={handleSave}
            className="w-full bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground"
          >
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-card text-card-foreground border-border">
        <CardHeader>
          <CardTitle className="text-h3 text-card-foreground">Verification Status</CardTitle>
          <CardDescription className="text-muted-foreground">
            Your current student verification details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-6 border border-border rounded-lg bg-background">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                verificationStatus === 'verified' ? 'bg-success/10' : 
                verificationStatus === 'pending' ? 'bg-warning/10' : 
                'bg-muted'
              }`}>
                <ShieldCheckIcon className={`w-6 h-6 ${
                  verificationStatus === 'verified' ? 'text-success' : 
                  verificationStatus === 'pending' ? 'text-warning' : 
                  'text-muted-foreground'
                }`} strokeWidth={2} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {verificationStatus === 'verified' ? 'Verified Student' : 
                   verificationStatus === 'pending' ? 'Verification Pending' : 
                   'Not Verified'}
                </h3>
                <p className="text-small text-muted-foreground">
                  {verificationStatus === 'verified' ? 'Valid until June 2025' : 
                   verificationStatus === 'pending' ? 'Review in progress' : 
                   'Complete verification to access discounts'}
                </p>
              </div>
            </div>
            {verificationStatus !== 'verified' && (
              <Button 
                onClick={() => window.location.href = '/verification'}
                variant="outline"
                className="bg-neutral text-neutral-foreground border-border hover:bg-muted hover:text-foreground"
              >
                {verificationStatus === 'pending' ? 'Check Status' : 'Verify Now'}
              </Button>
            )}
          </div>

          {verificationStatus === 'verified' && (
            <div className="space-y-4">
              <Separator />
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-small text-muted-foreground">
                    <CalendarIcon className="w-4 h-4" strokeWidth={2} />
                    <span>Verified On</span>
                  </div>
                  <p className="text-foreground font-semibold">January 15, 2024</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-small text-muted-foreground">
                    <CalendarIcon className="w-4 h-4" strokeWidth={2} />
                    <span>Valid Until</span>
                  </div>
                  <p className="text-foreground font-semibold">June 30, 2025</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ThemeSwitcher />

      <Card className="bg-card text-card-foreground border-border">
        <CardHeader>
          <CardTitle className="text-h3 text-card-foreground">Account Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => setChangePasswordOpen(true)}
            variant="outline"
            className="w-full bg-neutral text-neutral-foreground border-border hover:bg-muted hover:text-foreground"
          >
            Change Password
          </Button>
          <Button 
            onClick={handleDownloadData}
            variant="outline"
            className="w-full bg-neutral text-neutral-foreground border-border hover:bg-muted hover:text-foreground flex items-center justify-center gap-2"
          >
            <DownloadIcon className="w-4 h-4" strokeWidth={2} />
            Download My Data
          </Button>
          <Separator />
          <Button 
            onClick={() => setDeleteAccountOpen(true)}
            variant="outline"
            className="w-full bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive hover:text-destructive-foreground"
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>

      <ChangePasswordDialog 
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />

      <DeleteAccountDialog 
        isOpen={deleteAccountOpen}
        onClose={() => setDeleteAccountOpen(false)}
      />
    </div>
  );
}

