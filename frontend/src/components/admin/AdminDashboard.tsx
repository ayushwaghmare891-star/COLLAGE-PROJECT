import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { UsersIcon, BuildingIcon, TagIcon, ShieldCheckIcon, TrendingUpIcon, ActivityIcon, AlertCircleIcon, CheckCircleIcon, UserCheckIcon } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface ActiveUsersStats {
  totalUsers: number;
  onlineUsers: number;
  offlineUsers: number;
  students: { total: number; online: number; offline: number };
  vendors: { total: number; online: number; offline: number };
}

interface OffersStats {
  activeOffers: number;
  changePercentage: string;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const [activeUsersStats, setActiveUsersStats] = useState<ActiveUsersStats | null>(null);
  const [offersStats, setOffersStats] = useState<OffersStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchActiveUsers();
    fetchOffersStats();
  }, []);

  const fetchActiveUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/admin/active-users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch active users');
      
      const data = await response.json();
      setActiveUsersStats(data.stats);
    } catch (error: any) {
      console.log('Note: Could not fetch active users stats');
      // Don't show error toast, just use default stats
    } finally {
      setLoading(false);
    }
  };

  const fetchOffersStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/offers-stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOffersStats(data);
      }
    } catch (error: any) {
      console.log('Note: Could not fetch offers stats');
    }
  };

  const stats = [
    { label: 'Total Users', value: activeUsersStats?.totalUsers || '0', icon: UsersIcon, bgGradient: 'from-indigo-600 to-indigo-700', iconColor: 'text-indigo-100', change: `${activeUsersStats?.onlineUsers || 0} online` },
    { label: 'Online Now', value: activeUsersStats?.onlineUsers || '0', icon: UserCheckIcon, bgGradient: 'from-emerald-600 to-teal-600', iconColor: 'text-emerald-100', change: '🟢 Live' },
    { label: 'Students Online', value: activeUsersStats?.students.online || '0', icon: UsersIcon, bgGradient: 'from-blue-600 to-cyan-600', iconColor: 'text-blue-100', change: `${activeUsersStats?.students.total || 0} total` },
    { label: 'Vendors Online', value: activeUsersStats?.vendors.online || '0', icon: BuildingIcon, bgGradient: 'from-purple-600 to-pink-600', iconColor: 'text-purple-100', change: `${activeUsersStats?.vendors.total || 0} total` },
    { label: 'Active Offers', value: offersStats?.activeOffers || '-', icon: TagIcon, bgGradient: 'from-orange-600 to-red-600', iconColor: 'text-orange-100', change: offersStats?.changePercentage || '-' },
  ];

  const recentActivity = [
    { id: 1, type: 'vendor', message: 'New Vendor: Pizza Hub registered', time: '5 minutes ago', icon: BuildingIcon, color: 'text-green-600' },
    { id: 2, type: 'verification', message: 'Student ID verification pending: John Doe', time: '12 minutes ago', icon: ShieldCheckIcon, color: 'text-orange-600' },
    { id: 3, type: 'offer', message: 'Offer "STUDENT20" added by TechZone', time: '1 hour ago', icon: TagIcon, color: 'text-blue-600' },
    { id: 4, type: 'student', message: 'New student registered: Sarah Smith', time: '2 hours ago', icon: UsersIcon, color: 'text-purple-600' },
    { id: 5, type: 'verification', message: 'Student ID approved: Mike Johnson', time: '3 hours ago', icon: CheckCircleIcon, color: 'text-green-600' },
  ];

  const pendingActions = [
    { id: 1, title: '23 Verification Requests', description: 'Student IDs waiting for approval', action: 'Review Now', route: '/admin/verifications', urgent: true },
    { id: 2, title: '5 New Vendor Applications', description: 'Vendors pending approval', action: 'Review', route: '/admin/vendors', urgent: false },
    { id: 3, title: '12 Expiring Offers', description: 'Offers expiring within 7 days', action: 'View', route: '/admin/offers', urgent: false },
  ];

  return (
    <div className="space-y-8 pb-8">
      <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 rounded-2xl px-8 py-12 text-white shadow-2xl border border-purple-800/50">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">
          Welcome back, Admin 👋
        </h1>
        <p className="text-purple-200 text-lg">
          Monitor your platform activity and manage users in real-time
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className={`bg-gradient-to-br ${stat.bgGradient} border-0 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 group`}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} strokeWidth={2.5} />
                </div>
              </div>
              <p className="text-white/80 text-sm font-medium mb-1">{stat.label}</p>
              <p className="text-4xl font-bold text-white mb-2">{stat.value}</p>
              <p className="text-white/70 text-xs">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Users Breakdown */}
      {activeUsersStats && (
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-2xl pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <ActivityIcon className="w-6 h-6 text-emerald-100" strokeWidth={2.5} />
              </div>
              <div>
                <CardTitle className="text-white">Live Activity</CardTitle>
                <CardDescription className="text-emerald-100">
                  Real-time user engagement metrics
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Students */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <UsersIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">Students</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      {activeUsersStats.students.online}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      / {activeUsersStats.students.total}
                    </span>
                  </div>
                  <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                      style={{ width: `${activeUsersStats.students.total > 0 ? (activeUsersStats.students.online / activeUsersStats.students.total) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {activeUsersStats.students.total > 0 ? Math.round((activeUsersStats.students.online / activeUsersStats.students.total) * 100) : 0}% logged in
                  </p>
                </div>
              </div>

              {/* Vendors */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <BuildingIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">Vendors</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {activeUsersStats.vendors.online}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      / {activeUsersStats.vendors.total}
                    </span>
                  </div>
                  <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                      style={{ width: `${activeUsersStats.vendors.total > 0 ? (activeUsersStats.vendors.online / activeUsersStats.vendors.total) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {activeUsersStats.vendors.total > 0 ? Math.round((activeUsersStats.vendors.online / activeUsersStats.vendors.total) * 100) : 0}% logged in
                  </p>
                </div>
              </div>

              {/* Total */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center">
                    <UserCheckIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">All Users</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      {activeUsersStats.onlineUsers}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      / {activeUsersStats.totalUsers}
                    </span>
                  </div>
                  <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${activeUsersStats.totalUsers > 0 ? (activeUsersStats.onlineUsers / activeUsersStats.totalUsers) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {activeUsersStats.totalUsers > 0 ? Math.round((activeUsersStats.onlineUsers / activeUsersStats.totalUsers) * 100) : 0}% active now
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Actions */}
      {pendingActions.some(action => action.urgent) && (
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
          <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-t-2xl pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <AlertCircleIcon className="w-6 h-6 text-amber-100" strokeWidth={2.5} />
              </div>
              <div>
                <CardTitle className="text-white">Action Required</CardTitle>
                <CardDescription className="text-amber-100">
                  Items that need your immediate attention
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pendingActions.map((action) => (
                <div
                  key={action.id}
                  className={`p-5 rounded-xl border-2 transition-all hover:shadow-lg ${
                    action.urgent 
                      ? 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-900 border-orange-300 dark:border-orange-700' 
                      : 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-gray-200 dark:border-gray-600'
                  }`}
                >
                  {action.urgent && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">URGENT</span>
                    </div>
                  )}
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">{action.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{action.description}</p>
                  <Button
                    onClick={() => navigate(action.route)}
                    size="sm"
                    className={action.urgent ? 'w-full bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg' : 'w-full bg-blue-600 text-white hover:bg-blue-700'}
                  >
                    {action.action} →
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="bg-card text-card-foreground border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-h3 text-card-foreground">Recent Activity</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Latest actions on your platform
                </CardDescription>
              </div>
              <ActivityIcon className="w-6 h-6 text-muted-foreground" strokeWidth={2} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-3 bg-background border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-muted flex-shrink-0`}>
                    <activity.icon className={`w-5 h-5 ${activity.color}`} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{activity.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-card text-card-foreground border-border">
          <CardHeader>
            <CardTitle className="text-h3 text-card-foreground">Quick Actions</CardTitle>
            <CardDescription className="text-muted-foreground">
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              <Button
                onClick={() => navigate('/admin/students')}
                className="w-full justify-start bg-blue-500 text-white hover:bg-blue-600 h-auto py-4"
              >
                <UsersIcon className="w-5 h-5 mr-3" strokeWidth={2} />
                <div className="text-left">
                  <p className="font-semibold">Manage Students</p>
                  <p className="text-xs opacity-90">View and approve student accounts</p>
                </div>
              </Button>

              <Button
                onClick={() => navigate('/admin/vendors')}
                className="w-full justify-start bg-green-500 text-white hover:bg-green-600 h-auto py-4"
              >
                <BuildingIcon className="w-5 h-5 mr-3" strokeWidth={2} />
                <div className="text-left">
                  <p className="font-semibold">Manage Vendors</p>
                  <p className="text-xs opacity-90">Review vendor applications</p>
                </div>
              </Button>

              <Button
                onClick={() => navigate('/admin/offers')}
                className="w-full justify-start bg-purple-500 text-white hover:bg-purple-600 h-auto py-4"
              >
                <TagIcon className="w-5 h-5 mr-3" strokeWidth={2} />
                <div className="text-left">
                  <p className="font-semibold">Manage Offers</p>
                  <p className="text-xs opacity-90">Monitor discount offers</p>
                </div>
              </Button>

              <Button
                onClick={() => navigate('/admin/verifications')}
                className="w-full justify-start bg-orange-500 text-white hover:bg-orange-600 h-auto py-4"
              >
                <ShieldCheckIcon className="w-5 h-5 mr-3" strokeWidth={2} />
                <div className="text-left">
                  <p className="font-semibold">Verification Requests</p>
                  <p className="text-xs opacity-90">Approve student IDs</p>
                </div>
              </Button>

              <Button
                onClick={() => navigate('/admin/analytics')}
                className="w-full justify-start bg-teal-500 text-white hover:bg-teal-600 h-auto py-4"
              >
                <TrendingUpIcon className="w-5 h-5 mr-3" strokeWidth={2} />
                <div className="text-left">
                  <p className="font-semibold">View Analytics</p>
                  <p className="text-xs opacity-90">Platform performance metrics</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Health */}
      <Card className="bg-card text-card-foreground border-border">
        <CardHeader>
          <CardTitle className="text-h3 text-card-foreground">Platform Health</CardTitle>
          <CardDescription className="text-muted-foreground">
            System status and performance indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">User Engagement</span>
                <span className="text-sm font-semibold text-green-600">92%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Verification Rate</span>
                <span className="text-sm font-semibold text-blue-600">87%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '87%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Vendor Satisfaction</span>
                <span className="text-sm font-semibold text-purple-600">95%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '95%' }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
