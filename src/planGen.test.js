import { describe, it, expect } from 'vitest'
import { PLANS_300, generatePlans } from './planGen.js'
import { EXERCISES } from './exercises.js'
import { howTo } from './aiCoach.js'

const VALID = new Set(EXERCISES.map((e) => e.id))

describe('300 個訓練表生成器', () => {
  it('剛好生成 300 個計劃', () => {
    expect(PLANS_300).toHaveLength(300)
  })
  it('計劃 id 全部唯一', () => {
    const ids = new Set(PLANS_300.map((p) => p.id))
    expect(ids.size).toBe(300)
  })
  it('每個計劃:動作全部有效、至少 5 個動作、有等級/目標/天數', () => {
    for (const p of PLANS_300) {
      expect(p.exercises.length).toBeGreaterThanOrEqual(5)
      expect(['新手', '中階', '進階']).toContain(p.level)
      expect(['增肌', '力量', '減脂']).toContain(p.goal)
      expect([2, 3, 4, 5, 6]).toContain(p.days)
      for (const e of p.exercises) {
        expect(VALID.has(e.exerciseId)).toBe(true)
        expect(e.sets).toBeGreaterThan(0)
        expect(e.reps).toBeGreaterThan(0)
      }
    }
  })
  it('種子確定:每次生成一樣', () => {
    const a = generatePlans(50)
    const b = generatePlans(50)
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
  })
  it('覆蓋多種 2026 模式', () => {
    const names = PLANS_300.map((p) => p.name).join(' ')
    for (const k of ['PPL', '5/3/1', 'GVT', 'FST-7', 'PHUL', 'Nsuns', 'Smolov', 'Myo', 'Superset', '居家', '壺鈴', 'HIIT']) {
      expect(names).toContain(k)
    }
  })
})

describe('做法教學', () => {
  it('S 級動作有逐步做法', () => {
    expect(howTo('squat', '股四頭').length).toBeGreaterThanOrEqual(5)
    expect(howTo('deadlift', '背').length).toBeGreaterThanOrEqual(5)
    expect(howTo('trapdead', '背').length).toBeGreaterThanOrEqual(5)
  })
  it('冇做法 → 用提示 fallback', () => {
    expect(howTo('zzz', '二頭').length).toBeGreaterThan(0)
  })
})
