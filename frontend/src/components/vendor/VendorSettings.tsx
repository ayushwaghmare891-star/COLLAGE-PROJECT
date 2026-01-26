import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { LockIcon, BellIcon, PaletteIcon, LogOutIcon, TrashIcon } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { useToast } from '../../hooks/use-toast';
import { ChangePasswordDialog } from '../ChangePasswordDialog';
import { DeleteAccountDialog } from '../DeleteAccountDialog';

export function VendorSettings() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const { toast } = useToast();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);

  const [notifications, setNotifications] = useState({
    emailOfferViews: true,
    emailRedemptions: true,
    emailWeeklyReport: true,
    pushNewStudent: false,
    pushOfferExpiring: true,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Notification settings updated",
      description: "Your preferences have been saved",
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const themes = [
    { value: 'light', label: 'Light', colors: ['#3b82f6', '#2563eb', '#10b981'] },
    { value: 'dark', label: 'Dark', colors: ['#60a5fa', '#3b82f6', '#34d399'] },
    { value: 'blue', label: 'Ocean Blue', colors: ['#2563eb', '#1d4ed8', '#0ea5e9'] },
    { value: 'green', label: 'Forest Green', colors: ['#059669', '#047857', '#10b981'] },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Settings
        </h1>
        <p className="text-body text-muted-foreground">
          Manage your account preferences and security
        </p>
      </div>

      <Card className="bg-card text-card-foreground border-border">
        <CardHeader>
          <CardTitle className="text-h3 text-card-foreground flex items-center gap-2">
            <LockIcon className="w-5 h-5" strokeWidth={2} />
            Security
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Manage your password and account security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => setChangePasswordOpen(true)}
            variant="outline"
            className="w-full justify-start bg-neutral text-neutral-foreground border-border hover:bg-muted hover:text-foreground"
          >
            <LockIcon className="w-4 h-4 mr-2" strokeWidth={2} />
            Change Password
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-card text-card-foreground border-border">
        <CardHeader>
          <CardTitle className="text-h3 text-card-foreground flex items-center gap-2">
            <BellIcon className="w-5 h-5" strokeWidth={2} />
            Notifications
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Choose what notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Email Notifications</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground font-medium">Offer Views</Label>
                  <p className="text-sm text-muted-foreground">Get notified when students view your offers</p>
                </div>
                <Switch
                  checked={notifications.emailOfferViews}
                  onCheckedChange={(checked) => handleNotificationChange('emailOfferViews', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground font-medium">Redemptions</Label>
                  <p className="text-sm text-muted-foreground">Get notified when students redeem your offers</p>
                </div>
                <Switch
                  checked={notifications.emailRedemptions}
                  onCheckedChange={(checked) => handleNotificationChange('emailRedemptions', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground font-medium">Weekly Report</Label>
                  <p className="text-sm text-muted-foreground">Receive weekly performance summary</p>
                </div>
                <Switch
                  checked={notifications.emailWeeklyReport}
                  onCheckedChange={(checked) => handleNotificationChange('emailWeeklyReport', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Push Notifications</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground font-medium">New Student Nearby</Label>
                  <p className="text-sm text-muted-foreground">Alert when new students join near your location</p>
                </div>
                <Switch
                  checked={notifications.pushNewStudent}
                  onCheckedChange={(checked) => handleNotificationChange('pushNewStudent', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground font-medium">Offer Expiring Soon</Label>
                  <p className="text-sm text-muted-foreground">Reminder when your offers are about to expire</p>
                </div>
                <Switch
                  checked={notifications.pushOfferExpiring}
                  onCheckedChange={(checked) => handleNotificationChange('pushOfferExpiring', checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card text-card-foreground border-border">
        <CardHeader>
          <CardTitle className="text-h3 text-card-foreground flex items-center gap-2">
            <PaletteIcon className="w-5 h-5" strokeWidth={2} />
            Appearance
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Customize the look and feel of your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {themes.map((themeOption) => (
              <button
                key={themeOption.value}
                onClick={() => setTheme(themeOption.value as any)}
                className={`
                  relative p-4 rounded-lg border-2 transition-all text-left
                  ${theme === themeOption.value 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border bg-background hover:border-primary/50'
                  }
                `}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-semibold text-foreground">{themeOption.label}</span>
                  {theme === themeOption.value && (
                    <div className="ml-auto w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {themeOption.colors.map((color, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 rounded-md"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-h3 text-red-900 dark:text-red-100">Danger Zone</CardTitle>
          <CardDescription className="text-red-700 dark:text-red-300">
            Irreversible actions that affect your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start bg-white dark:bg-gray-800 text-foreground border-border hover:bg-muted hover:text-foreground"
          >
            <LogOutIcon className="w-4 h-4 mr-2" strokeWidth={2} />
            Log Out
          </Button>

          <Button
            onClick={() => setDeleteAccountOpen(true)}
            variant="outline"
            className="w-full justify-start bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200 border-red-200 dark:border-red-800 hover:bg-red-200 dark:hover:bg-red-800"
          >
            <TrashIcon className="w-4 h-4 mr-2" strokeWidth={2} />
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


