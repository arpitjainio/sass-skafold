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

// Mock analytics data
const metrics = [
  {
    title: 'Total Revenue',
    value: '$45,231',
    change: '+20.1%',
    changeType: 'positive',
    icon: DollarSign,
    color: 'bg-green-500',
  },
  {
    title: 'New Users',
    value: '2,350',
    change: '+180.1%',
    changeType: 'positive',
    icon: Users,
    color: 'bg-blue-500',
  },
  {
    title: 'Active Subscriptions',
    value: '1,234',
    change: '+19%',
    changeType: 'positive',
    icon: CreditCard,
    color: 'bg-purple-500',
  },
  {
    title: 'Churn Rate',
    value: '2.4%',
    change: '-0.8%',
    changeType: 'negative',
    icon: Activity,
    color: 'bg-orange-500',
  },
];

const chartData = [
  { month: 'Jan', revenue: 4000, users: 2400, subscriptions: 1800 },
  { month: 'Feb', revenue: 3000, users: 1398, subscriptions: 2210 },
  { month: 'Mar', revenue: 2000, users: 9800, subscriptions: 2290 },
  { month: 'Apr', revenue: 2780, users: 3908, subscriptions: 2000 },
  { month: 'May', revenue: 1890, users: 4800, subscriptions: 2181 },
  { month: 'Jun', revenue: 2390, users: 3800, subscriptions: 2500 },
  { month: 'Jul', revenue: 3490, users: 4300, subscriptions: 2100 },
];

export default function AnalyticsPage() {
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
              {chartData.map((data, index) => (
                <div key={data.month} className="flex flex-col items-center space-y-2">
                  <div 
                    className="w-8 bg-primary-600 rounded-t"
                    style={{ height: `${(data.revenue / 4000) * 200}px` }}
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {data.month}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Monthly revenue trend over the last 7 months
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
              {chartData.map((data, index) => (
                <div key={data.month} className="flex flex-col items-center space-y-2">
                  <div 
                    className="w-8 bg-blue-600 rounded-t"
                    style={{ height: `${(data.users / 9800) * 200}px` }}
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {data.month}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                New user registrations over the last 7 months
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
            {[
              { action: 'New subscription', user: 'John Doe', time: '2 hours ago', type: 'subscription' },
              { action: 'User registered', user: 'Jane Smith', time: '4 hours ago', type: 'user' },
              { action: 'Payment received', user: 'Bob Johnson', time: '6 hours ago', type: 'payment' },
              { action: 'Subscription cancelled', user: 'Alice Brown', time: '1 day ago', type: 'cancellation' },
              { action: 'New subscription', user: 'Charlie Wilson', time: '2 days ago', type: 'subscription' },
            ].map((activity, index) => (
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
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 