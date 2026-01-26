import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useAppStore } from '../stores/appStore';
import { verificationAPI } from '../lib/verificationAPI';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { verificationStatus, setVerificationStatus } = useAppStore();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Poll verification status every 30 seconds to update globally
  useEffect(() => {
    const pollVerificationStatus = async () => {
      try {
        const response = await verificationAPI.getVerificationStatus();
        if (response.success) {
          const status = response.verificationStatus;
          if (status === 'verified' && verificationStatus !== 'verified') {
            setVerificationStatus('verified');
          } else if (status === 'pending' && verificationStatus !== 'pending') {
            setVerificationStatus('pending');
          } else if (status === 'not-verified' && verificationStatus !== 'not-verified') {
            setVerificationStatus('not-verified');
          }
        }
      } catch (error) {
        // Silent fail - don't show errors for background polling
        console.debug('Verification status check failed:', error);
      }
    };

    const pollInterval = setInterval(pollVerificationStatus, 30000); // Poll every 30 seconds
    return () => clearInterval(pollInterval);
  }, [verificationStatus, setVerificationStatus]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isMobile={isMobile} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar onMenuClick={toggleSidebar} />
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="px-8 py-12 lg:px-16 lg:py-16">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

