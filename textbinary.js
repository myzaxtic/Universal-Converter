/* =========================================================
   textbinary.js — Konversi Text ↔ Binary (8-bit per karakter)
   ========================================================= */
(function () {
  const UCP = (window.UCP = window.UCP || {});

  function textToBinary(text) {
    return text
      .split('')
      .map((ch) => ch.charCodeAt(0).toString(2).padStart(8, '0'))
      .join(' ');
  }

  function binaryToText(binStr) {
    const tokens = binStr.trim().split(/\s+/).filter(Boolean);
    const valid = tokens.every((t) => /^[01]+$/.test(t));
    if (!valid) return null;
    return tokens.map((t) => String.fromCharCode(parseInt(t, 2))).join('');
  }

  function initTextBinary() {
    const textInput = document.getElementById('tbTextInput');
    const binInput = document.getElementById('tbBinInput');
    const clearBtn = document.getElementById('tbClearBtn');
    const clearHistoryBtn = document.getElementById('tbClearHistoryBtn');
    const historyContainer = document.getElementById('tbHistory');

    if (!textInput) return;

    const historyManager = new UCP.HistoryManager('ucp_history_textbinary', 40);
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
          textInput.value = item.direction === 'Text→Binary' ? item.input : item.output;
          binInput.value = item.direction === 'Text→Binary' ? item.output : item.input;
        }
      );
    }

    textInput.addEventListener('input', (e) => {
      if (isSyncing) return;
      isSyncing = true;
      const value = e.target.value;
      const bin = textToBinary(value);
      binInput.value = bin;
      binInput.classList.remove('input-error');
      if (value.trim() !== '') {
        historyManager.add({ direction: 'Text→Binary', input: value, output: bin });
        renderHistoryList();
      }
      isSyncing = false;
    });

    binInput.addEventListener('input', (e) => {
      if (isSyncing) return;
      isSyncing = true;
      const value = e.target.value;
      if (value.trim() === '') {
        textInput.value = '';
        binInput.classList.remove('input-error');
        isSyncing = false;
        return;
      }
      const text = binaryToText(value);
      if (text === null) {
        binInput.classList.add('input-error');
        isSyncing = false;
        return;
      }
      binInput.classList.remove('input-error');
      textInput.value = text;
      historyManager.add({ direction: 'Binary→Text', input: value, output: text });
      renderHistoryList();
      isSyncing = false;
    });

    clearBtn.addEventListener('click', () => {
      textInput.value = '';
      binInput.value = '';
      binInput.classList.remove('input-error');
      UCP.showToast('Input dibersihkan', 'info');
    });

    clearHistoryBtn.addEventListener('click', () => {
      historyManager.clear();
      renderHistoryList();
      UCP.showToast('Riwayat dihapus', 'info');
    });

    UCP.attachCopy('tbCopyTextBtn', () => textInput.value);
    UCP.attachCopy('tbCopyBinBtn', () => binInput.value);

    renderHistoryList();
  }

  UCP.initTextBinary = initTextBinary;
})();
