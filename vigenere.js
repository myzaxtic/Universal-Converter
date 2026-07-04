/* =========================================================
   vigenere.js — Vigenère Cipher (Encrypt/Decrypt dengan Key)
   ========================================================= */
(function () {
  const UCP = (window.UCP = window.UCP || {});

  const A_UPPER = 'A'.charCodeAt(0);
  const A_LOWER = 'a'.charCodeAt(0);

  function isAlpha(ch) {
    const code = ch.charCodeAt(0);
    return (code >= A_UPPER && code <= A_UPPER + 25) || (code >= A_LOWER && code <= A_LOWER + 25);
  }

  function letterToShift(ch) {
    return ch.toUpperCase().charCodeAt(0) - A_UPPER;
  }

  function vigenereProcess(text, key, mode) {
    const cleanKey = key.replace(/[^a-zA-Z]/g, '');
    if (cleanKey.length === 0) return null;

    let keyIndex = 0;
    const result = [];

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (isAlpha(ch)) {
        const keyShift = letterToShift(cleanKey[keyIndex % cleanKey.length]);
        const shift = mode === 'encrypt' ? keyShift : -keyShift;
        const code = ch.charCodeAt(0);
        let shifted;
        if (code >= A_UPPER && code <= A_UPPER + 25) {
          shifted = String.fromCharCode(((code - A_UPPER + shift) % 26 + 26) % 26 + A_UPPER);
        } else {
          shifted = String.fromCharCode(((code - A_LOWER + shift) % 26 + 26) % 26 + A_LOWER);
        }
        result.push(shifted);
        keyIndex++;
      } else {
        result.push(ch);
      }
    }
    return result.join('');
  }

  function vigenereEncrypt(text, key) {
    return vigenereProcess(text, key, 'encrypt');
  }
  function vigenereDecrypt(text, key) {
    return vigenereProcess(text, key, 'decrypt');
  }

  function initVigenere() {
    const keyInput = document.getElementById('vigenereKey');
    const plainInput = document.getElementById('vigenerePlain');
    const cipherInput = document.getElementById('vigenereCipherText');
    const errorEl = document.getElementById('vigenereError');
    const clearBtn = document.getElementById('vigenereClearBtn');
    const clearHistoryBtn = document.getElementById('vigenereClearHistoryBtn');
    const historyContainer = document.getElementById('vigenereHistory');

    if (!keyInput) return;

    const historyManager = new UCP.HistoryManager('ucp_history_vigenere', 40);
    let isSyncing = false;

    function renderHistoryList() {
      UCP.renderHistory(
        historyContainer,
        historyManager,
        (item) => `<div class="history-row">
            <span class="history-tag">${item.direction} (key: ${item.key})</span>
            <span class="history-val">${item.input}</span>
            <span class="history-arrow">→</span>
            <span class="history-detail">${item.output}</span>
            <span class="history-time">${item.time}</span>
          </div>`,
        (item) => {
          keyInput.value = item.key;
          plainInput.value = item.direction === 'Encrypt' ? item.input : item.output;
          cipherInput.value = item.direction === 'Encrypt' ? item.output : item.input;
        }
      );
    }

    function checkKey() {
      const key = keyInput.value;
      if (key.trim() === '') {
        errorEl.textContent = 'Masukkan kunci (key) terlebih dahulu.';
        return false;
      }
      if (!/[a-zA-Z]/.test(key)) {
        errorEl.textContent = 'Kunci harus mengandung minimal satu huruf.';
        return false;
      }
      errorEl.textContent = '';
      return true;
    }

    function recalcFromPlain() {
      if (!checkKey()) return;
      const key = keyInput.value;
      const value = plainInput.value;
      const cipher = vigenereEncrypt(value, key);
      isSyncing = true;
      cipherInput.value = cipher !== null ? cipher : '';
      isSyncing = false;
      if (value.trim() !== '' && cipher !== null) {
        historyManager.add({ direction: 'Encrypt', input: value, output: cipher, key });
        renderHistoryList();
      }
    }

    function recalcFromCipher() {
      if (!checkKey()) return;
      const key = keyInput.value;
      const value = cipherInput.value;
      const plain = vigenereDecrypt(value, key);
      isSyncing = true;
      plainInput.value = plain !== null ? plain : '';
      isSyncing = false;
      if (value.trim() !== '' && plain !== null) {
        historyManager.add({ direction: 'Decrypt', input: value, output: plain, key });
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

    keyInput.addEventListener('input', () => {
      if (plainInput.value.trim() !== '') {
        recalcFromPlain();
      } else if (cipherInput.value.trim() !== '') {
        recalcFromCipher();
      } else {
        checkKey();
      }
    });

    clearBtn.addEventListener('click', () => {
      plainInput.value = '';
      cipherInput.value = '';
      errorEl.textContent = '';
      UCP.showToast('Input dibersihkan', 'info');
    });

    clearHistoryBtn.addEventListener('click', () => {
      historyManager.clear();
      renderHistoryList();
      UCP.showToast('Riwayat dihapus', 'info');
    });

    UCP.attachCopy('vigenereCopyPlainBtn', () => plainInput.value);
    UCP.attachCopy('vigenereCopyCipherBtn', () => cipherInput.value);

    renderHistoryList();
  }

  UCP.initVigenere = initVigenere;
})();
