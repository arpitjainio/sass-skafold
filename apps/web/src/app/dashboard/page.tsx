'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  Activity,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Heading, StatsCard } from '@repo/ui';
import { useDashboardAnalytics } from '@/lib/hooks/useAnalytics';
import { useRecentUsers, useRecentActivity } from '@/lib/hooks/useRecentData';

export default function DashboardPage() {
  const router = useRouter();
  const { data: analytics, loading, error } = useDashboardAnalytics();
  const { data: recentUsers, loading: usersLoading, error: usersError } = useRecentUsers(5);
  const { data: recentActivity, loading: activityLoading, error: activityError } = useRecentActivity(4);

  // Action handlers
  const handleViewAllUsers = () => {
    router.push('/dashboard/users');
  };

  const handleViewAllActivity = () => {
    router.push('/dashboard/analytics');
  };

  const handleAddNewUser = () => {
    router.push('/dashboard/users');
  };

  const handleCreateSubscription = () => {
    router.push('/dashboard/subscriptions');
  };

  const handleExportData = () => {
    // Export all dashboard data as CSV
    const csvContent = [
      ['Metric', 'Value', 'Change'],
      ['Total Users', analytics?.totalUsers?.toString() || '0', '+12.5%'],
      ['Active Subscriptions', analytics?.activeSubscriptions?.toString() || '0', '+8.2%'],
      ['Total Revenue', `$${analytics?.totalRevenue?.toLocaleString() || '0'}`, '+23.1%'],
      ['User Growth', analytics?.userGrowth?.toString() || '0', '+15.3%'],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Generate stats from analytics data
  const stats = [
    {
      title: 'Total Users',
      value: analytics?.totalUsers?.toString() || '0',
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Subscriptions',
      value: analytics?.activeSubscriptions?.toString() || '0',
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: CreditCard,
      color: 'bg-green-500',
    },
    {
      title: 'Total Revenue',
      value: `$${analytics?.totalRevenue?.toLocaleString() || '0'}`,
      change: '+23.1%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      title: 'User Growth',
      value: analytics?.userGrowth?.toString() || '0',
      change: '+15.3%',
      changeType: 'positive' as const,
      icon: Activity,
      color: 'bg-orange-500',
    },
  ];

  const isLoading = loading || usersLoading || activityLoading;
  const hasError = error || usersError || activityError;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Heading level="h3">Dashboard</Heading>
          <p className="text-neutral-600 dark:text-neutral-200">
            Loading dashboard data...
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="space-y-6">
        <div>
          <Heading level="h3">Dashboard</Heading>
          <p className="text-red-600 dark:text-red-400">
            Error loading dashboard: {error || usersError || activityError}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <Heading level="h3">
          Dashboard
        </Heading>
        <p className="text-neutral-600 dark:text-neutral-200">
          Welcome back! Here&apos;s what&apos;s happening with your business today.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} changeType={stat.changeType} />
        ))}
      </div>

      {/* Charts and tables section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white">
              <span>Recent Users</span>
              <button 
                className="text-sm text-primary-600 hover:text-primary-500 font-medium"
                onClick={handleViewAllUsers}
              >
                View all
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.length > 0 ? recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.status === 'Active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {user.status}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(user.joined).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No recent users found
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white">
              <span>Recent Activity</span>
              <button 
                className="text-sm text-primary-600 hover:text-primary-500 font-medium"
                onClick={handleViewAllActivity}
              >
                View all
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === 'subscription' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' :
                      activity.type === 'user' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' :
                      activity.type === 'cancellation' ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400' :
                      'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400'
                    }`}>
                      {activity.type === 'subscription' && <CreditCard className="w-5 h-5" aria-hidden="true" />}
                      {activity.type === 'user' && <Users className="w-5 h-5" aria-hidden="true" />}
                      {activity.type === 'cancellation' && <Activity className="w-5 h-5" aria-hidden="true" />}
                      {activity.type === 'payment' && <TrendingUp className="w-5 h-5" aria-hidden="true" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {activity.action}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {activity.user}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(activity.time).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No recent activity found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid   md:grid-cols-3 gap-4">
            <button 
              className="flex items-center justify-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onClick={handleAddNewUser}
            >
              <Users className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" aria-hidden="true" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Add New User
              </span>
            </button>
            <button 
              className="flex items-center justify-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onClick={handleCreateSubscription}
            >
              <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" aria-hidden="true" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Create Subscription
              </span>
            </button>
            <button 
              className="flex items-center justify-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onClick={handleExportData}
            >
              <Download className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" aria-hidden="true" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Export Data
              </span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 