const fileInput = document.getElementById("excelFileInput");
const uploadBtn = document.getElementById("uploadExcelBtn");
const msg = document.getElementById("uploadMsg");

uploadBtn.addEventListener("click", async () => {
  if (!fileInput.files.length) {
    alert("Select Excel file");
    return;
  }

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  try {
    uploadBtn.disabled = true;
    msg.className = "mt-3 text-blue-600";
    msg.innerText = "Uploading...";

    const res = await fetch("/api/upload/excel", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("bsh_token")
      },
      body: formData
    });

    const data = await res.json();
    if (!res.ok) throw new Error();

    /* ✅ SUCCESS ALERT */
    alert(
      `✅ Excel uploaded successfully!\n\n` +
      `Income: ${data.inserted.income}\n` +
      `Expenses: ${data.inserted.expenses}\n` +
      `Savings: ${data.inserted.savings}`
    );

    /* ✅ AUTO RELOAD */
    window.location.reload();

  } catch {
    msg.className = "mt-3 text-red-600";
    msg.innerText = "❌ Upload failed";
  } finally {
    uploadBtn.disabled = false;
  }
});

function downloadTemplate() {
  const token = localStorage.getItem("bsh_token");

  if (!token) {
    alert("Please login again");
    return;
  }

  const url = `/api/download/template?token=${token}`;
  window.open(url, "_blank");
}
