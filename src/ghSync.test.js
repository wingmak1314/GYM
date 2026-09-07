import { describe, it, expect, vi, beforeEach } from 'vitest'
import { pushToRepo, pullFromRepo, ghCheck, friendlyGhError } from './ghSync.js'

const ok = (body) => ({ ok: true, status: 200, json: async () => body, text: async () => JSON.stringify(body) })

describe('GitHub repo 備份', () => {
  beforeEach(() => { vi.restoreAllMocks() })

  it('pushToRepo: 冇 sha → 直接 PUT(建立)', async () => {
    const calls = []
    global.fetch = vi.fn((url, opt) => {
      calls.push({ url, method: opt.method })
      if (opt.method === 'GET' && url.includes('contents/gymlog-data.json')) {
        return Promise.resolve({ ok: false, status: 404, text: async () => 'Not Found' })
      }
      return Promise.resolve(ok({ commit: { sha: 'abc123' } }))
    })
    const r = await pushToRepo({ workouts: [] }, 'tok')
    expect(r.created).toBe(true)
    const put = calls.find(c => c.method === 'PUT')
    expect(put.url).toContain('repos/wingmak1314/GYM/contents/gymlog-data.json')
  })

  it('pushToRepo: 有 sha → 帶 sha PUT(更新)', async () => {
    let putBody = null
    global.fetch = vi.fn((url, opt) => {
      if (opt.method === 'GET') return Promise.resolve(ok({ sha: 'oldsha' }))
      putBody = JSON.parse(opt.body)
      return Promise.resolve(ok({ commit: { sha: 'newsha' } }))
    })
    const r = await pushToRepo({ workouts: [{ id: 1 }] }, 'tok')
    expect(r.created).toBe(false)
    expect(putBody.sha).toBe('oldsha')
    expect(putBody.branch).toBe('data')
  })

  it('pullFromRepo: 解碼 base64 內容', async () => {
    const data = { workouts: [{ id: 7 }] }
    global.fetch = vi.fn().mockResolvedValue(ok({ content: btoa(unescape(encodeURIComponent(JSON.stringify(data)))), encoding: 'base64' }))
    const r = await pullFromRepo('tok')
    expect(r.workouts[0].id).toBe(7)
  })

  it('ghCheck: 冇 push 權限 → throw', async () => {
    global.fetch = vi.fn().mockResolvedValue(ok({ full_name: 'wingmak1314/GYM', permissions: { push: false } }))
    await expect(ghCheck('tok')).rejects.toThrow('權限')
  })

  it('ghCheck: OK 回傳 repo 名', async () => {
    global.fetch = vi.fn((url) => {
      if (url.includes('/git/ref/')) return Promise.resolve(ok({ object: { sha: 'x' } }))
      return Promise.resolve(ok({ full_name: 'wingmak1314/GYM', permissions: { push: true } }))
    })
    const r = await ghCheck('tok')
    expect(r).toBe('wingmak1314/GYM')
  })

  it('sanitize: state 入面嘅 ghToken 唔會寫入備份(409 secret scanning)', async () => {
    let putBody = null
    global.fetch = vi.fn((url, opt) => {
      if (opt.method === 'GET') return Promise.resolve(ok({ sha: 'oldsha' }))
      putBody = JSON.parse(opt.body)
      return Promise.resolve(ok({ commit: { sha: 'new' } }))
    })
    await pushToRepo({ workouts: [], settings: { ghToken: 'github_pat_SECRET123', goal: '增肌' } }, 'tok')
    const decoded = JSON.parse(decodeURIComponent(escape(atob(putBody.content))))
    expect(decoded.settings.ghToken).toBeUndefined()
    expect(decoded.settings.goal).toBe('增肌') // 其他設定保留
    expect(JSON.stringify(putBody)).not.toContain('github_pat_SECRET123')
  })

  it('friendlyGhError 對應', () => {
    expect(friendlyGhError(new Error('GitHub 401: bad'))).toContain('過期')
    expect(friendlyGhError(new Error('GitHub 403: x'))).toContain('Contents')
  })

  it('冇 token → throw', async () => {
    await expect(pushToRepo({}, '')).rejects.toThrow('Token')
    await expect(pullFromRepo('')).rejects.toThrow('Token')
  })
})
