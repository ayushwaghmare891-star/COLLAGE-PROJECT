import { CheckCircle, Clock, XCircle } from 'lucide-react';

interface DashboardHeaderProps {
  studentName: string;
  studentEmail: string;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  lastVerificationDate?: string;
}

export function DashboardHeader({
  studentName,
  studentEmail,
  verificationStatus,
  lastVerificationDate,
}: DashboardHeaderProps) {
  const getVerificationColor = () => {
    switch (verificationStatus) {
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getVerificationIcon = () => {
    switch (verificationStatus) {
      case 'verified':
        return <CheckCircle className="w-5 h-5" />;
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'rejected':
        return <XCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getVerificationLabel = () => {
    switch (verificationStatus) {
      case 'verified':
        return 'Verified';
      case 'pending':
        return 'Pending Verification';
      case 'rejected':
        return 'Verification Rejected';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg p-8 mb-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Welcome, {studentName}! 👋</h1>
          <p className="text-purple-100 mb-4">{studentEmail}</p>
          
          {/* Verification Status Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 font-semibold ${getVerificationColor()}`}>
            {getVerificationIcon()}
            <span>{getVerificationLabel()}</span>
          </div>

          {lastVerificationDate && (
            <p className="text-purple-100 text-sm mt-3">
              Last updated: {lastVerificationDate}
            </p>
          )}
        </div>

        {/* Quick Stats Preview */}
        <div className="hidden lg:block text-right">
          <div className="text-3xl font-bold">💰 Save Big</div>
          <p className="text-purple-100 text-sm">Exclusive student discounts await</p>
        </div>
      </div>
    </div>
  );
}
