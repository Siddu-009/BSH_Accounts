const db = require("../config/db"); // Supabase client

// ================= ADD =================
exports.addIncome = async (req, res) => {
  try {
    const { title, source, amount, income_date } = req.body;
    const incomeTitle = title || source;

    if (!incomeTitle || !amount) {
      return res.status(400).json({ message: "Title and amount required" });
    }

    const { error } = await db
      .from("income")
      .insert([{
        title: incomeTitle,
        amount,
        income_date,
        user_id: req.user.id
      }]);

    if (error) throw error;

    res.status(201).json({ message: "Income added successfully" });

  } catch (err) {
    console.error("ADD INCOME ERROR:", err);
    res.status(500).json({ message: "Failed to add income" });
  }
};

// ================= LIST =================
exports.listIncome = async (req, res) => {
  try {
    const { data, error } = await db
      .from("income")
      .select("*")
      .eq("user_id", req.user.id)
      .order("income_date", { ascending: false });

    if (error) throw error;

    res.json(data);

  } catch (err) {
    console.error("LIST INCOME ERROR:", err);
    res.status(500).json({ message: "Failed to fetch income" });
  }
};

// ================= DELETE =================
exports.deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await db
      .from("income")
      .delete()
      .eq("id", id)
      .eq("user_id", req.user.id)
      .select("id");

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json({ message: "Income deleted" });

  } catch (err) {
    console.error("DELETE INCOME ERROR:", err);
    res.status(500).json({ message: "Failed to delete income" });
  }
};

// ================= UPDATE =================
exports.updateIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, income_date } = req.body;

    const { data, error } = await db
      .from("income")
      .update({
        title,
        amount,
        income_date
      })
      .eq("id", id)
      .eq("user_id", req.user.id)
      .select("id");

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json({ message: "Income updated" });

  } catch (err) {
    console.error("UPDATE INCOME ERROR:", err);
    res.status(500).json({ message: "Failed to update income" });
  }
};

// ================= BY DATE =================
exports.incomeByDate = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: "Date required" });
    }

    const { data, error } = await db
      .from("income")
      .select("*")
      .eq("user_id", req.user.id)
      .eq("income_date", date);

    if (error) throw error;

    res.json(data);

  } catch (err) {
    console.error("INCOME BY DATE ERROR:", err);
    res.status(500).json({ message: "Failed to fetch income" });
  }
};
