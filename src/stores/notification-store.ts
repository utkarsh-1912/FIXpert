import { create } from 'zustand';
import { produce } from 'immer';
import { LucideIcon } from 'lucide-react';

export type Notification = {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  read: boolean;
  timestamp: Date;
};

type NotificationStore = {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
};

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (notification) =>
    set(
      produce((state: NotificationStore) => {
        state.notifications.unshift({
          ...notification,
          id: `notif-${Date.now()}`,
          read: false,
          timestamp: new Date(),
        });
        // Limit to 20 notifications
        if (state.notifications.length > 20) {
            state.notifications.pop();
        }
      })
    ),
  markAsRead: (id) =>
    set(
      produce((state: NotificationStore) => {
        const notif = state.notifications.find((n) => n.id === id);
        if (notif) {
          notif.read = true;
        }
      })
    ),
  markAllAsRead: () =>
    set(
      produce((state: NotificationStore) => {
        state.notifications.forEach((n) => (n.read = true));
      })
    ),
  clearAll: () => set({ notifications: [] }),
}));
