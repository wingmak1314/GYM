// 純邏輯引擎:PR 偵測、統計、熱力圖、CSV 匯出/匯入
// 全部係 pure functions,方便測試。

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

// Epley 1RM 估算
export function epley(kg, reps) {
  const r = Number(reps) || 0;
  const w = Number(kg) || 0;
  if (w <= 0 || r <= 0) return 0;
  return Math.round(w * (1 + r / 30));
}

export function setVolume(kg, reps) {
  return (Number(kg) || 0) * (Number(reps) || 0);
}

// 一場訓練嘅總訓練量
export function workoutVolume(w) {
  let v = 0;
  for (const ex of w.exercises || []) for (const s of ex.sets || []) v += setVolume(s.kg, s.reps);
  return Math.round(v * 10) / 10;
}
export function workoutSets(w) {
  let n = 0;
  for (const ex of w.exercises || []) n += (ex.sets || []).length;
  return n;
}
export function workoutReps(w) {
  let n = 0;
  for (const ex of w.exercises || []) for (const s of ex.sets || []) n += Number(s.reps) || 0;
  return n;
}

// 計某動作嘅歷史最佳:weight / e1rm / volume,回傳 {kg, e1rm, vol, date}
export function exercisePRs(workouts, exerciseId) {
  let best = { kg: 0, e1rm: 0, vol: 0, date: null };
  for (const w of workouts) {
    for (const ex of w.exercises) {
      if (ex.exerciseId !== exerciseId) continue;
      for (const s of ex.sets || []) {
        const wkg = Number(s.kg) || 0;
        const r = Number(s.reps) || 0;
        const e = epley(wkg, r);
        if (wkg > best.kg) best.kg = wkg, best.kgDate = w.date;
        if (e > best.e1rm) best.e1rm = e, best.e1rmDate = w.date;
        const v = setVolume(wkg, r);
        if (v > best.vol) best.vol = v, best.volDate = w.date;
      }
    }
  }
  return best;
}

// 偵測一組係咪新 PR,回傳 badge 類別: 'weight' | 'e1rm' | 'volume' | null
export function detectPR(workouts, exerciseId, kg, reps, excludeDate = null) {
  const wkg = Number(kg) || 0, r = Number(reps) || 0;
  if (wkg <= 0 || r <= 0) return null;
  const e = epley(wkg, r);
  const v = setVolume(wkg, r);
  const prev = { kg: 0, e1rm: 0, vol: 0 };
  for (const w of workouts) {
    if (excludeDate && w.date === excludeDate) continue;
    for (const ex of w.exercises) {
      if (ex.exerciseId !== exerciseId) continue;
      for (const s of ex.sets || []) {
        const wk = Number(s.kg) || 0, rr = Number(s.reps) || 0;
        if (wk > prev.kg) prev.kg = wk;
        if (epley(wk, rr) > prev.e1rm) prev.e1rm = epley(wk, rr);
        if (setVolume(wk, rr) > prev.vol) prev.vol = setVolume(wk, rr);
      }
    }
  }
  if (wkg > prev.kg && prev.kg > 0) return 'weight';
  if (e > prev.e1rm && prev.e1rm > 0) return 'e1rm';
  if (v > prev.vol && prev.vol > 0) return 'volume';
  return null;
}

// 搵該動作上一次訓練嘅組(做「上次」參考)
export function lastWorkoutFor(workouts, exerciseId) {
  for (let i = workouts.length - 1; i >= 0; i--) {
    const ex = workouts[i].exercises.find((e) => e.exerciseId === exerciseId);
    if (ex && ex.sets && ex.sets.length) return ex.sets;
  }
  return null;
}

// 熱力圖:過去 n 日,每日訓練次數
export function buildHeatmap(workouts, days = 364) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() - days);
  const map = {};
  for (const w of workouts) {
    const d = new Date(w.date + 'T00:00:00');
    if (d >= start && d <= today) {
      const key = w.date;
      map[key] = (map[key] || 0) + 1;
    }
  }
  return map;
}

// 每週訓練量(過去 n 週,由本週星期一開始計)
export function weeklyVolume(workouts, weeks = 12) {
  const out = [];
  const now = new Date();
  const dow = (now.getDay() + 6) % 7; // Mon=0
  const thisMon = new Date(now);
  thisMon.setHours(0, 0, 0, 0);
  thisMon.setDate(now.getDate() - dow);
  for (let i = weeks - 1; i >= 0; i--) {
    const start = new Date(thisMon);
    start.setDate(thisMon.getDate() - i * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    let vol = 0, sessions = 0;
    for (const w of workouts) {
      const d = new Date(w.date + 'T00:00:00');
      if (d >= start && d < end) { vol += workoutVolume(w); sessions++; }
    }
    const label = `${start.getMonth() + 1}/${start.getDate()}`;
    out.push({ label, vol: Math.round(vol), sessions });
  }
  return out;
}

// 肌群分布:近 n 日每肌群組數
export function muscleDistribution(workouts, days = 7) {
  const out = {};
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - days);
  for (const w of workouts) {
    const d = new Date(w.date + 'T00:00:00');
    if (d < cutoff) continue;
    for (const ex of w.exercises || []) {
      const m = ex.muscle || '其他';
      out[m] = (out[m] || 0) + (ex.sets || []).length;
    }
  }
  return out;
}

// 動作進度:每次訓練嘅最佳重量 + 估算 1RM
export function exerciseProgress(workouts, exerciseId) {
  const pts = [];
  for (const w of workouts) {
    for (const ex of w.exercises) {
      if (ex.exerciseId !== exerciseId) continue;
      let maxKg = 0, maxE = 0;
      for (const s of ex.sets || []) {
        const wkg = Number(s.kg) || 0, r = Number(s.reps) || 0;
        if (wkg > maxKg) maxKg = wkg;
        if (epley(wkg, r) > maxE) maxE = epley(wkg, r);
      }
      if (maxKg > 0) pts.push({ date: w.date, kg: maxKg, e1rm: maxE, label: w.date.slice(5) });
    }
  }
  pts.sort((a, b) => a.date.localeCompare(b.date));
  return pts;
}

// ---- CSV ----
const CSV_HEADER = 'Date,Exercise,Muscle,Set,Weight,Reps';

export function exportCSV(state) {
  const rows = [CSV_HEADER];
  const ws = [...state.workouts].sort((a, b) => a.date.localeCompare(b.date));
  for (const w of ws) {
    w.exercises.forEach((ex, ei) => {
      (ex.sets || []).forEach((s, si) => {
        rows.push([w.date, csvEsc(ex.name), ex.muscle || '', si + 1, s.kg, s.reps].join(','));
      });
    });
  }
  return rows.join('\n');
}

function csvEsc(v) {
  const s = String(v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function csvParseLine(line) {
  const out = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; } else inQ = false;
      } else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === ',') { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

// 匯入:支援自家格式 + Hevy(Weight kg/Reps)+ Strong(Weight/Reps)
export function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { workouts: [], errors: ['檔案冇資料'] };
  const header = csvParseLine(lines[0]).map((h) => h.toLowerCase());
  const errors = [];
  const idx = {};
  const dateI = header.indexOf('date');
  const exI = header.indexOf('exercise') >= 0 ? header.indexOf('exercise') : header.indexOf('exercise name');
  const wtI = header.indexOf('weight kg') >= 0 ? header.indexOf('weight kg') : header.indexOf('weight');
  const rpI = header.indexOf('reps');
  const setI = header.indexOf('set') >= 0 ? header.indexOf('set') : header.indexOf('set order');
  if (dateI < 0 || exI < 0 || wtI < 0 || rpI < 0) {
    return { workouts: [], errors: [`認唔到表頭:${lines[0]}`] };
  }
  const byDate = {};
  for (let i = 1; i < lines.length; i++) {
    const c = csvParseLine(lines[i]);
    if (c.length <= Math.max(dateI, exI, wtI, rpI)) continue;
    const date = (c[dateI] || '').trim().slice(0, 10);
    const name = (c[exI] || '').trim();
    const kg = parseFloat(c[wtI]);
    const reps = parseInt(c[rpI], 10);
    if (!date || !name || isNaN(kg) || kg < 0 || isNaN(reps) || reps <= 0) { errors.push(`第 ${i + 1} 行跳過(資料不完整):${lines[i].slice(0, 60)}`); continue; }
    if (!byDate[date]) byDate[date] = {};
    if (!byDate[date][name]) byDate[date][name] = [];
    byDate[date][name].push({ kg, reps });
  }
  const workouts = Object.keys(byDate).sort().map((date) => ({
    id: uid(),
    date,
    name: '匯入訓練',
    exercises: Object.keys(byDate[date]).map((name) => ({
      exerciseId: null,
      name,
      muscle: '',
      sets: byDate[date][name].map((s) => ({ kg: s.kg, reps: s.reps })),
    })),
  }));
  return { workouts, errors };
}
