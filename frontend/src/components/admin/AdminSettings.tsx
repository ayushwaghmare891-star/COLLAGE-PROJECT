import { useState, useEffect } from 'react';

import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
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
      {/* Header - Student Inspired */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-slate-600 rounded-lg flex items-center justify-center text-2xl shadow-md">
            ⚙️
          </div>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Admin Settings
            </h1>
            <p className="text-gray-600 mt-2">
              Configure platform settings and preferences
            </p>
          </div>
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
            <MailIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">General Settings</h2>
            <p className="text-xs text-gray-600">Basic platform configuration</p>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Site Name</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => handleChange('siteName', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-600 mt-2">The name of your platform</p>
          </div>

          <div className="border-t border-gray-100"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Site Email</label>
              <input
                type="email"
                value={settings.siteEmail}
                onChange={(e) => handleChange('siteEmail', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-600 mt-2">Noreply/system email address</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Support Email</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => handleChange('supportEmail', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-600 mt-2">Support contact email</p>
            </div>
          </div>

          <div className="border-t border-gray-100"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => handleChange('theme', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="auto">Auto</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
              <p className="text-xs text-gray-600 mt-2">Default theme for the platform</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Max Upload Size (MB)</label>
              <input
                type="number"
                value={settings.maxUploadSize}
                onChange={(e) => handleChange('maxUploadSize', parseInt(e.target.value))}
                min="1"
                max="50"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-600 mt-2">Maximum file upload size</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center">
            <ShieldIcon className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Security Settings</h2>
            <p className="text-xs text-gray-600">Security and access control</p>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Session Timeout (hours)</label>
            <input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
              min="1"
              max="168"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-600 mt-2">User session timeout duration</p>
          </div>

          <div className="border-t border-gray-100"></div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <div>
                <p className="font-semibold text-gray-900">Maintenance Mode</p>
                <p className="text-xs text-gray-600">Disable user access for maintenance</p>
              </div>
            </label>
            
            {settings.maintenanceMode && (
              <div className="ml-7 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Maintenance mode is active. Users will see a maintenance notice.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
            <BellIcon className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Notification Settings</h2>
            <p className="text-xs text-gray-600">Email and notification preferences</p>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <div>
                <p className="font-semibold text-gray-900">Email Notifications</p>
                <p className="text-xs text-gray-600">Send email alerts for important events</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoVerification}
                onChange={(e) => handleChange('autoVerification', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <div>
                <p className="font-semibold text-gray-900">Auto Verification</p>
                <p className="text-xs text-gray-600">Automatically verify students (not recommended)</p>
              </div>
            </label>
          </div>

          {settings.autoVerification && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                ⚠️ Auto-verification is enabled. Students won't need manual approval.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Database Settings */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-emerald-200 rounded-lg flex items-center justify-center">
            <DatabaseIcon className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Database Info</h2>
            <p className="text-xs text-gray-600">Database status and information</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1 font-medium uppercase">Status</p>
              <Badge className="bg-green-600 text-white">Connected</Badge>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1 font-medium uppercase">Database</p>
              <p className="font-semibold text-gray-900">MongoDB</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1 font-medium uppercase">Version</p>
              <p className="font-semibold text-gray-900">5.0+</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <Button
          onClick={handleSave}
          disabled={!hasChanges || loading}
          className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
        >
          <SaveIcon className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>

        <Button
          variant="outline"
          onClick={handleReset}
          disabled={loading}
          className="flex items-center gap-2 border-gray-200 hover:bg-gray-50"
        >
          <RefreshCwIcon className="w-4 h-4" />
          Reset to Default
        </Button>

        {hasChanges && (
          <div className="ml-auto flex items-center px-4 py-2 bg-amber-50 text-amber-700 rounded-lg border border-amber-200">
            <span className="text-sm font-medium">⚠️ Unsaved changes</span>
          </div>
        )}
      </div>
    </div>
  );
}
