import apiClient from "./apiClient";

export interface RecentActivity {
  title: string;
  description: string;
  time: string | null;
  type: string;
}

export const getRecentActivity = async (
  limit = 8,
): Promise<RecentActivity[]> => {
  const response = await apiClient.get<RecentActivity[]>(
    `/activity/recent?limit=${limit}`,
  );

  return response.data;
};
