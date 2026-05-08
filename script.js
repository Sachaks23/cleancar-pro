/* 
   NAV HTML (kept for reference only)
 */
const NAV_HTML = `
<nav id="navbar"> <div class="nav-inner"> <a href="index.html" class="logo"> <img src="logo.png" alt="CleanCar Pro" class="logo-img" /> </a> <ul class="nav-links"> <li><a href="index.html">Accueil</a></li> <li><a href="offres.html">Offres</a></li> <li><a href="tarifs.html">Tarifs</a></li> <li><a href="avant-apres.html">Avant / Après</a></li> <li><a href="rendez-vous.html">Rendez-vous</a></li> </ul> <a href="rendez-vous.html" class="nav-cta">Prendre RDV →</a> <button class="burger" id="burgerBtn" aria-label="Menu"> <span></span><span></span><span></span> </button> </div> <div class="mobile-nav" id="mobileNav"> <a href="index.html">Accueil</a> <a href="offres.html">Offres</a> <a href="tarifs.html">Tarifs</a> <a href="avant-apres.html">Avant / Après</a> <a href="rendez-vous.html">Rendez-vous</a> <a href="rendez-vous.html" class="mobile-cta-link">Prendre RDV →</a> </div>
</nav>`;

const FOOTER_HTML = `
<footer id="site-footer"> <div class="container"> <div class="footer-top"> <div class="footer-brand"> <a href="index.html" class="logo logo-footer"> <img src="logo.png" alt="CleanCar Pro" class="logo-img footer-logo-img" /> </a> <p>Service de detailing et lavage automobile professionnel. Disponible 7j/7 pour sublimer votre véhicule.</p> <div class="footer-open"><span class="live-dot"></span> Ouvert aujourd'hui · 10h00 – 22h00</div> </div> <div class="footer-col"> <h5>Prestations</h5> <ul> <li><a href="offres.html">Lavage Essentiel</a></li> <li><a href="offres.html">Detailing Premium</a></li> <li><a href="offres.html">Pack Prestige</a></li> <li><a href="tarifs.html">Grille tarifaire</a></li> </ul> </div> <div class="footer-col"> <h5>Informations</h5> <ul> <li><a href="avant-apres.html">Avant / Après</a></li> <li><a href="rendez-vous.html">Prendre RDV</a></li> <li>Lun – Dim : 10h – 22h</li> <li>Jours fériés inclus</li> </ul> </div> <div class="footer-col"> <h5>Paiement</h5> <ul> <li> Carte bancaire</li> <li> Espèces</li> <li> Sur place uniquement</li> </ul> <a href="rendez-vous.html" class="footer-rdv">Réserver →</a> </div> </div> <div class="footer-bottom"> <span>© 2025 CleanCar Pro — Tous droits réservés</span> <span>Fait avec  pour les passionnés d'automobile</span> </div> </div>
</footer>`;

document.addEventListener('DOMContentLoaded', () => {
  if (typeof emailjs !== 'undefined') emailjs.init({ publicKey: EJS_PUBLIC_KEY });
  initNavbar();
  initReveal();
  initStats();
  if (document.getElementById('daySelector')) { initCalendar(); initFirebase(); }
  if (document.querySelector('.slider-wrap')) initSliders();
  if (document.getElementById('reviewForm')) initReviews();
});

/* 
   NAVBAR
 */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => navbar.classList.toggle('solid', scrollY > 50));
  const burger = document.getElementById('burgerBtn');
  const mobileNav = document.getElementById('mobileNav');
  if (burger && mobileNav) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      mobileNav.classList.toggle('show');
    });
    mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      burger.classList.remove('open');
      mobileNav.classList.remove('show');
    }));
  }
}

/* 
   REVEAL ON SCROLL
 */
function initReveal() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 80);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
}

/* 
   STATS COUNTER
 */
function initStats() {
  const stats = document.querySelectorAll('.stat-n[data-target]');
  if (!stats.length) return;
  let done = false;
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !done) {
      done = true;
      stats.forEach(el => {
        const target = +el.dataset.target;
        const dur = target > 100 ? 1600 : target > 10 ? 1200 : 900;
        const start = performance.now();
        const tick = now => {
          const p = Math.min((now - start) / dur, 1);
          el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target);
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = target;
        };
        requestAnimationFrame(tick);
      });
    }
  }, { threshold: 0.3 });
  const statsBar = document.querySelector('.stats-bar');
  if (statsBar) obs.observe(statsBar);
}

/* ────────────────────────────────────────────
   FIREBASE CONFIG  ← remplace par tes vraies valeurs
──────────────────────────────────────────── */
const FIREBASE_CONFIG = {
  apiKey:            'AIzaSyDUR7Ama1bxt1rYSEPy4_UkOA5i29ZtHBg',
  authDomain:        'cleancar-pro.firebaseapp.com',
  databaseURL:       'https://cleancar-pro-default-rtdb.europe-west1.firebasedatabase.app',
  projectId:         'cleancar-pro',
  storageBucket:     'cleancar-pro.firebasestorage.app',
  messagingSenderId: '249612571062',
  appId:             '1:249612571062:web:6a0dc70083507c15f37117'
};

let db = null;
let bookedSlots = {}; // { "2024-01-15_10:00": { ... } }

// Retourne la date réelle (YYYY-MM-DD) pour un jour, en tenant compte du weekOffset
function getDateForDay(dayName) {
  const map = { 'Lun': 1, 'Mar': 2, 'Mer': 3, 'Jeu': 4, 'Ven': 5, 'Sam': 6, 'Dim': 0 };
  const today    = new Date();
  const todayDay = today.getDay();
  const mondayDiff = todayDay === 0 ? -6 : 1 - todayDay;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayDiff + weekOffset * 7);
  const targetOff = map[dayName] === 0 ? 6 : map[dayName] - 1;
  const d = new Date(monday);
  d.setDate(monday.getDate() + targetOff);
  return d.toISOString().split('T')[0];
}

function getFirstAvailableDay() {
  const todayStr = new Date().toISOString().split('T')[0];
  return DAYS.find(d => getDateForDay(d) >= todayStr) || DAYS[0];
}

// Nom court du jour d'aujourd'hui
function getTodayDayName() {
  return ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'][new Date().getDay()];
}

// Utilitaire Firebase réutilisable sur toutes les pages
function getFirebaseDb(callback) {
  if (typeof firebase === 'undefined' || FIREBASE_CONFIG.apiKey === 'FIREBASE_API_KEY') return;
  try {
    if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    callback(firebase.database());
  } catch(e) { console.warn('Firebase error:', e); }
}

function initFirebase() {
  if (!document.getElementById('daySelector')) return;
  getFirebaseDb(database => {
    db = database;
    db.ref('bookings').on('value', snapshot => {
      bookedSlots = snapshot.val() || {};
      refreshSlotAvailability();
    });
  });
}

function generateToken() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function saveBookingToFirebase(day, time, data) {
  if (!db) return;
  const date = getDateForDay(day);
  const slotKey = `${date}_${time}`;
  db.ref(`bookings/${slotKey}`).set(data);
  if (is2h()) {
    const nextKey = `${date}_${addHour(time, 1)}`;
    db.ref(`bookings/${nextKey}`).set({ ...data, mainSlot: slotKey });
  }
}

/*
   CALENDAR (Rendez-vous)
 */
const DAYS  = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
const TIMES = Array.from({length: 12}, (_, i) => `${String(10 + i).padStart(2,'0')}:00`);
// 10:00 → 21:00 (créneaux d'1h, dernier départ 21h = fin 22h)

let selDay = getTodayDayName(), selTime = null, weekOffset = 0;

function is2h() {
  const offre = document.getElementById('offre');
  return offre && offre.value === 'Intérieur & Extérieur';
}

function addHour(time, n) {
  const h = parseInt(time.split(':')[0], 10);
  return `${String(h + n).padStart(2,'0')}:00`;
}

function buildDayButtons() {
  const daySel = document.getElementById('daySelector');
  if (!daySel) return;
  daySel.innerHTML = '';
  const todayStr = new Date().toISOString().split('T')[0];

  DAYS.forEach(day => {
    const date  = getDateForDay(day);
    const d     = new Date(date + 'T12:00:00');
    const dd    = String(d.getDate()).padStart(2,'0');
    const mm    = String(d.getMonth() + 1).padStart(2,'0');
    const isPast = date < todayStr;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.innerHTML = `<span class="day-name">${day}</span><span class="day-date">${dd}/${mm}</span>`;

    if (isPast) {
      btn.className = 'day-btn day-past';
      btn.disabled  = true;
    } else {
      btn.className = 'day-btn' + (day === selDay ? ' active' : '');
      btn.addEventListener('click', () => {
        document.querySelectorAll('.day-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selDay = day;
        selTime = null;
        clearTimeSelection();
        refreshSlotAvailability();
      });
    }
    daySel.appendChild(btn);
  });

  // Mettre à jour le label de semaine et l'état des flèches
  const monDate = getDateForDay('Lun');
  const sunDate = getDateForDay('Dim');
  const fmt = str => { const d = new Date(str + 'T12:00:00'); return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`; };
  const lbl = document.getElementById('weekLabel');
  if (lbl) lbl.textContent = `${fmt(monDate)} – ${fmt(sunDate)}`;
  const prevBtn = document.getElementById('prevWeek');
  if (prevBtn) prevBtn.disabled = weekOffset === 0;
}

function initCalendar() {
  const daySel   = document.getElementById('daySelector');
  const timeGrid = document.getElementById('timeGrid');
  if (!daySel || !timeGrid) return;

  // Navigation semaine (flèches)
  daySel.insertAdjacentHTML('beforebegin', `
    <div class="week-nav">
      <button class="week-arrow" id="prevWeek" type="button" disabled>&#8592;</button>
      <span class="week-label" id="weekLabel"></span>
      <button class="week-arrow" id="nextWeek" type="button">&#8594;</button>
    </div>`);

  document.getElementById('prevWeek').addEventListener('click', () => {
    if (weekOffset === 0) return;
    weekOffset--;
    selTime = null;
    clearTimeSelection();
    if (weekOffset === 0) selDay = getFirstAvailableDay();
    buildDayButtons();
    refreshSlotAvailability();
  });

  document.getElementById('nextWeek').addEventListener('click', () => {
    weekOffset++;
    selTime = null;
    clearTimeSelection();
    buildDayButtons();
    refreshSlotAvailability();
  });

  // Construire les boutons jours
  buildDayButtons();

  // Créneaux
  TIMES.forEach((t, idx) => {
    const btn = document.createElement('button');
    btn.className = 'time-btn'; btn.textContent = t; btn.type = 'button';
    btn.dataset.idx = idx;
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      clearTimeSelection();
      btn.classList.add('active');
      // Si formule 2h → colorier aussi le créneau suivant
      if (is2h()) {
        const next = timeGrid.querySelector(`[data-idx="${idx + 1}"]`);
        if (next) next.classList.add('active-2h');
      }
      selTime = t; updateRecap();
    });
    timeGrid.appendChild(btn);
  });

  // Écouter le changement de formule
  const offreEl = document.getElementById('offre');
  if (offreEl) {
    offreEl.addEventListener('change', () => {
      refreshSlotAvailability();
      updateRecap();
    });
  }
}

function clearTimeSelection() {
  document.querySelectorAll('.time-btn').forEach(b => {
    b.classList.remove('active', 'active-2h');
  });
}

function refreshSlotAvailability() {
  const btns = [...document.querySelectorAll('.time-btn')];
  const twoH = is2h();
  const slotDate = getDateForDay(selDay);

  const nowTodayStr   = new Date().toISOString().split('T')[0];
  const isToday       = slotDate === nowTodayStr;
  const currentHour   = new Date().getHours();

  btns.forEach((btn, idx) => {
    const slotKey   = `${slotDate}_${btn.textContent}`;
    const nextBtn   = btns[idx + 1];
    const nextKey   = nextBtn ? `${slotDate}_${nextBtn.textContent}` : null;
    const slotHour  = parseInt(btn.textContent.split(':')[0]);

    const isBooked     = !!bookedSlots[slotKey];
    const nextIsBooked = !!(twoH && nextKey && bookedSlots[nextKey]);
    const isLastFor2h  = twoH && idx === btns.length - 1;
    const isPastSlot   = isToday && slotHour <= currentHour;

    btn.disabled = isBooked || nextIsBooked || isLastFor2h || isPastSlot;
    btn.classList.toggle('booked', isBooked && !isPastSlot);
    if (btn.disabled) btn.classList.remove('active', 'active-2h');
  });

  // Si créneau sélectionné est devenu indisponible → reset
  if (selTime) {
    const selKey = `${slotDate}_${selTime}`;
    if (bookedSlots[selKey]) { selTime = null; clearTimeSelection(); }
  }
  // Si formule 2h et dernier créneau sélectionné → reset
  if (twoH && selTime === '21:00') { selTime = null; clearTimeSelection(); }

  // Rafraîchir le 2h highlight
  if (selTime && twoH) {
    const active = [...btns].find(b => b.textContent === selTime);
    if (active) {
      const next = active.nextElementSibling;
      if (next && next.classList.contains('time-btn')) next.classList.add('active-2h');
    }
  }
  if (selTime && !twoH) btns.forEach(b => b.classList.remove('active-2h'));

  updateRecap();
}

function updateRecap() {
  const el = document.getElementById('slotRecapText');
  if (!el) return;
  if (selDay && selTime) {
    const duree   = is2h() ? 2 : 1;
    const end     = addHour(selTime, duree);
    const date    = getDateForDay(selDay);
    const d       = new Date(date + 'T12:00:00');
    const dateStr = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    el.textContent = `${selDay} ${dateStr} · ${selTime} – ${end} (${duree}h)`;
  } else if (selDay) {
    el.textContent = `${selDay} — choisissez un horaire`;
  } else {
    el.textContent = 'Sélectionnez un créneau';
  }
}

/* ────────────────────────────────────────────
   EMAILJS CONFIG  ← remplace par tes vraies clés
──────────────────────────────────────────── */
const EJS_PUBLIC_KEY      = 'YAxxJAqL2jwqZg6eG';
const EJS_SERVICE_ID      = 'service_djgawdr';
const EJS_TEMPLATE_OWNER  = 'template_idwpncl';   // notif à toi
const EJS_TEMPLATE_CLIENT = 'template_derwsbl';  // confirmation au client

function submitForm(e) {
  e.preventDefault();

  const prenom   = document.getElementById('prenom')?.value.trim()   || '';
  const nom      = document.getElementById('nom')?.value.trim()       || '';
  const tel      = document.getElementById('tel')?.value.trim()       || '';
  const email    = document.getElementById('email')?.value.trim()     || '';
  const vehicule = document.getElementById('vehicule')?.value         || '';
  const offre    = document.getElementById('offre')?.value            || '';
  const marque   = document.getElementById('marque')?.value.trim()    || '';
  const message  = document.getElementById('message')?.value.trim()   || '';
  const creneau  = document.getElementById('slotRecapText')?.textContent || '';

  // Générer le token d'annulation AVANT l'envoi email pour l'inclure dedans
  let cancelToken = '';
  let cancelUrl   = '';
  if (selDay && selTime) {
    cancelToken = generateToken();
    const date  = getDateForDay(selDay);
    const slotKey = `${date}_${selTime}`;
    cancelUrl = `${window.location.origin}/annuler.html?id=${encodeURIComponent(slotKey)}&token=${cancelToken}`;
  }

  const btn = document.querySelector('#resaForm .btn-submit');
  btn.textContent = 'Envoi en cours…';
  btn.disabled = true;

  // Variables date/heure
  const rdv_date     = (selDay && selTime) ? getDateForDay(selDay) : '';
  const rdv_time     = selTime || '';
  const rdv_end_time = selTime ? addHour(selTime, is2h() ? 2 : 1) : '';

  // Lien Google Agenda cliquable dans l'email owner
  let calendar_link = '';
  if (rdv_date && rdv_time) {
    const dc  = rdv_date.replace(/-/g, '');                    // 20250509
    const ts  = rdv_time.replace(':', '') + '00';              // 100000
    const te  = rdv_end_time.replace(':', '') + '00';          // 110000
    const ttl = encodeURIComponent(`RDV ${prenom} ${nom}`);
    const det = encodeURIComponent(`Tél: ${tel} | ${offre} | ${vehicule}${marque ? ' ' + marque : ''}${message ? '\n' + message : ''}`);
    calendar_link = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${ttl}&dates=${dc}T${ts}/${dc}T${te}&details=${det}&location=Chez%20le%20client`;
  }

  const params = {
    prenom, nom, tel, email,
    vehicule, offre, marque, message, creneau,
    full_name: `${prenom} ${nom}`,
    name: `${prenom} ${nom}`,
    cancel_url: cancelUrl,
    rdv_date,
    rdv_time,
    rdv_end_time,
    calendar_link
  };

  // Email à toi (owner)
  const sendOwner = emailjs.send(EJS_SERVICE_ID, EJS_TEMPLATE_OWNER, params);

  // Email au client seulement s'il a fourni son email
  const sendClient = email
    ? emailjs.send(EJS_SERVICE_ID, EJS_TEMPLATE_CLIENT, params)
    : Promise.resolve();

  Promise.all([sendOwner, sendClient])
    .then(() => {
      // Sauvegarder le créneau dans Firebase pour le bloquer
      if (selDay && selTime && cancelToken) {
        saveBookingToFirebase(selDay, selTime, {
          prenom, nom, tel, email, vehicule, offre, marque, creneau,
          cancelToken, cancelUrl, timestamp: Date.now()
        });
      }
      document.getElementById('resaForm').style.display = 'none';
      document.getElementById('successPanel').style.display = 'block';
      const nameEl = document.getElementById('successName');
      if (nameEl) nameEl.textContent = prenom;
    })
    .catch(err => {
      console.error('EmailJS error:', err);
      btn.textContent = 'Confirmer ma demande de RDV';
      btn.disabled = false;
      alert('Une erreur est survenue. Merci de nous appeler directement au 06 17 15 46 33.');
    });
}

function resetForm() {
  document.getElementById('resaForm').reset();
  document.getElementById('resaForm').style.display = 'block';
  document.getElementById('successPanel').style.display = 'none';
  selTime = null;
  clearTimeSelection();
  refreshSlotAvailability();
  updateRecap();
}

/*
   REVIEWS
 */
function initReviews() {
  let selectedRating = 0;
  const stars = document.querySelectorAll('#starRating span');

  stars.forEach(star => {
    star.addEventListener('mouseover', () => highlightStars(+star.dataset.val));
    star.addEventListener('mouseout',  () => highlightStars(selectedRating));
    star.addEventListener('click',     () => { selectedRating = +star.dataset.val; highlightStars(selectedRating); });
  });

  function highlightStars(val) {
    stars.forEach(s => s.classList.toggle('active', +s.dataset.val <= val));
  }

  renderReviews();

  document.getElementById('reviewForm').addEventListener('submit', e => {
    e.preventDefault();
    if (!selectedRating) { alert('Veuillez sélectionner une note.'); return; }

    const ts = Date.now();
    const review = {
      name:      document.getElementById('reviewName').value.trim(),
      formule:   document.getElementById('reviewFormule').value,
      rating:    selectedRating,
      comment:   document.getElementById('reviewComment').value.trim(),
      date:      new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
      timestamp: ts
    };

    getFirebaseDb(db => {
      db.ref('reviews/' + ts).set(review).then(() => {
        loadAndRenderReviews();
      });
    });

    document.getElementById('reviewForm').reset();
    selectedRating = 0;
    highlightStars(0);

    const btn = document.getElementById('reviewSubmitBtn');
    btn.textContent = '✓ Avis publié !';
    btn.style.background = '#3ecf6a';
    setTimeout(() => { btn.textContent = 'Publier mon avis'; btn.style.background = ''; }, 2500);
  });
}

function loadAndRenderReviews() {
  const list  = document.getElementById('reviewsList');
  const empty = document.getElementById('noReviews');
  if (!list) return;

  getFirebaseDb(db => {
    db.ref('reviews').once('value').then(snapshot => {
      const data    = snapshot.val() || {};
      const reviews = Object.values(data).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      if (reviews.length === 0) {
        list.innerHTML = '';
        if (empty) empty.style.display = 'block';
        return;
      }

      if (empty) empty.style.display = 'none';
      list.innerHTML = reviews.map(r => `
        <div class="review-card">
          <div class="review-stars">${'★'.repeat(r.rating || 0)}${'☆'.repeat(5 - (r.rating || 0))}</div>
          <p>"${r.comment}"</p>
          <div class="review-author">
            <div class="review-avatar">${(r.name || '?').charAt(0).toUpperCase()}</div>
            <div><strong>${r.name || ''}</strong><span>${r.formule || ''} · ${r.date || ''}</span></div>
          </div>
        </div>
      `).join('');
    });
  });
}

function renderReviews() {
  loadAndRenderReviews();
}

/*
   AVANT / APRÈS SLIDERS
 */
function initSliders() {
  document.querySelectorAll('.slider-wrap').forEach(wrap => {
    const afterEl = wrap.querySelector('.slider-after');
    const handle  = wrap.querySelector('.slider-handle');
    if (!afterEl || !handle) return;

    let dragging = false;
    const setPos = clientX => {
      const rect = wrap.getBoundingClientRect();
      let pct = ((clientX - rect.left) / rect.width) * 100;
      pct = Math.max(5, Math.min(95, pct));
      afterEl.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
      handle.style.left = pct + '%';
    };

    handle.addEventListener('mousedown',  e => { dragging = true; e.preventDefault(); });
    document.addEventListener('mousemove', e => { if (dragging) setPos(e.clientX); });
    document.addEventListener('mouseup',   ()  => { dragging = false; });

    handle.addEventListener('touchstart', e => { dragging = true; e.preventDefault(); }, { passive: false });
    document.addEventListener('touchmove', e => { if (dragging) setPos(e.touches[0].clientX); }, { passive: true });
    document.addEventListener('touchend',  ()  => { dragging = false; });

    // Init at 50%
    setPos(wrap.getBoundingClientRect().left + wrap.offsetWidth / 2);
  });
}
