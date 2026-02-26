import { Check, Zap, Building2, Rocket, Users, HardDrive, FileText, Headphones } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/AuthContext'
import { useWorkersHybrid } from '@/hooks/useHybridData'

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    description: 'Perfect for small teams getting started',
    icon: Zap,
    features: [
      'Up to 25 workers',
      '3 onboarding templates',
      'Basic issue tracking',
      'Email support',
      '1 GB storage',
    ],
    limits: {
      workers: 25,
      templates: 3,
      storage: 1,
    },
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 149,
    description: 'For growing teams with advanced needs',
    icon: Building2,
    popular: true,
    features: [
      'Up to 100 workers',
      'Unlimited templates',
      'Advanced analytics',
      'Priority support',
      '10 GB storage',
      'Custom branding',
      'API access',
    ],
    limits: {
      workers: 100,
      templates: -1,
      storage: 10,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 399,
    description: 'For large organisations with complex requirements',
    icon: Rocket,
    features: [
      'Unlimited workers',
      'Unlimited templates',
      'Custom integrations',
      'Dedicated support',
      'Unlimited storage',
      'SSO & SAML',
      'Audit logs',
      'SLA guarantee',
    ],
    limits: {
      workers: -1,
      templates: -1,
      storage: -1,
    },
  },
]

export default function Plans() {
  const { currentOrganisation } = useAuth()
  const { data: workers } = useWorkersHybrid(currentOrganisation?.id)

  // Demo current plan - in real app, this would come from org data
  const currentPlan = PLANS[1] // Professional plan
  const workerCount = workers?.length || 0
  const storageUsed = 2.4 // GB - demo value
  const templatesUsed = 5 // demo value

  const workerUsagePercent = currentPlan.limits.workers > 0
    ? (workerCount / currentPlan.limits.workers) * 100
    : 0
  const storageUsagePercent = currentPlan.limits.storage > 0
    ? (storageUsed / currentPlan.limits.storage) * 100
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Plans & Usage</h1>
        <p className="text-muted-foreground">
          Manage your subscription and monitor resource usage
        </p>
      </div>

      {/* Current Plan & Usage */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Current Plan</span>
              <Badge className="bg-indigo-100 text-indigo-700">{currentPlan.name}</Badge>
            </CardTitle>
            <CardDescription>
              Your organisation is on the {currentPlan.name} plan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">${currentPlan.price}</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-sm text-muted-foreground">{currentPlan.description}</p>
            <Button variant="outline" className="w-full">
              Manage Subscription
            </Button>
          </CardContent>
        </Card>

        {/* Usage Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Resource Usage</CardTitle>
            <CardDescription>Current billing period usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Workers */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Active Workers</span>
                </div>
                <span className="font-medium">
                  {workerCount} / {currentPlan.limits.workers === -1 ? '∞' : currentPlan.limits.workers}
                </span>
              </div>
              {currentPlan.limits.workers > 0 && (
                <Progress value={workerUsagePercent} className="h-2" />
              )}
            </div>

            {/* Storage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span>Storage</span>
                </div>
                <span className="font-medium">
                  {storageUsed} GB / {currentPlan.limits.storage === -1 ? '∞' : `${currentPlan.limits.storage} GB`}
                </span>
              </div>
              {currentPlan.limits.storage > 0 && (
                <Progress value={storageUsagePercent} className="h-2" />
              )}
            </div>

            {/* Templates */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>Templates</span>
                </div>
                <span className="font-medium">
                  {templatesUsed} / {currentPlan.limits.templates === -1 ? '∞' : currentPlan.limits.templates}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Plans */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const Icon = plan.icon
            const isCurrent = plan.id === currentPlan.id

            return (
              <Card
                key={plan.id}
                className={`relative ${plan.popular ? 'border-indigo-500 border-2' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-indigo-600">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-indigo-600" />
                    </div>
                    {isCurrent && <Badge variant="secondary">Current</Badge>}
                  </div>
                  <CardTitle className="mt-4">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>

                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={isCurrent ? 'outline' : plan.popular ? 'default' : 'outline'}
                    disabled={isCurrent}
                  >
                    {isCurrent ? 'Current Plan' : 'Upgrade'}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Support & Help */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Headphones className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Need help choosing?</h3>
                <p className="text-sm text-muted-foreground">
                  Our team can help you find the right plan for your organisation
                </p>
              </div>
            </div>
            <Button variant="outline">Contact Sales</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
