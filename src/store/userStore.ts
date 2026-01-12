/**
 * User Store - Production-ready state management with persistence
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UserState {
  userId: string | null;
  phoneNumber: string | null;
  isAuthenticated: boolean;
  setUserId: (userId: string) => Promise<void>;
  setPhoneNumber: (phoneNumber: string) => Promise<void>;
  clearUser: () => Promise<void>;
  initialize: () => Promise<void>;
}

const USER_STORAGE_KEY = '@bookitall:user_store';

/**
 * User Store with persistence
 */
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: null,
      phoneNumber: null,
      isAuthenticated: false,

      setUserId: async (userId: string) => {
        set({ userId, isAuthenticated: true });
        // Also store in AsyncStorage for quick access
        try {
          await AsyncStorage.setItem('@bookitall:user_id', userId);
        } catch (error) {
          console.error('Error storing userId:', error);
        }
      },

      setPhoneNumber: async (phoneNumber: string) => {
        set({ phoneNumber });
      },

      clearUser: async () => {
        set({
          userId: null,
          phoneNumber: null,
          isAuthenticated: false,
        });
        // Clear AsyncStorage
        try {
          await AsyncStorage.multiRemove([
            '@bookitall:user_id',
            USER_STORAGE_KEY,
          ]);
        } catch (error) {
          console.error('Error clearing user data:', error);
        }
      },

      initialize: async () => {
        // Load userId from AsyncStorage on app start
        try {
          const userId = await AsyncStorage.getItem('@bookitall:user_id');
          if (userId) {
            set({ userId, isAuthenticated: true });
          }
        } catch (error) {
          console.error('Error initializing user store:', error);
        }
      },
    }),
    {
      name: USER_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        userId: state.userId,
        phoneNumber: state.phoneNumber,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

