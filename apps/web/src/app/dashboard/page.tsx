"use client";

import React from "react";
import { Activity, CreditCard, Mail, Shield, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Heading,
  StatsCard,
} from "@repo/ui";
import { useDashboardAnalytics } from "@/lib/hooks/useAnalytics";
import { useRecentActivity, useRecentUsers } from "@/lib/hooks/useRecentData";
import { useAuth } from "@/contexts/AuthContext";
import { getPrimaryRoleLabel } from "@/lib/password";

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes("admin") ?? false;
  const { data: analytics, loading, error } = useDashboardAnalytics();
  const {
    data: recentUsers,
    loading: recentUsersLoading,
    error: recentUsersError,
  } = useRecentUsers(5, isAdmin);
  const {
    data: recentActivity,
    loading: recentActivityLoading,
    error: recentActivityError,
  } = useRecentActivity(5, isAdmin);

  const totalSubscriptions = Object.values(
    analytics?.subscriptionStats ?? {}
  ).reduce((sum, value) => sum + value, 0);

  const stats = isAdmin
    ? [
        {
          title: "Total Users",
          value: analytics?.totalUsers?.toString() || "0",
          icon: Users,
          iconColor: "bg-blue-500",
          description: "Users in your workspace",
        },
        {
          title: "Active Subscriptions",
          value: analytics?.activeSubscriptions?.toString() || "0",
          icon: CreditCard,
          iconColor: "bg-green-500",
          description: "Currently active plans",
        },
        {
          title: "Total Revenue",
          value: `$${analytics?.totalRevenue?.toLocaleString() || "0"}`,
          icon: Activity,
          iconColor: "bg-purple-500",
          description: "Revenue visible to admins only",
        },
        {
          title: "User Growth",
          value: analytics?.userGrowth?.toString() || "0",
          icon: Shield,
          iconColor: "bg-orange-500",
          description: "Growth trend",
        },
      ]
    : [
        {
          title: "Your Role",
          value: getPrimaryRoleLabel(user?.roles),
          icon: Shield,
          iconColor: "bg-blue-500",
          description: "Access based on your assigned role",
        },
        {
          title: "Active Subscriptions",
          value: analytics?.activeSubscriptions?.toString() || "0",
          icon: CreditCard,
          iconColor: "bg-green-500",
          description: "Subscriptions attached to your account",
        },
        {
          title: "Total Subscriptions",
          value: totalSubscriptions.toString(),
          icon: Activity,
          iconColor: "bg-purple-500",
          description: "All of your subscription records",
        },
        {
          title: "Account Email",
          value: user?.email || "Unavailable",
          icon: Mail,
          iconColor: "bg-orange-500",
          description: "Primary sign-in email",
        },
      ];

  const isLoading =
    loading || (isAdmin && (recentUsersLoading || recentActivityLoading));
  const hasError =
    error || (isAdmin && (recentUsersError || recentActivityError));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Heading level="h3">Dashboard</Heading>
          <p className="text-neutral-600 dark:text-neutral-200">
            Loading dashboard data...
          </p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="space-y-6">
        <div>
          <Heading level="h3">Dashboard</Heading>
          <p className="text-red-600 dark:text-red-400">
            Error loading dashboard: {hasError}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Heading level="h3">Dashboard</Heading>
        <p className="text-neutral-600 dark:text-neutral-200">
          {isAdmin
            ? "Monitor users, subscriptions, and platform activity."
            : "Review your account, subscriptions, and access details."}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      {isAdmin ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                Recent Users
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentUsers.length > 0 ? (
                recentUsers.map((recentUser) => (
                  <div
                    key={recentUser.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {recentUser.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {recentUser.email}
                      </p>
                    </div>
                    <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                      <p>{getPrimaryRoleLabel(recentUser.roles)}</p>
                      <p>{recentUser.status}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No recent users yet.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div
                    key={`${activity.user}-${activity.time}-${index}`}
                    className="rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700"
                  >
                    <p className="font-medium text-gray-900 dark:text-white">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {activity.user}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {activity.time}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No recent activity yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                Subscription Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(analytics?.subscriptionStats ?? {}).length > 0 ? (
                Object.entries(analytics?.subscriptionStats ?? {}).map(
                  ([status, count]) => (
                    <div
                      key={status}
                      className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700"
                    >
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {status}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {count}
                      </span>
                    </div>
                  )
                )
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No subscription activity yet.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                Account Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700">
                <p className="font-medium text-gray-900 dark:text-white">
                  Signed in as
                </p>
                <p>{user?.email}</p>
              </div>
              <div className="rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700">
                <p className="font-medium text-gray-900 dark:text-white">
                  Assigned roles
                </p>
                <p>{getPrimaryRoleLabel(user?.roles)}</p>
              </div>
              <div className="rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700">
                <p className="font-medium text-gray-900 dark:text-white">
                  Admin tools
                </p>
                <p>
                  User management and platform-wide reports are only shown to
                  admin accounts.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
