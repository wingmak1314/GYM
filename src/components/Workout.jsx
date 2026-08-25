import React, { useMemo, useRef, useState } from 'react'
import { EXERCISES, MUSCLES } from '../exercises.js'
import { detectPR, lastWorkoutFor, workoutVolume, workoutSets, workoutReps } from '../engine.js'
import { valueTier, suggestNextWeight, PLANS } from '../aiCoach.js'
import ExerciseIcon from '../icons.jsx'

const PR_TYPE = { weight: '重量PR', e1rm: '1RM PR', volume: '量PR' }

function SetRow({ ctx, ex, exIdx, setIdx, set, refs }) {
  const { state, toKg } = ctx
  const [pr, setPr] = useState(() => (set.kg && set.reps ? detectPR(state.workouts, ex.exerciseId, set.kg, set.reps, ctx.activeWorkout.date) : null))
  const kgRef = refs[`kg-${exIdx}-${setIdx}`]
  const repsRef = refs[`reps-${exIdx}-${setIdx}`]

  const update = (field, val) => {
    const kg = field === 'kg' ? val : set.kg
    const reps = field === 'reps' ? val : set.reps
    ctx.setActiveWorkout((w) => {
      const ws = w.exercises.map((e, i) => i !== exIdx ? e : { ...e, sets: e.sets.map((s, j) => j !== setIdx ? s : { ...s, [field]: val }) })
      return { ...w, exercises: ws }
    })
    setPr(kg && reps ? detectPR(ctx.state.workouts, ex.exerciseId, kg, reps, ctx.activeWorkout.date) : null)
  }

  const onKey = (e, field) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (field === 'kg') {
        repsRef.current && repsRef.current.focus()
      } else {
        const kgv = set.kg, rv = set.reps
        if (kgv && rv) addSet()
        else kgRef.current && kgRef.current.focus()
      }
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); const t = refs[`kg-${exIdx}-${setIdx + 1}`]; t && t.focus() }
    if (e.key === 'ArrowUp') { e.preventDefault(); const t = refs[`kg-${exIdx}-${setIdx - 1}`]; t && t.focus() }
  }

  const addSet = () => {
    ctx.setActiveWorkout((w) => {
      const ws = w.exercises.map((e, i) => i !== exIdx ? e : { ...e, sets: [...e.sets, { kg: set.kg, reps: set.reps }] })
      return { ...w, exercises: ws }
    })
    setTimeout(() => {
      const t = refs[`kg-${exIdx}-${setIdx + 1}`]
      t && t.focus()
    }, 30)
  }

  const removeSet = () => {
    ctx.setActiveWorkout((w) => {
      const ws = w.exercises.map((e, i) => i !== exIdx ? e : { ...e, sets: e.sets.filter((_, j) => j !== setIdx) })
      return { ...w, exercises: ws }
    })
  }

  return (
    <div className={`set-row ${set.kg || set.reps ? 'filled' : ''}`}>
      <span className="set-num">{setIdx + 1}</span>
      <input
        ref={kgRef} className="inp inp-sm num" inputMode="decimal" placeholder="kg"
        value={set.kg ?? ''} onChange={(e) => update('kg', e.target.value)} onKeyDown={(e) => onKey(e, 'kg')}
      />
      <span className="times">×</span>
      <input
        ref={repsRef} className="inp inp-sm num" inputMode="numeric" placeholder="reps"
        value={set.reps ?? ''} onChange={(e) => update('reps', e.target.value)} onKeyDown={(e) => onKey(e, 'reps')}
      />
      {pr && <span className={`pr-tag ${pr}`}>{PR_TYPE[pr]}</span>}
      {setIdx > 0 && <button className="icon-btn danger" onClick={removeSet} title="刪除呢組">✕</button>}
    </div>
  )
}

function ExerciseBlock({ ctx, ex, exIdx, refs }) {
  const { state, setActiveWorkout } = ctx
  const last = lastWorkoutFor(state.workouts, ex.exerciseId)
  const suggest = suggestNextWeight(last)
  const addSet = () => {
    const prev = ex.sets.length ? ex.sets[ex.sets.length - 1] : { kg: '', reps: '' }
    setActiveWorkout((w) => {
      const ws = w.exercises.map((e, i) => i !== exIdx ? e : { ...e, sets: [...e.sets, { kg: prev.kg, reps: prev.reps }] })
      return { ...w, exercises: ws }
    })
  }
  const useSuggest = () => {
    setActiveWorkout((w) => {
      const ws = w.exercises.map((e, i) => i !== exIdx ? e : { ...e, sets: [...e.sets, { kg: suggest.kg, reps: suggest.reps }] })
      return { ...w, exercises: ws }
    })
  }
  const removeEx = () => {
    setActiveWorkout((w) => ({ ...w, exercises: w.exercises.filter((_, i) => i !== exIdx) }))
  }

  return (
    <div className="ex-block">
      <div className="ex-head">
        <div className="ex-title">
          <div className="ex-icon-wrap"><ExerciseIcon icon={ex.exerciseId || ex.name} size="md" /></div>
          <div>
            <b className="ex-name">{ex.name}</b>
            <div className="ex-tags">
              <span className="tag">{ex.muscle || ''}</span>
              {last ? <span className="tag last" title="上次訓練">上次 {last.map((s) => `${s.kg}×${s.reps}`).join(' ')}</span> : <span className="tag muted">無上次紀錄</span>}
            </div>
          </div>
        </div>
        <button className="icon-btn" onClick={removeEx} title="移除動作">✕</button>
      </div>
      {suggest && (
        <button className="suggest-hint" onClick={useSuggest} title="AI 教練建議下一組重量">
          💡 AI:{suggest.reason} — 撳一下加入
        </button>
      )}
      <div className="sets">
        {(ex.sets || []).map((s, j) => (
          <SetRow key={j} ctx={ctx} ex={ex} exIdx={exIdx} setIdx={j} set={s} refs={refs} />
        ))}
        {!ex.sets.length && <div className="empty-note">未加組 — 撳「＋ 加組」開始</div>}
      </div>
      <button className="btn btn-ghost btn-sm" onClick={addSet}>＋ 加組</button>
    </div>
  )
}

export default function Workout({ ctx }) {
  const { state, activeWorkout, setActiveWorkout, saveWorkout, saveTemplate, addCustomExercise, showToast } = ctx
  const [q, setQ] = useState('')
  const [muscle, setMuscle] = useState('')
  const [showTemplates, setShowTemplates] = useState(false)
  const [customOpen, setCustomOpen] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customMuscle, setCustomMuscle] = useState('胸')
  const [libOpen, setLibOpen] = useState(false)
  const refs = useRef({})

  const library = useMemo(() => {
    const all = [...EXERCISES, ...(state.customExercises || [])]
    const m = q.trim().toLowerCase()
    return all.filter((e) =>
      (!muscle || e.muscle === muscle) &&
      (!m || e.zh.toLowerCase().includes(m) || (e.en || '').toLowerCase().includes(m))
    )
  }, [q, muscle, state.customExercises])

  const activeIds = useMemo(() => new Set((activeWorkout?.exercises || []).map((e) => e.exerciseId)), [activeWorkout])

  if (!activeWorkout) {
    return (
      <div className="page">
        <header className="page-head"><h1>訓練</h1></header>
        <section className="card">
          <h2>🏋️ AI 訓練計劃庫 <span className="card-sub">撳計劃即開,全部係 2026 最高性價比編排</span></h2>
          <div className="plan-grid">
            {PLANS.map((p) => (
              <button key={p.id} className="plan-card" onClick={() => ctx.startWorkout({ name: p.name, exercises: p.exercises.map((e) => ({ exerciseId: e.exerciseId, name: (EXERCISES.find((x) => x.id === e.exerciseId) || {}).zh || e.exerciseId, muscle: (EXERCISES.find((x) => x.id === e.exerciseId) || {}).muscle || '' })) })}>
                <span className="p-level">{p.level}</span>
                <b>{p.name}</b>
                <span className="p-meta">{p.days} · {p.exercises.length} 個動作</span>
                <span className="p-desc">{p.desc}</span>
                <span className="p-ex">
                  {p.exercises.map((e) => (
                    <span key={e.exerciseId} className="p-ex-item">{`${(EXERCISES.find((x) => x.id === e.exerciseId) || {}).zh || ''} ${e.sets}×${e.reps}`}</span>
                  ))}
                </span>
              </button>
            ))}
          </div>
        </section>
        <section className="card center-card">
          <h2>或者自由開練</h2>
          <p className="muted">由課表開始、複製上次訓練,或者由零開始。</p>
          <div className="btn-row">
            <button className="btn btn-primary" onClick={() => ctx.startWorkout()}>開始空白訓練</button>
            <button className="btn btn-ghost" onClick={() => setShowTemplates(true)}>由課表開始</button>
            <button className="btn btn-ghost" onClick={() => { const w = state.workouts[state.workouts.length - 1]; w ? ctx.startWorkout({ name: w.name, exercises: w.exercises }) : showToast('未有舊訓練') }}>複製上次訓練</button>
          </div>
        </section>
        {showTemplates && (
          <section className="card">
            <h2>課表 <button className="btn btn-ghost btn-sm" onClick={() => setShowTemplates(false)}>收埋</button></h2>
            {state.templates.length ? (
              <div className="tpl-grid">
                {state.templates.map((t) => (
                  <button key={t.id} className="tpl-card" onClick={() => ctx.startWorkout(t)}>
                    <b>{t.name}</b><span>{t.exercises.length} 個動作</span>
                  </button>
                ))}
              </div>
            ) : <div className="empty-note">未有課表 — 訓練入面撳「儲存為課表」即可建立。</div>}
          </section>
        )}
      </div>
    )
  }

  const addExercise = (ex) => {
    if (activeIds.has(ex.id)) { showToast('動作已喺訓練入面'); return }
    setActiveWorkout((w) => ({
      ...w,
      exercises: [...w.exercises, { exerciseId: ex.id, name: ex.zh, muscle: ex.muscle, sets: [] }],
    }))
  }

  const vol = workoutVolume(activeWorkout)
  const sets = workoutSets(activeWorkout)
  const reps = workoutReps(activeWorkout)

  const libPanel = (
    <aside className={`library ${libOpen ? 'open' : ''}`}>
      <div className="lib-search">
        <input className="inp" placeholder="🔍 搜尋動作…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="chips">
        <button className={`chip ${muscle === '' ? 'on' : ''}`} onClick={() => setMuscle('')}>全部</button>
        {MUSCLES.map((m) => (
          <button key={m} className={`chip ${muscle === m ? 'on' : ''}`} onClick={() => setMuscle(m)}>{m}</button>
        ))}
      </div>
      <div className="lib-list">
        {library.map((e, i) => {
          const tier = valueTier(e.id)
          return (
            <button key={e.id} className={`lib-item ${activeIds.has(e.id) ? 'added' : ''}`} style={{ animationDelay: `${Math.min(i * 14, 300)}ms` }} onClick={() => { addExercise(e); setLibOpen(false) }}>
              <ExerciseIcon icon={e.id} size="sm" className={activeIds.has(e.id) ? 'gray' : ''} />
              <span className="li-main">
                <span className="li-name">{e.zh}</span>
                <span className="li-tags"><span className="tag">{e.muscle}</span><span className={`tag tier-${tier.label[0]}`}>性價比 {tier.label[0]}</span></span>
              </span>
            </button>
          )
        })}
        {!library.length && <div className="empty-note">搵唔到動作 — 可以自己加一個 ↓</div>}
      </div>
      {customOpen ? (
        <div className="custom-form">
          <input className="inp" placeholder="動作名稱(例:斜板彎舉)" value={customName} onChange={(e) => setCustomName(e.target.value)} />
          <select className="inp" value={customMuscle} onChange={(e) => setCustomMuscle(e.target.value)}>
            {MUSCLES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <button className="btn btn-ghost btn-sm" onClick={() => {
            if (!customName.trim()) return
            const ex = addCustomExercise(customName.trim(), customMuscle)
            setCustomName(''); setCustomOpen(false)
            setQ(customName.trim())
            setTimeout(() => addExercise(ex), 30)
          }}>✓ 加入動作庫</button>
        </div>
      ) : (
        <button className="btn btn-ghost btn-sm btn-block" onClick={() => setCustomOpen(true)}>＋ 自訂動作</button>
      )}
    </aside>
  )

  return (
    <div className="page workout-page">
      <header className="page-head">
        <h1>訓練</h1>
        <div className="head-actions">
          <input className="inp inp-date" type="date" value={activeWorkout.date} onChange={(e) => setActiveWorkout((w) => ({ ...w, date: e.target.value }))} />
          <input className="inp inp-name" placeholder="訓練名稱(可留空)" value={activeWorkout.name} onChange={(e) => setActiveWorkout((w) => ({ ...w, name: e.target.value }))} />
          <button className="btn btn-ghost" onClick={() => saveTemplate(activeWorkout.name || '未命名課表', activeWorkout.exercises.map((e) => ({ exerciseId: e.exerciseId, name: e.name, muscle: e.muscle })))}>儲存為課表</button>
          <button className="btn btn-primary" onClick={() => saveWorkout(activeWorkout)}>✓ 完成訓練</button>
        </div>
      </header>

      <div className={`lib-scrim ${libOpen ? 'show' : ''}`} onClick={() => setLibOpen(false)} />

      <div className="workout-layout">
        {libPanel}
        <div className="workout-main">
          <button className="lib-open-btn" onClick={() => setLibOpen(!libOpen)}>
            {libOpen ? '▾ 收埋動作庫' : `＋ 動作庫 (已加 ${activeWorkout.exercises.length} 個動作)`}
          </button>
          {!activeWorkout.exercises.length && (
            <div className="card center-card">
              <h2>未加動作</h2>
              <p className="muted">喺左邊動作庫撳一下動作,就會加入訓練。Enter 快速紀錄:重量 → Enter → 次數 → Enter 自動開下一組。</p>
            </div>
          )}
          <div className="ex-list">
            {activeWorkout.exercises.map((ex, i) => (
              <ExerciseBlock key={ex.exerciseId + i} ctx={ctx} ex={ex} exIdx={i} refs={refs.current} />
            ))}
          </div>
          <div className="workout-summary">
            <span>訓練量 <b>{vol.toLocaleString()} kg</b></span>
            <span>組數 <b>{sets}</b></span>
            <span>總次數 <b>{reps}</b></span>
          </div>
        </div>
      </div>
    </div>
  )
}
