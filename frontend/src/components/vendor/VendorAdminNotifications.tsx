import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';

interface AdminMessage {
  adminId: string;
  adminName: string;
  message: string;
  messageType: 'info' | 'warning' | 'success' | 'error' | 'pending';
  timestamp: Date;
}

interface AdminAction {
  approvalStatus: 'pending' | 'approved' | 'rejected';
  verificationStatus: 'pending' | 'verified' | 'rejected';
  suspended: boolean;
  suspensionReason?: string;
  approvalRemarks?: string;
  approvedAt?: Date;
  createdAt: Date;
}

export function VendorAdminNotifications() {
  const [adminActions, setAdminActions] = useState<AdminAction | null>(null);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const {
    requestAdminActions,
    sendMessageToAdmins,
    isConnected: rtConnected,
  } = useAdminNotifications(
    // onAdminActionsLoaded
    (actions) => {
      setAdminActions(actions);
    },
    // onAdminMessageReceived
    (message) => {
      setMessages(prev => [...prev, message]);
    },
    // onApprovalStatusUpdated
    (update) => {
      setAdminActions(prev => prev ? { ...prev, approvalStatus: update.status } : null);
      setMessages(prev => [...prev, {
        adminId: '',
        adminName: 'System',
        message: update.message,
        messageType: update.status === 'approved' ? 'success' : update.status === 'rejected' ? 'error' : 'pending',
        timestamp: update.timestamp,
      }]);
    },
    // onSuspensionStatusUpdated
    (update) => {
      setAdminActions(prev => prev ? { ...prev, suspended: update.suspended } : null);
      setMessages(prev => [...prev, {
        adminId: '',
        adminName: 'System',
        message: update.message,
        messageType: update.suspended ? 'warning' : 'success',
        timestamp: update.timestamp,
      }]);
    },
    // onVerificationStatusUpdated
    (update) => {
      setAdminActions(prev => prev ? { ...prev, verificationStatus: update.verificationStatus } : null);
      setMessages(prev => [...prev, {
        adminId: '',
        adminName: 'System',
        message: update.message,
        messageType: update.verificationStatus === 'verified' ? 'success' : 'pending',
        timestamp: update.timestamp,
      }]);
    },
    // onConnectionStatusChange
    (connected) => {
      setIsConnected(connected);
      if (connected) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          requestAdminActions(user.id);
        }
      }
    }
  );

  useEffect(() => {
    if (rtConnected) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        requestAdminActions(user.id);
      }
    }
  }, [rtConnected, requestAdminActions]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'pending':
        return '⏳';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            Real-time Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            {isConnected ? '✅ Connected to admin updates' : '❌ Disconnected from admin updates'}
          </p>
        </CardContent>
      </Card>

      {/* Admin Actions Status */}
      {adminActions && (
        <Card>
          <CardHeader>
            <CardTitle>Admin Actions & Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Approval Status</p>
                <Badge className={getStatusBadgeColor(adminActions.approvalStatus)}>
                  {adminActions.approvalStatus}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Verification Status</p>
                <Badge className={getStatusBadgeColor(adminActions.verificationStatus)}>
                  {adminActions.verificationStatus}
                </Badge>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600 mb-1">Account Status</p>
                <Badge className={adminActions.suspended ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                  {adminActions.suspended ? 'Suspended' : 'Active'}
                </Badge>
              </div>
            </div>

            {adminActions.suspensionReason && (
              <div className="border-l-4 border-orange-400 bg-orange-50 p-3 rounded">
                <p className="text-sm"><strong>Suspension Reason:</strong> {adminActions.suspensionReason}</p>
              </div>
            )}

            {adminActions.approvalRemarks && (
              <div className="border-l-4 border-blue-400 bg-blue-50 p-3 rounded">
                <p className="text-sm"><strong>Admin Remarks:</strong> {adminActions.approvalRemarks}</p>
              </div>
            )}

            {adminActions.approvedAt && (
              <div className="text-xs text-gray-500">
                Approved on: {new Date(adminActions.approvedAt).toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Messages from Admins */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            Messages from Admins ({messages.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <p className="text-sm text-gray-500">No messages yet</p>
          ) : (
            <div className="h-[300px] w-full rounded-md border p-3 overflow-y-auto">
              <div className="space-y-3">
                {messages.map((msg, idx) => (
                  <div key={idx} className="border-l-4 border-gray-200 pl-3">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span>{getMessageIcon(msg.messageType)}</span>
                        <p className="font-semibold text-sm">{msg.adminName}</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <p className="text-sm text-gray-700">{msg.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Message to Admins */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Contact Admins</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <textarea
              placeholder="Send a message to admins..."
              className="w-full h-20 p-2 border rounded-md text-sm"
              defaultValue=""
              onBlur={(e) => {
                const msg = e.target.value.trim();
                if (msg) {
                  sendMessageToAdmins(msg);
                  e.target.value = '';
                }
              }}
            />
            <p className="text-xs text-gray-500">Press blur to send message to all admins</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
