import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: async (user, token) => {
        localStorage.setItem("token", token);
        set({ user, token, isAuthenticated: true });
        // After authentication, load registration data (including scores)
        try {
          const res = await fetch(`${process.env.REACT_APP_API_URL}/master/registrations/${user.registration_id}/with-score`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            set({ user: { ...user, registration: data.registration, scores: data.scores } });
          }
        } catch (e) {
          console.error('Failed to load registration with scores', e);
        }
      },
      loadUserRegistration: async () => {
        const { user, token } = get();
        if (!user || !token) return;
        try {
          const res = await fetch(`${process.env.REACT_APP_API_URL}/master/registrations/${user.registration_id}/with-score`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            set({ user: { ...user, registration: data.registration, scores: data.scores } });
          }
        } catch (e) {
          console.error('Failed to load registration with scores', e);
        }
      },
      logout: () => {
        localStorage.removeItem("token");
        set({ user: null, token: null, isAuthenticated: false });
      },
      setUser: (user) => set({ user }),
    }),
    {
      name: "auth-storage",
    },
  ),
);
