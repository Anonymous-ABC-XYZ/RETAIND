import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { useAccessControl, type DataScope } from '@/contexts/AccessControlContext'
import { useAuth } from '@/contexts/AuthContext'

interface HybridDataResult<T> {
  data: T | undefined
  isLoading: boolean
  isError: boolean
  error: Error | null
  isUsingDemo: boolean
  refetch: () => void
}

interface UseHybridDataOptions<T, D> {
  queryKey: readonly unknown[]
  queryFn: () => Promise<T>
  demoData: D
  filterFn?: (data: T | D, scope: DataScope) => T | D
  enabled?: boolean
}

/**
 * Generic hook that tries live DB fetch first, then falls back to demo data.
 * Also applies AccessControl scope filters to both live and demo data.
 */
export function useHybridData<T, D = T>({
  queryKey,
  queryFn,
  demoData,
  filterFn,
  enabled = true,
}: UseHybridDataOptions<T, D>): HybridDataResult<T | D> {
  const { currentOrganisation } = useAuth()
  const { getDataScope } = useAccessControl()

  const scope = getDataScope()

  const query = useQuery({
    queryKey,
    queryFn,
    enabled: enabled && !!currentOrganisation,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Determine if we're using demo data
  const isUsingDemo = !query.data || (Array.isArray(query.data) && query.data.length === 0)

  // Get the data source (live or demo)
  const rawData = isUsingDemo ? demoData : query.data

  // Apply scope filter if provided
  const filteredData = filterFn && rawData ? filterFn(rawData, scope) : rawData

  return {
    data: filteredData as T | D,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isUsingDemo,
    refetch: query.refetch,
  }
}

/**
 * Filter workers by data scope
 */
export function filterWorkersByScope<T extends { region_id?: string | null; team_id?: string | null; id?: string }>(
  workers: T[],
  scope: DataScope
): T[] {
  switch (scope.type) {
    case 'all':
      return workers
    case 'region':
      return workers.filter((w) => w.region_id === scope.regionId)
    case 'team':
      return workers.filter((w) => w.team_id === scope.teamId)
    case 'self':
      return workers.filter((w) => w.id === scope.workerId)
    default:
      return workers
  }
}

/**
 * Filter issues by data scope (through worker)
 */
export function filterIssuesByScope<T extends { worker_id?: string; worker?: { region_id?: string | null; team_id?: string | null } }>(
  issues: T[],
  scope: DataScope,
  workersMap?: Map<string, { region_id?: string | null; team_id?: string | null }>
): T[] {
  switch (scope.type) {
    case 'all':
      return issues
    case 'region':
      return issues.filter((i) => {
        const worker = i.worker || workersMap?.get(i.worker_id || '')
        return worker?.region_id === scope.regionId
      })
    case 'team':
      return issues.filter((i) => {
        const worker = i.worker || workersMap?.get(i.worker_id || '')
        return worker?.team_id === scope.teamId
      })
    case 'self':
      return issues.filter((i) => i.worker_id === scope.workerId)
    default:
      return issues
  }
}

import type { Worker, Issue, OnboardingTemplate, Playbook, Region, Team, CpdRecord } from '@/lib/database.types'

type WorkerWithRelations = Worker & {
  team?: { id: string; name: string } | null
  region?: { id: string; name: string } | null
}

type IssueWithWorker = Issue & {
  worker?: { id: string; first_name: string; last_name: string; region_id: string | null; team_id: string | null } | null
}

/**
 * Hook for fetching workers with hybrid data support
 */
export function useWorkersHybrid(orgId: string | undefined) {
  const { getDataScope } = useAccessControl()

  return useQuery<WorkerWithRelations[], Error, WorkerWithRelations[]>({
    queryKey: ['workers', orgId],
    queryFn: async () => {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase
        .from('workers')
        .select(`
          *,
          team:teams(id, name),
          region:regions(id, name)
        `)
        .eq('organisation_id', orgId!)
        .order('last_name', { ascending: true })

      if (error) throw error
      return data as unknown as WorkerWithRelations[]
    },
    enabled: !!orgId,
    select: (data) => {
      const scope = getDataScope()
      return filterWorkersByScope(data, scope)
    },
  })
}

/**
 * Hook for fetching issues with hybrid data support
 */
export function useIssuesHybrid(orgId: string | undefined) {
  const { getDataScope } = useAccessControl()

  return useQuery<IssueWithWorker[], Error, IssueWithWorker[]>({
    queryKey: ['issues', orgId],
    queryFn: async () => {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase
        .from('issues')
        .select(`
          *,
          worker:workers(id, first_name, last_name, region_id, team_id)
        `)
        .eq('organisation_id', orgId!)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as unknown as IssueWithWorker[]
    },
    enabled: !!orgId,
    select: (data) => {
      const scope = getDataScope()
      return filterIssuesByScope(data as any, scope) as IssueWithWorker[]
    },
  })
}

/**
 * Hook for fetching templates
 */
export function useTemplatesHybrid(orgId: string | undefined) {
  return useQuery<OnboardingTemplate[], Error>({
    queryKey: ['templates', orgId],
    queryFn: async () => {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase
        .from('onboarding_templates')
        .select(`
          *,
          tasks:template_tasks(count)
        `)
        .eq('organisation_id', orgId!)
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) throw error
      return data as unknown as OnboardingTemplate[]
    },
    enabled: !!orgId,
  })
}

/**
 * Hook for fetching playbooks
 */
export function usePlaybooksHybrid(orgId: string | undefined) {
  return useQuery<Playbook[], Error>({
    queryKey: ['playbooks', orgId],
    queryFn: async () => {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase
        .from('playbooks')
        .select('*')
        .eq('organisation_id', orgId!)
        .eq('is_published', true)
        .order('title', { ascending: true })

      if (error) throw error
      return data as unknown as Playbook[]
    },
    enabled: !!orgId,
  })
}

/**
 * Hook for fetching regions
 */
export function useRegionsHybrid(orgId: string | undefined) {
  return useQuery<Region[], Error>({
    queryKey: ['regions', orgId],
    queryFn: async () => {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .eq('organisation_id', orgId!)
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) throw error
      return data as unknown as Region[]
    },
    enabled: !!orgId,
  })
}

type TeamWithRegion = Team & {
  region?: { id: string; name: string } | null
  team_leader_id?: string | null
}

/**
 * Hook for fetching teams
 */
export function useTeamsHybrid(orgId: string | undefined) {
  return useQuery<TeamWithRegion[], Error>({
    queryKey: ['teams', orgId],
    queryFn: async () => {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          region:regions(id, name)
        `)
        .eq('organisation_id', orgId!)
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) throw error
      return data as unknown as TeamWithRegion[]
    },
    enabled: !!orgId,
  })
}

/**
 * Hook for fetching dashboard metrics
 */
export function useDashboardMetrics(orgId: string | undefined) {
  return useQuery({
    queryKey: ['dashboardMetrics', orgId],
    queryFn: async () => {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase
        .rpc('get_org_dashboard_metrics', { org_uuid: orgId! } as any)

      if (error) throw error
      return data as {
        total_workers: number
        active_workers: number
        onboarding_workers: number
        probation_workers: number
        at_risk_workers: number
        open_issues: number
        critical_issues: number
        overdue_tasks: number
        risk_distribution: {
          low: number
          medium: number
          high: number
          critical: number
        }
        issues_by_type: Record<string, number>
      }
    },
    enabled: !!orgId,
  })
}
