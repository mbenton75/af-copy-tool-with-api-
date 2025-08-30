import React, { useState } from 'react'
import { copyText, htmlToPlainText } from '../utils/copy'

export default function ProductCard({ p }) {
  const [copied, setCopied] = useState('')

  const handleCopy = async (what) => {
    let text = ''
    if (what === 'title') text = p.title
    if (what === 'description') text = htmlToPlainText(p.description || '')
    if (what === 'both') text = `${p.title}\n\n${htmlToPlainText(p.description || '')}`

    const ok = await copyText(text)
    setCopied(ok ? what : '')
    setTimeout(() => setCopied(''), 1000)
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="title">{p.title}</div>
        <div className="meta">
          <span>#{p.productNumber || '—'}</span>
          <span>{p.brand || '—'}</span>
          <span>{p.model || '—'}</span>
          {p.organic ? <span className="pill">Organic</span> : null}
        </div>
      </div>

      <pre className="desc">{htmlToPlainText(p.description || '')}</pre>

      <div className="actions">
        <button onClick={() => handleCopy('title')}>Copy Title</button>
        <button onClick={() => handleCopy('description')}>Copy Description</button>
        <button onClick={() => handleCopy('both')}>Copy Both</button>
        {copied && <span className="copied">Copied {copied} ✔</span>}
      </div>
    </div>
  )
}
