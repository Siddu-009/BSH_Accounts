const db = require("../config/db");
const bcrypt = require("bcrypt");

/* ================= TEMP PASSWORD GENERATOR ================= */
function generateTempPassword(length = 8) {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$";
  let pwd = "";
  for (let i = 0; i < length; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}

/* ================= CREATE USER ================= */
exports.createUser = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { name, email, role } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ message: "All fields required" });
    }

    // 🔍 Check existing user
    const { data: existing } = await db
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 🔑 TEMP PASSWORD
    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // 💾 Insert user
    const { error } = await db.from("users").insert([{
      name,
      email,
      password: hashedPassword,
      role,
      is_active: true
    }]);

    if (error) throw error;

    res.json({
      message: "User created successfully",
      tempPassword
    });

  } catch (err) {
    console.error("CREATE USER ERROR:", err);
    res.status(500).json({ message: "Create user failed" });
  }
};

/* ================= LIST USERS ================= */
exports.listUsers = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { data, error } = await db
      .from("users")
      .select("id, name, email, role, is_active, last_login_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data);

  } catch (err) {
    console.error("LIST USERS ERROR:", err);
    res.status(500).json({ message: "Failed to load users" });
  }
};

/* ================= DELETE USER ================= */
exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { id } = req.params;

    if (Number(id) === req.user.id) {
      return res.status(400).json({ message: "You cannot delete yourself" });
    }

    // 🔥 Delete child records (order does not matter in Supabase)
    await db.from("expenses").delete().eq("user_id", id);
    await db.from("income").delete().eq("user_id", id);
    await db.from("savings").delete().eq("user_id", id);
    await db.from("password_resets").delete().eq("user_id", id);

    // 🔥 Delete user
    const { error, count } = await db
      .from("users")
      .delete({ count: "exact" })
      .eq("id", id);

    if (error) throw error;

    if (count === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User permanently deleted" });

  } catch (err) {
    console.error("DELETE USER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= PAUSE USER ================= */
exports.pauseUser = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { id } = req.params;

    const { data, error } = await db
      .from("users")
      .update({ is_active: false })
      .eq("id", id)
      .select("id");

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User paused successfully" });

  } catch (err) {
    console.error("PAUSE USER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= RESUME USER ================= */
exports.resumeUser = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { id } = req.params;

    const { data, error } = await db
      .from("users")
      .update({ is_active: true })
      .eq("id", id)
      .select("id");

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User resumed successfully" });

  } catch (err) {
    console.error("RESUME USER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
