import { useState, useEffect } from "react";
import {
  analyticsApi,
  DashboardAnalytics,
  RevenueAnalytics,
  UserGrowthAnalytics,
} from "../analytics";
import { ApiResponse } from "../api";
import { useAuth } from "../../contexts/AuthContext";

export function useDashboardAnalytics() {
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Check if user is admin to determine which endpoint to use
        const isAdmin = user.roles.includes("admin");
        const response: ApiResponse<DashboardAnalytics> = isAdmin
          ? await analyticsApi.getAdminDashboardAnalytics()
          : await analyticsApi.getDashboardAnalytics();

        if (response.success) {
          setData(response.data);
        } else {
          setError(response.message || "Failed to fetch analytics data");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return { data, loading, error };
}

export function useRevenueAnalytics(enabled = true) {
  const [data, setData] = useState<RevenueAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!enabled) {
        setData([]);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response: ApiResponse<RevenueAnalytics[]> =
          await analyticsApi.getRevenueAnalytics();

        if (response.success) {
          setData(response.data);
        } else {
          setError(response.message || "Failed to fetch revenue data");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [enabled]);

  return { data, loading, error };
}

export function useUserGrowthAnalytics(enabled = true) {
  const [data, setData] = useState<UserGrowthAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!enabled) {
        setData([]);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response: ApiResponse<UserGrowthAnalytics[]> =
          await analyticsApi.getUserGrowthAnalytics();

        if (response.success) {
          setData(response.data);
        } else {
          setError(response.message || "Failed to fetch user growth data");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [enabled]);

  return { data, loading, error };
}
