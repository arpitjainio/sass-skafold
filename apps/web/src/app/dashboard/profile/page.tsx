'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Calendar,
  Shield,
  Camera,
  Save,
  Edit,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Switch, Heading } from '@repo/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/lib/hooks/useUsers';
import { useNotifications } from '@/components/Notification';

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: userProfile, loading, error, updateProfile } = useUserProfile();
  const { addNotification } = useNotifications();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: false
  });

  // Update form data when user profile loads
  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        email: userProfile.email || '',
        phone: '', // Not available in current API
        location: '', // Not available in current API
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [userProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        name: formData.name,
        email: formData.email,
      });
      
      addNotification({
        type: 'success',
        title: 'Profile updated',
        message: 'Your profile has been updated successfully.',
      });
      
      setIsEditing(false);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Update failed',
        message: 'Failed to update profile. Please try again.',
      });
    }
  };

  const handleCancel = () => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        email: userProfile.email || '',
        phone: '',
        location: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
    setIsEditing(false);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Heading level="h3">Profile Settings</Heading>
          <p className="text-neutral-600 dark:text-neutral-200">
            Loading profile data...
          </p>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <Heading level="h3">Profile Settings</Heading>
          <p className="text-red-600 dark:text-red-400">
            Error loading profile: {error}
          </p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="space-y-6">
        <div>
          <Heading level="h3">Profile Settings</Heading>
          <p className="text-neutral-600 dark:text-neutral-200">
            No profile data available.
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
            Profile Settings
          </Heading>
          <p className="text-neutral-600 dark:text-neutral-200">
            Manage your account settings and preferences.
          </p>
        </div>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex items-center space-x-2">
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="flex items-center space-x-2">
              <Edit className="w-4 h-4" />
              <span>Edit Profile</span>
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Profile Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto">
                    <User className="w-12 h-12 text-gray-600 dark:text-gray-400" aria-hidden="true" />
                  </div>
                  <button className="absolute bottom-0 right-0 p-1 bg-primary-600 text-white rounded-full hover:bg-primary-700">
                    <Camera className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                  {userProfile.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {userProfile.roles.join(', ') || 'User'}
                </p>
              </div>

              {/* Account Info */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-400" aria-hidden="true" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {userProfile.email}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-gray-400" aria-hidden="true" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Joined {new Date(userProfile.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="w-4 h-4 text-gray-400" aria-hidden="true" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Last updated: {new Date(userProfile.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  <Input
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <Input
                      name="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <Input
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <Input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      Email Notifications
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={() => handleNotificationChange('email')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      Push Notifications
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Receive push notifications in browser
                    </p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={() => handleNotificationChange('push')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      SMS Notifications
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Receive notifications via SMS
                    </p>
                  </div>
                  <Switch
                    checked={notifications.sms}
                    onCheckedChange={() => handleNotificationChange('sms')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      Marketing Emails
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Receive marketing and promotional emails
                    </p>
                  </div>
                  <Switch
                    checked={notifications.marketing}
                    onCheckedChange={() => handleNotificationChange('marketing')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 