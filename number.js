/* =========================================================
   number.js — Konversi Sistem Bilangan (Biner/Desimal/Oktal/Hex)
   ========================================================= */
(function () {
  const UCP = (window.UCP = window.UCP || {});

  function initNumberSystem() {
    const binInput = document.getElementById('binInput');
    const decInput = document.getElementById('decInput');
    const octInput = document.getElementById('octInput');
    const hexInput = document.getElementById('hexInput');
    const stepsContainer = document.getElementById('numberSteps');
    const historyContainer = document.getElementById('numberHistory');
    const clearBtn = document.getElementById('numberClearBtn');
    const clearHistoryBtn = document.getElementById('numberClearHistoryBtn');

    if (!binInput) return; // section tidak ada di DOM

    const historyManager = new UCP.HistoryManager('ucp_history_number', 40);
    const PLACEHOLDER = '<p class="steps-placeholder">Langkah konversi akan tampil di sini.</p>';

    function markInvalid(el, invalid) {
      el.classList.toggle('input-error', invalid);
    }

    function clearAllInvalid() {
      [binInput, decInput, octInput, hexInput].forEach((el) => markInvalid(el, false));
    }

    function clearOthers(exceptEl) {
      [binInput, decInput, octInput, hexInput].forEach((el) => {
        if (el !== exceptEl) el.value = '';
      });
      clearAllInvalid();
      stepsContainer.innerHTML = PLACEHOLDER;
    }

    function renderSteps(blocksHtml) {
      stepsContainer.innerHTML = blocksHtml.join('');
    }

    function renderHistoryList() {
      UCP.renderHistory(
        historyContainer,
        historyManager,
        (item) => `<div class="history-row">
            <span class="history-tag">${item.from}</span>
            <span class="history-val">${item.input}</span>
            <span class="history-arrow">→</span>
            <span class="history-detail">Bin:${item.binary} | Oct:${item.octal} | Dec:${item.decimal} | Hex:${item.hex}</span>
            <span class="history-time">${item.time}</span>
          </div>`,
        (item) => {
          binInput.value = item.binary;
          handleBinary(item.binary, false);
        }
      );
    }

    function addHistory(record) {
      historyManager.add(record);
      renderHistoryList();
    }

    function handleBinary(rawValue, record = true) {
      const value = rawValue.trim();
      if (value === '') { clearOthers(binInput); return; }
      if (!/^[01]+$/.test(value)) { markInvalid(binInput, true); return; }
      markInvalid(binInput, false);

      const dec = parseInt(value, 2);
      decInput.value = String(dec);
      octInput.value = dec.toString(8);
      hexInput.value = dec.toString(16).toUpperCase();
      markInvalid(decInput, false);
      markInvalid(octInput, false);
      markInvalid(hexInput, false);

      const b2d = UCP.Steps.expandToDecimal(value, 2, 'Biner');
      const d2o = UCP.Steps.divideFromDecimal(dec, 8, 'Oktal');
      const d2h = UCP.Steps.divideFromDecimal(dec, 16, 'Heksadesimal');
      renderSteps([b2d.html, d2o.html, d2h.html]);

      if (record) {
        addHistory({ from: 'Biner', input: value, decimal: dec, binary: value, octal: octInput.value, hex: hexInput.value });
      }
    }

    function handleDecimal(rawValue, record = true) {
      const value = rawValue.trim();
      if (value === '') { clearOthers(decInput); return; }
      if (!/^[0-9]+$/.test(value)) { markInvalid(decInput, true); return; }
      markInvalid(decInput, false);

      const dec = parseInt(value, 10);
      binInput.value = dec.toString(2);
      octInput.value = dec.toString(8);
      hexInput.value = dec.toString(16).toUpperCase();
      markInvalid(binInput, false);
      markInvalid(octInput, false);
      markInvalid(hexInput, false);

      const d2b = UCP.Steps.divideFromDecimal(dec, 2, 'Biner');
      const d2o = UCP.Steps.divideFromDecimal(dec, 8, 'Oktal');
      const d2h = UCP.Steps.divideFromDecimal(dec, 16, 'Heksadesimal');
      renderSteps([d2b.html, d2o.html, d2h.html]);

      if (record) {
        addHistory({ from: 'Desimal', input: value, decimal: dec, binary: binInput.value, octal: octInput.value, hex: hexInput.value });
      }
    }

    function handleOctal(rawValue, record = true) {
      const value = rawValue.trim();
      if (value === '') { clearOthers(octInput); return; }
      if (!/^[0-7]+$/.test(value)) { markInvalid(octInput, true); return; }
      markInvalid(octInput, false);

      const dec = parseInt(value, 8);
      binInput.value = dec.toString(2);
      decInput.value = String(dec);
      hexInput.value = dec.toString(16).toUpperCase();
      markInvalid(binInput, false);
      markInvalid(decInput, false);
      markInvalid(hexInput, false);

      const o2d = UCP.Steps.expandToDecimal(value, 8, 'Oktal');
      const d2b = UCP.Steps.divideFromDecimal(dec, 2, 'Biner');
      const d2h = UCP.Steps.divideFromDecimal(dec, 16, 'Heksadesimal');
      renderSteps([o2d.html, d2b.html, d2h.html]);

      if (record) {
        addHistory({ from: 'Oktal', input: value, decimal: dec, binary: binInput.value, octal: value, hex: hexInput.value });
      }
    }

    function handleHex(rawValue, record = true) {
      const value = rawValue.trim();
      if (value === '') { clearOthers(hexInput); return; }
      if (!/^[0-9a-fA-F]+$/.test(value)) { markInvalid(hexInput, true); return; }
      markInvalid(hexInput, false);

      const upperValue = value.toUpperCase();
      const dec = parseInt(value, 16);
      binInput.value = dec.toString(2);
      decInput.value = String(dec);
      octInput.value = dec.toString(8);
      markInvalid(binInput, false);
      markInvalid(decInput, false);
      markInvalid(octInput, false);

      const h2d = UCP.Steps.expandToDecimal(upperValue, 16, 'Heksadesimal');
      const d2b = UCP.Steps.divideFromDecimal(dec, 2, 'Biner');
      const d2o = UCP.Steps.divideFromDecimal(dec, 8, 'Oktal');
      renderSteps([h2d.html, d2b.html, d2o.html]);

      if (record) {
        addHistory({ from: 'Heksadesimal', input: upperValue, decimal: dec, binary: binInput.value, octal: octInput.value, hex: upperValue });
      }
    }

    binInput.addEventListener('input', (e) => handleBinary(e.target.value));
    decInput.addEventListener('input', (e) => handleDecimal(e.target.value));
    octInput.addEventListener('input', (e) => handleOctal(e.target.value));
    hexInput.addEventListener('input', (e) => handleHex(e.target.value));

    clearBtn.addEventListener('click', () => {
      [binInput, decInput, octInput, hexInput].forEach((el) => { el.value = ''; });
      clearAllInvalid();
      stepsContainer.innerHTML = PLACEHOLDER;
      UCP.showToast('Input dibersihkan', 'info');
    });

    clearHistoryBtn.addEventListener('click', () => {
      historyManager.clear();
      renderHistoryList();
      UCP.showToast('Riwayat dihapus', 'info');
    });

    UCP.attachCopy('numberCopyBtn', () =>
      `Bin: ${binInput.value}\nDec: ${decInput.value}\nOct: ${octInput.value}\nHex: ${hexInput.value}`
    );

    renderHistoryList();
  }

  UCP.initNumberSystem = initNumberSystem;
})();
