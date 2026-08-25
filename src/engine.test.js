import { describe, it, expect } from 'vitest'
import {
  epley, setVolume, workoutVolume, workoutSets, workoutReps,
  detectPR, lastWorkoutFor, buildHeatmap, weeklyVolume, muscleDistribution,
  exerciseProgress, exportCSV, parseCSV, cumulativeVolume, weeklyFrequency,
} from './engine.js'

const wk = (date, exercises) => ({ id: date, date, name: 't', exercises })

describe('epley 1RM', () => {
  it('100kg x 10 = 133', () => expect(epley(100, 10)).toBe(133))
  it('空值 = 0', () => { expect(epley(0, 5)).toBe(0); expect(epley(60, 0)).toBe(0) })
})

describe('workout 統計', () => {
  const w = wk('2026-08-20', [{ exerciseId: 'bench', name: '槓鈴臥推', muscle: '胸', sets: [{ kg: 60, reps: 10 }, { kg: 60, reps: 8 }] }])
  it('volume = 60*10 + 60*8 = 1080', () => expect(workoutVolume(w)).toBe(1080))
  it('sets = 2, reps = 18', () => { expect(workoutSets(w)).toBe(2); expect(workoutReps(w)).toBe(18) })
})

describe('PR 偵測', () => {
  const prev = [wk('2026-08-01', [{ exerciseId: 'bench', name: '槓鈴臥推', muscle: '胸', sets: [{ kg: 100, reps: 5 }] }])]
  it('110x5 重量 PR', () => expect(detectPR(prev, 'bench', 110, 5)).toBe('weight'))
  it('100x10 e1RM PR (100*1.333=133 > 116.7)', () => expect(detectPR(prev, 'bench', 100, 10)).toBe('e1rm'))
  it('100x5 冇 PR', () => expect(detectPR(prev, 'bench', 100, 5)).toBeNull())
  it('第一次做該動作 = 冇 badge', () => expect(detectPR([], 'squat', 60, 5)).toBeNull())
  it('排除同日(編輯中唔當新 PR)', () => {
    const same = [
      wk('2026-08-10', [{ exerciseId: 'bench', name: 'x', muscle: '胸', sets: [{ kg: 100, reps: 5 }] }]),
      wk('2026-08-20', [{ exerciseId: 'bench', name: 'x', muscle: '胸', sets: [{ kg: 120, reps: 3 }] }]),
    ]
    expect(detectPR(same, 'bench', 125, 3, '2026-08-20')).toBe('weight')
    expect(detectPR(same, 'bench', 95, 5, '2026-08-20')).toBeNull()
  })
})

describe('上次參考', () => {
  it('回傳最近一次嘅組', () => {
    const ws = [
      wk('2026-08-01', [{ exerciseId: 'squat', name: '深蹲', muscle: '股四頭', sets: [{ kg: 80, reps: 5 }] }]),
      wk('2026-08-08', [{ exerciseId: 'squat', name: '深蹲', muscle: '股四頭', sets: [{ kg: 90, reps: 5 }] }]),
    ]
    expect(lastWorkoutFor(ws, 'squat')[0].kg).toBe(90)
    expect(lastWorkoutFor(ws, 'bench')).toBeNull()
  })
})

describe('熱力圖 / 每週 / 肌群', () => {
  const today = new Date()
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const t = iso(today)
  const before = new Date(today); before.setDate(before.getDate() - 5)
  const old = new Date(today); old.setDate(old.getDate() - 40)
  const ws = [
    wk(t, [{ exerciseId: 'bench', name: 'x', muscle: '胸', sets: [{ kg: 60, reps: 5 }, { kg: 60, reps: 5 }] }]),
    wk(iso(before), [{ exerciseId: 'squat', name: 'y', muscle: '股四頭', sets: [{ kg: 100, reps: 5 }] }]),
    wk(iso(old), [{ exerciseId: 'bench', name: 'x', muscle: '胸', sets: [{ kg: 60, reps: 5 }] }]),
  ]
  it('熱力圖今日=1', () => expect(buildHeatmap(ws)[t]).toBe(1))
  it('每週訓練量最尾一格 = 今日訓練量 600', () => {
    const v = weeklyVolume(ws, 12)
    expect(v[v.length - 1].vol).toBe(600)
    expect(v[v.length - 1].sessions).toBe(1)
  })
  it('肌群分布 7 日:胸 2 組,股四頭 1 組', () => {
    const m = muscleDistribution(ws, 7)
    expect(m['胸']).toBe(2); expect(m['股四頭']).toBe(1); expect(m['胸'] + m['股四頭']).toBe(3)
  })
})

describe('進度點', () => {
  it('按日期排序,每場訓練一個點', () => {
    const ws = [
      wk('2026-08-10', [{ exerciseId: 'squat', name: 'x', muscle: '股四頭', sets: [{ kg: 80, reps: 5 }] }]),
      wk('2026-08-01', [{ exerciseId: 'squat', name: 'x', muscle: '股四頭', sets: [{ kg: 70, reps: 5 }] }]),
    ]
    const p = exerciseProgress(ws, 'squat')
    expect(p.map((x) => x.date)).toEqual(['2026-08-01', '2026-08-10'])
    expect(p[1].kg).toBe(80)
  })
})

describe('累積訓練量 / 頻率', () => {
  it('累積量順日期遞增', () => {
    const ws = [
      wk('2026-08-01', [{ exerciseId: 'bench', name: 'x', muscle: '胸', sets: [{ kg: 100, reps: 5 }] }]),
      wk('2026-08-10', [{ exerciseId: 'bench', name: 'x', muscle: '胸', sets: [{ kg: 100, reps: 5 }] }]),
    ]
    const c = cumulativeVolume(ws)
    expect(c).toHaveLength(2)
    expect(c[0].vol).toBe(500)
    expect(c[1].vol).toBe(1000)
    expect(c[1].vol).toBeGreaterThan(c[0].vol)
  })
  it('每週頻率 = 每週訓練次數', () => {
    const t = new Date()
    const iso = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
    const f = weeklyFrequency([wk(iso, [])], 12)
    expect(f[f.length - 1].sessions).toBe(1)
  })
})

describe('CSV 匯出/匯入', () => {
  const state = {
    workouts: [
      wk('2026-08-20', [{ exerciseId: 'bench', name: '槓鈴臥推', muscle: '胸', sets: [{ kg: 60, reps: 10 }, { kg: 62.5, reps: 8 }] }]),
    ],
    measurements: [], templates: [], customExercises: [], settings: { unit: 'kg' },
  }
  it('roundtrip:匯出→匯入 數據一致', () => {
    const csv = exportCSV(state)
    expect(csv.split('\n')[0]).toBe('Date,Exercise,Muscle,Set,Weight,Reps')
    const { workouts, errors } = parseCSV(csv)
    expect(errors).toEqual([])
    expect(workouts).toHaveLength(1)
    expect(workouts[0].exercises[0].sets).toHaveLength(2)
    expect(workouts[0].exercises[0].sets[1].kg).toBe(62.5)
  })
  it('Hevy 格式匯入', () => {
    const hevy = [
      'Date,Exercise Name,Set Order,Weight kg,Reps',
      '2026-08-19,Barbell Bench Press,1,80,5',
      '2026-08-19,Barbell Bench Press,2,80,4',
      '2026-08-18,Pull Up,1,0,8',
    ].join('\n')
    const { workouts, errors } = parseCSV(hevy)
    expect(errors).toEqual([])
    expect(workouts).toHaveLength(2)
    expect(workouts[0].date).toBe('2026-08-18')
    expect(workouts[1].exercises[0].sets).toHaveLength(2)
  })
  it('壞表頭 → 明確錯誤', () => {
    const { workouts, errors } = parseCSV('foo,bar\n1,2')
    expect(workouts).toHaveLength(0)
    expect(errors[0]).toContain('認唔到表頭')
  })
})
