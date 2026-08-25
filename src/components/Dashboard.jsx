import React, { useMemo } from 'react'
import { buildHeatmap, weeklyVolume, muscleDistribution, detectPR, epley, workoutVolume, workoutSets } from '../engine.js'
import { suggestToday } from '../aiCoach.js'
import ExerciseIcon from '../icons.jsx'
import { EXERCISES } from '../exercises.js'

const MUSCLE_COLORS = {
  '胸': '#c7f546', '背': '#4db8ff', '肩': '#ff9f43', '二頭': '#ff6b9d',
  '三頭': '#a29bfe', '股四頭': '#00cec9', '腿後側': '#6c5ce7', '臀': '#fd79a8',
  '小腿': '#fdcb6e', '核心': '#74b9ff',
}

function Heatmap({ workouts, fmt }) {
  const cells = useMemo(() => {
    const map = buildHeatmap(workouts)
    const out = []
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const start = new Date(today); start.setDate(start.getDate() - 181)
    // 由星期日開始排,方便 GitHub 式星期行
    while (start.getDay() !== 0) start.setDate(start.getDate() - 1)
    for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      out.push({ key, count: map[key] || 0, isFuture: d > today })
    }
    return out
  }, [workouts])

  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  const max = Math.max(1, ...cells.map((c) => c.count))

  return (
    <div className="heatmap">
      <div className="hm-col">
        {['一', '', '三', '', '五', '', '日'].map((w, i) => <span key={i} className="hm-dow">{w}</span>)}
      </div>
      <div className="hm-grid">
        {weeks.map((wk, wi) => (
          <div key={wi} className="hm-week">
            {wk.map((c) => (
              <div key={c.key} className={`hm-cell ${c.isFuture ? 'future' : c.count === 0 ? '' : c.count >= max ? 'l4' : c.count >= max * 0.66 ? 'l3' : c.count >= max * 0.33 ? 'l2' : 'l1'}`} title={`${c.key}: ${c.count} 次訓練`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function BarChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.vol))
  return (
    <div className="barchart">
      {data.map((d, i) => (
        <div key={i} className="bar-col" title={`${d.label} 週: ${d.vol.toLocaleString()} kg · ${d.sessions} 次`}>
          <div className="bar-track">
            <div className={`bar ${d.sessions === 0 ? 'empty' : ''}`} style={{ height: `${Math.max(2, (d.vol / max) * 100)}%` }} />
          </div>
          <span className="bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

function RecentPRs({ state }) {
  const prs = useMemo(() => {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 14)
    const list = []
    for (const w of state.workouts) {
      const d = new Date(w.date + 'T00:00:00')
      if (d < cutoff) continue
      for (const ex of w.exercises) {
        for (const s of ex.sets || []) {
          const t = detectPR(state.workouts, ex.exerciseId, s.kg, s.reps, w.date)
          if (t) list.push({ date: w.date, name: ex.name, kg: s.kg, reps: s.reps, type: t })
        }
      }
    }
    return list.slice(-8).reverse()
  }, [state])
  if (!prs.length) return <div className="empty-note">近 14 日未有新 PR。去「訓練」紀錄第一組!🔥</div>
  const typeZh = { weight: '重量 PR', e1rm: '1RM PR', volume: '訓練量 PR' }
  return (
    <div className="pr-list">
      {prs.map((p, i) => (
        <div key={i} className="pr-row">
          <span className="pr-badge">{typeZh[p.type]}</span>
          <span className="pr-name">{p.name}</span>
          <span className="pr-val">{p.kg}kg × {p.reps}</span>
          <span className="pr-date">{p.date.slice(5)}</span>
        </div>
      ))}
    </div>
  )
}

function AiCoachCard({ state }) {
  const reco = useMemo(() => suggestToday(state), [state])
  const ex = EXERCISES.find((e) => e.id === reco.exId)
  const sTier = useMemo(() => {
    const S = ['squat', 'bench', 'deadlift', 'ohp', 'pullup', 'hipthrust']
    return S.map((id) => ({ id, zh: (EXERCISES.find((e) => e.id === id) || {}).zh || id }))
  }, [])
  return (
    <section className="card ai-card">
      <div className="ai-head">
        <span className="ai-badge"><span className="dot" /> AI 教練 · 2026</span>
        <span className="card-sub">基於你嘅訓練紀錄動態分析</span>
      </div>
      <div className="ai-row">
        <div className="ai-reco">
          <div className="ai-reco-icon"><ExerciseIcon icon={ex ? ex.id : 'generic'} size="md" /></div>
          <div>
            <b>今日建議:{reco.muscle}</b>
            <div style={{ color: 'var(--accent)', fontWeight: 600 }}>{ex ? ex.zh : reco.zh} — 最高性價比選擇</div>
            <p>{reco.reason}</p>
          </div>
        </div>
        <div className="ai-tier-list">
          <div style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: '0.08em' }}>性價比最高動作 (S 級)</div>
          {sTier.map((t) => (
            <div key={t.id} className="ai-tier-row">
              <span className="tier-badge S">S</span>
              <span>{t.zh}</span>
              <span className="ai-tier-reason" style={{ marginLeft: 'auto' }}>多肌群 · 高回報</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Dashboard({ ctx }) {
  const { state, fmt, stats, startWorkout } = ctx
  const vols = weeklyVolume(state.workouts, 12)
  const muscles = muscleDistribution(state.workouts, 7)
  const muscleRows = Object.entries(muscles).sort((a, b) => b[1] - a[1])
  const maxSets = Math.max(1, ...muscleRows.map(([, n]) => n))
  const hasData = state.workouts.length > 0

  return (
    <div className="page">
      <header className="page-head">
        <h1>儀表板</h1>
        <button className="btn btn-primary" onClick={() => startWorkout()}>＋ 開始訓練</button>
      </header>

      <AiCoachCard state={state} />

      <div className="stat-cards">
        <div className="stat-card"><span className="stat-label">本週訓練</span><b>{stats.sessions}</b><span className="stat-sub">次</span></div>
        <div className="stat-card"><span className="stat-label">本週訓練量</span><b>{stats.vol.toLocaleString()}</b><span className="stat-sub">kg</span></div>
        <div className="stat-card"><span className="stat-label">本週組數</span><b>{stats.sets}</b><span className="stat-sub">組</span></div>
        <div className="stat-card"><span className="stat-label">本週總次數</span><b>{stats.reps}</b><span className="stat-sub">下</span></div>
      </div>

      <section className="card">
        <h2>活動熱力圖 <span className="card-sub">過去半年</span></h2>
        {hasData ? <Heatmap workouts={state.workouts} fmt={fmt} /> : <div className="empty-note">未有訓練紀錄 — 熱力圖會喺你紀錄之後點亮 🔥</div>}
      </section>

      <div className="grid-2">
        <section className="card">
          <h2>每週訓練量 <span className="card-sub">近 12 週</span></h2>
          {state.workouts.length ? <BarChart data={vols} /> : <div className="empty-note">未有資料</div>}
        </section>
        <section className="card">
          <h2>肌群分布 <span className="card-sub">近 7 日 · 按組數</span></h2>
          {muscleRows.length ? (
            <div className="muscle-bars">
              {muscleRows.map(([m, n]) => (
                <div key={m} className="m-row">
                  <span className="m-name" style={{ color: MUSCLE_COLORS[m] || '#fff' }}>{m}</span>
                  <div className="m-track"><div className="m-bar" style={{ width: `${(n / maxSets) * 100}%`, background: MUSCLE_COLORS[m] || '#c7f546' }} /></div>
                  <span className="m-n">{n}</span>
                </div>
              ))}
            </div>
          ) : <div className="empty-note">未有資料</div>}
        </section>
      </div>

      <section className="card">
        <h2>最新個人紀錄 <span className="card-sub">近 14 日</span></h2>
        <RecentPRs state={state} />
      </section>
    </div>
  )
}
