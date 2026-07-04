/* =========================================================
   caesar.js — Caesar Cipher (Encrypt/Decrypt dengan Shift)
   ========================================================= */
(function () {
  const UCP = (window.UCP = window.UCP || {});

  const A_UPPER = 'A'.charCodeAt(0);
  const A_LOWER = 'a'.charCodeAt(0);

  function shiftChar(ch, shift) {
    const code = ch.charCodeAt(0);
    if (code >= A_UPPER && code <= A_UPPER + 25) {
      return String.fromCharCode(((code - A_UPPER + shift) % 26 + 26) % 26 + A_UPPER);
    }
    if (code >= A_LOWER && code <= A_LOWER + 25) {
      return String.fromCharCode(((code - A_LOWER + shift) % 26 + 26) % 26 + A_LOWER);
    }
    return ch; // karakter non-alfabet tidak diubah
  }

  function caesarEncrypt(text, shift) {
    return text.split('').map((ch) => shiftChar(ch, shift)).join('');
  }

  function caesarDecrypt(text, shift) {
    return caesarEncrypt(text, -shift);
  }

  function initCaesar() {
    const shiftSlider = document.getElementById('caesarShift');
    const shiftValueLabel = document.getElementById('caesarShiftValue');
    const plainInput = document.getElementById('caesarPlain');
    const cipherInput = document.getElementById('caesarCipherText');
    const clearBtn = document.getElementById('caesarClearBtn');
    const clearHistoryBtn = document.getElementById('caesarClearHistoryBtn');
    const historyContainer = document.getElementById('caesarHistory');

    if (!shiftSlider) return;

    const historyManager = new UCP.HistoryManager('ucp_history_caesar', 40);
    let isSyncing = false;

    function renderHistoryList() {
      UCP.renderHistory(
        historyContainer,
        historyManager,
        (item) => `<div class="history-row">
            <span class="history-tag">${item.direction} (shift ${item.shift})</span>
            <span class="history-val">${item.input}</span>
            <span class="history-arrow">→</span>
            <span class="history-detail">${item.output}</span>
            <span class="history-time">${item.time}</span>
          </div>`,
        (item) => {
          shiftSlider.value = item.shift;
          shiftValueLabel.textContent = item.shift;
          plainInput.value = item.direction === 'Encrypt' ? item.input : item.output;
          cipherInput.value = item.direction === 'Encrypt' ? item.output : item.input;
        }
      );
    }

    function getShift() {
      return parseInt(shiftSlider.value, 10);
    }

    function recalcFromPlain() {
      const shift = getShift();
      const value = plainInput.value;
      isSyncing = true;
      const cipher = caesarEncrypt(value, shift);
      cipherInput.value = cipher;
      isSyncing = false;
      if (value.trim() !== '') {
        historyManager.add({ direction: 'Encrypt', input: value, output: cipher, shift });
        renderHistoryList();
      }
    }

    function recalcFromCipher() {
      const shift = getShift();
      const value = cipherInput.value;
      isSyncing = true;
      const plain = caesarDecrypt(value, shift);
      plainInput.value = plain;
      isSyncing = false;
      if (value.trim() !== '') {
        historyManager.add({ direction: 'Decrypt', input: value, output: plain, shift });
        renderHistoryList();
      }
    }

    plainInput.addEventListener('input', () => {
      if (isSyncing) return;
      recalcFromPlain();
    });

    cipherInput.addEventListener('input', () => {
      if (isSyncing) return;
      recalcFromCipher();
    });

    shiftSlider.addEventListener('input', () => {
      shiftValueLabel.textContent = shiftSlider.value;
      // Prioritaskan mengubah plain text menjadi cipher terbaru saat shift berubah
      if (plainInput.value.trim() !== '') {
        recalcFromPlain();
      } else if (cipherInput.value.trim() !== '') {
        recalcFromCipher();
      }
    });

    clearBtn.addEventListener('click', () => {
      plainInput.value = '';
      cipherInput.value = '';
      UCP.showToast('Input dibersihkan', 'info');
    });

    clearHistoryBtn.addEventListener('click', () => {
      historyManager.clear();
      renderHistoryList();
      UCP.showToast('Riwayat dihapus', 'info');
    });

    UCP.attachCopy('caesarCopyPlainBtn', () => plainInput.value);
    UCP.attachCopy('caesarCopyCipherBtn', () => cipherInput.value);

    renderHistoryList();
  }

  UCP.initCaesar = initCaesar;
})();
