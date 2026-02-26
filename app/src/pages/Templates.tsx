import { ClipboardList, Plus, Clock, CheckSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useAccessControl } from '@/contexts/AccessControlContext'
import { useTemplatesHybrid } from '@/hooks/useHybridData'

export default function Templates() {
  const { currentOrganisation } = useAuth()
  const { canAccess } = useAccessControl()
  const { data: templates, isLoading } = useTemplatesHybrid(currentOrganisation?.id)

  const canCreateTemplate = canAccess('templates', 'create')

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Onboarding Templates</h1>
            <p className="text-muted-foreground">Loading templates...</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-32 animate-pulse bg-slate-100 rounded" />
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Onboarding Templates</h1>
          <p className="text-muted-foreground">
            Manage onboarding programs for new starters
          </p>
        </div>
        {canCreateTemplate && (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Template
          </Button>
        )}
      </div>

      {/* Templates Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates && templates.length > 0 ? (
          templates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <ClipboardList className="h-5 w-5 text-blue-600" />
                  </div>
                  {template.is_default && (
                    <Badge variant="secondary">Default</Badge>
                  )}
                </div>
                <CardTitle className="mt-4">{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{template.duration_days} days</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckSquare className="h-4 w-4" />
                    <span>Tasks included</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    {template.role_type && (
                      <Badge variant="outline">{template.role_type}</Badge>
                    )}
                    {template.trade && (
                      <Badge variant="outline">{template.trade}</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center">
              <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first onboarding template to get started.
              </p>
              {canCreateTemplate && (
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Template
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
