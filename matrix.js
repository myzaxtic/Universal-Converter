/* =========================================================
   matrix.js — Animasi Matrix Rain pada canvas background
   ========================================================= */
(function () {
  const UCP = (window.UCP = window.UCP || {});

  function initMatrix() {
    const canvas = document.getElementById('matrixCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const CHARS =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789アイウエオカキクケコサシスセソタチツテトナニヌネノ';
    const FONT_SIZE = 15;

    let width = 0;
    let height = 0;
    let columns = 0;
    let drops = [];
    let intervalId = null;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      columns = Math.floor(width / FONT_SIZE);
      drops = new Array(columns).fill(0).map(() => Math.floor((Math.random() * height) / FONT_SIZE));
    }

    function draw() {
      // Lapisan transparan tipis untuk efek jejak/trail
      ctx.fillStyle = 'rgba(4, 7, 10, 0.09)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = FONT_SIZE + 'px monospace';

      for (let i = 0; i < columns; i++) {
        const char = CHARS.charAt(Math.floor(Math.random() * CHARS.length));
        const x = i * FONT_SIZE;
        const y = drops[i] * FONT_SIZE;

        // Karakter kepala lebih terang
        ctx.fillStyle = '#c8ffe0';
        ctx.fillText(char, x, y);
        ctx.fillStyle = 'rgba(0, 255, 102, 0.65)';
        ctx.fillText(char, x, y - FONT_SIZE);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    function start() {
      stop();
      intervalId = setInterval(draw, 50);
    }
    function stop() {
      if (intervalId) clearInterval(intervalId);
      intervalId = null;
    }

    resize();
    start();

    window.addEventListener('resize', () => {
      resize();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else start();
    });
  }

  UCP.initMatrix = initMatrix;
})();
