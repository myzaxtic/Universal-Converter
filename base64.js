/* =========================================================
   base64.js — Encode/Decode Base64 (mendukung UTF-8)
   ========================================================= */
(function () {
  const UCP = (window.UCP = window.UCP || {});

  function encodeBase64(text) {
    return btoa(unescape(encodeURIComponent(text)));
  }

  function decodeBase64(b64) {
    return decodeURIComponent(escape(atob(b64)));
  }

  function initBase64() {
    const textInput = document.getElementById('b64TextInput');
    const encodedInput = document.getElementById('b64EncodedInput');
    const errorEl = document.getElementById('b64Error');
    const clearBtn = document.getElementById('b64ClearBtn');
    const clearHistoryBtn = document.getElementById('b64ClearHistoryBtn');
    const historyContainer = document.getElementById('b64History');

    if (!textInput) return;

    const historyManager = new UCP.HistoryManager('ucp_history_base64', 40);
    let isSyncing = false;

    function renderHistoryList() {
      UCP.renderHistory(
        historyContainer,
        historyManager,
        (item) => `<div class="history-row">
            <span class="history-tag">${item.direction}</span>
            <span class="history-val">${item.input}</span>
            <span class="history-arrow">→</span>
            <span class="history-detail">${item.output}</span>
            <span class="history-time">${item.time}</span>
          </div>`,
        (item) => {
          textInput.value = item.direction === 'Encode' ? item.input : item.output;
          encodedInput.value = item.direction === 'Encode' ? item.output : item.input;
        }
      );
    }

    textInput.addEventListener('input', (e) => {
      if (isSyncing) return;
      isSyncing = true;
      const value = e.target.value;
      errorEl.textContent = '';
      if (value === '') {
        encodedInput.value = '';
        isSyncing = false;
        return;
      }
      const encoded = encodeBase64(value);
      encodedInput.value = encoded;
      historyManager.add({ direction: 'Encode', input: value, output: encoded });
      renderHistoryList();
      isSyncing = false;
    });

    encodedInput.addEventListener('input', (e) => {
      if (isSyncing) return;
      isSyncing = true;
      const value = e.target.value;
      errorEl.textContent = '';
      if (value === '') {
        textInput.value = '';
        isSyncing = false;
        return;
      }
      try {
        const decoded = decodeBase64(value);
        textInput.value = decoded;
        historyManager.add({ direction: 'Decode', input: value, output: decoded });
        renderHistoryList();
      } catch (err) {
        errorEl.textContent = 'Format Base64 tidak valid.';
      }
      isSyncing = false;
    });

    clearBtn.addEventListener('click', () => {
      textInput.value = '';
      encodedInput.value = '';
      errorEl.textContent = '';
      UCP.showToast('Input dibersihkan', 'info');
    });

    clearHistoryBtn.addEventListener('click', () => {
      historyManager.clear();
      renderHistoryList();
      UCP.showToast('Riwayat dihapus', 'info');
    });

    UCP.attachCopy('b64CopyTextBtn', () => textInput.value);
    UCP.attachCopy('b64CopyEncodedBtn', () => encodedInput.value);

    renderHistoryList();
  }

  UCP.initBase64 = initBase64;
})();
