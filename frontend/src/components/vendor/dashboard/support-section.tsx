import { useState } from 'react'
import { HelpCircle, MessageCircle, Phone, Mail, ChevronDown, Send, AlertCircle } from 'lucide-react'

export function SupportSection() {
  const [activeTab, setActiveTab] = useState<'faq' | 'ticket' | 'contact'>('faq')
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: '',
    description: '',
    priority: 'medium',
  })
  const [supportTickets] = useState([
    {
      id: 'TKT001',
      subject: 'Unable to create discount',
      category: 'Technical Issue',
      status: 'resolved',
      createdDate: '2026-01-10',
      resolvedDate: '2026-01-11',
    },
    {
      id: 'TKT002',
      subject: 'Question about redemption process',
      category: 'General Query',
      status: 'open',
      createdDate: '2026-01-12',
      resolvedDate: null,
    },
  ])

  const faqs = [
    {
      category: 'Discount Management',
      questions: [
        {
          q: 'How do I create a new discount?',
          a: 'Navigate to "Create Discount" from the sidebar. Fill in the discount details including type, value, validity period, and usage limits. Click "Create Discount" to publish.',
        },
        {
          q: 'Can I edit a discount after publishing?',
          a: 'Yes, you can edit active discounts. Go to "My Discounts", click the edit button, make changes, and save. Changes take effect immediately.',
        },
        {
          q: 'What happens when a discount expires?',
          a: 'Expired discounts automatically move to "Inactive" status. Students can no longer redeem them, but they remain in your history for reference.',
        },
        {
          q: 'Is there a limit to how many discounts I can create?',
          a: 'No, you can create unlimited discounts. However, we recommend keeping 10-15 active discounts at a time for best results.',
        },
      ],
    },
    {
      category: 'Student Verification',
      questions: [
        {
          q: 'What are the student verification methods?',
          a: 'Students can verify using their college ID or email address. We verify their authenticity before allowing them to redeem discounts.',
        },
        {
          q: 'Can I verify students manually?',
          a: 'Currently, student verification is automated. Manual verification will be available in a future update.',
        },
        {
          q: 'Why do some students show as unverified?',
          a: 'Students who haven\'t completed the verification process or use incorrect credentials appear as unverified in your redemptions list.',
        },
      ],
    },
    {
      category: 'Payment & Billing',
      questions: [
        {
          q: 'Are there any charges for using this platform?',
          a: 'Platform usage is currently free for verified vendors. We may introduce premium features in the future.',
        },
        {
          q: 'How do I update my payment information?',
          a: 'Payment settings can be updated in Business Profile > Payment Settings. Your information is encrypted and secure.',
        },
        {
          q: 'When do I receive my analytics reports?',
          a: 'Analytics are updated in real-time. You can download reports anytime from the Analytics section.',
        },
      ],
    },
    {
      category: 'Account & Security',
      questions: [
        {
          q: 'How do I reset my password?',
          a: 'Click "Forgot Password" on the login page. Enter your email and follow the reset instructions sent to your inbox.',
        },
        {
          q: 'How is my data protected?',
          a: 'We use industry-standard SSL encryption and follow GDPR guidelines. Your business data is stored securely.',
        },
        {
          q: 'Can I have multiple admin users?',
          a: 'Currently, one admin per business is supported. Multi-admin support is coming soon.',
        },
      ],
    },
  ]

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Ticket submitted:', ticketForm)
    setTicketForm({ subject: '', category: '', description: '', priority: 'medium' })
    alert('Support ticket submitted successfully!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Support & Help Center</h1>
        <p className="text-gray-600 mt-2">Get help, ask questions, and reach out to our support team</p>
      </div>

      {/* Quick Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Phone className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="font-medium text-gray-900">Phone Support</p>
              <p className="text-sm text-gray-600">+91 1800-SUPPORT</p>
              <p className="text-xs text-gray-600">Mon-Fri, 9AM-6PM IST</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Mail className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="font-medium text-gray-900">Email Support</p>
              <p className="text-sm text-gray-600">support@studentdiscount.com</p>
              <p className="text-xs text-gray-600">Response in 24 hours</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <MessageCircle className="text-green-600" size={24} />
            </div>
            <div>
              <p className="font-medium text-gray-900">Live Chat</p>
              <p className="text-sm text-gray-600">Chat with our team</p>
              <p className="text-xs text-gray-600">Usually responds instantly</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-gray-200 bg-white rounded-t-lg">
        {[
          { id: 'faq', label: 'FAQ', icon: HelpCircle },
          { id: 'ticket', label: 'Support Ticket', icon: AlertCircle },
          { id: 'contact', label: 'Contact Us', icon: Phone },
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              <Icon size={20} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-b-lg border border-t-0 border-gray-200 shadow-sm p-6">
        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div className="space-y-6">
            {faqs.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{section.category}</h3>
                <div className="space-y-3">
                  {section.questions.map((item, qIdx) => (
                    <details key={qIdx} className="group border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <summary className="flex items-center justify-between cursor-pointer font-medium text-gray-900">
                        <span>{item.q}</span>
                        <ChevronDown
                          size={20}
                          className="text-gray-400 group-open:rotate-180 transition-transform"
                        />
                      </summary>
                      <p className="text-gray-600 mt-4 text-sm">{item.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Support Ticket Tab */}
        {activeTab === 'ticket' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Support Ticket</h3>
              <form onSubmit={handleTicketSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                  <input
                    type="text"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    placeholder="Brief description of your issue"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select
                      value={ticketForm.category}
                      onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select category</option>
                      <option value="technical">Technical Issue</option>
                      <option value="billing">Billing</option>
                      <option value="discount">Discount Management</option>
                      <option value="verification">Verification</option>
                      <option value="general">General Query</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
                    <select
                      value={ticketForm.priority}
                      onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                    placeholder="Please provide detailed information about your issue..."
                    rows={6}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Send size={18} />
                  Submit Ticket
                </button>
              </form>
            </div>

            {/* Recent Tickets */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Recent Tickets</h3>
              <div className="space-y-3">
                {supportTickets.map((ticket) => (
                  <div key={ticket.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-gray-900 text-sm">{ticket.subject}</p>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          ticket.status === 'resolved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {ticket.status === 'resolved' ? '✓' : '⏳'} {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{ticket.category}</p>
                    <p className="text-xs text-gray-500">ID: {ticket.id}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Contact Us Tab */}
        {activeTab === 'contact' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Get in Touch</h3>
                <p className="text-gray-600">We're here to help! Reach out to us through any of these channels.</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Office Location</h4>
                <p className="text-gray-600 text-sm">
                  Student Discount Hub<br />
                  123 Tech Park, Bangalore<br />
                  Karnataka 560001, India
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Email</h4>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="text-gray-600">General: </span>
                    <a href="mailto:info@studentdiscount.com" className="text-blue-600 hover:underline">
                      info@studentdiscount.com
                    </a>
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-600">Support: </span>
                    <a href="mailto:support@studentdiscount.com" className="text-blue-600 hover:underline">
                      support@studentdiscount.com
                    </a>
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-600">Vendor: </span>
                    <a href="mailto:vendor@studentdiscount.com" className="text-blue-600 hover:underline">
                      vendor@studentdiscount.com
                    </a>
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Business Hours</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Monday - Friday: 9:00 AM - 6:00 PM IST</p>
                  <p>Saturday: 10:00 AM - 4:00 PM IST</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Follow Us</h4>
                <div className="flex gap-3">
                  {['Twitter', 'Facebook', 'Instagram', 'LinkedIn'].map((social) => (
                    <a
                      key={social}
                      href="#"
                      className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 hover:bg-blue-600 hover:text-white transition-all"
                    >
                      {social[0]}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Map or Additional Info */}
            <div className="bg-gray-100 rounded-lg p-6 flex flex-col items-center justify-center">
              <div className="text-center">
                <HelpCircle size={48} className="text-gray-400 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Need Quick Help?</h4>
                <p className="text-gray-600 mb-4">Try our FAQ or contact us directly for assistance.</p>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Start Live Chat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
