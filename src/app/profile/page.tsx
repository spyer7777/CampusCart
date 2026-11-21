'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ListingGrid } from '@/components/listings/ListingGrid'
import { createClient } from '@/lib/supabase/client'
import type { ListingWithUser, User } from '@/types/database'
import Link from 'next/link'

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<User | null>(null)
  const [listings, setListings] = useState<ListingWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.replace('/login?next=/profile')
          return
        }

        const [{ data: userProfile, error: profileError }, { data: userListings, error: listingsError }] = await Promise.all([
          supabase.from('users').select('*').eq('id', user.id).single(),
          supabase.from('listings').select('*').eq('created_by', user.id).order('created_at', { ascending: false }),
        ])
        if (profileError) throw profileError
        if (listingsError) throw listingsError

        setProfile(userProfile)
        setListings((userListings || []).map(listing => ({
          ...listing,
          users: { name: userProfile.name, email: userProfile.email },
        })) as ListingWithUser[])
      } catch (error) {
        const message = error instanceof Error
          ? error.message
          : typeof error === 'object' && error && 'message' in error
            ? String(error.message)
            : 'Could not load your profile.'
        setErrorMessage(message)
      } finally {
        setLoading(false)
      }
    }
    void loadProfile()
  }, [router])

  const activeCount = listings.filter(listing => listing.status === 'active').length
  const soldCount = listings.filter(listing => listing.status === 'sold').length

  return (
    <div className="min-h-screen flex flex-col bg-[#030303]">
      <Header user={profile} />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-lime-200/70">Your account</p>
              <h1 className="text-4xl font-semibold tracking-tight text-white">Profile</h1>
            </div>
            <Link href="/new-listing" className="inline-flex w-fit items-center rounded-full bg-lime-200 px-5 py-3 text-sm font-semibold text-[#17210f] transition hover:bg-lime-100">Post a product</Link>
          </div>

          {errorMessage ? (
            <div role="alert" className="rounded-2xl border border-red-300/20 bg-red-300/[0.06] p-6 text-sm text-red-100/80">{errorMessage}</div>
          ) : (
            <>
              <section className="mb-10 grid gap-4 md:grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(150px,0.5fr))]">
                <div className="flex items-center gap-5 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-6">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-lime-200 text-2xl font-bold text-[#17210f]">
                    {(profile?.name || 'S').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-semibold text-white">{loading ? 'Loading profile…' : profile?.name || 'Student'}</h2>
                    <p className="mt-1 truncate text-sm text-white/55">{profile?.email}</p>
                    <p className="mt-2 text-xs text-white/40">{profile?.campus_id ? 'Campus member' : 'Community member'}</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-6">
                  <p className="text-sm text-white/50">Active listings</p>
                  <p className="mt-3 text-4xl font-semibold text-white">{loading ? '—' : activeCount}</p>
                </div>
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-6">
                  <p className="text-sm text-white/50">Items sold</p>
                  <p className="mt-3 text-4xl font-semibold text-white">{loading ? '—' : soldCount}</p>
                </div>
              </section>

              <section>
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Your listings</h2>
                    <p className="mt-1 text-sm text-white/45">Manage the items you have posted.</p>
                  </div>
                  <Link href="/dashboard" className="text-sm text-lime-100 transition hover:text-lime-50">Browse marketplace →</Link>
                </div>
                {loading ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-8 text-sm text-white/50">Loading your listings…</div>
                ) : <ListingGrid listings={listings} />}
              </section>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
