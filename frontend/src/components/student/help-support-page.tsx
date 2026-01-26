import { useState } from 'react';
import { StudentSidebar } from './dashboard/sidebar';
import { DashboardHeader } from './dashboard-header';
import { HelpSupport } from './help-support';

export function HelpSupportPage() {
  const [activeSection, setActiveSection] = useState('help-support');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <StudentSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <DashboardHeader 
          studentName="John Doe"
          studentEmail="john@example.com"
          verificationStatus="verified"
        />
        <div className="p-4 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Help & Support</h1>
            <p className="text-gray-600">Find answers to common questions and get support</p>
          </div>

          <HelpSupport />
        </div>
      </div>
    </div>
  );
}
