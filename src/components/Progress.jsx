import React, { useMemo, useState } from 'react'
import { EXERCISES } from '../exercises.js'
import { exercisePRs, exerciseProgress } from '../engine.js'
import ExerciseIcon from '../icons.jsx'

function LineChart({ points, getY, fmt }) {
  const W = 560, H = 160, P = 8
  if (points.length < 2) return <div className="empty-note">需要至少 2 次訓練先有圖表</div>
  const max = Math.max(...points.map(getY)) * 1.1 || 1
  const min = Math.min(...points.map(getY)) * 0.9
  const x = (i) => P + (i * (W - P * 2)) / Math.max(1, points.length - 1)
  const y = (v) => H - P - ((v - min) / (max - min)) * (H - P * 2)
  const line = points.map((p, i) => `${x(i)},${y(getY(p))}`).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="linechart" preserveAspectRatio="none">
      <line x1={P} y1={y(min)} x2={W - P} y2={y(min)} stroke="#23262e" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(getY(p))} r="3.5" fill="#c7f546">
            <title>{`${p.date}: ${fmt(getY(p))}`}</title>
          </circle>
        </g>
      ))}
      <polyline points={line} fill="none" stroke="#c7f546" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

export default function Progress({ ctx }) {
  const { state, fmt } = ctx
  const [sel, setSel] = useState('')
  const usedIds = useMemo(() => {
    const ids = new Set()
    for (const w of state.workouts) for (const ex of w.exercises) if (ex.exerciseId) ids.add(ex.exerciseId)
    return ids
  }, [state.workouts])
  const options = useMemo(() => {
    const lib = new Map(EXERCISES.map((e) => [e.id, e]))
    const names = {}
    for (const w of state.workouts) for (const ex of w.exercises) if (ex.exerciseId) names[ex.exerciseId] = ex.name
    return [...usedIds].map((id) => ({ id, zh: (lib.get(id) || {}).zh || names[id] || id })).sort((a, b) => a.zh.localeCompare(b.zh))
  }, [usedIds, state.workouts])

  const id = sel || options[0]?.id || ''
  const prs = exercisePRs(state.workouts, id)
  const pts = exerciseProgress(state.workouts, id)
  const name = options.find((o) => o.id === id)?.zh || ''

  return (
    <div className="page">
      <header className="page-head">
        <h1>進度</h1>
        {id && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="ex-icon-wrap"><ExerciseIcon icon={id} size="md" /></div>
            <select className="inp" value={id} onChange={(e) => setSel(e.target.value)} style={{ maxWidth: 260 }}>
              {options.length === 0 && <option value="">—</option>}
              {options.map((o) => <option key={o.id} value={o.id}>{o.zh}</option>)}
            </select>
          </div>
        )}
      </header>

      {!id ? (
        <div className="card center-card"><h2>未有動作數據</h2><p className="muted">紀錄訓練之後,每個動作嘅進度圖會喺度顯示。</p></div>
      ) : (
        <>
          <div className="stat-cards">
            <div className="stat-card"><span className="stat-label">最佳重量</span><b>{prs.kg}</b><span className="stat-sub">kg{prs.kgDate ? ` · ${prs.kgDate.slice(5)}` : ''}</span></div>
            <div className="stat-card"><span className="stat-label">估算 1RM</span><b>{prs.e1rm}</b><span className="stat-sub">kg{prs.e1rmDate ? ` · ${prs.e1rmDate.slice(5)}` : ''}</span></div>
            <div className="stat-card"><span className="stat-label">單組最大訓練量</span><b>{Math.round(prs.vol)}</b><span className="stat-sub">kg</span></div>
          </div>
          <section className="card">
            <h2>{name} · 進度 <span className="card-sub">估算 1RM(黃線=最佳重量)</span></h2>
            <LineChart points={pts} getY={(p) => p.e1rm} fmt={(v) => `${v} kg`} />
          </section>
          <section className="card">
            <h2>訓練紀錄 <span className="card-sub">{pts.length} 次</span></h2>
            <div className="hist-sets wrap">
              {pts.map((p, i) => (
                <span key={i} className="hist-set wide" title={`${p.date}`}>
                  <ExerciseIcon icon={id} size="sm" className="gray" /> {p.date.slice(5)} · 最高 {p.kg} kg · e1RM {p.e1rm}
                </span>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
