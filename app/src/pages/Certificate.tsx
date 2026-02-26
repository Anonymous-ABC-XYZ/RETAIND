import { useState, useRef } from 'react'
import { Award, Download, Printer, Search, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useAuth } from '@/contexts/AuthContext'
import { useWorkersHybrid } from '@/hooks/useHybridData'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export default function Certificate() {
  const { currentOrganisation } = useAuth()
  const { data: workers } = useWorkersHybrid(currentOrganisation?.id)
  const certificateRef = useRef<HTMLDivElement>(null)

  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const selectedWorker = workers?.find((w) => w.id === selectedWorkerId)

  // Define types for the onboarding assignment
  type OnboardingWithTemplate = {
    id: string
    status: string
    progress_percentage: number
    completed_at?: string | null
    template?: { name: string; duration_days: number } | null
  }

  // Fetch onboarding assignment for selected worker
  const { data: onboarding } = useQuery<OnboardingWithTemplate | null>({
    queryKey: ['workerOnboarding', selectedWorkerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('onboarding_assignments')
        .select(`
          *,
          template:onboarding_templates(name, duration_days)
        `)
        .eq('worker_id', selectedWorkerId!)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data as unknown as OnboardingWithTemplate | null
    },
    enabled: !!selectedWorkerId,
  })

  const isEligible = onboarding && onboarding.status === 'completed'

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // In a real app, this would generate a PDF
    // For now, we'll use the print dialog
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Certificate Generator</h1>
        <p className="text-muted-foreground">
          Generate completion certificates for workers who have completed their onboarding
        </p>
      </div>

      {/* Worker Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Worker</CardTitle>
          <CardDescription>
            Choose a worker to generate their completion certificate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full md:w-[400px] justify-between"
              >
                {selectedWorker
                  ? `${selectedWorker.first_name} ${selectedWorker.last_name}`
                  : 'Select a worker...'}
                <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full md:w-[400px] p-0">
              <Command>
                <CommandInput placeholder="Search workers..." />
                <CommandList>
                  <CommandEmpty>No worker found.</CommandEmpty>
                  <CommandGroup>
                    {workers?.map((worker) => (
                      <CommandItem
                        key={worker.id}
                        value={`${worker.first_name} ${worker.last_name}`}
                        onSelect={() => {
                          setSelectedWorkerId(worker.id)
                          setOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            selectedWorkerId === worker.id ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <div>
                          <p className="font-medium">
                            {worker.first_name} {worker.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">{worker.job_title}</p>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {selectedWorker && !isEligible && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                {onboarding
                  ? `This worker's onboarding is ${onboarding.progress_percentage}% complete. They must complete all tasks to receive a certificate.`
                  : 'This worker has not been assigned an onboarding program.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certificate Preview */}
      {selectedWorker && isEligible && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Certificate Preview</span>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handlePrint} className="gap-2">
                    <Printer className="h-4 w-4" />
                    Print
                  </Button>
                  <Button onClick={handleDownload} className="gap-2">
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Certificate Design */}
              <div
                ref={certificateRef}
                className="bg-white border-8 border-double border-indigo-600 p-12 max-w-3xl mx-auto print:border-4"
              >
                <div className="text-center space-y-8">
                  {/* Logo/Icon */}
                  <div className="flex justify-center">
                    <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Award className="h-12 w-12 text-indigo-600" />
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <h2 className="text-4xl font-serif font-bold text-indigo-900">
                      Certificate of Completion
                    </h2>
                    <p className="text-lg text-muted-foreground mt-2">
                      Onboarding Program
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-indigo-200" />
                    <Award className="h-6 w-6 text-indigo-400" />
                    <div className="flex-1 h-px bg-indigo-200" />
                  </div>

                  {/* Recipient */}
                  <div className="space-y-2">
                    <p className="text-lg text-muted-foreground">This certifies that</p>
                    <p className="text-3xl font-bold text-indigo-900">
                      {selectedWorker.first_name} {selectedWorker.last_name}
                    </p>
                    <p className="text-lg text-muted-foreground">
                      {selectedWorker.job_title}
                    </p>
                  </div>

                  {/* Program Details */}
                  <div className="space-y-2">
                    <p className="text-lg text-muted-foreground">
                      has successfully completed the
                    </p>
                    <p className="text-2xl font-semibold text-indigo-800">
                      {onboarding.template?.name || 'Onboarding Program'}
                    </p>
                    {onboarding.template?.duration_days && (
                      <p className="text-muted-foreground">
                        ({onboarding.template.duration_days}-day program)
                      </p>
                    )}
                  </div>

                  {/* Date */}
                  <div className="space-y-2">
                    <p className="text-muted-foreground">Completed on</p>
                    <p className="text-xl font-semibold">
                      {onboarding.completed_at
                        ? format(new Date(onboarding.completed_at), 'MMMM d, yyyy')
                        : format(new Date(), 'MMMM d, yyyy')}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-indigo-200" />
                    <Award className="h-6 w-6 text-indigo-400" />
                    <div className="flex-1 h-px bg-indigo-200" />
                  </div>

                  {/* Organisation */}
                  <div className="space-y-4">
                    <p className="text-lg font-semibold text-indigo-900">
                      {currentOrganisation?.name}
                    </p>
                    <div className="flex justify-center gap-16 pt-8">
                      <div className="text-center">
                        <div className="w-48 border-b border-gray-400 mb-2" />
                        <p className="text-sm text-muted-foreground">Authorized Signature</p>
                      </div>
                      <div className="text-center">
                        <div className="w-48 border-b border-gray-400 mb-2" />
                        <p className="text-sm text-muted-foreground">Date</p>
                      </div>
                    </div>
                  </div>

                  {/* Certificate ID */}
                  <p className="text-xs text-muted-foreground pt-4">
                    Certificate ID: {onboarding.id?.slice(0, 8).toUpperCase() || 'CERT-0001'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Print Styles */}
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              .certificate-print, .certificate-print * {
                visibility: visible;
              }
              .certificate-print {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
              }
            }
          `}</style>
        </>
      )}

      {/* Empty State */}
      {!selectedWorker && (
        <Card>
          <CardContent className="p-12 text-center">
            <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Worker Selected</h3>
            <p className="text-muted-foreground">
              Select a worker above to generate their completion certificate.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
