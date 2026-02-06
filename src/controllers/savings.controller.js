const db = require("../config/db"); // Supabase client

/* ===============================
   ADD SAVINGS
================================ */
exports.addSavings = async (req, res) => {
  try {
    const { title, amount, savings_date } = req.body;
    const userId = req.user.id;

    if (!title || !amount || !savings_date) {
      return res.status(400).json({ message: "All fields required" });
    }

    const { error } = await db
      .from("savings")
      .insert([{
        user_id: userId,
        title,
        amount,
        savings_date
      }]);

    if (error) throw error;

    return res.status(201).json({
      message: "Savings added successfully"
    });

  } catch (err) {
    console.error("ADD SAVINGS ERROR:", err);
    return res.status(500).json({ message: "DB error" });
  }
};


/* ===============================
   LIST SAVINGS
================================ */
exports.listSavings = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await db
      .from("savings")
      .select("*")
      .eq("user_id", userId)
      .order("savings_date", { ascending: false });

    if (error) throw error;

    res.json(data);

  } catch (err) {
    console.error("LIST SAVINGS ERROR:", err);
    res.status(500).json({ message: "DB error" });
  }
};


/* ===============================
   SAVINGS BY DATE
================================ */
exports.savingsByDate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date required" });
    }

    const { data, error } = await db
      .from("savings")
      .select("*")
      .eq("user_id", userId)
      .eq("savings_date", date);

    if (error) throw error;

    res.json(data);

  } catch (err) {
    console.error("SAVINGS BY DATE ERROR:", err);
    res.status(500).json({ message: "DB error" });
  }
};


/* ===============================
   UPDATE SAVINGS
================================ */
exports.updateSavings = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, amount, savings_date } = req.body;

    const { data, error } = await db
      .from("savings")
      .update({
        title,
        amount,
        savings_date
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select("id");

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json({ message: "Savings updated" });

  } catch (err) {
    console.error("UPDATE SAVINGS ERROR:", err);
    res.status(500).json({ message: "DB error" });
  }
};
