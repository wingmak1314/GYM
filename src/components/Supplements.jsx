import React, { useMemo, useState } from 'react'

export default function Supplements({ ctx }) {
  const { state, toggleSupp, addSupp, showToast } = ctx
  const [newSupp, setNewSupp] = useState('')
  const today = ctx.todayStr()
  const doneToday = state.suppLog[today] || []
  const list = state.suppList

  const streak = useMemo(() => {
    const dates = Object.keys(state.suppLog).sort().reverse()
    if (!dates.length) return 0
    let s = 0
    const d = new Date(today + 'T00:00:00')
    for (const date of dates) {
      const dd = new Date(date + 'T00:00:00')
      if ((d - dd) / 86400000 !== s) break
      if ((state.suppLog[date] || []).length) s++
    }
    return s
  }, [state.suppLog, today])

  const last7 = useMemo(() => {
    const out = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today + 'T00:00:00')
      d.setDate(d.getDate() - i)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      out.push({ key, label: `${d.getMonth() + 1}/${d.getDate()}`, n: (state.suppLog[key] || []).length, all: (state.suppLog[key] || []).length === list.length })
    }
    return out
  }, [state.suppLog, today, list.length])

  const pct = list.length ? Math.round((doneToday.length / list.length) * 100) : 0

  return (
    <div className="page">
      <header className="page-head">
        <h1>補劑追蹤</h1>
        <span className="ai-badge"><span className="dot" /> 今日完成 {doneToday.length}/{list.length}</span>
      </header>

      <section className="card ai-card">
        <div className="ai-row">
          <div className="ai-reco" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <b>{today}</b>
              <span style={{ color: 'var(--accent)', fontWeight: 700 }}>🔥 連續 {streak} 日</span>
            </div>
            <div className="supp-progress">
              <div className="supp-progress-bar" style={{ width: `${pct}%` }} />
            </div>
            <p>每日完成率 {pct}% — 唔好斷,補劑靠規律先有效。</p>
          </div>
          <div className="ai-tier-list">
            <div style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: '0.08em' }}>過去 7 日</div>
            {last7.map((d) => (
              <div key={d.key} className="ai-tier-row">
                <span className="tier-badge S" style={d.all ? {} : { opacity: 0.35 }}>{d.n}</span>
                <span>{d.label}</span>
                <span className="ai-tier-reason" style={{ marginLeft: 'auto' }}>{d.all ? '✓ 完成' : d.n ? `${d.n} 項` : '—'}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="card">
        <h2>今日清單</h2>
        <div className="supp-grid">
          {list.map((name) => {
            const on = doneToday.includes(name)
            return (
              <button key={name} className={`supp-item ${on ? 'on' : ''}`} onClick={() => toggleSupp(today, name)}>
                <span className="supp-check">{on ? '✓' : ''}</span>
                <span>{name}</span>
              </button>
            )
          })}
        </div>
        <div className="measure-form" style={{ marginTop: 14 }}>
          <input className="inp" placeholder="加自訂補劑(例:肌酸丸)" value={newSupp} onChange={(e) => setNewSupp(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && doAdd()} />
          <button className="btn btn-ghost" onClick={doAdd}>＋ 加入</button>
        </div>
      </section>

      <section className="card">
        <h2>💡 補充劑小知識</h2>
        <ul className="supp-tips">
          <li><b>蛋白粉</b>:每日總蛋白攝取最重要,目標約 1.6–2.2g/kg 體重。</li>
          <li><b>肌酸</b>:唯一最多實證支持嘅增肌/力量補劑,每日 3–5g,唔使「負荷期」。</li>
          <li><b>魚油 / 維他命D</b>:飲食唔夠先補,唔係練前神器。</li>
          <li>補劑係輔助,訓練同飲食先係主體 — 唔好本末倒置。</li>
        </ul>
      </section>
    </div>
  )

  function doAdd() {
    const n = newSupp.trim()
    if (!n) return
    addSupp(n)
    setNewSupp('')
    showToast(`✅ 已加「${n}」`)
  }
}
