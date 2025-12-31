import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  initialized: boolean

  // Actions
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean) => void

  // Auth methods
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>
  signUpWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  fetchProfile: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        session: null,
        profile: null,
        loading: true,
        initialized: false,

        setUser: (user) => set({ user }),
        setSession: (session) => set({ session }),
        setProfile: (profile) => set({ profile }),
        setLoading: (loading) => set({ loading }),
        setInitialized: (initialized) => set({ initialized }),

        signInWithEmail: async (email, password) => {
          set({ loading: true })
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          if (error) {
            set({ loading: false })
            return { error }
          }
          set({ user: data.user, session: data.session, loading: false })
          await get().fetchProfile()
          return { error: null }
        },

        signUpWithEmail: async (email, password) => {
          set({ loading: true })
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          })
          if (error) {
            set({ loading: false })
            return { error }
          }
          set({ user: data.user, session: data.session, loading: false })
          return { error: null }
        },

        signOut: async () => {
          await supabase.auth.signOut()
          set({ user: null, session: null, profile: null })
        },

        fetchProfile: async () => {
          const { user } = get()
          if (!user) return

          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (error) {
            console.error('Error fetching profile:', error)
            return
          }

          set({ profile: data })
        },
      }),
      {
        name: 'spe-auth',
        partialize: (state) => ({
          // Only persist non-sensitive data
          initialized: state.initialized,
        }),
      }
    ),
    { name: 'AuthStore' }
  )
)

// Track subscription to prevent duplicates (React StrictMode calls twice)
let authSubscription: { unsubscribe: () => void } | null = null

// Initialize auth state on app load
export async function initializeAuth() {
  // Prevent duplicate subscriptions
  if (authSubscription) {
    return
  }

  const { setUser, setSession, setLoading, setInitialized, fetchProfile } = useAuthStore.getState()

  // Get initial session
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    setUser(session.user)
    setSession(session)
    await fetchProfile()
  }

  setLoading(false)
  setInitialized(true)

  // Listen for auth changes - store subscription for cleanup (Context7 pattern)
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
    setUser(session?.user ?? null)
    setSession(session)

    if (session?.user) {
      await fetchProfile()
    } else {
      useAuthStore.setState({ profile: null })
    }
  })

  authSubscription = subscription
}
