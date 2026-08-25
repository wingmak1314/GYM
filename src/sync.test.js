import { describe, it, expect, vi, beforeEach } from 'vitest'
import { pushState, pullState, checkServer } from './sync.js'

const ok = (body) => ({ ok: true, status: 200, json: async () => body, text: async () => JSON.stringify(body) })

describe('雲端備份 sync', () => {
  beforeEach(() => { vi.restoreAllMocks() })

  it('pushState POST 去正確 URL,body 係 state', async () => {
    const spy = vi.fn().mockResolvedValue(ok({ ok: true, bytes: 42, ts: 1 }))
    global.fetch = spy
    const r = await pushState({ workouts: [] }, 'http://nas:8001', 'WING')
    expect(spy).toHaveBeenCalledWith('http://nas:8001/data/WING', expect.objectContaining({ method: 'POST' }))
    expect(r.ok).toBe(true)
  })

  it('pullState GET 返 state', async () => {
    global.fetch = vi.fn().mockResolvedValue(ok({ workouts: [{ id: 1 }], measurements: [] }))
    const data = await pullState('http://nas:8001', 'WING')
    expect(data.workouts).toHaveLength(1)
  })

  it('伺服器 500 → throw 明確錯誤', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500, text: async () => 'boom' })
    await expect(pushState({}, 'http://nas:8001', 'WING')).rejects.toThrow()
  })

  it('冇用戶名 → throw', async () => {
    await expect(pushState({}, 'http://nas:8001', '')).rejects.toThrow('用戶名')
  })

  it('checkServer 用 /health', async () => {
    global.fetch = vi.fn().mockResolvedValue(ok({ ok: true }))
    await expect(checkServer('http://nas:8001')).resolves.toBe(true)
  })
})
