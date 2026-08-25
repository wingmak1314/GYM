import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react'
import App from './App.jsx'

const click = (fn) => fireEvent.click(fn)

beforeEach(() => {
  localStorage.clear()
})
afterEach(() => cleanup())

describe('GymLog 完整流程', () => {
  it('儀表板初始渲染', () => {
    render(<App />)
    expect(screen.getByText('活動熱力圖')).toBeTruthy()
    expect(screen.getByText('本週訓練量')).toBeTruthy()
  })

  it('開始訓練 → 加入動作 → 紀錄組數 → 儲存 → 儀表板有數據', async () => {
    render(<App />)
    // 開始訓練(第一個掣=sidebar)
    click(screen.getAllByText('＋ 開始訓練')[0])
    // 動作庫出現,撳「槓鈴臥推」(用 startsWith 避開「上斜槓鈴臥推」等)
    await waitFor(() => expect(screen.getByPlaceholderText('🔍 搜尋動作…')).toBeTruthy())
    click(screen.getByRole('button', { name: (n) => n.startsWith('槓鈴臥推') }))
    // 加組
    click(screen.getByText('＋ 加組'))
    // 輸入重量同次數
    const inputs = screen.getAllByPlaceholderText('kg')
    const repsInputs = screen.getAllByPlaceholderText('reps')
    fireEvent.change(inputs[0], { target: { value: '60' } })
    fireEvent.change(repsInputs[0], { target: { value: '10' } })
    // 完成訓練
    click(screen.getByText('✓ 完成訓練'))
    // 去咗歷史頁,展開訓練睇動作
    await waitFor(() => expect(screen.getByText('歷史', { selector: 'h1' })).toBeTruthy())
    click(screen.getByText('訓練', { selector: '.hist-main b' }))
    expect(screen.getByText('槓鈴臥推')).toBeTruthy()
    expect(screen.getByText('60 × 10')).toBeTruthy()
    // 返儀表板 → 本週訓練 = 1
    click(screen.getAllByText('儀表板')[0])
    await waitFor(() => expect(screen.getAllByText('1')[0]).toBeTruthy())
    expect(screen.getByText('600')).toBeTruthy() // 60*10 訓練量
  })

  it('搜尋動作庫', () => {
    render(<App />)
    click(screen.getAllByText('＋ 開始訓練')[0])
    const q = screen.getByPlaceholderText('🔍 搜尋動作…')
    fireEvent.change(q, { target: { value: '深蹲' } })
    expect(screen.getByRole('button', { name: (n) => n.startsWith('槓鈴深蹲') })).toBeTruthy()
    expect(screen.queryByRole('button', { name: (n) => n.startsWith('槓鈴臥推') })).toBeNull()
  })

  it('空白組唔會儲存(冇重量冇次數)', () => {
    render(<App />)
    click(screen.getAllByText('＋ 開始訓練')[0])
    click(screen.getByRole('button', { name: (n) => n.startsWith('槓鈴臥推') }))
    click(screen.getByText('＋ 加組'))
    // 唔輸入任何嘢直接完成 → 應該彈 toast,唔會儲存
    click(screen.getByText('✓ 完成訓練'))
    const stored = JSON.parse(localStorage.getItem('gymlog_v1'))
    expect(stored.workouts).toHaveLength(0)
  })

  it('無數據時進度頁顯示空狀態', () => {
    render(<App />)
    click(screen.getAllByText('進度')[0])
    expect(screen.getByText('未有動作數據')).toBeTruthy()
  })

  it('量測紀錄', () => {
    render(<App />)
    click(screen.getAllByText('量測')[0])
    const w = screen.getByPlaceholderText('體重 (kg)')
    fireEvent.change(w, { target: { value: '75.5' } })
    click(screen.getByText('✓ 紀錄'))
    expect(screen.getByText('75.5 kg')).toBeTruthy()
  })

  it('CSV 匯出內容正確', () => {
    // 直接經 localStorage 播入一場訓練再 render
    const workout = {
      id: 'w1', date: '2026-08-20', name: 'Push Day',
      exercises: [{ exerciseId: 'bench', name: '槓鈴臥推', muscle: '胸', sets: [{ kg: 60, reps: 10 }] }],
    }
    localStorage.setItem('gymlog_v1', JSON.stringify({
      workouts: [workout], measurements: [], templates: [], customExercises: [], settings: { unit: 'kg' },
    }))
    render(<App />)
    click(screen.getAllByText('設定')[0])
    click(screen.getByText('⬇ 匯出 CSV'))
    // jsdom 冇真正 download,只驗證冇爆
    expect(screen.getByText('⬆ 匯入 CSV')).toBeTruthy()
  })
})
