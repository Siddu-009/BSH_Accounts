 document.getElementById("goUsers")?.addEventListener("click", () => {
    // Trigger Users tab
    document.querySelector('[data-page="users"]').click();
  });

 
 
 const navLinks = document.querySelectorAll('.nav-link');
  const pages = document.querySelectorAll('.page');
  const pageTitle = document.getElementById('page-title');
  const pageDesc = document.getElementById('page-desc');

  const pageConfig = {
    dashboard: {
      title: '<i class="fas fa-tachometer-alt text-primary"></i> Admin Dashboard',
      desc: 'Overview of your expense management system'
    },
    users: {
      title: '<i class="fas fa-users text-primary"></i> User Management',
      desc: 'Create, edit, and manage user accounts'
    },
    'login-history': {
      title: '<i class="fas fa-history text-primary"></i> Login History',
      desc: 'Track user login activity'
    },
    reports: {
      title: '<i class="fas fa-file-alt text-primary"></i> Reports',
      desc: 'System-wide financial reports'
    },
    settings: {
      title: '<i class="fas fa-cog text-primary"></i> Settings',
      desc: 'System configuration'
    }
  };

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault(); // 🔴 IMPORTANT

      const pageId = link.dataset.page;

      // Sidebar active style
      navLinks.forEach(l =>
        l.classList.remove('bg-indigo-50', 'text-primary', 'font-medium')
      );
      link.classList.add('bg-indigo-50', 'text-primary', 'font-medium');

      // Hide all pages
      pages.forEach(p => p.classList.add('hidden'));

      // Show selected page
      document.getElementById(pageId).classList.remove('hidden');

      // Update header
      pageTitle.innerHTML = pageConfig[pageId].title;
      pageDesc.textContent = pageConfig[pageId].desc;
    });
  });