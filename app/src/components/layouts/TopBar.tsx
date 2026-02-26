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
        return 'bg-purple-100 text-purple-800'
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800'
      case 'SUPERVISOR':
        return 'bg-green-100 text-green-800'
      case 'OPERATIVE':
        return 'bg-orange-100 text-orange-800'
      case 'VIEWER':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <header className={cn(
      "h-16 border-b bg-white flex items-center justify-between px-6",
      isViewingAs && "border-b-2 border-b-amber-400"
    )}>
      {/* Left side - Organization switcher */}
      <div className="flex items-center gap-4">
        {memberships.length > 1 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <Building2 className="h-4 w-4" />
                <span className="font-medium">{currentOrganisation?.name}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Switch Organisation</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {memberships.map((membership) => (
                <DropdownMenuItem
                  key={membership.organisation.id}
                  onClick={() => switchOrganisation(membership.organisation.id)}
                  className={cn(
                    membership.organisation.id === currentOrganisation?.id && "bg-accent"
                  )}
                >
                  {membership.organisation.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2 text-sm font-medium">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            {currentOrganisation?.name}
          </div>
        )}
      </div>

      {/* Right side - View-As selector and user menu */}
      <div className="flex items-center gap-4">
        {/* View-As Selector */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={isViewingAs ? "default" : "outline"}
              className={cn(
                "gap-2",
                isViewingAs && "bg-amber-500 hover:bg-amber-600"
              )}
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">View as:</span>
              <span className="font-medium">{currentPersona.name}</span>
              <Badge
                variant="secondary"
                className={cn("ml-1 text-xs", getRoleBadgeColor(currentPersona.role))}
              >
                {currentPersona.role.replace('_', ' ')}
              </Badge>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-3">
              <div className="border-b pb-2">
                <p className="font-semibold">Switch Demo Account</p>
                <p className="text-xs text-muted-foreground">
                  View the app as different user roles
                </p>
              </div>
              <div className="max-h-80 overflow-y-auto space-y-1">
                {availablePersonas.map((persona) => (
                  <button
                    key={persona.id}
                    onClick={() => switchPersona(persona.id)}
                    className={cn(
                      "w-full text-left p-2 rounded-md hover:bg-accent transition-colors",
                      currentPersona.id === persona.id && "bg-accent"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{persona.name}</span>
                      <Badge
                        variant="secondary"
                        className={cn("text-xs", getRoleBadgeColor(persona.role))}
                      >
                        {persona.role.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {persona.jobTitle}
                      {persona.regionName && ` • ${persona.regionName}`}
                      {persona.teamName && ` • ${persona.teamName}`}
                    </div>
                    <div className="text-xs text-muted-foreground/70 mt-1">
                      {persona.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 pl-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {profile?.full_name ? getInitials(profile.full_name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm font-medium">
                {profile?.full_name || profile?.email}
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/app/account')}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/app/settings')}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
