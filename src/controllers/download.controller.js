const ExcelJS = require("exceljs");
const db = require("../config/db");

const MONTH_MAP = {
  January: 1, February: 2, March: 3, April: 4,
  May: 5, June: 6, July: 7, August: 8,
  September: 9, October: 10, November: 11, December: 12
};

exports.downloadExcel = async (req, res) => {
  try {
    const userId = req.user.id;
    const { year, month = "ALL" } = req.query;

    if (!year) {
      return res.status(400).json({ message: "Year required" });
    }

    const isAllMonths = month === "ALL";
    const monthNumber = MONTH_MAP[month];

    if (!isAllMonths && !monthNumber) {
      return res.status(400).json({ message: "Invalid month" });
    }

    // ✅ SAFE DATE RANGE
    let startDate, endDate;
    if (isAllMonths) {
      startDate = `${year}-01-01`;
      endDate = `${year}-12-31`;
    } else {
      startDate = `${year}-${String(monthNumber).padStart(2, "0")}-01`;
      endDate = new Date(year, monthNumber, 0)
        .toISOString()
        .slice(0, 10);
    }

    const workbook = new ExcelJS.Workbook();

    /* ================= SUMMARY ================= */
    const summary = workbook.addWorksheet("Summary");
    summary.addRow(["Metric", "Amount"]).font = { bold: true };

    const { data: income = [] } = await db
      .from("income")
      .select("amount")
      .eq("user_id", userId)
      .gte("income_date", startDate)
      .lte("income_date", endDate);

    const { data: expenses = [] } = await db
      .from("expenses")
      .select("amount")
      .eq("user_id", userId)
      .gte("expense_date", startDate)
      .lte("expense_date", endDate);

    const { data: savings = [] } = await db
      .from("savings")
      .select("amount")
      .eq("user_id", userId)
      .gte("savings_date", startDate)
      .lte("savings_date", endDate);

    const totalIncome = income.reduce((s, r) => s + Number(r.amount), 0);
    const totalExpense = expenses.reduce((s, r) => s + Number(r.amount), 0);
    const totalSavings = savings.reduce((s, r) => s + Number(r.amount), 0);

    summary.addRows([
      ["Total Income", totalIncome],
      ["Total Expenses", totalExpense],
      ["Total Savings", totalSavings],
      ["Net Balance", totalIncome - totalExpense - totalSavings]
    ]);

    /* ================= INCOME ================= */
    const incomeSheet = workbook.addWorksheet("Income");
    incomeSheet.addRow(["Title", "Date", "Amount"]).font = { bold: true };

    const { data: incomes = [] } = await db
      .from("income")
      .select("title, income_date, amount")
      .eq("user_id", userId)
      .gte("income_date", startDate)
      .lte("income_date", endDate);

    incomes.forEach(r =>
      incomeSheet.addRow([r.title, r.income_date, r.amount])
    );

    /* ================= EXPENSES ================= */
    const expenseSheet = workbook.addWorksheet("Expenses");
    expenseSheet.addRow(["Title", "Date", "Payment Mode", "Amount"]).font = { bold: true };

    const { data: exp = [] } = await db
      .from("expenses")
      .select("title, expense_date, payment_mode, amount")
      .eq("user_id", userId)
      .gte("expense_date", startDate)
      .lte("expense_date", endDate);

    exp.forEach(r =>
      expenseSheet.addRow([r.title, r.expense_date, r.payment_mode, r.amount])
    );

    /* ================= SAVINGS ================= */
    const savingsSheet = workbook.addWorksheet("Savings");
    savingsSheet.addRow(["Title", "Date", "Amount"]).font = { bold: true };

    const { data: sav = [] } = await db
      .from("savings")
      .select("title, savings_date, amount")
      .eq("user_id", userId)
      .gte("savings_date", startDate)
      .lte("savings_date", endDate);

    sav.forEach(r =>
      savingsSheet.addRow([r.title, r.savings_date, r.amount])
    );

    /* ================= DOWNLOAD ================= */
    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=BSH_Finance_${year}_${month}.xlsx`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.status(200).send(buffer);

  } catch (err) {
    console.error("DOWNLOAD ERROR:", err);
    res.status(500).json({ message: "Download failed" });
  }
};


/* ================= TEMPLATE DOWNLOAD ================= */
exports.downloadTemplate = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();

    /* ================= SHEET 1 : INSTRUCTIONS ================= */
    const instructionSheet = workbook.addWorksheet("Instructions");

    // Heading
    const headingRow = instructionSheet.addRow([
      "BSH EXPENSES – EXCEL UPLOAD INSTRUCTIONS"
    ]);
    headingRow.font = { bold: true, size: 14 };

    instructionSheet.addRow([]);

    // General Instructions
    instructionSheet.addRow(["GENERAL INSTRUCTIONS"]).font = { bold: true };
    instructionSheet.addRow([
      "1. Do NOT rename any sheet names (Income, Expenses, Savings)."
    ]);
    instructionSheet.addRow([
      "2. Do NOT change column order or column names."
    ]);
    instructionSheet.addRow([
      "3. Date format must be YYYY-MM-DD (example: 2025-01-31)."
    ]);
    instructionSheet.addRow([
      "4. Amount should be numeric (do not use commas or currency symbols)."
    ]);
    instructionSheet.addRow([
      "5. Do not keep empty rows between records."
    ]);

    instructionSheet.addRow([]);

    // Income Instructions
    instructionSheet.addRow(["INCOME SHEET RULES"]).font = { bold: true };
    instructionSheet.addRow([
      "Columns: Title | Date | Amount"
    ]);
    instructionSheet.addRow([
      "Example: Salary | 2025-01-01 | 50000"
    ]);

    instructionSheet.addRow([]);

    // Expense Instructions
    instructionSheet.addRow(["EXPENSES SHEET RULES"]).font = { bold: true };
    instructionSheet.addRow([
      "Columns: Title | Date | Payment Mode | Amount"
    ]);
    instructionSheet.addRow([
      "Payment Mode allowed values: Cash, Card, UPI"
    ]);
    instructionSheet.addRow([
      "Example: Rent | 2025-01-05 | Cash | 15000"
    ]);

    instructionSheet.addRow([]);

    // Savings Instructions
    instructionSheet.addRow(["SAVINGS SHEET RULES"]).font = { bold: true };
    instructionSheet.addRow([
      "Columns: Title | Date | Amount"
    ]);
    instructionSheet.addRow([
      "Example: FD | 2025-01-10 | 10000"
    ]);

    // Formatting
    instructionSheet.columns = [{ width: 120 }];

    /* ================= SHEET 2 : INCOME ================= */
    const incomeSheet = workbook.addWorksheet("Income");
    incomeSheet.addRow(["Title", "Date(year-mm-dd)", "Amount"]).font = { bold: true };
   

    /* ================= SHEET 3 : EXPENSES ================= */
    const expenseSheet = workbook.addWorksheet("Expenses");
    expenseSheet
      .addRow(["Title", "Date(year-mm-dd)", "Payment Mode", "Amount"])
      .font = { bold: true };
    
    /* ================= PAYMENT MODE DROPDOWN ================= */
expenseSheet.dataValidations.add("C2:C1000", {
  type: "list",
  allowBlank: true,
  formulae: ['"Cash,Card,UPI"'],
  showDropDown: true,
  showErrorMessage: true,
  errorStyle: "error",
  errorTitle: "Invalid Payment Mode",
  error: "Please select a payment mode from the dropdown list."
});

    /* ================= SHEET 4 : SAVINGS ================= */
    const savingsSheet = workbook.addWorksheet("Savings");
    savingsSheet.addRow(["Title", "Date(year-mm-dd)", "Amount"]).font = { bold: true };
    
    /* ================= FORMAT DATE COLUMNS ================= */
    [incomeSheet, expenseSheet, savingsSheet].forEach(sheet => {
      sheet.getColumn(2).numFmt = "yyyy-mm-dd";
      sheet.columns.forEach(col => (col.width = 20));
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=BSH_Expenses_Template.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.status(200).send(buffer);

  } catch (err) {
    console.error("TEMPLATE DOWNLOAD ERROR:", err);
    res.status(500).json({ message: "Template download failed" });
  }
};
