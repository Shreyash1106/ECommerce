import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export const useStore = create(
  devtools(
    persist(
      (set) => ({
        // Sidebar
        sidebarOpen: true,
        toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

        // Notifications
        unreadCount: 0,
        setUnreadCount: (n) => set({ unreadCount: n }),
        decrementUnread: () => set((s) => ({ unreadCount: Math.max(0, s.unreadCount - 1) })),
        clearUnread: () => set({ unreadCount: 0 }),
      }),
      { name: "commerceos-ui", partialize: (s) => ({ sidebarOpen: s.sidebarOpen }) }
    ),
    { name: "useStore" }
  )
);
