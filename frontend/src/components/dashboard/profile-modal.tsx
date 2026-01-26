import { useState } from 'react';
import { X, Upload, CheckCircle, Clock, Edit2, Save, Camera } from 'lucide-react';
import { Button } from '../ui/button';

interface StudentData {
  name: string;
  email: string;
  verificationStatus: 'verified' | 'pending';
  profileImage?: string;
  studentId?: string;
  college?: string;
  course?: string;
}

interface ProfileModalProps {
  studentData: StudentData;
  onClose: () => void;
  onSave: (data: StudentData) => void;
}

export function ProfileModal({ studentData, onClose, onSave }: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(studentData);
  const [uploadingId, setUploadingId] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingId(true);
      // Simulate file upload - in a real app, this would upload to a server
      setTimeout(() => {
        const reader = new FileReader();
        reader.onloadend = () => {
          alert('Student ID uploaded successfully! Verification in progress...');
        };
        reader.readAsDataURL(file);
        setUploadingId(false);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">My Profile</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center border-4 border-purple-200 overflow-hidden">
                {formData.profileImage ? (
                  <img
                    src={formData.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl">👤</span>
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-purple-600 p-2 rounded-full cursor-pointer hover:bg-purple-700 transition-colors">
                  <Camera className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData((prev) => ({
                            ...prev,
                            profileImage: reader.result as string,
                          }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              )}
            </div>
            <p className="text-gray-600 text-sm">{formData.name}</p>
          </div>

          {/* Verification Status */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center gap-3 mb-2">
              {formData.verificationStatus === 'verified' ? (
                <>
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <h3 className="font-bold text-gray-900">Verified Account ✓</h3>
                </>
              ) : (
                <>
                  <Clock className="w-6 h-6 text-yellow-500" />
                  <h3 className="font-bold text-gray-900">Pending Verification</h3>
                </>
              )}
            </div>
            <p className="text-gray-600 text-sm">
              {formData.verificationStatus === 'verified'
                ? 'Your student ID has been verified. You can access all exclusive student benefits!'
                : 'Your verification is pending. Upload a valid student ID to unlock all benefits.'}
            </p>
          </div>

          {/* Personal Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-900">Personal Details</h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Student ID */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Student ID
                </label>
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* College */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  College/University
                </label>
                <input
                  type="text"
                  name="college"
                  value={formData.college || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Course */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Course/Program
                </label>
                <input
                  type="text"
                  name="course"
                  value={formData.course || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Student ID Upload */}
          <div className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Upload className="w-6 h-6 text-blue-600" />
              <h3 className="font-bold text-gray-900">Verify Your Student ID</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Upload a clear photo of your valid student ID to get verified and access exclusive benefits.
            </p>
            <label className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              {uploadingId ? 'Uploading...' : 'Upload Student ID'}
              <input
                type="file"
                accept="image/*,application/pdf"
                disabled={uploadingId}
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Close
            </Button>
            {isEditing && (
              <Button
                onClick={handleSave}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
