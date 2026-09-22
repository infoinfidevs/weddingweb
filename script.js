/* ═══════════════════════════════════════════════════════════════
   Ajeesh & Varsha · Akheesh & Aiswarya — Wedding Website Script
   Burgundy Theme · 2 Couples Edition
   Ultra-premium, GPU-optimized, smooth-scroll experience
═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // ── APPS SCRIPT URL ──────────────────────────────────────────
  var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwudQMx5QFr2HJ2v4HthZKZtfBc_pAfCeysBfG_Og5cee6wdtueLH_GKVm_Rj20crHa/exec';

  // ── UTILITIES ────────────────────────────────────────────────
  function $(id) { return document.getElementById(id); }
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return (ctx || document).querySelectorAll(sel); }

  var APP = $('app');

  // Force scroll to top on reload
  if (APP) {
    history.scrollRestoration = 'manual';
    APP.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  // ── BACKGROUND TILES (alternating flip) ───────────────────────
  function setupBgTiles() {
    var container = $('bgPattern');
    if (!container || !APP) return;
    var img = new Image();
    img.src = 'images/assets/background.png';
    img.onload = function () {
      var appWidth = APP.offsetWidth || 430;
      var scale = appWidth / img.naturalWidth;
      var tileH = img.naturalHeight * scale;
      function fill() {
        var totalH = APP.scrollHeight;
        var count = Math.ceil(totalH / tileH) + 2;
        var existing = container.children.length;
        for (var i = existing; i < count; i++) {
          var tile = document.createElement('img');
          tile.src = 'images/assets/background.png';
          tile.alt = '';
          tile.className = 'bg-tile' + (i % 2 === 1 ? ' flipped' : '');
          container.appendChild(tile);
        }
      }
      fill();
      // Re-fill if content changes height (e.g. images load, sections expand)
      var ro = window.ResizeObserver ? new ResizeObserver(fill) : null;
      if (ro) ro.observe(APP);
    };
  }
  setupBgTiles();

  // ── LOADER ───────────────────────────────────────────────────
  function setupLoader() {
    var loader = $('loader');
    if (!loader) return;
    
    loader.addEventListener('click', function () {
      loader.classList.add('hide');
      
      var app = document.getElementById('app');
      if (app) app.classList.remove('no-scroll');
      
      // Trigger cinematic hero entrance on #hero element
      var hero = document.getElementById('hero');
      if (hero) {
        requestAnimationFrame(function () {
          hero.classList.add('loaded');
        });
      }
    });
  }
  setupLoader();

  // ── HERO COUNTDOWN ───────────────────────────────────────────
  // Countdown to the first event: November 1, 2026 (Couple 1 Thaalikettu)
  function initCountdown() {
    var dEl = $('cd-d'), hEl = $('cd-h'), mEl = $('cd-m'), sEl = $('cd-s');
    if (!dEl || !hEl || !mEl || !sEl) return;
    
    // Target: November 1, 2026 08:15:00 (local time)
    var target = new Date(2026, 10, 1, 8, 15, 0).getTime();

    function update() {
      var now = new Date().getTime();
      var diff = target - now;

      if (diff <= 0) {
        dEl.innerText = '00'; hEl.innerText = '00'; mEl.innerText = '00'; sEl.innerText = '00';
        return;
      }

      var d = Math.floor(diff / (1000 * 60 * 60 * 24));
      var h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      var s = Math.floor((diff % (1000 * 60)) / 1000);

      dEl.innerText = d < 10 ? '0' + d : d;
      hEl.innerText = h < 10 ? '0' + h : h;
      mEl.innerText = m < 10 ? '0' + m : m;
      sEl.innerText = s < 10 ? '0' + s : s;
    }
    
    update();
    setInterval(update, 1000);
  }
  initCountdown();

  // ── SCROLL REVEAL (IntersectionObserver) ─────────────────────
  var revealEls = qsa('.reveal');

  if ('IntersectionObserver' in window && revealEls.length) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          revealObs.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0.08 });

    revealEls.forEach(function (el) { revealObs.observe(el); });
  } else {
    // Fallback: show all immediately
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  // ── INVITATION ENVELOPE — Scroll reveal ──────────────────────
  var invEnvWrap = qs('.inv-envelope-wrap');
  if (invEnvWrap && 'IntersectionObserver' in window) {
    var invObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          invObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    invObs.observe(invEnvWrap);
  }

  // ── MUSIC TOGGLE & AUTO-PLAY ─────────────────────────────────
  var audio    = $('bg-audio');
  var musicBtn = $('music-toggle');
  var icPlay   = $('ic-play');
  var icPause  = $('ic-pause');

  var interacted = false;
  var userPaused = false;

  if (audio) {
    audio.muted  = true;
    audio.volume = 1;
  }

  function syncIcons(isPlaying) {
    if (icPlay)  icPlay.style.display  = isPlaying ? 'none' : '';
    if (icPause) icPause.style.display = isPlaying ? ''     : 'none';
  }
  syncIcons(false);

  function unlockAudio() {
    if (interacted || userPaused) return;

    audio.muted = false;
    var p = audio.play();
    
    if (p !== undefined) {
      p.then(function () {
        interacted = true;
        syncIcons(true);

        ['click', 'touchstart', 'touchend', 'touchmove', 'keydown', 'pointerdown', 'pointerup'].forEach(function (evt) {
          document.removeEventListener(evt, unlockAudio, true);
          document.removeEventListener(evt, unlockAudio, { capture: true });
        });
        if (APP) APP.removeEventListener('scroll', unlockAudio, true);
        window.removeEventListener('scroll', unlockAudio, true);
      }).catch(function (err) {
        interacted = false;
      });
    }
  }

  ['click', 'touchstart', 'touchend', 'touchmove', 'keydown', 'pointerdown', 'pointerup'].forEach(function (evt) {
    document.addEventListener(evt, unlockAudio, { passive: true, capture: true });
  });
  if (APP) APP.addEventListener('scroll', unlockAudio, { passive: true });
  window.addEventListener('scroll', unlockAudio, { passive: true });

  // Button toggle
  if (musicBtn && audio) {
    musicBtn.addEventListener('click', function (e) {
      e.stopPropagation();

      var isPlaying = !audio.paused && !audio.muted;

      if (isPlaying) {
        audio.pause();
        userPaused = true;
        syncIcons(false);
      } else {
        audio.muted = false;
        audio.play().then(function () {
          userPaused = false;
          interacted = true;
          syncIcons(true);
        }).catch(function (err) {
          console.warn('Audio resume failed:', err);
        });
      }
    });
  }

  // ── RSVP FORM ─────────────────────────────────────────────────
  var rsvpForm    = $('rsvp-form');
  var rsvpSuccess = $('rsvp-success');
  var rsvpSubmit  = $('rf-submit');

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var name      = ($('rf-name').value || '').trim();
      var guests    = ($('rf-guests').value || '').trim();
      var attending = '';
      qsa('input[name="attending"]').forEach(function (inp) {
        if (inp.checked) attending = inp.value;
      });
      var message = ($('rf-message').value || '').trim();

      // Validation
      if (!name) {
        $('rf-name').focus();
        $('rf-name').style.borderBottomColor = '#800020';
        return;
      }
      if (!guests) {
        $('rf-guests').focus();
        return;
      }
      if (!attending) {
        var firstLabel = qs('.rf-attend label');
        if (firstLabel) firstLabel.style.outline = '1px solid #800020';
        setTimeout(function () { if (firstLabel) firstLabel.style.outline = ''; }, 2000);
        return;
      }

      // Show loading
      rsvpSubmit.classList.add('loading');
      rsvpSubmit.disabled = true;

      var payload = JSON.stringify({
        name:      name,
        guests:    guests,
        attending: attending,
        message:   message,
      });

      fetch(APPS_SCRIPT_URL, {
        method:  'POST',
        mode:    'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body:    payload,
      })
      .then(function () {
        rsvpForm.style.display = 'none';
        rsvpSuccess.classList.add('show');
      })
      .catch(function (err) {
        console.error('RSVP error:', err);
        rsvpSubmit.classList.remove('loading');
        rsvpSubmit.disabled = false;
        alert('Could not submit RSVP. Please try calling us directly.');
      });
    });

    // Reset field error on input
    $('rf-name').addEventListener('input', function () {
      this.style.borderBottomColor = '';
    });
  }

  // ── SMOOTH ANCHOR SCROLL ──────────────────────────────────────
  qsa('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
