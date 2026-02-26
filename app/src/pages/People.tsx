import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, Plus, X, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/AuthContext'
import { useAccessControl } from '@/contexts/AccessControlContext'
import { useWorkersHybrid, useTeamsHybrid, useRegionsHybrid } from '@/hooks/useHybridData'

const STATUS_COLORS: Record<string, string> = {
  active: 'status-badge-low',
  onboarding: 'bg-blue-50 text-blue-700 border border-blue-200',
  probation: 'status-badge-medium',
  suspended: 'status-badge-critical',
  terminated: 'bg-surface-100 text-surface-600 border border-surface-200',
  resigned: 'bg-surface-100 text-surface-600 border border-surface-200',
}

const RISK_COLORS: Record<string, string> = {
  low: 'status-badge-low',
  medium: 'status-badge-medium',
  high: 'status-badge-high',
  critical: 'status-badge-critical',
}

export default function People() {
  const navigate = useNavigate()
  const { currentOrganisation } = useAuth()
  const { canAccess } = useAccessControl()
  const { data: workers, isLoading } = useWorkersHybrid(currentOrganisation?.id)
  const { data: teams } = useTeamsHybrid(currentOrganisation?.id)
  const { data: regions } = useRegionsHybrid(currentOrganisation?.id)

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [riskFilter, setRiskFilter] = useState<string[]>([])
  const [teamFilter, setTeamFilter] = useState<string[]>([])

  const canCreateWorker = canAccess('workers', 'create')

  // Filter workers
  const filteredWorkers = useMemo(() => {
    if (!workers) return []

    return workers.filter((worker) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch =
        !searchQuery ||
        `${worker.first_name} ${worker.last_name}`.toLowerCase().includes(searchLower) ||
        worker.email?.toLowerCase().includes(searchLower) ||
        worker.job_title.toLowerCase().includes(searchLower) ||
        worker.trade?.toLowerCase().includes(searchLower)

      // Status filter
      const matchesStatus =
        statusFilter.length === 0 || statusFilter.includes(worker.status)

      // Risk filter
      const matchesRisk =
        riskFilter.length === 0 || riskFilter.includes(worker.risk_level)

      // Team filter
      const matchesTeam =
        teamFilter.length === 0 || (worker.team_id && teamFilter.includes(worker.team_id))

      return matchesSearch && matchesStatus && matchesRisk && matchesTeam
    })
  }, [workers, searchQuery, statusFilter, riskFilter, teamFilter])

  const handleRowClick = (workerId: string) => {
    navigate(`/app/people/${workerId}`)
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="dashboard-header">
            <span className="section-num">Workforce</span>
            <h1 className="mt-2">People</h1>
            <p>Loading workers...</p>
          </div>
        </div>
        <div className="chart-card rounded-2xl p-6">
          <div className="h-96 animate-pulse bg-surface-100 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="dashboard-header">
          <span className="section-num">Workforce</span>
          <h1 className="mt-2">People</h1>
          <p>
            Manage your workforce · <span className="font-mono font-medium text-surface-900">{filteredWorkers.length}</span> workers
          </p>
        </div>
        {canCreateWorker && (
          <Button className="btn-brand gap-2 h-11">
            <Plus className="h-4 w-4" />
            Add Worker
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="chart-card rounded-2xl p-5">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
            <Input
              placeholder="Search by name, email, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-11 rounded-xl border-surface-200 bg-surface-50 focus:bg-white focus:border-brand transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={`gap-2 h-11 rounded-xl border-surface-200 hover:border-surface-300 hover:bg-surface-50 ${statusFilter.length > 0 ? 'border-brand bg-brand/5' : ''}`}
                >
                  Status
                  {statusFilter.length > 0 && (
                    <span className="bg-surface-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                      {statusFilter.length}
                    </span>
                  )}
                  <ChevronDown className="h-4 w-4 text-surface-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-xl border-surface-200">
                {['active', 'onboarding', 'probation', 'suspended'].map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={statusFilter.includes(status)}
                    onCheckedChange={(checked) => {
                      setStatusFilter(
                        checked
                          ? [...statusFilter, status]
                          : statusFilter.filter((s) => s !== status)
                      )
                    }}
                    className="rounded-lg"
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Risk Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={`gap-2 h-11 rounded-xl border-surface-200 hover:border-surface-300 hover:bg-surface-50 ${riskFilter.length > 0 ? 'border-brand bg-brand/5' : ''}`}
                >
                  Risk
                  {riskFilter.length > 0 && (
                    <span className="bg-surface-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                      {riskFilter.length}
                    </span>
                  )}
                  <ChevronDown className="h-4 w-4 text-surface-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-xl border-surface-200">
                {['low', 'medium', 'high', 'critical'].map((risk) => (
                  <DropdownMenuCheckboxItem
                    key={risk}
                    checked={riskFilter.includes(risk)}
                    onCheckedChange={(checked) => {
                      setRiskFilter(
                        checked
                          ? [...riskFilter, risk]
                          : riskFilter.filter((r) => r !== risk)
                      )
                    }}
                    className="rounded-lg"
                  >
                    {risk.charAt(0).toUpperCase() + risk.slice(1)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Team Filter */}
            {teams && teams.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={`gap-2 h-11 rounded-xl border-surface-200 hover:border-surface-300 hover:bg-surface-50 ${teamFilter.length > 0 ? 'border-brand bg-brand/5' : ''}`}
                  >
                    Team
                    {teamFilter.length > 0 && (
                      <span className="bg-surface-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                        {teamFilter.length}
                      </span>
                    )}
                    <ChevronDown className="h-4 w-4 text-surface-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-64 overflow-y-auto rounded-xl border-surface-200">
                  {teams.map((team) => (
                    <DropdownMenuCheckboxItem
                      key={team.id}
                      checked={teamFilter.includes(team.id)}
                      onCheckedChange={(checked) => {
                        setTeamFilter(
                          checked
                            ? [...teamFilter, team.id]
                            : teamFilter.filter((t) => t !== team.id)
                        )
                      }}
                      className="rounded-lg"
                    >
                      {team.name}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Clear Filters */}
            {(statusFilter.length > 0 || riskFilter.length > 0 || teamFilter.length > 0) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setStatusFilter([])
                  setRiskFilter([])
                  setTeamFilter([])
                }}
                className="gap-1.5 h-11 rounded-xl text-surface-500 hover:text-surface-900"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Workers Table */}
      <div className="chart-card rounded-2xl overflow-hidden">
        <Table className="data-table">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Risk</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWorkers.length > 0 ? (
              filteredWorkers.map((worker) => {
                const team = teams?.find((t) => t.id === worker.team_id)
                const region = regions?.find((r) => r.id === worker.region_id)

                return (
                  <TableRow
                    key={worker.id}
                    className="cursor-pointer hover:bg-surface-50 transition-colors"
                    onClick={() => handleRowClick(worker.id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface-900 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-display font-semibold text-sm">
                            {worker.first_name?.[0]}{worker.last_name?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-surface-900">
                            {worker.first_name} {worker.last_name}
                          </p>
                          <p className="text-sm text-surface-500">{worker.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-surface-900">{worker.job_title}</p>
                        <p className="text-sm text-surface-500">{worker.trade}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-surface-600">{team?.name || '—'}</TableCell>
                    <TableCell className="text-surface-600">{region?.name || '—'}</TableCell>
                    <TableCell>
                      <span className={`status-badge ${STATUS_COLORS[worker.status] || 'bg-surface-100 text-surface-600'}`}>
                        {worker.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`status-badge ${RISK_COLORS[worker.risk_level] || 'bg-surface-100 text-surface-600'}`}>
                        {worker.risk_level}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16 text-surface-400">
                  {searchQuery || statusFilter.length > 0 || riskFilter.length > 0 || teamFilter.length > 0
                    ? 'No workers match your filters'
                    : 'No workers found'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
