import { describe, it, expect, vi, beforeEach } from 'vitest'
import { pushToGist, pullFromGist, ghWhoami } from './ghSync.js'

const ok = (body) => ({ ok: true, status: 200, json: async () => body, text: async () => JSON.stringify(body) })

describe('GitHub Gist 備份', () => {
  beforeEach(() => { vi.restoreAllMocks() })

  it('冇 gist id → POST 建立 private gist', async () => {
    const spy = vi.fn().mockResolvedValue(ok({ id: 'abc123', files: {} }))
    global.fetch = spy
    const r = await pushToGist({ workouts: [] }, 'tok', '')
    expect(spy).toHaveBeenCalledWith('https://api.github.com/gists', expect.objectContaining({ method: 'POST' }))
    const body = JSON.parse(spy.mock.calls[0][1].body)
    expect(body.public).toBe(false)
    expect(body.files['gymlog.json'].content).toContain('workouts')
    expect(r).toEqual({ gistId: 'abc123', created: true })
  })

  it('有 gist id → PATCH 更新同一個', async () => {
    const spy = vi.fn().mockResolvedValue(ok({ id: 'abc123' }))
    global.fetch = spy
    const r = await pushToGist({ workouts: [] }, 'tok', 'abc123')
    expect(spy).toHaveBeenCalledWith('https://api.github.com/gists/abc123', expect.objectContaining({ method: 'PATCH' }))
    expect(r.created).toBe(false)
  })

  it('pullFromGist 攞返 gymlog.json 內容', async () => {
    global.fetch = vi.fn().mockResolvedValue(ok({ files: { 'gymlog.json': { content: '{"workouts":[{"id":1}]}' } } }))
    const data = await pullFromGist('tok', 'abc123')
    expect(data.workouts).toHaveLength(1)
  })

  it('Gist 冇 gymlog.json → throw', async () => {
    global.fetch = vi.fn().mockResolvedValue(ok({ files: {} }))
    await expect(pullFromGist('tok', 'abc123')).rejects.toThrow('gymlog.json')
  })

  it('ghWhoami 攞用戶名', async () => {
    global.fetch = vi.fn().mockResolvedValue(ok({ login: 'wingmak1314' }))
    expect(await ghWhoami('tok')).toBe('wingmak1314')
  })

  it('token 冇效 → throw 明確錯誤', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 401, text: async () => 'Bad credentials' })
    await expect(ghWhoami('bad')).rejects.toThrow('401')
  })
})
