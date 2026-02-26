import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { OrgRole } from '@/lib/database.types'

// Permission types
export type Resource =
  | 'workers'
  | 'issues'
  | 'templates'
  | 'playbooks'
  | 'cpd'
  | 'settings'
  | 'reports'
  | 'invites'
  | 'regions'
  | 'teams'

export type Action = 'view' | 'create' | 'edit' | 'delete' | 'manage' | 'update'

// Demo persona definition
export interface DemoPersona {
  id: string
  name: string
  email: string
  role: OrgRole
  jobTitle: string
  regionId?: string
  regionName?: string
  teamId?: string
  teamName?: string
  workerId?: string // For operative personas who are also workers
  permissions: Record<Resource, Action[]>
  description: string
}

// Data scope for filtering
export interface DataScope {
  type: 'all' | 'region' | 'team' | 'self'
  regionId?: string
  teamId?: string
  workerId?: string
}

// 11 demo personas
export const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: 'admin',
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@northfield-me.com',
    role: 'ORG_ADMIN',
    jobTitle: 'Operations Director',
    permissions: {
      workers: ['view', 'create', 'edit', 'delete', 'manage'],
      issues: ['view', 'create', 'edit', 'delete', 'manage'],
      templates: ['view', 'create', 'edit', 'delete', 'manage'],
      playbooks: ['view', 'create', 'edit', 'delete', 'manage'],
      cpd: ['view', 'create', 'edit', 'delete', 'manage'],
      settings: ['view', 'edit', 'manage'],
      reports: ['view', 'create', 'manage'],
      invites: ['view', 'create', 'delete', 'manage'],
      regions: ['view', 'create', 'edit', 'delete', 'manage'],
      teams: ['view', 'create', 'edit', 'delete', 'manage'],
    },
    description: 'Full admin access to all features and data',
  },
  {
    id: 'operative',
    name: 'James Cooper',
    email: 'james.cooper@northfield-me.com',
    role: 'OPERATIVE',
    jobTitle: 'Electrician',
    regionId: 'region-north-west',
    regionName: 'North West',
    teamId: 'team-electrical-nw',
    teamName: 'Electrical - NW',
    workerId: 'worker-james-cooper',
    permissions: {
      workers: ['view'],
      issues: ['view'],
      templates: [],
      playbooks: ['view'],
      cpd: ['view'],
      settings: [],
      reports: [],
      invites: [],
      regions: [],
      teams: [],
    },
    description: 'Can only view own profile and assigned tasks',
  },
  {
    id: 'team-leader',
    name: 'Mark Thompson',
    email: 'mark.thompson@northfield-me.com',
    role: 'SUPERVISOR',
    jobTitle: 'Team Leader - Electrical',
    regionId: 'region-north-west',
    regionName: 'North West',
    teamId: 'team-electrical-nw',
    teamName: 'Electrical - NW',
    permissions: {
      workers: ['view', 'edit'],
      issues: ['view', 'create', 'edit'],
      templates: ['view'],
      playbooks: ['view'],
      cpd: ['view', 'create', 'edit'],
      settings: [],
      reports: ['view'],
      invites: [],
      regions: [],
      teams: ['view'],
    },
    description: 'Manages their team members only',
  },
  {
    id: 'regional-manager',
    name: 'Emma Watson',
    email: 'emma.watson@northfield-me.com',
    role: 'MANAGER',
    jobTitle: 'Regional Manager - North West',
    regionId: 'region-north-west',
    regionName: 'North West',
    permissions: {
      workers: ['view', 'create', 'edit'],
      issues: ['view', 'create', 'edit', 'manage'],
      templates: ['view', 'create', 'edit'],
      playbooks: ['view', 'create', 'edit'],
      cpd: ['view', 'create', 'edit', 'manage'],
      settings: ['view'],
      reports: ['view', 'create'],
      invites: ['view'],
      regions: ['view'],
      teams: ['view', 'create', 'edit'],
    },
    description: 'Manages all teams and workers in their region',
  },
  {
    id: 'qs',
    name: 'David Chen',
    email: 'david.chen@northfield-me.com',
    role: 'VIEWER',
    jobTitle: 'Quantity Surveyor',
    permissions: {
      workers: ['view'],
      issues: ['view'],
      templates: ['view'],
      playbooks: ['view'],
      cpd: ['view'],
      settings: [],
      reports: ['view'],
      invites: [],
      regions: ['view'],
      teams: ['view'],
    },
    description: 'Read-only access to all workforce data',
  },
  {
    id: 'compliance-manager',
    name: 'Rachel Green',
    email: 'rachel.green@northfield-me.com',
    role: 'MANAGER',
    jobTitle: 'Compliance Manager',
    permissions: {
      workers: ['view'],
      issues: ['view', 'create', 'edit', 'manage'],
      templates: ['view', 'create', 'edit', 'manage'],
      playbooks: ['view', 'create', 'edit', 'manage'],
      cpd: ['view', 'create', 'edit', 'manage'],
      settings: ['view'],
      reports: ['view', 'create'],
      invites: [],
      regions: ['view'],
      teams: ['view'],
    },
    description: 'Manages compliance, training, and playbooks',
  },
  {
    id: 'hs-manager',
    name: 'Michael Brown',
    email: 'michael.brown@northfield-me.com',
    role: 'MANAGER',
    jobTitle: 'H&S Manager',
    permissions: {
      workers: ['view'],
      issues: ['view', 'create', 'edit', 'manage'],
      templates: ['view', 'edit'],
      playbooks: ['view', 'create', 'edit', 'manage'],
      cpd: ['view', 'create', 'edit'],
      settings: [],
      reports: ['view', 'create'],
      invites: [],
      regions: ['view'],
      teams: ['view'],
    },
    description: 'Focuses on safety issues and H&S playbooks',
  },
  {
    id: 'training-manager',
    name: 'Lisa Park',
    email: 'lisa.park@northfield-me.com',
    role: 'MANAGER',
    jobTitle: 'Training Manager',
    permissions: {
      workers: ['view'],
      issues: ['view'],
      templates: ['view', 'create', 'edit', 'manage'],
      playbooks: ['view', 'create', 'edit'],
      cpd: ['view', 'create', 'edit', 'manage'],
      settings: [],
      reports: ['view', 'create'],
      invites: [],
      regions: ['view'],
      teams: ['view'],
    },
    description: 'Manages training programs and CPD records',
  },
  {
    id: 'national-ops',
    name: 'Robert Taylor',
    email: 'robert.taylor@northfield-me.com',
    role: 'MANAGER',
    jobTitle: 'National Operations Manager',
    permissions: {
      workers: ['view', 'create', 'edit'],
      issues: ['view', 'create', 'edit', 'manage'],
      templates: ['view', 'create', 'edit'],
      playbooks: ['view', 'create', 'edit'],
      cpd: ['view', 'create', 'edit'],
      settings: ['view'],
      reports: ['view', 'create', 'manage'],
      invites: ['view'],
      regions: ['view', 'edit'],
      teams: ['view', 'create', 'edit'],
    },
    description: 'Oversees all regions and operations nationwide',
  },
  {
    id: 'hr-manager',
    name: 'Jennifer Adams',
    email: 'jennifer.adams@northfield-me.com',
    role: 'MANAGER',
    jobTitle: 'HR Manager',
    permissions: {
      workers: ['view', 'create', 'edit', 'manage'],
      issues: ['view', 'create', 'edit'],
      templates: ['view', 'create', 'edit'],
      playbooks: ['view'],
      cpd: ['view', 'create', 'edit'],
      settings: ['view'],
      reports: ['view', 'create'],
      invites: ['view', 'create', 'manage'],
      regions: ['view'],
      teams: ['view'],
    },
    description: 'Manages worker profiles, onboarding, and invites',
  },
  {
    id: 'director',
    name: 'William Harris',
    email: 'william.harris@northfield-me.com',
    role: 'ORG_ADMIN',
    jobTitle: 'Managing Director',
    permissions: {
      workers: ['view', 'create', 'edit', 'delete', 'manage'],
      issues: ['view', 'create', 'edit', 'delete', 'manage'],
      templates: ['view', 'create', 'edit', 'delete', 'manage'],
      playbooks: ['view', 'create', 'edit', 'delete', 'manage'],
      cpd: ['view', 'create', 'edit', 'delete', 'manage'],
      settings: ['view', 'edit', 'manage'],
      reports: ['view', 'create', 'manage'],
      invites: ['view', 'create', 'delete', 'manage'],
      regions: ['view', 'create', 'edit', 'delete', 'manage'],
      teams: ['view', 'create', 'edit', 'delete', 'manage'],
    },
    description: 'Full access as company director',
  },
]

interface AccessControlContextType {
  currentPersona: DemoPersona
  availablePersonas: DemoPersona[]
  switchPersona: (personaId: string) => void
  canAccess: (resource: Resource, action: Action) => boolean
  getDataScope: () => DataScope
  isViewingAs: boolean
  resetToDefault: () => void
}

const AccessControlContext = createContext<AccessControlContextType | undefined>(undefined)

export function AccessControlProvider({ children }: { children: ReactNode }) {
  const [currentPersona, setCurrentPersona] = useState<DemoPersona>(DEMO_PERSONAS[0]) // Default to Admin

  // Switch to a different persona
  const switchPersona = useCallback((personaId: string) => {
    const persona = DEMO_PERSONAS.find((p) => p.id === personaId)
    if (persona) {
      setCurrentPersona(persona)
    }
  }, [])

  // Check if current persona can perform action on resource
  const canAccess = useCallback(
    (resource: Resource, action: Action): boolean => {
      const permissions = currentPersona.permissions[resource]
      return permissions?.includes(action) ?? false
    },
    [currentPersona]
  )

  // Get data scope for filtering queries
  const getDataScope = useCallback((): DataScope => {
    // Admin and Director see everything
    if (currentPersona.role === 'ORG_ADMIN') {
      return { type: 'all' }
    }

    // Operative only sees their own data
    if (currentPersona.role === 'OPERATIVE') {
      return {
        type: 'self',
        workerId: currentPersona.workerId,
        teamId: currentPersona.teamId,
        regionId: currentPersona.regionId,
      }
    }

    // Team Leader/Supervisor sees their team
    if (currentPersona.role === 'SUPERVISOR' && currentPersona.teamId) {
      return {
        type: 'team',
        teamId: currentPersona.teamId,
        regionId: currentPersona.regionId,
      }
    }

    // Regional Manager sees their region
    if (currentPersona.regionId && !currentPersona.teamId) {
      return {
        type: 'region',
        regionId: currentPersona.regionId,
      }
    }

    // Default to all for managers without specific scope
    return { type: 'all' }
  }, [currentPersona])

  // Reset to default admin persona
  const resetToDefault = useCallback(() => {
    setCurrentPersona(DEMO_PERSONAS[0])
  }, [])

  // Check if viewing as non-default persona
  const isViewingAs = currentPersona.id !== 'admin'

  const value: AccessControlContextType = {
    currentPersona,
    availablePersonas: DEMO_PERSONAS,
    switchPersona,
    canAccess,
    getDataScope,
    isViewingAs,
    resetToDefault,
  }

  return (
    <AccessControlContext.Provider value={value}>
      {children}
    </AccessControlContext.Provider>
  )
}

export function useAccessControl() {
  const context = useContext(AccessControlContext)
  if (context === undefined) {
    throw new Error('useAccessControl must be used within an AccessControlProvider')
  }
  return context
}
