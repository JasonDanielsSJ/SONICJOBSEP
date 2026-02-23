/* ═════════════════════════════════════════════
   SONICJOBS × CHATGPT — SCRIPT
   ─────────────────────────────────────────────
   1. Sticky nav shadow on scroll
   2. Mobile burger menu
   3. Scroll-reveal with IntersectionObserver
   4. Animated stat counters
   5. Contact form: validate, submit, toast
   6. Smooth anchor scroll with nav offset
═════════════════════════════════════════════ */

'use strict';

/* ─ tiny helpers ─ */
const get = id => document.getElementById(id);
const qa  = s  => [...document.querySelectorAll(s)];

/* ══════════════════════════════════════════
   1. STICKY NAV SHADOW
══════════════════════════════════════════ */
const nav = document.querySelector('.nav');

window.addEventListener('scroll', () => {
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 16);
}, { passive: true });


/* ══════════════════════════════════════════
   2. MOBILE BURGER MENU
══════════════════════════════════════════ */
const burger = get('burger');
const drawer = get('drawer');

if (burger && drawer) {
  burger.addEventListener('click', () => {
    const isOpen = burger.classList.toggle('open');
    drawer.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    drawer.setAttribute('aria-hidden', String(!isOpen));
  });

  // Close drawer when any link is clicked
  qa('.drawer-link').forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('open');
      drawer.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
    });
  });
}


/* ══════════════════════════════════════════
   3. SCROLL REVEAL
══════════════════════════════════════════ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el    = entry.target;
    const delay = parseInt(el.dataset.delay || 0, 10);
    setTimeout(() => el.classList.add('visible'), delay);
    revealObserver.unobserve(el);
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -48px 0px',
});

qa('.reveal').forEach(el => revealObserver.observe(el));


/* ══════════════════════════════════════════
   4. ANIMATED STAT COUNTERS
   Triggered on viewport entry, eased
══════════════════════════════════════════ */
function easeOut(t) {
  return 1 - Math.pow(1 - t, 4);
}

function animateCount(el, target, suffix, duration) {
  const counterEl = el.querySelector('.counter');
  if (!counterEl) return;

  const start = performance.now();

  function tick(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const value    = Math.round(easeOut(progress) * target);

    counterEl.textContent = value;
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      counterEl.textContent = target;
    }
  }

  requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el     = entry.target;
    const target = parseInt(el.dataset.target || '0', 10);
    if (isNaN(target) || !el.querySelector('.counter')) return;
    animateCount(el, target, el.dataset.suffix || '', 1500);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.65 });

qa('.stat[data-target]').forEach(el => counterObserver.observe(el));


/* ══════════════════════════════════════════
   5. CONTACT FORM VALIDATION + SUBMIT
══════════════════════════════════════════ */
const form      = get('contactForm');
const submitBtn = get('submitBtn');
const btnText   = get('btnText');
const btnLoad   = get('btnLoad');

function setError(inputId, errId, msg) {
  const input = get(inputId);
  const err   = get(errId);
  if (!input || !err) return;
  input.closest('.fg')?.classList.add('bad');
  err.textContent = msg;
  err.classList.add('on');
}

function clearError(inputId, errId) {
  const input = get(inputId);
  const err   = get(errId);
  if (!input || !err) return;
  input.closest('.fg')?.classList.remove('bad');
  err.classList.remove('on');
}

// Live error clearing on input
[
  ['f_name',  'e_name'],
  ['f_co',    'e_co'],
  ['f_email', 'e_email'],
].forEach(([inp, err]) => {
  get(inp)?.addEventListener('input', () => clearError(inp, err));
});

function validate() {
  let valid = true;
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const name  = get('f_name')?.value.trim();
  const co    = get('f_co')?.value.trim();
  const email = get('f_email')?.value.trim();

  if (!name) {
    setError('f_name', 'e_name', 'Your name is required.');
    valid = false;
  } else clearError('f_name', 'e_name');

  if (!co) {
    setError('f_co', 'e_co', 'Company name is required.');
    valid = false;
  } else clearError('f_co', 'e_co');

  if (!email) {
    setError('f_email', 'e_email', 'A work email is required.');
    valid = false;
  } else if (!emailRe.test(email)) {
    setError('f_email', 'e_email', 'Please enter a valid email address.');
    valid = false;
  } else clearError('f_email', 'e_email');

  return valid;
}

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Loading state
    if (submitBtn) submitBtn.disabled = true;
    if (btnText)   btnText.hidden = true;
    if (btnLoad)   btnLoad.hidden = false;

    // Simulated async submit — replace with your real endpoint
    await new Promise(r => setTimeout(r, 1800));

    form.reset();
    if (submitBtn) submitBtn.disabled = false;
    if (btnText)   btnText.hidden = false;
    if (btnLoad)   btnLoad.hidden = true;

    showToast();
  });
}


/* ══════════════════════════════════════════
   6. TOAST NOTIFICATION
══════════════════════════════════════════ */
function showToast() {
  const toast = get('toast');
  if (!toast) return;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 5500);
}


/* ══════════════════════════════════════════
   7. SMOOTH ANCHOR SCROLL (nav-offset aware)
══════════════════════════════════════════ */
qa('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id     = a.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const navHeight = nav?.offsetHeight ?? 62;
    const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 8;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
