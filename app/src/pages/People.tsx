import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, Plus } from 'lucide-react'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { useAccessControl } from '@/contexts/AccessControlContext'
import { useWorkersHybrid, useTeamsHybrid, useRegionsHybrid } from '@/hooks/useHybridData'

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  onboarding: 'bg-blue-100 text-blue-700',
  probation: 'bg-yellow-100 text-yellow-700',
  suspended: 'bg-red-100 text-red-700',
  terminated: 'bg-gray-100 text-gray-700',
  resigned: 'bg-gray-100 text-gray-700',
}

const RISK_COLORS: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">People</h1>
            <p className="text-muted-foreground">Loading workers...</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="h-96 animate-pulse bg-slate-100 rounded" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">People</h1>
          <p className="text-muted-foreground">
            Manage your workforce ({filteredWorkers.length} workers)
          </p>
        </div>
        {canCreateWorker && (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Worker
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Status
                  {statusFilter.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {statusFilter.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
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
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Risk Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Risk
                  {riskFilter.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {riskFilter.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
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
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Team
                    {teamFilter.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {teamFilter.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-64 overflow-y-auto">
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
              >
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Workers Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
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
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() => handleRowClick(worker.id)}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {worker.first_name} {worker.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">{worker.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{worker.job_title}</p>
                          <p className="text-sm text-muted-foreground">{worker.trade}</p>
                        </div>
                      </TableCell>
                      <TableCell>{team?.name || '-'}</TableCell>
                      <TableCell>{region?.name || '-'}</TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[worker.status] || 'bg-gray-100'}>
                          {worker.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={RISK_COLORS[worker.risk_level] || 'bg-gray-100'}>
                          {worker.risk_level}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {searchQuery || statusFilter.length > 0 || riskFilter.length > 0 || teamFilter.length > 0
                      ? 'No workers match your filters'
                      : 'No workers found'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
