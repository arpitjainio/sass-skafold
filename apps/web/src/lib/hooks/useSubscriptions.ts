import { useState, useEffect } from 'react';
import { subscriptionApi, Subscription, PaginatedSubscriptionsResponse } from '../subscription';
import { ApiResponse } from '../api';

export function useUserSubscriptions() {
  const [data, setData] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response: ApiResponse<Subscription[]> = await subscriptionApi.getUserSubscriptions();
        
        if (response.success) {
          setData(response.data);
        } else {
          setError(response.message || 'Failed to fetch subscriptions');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const refetch = () => {
    setLoading(true);
    fetchData();
  };

  const fetchData = async () => {
    try {
      setError(null);
      const response: ApiResponse<Subscription[]> = await subscriptionApi.getUserSubscriptions();
      
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.message || 'Failed to fetch subscriptions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
}

export function useAdminSubscriptions(params?: {
  page?: number;
  limit?: number;
  status?: string;
  plan?: string;
}) {
  const [data, setData] = useState<PaginatedSubscriptionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response: ApiResponse<PaginatedSubscriptionsResponse> = await subscriptionApi.getAllSubscriptions(params);
        
        if (response.success) {
          setData(response.data);
        } else {
          setError(response.message || 'Failed to fetch subscriptions');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params?.page, params?.limit, params?.status, params?.plan]);

  const refetch = () => {
    setLoading(true);
    fetchData();
  };

  const fetchData = async () => {
    try {
      setError(null);
      const response: ApiResponse<PaginatedSubscriptionsResponse> = await subscriptionApi.getAllSubscriptions(params);
      
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.message || 'Failed to fetch subscriptions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
} 