/**
 * Main Application Logic
 * Navigation, Scroll Spy, Mobile Drawer, Glossary Live Filter, Stats Simulation
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initScrollSpy();
  initStatsTicker();
  initGlossarySearch();
});

/* Mobile Menu & Drawer */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const drawer = document.getElementById('mobile-drawer');
  const drawerLinks = document.querySelectorAll('.mobile-drawer .nav-link');

  if (!menuBtn || !drawer) return;

  function toggleMenu(isOpen) {
    const shouldOpen = isOpen !== undefined ? isOpen : !drawer.classList.contains('active');
    drawer.classList.toggle('active', shouldOpen);
    menuBtn.setAttribute('aria-expanded', shouldOpen);
    document.body.style.overflow = shouldOpen ? 'hidden' : '';
  }

  menuBtn.addEventListener('click', () => toggleMenu());

  drawerLinks.forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('active')) {
      toggleMenu(false);
    }
  });
}

/* Scroll Spy Navigation */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links .nav-link');

  if (sections.length === 0 || navLinks.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, {
    rootMargin: '-20% 0px -70% 0px'
  });

  sections.forEach(section => observer.observe(section));
}

/* Dynamic Live Network Stats Counter */
function initStatsTicker() {
  const gasEl = document.getElementById('stat-gas');
  const blockTimeEl = document.getElementById('stat-blocktime');
  const nodesEl = document.getElementById('stat-nodes');

  // Subtle realistic fluctuation
  setInterval(() => {
    if (gasEl) {
      const baseGas = 18;
      const variation = (Math.random() * 4 - 2).toFixed(1);
      const newGas = Math.max(14, (baseGas + parseFloat(variation))).toFixed(0);
      gasEl.textContent = `${newGas} Gwei`;
    }

    if (blockTimeEl) {
      const baseTime = 12.0;
      const variation = (Math.random() * 0.4 - 0.2).toFixed(1);
      blockTimeEl.textContent = `${(baseTime + parseFloat(variation)).toFixed(1)}s`;
    }

    if (nodesEl) {
      const baseNodes = 14892;
      const delta = Math.floor(Math.random() * 3) - 1;
      nodesEl.textContent = (baseNodes + delta).toLocaleString();
    }
  }, 4000);
}

/* Glossary Instant Search & Category Filter */
function initGlossarySearch() {
  const searchInput = document.getElementById('glossary-search-input');
  const filterButtons = document.querySelectorAll('.glossary-filter-btn');
  const cards = document.querySelectorAll('.glossary-card');
  const emptyNotice = document.getElementById('glossary-empty-notice');

  if (!cards.length) return;

  let currentCategory = 'all';
  let searchQuery = '';

  function filterCards() {
    let visibleCount = 0;
    const query = searchQuery.trim().toLowerCase();

    cards.forEach(card => {
      const term = card.getAttribute('data-term')?.toLowerCase() || '';
      const cat = card.getAttribute('data-category')?.toLowerCase() || '';
      const text = card.textContent.toLowerCase();

      const matchesCat = (currentCategory === 'all' || cat === currentCategory);
      const matchesSearch = query === '' || term.includes(query) || text.includes(query);

      if (matchesCat && matchesSearch) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (emptyNotice) {
      emptyNotice.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      filterCards();
    });
  }

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-category') || 'all';
      filterCards();
    });
  });
}
