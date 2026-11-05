const PRICES = {
  Consultații: [
    ['Prima consultație și plan de tratament', 'Gratuit'],
    ['Control periodic', '120 lei'],
    ['Radiografie panoramică', '90 lei'],
    ['Detartraj și periaj profesional', '250 lei']
  ],
  Tratamente: [
    ['Obturație (plombă)', '280 lei'],
    ['Tratament de canal', '650 lei'],
    ['Extracție simplă', '200 lei'],
    ['Coroană ceramică', '1.200 lei']
  ],
  Estetică: [
    ['Albire dentară profesională', '800 lei'],
    ['Fațetă ceramică (per dinte)', '1.500 lei'],
    ['Implant dentar complet', '3.200 lei'],
    ['Consultație ortodontică', '150 lei']
  ]
};

const HOURS = {
  weekday: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
  saturday: ['09:00', '10:00', '11:00', '12:00']
};

const nav = document.getElementById('nav');
const burger = document.getElementById('burger');
const tabsEl = document.getElementById('tabs');
const pricesEl = document.getElementById('prices');
const form = document.getElementById('booking');
const msg = document.getElementById('msg');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function setNav(open) {
  nav.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);
  burger.setAttribute('aria-label', open ? 'Închide meniul' : 'Deschide meniul');
}

burger.addEventListener('click', () => setNav(!nav.classList.contains('open')));
nav.addEventListener('click', event => {
  if (event.target.tagName === 'A') setNav(false);
});

function showPrices(category) {
  tabsEl.querySelectorAll('.tab').forEach(tab => {
    tab.setAttribute('aria-selected', tab.dataset.cat === category);
  });
  pricesEl.innerHTML = PRICES[category].map(([name, value]) => `
    <li class="price-row">
      <span class="price-name">${name}</span>
      <span class="price-dots"></span>
      <span class="price-value">${value}</span>
    </li>
  `).join('');
}

tabsEl.innerHTML = Object.keys(PRICES).map(category => `
  <button class="tab" role="tab" data-cat="${category}">${category}</button>
`).join('');

tabsEl.addEventListener('click', event => {
  const tab = event.target.closest('.tab');
  if (tab) showPrices(tab.dataset.cat);
});

showPrices(Object.keys(PRICES)[0]);

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

function countUp(el) {
  const target = Number(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  if (reduceMotion) {
    el.textContent = target.toLocaleString('ro-RO') + suffix;
    return;
  }
  const start = performance.now();
  const duration = 1400;
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(target * eased).toLocaleString('ro-RO') + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const countObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      countUp(entry.target);
      countObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.6 });

document.querySelectorAll('.count').forEach(el => countObserver.observe(el));

const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
  .toISOString()
  .slice(0, 10);
form.date.min = today;

form.date.addEventListener('change', () => {
  const day = new Date(form.date.value + 'T12:00:00').getDay();
  const slots = day === 0 ? [] : day === 6 ? HOURS.saturday : HOURS.weekday;

  if (!form.date.value) {
    form.time.innerHTML = '<option value="">Alege data</option>';
  } else if (!slots.length) {
    form.time.innerHTML = '<option value="">Închis duminica</option>';
    msg.className = 'msg err';
    msg.textContent = 'Duminica clinica este închisă. Alege altă zi.';
    return;
  } else {
    form.time.innerHTML = '<option value="">Alege ora</option>' + slots.map(s => `<option>${s}</option>`).join('');
  }
  msg.textContent = '';
});

form.addEventListener('submit', event => {
  event.preventDefault();
  let valid = true;

  form.querySelectorAll('input, select').forEach(field => {
    const empty = !field.value.trim();
    field.classList.toggle('invalid', empty);
    if (empty) valid = false;
  });

  const digits = form.phone.value.replace(/\D/g, '');
  if (form.phone.value && digits.length < 9) {
    form.phone.classList.add('invalid');
    valid = false;
  }

  if (!valid) {
    msg.className = 'msg err';
    msg.textContent = 'Completează toate câmpurile corect.';
    return;
  }

  const dateLabel = new Date(form.date.value + 'T12:00:00').toLocaleDateString('ro-RO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  msg.className = 'msg ok';
  msg.textContent = `Mulțumim, ${form.name.value.trim()}! Te așteptăm ${dateLabel}, la ${form.time.value}. Te sunăm pentru confirmare.`;
  form.reset();
  form.time.innerHTML = '<option value="">Alege data</option>';
});