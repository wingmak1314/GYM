import { describe, it, expect } from 'vitest'
import { valueTier, suggestToday, suggestNextWeight, PLANS } from './aiCoach.js'
import { EXERCISES } from './exercises.js'

const wk = (date, exercises) => ({ id: date, date, name: 't', exercises })

describe('性價比評級', () => {
  it('複合動作 = S', () => expect(valueTier('squat').label[0]).toBe('S'))
  it('孤立動作 = B/C', () => {
    expect(valueTier('frontraise').label[0]).toBe('C')
    expect(valueTier('bbcurl').label[0]).toBe('B')
  })
  it('全部動作都有評級', () => {
    for (const e of EXERCISES) expect(['S', 'A', 'B', 'C']).toContain(valueTier(e.id).label[0])
  })
})

describe('今日建議', () => {
  it('無紀錄 → 建議深蹲', () => {
    const s = suggestToday({ workouts: [] })
    expect(s.exId).toBe('squat')
    expect(s.muscle).toBe('全身')
  })
  it('近 14 日只練胸 → 建議其他肌群', () => {
    const d = new Date(); d.setDate(d.getDate() - 2)
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const state = { workouts: [wk(iso, [{ exerciseId: 'bench', name: 'x', muscle: '胸', sets: [{ kg: 60, reps: 8 }] }])] }
    const s = suggestToday(state)
    expect(s.muscle).not.toBe('胸')
  })
})

describe('下組重量建議', () => {
  it('60kg×10 → 建議 62.5kg', () => {
    expect(suggestNextWeight([{ kg: 60, reps: 10 }]).kg).toBe(62.5)
  })
  it('冇數據 → null', () => expect(suggestNextWeight(null)).toBeNull())
})

describe('訓練計劃庫', () => {
  it('有至少 3 個計劃,動作全部存在於動作庫', () => {
    expect(PLANS.length).toBeGreaterThanOrEqual(3)
    const ids = new Set(EXERCISES.map((e) => e.id))
    for (const p of PLANS) {
      expect(p.exercises.length).toBeGreaterThanOrEqual(4)
      for (const e of p.exercises) expect(ids.has(e.exerciseId)).toBe(true)
    }
  })
})
