"use client";

import React, { useEffect, useState } from "react";
import { Bell, Calendar, Mail, MapPin, Save, Shield, User } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Heading,
  Input,
  Switch,
} from "@repo/ui";
import { useUserProfile } from "@/lib/hooks/useUsers";
import { useNotifications } from "@/components/Notification";
import { getPrimaryRoleLabel, validatePassword } from "@/lib/password";

type ProfileTab = "profile" | "security" | "notifications";

const tabs: Array<{ id: ProfileTab; label: string }> = [
  { id: "profile", label: "Profile" },
  { id: "security", label: "Password & Security" },
  { id: "notifications", label: "Notifications" },
];

export default function ProfilePage() {
  const {
    data: userProfile,
    loading,
    error,
    updateProfile,
    changePassword,
    updateNotificationPreferences,
  } = useUserProfile();
  const { addNotification } = useNotifications();

  const [activeTab, setActiveTab] = useState<ProfileTab>("profile");
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [notificationForm, setNotificationForm] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: false,
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);

  useEffect(() => {
    if (!userProfile) {
      return;
    }

    setProfileForm({
      name: userProfile.name || "",
      email: userProfile.email || "",
      phone: userProfile.phone || "",
      location: userProfile.location || "",
    });
    setNotificationForm({
      email: userProfile.notificationPreferences?.email ?? true,
      push: userProfile.notificationPreferences?.push ?? true,
      sms: userProfile.notificationPreferences?.sms ?? false,
      marketing: userProfile.notificationPreferences?.marketing ?? false,
    });
  }, [userProfile]);

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotificationToggle = (key: keyof typeof notificationForm) => {
    setNotificationForm((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleProfileSave = async () => {
    try {
      setIsSavingProfile(true);
      await updateProfile({
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim(),
        location: profileForm.location.trim(),
      });
      addNotification({
        type: "success",
        title: "Profile updated",
        message: "Your profile details were saved successfully.",
      });
    } catch (saveError: unknown) {
      addNotification({
        type: "error",
        title: "Profile update failed",
        message:
          saveError instanceof Error
            ? saveError.message
            : "Unable to update your profile right now.",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSave = async () => {
    if (!passwordForm.currentPassword) {
      addNotification({
        type: "error",
        title: "Current password required",
        message: "Enter your current password before saving a new one.",
      });
      return;
    }

    const passwordValidation = validatePassword(passwordForm.newPassword);
    if (!passwordValidation.isValid) {
      addNotification({
        type: "error",
        title: "Password requirements not met",
        message:
          passwordValidation.errors[0] || "Password requirements not met.",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addNotification({
        type: "error",
        title: "Passwords do not match",
        message: "Make sure the confirmation matches the new password.",
      });
      return;
    }

    try {
      setIsSavingPassword(true);
      await changePassword(passwordForm);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      addNotification({
        type: "success",
        title: "Password updated",
        message: "Your password has been changed successfully.",
      });
    } catch (saveError: unknown) {
      addNotification({
        type: "error",
        title: "Password update failed",
        message:
          saveError instanceof Error
            ? saveError.message
            : "Unable to change your password right now.",
      });
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleNotificationSave = async () => {
    try {
      setIsSavingNotifications(true);
      await updateNotificationPreferences(notificationForm);
      addNotification({
        type: "success",
        title: "Notification preferences updated",
        message: "Your notification settings were saved successfully.",
      });
    } catch (saveError: unknown) {
      addNotification({
        type: "error",
        title: "Notification update failed",
        message:
          saveError instanceof Error
            ? saveError.message
            : "Unable to save notification preferences right now.",
      });
    } finally {
      setIsSavingNotifications(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Heading level="h3">Profile Settings</Heading>
          <p className="text-neutral-600 dark:text-neutral-200">
            Loading profile data...
          </p>
        </div>
      </div>
    );
  }

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
      <div>
        <Heading level="h3">Profile Settings</Heading>
        <p className="text-neutral-600 dark:text-neutral-200">
          Manage your personal details, account security, and notification
          preferences.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Account Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-900">
                <User className="h-8 w-8" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {userProfile.name || "User"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {getPrimaryRoleLabel(userProfile.roles)}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4" aria-hidden="true" />
                <span>{userProfile.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                <span>{userProfile.location || "Location not set"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                <span>
                  Joined {new Date(userProfile.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4" aria-hidden="true" />
                <span>
                  Updated {new Date(userProfile.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary-700 text-white"
                    : "bg-white text-gray-700 shadow-sm hover:bg-primary-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Full Name
                    </label>
                    <Input
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileInputChange}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email Address
                    </label>
                    <Input
                      name="email"
                      value={profileForm.email}
                      disabled
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone Number
                    </label>
                    <Input
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleProfileInputChange}
                      placeholder="Add a phone number"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Location
                    </label>
                    <Input
                      name="location"
                      value={profileForm.location}
                      onChange={handleProfileInputChange}
                      placeholder="Add your location"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleProfileSave}
                    disabled={isSavingProfile}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>
                      {isSavingProfile ? "Saving profile..." : "Save profile"}
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "security" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  Password & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Current Password
                    </label>
                    <Input
                      name="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordInputChange}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      New Password
                    </label>
                    <Input
                      name="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordInputChange}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Confirm New Password
                    </label>
                    <Input
                      name="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordInputChange}
                    />
                  </div>
                </div>

                <p className="rounded-lg bg-primary-50 px-4 py-3 text-sm text-primary-900 dark:bg-primary-950 dark:text-primary-100">
                  Password changes are validated in the browser first and then
                  verified again by the API.
                </p>

                <div className="flex justify-end">
                  <Button
                    onClick={handlePasswordSave}
                    disabled={isSavingPassword}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>
                      {isSavingPassword
                        ? "Updating password..."
                        : "Update password"}
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Bell className="h-5 w-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    key: "email" as const,
                    title: "Email notifications",
                    description: "Receive important account updates by email.",
                  },
                  {
                    key: "push" as const,
                    title: "Push notifications",
                    description:
                      "Receive in-browser notifications while signed in.",
                  },
                  {
                    key: "sms" as const,
                    title: "SMS notifications",
                    description: "Receive urgent alerts by text message.",
                  },
                  {
                    key: "marketing" as const,
                    title: "Marketing emails",
                    description:
                      "Receive product updates and promotional messages.",
                  },
                ].map((preference) => (
                  <div
                    key={preference.key}
                    className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700"
                  >
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {preference.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {preference.description}
                      </p>
                    </div>
                    <Switch
                      checked={notificationForm[preference.key]}
                      onCheckedChange={() =>
                        handleNotificationToggle(preference.key)
                      }
                    />
                  </div>
                ))}

                <div className="flex justify-end">
                  <Button
                    onClick={handleNotificationSave}
                    disabled={isSavingNotifications}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>
                      {isSavingNotifications
                        ? "Saving preferences..."
                        : "Save preferences"}
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
