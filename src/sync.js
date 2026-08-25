// 雲端備份 — 同 NAS sync server 通訊
// Server: GET/POST /data/<user>, body = 成個 state JSON

export const DEFAULT_SERVER = 'http://192.168.31.5:8001'

async function req(method, url, body, timeout = 8000) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeout)
  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    })
    if (!res.ok) {
      const txt = await res.text().catch(() => '')
      throw new Error(`伺服器回應 ${res.status}${txt ? ':' + txt.slice(0, 80) : ''}`)
    }
    return await res.json()
  } finally {
    clearTimeout(t)
  }
}

// 上傳:回傳 {ok, ts} 或者 throw
export async function pushState(state, server, user) {
  if (!server || !user) throw new Error('未設定伺服器/用戶名')
  const base = server.replace(/\/+$/, '')
  const r = await req('POST', `${base}/data/${encodeURIComponent(user)}`, state)
  if (!r || !r.ok) throw new Error('伺服器回覆異常')
  return r
}

// 下載:回傳 state object(伺服器冇資料就 throw)
export async function pullState(server, user) {
  if (!server || !user) throw new Error('未設定伺服器/用戶名')
  const base = server.replace(/\/+$/, '')
  const r = await req('GET', `${base}/data/${encodeURIComponent(user)}`)
  if (typeof r !== 'object' || r === null || Array.isArray(r)) throw new Error('伺服器資料格式錯誤')
  return r
}

// 檢查伺服器通唔通
export async function checkServer(server) {
  if (!server) throw new Error('未設定伺服器')
  const base = server.replace(/\/+$/, '')
  const r = await req('GET', `${base}/health`)
  if (!r || !r.ok) throw new Error('伺服器回應異常')
  return true
}
