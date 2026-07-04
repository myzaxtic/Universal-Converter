/* =========================================================
   morse.js — Konversi Text ↔ Kode Morse
   ========================================================= */
(function () {
  const UCP = (window.UCP = window.UCP || {});

  const MORSE_MAP = {
    A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.',
    H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.',
    O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-',
    V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
    0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-',
    5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.',
    '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.',
    '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-',
    '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-',
    '+': '.-.-.', '-': '-....-', '_': '..--.-', '"': '.-..-.',
    '$': '...-..-', '@': '.--.-.',
  };
  const REVERSE_MAP = Object.fromEntries(Object.entries(MORSE_MAP).map(([k, v]) => [v, k]));

  function textToMorse(text) {
    return text
      .toUpperCase()
      .split('')
      .map((ch) => {
        if (ch === ' ') return '/';
        return MORSE_MAP[ch] !== undefined ? MORSE_MAP[ch] : '';
      })
      .filter((code) => code !== '')
      .join(' ');
  }

  function morseToText(morse) {
    const words = morse.trim().split('/');
    return words
      .map((word) =>
        word
          .trim()
          .split(/\s+/)
          .filter(Boolean)
          .map((code) => (REVERSE_MAP[code] !== undefined ? REVERSE_MAP[code] : ''))
          .join('')
      )
      .join(' ');
  }

  function initMorse() {
    const textInput = document.getElementById('morseTextInput');
    const codeInput = document.getElementById('morseCodeInput');
    const clearBtn = document.getElementById('morseClearBtn');
    const clearHistoryBtn = document.getElementById('morseClearHistoryBtn');
    const historyContainer = document.getElementById('morseHistory');

    if (!textInput) return;

    const historyManager = new UCP.HistoryManager('ucp_history_morse', 40);
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
          textInput.value = item.direction === 'Text→Morse' ? item.input : item.output;
          codeInput.value = item.direction === 'Text→Morse' ? item.output : item.input;
        }
      );
    }

    textInput.addEventListener('input', (e) => {
      if (isSyncing) return;
      isSyncing = true;
      const value = e.target.value;
      const morse = textToMorse(value);
      codeInput.value = morse;
      if (value.trim() !== '') {
        historyManager.add({ direction: 'Text→Morse', input: value, output: morse });
        renderHistoryList();
      }
      isSyncing = false;
    });

    codeInput.addEventListener('input', (e) => {
      if (isSyncing) return;
      isSyncing = true;
      const value = e.target.value;
      const text = morseToText(value);
      textInput.value = text;
      if (value.trim() !== '') {
        historyManager.add({ direction: 'Morse→Text', input: value, output: text });
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

    UCP.attachCopy('morseCopyTextBtn', () => textInput.value);
    UCP.attachCopy('morseCopyCodeBtn', () => codeInput.value);

    renderHistoryList();
  }

  UCP.initMorse = initMorse;
})();
