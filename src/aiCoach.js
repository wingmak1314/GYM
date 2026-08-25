// AI 教練 — 性價比評級、訓練計劃庫、今日建議、下組重量建議
// 基於運動科學(複合動作>孤立動作、大肌群覆蓋、恢復平衡)嘅規則引擎

// ---- 動作性價比評級 (S > A > B > C) ----
// score: 0-100,理由:肌群覆蓋/荷爾蒙刺激/時間效率/新手友好
const TIERS = {
  S: {
    color: '#c7f546', label: 'S · 頂級回報', note: '複合大動作,多肌群+高神經刺激,練一抵三',
    ids: ['squat', 'deadlift', 'bench', 'ohp', 'pullup', 'bbrow', 'hipthrust', 'frontsquat', 'dips', 'pushup', 'kbellswing', 'trapdead', 'reversechin', 'boxsquat', 'kbellclean'],
  },
  A: {
    color: '#4db8ff', label: 'A · 高性價比', note: '主要複合動作,覆蓋大肌群,穩健增長',
    ids: ['rdl', 'legpress', 'latpull', 'searow', 'ibench', 'dbohp', 'bulgarian', 'lunge', 'hacksquat', 'goblet', 'idbench', 'dbbench', 'dbrow', 'incline', 'pullup', 'tricepsdips', 'farmerwalk', 'thrusters', 'dbthrusters', 'turkishgetup', 'cossack', 'pausesquat', 'deficitdead', 'sumodead', 'zercher', 'tbarrow', 'trapdead', 'reversechin', 'boxsquat', 'kbellclean', 'pistol'],
  },
  B: {
    color: '#ff9f43', label: 'B · 輔助動作', note: '單關節/機械,適合補弱點同泵感',
    ids: ['pecdeck', 'cablefly', 'laterals', 'pushdown', 'ropedown', 'bbcurl', 'dbcurl', 'legcurl', 'legext', 'calfraise', 'decline', 'preacher', 'hammer', 'seatedcurl', 'seatedcalf', 'cablecrunch', 'russiantwist', 'hangingleg', 'legraise', 'plank', 'crunch', 'arnold', 'latraise', 'uprightrow', 'facelift', 'reardelt', 'wallball', 'pallof', 'rower', 'bike', 'treadmill', 'elliptical', 'stairclimber', 'swim', 'skierg', 'assaultbike', 'inclinewalk', 'ropejump', 'sledpush', 'sledpull', 'sandbagcarry', 'rucking', 'burpeebroad', 'medballsquat', 'medball', 'woodchop', 'pike', 'handstand', 'dbshrug', 'bbshrug', 'machinelateral', 'cablelateral', 'bandpullapart', 'deadhang', 'bearcrawl', 'bandedwalk', 'reversehyper'],
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

// ---- 訓練計劃庫 (2026 AI 建議清單,根據主流實證新手計劃) ----
// 參考:StrongLifts 5x5、Starting Strength、r/Fitness Basic Beginner Routine、Wendler 5/3/1 for Beginners
// 每個計劃:名稱、適合、動作 (exerciseId + 目標組數×次數)
export const PLANS = [
  {
    id: 'rfitness-beginner',
    name: '新手全身 A/B (r/Fitness 經典)',
    level: '新手',
    days: '一三五',
    desc: 'Reddit r/Fitness 最推薦新手計劃:3 日全身、5×5 複合動作線性加重 + 輔助動作,「訓練輪」首選',
    exercises: [
      { exerciseId: 'squat', sets: 3, reps: 5 },
      { exerciseId: 'bench', sets: 3, reps: 5 },
      { exerciseId: 'bbrow', sets: 3, reps: 5 },
      { exerciseId: 'ohp', sets: 2, reps: 5 },
      { exerciseId: 'deadlift', sets: 1, reps: 5 },
      { exerciseId: 'pullup', sets: 2, reps: 8 },
      { exerciseId: 'pushdown', sets: 2, reps: 12 },
      { exerciseId: 'plank', sets: 3, reps: 30 },
    ],
  },
  {
    id: 'stronglifts-5x5',
    name: 'StrongLifts 5×5',
    level: '新手',
    days: '一三五',
    desc: '最出名新手計劃:每次訓練都深蹲,5×5 線性加重,每次 +2.5kg,簡單到唔使諗',
    exercises: [
      { exerciseId: 'squat', sets: 5, reps: 5 },
      { exerciseId: 'bench', sets: 5, reps: 5 },
      { exerciseId: 'bbrow', sets: 5, reps: 5 },
      { exerciseId: 'ohp', sets: 5, reps: 5 },
      { exerciseId: 'deadlift', sets: 1, reps: 5 },
    ],
  },
  {
    id: 'starting-strength',
    name: 'Starting Strength',
    level: '新手',
    days: '一三五',
    desc: '力量訓練經典教科書:3×5 深蹲/臥推/硬舉輪換,重視動作技術,新手力量增長最快方案之一',
    exercises: [
      { exerciseId: 'squat', sets: 3, reps: 5 },
      { exerciseId: 'bench', sets: 3, reps: 5 },
      { exerciseId: 'deadlift', sets: 1, reps: 5 },
      { exerciseId: 'ohp', sets: 3, reps: 5 },
      { exerciseId: 'bbrow', sets: 3, reps: 5 },
    ],
  },
  {
    id: '531-beginner',
    name: '5/3/1 新手版 (Wendler)',
    level: '中階',
    days: '一三五',
    desc: 'Jim Wendler 5/3/1 for Beginners:主項 5/3/1 加重 + 輔助 5×10,強度管理好、平台期少',
    exercises: [
      { exerciseId: 'squat', sets: 3, reps: 5 },
      { exerciseId: 'bench', sets: 3, reps: 5 },
      { exerciseId: 'deadlift', sets: 1, reps: 5 },
      { exerciseId: 'ohp', sets: 3, reps: 5 },
      { exerciseId: 'legpress', sets: 5, reps: 10 },
      { exerciseId: 'bbrow', sets: 5, reps: 10 },
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

// ---- 目標設定 → 建議次數範圍 ----
export const GOALS = {
  '增肌': { reps: '8–12 下', note: '中重量高容量,漸進加重 2.5kg/次' },
  '減脂': { reps: '10–15 下', note: '保持重量,縮短休息,加有氧/核心' },
  '力量': { reps: '3–6 下', note: '大重量低次數,每次 +2.5kg 線性加重' },
}

// ---- 動作提示 (form cues,精簡實用版) ----
export const FORM_CUES = {
  squat: ['槓鈴穩放斜方肌,胸口挺起', '落到底:膝蓋同腳尖方向一致', '起身時腳踩實地面,臀先發力'],
  bench: ['肩胛收緊貼實凳', '槓落喺下胸,手肘約 45°', '全程腳踩實,唔好抬臀'],
  deadlift: ['槓貼住脛骨,背脊挺直', '先用腿推地,槓過膝後臀發力', '鎖死:站直收臀,唔好後仰'],
  ohp: ['收緊核心同臀,唔好拗腰', '槓由鎖骨位直上', '全程前臂垂直地面'],
  pullup: ['肩胛先下沉再拉', '拉到鎖骨過槓', '落返要慢,全幅度伸展'],
  bbrow: ['腰背挺直,上身約 45°', '槓拉向肚臍,手肘向後', '頂點夾實肩胛 1 秒'],
  rdl: ['臀向後推,膝蓋微曲', '槓貼住大脾滑落', '感覺腿後側拉扯,唔好圓背'],
  hipthrust: ['肩胛貼實凳邊', '下巴收,臀推到最高點', '頂點收緊臀部 2 秒'],
  latpull: ['胸口挺起,身體微後傾', '槓拉向鎖骨,唔好拉過頭', '手肘指向地面'],
  legpress: ['腰貼實椅背', '腳掌全踩,膝蓋對腳尖', '唔好鎖死膝蓋'],
  pushup: ['身體成一直線', '胸口落到近地', '手肘 45° 唔好外擴'],
  laterals: ['手肘微曲,唔好借力', '舉到膊頭高度', '落返要慢(離心 2 秒)'],
  curl: ['手肘固定喺身旁', '唔好前後搖', '頂點收緊二頭 1 秒'],
  pushdown: ['手肘夾實身體', '只動前臂,壓到底', '頂點分開繩索(如果係繩)'],
  crunch: ['下巴收,肋骨向下', '捲起肩胛離地', '落返慢,頸放鬆'],
  plank: ['手肘正喺膊頭下', '收緊臀同腹,身體成直線', '唔好塌腰'],
  lunge: ['上身挺直,前膝對腳尖', '後膝降到近地', '前腳掌發力推返起身'],
  cablefly: ['手肘微曲,胸肌發力夾埋', '喺胸前合掌', '打開時有拉扯感'],
  pecdeck: ['腰貼背,手柄喺膊頭高度', '夾埋時收緊胸肌', '慢慢打開,保持張力'],
  legcurl: ['臀貼實凳,唔好抬起', '腳跟向臀部捲', '頂點收緊 1 秒'],
  legext: ['腳踝墊喺滾軸下', '伸直鎖 1 秒', '落返要慢'],
  calfraise: ['腳尖企喺邊緣', '最大幅度提起', '頂點停 1 秒,慢落'],
  facepull: ['繩拉向眉心', '手肘抬高過膊', '頂點外旋肩膊'],
  abwheel: ['收緊核心,臀夾實', '滾出嚟唔好塌腰', '肩胛保持穩定,慢慢返'],
  mountain: ['手掌撐實,身體成直線', '膝蓋快速提向胸口', '保持核心收緊'],
  nordic: ['膝蓋跪實,上身成直線', '慢慢向前傾,全程控制', '用手輔助推返起身'],
  goodmorning: ['槓放上斜方肌,膝微曲', '臀向後推,上身向前傾', '腰背全程挺直'],
  kettlebell: ['壺鈴放喺雙腿之間', '臀發力站直,唔好用手拉', '壺鈴升到胸口高度'],
  stepup: ['成隻腳踩實箱面', '前腳發力企直', '後腳唔好借力踢'],
  trapdead: ['企喺槓中間,手垂直', '臀下沉,背挺直', '腳發力企直收臀'],
}
const GENERIC_CUES = {
  '胸': ['肩胛穩定,胸肌發力', '全程控制節奏,唔好彈'],
  '背': ['背脊挺直,肩胛先啟動', '頂點夾實,落返慢'],
  '肩': ['唔好聳肩,核心收緊', '動作幅度完整'],
  '二頭': ['手肘固定,唔好借力', '離心慢落'],
  '三頭': ['手肘夾實,只動前臂', '壓到底鎖 1 秒'],
  '股四頭': ['膝蓋對腳尖,腰背挺直', '全幅度控制'],
  '腿後側': ['臀向後推,背脊挺直', '感覺拉扯再發力'],
  '臀': ['臀收緊發力,腰唔好代償', '頂點停 1 秒'],
  '小腿': ['全幅度提起,頂點停', '慢落有拉扯'],
  '核心': ['收緊腹肌,保持呼吸', '質量優先,慢過快'],
  '全身': ['全程控制,保持呼吸', '動作要流暢'],
}

export function formCues(exerciseId, muscle) {
  const list = FORM_CUES[exerciseId] || GENERIC_CUES[muscle] || GENERIC_CUES['全身']
  return list.slice(0, 3)
}

// ---- 做法 (S 級動作逐步教學) ----
export const HOW_TO = {
  squat: ['企位:腳同膊闊,腳尖微微向外 15°', '槓鈴放斜方肌上,手唔好托槓', '吸氣收腹,胸口挺起,臀向後向下坐', '落:膝蓋對腳尖,大脾去到水平或以下', '起身:腳踩實地面,臀先發力企直', '頂點鎖定,呼氣,準備下一組'],
  deadlift: ['企位:腳喺槓下,脛骨離槓約兩指', '握槓:膊頭闊,手臂垂直,肩胛喺槓正上方', '背脊挺直,胸口挺起,臀下沉(死拉位)', '第一步:腿推地,槓貼住脛骨向上', '槓過膝:臀同背同時發力,站直', '鎖死:收臀企直,唔好後仰,然後控住落'],
  bench: ['躺實,眼喺槓正下方,肩胛收緊貼凳', '握槓:膊頭闊,手腕垂直', '腳踩實地面,臀微拱,肩胛鎖實', '落槓:控制到胸口,手肘約 45°', '推:腳踩地+胸發力,槓直上', '頂點鎖手肘,肩胛保持收緊'],
  ohp: ['企位:腳同膊闊,收緊臀同腹', '握槓:膊頭闊,槓放鎖骨位', '前臂垂直地面,手肘微前', '推:槓由鎖骨直上,頭微微向後讓槓', '過頭後頭歸位,全程核心鎖實', '頂點鎖定,控住落返鎖骨'],
  pullup: ['跳起抓槓:手闊過膊,全臂伸直', '肩胛先下沉(唔係拉手)', '胸口帶上,拉至鎖骨過槓', '頂點停 1 秒', '落返:控制 3 秒全伸展', '做唔到就做澳式划船/彈力帶輔助'],
  bbrow: ['企位:腳同膊闊,膝微曲,上身前傾 45°', '背脊全程挺直,腰唔好圓', '握槓:膊頭闊,槓垂喺膝前', '拉:手肘向後帶,槓拉向肚臍', '頂點夾實肩胛 1 秒', '控住落返,保持上身角度'],
  hipthrust: ['上背(肩胛)貼實凳邊', '槓墊軟墊放喺髖骨位,腳踩實', '下巴收,核心鎖實', '臀發力推到頂,上身成直線', '頂點收緊臀 2 秒', '控住落返,全程臀受力'],
  rdl: ['企位:腳同膊闊,膝微曲', '握槓:膊頭闊,貼住大脾', '臀向後推,槓貼住大脾滑落', '落:感覺腿後側拉扯,背脊挺直', '到拉扯點(約膝下),臀發力站直', '全程槓貼身,唔好圓背'],
  trapdead: ['企位:企喺梯形槓中間', '握柄:手臂垂直,腰背挺直', '臀下沉,胸口挺起(同硬舉準備一樣)', '腿推地,槓離地', '站直收臀鎖死', '新手首選硬舉變體:對腰更友好'],
  dips: ['雙手撐柄,手臂伸直鎖定', '身體微前傾,胸口向下', '落:手肘 45° 向後,胸落到手柄水平', '推返起身,唔好搖', '頂點鎖手肘', '做唔到用輔助機/彈力帶'],
  pushup: ['手掌撐實,手略闊過膊', '身體成一直線,收緊臀腹', '落:胸口到近地,手肘 45°', '推返起身,唔好塌腰', '頂點伸直,保持張力', '做唔到用膝蓋/斜牆'],
  kbellswing: ['壺鈴放雙腿之間,腳闊過膊', '微蹲,雙手抓壺鈴', '臀發力站直,壺鈴向前甩到胸口高', '壺鈴自然回落,屈膝收壺鈴', '全程腰背挺直,手臂放鬆', '節奏:臀驅動,唔係手拉'],
  lunge: ['企直,雙手持啞鈴', '前腳踏出,後膝向地', '落:前膝對腳尖,後膝近地', '前腳掌發力推返', '企直換腳', '核心鎖實,上身全程挺直'],
  latpull: ['坐實,大腿鎖實墊', '握槓:闊過膊,胸口挺起', '肩胛下沉,槓拉向鎖骨', '手肘指向地面', '頂點夾實背肌 1 秒', '控住伸直手臂,保持張力'],
  legpress: ['坐實,腰貼椅背', '腳掌全踩平台,膝對腳尖', '放:控制膝蓋向胸口', '推:腳掌發力,唔好鎖死膝蓋', '頂點停 1 秒', '全程腰貼實,唔好抬臀'],
  plank: ['手肘正喺膊頭下', '身體成直線,收緊臀腹', '呼吸保持,唔好憋氣', '肩胛穩定,唔好塌腰', '目標 30–60 秒', '斜板/膝蓋版做唔到就減時間'],
  reversechin: ['跳起反手握槓(掌心向自己)', '手同膊闊,肩胛下沉', '胸口帶上,拉至下巴過槓', '頂點停 1 秒', '控住落返全伸展', '比正手引體易,新手練背首選'],
  kbellclean: ['壺鈴放雙腿之間,微蹲', '快速站直,同時手臂上拉', '壺鈴翻到肩前,手肘收', '前臂垂直,壺鈴穩喺肩前', '控住落返雙腿之間', '動力來自臀腿,唔係手臂'],
  boxsquat: ['箱放喺深蹲深度位置', '準備同深蹲一樣,槓放斜方肌', '落:控住坐到箱上(唔好彈起)', '停 1 秒,重新啟動', '臀發力企直', '練深蹲底部力量同姿勢'],
  thrusters: ['槓鈴放鎖骨位(前蹲姿勢)', '蹲落:膝對腳尖,背挺直', '起身同時將槓推過頭', '頂點手臂伸直,核心鎖實', '落返鎖骨位再蹲', 'Hyrox 王牌動作:全身+心肺一次過'],
  turkishgetup: ['壺鈴舉直過頭,眼盯壺鈴', '手肘撐地起身,再手掌撐地', '臀離地,後腳穿過去變半跪', '半跪起身企直', '全程壺鈴保持垂直過頭', '反向逐步落返,慢做'],
  wallball: ['藥球抱喺胸前,蹲落', '起身時將球擲向高處目標', '接球屈膝卸力', '連續做,節奏快', '目標:男 9kg 女 6kg 擲 3m', 'Hyrox 經典項目'],
  cossack: ['企闊,腳尖向外', '重心移去一邊,另一邊腳伸直', '坐低嗰邊臀向後,背挺直', '腳跟踩實,起身', '換邊', '練髖關節活動度+大腿內側'],
  pallof: ['纜繩/彈力帶喺身側', '雙手伸直握喺胸前', '對抗拉力,唔好俾身體轉', '推前停 1 秒', '慢慢收回', '核心抗旋轉之王'],
  deadhang: ['跳起抓槓,全臂伸直', '肩胛放鬆,身體自然垂低', '收緊核心,保持呼吸', '目標 30–60 秒', '每週加 5 秒', '護肩+拉闊背肌+強化握力'],
  pausesquat: ['同深蹲一樣準備', '落到底停 2–3 秒', '保持張力,唔好彈', '再爆發起身', '練底部力量同姿勢穩定性', '進階深蹲專項'],
}

export function howTo(exerciseId, muscle) {
  return HOW_TO[exerciseId] || formCues(exerciseId, muscle)
}

// ---- 成就系統 (本地版「社區/動力」) ----
export function computeAchievements(state) {
  const a = []
  const ws = state.workouts
  if (!ws.length) return a
  // 連續訓練日 (streak)
  const dates = [...new Set(ws.map((w) => w.date))].sort()
  let streak = 1, best = 1
  for (let i = 1; i < dates.length; i++) {
    const d1 = new Date(dates[i - 1] + 'T00:00:00')
    const d2 = new Date(dates[i] + 'T00:00:00')
    if ((d2 - d1) / 86400000 === 1) { streak++; best = Math.max(best, streak) } else streak = 1
  }
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const last = new Date(dates[dates.length - 1] + 'T00:00:00')
  const current = (today - last) / 86400000 === 0 ? streak : 0
  if (current >= 3) a.push({ icon: '🔥', name: `連續 ${current} 日訓練`, desc: '保持勢頭!' })
  if (best >= 5) a.push({ icon: '⚡', name: `最長 ${best} 日 streak`, desc: '紀律機器' })
  // 總訓練量
  let vol = 0
  for (const w of ws) for (const ex of w.exercises) for (const s of ex.sets) vol += (Number(s.kg) || 0) * (Number(s.reps) || 0)
  if (vol >= 100000) a.push({ icon: '💪', name: '十萬 kg 訓練量', desc: '累積 100,000 kg 舉起' })
  else if (vol >= 10000) a.push({ icon: '💪', name: '萬 kg 訓練量', desc: '累積 10,000 kg 舉起' })
  // 訓練次數
  if (ws.length >= 50) a.push({ icon: '🏆', name: '50 次訓練', desc: '半百俱樂部' })
  else if (ws.length >= 10) a.push({ icon: '🏆', name: '10 次訓練', desc: '養成習慣中' })
  // 動作種類
  const kinds = new Set()
  for (const w of ws) for (const ex of w.exercises) kinds.add(ex.exerciseId)
  if (kinds.size >= 20) a.push({ icon: '🎯', name: `${kinds.size} 種動作`, desc: '動作庫探索者' })
  // PR
  if (ws.length >= 2) a.push({ icon: '🚀', name: 'PR 獵人', desc: '持續打破個人紀錄' })
  return a.slice(0, 6)
}

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
