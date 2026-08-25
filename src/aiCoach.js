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

// ---- 做法 (詳細教學版) ----
// 結構: steps 步驟 / mistakes 常見錯誤 / easier 新手變體 / harder 進階變體 / breathe 呼吸節奏
export const HOW_TO = {
  squat: {
    steps: [
      '站立:腳同膊頭闊,腳尖向外 15–30°,重心平均分佈全腳掌',
      '槓鈴位置:放喺斜方肌上(低槓位靠肩胛,高槓位靠頸下),雙手握槓鎖實',
      '起槓:腳踏實,胸口挺起,退後兩步企穩',
      '吸氣鎖腹:核心繃緊,好似準備俾人打肚',
      '落:臀先向後向下坐,膝蓋對住腳尖方向,唔好內夾',
      '深度:大脾去到水平或更低(視乎活動度),保持背脊中立',
      '底部:全身張力鎖實,唔好鬆',
      '起身:腳踩實地面,胸口帶上,臀同步發力',
      '頂點:完全企直鎖定,呼氣,準備下一組',
      '節奏:落 2–3 秒,起身 1–2 秒,全程控制',
    ],
    mistakes: ['膝蓋內夾(對腳尖),腳跟離地(重心偏前)', '圓背/拗腰(核心冇鎖實)', '起身時臀先彈起(變成早安體前屈)', '深度唔夠就加重量'],
    easier: '箱式深蹲 / 高腳杯深蹲(重量放前,新手易上手)',
    harder: '前蹲 / 暫停深蹲(底部停 2–3 秒)/ 澤奇深蹲',
    breathe: '落之前吸氣鎖腹,起身一半開始呼氣,頂點呼完',
  },
  bench: {
    steps: [
      '躺凳:眼喺槓正下方,肩胛收緊貼實凳,微微拱胸',
      '握槓:膊頭闊,手腕垂直(唔好拗腕),全手掌包實',
      '腳位:腳踩實地面,膝微屈,臀微離凳(拱橋),肩胛鎖死',
      '起槓:伸直手臂將槓移出,鎖定喺膊頭正上方',
      '落槓:吸氣,控制槓落到下胸位置(乳頭線),手肘約 45°',
      '底部:槓輕碰胸口,前臂保持垂直,張力唔好散',
      '推:腳踩地+胸肌發力,槓沿原路徑直上',
      '頂點:鎖定手肘(唔好過度),肩胛保持收緊',
      '落返:控住放到架,再做下一組',
      '節奏:落 2–3 秒,推 1 秒爆發,頂點 1 秒',
    ],
    mistakes: ['手肘外擴 90°(傷肩)', '手腕拗後(承重錯)', '落點喺頸/鎖骨(應該喺下胸)', '抬臀借力', '槓彈胸'],
    easier: '啞鈴臥推(活動度更自由)/ 史密斯臥推 / 地板臥推(行程短啲)',
    harder: '上斜臥推 / 暫停臥推(底部停 2 秒)/ 窄距臥推(三頭)',
    breathe: '落之前吸氣鎖腹,推嘅時候呼氣,頂點換氣',
  },
  deadlift: {
    steps: [
      '站立:腳喺槓下(腳尖微微伸出槓),脛骨離槓約兩指',
      '握槓:膊頭闊,手臂垂直地面,肩胛喺槓正上方(唔好前傾)',
      '準備:屈膝落低,背脊挺直,胸口挺起,臀下沉(「死拉位」)',
      '張力:雙手拉實槓,感覺槓已經拉緊(但未離地),核心鎖腹',
      '第一步:腿推地,槓貼住脛骨開始上升(好似腿舉咁)',
      '槓過膝:同時臀同背發力,上身角度打開',
      '鎖死:站直,收臀,肩胛微向後(唔好過度後仰)',
      '落槓:臀向後推,槓貼住大脾滑落,背脊保持挺直',
      '落返地面:控制放低,準備下一組(唔使次次放手)',
      '節奏:全程流暢,唔好急,每組 5 下左右',
    ],
    mistakes: ['圓背起槓(最大禁忌,傷腰)', '槓離身太遠(重心前傾)', '臀起得太快(變早安)', '鎖死時過度後仰', '用背硬拉而唔用腿'],
    easier: '梯形槓硬舉(重心更穩,對腰友好)/ 羅馬尼亞硬舉(由中段開始)',
    harder: '墊高硬舉(活動度加大)/ 相撲硬舉(腿主導)/ 暫停硬舉',
    breathe: '準備時吸氣鎖腹,鎖死站直時呼氣,全程唔好憋氣過耐',
  },
  ohp: {
    steps: [
      '站立:腳同膊頭闊,收緊臀同腹(保護腰)',
      '握槓:膊頭闊,槓放鎖骨位,前臂垂直地面,手肘微前',
      '準備:核心鎖實,臀夾實,肋骨收返(唔好拗腰)',
      '推:槓沿垂直線直上,頭微微向後讓槓通過',
      '過頭:槓過眉心後頭歸位,手臂伸直鎖定',
      '頂點:肩胛穩定,槓喺頭頂正上方,唔好前傾',
      '落返:控住落返鎖骨位,保持張力',
      '重複:每下都由鎖骨起,唔好半程',
      '節奏:推 1 秒,落 2–3 秒',
    ],
    mistakes: ['拗腰借力(臀/腹鬆)', '槓軌跡向前弧(應該直上直落)', '手肘外擴', '聳肩推'],
    easier: '坐姿啞鈴肩推 / 機械肩推 / 壺鈴肩推',
    harder: '暫停肩推 / 阿諾德推舉 / 靠牆倒立撐',
    breathe: '推之前吸氣鎖腹,推嘅時候呼氣,頂點換氣',
  },
  pullup: {
    steps: [
      '抓槓:正手握槓,闊過膊頭,全臂伸直懸吊',
      '肩胛啟動:先下沉肩胛(肩胛向後向下,唔係直接拉手)',
      '拉:胸口帶上,手肘向身體兩側收',
      '通過:拉至鎖骨過槓(或下巴過槓),頂點停 1 秒',
      '頂點:肩胛夾實,背肌收緊',
      '落返:控制 3 秒全臂伸直,肩胛放鬆伸展',
      '重複:保持節奏,唔好搖擺借力',
      '次數:做唔到 5 下就轉變體',
    ],
    mistakes: ['用二頭/前臂硬拉(應該背肌主導)', '搖擺/踢腿借力', '半程(手臂冇伸直)', '頸後引體(傷肩)'],
    easier: '彈力帶輔助 / 澳式划船 / 反握引體(Chin-up)',
    harder: '闊握引體 / 毛巾引體(強化握力)/ 負重引體',
    breathe: '拉之前吸氣,頂點呼氣,落嘅時候吸氣',
  },
  bbrow: {
    steps: [
      '站立:腳同膊頭闊,膝蓋微屈,上身前傾 45°(腰背全程挺直)',
      '握槓:膊頭闊,槓垂喺膝蓋前面,手臂伸直',
      '準備:核心鎖腹,肩胛穩定,頭保持中立',
      '拉:手肘向後帶(唔係向上),槓拉向肚臍位置',
      '頂點:夾實肩胛 1 秒,槓碰肚臍',
      '落返:控制放返,手臂伸直但唔好鬆肩胛',
      '重複:全程上身角度不變(唔好起身借力)',
      '節奏:拉 1 秒,落 2 秒',
    ],
    mistakes: ['圓背(腰受力)', '起身借力(角度變淺)', '用手拉而唔用背', '槓拉向鎖骨(變直立划船)'],
    easier: '啞鈴單臂划船(有凳支撐)/ 機械坐姿划船',
    harder: 'T 槓划船 / 反握划船 / 暫停划船',
    breathe: '拉之前吸氣,頂點呼氣,落嘅時候吸氣',
  },
  rdl: {
    steps: [
      '站立:腳同膊頭闊,膝蓋微屈(保持固定角度)',
      '握槓:膊頭闊,槓貼住大脾前側',
      '準備:肩胛收返,背脊挺直,核心鎖腹',
      '落:臀向後推(好似關門夾住條尾),槓貼住大脾滑落',
      '深度:落到腿後側有明顯拉扯(約膝蓋下方),背脊保持中立',
      '起身:臀發力向前推,槓貼身回升',
      '頂點:企直收臀,槓喺大脾頂部',
      '重複:全程膝蓋角度不變,槓唔好離身',
      '節奏:落 3 秒(重點離心),起身 1–2 秒',
    ],
    mistakes: ['圓背(腰受力)', '膝蓋屈得太多(變深蹲)', '槓離身(重心前傾)', '起身用腰代償'],
    easier: '啞鈴單腿 RDL(對稱性/核心更好)/ 壺鈴硬舉',
    harder: '單腿 RDL / 直腿硬舉 / 早安體前屈',
    breathe: '落之前吸氣,起身時呼氣,頂點換氣',
  },
  hipthrust: {
    steps: [
      '準備:上背(肩胛)貼實凳邊,槓加軟墊放喺髖骨位',
      '腳位:腳踩實地面,膝蓋屈 90°,腳尖微向外',
      '下巴收,核心鎖腹,頭放鬆',
      '發力:臀用力將髖向上推,直到上身成一直線(肩-髖-膝)',
      '頂點:收緊臀部 2 秒(最緊嘅位置),下巴收',
      '落返:控制落返,臀輕觸地面',
      '重複:全程臀受力,腰唔好代償',
      '節奏:推 1 秒,頂點停 2 秒,落 2 秒',
    ],
    mistakes: ['用腰拱起(應該臀發力)', '下巴向上(頸受力)', '腳太前/太后', '頂點唔夠高(冇成直線)'],
    easier: '臀橋(地面版)/ 彈力帶臀橋 / 單腿臀橋',
    harder: '單腿臀推 / 史密斯臀推 / 暫停臀推',
    breathe: '推之前吸氣,頂點呼氣,落嘅時候吸氣',
  },
  latpull: {
    steps: [
      '坐實:大腿鎖實墊,腳踩實地面',
      '握槓:闊過膊頭,胸口挺起,身體微後傾 10–15°',
      '準備:肩胛下沉,核心鎖腹',
      '拉:手肘指向地面,槓拉向鎖骨位置',
      '頂點:夾實背肌 1 秒,槓碰鎖骨',
      '落返:控制伸直手臂,肩胛放鬆伸展',
      '重複:身體角度全程不變(唔好大幅後仰借力)',
      '節奏:拉 1 秒,落 2–3 秒',
    ],
    mistakes: ['拉過頭(變成頸後下拉,傷肩)', '身體大幅後仰借力', '用手臂硬拉', '半程'],
    easier: '窄握高位下拉 / 機械下拉',
    harder: '闊握引體 / 單臂下拉 / 停頓下拉',
    breathe: '拉之前吸氣,頂點呼氣',
  },
  legpress: {
    steps: [
      '坐實:腰貼實椅背,臀唔好離位',
      '腳位:腳掌全踩平台,腳同膊闊,膝蓋對腳尖',
      '放:控制膝蓋向胸口方向(鎖扣解開,手扶柄)',
      '深度:膝蓋屈到 90° 左右(視活動度),腰保持貼實',
      '推:腳掌均勻發力(唔好淨係腳尖/腳跟)',
      '頂點:膝蓋微屈鎖定(唔好完全鎖死)',
      '重複:全程腰貼實,臀唔好抬起',
      '節奏:放 3 秒(離心),推 1 秒',
    ],
    mistakes: ['膝蓋內夾', '鎖死膝蓋(關節受力)', '腰離椅背(腰椎壓力)', '腳位太高/太低'],
    easier: '單腿腿舉(減重量)/ 高腳杯深蹲',
    harder: '單腿腿舉 / 暫停腿舉 / 哈克深蹲',
    breathe: '放嘅時候吸氣,推嘅時候呼氣',
  },
  pushup: {
    steps: [
      '準備:手掌撐實,手略闊過膊頭,手指微微向外',
      '身體:成一直線(頭-背-臀-腳跟),收緊臀腹',
      '落:胸口帶向地面,手肘 45°(唔好外擴)',
      '深度:胸口到近地(或全程控制),肩胛自然',
      '推:手掌發力推返,身體保持一直線',
      '頂點:手臂伸直,保持張力(唔好鎖死/塌腰)',
      '重複:全程核心鎖實,頭保持中立',
      '節奏:落 2 秒,推 1 秒',
    ],
    mistakes: ['塌腰/翹臀(核心鬆)', '手肘 90° 外擴(傷肩)', '半程', '頸向上望'],
    easier: '膝蓋伏地挺身 / 斜牆伏地挺身 / 上斜伏地挺身',
    harder: '窄距伏地挺身(三頭)/ 寬距(胸)/ 派克(肩)/ 波比跳',
    breathe: '落嘅時候吸氣,推嘅時候呼氣',
  },
  dips: {
    steps: [
      '準備:雙手撐柄,手臂伸直鎖定,身體微前傾',
      '肩胛:下沉穩定,唔好聳肩',
      '落:胸口向下,手肘 45° 向後(唔好外擴)',
      '深度:上臂去到水平(或胸到手柄位),肩前有拉伸',
      '推:胸肌/三頭髮力推返,唔好搖擺',
      '頂點:鎖定手肘,保持張力',
      '重複:全程核心鎖實,腳可以微屈',
      '節奏:落 2–3 秒,推 1 秒',
    ],
    mistakes: ['手肘外擴(傷肩)', '落得太淺', '身體過度前傾/後仰', '肩胛唔穩定'],
    easier: '彈力帶輔助雙槓 / 凳上反撐 / 機械輔助',
    harder: '負重雙槓 / 三頭雙槓(身體較直)/ 暫停雙槓',
    breathe: '落嘅時候吸氣,推嘅時候呼氣',
  },
  lunge: {
    steps: [
      '站立:雙手持啞鈴(或槓鈴),上身挺直,核心鎖腹',
      '踏出:前腳踏出約一大步,腳掌踩實',
      '落:後膝向地面,前膝對腳尖,上身保持垂直',
      '深度:後膝近地(或觸地),前大脾去到水平',
      '起身:前腳掌發力推返,唔好借後腳',
      '企直:雙腳並返,換腳',
      '重複:全程腰背挺直,頭向上',
      '節奏:落 2 秒,起身 1 秒',
    ],
    mistakes: ['前膝過腳尖太多', '上身向前傾', '後膝撞地好痛(墊墊)', '身體搖擺'],
    easier: '靜態弓步(唔使行)/ 後退弓步 / 登階',
    harder: '行進弓步 / 保加利亞分腿蹲 / 史密斯弓步',
    breathe: '落嘅時候吸氣,起身時呼氣',
  },
  plank: {
    steps: [
      '準備:手肘正喺膊頭下,前臂貼地',
      '身體:成一直線(頭-背-臀-腳跟),收緊臀腹',
      '核心:腹肌主動收緊(好似準備俾人打肚)',
      '肩胛:穩定,唔好聳肩/塌肩',
      '呼吸:保持正常呼吸,唔好憋氣',
      '時間:目標 30–60 秒,姿勢走樣就停',
      '進階:每週加 5–10 秒',
    ],
    mistakes: ['塌腰(腰受力)', '臀部翹高(半程)', '頭下垂', '憋氣'],
    easier: '膝蓋平板 / 斜牆平板',
    harder: '側平板 / 平板提膝 / 死蟲式(動態)/ 龍旗',
    breathe: '全程正常呼吸,鼻吸口呼',
  },
  thrusters: {
    steps: [
      '準備:槓鈴(或啞鈴)放鎖骨位,手肘向前,前臂垂直',
      '站立:腳同膊頭闊,核心鎖腹,臀夾實',
      '蹲落:膝蓋對腳尖,背脊挺直,落到大脾水平',
      '起身:腳發力企直,同時將槓推過頭',
      '頂點:手臂伸直鎖定,槓喺頭頂,核心收緊',
      '落返:槓落返鎖骨位,順勢接落蹲',
      '重複:蹲+推一氣呵成,節奏流暢',
      '節奏:連續做,唔好停(心肺+肌力同步)',
    ],
    mistakes: ['推槓先過起身(次序錯)', '拗腰', '手肘下垂(槓離身)', '深度唔夠'],
    easier: '啞鈴挺舉蹲(輕重量)/ 前蹲 + 肩推分開練',
    harder: '加重 / 每下底部暫停 / 波比+挺舉(CrossFit)',
    breathe: '蹲落吸氣,起身推槓時呼氣',
  },
  turkishgetup: {
    steps: [
      '起始:躺地,單手舉壺鈴垂直過頭,眼盯壺鈴,同邊腳屈膝踩地',
      '手肘撐地:另一隻手撐地,將上身撐起,壺鈴保持垂直',
      '手掌撐地:伸直手臂,臀離地,身體成拱橋',
      '穿腳:屈膝嗰邊腳向後穿過,變成半跪姿勢',
      '起身:半跪企直,壺鈴全程過頭垂直',
      '企直:站穩,壺鈴鎖定',
      '還原:逐步反向落返地面(企→半跪→穿腳→拱橋→躺)',
      '換邊:換手再做',
      '節奏:全程慢動作,每一步停 1 秒',
    ],
    mistakes: ['壺鈴偏離垂直(重心亂)', '用膊頭硬撐(應該核心+臀)', '動作太快', '望壺鈴以外',
    ],
    easier: '用鞋/輕壺鈴,或者空手練動作次序',
    harder: '加重 / 壺鈴過頭行走 / 單臂支撐起身',
    breathe: '每步呼氣,還原吸氣,保持穩定',
  },
  wallball: {
    steps: [
      '準備:藥球抱喺胸前(男 9kg / 女 6kg 起步)',
      '蹲落:膝蓋對腳尖,背挺直,大脾到水平',
      '起身:腳發力,順勢將球擲向牆上目標(約 3 米高)',
      '接球:屈膝卸力接返,順勢接落下一組蹲',
      '重複:連續做,節奏越快越好,保持呼吸',
      '次數:Hyrox 目標 100 下(可以分組)',
    ],
    mistakes: ['淨係用手擲(應該用腿)', '目標太低', '接球時腰向後仰', '球跌落地(浪費節奏)'],
    easier: '輕波 / 低目標 / 藥球砸地',
    harder: '加重 / 擲更高 / 計時 100 下',
    breathe: '蹲落吸氣,擲球呼氣',
  },
  kbellswing: {
    steps: [
      '準備:壺鈴放雙腿之間,腳闊過膊頭,腳尖微向外',
      '微蹲:屈膝,雙手抓壺鈴,背脊挺直,臀向後',
      '啟動:臀發力站直,壺鈴向前甩(唔好用手拉)',
      '頂點:壺鈴升到胸口高度,手臂放鬆伸直,核心鎖實',
      '回落:壺鈴自然跌返雙腿之間,屈膝收壺鈴',
      '重複:節奏由臀驅動,唔好停,連貫做',
      '次數:每組 10–15 下,專注爆發力',
    ],
    mistakes: ['用手臂拉(應該臀發力)', '圓背', '壺鈴過頭(高級動作先好做)', '起身太早'],
    easier: '壺鈴硬舉(停頓版)/ 輕重量',
    harder: '單手甩擺 / 壺鈴抓舉 / 高提',
    breathe: '起身時呼氣(爆發),回落時吸氣',
  },
  trapdead: {
    steps: [
      '準備:企喺梯形槓中間,腳同膊頭闊',
      '握柄:彎腰握柄,背脊挺直,臀下沉,胸口挺起',
      '張力:拉實槓,核心鎖腹',
      '起:腿推地,槓離地,全程背脊中立',
      '鎖死:企直收臀,肩胛微收',
      '落返:臀向後推,槓控住落返',
      '重複:全程槓貼身,節奏流暢',
      '好處:重心喺身體正下方,對腰比傳統硬舉更友好',
    ],
    mistakes: ['圓背', '起槓用背拉', '鎖死後仰', '落太快'],
    easier: '輕重量練動作 / 羅馬尼亞硬舉',
    harder: '加重 / 暫停硬舉 / 單手梯形槓',
    breathe: '起之前吸氣鎖腹,鎖死時呼氣',
  },
  reversechin: {
    steps: [
      '抓槓:反手握槓(掌心向自己),手同膊頭闊',
      '懸吊:全臂伸直,肩胛下沉',
      '拉:胸口帶上,二頭+背肌同時發力',
      '通過:拉至下巴過槓,頂點停 1 秒',
      '落返:控制 3 秒全伸展',
      '重複:唔好搖擺',
      '優勢:比正手引體易 20–30%,新手練背首選',
    ],
    mistakes: ['搖擺', '半程', '肩胛冇啟動'],
    easier: '彈力帶輔助 / 澳式划船',
    harder: '正手引體 / 負重反握',
    breathe: '拉之前吸氣,頂點呼氣',
  },
}

// 詳細版 fallback:由簡短提示砌成物件
export function howTo(exerciseId, muscle) {
  const d = HOW_TO[exerciseId]
  if (d) return d
  const cues = formCues(exerciseId, muscle)
  return { steps: cues, mistakes: [], easier: '', harder: '', breathe: '' }
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
