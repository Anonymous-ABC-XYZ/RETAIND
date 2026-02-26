import type { Worker, Issue, OnboardingAssignment } from './database.types'

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export interface RiskResult {
  score: number
  level: RiskLevel
  factors: RiskFactor[]
}

export interface RiskFactor {
  name: string
  points: number
  description: string
}

interface RiskContext {
  issues: Issue[]
  onboarding: OnboardingAssignment | null
  overdueTaskCount: number
  daysEmployed?: number
  certExpiryDays?: number
}

/**
 * Calculate a worker's risk score based on various factors.
 *
 * Risk Scoring System:
 * - Open issues: 5 points each
 * - Critical severity issues: +15 points each
 * - High severity issues: +10 points each
 * - Escalated issues: +10 points each
 * - Incomplete onboarding: up to 25 points
 * - Overdue tasks: 10 points each
 * - Probation period: 5 points
 * - Certificate expiring soon: 5-15 points
 *
 * Risk Levels:
 * - Low: 0-24 points
 * - Medium: 25-49 points
 * - High: 50-74 points
 * - Critical: 75+ points
 */
export function calculateWorkerRisk(
  worker: Worker,
  context: RiskContext
): RiskResult {
  const factors: RiskFactor[] = []
  let totalScore = 0

  // 1. Open Issues (5 points each)
  const openIssues = context.issues.filter(
    (i) => i.status !== 'resolved' && i.status !== 'closed'
  )
  if (openIssues.length > 0) {
    const points = openIssues.length * 5
    totalScore += points
    factors.push({
      name: 'Open Issues',
      points,
      description: `${openIssues.length} open issue(s)`,
    })
  }

  // 2. Critical Severity Issues (+15 points each)
  const criticalIssues = openIssues.filter((i) => i.severity === 'critical')
  if (criticalIssues.length > 0) {
    const points = criticalIssues.length * 15
    totalScore += points
    factors.push({
      name: 'Critical Issues',
      points,
      description: `${criticalIssues.length} critical severity issue(s)`,
    })
  }

  // 3. High Severity Issues (+10 points each)
  const highIssues = openIssues.filter((i) => i.severity === 'high')
  if (highIssues.length > 0) {
    const points = highIssues.length * 10
    totalScore += points
    factors.push({
      name: 'High Severity Issues',
      points,
      description: `${highIssues.length} high severity issue(s)`,
    })
  }

  // 4. Escalated Issues (+10 points each)
  const escalatedIssues = openIssues.filter((i) => i.status === 'escalated')
  if (escalatedIssues.length > 0) {
    const points = escalatedIssues.length * 10
    totalScore += points
    factors.push({
      name: 'Escalated Issues',
      points,
      description: `${escalatedIssues.length} escalated issue(s)`,
    })
  }

  // 5. Onboarding Progress (0-25 points based on incompleteness)
  if (context.onboarding && context.onboarding.status !== 'completed') {
    const incompleteness = 100 - (context.onboarding.progress_percentage || 0)
    const points = Math.floor(incompleteness / 4) // Max 25 points
    if (points > 0) {
      totalScore += points
      factors.push({
        name: 'Incomplete Onboarding',
        points,
        description: `${context.onboarding.progress_percentage || 0}% complete`,
      })
    }
  }

  // 6. Overdue Tasks (10 points each)
  if (context.overdueTaskCount > 0) {
    const points = context.overdueTaskCount * 10
    totalScore += points
    factors.push({
      name: 'Overdue Tasks',
      points,
      description: `${context.overdueTaskCount} overdue task(s)`,
    })
  }

  // 7. Probation Period (5 points)
  if (worker.status === 'probation') {
    const points = 5
    totalScore += points
    factors.push({
      name: 'Probation Period',
      points,
      description: 'Worker is on probation',
    })
  }

  // 8. New Starter (first 30 days) (3 points)
  if (context.daysEmployed !== undefined && context.daysEmployed < 30) {
    const points = 3
    totalScore += points
    factors.push({
      name: 'New Starter',
      points,
      description: `${context.daysEmployed} days employed`,
    })
  }

  // 9. Certificate Expiring Soon
  if (context.certExpiryDays !== undefined) {
    let points = 0
    let description = ''

    if (context.certExpiryDays <= 0) {
      points = 20
      description = 'Certificate expired'
    } else if (context.certExpiryDays <= 30) {
      points = 15
      description = `Certificate expiring in ${context.certExpiryDays} days`
    } else if (context.certExpiryDays <= 60) {
      points = 10
      description = `Certificate expiring in ${context.certExpiryDays} days`
    } else if (context.certExpiryDays <= 90) {
      points = 5
      description = `Certificate expiring in ${context.certExpiryDays} days`
    }

    if (points > 0) {
      totalScore += points
      factors.push({
        name: 'Certificate Expiry',
        points,
        description,
      })
    }
  }

  // Cap score at 100
  totalScore = Math.min(totalScore, 100)

  // Determine risk level
  const level = getRiskLevel(totalScore)

  return {
    score: totalScore,
    level,
    factors,
  }
}

/**
 * Get the risk level based on score
 */
export function getRiskLevel(score: number): RiskLevel {
  if (score >= 75) return 'critical'
  if (score >= 50) return 'high'
  if (score >= 25) return 'medium'
  return 'low'
}

/**
 * Get the color class for a risk level
 */
export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'critical':
      return 'bg-red-100 text-red-700 border-red-300'
    case 'high':
      return 'bg-orange-100 text-orange-700 border-orange-300'
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-300'
    case 'low':
      return 'bg-green-100 text-green-700 border-green-300'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300'
  }
}

/**
 * Get a risk assessment summary for a worker
 */
export function getRiskSummary(result: RiskResult): string {
  if (result.factors.length === 0) {
    return 'No risk factors identified.'
  }

  const topFactors = result.factors
    .sort((a, b) => b.points - a.points)
    .slice(0, 3)
    .map((f) => f.name)
    .join(', ')

  return `Risk driven by: ${topFactors}`
}

/**
 * Calculate days until a certificate expires
 */
export function getCertExpiryDays(expiryDate: string | null): number | undefined {
  if (!expiryDate) return undefined

  const expiry = new Date(expiryDate)
  const today = new Date()
  const diffTime = expiry.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

/**
 * Calculate days since employment started
 */
export function getDaysEmployed(startDate: string): number {
  const start = new Date(startDate)
  const today = new Date()
  const diffTime = today.getTime() - start.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

/**
 * Batch calculate risk for multiple workers
 */
export function calculateBatchRisk(
  workers: Worker[],
  issuesByWorker: Map<string, Issue[]>,
  onboardingByWorker: Map<string, OnboardingAssignment | null>,
  overdueTasksByWorker: Map<string, number>
): Map<string, RiskResult> {
  const results = new Map<string, RiskResult>()

  for (const worker of workers) {
    const context: RiskContext = {
      issues: issuesByWorker.get(worker.id) || [],
      onboarding: onboardingByWorker.get(worker.id) || null,
      overdueTaskCount: overdueTasksByWorker.get(worker.id) || 0,
      daysEmployed: getDaysEmployed(worker.start_date),
      certExpiryDays: getCertExpiryDays(worker.cscs_expiry_date),
    }

    results.set(worker.id, calculateWorkerRisk(worker, context))
  }

  return results
}
