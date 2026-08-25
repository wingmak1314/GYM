// localStorage 持久層
const KEY = 'gymlog_v1';

export const defaultState = () => ({
  workouts: [],      // [{id, date:'YYYY-MM-DD', name, exercises:[{exerciseId, name, muscle, sets:[{kg,reps}]}]}]
  measurements: [],  // [{date, weight, bodyFat?, chest?, waist?}]
  photos: [],        // [{id, date, dataUrl}]
  templates: [],     // [{id, name, exercises:[{exerciseId, name, muscle}]}]
  customExercises: [], // [{id, zh, muscle, equipment}]
  suppLog: {},       // { 'YYYY-MM-DD': ['肌酸', '蛋白粉'] }
  suppList: ['蛋白粉', '肌酸', '魚油', '維他命D', '鋅鎂片', '咖啡因'],
  settings: { unit: 'kg', goal: '增肌', ghToken: '', ghGistId: '', autoGh: false, lastSync: '' },
});

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const s = JSON.parse(raw);
    return { ...defaultState(), ...s, settings: { ...defaultState().settings, ...(s.settings || {}) } };
  } catch {
    return defaultState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    console.error('save failed', e);
  }
}

export function clearState() {
  try { localStorage.removeItem(KEY); } catch { /* noop */ }
}
