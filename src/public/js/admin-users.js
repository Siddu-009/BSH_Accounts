/* ===============================
   LOAD USERS – ADMIN PANEL
================================ */
async function loadUsers() {
  const tbody = document.getElementById("usersTableBody");
  const token = localStorage.getItem("bsh_token");

  if (!token) {
    tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-12 text-center text-gray-500">Session expired. Please login again.</td></tr>`;
    return;
  }

  try {
    const res = await fetch("/api/admin/users", {
      headers: { Authorization: "Bearer " + token }
    });

    const users = await res.json();

    if (!res.ok || users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-12 text-center text-gray-500">No users found</td></tr>`;
      return;
    }

    tbody.innerHTML = "";

    users.forEach((u) => {
      tbody.innerHTML += `
        <tr class="hover:bg-gray-50 transition-colors">
  <td class="px-6 py-4">
    <div class="flex items-center gap-3">
      <div>
        <div class="font-semibold text-gray-900">${u.name}</div>
        <div class="text-sm text-gray-500">${u.email}</div>
      </div>
    </div>
  </td>
  <td class="px-6 py-4">
    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
      u.role === 'ADMIN' 
        ? 'bg-blue-100 text-blue-800' 
        : 'bg-green-100 text-green-800'
    }">
      ${u.role}
    </span>
  </td>
  <td class="px-6 py-4">
    ${u.is_active
      ? '<span class="text-green-600 font-semibold">Active</span>'
      : '<span class="text-red-600 font-medium">Inactive</span>'
    }
  </td>
  <td class="px-6 py-4 text-gray-700">${u.last_login_at || '—'}</td>
  <td class="px-6 py-4 text-gray-700">—</td>
  <td class="px-6 py-4">
    <div class="flex items-center gap-2">
      <!-- Delete Button -->
      <button 
        class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
        onclick="handleDelete(${u.id})">
        Delete
      </button>

      <!-- Pause / Resume Button -->
      ${u.is_active
        ? `<button 
             class="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition"
             onclick="handlePause(${u.id})">
             Pause
           </button>`
        : `<button 
             class="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition"
             onclick="handleResume(${u.id})">
             Resume
           </button>`
      }
    </div>
  </td>
</tr>`;
    });
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-12 text-center text-gray-500">Failed to load users</td></tr>`;
  }
}
async function handleDelete(userId) {
  if (!confirm("Are you sure you want to delete this user?")) return;

  try {
    await apiFetch(`/api/admin/users/${userId}`, {
      method: "DELETE"
    });

    alert("✅ User deleted");
    loadUsers();

  } catch (err) {
    alert(err.message || "❌ Delete failed");
  }
}

async function handlePause(userId) {
  try {
    await apiFetch(`/api/admin/users/${userId}/pause`, {
      method: "PATCH"
    });

    alert("⏸ User paused");
    loadUsers();

  } catch (err) {
    alert(err.message || "❌ Pause failed");
  }
}

async function handleResume(userId) {
  try {
    await apiFetch(`/api/admin/users/${userId}/resume`, {
      method: "PATCH"
    });

    alert("▶ User resumed");
    loadUsers();

  } catch (err) {
    alert(err.message || "❌ Resume failed");
  }
}


/* ===============================
   LOAD USER COUNTS (ONLY NORMAL USERS)
================================ */
async function loadUserCounts() {
  const totalUsersEl = document.getElementById("totalUsers");
  const activeUsersEl = document.getElementById("activeUsers");

  const token = localStorage.getItem("bsh_token");
  if (!token) return;

  try {
    const res = await fetch("/api/admin/users", {
      headers: { Authorization: "Bearer " + token }
    });

    const users = await res.json();
    if (!res.ok) return;

    const onlyUsers = users.filter(u => u.role === "USER");
    const totalUsers = onlyUsers.length;
    const activeUsers = onlyUsers.filter(u => u.is_active === 1).length;

    totalUsersEl.textContent = totalUsers;
    activeUsersEl.textContent = activeUsers;
  } catch (err) {
    console.error("LOAD USER COUNT ERROR:", err);
  }
}

/* ===============================
   MODAL & POPUP ELEMENTS
================================ */
const modal = document.getElementById('create-user-modal');
const modalContent = document.getElementById('modal-content');
const openModalBtn = document.getElementById('open-create-modal');
const closeBtns = document.querySelectorAll('#close-modal-x, #close-modal-cancel');
const createUserBtn = document.getElementById('createUserBtn');

// Popup elements
const tempPasswordPopup = document.getElementById('tempPasswordPopup');
const popupContent = tempPasswordPopup?.querySelector('div');
const popupPasswordEl = document.getElementById('popupPassword');
const popupCopyBtn = document.getElementById('popupCopyBtn');
const popupCloseBtn = document.getElementById('popupCloseBtn');

/* ===============================
   OPEN MODAL
================================ */
openModalBtn?.addEventListener('click', () => {
  modal.classList.remove('hidden');
  setTimeout(() => {
    modalContent.classList.remove('scale-95', 'opacity-0', 'pointer-events-none');
    modalContent.classList.add('scale-100', 'opacity-100', 'pointer-events-auto');
  }, 10);
});

/* ===============================
   CLOSE MODAL
================================ */
closeBtns.forEach(btn => btn.addEventListener('click', closeModal));

function closeModal() {
  modalContent.classList.add('scale-95', 'opacity-0', 'pointer-events-none');
  modalContent.classList.remove('scale-100', 'opacity-100', 'pointer-events-auto');

  setTimeout(() => {
    modal.classList.add('hidden');
    document.getElementById('createUserForm')?.reset();
    createUserBtn.disabled = false;
    createUserBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create User';
  }, 300);
}

/* ===============================
   CREATE USER – WITH POPUP ON SUCCESS
================================ */
createUserBtn.addEventListener("click", async () => {
  const email = document.getElementById("user-email").value.trim();
  const name = document.getElementById("user-name").value.trim();
  const role = document.getElementById("user-role").value;

  if (!email || !name || !role) {
    alert("All fields are required");
    return;
  }

  createUserBtn.disabled = true;
  createUserBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';

  try {
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("bsh_token")
      },
      body: JSON.stringify({ email, name, role })
    });

    let data;
    try {
      data = await res.json();
    } catch (e) {
      throw new Error("Invalid response from server");
    }

    if (!res.ok) {
      throw new Error(data.message || "User creation failed");
    }

    const tempPass = data.tempPassword || data.temp_password || "TEMP123!";

    // Close modal
    closeModal();

    // Show popup with temporary password
    popupPasswordEl.textContent = tempPass;
    tempPasswordPopup.classList.remove("hidden");
    setTimeout(() => {
      popupContent.classList.remove("scale-95", "opacity-0");
      popupContent.classList.add("scale-100", "opacity-100");
    }, 100);

    // Refresh data
    loadUsers();
    loadUserCounts();

  } catch (err) {
    alert(err.message || "Failed to create user");
    createUserBtn.disabled = false;
    createUserBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create User';
  }
});

/* ===============================
   POPUP: COPY PASSWORD & CLOSE
================================ */
// Copy to clipboard
if (popupCopyBtn) {
  popupCopyBtn.addEventListener("click", () => {
    const password = popupPasswordEl.textContent;
    navigator.clipboard.writeText(password).then(() => {
      popupCopyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
      popupCopyBtn.classList.add("bg-emerald-700");

      setTimeout(() => {
        popupCopyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Password';
        popupCopyBtn.classList.remove("bg-emerald-700");
      }, 2000);
    });
  });
}

// Close popup
if (popupCloseBtn) {
  popupCloseBtn.addEventListener("click", () => {
    popupContent.classList.add("scale-95", "opacity-0");
    setTimeout(() => {
      tempPasswordPopup.classList.add("hidden");
      popupContent.classList.remove("scale-95", "opacity-0");
      popupContent.classList.add("scale-95", "opacity-0"); // reset for next time
    }, 300);
  });
}

/* ===============================
   LOAD ON TAB CLICK & PAGE LOAD
================================ */
document.querySelector('[data-page="users"]')?.addEventListener("click", loadUsers);

if (document.getElementById("users")?.classList.contains("active")) {
  loadUsers();
}

document.addEventListener("DOMContentLoaded", loadUserCounts);