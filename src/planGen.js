// planGen.js — 300 個訓練表生成器 (2026 訓練模式)
// 25 個模式 × 12 變體 = 300 個計劃,種子隨機(可重現)
// 模式: PPL / 上下肢 / 全身 / Bro / Arnold / 5-3-1 / GZCLP / GVT / FST-7 / PHUL / PHAT /
//       Myo-reps / Rest-Pause / Superset / Dropset / Nsuns / Smolov / 居家 / 啞鈴 / 機械 / 壺鈴 /
//       Powerbuilding / 新手線性 / 減脂循環 / HIIT+肌力
import { EXERCISES } from './exercises.js'

const LIB = new Map(EXERCISES.map((e) => [e.id, e]))

// 種子隨機 (mulberry32) — 保證每次生成一樣
function rng(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const pick = (r, arr) => arr[Math.floor(r() * arr.length)]
const pickN = (r, arr, n) => {
  const copy = [...arr]; const out = []
  while (out.length < n && copy.length) out.push(copy.splice(Math.floor(r() * copy.length), 1)[0])
  return out
}

// 目標 → 組數×次數 scheme
const SCHEME = {
  '增肌': { main: [4, 8], main2: [3, 10], acc: [3, 12], note: '中高容量,2–3 分鐘休息' },
  '力量': { main: [5, 5], main2: [4, 5], acc: [3, 8], note: '大重量低次數,3–5 分鐘休息' },
  '減脂': { main: [3, 10], main2: [3, 12], acc: [3, 15], note: '中重量高次數,60–90 秒休息,尾加有氧' },
}
const LEVELS = ['新手', '中階', '進階']

// 動作池
const P = {
  chest: ['bench', 'ibench', 'dbench', 'idbench', 'pecdeck', 'cablefly', 'pushup', 'dips', 'smithbench', 'cablecross', 'floorpress'],
  back: ['pullup', 'latpull', 'bbrow', 'dbrow', 'searow', 'reversechin', 'narrowlat', 'pulldown', 'australian', 'smithrow'],
  shoulders: ['ohp', 'dbohp', 'laterals', 'reardelt', 'facelift', 'arnold', 'machineohp', 'singlelaterals'],
  biceps: ['bbcurl', 'dbcurl', 'hammer', 'preacher', 'cablecurl', 'inclinecurl', 'reversecurl'],
  triceps: ['pushdown', 'ropedown', 'skull', 'closebench', 'ohdbext', 'singlepushdown'],
  quads: ['squat', 'frontsquat', 'legpress', 'legext', 'hacksquat', 'goblet', 'bulgarian', 'lunge', 'boxsquat', 'smithsquat'],
  hams: ['rdl', 'legcurl', 'seatedcurl', 'sldl', 'goodmorning', 'nordic'],
  glutes: ['hipthrust', 'glutebridge', 'kbellswing', 'abductor', 'singlehipthrust', 'cablekick'],
  calves: ['calfraise', 'seatedcalf', 'singlecalf'],
  core: ['plank', 'crunch', 'cablecrunch', 'russiantwist', 'hangingleg', 'abwheel', 'deadbug', 'mountain', 'legraise'],
  full: ['burpee', 'farmerwalk', 'battleropes', 'boxjump', 'kbellclean', 'kbellsnatch', 'sledpush', 'jumpsquat'],
  deads: ['deadlift', 'trapdead', 'rdl', 'sldl'],
}

// 模式定義:build(r) → { core: [...], acc: [...] } (core 固定主項,acc 種子抽取)
const MODES = [
  { key: 'ppl', name: '推拉腿 PPL', eq: '槓鈴', days: [3, 6], desc: '2026 最流行分化:推/拉/腿各練一輪,每肌群高頻刺激,增肌效率高',
    build: (r) => ({ core: [pick(r, P.chest), pick(r, P.back), pick(r, P.quads), pick(r, P.shoulders)], acc: pickN(r, [...P.triceps, ...P.biceps, ...P.hams, ...P.glutes, ...P.core], 4) }) },
  { key: 'ul', name: '上肢/下肢', eq: '槓鈴', days: [4], desc: '上下肢各練兩次,力量與容量平衡,一週兩次大肌群刺激',
    build: (r) => ({ core: [pick(r, P.quads), pick(r, P.chest), pick(r, P.back), pick(r, P.deads)], acc: pickN(r, [...P.shoulders, ...P.biceps, ...P.triceps, ...P.hams, ...P.core], 4) }) },
  { key: 'fullbody', name: '全身 A/B', eq: '槓鈴', days: [2, 3], desc: '每次練全身,新手最快建立基礎力量,線性加重',
    build: (r) => ({ core: [pick(r, P.quads), pick(r, P.chest), pick(r, P.back), pick(r, P.shoulders)], acc: pickN(r, [...P.biceps, ...P.triceps, ...P.hams, ...P.core, ...P.calves], 3) }) },
  { key: 'bro', name: 'Bro 五分化', eq: '槓鈴', days: [5], desc: '胸/背/肩/手/腿每日一肌群,經典健美增肌',
    build: (r) => ({ core: [pick(r, P.chest), pick(r, P.back), pick(r, P.shoulders), pick(r, P.quads)], acc: pickN(r, [...P.biceps, ...P.triceps, ...P.hams, ...P.calves, ...P.core], 5) }) },
  { key: 'arnold', name: 'Arnold 六日', eq: '槓鈴', days: [6], desc: '胸背 / 肩手 / 腿 循環兩次,高頻高容量',
    build: (r) => ({ core: [pick(r, P.chest), pick(r, P.back), pick(r, P.shoulders), pick(r, P.quads), pick(r, P.hams)], acc: pickN(r, [...P.biceps, ...P.triceps, ...P.calves, ...P.core], 4) }) },
  { key: '531', name: '5/3/1 變體', eq: '槓鈴', days: [4], desc: 'Wendler 週期化:主項 5/3/1 + 輔助 5×10,平台期少',
    build: (r) => ({ core: [pick(r, P.quads), pick(r, P.chest), pick(r, P.deads), pick(r, P.shoulders)], acc: pickN(r, [...P.back, ...P.hams, ...P.biceps, ...P.triceps], 3) }) },
  { key: 'gzclp', name: 'GZCLP', eq: '槓鈴', days: [4], desc: 'T1/T2/T3 三層結構,線性加重 + 雙重進階,新手至中階通吃',
    build: (r) => ({ core: [pick(r, P.quads), pick(r, P.chest), pick(r, P.deads), pick(r, P.back)], acc: pickN(r, [...P.shoulders, ...P.triceps, ...P.biceps, ...P.core], 3) }) },
  { key: 'gvt', name: 'GVT 德國 10×10', eq: '槓鈴', days: [4], desc: 'German Volume Training:主項 10 組×10,增肌爆容量,泵感極強',
    build: (r) => ({ core: [pick(r, P.quads), pick(r, P.chest), pick(r, P.back), pick(r, P.shoulders)], acc: pickN(r, [...P.triceps, ...P.biceps, ...P.hams, ...P.core], 3) }) },
  { key: 'fst7', name: 'FST-7 泵感', eq: '機械', days: [5], desc: 'Hany Rambod:每肌群最後 7×15 拉伸泵,筋膜刺激,健美頂級玩法',
    build: (r) => ({ core: [pick(r, P.chest), pick(r, P.back), pick(r, P.shoulders), pick(r, P.quads)], acc: pickN(r, [...P.chest, ...P.back, ...P.biceps, ...P.triceps, ...P.core], 5) }) },
  { key: 'phul', name: 'PHUL', eq: '槓鈴', days: [4], desc: '力量+肌肥大混合:上/下 力量日 + 上/下 增肌日',
    build: (r) => ({ core: [pick(r, P.quads), pick(r, P.chest), pick(r, P.deads), pick(r, P.back)], acc: pickN(r, [...P.shoulders, ...P.hams, ...P.biceps, ...P.triceps], 4) }) },
  { key: 'phat', name: 'PHAT', eq: '槓鈴', days: [5], desc: 'Layne Norton 力量+健美混合:3 日力量 + 2 日高容量增肌',
    build: (r) => ({ core: [pick(r, P.chest), pick(r, P.back), pick(r, P.quads), pick(r, P.shoulders), pick(r, P.hams)], acc: pickN(r, [...P.biceps, ...P.triceps, ...P.calves, ...P.core], 4) }) },
  { key: 'myo', name: 'Myo-reps', eq: '啞鈴', days: [3], desc: '2026 高效模式:激活組+休息 15 秒短歇組,30 分鐘練完,時間效率王',
    build: (r) => ({ core: [pick(r, P.quads), pick(r, P.chest), pick(r, P.back)], acc: pickN(r, [...P.shoulders, ...P.hams, ...P.biceps, ...P.triceps, ...P.core], 4) }) },
  { key: 'restpause', name: 'Rest-Pause 力量', eq: '槓鈴', days: [3], desc: '大重量到力竭,休息 20 秒再戰,神經刺激極高,力量增長快',
    build: (r) => ({ core: [pick(r, P.deads), pick(r, P.quads), pick(r, P.chest), pick(r, P.shoulders)], acc: pickN(r, [...P.back, ...P.hams, ...P.biceps, ...P.core], 3) }) },
  { key: 'superset', name: 'Superset 循環', eq: '啞鈴', days: [3], desc: '全部動作超級組:拮抗肌/同肌群輪流,休息壓到最少,減脂增肌雙贏',
    build: (r) => ({ core: [pick(r, P.chest), pick(r, P.back), pick(r, P.quads), pick(r, P.shoulders)], acc: pickN(r, [...P.biceps, ...P.triceps, ...P.hams, ...P.core, ...P.glutes], 4) }) },
  { key: 'dropset', name: 'Dropset 泵感日', eq: '機械', days: [4], desc: '每組力竭後減 20% 再戰 2 次,肌纖維全激活,增肌神器',
    build: (r) => ({ core: [pick(r, P.chest), pick(r, P.back), pick(r, P.quads), pick(r, P.shoulders)], acc: pickN(r, [...P.biceps, ...P.triceps, ...P.hams, ...P.calves, ...P.core], 4) }) },
  { key: 'nsuns', name: 'Nsuns 5/3/1+', eq: '槓鈴', days: [4], desc: 'T1 主項 9 組大容量 + T2 輔助,容量爆炸,力量平台期殺手',
    build: (r) => ({ core: [pick(r, P.chest), pick(r, P.quads), pick(r, P.deads), pick(r, P.ohp)], acc: pickN(r, [...P.back, ...P.shoulders, ...P.hams, ...P.triceps], 3) }) },
  { key: 'smolov', name: 'Smolov 深蹲專項', eq: '槓鈴', days: [4], desc: '俄羅斯深蹲週期:每週 4 練高強度深蹲,進階專項衝擊',
    build: (r) => ({ core: ['squat', 'squat', pick(r, P.quads), pick(r, P.hams)], acc: pickN(r, [...P.glutes, ...P.calves, ...P.core], 2) }) },
  { key: 'home', name: '居家自重', eq: '自重', days: [2, 3], desc: '零器材全身訓練,隨時開練,新手友好',
    build: (r) => ({ core: [pick(r, ['pushup', 'dips', 'burpee']), pick(r, ['pullup', 'australian', 'reversechin']), pick(r, ['lunge', 'jumpsquat', 'stepup']), pick(r, ['plank', 'mountain', 'legraise'])], acc: pickN(r, [...P.glutes, ...P.core, ...P.full], 3) }) },
  { key: 'db', name: '啞鈴全屋', eq: '啞鈴', days: [4], desc: '淨係一對啞鈴都練到全身,家用健身房首選',
    build: (r) => ({ core: [pick(r, ['goblet', 'bulgarian', 'lunge']), pick(r, ['dbench', 'idbench', 'floorpress']), pick(r, ['dbrow', 'onearmrow']), pick(r, ['dbohp', 'arnold'])], acc: pickN(r, [...P.biceps, ...P.triceps, ...P.hams, ...P.core], 3) }) },
  { key: 'machine', name: '機械健身房', eq: '機械', days: [4], desc: '全機械動作,穩定性高,新手安全,泵感集中',
    build: (r) => ({ core: [pick(r, ['legpress', 'legext', 'hacksquat']), pick(r, ['pecdeck', 'smithbench', 'cablefly']), pick(r, ['latpull', 'searow', 'smithrow']), pick(r, ['machineohp', 'laterals'])], acc: pickN(r, [...P.biceps, ...P.triceps, ...P.calves, ...P.core], 3) }) },
  { key: 'kbell', name: '壺鈴全能', eq: '壺鈴', days: [3], desc: '壺鈴訓練:爆發力+核心+心肺,全身一體練',
    build: (r) => ({ core: [pick(r, ['kbellswing', 'kbellclean', 'kbellsnatch']), pick(r, ['goblet', 'lunge']), pick(r, ['kbellpress', 'kbellclean'])], acc: pickN(r, [...P.core, ...P.glutes, ...P.full], 3) }) },
  { key: 'powerbuild', name: 'Powerbuilding', eq: '槓鈴', days: [4], desc: '力量主項 + 健美輔助,力型雙修,2026 主流',
    build: (r) => ({ core: [pick(r, P.quads), pick(r, P.chest), pick(r, P.deads), pick(r, P.back)], acc: pickN(r, [...P.shoulders, ...P.biceps, ...P.triceps, ...P.hams, ...P.core], 4) }) },
  { key: 'linear', name: '新手線性加重', eq: '槓鈴', days: [3], desc: '每次 +2.5kg 嘅線性進階,新手最快見效方案',
    build: (r) => ({ core: ['squat', pick(r, P.chest), pick(r, P.back), pick(r, P.shoulders)], acc: pickN(r, [...P.biceps, ...P.triceps, ...P.hams, ...P.core], 3) }) },
  { key: 'cut', name: '減脂循環', eq: '自重', days: [3], desc: '肌力+HIIT 循環,熱量消耗極大,減脂不掉肌肉',
    build: (r) => ({ core: [pick(r, P.quads), pick(r, P.chest), pick(r, P.back), pick(r, ['burpee', 'boxjump', 'battleropes', 'jumpsquat'])], acc: pickN(r, [...P.core, ...P.glutes, ...P.full], 4) }) },
  { key: 'hiit', name: 'HIIT+肌力', eq: '自重', days: [3], desc: '短時高效:20 分鐘肌力 + 10 分鐘 HIIT,打工仔首選',
    build: (r) => ({ core: [pick(r, ['pushup', 'dips', 'burpee']), pick(r, ['pullup', 'australian']), pick(r, ['lunge', 'jumpsquat', 'stepup'])], acc: pickN(r, [...P.core, ...P.glutes, ...P.full], 3) }) },
  { key: 'ulppl', name: '上/下/推/拉/腿 ULPPL', eq: '槓鈴', days: [5], desc: '2026 research 評分 9.0 嘅高效分化:上下推拉腿五練,容量大過 UL 又慳時間過 PPL',
    build: (r) => ({ core: [pick(r, P.chest), pick(r, P.back), pick(r, P.quads), pick(r, P.shoulders), pick(r, P.deads)], acc: pickN(r, [...P.biceps, ...P.triceps, ...P.hams, ...P.core, ...P.calves], 4) }) },
  { key: 'hyrox', name: 'Hyrox 混合競技', eq: '自重', days: [4], desc: '2026 最火:肌力+有氧混合賽事訓練,功能性全能,Hybrid Athlete 必練',
    build: (r) => ({ core: [pick(r, ['thrusters', 'wallball', 'kbellswing']), pick(r, ['sledpush', 'sledpull', 'farmerwalk']), pick(r, ['rower', 'skierg', 'assaultbike']), pick(r, ['burpee', 'burpeebroad', 'boxjump'])], acc: pickN(r, [...P.core, ...P.glutes, ...P.full, ...P.quads], 3) }) },
]

const MODE_NAME = {}
for (const m of MODES) MODE_NAME[m.key] = m.name

// 生成 300 個計劃
export function generatePlans(count = 300) {
  const plans = []
  let seed = 2026
  const variantsPerMode = Math.ceil(count / MODES.length) // 12
  for (const mode of MODES) {
    for (let v = 0; v < variantsPerMode; v++) {
      const r = rng(seed++)
      const goal = ['增肌', '力量', '減脂'][v % 3]
      const level = LEVELS[v % 3]
      const days = mode.days[v % mode.days.length] || mode.days[0]
      const { core, acc } = mode.build(r)
      const scheme = SCHEME[goal]
      // 組裝動作:core 用主 scheme,acc 用輔助 scheme
      const exercises = []
      const seen = new Set()
      const add = (id, sets, reps) => {
        if (!LIB.has(id) || seen.has(id)) return
        seen.add(id)
        exercises.push({ exerciseId: id, sets, reps })
      }
      core.forEach((id, i) => {
        if (i === 0) add(id, ...scheme.main)
        else if (i === 1) add(id, ...scheme.main2)
        else add(id, ...scheme.main2)
      })
      acc.forEach((id) => add(id, ...scheme.acc))
      // 確保至少有 5 個動作,唔夠就補
      if (exercises.length < 5) {
        for (const id of [...P.chest, ...P.back, ...P.quads, ...P.core]) {
          add(id, ...scheme.acc)
          if (exercises.length >= 6) break
        }
      }
      const suffix = `${goal}·${level}·${days}日`
      plans.push({
        id: `${mode.key}-${v}`,
        name: `${mode.name} · ${suffix}`,
        level, days, goal, eq: mode.eq,
        desc: `${mode.desc}。${scheme.note}。`,
        exercises,
      })
    }
  }
  return plans.slice(0, count)
}

export const PLANS_300 = generatePlans(300)
export { MODE_NAME }
