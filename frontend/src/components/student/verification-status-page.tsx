'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { 
  CheckCircleIcon, 
  Clock, 
  AlertCircleIcon,
  RefreshCw,
  Loader2Icon
} from 'lucide-react'
import { useToast } from '../../hooks/use-toast'
import { getStudentVerificationStatus } from '../../lib/authAPI'

interface VerificationStatus {
  verificationStatus: 'pending' | 'verified' | 'rejected'
  approvalStatus: 'pending' | 'approved' | 'rejected'
  isVerified: boolean
  isEmailVerified: boolean
  verificationDocuments: string[]
  approvedAt?: string
}

export function VerificationStatusPage() {
  const [status, setStatus] = useState<VerificationStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const { toast } = useToast()

  // Fetch status on mount
  useEffect(() => {
    fetchStatus()
  }, [])

  // Auto-refresh status every 30 seconds if pending
  useEffect(() => {
    if (!autoRefresh || !status) return

    const isPending = status.approvalStatus === 'pending' || status.verificationStatus === 'pending'
    if (!isPending) {
      setAutoRefresh(false)
      return
    }

    const interval = setInterval(() => {
      fetchStatus(true)
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [status, autoRefresh])

  const fetchStatus = async (isAutoRefresh = false) => {
    try {
      if (!isAutoRefresh) setLoading(true)
      else setRefreshing(true)

      const result = await getStudentVerificationStatus()
      setStatus(result)

      if (!isAutoRefresh) {
        toast({
          title: '✅ Status loaded',
          description: 'Your verification status has been loaded',
        })
      }
    } catch (error: any) {
      toast({
        title: '❌ Error loading status',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getStatusBadge = (verificationStatus: string, approvalStatus: string) => {
    if (approvalStatus === 'approved') {
      return (
        <Badge className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
          <CheckCircleIcon className="w-4 h-4" />
          ✅ Approved - Ready to Login
        </Badge>
      )
    }

    if (approvalStatus === 'rejected') {
      return (
        <Badge className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2">
          <AlertCircleIcon className="w-4 h-4" />
          ❌ Rejected
        </Badge>
      )
    }

    if (verificationStatus === 'pending') {
      return (
        <Badge className="bg-yellow-600 hover:bg-yellow-700 text-white flex items-center gap-2">
          <Clock className="w-4 h-4" />
          ⏳ Pending Document Verification
        </Badge>
      )
    }

    if (verificationStatus === 'verified' && approvalStatus === 'pending') {
      return (
        <Badge className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
          <Clock className="w-4 h-4" />
          🔍 Documents Verified - Awaiting Final Approval
        </Badge>
      )
    }

    return (
      <Badge className="bg-gray-600 hover:bg-gray-700 text-white flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Processing...
      </Badge>
    )
  }

  const getStepsStatus = () => {
    if (!status) return []

    return [
      {
        step: 1,
        title: 'Account Created',
        description: 'Your student account has been created',
        completed: true,
        current: false,
      },
      {
        step: 2,
        title: 'Document Upload',
        description: 'Upload your student ID document',
        completed: status.verificationDocuments && status.verificationDocuments.length > 0,
        current: status.verificationDocuments && status.verificationDocuments.length > 0 && status.verificationStatus === 'pending',
      },
      {
        step: 3,
        title: 'Document Verification',
        description: 'Admin verifies your submitted documents',
        completed: status.verificationStatus === 'verified',
        current: status.verificationStatus === 'pending' && status.verificationDocuments && status.verificationDocuments.length > 0,
      },
      {
        step: 4,
        title: 'Final Approval',
        description: 'Admin approves your account for login',
        completed: status.approvalStatus === 'approved',
        current: status.verificationStatus === 'verified' && status.approvalStatus === 'pending',
      },
    ]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2Icon className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your verification status...</p>
        </div>
      </div>
    )
  }

  if (!status) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <h2 className="text-2xl font-bold text-gray-900">Error</h2>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Could not load your verification status</p>
            <Button onClick={() => fetchStatus()} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const steps = getStepsStatus()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-2xl shadow-md">
                📋
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Verification Status
                </h1>
                <p className="text-gray-600 mt-1">
                  Track your account verification and approval progress
                </p>
              </div>
            </div>
            <Button
              onClick={() => fetchStatus()}
              disabled={refreshing}
              className="gap-2"
            >
              {refreshing ? (
                <>
                  <Loader2Icon className="w-4 h-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Current Status Card */}
        <Card className="mb-8 border-2">
          <CardHeader>
            <h2 className="text-xl font-bold text-gray-900">Current Status</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Overall Status</p>
                {getStatusBadge(status.verificationStatus, status.approvalStatus)}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-600 mb-1">Document Verification</p>
                <p className="text-sm font-semibold text-gray-900">
                  {status.verificationStatus === 'verified' ? '✅ Verified' : 
                   status.verificationStatus === 'rejected' ? '❌ Rejected' : 
                   '⏳ Pending'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-600 mb-1">Account Approval</p>
                <p className="text-sm font-semibold text-gray-900">
                  {status.approvalStatus === 'approved' ? '✅ Approved' : 
                   status.approvalStatus === 'rejected' ? '❌ Rejected' : 
                   '⏳ Pending'}
                </p>
              </div>
            </div>

            {status.approvalStatus === 'approved' && status.approvedAt && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-900">
                  ✅ Your account was approved on {new Date(status.approvedAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-green-800 mt-2">
                  You can now login and access all available offers!
                </p>
              </div>
            )}

            {status.approvalStatus === 'rejected' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-900">
                  ❌ Your account has been rejected. Please contact support for more information.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress Steps */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-gray-900">Verification Process</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={step.step} className="flex gap-4">
                  {/* Step Number */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        step.completed
                          ? 'bg-green-600 text-white'
                          : step.current
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {step.completed ? '✓' : step.step}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-1 h-12 mt-2 ${
                          step.completed ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                      />
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 pb-2">
                    <h3 className="font-semibold text-gray-900">{step.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                    {step.completed && (
                      <p className="text-xs text-green-600 font-medium mt-2">✅ Completed</p>
                    )}
                    {step.current && (
                      <p className="text-xs text-blue-600 font-medium mt-2 animate-pulse">
                        ⏳ In Progress
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Auto Refresh Info */}
        {status.approvalStatus === 'pending' && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              💡 <strong>Auto-refresh enabled:</strong> Your status is automatically refreshed every 30 seconds. You can close this page and come back later to check your progress.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
