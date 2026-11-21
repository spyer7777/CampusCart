'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Card, CardContent } from '@/components/ui/Card'
import { createClient } from '@/lib/supabase/client'
import type { ListingCategory, User } from '@/types/database'

const categoryOptions = [
  { value: '', label: 'Select category' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'books', label: 'Books' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'misc', label: 'Miscellaneous' },
]

export default function NewListingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<User | null>(null)
  const [photo, setPhoto] = useState<File | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    residence: '',
    leavingSoon: false,
    expiresInDays: '7',
  })

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.replace('/login?next=/new-listing')
          return
        }
        const { data } = await supabase.from('users').select('*').eq('id', user.id).single()
        setProfile(data)
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Could not connect to Supabase.')
      }
    }
    void loadProfile()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')

    try {
      const supabase = createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) throw new Error('Sign in before creating a listing.')

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('campus_id')
        .eq('id', user.id)
        .single()
      if (profileError || !profile) throw new Error('Your seller profile is missing. Please sign in again.')

      let imageUrl: string | null = null
      if (photo) {
        if (photo.size > 10 * 1024 * 1024) throw new Error('Choose an image smaller than 10 MB.')
        const extension = photo.name.split('.').pop()?.toLowerCase() || 'jpg'
        const imagePath = `${user.id}/${crypto.randomUUID()}.${extension}`
        const { error: uploadError } = await supabase.storage.from('listings').upload(imagePath, photo)
        if (uploadError) throw uploadError
        imageUrl = supabase.storage.from('listings').getPublicUrl(imagePath).data.publicUrl
      }

      const expiresAt = formData.leavingSoon
        ? new Date(Date.now() + Number(formData.expiresInDays) * 86400000).toISOString()
        : null
      const { error: insertError } = await supabase.from('listings').insert({
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        price: Number(formData.price),
        category: formData.category as ListingCategory,
        campus_id: profile.campus_id,
        residence: formData.residence.trim() || null,
        created_by: user.id,
        leaving_soon: formData.leavingSoon,
        expires_at: expiresAt,
        image_url: imageUrl,
      })
      if (insertError) throw insertError
      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not create this listing.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#030303] noise">
      <Header user={profile} />
      
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="mb-8">
            <span className="mb-3 inline-flex rounded-full border border-lime-200/20 bg-lime-200/[0.08] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-lime-100">Sell something</span>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">Create a listing</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">Add a clear photo and a few useful details. Your listing will be visible in the open marketplace.</p>
          </div>

          <Card>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Photo
                  </label>
                  <label htmlFor="listing-photo" className="block border border-dashed border-white/20 rounded-xl p-8 text-center hover:border-white/40 transition-colors cursor-pointer">
                    <svg className="w-12 h-12 mx-auto mb-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-white/50 mb-2">{photo?.name || 'Click to upload an image'}</p>
                    <p className="text-white/30 text-sm">PNG, JPG up to 10MB</p>
                    <input id="listing-photo" type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
                  </label>
                </div>

                <Input
                  id="title"
                  label="Title"
                  type="text"
                  required
                  placeholder="What are you selling?"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />

                <Textarea
                  id="description"
                  label="Description"
                  rows={4}
                  placeholder="Describe your item..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="price"
                    label="Price (₹)"
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />

                  <Select
                    id="category"
                    label="Category"
                    options={categoryOptions}
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>

                <Input
                  id="residence"
                  label="Location (optional)"
                  type="text"
                  placeholder="e.g., Hostel Block A, Room 204"
                  value={formData.residence}
                  onChange={(e) => setFormData({ ...formData, residence: e.target.value })}
                />

                {/* Leaving Soon Toggle */}
                <div className="glass rounded-xl p-6">
                  <label className="flex items-start gap-4 cursor-pointer">
                    <div className="relative mt-1">
                      <input
                        type="checkbox"
                        checked={formData.leavingSoon}
                        onChange={(e) => setFormData({ ...formData, leavingSoon: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-5 h-5 border border-white/20 bg-white/5 peer-checked:bg-white peer-checked:border-white transition-all rounded" />
                      <svg 
                        className="absolute inset-0 w-5 h-5 text-black opacity-0 peer-checked:opacity-100 transition-opacity p-0.5" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-medium text-white">Leaving Campus Mode</span>
                      <p className="text-sm text-white/50 mt-1">
                        Mark this listing as urgent. It will be highlighted and auto-expire after your departure.
                      </p>
                    </div>
                  </label>

                  {formData.leavingSoon && (
                    <div className="mt-6 pl-9">
                      <Select
                        id="expiresInDays"
                        label="Auto-expire after"
                        options={[
                          { value: '3', label: '3 days' },
                          { value: '7', label: '7 days' },
                          { value: '14', label: '14 days' },
                          { value: '30', label: '30 days' },
                        ]}
                        value={formData.expiresInDays}
                        onChange={(e) => setFormData({ ...formData, expiresInDays: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="flex-1" size="lg" loading={loading}>
                    Create listing
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                </div>
                {errorMessage && <p role="alert" className="text-sm text-red-400">{errorMessage}</p>}
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
