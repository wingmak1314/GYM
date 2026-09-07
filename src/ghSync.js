// 雲端備份 — GitHub repo(你自己的 repo,data branch)
// 原理:用 GitHub Contents API 將 gymlog-data.json 寫入 wingmak1314/GYM repo 嘅 data branch。
// 需要:一條有「GYM repo → Contents: Read and write」權限嘅 fine-grained token。
// 之前 Gist 方案失敗係因為 token 冇 gist scope;Contents API 唔使 gist scope。

const API = 'https://api.github.com'
const REPO = 'wingmak1314/GYM'
const BRANCH = 'data'
const FILE = 'gymlog-data.json'

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

// 攞 file sha(要 update 一定要帶 sha)
async function getFileSha(token) {
  const r = await ghReq(token, `/repos/${REPO}/contents/${FILE}?ref=${BRANCH}`, 'GET')
  return r.sha
}

// 上傳(自動建立或更新)
// ⚠️ GitHub Secret Scanning 會擋內容含有 token 字串嘅 commit (409),
//    所以備份前一定先將 ghToken 剔走,回復嗰陣會保留本地嗰個 (Settings.jsx 處理)
function sanitize(state) {
  const clean = JSON.parse(JSON.stringify(state))
  if (clean.settings) {
    delete clean.settings.ghToken
    // 任何其他疑似 token 欄位都剔走
    for (const k of Object.keys(clean.settings)) {
      if (typeof clean.settings[k] === 'string' && clean.settings[k].startsWith('github_pat_')) delete clean.settings[k]
    }
  }
  return clean
}

export async function pushToRepo(state, token) {
  if (!token) throw new Error('未設定 GitHub Token')
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(sanitize(state))))) // UTF-8 safe base64
  const body = { message: 'GymLog 自動備份 ' + new Date().toISOString().slice(0, 16), content, branch: BRANCH }
  try {
    body.sha = await getFileSha(token)
  } catch (e) {
    if (!String(e.message).includes('404')) throw e
    // 404 = file 未存在,直接 create
  }
  const r = await ghReq(token, `/repos/${REPO}/contents/${FILE}`, 'PUT', body)
  return { sha: r.commit.sha, created: !body.sha }
}

// 下載
export async function pullFromRepo(token) {
  if (!token) throw new Error('未設定 GitHub Token')
  const r = await ghReq(token, `/repos/${REPO}/contents/${FILE}?ref=${BRANCH}`, 'GET')
  if (!r.content) throw new Error('搵唔到 gymlog-data.json(data branch)')
  const json = decodeURIComponent(escape(atob(r.content.replace(/\n/g, ''))))
  return JSON.parse(json)
}

// 驗證 token:確認有 repo read + 檢查 data branch 存在
export async function ghCheck(token) {
  if (!token) throw new Error('未設定 GitHub Token')
  const repo = await ghReq(token, `/repos/${REPO}`, 'GET')
  if (!repo.permissions || !repo.permissions.push) throw new Error('Token 冇呢個 repo 嘅寫入權限(要 Contents: Read and write)')
  await ghReq(token, `/repos/${REPO}/git/ref/heads/${BRANCH}`, 'GET')
  return repo.full_name
}

// 將 401/403/404 轉做清楚提示
export function friendlyGhError(e) {
  const m = String(e.message || '')
  if (m.includes('401')) return 'Token 冇效或已過期 — 請去 GitHub 重新整過'
  if (m.includes('403')) return 'Token 冇寫入權限 — 要 tick「Contents: Read and write」'
  if (m.includes('404') && m.includes('branch')) return 'data branch 唔見咗 — 話俾我知,我幫你開返'
  if (m.includes('404')) return '搵唔到 repo — token 要有 GYM repo 存取權'
  if (m.includes('409')) return 'GitHub 擋咗呢次備份(內容有敏感字串)— 已修復版本就會正常,更新後再試'
  return m
}
