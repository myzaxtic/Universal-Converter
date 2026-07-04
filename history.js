/* =========================================================
   history.js — Pengelola Riwayat Konversi (localStorage)
   ========================================================= */
(function () {
  const UCP = (window.UCP = window.UCP || {});

  class HistoryManager {
    constructor(storageKey, maxItems = 50) {
      this.storageKey = storageKey;
      this.maxItems = maxItems;
    }

    getAll() {
      try {
        const raw = localStorage.getItem(this.storageKey);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    }

    add(entry) {
      const list = this.getAll();
      list.unshift({
        ...entry,
        time: new Date().toLocaleString('id-ID'),
      });
      if (list.length > this.maxItems) list.length = this.maxItems;
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(list));
      } catch (e) {
        /* localStorage penuh atau tidak tersedia, abaikan secara aman */
      }
      return list;
    }

    clear() {
      localStorage.removeItem(this.storageKey);
    }
  }

  /**
   * Render daftar riwayat ke dalam sebuah container.
   * @param {HTMLElement} containerEl
   * @param {HistoryManager} manager
   * @param {(item:object)=>string} formatFn - menghasilkan HTML per item
   * @param {(item:object)=>void} [onItemClick] - dipanggil saat item diklik
   */
  function renderHistory(containerEl, manager, formatFn, onItemClick) {
    if (!containerEl) return;
    const list = manager.getAll();
    containerEl.innerHTML = '';

    if (list.length === 0) {
      containerEl.innerHTML = '<p class="history-empty">Belum ada riwayat.</p>';
      return;
    }

    list.forEach((item) => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = formatFn(item);
      if (onItemClick) {
        div.addEventListener('click', () => onItemClick(item));
      }
      containerEl.appendChild(div);
    });
  }

  UCP.HistoryManager = HistoryManager;
  UCP.renderHistory = renderHistory;
})();
