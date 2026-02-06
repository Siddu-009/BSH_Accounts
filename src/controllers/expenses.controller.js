const db = require("../config/db"); // Supabase client

/* ===============================
   ADD EXPENSE (WITH FILES)
================================ */
exports.addExpense = async (req, res) => {
  try {
    const { title, expense_date, payment_mode, amount } = req.body;
    const userId = req.user.id;

    if (!title || !expense_date || !amount) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const bill = req.files?.bill?.[0]?.filename || null;
    const warranty = req.files?.warranty?.[0]?.filename || null;

    const { error } = await db
      .from("expenses")
      .insert([{
        user_id: userId,
        title,
        expense_date,
        payment_mode: payment_mode || null,
        amount,
        bill_file: bill,
        warranty_file: warranty
      }]);

    if (error) throw error;

    res.json({ message: "Expense added" });

  } catch (err) {
    console.error("ADD EXPENSE ERROR:", err);
    res.status(500).json({ message: "Failed" });
  }
};


/* ===============================
   LIST EXPENSES
================================ */
exports.listExpenses = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await db
      .from("expenses")
      .select(`
        id,
        title,
        expense_date,
        payment_mode,
        amount,
        bill_file,
        warranty_file
      `)
      .eq("user_id", userId)
      .order("expense_date", { ascending: false });

    if (error) throw error;

    res.json(data);

  } catch (err) {
    console.error("LIST EXPENSES ERROR:", err);
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
};


/* ===============================
   DELETE EXPENSE
================================ */
exports.deleteExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { data, error } = await db
      .from("expenses")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)
      .select("id");

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json({ message: "Expense deleted successfully" });

  } catch (err) {
    console.error("DELETE EXPENSE ERROR:", err);
    res.status(500).json({ message: "Failed to delete expense" });
  }
};


/* ===============================
   UPDATE EXPENSE (OPTIONAL FILES)
================================ */
exports.updateExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, amount, expense_date, payment_mode } = req.body;

    if (!title || !amount || !expense_date) {
      return res.status(400).json({ message: "All fields required" });
    }

    const billFile = req.files?.bill?.[0];
    const warrantyFile = req.files?.warranty?.[0];

    // 🔎 Fetch existing files
    const { data: existing, error: fetchError } = await db
      .from("expenses")
      .select("bill_file, warranty_file")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const billName = billFile ? billFile.filename : existing.bill_file;
    const warrantyName = warrantyFile ? warrantyFile.filename : existing.warranty_file;

    const { error } = await db
      .from("expenses")
      .update({
        title,
        amount,
        expense_date,
        payment_mode: payment_mode || null,
        bill_file: billName,
        warranty_file: warrantyName
      })
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;

    res.json({ message: "Expense updated successfully" });

  } catch (err) {
    console.error("UPDATE EXPENSE ERROR:", err);
    res.status(500).json({ message: "Failed to update expense" });
  }
};
