/* FarmaVida — script compartido por todas las páginas */

document.addEventListener('DOMContentLoaded', function () {

  // ---------- Año en el footer ----------
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Menú móvil ----------
  var toggle = document.getElementById('menuToggle');
  var links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---------- Horario en vivo (solo corre si la página tiene el widget) ----------
  var statusBadge = document.getElementById('statusBadge');
  var statusText = document.getElementById('statusText');
  if (statusBadge && statusText) {
    var HOURS = {
      0: { open: 8 * 60, close: 13 * 60 },
      1: { open: 7 * 60, close: 19 * 60 },
      2: { open: 7 * 60, close: 19 * 60 },
      3: { open: 7 * 60, close: 19 * 60 },
      4: { open: 7 * 60, close: 19 * 60 },
      5: { open: 7 * 60, close: 19 * 60 },
      6: { open: 7 * 60, close: 18 * 60 }
    };
    var DAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

    var svHora = function () {
      try {
        var fmt = new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/El_Salvador', hour12: false,
          weekday: 'short', hour: '2-digit', minute: '2-digit'
        });
        var parts = fmt.formatToParts(new Date());
        var map = {};
        parts.forEach(function (p) { map[p.type] = p.value; });
        var weekdayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
        return {
          day: weekdayMap[map.weekday],
          minutes: parseInt(map.hour, 10) * 60 + parseInt(map.minute, 10)
        };
      } catch (e) {
        var d = new Date();
        return { day: d.getDay(), minutes: d.getHours() * 60 + d.getMinutes() };
      }
    };

    var label = function (mins) {
      var h = Math.floor(mins / 60), m = mins % 60;
      var period = h < 12 ? 'a. m.' : 'p. m.';
      var h12 = h % 12; if (h12 === 0) h12 = 12;
      return h12 + (m ? ':' + String(m).padStart(2, '0') : ':00') + ' ' + period;
    };

    var now = svHora();
    var today = HOURS[now.day];

    if (today && now.minutes >= today.open && now.minutes < today.close) {
      statusBadge.classList.add('open');
      statusText.textContent = 'Abierto ahora · cerramos a las ' + label(today.close);
    } else {
      var found = null;
      for (var i = 0; i < 7; i++) {
        var d = (now.day + i) % 7;
        var h = HOURS[d];
        if (h && (i > 0 || now.minutes < h.open)) { found = { day: d, time: h.open, sameDay: i === 0 }; break; }
      }
      statusText.textContent = found
        ? 'Cerrado ahora · abrimos ' + (found.sameDay ? 'hoy' : DAY_NAMES[found.day]) + ' a las ' + label(found.time)
        : 'Cerrado ahora';
    }

    var rows = document.querySelectorAll('#hoursTable tr');
    rows.forEach(function (r) {
      var d = parseInt(r.getAttribute('data-day'), 10);
      var matches = (d === 1 && now.day >= 1 && now.day <= 5) || d === now.day;
      if (matches) r.classList.add('today');
    });
  }

  // ---------- Carrusel de ofertas (solo en la página de inicio) ----------
  var root = document.querySelector('[data-carousel]');
  if (root) {
    var track = root.querySelector('[data-track]');
    var slides = Array.prototype.slice.call(track.children);
    var prevBtn = root.querySelector('[data-prev]');
    var nextBtn = root.querySelector('[data-next]');
    var dotsWrap = document.querySelector('[data-dots]');
    var index = 0;
    var autoplayMs = 5500;
    var timer = null;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) track.style.transition = 'none';

    slides.forEach(function (_, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      b.setAttribute('aria-label', 'Ir a la oferta ' + (i + 1));
      b.addEventListener('click', function () { goTo(i); resetAutoplay(); });
      dotsWrap.appendChild(b);
    });
    var dots = Array.prototype.slice.call(dotsWrap.children);

    function update() {
      track.style.transform = 'translateX(-' + (index * 100) + '%)';
      dots.forEach(function (d, i) { d.classList.toggle('active', i === index); });
    }
    function goTo(i) {
      index = (i + slides.length) % slides.length;
      update();
    }
    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }

    if (nextBtn) nextBtn.addEventListener('click', function () { next(); resetAutoplay(); });
    if (prevBtn) prevBtn.addEventListener('click', function () { prev(); resetAutoplay(); });

    function startAutoplay() {
      if (reduceMotion) return;
      stopAutoplay();
      timer = setInterval(next, autoplayMs);
    }
    function stopAutoplay() { if (timer) clearInterval(timer); }
    function resetAutoplay() { startAutoplay(); }

    root.addEventListener('mouseenter', stopAutoplay);
    root.addEventListener('mouseleave', startAutoplay);
    root.addEventListener('focusin', stopAutoplay);
    root.addEventListener('focusout', startAutoplay);

    update();
    startAutoplay();
  }

});