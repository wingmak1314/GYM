// 動作庫 — 肌群 / 器材分類
// muscle: 胸 | 背 | 肩 | 二頭 | 三頭 | 股四頭 | 腿後側 | 臀 | 小腿 | 核心
// equipment: 槓鈴 | 啞鈴 | 機械 | 纜繩 | 自重 | 壺鈴

export const MUSCLES = ['胸', '背', '肩', '二頭', '三頭', '股四頭', '腿後側', '臀', '小腿', '核心'];

export const EXERCISES = [
  // 胸
  { id: 'bench', zh: '槓鈴臥推', en: 'Barbell Bench Press', muscle: '胸', equipment: '槓鈴' },
  { id: 'dbench', zh: '啞鈴臥推', en: 'Dumbbell Bench Press', muscle: '胸', equipment: '啞鈴' },
  { id: 'ibench', zh: '上斜槓鈴臥推', en: 'Incline Barbell Press', muscle: '胸', equipment: '槓鈴' },
  { id: 'idbench', zh: '上斜啞鈴臥推', en: 'Incline DB Press', muscle: '胸', equipment: '啞鈴' },
  { id: 'decline', zh: '下斜臥推', en: 'Decline Bench Press', muscle: '胸', equipment: '槓鈴' },
  { id: 'pecdeck', zh: '蝴蝶機夾胸', en: 'Pec Deck Fly', muscle: '胸', equipment: '機械' },
  { id: 'cablefly', zh: '纜繩飛鳥', en: 'Cable Fly', muscle: '胸', equipment: '纜繩' },
  { id: 'pushup', zh: '伏地挺身', en: 'Push-up', muscle: '胸', equipment: '自重' },
  { id: 'dips', zh: '雙槓撐體', en: 'Chest Dips', muscle: '胸', equipment: '自重' },
  // 背
  { id: 'deadlift', zh: '硬舉', en: 'Deadlift', muscle: '背', equipment: '槓鈴' },
  { id: 'pullup', zh: '引體向上', en: 'Pull-up', muscle: '背', equipment: '自重' },
  { id: 'latpull', zh: '高位下拉', en: 'Lat Pulldown', muscle: '背', equipment: '機械' },
  { id: 'bbrow', zh: '槓鈴划船', en: 'Barbell Row', muscle: '背', equipment: '槓鈴' },
  { id: 'dbrow', zh: '啞鈴划船', en: 'Dumbbell Row', muscle: '背', equipment: '啞鈴' },
  { id: 'searow', zh: '坐姿滑輪划船', en: 'Seated Cable Row', muscle: '背', equipment: '機械' },
  { id: 'pulldown', zh: '直臂下壓', en: 'Straight-arm Pulldown', muscle: '背', equipment: '纜繩' },
  { id: 'onearmrow', zh: '單臂纜繩划船', en: 'One-arm Cable Row', muscle: '背', equipment: '纜繩' },
  { id: 'backext', zh: '背伸', en: 'Back Extension', muscle: '背', equipment: '自重' },
  // 肩
  { id: 'ohp', zh: '站姿槓鈴肩推', en: 'Overhead Press', muscle: '肩', equipment: '槓鈴' },
  { id: 'dbohp', zh: '坐姿啞鈴肩推', en: 'Seated DB Shoulder Press', muscle: '肩', equipment: '啞鈴' },
  { id: 'arnold', zh: '阿諾德推舉', en: 'Arnold Press', muscle: '肩', equipment: '啞鈴' },
  { id: 'laterals', zh: '啞鈴側平舉', en: 'Lateral Raise', muscle: '肩', equipment: '啞鈴' },
  { id: 'reardelt', zh: '反向飛鳥', en: 'Reverse Fly', muscle: '肩', equipment: '啞鈴' },
  { id: 'facelift', zh: '面拉', en: 'Face Pull', muscle: '肩', equipment: '纜繩' },
  { id: 'frontraise', zh: '纜繩前平舉', en: 'Cable Front Raise', muscle: '肩', equipment: '纜繩' },
  { id: 'uprightrow', zh: '槓鈴直立划船', en: 'Upright Row', muscle: '肩', equipment: '槓鈴' },
  // 二頭
  { id: 'bbcurl', zh: '槓鈴彎舉', en: 'Barbell Curl', muscle: '二頭', equipment: '槓鈴' },
  { id: 'dbcurl', zh: '啞鈴彎舉', en: 'Dumbbell Curl', muscle: '二頭', equipment: '啞鈴' },
  { id: 'hammer', zh: '錘式彎舉', en: 'Hammer Curl', muscle: '二頭', equipment: '啞鈴' },
  { id: 'preacher', zh: '牧師椅彎舉', en: 'Preacher Curl', muscle: '二頭', equipment: '機械' },
  { id: 'cablecurl', zh: '纜繩彎舉', en: 'Cable Curl', muscle: '二頭', equipment: '纜繩' },
  { id: 'conccurl', zh: '集中彎舉', en: 'Concentration Curl', muscle: '二頭', equipment: '啞鈴' },
  // 三頭
  { id: 'pushdown', zh: '纜繩下壓', en: 'Triceps Pushdown', muscle: '三頭', equipment: '纜繩' },
  { id: 'ropedown', zh: '繩索下壓', en: 'Rope Pushdown', muscle: '三頭', equipment: '纜繩' },
  { id: 'skull', zh: '仰臥臂屈伸', en: 'Skull Crusher', muscle: '三頭', equipment: '槓鈴' },
  { id: 'closebench', zh: '窄距臥推', en: 'Close-grip Bench Press', muscle: '三頭', equipment: '槓鈴' },
  { id: 'ohdbext', zh: '啞鈴過頭臂屈伸', en: 'Overhead DB Extension', muscle: '三頭', equipment: '啞鈴' },
  { id: 'tricepsdips', zh: '雙槓撐體(三頭)', en: 'Triceps Dips', muscle: '三頭', equipment: '自重' },
  // 股四頭
  { id: 'squat', zh: '槓鈴深蹲', en: 'Barbell Back Squat', muscle: '股四頭', equipment: '槓鈴' },
  { id: 'frontsquat', zh: '前蹲', en: 'Front Squat', muscle: '股四頭', equipment: '槓鈴' },
  { id: 'legpress', zh: '腿舉', en: 'Leg Press', muscle: '股四頭', equipment: '機械' },
  { id: 'legext', zh: '腿伸機', en: 'Leg Extension', muscle: '股四頭', equipment: '機械' },
  { id: 'goblet', zh: '高腳杯深蹲', en: 'Goblet Squat', muscle: '股四頭', equipment: '啞鈴' },
  { id: 'hacksquat', zh: '哈克深蹲', en: 'Hack Squat', muscle: '股四頭', equipment: '機械' },
  { id: 'lunge', zh: '啞鈴弓步蹲', en: 'Dumbbell Lunge', muscle: '股四頭', equipment: '啞鈴' },
  { id: 'bulgarian', zh: '保加利亞分腿蹲', en: 'Bulgarian Split Squat', muscle: '股四頭', equipment: '啞鈴' },
  // 腿後側
  { id: 'rdl', zh: '羅馬尼亞硬舉', en: 'Romanian Deadlift', muscle: '腿後側', equipment: '槓鈴' },
  { id: 'legcurl', zh: '俯臥腿彎舉', en: 'Lying Leg Curl', muscle: '腿後側', equipment: '機械' },
  { id: 'seatedcurl', zh: '坐姿腿彎舉', en: 'Seated Leg Curl', muscle: '腿後側', equipment: '機械' },
  { id: 'sldl', zh: '直腿硬舉', en: 'Stiff-leg Deadlift', muscle: '腿後側', equipment: '槓鈴' },
  { id: 'dbromani', zh: '啞鈴單腿硬舉', en: 'Single-leg DB RDL', muscle: '腿後側', equipment: '啞鈴' },
  // 臀
  { id: 'hipthrust', zh: '臀推', en: 'Hip Thrust', muscle: '臀', equipment: '槓鈴' },
  { id: 'glutebridge', zh: '臀橋', en: 'Glute Bridge', muscle: '臀', equipment: '自重' },
  { id: 'kbellswing', zh: '壺鈴甩擺', en: 'Kettlebell Swing', muscle: '臀', equipment: '壺鈴' },
  { id: 'cablekick', zh: '纜繩後踢腿', en: 'Cable Kickback', muscle: '臀', equipment: '纜繩' },
  { id: 'abductor', zh: '髖外展機', en: 'Hip Abduction', muscle: '臀', equipment: '機械' },
  // 小腿
  { id: 'calfraise', zh: '站姿提踵', en: 'Standing Calf Raise', muscle: '小腿', equipment: '機械' },
  { id: 'seatedcalf', zh: '坐姿提踵', en: 'Seated Calf Raise', muscle: '小腿', equipment: '機械' },
  // 核心
  { id: 'crunch', zh: '捲腹', en: 'Crunch', muscle: '核心', equipment: '自重' },
  { id: 'plank', zh: '平板支撐', en: 'Plank', muscle: '核心', equipment: '自重' },
  { id: 'russiantwist', zh: '俄羅斯轉體', en: 'Russian Twist', muscle: '核心', equipment: '自重' },
  { id: 'hangingleg', zh: '懸吊舉腿', en: 'Hanging Leg Raise', muscle: '核心', equipment: '自重' },
  { id: 'legraise', zh: '仰臥抬腿', en: 'Leg Raise', muscle: '核心', equipment: '自重' },
  { id: 'sideplank', zh: '側平板', en: 'Side Plank', muscle: '核心', equipment: '自重' },
  { id: 'cablecrunch', zh: '纜繩捲腹', en: 'Cable Crunch', muscle: '核心', equipment: '纜繩' },
  // 全身
  { id: 'burpee', zh: '波比跳', en: 'Burpee', muscle: '核心', equipment: '自重' },
  { id: 'farmerwalk', zh: '農夫行走', en: 'Farmer\'s Walk', muscle: '背', equipment: '啞鈴' },
];

export const EQUIPMENTS = ['槓鈴', '啞鈴', '機械', '纜繩', '自重', '壺鈴'];

export function findExercise(id) {
  return EXERCISES.find((e) => e.id === id) || null;
}

export function exerciseName(id, fallback) {
  const e = findExercise(id);
  return e ? e.zh : fallback || id;
}
