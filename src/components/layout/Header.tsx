'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@/types/database'
import { createClient } from '@/lib/supabase/client'

interface HeaderProps {
  user: User | null
}

export function Header({ user }: HeaderProps) {
  const router = useRouter()
  const [sessionUser, setSessionUser] = useState<User | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    document.documentElement.classList.remove('light-mode')
    let supabase: ReturnType<typeof createClient>
    try {
      supabase = createClient()
    } catch {
      // Keep public pages usable when deployment environment variables are missing.
      return
    }
    let active = true
    const setFromAuth = (authUser: { id: string; email?: string; created_at: string; user_metadata?: Record<string, unknown> } | null) => {
      if (!active) return
      setSessionUser(authUser ? {
        id: authUser.id,
        name: typeof authUser.user_metadata?.name === 'string' ? authUser.user_metadata.name : authUser.email?.split('@')[0] || 'Student',
        email: authUser.email || '',
        campus_id: null,
        role: 'student',
        created_at: authUser.created_at,
      } : null)
    }
    void supabase.auth.getUser().then(({ data }) => setFromAuth(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setFromAuth(session?.user || null))
    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const activeUser = user || sessionUser

  const handleLogout = async () => {
    setLoggingOut(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    setLoggingOut(false)
    if (error) return
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 bg-[#030303]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="group flex shrink-0 items-center gap-2 text-base font-semibold tracking-tight text-white sm:gap-3 sm:text-lg">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-lime-200 text-sm font-black text-[#17210f] shadow-[0_4px_20px_rgba(197,239,119,0.15)] transition-transform group-hover:-rotate-6 sm:h-9 sm:w-9">C</span>
            <span className="whitespace-nowrap">CampusCart</span>
          </Link>

          <nav className="flex shrink-0 items-center gap-2 sm:gap-5">
            {activeUser ? (
              <>
                <Link href="/dashboard" className="text-sm text-white/50 hover:text-white transition-colors hidden sm:block">
                  Browse
                </Link>
                <Link href="/messages" className="text-sm text-white/50 hover:text-white transition-colors hidden md:block">
                  Messages
                </Link>
                <Link href="/wishlist" className="text-sm text-white/50 hover:text-white transition-colors hidden md:block">
                  Saved
                </Link>
                <Link href="/profile" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm text-white/60 hover:bg-white/20 transition-colors">
                  {activeUser.name.charAt(0)}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="text-sm text-white/55 hover:text-white transition-colors disabled:opacity-50"
                >
                  {loggingOut ? 'Signing out…' : 'Log out'}
                </button>
              </>
            ) : (
              <>
                <Link href="/dashboard" className="hidden whitespace-nowrap text-sm text-white/50 transition-colors hover:text-white sm:block">
                  Browse
                </Link>
              </>
            )}
            <Link href="/new-listing" className="whitespace-nowrap rounded-full bg-lime-200 px-3 py-2 text-xs font-semibold text-[#17210f] transition hover:bg-lime-100 sm:px-4 sm:text-sm">
              <span className="hidden sm:inline">Post a product</span>
              <span className="sm:hidden">Post</span>
            </Link>
            {!activeUser && <>
              <Link href="/login" className="hidden whitespace-nowrap text-sm text-white/50 transition-colors hover:text-white sm:block">Log in</Link>
              <Link href="/signup" className="whitespace-nowrap rounded-lg bg-lime-200 px-3 py-2 text-xs font-semibold text-[#17210f] transition hover:bg-lime-100 sm:px-4 sm:py-2 sm:text-sm">Sign up</Link>
            </>}
          </nav>
        </div>
      </div>
    </header>
  )
}
