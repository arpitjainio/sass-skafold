'use client';

import React, { useState } from 'react';
import { 
  CreditCard, 
  Search, 
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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select, Checkbox, Heading } from '@repo/ui';
import { useAdminSubscriptions } from '@/lib/hooks/useSubscriptions';

const plans = ['All', 'Basic', 'Pro', 'Enterprise'];
const statuses = ['All', 'ACTIVE', 'CANCELED', 'PAST_DUE', 'INCOMPLETE'];

export default function SubscriptionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  const params = {
    page: currentPage,
    limit,
    ...(selectedStatus !== 'All' && { status: selectedStatus }),
    ...(selectedPlan !== 'All' && { plan: selectedPlan }),
  };

  const { data: subscriptionsData, loading, error } = useAdminSubscriptions(params);

  const subscriptions = subscriptionsData?.data || [];

  // Client-side filtering for search (since backend doesn't support search yet)
  const filteredSubscriptions = subscriptions.filter(subscription => {
    if (!searchTerm) return true;
    const matchesSearch = subscription.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleSelectAll = () => {
    if (selectedSubscriptions.length === filteredSubscriptions.length) {
      setSelectedSubscriptions([]);
    } else {
      setSelectedSubscriptions(filteredSubscriptions.map(sub => sub.id));
    }
  };

  const handleSelectSubscription = (subscriptionId: string) => {
    setSelectedSubscriptions(prev => 
      prev.includes(subscriptionId) 
        ? prev.filter(id => id !== subscriptionId)
        : [...prev, subscriptionId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'CANCELED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'PAST_DUE':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'INCOMPLETE':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'TRIALING':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-4 h-4 text-green-500" aria-hidden="true" />;
      case 'CANCELED':
        return <XCircle className="w-4 h-4 text-gray-500" aria-hidden="true" />;
      case 'PAST_DUE':
        return <Clock className="w-4 h-4 text-red-500" aria-hidden="true" />;
      case 'INCOMPLETE':
        return <Clock className="w-4 h-4 text-yellow-500" aria-hidden="true" />;
      case 'TRIALING':
        return <CheckCircle className="w-4 h-4 text-blue-500" aria-hidden="true" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" aria-hidden="true" />;
    }
  };

  // Calculate summary stats (for now, without real pricing data)
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'ACTIVE').length;
  const cancelledSubscriptions = subscriptions.filter(sub => sub.status === 'CANCELED').length;
  const totalRevenue = 0; // Would need pricing data to calculate this

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Heading level="h3">Subscriptions</Heading>
          <p className="text-neutral-600 dark:text-neutral-200">
            Loading subscriptions data...
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <Heading level="h3">Subscriptions</Heading>
          <p className="text-red-600 dark:text-red-400">
            Error loading subscriptions; due to: {error? error : 'Unknown error'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h3">
            Subscriptions
          </Heading>
          <p className="text-neutral-600 dark:text-neutral-200">
            Manage your subscription plans and billing.
          </p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Create Subscription</span>
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
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

        <Card>
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

        <Card>
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
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" aria-hidden="true" />
              <Input
                placeholder="Search subscriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Plan filter */}
            <Select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
            >
              {plans.map(plan => (
                <option key={plan} value={plan}>
                  {plan === 'All' ? 'All Plans' : plan}
                </option>
              ))}
            </Select>

            {/* Status filter */}
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'All' ? 'All Statuses' : status}
                </option>
              ))}
            </Select>

            {/* Export button */}
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions table */}
        <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white leading-[32px]">
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
                    <Checkbox
                      checked={selectedSubscriptions.length === filteredSubscriptions.length && filteredSubscriptions.length > 0}
                      onCheckedChange={handleSelectAll}
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
                      <Checkbox
                        checked={selectedSubscriptions.includes(subscription.id)}
                        onCheckedChange={() => handleSelectSubscription(subscription.id)}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {subscription.user.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {subscription.user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                        Standard
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
                        -
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                      {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                      -
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