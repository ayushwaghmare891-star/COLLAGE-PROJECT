import { BarChart3, TrendingUp, PieChart } from 'lucide-react'

export function AnalyticsSection() {
  const chartData = {
    monthlyData: [
      { month: 'Jan', views: 400, redemptions: 240 },
      { month: 'Feb', views: 320, redemptions: 221 },
      { month: 'Mar', views: 200, redemptions: 229 },
      { month: 'Apr', views: 278, redemptions: 200 },
      { month: 'May', views: 189, redemptions: 120 },
      { month: 'Jun', views: 239, redemptions: 221 },
    ],
    topDiscounts: [
      { name: '20% Off Electronics', views: 512, redemptions: 89, conversion: '17.4%' },
      { name: 'Flat ₹500 Off Food', views: 478, redemptions: 156, conversion: '32.6%' },
      { name: '15% Off Apparel', views: 412, redemptions: 92, conversion: '22.3%' },
      { name: 'Buy 1 Get 1 Books', views: 289, redemptions: 47, conversion: '16.3%' },
    ],
  }

  const maxViews = Math.max(...chartData.monthlyData.map(d => Math.max(d.views, d.redemptions)))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
        <p className="text-gray-600 mt-2">Comprehensive analytics for your discount performance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">22.2%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-4">↑ 5.2% from last month</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue Boost</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">₹1.2L</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="text-blue-600" size={24} />
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-4">↑ 12% from last month</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Peak Traffic Day</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">Tuesday</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <PieChart className="text-purple-600" size={24} />
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-4">328 views on avg</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Repeat Customers</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">34%</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-orange-600" size={24} />
            </div>
          </div>
          <p className="text-xs text-orange-600 mt-4">↑ 8% from last month</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views vs Redemptions Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Student Views vs Redemptions</h2>
          <div className="space-y-4">
            {chartData.monthlyData.map((data, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{data.month}</span>
                  <span className="text-xs text-gray-600">{data.views} views, {data.redemptions} redeemed</span>
                </div>
                <div className="flex gap-2 h-8 bg-gray-100 rounded-lg overflow-hidden">
                  <div
                    className="bg-blue-500 rounded-lg"
                    style={{ width: `${(data.views / maxViews) * 100}%` }}
                    title={`Views: ${data.views}`}
                  />
                  <div
                    className="bg-green-500 rounded-lg"
                    style={{ width: `${(data.redemptions / maxViews) * 100}%` }}
                    title={`Redemptions: ${data.redemptions}`}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-xs text-gray-600">Student Views</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-xs text-gray-600">Redemptions</span>
            </div>
          </div>
        </div>

        {/* Conversion Rate Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Conversion by Category</h2>
          <div className="space-y-4">
            {[
              { category: 'Electronics', rate: 17.4, color: 'bg-blue-500' },
              { category: 'Food & Beverage', rate: 32.6, color: 'bg-green-500' },
              { category: 'Apparel', rate: 22.3, color: 'bg-purple-500' },
              { category: 'Books', rate: 16.3, color: 'bg-orange-500' },
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.category}</span>
                  <span className="text-sm font-bold text-gray-900">{item.rate}%</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full`}
                    style={{ width: `${item.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Discounts */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Discounts</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Discount Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Views</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Redemptions</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Conversion Rate</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Performance</th>
              </tr>
            </thead>
            <tbody>
              {chartData.topDiscounts.map((discount, idx) => {
                const performance = parseFloat(discount.conversion)
                let performanceColor = 'text-orange-600'
                if (performance >= 30) performanceColor = 'text-green-600'
                else if (performance >= 20) performanceColor = 'text-blue-600'

                return (
                  <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{discount.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{discount.views}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm font-semibold">
                        {discount.redemptions}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">{discount.conversion}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${parseFloat(discount.conversion)}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold ${performanceColor}`}>
                          {performance >= 30 ? '★★★' : performance >= 20 ? '★★' : '★'}
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights & Recommendations */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Insights & Recommendations</h2>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-600 text-white font-bold">1</div>
            </div>
            <div>
              <p className="font-medium text-gray-900">High Conversion Rate</p>
              <p className="text-sm text-gray-600">Your Food & Beverage discounts have the highest conversion rate (32.6%). Consider creating more discounts in this category.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-600 text-white font-bold">2</div>
            </div>
            <div>
              <p className="font-medium text-gray-900">Peak Traffic Day</p>
              <p className="text-sm text-gray-600">Tuesday sees the highest student traffic. Schedule new discount launches on Tuesdays for better visibility.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-600 text-white font-bold">3</div>
            </div>
            <div>
              <p className="font-medium text-gray-900">Repeat Customer Growth</p>
              <p className="text-sm text-gray-600">34% of students are returning customers. Focus on maintaining quality discounts to improve this metric further.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
