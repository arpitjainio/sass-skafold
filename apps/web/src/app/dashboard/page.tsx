'use client';

import React from 'react';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  Activity,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Heading, StatsCard } from '@repo/ui';
import { useDashboardAnalytics } from '@/lib/hooks/useAnalytics';

const recentUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active', joined: '2 hours ago' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Active', joined: '4 hours ago' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Inactive', joined: '1 day ago' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', status: 'Active', joined: '2 days ago' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', status: 'Active', joined: '3 days ago' },
];

const recentTransactions = [
  { id: 1, user: 'John Doe', amount: '$99.99', status: 'Completed', date: '2 hours ago' },
  { id: 2, user: 'Jane Smith', amount: '$149.99', status: 'Pending', date: '4 hours ago' },
  { id: 3, user: 'Bob Johnson', amount: '$79.99', status: 'Failed', date: '1 day ago' },
  { id: 4, user: 'Alice Brown', amount: '$199.99', status: 'Completed', date: '2 days ago' },
];

export default function DashboardPage() {
  const { data: analytics, loading, error } = useDashboardAnalytics();

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

  if (loading) {
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <Heading level="h3">Dashboard</Heading>
          <p className="text-red-600 dark:text-red-400">
            Error loading dashboard: {error}
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
              <button className="text-sm text-primary-600 hover:text-primary-500 font-medium">
                View all
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user) => (
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
                      {user.joined}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white">
              <span>Recent Transactions</span>
              <button className="text-sm text-primary-600 hover:text-primary-500 font-medium">
                View all
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {transaction.user}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {transaction.amount}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.status === 'Completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : transaction.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {transaction.status}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {transaction.date}
                    </p>
                  </div>
                </div>
              ))}
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
            <button className="flex items-center justify-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Users className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" aria-hidden="true" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Add New User
              </span>
            </button>
            <button className="flex items-center justify-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" aria-hidden="true" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Create Subscription
              </span>
            </button>
            <button className="flex items-center justify-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
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