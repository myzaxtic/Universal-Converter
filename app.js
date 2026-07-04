/* =========================================================
   app.js — Orkestrator Utama Aplikasi
   Navigasi menu, tema, toast, ripple, undo/redo, shortcut keyboard
   ========================================================= */
(function () {
  const UCP = (window.UCP = window.UCP || {});

  /* ---------------- Toast Notification ---------------- */
  function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'error' : ''}`.trim();
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
  UCP.showToast = showToast;

  /* ---------------- Loading Screen ---------------- */
  function initLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (!loadingScreen) return;
    window.addEventListener('load', () => {
      setTimeout(() => {
        loadingScreen.classList.add('hidden');
      }, 900);
    });
    // fallback jika event load lambat terpicu
    setTimeout(() => loadingScreen.classList.add('hidden'), 3000);
  }

  /* ---------------- Sidebar Navigation ---------------- */
  function initNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    const sections = document.querySelectorAll('.tool-section');
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    function activateSection(targetId) {
      sections.forEach((sec) => sec.classList.toggle('active', sec.id === targetId));
      menuItems.forEach((item) => item.classList.toggle('active', item.dataset.target === targetId));
      closeSidebar();
    }

    function openSidebar() {
      sidebar.classList.add('open');
      sidebarOverlay.classList.add('open');
    }
    function closeSidebar() {
      sidebar.classList.remove('open');
      sidebarOverlay.classList.remove('open');
    }

    menuItems.forEach((item) => {
      item.addEventListener('click', () => activateSection(item.dataset.target));
    });

    sidebarToggle.addEventListener('click', () => {
      if (sidebar.classList.contains('open')) closeSidebar();
      else openSidebar();
    });
    sidebarOverlay.addEventListener('click', closeSidebar);

    UCP._closeSidebar = closeSidebar;
    UCP._toggleSidebar = () => {
      if (sidebar.classList.contains('open')) closeSidebar();
      else openSidebar();
    };
  }

  /* ---------------- Theme Toggle (Dark / Light) ---------------- */
  function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const html = document.documentElement;

    function applyTheme(theme) {
      html.setAttribute('data-theme', theme);
      themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
      localStorage.setItem('ucp_theme', theme);
    }

    const savedTheme = localStorage.getItem('ucp_theme') || 'dark';
    applyTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
      showToast(`Mode ${current === 'dark' ? 'terang' : 'gelap'} diaktifkan`, 'info');
    });

    UCP._toggleTheme = () => {
      const current = html.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    };
  }

  /* ---------------- Ripple Effect pada Tombol ---------------- */
  function initRipple() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn, .icon-btn, .menu-item');
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      const originalPosition = getComputedStyle(btn).position;
      if (originalPosition === 'static') btn.style.position = 'relative';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  }

  /* ---------------- Shortcut Modal ---------------- */
  function initShortcutModal() {
    const modal = document.getElementById('shortcutModal');
    const openBtn = document.getElementById('shortcutInfoBtn');
    const closeBtn = document.getElementById('closeShortcutModal');

    function open() { modal.classList.add('open'); }
    function close() { modal.classList.remove('open'); }

    openBtn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });

    UCP._closeModal = close;
    UCP._isModalOpen = () => modal.classList.contains('open');
  }

  /* ---------------- Undo / Redo per Section ---------------- */
  function initUndoRedo() {
    // Menyimpan stack snapshot untuk setiap section aktif berdasarkan id.
    const stacks = new Map(); // sectionId -> { list: [], pointer: -1 }
    let debounceTimer = null;
    let isRestoring = false;

    function getActiveSection() {
      return document.querySelector('.tool-section.active');
    }

    function getInputsOf(section) {
      return Array.from(section.querySelectorAll('input, textarea, select'));
    }

    function snapshotOf(section) {
      return getInputsOf(section).map((el) => el.value);
    }

    function ensureStack(sectionId) {
      if (!stacks.has(sectionId)) {
        stacks.set(sectionId, { list: [], pointer: -1 });
      }
      return stacks.get(sectionId);
    }

    function pushSnapshot(section) {
      if (isRestoring) return;
      const stack = ensureStack(section.id);
      const snap = snapshotOf(section);
      const last = stack.list[stack.pointer];
      if (last && JSON.stringify(last) === JSON.stringify(snap)) return;
      // Buang history redo di depan pointer saat ada perubahan baru
      stack.list = stack.list.slice(0, stack.pointer + 1);
      stack.list.push(snap);
      if (stack.list.length > 60) stack.list.shift();
      stack.pointer = stack.list.length - 1;
    }

    function applySnapshot(section, snap) {
      const inputs = getInputsOf(section);
      isRestoring = true;
      inputs.forEach((el, i) => {
        if (snap[i] === undefined) return;
        el.value = snap[i];
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      });
      isRestoring = false;
    }

    document.addEventListener('input', (e) => {
      const section = e.target.closest('.tool-section');
      if (!section || isRestoring) return;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => pushSnapshot(section), 400);
    });

    function undo() {
      const section = getActiveSection();
      if (!section) return;
      const stack = ensureStack(section.id);
      if (stack.pointer <= 0) {
        showToast('Tidak ada lagi yang bisa di-undo', 'info');
        return;
      }
      stack.pointer--;
      applySnapshot(section, stack.list[stack.pointer]);
      showToast('Undo berhasil', 'info');
    }

    function redo() {
      const section = getActiveSection();
      if (!section) return;
      const stack = ensureStack(section.id);
      if (stack.pointer >= stack.list.length - 1) {
        showToast('Tidak ada lagi yang bisa di-redo', 'info');
        return;
      }
      stack.pointer++;
      applySnapshot(section, stack.list[stack.pointer]);
      showToast('Redo berhasil', 'info');
    }

    UCP._undo = undo;
    UCP._redo = redo;
  }

  /* ---------------- Keyboard Shortcuts ---------------- */
  function initShortcuts() {
    document.addEventListener('keydown', (e) => {
      const ctrlOrCmd = e.ctrlKey || e.metaKey;

      // Ctrl+Z -> Undo
      if (ctrlOrCmd && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        UCP._undo && UCP._undo();
        return;
      }
      // Ctrl+Shift+Z -> Redo
      if (ctrlOrCmd && e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        UCP._redo && UCP._redo();
        return;
      }
      // Ctrl+D -> Toggle theme
      if (ctrlOrCmd && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        UCP._toggleTheme && UCP._toggleTheme();
        return;
      }
      // Ctrl+K -> Toggle sidebar
      if (ctrlOrCmd && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        UCP._toggleSidebar && UCP._toggleSidebar();
        return;
      }
      // Esc -> Tutup sidebar / modal
      if (e.key === 'Escape') {
        if (UCP._isModalOpen && UCP._isModalOpen()) {
          UCP._closeModal && UCP._closeModal();
        } else {
          UCP._closeSidebar && UCP._closeSidebar();
        }
      }
    });
  }

  /* ---------------- Inisialisasi Aplikasi ---------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initLoadingScreen();
    UCP.initMatrix && UCP.initMatrix();
    initNavigation();
    initTheme();
    initRipple();
    initShortcutModal();
    initUndoRedo();
    initShortcuts();

    // Inisialisasi semua modul fitur konversi
    UCP.initNumberSystem && UCP.initNumberSystem();
    UCP.initMorse && UCP.initMorse();
    UCP.initAscii && UCP.initAscii();
    UCP.initTextBinary && UCP.initTextBinary();
    UCP.initBase64 && UCP.initBase64();
    UCP.initCaesar && UCP.initCaesar();
    UCP.initVigenere && UCP.initVigenere();
    UCP.initRoman && UCP.initRoman();
    UCP.initUnits && UCP.initUnits();
  });
})();
