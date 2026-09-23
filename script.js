/* ═══════════════════════════════════════════════════════════════
   Ajeesh & Varsha · Akheesh & Aiswarya — Wedding Website Script
   Burgundy Theme · 2 Couples Edition
   Ultra-premium, GPU-optimized, smooth-scroll experience
═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // ── APPS SCRIPT URL ──────────────────────────────────────────
  var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwd0xVyOvjjB9rgCLmFeo0QzjEm8H8oX37nJF2ZPvres3EO7XydFGCc6w_oEQEtlefq/exec';

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

  // ── SPIRAL NOTEBOOK BINDING SVG GENERATOR ────────────────────
  function createSpiralSvg(width) {
    var w = width || 430;
    var step = 24;
    var numRings = Math.max(4, Math.floor((w - 16) / step));
    var margin = (w - (numRings - 1) * step) / 2;

    var ringsHtml = '';
    for (var r = 0; r < numRings; r++) {
      var cx = Math.round(margin + r * step);
      // Back of wire loop entering top of hole
      ringsHtml += '<path d="M ' + (cx + 3) + ' 4 C ' + (cx + 4) + ' 8, ' + (cx + 3) + ' 12, ' + cx + ' 14" stroke="#5C360A" stroke-width="3.4" stroke-linecap="round" fill="none" opacity="0.65" />';
      // Punch hole (capsule cut into paper)
      ringsHtml += '<rect x="' + (cx - 4.5) + '" y="12" width="9" height="18" rx="4.5" fill="url(#holeDepth)" />';
      // Cut edge highlights
      ringsHtml += '<path d="M ' + (cx - 4) + ' 27 A 4 4 0 0 0 ' + (cx + 4) + ' 27" stroke="rgba(255,255,255,0.4)" stroke-width="0.8" fill="none" />';
      ringsHtml += '<path d="M ' + (cx - 4) + ' 15 A 4 4 0 0 1 ' + (cx + 4) + ' 15" stroke="#080103" stroke-width="1.2" fill="none" />';
      // Front wire loop (curves over paper surface with metallic gradient & shadow)
      ringsHtml += '<path d="M ' + (cx - 2) + ' 26 C ' + (cx - 6) + ' 20, ' + (cx - 6) + ' 9, ' + (cx - 2) + ' 4 C ' + cx + ' 0, ' + (cx + 3) + ' 0, ' + (cx + 3) + ' 4" stroke="url(#spiralGoldWire)" stroke-width="3.6" stroke-linecap="round" fill="none" filter="url(#wireShadow)" />';
      // Specular gleam highlight on wire crest
      ringsHtml += '<path d="M ' + (cx - 2.5) + ' 23 C ' + (cx - 5.5) + ' 12, ' + (cx - 3.5) + ' 5, ' + (cx - 1) + ' 2 C ' + (cx + 1) + ' 0.8, ' + (cx + 2.5) + ' 1.5, ' + (cx + 2.5) + ' 3.5" stroke="#FFFDF6" stroke-width="1.1" stroke-linecap="round" fill="none" opacity="0.85" />';
    }

    return '<svg class="bg-spiral-svg" width="' + w + '" height="42" viewBox="0 0 ' + w + ' 42" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
      '<linearGradient id="spiralGoldWire" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%" stop-color="#FFF0BE" />' +
      '<stop offset="18%" stop-color="#E5BA5A" />' +
      '<stop offset="42%" stop-color="#804D12" />' +
      '<stop offset="68%" stop-color="#DDA944" />' +
      '<stop offset="85%" stop-color="#FFF6D2" />' +
      '<stop offset="100%" stop-color="#9C6B23" />' +
      '</linearGradient>' +
      '<linearGradient id="holeDepth" x1="0%" y1="0%" x2="0%" y2="100%">' +
      '<stop offset="0%" stop-color="#120306" />' +
      '<stop offset="50%" stop-color="#240710" />' +
      '<stop offset="100%" stop-color="#3D121F" />' +
      '</linearGradient>' +
      '<filter id="wireShadow" x="-30%" y="-30%" width="170%" height="170%">' +
      '<feDropShadow dx="1" dy="2.5" stdDeviation="1.8" flood-color="#260610" flood-opacity="0.45" />' +
      '</filter>' +
      '</defs>' +
      '<rect x="0" y="0" width="' + w + '" height="3" fill="rgba(42,10,20,0.15)" />' +
      '<line x1="0" y1="0.5" x2="' + w + '" y2="0.5" stroke="rgba(163,52,74,0.3)" stroke-width="1" />' +
      '<line x1="0" y1="21" x2="' + w + '" y2="21" stroke="rgba(163,52,74,0.15)" stroke-width="1" stroke-dasharray="2 6" />' +
      ringsHtml +
      '</svg>';
  }

  // ── BACKGROUND TILES (alternating flip) ───────────────────────
  function setupBgTiles() {
    var container = $('bgPattern');
    if (!container || !APP) return;
    var img = new Image();
    img.src = 'images/assets/background.png';
    img.onload = function () {
      function getContentHeight() {
        var footer = APP.querySelector('footer');
        if (footer && footer.offsetTop) {
          return footer.offsetTop + footer.offsetHeight;
        }
        return APP.offsetHeight || APP.scrollHeight;
      }

      function fill() {
        var appWidth = APP.offsetWidth || 430;
        var scale = appWidth / img.naturalWidth;
        var tileH = img.naturalHeight * scale;
        if (!tileH || tileH <= 0) return;

        var totalH = getContentHeight();
        var count = Math.ceil(totalH / tileH);
        var existing = container.children.length;

        if (count > existing) {
          for (var i = existing; i < count; i++) {
            var tile = document.createElement('img');
            tile.src = 'images/assets/background.png';
            tile.alt = '';
            tile.className = 'bg-tile' + (i % 2 === 1 ? ' flipped' : '');
            container.appendChild(tile);
          }
        } else if (count < existing) {
          while (container.children.length > count) {
            container.removeChild(container.lastChild);
          }
        }
      }

      fill();

      window.addEventListener('resize', fill);
      window.addEventListener('load', fill);

      if (window.ResizeObserver) {
        var ro = new ResizeObserver(fill);
        ro.observe(APP);
      }
    };
  }
  setupBgTiles();

  // ── POPULATE PAGE SPIRAL BINDINGS ────────────────────────────
  function setupSpirals() {
    var appWidth = (APP && APP.offsetWidth) || 430;
    var spiralSvgHtml = createSpiralSvg(appWidth);
    var bindings = qsa('.page-spiral-binding');
    bindings.forEach(function (el) {
      el.innerHTML = spiralSvgHtml;
    });
  }
  setupSpirals();
  window.addEventListener('resize', setupSpirals);

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

      var prevS = sEl.innerText;
      var newS = s < 10 ? '0' + s : String(s);
      if (prevS !== newS && prevS !== '00') {
        sEl.classList.remove('tick');
        void sEl.offsetWidth;
        sEl.classList.add('tick');
      }
      sEl.innerText = newS;
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
  var audio = $('bg-audio');
  var musicBtn = $('music-toggle');
  var icPlay = $('ic-play');
  var icPause = $('ic-pause');

  var interacted = false;
  var userPaused = false;

  if (audio) {
    audio.muted = true;
    audio.volume = 1;
  }

  function syncIcons(isPlaying) {
    if (icPlay) icPlay.style.display = isPlaying ? 'none' : '';
    if (icPause) icPause.style.display = isPlaying ? '' : 'none';
    if (musicBtn) {
      if (isPlaying) musicBtn.classList.add('playing');
      else musicBtn.classList.remove('playing');
    }
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
  var rsvpForm = $('rsvp-form');
  var rsvpSuccess = $('rsvp-success');
  var rsvpSubmit = $('rf-submit');

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = ($('rf-name').value || '').trim();
      var guests = ($('rf-guests').value || '').trim();
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
        name: name,
        guests: guests,
        attending: attending,
        message: message,
      });

      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
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
