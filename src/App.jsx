import React, { useEffect, useMemo, useRef, useState } from 'react'
import { loadState, saveState } from './store.js'
import { uid, workoutVolume, workoutSets, workoutReps } from './engine.js'
import { pushToGist } from './ghSync.js'
import Dashboard from './components/Dashboard.jsx'
import Workout from './components/Workout.jsx'
import History from './components/History.jsx'
import Progress from './components/Progress.jsx'
import Measurements from './components/Measurements.jsx'
import Supplements from './components/Supplements.jsx'
import Settings from './components/Settings.jsx'

const TABS = [
  { id: 'dash', zh: '儀表板', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
  { id: 'workout', zh: '訓練', icon: 'M6 3h12v4h4v14H2V7h4V3zm2 4v12h8V7H8zm-4 0v12h2V7H4zm14 0v12h2V7h-2zM8 5v2h8V5H8z' },
  { id: 'history', zh: '歷史', icon: 'M12 2a10 10 0 100 20 10 10 0 000-20zm1 5h-2v6l5.2 3.1 1-1.7-4.2-2.5V7z' },
  { id: 'progress', zh: '進度', icon: 'M4 20V5h3v15H4zm7 0V9h3v11h-3zm7 0v-8h3v8h-3z' },
  { id: 'measure', zh: '量測', icon: 'M12 3l7 4v5c0 4.4-3 8.6-7 10-4-1.4-7-5.6-7-10V7l7-4zm0 2.2L7 8.2V12c0 3.2 2.1 6.3 5 7.6 2.9-1.3 5-4.4 5-7.6V8.2l-5-3z' },
  { id: 'supp', zh: '補劑', icon: 'M12 2a5 5 0 015 5v1h2v5h-2v7a3 3 0 01-3 3H10a3 3 0 01-3-3v-7H5V8h2V7a5 5 0 015-5zm0 2a3 3 0 00-3 3v1h6V7a3 3 0 00-3-3z' },
  { id: 'settings', zh: '設定', icon: 'M12 8a4 4 0 100 8 4 4 0 000-8zm9 4l2 1.5-2 1.5-.4 2.3 2.4 1-.9 2.4-2.5-.4-1.6 1.8-2.3-1-2.3 1-1.6-1.8-2.5.4-.9-2.4 2.4-1-.4-2.3L1 13.5 3 12l-2-1.5 2-1.5.4-2.3-2.4-1 .9-2.4 2.5.4L6 1.9 8.3 3l2.3-1 2.3 1L14.5 1.9l1.6 1.8 2.5-.4.9 2.4-2.4 1 .4 2.3L21 10.5 23 12z' },
]

export const KG_TO_LB = 2.20462

export default function App() {
  const [state, setState] = useState(() => loadState())
  const [tab, setTab] = useState('dash')
  const [activeWorkout, setActiveWorkout] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => { saveState(state) }, [state])

  const unit = state.settings.unit || 'kg'

  const fmt = (kg) => {
    const n = Number(kg) || 0
    if (unit === 'lb') return `${Math.round(n * KG_TO_LB)} lb`
    return `${Math.round(n * 10) / 10} kg`
  }
  const toKg = (v) => {
    const n = parseFloat(v)
    if (isNaN(n)) return 0
    return unit === 'lb' ? Math.round((n / KG_TO_LB) * 10) / 10 : n
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2200)
  }

  // 自動備份去 GitHub(開咗 autoGh 先會行,靜默,失敗唔騷擾)
  const autoSyncRef = useRef(null)
  const autoSync = (s) => {
    const cfg = s.settings || {}
    if (!cfg.autoGh || !cfg.ghToken) return
    if (autoSyncRef.current) clearTimeout(autoSyncRef.current)
    autoSyncRef.current = setTimeout(() => {
      pushToGist(s, cfg.ghToken, cfg.ghGistId).catch(() => {})
    }, 2000)
  }

  const todayStr = () => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  // ---- workout lifecycle ----
  const startWorkout = (template = null) => {
    const base = template || { name: '', exercises: [] }
    setActiveWorkout({
      id: uid(),
      date: todayStr(),
      name: base.name || '',
      exercises: (base.exercises || []).map((e) => ({ ...e, sets: (e.sets || []).map((s) => ({ ...s })) })),
    })
    setTab('workout')
  }

  const saveWorkout = (w) => {
    const hasSets = w.exercises.some((e) => (e.sets || []).length > 0)
    if (!hasSets) { showToast('未紀錄任何組數'); return }
    const clean = {
      ...w,
      name: w.name.trim() || '訓練',
      exercises: w.exercises
        .map((e) => ({ ...e, sets: (e.sets || []).filter((s) => (s.kg ?? '') !== '' || (s.reps ?? '') !== '') }))
        .filter((e) => e.sets.length > 0),
    }
    if (!clean.exercises.length) { showToast('未紀錄任何組數'); return }
    const next = { ...state, workouts: [...state.workouts.filter((x) => x.id !== clean.id), clean].sort((a, b) => a.date.localeCompare(b.date)) }
    setState(next)
    autoSync(next)
    setActiveWorkout(null)
    showToast('✅ 訓練已儲存')
    setTab('history')
  }

  const deleteWorkout = (id) => {
    setState((s) => ({ ...s, workouts: s.workouts.filter((w) => w.id !== id) }))
    showToast('已刪除')
  }

  const addMeasurement = (m) => {
    const next = { ...state, measurements: [...state.measurements.filter((x) => x.date !== m.date), m].sort((a, b) => a.date.localeCompare(b.date)) }
    setState(next)
    autoSync(next)
    showToast('✅ 已紀錄')
  }

  const deleteMeasurement = (date) => {
    setState((s) => ({ ...s, measurements: s.measurements.filter((m) => m.date !== date) }))
  }

  const saveTemplate = (name, exercises) => {
    setState((s) => ({ ...s, templates: [...s.templates, { id: uid(), name, exercises }] }))
    showToast('✅ 已儲存為課表')
  }

  const addCustomExercise = (zh, muscle) => {
    const ex = { id: 'custom-' + uid(), zh, en: '', muscle, equipment: '自訂' }
    setState((s) => ({ ...s, customExercises: [...(s.customExercises || []), ex] }))
    return ex
  }

  const toggleSupp = (date, name) => {
    const day = [...(state.suppLog[date] || [])]
    const i = day.indexOf(name)
    if (i >= 0) day.splice(i, 1); else day.push(name)
    const next = { ...state, suppLog: { ...state.suppLog, [date]: day } }
    setState(next)
    autoSync(next)
  }

  const addSupp = (name) => {
    setState((s) => (s.suppList.includes(name) ? s : { ...s, suppList: [...s.suppList, name] }))
  }

  const addPhoto = (photo) => {
    const next = { ...state, photos: [...(state.photos || []), photo] }
    setState(next)
    autoSync(next)
  }
  const deletePhoto = (id) => {
    setState((s) => ({ ...s, photos: (s.photos || []).filter((p) => p.id !== id) }))
  }

  const stats = useMemo(() => {
    const now = new Date(); now.setHours(0, 0, 0, 0)
    const dow = (now.getDay() + 6) % 7
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - dow)
    let sessions = 0, vol = 0, sets = 0, reps = 0
    for (const w of state.workouts) {
      const d = new Date(w.date + 'T00:00:00')
      if (d >= weekStart) { sessions++; vol += workoutVolume(w); sets += workoutSets(w); reps += workoutReps(w) }
    }
    return { sessions, vol: Math.round(vol), sets, reps }
  }, [state.workouts])

  const ctx = { state, setState, unit, fmt, toKg, showToast, tab, setTab, activeWorkout, setActiveWorkout, startWorkout, saveWorkout, deleteWorkout, addMeasurement, deleteMeasurement, saveTemplate, addCustomExercise, toggleSupp, addSupp, addPhoto, deletePhoto, stats, todayStr }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <svg className="logo-mark" viewBox="0 0 64 64" width="36" height="36">
            <defs>
              <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#c7f546" /><stop offset="1" stopColor="#4db8ff" />
              </linearGradient>
            </defs>
            <rect x="2" y="2" width="60" height="60" rx="15" fill="#0b0c10" stroke="rgba(199,245,70,0.25)" />
            <path d="M14 34h36v-4H14z" fill="url(#lg)" />
            <path d="M8 30h6v4H8zM50 30h6v4h-6z" fill="url(#lg)" />
            <rect x="20" y="12" width="4" height="10" rx="2" fill="url(#lg)" />
            <rect x="40" y="12" width="4" height="10" rx="2" fill="url(#lg)" />
            <rect x="20" y="42" width="4" height="10" rx="2" fill="url(#lg)" />
            <rect x="40" y="42" width="4" height="10" rx="2" fill="url(#lg)" />
          </svg>
          <div><b>GymLog</b><span>AI 健身追蹤</span></div>
        </div>
        <nav>
          {TABS.map((t) => (
            <button key={t.id} className={`nav-item ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={t.icon} /></svg>
              {t.zh}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <button className="btn btn-primary btn-block" onClick={() => startWorkout()}>＋ 開始訓練</button>
        </div>
      </aside>

      <main className="main">
        {tab === 'dash' && <Dashboard ctx={ctx} />}
        {tab === 'workout' && <Workout ctx={ctx} />}
        {tab === 'history' && <History ctx={ctx} />}
        {tab === 'progress' && <Progress ctx={ctx} />}
        {tab === 'measure' && <Measurements ctx={ctx} />}
        {tab === 'supp' && <Supplements ctx={ctx} />}
        {tab === 'settings' && <Settings ctx={ctx} />}
      </main>

      {toast && <div className="toast">{toast}</div>}

      <nav className="tabbar">
        {TABS.map((t) => (
          <button key={t.id} className={`tabbar-item ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={t.icon} /></svg>
            <span>{t.zh}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
