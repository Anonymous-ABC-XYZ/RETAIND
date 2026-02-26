import { useState, useMemo } from 'react'
import { BookOpen, Search, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAuth } from '@/contexts/AuthContext'
import { useAccessControl } from '@/contexts/AccessControlContext'
import { usePlaybooksHybrid } from '@/hooks/useHybridData'
import type { Playbook } from '@/lib/database.types'

const CATEGORY_COLORS: Record<string, string> = {
  Safety: 'bg-red-100 text-red-700',
  Procedures: 'bg-blue-100 text-blue-700',
  Guidelines: 'bg-green-100 text-green-700',
  'Best Practices': 'bg-purple-100 text-purple-700',
}

export default function Playbooks() {
  const { currentOrganisation } = useAuth()
  const { canAccess } = useAccessControl()
  const { data: playbooks, isLoading } = usePlaybooksHybrid(currentOrganisation?.id)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null)

  const canCreatePlaybook = canAccess('playbooks', 'create')

  // Get unique categories
  const categories = useMemo(() => {
    if (!playbooks) return []
    const cats = new Set(playbooks.map((p) => p.category).filter(Boolean))
    return Array.from(cats) as string[]
  }, [playbooks])

  // Filter playbooks
  const filteredPlaybooks = useMemo(() => {
    if (!playbooks) return []

    return playbooks.filter((playbook) => {
      const matchesSearch =
        !searchQuery ||
        playbook.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        playbook.description?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory =
        !selectedCategory || playbook.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [playbooks, searchQuery, selectedCategory])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Playbooks</h1>
            <p className="text-muted-foreground">Loading playbooks...</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-40 animate-pulse bg-slate-100 rounded" />
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
          <h1 className="text-2xl font-bold">Playbooks</h1>
          <p className="text-muted-foreground">
            Guides, procedures, and best practices for your team
          </p>
        </div>
        {canCreatePlaybook && (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Playbook
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
                placeholder="Search playbooks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Category Filters */}
            <div className="flex gap-2">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Playbooks Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlaybooks.length > 0 ? (
          filteredPlaybooks.map((playbook) => (
            <Card
              key={playbook.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedPlaybook(playbook)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-indigo-600" />
                  </div>
                  {playbook.is_mandatory && (
                    <Badge variant="destructive">Mandatory</Badge>
                  )}
                </div>
                <CardTitle className="mt-4">{playbook.title}</CardTitle>
                <CardDescription>{playbook.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {playbook.category && (
                    <Badge className={CATEGORY_COLORS[playbook.category] || 'bg-gray-100 text-gray-700'}>
                      {playbook.category}
                    </Badge>
                  )}
                  {playbook.requires_acknowledgment && (
                    <Badge variant="outline">Requires Sign-off</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No playbooks found</h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedCategory
                  ? 'Try adjusting your search or filters'
                  : 'Create your first playbook to get started'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Playbook Detail Dialog */}
      <Dialog open={!!selectedPlaybook} onOpenChange={() => setSelectedPlaybook(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedPlaybook && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedPlaybook.title}</DialogTitle>
                <DialogDescription>{selectedPlaybook.description}</DialogDescription>
              </DialogHeader>
              <div className="flex gap-2 mb-4">
                {selectedPlaybook.category && (
                  <Badge className={CATEGORY_COLORS[selectedPlaybook.category] || 'bg-gray-100'}>
                    {selectedPlaybook.category}
                  </Badge>
                )}
                {selectedPlaybook.is_mandatory && (
                  <Badge variant="destructive">Mandatory</Badge>
                )}
              </div>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm bg-slate-50 p-4 rounded-lg">
                  {selectedPlaybook.content}
                </pre>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
