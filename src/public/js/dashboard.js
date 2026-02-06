
document.addEventListener("DOMContentLoaded", () => {
  const sidebarLinks = document.querySelectorAll(".sidebar-link");
  const panels = document.querySelectorAll(".tab-panel");

  function setActive(tab) {
    // show / hide panels
    panels.forEach(p => {
      p.classList.toggle("hidden", p.dataset.panel !== tab);
    });

    // sidebar active styles
    sidebarLinks.forEach(a => {
      if (a.dataset.tab === tab) {
        a.classList.add("active", "bg-[#e9f4ff]", "text-[#2f8afc]");
        a.classList.remove("hover:bg-slate-50");
      } else {
        a.classList.remove("active", "bg-[#e9f4ff]", "text-[#2f8afc]");
        a.classList.add("hover:bg-slate-50");
      }
    });
  }

  // ✅ default tab
  setActive("income");

  sidebarLinks.forEach(a => {
    a.addEventListener("click", e => {

      // ✅ REAL PAGE LINK (ADMIN) → allow redirect
      if (a.getAttribute("href") !== "#") return;

      e.preventDefault();
      setActive(a.dataset.tab);
    });
  });

  // ✅ expose for reports.js
  window.setActiveTab = setActive;
});


/* ===============================
   UTIL
================================ */
function formatINR(n) {
  return "₹" + Number(n || 0).toFixed(2);
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN");
}

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

/* ===============================
   FILTER DEFAULTS
================================ */
const filterYear = document.getElementById("filterYear");
const filterMonth = document.getElementById("filterMonth");

function setDefaultYearMonth() {
  const now = new Date();
  filterYear.value = now.getFullYear();
  filterMonth.value = MONTH_NAMES[now.getMonth()];
}


/* ===============================
   ADD EXPENSE
================================ */
document.getElementById("addExpenseForm")
?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    expenseDetails: expenseDetails.value.trim(),
    date: expenseDate.value,
    payment: expensePaymentMode.value,
    amount: Number(expenseAmount.value)
  };

  if (!payload.expenseDetails || !payload.date || payload.amount <= 0) {
    alert("Fill all fields");
    return;
  }

  await apiFetch("/api/expenses", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  e.target.reset();
  expenseDate.value = new Date().toISOString().substring(0, 10);

  await loadExpensesSimple();
  applyFilters();
  updateKPIsByFilter();
});

/* ===============================
   DELETE EXPENSE
================================ */
document.addEventListener("click", async (e) => {
  if (!e.target.classList.contains("delete-expense")) return;

  const id = e.target.closest("tr").dataset.id;
  if (!confirm("Delete expense?")) return;

  await apiFetch(`/api/expenses/${id}`, { method: "DELETE" });

  await loadExpensesSimple();
  applyFilters();
  updateKPIsByFilter();

});
// ROLE BASED ADMIN ACCESS
const role = localStorage.getItem("bsh_role");

if (role === "ADMIN" || role === "SUPER_ADMIN") {
  document.getElementById("adminMenu")?.classList.remove("hidden");
}

/* ===============================
   FILTER LOGIC
================================ */
if (filterYear && filterMonth) {
  filterYear.addEventListener("change", () => {
  applyFilters();
  calculateVisibleExpenseTotal();
});

filterMonth.addEventListener("change", () => {
  applyFilters();
  calculateVisibleExpenseTotal();
});

}

function applyFilters() {
  filterTableByDate("incomeTbody");
  filterTableByDate("expensesTbody");
  filterTableByDate("savingsTbody");
  updateKPIsByFilter();
}

function filterTableByDate(tbodyId) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;

  const year = Number(filterYear.value);
  const month = filterMonth.value;

  tbody.querySelectorAll("tr").forEach(row => {
    const dateCell = row.querySelector('[data-field="date"]');
    if (!dateCell) return;

    const raw = dateCell.dataset.rawDate;
    if (!raw) return;

    const d = new Date(raw);
    const yearMatch = d.getFullYear() === year;
    const monthMatch =
      month === "All Months" ||
      MONTH_NAMES[d.getMonth()] === month;

    row.style.display = (yearMatch && monthMatch) ? "" : "none";
  });
}

/* ===============================
   KPI (FILTERED)
================================ */
function sumVisibleRows(tbodyId) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return 0;

  let total = 0;
  tbody.querySelectorAll("tr").forEach(row => {
    if (row.style.display === "none") return;

    const cell = row.querySelector('[data-field="amount"]');
    if (!cell) return;

    total += Number(cell.innerText.replace("₹", "")) || 0;
  });

  return total;
}

function updateKPIsByFilter() {
  const income = sumVisibleRows("incomeTbody");
  const expenses = sumVisibleRows("expensesTbody");
  const savings = sumVisibleRows("savingsTbody");

  document.getElementById("kpiIncome").innerText = formatINR(income);
  document.getElementById("kpiExpenses").innerText = formatINR(expenses);
  document.getElementById("kpiSavings").innerText = formatINR(savings);
  document.getElementById("kpiBalance").innerText =
    formatINR(income - expenses - savings);
}

/* ===============================
   KPI (ALL DATA)
================================ */
async function updateKPIs() {
  const [i, e, s] = await Promise.all([
    apiFetch("/api/income"),
    apiFetch("/api/expenses"),
    apiFetch("/api/savings")
  ]);

  const income = (i || []).reduce((t,x)=>t+Number(x.amount||0),0);
  const expenses = (e || []).reduce((t,x)=>t+Number(x.amount||0),0);
  const savings = (s || []).reduce((t,x)=>t+Number(x.amount||0),0);

  document.getElementById("kpiIncome").innerText = formatINR(income);
  document.getElementById("kpiExpenses").innerText = formatINR(expenses);
  document.getElementById("kpiSavings").innerText = formatINR(savings);
  document.getElementById("kpiBalance").innerText =
    formatINR(income - expenses - savings);
}

/* ===============================
   LOGOUT
================================ */
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  // 🔥 REMOVE JWT
  localStorage.removeItem("token");

  // (optional) remove user info
  localStorage.removeItem("user");

  // 🔄 Redirect to login
  window.location.href = "/index.html";
});

// ==============================
// REPORTS SYNC WITH YEAR FILTER
// ==============================
if (filterYear) {
  filterYear.addEventListener("change", () => {
    const year = Number(filterYear.value);
    loadReports(year);
  });
}
document.addEventListener("DOMContentLoaded", () => {
  const currentYear = new Date().getFullYear();
  loadReports(currentYear);
});

document.addEventListener("DOMContentLoaded", () => {
  const adminLink = document.getElementById("adminLink");

  if (adminLink) {
    adminLink.addEventListener("click", (e) => {
      e.preventDefault();

      // ✅ redirect to admin dashboard page
      window.location.href = "/admin-dashboard.html";
    });
  }
});

/* ===============================
   INIT
================================ */
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("bsh_token");
  if (!token) return;

  loadIncome();
  loadExpenses();
  loadSavings();
  updateKPIsByFilter();
});

