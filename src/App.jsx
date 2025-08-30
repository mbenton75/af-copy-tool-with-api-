import React, { useEffect, useMemo, useState } from 'react'
import ProductCard from './components/ProductCard.jsx'

export default function App() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [onlyOrganic, setOnlyOrganic] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/catalog')
        const json = await res.json()
        setData(json.items || [])
      } catch (e) {
        setData([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return data.filter(p => {
      if (onlyOrganic && !p.organic) return false
      if (!term) return true
      const hay = [
        p.title, p.brand, p.model, (p.tags||[]).join(' '), String(p.productNumber)
      ].join(' ').toLowerCase()
      return hay.includes(term)
    })
  }, [data, q, onlyOrganic])

  return (
    <div className="wrap">
      <header className="top">
        <h1>AF Copy Tool</h1>
        <div className="search">
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search title, brand, model, tag, or product #"
          />
          <label className="chk">
            <input type="checkbox" checked={onlyOrganic} onChange={e => setOnlyOrganic(e.target.checked)} />
            Organic only
          </label>
        </div>
      </header>

      {loading ? <div className="empty">Loading…</div> : (
        <main className="grid">
          {filtered.map(p => <ProductCard key={p.id} p={p} />)}
          {filtered.length === 0 && <div className="empty">No matches.</div>}
        </main>
      )}

      <footer className="foot">
        <small>Read-only. Powered by Netlify Functions & Shopify Admin API.</small>
      </footer>
    </div>
  )
}
