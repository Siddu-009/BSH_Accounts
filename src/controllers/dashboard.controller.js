const db = require("../config/db");

// Helper: today & month range
function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10);
  return { start, end };
}

//
// ======================= EXPENSES DASHBOARD =======================
//

// 1️⃣ TODAY EXPENSES TOTAL
exports.todayTotal = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = getToday();

    const { data, error } = await db
      .from("expenses")
      .select("amount")
      .eq("user_id", userId)
      .eq("expense_date", today);

    if (error) throw error;

    const total = data.reduce((s, r) => s + Number(r.amount), 0);
    res.json({ todayTotal: total });

  } catch (err) {
    console.error("TODAY EXPENSE ERROR:", err);
    res.status(500).json({ message: "DB error" });
  }
};

// 2️⃣ CURRENT MONTH EXPENSE TOTAL
exports.monthTotal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { start, end } = getMonthRange();

    const { data, error } = await db
      .from("expenses")
      .select("amount")
      .eq("user_id", userId)
      .gte("expense_date", start)
      .lte("expense_date", end);

    if (error) throw error;

    const total = data.reduce((s, r) => s + Number(r.amount), 0);
    res.json({ monthTotal: total });

  } catch (err) {
    console.error("MONTH EXPENSE ERROR:", err);
    res.status(500).json({ message: "DB error" });
  }
};

// 3️⃣ MONTHLY EXPENSES (CHART)
exports.monthExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { start, end } = getMonthRange();

    const { data, error } = await db
      .from("expenses")
      .select("expense_date, amount")
      .eq("user_id", userId)
      .gte("expense_date", start)
      .lte("expense_date", end)
      .order("expense_date");

    if (error) throw error;

    const grouped = {};
    data.forEach(r => {
      grouped[r.expense_date] =
        (grouped[r.expense_date] || 0) + Number(r.amount);
    });

    const result = Object.keys(grouped).map(d => ({
      expense_date: d,
      total: grouped[d]
    }));

    res.json(result);

  } catch (err) {
    console.error("EXPENSE CHART ERROR:", err);
    res.status(500).json({ message: "DB error" });
  }
};


//
// ======================= INCOME DASHBOARD =======================
//

// 4️⃣ TODAY INCOME TOTAL
exports.todayIncome = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = getToday();

    const { data, error } = await db
      .from("income")
      .select("amount")
      .eq("user_id", userId)
      .eq("income_date", today);

    if (error) throw error;

    const total = data.reduce((s, r) => s + Number(r.amount), 0);
    res.json({ todayIncome: total });

  } catch (err) {
    console.error("TODAY INCOME ERROR:", err);
    res.status(500).json({ message: "DB error" });
  }
};

// 5️⃣ CURRENT MONTH INCOME TOTAL
exports.monthIncome = async (req, res) => {
  try {
    const userId = req.user.id;
    const { start, end } = getMonthRange();

    const { data, error } = await db
      .from("income")
      .select("amount")
      .eq("user_id", userId)
      .gte("income_date", start)
      .lte("income_date", end);

    if (error) throw error;

    const total = data.reduce((s, r) => s + Number(r.amount), 0);
    res.json({ monthIncome: total });

  } catch (err) {
    console.error("MONTH INCOME ERROR:", err);
    res.status(500).json({ message: "DB error" });
  }
};

// 6️⃣ MONTHLY INCOME (CHART)
exports.incomeChart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { start, end } = getMonthRange();

    const { data, error } = await db
      .from("income")
      .select("income_date, amount")
      .eq("user_id", userId)
      .gte("income_date", start)
      .lte("income_date", end)
      .order("income_date");

    if (error) throw error;

    const grouped = {};
    data.forEach(r => {
      grouped[r.income_date] =
        (grouped[r.income_date] || 0) + Number(r.amount);
    });

    const result = Object.keys(grouped).map(d => ({
      income_date: d,
      total: grouped[d]
    }));

    res.json(result);

  } catch (err) {
    console.error("INCOME CHART ERROR:", err);
    res.status(500).json({ message: "DB error" });
  }
};


//
// ======================= SAVINGS DASHBOARD =======================
//

// 7️⃣ TODAY SAVINGS TOTAL
exports.todaySavings = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = getToday();

    const { data, error } = await db
      .from("savings")
      .select("amount")
      .eq("user_id", userId)
      .eq("savings_date", today);

    if (error) throw error;

    const total = data.reduce((s, r) => s + Number(r.amount), 0);
    res.json({ todaySavings: total });

  } catch (err) {
    console.error("TODAY SAVINGS ERROR:", err);
    res.status(500).json({ message: "DB error" });
  }
};

// 8️⃣ CURRENT MONTH SAVINGS TOTAL
exports.monthSavings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { start, end } = getMonthRange();

    const { data, error } = await db
      .from("savings")
      .select("amount")
      .eq("user_id", userId)
      .gte("savings_date", start)
      .lte("savings_date", end);

    if (error) throw error;

    const total = data.reduce((s, r) => s + Number(r.amount), 0);
    res.json({ monthSavings: total });

  } catch (err) {
    console.error("MONTH SAVINGS ERROR:", err);
    res.status(500).json({ message: "DB error" });
  }
};

// 9️⃣ MONTHLY SAVINGS (CHART)
exports.savingsChart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { start, end } = getMonthRange();

    const { data, error } = await db
      .from("savings")
      .select("savings_date, amount")
      .eq("user_id", userId)
      .gte("savings_date", start)
      .lte("savings_date", end)
      .order("savings_date");

    if (error) throw error;

    const grouped = {};
    data.forEach(r => {
      grouped[r.savings_date] =
        (grouped[r.savings_date] || 0) + Number(r.amount);
    });

    const result = Object.keys(grouped).map(d => ({
      savings_date: d,
      total: grouped[d]
    }));

    res.json(result);

  } catch (err) {
    console.error("SAVINGS CHART ERROR:", err);
    res.status(500).json({ message: "DB error" });
  }
};
