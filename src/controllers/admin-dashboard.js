let isCreatingUser = false;

createUserBtn.addEventListener("click", async () => {
  if (isCreatingUser) return; // 🔒 prevent double submit
  isCreatingUser = true;

  const email = document.getElementById("user-email").value.trim();
  const name = document.getElementById("user-name").value.trim();
  const role = document.getElementById("user-role").value;

  if (!email || !name || !role) {
    alert("All fields required");
    isCreatingUser = false;
    return;
  }

  const token = localStorage.getItem("bsh_token");
  if (!token) {
    alert("Session expired. Please login again.");
    window.location.href = "/";
    return;
  }

  createUserBtn.disabled = true;
  createUserBtn.textContent = "Creating...";

  try {
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
      alert(data.message || "Failed to create user");
      return;
    }

    // ✅ SHOW TEMP PASSWORD
    tempPasswordInput.value = data.tempPassword;
    tempPasswordBox.style.display = "block";

    // reset form
    document.getElementById("user-email").value = "";
    document.getElementById("user-name").value = "";
    document.getElementById("user-role").value = "";

  } catch (err) {
    console.error(err);
    alert("Server error");
  } finally {
    createUserBtn.disabled = false;
    createUserBtn.textContent = "Create User";
    isCreatingUser = false;
  }
});


copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(tempPasswordInput.value);
    copyBtn.textContent = "Copied!";

    setTimeout(() => {
      copyBtn.textContent = "Copy";
      closeModal(); // ✅ auto close
    }, 1200);

  } catch (err) {
    alert("Copy failed. Please copy manually.");
  }
});
