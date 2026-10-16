/* ==========================================================
   Portfolio interactions
   1. Dark / light theme + background videos
   2. Video loop fade
   3. Floating specks and stars
   4. Scroll reveal
   ========================================================== */
(function () {
  var H = document.documentElement;
  var vl = document.getElementById('vl');       // light-mode video
  var vd = document.getElementById('vd');       // dark-mode video
  var veil = document.getElementById('veil');   // fade layer for the loop point
  var tg = document.getElementById('tg');       // theme toggle button

  /* ---------- 1. Theme + videos ---------- */

  // Video that belongs to the current theme
  function cur() {
    return H.getAttribute('data-theme') === 'dark' ? vd : vl;
  }

  function play(x) {
    var p = x.play();
    if (p && p.catch) p.catch(function () {});
  }

  // Apply a theme, start its video, pause the old one, remember the choice
  function set(t) {
    var old = cur();
    H.setAttribute('data-theme', t);
    tg.setAttribute('aria-pressed', t === 'dark');
    play(cur());
    setTimeout(function () {
      if (cur() !== old) old.pause();
    }, 1400);
    try { localStorage.setItem('theme2', t); } catch (e) {}
  }

  // Start with the saved theme (light by default)
  var s = 'light';
  try { s = localStorage.getItem('theme2') || 'light'; } catch (e) {}
  H.setAttribute('data-theme', s);
  tg.setAttribute('aria-pressed', s === 'dark');
  play(cur());

  // Toggle button: circular reveal from the button when supported
  tg.addEventListener('click', function () {
    var n = H.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    var r = tg.getBoundingClientRect();
    H.style.setProperty('--tx', (r.left + r.width / 2) + 'px');
    H.style.setProperty('--ty', (r.top + r.height / 2) + 'px');

    if (document.startViewTransition && !matchMedia('(prefers-reduced-motion:reduce)').matches) {
      H.classList.add('vt');
      var x = document.startViewTransition(function () { set(n); });
      x.finished.then(
        function () { H.classList.remove('vt'); },
        function () { H.classList.remove('vt'); }
      );
    } else {
      set(n);
    }
  });

  /* ---------- 2. Soft fade at the video loop point ---------- */
  function tick() {
    var v = cur();
    var d = v.duration || 10;
    var x = v.currentTime;
    var o = 0;
    var f = 0.8;
    if (x > d - f) o = (x - (d - f)) / f;
    else if (x < f) o = (f - x) / f;
    veil.style.opacity = Math.max(0, Math.min(1, o)) * 0.85;
    requestAnimationFrame(tick);
  }
  tick();

  /* ---------- 3. Floating specks (hero) ---------- */
  var m = document.getElementById('motes');
  for (var i = 0; i < 24; i++) {
    var e = document.createElement('i');
    e.style.cssText =
      'left:' + (Math.random() * 100) + '%;' +
      '--s:' + (3 + Math.random() * 7) + 'px;' +
      '--d:' + (10 + Math.random() * 10) + 's;' +
      '--dl:-' + (Math.random() * 16) + 's;' +
      '--x:' + (Math.random() * 90 - 45) + 'px';
    m.appendChild(e);
  }

  /* ---------- Stars (dark mode only, hero) ---------- */
  var sc = document.getElementById('stars');
  for (var j = 0; j < 30; j++) {
    var q = document.createElement('i');
    q.style.cssText =
      'left:' + (Math.random() * 100) + '%;' +
      'top:' + (Math.random() * 100) + '%;' +
      'animation-delay:-' + (Math.random() * 2.4) + 's;' +
      'transform:scale(' + (0.6 + Math.random()) + ')';
    sc.appendChild(q);
  }

  /* ---------- 4. Scroll reveal ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (x) {
      if (x.isIntersecting) {
        x.target.classList.add('on');
        io.unobserve(x.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.rv').forEach(function (w) { io.observe(w); });

  /* ---------- 5. Education timeline: reveal one by one + scroll-linked line ---------- */
  var tl = document.querySelector('.tl');
  if (tl) {
    var items = tl.querySelectorAll('.ti');
    items.forEach(function (it, k) { it.style.setProperty('--k', k); });

    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (x) {
        if (x.isIntersecting) {
          x.target.classList.add('in');
          io2.unobserve(x.target);
        }
      });
    }, { threshold: 0.25 });
    items.forEach(function (it) { io2.observe(it); });

    // The pink line grows as you scroll down the timeline
    var upd = function () {
      var r = tl.getBoundingClientRect();
      var p = (window.innerHeight * 0.7 - r.top) / r.height;
      tl.style.setProperty('--p', Math.max(0, Math.min(1, p)));
    };
    addEventListener('scroll', upd, { passive: true });
    addEventListener('resize', upd);
    upd();
  }
})();
