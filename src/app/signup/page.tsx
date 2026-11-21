'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError('')
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { name: formData.name },
          emailRedirectTo: window.location.origin,
        },
      })
      if (error) throw error
      if (data.session) {
        router.push('/dashboard')
      } else {
        setSuccessMessage('Check your email to confirm your account, then sign in.')
      }
    } catch (error) {
      setEmailError(error instanceof Error ? error.message : 'Could not create your account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#030303]">
      <Header user={null} />
      
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="name"
                label="Full name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              
              <Input
                id="email"
                label="Email"
                type="email"
                required
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              {emailError && <p role="alert" className="-mt-2 text-sm text-red-400">{emailError}</p>}
              {successMessage && <p role="status" className="-mt-2 text-sm text-green-400">{successMessage}</p>}
              
              <Input
                id="password"
                label="Password"
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              
              <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
                <p className="text-sm text-white/40">Open marketplace</p>
                <p className="text-white">Anyone can join</p>
                <p className="mt-1 text-xs text-white/40">Create an account with any email to post products.</p>
              </div>
              
              <Button type="submit" className="w-full" loading={loading}>
                Create account
              </Button>
            </form>
            
            <p className="mt-4 text-center text-sm text-white/50">
              Already have an account?{' '}
              <Link href="/login" className="text-white underline">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  )
}
