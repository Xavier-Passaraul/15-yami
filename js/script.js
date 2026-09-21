(function () {
  "use strict";
  var CONFIG = {
    // Fecha y hora del evento (ISO). ¡Tiene que ser una fecha futura!
    eventDateISO: "2027-03-06T20:30:00",

    // Número de WhatsApp que recibe las confirmaciones.
    whatsappNumber: "5493533580524",
    gateText: "¡Tenés una invitación especial!",

    // EDAD MÁXIMA CONSIDERADA "MENOR"
    edadMaximaMenor: 10,
  };

  document.documentElement.classList.add("js");
  document.addEventListener("visibilitychange", function () {
    document.body.classList.toggle("is-tab-hidden", document.hidden);
  });

  function revealEverything() {
    var els = document.querySelectorAll("[data-reveal]");
    for (var i = 0; i < els.length; i++) els[i].classList.add("is-visible");
  }
  setTimeout(revealEverything, 5000);
  window.addEventListener("error", function () {
    revealEverything();
    try {
      document.body.style.overflow = "";
      var g = document.getElementById("gate");
      if (g) g.classList.add("is-gone");
      var m = document.getElementById("top");
      if (m) m.removeAttribute("inert");
    } catch (e) {}
  });

  function escapeHTML(str) {
    var d = document.createElement("div");
    d.textContent = str == null ? "" : String(str);
    return d.innerHTML;
  }

  var guest = "";
  try {
    var params = new URLSearchParams(window.location.search);
    guest = (params.get("n") || params.get("invitado") || "").trim();
    guest = guest.replace(/[<>{}\\\/]/g, "").slice(0, 40);
  } catch (e) {
    guest = "";
  }

  var REVEAL_FALLBACK = 1900;

  var gate = document.getElementById("gate");
  var scrollEl = document.getElementById("scroll");
  var gateType = document.getElementById("gateType");
  var gateTypeText = document.getElementById("gateTypeText");
  var mainEl = document.getElementById("top");
  var reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var guestWrap = document.getElementById("scrollGuestWrap");
  var guestEl = document.getElementById("scrollGuest");
  if (guest && guestWrap && guestEl) {
    guestEl.textContent = guest;
    if (guest.length > 16) guestEl.classList.add("is-long");
    guestWrap.hidden = false;
  }

  if (gateTypeText) {
    var txt = CONFIG.gateText;
    var idx = 0;
    (function type() {
      if (idx <= txt.length) {
        gateTypeText.textContent = txt.slice(0, idx);
        idx += 1;
        setTimeout(type, 55 + Math.random() * 65);
      } else if (gateType) {
        gateType.classList.add("is-done");
      }
    })();
  }

  function sparkle(c, x, y, s, rot) {
    c.save();
    c.translate(x, y);
    c.rotate(rot);
    c.beginPath();
    c.moveTo(0, -s);
    c.quadraticCurveTo(s * 0.14, -s * 0.14, s, 0);
    c.quadraticCurveTo(s * 0.14, s * 0.14, 0, s);
    c.quadraticCurveTo(-s * 0.14, s * 0.14, -s, 0);
    c.quadraticCurveTo(-s * 0.14, -s * 0.14, 0, -s);
    c.fill();
    c.restore();
  }

  function launchSparks() {
    if (reduceMotion) return;
    var cvs = document.createElement("canvas");
    cvs.className = "sparks";
    cvs.setAttribute("aria-hidden", "true");
    var ctx = cvs.getContext && cvs.getContext("2d");
    if (!ctx) return;
    document.body.appendChild(cvs);

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = window.innerWidth, H = window.innerHeight;
    cvs.width = Math.round(W * dpr);
    cvs.height = Math.round(H * dpr);
    ctx.scale(dpr, dpr);

    var cx = W / 2, cy = H / 2;
    var small = W < 600;
    var reach = Math.max(W, H);
    var COLORS = ["#FFF6D6", "#F6D77B", "#FFFFFF", "#E5D7C6", "#A9E8C6", "#6ACF9D"];
    var parts = [];
    var n = small ? 130 : 200;

    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2;
      var glitter = Math.random() < 0.35; // brillos lentos que caen
      var sp = glitter ? 1 + Math.random() * 4 : 3 + Math.pow(Math.random(), 0.7) * (small ? 13 : 19);
      parts.push({
        x: cx + Math.cos(a) * 12, y: cy + Math.sin(a) * 12,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (glitter ? 0 : 1.2),
        g: glitter ? 0.05 : 0.14,
        drag: glitter ? 0.985 : 0.955,
        size: glitter ? 2 + Math.random() * 4 : 3 + Math.random() * 7,
        star: Math.random() < 0.6,
        rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.2,
        age: 0, life: glitter ? 90 + Math.random() * 70 : 45 + Math.random() * 55,
        tw: Math.random() * 6.28,
        color: COLORS[(Math.random() * COLORS.length) | 0]
      });
    }

    var start = performance.now(), last = start;
    function frame(now) {
      var dt = Math.min((now - last) / 16.667, 3);
      last = now;
      var t = now - start;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";

      if (t < 500) {
        var f = 1 - t / 500; f *= f;
        var gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, reach * 0.45);
        gr.addColorStop(0, "rgba(255,244,205," + (0.6 * f) + ")");
        gr.addColorStop(0.4, "rgba(246,215,123," + (0.25 * f) + ")");
        gr.addColorStop(1, "rgba(246,215,123,0)");
        ctx.globalAlpha = 1;
        ctx.fillStyle = gr;
        ctx.fillRect(0, 0, W, H);
      }

      if (t < 900) {
        var k = t / 900, e = 1 - Math.pow(1 - k, 3);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = "rgba(255,240,190," + (0.6 * (1 - k)) + ")";
        ctx.lineWidth = 2 + 10 * (1 - k);
        ctx.beginPath();
        ctx.arc(cx, cy, e * reach * 0.6, 0, 6.283);
        ctx.stroke();
      }

      var alive = 0;
      for (var j = 0; j < parts.length; j++) {
        var p = parts[j];
        p.age += dt;
        if (p.age >= p.life) continue;
        alive++;
        var d = Math.pow(p.drag, dt);
        p.vx *= d;
        p.vy = p.vy * d + p.g * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;

        var life = p.age / p.life;
        var tw = 0.55 + 0.45 * Math.sin(p.tw + p.age * 0.35);
        var alpha = (life < 0.15 ? life / 0.15 : 1 - (life - 0.15) / 0.85) * tw;
        if (alpha <= 0) continue;
        var s = p.size * (1 - life * 0.4);

        ctx.fillStyle = p.color;
        if (p.star) {
          ctx.globalAlpha = alpha * 0.25;
          ctx.beginPath(); ctx.arc(p.x, p.y, s * 0.9, 0, 6.283); ctx.fill();
          ctx.globalAlpha = alpha;
          sparkle(ctx, p.x, p.y, s * 1.5, p.rot);
        } else {
          ctx.globalAlpha = alpha;
          ctx.beginPath(); ctx.arc(p.x, p.y, s * 0.45, 0, 6.283); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      if (t < 1000 || alive > 0) {
        requestAnimationFrame(frame);
      } else if (cvs.parentNode) {
        cvs.parentNode.removeChild(cvs);
      }
    }
    requestAnimationFrame(frame);
    
    setTimeout(function () { if (cvs.parentNode) cvs.parentNode.removeChild(cvs); }, 6000);
  }

  var opening = false, revealed = false, openedAt = 0, revealTimer = null;

  function setRevealWindow() {
    var sheet = scrollEl && scrollEl.querySelector(".sheet");
    if (!sheet) return;
    var r = sheet.getBoundingClientRect();
    var W = window.innerWidth, H = window.innerHeight;
    var st = document.body.style;
    st.setProperty("--rv-t", Math.max(0, r.top + window.scrollY) + "px");
    st.setProperty("--rv-l", Math.max(0, r.left) + "px");
    st.setProperty("--rv-r", Math.max(0, W - r.right) + "px");
    st.setProperty("--rv-b-vp", Math.max(0, H - r.bottom) + "px");
    st.setProperty("--rv-b-main", "calc(100% - " + Math.max(0, r.bottom + window.scrollY) + "px)");
  }

  function reveal(quiet) {
    if (revealed) return;
    revealed = true;
    clearTimeout(revealTimer);
    if (!quiet) {
      setRevealWindow();
      launchSparks();
      document.body.classList.add("is-revealing");
    }
    if (scrollEl) scrollEl.classList.add("is-releasing");
    if (gate) gate.classList.add("is-gone");
    document.body.style.overflow = "";
    if (mainEl) {
      mainEl.removeAttribute("inert");
      mainEl.setAttribute("tabindex", "-1");
      try { mainEl.focus({ preventScroll: true }); } catch (e) {}
    }
    setTimeout(function () {
      if (gate && gate.parentNode) gate.parentNode.removeChild(gate);
    }, 1600);
  }

  function openScroll() {
    if (!gate || !scrollEl) return;
    if (opening) {
      if (!revealed && Date.now() - openedAt > 700) reveal();
      return;
    }
    opening = true;
    openedAt = Date.now();
    gate.classList.add("is-opened");
    scrollEl.classList.add("is-open"); 
    if (navigator.vibrate) { try { navigator.vibrate(30); } catch (e) {} }
    var sheetWrapEl = scrollEl.querySelector(".sheetwrap");
    if (sheetWrapEl) {
      sheetWrapEl.addEventListener("transitionend", function (e) {
        if (e.target === sheetWrapEl && e.propertyName === "height") reveal();
      });
    }
    revealTimer = setTimeout(reveal, reduceMotion ? 700 : REVEAL_FALLBACK);
  }

  if (gate && scrollEl) {
    document.body.style.overflow = "hidden";
    
    if (mainEl) mainEl.setAttribute("inert", "");
    
    scrollEl.addEventListener("click", openScroll);
    
    setTimeout(function () {
      if (window.scrollY > 40 && !opening) { opening = true; reveal(true); }
    }, 400);
  }

  var heroScroll = document.getElementById("heroScroll");
  if (heroScroll) {
    heroScroll.addEventListener("click", function () {
      var t = document.getElementById("galeria");
      if (t) t.scrollIntoView({ behavior: "smooth" });
    });
  }

  var countdownEl = document.getElementById("countdown");
  if (countdownEl) {
    var eventDate = new Date(CONFIG.eventDateISO).getTime();
    var nums = {
      days: countdownEl.querySelector('[data-count="days"]'),
      hours: countdownEl.querySelector('[data-count="hours"]'),
      minutes: countdownEl.querySelector('[data-count="minutes"]'),
      seconds: countdownEl.querySelector('[data-count="seconds"]'),
    };
    function pad(n) {
      return String(Math.max(0, n)).padStart(2, "0");
    }

    var timer = null;

    function tick() {
      var diff = eventDate - Date.now();
      if (!isFinite(eventDate) || diff <= 0) {
        nums.days.textContent = "00";
        nums.hours.textContent = "00";
        nums.minutes.textContent = "00";
        nums.seconds.textContent = "00";
        if (timer) clearInterval(timer);
        return;
      }
      var days = Math.floor(diff / 86400000); diff -= days * 86400000;
      var hours = Math.floor(diff / 3600000); diff -= hours * 3600000;
      var minutes = Math.floor(diff / 60000); diff -= minutes * 60000;
      var seconds = Math.floor(diff / 1000);

      nums.days.textContent = pad(days);
      nums.hours.textContent = pad(hours);
      nums.minutes.textContent = pad(minutes);
      nums.seconds.textContent = pad(seconds);
    }
    tick();
    timer = setInterval(tick, 1000);
  }

  var VINE_PATH =
    "M 98 2 C 86 2, 80 7, 68 5 C 56 3, 46 8, 34 5 C 23 2, 11 4, 5 10 C 2 16, 3 24, 3.5 31 C 4 43, 2 53, 4 66 C 6 77, 2 89, 4 98";

  var LEAVES = [
    { t: 0.02, layer: "front", size: 1.05, tilt: 28 },
    { t: 0.05, layer: "back",  size: 0.85, tilt: -34 },
    { t: 0.09, layer: "front", size: 0.95, tilt: 22 },
    { t: 0.13, layer: "back",  size: 1.10, tilt: -20 },
    { t: 0.17, layer: "front", size: 0.80, tilt: 34 },
    { t: 0.21, layer: "back",  size: 1.00, tilt: -26 },
    { t: 0.25, layer: "front", size: 0.90, tilt: 18 },
    { t: 0.29, layer: "back",  size: 1.08, tilt: -30 },
    { t: 0.33, layer: "front", size: 0.86, tilt: 26 },
    { t: 0.37, layer: "back",  size: 0.98, tilt: -22 },
    { t: 0.41, layer: "front", size: 1.06, tilt: 30 },
    { t: 0.45, layer: "back",  size: 0.84, tilt: -28 },
    { t: 0.50, layer: "front", size: 0.94, tilt: 24 },
    { t: 0.54, layer: "back",  size: 1.02, tilt: -18 },
    { t: 0.58, layer: "front", size: 0.90, tilt: 28 },
    { t: 0.62, layer: "back",  size: 1.10, tilt: -24 },
    { t: 0.66, layer: "front", size: 0.85, tilt: 16 },
    { t: 0.70, layer: "back",  size: 0.95, tilt: -32 },
    { t: 0.75, layer: "front", size: 1.00, tilt: 22 },
    { t: 0.79, layer: "back",  size: 0.88, tilt: -26 },
    { t: 0.83, layer: "front", size: 1.05, tilt: 30 },
    { t: 0.88, layer: "back",  size: 0.92, tilt: -20 },
    { t: 0.93, layer: "front", size: 0.98, tilt: 25 },
    { t: 0.98, layer: "back",  size: 1.04, tilt: -22 }
  ];

  var SVGNS = "http://www.w3.org/2000/svg";

  function makeVineLayer(cls) {
    var wrap = document.createElement("div");
    wrap.className = "vine vine--" + cls;
    wrap.setAttribute("aria-hidden", "true");
    return wrap;
  }

  function plantVine(panelWrap) {
    var back = makeVineLayer("back");
    var front = makeVineLayer("front");

    var svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("class", "vine__svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("preserveAspectRatio", "none");
    var stem = document.createElementNS(SVGNS, "path");
    stem.setAttribute("class", "vine__stem");
    stem.setAttribute("d", VINE_PATH);
    svg.appendChild(stem);
    front.appendChild(svg);

    var total = 0;
    try {
      total = stem.getTotalLength();
    } catch (e) {
      total = 0;
    }
    if (!total) {
      stem.style.setProperty("--len", "300");
      panelWrap.insertBefore(back, panelWrap.firstChild);
      panelWrap.appendChild(front);
      return;
    }
    stem.style.setProperty("--len", total);

    var drawSecs =
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--vine-draw")) || 2.6;

    LEAVES.forEach(function (leaf) {
      var len = total * leaf.t;
      var p = stem.getPointAtLength(len);
      var p2 = stem.getPointAtLength(Math.min(total, len + 1));
      var angle = (Math.atan2(p2.y - p.y, p2.x - p.x) * 180) / Math.PI;

      var el = document.createElementNS(SVGNS, "svg");
      el.setAttribute("class", "vine__leaf");
      el.setAttribute("viewBox", "0 0 60 100");
      var use = document.createElementNS(SVGNS, "use");
      use.setAttribute("href", "#vineLeaf");
      el.appendChild(use);

      el.style.left = p.x + "%";
      el.style.top = p.y + "%";
      el.style.setProperty("--r", (angle + 90 + leaf.tilt).toFixed(1) + "deg");
      el.style.setProperty("--size", "clamp(30px, " + (6.4 * leaf.size).toFixed(1) + "vw, " + Math.round(58 * leaf.size) + "px)");
      el.style.setProperty("--delay", (leaf.t * drawSecs).toFixed(2) + "s");

      (leaf.layer === "back" ? back : front).appendChild(el);
    });

    panelWrap.insertBefore(back, panelWrap.firstChild);
    panelWrap.appendChild(front);
  }

  var vineWraps = document.querySelectorAll("[data-vine]");
  for (var v = 0; v < vineWraps.length; v++) plantVine(vineWraps[v]);

  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) {
            entries[i].target.classList.add("is-visible");
            if (entries[i].target.hasAttribute("data-vine")) {
              entries[i].target.classList.add("is-growing");
            }
            io.unobserve(entries[i].target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    for (var r = 0; r < revealEls.length; r++) io.observe(revealEls[r]);
  } else {
    revealEverything();
    for (var w = 0; w < vineWraps.length; w++) vineWraps[w].classList.add("is-growing");
  }

  var galleryInner = document.querySelector(".gallery-inner");
  var galleryCards = document.querySelectorAll(".gallery-card");
  var galleryWrapper = document.querySelector(".gallery-wrapper");

  if (galleryInner && galleryCards.length) {
    for (var i = 0; i < galleryCards.length; i++) {
      galleryCards[i].addEventListener("click", function (e) {
        e.stopPropagation();
        var isLifted = this.classList.contains("is-lifted");

        for (var j = 0; j < galleryCards.length; j++) {
          galleryCards[j].classList.remove("is-lifted");
        }

        if (isLifted) {
          galleryInner.classList.remove("is-paused");
        } else {
          this.classList.add("is-lifted");
          galleryInner.classList.add("is-paused");
        }
      });
    }

    if (galleryWrapper) {
      galleryWrapper.addEventListener("click", function () {
        for (var j = 0; j < galleryCards.length; j++) {
          galleryCards[j].classList.remove("is-lifted");
        }
        galleryInner.classList.remove("is-paused");
      });
    }
  }

  var rsvpForm = document.getElementById("rsvpForm");
  var nombreInput = document.getElementById("nombreInput");
  var nameAdd = document.getElementById("nameAdd");
  var nameTags = document.getElementById("nameTags");
  var formError = document.getElementById("formError");
  var nombres = [];

  function showError(msg) {
    if (!formError) return;
    formError.textContent = msg;
    formError.hidden = false;
  }
  function clearError() {
    if (formError) formError.hidden = true;
  }

  function renderTags() {
    if (!nameTags) return;
    nameTags.innerHTML = "";
    nombres.forEach(function (nombre, i) {
      var li = document.createElement("li");
      li.className = "name-tag";

      var txt = document.createElement("span");
      txt.textContent = nombre;

      var x = document.createElement("button");
      x.type = "button";
      x.className = "name-tag__x";
      x.setAttribute("aria-label", "Quitar a " + nombre);
      x.textContent = "×";
      x.addEventListener("click", function () {
        li.classList.add("is-leaving");
        setTimeout(function () {
          nombres.splice(i, 1);
          renderTags();
        }, 260);
      });

      li.appendChild(txt);
      li.appendChild(x);
      nameTags.appendChild(li);
    });
  }

  function refreshPlus() {
    if (!nameAdd || !nombreInput) return;
    nameAdd.classList.toggle("is-ready", nombreInput.value.trim().length > 1);
  }

  function addNombre() {
    if (!nombreInput) return;
    var val = nombreInput.value.trim().replace(/\s+/g, " ");
    if (val.length < 2) return;

    var yaEsta = nombres.some(function (n) {
      return n.toLowerCase() === val.toLowerCase();
    });
    if (!yaEsta) nombres.push(val);

    nombreInput.value = "";
    refreshPlus();
    renderTags();
    clearError();
    nombreInput.focus();
  }

  if (nombreInput && nameAdd) {
    nombreInput.addEventListener("input", refreshPlus);
    nameAdd.addEventListener("click", addNombre);
    nombreInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        addNombre();
      }
    });
    if (guest) {
      nombreInput.value = guest;
      refreshPlus();
    }
  }

  var menoresCheck = document.getElementById("menoresCheck");
  var menoresCount = document.getElementById("menoresCount");
  var menoresNum = document.getElementById("menoresNum");
  var menoresMinus = document.getElementById("menoresMinus");
  var menoresPlus = document.getElementById("menoresPlus");

  function clampMenores(n) {
    n = parseInt(n, 10);
    if (isNaN(n) || n < 0) n = 0;
    if (n > 20) n = 20;
    return n;
  }
  if (menoresCheck && menoresCount) {
    menoresCheck.addEventListener("change", function () {
      menoresCount.hidden = !menoresCheck.checked;
    });
  }
  if (menoresMinus && menoresPlus && menoresNum) {
    menoresMinus.addEventListener("click", function () {
      menoresNum.value = clampMenores(menoresNum.value) - 1 < 0 ? 0 : clampMenores(menoresNum.value) - 1;
    });
    menoresPlus.addEventListener("click", function () {
      menoresNum.value = clampMenores(clampMenores(menoresNum.value) + 1);
    });
    menoresNum.addEventListener("change", function () {
      menoresNum.value = clampMenores(menoresNum.value);
    });
  }

  function buildWhatsAppLink(message) {
    return "https://wa.me/" + CONFIG.whatsappNumber + "?text=" + encodeURIComponent(message);
  }

  if (rsvpForm) {
    rsvpForm.addEventListener("submit", function (e) {
      e.preventDefault();

      if (nombreInput && nombreInput.value.trim().length > 1) addNombre();

      if (!nombres.length) {
        showError("Agregá al menos un nombre con el botón +.");
        if (nombreInput) nombreInput.focus();
        return;
      }

      var momento = rsvpForm.querySelector('input[name="momento"]:checked');
      if (!momento) {
        showError("Contanos si venís a la cena o al brindis.");
        return;
      }
      clearError();

      var alimentacion = (document.getElementById("alimentacion") || {}).value || "";
      alimentacion = alimentacion.trim();

      var lineas = ["¡Hola! Confirmamos asistencia a los 15 de Yamila 🎉", ""];

      if (nombres.length === 1) {
        lineas.push("Nombre: " + nombres[0]);
      } else {
        lineas.push("Vamos " + nombres.length + " personas:");
        nombres.forEach(function (n, i) {
          lineas.push(i + 1 + ". " + n);
        });
      }

      if (menoresCheck && menoresCheck.checked) {
        var cant = clampMenores(menoresNum ? menoresNum.value : 0);
        if (cant > 0) {
          lineas.push(
            "Menores (hasta " + CONFIG.edadMaximaMenor + " años): " + cant
          );
        }
      }

      lineas.push("Asistimos a: " + momento.value);
      lineas.push(
        alimentacion
          ? "Inconveniente alimenticio: " + alimentacion
          : "Sin inconvenientes alimenticios"
      );

      window.open(buildWhatsAppLink(lineas.join("\n")), "_blank", "noopener");
    });
  }

  var musicForm = document.getElementById("musicForm");
  var songList = document.getElementById("songList");
  var SONGS_KEY = "yamila-xv-songs";

  function loadSongs() {
    try {
      return JSON.parse(localStorage.getItem(SONGS_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }
  function saveSongs(songs) {
    try {
      localStorage.setItem(SONGS_KEY, JSON.stringify(songs));
    } catch (e) {}
  }

  function renderSongs() {
    if (!songList) return;
    var songs = loadSongs();
    songList.innerHTML = "";

    if (!songs.length) {
      var empty = document.createElement("li");
      empty.className = "song-list__empty";
      empty.textContent = "Todavía no hay canciones sugeridas. ¡Sumá la primera!";
      songList.appendChild(empty);
      return;
    }

    songs
      .slice()
      .reverse()
      .forEach(function (s) {
        var li = document.createElement("li");

        var text = document.createElement("span");
        text.innerHTML =
          "<strong>" + escapeHTML(s.song) + "</strong>" +
          (s.artist ? " — " + escapeHTML(s.artist) : "") +
          ' <span style="opacity:.6">· pedido por ' + escapeHTML(s.name) + "</span>";

        var link = document.createElement("a");
        link.className = "song-list__link";
        link.href =
          "https://open.spotify.com/search/" +
          encodeURIComponent([s.song, s.artist].filter(Boolean).join(" "));
        link.target = "_blank";
        link.rel = "noopener";
        link.textContent = "Abrir en Spotify";

        li.appendChild(text);
        li.appendChild(link);
        songList.appendChild(li);
      });
  }

  if (musicForm) {
    renderSongs();
    var songGuestName = document.getElementById("songGuestName");
    if (songGuestName && guest) songGuestName.value = guest;

    musicForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("songGuestName").value.trim();
      var song = document.getElementById("songName").value.trim();
      var artist = document.getElementById("songArtist").value.trim();
      if (!name || !song) return;

      var songs = loadSongs();
      songs.push({ name: name, song: song, artist: artist, ts: Date.now() });
      saveSongs(songs);
      renderSongs();

      document.getElementById("songName").value = "";
      document.getElementById("songArtist").value = "";
    });
  }

  function addSparkles(selector, count) {
    var container = document.querySelector(selector);
    if (!container) return;
    for (var i = 0; i < count; i++) {
      var s = document.createElement("div");
      s.className = "sparkle";
      s.style.left = Math.random() * 100 + "%";
      s.style.top = Math.random() * 100 + "%";
      s.style.animationDelay = (Math.random() * 4) + "s";
      container.appendChild(s);
    }
  }
  
  addSparkles(".hero", 30);
  addSparkles("#ubicacion .glass-panel", 15);
  addSparkles("#musica .glass-panel", 15);
  addSparkles("#confirmar .glass-panel", 15);

  (function meadow() {
    var host = document.getElementById("footerFlowers");
    var row = document.getElementById("ffRow");
    var main = document.getElementById("ffMain");
    if (!host || !row || !main) return;

    var SIZES = [2.3, 1.15, 1.75, 1.0, 1.4, 0.9, 1.15];
    var STAGGER = 0.45;

    var proto = main.cloneNode(true);
    var builtFor = 0;

    function countFor(w) {
      if (w < 520) return 5;
      if (w < 980) return 7;
      if (w < 1700) return 9;
      if (w < 2200) return 11;
      return 13;
    }

    function desync(el, seed) {
      if (!el.getAnimations) return;
      try {
        var anims = el.getAnimations({ subtree: true });
        for (var k = 0; k < anims.length; k++) {
          var t = anims[k].effect && anims[k].effect.getComputedTiming();
          if (t && t.iterations === Infinity) {
            anims[k].currentTime =
              (anims[k].currentTime || 0) + (((seed * 0.83 + k * 0.07) % 3.4) * 1000);
          }
        }
      } catch (e) {}
    }

    function build(n) {
      var c = (n - 1) / 2;
      var slot = 100 / n;
      row.innerHTML = "";
      host.style.setProperty("--main-w", (SIZES[0] * slot).toFixed(2));

      for (var i = 0; i < n; i++) {
        var d = Math.abs(i - c);
        var el = proto.cloneNode(true);
        var big = d % 2 === 0;

        el.removeAttribute("id");
        el.style.setProperty("--w", (SIZES[d] * slot).toFixed(2));
        el.style.setProperty("--x", ((i + 0.5) * slot).toFixed(2));
        el.style.setProperty("--z", d === 0 ? 10 : big ? 6 : 2);
        el.style.setProperty("--fd", (d * STAGGER).toFixed(2) + "s");
        if (d === 0) el.id = "ffMain";
        else {
          if (!big) el.classList.add("fb--small");
          if (i % 2 === 1) el.classList.add("fb--mirror");
        }
        row.appendChild(el);
        if (d !== 0) desync(el, i + 1);
      }
      buildFireflies(n);
      builtFor = n;
    }

    var fly = document.getElementById("ffFireflies");
    function rnd(a, b) { return a + Math.random() * (b - a); }
    function buildFireflies(n) {
      if (!fly) return;
      fly.innerHTML = "";
      var count = n * 4;
      for (var i = 0; i < count; i++) {
        var f = document.createElement("span");
        f.className = "firefly";
        var st = f.style;
        st.setProperty("--fx", rnd(1, 99).toFixed(1) + "%");
        st.setProperty("--fy", rnd(6, 92).toFixed(1) + "%");
        st.setProperty("--fs", rnd(0.35, 0.75).toFixed(2));
        st.setProperty("--fdx", rnd(-5, 5).toFixed(1));
        st.setProperty("--fdy", rnd(2, 7).toFixed(1));
        st.setProperty("--fdur", rnd(9, 20).toFixed(1) + "s");
        st.setProperty("--fblink", rnd(2.6, 6).toFixed(1) + "s");
        st.setProperty("--fdelay", "-" + rnd(0, 14).toFixed(1) + "s");
        st.setProperty("--fc", Math.random() < 0.7 ? "255,244,140" : "170,255,190");
        fly.appendChild(f);
      }
    }

    function refresh() {
      var n = countFor(host.clientWidth || window.innerWidth);
      if (n !== builtFor) build(n);
    }

    refresh();

    var rT;
    window.addEventListener("resize", function () {
      clearTimeout(rT);
      rT = setTimeout(refresh, 150);
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        function (entries) {
          var on = entries[0].isIntersecting;
          host.classList.toggle("is-live", on);
          if (on) host.classList.add("is-seen");
        },
        { threshold: 0.08 }
      ).observe(host);
    } else {
      host.classList.add("is-live", "is-seen");
    }
  })();

})();