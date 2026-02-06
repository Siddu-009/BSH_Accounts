const incomeForm = document.getElementById("addIncomeForm");

// ==============================
// ADD INCOME
// ==============================
if (incomeForm) {
  incomeForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      title: document.getElementById("source").value.trim(),
      income_date: document.getElementById("date").value,
      amount: Number(document.getElementById("amount").value)
    };

    if (!payload.title || !payload.income_date || payload.amount <= 0) {
      alert("All fields required");
      return;
    }

    try {
      await apiFetch("/api/income", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      alert("✅ Income added successfully");
      incomeForm.reset();
      loadIncome();
      updateKPIs();

    } catch (err) {
      alert(err.message || "❌ Income add failed");
    }
  });
}

// ==============================
// LOAD INCOME
// ==============================
async function loadIncome() {
  const list = await apiFetch("/api/income");
  const tbody = document.getElementById("incomeTbody");

  if (!list || list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="py-6 text-center text-slate-400">
          No income records
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = list.map(i => `
<tr class="income-row hover:bg-gray-50 transition duration-200" data-id="${i.id}">
  <td class="py-4 px-6 font-medium text-gray-800" data-field="title">
    ${i.title}
  </td>

  <td class="py-4 px-6 text-gray-600" data-field="date" data-raw-date="${i.income_date}">
    ${formatDate(i.income_date)}
  </td>

  <td class="py-4 px-6 font-semibold text-emerald-600 text-lg" data-field="amount">
    ₹${Number(i.amount).toFixed(2)}
  </td>

  <td class="py-4 px-6">
    <div class="flex items-center justify-center gap-3">
      <!-- Edit Button -->
      <button
        class="action-btn edit group"
        onclick="enableIncomeInlineEdit(${i.id})"
        title="Edit Income"
      >
        <svg viewBox="0 0 24 24" class="w-5 h-5" fill="none">
          <path
            d="M4 20h4l10-10-4-4L4 16v4z"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linejoin="round"
            class="group-hover:stroke-white transition"
          />
          <path
            d="M13 7l4 4"
            stroke="currentColor"
            stroke-width="1.8"
            class="group-hover:stroke-white transition"
          />
        </svg>
      </button>

      <!-- Delete Button -->
      <button
        class="action-btn delete group"
        onclick="deleteIncome(${i.id})"
        title="Delete Income"
      >
        <svg viewBox="0 0 24 24" class="w-5 h-5" fill="none">
          <path
            d="M6 7h12M9 7V5h6v2M10 11v6M14 11v6M6 7l1 14h10l1-14"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="group-hover:stroke-white transition"
          />
        </svg>
      </button>
    </div>
  </td>
</tr>
`).join("");
}

// ==============================
// INLINE EDIT
// ==============================
function enableIncomeInlineEdit(id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  if (!row) return;

  const titleTd = row.querySelector('[data-field="title"]');
  const dateTd = row.querySelector('[data-field="date"]');
  const amountTd = row.querySelector('[data-field="amount"]');
  const actionTd = row.lastElementChild;

  const title = titleTd.innerText.trim();
  const date = dateTd.dataset.rawDate;
  const amount = amountTd.innerText.replace("₹", "").trim();

  titleTd.innerHTML = `<input class="inline-input" value="${title}">`;
  dateTd.innerHTML = `<input type="date" class="inline-input" value="${date}">`;
  amountTd.innerHTML = `<input type="number" class="inline-input" value="${amount}">`;

  actionTd.innerHTML = `
    <div class="flex justify-center gap-2">
      <button class="action-btn edit" onclick="updateIncome(${id})">✔</button>
      <button class="action-btn delete" onclick="loadIncome()">✖</button>
    </div>
  `;
}

// ==============================
// UPDATE INCOME
// ==============================
async function updateIncome(id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  const inputs = row.querySelectorAll("input");

  const payload = {
    title: inputs[0].value.trim(),
    income_date: inputs[1].value,
    amount: Number(inputs[2].value)
  };

  if (!payload.title || !payload.income_date || isNaN(payload.amount)) {
    alert("All fields required");
    return;
  }

  await apiFetch(`/api/income/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  alert("✅ Income updated");
  loadIncome();
  updateKPIsByFilter();

}

// ==============================
// DELETE INCOME
// ==============================
async function deleteIncome(id) {
  if (!confirm("Delete income?")) return;

  await apiFetch(`/api/income/${id}`, { method: "DELETE" });
  loadIncome();
  updateKPIsByFilter();
}


// ==============================
// INITIAL LOAD
// ==============================
loadIncome();
updateKPIsByFilter();
