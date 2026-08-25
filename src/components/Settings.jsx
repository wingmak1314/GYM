import React, { useRef, useState } from 'react'
import { exportCSV, parseCSV } from '../engine.js'
import { GOALS } from '../aiCoach.js'

export default function Settings({ ctx }) {
  const { state, setState, unit, showToast } = ctx
  const fileRef = useRef(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const [installEvt, setInstallEvt] = useState(null)

  React.useEffect(() => {
    const h = (e) => { e.preventDefault(); setInstallEvt(e) }
    window.addEventListener('beforeinstallprompt', h)
    return () => window.removeEventListener('beforeinstallprompt', h)
  }, [])

  const doExport = () => {
    const csv = exportCSV(state)
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `gymlog-export-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
    showToast('✅ CSV 已匯出')
  }

  const doImport = (file) => {
    const reader = new FileReader()
    reader.onload = () => {
      const { workouts, errors } = parseCSV(String(reader.result))
      if (!workouts.length) { showToast(errors[0] || '匯入失敗'); return }
      setState((s) => ({ ...s, workouts: [...s.workouts, ...workouts].sort((a, b) => a.date.localeCompare(b.date)) }))
      showToast(`✅ 匯入 ${workouts.length} 次訓練${errors.length ? `(${errors.length} 行跳過)` : ''}`)
    }
    reader.readAsText(file)
  }

  return (
    <div className="page">
      <header className="page-head"><h1>設定</h1></header>

      <section className="card">
        <h2>訓練目標 <span className="card-sub">AI 教練會跟住調整建議次數</span></h2>
        <div className="seg">
          {Object.keys(GOALS).map((g) => (
            <button key={g} className={`seg-btn ${(state.settings.goal || '增肌') === g ? 'on' : ''}`} onClick={() => setState((s) => ({ ...s, settings: { ...s.settings, goal: g } }))}>
              {g} <span className="small" style={{ opacity: 0.75 }}>({GOALS[g].reps})</span>
            </button>
          ))}
        </div>
        <p className="muted small" style={{ marginTop: 8 }}>{GOALS[state.settings.goal || '增肌']?.note}</p>
      </section>

      <section className="card">
        <h2>單位</h2>
        <div className="seg">
          <button className={`seg-btn ${unit === 'kg' ? 'on' : ''}`} onClick={() => setState((s) => ({ ...s, settings: { ...s.settings, unit: 'kg' } }))}>公斤 kg</button>
          <button className={`seg-btn ${unit === 'lb' ? 'on' : ''}`} onClick={() => setState((s) => ({ ...s, settings: { ...s.settings, unit: 'lb' } }))}>磅 lb</button>
        </div>
      </section>

      <section className="card">
        <h2>資料</h2>
        <p className="muted">所有資料只存喺你嘅瀏覽器(localStorage),唔會上傳任何伺服器。想搬機或備份,用 CSV 匯出。</p>
        <div className="btn-row">
          <button className="btn btn-primary" onClick={doExport}>⬇ 匯出 CSV</button>
          <button className="btn btn-ghost" onClick={() => fileRef.current.click()}>⬆ 匯入 CSV</button>
          <input ref={fileRef} type="file" accept=".csv,text/csv" style={{ display: 'none' }} onChange={(e) => { if (e.target.files[0]) doImport(e.target.files[0]); e.target.value = '' }} />
        </div>
        <p className="muted small">支援 GymLog / Hevy / Strong 格式嘅 CSV。</p>
      </section>

      {installEvt && (
        <section className="card">
          <h2>安裝 App</h2>
          <p className="muted">將 GymLog 安裝到主畫面,當原生 App 用,仲可以離線紀錄。</p>
          <button className="btn btn-primary" onClick={() => { installEvt.prompt(); installEvt.userChoice.then(() => setInstallEvt(null)) }}>📲 安裝 GymLog</button>
        </section>
      )}

      <section className="card danger-zone">
        <h2>危險區域</h2>
        {!confirmClear ? (
          <button className="btn btn-danger" onClick={() => setConfirmClear(true)}>清空全部資料</button>
        ) : (
          <div className="btn-row">
            <span className="muted">確定?會刪除所有訓練同量測,冇得復原。</span>
            <button className="btn btn-danger" onClick={() => {
              try { localStorage.removeItem('gymlog_v1') } catch {}
              location.reload()
            }}>確認清空</button>
            <button className="btn btn-ghost" onClick={() => setConfirmClear(false)}>取消</button>
          </div>
        )}
      </section>

      <section className="card">
        <h2>關於</h2>
        <p className="muted">GymLog — 免費健身追蹤,參考 Gainflow 概念整成。紀錄訓練 · 追蹤 PR · 分析進度。免安裝、無廣告、資料屬於你。</p>
      </section>
    </div>
  )
}
