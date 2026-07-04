/* =========================================================
   ascii.js — Konversi Karakter ↔ Kode ASCII/Unicode
   ========================================================= */
(function () {
  const UCP = (window.UCP = window.UCP || {});

  function textToAsciiCodes(text) {
    return text
      .split('')
      .map((ch) => ch.charCodeAt(0))
      .join(' ');
  }

  function asciiCodesToText(codeStr) {
    return codeStr
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((num) => {
        const n = parseInt(num, 10);
        return Number.isNaN(n) ? '' : String.fromCharCode(n);
      })
      .join('');
  }

  function initAscii() {
    const textInput = document.getElementById('asciiTextInput');
    const codeInput = document.getElementById('asciiCodeInput');
    const clearBtn = document.getElementById('asciiClearBtn');
    const clearHistoryBtn = document.getElementById('asciiClearHistoryBtn');
    const historyContainer = document.getElementById('asciiHistory');

    if (!textInput) return;

    const historyManager = new UCP.HistoryManager('ucp_history_ascii', 40);
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
          textInput.value = item.direction === 'Text→ASCII' ? item.input : item.output;
          codeInput.value = item.direction === 'Text→ASCII' ? item.output : item.input;
        }
      );
    }

    textInput.addEventListener('input', (e) => {
      if (isSyncing) return;
      isSyncing = true;
      const value = e.target.value;
      const codes = textToAsciiCodes(value);
      codeInput.value = codes;
      if (value.trim() !== '') {
        historyManager.add({ direction: 'Text→ASCII', input: value, output: codes });
        renderHistoryList();
      }
      isSyncing = false;
    });

    codeInput.addEventListener('input', (e) => {
      if (isSyncing) return;
      isSyncing = true;
      const value = e.target.value;
      const text = asciiCodesToText(value);
      textInput.value = text;
      if (value.trim() !== '') {
        historyManager.add({ direction: 'ASCII→Text', input: value, output: text });
        renderHistoryList();
      }
      isSyncing = false;
    });

    clearBtn.addEventListener('click', () => {
      textInput.value = '';
      codeInput.value = '';
      UCP.showToast('Input dibersihkan', 'info');
    });

    clearHistoryBtn.addEventListener('click', () => {
      historyManager.clear();
      renderHistoryList();
      UCP.showToast('Riwayat dihapus', 'info');
    });

    UCP.attachCopy('asciiCopyTextBtn', () => textInput.value);
    UCP.attachCopy('asciiCopyCodeBtn', () => codeInput.value);

    renderHistoryList();
  }

  UCP.initAscii = initAscii;
})();
