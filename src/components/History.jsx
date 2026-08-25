import React, { useMemo, useState } from 'react'
import { workoutVolume, workoutSets, workoutReps, epley } from '../engine.js'

function WorkoutDetail({ w, ctx }) {
  const [open, setOpen] = useState(false)
  const vol = workoutVolume(w)
  const sets = workoutSets(w)
  const reps = workoutReps(w)
  return (
    <div className="hist-item">
      <button className="hist-head" onClick={() => setOpen(!open)}>
        <div className="hist-main">
          <b>{w.name}</b>
          <span className="muted">{w.date} · {sets} 組 · {vol.toLocaleString()} kg · {reps} 下</span>
        </div>
        <span className={`chev ${open ? 'open' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="hist-body">
          {w.exercises.map((ex, i) => (
            <div key={i} className="hist-ex">
              <div className="hist-ex-head">
                <b>{ex.name}</b>
                {ex.muscle && <span className="tag">{ex.muscle}</span>}
              </div>
              <div className="hist-sets">
                {ex.sets.map((s, j) => (
                  <span key={j} className="hist-set">{s.kg} × {s.reps}</span>
                ))}
              </div>
            </div>
          ))}
          <div className="hist-actions">
            <button className="btn btn-ghost btn-sm" onClick={() => ctx.startWorkout({ name: w.name, exercises: w.exercises })}>複製成新訓練</button>
            <button className="btn btn-danger btn-sm" onClick={() => ctx.deleteWorkout(w.id)}>刪除</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function History({ ctx }) {
  const { state } = ctx
  const groups = useMemo(() => {
    const m = {}
    for (const w of state.workouts) {
      const k = w.date.slice(0, 7)
      ;(m[k] = m[k] || []).push(w)
    }
    return Object.entries(m).sort((a, b) => b[0].localeCompare(a[0]))
  }, [state.workouts])

  return (
    <div className="page">
      <header className="page-head"><h1>歷史</h1></header>
      {!state.workouts.length && <div className="card center-card"><h2>未有訓練紀錄</h2><p className="muted">完成第一次訓練之後,佢會出現喺呢度。</p></div>}
      {groups.map(([month, ws]) => (
        <section key={month} className="hist-group">
          <h2 className="hist-month">{month} <span className="card-sub">{ws.length} 次訓練</span></h2>
          {[...ws].reverse().map((w) => <WorkoutDetail key={w.id} w={w} ctx={ctx} />)}
        </section>
      ))}
    </div>
  )
}
