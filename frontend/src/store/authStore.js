import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { resendOTP, getMe } from '../services/authService';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      showVerificationModal: false,
      setUser: (user) => {
        // Handle Laravel's JsonResource wrapping
        const userData = user?.data || user?.user?.data || user?.user || user;
        set({ user: userData });
      },
      setToken: (token) => set({ token }),
      setShowVerificationModal: (val) => set({ showVerificationModal: val }),
      logout: () => set({ user: null, token: null, showVerificationModal: false }),
      
      checkVerificationBeforeOrder: async () => {
        const { user, token } = get();
        if (!user) return false;
        
        // 1. Check local state first (fast path)
        if (user.email_verified_at) {
          return true;
        }
        
        // 2. Refresh from backend to ensure we don't have stale state
        try {
          const freshData = await getMe();
          const freshUser = freshData?.data || freshData?.user?.data || freshData?.user || freshData;
          
          if (freshUser && freshUser.email_verified_at) {
            set({ user: freshUser });
            return true;
          }

          // 3. User is definitely unverified, show security protocol modal
          set({ 
            showVerificationModal: true, 
            user: freshUser && Object.keys(freshUser).length > 0 ? freshUser : user 
          });
        } catch (err) {
          console.error("Identity protocol dispatch failed.", err);
          set({ showVerificationModal: true }); 
        }
        return false;
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;
