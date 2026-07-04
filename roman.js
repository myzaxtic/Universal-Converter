/* =========================================================
   roman.js — Konversi Angka Arab ↔ Angka Romawi (1-3999)
   ========================================================= */
(function () {
  const UCP = (window.UCP = window.UCP || {});

  const ROMAN_TABLE = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];

  // Regex validasi struktur angka Romawi yang benar (subtraktif standar)
  const ROMAN_REGEX = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;

  function toRoman(num) {
    let n = num;
    let result = '';
    for (const [value, symbol] of ROMAN_TABLE) {
      while (n >= value) {
        result += symbol;
        n -= value;
      }
    }
    return result;
  }

  function fromRoman(str) {
    const upper = str.toUpperCase();
    if (upper === '' || !ROMAN_REGEX.test(upper)) return null;

    const VALUES = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    let total = 0;
    for (let i = 0; i < upper.length; i++) {
      const current = VALUES[upper[i]];
      const next = VALUES[upper[i + 1]];
      if (next && current < next) {
        total -= current;
      } else {
        total += current;
      }
    }
    return total;
  }

  function initRoman() {
    const numberInput = document.getElementById('romanNumberInput');
    const textInput = document.getElementById('romanTextInput');
    const errorEl = document.getElementById('romanError');
    const clearBtn = document.getElementById('romanClearBtn');
    const clearHistoryBtn = document.getElementById('romanClearHistoryBtn');
    const historyContainer = document.getElementById('romanHistory');

    if (!numberInput) return;

    const historyManager = new UCP.HistoryManager('ucp_history_roman', 40);
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
          numberInput.value = item.direction === 'Angka→Romawi' ? item.input : item.output;
          textInput.value = item.direction === 'Angka→Romawi' ? item.output : item.input;
        }
      );
    }

    numberInput.addEventListener('input', (e) => {
      if (isSyncing) return;
      const value = e.target.value.trim();
      errorEl.textContent = '';
      if (value === '') {
        isSyncing = true;
        textInput.value = '';
        isSyncing = false;
        return;
      }
      if (!/^[0-9]+$/.test(value)) {
        errorEl.textContent = 'Masukkan angka positif yang valid.';
        return;
      }
      const num = parseInt(value, 10);
      if (num < 1 || num > 3999) {
        errorEl.textContent = 'Angka harus berada di antara 1 dan 3999.';
        return;
      }
      const roman = toRoman(num);
      isSyncing = true;
      textInput.value = roman;
      isSyncing = false;
      historyManager.add({ direction: 'Angka→Romawi', input: value, output: roman });
      renderHistoryList();
    });

    textInput.addEventListener('input', (e) => {
      if (isSyncing) return;
      const value = e.target.value.trim();
      errorEl.textContent = '';
      if (value === '') {
        isSyncing = true;
        numberInput.value = '';
        isSyncing = false;
        return;
      }
      const num = fromRoman(value);
      if (num === null) {
        errorEl.textContent = 'Format angka Romawi tidak valid.';
        return;
      }
      isSyncing = true;
      numberInput.value = String(num);
      isSyncing = false;
      historyManager.add({ direction: 'Romawi→Angka', input: value.toUpperCase(), output: String(num) });
      renderHistoryList();
    });

    clearBtn.addEventListener('click', () => {
      numberInput.value = '';
      textInput.value = '';
      errorEl.textContent = '';
      UCP.showToast('Input dibersihkan', 'info');
    });

    clearHistoryBtn.addEventListener('click', () => {
      historyManager.clear();
      renderHistoryList();
      UCP.showToast('Riwayat dihapus', 'info');
    });

    UCP.attachCopy('romanCopyNumberBtn', () => numberInput.value);
    UCP.attachCopy('romanCopyTextBtn', () => textInput.value);

    renderHistoryList();
  }

  UCP.initRoman = initRoman;
})();
