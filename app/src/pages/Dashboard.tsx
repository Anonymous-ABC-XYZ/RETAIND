import { Users, AlertTriangle, ClipboardList, TrendingUp, ArrowUpRight, Sparkles } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useDashboardMetrics, useWorkersHybrid, useIssuesHybrid } from '@/hooks/useHybridData'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const RISK_COLORS = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#f97316',
  critical: '#ef4444',
}

const BRAND_COLOR = '#a9ed42'

export default function Dashboard() {
  const { currentOrganisation } = useAuth()
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics(currentOrganisation?.id)
  const { data: workers } = useWorkersHybrid(currentOrganisation?.id)
  const { data: issues } = useIssuesHybrid(currentOrganisation?.id)

  // Prepare chart data
  const riskDistributionData = metrics?.risk_distribution
    ? [
        { name: 'Low', value: metrics.risk_distribution.low, color: RISK_COLORS.low },
        { name: 'Medium', value: metrics.risk_distribution.medium, color: RISK_COLORS.medium },
        { name: 'High', value: metrics.risk_distribution.high, color: RISK_COLORS.high },
        { name: 'Critical', value: metrics.risk_distribution.critical, color: RISK_COLORS.critical },
      ]
    : []

  const issuesByTypeData = metrics?.issues_by_type
    ? Object.entries(metrics.issues_by_type).map(([type, count]) => ({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        count,
      }))
    : []

  // Get recent activity from workers and issues
  const recentWorkers = workers?.slice(0, 5) || []
  const recentIssues = issues?.slice(0, 5) || []

  if (metricsLoading) {
    return (
      <div className="space-y-8">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Loading metrics...</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="metric-card p-6 card-animate">
              <div className="h-24 animate-pulse bg-surface-100 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="dashboard-header">
        <div className="flex items-center gap-3 mb-1">
          <span className="section-num">Overview</span>
        </div>
        <h1>Dashboard</h1>
        <p>
          Welcome back! Here's an overview of your workforce.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Workers */}
        <div className="metric-card p-6 card-animate">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-surface-500 uppercase tracking-wide">Total Workers</p>
              <p className="metric-value text-4xl mt-2 text-surface-900">{metrics?.total_workers || workers?.length || 0}</p>
              <div className="flex items-center gap-1.5 mt-3">
                <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-dark bg-brand/10 px-2 py-1 rounded-full">
                  <Sparkles className="h-3 w-3" />
                  {metrics?.active_workers || 0} active
                </span>
              </div>
            </div>
            <div className="metric-icon metric-icon-brand">
              <Users className="h-6 w-6 text-brand-dark" />
            </div>
          </div>
        </div>

        {/* At Risk */}
        <div className="metric-card p-6 card-animate">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-surface-500 uppercase tracking-wide">At Risk</p>
              <p className="metric-value text-4xl mt-2 text-orange-600">
                {metrics?.at_risk_workers || workers?.filter(w => w.risk_level === 'high' || w.risk_level === 'critical').length || 0}
              </p>
              <div className="flex items-center gap-1.5 mt-3">
                <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-700 bg-orange-50 px-2 py-1 rounded-full">
                  <AlertTriangle className="h-3 w-3" />
                  Requires attention
                </span>
              </div>
            </div>
            <div className="metric-icon bg-orange-50">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Open Issues */}
        <div className="metric-card p-6 card-animate">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-surface-500 uppercase tracking-wide">Open Issues</p>
              <p className="metric-value text-4xl mt-2 text-red-600">
                {metrics?.open_issues || issues?.filter(i => i.status !== 'resolved' && i.status !== 'closed').length || 0}
              </p>
              <div className="flex items-center gap-1.5 mt-3">
                <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2 py-1 rounded-full">
                  {metrics?.critical_issues || 0} critical
                </span>
              </div>
            </div>
            <div className="metric-icon bg-red-50">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* In Onboarding */}
        <div className="metric-card p-6 card-animate">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-surface-500 uppercase tracking-wide">Onboarding</p>
              <p className="metric-value text-4xl mt-2 text-emerald-600">
                {metrics?.onboarding_workers || workers?.filter(w => w.status === 'onboarding').length || 0}
              </p>
              <div className="flex items-center gap-1.5 mt-3">
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                  {metrics?.overdue_tasks || 0} overdue tasks
                </span>
              </div>
            </div>
            <div className="metric-icon bg-emerald-50">
              <ClipboardList className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Risk Distribution */}
        <div className="chart-card rounded-2xl overflow-hidden card-animate">
          <div className="p-6 border-b border-surface-100">
            <h3 className="font-display font-semibold text-lg text-surface-900">Risk Distribution</h3>
            <p className="text-sm text-surface-500 mt-0.5">Workers by risk level</p>
          </div>
          <div className="p-6">
            {riskDistributionData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {riskDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'white',
                        border: '1px solid #e5e5e5',
                        borderRadius: '12px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                        padding: '10px 14px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center flex-wrap gap-4 mt-4">
                  {riskDistributionData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium text-surface-600">
                        {item.name}
                      </span>
                      <span className="text-sm font-mono text-surface-400">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-surface-400">
                No risk data available
              </div>
            )}
          </div>
        </div>

        {/* Issues by Type */}
        <div className="chart-card rounded-2xl overflow-hidden card-animate">
          <div className="p-6 border-b border-surface-100">
            <h3 className="font-display font-semibold text-lg text-surface-900">Issues by Type</h3>
            <p className="text-sm text-surface-500 mt-0.5">Open issues categorised</p>
          </div>
          <div className="p-6">
            {issuesByTypeData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={issuesByTypeData} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: '#737373' }}
                      tickLine={false}
                      axisLine={{ stroke: '#e5e5e5' }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#737373' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'white',
                        border: '1px solid #e5e5e5',
                        borderRadius: '12px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                        padding: '10px 14px',
                      }}
                    />
                    <Bar dataKey="count" fill={BRAND_COLOR} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-surface-400">
                No issues data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Workers */}
        <div className="chart-card rounded-2xl overflow-hidden card-animate">
          <div className="p-6 border-b border-surface-100 flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-lg text-surface-900">Recent Workers</h3>
              <p className="text-sm text-surface-500 mt-0.5">Latest additions to your workforce</p>
            </div>
            <button className="flex items-center gap-1 text-sm font-medium text-surface-500 hover:text-surface-900 transition-colors">
              View all
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4">
            {recentWorkers.length > 0 ? (
              <div className="space-y-2">
                {recentWorkers.map((worker) => (
                  <div
                    key={worker.id}
                    className="activity-item flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-surface-900 flex items-center justify-center">
                        <span className="text-white font-display font-semibold text-sm">
                          {worker.first_name?.[0]}{worker.last_name?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-surface-900">
                          {worker.first_name} {worker.last_name}
                        </p>
                        <p className="text-sm text-surface-500">{worker.job_title}</p>
                      </div>
                    </div>
                    <span className={`status-badge status-badge-${worker.risk_level}`}>
                      {worker.risk_level}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-surface-400 text-center py-12">No workers yet</p>
            )}
          </div>
        </div>

        {/* Recent Issues */}
        <div className="chart-card rounded-2xl overflow-hidden card-animate">
          <div className="p-6 border-b border-surface-100 flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-lg text-surface-900">Recent Issues</h3>
              <p className="text-sm text-surface-500 mt-0.5">Latest reported issues</p>
            </div>
            <button className="flex items-center gap-1 text-sm font-medium text-surface-500 hover:text-surface-900 transition-colors">
              View all
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4">
            {recentIssues.length > 0 ? (
              <div className="space-y-2">
                {recentIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="activity-item flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-surface-100 flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-surface-500" />
                      </div>
                      <div>
                        <p className="font-medium text-surface-900">{issue.title}</p>
                        <p className="text-sm text-surface-500 capitalize">
                          {issue.issue_type.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <span className={`status-badge status-badge-${issue.severity}`}>
                      {issue.severity}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-surface-400 text-center py-12">No issues reported</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
