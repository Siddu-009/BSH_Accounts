// ==============================
// EXPENSES MODULE
// ==============================

const expenseForm = document.getElementById("addExpenseForm");

const expenseDetails = document.getElementById("expenseDetails");
const expenseAmount = document.getElementById("expenseAmount");
const expenseDate = document.getElementById("expenseDate");
const expensePaymentMode = document.getElementById("expensePaymentMode");

const expensesTbody = document.getElementById("expensesTbody");
const expenseSearchInput = document.getElementById("expenseSearch");
const expenseSearchTotal = document.getElementById("expenseSearchTotal");

// ==============================
// ADD EXPENSE
// ==============================
if (expenseForm) {
const expenseForm = document.getElementById("addExpenseForm");

expenseForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData();

  formData.append("title", expenseDetails.value);
  formData.append("expense_date", expenseDate.value);
  formData.append("payment_mode", expensePaymentMode.value);
  formData.append("amount", expenseAmount.value);

  if (expenseBill.files[0]) {
    formData.append("bill", expenseBill.files[0]);
  }

  if (expenseWarranty.files[0]) {
    formData.append("warranty", expenseWarranty.files[0]);
  }

  try {
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("bsh_token")
      },
      body: formData
    });

    if (!res.ok) throw new Error();

    alert("✅ Expense added");
    expenseForm.reset();
    loadExpenses();
   updateKPIsByFilter();

  } catch (err) {
    alert("❌ Failed");
    console.error(err);
  }
});


}

// ==============================
// LOAD EXPENSES
// ==============================
async function loadExpenses() {
  const list = await apiFetch("/api/expenses");

  const tbody = document.getElementById("expensesTbody");
  tbody.innerHTML = "";

  list.forEach(e => {
    tbody.innerHTML += `
      <tr class="hover:bg-slate-50 transition">
  <!-- EXPENSE TITLE + FILE ICONS -->
  <td class="px-4 py-3">
    <div class="flex items-center justify-between gap-3">
      <span class="font-medium text-slate-800">${e.title}</span>

      <div class="flex items-center justify-between gap-1">

 

  <!-- ATTACHMENTS -->
  <div class="flex items-center justify-center gap-4">
    ${e.bill_file ? `
    <button
      onclick="previewFile('${e.bill_file}')"
      class="attachment-btn bill"
      title="View Bill">
      <svg viewBox="0 0 24 24">
        <path d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/>
        <path d="M14 2v6h6"/>
      </svg>
      <span>Bill</span>
    </button>` : ""}

    ${e.warranty_file ? `
    <button
      onclick="previewFile('${e.warranty_file}')"
      class="attachment-btn warranty"
      title="View Warranty">
      <svg viewBox="0 0 24 24">
        <path d="M12 2l7 4v6c0 5-3.5 9.5-7 10-3.5-.5-7-5-7-10V6l7-4z"/>
      </svg>
      <span>Warranty</span>
    </button>` : ""}
  </div>
</div>

    </div>
  </td>

  <td class="px-4 py-3 text-slate-600"
    data-field="date"
    data-raw-date="${e.expense_date}">
  ${formatDate(e.expense_date)}
</td>

  <td class="px-4 py-3 text-slate-600">${e.payment_mode}</td>
  <td class="px-4 py-3 font-semibold text-rose-600"
    data-field="amount">
  ₹${e.amount}
</td>


  <!-- ACTIONS -->
  <td class="px-4 py-3 flex gap-2">
    <button class="action-btn edit" onclick="enableInlineEdit(${e.id})">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M4 20h4l10-10-4-4L4 16v4z"
              stroke="#2563eb"
              stroke-width="1.6"
              stroke-linejoin="round"/>
        <path d="M13 7l4 4"
              stroke="#2563eb"
              stroke-width="1.6"/>
      </svg>
    </button>
    <button class="action-btn delete" onclick="deleteExpense(${e.id})">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M6 7h12M9 7V5h6v2M10 11v6M14 11v6M6 7l1 14h10l1-14"
              stroke="#ef4444"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"/>
      </svg>
    </button>
  </td>
</tr>

    `;
  });
    applyFilters();

  calculateVisibleExpenseTotal();
}


// ==============================
// SEARCH + FILTER + TOTAL
// ==============================
function filterExpensesAndCalculateTotal() {
  const query = expenseSearchInput.value.toLowerCase().trim();
  let total = 0;

  const rows = expensesTbody.querySelectorAll("tr");

  rows.forEach(row => {
    if (row.children.length < 5) return;

    const details = row.children[0].innerText.toLowerCase();
    const date = row.children[1].innerText.toLowerCase();
    const payment = row.children[2].innerText.toLowerCase();
    const amount = parseFloat(
      row.children[3].innerText.replace("₹", "")
    ) || 0;

    const match =
      details.includes(query) ||
      date.includes(query) ||
      payment.includes(query);

    if (query.length >= 2) {
      if (match) {
        row.style.display = "";
        total += amount;
      } else {
        row.style.display = "none";
      }
    } else {
      row.style.display = "";
      total += amount;
    }
  });

  expenseSearchTotal.innerText = total.toFixed(2);
}

if (expenseSearchInput) {
  expenseSearchInput.addEventListener("input", filterExpensesAndCalculateTotal);
}

// ==============================
// CALCULATE TOTAL (ALL VISIBLE)
// ==============================
function calculateVisibleExpenseTotal() {
  let total = 0;

  const rows = expensesTbody.querySelectorAll("tr");

  rows.forEach(row => {
    if (row.style.display === "none") return;
    if (row.children.length < 5) return;

    const amount = parseFloat(
      row.children[3].innerText.replace("₹", "")
    ) || 0;

    total += amount;
  });

  expenseSearchTotal.innerText = total.toFixed(2);
}

// ==============================
// DELETE EXPENSE
// ==============================
async function deleteExpense(id) {
  if (!confirm("Are you sure you want to delete this expense?")) return;

  try {
    await apiFetch(`/api/expenses/${id}`, {
      method: "DELETE"
    });

    alert("🗑 Expense deleted");
    loadExpenses();
    updateKPIsByFilter();

  } catch (err) {
    alert("❌ Failed to delete expense");
  }
}

// ==============================
// UTIL - DATE FORMAT
// ==============================
function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-IN");
}


// ==============================
// INLINE EDITING
// ============================== 
function enableInlineEdit(id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  if (!row) return;

  const titleTd = row.querySelector('[data-field="title"]');
  const dateTd = row.querySelector('[data-field="date"]');
  const paymentTd = row.querySelector('[data-field="payment"]');
  const amountTd = row.querySelector('[data-field="amount"]');
  const actionTd = row.lastElementChild;

  const title = titleTd.innerText.trim();
  const date = dateTd.dataset.rawDate; // ✅ FIX
  const payment = paymentTd.innerText.trim();
  const amount = amountTd.innerText.replace("₹", "").trim();

  titleTd.innerHTML = `<input value="${title}" class="w-full border rounded px-2 py-1 text-sm">`;
  dateTd.innerHTML = `<input type="date" value="${date}" class="w-full border rounded px-2 py-1 text-sm">`;

  paymentTd.innerHTML = `
    <select class="w-full border rounded px-2 py-1 text-sm">
      <option ${payment==="Cash"?"selected":""}>Cash</option>
      <option ${payment==="UPI"?"selected":""}>UPI</option>
      <option ${payment==="Card"?"selected":""}>Card</option>
    </select>
  `;

  amountTd.innerHTML = `<input type="number" value="${amount}" class="w-full border rounded px-2 py-1 text-sm">`;

  actionTd.innerHTML = `
    <div class="flex justify-center gap-2">
      <button class="action-btn edit" onclick="updateExpense(${id})">✔</button>
      <button class="action-btn delete" onclick="loadExpenses()">✖</button>
    </div>
  `;
}


// ==============================
// UPDATE EXPENSE
// ==============================
async function updateExpense(id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  const inputs = row.querySelectorAll("input, select");

  const payload = {
    title: inputs[0].value.trim(),
    expense_date: inputs[1].value,
    payment_mode: inputs[2].value,
    amount: Number(inputs[3].value)
  };

  if (!payload.title || !payload.expense_date || !payload.payment_mode || !payload.amount) {
    alert("All fields required");
    return;
  }

  try {
    await apiFetch(`/api/expenses/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });

    alert("✅ Expense updated");
    loadExpenses();
    updateKPIsByFilter();

  } catch (err) {
    alert("❌ Update failed");
  }
}


function renderExpenseRow(e) {
  return `
<tr class="hover:bg-slate-50 transition" data-id="${e.id}">

  <!-- EXPENSE TITLE + FILE ICONS -->
  <td class="px-4 py-3">
    <div class="flex items-center justify-between gap-3">
      <span class="font-medium text-slate-800">${e.title}</span>

      <div class="flex gap-2">
        ${e.bill_file ? `
        <button
          onclick="previewFile('${e.bill_file}')"
          class="file-btn bill"
          title="View Bill">
          <svg viewBox="0 0 24 24">
            <path d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/>
            <path d="M14 2v6h6"/>
          </svg>
        </button>` : ""}

        ${e.warranty_file ? `
        <button
          onclick="previewFile('${e.warranty_file}')"
          class="file-btn warranty"
          title="View Warranty">
          <svg viewBox="0 0 24 24">
            <path d="M12 2l7 4v6c0 5-3.5 9.5-7 10-3.5-.5-7-5-7-10V6l7-4z"/>
          </svg>
        </button>` : ""}
      </div>
    </div>
  </td>

  <td class="px-4 py-3 text-slate-600">${e.expense_date}</td>
  <td class="px-4 py-3 text-slate-600">${e.payment_mode}</td>
  <td class="px-4 py-3 font-semibold text-rose-600">₹${e.amount}</td>

  <!-- ACTIONS -->
  <td class="px-4 py-3 flex gap-2">
    <button class="action-btn edit" onclick="enableInlineEdit(${e.id})">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M4 20h4l10-10-4-4L4 16v4z"
              stroke="#2563eb"
              stroke-width="1.6"
              stroke-linejoin="round"/>
        <path d="M13 7l4 4"
              stroke="#2563eb"
              stroke-width="1.6"/>
      </svg>
    </button>
    <button class="action-btn delete" onclick="deleteExpense(${e.id})">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M6 7h12M9 7V5h6v2M10 11v6M14 11v6M6 7l1 14h10l1-14"
              stroke="#ef4444"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"/>
      </svg>
    </button>
  </td>
</tr>
`;
}


function previewFile(filename) {
  const modal = document.getElementById("filePreviewModal");
  const content = document.getElementById("previewContent");
  const downloadBtn = document.getElementById("downloadFileBtn");

  const fileUrl = `/uploads/expenses/${filename}`;
  downloadBtn.href = fileUrl;

  const ext = filename.split(".").pop().toLowerCase();

  if (["png", "jpg", "jpeg"].includes(ext)) {
    content.innerHTML = `
      <img src="${fileUrl}"
           class="max-w-full rounded-md shadow" />
    `;
  } else if (ext === "pdf") {
    content.innerHTML = `
      <iframe src="${fileUrl}"
        class="w-full h-[60vh] border rounded"></iframe>
    `;
  } else {
    content.innerHTML = `
      <p class="text-red-500">Preview not supported</p>
    `;
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function applyExpenseDateFilter() {
  const year = Number(filterYear.value);
  const month = filterMonth.value;

  const rows = expensesTbody.querySelectorAll("tr");

  rows.forEach(row => {
    const dateCell = row.querySelector('[data-field="date"]');
    if (!dateCell) return;

    const raw = dateCell.dataset.rawDate;
    if (!raw) return;

    const d = new Date(raw);

    const yearMatch = d.getFullYear() === year;
    const monthMatch =
      month === "All Months" ||
      MONTH_NAMES[d.getMonth()] === month;

    row.style.display = (yearMatch && monthMatch) ? "" : "none";
  });
}



function closePreview() {
  const modal = document.getElementById("filePreviewModal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}


// ==============================
// INITIAL LOAD
// ==============================
document.addEventListener("DOMContentLoaded", async () => {
  setDefaultYearMonth();

  await loadIncome();
  await loadExpenses();
  await loadSavings();

  applyFilters();          
  calculateVisibleExpenseTotal();
  updateKPIsByFilter();   
});

