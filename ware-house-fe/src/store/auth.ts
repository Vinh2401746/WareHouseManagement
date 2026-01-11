import { create } from 'zustand'

interface AuthState {
  bears: number
  increase: (by: number) => void
}

const useAuthStore = create<AuthState>()((set) => ({
  bears: 0,
  increase: (by) => set((state) => ({ bears: state.bears + by })),
}))
export default useAuthStore