import { useState, useEffect } from 'react';
import { userApi, User, PaginatedUsersResponse } from '../user';
import { ApiResponse } from '../api';

export function useUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}) {
  const [data, setData] = useState<PaginatedUsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response: ApiResponse<PaginatedUsersResponse> = await userApi.getAllUsers(params);
        
        if (response.success) {
          setData(response.data);
        } else {
          setError(response.message || 'Failed to fetch users');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params?.page, params?.limit, params?.search, params?.role, params?.status]);

  const refetch = () => {
    setLoading(true);
    fetchData();
  };

  const fetchData = async () => {
    try {
      setError(null);
      const response: ApiResponse<PaginatedUsersResponse> = await userApi.getAllUsers(params);
      
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
}

export function useUserProfile() {
  const [data, setData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response: ApiResponse<User> = await userApi.getProfile();
        
        if (response.success) {
          setData(response.data);
        } else {
          setError(response.message || 'Failed to fetch profile');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateProfile = async (updateData: { name?: string; email?: string; roles?: string[] }) => {
    try {
      setLoading(true);
      setError(null);
      const response: ApiResponse<User> = await userApi.updateProfile(updateData);
      
      if (response.success) {
        setData(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, updateProfile };
} 