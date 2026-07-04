/* =========================================================
   steps.js — Generator Langkah Konversi Sistem Bilangan
   ========================================================= */
(function () {
  const UCP = (window.UCP = window.UCP || {});
  const Steps = {};

  /** Ubah nilai digit (0-15) menjadi karakter digit (0-9, A-F) */
  function digitChar(value) {
    return value < 10 ? String(value) : String.fromCharCode(55 + value); // 55 + 10 = 65 ('A')
  }

  /**
   * Menampilkan langkah ekspansi pangkat: dari sebuah basis (2/8/16) menuju Desimal.
   * Contoh: 101101 = (1×2^5)+(0×2^4)+... = 32+0+8+4+0+1 = 45
   * @param {string} numStr - representasi angka pada basis asal (huruf besar untuk hex)
   * @param {number} base - basis asal (2, 8, atau 16)
   * @param {string} baseLabel - label basis asal untuk judul (mis. "Biner")
   * @returns {{html:string, decimal:number}}
   */
  Steps.expandToDecimal = function (numStr, base, baseLabel) {
    const digits = numStr.split('');
    const n = digits.length;
    const terms = [];
    const values = [];

    for (let i = 0; i < n; i++) {
      const d = digits[i];
      const dVal = parseInt(d, base);
      const power = n - 1 - i;
      terms.push(`(${d}×${base}<sup>${power}</sup>)`);
      values.push(dVal * Math.pow(base, power));
    }

    const sum = values.reduce((a, b) => a + b, 0);

    let html = '<div class="step-block">';
    html += `<div class="step-title">${baseLabel} → Desimal</div>`;
    html += `<div class="step-line">${numStr}</div>`;
    html += `<div class="step-line">= ${terms.join(' + ')}</div>`;
    html += `<div class="step-line">= ${values.join(' + ')}</div>`;
    html += `<div class="step-line step-result">= ${sum}</div>`;
    html += '</div>';

    return { html, decimal: sum };
  };

  /**
   * Menampilkan langkah pembagian berulang: dari Desimal menuju basis tujuan (2/8/16).
   * @param {number} decNum - angka desimal
   * @param {number} base - basis tujuan
   * @param {string} baseLabel - label basis tujuan untuk judul (mis. "Oktal")
   * @returns {{html:string, result:string}}
   */
  Steps.divideFromDecimal = function (decNum, base, baseLabel) {
    let n = Math.floor(Math.abs(decNum));
    const rows = [];

    if (n === 0) {
      rows.push({ n: 0, q: 0, r: 0 });
    }
    while (n > 0) {
      const q = Math.floor(n / base);
      const r = n % base;
      rows.push({ n, q, r });
      n = q;
    }

    const remainders = rows.map((row) => digitChar(row.r));
    remainders.reverse();
    const result = remainders.join('') || '0';

    let html = '<div class="step-block">';
    html += `<div class="step-title">Desimal → ${baseLabel}</div>`;
    html += '<table class="step-table"><thead><tr><th>Bilangan</th><th>Operasi</th><th>Hasil Bagi</th><th>Sisa</th></tr></thead><tbody>';
    rows.forEach((row) => {
      html += `<tr><td>${row.n}</td><td>÷ ${base}</td><td>${row.q}</td><td>${digitChar(row.r)}</td></tr>`;
    });
    html += '</tbody></table>';
    html += '<div class="step-line">Sisa dibaca dari bawah ke atas:</div>';
    html += `<div class="step-line step-result">= ${result}</div>`;
    html += '</div>';

    return { html, result };
  };

  UCP.Steps = Steps;
})();
