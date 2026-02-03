'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, XCircle, Clock, Download, Filter } from 'lucide-react'
import { useRealtimeVendor } from '../../hooks/useRealtimeVendor'
import { useToast } from '../../hooks/use-toast'
import { getHeaders, API_BASE_URL } from '../../lib/api'

interface Verification {
  id: string | number
  studentName: string
  email: string
  university?: string
  documentType: string
  submittedAt: string
  status: 'pending' | 'verified' | 'rejected'
  documentUrl?: string
  rejectionReason?: string
}

export function StudentVerification() {
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVerification, setSelectedVerification] = useState<string | number | null>(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const { toast } = useToast()

  // Real-time vendor hook
  const { isConnected, requestVerificationsUpdate } = useRealtimeVendor(
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    // onVerificationsUpdated
    (update) => {
      console.log('Verifications updated via real-time:', update.verifications)
      if (update.verifications && Array.isArray(update.verifications)) {
        setVerifications(update.verifications)
      }
      setLoading(false)
    }
  )

  // Fetch verifications on component mount
  useEffect(() => {
    fetchVerifications()
  }, [])

  // Request real-time update
  useEffect(() => {
    if (isConnected) {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          requestVerificationsUpdate(user.id)
        } catch (error) {
          console.error('Failed to get vendor ID:', error)
        }
      }
    }
  }, [isConnected, requestVerificationsUpdate])

  const fetchVerifications = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/vendor/pending-verifications`, {
        headers: getHeaders(),
      })

      if (!response.ok) throw new Error('Failed to fetch verifications')

      const data = await response.json()
      if (data.success && data.data && Array.isArray(data.data.verifications)) {
        setVerifications(data.data.verifications)
      }
    } catch (error: any) {
      console.error('Error fetching verifications:', error)
      setVerifications([])
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string | number) => {
    try {
      // API call to approve verification
      const response = await fetch(`${API_BASE_URL}/admin/verify-student/${id}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ status: 'verified' }),
      })

      if (!response.ok) throw new Error('Failed to approve verification')

      // Update local state
      setVerifications(
        verifications.map(v => (v.id === id ? { ...v, status: 'verified' as const } : v))
      )
      setSelectedVerification(null)
      toast({
        title: 'Success',
        description: 'Student verified successfully',
        variant: 'default',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve verification',
        variant: 'destructive',
      })
    }
  }

  const handleReject = async (id: string | number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/verify-student/${id}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ status: 'rejected', reason: 'Document unclear or invalid' }),
      })

      if (!response.ok) throw new Error('Failed to reject verification')

      setVerifications(
        verifications.map(v =>
          v.id === id ? { ...v, status: 'rejected' as const, rejectionReason: 'Document unclear or invalid' } : v
        )
      )
      setSelectedVerification(null)
      toast({
        title: 'Success',
        description: 'Student verification rejected',
        variant: 'default',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject verification',
        variant: 'destructive',
      })
    }
  }

  const filteredVerifications = verifications.filter(v =>
    filterStatus === 'all' ? true : v.status === filterStatus
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle2 size={20} className="text-green-600" />
      case 'rejected':
        return <XCircle size={20} className="text-red-600" />
      default:
        return <Clock size={20} className="text-yellow-600" />
    }
  }

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-50 border-green-200'
      case 'rejected':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-yellow-50 border-yellow-200'
    }
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Student Document Verification</h1>
          <p className="text-gray-600 mt-2">Verify and approve student documents</p>
        </div>
        <div className="flex gap-2">
          <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-bold text-sm">
            {filteredVerifications.filter(v => v.status === 'pending').length} Pending
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'verified', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg transition font-medium text-sm ${
              filterStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-300'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Verification List */}
      <div className="space-y-4">
        {filteredVerifications.map((verification) => (
          <div
            key={verification.id}
            className={`border rounded-xl p-4 sm:p-6 hover:shadow-md transition-all cursor-pointer ${getStatusBgColor(
              verification.status
            )}`}
            onClick={() => setSelectedVerification(verification.id)}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                {getStatusIcon(verification.status)}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">{verification.studentName}</h3>
                  <p className="text-sm text-gray-600 mt-1">{verification.email}</p>
                  <div className="flex flex-wrap gap-3 mt-3">
                    <div>
                      <p className="text-xs text-gray-500">University</p>
                      <p className="text-sm font-semibold text-gray-900">{verification.university}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Document Type</p>
                      <p className="text-sm font-semibold text-gray-900">{verification.documentType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Submitted</p>
                      <p className="text-sm font-semibold text-gray-900">{verification.submittedAt}</p>
                    </div>
                  </div>
                  {verification.rejectionReason && (
                    <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-lg">
                      <p className="text-xs font-medium text-red-800">Rejection Reason</p>
                      <p className="text-sm text-red-700 mt-1">{verification.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span
                  className={`px-4 py-1 rounded-full text-xs font-bold ${
                    verification.status === 'verified'
                      ? 'bg-green-200 text-green-800'
                      : verification.status === 'rejected'
                      ? 'bg-red-200 text-red-800'
                      : 'bg-yellow-200 text-yellow-800'
                  }`}
                >
                  {verification.status.charAt(0).toUpperCase() + verification.status.slice(1)}
                </span>
              </div>
            </div>

            {selectedVerification === verification.id && (
              <div className="mt-6 pt-6 border-t border-current border-opacity-20 space-y-4">
                {/* Document Preview */}
                <div className="bg-white rounded-lg p-4 border border-gray-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Document: {verification.documentType}</p>
                      <p className="text-sm text-gray-600 mt-1">Click to preview or download</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition font-medium text-sm">
                      <Download size={16} />
                      Download
                    </button>
                  </div>
                </div>

                {/* Action Buttons - Only show for pending */}
                {verification.status === 'pending' && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handleApprove(verification.id)}
                      className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition"
                    >
                      <CheckCircle2 className="inline mr-2" size={18} />
                      Approve & Verify
                    </button>
                    <button
                      onClick={() => handleReject(verification.id)}
                      className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition"
                    >
                      <XCircle className="inline mr-2" size={18} />
                      Reject & Request Resubmit
                    </button>
                  </div>
                )}

                {verification.status === 'verified' && (
                  <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
                    <p className="font-semibold text-green-800">✓ Document Verified</p>
                    <p className="text-sm text-green-700 mt-1">This student is verified and can use discounts</p>
                  </div>
                )}

                {verification.status === 'rejected' && (
                  <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                    <p className="font-semibold text-red-800">✕ Document Rejected</p>
                    <p className="text-sm text-red-700 mt-1">Student has been notified and can resubmit</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredVerifications.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No verifications found</p>
        </div>
      )}
    </main>
  )
}
