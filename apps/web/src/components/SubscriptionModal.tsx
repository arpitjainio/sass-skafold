'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, CreditCard, User, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select } from '@repo/ui';
import { Subscription } from '@/lib/subscription';
import { useNotifications } from './Notification';

interface SubscriptionModalProps {
  subscription: Subscription | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (subscriptionData: Partial<Subscription>) => Promise<void>;
  mode: 'view' | 'edit';
}

const statuses = ['ACTIVE', 'CANCELLED', 'PAST_DUE', 'TRIALING'];

export default function SubscriptionModal({ subscription, isOpen, onClose, onSave, mode }: SubscriptionModalProps) {
  const [formData, setFormData] = useState<Partial<Subscription>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (subscription) {
      setFormData({
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        canceledAt: subscription.canceledAt || '',
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt,
        user: subscription.user,
      });
    }
  }, [subscription]);

  const handleSave = async () => {
    if (!subscription) return;
    
    try {
      setIsLoading(true);
      await onSave(formData);
      addNotification({ 
        type: 'success',
        message: 'Subscription updated successfully',
        title: 'Subscription updated',
      });
      onClose();
    } catch (error) {
      addNotification({
        type: 'error',
        message: `Failed to update subscription. Due to: ${error instanceof Error ? error.message : 'Unknown error'}`,
        title: 'Error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof Subscription, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value as Subscription[keyof Subscription],
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'PAST_DUE':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'TRIALING':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (!isOpen || !subscription) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>{mode === 'view' ? 'View Subscription' : 'Edit Subscription'}</span>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Subscription Info */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <CreditCard className="w-8 h-8 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Subscription #{formData.id?.slice(-8)}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formData.user?.name} ({formData.user?.email})
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <Select
                  value={formData.status || ''}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  disabled={mode === 'view'}
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ')}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Current Period End */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Current Period End
                </label>
                <Input
                  type="datetime-local"
                  value={formData.currentPeriodEnd ? new Date(formData.currentPeriodEnd).toISOString().slice(0, 16) : ''}
                  onChange={(e) => handleInputChange('currentPeriodEnd', e.target.value ? new Date(e.target.value).toISOString() : null)}
                  disabled={mode === 'view'}
                />
              </div>

              {/* Canceled At */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Canceled At
                </label>
                <Input
                  type="datetime-local"
                  value={formData.canceledAt ? new Date(formData.canceledAt).toISOString().slice(0, 16) : ''}
                  onChange={(e) => handleInputChange('canceledAt', e.target.value ? new Date(e.target.value).toISOString() : null)}
                  disabled={mode === 'view'}
                />
              </div>

              {/* Stripe Subscription ID */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Stripe Subscription ID
                </label>
                <Input
                  value={formData.stripeSubId || ''}
                  disabled={true}
                  placeholder="Not available"
                />
              </div>
            </div>

            {/* Current Status Display */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Status:</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(formData.status || '')}`}>
                {formData.status?.charAt(0) + (formData.status?.slice(1).toLowerCase().replace('_', ' ') || 'Unknown')}
              </span>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Created: {new Date(formData.createdAt || '').toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <User className="w-4 h-4" />
                <span>User: {formData.user?.name}</span>
              </div>
            </div>

            {/* Action Buttons */}
            {mode === 'edit' && (
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
