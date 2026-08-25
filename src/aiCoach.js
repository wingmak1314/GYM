// AI 教練 — 性價比評級、訓練計劃庫、今日建議、下組重量建議
// 基於運動科學(複合動作>孤立動作、大肌群覆蓋、恢復平衡)嘅規則引擎

// ---- 動作性價比評級 (S > A > B > C) ----
// score: 0-100,理由:肌群覆蓋/荷爾蒙刺激/時間效率/新手友好
const TIERS = {
  S: {
    color: '#c7f546', label: 'S · 頂級回報', note: '複合大動作,多肌群+高神經刺激,練一抵三',
    ids: ['squat', 'deadlift', 'bench', 'ohp', 'pullup', 'bbrow', 'hipthrust', 'frontsquat', 'dips', 'pushup', 'kbellswing'],
  },
  A: {
    color: '#4db8ff', label: 'A · 高性價比', note: '主要複合動作,覆蓋大肌群,穩健增長',
    ids: ['rdl', 'legpress', 'latpull', 'searow', 'ibench', 'dbohp', 'bulgarian', 'lunge', 'hacksquat', 'goblet', 'idbench', 'dbbench', 'dbrow', 'incline', 'pullup', 'tricepsdips', 'farmerwalk'],
  },
  B: {
    color: '#ff9f43', label: 'B · 輔助動作', note: '單關節/機械,適合補弱點同泵感',
    ids: ['pecdeck', 'cablefly', 'laterals', 'pushdown', 'ropedown', 'bbcurl', 'dbcurl', 'legcurl', 'legext', 'calfraise', 'decline', 'preacher', 'hammer', 'seatedcurl', 'seatedcalf', 'cablecrunch', 'russiantwist', 'hangingleg', 'legraise', 'plank', 'crunch', 'arnold', 'latraise', 'uprightrow', 'facelift', 'reardelt'],
  },
  C: {
    color: '#8b919c', label: 'C · 低刺激', note: '小肌群/特殊角度,錦上添花',
    ids: ['frontraise', 'conccurl', 'skull', 'ohdbext', 'cablecurl', 'cablekick', 'abductor', 'glutebridge', 'sideplank', 'backext', 'onearmrow', 'pulldown', 'sldl', 'dbromani', 'burpee', 'closebench', 'cablecrunch2'],
  },
}

const TIER_OF = {}
for (const t of Object.keys(TIERS)) for (const id of TIERS[t].ids) TIER_OF[id] = t

export function valueTier(exerciseId) {
  return TIERS[TIER_OF[exerciseId]] || TIERS.B
}

// ---- 訓練計劃庫 (2026 AI 建議清單) ----
// 每個計劃:名稱、適合、動作 (exerciseId + 目標組數×次數)
export const PLANS = [
  {
    id: 'fullbody-beginner',
    name: '新手全身 3 日',
    level: '新手',
    days: '一三五',
    desc: '每週 3 次全身,最快建立基礎力量,性價比最高嘅起步計劃',
    exercises: [
      { exerciseId: 'squat', sets: 3, reps: 8 },
      { exerciseId: 'bench', sets: 3, reps: 8 },
      { exerciseId: 'bbrow', sets: 3, reps: 8 },
      { exerciseId: 'ohp', sets: 2, reps: 10 },
      { exerciseId: 'legcurl', sets: 2, reps: 12 },
      { exerciseId: 'plank', sets: 3, reps: 30 },
    ],
  },
  {
    id: 'ppl',
    name: '推拉腿 PPL 6 日',
    level: '進階',
    days: '一二四五六',
    desc: '經典分化,每肌群一週兩練,增肌效率之王',
    exercises: [
      { exerciseId: 'bench', sets: 4, reps: 6 },
      { exerciseId: 'ibench', sets: 3, reps: 8 },
      { exerciseId: 'ohp', sets: 3, reps: 8 },
      { exerciseId: 'laterals', sets: 3, reps: 15 },
      { exerciseId: 'pushdown', sets: 3, reps: 12 },
      { exerciseId: 'pecdeck', sets: 3, reps: 12 },
    ],
  },
  {
    id: 'upper-lower',
    name: '上肢/下肢 4 日',
    level: '中階',
    days: '一二四五',
    desc: '力量與肌肥大平衡,一週兩次大肌群刺激',
    exercises: [
      { exerciseId: 'squat', sets: 4, reps: 6 },
      { exerciseId: 'bench', sets: 4, reps: 6 },
      { exerciseId: 'pullup', sets: 3, reps: 8 },
      { exerciseId: 'ohp', sets: 3, reps: 8 },
      { exerciseId: 'rdl', sets: 3, reps: 10 },
    ],
  },
  {
    id: 'home-minimal',
    name: '居家零器材 3 日',
    level: '新手',
    days: '一三五',
    desc: '淨係自重都練到全身,隨時開練',
    exercises: [
      { exerciseId: 'pushup', sets: 4, reps: 12 },
      { exerciseId: 'pullup', sets: 3, reps: 8 },
      { exerciseId: 'lunge', sets: 3, reps: 12 },
      { exerciseId: 'glutebridge', sets: 3, reps: 15 },
      { exerciseId: 'plank', sets: 3, reps: 30 },
      { exerciseId: 'burpee', sets: 3, reps: 10 },
    ],
  },
]

// ---- 今日建議:搵最耐冇練嘅肌群 → 推薦動作 ----
export function suggestToday(state) {
  const MUSCLE_EX = {
    '股四頭': 'squat', '胸': 'bench', '背': 'pullup', '肩': 'ohp',
    '二頭': 'bbcurl', '三頭': 'pushdown', '臀': 'hipthrust', '腿後側': 'rdl', '核心': 'plank',
  }
  const days = 14
  const counts = {}
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days)
  for (const w of state.workouts) {
    const d = new Date(w.date + 'T00:00:00')
    if (d < cutoff) continue
    for (const ex of w.exercises || []) {
      counts[ex.muscle] = (counts[ex.muscle] || 0) + (ex.sets || []).length
    }
  }
  // 全冇數據 → 推薦新手全身
  if (!Object.keys(counts).length) {
    return { muscle: '全身', exId: 'squat', zh: '槓鈴深蹲', reason: '你仲未開始記錄 — 由最高性價比嘅深蹲開始,新手黃金動作。' }
  }
  // 搵訓練量最低嘅肌群(冇練過 = 0)
  let minMuscle = null, minN = Infinity
  for (const [m, ex] of Object.entries(MUSCLE_EX)) {
    const n = counts[m] || 0
    if (n < minN) { minN = n; minMuscle = m }
  }
  const exId = MUSCLE_EX[minMuscle]
  const name = state.workouts.length
  const last = (() => {
    for (let i = state.workouts.length - 1; i >= 0; i--) {
      const e = state.workouts[i].exercises.find((x) => x.exerciseId === exId)
      if (e && e.sets.length) return state.workouts[i].date
    }
    return null
  })()
  const reason = last
    ? `「${minMuscle}」近 14 日練得最少,上次 ${last.slice(5)} — 今日補返,維持平衡。`
    : `「${minMuscle}」近 14 日未練過 — 今日係最好時機,避免失衡。`
  return { muscle: minMuscle, exId, zh: name ? '' : '', reason }
}

// ---- 下組重量建議:上次最後一組 reps ≥ 8 → +2.5kg ----
export function suggestNextWeight(lastSets) {
  if (!lastSets || !lastSets.length) return null
  const last = lastSets[lastSets.length - 1]
  const kg = Number(last.kg), reps = Number(last.reps)
  if (!kg || !reps) return null
  const next = kg + 2.5
  return { kg: next, reps, reason: `上次 ${kg}kg×${reps} 下,目標 8 下 → 建議加到 ${next}kg` }
}
