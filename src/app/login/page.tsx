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

export default function LoginPage() {
  const router = useRouter()
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  )
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword(formData)
      if (error) throw error
      const next = new URLSearchParams(window.location.search).get('next')
      router.push(next?.startsWith('/') && !next.startsWith('//') ? next : '/dashboard')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not sign in.')
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
            <CardTitle>Sign in to CampusCart</CardTitle>
          </CardHeader>
          <CardContent>
            {!supabaseConfigured && (
              <p role="alert" className="mb-4 rounded-xl border border-amber-200/20 bg-amber-200/[0.06] p-3 text-sm text-amber-100/80">
                Sign-in is not configured for this deployment. Add the Supabase URL and publishable key to the hosting environment, then redeploy.
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="email"
                label="Email"
                type="email"
                required
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              {errorMessage && <p role="alert" className="text-sm text-red-400">{errorMessage}</p>}
              
              <Input
                id="password"
                label="Password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              
              <Button type="submit" className="w-full" loading={loading} disabled={!supabaseConfigured}>
                Sign in
              </Button>
            </form>
            
            <p className="mt-4 text-center text-sm text-white/50">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-white underline">Create one</Link>
            </p>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  )
}
