'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Badge } from '@/components/ui/Badge'
import { allListings } from '@/lib/listings-data'
import { createClient } from '@/lib/supabase/client'
import type { Listing } from '@/types/database'
import { getWishlistSnapshot, getEmptyWishlistSnapshot, subscribeToWishlist, removeFromWishlist } from '@/lib/store'
import { formatPrice } from '@/lib/utils'

export default function WishlistPage() {
  const [databaseListings, setDatabaseListings] = useState<Listing[]>([])
  const [loadError, setLoadError] = useState('')
  const wishlistIds = useSyncExternalStore(
    subscribeToWishlist,
    getWishlistSnapshot,
    getEmptyWishlistSnapshot,
  )

  useEffect(() => {
    if (wishlistIds.length === 0) return
    let cancelled = false
    const loadSavedListings = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase.from('listings').select('*').in('id', wishlistIds)
        if (error) throw error
        if (!cancelled) setDatabaseListings(data || [])
      } catch (error) {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : 'Could not load saved listings.')
      }
    }
    void loadSavedListings()
    return () => { cancelled = true }
  }, [wishlistIds])

  const wishlistItems = wishlistIds
    .map(id => allListings.find(l => l.id === id) || databaseListings.find(l => l.id === id))
    .filter((item): item is (typeof allListings)[number] | Listing => Boolean(item))

  const handleRemove = (id: string) => {
    removeFromWishlist(id)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#030303]">
      <Header user={null} />
      
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="mb-10">
            <p className="text-white/30 text-sm tracking-[0.2em] uppercase mb-2">Your collection</p>
            <h1 className="text-3xl font-light tracking-tight text-white">Saved Items</h1>
          </div>

          {loadError ? (
            <div role="alert" className="rounded-2xl border border-red-300/20 bg-red-300/[0.06] p-5 text-sm text-red-100/80">{loadError}</div>
          ) : wishlistItems.length === 0 ? (
            <div className="text-center py-20 border border-white/5 bg-white/[0.01]">
              <svg className="w-16 h-16 mx-auto mb-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <p className="text-white/50 text-lg mb-2">No saved items yet</p>
              <p className="text-white/30 text-sm mb-6">Items you save will appear here</p>
              <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-medium hover:bg-white/90 transition-colors">
                Browse marketplace
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {wishlistItems.map((item) => (
                <div key={item.id} className="flex gap-5 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 transition-colors hover:border-lime-100/20">
                  <Link href={`/listing/${item.id}`} className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-white/5 sm:h-32 sm:w-32">
                    {item.image_url ? <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-xs text-white/35">No photo</span>}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link href={`/listing/${item.id}`} className="text-lg text-white hover:text-white/80 transition-colors">
                          {item.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="default">{item.category}</Badge>
                          {item.leaving_soon && <Badge variant="leaving">Leaving soon</Badge>}
                        </div>
                      </div>
                      <p className="text-xl font-light text-white">{formatPrice(item.price)}</p>
                    </div>
                    <p className="text-white/40 text-sm mt-2 line-clamp-2">{item.description}</p>
                    <div className="flex items-center gap-4 mt-4">
                      <Link href={`/listing/${item.id}`} className="text-sm text-white/50 hover:text-white transition-colors">
                        View listing →
                      </Link>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="text-sm text-red-400/70 hover:text-red-400 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
