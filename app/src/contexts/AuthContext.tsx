import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Profile, Organisation, UserOrganisation, OrgRole } from '@/lib/database.types'
import { toast } from 'sonner'

interface UserOrgMembership extends UserOrganisation {
  organisation: Organisation
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  memberships: UserOrgMembership[]
  currentOrganisation: Organisation | null
  currentRole: OrgRole | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName?: string) => Promise<void>
  signOut: () => Promise<void>
  signInAsDemo: () => Promise<void>
  switchOrganisation: (orgId: string) => void
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const DEMO_EMAIL = 'demo@retaind.app'
const DEMO_PASSWORD = 'RetaindDemo2025!'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [memberships, setMemberships] = useState<UserOrgMembership[]>([])
  const [currentOrganisation, setCurrentOrganisation] = useState<Organisation | null>(null)
  const [currentRole, setCurrentRole] = useState<OrgRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasCheckedDemoSeed, setHasCheckedDemoSeed] = useState(false)

  // Fetch user profile
  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }
    return data
  }, [])

  // Fetch user's organisation memberships
  const fetchMemberships = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('user_organisations')
      .select(`
        *,
        organisation:organisations(*)
      `)
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching memberships:', error)
      return []
    }

    return data as UserOrgMembership[]
  }, [])

  // Check and seed demo data if needed
  const checkAndSeedDemoData = useCallback(async (orgId: string) => {
    if (hasCheckedDemoSeed) return

    try {
      // Check if org has any workers
      const { count, error } = await supabase
        .from('workers')
        .select('*', { count: 'exact', head: true })
        .eq('organisation_id', orgId)

      if (error) {
        console.error('Error checking workers count:', error)
        return
      }

      if (count === 0) {
        toast.info('Setting up demo data...')

        // Dynamically import and run the seed function
        const { seedDemoData } = await import('@/data/seedDemoData')
        await seedDemoData(orgId)

        toast.success('Demo data loaded successfully!')
      }

      setHasCheckedDemoSeed(true)
    } catch (error) {
      console.error('Error seeding demo data:', error)
      toast.error('Failed to load demo data')
    }
  }, [hasCheckedDemoSeed])

  // Load user data after authentication
  const loadUserData = useCallback(async (authUser: User) => {
    setIsLoading(true)
    try {
      const [userProfile, userMemberships] = await Promise.all([
        fetchProfile(authUser.id),
        fetchMemberships(authUser.id),
      ])

      setProfile(userProfile)
      setMemberships(userMemberships)

      // Set current organisation (prefer primary, then first available)
      if (userMemberships.length > 0) {
        const primary = userMemberships.find((m) => m.is_primary)
        const selected = primary || userMemberships[0]
        setCurrentOrganisation(selected.organisation)
        setCurrentRole(selected.role)

        // Check and seed demo data for the current org
        await checkAndSeedDemoData(selected.organisation.id)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [fetchProfile, fetchMemberships, checkAndSeedDemoData])

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession)
      setUser(currentSession?.user ?? null)

      if (currentSession?.user) {
        loadUserData(currentSession.user)
      } else {
        setIsLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession)
        setUser(currentSession?.user ?? null)

        if (event === 'SIGNED_IN' && currentSession?.user) {
          await loadUserData(currentSession.user)
        } else if (event === 'SIGNED_OUT') {
          setProfile(null)
          setMemberships([])
          setCurrentOrganisation(null)
          setCurrentRole(null)
          setHasCheckedDemoSeed(false)
          setIsLoading(false)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [loadUserData])

  // Sign in with email/password
  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setIsLoading(false)
      throw error
    }
  }

  // Sign up with email/password
  const signUp = async (email: string, password: string, fullName?: string) => {
    setIsLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      setIsLoading(false)
      throw error
    }
  }

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  // Demo login - sign in with demo credentials
  const signInAsDemo = async () => {
    setIsLoading(true)
    try {
      // First try to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      })

      if (signInError) {
        // If sign in fails, try to create the account
        if (signInError.message.includes('Invalid login credentials')) {
          const { error: signUpError } = await supabase.auth.signUp({
            email: DEMO_EMAIL,
            password: DEMO_PASSWORD,
            options: {
              data: {
                full_name: 'Demo User',
              },
            },
          })

          if (signUpError) throw signUpError

          // After signup, the trigger should auto-accept the invite
          // Sign in again
          const { error: retryError } = await supabase.auth.signInWithPassword({
            email: DEMO_EMAIL,
            password: DEMO_PASSWORD,
          })

          if (retryError) throw retryError
        } else {
          throw signInError
        }
      }
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }

  // Switch current organisation
  const switchOrganisation = (orgId: string) => {
    const membership = memberships.find((m) => m.organisation.id === orgId)
    if (membership) {
      setCurrentOrganisation(membership.organisation)
      setCurrentRole(membership.role)
      setHasCheckedDemoSeed(false) // Reset so we can check the new org
      checkAndSeedDemoData(orgId)
    }
  }

  // Refresh profile data
  const refreshProfile = async () => {
    if (user) {
      const userProfile = await fetchProfile(user.id)
      setProfile(userProfile)
    }
  }

  const value: AuthContextType = {
    user,
    session,
    profile,
    memberships,
    currentOrganisation,
    currentRole,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    signInAsDemo,
    switchOrganisation,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
