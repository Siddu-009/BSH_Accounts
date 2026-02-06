// ==============================
// DOWNLOAD EXCEL (YEAR + MONTH)
// ==============================

document.addEventListener("DOMContentLoaded", () => {
  const downloadBtn = document.getElementById("downloadExcelBtn");
  const downloadYear = document.getElementById("downloadYear");
  const downloadMonth = document.getElementById("downloadMonth");

  if (!downloadBtn || !downloadYear || !downloadMonth) return;

  // ------------------------------
  // INIT YEAR DROPDOWN
  // ------------------------------
  const currentYear = new Date().getFullYear();
  downloadYear.innerHTML = "";

  for (let y = currentYear; y >= 2020; y--) {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    downloadYear.appendChild(opt);
  }

  downloadYear.value = currentYear;

  // ------------------------------
  // HARD BLOCK GLOBAL CLICK HANDLERS
  // ------------------------------
  downloadBtn.addEventListener(
    "click",
    async (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation(); // 🔥 triple kill

      const year = downloadYear.value;
      const month = downloadMonth.value ?? "ALL";
      const token = localStorage.getItem("bsh_token");

      if (!token) {
        alert("Session expired. Please login again.");
        return;
      }

      try {
        const res = await fetch(
          `/api/download/excel?year=${encodeURIComponent(year)}&month=${encodeURIComponent(month)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!res.ok) throw new Error(await res.text());

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `BSH_Finance_${year}_${month}.xlsx`;
        document.body.appendChild(a);
        a.click();

        a.remove();
        URL.revokeObjectURL(url);

      } catch (err) {
        console.error("Download failed:", err);
        alert("Failed to download Excel file");
      }
    },
    true // 🚨 CAPTURE PHASE (THIS IS THE KEY)
  );
});
