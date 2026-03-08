import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  company_name: z.string().min(1, 'Company name is required'),
})

type ContactForm = z.infer<typeof contactSchema>

export default function Contact() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactForm) => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('beta_contacts')
        .insert({
          name: data.name,
          email: data.email,
          company_name: data.company_name,
        })

      if (error) throw error

      setIsSubmitted(true)
      toast.success("You're on the list! We'll be in touch soon.")
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">R</span>
          </div>
          <span className="font-semibold text-xl">RETAIND</span>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {isSubmitted ? (
            <Card className="w-full">
              <CardContent className="pt-8 pb-8 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
                <h2 className="text-2xl font-semibold">You're in!</h2>
                <p className="text-muted-foreground">
                  Thanks for your interest in RETAIND. We'll reach out shortly with your beta access details.
                </p>
                <Link
                  to="/"
                  className="inline-block mt-4 text-sm text-primary hover:underline"
                >
                  Back to homepage
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card className="w-full">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Join the Beta</CardTitle>
                <CardDescription>
                  Be among the first to use RETAIND and transform how you retain your workforce.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Name
                    </label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Smith"
                      {...register('name')}
                      disabled={isLoading}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      {...register('email')}
                      disabled={isLoading}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="company_name" className="text-sm font-medium">
                      Company Name
                    </label>
                    <Input
                      id="company_name"
                      type="text"
                      placeholder="Acme Construction Ltd"
                      {...register('company_name')}
                      disabled={isLoading}
                    />
                    {errors.company_name && (
                      <p className="text-sm text-red-500">{errors.company_name.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Request Beta Access
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} RETAIND. All rights reserved.</p>
      </footer>
    </div>
  )
}
