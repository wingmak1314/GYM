import React, { useRef, useState } from 'react'
import { exportCSV, parseCSV } from '../engine.js'
import { GOALS } from '../aiCoach.js'
import { pushToGist, pullFromGist, ghWhoami, friendlyGhError } from '../ghSync.js'

export default function Settings({ ctx }) {
  const { state, setState, unit, showToast } = ctx
  const fileRef = useRef(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const [installEvt, setInstallEvt] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [status, setStatus] = useState('')
  const [statusType, setStatusType] = useState('ok')

  const setSt = (msg, err = false) => { setStatus(msg); setStatusType(err ? 'err' : 'ok') }

  const doPush = async () => {
    setSyncing(true); setSt('上傳緊…')
    try {
      const r = await pushToGist(state, state.settings.ghToken, state.settings.ghGistId)
      const ts = new Date().toLocaleString('zh-HK')
      setState((s) => ({ ...s, settings: { ...s.settings, ghGistId: r.gistId, lastSync: ts } }))
      setSt(`✅ 已備份${r.created ? '(已建立私人 Gist)' : ''} (${ts})`)
      showToast('✅ 已備份到 GitHub')
    } catch (e) {
      setSt(`❌ ${friendlyGhError(e)}`, true)
    } finally { setSyncing(false) }
  }

  const doPull = async () => {
    setSyncing(true); setSt('下載緊…')
    try {
      const data = await pullFromGist(state.settings.ghToken, state.settings.ghGistId)
      const n = (data.workouts || []).length
      setState((s) => ({ ...s, ...data, settings: { ...s.settings, ...(data.settings || {}), ghToken: s.settings.ghToken, ghGistId: s.settings.ghGistId, lastSync: new Date().toLocaleString('zh-HK') } }))
      setSt(`✅ 已回復 ${n} 次訓練`)
      showToast(`✅ 已從 GitHub 回復 (${n} 次訓練)`)
    } catch (e) {
      setSt(`❌ ${friendlyGhError(e)}`, true)
    } finally { setSyncing(false) }
  }

  const doCheck = async () => {
    setSyncing(true); setSt('驗證緊 Token…')
    try {
      const login = await ghWhoami(state.settings.ghToken)
      setSt(`✅ Token 有效 — ${login}`)
    } catch (e) {
      setSt(`❌ ${friendlyGhError(e)}`, true)
    } finally { setSyncing(false) }
  }

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
        <h2>💾 GitHub 備份 <span className="card-sub">資料直接存喺你嘅 GitHub(私人 Gist)</span></h2>
        <p className="muted small">
          GitHub 規定寫入一定要憑證,所以要做一次(約 30 秒,之後就唔使再理):<br />
          ① 開 <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>github.com/settings/tokens</a> → 撳「Generate new token」,揀 <b>Tokens (classic)</b>(唔好用 fine-grained,佢唔支援 Gist)<br />
          ② Note 隨意填,Expiration 揀 <b>No expiration</b>,下面<b>淨係 tick「gist」</b>一格 → Generate token<br />
          ③ 複製 ghp_... 貼入下面 → 撳「🔌 驗證 Token」→「⬆ 備份到 GitHub」<br />
          Token 只會存喺你部機瀏覽器,唔會上傳;之後「自動備份」一開,每次完成訓練就自動存上你個 GitHub。
        </p>
        <div className="measure-form" style={{ marginTop: 10 }}>
          <input className="inp" type="password" placeholder="GitHub Token (ghp_...)" value={state.settings.ghToken || ''} onChange={(e) => setState((s) => ({ ...s, settings: { ...s.settings, ghToken: e.target.value.trim() } }))} style={{ flex: 1, minWidth: 220 }} />
        </div>
        <div className="btn-row" style={{ marginTop: 10 }}>
          <button className="btn btn-primary" onClick={doPush} disabled={syncing}>⬆ 備份到 GitHub</button>
          <button className="btn btn-ghost" onClick={doPull} disabled={syncing}>⬇ 從 GitHub 回復</button>
          <button className="btn btn-ghost" onClick={doCheck} disabled={syncing}>🔌 驗證 Token</button>
        </div>
        <div className="sync-status" style={{ marginTop: 8 }}>
          {status ? <span className={statusType === 'err' ? 'sync-err' : 'sync-ok'}>{status}</span> : null}
          {state.settings.lastSync ? <span className="muted small" style={{ marginLeft: 8 }}>上次備份:{state.settings.lastSync}</span> : null}
        </div>
        <label className="sync-toggle" style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={!!state.settings.autoGh} onChange={(e) => setState((s) => ({ ...s, settings: { ...s.settings, autoGh: e.target.checked } }))} />
          <span className="small">自動備份(每次完成訓練/紀錄後自動上傳)</span>
        </label>
      </section>

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
