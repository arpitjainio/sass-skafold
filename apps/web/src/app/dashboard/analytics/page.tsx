'use client';

import React from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  Users,
  CreditCard,
  Activity,
  DollarSign,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Heading } from '@repo/ui';
import { useDashboardAnalytics, useRevenueAnalytics, useUserGrowthAnalytics } from '@/lib/hooks/useAnalytics';
import { useRecentActivity } from '@/lib/hooks/useRecentData';

export default function AnalyticsPage() {
  const { data: analytics, loading, error } = useDashboardAnalytics();
  const { data: revenueData, loading: revenueLoading } = useRevenueAnalytics();
  const { data: userGrowthData, loading: userGrowthLoading } = useUserGrowthAnalytics();
  const { data: recentActivity, loading: activityLoading } = useRecentActivity(5);

  // Generate metrics from analytics data
  const metrics = [
    {
      title: 'Total Revenue',
      value: `$${analytics?.totalRevenue?.toLocaleString() || '0'}`,
      change: '+20.1%', // This would need to be calculated from historical data
      changeType: 'positive' as const,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Total Users',
      value: analytics?.totalUsers?.toString() || '0',
      change: '+15.3%', // This would need to be calculated from historical data
      changeType: 'positive' as const,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Subscriptions',
      value: analytics?.activeSubscriptions?.toString() || '0',
      change: '+8.2%', // This would need to be calculated from historical data
      changeType: 'positive' as const,
      icon: CreditCard,
      color: 'bg-purple-500',
    },
    {
      title: 'User Growth',
      value: analytics?.userGrowth?.toString() || '0',
      change: '+12.5%', // This would need to be calculated from historical data
      changeType: 'positive' as const,
      icon: Activity,
      color: 'bg-orange-500',
    },
  ];

  const isLoading = loading || revenueLoading || userGrowthLoading || activityLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Heading level="h3">Analytics</Heading>
          <p className="text-neutral-600 dark:text-neutral-200">
            Loading analytics data...
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

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <Heading level="h3">Analytics</Heading>
          <p className="text-red-600 dark:text-red-400">
            Error loading analytics: {error}
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
          Analytics
        </Heading>
        <p className="text-neutral-600 dark:text-neutral-200">
          Track your business performance and growth metrics.
        </p>
      </div>

      {/* Metrics cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metric.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${metric.color}`}>
                  <metric.icon className="w-6 h-6 text-white" aria-hidden="true" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                {metric.changeType === 'positive' ? (
                  <TrendingUp className="w-4 h-4 text-green-500" aria-hidden="true" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" aria-hidden="true" />
                )}
                <span className={`ml-1 text-sm font-medium ${
                  metric.changeType === 'positive' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {metric.change}
                </span>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  from last month
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between space-x-2">
              {revenueData && revenueData.length > 0 ? revenueData.map((data, index) => {
                const maxCount = Math.max(...revenueData.map(d => d.count));
                return (
                  <div key={index} className="flex flex-col items-center space-y-2">
                    <div 
                      className="w-8 bg-primary-600 rounded-t"
                      style={{ height: `${(data.count / maxCount) * 200}px` }}
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {data.month}
                    </span>
                  </div>
                );
              }) : (
                <div className="flex items-center justify-center h-full w-full text-gray-500 dark:text-gray-400">
                  No revenue data available
                </div>
              )}
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Monthly revenue trend over the last 12 months
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Users Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between space-x-2">
              {userGrowthData && userGrowthData.length > 0 ? userGrowthData.map((data, index) => {
                const maxCount = Math.max(...userGrowthData.map(d => d.count));
                return (
                  <div key={index} className="flex flex-col items-center space-y-2">
                    <div 
                      className="w-8 bg-blue-600 rounded-t"
                      style={{ height: `${(data.count / maxCount) * 200}px` }}
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {data.month}
                    </span>
                  </div>
                );
              }) : (
                <div className="flex items-center justify-center h-full w-full text-gray-500 dark:text-gray-400">
                  No user growth data available
                </div>
              )}
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                New user registrations over the last 12 months
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity && recentActivity.length > 0 ? recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.type === 'subscription' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' :
                  activity.type === 'user' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' :
                  activity.type === 'payment' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400' :
                  'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                }`}>
                  {activity.type === 'subscription' && <CreditCard className="w-4 h-4" aria-hidden="true" />}
                  {activity.type === 'user' && <Users className="w-4 h-4" aria-hidden="true" />}
                  {activity.type === 'payment' && <DollarSign className="w-4 h-4" aria-hidden="true" />}
                  {activity.type === 'cancellation' && <Activity className="w-4 h-4" aria-hidden="true" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.action}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {activity.user}
                  </p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(activity.time).toLocaleDateString()}
                </span>
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
  );
} 