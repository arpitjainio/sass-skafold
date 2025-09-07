import { useState, useEffect } from 'react';
import { apiClient, ApiResponse } from '../api';

export interface RecentUser {
  id: string;
  name: string;
  email: string;
  status: 'Active' | 'Inactive';
  joined: string;
  roles: string[];
}

export interface RecentActivity {
  action: string;
  user: string;
  time: string;
  type: 'user' | 'subscription' | 'cancellation' | 'payment';
}

export function useRecentUsers(limit = 5) {
  const [data, setData] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response: ApiResponse<RecentUser[]> = await apiClient.get(`/admin/recent/users?limit=${limit}`);
        
        if (response.success) {
          setData(response.data);
        } else {
          setError(response.message || 'Failed to fetch recent users');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [limit]);

  return { data, loading, error };
}

export function useRecentActivity(limit = 10) {
  const [data, setData] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response: ApiResponse<RecentActivity[]> = await apiClient.get(`/admin/recent/activity?limit=${limit}`);
        
        if (response.success) {
          setData(response.data);
        } else {
          setError(response.message || 'Failed to fetch recent activity');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [limit]);

  return { data, loading, error };
}
