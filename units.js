/* =========================================================
   units.js — Konversi Satuan Realtime
   Kategori: Panjang, Berat, Suhu, Volume, Luas, Kecepatan, Waktu
   ========================================================= */
(function () {
  const UCP = (window.UCP = window.UCP || {});

  /**
   * Setiap kategori (kecuali suhu) memiliki "faktor" relatif terhadap satuan basis.
   * nilai_basis = nilai * faktor[satuanAsal]
   * hasil = nilai_basis / faktor[satuanTujuan]
   */
  const CATEGORIES = {
    length: {
      label: 'Panjang',
      base: 'm',
      units: {
        mm: { label: 'Milimeter (mm)', factor: 0.001 },
        cm: { label: 'Sentimeter (cm)', factor: 0.01 },
        m: { label: 'Meter (m)', factor: 1 },
        km: { label: 'Kilometer (km)', factor: 1000 },
        inch: { label: 'Inci (in)', factor: 0.0254 },
        foot: { label: 'Kaki (ft)', factor: 0.3048 },
        yard: { label: 'Yard (yd)', factor: 0.9144 },
        mile: { label: 'Mil (mi)', factor: 1609.344 },
      },
    },
    weight: {
      label: 'Berat',
      base: 'kg',
      units: {
        mg: { label: 'Miligram (mg)', factor: 0.000001 },
        g: { label: 'Gram (g)', factor: 0.001 },
        kg: { label: 'Kilogram (kg)', factor: 1 },
        ton: { label: 'Ton (metrik)', factor: 1000 },
        ounce: { label: 'Ons (oz)', factor: 0.0283495 },
        pound: { label: 'Pon (lb)', factor: 0.453592 },
      },
    },
    temperature: {
      label: 'Suhu',
      units: {
        celsius: { label: 'Celsius (°C)' },
        fahrenheit: { label: 'Fahrenheit (°F)' },
        kelvin: { label: 'Kelvin (K)' },
      },
    },
    volume: {
      label: 'Volume',
      base: 'l',
      units: {
        ml: { label: 'Mililiter (ml)', factor: 0.001 },
        l: { label: 'Liter (l)', factor: 1 },
        m3: { label: 'Meter Kubik (m³)', factor: 1000 },
        gallon: { label: 'Galon (US)', factor: 3.78541 },
        quart: { label: 'Quart (US)', factor: 0.946353 },
        pint: { label: 'Pint (US)', factor: 0.473176 },
        cup: { label: 'Cup (US)', factor: 0.24 },
      },
    },
    area: {
      label: 'Luas',
      base: 'm2',
      units: {
        mm2: { label: 'Milimeter² (mm²)', factor: 0.000001 },
        cm2: { label: 'Sentimeter² (cm²)', factor: 0.0001 },
        m2: { label: 'Meter² (m²)', factor: 1 },
        km2: { label: 'Kilometer² (km²)', factor: 1000000 },
        hectare: { label: 'Hektar (ha)', factor: 10000 },
        acre: { label: 'Acre', factor: 4046.86 },
        sqft: { label: 'Kaki² (ft²)', factor: 0.092903 },
        sqmile: { label: 'Mil² (mi²)', factor: 2589988.11 },
      },
    },
    speed: {
      label: 'Kecepatan',
      base: 'mps',
      units: {
        mps: { label: 'Meter/detik (m/s)', factor: 1 },
        kmph: { label: 'Kilometer/jam (km/h)', factor: 0.277778 },
        mph: { label: 'Mil/jam (mph)', factor: 0.44704 },
        knot: { label: 'Knot (kn)', factor: 0.514444 },
        fps: { label: 'Kaki/detik (ft/s)', factor: 0.3048 },
      },
    },
    time: {
      label: 'Waktu',
      base: 's',
      units: {
        ms: { label: 'Milidetik (ms)', factor: 0.001 },
        s: { label: 'Detik (s)', factor: 1 },
        minute: { label: 'Menit', factor: 60 },
        hour: { label: 'Jam', factor: 3600 },
        day: { label: 'Hari', factor: 86400 },
        week: { label: 'Minggu', factor: 604800 },
        month: { label: 'Bulan (30 hari)', factor: 2592000 },
        year: { label: 'Tahun (365 hari)', factor: 31536000 },
      },
    },
  };

  function celsiusToBase(value, unit) {
    if (unit === 'celsius') return value;
    if (unit === 'fahrenheit') return ((value - 32) * 5) / 9;
    if (unit === 'kelvin') return value - 273.15;
    return value;
  }
  function baseToCelsius(celsius, unit) {
    if (unit === 'celsius') return celsius;
    if (unit === 'fahrenheit') return (celsius * 9) / 5 + 32;
    if (unit === 'kelvin') return celsius + 273.15;
    return celsius;
  }

  function convertValue(category, value, fromUnit, toUnit) {
    if (category === 'temperature') {
      const celsius = celsiusToBase(value, fromUnit);
      return baseToCelsius(celsius, toUnit);
    }
    const cat = CATEGORIES[category];
    const baseValue = value * cat.units[fromUnit].factor;
    return baseValue / cat.units[toUnit].factor;
  }

  function formatResult(num) {
    if (!isFinite(num)) return '';
    // Batasi presisi tanpa menampilkan nol berlebih
    const rounded = Math.round(num * 1e8) / 1e8;
    return String(rounded);
  }

  function initUnits() {
    const categorySelect = document.getElementById('unitCategory');
    const fromValue = document.getElementById('unitFromValue');
    const toValue = document.getElementById('unitToValue');
    const fromSelect = document.getElementById('unitFromSelect');
    const toSelect = document.getElementById('unitToSelect');
    const swapBtn = document.getElementById('unitSwapBtn');
    const clearBtn = document.getElementById('unitClearBtn');
    const clearHistoryBtn = document.getElementById('unitClearHistoryBtn');
    const historyContainer = document.getElementById('unitHistory');

    if (!categorySelect) return;

    const historyManager = new UCP.HistoryManager('ucp_history_units', 40);

    function renderHistoryList() {
      UCP.renderHistory(
        historyContainer,
        historyManager,
        (item) => `<div class="history-row">
            <span class="history-tag">${item.categoryLabel}</span>
            <span class="history-val">${item.input} ${item.fromLabel}</span>
            <span class="history-arrow">→</span>
            <span class="history-detail">${item.output} ${item.toLabel}</span>
            <span class="history-time">${item.time}</span>
          </div>`,
        (item) => {
          categorySelect.value = item.category;
          populateUnitSelects(item.category);
          fromSelect.value = item.fromUnit;
          toSelect.value = item.toUnit;
          fromValue.value = item.input;
          recalc(false);
        }
      );
    }

    function populateUnitSelects(category) {
      const units = CATEGORIES[category].units;
      const keys = Object.keys(units);
      fromSelect.innerHTML = keys.map((k) => `<option value="${k}">${units[k].label}</option>`).join('');
      toSelect.innerHTML = keys.map((k) => `<option value="${k}">${units[k].label}</option>`).join('');
      fromSelect.value = keys[0];
      toSelect.value = keys.length > 1 ? keys[1] : keys[0];
    }

    function recalc(record = true) {
      const category = categorySelect.value;
      const rawValue = fromValue.value.trim();
      fromValue.classList.remove('input-error');

      if (rawValue === '') {
        toValue.value = '';
        return;
      }
      if (!/^-?[0-9]*\.?[0-9]+$/.test(rawValue)) {
        fromValue.classList.add('input-error');
        toValue.value = '';
        return;
      }

      const value = parseFloat(rawValue);
      const fromUnit = fromSelect.value;
      const toUnit = toSelect.value;
      const result = convertValue(category, value, fromUnit, toUnit);
      const formatted = formatResult(result);
      toValue.value = formatted;

      if (record) {
        const cat = CATEGORIES[category];
        const fromLabel = cat.units[fromUnit].label;
        const toLabel = cat.units[toUnit].label;
        historyManager.add({
          category,
          categoryLabel: cat.label,
          input: rawValue,
          output: formatted,
          fromUnit,
          toUnit,
          fromLabel,
          toLabel,
        });
        renderHistoryList();
      }
    }

    categorySelect.addEventListener('change', () => {
      populateUnitSelects(categorySelect.value);
      recalc();
    });
    fromValue.addEventListener('input', () => recalc());
    fromSelect.addEventListener('change', () => recalc());
    toSelect.addEventListener('change', () => recalc());

    swapBtn.addEventListener('click', () => {
      const tempUnit = fromSelect.value;
      fromSelect.value = toSelect.value;
      toSelect.value = tempUnit;
      if (toValue.value !== '') {
        fromValue.value = toValue.value;
      }
      recalc();
    });

    clearBtn.addEventListener('click', () => {
      fromValue.value = '';
      toValue.value = '';
      fromValue.classList.remove('input-error');
      UCP.showToast('Input dibersihkan', 'info');
    });

    clearHistoryBtn.addEventListener('click', () => {
      historyManager.clear();
      renderHistoryList();
      UCP.showToast('Riwayat dihapus', 'info');
    });

    UCP.attachCopy('unitCopyBtn', () => toValue.value);

    // Inisialisasi awal
    populateUnitSelects(categorySelect.value);
    renderHistoryList();
  }

  UCP.initUnits = initUnits;
})();
