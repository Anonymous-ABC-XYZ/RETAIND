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
    <aside className="w-64 bg-white border-r border-surface-200 flex flex-col h-full">
      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-surface-200">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-surface-900 flex items-center justify-center shadow-sm">
            <span className="text-white font-display font-bold text-xl">R</span>
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-surface-900">
            RET<span className="text-brand">AI</span>ND
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "sidebar-nav-item",
                isActive && "active"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-surface-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-surface-500 tracking-wider">v1.0.0</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse"></span>
            <span className="text-xs font-medium text-surface-600">Live</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
