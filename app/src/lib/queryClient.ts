import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
})

// Query keys for consistent cache management
export const queryKeys = {
  // Auth & Profile
  profile: (userId: string) => ['profile', userId] as const,
  userOrganisations: (userId: string) => ['userOrganisations', userId] as const,

  // Organisation data
  organisation: (orgId: string) => ['organisation', orgId] as const,
  regions: (orgId: string) => ['regions', orgId] as const,
  teams: (orgId: string) => ['teams', orgId] as const,

  // Workers
  workers: (orgId: string, filters?: Record<string, unknown>) =>
    filters ? ['workers', orgId, filters] as const : ['workers', orgId] as const,
  worker: (workerId: string) => ['worker', workerId] as const,
  workerRisk: (workerId: string) => ['workerRisk', workerId] as const,

  // Onboarding
  templates: (orgId: string) => ['templates', orgId] as const,
  template: (templateId: string) => ['template', templateId] as const,
  templateTasks: (templateId: string) => ['templateTasks', templateId] as const,
  workerOnboarding: (workerId: string) => ['workerOnboarding', workerId] as const,
  assignedTasks: (assignmentId: string) => ['assignedTasks', assignmentId] as const,

  // Issues
  issues: (orgId: string, filters?: Record<string, unknown>) =>
    filters ? ['issues', orgId, filters] as const : ['issues', orgId] as const,
  issue: (issueId: string) => ['issue', issueId] as const,
  issueComments: (issueId: string) => ['issueComments', issueId] as const,
  workerIssues: (workerId: string) => ['workerIssues', workerId] as const,

  // CPD & Training
  cpdRecords: (orgId: string, filters?: Record<string, unknown>) =>
    filters ? ['cpdRecords', orgId, filters] as const : ['cpdRecords', orgId] as const,
  workerCpd: (workerId: string) => ['workerCpd', workerId] as const,

  // Mentor Notes
  mentorNotes: (workerId: string) => ['mentorNotes', workerId] as const,

  // Playbooks
  playbooks: (orgId: string, filters?: Record<string, unknown>) =>
    filters ? ['playbooks', orgId, filters] as const : ['playbooks', orgId] as const,
  playbook: (playbookId: string) => ['playbook', playbookId] as const,

  // Dashboard
  dashboardMetrics: (orgId: string) => ['dashboardMetrics', orgId] as const,

  // Invites
  orgInvites: (orgId: string) => ['orgInvites', orgId] as const,
  pendingInvites: (email: string) => ['pendingInvites', email] as const,
}
