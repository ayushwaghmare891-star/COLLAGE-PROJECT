import { User, CheckCircle, Clock, Edit2 } from 'lucide-react';
import { Button } from '../ui/button';

interface WelcomeSectionProps {
  studentName: string;
  studentEmail: string;
  verificationStatus: 'verified' | 'pending';
  profileImage?: string;
  onEditProfile?: () => void;
}

export function WelcomeSection({
  studentName,
  studentEmail,
  verificationStatus,
  profileImage,
  onEditProfile,
}: WelcomeSectionProps) {
  const isVerified = verificationStatus === 'verified';

  return (
    <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-6">
          {/* Profile Image */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center overflow-hidden">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={studentName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-white" />
              )}
            </div>
            {/* Verification Badge */}
            <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1">
              {isVerified ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <Clock className="w-6 h-6 text-yellow-500" />
              )}
            </div>
          </div>

          {/* Welcome Text */}
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {studentName}! 🎉</h1>
            <p className="text-purple-100 mt-2">{studentEmail}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-sm font-semibold">Verification Status:</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  isVerified
                    ? 'bg-green-400/20 text-green-200'
                    : 'bg-yellow-400/20 text-yellow-200'
                }`}
              >
                {isVerified ? '✓ Verified' : '⏳ Pending Verification'}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Profile Button */}
        <Button
          onClick={onEditProfile}
          variant="outline"
          className="bg-white/20 border-white/40 text-white hover:bg-white/30 hover:border-white/60"
        >
          <Edit2 className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>
    </div>
  );
}
