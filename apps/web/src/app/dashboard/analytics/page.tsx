"use client";

import React from "react";
import {
  Activity,
  CreditCard,
  DollarSign,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Heading,
  StatsCard,
} from "@repo/ui";
import {
  useDashboardAnalytics,
  useRevenueAnalytics,
  useUserGrowthAnalytics,
} from "@/lib/hooks/useAnalytics";
import { useAuth } from "@/contexts/AuthContext";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes("admin") ?? false;
  const { data: analytics, loading, error } = useDashboardAnalytics();
  const { data: revenueData, loading: revenueLoading } =
    useRevenueAnalytics(isAdmin);
  const { data: userGrowthData, loading: userGrowthLoading } =
    useUserGrowthAnalytics(isAdmin);

  if (loading || (isAdmin && (revenueLoading || userGrowthLoading))) {
    return (
      <div className="space-y-6">
        <div>
          <Heading level="h3">Analytics</Heading>
          <p className="text-neutral-600 dark:text-neutral-200">
            Loading analytics data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <Heading level="h3">Analytics</Heading>
          <p className="text-red-600 dark:text-red-400">
            Error loading analytics: {error}
          </p>
        </div>
      </div>
    );
  }

  const stats = isAdmin
    ? [
        {
          title: "Revenue",
          value: `$${analytics?.totalRevenue?.toLocaleString() || "0"}`,
          icon: DollarSign,
          iconColor: "bg-green-500",
          description: "Platform-wide revenue visibility",
        },
        {
          title: "Users",
          value: analytics?.totalUsers?.toString() || "0",
          icon: Users,
          iconColor: "bg-blue-500",
          description: "Registered users",
        },
        {
          title: "Active Subscriptions",
          value: analytics?.activeSubscriptions?.toString() || "0",
          icon: CreditCard,
          iconColor: "bg-purple-500",
          description: "Subscribers currently active",
        },
        {
          title: "Growth",
          value: analytics?.userGrowth?.toString() || "0",
          icon: TrendingUp,
          iconColor: "bg-orange-500",
          description: "Growth trend",
        },
      ]
    : [
        {
          title: "My Account",
          value: user?.email || "Unavailable",
          icon: Users,
          iconColor: "bg-blue-500",
          description: "Your signed-in account",
        },
        {
          title: "Active Subscriptions",
          value: analytics?.activeSubscriptions?.toString() || "0",
          icon: CreditCard,
          iconColor: "bg-green-500",
          description: "Subscriptions assigned to you",
        },
        {
          title: "Tracked Statuses",
          value: Object.keys(
            analytics?.subscriptionStats ?? {}
          ).length.toString(),
          icon: Activity,
          iconColor: "bg-purple-500",
          description: "Subscription states returned by the API",
        },
      ];

  return (
    <div className="space-y-6">
      <div>
        <Heading level="h3">Analytics</Heading>
        <p className="text-neutral-600 dark:text-neutral-200">
          {isAdmin
            ? "Track platform-wide performance trends."
            : "Review analytics available for your account."}
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
                Revenue Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {revenueData.length > 0 ? (
                revenueData.map((point) => (
                  <div
                    key={point.month}
                    className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700"
                  >
                    <span className="font-medium text-gray-900 dark:text-white">
                      {point.month}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {point.count}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No revenue data available.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                User Growth
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {userGrowthData.length > 0 ? (
                userGrowthData.map((point) => (
                  <div
                    key={point.month}
                    className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700"
                  >
                    <span className="font-medium text-gray-900 dark:text-white">
                      {point.month}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {point.count} new / {point.cumulative} total
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No user growth data available.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Subscription Status Summary
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
                    <span className="font-medium text-gray-900 dark:text-white">
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
                No subscription data available for this account.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
