// Real-Time Updates Example Implementation
// This file shows how to use the real-time updates hook in your components

import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { useEffect, useState } from 'react';

interface StudentData {
  _id: string;
  name: string;
  email: string;
  approvalStatus: 'approved' | 'pending' | 'rejected';
  verificationStatus: 'verified' | 'pending' | 'rejected';
}

interface VendorData {
  _id: string;
  name: string;
  businessName: string;
  approvalStatus: 'approved' | 'pending' | 'rejected';
}

interface OfferData {
  _id: string;
  title: string;
  discount: number;
  currentRedemptions: number;
}

interface AnalyticsData {
  totalOffers: number;
  activeOffers: number;
  totalRedemptions: number;
}

interface Notification {
  id: number;
  type: 'student_update' | 'vendor_update' | 'user_deleted';
  message: string;
  timestamp: Date;
}

// Example 1: Admin Dashboard using Real-Time Updates
export function AdminDashboardWithRealtime() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const handleStudentUpdated = (update: any) => {
    console.log('Student updated:', update);
    // Update UI with new student data
    setStudents(prev => 
      prev.map(s => s._id === update.studentId ? update.student : s)
    );
  };

  const handleStudentsUpdated = (data: any) => {
    console.log('All students fetched:', data.students.length);
    setStudents(data.students);
  };

  const handleVendorsUpdated = (data: any) => {
    console.log('All vendors fetched:', data.vendors.length);
    setVendors(data.vendors);
  };

  const handleConnectionChange = (connected: boolean) => {
    setIsConnected(connected);
    if (connected) {
      // Request initial data when connected
      requestStudentsUpdate();
      requestVendorsUpdate();
    }
  };

  const {
    isConnected: wsConnected,
    requestStudentsUpdate,
    requestVendorsUpdate,
  } = useRealtimeUpdates(
    handleStudentUpdated,
    undefined, // onVendorUpdated
    undefined, // onUserDeleted
    handleStudentsUpdated,
    handleVendorsUpdated,
    undefined, // onOffersUpdated
    undefined, // onVendorAnalyticsUpdated
    handleConnectionChange
  );

  useEffect(() => {
    // Optionally poll for updates every 30 seconds
    const interval = setInterval(() => {
      if (wsConnected) {
        requestStudentsUpdate();
        requestVendorsUpdate();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [wsConnected, requestStudentsUpdate, requestVendorsUpdate]);

  return (
    <div className="p-6">
      <div className={`mb-4 p-3 rounded ${isConnected ? 'bg-green-100' : 'bg-red-100'}`}>
        {isConnected ? '✅ Connected' : '❌ Disconnected'}
      </div>

      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="border p-4 rounded">
          <h3 className="font-bold mb-2">Students ({students.length})</h3>
          {/* Render students */}
        </div>
        <div className="border p-4 rounded">
          <h3 className="font-bold mb-2">Vendors ({vendors.length})</h3>
          {/* Render vendors */}
        </div>
      </div>
    </div>
  );
}

// Example 2: Vendor Dashboard with Real-Time Analytics
export function VendorDashboardWithRealtime({ vendorId }: { vendorId: string }) {
  const [offers, setOffers] = useState<OfferData[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const handleAnalyticsUpdated = (data: any) => {
    console.log('Vendor analytics updated:', data.analytics);
    setAnalytics(data.analytics);
  };

  const {
    requestVendorOffersUpdate,
    requestVendorAnalytics,
  } = useRealtimeUpdates(
    undefined, // onStudentUpdated
    undefined, // onVendorUpdated
    undefined, // onUserDeleted
    undefined, // onStudentsUpdated
    undefined, // onVendorsUpdated
    (data: any) => {
      console.log('Vendor offers updated:', data.offers?.length);
      setOffers(data.offers || []);
    },
    handleAnalyticsUpdated,
    (connected: boolean) => setIsConnected(connected)
  );

  useEffect(() => {
    if (isConnected) {
      requestVendorOffersUpdate(vendorId);
      requestVendorAnalytics(vendorId);
    }
  }, [isConnected, vendorId, requestVendorOffersUpdate, requestVendorAnalytics]);

  return (
    <div className="p-6">
      <div className={`mb-4 p-3 rounded ${isConnected ? 'bg-green-100' : 'bg-red-100'}`}>
        {isConnected ? '✅ Live Updates Active' : '❌ Offline'}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="border p-4 rounded">
          <p className="text-gray-600">Total Offers</p>
          <p className="text-3xl font-bold">{analytics?.totalOffers || 0}</p>
        </div>
        <div className="border p-4 rounded">
          <p className="text-gray-600">Active Offers</p>
          <p className="text-3xl font-bold">{analytics?.activeOffers || 0}</p>
        </div>
        <div className="border p-4 rounded">
          <p className="text-gray-600">Total Redemptions</p>
          <p className="text-3xl font-bold">{analytics?.totalRedemptions || 0}</p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-bold mb-3">My Offers ({offers.length})</h3>
        {offers.map(offer => (
          <div key={offer._id} className="border p-3 mb-2 rounded">
            <h4 className="font-semibold">{offer.title}</h4>
            <p className="text-sm text-gray-600">
              Discount: {offer.discount}% | Redeemed: {offer.currentRedemptions}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Example 3: Real-Time Notification System
export function RealtimeNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const handleStudentUpdated = (update: any) => {
    const notification: Notification = {
      id: Date.now(),
      type: 'student_update',
      message: `Student ${update.student.name} ${update.approvalStatus || update.verificationStatus}`,
      timestamp: new Date(),
    };
    setNotifications(prev => [notification, ...prev].slice(0, 10));
  };

  const handleVendorUpdated = (update: any) => {
    const notification: Notification = {
      id: Date.now(),
      type: 'vendor_update',
      message: `Vendor ${update.vendor.name} ${update.approvalStatus}`,
      timestamp: new Date(),
    };
    setNotifications(prev => [notification, ...prev].slice(0, 10));
  };

  const handleUserDeleted = (deletion: any) => {
    const notification: Notification = {
      id: Date.now(),
      type: 'user_deleted',
      message: `${deletion.userType} account deleted`,
      timestamp: new Date(),
    };
    setNotifications(prev => [notification, ...prev].slice(0, 10));
  };

  useRealtimeUpdates(
    handleStudentUpdated,
    handleVendorUpdated,
    handleUserDeleted
  );

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-3">Live Notifications</h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {notifications.map(notif => (
          <div
            key={notif.id}
            className={`p-2 rounded text-sm ${
              notif.type === 'user_deleted' ? 'bg-red-100' :
              notif.type === 'vendor_update' ? 'bg-blue-100' :
              'bg-green-100'
            }`}
          >
            <p>{notif.message}</p>
            <p className="text-xs text-gray-500">
              {notif.timestamp.toLocaleTimeString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Example 4: Real-Time Data Table
export function StudentsTableWithRealtime() {
  const [students, setStudents] = useState<StudentData[]>([]);

  const handleStudentUpdated = (update: any) => {
    setStudents(prev =>
      prev.map(s => s._id === update.studentId ? update.student : s)
    );
    // Optional: Show toast notification
    console.log(`Updated: ${update.student.name}`);
  };

  const handleStudentsUpdated = (data: any) => {
    setStudents(data.students);
  };

  const { requestStudentsUpdate } = useRealtimeUpdates(
    handleStudentUpdated,
    undefined,
    undefined,
    handleStudentsUpdated
  );

  // Request initial data
  useEffect(() => {
    requestStudentsUpdate();
  }, [requestStudentsUpdate]);

  return (
    <table className="w-full border-collapse">
      <thead className="bg-gray-100">
        <tr>
          <th className="border p-2 text-left">Name</th>
          <th className="border p-2 text-left">Email</th>
          <th className="border p-2 text-left">Approval Status</th>
          <th className="border p-2 text-left">Verification Status</th>
        </tr>
      </thead>
      <tbody>
        {students.map(student => (
          <tr key={student._id} className="hover:bg-gray-50">
            <td className="border p-2">{student.name}</td>
            <td className="border p-2">{student.email}</td>
            <td className="border p-2">
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                student.approvalStatus === 'approved' ? 'bg-green-100 text-green-700' :
                student.approvalStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {student.approvalStatus}
              </span>
            </td>
            <td className="border p-2">
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                student.verificationStatus === 'verified' ? 'bg-green-100 text-green-700' :
                student.verificationStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {student.verificationStatus}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default {
  AdminDashboardWithRealtime,
  VendorDashboardWithRealtime,
  RealtimeNotifications,
  StudentsTableWithRealtime,
};
