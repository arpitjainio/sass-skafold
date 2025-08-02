'use client';

import React from 'react';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';

// Mock data for demonstration
const stats = [
  {
    title: 'Total Users',
    value: '2,847',
    change: '+12.5%',
    changeType: 'positive',
    icon: Users,
    color: 'bg-blue-500',
  },
  {
    title: 'Active Subscriptions',
    value: '1,234',
    change: '+8.2%',
    changeType: 'positive',
    icon: CreditCard,
    color: 'bg-green-500',
  },
  {
    title: 'Monthly Revenue',
    value: '$45,231',
    change: '+23.1%',
    changeType: 'positive',
    icon: TrendingUp,
    color: 'bg-purple-500',
  },
  {
    title: 'Active Sessions',
    value: '892',
    change: '-2.4%',
    changeType: 'negative',
    icon: Activity,
    color: 'bg-orange-500',
  },
];

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
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back! Here's what's happening with your business today.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                {stat.changeType === 'positive' ? (
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                )}
                <span className={`ml-1 text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  from last month
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and tables section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Users
              <button className="text-sm text-primary-600 hover:text-primary-500 font-medium">
                View all
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-gray-600" />
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
            <CardTitle className="flex items-center justify-between">
              Recent Transactions
              <button className="text-sm text-primary-600 hover:text-primary-500 font-medium">
                View all
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-gray-600" />
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
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <Users className="w-5 h-5 text-gray-600 mr-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Add New User
              </span>
            </button>
            <button className="flex items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <CreditCard className="w-5 h-5 text-gray-600 mr-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Create Subscription
              </span>
            </button>
            <button className="flex items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <Download className="w-5 h-5 text-gray-600 mr-2" />
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