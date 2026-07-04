/* =========================================================
   copy.js — Utilitas Copy ke Clipboard + Toast Notification
   ========================================================= */
(function () {
  const UCP = (window.UCP = window.UCP || {});

  /**
   * Menyalin teks ke clipboard, dengan fallback untuk browser lama
   * atau konteks non-secure (http).
   */
  async function copyText(text) {
    if (!text || text.trim() === '') {
      if (UCP.showToast) UCP.showToast('Tidak ada teks untuk disalin', 'error');
      return false;
    }
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      if (UCP.showToast) UCP.showToast('Berhasil disalin ke clipboard', 'success');
      return true;
    } catch (err) {
      if (UCP.showToast) UCP.showToast('Gagal menyalin teks', 'error');
      return false;
    }
  }

  /**
   * Menempelkan handler copy ke sebuah tombol berdasarkan ID.
   * @param {string} btnId
   * @param {() => string} getTextFn - fungsi yang mengembalikan teks yang akan disalin
   */
  function attachCopy(btnId, getTextFn) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.addEventListener('click', () => {
      copyText(getTextFn());
    });
  }

  UCP.copyText = copyText;
  UCP.attachCopy = attachCopy;
})();
