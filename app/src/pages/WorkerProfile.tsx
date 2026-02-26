import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, Calendar, MapPin, AlertTriangle, Award, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/AuthContext'
import { useWorkersHybrid, useIssuesHybrid } from '@/hooks/useHybridData'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  onboarding: 'bg-blue-100 text-blue-700',
  probation: 'bg-yellow-100 text-yellow-700',
  suspended: 'bg-red-100 text-red-700',
  terminated: 'bg-gray-100 text-gray-700',
  resigned: 'bg-gray-100 text-gray-700',
}

const RISK_COLORS: Record<string, string> = {
  low: 'bg-green-100 text-green-700 border-green-300',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  high: 'bg-orange-100 text-orange-700 border-orange-300',
  critical: 'bg-red-100 text-red-700 border-red-300',
}

export default function WorkerProfile() {
  const { workerId } = useParams<{ workerId: string }>()
  const navigate = useNavigate()
  const { currentOrganisation } = useAuth()
  const { data: workers } = useWorkersHybrid(currentOrganisation?.id)
  const { data: allIssues } = useIssuesHybrid(currentOrganisation?.id)

  const worker = workers?.find((w) => w.id === workerId)
  const workerIssues = allIssues?.filter((i) => i.worker_id === workerId) || []

  // Define types for CPD records
  type CpdRecordType = {
    id: string
    title: string
    provider: string | null
    category: string | null
    start_date: string
    hours_completed: number | null
  }

  // Fetch CPD records for this worker
  const { data: cpdRecords } = useQuery<CpdRecordType[]>({
    queryKey: ['workerCpd', workerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cpd_records')
        .select('*')
        .eq('worker_id', workerId!)
        .order('start_date', { ascending: false })

      if (error) throw error
      return data as unknown as CpdRecordType[]
    },
    enabled: !!workerId,
  })

  // Define types for onboarding assignment
  type OnboardingAssignmentType = {
    id: string
    progress_percentage: number
    template?: { name: string } | null
    tasks?: { id: string; status: string; due_date: string }[] | null
  }

  // Fetch onboarding assignment for this worker
  const { data: onboarding } = useQuery<OnboardingAssignmentType | null>({
    queryKey: ['workerOnboarding', workerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('onboarding_assignments')
        .select(`
          *,
          template:onboarding_templates(name),
          tasks:assigned_tasks(*)
        `)
        .eq('worker_id', workerId!)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data as unknown as OnboardingAssignmentType | null
    },
    enabled: !!workerId,
  })

  if (!worker) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/app/people')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to People
        </Button>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Worker not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate('/app/people')} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to People
      </Button>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar and basic info */}
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {getInitials(worker.first_name, worker.last_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">
                  {worker.first_name} {worker.last_name}
                </h1>
                <p className="text-lg text-muted-foreground">{worker.job_title}</p>
                <div className="flex gap-2 mt-2">
                  <Badge className={STATUS_COLORS[worker.status]}>{worker.status}</Badge>
                  <Badge variant="outline">{worker.employment_type.replace('_', ' ')}</Badge>
                </div>
              </div>
            </div>

            {/* Risk Score */}
            <div className="md:ml-auto">
              <div className={`p-4 rounded-lg border-2 ${RISK_COLORS[worker.risk_level]}`}>
                <p className="text-sm font-medium">Risk Score</p>
                <p className="text-3xl font-bold">{worker.risk_score}</p>
                <p className="text-sm capitalize">{worker.risk_level} risk</p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{worker.email || 'No email'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{worker.phone || 'No phone'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Started {format(new Date(worker.start_date), 'dd MMM yyyy')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{worker.trade || 'No trade specified'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="issues">Issues ({workerIssues.length})</TabsTrigger>
          <TabsTrigger value="training">CPD & Training</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Employment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Employee Number</span>
                  <span className="font-medium">{worker.employee_number || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Employment Type</span>
                  <span className="font-medium capitalize">
                    {worker.employment_type.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Start Date</span>
                  <span className="font-medium">
                    {format(new Date(worker.start_date), 'dd MMM yyyy')}
                  </span>
                </div>
                {worker.probation_end_date && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Probation End</span>
                    <span className="font-medium">
                      {format(new Date(worker.probation_end_date), 'dd MMM yyyy')}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Certifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CSCS Card Type</span>
                  <span className="font-medium">{worker.cscs_card_type || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CSCS Card Number</span>
                  <span className="font-medium">{worker.cscs_card_number || '-'}</span>
                </div>
                {worker.cscs_expiry_date && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CSCS Expiry</span>
                    <span className="font-medium">
                      {format(new Date(worker.cscs_expiry_date), 'dd MMM yyyy')}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onboarding Tab */}
        <TabsContent value="onboarding">
          <Card>
            <CardHeader>
              <CardTitle>Onboarding Progress</CardTitle>
              <CardDescription>
                {onboarding
                  ? `Assigned to: ${onboarding.template?.name}`
                  : 'No onboarding assignment'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {onboarding ? (
                <div className="space-y-6">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span className="font-medium">{onboarding.progress_percentage}%</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${onboarding.progress_percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Tasks List */}
                  <div className="space-y-2">
                    {onboarding.tasks?.map((task: { id: string; status: string; due_date: string }) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <span className={task.status === 'completed' ? 'line-through text-muted-foreground' : ''}>
                          Task
                        </span>
                        <Badge
                          className={
                            task.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : task.status === 'overdue'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-blue-100 text-blue-700'
                          }
                        >
                          {task.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No onboarding program assigned
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Issues Tab */}
        <TabsContent value="issues">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              {workerIssues.length > 0 ? (
                <div className="space-y-3">
                  {workerIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{issue.title}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {issue.issue_type.replace('_', ' ')} • {format(new Date(issue.created_at), 'dd MMM yyyy')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge
                          className={
                            issue.severity === 'critical'
                              ? 'bg-red-100 text-red-700'
                              : issue.severity === 'high'
                              ? 'bg-orange-100 text-orange-700'
                              : issue.severity === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }
                        >
                          {issue.severity}
                        </Badge>
                        <Badge variant="outline">{issue.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No issues recorded</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="training">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                CPD & Training Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cpdRecords && cpdRecords.length > 0 ? (
                <div className="space-y-3">
                  {cpdRecords.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{record.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {record.provider} • {record.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {format(new Date(record.start_date), 'dd MMM yyyy')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {record.hours_completed} hours
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No training records</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
