document.addEventListener("DOMContentLoaded", () => {
  const sidebarLinks = document.querySelectorAll(".sidebar-link");
  const panels = document.querySelectorAll(".tab-panel");

  function setActive(tab) {
    // panels show/hide
    panels.forEach(p => {
      p.classList.toggle("hidden", p.dataset.panel !== tab);
    });

    // sidebar color switch
    sidebarLinks.forEach(a => {
      if (a.dataset.tab === tab) {
        a.classList.add("active", "bg-[#e9f4ff]", "text-[#2f8afc]");
        a.classList.remove("hover:bg-slate-50");
      } else {
        a.classList.remove("active", "bg-[#e9f4ff]", "text-[#2f8afc]");
        a.classList.add("hover:bg-slate-50");
      }
    });
  }

  // default tab
  setActive("income");

  sidebarLinks.forEach(a => {
    a.addEventListener("click", e => {
      e.preventDefault();
      setActive(a.dataset.tab);
    });
  });

  // expose for reports.js
  window.setActiveTab = setActive;
});
