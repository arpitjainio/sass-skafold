"use client";

import React, { useState } from "react";
import { Users, Search, Edit, Trash2, Eye, Plus, Download } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Checkbox,
  Select,
  Heading,
} from "@repo/ui";
import { useUsers } from "@/lib/hooks/useUsers";
import { userApi, User } from "@/lib/user";
import UserModal from "@/components/UserModal";
import CreateUserModal from "@/components/CreateUserModal";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { useNotifications } from "@/components/Notification";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const roles = ["All", "Admin", "Moderator", "User"];
const statuses = ["All", "Active", "Inactive", "Suspended"];

function UsersPageContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  // Modal state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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

  const params = {
    page: currentPage,
    limit,
    ...(searchTerm && { search: searchTerm }),
    ...(selectedRole !== "All" && { role: selectedRole }),
    ...(selectedStatus !== "All" && { status: selectedStatus }),
  };

  const { data: usersData, loading, error } = useUsers(params);

  const users = usersData?.data || [];
  const totalUsers = usersData?.meta?.total || 0;

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => user.id));
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // Action handlers
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setConfirmationDialog({
      isOpen: true,
      title: "Delete User",
      message: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
      variant: "danger",
      onConfirm: async () => {
        try {
          setIsDeleting(user.id);
          await userApi.deleteUser(user.id);
          addNotification({
            title: "User deleted",
            type: "success",
            message: "User deleted successfully",
          });
          // Refresh the users list
          window.location.reload();
        } catch (error) {
          addNotification({
            title: "Error",
            type: "error",
            message: `Failed to delete user. Due to: ${error instanceof Error ? error.message : "Unknown error"}`,
          });
        } finally {
          setIsDeleting(null);
          setConfirmationDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleSaveUser = async (userData: Partial<User>) => {
    if (!selectedUser) return;

    await userApi.updateUser(selectedUser.id, {
      name: userData.name || "",
      email: userData.email || "",
      roles: userData.roles || [],
    });
    // Refresh the users list
    window.location.reload();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleCreateUser = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateUserSuccess = () => {
    // Refresh the users list
    window.location.reload();
  };

  // Bulk actions
  const handleBulkDelete = () => {
    if (selectedUsers.length === 0) {
      addNotification({
        type: "error",
        title: "Error",
        message: "Please select users to delete",
      });
      return;
    }

    setConfirmationDialog({
      isOpen: true,
      title: "Delete Multiple Users",
      message: `Are you sure you want to delete ${selectedUsers.length} users? This action cannot be undone.`,
      variant: "danger",
      onConfirm: async () => {
        try {
          // Delete users one by one
          for (const userId of selectedUsers) {
            await userApi.deleteUser(userId);
          }

          addNotification({
            type: "success",
            title: "Success",
            message: `${selectedUsers.length} users deleted successfully`,
          });

          setSelectedUsers([]);
          window.location.reload();
        } catch {
          addNotification({
            type: "error",
            title: "Error",
            message: "Failed to delete some users",
          });
        } finally {
          setConfirmationDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleExportUsers = () => {
    // Simple CSV export
    const csvContent = [
      ["Name", "Email", "Role", "Subscription Count", "Created At"],
      ...users.map((user) => [
        user.name,
        user.email,
        user.roles?.join(", ") || "User",
        user.subscriptionCount.toString(),
        new Date(user.createdAt).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    addNotification({
      type: "success",
      title: "Success",
      message: "Users exported successfully",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "Suspended":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "Moderator":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "User":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Heading level="h3">Users</Heading>
          <p className="text-neutral-600 dark:text-neutral-200">
            Loading users...
          </p>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <Heading level="h3">Users</Heading>
          <p className="text-red-600 dark:text-red-400">
            Error loading users: {error}
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
          <Heading level="h3">Users</Heading>
          <p className="text-neutral-600 dark:text-neutral-200">
            Manage your users and their permissions.
          </p>
        </div>
        <Button
          className="flex items-center space-x-2"
          onClick={handleCreateUser}
        >
          <Plus className="w-4 h-4" />
          <span>Add User</span>
        </Button>
      </div>

      {/* Filters and search */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative text-primary-950 dark:text-neutral-200">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                aria-hidden="true"
              />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Role filter */}
            <Select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role === "All" ? "All Roles" : role}
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
            <Button
              variant="outline"
              className="flex items-center space-x-2"
              onClick={handleExportUsers}
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white leading-[32px]">
            <span>Users ({totalUsers})</span>
            {selectedUsers.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedUsers.length} selected
                </span>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
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
                        selectedUsers.length === users.length &&
                        users.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    User
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Role
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Last Login
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Joined
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-8 text-gray-500 dark:text-gray-400"
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="py-3 px-4">
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={() => handleSelectUser(user.id)}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <Users
                              className="w-5 h-5 text-gray-600 dark:text-gray-400"
                              aria-hidden="true"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {user.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.roles[0] || "User")}`}
                        >
                          {user.roles[0] || "User"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.hasActiveSubscription ? "Active" : "Inactive")}`}
                        >
                          {user.hasActiveSubscription ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                        -
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            aria-label="View user"
                            onClick={() => handleViewUser(user)}
                          >
                            <Eye className="w-4 h-4" aria-hidden="true" />
                          </button>
                          <button
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            aria-label="Edit user"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="w-4 h-4" aria-hidden="true" />
                          </button>
                          <button
                            className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
                            aria-label="Delete user"
                            onClick={() => handleDeleteUser(user)}
                            disabled={isDeleting === user.id}
                          >
                            {isDeleting === user.id ? (
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {usersData?.meta && usersData.meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {(currentPage - 1) * limit + 1} to{" "}
                {Math.min(currentPage * limit, totalUsers)} of {totalUsers}{" "}
                users
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Page {currentPage} of {usersData.meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(usersData.meta.totalPages, prev + 1)
                    )
                  }
                  disabled={currentPage === usersData.meta.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Modal */}
      <UserModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
        mode={modalMode}
      />

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateUserSuccess}
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

export default function UsersPage() {
  return (
    <ProtectedRoute roles={["admin"]}>
      <UsersPageContent />
    </ProtectedRoute>
  );
}
