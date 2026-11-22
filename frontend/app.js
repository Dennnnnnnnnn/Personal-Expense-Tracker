// Vanilla JavaScript version of the Expense Tracker.
// The API URL below is the same backend endpoint used by the original React app.
const API_URL = "http://127.0.0.1:8000/expenses";

const DEFAULT_CATEGORIES = ["Food", "Transport", "Shopping", "Health", "Entertainment", "Other"];
const CATEGORY_STYLES = {
  Food: { bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B" },
  Transport: { bg: "#DBEAFE", text: "#1E40AF", dot: "#3B82F6" },
  Shopping: { bg: "#FCE7F3", text: "#9D174D", dot: "#EC4899" },
  Health: { bg: "#D1FAE5", text: "#065F46", dot: "#10B981" },
  Entertainment: { bg: "#EDE9FE", text: "#4C1D95", dot: "#8B5CF6" },
  Other: { bg: "#F3F4F6", text: "#374151", dot: "#9CA3AF" }
};
const DEFAULT_STYLE = { bg: "#E0E7FF", text: "#3730A3", dot: "#6366F1" };
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

let expenses = [];
let categories = [...DEFAULT_CATEGORIES];
let filterCategory = "All";
let selectedCategory = "Food";
let editingExpense = null;
let period = { mode: "month", year: new Date().getFullYear(), month: new Date().getMonth(), customFrom: "", customTo: "" };

const $ = (id) => document.getElementById(id);
const escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[char]));

function money(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value) || 0);
}
function dateLabel(value) {
  return new Date(value + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function periodLabel() {
  if (period.mode === "month") return `${MONTHS[period.month]} ${period.year}`;
  if (period.customFrom && period.customTo) {
    const from = new Date(period.customFrom + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
    const to = new Date(period.customTo + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    return `${from} – ${to}`;
  }
  return "Custom range";
}
function getPeriodExpenses() {
  return expenses.filter(item => {
    // API dates are YYYY-MM-DD, so string comparisons are chronological and timezone-safe.
    if (period.mode === "month") {
      const date = new Date(`${item.date}T00:00:00`);
      return date.getFullYear() === period.year && date.getMonth() === period.month;
    }

    // Custom mode supports From only, To only, or both (inclusive).
    if (period.customFrom && item.date < period.customFrom) return false;
    if (period.customTo && item.date > period.customTo) return false;
    return true;
  });
}
function categoryStyle(category) { return CATEGORY_STYLES[category] || DEFAULT_STYLE; }

function renderPeriod() {
  $("month-mode").classList.toggle("active", period.mode === "month");
  $("custom-mode").classList.toggle("active", period.mode === "custom");

  // Exactly one set of controls is visible for the active mode.
  // Month mode: show month navigation only; hide both custom date inputs.
  // Custom mode: hide month navigation and show the From / To date inputs.
  $("month-controls").hidden = period.mode !== "month";
  $("custom-controls").hidden = period.mode !== "custom";

  $("month-label").textContent = `${MONTHS[period.month]} ${period.year}`;
  $("date-from").value = period.customFrom;
  $("date-to").value = period.customTo;
}
function renderFilters() {
  const all = ["All", ...categories];
  $("category-filters").innerHTML = all.map(cat => {
    const active = filterCategory === cat;
    const style = categoryStyle(cat);
    const inline = cat === "All"
      ? (active ? "background:#1a1a1a;color:white;border-color:#1a1a1a" : "")
      : (active ? `background:${style.bg};color:${style.text};border-color:${style.dot}` : "");
    return `<button class="filter-chip ${active ? "active" : ""}" style="${inline}" data-filter="${escapeHTML(cat)}">${escapeHTML(cat)}</button>`;
  }).join("");
}
function renderSummary(periodItems) {
  const total = periodItems.reduce((sum, item) => sum + Number(item.price), 0);
  let days = 0;
  if (period.mode === "month") days = new Date(period.year, period.month + 1, 0).getDate();
  else {
    const firstExpenseDate = periodItems.length ? periodItems.reduce((min, item) => item.date < min ? item.date : min, periodItems[0].date) : "";
    const lastExpenseDate = periodItems.length ? periodItems.reduce((max, item) => item.date > max ? item.date : max, periodItems[0].date) : "";
    const from = period.customFrom || firstExpenseDate;
    const to = period.customTo || lastExpenseDate;
    if (from && to && from <= to) {
      days = Math.max(1, Math.round((new Date(`${to}T00:00:00`) - new Date(`${from}T00:00:00`)) / 86400000) + 1);
    }
  }
  const totals = {};
  periodItems.forEach(item => totals[item.category] = (totals[item.category] || 0) + Number(item.price));
  const top = Object.entries(totals).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
  $("period-total").textContent = money(total);
  $("expense-count").textContent = `${periodItems.length} expense${periodItems.length === 1 ? "" : "s"}`;
  $("daily-average").textContent = money(days ? total / days : 0);
  $("period-description").textContent = periodLabel();
  $("top-category").textContent = top;
}
function renderExpenses(items) {
  const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date) || Number(b.id) - Number(a.id));
  if (!sorted.length) {
    $("expense-list").innerHTML = `<div class="empty-state"><div class="plant">🪴</div>No expenses for this period.</div>`;
    return;
  }
  let previousDate = "";
  $("expense-list").innerHTML = sorted.map(item => {
    const style = categoryStyle(item.category);
    const dateHeading = item.date !== previousDate ? `<p class="expense-date-heading">${dateLabel(item.date)}</p>` : "";
    previousDate = item.date;
    return `${dateHeading}
      <article class="expense-row">
        <div class="expense-info">
          <div class="expense-name">${escapeHTML(item.name)}</div>
          ${item.comment ? `<div class="expense-comment">💬 ${escapeHTML(item.comment)}</div>` : ""}
        </div>
        <span class="category-badge" style="background:${style.bg};color:${style.text}">
          <span class="category-dot" style="background:${style.dot}"></span>${escapeHTML(item.category)}
        </span>
        <div class="expense-price">${money(item.price)}</div>
        <div class="row-actions">
          <button type="button" data-edit="${item.id}" title="Edit expense" aria-label="Edit ${escapeHTML(item.name)}">✏️</button>
          <button type="button" data-delete="${item.id}" title="Delete expense" aria-label="Delete ${escapeHTML(item.name)}">×</button>
        </div>
      </article>`;
  }).join("");
}
function render() {
  renderPeriod();
  const periodItems = getPeriodExpenses();
  renderSummary(periodItems);
  renderFilters();
  const visible = filterCategory === "All" ? periodItems : periodItems.filter(item => item.category === filterCategory);
  renderExpenses(visible);
}
function showStatus(message, isError = true) {
  $("status-message").textContent = message;
  $("status-message").style.color = isError ? "#dc6b45" : "#16804a";
}
async function loadExpenses() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`Server returned ${response.status}`);
    const data = await response.json();
    expenses = Array.isArray(data) ? data : [];
    const custom = expenses.map(item => item.category).filter(Boolean);
    categories = [...new Set([...DEFAULT_CATEGORIES, ...custom])];
    showStatus("");
  } catch (error) {
    showStatus("Could not connect to the backend. Start your backend server at http://127.0.0.1:8000, then refresh this page.");
    console.error(error);
  }
  render();
}
async function addExpense(data) {
  const response = await fetch(API_URL, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error(`Could not save expense (${response.status})`);
  const created = await response.json();
  expenses.unshift(created);
}
async function updateExpense(data) {
  const response = await fetch(`${API_URL}/${data.id}`, {
    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error(`Could not update expense (${response.status})`);
  expenses = expenses.map(item => Number(item.id) === Number(data.id) ? data : item);
}
async function deleteExpense(id) {
  const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error(`Could not delete expense (${response.status})`);
  expenses = expenses.filter(item => Number(item.id) !== Number(id));
}

function openModal(item = null) {
  editingExpense = item;
  selectedCategory = item?.category || "Food";
  $("modal-title").textContent = item ? "Edit Expense" : "New Expense";
  $("save-expense").textContent = item ? "Save Changes" : "Add Expense";
  $("expense-name").value = item?.name || "";
  $("expense-price").value = item ? item.price : "";
  $("expense-date").value = item?.date || new Date().toISOString().slice(0, 10);
  $("expense-comment").value = item?.comment || "";
  $("form-error").textContent = "";
  renderModalCategories();
  $("expense-modal").hidden = false;
  $("expense-name").focus();
}
function closeModal() {
  $("expense-modal").hidden = true;
  editingExpense = null;
}
function renderModalCategories() {
  $("modal-categories").innerHTML = categories.map(cat => {
    const style = categoryStyle(cat);
    return `<button type="button" class="modal-category ${selectedCategory === cat ? "selected" : ""}"
      data-modal-category="${escapeHTML(cat)}"
      style="background:${style.bg};color:${style.text};border-color:${selectedCategory === cat ? style.dot : "transparent"}">
      ${escapeHTML(cat)}</button>`;
  }).join("");
}

$("add-expense").addEventListener("click", () => openModal());
$("close-modal").addEventListener("click", closeModal);
$("expense-modal").addEventListener("click", event => { if (event.target === $("expense-modal")) closeModal(); });
document.addEventListener("keydown", event => { if (event.key === "Escape") closeModal(); });

$("theme-toggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const dark = document.body.classList.contains("dark");
  $("theme-toggle").textContent = dark ? "☀️" : "🌙";
  localStorage.setItem("expense-tracker-theme", dark ? "dark" : "light");
});

$("month-mode").addEventListener("click", () => { period.mode = "month"; render(); });
$("custom-mode").addEventListener("click", () => {
  if (!period.customFrom) {
    const now = new Date();
    period.customFrom = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    period.customTo = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  }
  period.mode = "custom"; render();
});
$("previous-month").addEventListener("click", () => {
  period.month--;
  if (period.month < 0) { period.month = 11; period.year--; }
  render();
});
$("next-month").addEventListener("click", () => {
  period.month++;
  if (period.month > 11) { period.month = 0; period.year++; }
  render();
});
$("date-from").addEventListener("change", event => {
  period.customFrom = event.target.value;
  render();
  if (period.customFrom && period.customTo && period.customFrom > period.customTo) {
    showStatus("The From date must be on or before the To date.");
  } else {
    showStatus("");
  }
});
$("date-to").addEventListener("change", event => {
  period.customTo = event.target.value;
  render();
  if (period.customFrom && period.customTo && period.customFrom > period.customTo) {
    showStatus("The To date must be on or after the From date.");
  } else {
    showStatus("");
  }
});

$("category-filters").addEventListener("click", event => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;
  const category = button.dataset.filter;
  filterCategory = category === filterCategory && category !== "All" ? "All" : category;
  render();
});
$("expense-list").addEventListener("click", async event => {
  const edit = event.target.closest("[data-edit]");
  const remove = event.target.closest("[data-delete]");
  if (edit) {
    const item = expenses.find(expense => Number(expense.id) === Number(edit.dataset.edit));
    if (item) openModal(item);
  }
  if (remove) {
    const id = Number(remove.dataset.delete);
    if (!confirm("Delete this expense?")) return;
    try { await deleteExpense(id); render(); showStatus("Expense deleted.", false); }
    catch (error) { showStatus(error.message); }
  }
});
$("modal-categories").addEventListener("click", event => {
  const button = event.target.closest("[data-modal-category]");
  if (!button) return;
  selectedCategory = button.dataset.modalCategory;
  renderModalCategories();
});
$("create-category").addEventListener("click", () => {
  const name = $("new-category-name").value.trim();
  if (!name) return;
  if (!categories.includes(name)) categories.push(name);
  selectedCategory = name;
  $("new-category-name").value = "";
  renderModalCategories();
  renderFilters();
});
$("expense-form").addEventListener("submit", async event => {
  event.preventDefault();
  const name = $("expense-name").value.trim();
  const price = Number.parseFloat($("expense-price").value);
  const date = $("expense-date").value;
  if (!name) { $("form-error").textContent = "Please enter an expense name."; return; }
  if (!Number.isFinite(price) || price <= 0) { $("form-error").textContent = "Please enter a valid amount."; return; }
  if (!date) { $("form-error").textContent = "Please choose a date."; return; }
  const data = { name, price, category: selectedCategory, date, comment: $("expense-comment").value.trim() || undefined };
  try {
    $("save-expense").disabled = true;
    const wasEditing = Boolean(editingExpense);
    if (editingExpense) await updateExpense({ id: editingExpense.id, ...data });
    else await addExpense(data);
    closeModal();
    render();
    showStatus(wasEditing ? "Expense updated." : "Expense added.", false);
  } catch (error) {
    $("form-error").textContent = error.message + ". Check that the backend is running.";
  } finally {
    $("save-expense").disabled = false;
  }
});

if (localStorage.getItem("expense-tracker-theme") === "dark") {
  document.body.classList.add("dark");
  $("theme-toggle").textContent = "☀️";
}
render();
loadExpenses();
