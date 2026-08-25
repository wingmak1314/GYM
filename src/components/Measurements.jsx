import React, { useMemo, useRef, useState } from 'react'

const FIELDS = [
  { key: 'weight', zh: '體重', unit: 'kg' },
  { key: 'bodyFat', zh: '體脂率', unit: '%' },
  { key: 'chest', zh: '胸圍', unit: 'cm' },
  { key: 'waist', zh: '腰圍', unit: 'cm' },
]

function Chart({ points, field, fmt }) {
  const W = 560, H = 180, P = 10
  if (points.length < 2) return null
  const vals = points.map((p) => p[field]).filter((v) => v != null)
  if (vals.length < 2) return null
  const max = Math.max(...vals) * 1.03
  const min = Math.min(...vals) * 0.97
  const usable = points.filter((p) => p[field] != null)
  const x = (i) => P + (i * (W - P * 2)) / Math.max(1, usable.length - 1)
  const y = (v) => H - P - ((v - min) / (max - min)) * (H - P * 2)
  const line = usable.map((p, i) => `${x(i)},${y(p[field])}`).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="linechart" preserveAspectRatio="none">
      {usable.map((p, i) => <circle key={i} cx={x(i)} cy={y(p[field])} r="3.5" fill="#4db8ff"><title>{`${p.date}: ${p[field]}`}</title></circle>)}
      <polyline points={line} fill="none" stroke="#4db8ff" strokeWidth="2" />
    </svg>
  )
}

export default function Measurements({ ctx }) {
  const { state, addMeasurement, deleteMeasurement, unit, fmt, addPhoto, deletePhoto, showToast } = ctx
  const [date, setDate] = useState(ctx.todayStr())
  const [form, setForm] = useState({ weight: '', bodyFat: '', chest: '', waist: '' })
  const [photoField, setPhotoField] = useState('')
  const fileRef = useRef(null)

  const pts = useMemo(() => state.measurements.map((m) => ({ ...m })), [state.measurements])
  const photos = state.photos || []

  const toKgLocal = (v) => (unit === 'lb' ? Math.round((parseFloat(v) / 2.20462) * 10) / 10 : parseFloat(v))

  const submit = () => {
    const w = toKgLocal(form.weight)
    if (!date || (isNaN(w) && !form.bodyFat && !form.chest && !form.waist)) { showToast('請輸入至少一項量度'); return }
    const entry = { date, weight: isNaN(w) ? undefined : w }
    for (const f of FIELDS.slice(1)) {
      const v = parseFloat(form[f.key])
      if (!isNaN(v)) entry[f.key] = v
    }
    addMeasurement(entry)
    setForm({ weight: '', bodyFat: '', chest: '', waist: '' })
  }

  const onPhoto = (file) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        // 壓縮到 480px 內,控制 localStorage 用量
        const scale = Math.min(1, 480 / Math.max(img.width, img.height))
        const c = document.createElement('canvas')
        c.width = Math.round(img.width * scale)
        c.height = Math.round(img.height * scale)
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
        addPhoto({ id: Date.now().toString(36), date: photoField || date, dataUrl: c.toDataURL('image/jpeg', 0.75) })
        showToast('✅ 進度相已儲存')
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="page">
      <header className="page-head"><h1>量測</h1></header>

      <div className="card">
        <h2>紀錄量度</h2>
        <div className="measure-form">
          <input type="date" className="inp" value={date} onChange={(e) => setDate(e.target.value)} />
          <input className="inp" inputMode="decimal" placeholder={unit === 'lb' ? '體重 (lb)' : '體重 (kg)'} value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
          <input className="inp" inputMode="decimal" placeholder="體脂 %" value={form.bodyFat} onChange={(e) => setForm({ ...form, bodyFat: e.target.value })} />
          <input className="inp" inputMode="decimal" placeholder="胸圍 cm" value={form.chest} onChange={(e) => setForm({ ...form, chest: e.target.value })} />
          <input className="inp" inputMode="decimal" placeholder="腰圍 cm" value={form.waist} onChange={(e) => setForm({ ...form, waist: e.target.value })} />
          <button className="btn btn-primary" onClick={submit}>✓ 紀錄</button>
        </div>
      </div>

      <section className="card">
        <h2>趨勢 <span className="card-sub">有數據先顯示</span></h2>
        <div className="measure-charts">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <div style={{ fontSize: 13, color: 'var(--muted)', margin: '8px 0 4px' }}>{f.zh} ({f.unit})</div>
              <Chart points={pts} field={f.key} fmt={fmt} />
            </div>
          ))}
        </div>
        {pts.length ? (
          <div className="measure-table">
            {[...pts].reverse().map((p) => (
              <div key={p.date} className="measure-row">
                <span>{p.date}</span>
                <b style={{ fontSize: 12.5, fontWeight: 400 }}>
                  {FIELDS.filter((f) => p[f.key] != null).map((f) => `${f.zh} ${p[f.key]}${f.unit}`).join(' · ') || '—'}
                </b>
                <button className="icon-btn danger" onClick={() => deleteMeasurement(p.date)}>✕</button>
              </div>
            ))}
          </div>
        ) : <div className="empty-note">未有紀錄</div>}
      </section>

      <section className="card">
        <h2>進度相 <span className="card-sub">每 2–4 週影一張,視覺睇變化</span></h2>
        <div className="measure-form">
          <input type="date" className="inp" value={photoField || date} onChange={(e) => setPhotoField(e.target.value)} />
          <button className="btn btn-primary" onClick={() => fileRef.current.click()}>📷 上載相片</button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { if (e.target.files[0]) onPhoto(e.target.files[0]); e.target.value = '' }} />
        </div>
        {photos.length ? (
          <div className="photo-grid">
            {[...photos].reverse().map((p) => (
              <div key={p.id} className="photo-item">
                <img src={p.dataUrl} alt={`${p.date} 進度相`} loading="lazy" />
                <div className="photo-meta">
                  <span>{p.date}</span>
                  <button className="icon-btn danger" onClick={() => deletePhoto(p.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        ) : <div className="empty-note">未有相片 — 影低而家嘅你,幾個月後對比!</div>}
      </section>
    </div>
  )
}
