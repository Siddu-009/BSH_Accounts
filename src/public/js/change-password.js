document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("changePasswordForm");
  const msg = document.getElementById("changePasswordMsg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newPassword = document.getElementById("newPassword").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    if (!newPassword || !confirmPassword) {
      showMsg("All fields required", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showMsg("Passwords do not match", "error");
      return;
    }

    const token = localStorage.getItem("bsh_token");
    if (!token) {
      showMsg("Session expired. Please login again.", "error");
      return;
    }

    try {
      const res = await fetch("/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ newPassword, confirmPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        showMsg(data.message || "Password update failed", "error");
        return;
      }

      showMsg("✅ Password updated successfully", "success");
      form.reset();

    } catch (err) {
      showMsg("Server error", "error");
    }
  });

  function showMsg(text, type) {
    msg.classList.remove("hidden");
    msg.textContent = text;

    if (type === "success") {
      msg.className =
        "mt-3 px-4 py-2 rounded-md text-sm font-medium bg-green-100 text-green-700";
    } else {
      msg.className =
        "mt-3 px-4 py-2 rounded-md text-sm font-medium bg-red-100 text-red-700";
    }
  }
});


function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);

  if (input.type === "password") {
    input.type = "text";
    btn.textContent = "🙈"; // hide icon
  } else {
    input.type = "password";
    btn.textContent = "👁️"; // show icon
  }
}
