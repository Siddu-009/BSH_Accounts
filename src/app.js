require("dotenv").config(); 
const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================
// API ROUTES FIRST ✅
// ======================
app.use("/auth", require("./routes/auth.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/expenses", require("./routes/expenses.routes"));
app.use("/api/income", require("./routes/income.routes"));
app.use("/api/savings", require("./routes/savings.routes"));
app.use("/api/download", require("./routes/download.routes"));


// uploads
app.use("/api/upload", require("./routes/upload.routes"));


// ======================
// STATIC FILES LAST ✅
// ======================
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "../views")));

// ======================
// PAGES
// ======================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/admin/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "views/dashboard.html"));
});

app.get("/admin-dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "views/admin-dashboard.html"));
});

module.exports = app;
