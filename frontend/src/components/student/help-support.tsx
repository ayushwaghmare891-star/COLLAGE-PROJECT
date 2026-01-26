import { MessageSquare, Mail, Phone, AlertCircle, HelpCircle, FileText } from 'lucide-react';
import { useState } from 'react';

interface HelpItem {
  id: string;
  title: string;
  description: string;
  category: 'faq' | 'contact' | 'guides';
  icon: any;
}

const helpItems: HelpItem[] = [
  {
    id: '1',
    title: 'How to claim a discount?',
    description: 'Step-by-step guide to claim and use student discounts on our platform.',
    category: 'faq',
    icon: HelpCircle,
  },
  {
    id: '2',
    title: 'Student ID Verification Process',
    description: 'Learn how to verify your student status and get access to exclusive offers.',
    category: 'guides',
    icon: FileText,
  },
  {
    id: '3',
    title: 'How to Save Offers',
    description: 'Bookmark and save your favorite discounts for later use.',
    category: 'faq',
    icon: HelpCircle,
  },
  {
    id: '4',
    title: 'Coupon Redemption Guide',
    description: 'Complete guide to redeem coupons at partner stores and online.',
    category: 'guides',
    icon: FileText,
  },
  {
    id: '5',
    title: 'Troubleshooting Common Issues',
    description: 'Solutions for verification failures, coupon issues, and technical problems.',
    category: 'faq',
    icon: AlertCircle,
  },
];

export function HelpSupport() {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', contactForm);
    alert('Your message has been sent! We will get back to you soon.');
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 border-l-4 border-purple-500">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Help & Support</h1>
        <p className="text-gray-600">
          Find answers to common questions and get in touch with our support team
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - FAQs and Guides */}
        <div className="lg:col-span-2 space-y-6">
          {/* FAQs Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-purple-600" />
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {helpItems
                .filter((item) => item.category === 'faq')
                .map((item) => (
                  <details
                    key={item.id}
                    className="group border border-gray-200 rounded-lg hover:border-purple-300 transition-colors cursor-pointer"
                  >
                    <summary className="px-4 py-3 font-semibold text-gray-700 flex items-center gap-3 group-open:text-purple-600 group-open:bg-purple-50">
                      <HelpCircle className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      {item.title}
                    </summary>
                    <p className="px-4 py-3 text-gray-600 bg-gray-50 border-t border-gray-200">
                      {item.description}
                    </p>
                  </details>
                ))}
            </div>
          </div>

          {/* Guides Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Guides & Tutorials
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {helpItems
                .filter((item) => item.category === 'guides')
                .map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300"
                  >
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right Column - Contact & Support */}
        <div className="space-y-6">
          {/* Quick Contact */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Contact</h2>
            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-800">support@studentdiscount.com</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold text-gray-800">+91 1234567890</p>
                </div>
              </div>

              {/* Live Chat */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Live Chat</p>
                  <button className="font-semibold text-purple-600 hover:text-purple-700 transition-colors">
                    Start Chat
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
            <h3 className="font-semibold text-gray-800 mb-3">Support Hours</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>📅 <strong>Monday - Friday:</strong> 9:00 AM - 8:00 PM</p>
              <p>📅 <strong>Saturday:</strong> 10:00 AM - 6:00 PM</p>
              <p>📅 <strong>Sunday:</strong> 10:00 AM - 4:00 PM</p>
              <p className="text-xs text-gray-600 mt-3">*All times in IST</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Send us a Message</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={contactForm.name}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                placeholder="Your name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={contactForm.email}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                placeholder="your.email@example.com"
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
            <select
              name="subject"
              value={contactForm.subject}
              onChange={handleFormChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            >
              <option value="">Select a subject</option>
              <option value="verification">Verification Issue</option>
              <option value="discount">Discount Problem</option>
              <option value="coupon">Coupon Issue</option>
              <option value="technical">Technical Issue</option>
              <option value="feedback">Feedback</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
            <textarea
              name="message"
              value={contactForm.message}
              onChange={handleFormChange}
              required
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
              placeholder="Describe your issue or feedback..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
