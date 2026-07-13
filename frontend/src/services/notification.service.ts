import { apiClient } from "./apiClient";
import type { BackendNotification } from "../types/dashboard.types";

export const notificationService = {
  getNotifications: async (): Promise<BackendNotification[]> => {
    const { data } = await apiClient.get("/notifications");
    return data.notifications;
  },
  getUnreadCount: async (): Promise<number> => {
    const { data } = await apiClient.get("/notifications/unread-count");
    return data.count;
  },
  markAsRead: async (id: string): Promise<void> => {
    await apiClient.put(`/notifications/${id}/read`);
  },
  markAllAsRead: async (): Promise<void> => {
    await apiClient.put("/notifications/read-all");
  },
};
