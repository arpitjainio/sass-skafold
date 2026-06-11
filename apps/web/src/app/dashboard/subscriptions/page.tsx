"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Search,
  Edit,
  Trash2,
  Eye,
  Plus,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Select,
  Checkbox,
  Heading,
} from "@repo/ui";
import {
  useAdminSubscriptions,
  useUserSubscriptions,
} from "@/lib/hooks/useSubscriptions";
import { subscriptionApi, Subscription } from "@/lib/subscription";
import SubscriptionModal from "@/components/SubscriptionModal";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { useNotifications } from "@/components/Notification";
import { useAuth } from "@/contexts/AuthContext";

const plans = ["All", "Basic", "Pro", "Enterprise"];
const statuses = ["All", "ACTIVE", "CANCELED", "PAST_DUE", "INCOMPLETE"];

export default function SubscriptionsPage() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes("admin") ?? false;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<string[]>(
    []
  );
  const [currentPage] = useState(1);
  const [limit] = useState(10);

  // Modal state
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Confirmation dialog state
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: "danger" | "warning" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const { addNotification } = useNotifications();
  const {
    data: userSubscriptions,
    loading: userSubscriptionsLoading,
    error: userSubscriptionsError,
  } = useUserSubscriptions(!isAdmin);

  const params = {
    page: currentPage,
    limit,
    ...(selectedStatus !== "All" && { status: selectedStatus }),
    ...(selectedPlan !== "All" && { plan: selectedPlan }),
  };

  const {
    data: subscriptionsData,
    loading,
    error,
  } = useAdminSubscriptions(params, isAdmin);

  const subscriptions = subscriptionsData?.data || [];

  if (!isAdmin) {
    const activeSubscriptions =
      userSubscriptions?.filter(
        (subscription) => subscription.status === "ACTIVE"
      ).length || 0;

    if (userSubscriptionsLoading) {
      return (
        <div className="space-y-6">
          <div>
            <Heading level="h3">Subscriptions</Heading>
            <p className="text-neutral-600 dark:text-neutral-200">
              Loading your subscriptions...
            </p>
          </div>
        </div>
      );
    }

    if (userSubscriptionsError) {
      return (
        <div className="space-y-6">
          <div>
            <Heading level="h3">Subscriptions</Heading>
            <p className="text-red-600 dark:text-red-400">
              Error loading subscriptions: {userSubscriptionsError}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <Heading level="h3">Subscriptions</Heading>
          <p className="text-neutral-600 dark:text-neutral-200">
            Review the subscriptions attached to your account.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total subscriptions
              </p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                {userSubscriptions.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active subscriptions
              </p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                {activeSubscriptions}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Account
              </p>
              <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                {user?.email || "Signed-in user"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Your subscription records
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {userSubscriptions.length > 0 ? (
              userSubscriptions.map((subscription) => (
                <div
                  key={subscription.id}
                  className="rounded-lg border border-gray-200 px-4 py-4 dark:border-gray-700"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {subscription.stripeSubId}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Started{" "}
                        {new Date(subscription.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <p>Status: {subscription.status}</p>
                      <p>
                        Current period ends{" "}
                        {new Date(
                          subscription.currentPeriodEnd
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No subscriptions found for this account yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Client-side filtering for search (since backend doesn't support search yet)
  const filteredSubscriptions = subscriptions.filter((subscription) => {
    if (!searchTerm) return true;
    const matchesSearch =
      subscription.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleSelectAll = () => {
    if (selectedSubscriptions.length === filteredSubscriptions.length) {
      setSelectedSubscriptions([]);
    } else {
      setSelectedSubscriptions(filteredSubscriptions.map((sub) => sub.id));
    }
  };

  const handleSelectSubscription = (subscriptionId: string) => {
    setSelectedSubscriptions((prev) =>
      prev.includes(subscriptionId)
        ? prev.filter((id) => id !== subscriptionId)
        : [...prev, subscriptionId]
    );
  };

  // Action handlers
  const handleViewSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleDeleteSubscription = (subscription: Subscription) => {
    setConfirmationDialog({
      isOpen: true,
      title: "Delete Subscription",
      message: `Are you sure you want to delete subscription ${subscription.id}? This action cannot be undone.`,
      variant: "danger",
      onConfirm: async () => {
        try {
          setIsDeleting(subscription.id);
          await subscriptionApi.deleteSubscription(subscription.id);
          addNotification({
            type: "success",
            message: "Subscription deleted successfully",
            title: "Subscription deleted",
          });
          // Refresh the subscriptions list
          window.location.reload();
        } catch (error) {
          addNotification({
            type: "error",
            message: `Failed to delete subscription. Due to: ${error instanceof Error ? error.message : "Unknown error"}`,
            title: "Error",
          });
        } finally {
          setIsDeleting(null);
          setConfirmationDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleSaveSubscription = async (
    subscriptionData: Partial<Subscription>
  ) => {
    if (!selectedSubscription) return;

    try {
      await subscriptionApi.updateSubscription(selectedSubscription.id, {
        status: subscriptionData.status || "",
        currentPeriodEnd: subscriptionData.currentPeriodEnd || "",
        canceledAt: subscriptionData.canceledAt || "",
      });
      // Refresh the subscriptions list
      window.location.reload();
    } catch (error) {
      addNotification({
        type: "error",
        message: `Failed to update subscription. Due to: ${error instanceof Error ? error.message : "Unknown error"}`,
        title: "Error",
      });
      throw error; // Let the modal handle the error
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSubscription(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "CANCELED":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "PAST_DUE":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "INCOMPLETE":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "TRIALING":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <CheckCircle className="w-4 h-4 text-green-500" aria-hidden="true" />
        );
      case "CANCELED":
        return <XCircle className="w-4 h-4 text-gray-500" aria-hidden="true" />;
      case "PAST_DUE":
        return <Clock className="w-4 h-4 text-red-500" aria-hidden="true" />;
      case "INCOMPLETE":
        return <Clock className="w-4 h-4 text-yellow-500" aria-hidden="true" />;
      case "TRIALING":
        return (
          <CheckCircle className="w-4 h-4 text-blue-500" aria-hidden="true" />
        );
      default:
        return <Clock className="w-4 h-4 text-gray-500" aria-hidden="true" />;
    }
  };

  // Calculate summary stats (for now, without real pricing data)
  const activeSubscriptions = subscriptions.filter(
    (sub) => sub.status === "ACTIVE"
  ).length;
  const cancelledSubscriptions = subscriptions.filter(
    (sub) => sub.status === "CANCELED"
  ).length;
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
            <div
              key={i}
              className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
            />
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
            Error loading subscriptions; due to:{" "}
            {error ? error : "Unknown error"}
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
          <Heading level="h3">Subscriptions</Heading>
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
                <DollarSign
                  className="w-6 h-6 text-green-600 dark:text-green-400"
                  aria-hidden="true"
                />
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
                <CheckCircle
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
                  aria-hidden="true"
                />
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
                <XCircle
                  className="w-6 h-6 text-red-600 dark:text-red-400"
                  aria-hidden="true"
                />
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
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                aria-hidden="true"
              />
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
              {plans.map((plan) => (
                <option key={plan} value={plan}>
                  {plan === "All" ? "All Plans" : plan}
                </option>
              ))}
            </Select>

            {/* Status filter */}
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === "All" ? "All Statuses" : status}
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
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
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
                      checked={
                        selectedSubscriptions.length ===
                          filteredSubscriptions.length &&
                        filteredSubscriptions.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Customer
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Plan
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Next Billing
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Payment Method
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscriptions.map((subscription) => (
                  <tr
                    key={subscription.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="py-3 px-4">
                      <Checkbox
                        checked={selectedSubscriptions.includes(
                          subscription.id
                        )}
                        onCheckedChange={() =>
                          handleSelectSubscription(subscription.id)
                        }
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <CreditCard
                            className="w-5 h-5 text-gray-600 dark:text-gray-400"
                            aria-hidden="true"
                          />
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
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}
                        >
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
                      {subscription.currentPeriodEnd
                        ? new Date(
                            subscription.currentPeriodEnd
                          ).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                      -
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          aria-label="View subscription"
                          onClick={() => handleViewSubscription(subscription)}
                        >
                          <Eye className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          aria-label="Edit subscription"
                          onClick={() => handleEditSubscription(subscription)}
                        >
                          <Edit className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                          className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
                          aria-label="Delete subscription"
                          onClick={() => handleDeleteSubscription(subscription)}
                          disabled={isDeleting === subscription.id}
                        >
                          {isDeleting === subscription.id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          )}
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

      {/* Subscription Modal */}
      <SubscriptionModal
        subscription={selectedSubscription}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveSubscription}
        mode={modalMode}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        onClose={() =>
          setConfirmationDialog((prev) => ({ ...prev, isOpen: false }))
        }
        onConfirm={confirmationDialog.onConfirm}
        title={confirmationDialog.title}
        message={confirmationDialog.message}
        variant={confirmationDialog.variant || "danger"}
        isLoading={isDeleting !== null}
      />
    </div>
  );
}
