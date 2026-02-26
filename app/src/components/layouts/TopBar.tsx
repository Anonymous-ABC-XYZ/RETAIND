import { Eye, ChevronDown, User, LogOut, Settings, Building2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/AuthContext'
import { useAccessControl } from '@/contexts/AccessControlContext'
import { cn } from '@/lib/utils'

export function TopBar() {
  const navigate = useNavigate()
  const { profile, currentOrganisation, memberships, switchOrganisation, signOut } = useAuth()
  const { currentPersona, availablePersonas, switchPersona, isViewingAs } = useAccessControl()

  const handleSignOut = async () => {
    await signOut()
    navigate('/signin')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ORG_ADMIN':
        return 'bg-brand/15 text-surface-900 border border-brand/30'
      case 'MANAGER':
        return 'bg-blue-50 text-blue-700 border border-blue-200'
      case 'SUPERVISOR':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      case 'OPERATIVE':
        return 'bg-amber-50 text-amber-700 border border-amber-200'
      case 'VIEWER':
        return 'bg-surface-100 text-surface-600 border border-surface-200'
      default:
        return 'bg-surface-100 text-surface-600 border border-surface-200'
    }
  }

  return (
    <header className={cn(
      "h-20 bg-white/80 backdrop-blur-sm border-b border-surface-200 flex items-center justify-between px-6 transition-all",
      isViewingAs && "border-b-2 border-b-brand"
    )}>
      {/* Left side - Organization switcher */}
      <div className="flex items-center gap-4">
        {memberships.length > 1 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 h-10 px-3 rounded-xl hover:bg-surface-100">
                <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-surface-600" />
                </div>
                <span className="font-display font-semibold text-surface-900">{currentOrganisation?.name}</span>
                <ChevronDown className="h-4 w-4 text-surface-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 rounded-xl border-surface-200 shadow-lg">
              <DropdownMenuLabel className="text-xs uppercase tracking-wider text-surface-500 font-medium">Switch Organisation</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-surface-100" />
              {memberships.map((membership) => (
                <DropdownMenuItem
                  key={membership.organisation.id}
                  onClick={() => switchOrganisation(membership.organisation.id)}
                  className={cn(
                    "rounded-lg cursor-pointer",
                    membership.organisation.id === currentOrganisation?.id && "bg-brand/10"
                  )}
                >
                  {membership.organisation.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-surface-600" />
            </div>
            <span className="font-display font-semibold text-surface-900">{currentOrganisation?.name}</span>
          </div>
        )}
      </div>

      {/* Right side - View-As selector and user menu */}
      <div className="flex items-center gap-3">
        {/* View-As Selector */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "gap-2 h-10 rounded-xl border-surface-200 hover:border-surface-300 hover:bg-surface-50 transition-all",
                isViewingAs && "bg-brand/10 border-brand/30 hover:bg-brand/15"
              )}
            >
              <Eye className="h-4 w-4 text-surface-500" />
              <span className="hidden sm:inline text-surface-600 font-medium">View as:</span>
              <span className="font-semibold text-surface-900">{currentPersona.name}</span>
              <Badge
                variant="secondary"
                className={cn("ml-1 text-xs rounded-md px-2 py-0.5", getRoleBadgeColor(currentPersona.role))}
              >
                {currentPersona.role.replace('_', ' ')}
              </Badge>
              <ChevronDown className="h-4 w-4 text-surface-400" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 rounded-xl border-surface-200 shadow-xl p-0" align="end">
            <div className="p-4 border-b border-surface-100">
              <p className="font-display font-semibold text-surface-900">Switch Demo Account</p>
              <p className="text-sm text-surface-500 mt-0.5">
                View the app as different user roles
              </p>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {availablePersonas.map((persona) => (
                <button
                  key={persona.id}
                  onClick={() => switchPersona(persona.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-xl transition-all",
                    currentPersona.id === persona.id
                      ? "bg-brand/10 border border-brand/20"
                      : "hover:bg-surface-50 border border-transparent"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-surface-900">{persona.name}</span>
                    <Badge
                      variant="secondary"
                      className={cn("text-xs rounded-md px-2 py-0.5", getRoleBadgeColor(persona.role))}
                    >
                      {persona.role.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="text-sm text-surface-500 mt-1">
                    {persona.jobTitle}
                    {persona.regionName && ` · ${persona.regionName}`}
                    {persona.teamName && ` · ${persona.teamName}`}
                  </div>
                  <div className="text-xs text-surface-400 mt-1.5 leading-relaxed">
                    {persona.description}
                  </div>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 h-10 pl-2 pr-3 rounded-xl hover:bg-surface-100">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="bg-surface-900 text-white font-display font-semibold text-sm rounded-lg">
                  {profile?.full_name ? getInitials(profile.full_name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm font-medium text-surface-700">
                {profile?.full_name || profile?.email}
              </span>
              <ChevronDown className="h-4 w-4 text-surface-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 rounded-xl border-surface-200 shadow-lg">
            <DropdownMenuLabel className="text-xs uppercase tracking-wider text-surface-500 font-medium">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-surface-100" />
            <DropdownMenuItem onClick={() => navigate('/app/account')} className="rounded-lg cursor-pointer">
              <User className="h-4 w-4 mr-2 text-surface-500" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/app/settings')} className="rounded-lg cursor-pointer">
              <Settings className="h-4 w-4 mr-2 text-surface-500" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-surface-100" />
            <DropdownMenuItem onClick={handleSignOut} className="rounded-lg cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
