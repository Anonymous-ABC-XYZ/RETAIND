import { useState } from 'react'
import { Building2, MapPin, Users, Plug, Bell, Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { useAccessControl } from '@/contexts/AccessControlContext'
import { useTeamsHybrid, useRegionsHybrid } from '@/hooks/useHybridData'
import { toast } from 'sonner'

const ROLE_LABELS: Record<string, string> = {
  ORG_ADMIN: 'Admin',
  MANAGER: 'Manager',
  TEAM_LEAD: 'Team Lead',
  SUPERVISOR: 'Supervisor',
  WORKER: 'Worker',
}

export default function Settings() {
  const { currentOrganisation, user } = useAuth()
  const { canAccess } = useAccessControl()
  const { data: teams } = useTeamsHybrid(currentOrganisation?.id)
  const { data: regions } = useRegionsHybrid(currentOrganisation?.id)

  const canManageOrg = canAccess('settings', 'update')

  // Mock users for user management tab
  const [orgUsers] = useState([
    { id: '1', email: 'admin@company.com', name: 'John Smith', role: 'ORG_ADMIN', status: 'active' },
    { id: '2', email: 'manager@company.com', name: 'Sarah Jones', role: 'MANAGER', status: 'active' },
    { id: '3', email: 'lead@company.com', name: 'Mike Wilson', role: 'TEAM_LEAD', status: 'active' },
    { id: '4', email: 'worker@company.com', name: 'Emma Brown', role: 'WORKER', status: 'pending' },
  ])

  const handleSave = () => {
    toast.success('Settings saved successfully')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your organisation settings and preferences
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="organization">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="organization" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Organisation</span>
          </TabsTrigger>
          <TabsTrigger value="regions" className="gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Regions & Teams</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Plug className="h-4 w-4" />
            <span className="hidden sm:inline">Integrations</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
        </TabsList>

        {/* Organisation Tab */}
        <TabsContent value="organization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organisation Details</CardTitle>
              <CardDescription>
                Basic information about your organisation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organisation Name</Label>
                  <Input
                    id="orgName"
                    defaultValue={currentOrganisation?.name}
                    disabled={!canManageOrg}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select defaultValue="construction" disabled={!canManageOrg}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="construction">Construction</SelectItem>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="logistics">Logistics</SelectItem>
                      <SelectItem value="utilities">Utilities</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Contact Phone</Label>
                  <Input
                    id="phone"
                    defaultValue="+44 123 456 7890"
                    disabled={!canManageOrg}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Contact Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue="contact@company.com"
                    disabled={!canManageOrg}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  defaultValue="123 Business Park, Manchester, M1 1AA"
                  disabled={!canManageOrg}
                />
              </div>
              {canManageOrg && (
                <Button onClick={handleSave}>Save Changes</Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>
                Customise how your organisation appears
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Organisation Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-indigo-600" />
                  </div>
                  {canManageOrg && (
                    <Button variant="outline">Upload Logo</Button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Brand Color</Label>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded bg-indigo-600" />
                  {canManageOrg && (
                    <Input type="color" defaultValue="#4F46E5" className="w-20 h-10" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regions & Teams Tab */}
        <TabsContent value="regions" className="space-y-6">
          {/* Regions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Regions</span>
                {canManageOrg && (
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Region
                  </Button>
                )}
              </CardTitle>
              <CardDescription>
                Manage geographical regions for your workforce
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Teams</TableHead>
                    <TableHead>Workers</TableHead>
                    {canManageOrg && <TableHead className="w-[100px]">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regions?.map((region) => {
                    const regionTeams = teams?.filter((t) => t.region_id === region.id) || []
                    return (
                      <TableRow key={region.id}>
                        <TableCell className="font-medium">{region.name}</TableCell>
                        <TableCell>{regionTeams.length}</TableCell>
                        <TableCell>-</TableCell>
                        {canManageOrg && (
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="icon">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Teams */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Teams</span>
                {canManageOrg && (
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Team
                  </Button>
                )}
              </CardTitle>
              <CardDescription>
                Organise workers into teams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Leader</TableHead>
                    <TableHead>Workers</TableHead>
                    {canManageOrg && <TableHead className="w-[100px]">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teams?.map((team) => {
                    const region = regions?.find((r) => r.id === team.region_id)
                    return (
                      <TableRow key={team.id}>
                        <TableCell className="font-medium">{team.name}</TableCell>
                        <TableCell>{region?.name || '-'}</TableCell>
                        <TableCell>{team.team_leader_id ? 'Assigned' : 'Unassigned'}</TableCell>
                        <TableCell>-</TableCell>
                        {canManageOrg && (
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="icon">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>User Management</span>
                {canManageOrg && (
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Invite User
                  </Button>
                )}
              </CardTitle>
              <CardDescription>
                Manage users who have access to this organisation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    {canManageOrg && <TableHead className="w-[100px]">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orgUsers.map((orgUser) => (
                    <TableRow key={orgUser.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{orgUser.name}</p>
                          <p className="text-sm text-muted-foreground">{orgUser.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {ROLE_LABELS[orgUser.role] || orgUser.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            orgUser.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }
                        >
                          {orgUser.status}
                        </Badge>
                      </TableCell>
                      {canManageOrg && (
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Integrations</CardTitle>
              <CardDescription>
                Connect RETAIND with your existing tools
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  name: 'CITB Portal',
                  description: 'Sync CSCS card data and training records',
                  connected: true,
                },
                {
                  name: 'Sage HR',
                  description: 'Import employee data from Sage HR',
                  connected: false,
                },
                {
                  name: 'BigChange',
                  description: 'Sync job and workforce data',
                  connected: false,
                },
                {
                  name: 'Procore',
                  description: 'Construction project management integration',
                  connected: false,
                },
              ].map((integration) => (
                <div
                  key={integration.name}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{integration.name}</p>
                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                  </div>
                  {integration.connected ? (
                    <Badge className="bg-green-100 text-green-700">Connected</Badge>
                  ) : (
                    <Button variant="outline" size="sm" disabled={!canManageOrg}>
                      Connect
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Access</CardTitle>
              <CardDescription>
                Access the RETAIND API for custom integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    value="sk_live_xxxxxxxxxxxxxxxxxxxx"
                    readOnly
                    className="font-mono"
                  />
                  <Button variant="outline">Copy</Button>
                  {canManageOrg && <Button variant="outline">Regenerate</Button>}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Keep your API key secure. Do not share it publicly.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Configure when the system sends email notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { id: 'new_issue', label: 'New issue reported', defaultChecked: true },
                { id: 'issue_escalated', label: 'Issue escalated', defaultChecked: true },
                { id: 'onboarding_complete', label: 'Worker completes onboarding', defaultChecked: true },
                { id: 'high_risk', label: 'Worker flagged as high risk', defaultChecked: true },
                { id: 'cert_expiry', label: 'Certificate expiry warning (30 days)', defaultChecked: true },
                { id: 'weekly_digest', label: 'Weekly summary digest', defaultChecked: false },
              ].map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-center justify-between py-2"
                >
                  <Label htmlFor={notification.id} className="cursor-pointer">
                    {notification.label}
                  </Label>
                  <Switch
                    id={notification.id}
                    defaultChecked={notification.defaultChecked}
                    disabled={!canManageOrg}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>In-App Notifications</CardTitle>
              <CardDescription>
                Configure dashboard alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { id: 'task_due', label: 'Task due reminders', defaultChecked: true },
                { id: 'mentions', label: 'When mentioned in notes', defaultChecked: true },
                { id: 'assignments', label: 'New worker assignments', defaultChecked: false },
              ].map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-center justify-between py-2"
                >
                  <Label htmlFor={notification.id} className="cursor-pointer">
                    {notification.label}
                  </Label>
                  <Switch
                    id={notification.id}
                    defaultChecked={notification.defaultChecked}
                    disabled={!canManageOrg}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
