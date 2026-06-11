"use client";

import React, { useState, useEffect } from "react";
import { X, Save, User, Shield, Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Select,
} from "@repo/ui";
import { User as UserType } from "@/lib/user";
import { useNotifications } from "./Notification";

interface UserModalProps {
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: Partial<UserType>) => Promise<void>;
  mode: "view" | "edit";
}

const roles = ["admin", "user", "premium"];

export default function UserModal({
  user,
  isOpen,
  onClose,
  onSave,
  mode,
}: UserModalProps) {
  const [formData, setFormData] = useState<Partial<UserType>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        subscriptionCount: user.subscriptionCount,
        hasActiveSubscription: user.hasActiveSubscription,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      await onSave(formData);
      addNotification({
        title: "User updated successfully",
        type: "success",
        message: "User updated successfully",
      });
      onClose();
    } catch (error) {
      addNotification({
        title: "Error",
        type: "error",
        message: `Failed to update user. Due to: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserType, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value as UserType[keyof UserType],
    }));
  };

  const handleRoleChange = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      roles: [role],
    }));
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>{mode === "view" ? "View User" : "Edit User"}</span>
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
            {/* User Avatar */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formData.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formData.email}
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name
                </label>
                <Input
                  value={formData.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  disabled={mode === "view"}
                  placeholder="Enter name"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={mode === "view"}
                  placeholder="Enter email"
                />
              </div>

              {/* Role */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Role
                </label>
                <Select
                  value={formData.roles?.[0] || ""}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  disabled={mode === "view"}
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Subscription Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Subscription Status
                </label>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      formData.hasActiveSubscription
                        ? "bg-green-500"
                        : "bg-gray-400"
                    }`}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formData.hasActiveSubscription ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>
                  Created:{" "}
                  {new Date(formData.createdAt || "").toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Shield className="w-4 h-4" />
                <span>Subscriptions: {formData.subscriptionCount || 0}</span>
              </div>
            </div>

            {/* Action Buttons */}
            {mode === "edit" && (
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
                  <span>{isLoading ? "Saving..." : "Save Changes"}</span>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
