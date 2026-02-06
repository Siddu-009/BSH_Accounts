const ExcelJS = require("exceljs");
const db = require("../config/db"); // Supabase client

/* ✅ EXCEL DATE PARSER (PASTE ON TOP) */
function parseExcelDate(value) {
  if (value instanceof Date) return value;

  if (typeof value === "number") {
    return new Date(Math.round((value - 25569) * 86400 * 1000));
  }

  return new Date(value);
}

exports.uploadExcel = async (req, res) => {
  try {
    const userId = req.user.id;

    /* ✅ FILE CHECK */
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);

    const inserted = {
      income: 0,
      expenses: 0,
      savings: 0
    };

    /* ================= INCOME ================= */
    const incomeSheet = workbook.getWorksheet("Income");
    if (incomeSheet) {
      const rows = [];

      incomeSheet.eachRow((row, i) => {
        if (i === 1) return;

        const [title, date, amount] = row.values.slice(1);
        if (!title || !date || !amount) return;

        rows.push({
          user_id: userId,
          title,
          income_date: parseExcelDate(date), // ✅ FIX
          amount
        });
      });

      if (rows.length) {
        const { error } = await db.from("income").insert(rows);
        if (error) throw error;
        inserted.income = rows.length;
      }
    }

    /* ================= EXPENSES ================= */
    const expenseSheet = workbook.getWorksheet("Expenses");
    if (expenseSheet) {
      const rows = [];

      expenseSheet.eachRow((row, i) => {
        if (i === 1) return;

        const [title, date, payment, amount] = row.values.slice(1);
        if (!title || !date || !amount) return;

        rows.push({
          user_id: userId,
          title,
          expense_date: parseExcelDate(date), // ✅ FIX
          payment_mode: payment || "Cash",
          amount
        });
      });

      if (rows.length) {
        const { error } = await db.from("expenses").insert(rows);
        if (error) throw error;
        inserted.expenses = rows.length;
      }
    }

    /* ================= SAVINGS ================= */
    const savingsSheet = workbook.getWorksheet("Savings");
    if (savingsSheet) {
      const rows = [];

      savingsSheet.eachRow((row, i) => {
        if (i === 1) return;

        const [title, date, amount] = row.values.slice(1);
        if (!title || !date || !amount) return;

        rows.push({
          user_id: userId,
          title,
          savings_date: parseExcelDate(date), // ✅ FIX
          amount
        });
      });

      if (rows.length) {
        const { error } = await db.from("savings").insert(rows);
        if (error) throw error;
        inserted.savings = rows.length;
      }
    }

    /* ✅ SUCCESS RESPONSE */
    res.json({
      message: "Excel uploaded successfully",
      inserted
    });

  } catch (err) {
    console.error("EXCEL UPLOAD ERROR:", err);
    res.status(500).json({
      message: err.message || "Excel upload failed"
    });
  }
};
