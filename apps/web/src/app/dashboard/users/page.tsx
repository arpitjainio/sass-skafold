'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Plus,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Checkbox, Select, Heading } from '@repo/ui';

// Mock user data
const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active', lastLogin: '2 hours ago', joined: '2024-01-15' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active', lastLogin: '1 day ago', joined: '2024-01-10' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive', lastLogin: '1 week ago', joined: '2024-01-05' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Moderator', status: 'Active', lastLogin: '3 hours ago', joined: '2024-01-12' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'User', status: 'Active', lastLogin: '5 hours ago', joined: '2024-01-08' },
  { id: 6, name: 'Diana Prince', email: 'diana@example.com', role: 'User', status: 'Suspended', lastLogin: '2 weeks ago', joined: '2024-01-03' },
  { id: 7, name: 'Eve Adams', email: 'eve@example.com', role: 'User', status: 'Active', lastLogin: '1 hour ago', joined: '2024-01-20' },
  { id: 8, name: 'Frank Miller', email: 'frank@example.com', role: 'Moderator', status: 'Active', lastLogin: '4 hours ago', joined: '2024-01-14' },
];

const roles = ['All', 'Admin', 'Moderator', 'User'];
const statuses = ['All', 'Active', 'Inactive', 'Suspended'];

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'All' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'All' || user.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const handleSelectUser = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'Suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Moderator':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'User':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h3">
            Users
          </Heading>
          <p className="text-neutral-600 dark:text-neutral-200">
            Manage your users and their permissions.
          </p>
        </div>
        <Button className="flex items-center space-x-2">
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" aria-hidden="true" />
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
              {roles.map(role => (
                <option key={role} value={role}>
                  {role === 'All' ? 'All Roles' : role}
                </option>
              ))}
            </Select>

            {/* Status filter */}
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'All' ? 'All Statuses' : status}
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

      {/* Users table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white leading-[32px]">
            <span>Users ({filteredUsers.length})</span>
            {selectedUsers.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedUsers.length} selected
                </span>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
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
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Last Login</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Joined</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4">
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => handleSelectUser(user.id)}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" aria-hidden="true" />
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
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                      {user.lastLogin}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                      {user.joined}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="View user">
                          <Eye className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Edit user">
                          <Edit className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600" aria-label="More options">
                          <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
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
    </div>
  );
} 