import React from "react";
import { Button } from "@repo/ui";
import Link from "next/link";

interface StatusMessageProps {
  type: "success" | "error";
  title: string;
  message: string;
  icon?: React.ReactNode;
  actions?: {
    label: string;
    href?: string;
    onClick?: () => void;
    variant?: "default" | "outline" | "link";
  }[];
  className?: string;
}

export function StatusMessage({
  type,
  title,
  message,
  icon,
  actions = [],
  className = "",
}: StatusMessageProps) {
  const bgColor = type === "success" ? "bg-green-100" : "bg-red-100";

  const defaultIcon =
    type === "success" ? (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    ) : (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    );

  return (
    <div className={`text-center space-y-6 ${className}`}>
      {/* Icon */}
      <div
        className={`mx-auto w-16 h-16 ${bgColor} rounded-full flex items-center justify-center`}
      >
        {icon || defaultIcon}
      </div>

      {/* Message */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
      </div>

      {/* Actions */}
      {actions.length > 0 && (
        <div className="space-y-3">
          {actions.map((action, index) => (
            <div key={index}>
              {action.href ? (
                <Link href={action.href}>
                  <Button
                    size="lg"
                    variant={action.variant || "default"}
                    className="w-full"
                  >
                    {action.label}
                  </Button>
                </Link>
              ) : (
                <Button
                  size="lg"
                  variant={action.variant || "default"}
                  className="w-full"
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
