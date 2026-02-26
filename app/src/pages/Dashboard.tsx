import { Users, AlertTriangle, ClipboardList, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
}

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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Loading metrics...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 animate-pulse bg-slate-100 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your workforce.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Workers</p>
                <p className="text-3xl font-bold">{metrics?.total_workers || workers?.length || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {metrics?.active_workers || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">At Risk</p>
                <p className="text-3xl font-bold text-orange-600">
                  {metrics?.at_risk_workers || workers?.filter(w => w.risk_level === 'high' || w.risk_level === 'critical').length || 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Open Issues</p>
                <p className="text-3xl font-bold text-red-600">
                  {metrics?.open_issues || issues?.filter(i => i.status !== 'resolved' && i.status !== 'closed').length || 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {metrics?.critical_issues || 0} critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Onboarding</p>
                <p className="text-3xl font-bold text-green-600">
                  {metrics?.onboarding_workers || workers?.filter(w => w.status === 'onboarding').length || 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <ClipboardList className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {metrics?.overdue_tasks || 0} overdue tasks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
            <CardDescription>Workers by risk level</CardDescription>
          </CardHeader>
          <CardContent>
            {riskDistributionData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {riskDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-4">
                  {riskDistributionData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {item.name}: {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No risk data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Issues by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Issues by Type</CardTitle>
            <CardDescription>Open issues categorised</CardDescription>
          </CardHeader>
          <CardContent>
            {issuesByTypeData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={issuesByTypeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No issues data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Workers */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Workers</CardTitle>
            <CardDescription>Latest additions to your workforce</CardDescription>
          </CardHeader>
          <CardContent>
            {recentWorkers.length > 0 ? (
              <div className="space-y-3">
                {recentWorkers.map((worker) => (
                  <div
                    key={worker.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {worker.first_name} {worker.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">{worker.job_title}</p>
                    </div>
                    <div
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        worker.risk_level === 'low'
                          ? 'bg-green-100 text-green-700'
                          : worker.risk_level === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : worker.risk_level === 'high'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {worker.risk_level}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No workers yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Issues */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Issues</CardTitle>
            <CardDescription>Latest reported issues</CardDescription>
          </CardHeader>
          <CardContent>
            {recentIssues.length > 0 ? (
              <div className="space-y-3">
                {recentIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{issue.title}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {issue.issue_type.replace('_', ' ')}
                      </p>
                    </div>
                    <div
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        issue.severity === 'low'
                          ? 'bg-green-100 text-green-700'
                          : issue.severity === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : issue.severity === 'high'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {issue.severity}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No issues reported</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
