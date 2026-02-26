import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  AlertTriangle,
  BookOpen,
  Award,
  CreditCard,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAccessControl } from '@/contexts/AccessControlContext'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  requiredPermission?: {
    resource: 'workers' | 'issues' | 'templates' | 'playbooks' | 'cpd' | 'settings' | 'reports' | 'invites' | 'regions' | 'teams'
    action: 'view' | 'create' | 'edit' | 'delete' | 'manage'
  }
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/app/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'People',
    href: '/app/people',
    icon: Users,
    requiredPermission: { resource: 'workers', action: 'view' },
  },
  {
    label: 'Templates',
    href: '/app/templates',
    icon: ClipboardList,
    requiredPermission: { resource: 'templates', action: 'view' },
  },
  {
    label: 'Issues',
    href: '/app/issues',
    icon: AlertTriangle,
    requiredPermission: { resource: 'issues', action: 'view' },
  },
  {
    label: 'Playbooks',
    href: '/app/playbooks',
    icon: BookOpen,
    requiredPermission: { resource: 'playbooks', action: 'view' },
  },
  {
    label: 'Certificate',
    href: '/app/certificate',
    icon: Award,
    requiredPermission: { resource: 'workers', action: 'view' },
  },
  {
    label: 'Plans',
    href: '/app/plans',
    icon: CreditCard,
    requiredPermission: { resource: 'settings', action: 'view' },
  },
  {
    label: 'Settings',
    href: '/app/settings',
    icon: Settings,
    requiredPermission: { resource: 'settings', action: 'view' },
  },
]

export function Sidebar() {
  const { canAccess } = useAccessControl()

  // Filter nav items based on permissions
  const visibleNavItems = navItems.filter((item) => {
    if (!item.requiredPermission) return true
    return canAccess(item.requiredPermission.resource, item.requiredPermission.action)
  })

  return (
    <aside className="w-64 border-r bg-slate-50/50 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">R</span>
          </div>
          <span className="font-semibold text-xl">RETAIND</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <p className="text-xs text-muted-foreground text-center">
          RETAIND v1.0.0
        </p>
      </div>
    </aside>
  )
}
