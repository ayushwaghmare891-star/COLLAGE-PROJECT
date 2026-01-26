import { CheckCircle2, Clock, AlertCircle, FileText, Upload, Eye, Download } from 'lucide-react'

export function VerificationStatus() {
  const verificationData = {
    status: 'approved',
    completedDate: '2026-01-10',
    documents: [
      {
        id: '1',
        name: 'GST Certificate',
        type: 'Tax Registration',
        status: 'approved',
        uploadedDate: '2026-01-05',
        expiryDate: '2028-01-05',
      },
      {
        id: '2',
        name: 'Business Registration',
        type: 'Business License',
        status: 'approved',
        uploadedDate: '2026-01-05',
        expiryDate: '2027-12-31',
      },
      {
        id: '3',
        name: 'Shop License',
        type: 'Local Authority License',
        status: 'approved',
        uploadedDate: '2026-01-08',
        expiryDate: '2026-12-31',
      },
      {
        id: '4',
        name: 'Bank Account Verification',
        type: 'Financial Document',
        status: 'approved',
        uploadedDate: '2026-01-10',
        expiryDate: null,
      },
    ],
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      approved: {
        bg: 'bg-green-50',
        text: 'text-green-800',
        icon: <CheckCircle2 size={20} className="text-green-600" />,
      },
      pending: {
        bg: 'bg-yellow-50',
        text: 'text-yellow-800',
        icon: <Clock size={20} className="text-yellow-600" />,
      },
      rejected: {
        bg: 'bg-red-50',
        text: 'text-red-800',
        icon: <AlertCircle size={20} className="text-red-600" />,
      },
    }
    return styles[status] || styles.pending
  }

  const mainStatus = getStatusBadge(verificationData.status)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Verification Status</h1>
        <p className="text-gray-600 mt-2">Your business verification and approval status</p>
      </div>

      {/* Main Status Card */}
      <div className={`rounded-lg border-2 border-green-200 ${mainStatus.bg} p-8 shadow-sm`}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">{mainStatus.icon}</div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-2xl font-bold ${mainStatus.text}`}>
                  {verificationData.status === 'approved'
                    ? 'Business Verified & Approved'
                    : verificationData.status === 'pending'
                    ? 'Verification Pending'
                    : 'Verification Rejected'}
                </h2>
                <p className="text-gray-600 mt-2">
                  {verificationData.status === 'approved'
                    ? `Your business has been approved and verified. You can now access all features and create discounts.`
                    : verificationData.status === 'pending'
                    ? 'Your verification documents are under review. This usually takes 2-3 business days.'
                    : 'Please review the feedback and resubmit your documents for verification.'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Approved on</p>
                <p className="text-lg font-bold text-gray-900">{verificationData.completedDate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Benefits */}
      {verificationData.status === 'approved' && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Benefits of Verification</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: '✓', title: 'Verified Badge', desc: 'Display verified badge on your profile' },
              { icon: '✓', title: 'Increased Trust', desc: 'Students see your verification status' },
              { icon: '✓', title: 'Higher Visibility', desc: 'Appear higher in student search results' },
              { icon: '✓', title: 'All Features', desc: 'Access to advanced discount management tools' },
            ].map((benefit, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  {benefit.icon}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{benefit.title}</p>
                  <p className="text-sm text-gray-600">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Verification Documents</h2>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
            <Upload size={18} />
            Upload New Document
          </button>
        </div>

        {/* Document List */}
        <div className="space-y-4">
          {verificationData.documents.map((doc) => {
            const docStatus = getStatusBadge(doc.status)
            return (
              <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText size={24} className="text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{doc.name}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 ${
                          doc.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : doc.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {doc.status === 'approved' ? '✓' : doc.status === 'pending' ? '⏳' : '✕'} {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{doc.type}</p>
                      <div className="flex gap-4 mt-2 text-xs text-gray-600">
                        <span>Uploaded: {doc.uploadedDate}</span>
                        {doc.expiryDate && <span>Expires: {doc.expiryDate}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded transition-colors text-gray-600">
                      <Eye size={18} />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded transition-colors text-gray-600">
                      <Download size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Verification Timeline */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Verification Timeline</h2>
        <div className="space-y-6">
          {[
            {
              step: 'Application Submitted',
              date: '2026-01-05',
              status: 'completed',
              desc: 'Your verification request was submitted successfully',
            },
            {
              step: 'Documents Review',
              date: '2026-01-08',
              status: 'completed',
              desc: 'Our team reviewed all your submitted documents',
            },
            {
              step: 'Admin Approval',
              date: '2026-01-10',
              status: 'completed',
              desc: 'Your business has been approved by our admin team',
            },
            {
              step: 'Account Activated',
              date: '2026-01-10',
              status: 'completed',
              desc: 'Your account is now fully activated with all features',
            },
          ].map((item, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                  item.status === 'completed' ? 'bg-green-600' : 'bg-gray-300'
                }`}>
                  {item.status === 'completed' ? '✓' : idx + 1}
                </div>
                {idx < 3 && (
                  <div className="w-1 h-12 bg-green-200 mt-2" />
                )}
              </div>
              <div className="pt-2">
                <h4 className="font-semibold text-gray-900">{item.step}</h4>
                <p className="text-sm text-gray-600">{item.desc}</p>
                <p className="text-xs text-gray-500 mt-1">{item.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            {
              q: 'How long does verification usually take?',
              a: 'Verification typically takes 2-3 business days. We review all documents and verify the information before approval.',
            },
            {
              q: 'What documents do I need to submit?',
              a: 'You need to submit GST certificate, business registration, shop license, and bank account verification documents.',
            },
            {
              q: 'Can I create discounts before verification?',
              a: 'You can create discounts after your business is verified and approved. This ensures authenticity for students.',
            },
            {
              q: 'What if my verification is rejected?',
              a: 'If rejected, you\'ll receive detailed feedback on what needs to be corrected. You can then resubmit your documents.',
            },
          ].map((faq, idx) => (
            <details key={idx} className="group border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <summary className="flex items-center gap-3 cursor-pointer font-medium text-gray-900">
                <span className="group-open:hidden">→</span>
                <span className="hidden group-open:inline">↓</span>
                {faq.q}
              </summary>
              <p className="text-sm text-gray-600 mt-3 ml-6">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  )
}
