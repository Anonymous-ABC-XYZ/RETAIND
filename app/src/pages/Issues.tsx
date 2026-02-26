import { useState, useMemo } from 'react'
import { AlertTriangle, Plus, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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
import { useIssuesHybrid, useWorkersHybrid } from '@/hooks/useHybridData'
import { format } from 'date-fns'

const SEVERITY_COLORS: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
}

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-purple-100 text-purple-700',
  pending_review: 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-green-100 text-green-700',
  escalated: 'bg-red-100 text-red-700',
  closed: 'bg-gray-100 text-gray-700',
}

export default function Issues() {
  const { currentOrganisation } = useAuth()
  const { canAccess } = useAccessControl()
  const { data: issues, isLoading } = useIssuesHybrid(currentOrganisation?.id)
  const { data: workers } = useWorkersHybrid(currentOrganisation?.id)

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [severityFilter, setSeverityFilter] = useState<string[]>([])
  const [typeFilter, setTypeFilter] = useState<string[]>([])

  const canCreateIssue = canAccess('issues', 'create')

  // Create workers map for quick lookup
  const workersMap = useMemo(() => {
    const map = new Map<string, { first_name: string; last_name: string }>()
    workers?.forEach((w) => map.set(w.id, { first_name: w.first_name, last_name: w.last_name }))
    return map
  }, [workers])

  // Filter issues
  const filteredIssues = useMemo(() => {
    if (!issues) return []

    return issues.filter((issue) => {
      const worker = workersMap.get(issue.worker_id)
      const workerName = worker ? `${worker.first_name} ${worker.last_name}` : ''

      // Search filter
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch =
        !searchQuery ||
        issue.title.toLowerCase().includes(searchLower) ||
        issue.description.toLowerCase().includes(searchLower) ||
        workerName.toLowerCase().includes(searchLower)

      // Status filter
      const matchesStatus =
        statusFilter.length === 0 || statusFilter.includes(issue.status)

      // Severity filter
      const matchesSeverity =
        severityFilter.length === 0 || severityFilter.includes(issue.severity)

      // Type filter
      const matchesType =
        typeFilter.length === 0 || typeFilter.includes(issue.issue_type)

      return matchesSearch && matchesStatus && matchesSeverity && matchesType
    })
  }, [issues, searchQuery, statusFilter, severityFilter, typeFilter, workersMap])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Issues</h1>
            <p className="text-muted-foreground">Loading issues...</p>
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
          <h1 className="text-2xl font-bold">Issues</h1>
          <p className="text-muted-foreground">
            Track and manage workforce issues ({filteredIssues.length} issues)
          </p>
        </div>
        {canCreateIssue && (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Report Issue
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
                placeholder="Search issues..."
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
                {['open', 'in_progress', 'pending_review', 'resolved', 'escalated', 'closed'].map(
                  (status) => (
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
                      {status.replace('_', ' ')}
                    </DropdownMenuCheckboxItem>
                  )
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Severity Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Severity
                  {severityFilter.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {severityFilter.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {['low', 'medium', 'high', 'critical'].map((severity) => (
                  <DropdownMenuCheckboxItem
                    key={severity}
                    checked={severityFilter.includes(severity)}
                    onCheckedChange={(checked) => {
                      setSeverityFilter(
                        checked
                          ? [...severityFilter, severity]
                          : severityFilter.filter((s) => s !== severity)
                      )
                    }}
                  >
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Type Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Type
                  {typeFilter.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {typeFilter.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {[
                  'performance',
                  'attendance',
                  'conduct',
                  'safety',
                  'quality',
                  'training',
                  'documentation',
                  'equipment',
                  'communication',
                ].map((type) => (
                  <DropdownMenuCheckboxItem
                    key={type}
                    checked={typeFilter.includes(type)}
                    onCheckedChange={(checked) => {
                      setTypeFilter(
                        checked
                          ? [...typeFilter, type]
                          : typeFilter.filter((t) => t !== type)
                      )
                    }}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Clear Filters */}
            {(statusFilter.length > 0 ||
              severityFilter.length > 0 ||
              typeFilter.length > 0) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setStatusFilter([])
                  setSeverityFilter([])
                  setTypeFilter([])
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Issues Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Issue</TableHead>
                <TableHead>Worker</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIssues.length > 0 ? (
                filteredIssues.map((issue) => {
                  const worker = workersMap.get(issue.worker_id)

                  return (
                    <TableRow key={issue.id} className="cursor-pointer hover:bg-slate-50">
                      <TableCell>
                        <div>
                          <p className="font-medium">{issue.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {issue.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {worker ? `${worker.first_name} ${worker.last_name}` : 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <span className="capitalize">{issue.issue_type.replace('_', ' ')}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={SEVERITY_COLORS[issue.severity]}>
                          {issue.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[issue.status]}>
                          {issue.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(issue.created_at), 'dd MMM yyyy')}
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {searchQuery ||
                      statusFilter.length > 0 ||
                      severityFilter.length > 0 ||
                      typeFilter.length > 0
                        ? 'No issues match your filters'
                        : 'No issues reported'}
                    </p>
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
