import { create } from "zustand";

export type IntelligenceType = "warning" | "info" | "success" | "tactical";

export type IntelligenceNotification = {
  id: string;
  type: IntelligenceType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
};

type IntelligenceState = {
  notifications: IntelligenceNotification[];
  unreadCount: number;
  addNotification: (n: Omit<IntelligenceNotification, "id" | "timestamp" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
};

export const useIntelligence = create<IntelligenceState>((set) => ({
  notifications: [
    {
      id: "1",
      type: "tactical",
      title: "Artisan Surge Detected",
      message: "Demand for 'Signature Fade' is 1.4x higher than predicted. Consider reassigning station 2.",
      timestamp: Date.now() - 300000,
      read: false,
    },
    {
      id: "2",
      type: "warning",
      title: "Inventory Alert",
      message: "Post-Shave Balm (Obsidian Series) falling below threshold. 4 units remaining.",
      timestamp: Date.now() - 1200000,
      read: false,
    },
    {
      id: "3",
      type: "info",
      title: "Proximity Alert",
      message: "VIP Member James Carter is within 250m. Prepare station for signature session.",
      timestamp: Date.now() - 1800000,
      read: true,
    },
  ],
  unreadCount: 2,
  addNotification: (n) => set((state) => {
    const newNotification = {
      ...n,
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      read: false,
    };
    return {
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    };
  }),
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) => n.id === id ? { ...n, read: true } : n),
    unreadCount: state.unreadCount - (state.notifications.find(n => n.id === id)?.read ? 0 : 1),
  })),
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, read: true })),
    unreadCount: 0,
  })),
}));
