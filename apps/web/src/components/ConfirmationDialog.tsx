"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@repo/ui";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: "text-red-600 dark:text-red-400",
          iconBg: "bg-red-100 dark:bg-red-900",
          confirmButton: "bg-red-600 hover:bg-red-700 text-white",
        };
      case "warning":
        return {
          icon: "text-yellow-600 dark:text-yellow-400",
          iconBg: "bg-yellow-100 dark:bg-yellow-900",
          confirmButton: "bg-yellow-600 hover:bg-yellow-700 text-white",
        };
      case "info":
        return {
          icon: "text-blue-600 dark:text-blue-400",
          iconBg: "bg-blue-100 dark:bg-blue-900",
          confirmButton: "bg-blue-600 hover:bg-blue-700 text-white",
        };
      default:
        return {
          icon: "text-red-600 dark:text-red-400",
          iconBg: "bg-red-100 dark:bg-red-900",
          confirmButton: "bg-red-600 hover:bg-red-700 text-white",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${styles.iconBg}`}
              >
                <AlertTriangle className={`w-5 h-5 ${styles.icon}`} />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  {title}
                </CardTitle>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="p-2"
              disabled={isLoading}
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">{message}</p>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                {cancelText}
              </Button>
              <Button
                onClick={onConfirm}
                disabled={isLoading}
                className={styles.confirmButton}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  confirmText
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
