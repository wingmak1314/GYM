import { describe, it, expect, vi, beforeEach } from 'vitest'
import { pushState, pullState, checkPantry, pantryUrl } from './pantry.js'

const ok = (body) => ({ ok: true, status: 200, json: async () => body, text: async () => JSON.stringify(body) })

describe('Pantry 雲端備份', () => {
  beforeEach(() => { vi.restoreAllMocks() })

  it('pushState POST 去 pantry URL(名= basket)', async () => {
    const spy = vi.fn().mockResolvedValue(ok({ ok: true }))
    global.fetch = spy
    await pushState({ workouts: [] }, 'PAN123', 'WING')
    expect(spy).toHaveBeenCalledWith(
      'https://getpantry.cloud/apiv1/pantry/PAN123/basket/WING',
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('pullState GET 返 state', async () => {
    global.fetch = vi.fn().mockResolvedValue(ok({ workouts: [{ id: 1 }] }))
    const data = await pullState('PAN123', 'WING')
    expect(data.workouts).toHaveLength(1)
  })

  it('checkPantry GET pantry 列表', async () => {
    global.fetch = vi.fn().mockResolvedValue(ok({ baskets: ['WING'] }))
    const r = await checkPantry('PAN123')
    expect(r.baskets).toContain('WING')
  })

  it('冇 pantryId/名 → throw', async () => {
    await expect(pushState({}, '', 'WING')).rejects.toThrow('Pantry ID')
    await expect(pullState('PAN123', '')).rejects.toThrow('名字')
  })

  it('雲端 500 → throw 明確錯誤', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500, text: async () => 'boom' })
    await expect(pushState({}, 'PAN123', 'WING')).rejects.toThrow('500')
  })

  it('URL 正確編碼', () => {
    expect(pantryUrl('a b', 'WING 2')).toBe('https://getpantry.cloud/apiv1/pantry/a%20b/basket/WING%202')
  })
})
