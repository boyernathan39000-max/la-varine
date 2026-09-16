/* ═══════════════════════════════════════════════
   Rest'O Bar La Varine — interactions
   Aucune dépendance.
   ═══════════════════════════════════════════════ */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── Horaires : source unique de vérité ───
     Clés = jour JS (0 = dimanche). Valeurs = créneaux [début, fin] en minutes. */
  var HORAIRES = {
    0: [[720, 900], [1080, 1320]],  // dimanche  12:00–15:00 · 18:00–22:00
    1: [],                          // lundi     fermé
    2: [],                          // mardi     fermé
    3: [[1080, 1320]],              // mercredi  18:00–22:00
    4: [[1080, 1320]],              // jeudi     18:00–22:00
    5: [[720, 900], [1080, 1320]],  // vendredi  12:00–15:00 · 18:00–22:00
    6: [[720, 900], [1080, 1320]]   // samedi    12:00–15:00 · 18:00–22:00
  };
  var JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

  /* Heure locale de Paris, quel que soit le fuseau du visiteur */
  function maintenantParis() {
    var f = new Intl.DateTimeFormat('fr-FR', {
      timeZone: 'Europe/Paris', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
    });
    var p = {};
    f.formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
    var idx = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam']
      .indexOf(p.weekday.toLowerCase().replace('.', '').slice(0, 3));
    return { jour: idx, min: parseInt(p.hour, 10) * 60 + parseInt(p.minute, 10) };
  }

  function hhmm(m) {
    m = ((m % 1440) + 1440) % 1440;
    return String(Math.floor(m / 60)).padStart(2, '0') + 'h' + String(m % 60).padStart(2, '0');
  }

  /* Prochaine ouverture, en partant d'aujourd'hui */
  function prochaine(jour, min) {
    for (var d = 0; d < 8; d++) {
      var j = (jour + d) % 7;
      var slots = HORAIRES[j];
      for (var i = 0; i < slots.length; i++) {
        if (d > 0 || slots[i][0] > min) {
          var quand = d === 0 ? "aujourd'hui" : (d === 1 ? 'demain' : JOURS[j]);
          return quand + ' à ' + hhmm(slots[i][0]);
        }
      }
    }
    return null;
  }

  function majStatut() {
    var dot = $('#statut-dot'), txt = $('#statut-txt');
    if (!dot || !txt) return;
    var n = maintenantParis();
    if (n.jour < 0) return;                      // fuseau non résolu : on garde le texte par défaut
    var ouvert = null;
    (HORAIRES[n.jour] || []).forEach(function (s) {
      if (n.min >= s[0] && n.min < s[1]) ouvert = s;
    });

    if (ouvert) {
      dot.classList.remove('is-off');
      var reste = ouvert[1] - n.min;
      txt.textContent = reste <= 60
        ? 'Ouvert · ferme à ' + hhmm(ouvert[1])
        : 'Ouvert jusqu’à ' + hhmm(ouvert[1]);
    } else {
      dot.classList.add('is-off');
      var p = prochaine(n.jour, n.min);
      txt.textContent = p ? 'Fermé · ouvre ' + p : 'Fermé actuellement';
    }

    /* Surligne la ligne du jour dans le tableau */
    $$('#hrs tr').forEach(function (tr) {
      tr.classList.toggle('is-today', Number(tr.dataset.d) === n.jour);
    });
  }

  /* ─── En-tête : fond au scroll ─── */
  var hdr = $('#hdr');
  function majHeader() {
    if (hdr) hdr.classList.toggle('is-stuck', window.scrollY > 40);
  }

  /* ─── Menu mobile ─── */
  var burger = $('#burger'), menuMob = $('#menu-mob');
  if (burger && menuMob) {
    burger.addEventListener('click', function () {
      var ouvert = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!ouvert));
      menuMob.hidden = ouvert;
      menuMob.classList.toggle('is-open', !ouvert);
      hdr.classList.toggle('is-open', !ouvert);
    });
    $$('a', menuMob).forEach(function (a) {
      a.addEventListener('click', function () {
        burger.setAttribute('aria-expanded', 'false');
        menuMob.hidden = true;
        menuMob.classList.remove('is-open');
        hdr.classList.remove('is-open');
      });
    });
  }

  /* ─── Diaporama du héros ─── */
  var slides = $$('.hero__slide');
  if (slides.length > 1 && !reduce) {
    var k = 0;
    setInterval(function () {
      slides[k].classList.remove('is-on');
      k = (k + 1) % slides.length;
      slides[k].classList.add('is-on');
    }, 6000);
  }

  /* ─── Onglets de la carte ─── */
  var onglets = $$('.tabs__btns [role="tab"]');
  function activer(btn) {
    onglets.forEach(function (b) {
      var actif = b === btn;
      b.setAttribute('aria-selected', String(actif));
      b.classList.toggle('is-on', actif);
      var panneau = document.getElementById(b.getAttribute('aria-controls'));
      if (panneau) { panneau.hidden = !actif; panneau.classList.toggle('is-on', actif); }
    });
  }
  onglets.forEach(function (btn, i) {
    btn.addEventListener('click', function () { activer(btn); });
    btn.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var suiv = onglets[(i + d + onglets.length) % onglets.length];
      suiv.focus(); activer(suiv);
    });
  });

  /* ─── Révélations au scroll ─── */
  var aReveler = $$('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    aReveler.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); obs.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    aReveler.forEach(function (el) { obs.observe(el); });
  }

  /* ─── Lightbox de la galerie ─── */
  var lb = $('#lb'), lbImg = $('#lb-img');
  var photos = $$('#gal img');
  var courant = 0;

  function montrer(i) {
    courant = (i + photos.length) % photos.length;
    var img = photos[courant];
    lbImg.src = img.dataset.full || img.src;
    lbImg.alt = img.alt;
  }
  if (lb && lbImg && photos.length) {
    photos.forEach(function (img, i) {
      img.parentElement.addEventListener('click', function () {
        montrer(i);
        if (typeof lb.showModal === 'function') lb.showModal(); else lb.setAttribute('open', '');
      });
    });
    $('#lb-x').addEventListener('click', function () { lb.close(); });
    $('#lb-next').addEventListener('click', function () { montrer(courant + 1); });
    $('#lb-prev').addEventListener('click', function () { montrer(courant - 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.open) return;
      if (e.key === 'ArrowRight') montrer(courant + 1);
      if (e.key === 'ArrowLeft') montrer(courant - 1);
    });
  }

  /* ─── Formulaire de réservation → e-mail pré-rempli ───
     Sans backend. Pour un vrai envoi serveur, voir README (Formspree). */
  var form = $('#form-resa');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var d = new FormData(form);
      var corps = [
        'Bonjour,',
        '',
        'Je souhaite réserver une table.',
        '',
        'Nom : ' + (d.get('nom') || ''),
        'Téléphone : ' + (d.get('tel') || ''),
        'Quand / combien : ' + (d.get('quand') || ''),
        (d.get('msg') ? 'Précisions : ' + d.get('msg') : ''),
        '',
        'Merci !'
      ].filter(Boolean).join('\n');

      window.location.href = 'mailto:lavarine.restobar@gmail.com'
        + '?subject=' + encodeURIComponent('Demande de réservation — ' + (d.get('nom') || ''))
        + '&body=' + encodeURIComponent(corps);
    });
  }

  /* ─── Divers ─── */
  var an = $('#year');
  if (an) an.textContent = new Date().getFullYear();

  majStatut();
  majHeader();
  setInterval(majStatut, 60000);
  window.addEventListener('scroll', majHeader, { passive: true });
})();
