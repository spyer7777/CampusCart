import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function MessagesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#030303]">
      <Header user={null} />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-lime-200/70">Inbox</p>
          <h1 className="text-4xl font-semibold tracking-tight text-white">Messages</h1>
          <p className="mt-3 text-sm text-white/50">Keep conversations about a listing in one place.</p>

          <section className="mt-10 rounded-3xl border border-white/[0.08] bg-white/[0.025] px-6 py-20 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-lime-200/10 text-lime-100">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white">No conversations yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/50">When you contact a seller about an item, your conversation will show up here.</p>
            <Link href="/dashboard" className="mt-6 inline-flex rounded-full bg-lime-200 px-5 py-3 text-sm font-semibold text-[#17210f] transition hover:bg-lime-100">Browse products</Link>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
