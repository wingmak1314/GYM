import React, { useMemo, useState } from 'react'

function WeightChart({ points }) {
  const W = 560, H = 180, P = 10
  if (points.length < 2) return null
  const vals = points.map((p) => p.weight)
  const max = Math.max(...vals) * 1.02
  const min = Math.min(...vals) * 0.98
  const x = (i) => P + (i * (W - P * 2)) / (points.length - 1)
  const y = (v) => H - P - ((v - min) / (max - min)) * (H - P * 2)
  const line = points.map((p, i) => `${x(i)},${y(p.weight)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="linechart" preserveAspectRatio="none">
      {points.map((p, i) => <circle key={i} cx={x(i)} cy={y(p.weight)} r="3.5" fill="#4db8ff"><title>{`${p.date}: ${p.weight}`}</title></circle>)}
      <polyline points={line} fill="none" stroke="#4db8ff" strokeWidth="2" />
    </svg>
  )
}

export default function Measurements({ ctx }) {
  const { state, addMeasurement, deleteMeasurement, unit, fmt, showToast } = ctx
  const [date, setDate] = useState(ctx.todayStr())
  const [weight, setWeight] = useState('')
  const pts = useMemo(() => state.measurements.map((m) => ({ date: m.date, weight: m.weight })), [state.measurements])

  const submit = () => {
    const v = parseFloat(weight)
    if (!date || isNaN(v) || v <= 0) { showToast('請輸入有效體重'); return }
    const kg = unit === 'lb' ? Math.round((v / 2.20462) * 10) / 10 : v
    addMeasurement({ date, weight: kg })
    setWeight('')
  }

  return (
    <div className="page">
      <header className="page-head"><h1>量測</h1></header>

      <div className="card">
        <h2>紀錄體重</h2>
        <div className="measure-form">
          <input type="date" className="inp" value={date} onChange={(e) => setDate(e.target.value)} />
          <input className="inp" inputMode="decimal" placeholder={unit === 'lb' ? '體重 (lb)' : '體重 (kg)'} value={weight} onChange={(e) => setWeight(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
          <button className="btn btn-primary" onClick={submit}>✓ 紀錄</button>
        </div>
      </div>

      <section className="card">
        <h2>體重趨勢</h2>
        {pts.length >= 2 ? <WeightChart points={pts} /> : <div className="empty-note">紀錄至少 2 次先有趨勢圖</div>}
        {pts.length ? (
          <div className="measure-table">
            {[...pts].reverse().map((p) => (
              <div key={p.date} className="measure-row">
                <span>{p.date}</span>
                <b>{fmt(p.weight)}</b>
                <button className="icon-btn danger" onClick={() => deleteMeasurement(p.date)}>✕</button>
              </div>
            ))}
          </div>
        ) : <div className="empty-note">未有紀錄</div>}
      </section>
    </div>
  )
}
