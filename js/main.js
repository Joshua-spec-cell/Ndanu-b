(function () {
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var colors = ['#e8b64a', '#f3cf84', '#fbeee2', '#c9701a'];

  /* ---------------- Reveal on scroll ---------------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.18 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------------- Confetti in hero ---------------- */
  var confettiHost = document.getElementById('confetti');
  if (confettiHost && !reduceMotion) {
    var n = window.innerWidth < 600 ? 16 : 30;
    for (var i = 0; i < n; i++) {
      var s = document.createElement('span');
      s.style.left = (Math.random() * 100) + '%';
      s.style.background = colors[i % colors.length];
      s.style.animationDuration = (9 + Math.random() * 10) + 's';
      s.style.animationDelay = (Math.random() * 10) + 's';
      s.style.width = (6 + Math.random() * 4) + 'px';
      confettiHost.appendChild(s);
    }
  }

  /* ---------------- Countdown to 9 October ---------------- */
  var DAY = 86400000;
  var cdBox = document.getElementById('countdown');
  var cdToday = document.getElementById('countdown-today');
  var dEl = document.getElementById('cd-days'), hEl = document.getElementById('cd-hours'),
      mEl = document.getElementById('cd-mins'), sEl = document.getElementById('cd-secs');

  function pad(x) { return String(x).padStart(2, '0'); }

  function updateCountdown() {
    var now = new Date();
    var target = new Date(now.getFullYear(), 9, 9, 0, 0, 0); // month 9 = October

    // On the birthday itself: show a celebration message instead of the timer
    if (now >= target && now < new Date(target.getTime() + DAY)) {
      cdBox.hidden = true;
      cdToday.hidden = false;
      return;
    }
    cdBox.hidden = false;
    cdToday.hidden = true;

    // After the birthday has passed, count down to next year
    if (now >= target) { target = new Date(now.getFullYear() + 1, 9, 9, 0, 0, 0); }

    var diff = target - now;
    dEl.textContent = Math.floor(diff / DAY);
    hEl.textContent = pad(Math.floor((diff % DAY) / 3600000));
    mEl.textContent = pad(Math.floor((diff % 3600000) / 60000));
    sEl.textContent = pad(Math.floor((diff % 60000) / 1000));
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ---------------- Tilt effect on photo cards ---------------- */
  if (!reduceMotion && window.matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(800px) rotateY(' + (x * 8) + 'deg) rotateX(' + (-y * 8) + 'deg) scale(1.02)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  /* ---------------- Candles ---------------- */
  var candles = Array.prototype.slice.call(document.querySelectorAll('[data-candle]'));
  var hint = document.getElementById('candle-hint');
  var success = document.getElementById('candle-success');

  function remaining() {
    return candles.filter(function (c) { return !c.classList.contains('out'); }).length;
  }
  function refreshHint() {
    var r = remaining();
    if (r === 0) {
      hint.textContent = 'All candles out, wish made!';
      success.textContent = 'Happy Birthday, Ndanu! 🎉';
    } else {
      hint.textContent = r + (r === 1 ? ' candle left' : ' candles left');
    }
  }
  candles.forEach(function (c, idx) {
    c.addEventListener('click', function () {
      if (c.classList.contains('out')) return;
      c.classList.add('out');
      c.setAttribute('aria-pressed', 'true');
      c.setAttribute('aria-label', 'Candle ' + (idx + 1) + ', blown out');
      refreshHint();
      if (remaining() === 0) { burstConfetti(); }
    });
  });

  function burstConfetti() {
    if (reduceMotion) return;
    for (var i = 0; i < 40; i++) {
      (function (i) {
        var el = document.createElement('span');
        el.style.cssText =
          'position:fixed;left:' + (45 + Math.random() * 10) + '%;top:40%;width:7px;height:13px;' +
          'border-radius:2px;pointer-events:none;z-index:60;' +
          'background:' + colors[i % colors.length] + ';' +
          'transition:transform 1.4s cubic-bezier(.2,.7,.3,1),opacity 1.4s ease;';
        document.body.appendChild(el);
        var dx = (Math.random() - 0.5) * 600;
        var dy = 300 + Math.random() * 400;
        var rot = Math.random() * 720;
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            el.style.transform = 'translate(' + dx + 'px,' + dy + 'px) rotate(' + rot + 'deg)';
            el.style.opacity = '0';
          });
        });
        setTimeout(function () { el.remove(); }, 1600);
      })(i);
    }
  }

  /* ---------------- Wish wall ----------------
     Paste your Google Apps Script web app URL below to share wishes with
     everyone. Leave it empty and wishes save only in this browser. */
  var WISH_API_URL = 'https://script.google.com/macros/s/AKfycbzemSqZbth1Q10xpdo6q-Z_BErOie8sDHsc4cDN_lkYJT5XS-H-_6S8S3zc1xBMAjQ6gg/exec';

  var WISH_KEY = 'grace-birthday-wishes-v1';
  var grid = document.getElementById('wish-grid');
  var empty = document.getElementById('wish-empty');
  var statusEl = document.getElementById('wish-status');
  var note = document.getElementById('wish-note');
  var form = document.getElementById('wish-form');
  var submitBtn = form.querySelector('button[type="submit"]');

  function loadLocal() {
    try { return JSON.parse(localStorage.getItem(WISH_KEY) || '[]'); } catch (e) { return []; }
  }
  function saveLocal(list) {
    try { localStorage.setItem(WISH_KEY, JSON.stringify(list)); } catch (e) {}
  }
  function setStatus(msg) { statusEl.textContent = msg || ''; }

  function renderWishes(list) {
    grid.innerHTML = '';
    if (!list.length) { empty.hidden = false; grid.hidden = true; return; }
    empty.hidden = true; grid.hidden = false;
    list.slice().reverse().forEach(function (w) {
      var card = document.createElement('div');
      card.className = 'wish-card';
      var p = document.createElement('p');
      p.textContent = w.message;           // textContent keeps user input safe
      var from = document.createElement('div');
      from.className = 'from';
      from.textContent = '\u2014 ' + w.name;
      card.appendChild(p); card.appendChild(from);
      grid.appendChild(card);
    });
  }

  function fetchWishes() {
    if (!WISH_API_URL) { renderWishes(loadLocal()); return Promise.resolve(); }
    setStatus('Loading wishes\u2026');
    return fetch(WISH_API_URL)
      .then(function (r) { return r.json(); })
      .then(function (data) { setStatus(''); renderWishes(data.wishes || []); })
      .catch(function () { setStatus('Couldn\u2019t load wishes right now. Try refreshing the page.'); });
  }

  if (!WISH_API_URL && note) {
    note.textContent = 'Write her something kind. Wishes are saved in this browser, so open the page on Grace\u2019s device to see the ones written there.';
  }
  fetchWishes();

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = document.getElementById('wish-name').value.trim();
    var message = document.getElementById('wish-message').value.trim();
    var trap = document.getElementById('wish-website').value;
    if (!name || !message) return;

    if (!WISH_API_URL) {
      var list = loadLocal();
      list.push({ name: name, message: message, t: Date.now() });
      saveLocal(list);
      form.reset();
      renderWishes(list);
      return;
    }

    submitBtn.disabled = true;
    setStatus('Sending your wish\u2026');
    // No custom headers: keeps this a "simple" request so the browser doesn't block it.
    fetch(WISH_API_URL, {
      method: 'POST',
      body: JSON.stringify({ name: name, message: message, website: trap })
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.ok) throw new Error('rejected');
        form.reset();
        setStatus('Thank you \u2014 your wish is on the wall \ud83c\udf82');
        return fetchWishes().then(function () { setStatus('Thank you \u2014 your wish is on the wall \ud83c\udf82'); });
      })
      .catch(function () { setStatus('Your wish didn\u2019t send. Please check your connection and try again.'); })
      .then(function () { submitBtn.disabled = false; });
  });

  /* ---------------- Copy link ---------------- */
  var copyBtn = document.getElementById('copy-link');
  var copyLabel = document.getElementById('copy-label');
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }
  copyBtn.addEventListener('click', function () {
    var url = location.href;
    var done = function () {
      copyLabel.textContent = 'Link copied!';
      setTimeout(function () { copyLabel.textContent = 'Copy link to share'; }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done).catch(function () { fallbackCopy(url); done(); });
    } else { fallbackCopy(url); done(); }
  });

  /* ---------------- Background music (music/birthday-tune.mp3) ---------------- */
  var audio = document.getElementById('bg-music');
  var musicBtn = document.getElementById('music-btn');

  function setPlayingUI(on) {
    musicBtn.classList.toggle('playing', on);
    musicBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    musicBtn.setAttribute('aria-label', on ? 'Pause background music' : 'Play background music');
  }

  audio.volume = 0.6;
  musicBtn.addEventListener('click', function () {
    if (audio.paused) {
      var p = audio.play();
      if (p && p.then) {
        p.then(function () { setPlayingUI(true); })
         .catch(function () { setPlayingUI(false); });
      } else { setPlayingUI(true); }
    } else {
      audio.pause();
      setPlayingUI(false);
    }
  });
  audio.addEventListener('pause', function () { setPlayingUI(false); });
  audio.addEventListener('play', function () { setPlayingUI(true); });
})();
