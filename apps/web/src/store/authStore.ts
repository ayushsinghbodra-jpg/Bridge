import { create } from "zustand";
import { User } from "@bridge/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized : boolean ;
  setUser : (user : User)=> void;
  clearUser : ()=> void;
  setInitialized : () => void;
};


const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,

  setUser: (user) => set({ user, isAuthenticated: true }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
  setInitialized: () => set({ isInitialized: true }),
}));
  

export default useAuthStore;