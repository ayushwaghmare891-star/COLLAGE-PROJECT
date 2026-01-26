import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  SettingsIcon, 
  SaveIcon, 
  RefreshCwIcon,
  MailIcon,
  DatabaseIcon,
  BellIcon,
  ShieldIcon
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface Settings {
  siteName: string;
  siteEmail: string;
  supportEmail: string;
  maintenanceMode: boolean;
  emailNotifications: boolean;
  autoVerification: boolean;
  maxUploadSize: number;
  sessionTimeout: number;
  theme: 'light' | 'dark' | 'auto';
}

export function AdminSettings() {
  const [settings, setSettings] = useState<Settings>({
    siteName: 'Student Deals',
    siteEmail: 'noreply@collage.com',
    supportEmail: 'support@collage.com',
    maintenanceMode: false,
    emailNotifications: true,
    autoVerification: false,
    maxUploadSize: 5,
    sessionTimeout: 24,
    theme: 'auto',
  });

  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (field: keyof Settings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      localStorage.setItem('adminSettings', JSON.stringify(settings));
      toast({
        title: '✅ Settings saved',
        description: 'Your settings have been updated successfully',
      });
      setHasChanges(false);
    } catch (error: any) {
      toast({
        title: '❌ Error saving settings',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset to default settings?')) {
      setSettings({
        siteName: 'Student Deals',
        siteEmail: 'noreply@collage.com',
        supportEmail: 'support@collage.com',
        maintenanceMode: false,
        emailNotifications: true,
        autoVerification: false,
        maxUploadSize: 5,
        sessionTimeout: 24,
        theme: 'auto',
      });
      setHasChanges(true);
    }
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 rounded-2xl px-8 py-12 text-white shadow-2xl border border-blue-800/50">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">
            <SettingsIcon className="w-7 h-7 text-blue-200" strokeWidth={2} />
          </div>
          <h1 className="text-4xl font-bold">Admin Settings</h1>
        </div>
        <p className="text-blue-200 text-lg">
          Configure platform settings and preferences
        </p>
      </div>

      {/* General Settings */}
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <MailIcon className="w-5 h-5 text-blue-100" strokeWidth={2} />
            </div>
            <div>
              <CardTitle>General Settings</CardTitle>
              <CardDescription className="text-blue-100">
                Basic platform configuration
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Site Name</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => handleChange('siteName', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">The name of your platform</p>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Site Email</label>
              <input
                type="email"
                value={settings.siteEmail}
                onChange={(e) => handleChange('siteEmail', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Noreply/system email address</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Support Email</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => handleChange('supportEmail', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Support contact email</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => handleChange('theme', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="auto">Auto</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Default theme for the platform</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Max Upload Size (MB)</label>
              <input
                type="number"
                value={settings.maxUploadSize}
                onChange={(e) => handleChange('maxUploadSize', parseInt(e.target.value))}
                min="1"
                max="50"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum file upload size</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
        <CardHeader className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <ShieldIcon className="w-5 h-5 text-red-100" strokeWidth={2} />
            </div>
            <div>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription className="text-red-100">
                Security and access control
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Session Timeout (hours)</label>
            <input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
              min="1"
              max="168"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">User session timeout duration</p>
          </div>

          <Separator />

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <div>
                <p className="font-medium">Maintenance Mode</p>
                <p className="text-xs text-gray-500">Disable user access for maintenance</p>
              </div>
            </label>
            
            {settings.maintenanceMode && (
              <div className="ml-7 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ Maintenance mode is active. Users will see a maintenance notice.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <BellIcon className="w-5 h-5 text-purple-100" strokeWidth={2} />
            </div>
            <div>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription className="text-purple-100">
                Email and notification preferences
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-xs text-gray-500">Send email alerts for important events</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoVerification}
                onChange={(e) => handleChange('autoVerification', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <div>
                <p className="font-medium">Auto Verification</p>
                <p className="text-xs text-gray-500">Automatically verify students (not recommended)</p>
              </div>
            </label>
          </div>

          {settings.autoVerification && (
            <div className="p-3 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg">
              <p className="text-sm text-orange-800 dark:text-orange-200">
                ⚠️ Auto-verification is enabled. Students won't need manual approval.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Database Settings */}
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
        <CardHeader className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <DatabaseIcon className="w-5 h-5 text-teal-100" strokeWidth={2} />
            </div>
            <div>
              <CardTitle>Database Info</CardTitle>
              <CardDescription className="text-teal-100">
                Database status and information
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Status</p>
              <Badge className="bg-green-600 text-white">Connected</Badge>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Database</p>
              <p className="font-semibold">MongoDB</p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Version</p>
              <p className="font-semibold">5.0+</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 sticky bottom-0 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
        <Button
          onClick={handleSave}
          disabled={!hasChanges || loading}
          className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg disabled:opacity-50"
        >
          <SaveIcon className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>

        <Button
          variant="outline"
          onClick={handleReset}
          disabled={loading}
          className="flex items-center gap-2 border-slate-300 dark:border-slate-600"
        >
          <RefreshCwIcon className="w-4 h-4" />
          Reset to Default
        </Button>

        {hasChanges && (
          <div className="ml-auto flex items-center px-4 py-2 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-200 rounded-lg border border-amber-200 dark:border-amber-800">
            <span className="text-sm font-medium">⚠️ Unsaved changes</span>
          </div>
        )}
      </div>
    </div>
  );
}
