// ===============================
// AUTH CHECK (ADMIN ONLY)
// ===============================
const token = localStorage.getItem("bsh_token");

if (!token) {
  window.location.href = "/";
}


// ===============================
// RENDER USERS TABLE
// ===============================
function renderUsers(users) {
  const tbody = document.getElementById("usersTbody");
  tbody.innerHTML = "";

  users.forEach(u => {
    tbody.innerHTML += `
      <tr class="hover:bg-slate-50">
        <td class="py-3 px-4 font-medium">${u.name}</td>
        <td class="py-3 px-4">${u.email}</td>
        <td class="py-3 px-4">
          <span class="badge ${u.role === "ADMIN" ? "admin" : "user"}">
            ${u.role}
          </span>
        </td>
        <td class="py-3 px-4 text-slate-600">
          ${u.last_login ? new Date(u.last_login).toLocaleString() : "-"}
        </td>
        <td class="py-3 px-4 flex gap-2">
          <button class="text-blue-600 text-sm">Edit</button>
          <button class="text-red-500 text-sm">Disable</button>
        </td>
      </tr>
    `;
  });
}

// ===============================
// CREATE USER
// ===============================
async function createUser() {
  const name = document.getElementById("newName").value.trim();
  const email = document.getElementById("newEmail").value.trim();
  const role = document.getElementById("newRole").value;

  if (!name || !email) {
    alert("All fields required");
    return;
  }

  const res = await fetch("/api/admin/create-user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ name, email, role })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message);
    return;
  }

  closeModal();
  loadAdminDashboard();
}

// ===============================
// LOGOUT
// ===============================
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  // 🔥 REMOVE JWT
  localStorage.removeItem("token");

  // (optional) remove user info
  localStorage.removeItem("user");

  // 🔄 Redirect to login
  window.location.href = "/index.html";
});


// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", loadAdminDashboard);
