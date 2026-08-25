// 雲端備份 — getpantry.cloud (免費 JSON 雲端,唔使 token / email / NAS)
// 用法:喺 getpantry.cloud 攞一個 Pantry ID(2 秒,唔使註冊),
//      喺 app 打個名(例如 WING)做 basket 名,資料就以你個名存上雲端。
// API(全部支援 CORS,GitHub Pages 直接用得):
//   GET  /apiv1/pantry/<id>/basket/<name>
//   POST /apiv1/pantry/<id>/basket/<name>   (建立或取代)

const BASE = 'https://getpantry.cloud/apiv1/pantry'

async function req(method, url, body, timeout = 10000) {
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
      throw new Error(`雲端 ${res.status}: ${txt.slice(0, 100)}`)
    }
    return await res.json()
  } finally {
    clearTimeout(t)
  }
}

export function pantryUrl(pantryId, user) {
  return `${BASE}/${encodeURIComponent(pantryId)}/basket/${encodeURIComponent(user)}`
}

// 上傳(建立或取代 basket)
export async function pushState(state, pantryId, user) {
  if (!pantryId || !user) throw new Error('未設定 Pantry ID / 名字')
  const r = await req('POST', pantryUrl(pantryId, user), state)
  return r
}

// 下載
export async function pullState(pantryId, user) {
  if (!pantryId || !user) throw new Error('未設定 Pantry ID / 名字')
  return await req('GET', pantryUrl(pantryId, user))
}

// 測試:攞 basket 列表
export async function checkPantry(pantryId) {
  if (!pantryId) throw new Error('未設定 Pantry ID')
  const r = await req('GET', `${BASE}/${encodeURIComponent(pantryId)}`)
  return r
}
