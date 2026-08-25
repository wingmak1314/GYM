import { describe, it, expect } from 'vitest'
import { valueTier, suggestToday, suggestNextWeight, PLANS, formCues, GOALS, computeAchievements } from './aiCoach.js'
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
  it('有至少 5 個計劃,動作全部存在於動作庫', () => {
    expect(PLANS.length).toBeGreaterThanOrEqual(5)
    const ids = new Set(EXERCISES.map((e) => e.id))
    for (const p of PLANS) {
      expect(p.exercises.length).toBeGreaterThanOrEqual(4)
      for (const e of p.exercises) expect(ids.has(e.exerciseId)).toBe(true)
    }
  })
  it('新手計劃包含核心複合動作(深蹲或俯臥撐)', () => {
    const beginner = PLANS.filter((p) => p.level === '新手')
    expect(beginner.length).toBeGreaterThanOrEqual(3)
    for (const p of beginner) {
      const ids = p.exercises.map((e) => e.exerciseId)
      expect(ids.some((id) => id === 'squat' || id === 'pushup')).toBe(true)
    }
  })
})

describe('動作提示', () => {
  it('深蹲有 3 條提示', () => expect(formCues('squat', '股四頭').length).toBe(3))
  it('冇特定提示 → 肌群通用提示', () => expect(formCues('zzz-not-exist', '二頭').length).toBeGreaterThan(0))
})

describe('目標', () => {
  it('三種目標都有建議次數', () => {
    for (const g of Object.keys(GOALS)) expect(GOALS[g].reps).toBeTruthy()
  })
})

describe('成就', () => {
  const d = (n) => {
    const x = new Date(); x.setDate(x.getDate() - n)
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
  }
  it('冇訓練 → 冇成就', () => expect(computeAchievements({ workouts: [] })).toHaveLength(0))
  it('3 日連續 + 10 次訓練 → 有成就', () => {
    const ws = []
    for (let i = 0; i < 10; i++) ws.push({ id: i, date: d(i), name: 't', exercises: [{ exerciseId: 'bench', name: 'x', muscle: '胸', sets: [{ kg: 60, reps: 8 }] }] })
    const a = computeAchievements({ workouts: ws })
    expect(a.length).toBeGreaterThan(0)
    expect(a.some((x) => x.name.includes('連續') || x.name.includes('streak'))).toBe(true)
  })
})
