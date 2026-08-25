// GitHub Gist 雲端備份 — 資料存喺你嘅 GitHub (private gist)
// 需要: classic PAT 淨係 tick「gist」scope(其他 scope 一律唔使)
// 第一次備份會自動建立 private gist,之後直接更新同一個

const API = 'https://api.github.com'
const FILE = 'gymlog.json'

async function ghReq(token, path, method, body) {
  const res = await fetch(API + path, {
    method,
    headers: {
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(`GitHub ${res.status}: ${t.slice(0, 140)}`)
  }
  return res.status === 204 ? null : res.json()
}

// 上傳:冇 gist id 就自動建立(private),有就更新
export async function pushToGist(state, token, gistId) {
  if (!token) throw new Error('未設定 GitHub Token')
  const content = JSON.stringify(state)
  const files = { [FILE]: { content } }
  if (gistId) {
    await ghReq(token, `/gists/${gistId}`, 'PATCH', { files })
    return { gistId, created: false }
  }
  const g = await ghReq(token, '/gists', 'POST', {
    description: 'GymLog 雲端備份 (自動生成)',
    public: false,
    files,
  })
  return { gistId: g.id, created: true }
}

// 下載:攞返 gist 入面嘅 gymlog.json
export async function pullFromGist(token, gistId) {
  if (!token || !gistId) throw new Error('未設定 Token 或 Gist')
  const g = await ghReq(token, `/gists/${gistId}`, 'GET')
  const f = g.files && g.files[FILE]
  if (!f || !f.content) throw new Error('Gist 入面搵唔到 gymlog.json')
  return JSON.parse(f.content)
}

// 驗證 token:測 /user + /gists(確保有 gist 權限)
// fine-grained token 唔支援 Gist API,要用 classic token 淨 tick gist
export async function ghWhoami(token) {
  if (!token) throw new Error('未設定 GitHub Token')
  const u = await ghReq(token, '/user', 'GET')
  // 測 gist 權限:冇 gist scope 會 401/403
  await ghReq(token, '/gists', 'GET')
  return u.login
}

// 將 401/403 轉做更清楚嘅提示
export function friendlyGhError(e) {
  const m = String(e.message || '')
  if (m.includes('401')) return 'Token 冇效或已過期 — 請重新整過(要 classic token)'
  if (m.includes('403')) return 'Token 冇 gist 權限 — 要「Tokens (classic)」並淨係 tick「gist」一格'
  return m
}
