let monthlyOverviewChart = null;
let netTrendChart = null;
Chart.defaults.font.family = "Inter";
Chart.defaults.color = "#475569";
Chart.defaults.plugins.tooltip.backgroundColor = "#0f172a";
Chart.defaults.plugins.tooltip.padding = 12;
Chart.defaults.plugins.tooltip.cornerRadius = 10;
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.padding = 20;

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const FY_MONTHS = [
  "October", "November", "December",
  "January", "February", "March",
  "April", "May", "June",
  "July", "August", "September"
];
// ==============================
// LOAD REPORTS (MAIN)
// ==============================
async function loadReports(year) {
  try {
    const [income, expenses, savings] = await Promise.all([
      apiFetch("/api/income"),
      apiFetch("/api/expenses"),
      apiFetch("/api/savings")
    ]);

    const monthlyData = buildMonthlyData(year, income, expenses, savings);

    renderMonthlyOverviewChart(monthlyData);
// renderNetTrendChart(monthlyData);
renderIncomeVsExpense(monthlyData);
renderFinancePieDark(monthlyData);
renderSavingsGrowth(monthlyData);

  } catch (err) {
    console.error("❌ Reports load failed", err);
  }
}

document.getElementById("downloadExcelBtn")
  ?.addEventListener("click", () => {

    const year = document.getElementById("downloadYear").value;
    const month = document.getElementById("downloadMonth").value;

    const token = localStorage.getItem("bsh_token");

    const url =
      `/api/download/excel?year=${year}&month=${month}&token=${token}`;

    // 🔥 Browser handles file download
    window.location.href = url;
});

// ==============================
// BUILD MONTHLY DATA
// ==============================
function buildMonthlyData(year, income, expenses, savings) {
  const data = MONTHS.map(() => ({
    income: 0,
    expenses: 0,
    savings: 0,
    net: 0
  }));

  income.forEach(i => {
    const d = new Date(i.income_date);
    if (d.getFullYear() === year) {
      data[d.getMonth()].income += Number(i.amount || 0);
    }
  });

  expenses.forEach(e => {
    const d = new Date(e.expense_date || e.date);
    if (d.getFullYear() === year) {
      data[d.getMonth()].expenses += Number(e.amount || 0);
    }
  });

  savings.forEach(s => {
    const d = new Date(s.savings_date);
    if (d.getFullYear() === year) {
      data[d.getMonth()].savings += Number(s.amount || 0);
    }
  });

  data.forEach(m => {
    m.net = m.income - m.expenses - m.savings;
  });

  return data;
}

// ==============================
// MONTHLY OVERVIEW CHART
// ==============================
function renderMonthlyOverviewChart(data) {
  const ctx = document.getElementById("monthlyOverviewChart").getContext("2d");
  if (monthlyOverviewChart) monthlyOverviewChart.destroy();

  const gradientIncome = ctx.createLinearGradient(0, 0, 0, 300);
  gradientIncome.addColorStop(0, "#22c55e");
  gradientIncome.addColorStop(1, "#bbf7d0");

  const gradientExpense = ctx.createLinearGradient(0, 0, 0, 300);
  gradientExpense.addColorStop(0, "#ef4444");
  gradientExpense.addColorStop(1, "#fecaca");

  const gradientSavings = ctx.createLinearGradient(0, 0, 0, 300);
  gradientSavings.addColorStop(0, "#3b82f6");
  gradientSavings.addColorStop(1, "#bfdbfe");

  monthlyOverviewChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: MONTHS,
      datasets: [
        { label: "Income", data: data.map(m => m.income), backgroundColor: gradientIncome },
        { label: "Expenses", data: data.map(m => m.expenses), backgroundColor: gradientExpense },
        { label: "Savings", data: data.map(m => m.savings), backgroundColor: gradientSavings }
      ]
    },
    options: {
      borderRadius: 8,
      responsive: true,
      plugins: { legend: { position: "top" } },
      scales: { x: { stacked: true }, y: { stacked: true } }
    }
  });
}

// ==============================
// NET TREND CHART
// ==============================


let incomeVsExpenseChart = null;

function renderIncomeVsExpense(data) {

  const ctx = document
    .getElementById("incomeVsExpenseChart")
    .getContext("2d");

  if (incomeVsExpenseChart) {
    incomeVsExpenseChart.destroy();
  }

  // 🔹 Map months → values
  const monthMap = {};
  MONTHS.forEach((m, i) => {
    monthMap[m] = {
      income: data[i]?.income || 0,
      expenses: data[i]?.expenses || 0
    };
  });

  // 🔹 FY order (Oct → Sep)
  const incomeData = [
    monthMap["October"].income,
    monthMap["November"].income,
    monthMap["December"].income,
    monthMap["January"].income,
    monthMap["February"].income,
    monthMap["March"].income,
    monthMap["April"].income,
    monthMap["May"].income,
    monthMap["June"].income,
    monthMap["July"].income,
    monthMap["August"].income,
    monthMap["September"].income
  ];

  const expenseData = [
    monthMap["October"].expenses,
    monthMap["November"].expenses,
    monthMap["December"].expenses,
    monthMap["January"].expenses,
    monthMap["February"].expenses,
    monthMap["March"].expenses,
    monthMap["April"].expenses,
    monthMap["May"].expenses,
    monthMap["June"].expenses,
    monthMap["July"].expenses,
    monthMap["August"].expenses,
    monthMap["September"].expenses
  ];

  // 🌑 Dark grey income gradient (like image)
  const incomeGradient = ctx.createLinearGradient(0, 0, 0, 220);
  incomeGradient.addColorStop(0, "rgba(31, 41, 55, 0.85)"); // slate-800
  incomeGradient.addColorStop(1, "rgba(31, 41, 55, 0.05)");

  incomeVsExpenseChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: FY_MONTHS,
      datasets: [
        {
          label: "Income",
          data: incomeData,
          borderColor: "#1f2937",       // dark grey
          backgroundColor: incomeGradient,
          fill: true,
          tension: 0.45,
          pointRadius: 0,               // ❌ no dots
          borderWidth: 2
        },
        {
          label: "Expenses",
          data: expenseData,
          borderColor: "#ef4444",       // red line
          backgroundColor: "transparent",
          fill: false,                  // ❌ no fill
          tension: 0.45,
          pointRadius: 0,               // ❌ no dots
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },     // ❌ no legend (matches image)
        tooltip: {
          callbacks: {
            label: ctx =>
              ` ₹${ctx.raw.toLocaleString("en-IN")}`
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: "rgba(148,163,184,0.15)",
            borderDash: [4, 4]
          },
          ticks: { color: "#64748b" }
        },
        y: {
          beginAtZero: true,
          ticks: {
            callback: v => `₹${v / 1000}k`,
            color: "#64748b"
          },
          grid: {
            color: "rgba(148,163,184,0.15)",
            borderDash: [4, 4]
          }
        }
      }
    }
  });
}



let financePieChart = null;

function renderFinancePieDark(data) {
  const ctx = document.getElementById("expensePieChart").getContext("2d");

  const totals = data.reduce(
    (acc, m) => {
      acc.income += m.income;
      acc.expenses += m.expenses;
      acc.savings += m.savings;
      return acc;
    },
    { income: 0, expenses: 0, savings: 0 }
  );

  if (financePieChart) {
    financePieChart.destroy();
  }

  financePieChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Income", "Expenses", "Savings"],
      datasets: [
        {
          data: [
            totals.income,
            totals.expenses,
            totals.savings
          ],

          // 🌿 SOFT, MODERN COLORS (NOT DULL)
          backgroundColor: [
            "rgba(134, 239, 172, 0.85)", // light green (income)
            "rgba(252, 165, 165, 0.85)", // light red (expenses)
            "rgba(191, 219, 254, 0.9)"   // light blue (savings)
          ],

          hoverBackgroundColor: [
            "rgba(134, 239, 172, 1)",
            "rgba(252, 165, 165, 1)",
            "rgba(191, 219, 254, 1)"
          ],

          borderWidth: 0
        }
      ]
    },
    options: {
      cutout: "72%",
      responsive: true,
      plugins: {
        legend: {
          display: false      // ❌ no bottom labels
        },
        tooltip: {
          backgroundColor: "#020617",
          titleColor: "#e5e7eb",
          bodyColor: "#e5e7eb",
          padding: 12,
          callbacks: {
            label: ctx =>
              `${ctx.label}: ₹${ctx.raw.toLocaleString("en-IN")}`
          }
        }
      }
    }
  });
}





let savingsGrowthChart = null;



// let savingsGrowthChart = null;

function renderSavingsGrowth(data) {

  const ctx = document
    .getElementById("savingsGrowthChart")
    .getContext("2d");

  if (savingsGrowthChart) {
    savingsGrowthChart.destroy();
  }

  // 🔹 Map month → value
  const monthMap = {};
  MONTHS.forEach((m, i) => {
    monthMap[m] = data[i]?.savings || 0;
  });

  // 🔹 FY order (Oct → Sep)
  const orderedData = [
    monthMap["October"],
    monthMap["November"],
    monthMap["December"],
    monthMap["January"],
    monthMap["February"],
    monthMap["March"],
    monthMap["April"],
    monthMap["May"],
    monthMap["June"],
    monthMap["July"],
    monthMap["August"],
    monthMap["September"]
  ];

  // 🌊 LIGHT BLUE gradient (soft & professional)
  const gradient = ctx.createLinearGradient(0, 0, 0, 220);
  gradient.addColorStop(0, "rgba(96,165,250,0.55)"); // light blue
  gradient.addColorStop(1, "rgba(96,165,250,0.05)");

  savingsGrowthChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: FY_MONTHS,
      datasets: [{
        label: "Savings",
        data: orderedData,
        borderColor: "#60a5fa",          // light blue line
        backgroundColor: gradient,
        fill: true,
        tension: 0.45,
        pointRadius: 0,                  // ❌ no dots (clean)
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx =>
              ` ₹${ctx.raw.toLocaleString("en-IN")}`
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: "rgba(148,163,184,0.15)",
            borderDash: [4, 4]
          },
          ticks: { color: "#64748b" }
        },
        y: {
          beginAtZero: true,
          ticks: {
            callback: v => `₹${v / 1000}k`,
            color: "#64748b"
          },
          grid: {
            color: "rgba(148,163,184,0.15)",
            borderDash: [4, 4]
          }
        }
      }
    }
  });
}







