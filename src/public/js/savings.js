const savingForm = document.getElementById("addSavingForm");

// ==============================
// ADD SAVINGS
// ==============================
if (savingForm) {
  savingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      title: savingDetails.value.trim(),
      savings_date: savingDate.value,
      amount: Number(savingAmount.value)
    };

    if (!payload.title || !payload.savings_date || payload.amount <= 0) {
      alert("All fields required");
      return;
    }

    try {
      await apiFetch("/api/savings", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      alert("✅ Savings added successfully");
      savingForm.reset();
      loadSavings();
      updateKPIs();

    } catch (err) {
      alert(err.message || "❌ Savings add failed");
    }
  });
}

// ==============================
// LOAD SAVINGS
// ==============================
async function loadSavings() {
  const list = await apiFetch("/api/savings");
  const tbody = document.getElementById("savingsTbody");

  if (!list || list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="py-6 text-center text-slate-400">
          No savings records
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = list.map(s => `
<tr class="savings-row hover:bg-slate-50 transition" data-id="${s.id}">
  <td class="py-3 px-4 font-medium text-slate-800"
      data-field="title">
    ${s.title}
  </td>

  <td class="py-3 px-4 text-slate-600"
      data-field="date"
      data-raw-date="${s.savings_date}">
    ${formatDate(s.savings_date)}
  </td>

  <td class="py-3 px-4 font-bold text-sky-600"
      data-field="amount">
    ₹${Number(s.amount).toFixed(2)}
  </td>

  <td class="py-3 px-4">
    <div class="flex items-center justify-center gap-2">
      <button class="action-btn edit"
        onclick="enableSavingsInlineEdit(${s.id})"> <svg viewBox="0 0 24 24" fill="none">
          <path d="M4 20h4l10-10-4-4L4 16v4z"
                stroke="#2563eb"
                stroke-width="1.6"
                stroke-linejoin="round"/>
          <path d="M13 7l4 4"
                stroke="#2563eb"
                stroke-width="1.6"/>
        </svg></button>
      <button class="action-btn delete"
        onclick="deleteSavings(${s.id})"> <svg viewBox="0 0 24 24" fill="none">
          <path d="M6 7h12M9 7V5h6v2M10 11v6M14 11v6M6 7l1 14h10l1-14"
                stroke="#ef4444"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"/>
        </svg></button>
    </div>
  </td>
</tr>
`).join("");
}

// ==============================
// INLINE EDIT
// ==============================
function enableSavingsInlineEdit(id) {
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
      <button class="action-btn edit" onclick="updateSavings(${id})">✔</button>
      <button class="action-btn delete" onclick="loadSavings()">✖</button>
    </div>
  `;
}

// ==============================
// UPDATE SAVINGS
// ==============================
async function updateSavings(id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  const inputs = row.querySelectorAll("input");

  const payload = {
    title: inputs[0].value.trim(),
    savings_date: inputs[1].value,
    amount: Number(inputs[2].value)
  };

  if (!payload.title || !payload.savings_date || isNaN(payload.amount)) {
    alert("All fields required");
    return;
  }

  await apiFetch(`/api/savings/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  alert("✅ Savings updated");
  loadSavings();
  updateKPIs();
}

// ==============================
// DELETE SAVINGS
// ==============================
async function deleteSavings(id) {
  if (!confirm("Delete savings?")) return;

  await apiFetch(`/api/savings/${id}`, { method: "DELETE" });
  loadSavings();
  updateKPIs();
}

// ==============================
// INITIAL LOAD
// ==============================
loadSavings();
updateKPIs();

