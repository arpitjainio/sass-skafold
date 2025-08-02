'use client';

import React, { useState } from 'react';
import { 
  CreditCard, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Plus,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@repo/ui';

// Mock subscription data
const subscriptions = [
  { 
    id: 1, 
    user: 'John Doe', 
    email: 'john@example.com',
    plan: 'Pro', 
    status: 'Active', 
    amount: '$99.99', 
    nextBilling: '2024-02-15',
    startDate: '2024-01-15',
    paymentMethod: 'Visa ****1234'
  },
  { 
    id: 2, 
    user: 'Jane Smith', 
    email: 'jane@example.com',
    plan: 'Basic', 
    status: 'Active', 
    amount: '$29.99', 
    nextBilling: '2024-02-10',
    startDate: '2024-01-10',
    paymentMethod: 'Mastercard ****5678'
  },
  { 
    id: 3, 
    user: 'Bob Johnson', 
    email: 'bob@example.com',
    plan: 'Enterprise', 
    status: 'Cancelled', 
    amount: '$299.99', 
    nextBilling: '2024-02-05',
    startDate: '2024-01-05',
    paymentMethod: 'PayPal'
  },
  { 
    id: 4, 
    user: 'Alice Brown', 
    email: 'alice@example.com',
    plan: 'Pro', 
    status: 'Past Due', 
    amount: '$99.99', 
    nextBilling: '2024-02-12',
    startDate: '2024-01-12',
    paymentMethod: 'Visa ****9012'
  },
  { 
    id: 5, 
    user: 'Charlie Wilson', 
    email: 'charlie@example.com',
    plan: 'Basic', 
    status: 'Active', 
    amount: '$29.99', 
    nextBilling: '2024-02-08',
    startDate: '2024-01-08',
    paymentMethod: 'Mastercard ****3456'
  },
  { 
    id: 6, 
    user: 'Diana Prince', 
    email: 'diana@example.com',
    plan: 'Pro', 
    status: 'Suspended', 
    amount: '$99.99', 
    nextBilling: '2024-02-03',
    startDate: '2024-01-03',
    paymentMethod: 'Visa ****7890'
  },
];

const plans = ['All', 'Basic', 'Pro', 'Enterprise'];
const statuses = ['All', 'Active', 'Cancelled', 'Past Due', 'Suspended'];

export default function SubscriptionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<number[]>([]);

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = subscription.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = selectedPlan === 'All' || subscription.plan === selectedPlan;
    const matchesStatus = selectedStatus === 'All' || subscription.status === selectedStatus;
    
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const handleSelectAll = () => {
    if (selectedSubscriptions.length === filteredSubscriptions.length) {
      setSelectedSubscriptions([]);
    } else {
      setSelectedSubscriptions(filteredSubscriptions.map(sub => sub.id));
    }
  };

  const handleSelectSubscription = (subscriptionId: number) => {
    setSelectedSubscriptions(prev => 
      prev.includes(subscriptionId) 
        ? prev.filter(id => id !== subscriptionId)
        : [...prev, subscriptionId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'Past Due':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Suspended':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Enterprise':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Pro':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Basic':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className="w-4 h-4 text-green-500" aria-hidden="true" />;
      case 'Cancelled':
        return <XCircle className="w-4 h-4 text-gray-500" aria-hidden="true" />;
      case 'Past Due':
        return <Clock className="w-4 h-4 text-red-500" aria-hidden="true" />;
      case 'Suspended':
        return <Clock className="w-4 h-4 text-yellow-500" aria-hidden="true" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" aria-hidden="true" />;
    }
  };

  // Calculate summary stats
  const totalRevenue = subscriptions
    .filter(sub => sub.status === 'Active')
    .reduce((sum, sub) => sum + parseFloat(sub.amount.replace('$', '')), 0);

  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'Active').length;
  const cancelledSubscriptions = subscriptions.filter(sub => sub.status === 'Cancelled').length;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Subscriptions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your subscription plans and billing.
          </p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Create Subscription</span>
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Monthly Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${totalRevenue.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" aria-hidden="true" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Subscriptions
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activeSubscriptions}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Cancelled This Month
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {cancelledSubscriptions}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" aria-hidden="true" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and search */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
              <Input
                placeholder="Search subscriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Plan filter */}
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {plans.map(plan => (
                <option key={plan} value={plan}>
                  {plan === 'All' ? 'All Plans' : plan}
                </option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'All' ? 'All Statuses' : status}
                </option>
              ))}
            </select>

            {/* Export button */}
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions table */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white">
            <span>Subscriptions ({filteredSubscriptions.length})</span>
            {selectedSubscriptions.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedSubscriptions.length} selected
                </span>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedSubscriptions.length === filteredSubscriptions.length && filteredSubscriptions.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Plan</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Next Billing</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Payment Method</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscriptions.map((subscription) => (
                  <tr key={subscription.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedSubscriptions.includes(subscription.id)}
                        onChange={() => handleSelectSubscription(subscription.id)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {subscription.user}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {subscription.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlanColor(subscription.plan)}`}>
                        {subscription.plan}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(subscription.status)}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                          {subscription.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {subscription.amount}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                      {subscription.nextBilling}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                      {subscription.paymentMethod}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="View subscription">
                          <Eye className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Edit subscription">
                          <Edit className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600" aria-label="More options">
                          <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 