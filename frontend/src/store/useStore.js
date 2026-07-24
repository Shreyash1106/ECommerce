import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export const useStore = create(
  devtools(
    persist(
      (set, get) => ({
        // Sidebar
        sidebarOpen: true,
        toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

        // Cart State
        cart: [],
        addToCart: (product, quantity = 1) => {
          const currentCart = get().cart;
          const existingIndex = currentCart.findIndex((item) => item.id === product.id);
          if (existingIndex > -1) {
            const updated = [...currentCart];
            updated[existingIndex].quantity = (updated[existingIndex].quantity || 1) + quantity;
            set({ cart: updated });
          } else {
            set({ cart: [...currentCart, { ...product, quantity }] });
          }
        },
        removeFromCart: (productId) =>
          set((s) => ({ cart: s.cart.filter((item) => item.id !== productId) })),
        updateQuantity: (productId, quantity) =>
          set((s) => ({
            cart: s.cart.map((item) =>
              item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
            ),
          })),
        clearCart: () => set({ cart: [] }),

        // Notifications
        unreadCount: 0,
        setUnreadCount: (n) => set({ unreadCount: n }),
        decrementUnread: () => set((s) => ({ unreadCount: Math.max(0, s.unreadCount - 1) })),
        clearUnread: () => set({ unreadCount: 0 }),
      }),
      {
        name: "commerceos-ui",
        partialize: (s) => ({ sidebarOpen: s.sidebarOpen, cart: s.cart }),
      }
    ),
    { name: "useStore" }
  )
);

