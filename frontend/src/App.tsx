import { useState, useMemo, useEffect } from 'react'

type Category = 'Food' | 'Transport' | 'Shopping' | 'Health' | 'Entertainment' | 'Other' | (string & {})

interface Expense {
  id: number
  name: string
  price: number
  category: Category
  date: string
  comment?: string
}

type PeriodMode = 'month' | 'custom'

const CATEGORIES: Category[] = ['Food', 'Transport', 'Shopping', 'Health', 'Entertainment', 'Other']

const CATEGORY_STYLES: Record<Category, { bg: string; text: string; dot: string }> = {
  Food:          { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
  Transport:     { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6' },
  Shopping:      { bg: '#FCE7F3', text: '#9D174D', dot: '#EC4899' },
  Health:        { bg: '#D1FAE5', text: '#065F46', dot: '#10B981' },
  Entertainment: { bg: '#EDE9FE', text: '#4C1D95', dot: '#8B5CF6' },
  Other:         { bg: '#F3F4F6', text: '#374151', dot: '#9CA3AF' },
}

const DEFAULT_CATEGORY_STYLE = { bg: '#E0E7FF', text: '#3730A3', dot: '#6366F1' }

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount)
}

function inputStyle(focused: boolean) {
  return {
    border: `1.5px solid ${focused ? '#5B47E0' : '#E8E4DC'}`,
    backgroundColor: focused ? '#fff' : '#FAFAF8',
  }
}

function CategoryBadge({ category }: { category: string }) {
  const s = CATEGORY_STYLES[category as keyof typeof CATEGORY_STYLES] || DEFAULT_CATEGORY_STYLE
  return (
    <span
      style={{ backgroundColor: s.bg, color: s.text }}
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium"
    >
      <span style={{ backgroundColor: s.dot }} className="w-1.5 h-1.5 rounded-full flex-shrink-0" />
      {category}
    </span>
  )
}

// ── Period Selector ───────────────────────────────────────────────────────────

interface PeriodState {
  mode: PeriodMode
  year: number
  month: number      // 0-based, used in month mode
  customFrom: string // YYYY-MM-DD
  customTo: string   // YYYY-MM-DD
}

function periodLabel(p: PeriodState): string {
  if (p.mode === 'month') return `${MONTH_NAMES[p.month]} ${p.year}`
  if (p.customFrom && p.customTo) {
    const from = new Date(p.customFrom + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
    const to   = new Date(p.customTo   + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    return `${from} – ${to}`
  }
  return 'Custom range'
}

interface PeriodSelectorProps {
  period: PeriodState
  onChange: (p: PeriodState) => void
}

function PeriodSelector({ period, onChange }: PeriodSelectorProps) {
  const [fromFocused, setFromFocused] = useState(false)
  const [toFocused,   setToFocused]   = useState(false)

  const shiftMonth = (delta: number) => {
    let m = period.month + delta
    let y = period.year
    if (m < 0)  { m = 11; y-- }
    if (m > 11) { m = 0;  y++ }
    onChange({ ...period, mode: 'month', month: m, year: y })
  }

  const switchMode = (mode: PeriodMode) => {
    if (mode === 'custom' && !period.customFrom) {
      // default to current month range
      const now = new Date()
      const y = now.getFullYear(), m = String(now.getMonth() + 1).padStart(2, '0')
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
      onChange({ ...period, mode: 'custom', customFrom: `${y}-${m}-01`, customTo: `${y}-${m}-${lastDay}` })
    } else {
      onChange({ ...period, mode })
    }
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Mode toggle */}
      <div className="flex rounded-xl overflow-hidden" style={{ border: '1.5px solid #E8E4DC' }}>
        {(['month', 'custom'] as PeriodMode[]).map(m => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className="px-3.5 py-1.5 text-xs font-semibold transition-colors capitalize"
            style={{
              backgroundColor: period.mode === m ? '#1A1A1A' : 'transparent',
              color: period.mode === m ? '#fff' : '#9CA3AF',
            }}
          >
            {m === 'month' ? 'Month' : 'Custom'}
          </button>
        ))}
      </div>

      {period.mode === 'month' ? (
        <div className="flex items-center gap-1">
          <button
            onClick={() => shiftMonth(-1)}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-white text-gray-400 hover:text-gray-700"
            style={{ border: '1.5px solid #E8E4DC' }}
          >
            ‹
          </button>
          <span
            className="px-4 py-1 rounded-lg text-sm font-semibold text-center"
            style={{ minWidth: '130px', border: '1.5px solid #E8E4DC', backgroundColor: '#fff', color: '#1A1A1A' }}
          >
            {MONTH_NAMES[period.month]} {period.year}
          </span>
          <button
            onClick={() => shiftMonth(+1)}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-white text-gray-400 hover:text-gray-700"
            style={{ border: '1.5px solid #E8E4DC' }}
          >
            ›
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>From</span>
            <input
              type="date"
              value={period.customFrom}
              onChange={e => onChange({ ...period, customFrom: e.target.value })}
              onFocus={() => setFromFocused(true)}
              onBlur={() => setFromFocused(false)}
              className="px-3 py-1.5 rounded-xl text-sm outline-none transition-all"
              style={inputStyle(fromFocused)}
            />
          </div>
          <span style={{ color: '#C4BFB8', fontSize: '0.9rem' }}>→</span>
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>To</span>
            <input
              type="date"
              value={period.customTo}
              onChange={e => onChange({ ...period, customTo: e.target.value })}
              onFocus={() => setToFocused(true)}
              onBlur={() => setToFocused(false)}
              className="px-3 py-1.5 rounded-xl text-sm outline-none transition-all"
              style={inputStyle(toFocused)}
            />
          </div>
        </div>
      )}
    </div>
  )
}




// ── Add Expense Modal ─────────────────────────────────────────────────────────
type ExpenseModalProps = {
  expense?: Expense | null
  categories: string[] // Pass dynamically tracked categories
  onClose: () => void
  onSave: (data: Expense | Omit<Expense, "id">) => void
  onAddCategory: (newCategory: string) => void // Callback to save custom category
}

function ExpenseModal({ expense, categories, onClose, onSave, onAddCategory }: ExpenseModalProps) {
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "Food",
    date: new Date().toISOString().slice(0, 10),
    comment: "", // New state field
  })

  const [isCreatingCategory, setIsCreatingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")

  const [error, setError] = useState("")
  const [nameFocused, setNameFocused] = useState(false)
  const [priceFocused, setPriceFocused] = useState(false)
  const [dateFocused, setDateFocused] = useState(false)
  const [commentFocused, setCommentFocused] = useState(false)

  useEffect(() => {
    if (expense) {
      setForm({
        name: expense.name,
        price: String(expense.price),
        category: expense.category,
        date: expense.date,
        comment: expense.comment || "",
      })
    } else {
      setForm({
        name: "",
        price: "",
        category: "Food",
        date: new Date().toISOString().slice(0, 10),
        comment: "",
      })
    }
  }, [expense])

  const handleCreateCategory = () => {
    const trimmed = newCategoryName.trim()
    if (!trimmed) return
    onAddCategory(trimmed)
    setForm(f => ({ ...f, category: trimmed }))
    setNewCategoryName("")
    setIsCreatingCategory(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Please enter an expense name.'); return }
    const price = parseFloat(form.price)
    if (isNaN(price) || price <= 0) { setError('Please enter a valid amount.'); return }

    const payload = {
      name: form.name.trim(),
      price,
      category: form.category,
      date: form.date,
      comment: form.comment.trim() || undefined,
    }

    if (expense) {
      onSave({ id: expense.id, ...payload })
    } else {
      onSave(payload)
    }

    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8" style={{ border: '1px solid #E8E4DC' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.5rem' }}>{expense ? "Edit Expense" : "New Expense"}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Expense Name</label>
            <input
              type="text"
              placeholder="e.g. Grocery run"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={inputStyle(nameFocused)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Amount (USD)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                onFocus={() => setPriceFocused(true)}
                onBlur={() => setPriceFocused(false)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={inputStyle(priceFocused)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                onFocus={() => setDateFocused(true)}
                onBlur={() => setDateFocused(false)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={inputStyle(dateFocused)}
              />
            </div>
          </div>

          {/* Dynamic Categories Selection & Custom Input */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => {
                const s = CATEGORY_STYLES[cat as keyof typeof CATEGORY_STYLES] || DEFAULT_CATEGORY_STYLE
                const active = form.category === cat
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, category: cat }))}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                    style={{
                      backgroundColor: active ? s.bg : '#F3F4F6',
                      color: active ? s.text : '#6B7280',
                      border: active ? `1.5px solid ${s.dot}` : '1.5px solid transparent',
                    }}
                  >
                    {cat}
                  </button>
                )
              })}

              {!isCreatingCategory ? (
                <button
                  type="button"
                  onClick={() => setIsCreatingCategory(true)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border border-dashed border-gray-400 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  + New Category
                </button>
              ) : (
                <div className="flex items-center gap-1.5 w-full mt-1">
                  <input
                    type="text"
                    placeholder="Category name"
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    className="px-3 py-1 text-xs rounded-lg border outline-none flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-lg"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreatingCategory(false)}
                    className="px-2 py-1 text-xs text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Comment Field */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Comment (Optional)</label>
            <textarea
              rows={2}
              placeholder="e.g. Bought at Walmart discount sale"
              value={form.comment}
              onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
              onFocus={() => setCommentFocused(true)}
              onBlur={() => setCommentFocused(false)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all resize-none"
              style={inputStyle(commentFocused)}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 mt-1"
            style={{ backgroundColor: '#5B47E0' }}
          >
            {expense ? "Save Changes" : "Add Expense"}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────

const now = new Date()

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<string[]>(CATEGORIES) // Dynamic category list
  const [showModal, setShowModal] = useState(false)

  // Function to add a unique custom category
  const handleAddCategory = (newCat: string) => {
    if (!categories.includes(newCat)) {
      setCategories(prev => [...prev, newCat])
    }
  }

  // Automatically add any custom category returned from the backend into state
  useEffect(() => {
    fetch("http://127.0.0.1:8000/expenses")
      .then(res => res.json())
      .then((data: Expense[]) => {
        setExpenses(data)
        const customCategories = Array.from(new Set(data.map(e => e.category)))
        setCategories(prev => Array.from(new Set([...prev, ...customCategories])))
      })
      .catch(err => console.error("fetch err: ", err))
  }, [])
  
  const [filterCategory, setFilterCategory] = useState<Category | 'All'>('All')
  const [nextId, setNextId] = useState(1)
  const [period, setPeriod] = useState<PeriodState>({
    mode: 'month',
    year: now.getFullYear(),
    month: now.getMonth(),
    customFrom: '',
    customTo: '',
  })
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null) //for editing 

  const handleAdd = async (data: Omit<Expense, 'id'>) => {
    // console.log("Handle add: ", data)
    const response = await fetch("http://127.0.0.1:8000/expenses", {method: "POST", headers: {"Content-Type": "application/json", }, body: JSON.stringify(data),})
    const newExpense = await response.json()
    setExpenses(prev => [newExpense, ...prev])
  }

  const handleChange = async (updatedExpense: Expense) => {
    await fetch(`http://127.0.0.1:8000/expenses/${updatedExpense.id}`, {
      method: "PUT", 
      headers: {"Content-Type": "application/json", }, 
      body: JSON.stringify(updatedExpense),})
  setExpenses(prev =>
    prev.map(expense =>
      expense.id === updatedExpense.id
        ? updatedExpense
        : expense
    )
  )
}

  const handleDelete = async (id: number) => {
    await fetch(`http://127.0.0.1:8000/expenses/${id}`, {
      method: "DELETE", })
    setExpenses(prev => prev.filter(e => e.id !== id))
  }

  // Expenses within selected period
  const periodExpenses = useMemo(() => {
    return expenses.filter(e => {
      const d = new Date(e.date + 'T00:00:00')
      if (period.mode === 'month') {
        return d.getFullYear() === period.year && d.getMonth() === period.month
      }
      if (period.customFrom && period.customTo) {
        return e.date >= period.customFrom && e.date <= period.customTo
      }
      return true
    })
  }, [expenses, period])

  // Further filtered by category
  // console.log("All expenses:", expenses)
  // console.log("Period:", period)
  // console.log("Period expenses:", periodExpenses)
  const filtered = useMemo(() =>
    filterCategory === 'All' ? periodExpenses : periodExpenses.filter(e => e.category === filterCategory),
    [periodExpenses, filterCategory]
  )

  const periodTotal = useMemo(() => periodExpenses.reduce((s, e) => s + e.price, 0), [periodExpenses])

  const topCategory = useMemo(() => {
    if (periodExpenses.length === 0) return '—'
    const totals = CATEGORIES.reduce((acc, cat) => {
      acc[cat] = periodExpenses.filter(e => e.category === cat).reduce((s, e) => s + e.price, 0)
      return acc
    }, {} as Record<Category, number>)
    return Object.entries(totals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'
  }, [periodExpenses])

  const avgPerDay = useMemo(() => {
    if (period.mode === 'month') {
      const days = new Date(period.year, period.month + 1, 0).getDate()
      return periodTotal / days
    }
    if (period.customFrom && period.customTo) {
      const from = new Date(period.customFrom + 'T00:00:00')
      const to   = new Date(period.customTo   + 'T00:00:00')
      const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86400000) + 1)
      return periodTotal / days
    }
    return 0
  }, [periodTotal, period])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFAF8', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid #E8E4DC', backgroundColor: '#FAFAF8' }}>
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.5rem', lineHeight: 1.2, color: '#1A1A1A', letterSpacing: '-0.01em' }}>
            Expense Tracker
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#5B47E0' }}
          >
            <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>+</span>
            Add Expense
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-7 flex flex-col gap-6">

        {/* Period Selector */}
        <PeriodSelector period={period} onChange={setPeriod} />

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Period Total', value: formatCurrency(periodTotal), sub: `${periodExpenses.length} expense${periodExpenses.length !== 1 ? 's' : ''}` },
            { label: 'Daily Average', value: formatCurrency(avgPerDay), sub: periodLabel(period) },
            { label: 'Top Category', value: topCategory, sub: 'by amount', serif: true },
          ].map(({ label, value, sub, serif }) => (
            <div key={label} className="bg-white rounded-2xl px-5 py-4" style={{ border: '1px solid #E8E4DC' }}>
              <p style={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '6px' }}>{label}</p>
              <p style={{ fontSize: '1.35rem', fontWeight: 600, color: '#1A1A1A', lineHeight: 1.15, fontFamily: serif ? "'DM Serif Display', serif" : 'inherit' }}>{value}</p>
              <p style={{ fontSize: '0.72rem', color: '#C4BFB8', marginTop: '3px' }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterCategory('All')}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{
              backgroundColor: filterCategory === 'All' ? '#1A1A1A' : 'transparent',
              color: filterCategory === 'All' ? '#fff' : '#9CA3AF',
              border: filterCategory === 'All' ? '1.5px solid #1A1A1A' : '1.5px solid #E8E4DC',
            }}
          >
            All
          </button>
          {CATEGORIES.map(cat => {
            const active = filterCategory === cat
            const s = CATEGORY_STYLES[cat]
            return (
              <button
                key={cat}
                onClick={() => setFilterCategory(active ? 'All' : cat)}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  backgroundColor: active ? s.bg : 'transparent',
                  color: active ? s.text : '#9CA3AF',
                  border: active ? `1.5px solid ${s.dot}` : '1.5px solid #E8E4DC',
                }}
              >
                {cat}
              </button>
            )
          })}
        </div>

        {/* Expense List */}
        <div className="flex flex-col gap-2">
          {/* {console.log("Filtered expenses:", filtered)} */}

          {filtered.length === 0 && (
            <div className="bg-white rounded-2xl py-14 text-center" style={{ border: '1px solid #E8E4DC' }}>
              <p style={{ fontSize: '2rem' }}>🪴</p>
              <p style={{ color: '#9CA3AF', marginTop: '8px', fontSize: '0.875rem' }}>No expenses for this period.</p>
            </div>
          )}
          
          {filtered.map((expense, idx) => {
            const prevDate = idx > 0 ? filtered[idx - 1].date : null
            const showDateLabel = expense.date !== prevDate
            return (
              <div key={expense.id}>
                {showDateLabel && (
                  <p style={{ fontSize: '0.7rem', color: '#C4BFB8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '6px', marginTop: idx === 0 ? 0 : '12px', paddingLeft: '2px' }}>
                    {formatDate(expense.date)}
                  </p>
                )}
                <div
                  className="bg-white rounded-xl px-5 py-3.5 flex items-center gap-4 group transition-all hover:shadow-sm"
                  style={{ border: '1px solid #E8E4DC' }}
                >
                  <div className="flex-1 min-w-0">
                    <p style={{ fontWeight: 500, fontSize: '0.9rem', color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {expense.name}
                    </p>
                    {expense.comment && (
                      <p style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>
                        💬 {expense.comment}
                      </p>
                    )}
                  </div>
                  <CategoryBadge category={expense.category} />
                  <p style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1A1A1A', minWidth: '72px', textAlign: 'right', flexShrink: 0 }}>
                    {formatCurrency(expense.price)}
                  </p>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 text-gray-300 hover:text-red-400 flex-shrink-0"
                    style={{ fontSize: '0.75rem' }}
                    title="Delete expense"
                  >✕</button>
                  <button
                    onClick={() => {
                      setSelectedExpense(expense)
                      setShowModal(true)
                    }}
                    // className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-black transition-opacity hover:opacity-90"
                    className="w-7 h-7 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-50 text-gray-300 hover:text-gray-700 flex-shrink-0"
                    style={{ fontSize: '0.75rem' }}
                    title="Change expense"
                  >✎</button>
                </div>
              </div>
            )
          })}
        </div>
      </main>

      {showModal && (
        <ExpenseModal
          expense={selectedExpense}
          categories={categories}
          onAddCategory={handleAddCategory}
          onClose={() => {
            setShowModal(false)
            setSelectedExpense(null)
          }}
          onSave={(data) => {
            if ("id" in data) {
              handleChange(data)
            } else {
              handleAdd(data)
            }
          }}
        />
      )}
    </div>
  )
}

