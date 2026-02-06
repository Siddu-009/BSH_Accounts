const db = require("../config/db"); // supabase client
const bcrypt = require("bcrypt");

exports.adminSignupOnce = async ({ name, email, password }) => {
  const { data: existingAdmin, error } = await db
    .from("users")
    .select("id")
    .eq("role", "ADMIN")
    .limit(1);

  if (error) {
    throw new Error("Failed to check existing admin");
  }

  if (existingAdmin.length > 0) {
    throw new Error("Admin already exists");
  }

  const hashed = await bcrypt.hash(password, 10);

  const { error: insertError } = await db
    .from("users")
    .insert([{
      name,
      email,
      password: hashed,
      role: "ADMIN"   // ✅ ONLY ADMIN
    }]);

  if (insertError) {
    throw new Error(insertError.message);
  }
};
