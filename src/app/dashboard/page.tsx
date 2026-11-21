'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ListingGrid } from '@/components/listings/ListingGrid'
import { SearchBar } from '@/components/SearchBar'
import { Badge } from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/client'
import type { ListingWithUser, User } from '@/types/database'
import { getWishlist, getRecentlyViewed } from '@/lib/store'
import Link from 'next/link'

function DashboardContent() {
  const searchParams = useSearchParams()
  const [wishlist, setWishlist] = useState<string[]>([])
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([])
  const [listings, setListings] = useState<ListingWithUser[]>([])
  const [profile, setProfile] = useState<User | null>(null)
  const [loadError, setLoadError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    setWishlist(getWishlist())
    setRecentlyViewed(getRecentlyViewed())
    const loadMarketplace = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setProfile({
            id: user.id,
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'Student',
            email: user.email || '',
            campus_id: null,
            role: 'student',
            created_at: user.created_at,
          })
          const { data: userProfile, error: profileError } = await supabase
            .from('users').select('*').eq('id', user.id).single()
          if (profileError) throw profileError
          setProfile(userProfile)
        }

        const { data: campusListings, error: listingsError } = await supabase
          .from('listings').select('*')
          .eq('status', 'active').order('created_at', { ascending: false })
        if (listingsError) throw listingsError
        const creatorIds = [...new Set((campusListings || []).map(item => item.created_by))]
        const { data: creators, error: creatorsError } = creatorIds.length
          ? await supabase.from('users').select('id,name,email').in('id', creatorIds)
          : { data: [], error: null }
        if (creatorsError) throw creatorsError
        const creatorById = new Map((creators || []).map(creator => [creator.id, creator]))
        setListings((campusListings || []).map(item => ({
          ...item,
          users: creatorById.get(item.created_by) || { name: 'CampusCart seller', email: '' },
        })) as ListingWithUser[])
      } catch (error) {
        const message = error instanceof Error
          ? error.message
          : typeof error === 'object' && error && 'message' in error
            ? String(error.message)
            : 'Could not load the marketplace.'
        setLoadError(message)
      } finally {
        setIsLoading(false)
      }
    }
    void loadMarketplace()
  }, [])

  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || 'newest'
  const leaving = searchParams.get('leaving') === 'true'
  const search = searchParams.get('q') || ''

  let filteredListings = [...listings]
  
  if (search) {
    const q = search.toLowerCase()
    filteredListings = filteredListings.filter(l => 
      l.title.toLowerCase().includes(q) || 
      (l.description || '').toLowerCase().includes(q)
    )
  }
  
  if (category) {
    filteredListings = filteredListings.filter(l => l.category === category)
  }
  
  if (leaving) {
    filteredListings = filteredListings.filter(l => l.leaving_soon)
  }
  
  switch (sort) {
    case 'oldest':
      filteredListings.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      break
    case 'price_low':
      filteredListings.sort((a, b) => a.price - b.price)
      break
    case 'price_high':
      filteredListings.sort((a, b) => b.price - a.price)
      break
    default:
      filteredListings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  const recentItems = recentlyViewed.map(id => listings.find(l => l.id === id)).filter(Boolean).slice(0, 4)
  const savedItems = wishlist.map(id => listings.find(l => l.id === id)).filter(Boolean).slice(0, 4)

  return (
    <>
    <Header user={profile} />
    <main className="flex-1">
      <div className="border-b border-lime-100/10 bg-gradient-to-r from-lime-200/[0.08] via-white/[0.025] to-transparent">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="rounded-full border border-lime-200/20 bg-lime-200/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-lime-100">Community marketplace</span>
              <span className="hidden text-sm text-white/60 sm:inline">Find something useful. Give good things another home.</span>
            </div>
            <Link href="/new-listing" className="text-sm font-medium text-lime-100 transition hover:text-lime-50">Sell an item →</Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-lime-200/75">Open to everyone</p>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">Marketplace</h1>
          </div>
          <SearchBar />
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5 shadow-lg shadow-black/10">
            <div className="text-3xl font-semibold text-white">{listings.length}</div>
            <div className="mt-1 text-xs text-white/40">Active listings</div>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5 shadow-lg shadow-black/10">
            <div className="text-3xl font-semibold text-white">{listings.filter(l => l.leaving_soon).length}</div>
            <div className="mt-1 text-xs text-white/40">Leaving soon</div>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5 shadow-lg shadow-black/10">
            <div className="text-3xl font-semibold text-white">{savedItems.length}</div>
            <div className="mt-1 text-xs text-white/40">Saved items</div>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5 shadow-lg shadow-black/10">
            <div className="text-3xl font-semibold text-white">{recentItems.length}</div>
            <div className="mt-1 text-xs text-white/40">Recently viewed</div>
          </div>
        </div>

        <div className="mb-8 flex flex-wrap items-center gap-3">
          <select value={category} onChange={(e) => { window.location.href = `/dashboard?category=${e.target.value}` }} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
            <option value="">All categories</option>
            <option value="furniture">Furniture</option>
            <option value="books">Books</option>
            <option value="electronics">Electronics</option>
            <option value="misc">Miscellaneous</option>
          </select>
          
          <select value={sort} onChange={(e) => { window.location.href = `/dashboard?sort=${e.target.value}` }} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="price_low">Price: Low to high</option>
            <option value="price_high">Price: High to low</option>
          </select>

          {search && (
            <Badge variant="default">
              Search: &quot;{search}&quot;
              <button onClick={() => { window.location.href = '/dashboard' }} className="ml-2">×</button>
            </Badge>
          )}
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            {loadError ? (
              <div role="alert" className="rounded-2xl border border-red-300/20 bg-red-300/[0.06] p-6">
                <h2 className="font-semibold text-white">We couldn’t load listings</h2>
                <p className="mt-2 break-words text-sm text-red-100/80">{loadError}</p>
                <p className="mt-3 text-xs text-white/50">If this says “permission denied,” run <code className="text-white/70">supabase/migrations/20261122_grant_marketplace_access.sql</code> in the Supabase SQL Editor, then reload.</p>
              </div>
            ) : isLoading ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-sm text-white/60">Loading listings…</div>
            ) : <ListingGrid listings={filteredListings} />}
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-lime-100/15 bg-gradient-to-br from-lime-200/[0.08] to-white/[0.025] p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-lime-200/15 text-lg text-lime-100">＋</div>
              <h3 className="font-semibold text-white">Have something to sell?</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">Post a few details and a photo. Your listing will be visible to everyone.</p>
              <Link href="/new-listing" className="mt-5 inline-flex rounded-full bg-lime-200 px-4 py-2.5 text-sm font-semibold text-[#17210f] transition hover:bg-lime-100">Post a product</Link>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">Trade thoughtfully</p>
              <h3 className="mt-2 font-semibold text-white">Meet safely</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">Agree on a public meetup spot, check the item before paying, and keep conversations on the platform.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
    <Footer />
    </>
  )
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#030303]">
      <Suspense fallback={<div className="flex-1 flex items-center justify-center text-white/50">Loading...</div>}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}
