/* Skyline de datos: 3D portfolio.
 *
 * A night city made of bar charts. The opening scene is a REAL chart (confirmed road
 * incidents in Mexico City, 24 hours x 7 days) built as towers; scrolling flies the camera
 * down an avenue where each of the 11 projects is a tower with its own beam of light.
 *
 * No build step: three.js loads as ES modules (see the import map in index.html).
 * Everything visual is drawn procedurally with shaders, so no heavy assets are needed.
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const GITHUB = 'https://github.com/martinezramirezaxelalejandro04-ui/';
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const clamp = (value, low, high) => Math.min(Math.max(value, low), high);
const smooth = (u) => u * u * (3 - 2 * u);
const store = (key, value) => {
  try {
    if (value === undefined) return window.localStorage.getItem(key);
    window.localStorage.setItem(key, value);
  } catch (error) { /* private mode: the site works without remembering choices */ }
  return null;
};

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const LITE = window.innerWidth < 760 || window.matchMedia('(pointer: coarse)').matches;

/* ------------------------------------------------------------------ data */
const data = await fetch('projects.json').then((response) => response.json());
const manifest = await fetch('media/manifest.json').then((response) => response.json())
  .catch(() => ({ overlay: null, projects: {} }));
const PROJECTS = data.projects;

/* ------------------------------------------------------------ language */
const EN = {
  'loader.title': 'Building the data city', skip: 'Skip to content',
  'nav.about': 'About', 'nav.projects': 'Projects', 'nav.method': 'Method', 'nav.profile': 'Profile', 'nav.contact': 'Contact',
  'hero.kicker': 'Data analysis · Mexico City',
  'hero.title': 'I turn data into <em>clear decisions</em>.',
  'hero.lead': "I'm Axel Alejandro Martínez Ramírez. This city is a real chart: each tower is an hour of the week and its height is the number of confirmed road incidents in Mexico City between 2022 and 2023.",
  'hero.hint': 'Scroll to fly',
  'about.title': 'An analyst who guards the data and explains it clearly',
  'about.p1': "I'm studying Mechatronics Engineering at UNAM and I work with data from the operations side. At HONOR Mexico (2025): settlement reconciliation, carrier performance reports and end-to-end incident tracking.",
  'about.p2': 'Outside work I turn Mexico\'s open data into questions with answers: eleven projects with their method, tests and limitations in plain sight.',
  'stats.1': 'projects', 'stats.2': 'real records', 'stats.3': 'automated tests', 'stats.4': 'open sources',
  'projects.title': 'Eleven towers, eleven questions',
  'projects.intro': 'Fly between them as you scroll, or open one: each holds its chart, its method and its code.',
  open: 'Explore the tower', code: 'Code ↗', 'code.long': 'See the code ↗', prev: '← Previous', next: 'Next →',
  'method.title': 'How I work', 'method.intro': 'A striking result is a reason to look more carefully, not to publish right away.',
  'm1.t': 'Question first', 'm1.p': 'Every analysis starts with a decision someone needs to make.',
  'm2.t': 'Documented cleaning', 'm2.p': 'Each step says how many rows remain and why.',
  'm3.t': 'Fair comparisons', 'm3.p': 'Same product, same store; KPIs on totals.',
  'm4.t': 'Verifiable results', 'm4.p': 'Code with tests and data anyone can download.',
  'm5.t': 'Limitations in plain sight', 'm5.p': 'What the data cannot support is written down too.',
  'errors.title': 'Three mistakes I almost published',
  'errors.p': 'A fake +2.6 °C warming that was really +0.7 °C, sentences 487 words long that never existed, and pork that did not get 45% cheaper. All three are documented in their projects.',
  'profile.title': 'Profile',
  'tl1.t': 'Logistics and Service Operations Intern · HONOR Mexico', 'tl1.p': 'Carrier performance reports, settlement reconciliation and incident tracking.',
  'tl2.t': 'Head of General Secretariat · Biomedical Systems Student Society, UNAM', 'tl2.p': 'Institutional liaison and delivery of projects on time and on budget.',
  'tl3.t': 'Project lead · Proyect Ingenious, School of Engineering', 'tl3.p': 'First place among the participating teams.',
  'tl4.t': 'Mechatronics Engineering · UNAM',
  'sk.daily': 'Everyday tools', 'sk.excel': 'Advanced Excel', 'sk.applied': 'Applied in these projects', 'sk.apis': 'Open data APIs',
  'sk.tests': 'Hypothesis testing', 'sk.sim': 'Simulation', 'sk.certs': 'Certifications', 'sk.lang': 'Languages',
  c1: 'Data Analysis with Python (Pandas) · Kaggle', c2: 'Excel: Basic to Intermediate · Santander Open Academy',
  c3: 'Marketing Strategy Fundamentals · SCRUMstudy', c4: 'Scrum Fundamentals Certified · SCRUMstudy',
  l1: 'Spanish, native', l2: 'English, C1',
  'contact.title': 'Looking for someone who takes care of the data and knows how to explain it?',
  'contact.p': "I'm looking to join a team as a data analyst, with a special interest in digital marketing and campaign measurement. I'm based in Coyoacán, Mexico City, and I'd be glad to talk.",
  'contact.email': 'Send me an email', 'contact.classic': 'Classic version ↗',
  foot: 'Data: PROFECO and datos.gob.mx, Mexico City\'s C5, USGS, Wikimedia, Open-Meteo and Copernicus. City drawn in real time with three.js.',
};
const ES = {};
$$('[data-i]').forEach((node) => { ES[node.dataset.i] = node.innerHTML; });
const COPY = {
  es: {
    zones: ['Plaza de datos', 'Torre de control', 'Observatorio', 'Barrio del perfil', 'Puerto de llegada'],
    peak: (day, hour, value) => `${day} · ${hour}:00 · ${value} incidentes por hora`,
    sound: 'Activar sonido ambiente', soundOff: 'Silenciar sonido ambiente', langButton: 'EN', langLabel: 'Switch to English',
    close: 'Cerrar', title: 'Axel Martínez · Skyline de datos', open: 'Clic para explorar',
    prevMedia: 'Anterior', nextMedia: 'Siguiente', zoom: 'Imagen ampliada',
  },
  en: {
    zones: ['Data plaza', 'Control tower', 'Observatory', 'Profile district', 'Arrival port'],
    peak: (day, hour, value) => `${day} · ${hour}:00 · ${value} incidents per hour`,
    sound: 'Turn ambient sound on', soundOff: 'Turn ambient sound off', langButton: 'ES', langLabel: 'Cambiar a español',
    close: 'Close', title: 'Axel Martínez · Data skyline', open: 'Click to explore',
    prevMedia: 'Previous', nextMedia: 'Next', zoom: 'Enlarged image',
  },
};
const state = { lang: store('lang') === 'en' ? 'en' : 'es', panel: -1, hover: -1 };
const tx = (pair) => (pair && (pair[state.lang] ?? pair.es)) || '';
const copy = () => COPY[state.lang];
let world = null; // 3D scene API; stays null when WebGL is unavailable (the HTML still works)

function zoneName(index) {
  const last = 2 + PROJECTS.length;
  if (index === 0) return copy().zones[0];
  if (index === 1) return copy().zones[1];
  if (index < last) return tx(PROJECTS[index - 2].title);
  return copy().zones[2 + (index - last)] || copy().zones[4];
}

function applyLang() {
  document.documentElement.lang = state.lang;
  document.title = copy().title;
  $$('[data-i]').forEach((node) => {
    const value = (state.lang === 'en' ? EN : ES)[node.dataset.i];
    if (value !== undefined) node.innerHTML = value;
  });
  PROJECTS.forEach((project) => {
    const root = $(`[data-project="${project.id}"]`);
    if (root) {
      $('[data-p="theme"]', root).textContent = tx(data.themes[project.theme]);
      ['figure', 'label', 'title', 'question'].forEach((field) => { $(`[data-p="${field}"]`, root).textContent = tx(project[field]); });
    }
    const item = $(`#projects-menu [data-open="${project.id}"] .mt`);
    if (item) item.textContent = tx(project.title);
  });
  const sound = $('#sound');
  sound.setAttribute('aria-label', sound.getAttribute('aria-pressed') === 'true' ? copy().soundOff : copy().sound);
  $('#lang').textContent = copy().langButton;
  $('#lang').setAttribute('aria-label', copy().langLabel);
  $('#panel-close').setAttribute('aria-label', copy().close);
  $('#lightbox-close').setAttribute('aria-label', copy().close);
  $('#lightbox').setAttribute('aria-label', copy().zoom);
  $('#gal-prev').setAttribute('aria-label', copy().prevMedia);
  $('#gal-next').setAttribute('aria-label', copy().nextMedia);
  if (world) world.refreshLabels();
  if (state.panel >= 0) fillPanel(state.panel);
}

/* ------------------------------------------------------- project panel */
const panel = $('#panel');
const lightbox = $('#lightbox');
const gallery = { items: [], index: 0 };
let lastFocus = null;
let closeTimer = 0;

const captionOf = (item) => (typeof item.caption === 'string' ? item.caption : tx(item.caption || {}));

function mediaFor(project) {
  const extra = (manifest.projects && manifest.projects[project.id]) || [];
  return [{ type: 'image', src: `assets/charts/${project.id}.png`, caption: project.alt }, ...extra];
}

function showSlide(number) {
  gallery.index = (number + gallery.items.length) % gallery.items.length;
  const item = gallery.items[gallery.index];
  const slide = $('#slide');
  slide.textContent = '';
  if (item.type === 'video') {
    // Videos load only when their slide is shown, and pause when it is replaced.
    const video = document.createElement('video');
    Object.assign(video, { muted: true, loop: true, playsInline: true, preload: 'none' });
    if (item.poster) video.poster = item.poster;
    video.src = item.src;
    video.setAttribute('aria-label', captionOf(item));
    video.addEventListener('click', () => { video.controls = true; if (video.paused) video.play(); else video.pause(); });
    slide.appendChild(video);
    video.play().catch(() => {});
  } else {
    const image = document.createElement('img');
    image.src = item.src;
    image.alt = captionOf(item);
    image.addEventListener('click', () => openLightbox(item));
    slide.appendChild(image);
  }
  $('#caption').textContent = captionOf(item);
  $$('#gal-dots i').forEach((dot, index) => dot.classList.toggle('on', index === gallery.index));
}

function fillPanel(index) {
  const project = PROJECTS[index];
  $('#panel-kicker').innerHTML = `<span class="num">${String(index + 1).padStart(2, '0')}</span><span>${tx(data.themes[project.theme])}</span>`;
  $('#panel-title').textContent = tx(project.title);
  $('#panel-figure').textContent = tx(project.figure);
  $('#panel-label').textContent = tx(project.label);
  $('#panel-question').textContent = tx(project.question);
  $('#panel-repo').href = GITHUB + project.id;
  const tags = $('#panel-tags');
  tags.textContent = '';
  project.tools.forEach((tool) => { const li = document.createElement('li'); li.textContent = tool; tags.appendChild(li); });
  gallery.items = mediaFor(project);
  const dots = $('#gal-dots');
  dots.textContent = '';
  gallery.items.forEach(() => dots.appendChild(document.createElement('i')));
  $('.gal-ctrl').dataset.single = String(gallery.items.length < 2);
  showSlide(Math.min(gallery.index, gallery.items.length - 1));
}

function openPanel(index) {
  window.clearTimeout(closeTimer);
  const opening = state.panel < 0;
  if (opening) lastFocus = document.activeElement;
  gallery.index = 0;
  state.panel = index;
  fillPanel(index);
  panel.hidden = false;
  requestAnimationFrame(() => panel.classList.add('open'));
  document.documentElement.classList.add('locked');
  $('#projects-menu').hidden = true;
  $('#projects-toggle').setAttribute('aria-expanded', 'false');
  if (world) world.focus(index);
  if (opening) $('#panel-close').focus({ preventScroll: true });
}

function closePanel() {
  if (state.panel < 0) return;
  state.panel = -1;
  panel.classList.remove('open');
  $('#slide').textContent = ''; // stops any playing video
  document.documentElement.classList.remove('locked');
  if (world) world.release();
  closeTimer = window.setTimeout(() => { panel.hidden = true; }, reduced ? 0 : 560);
  if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
}

function openLightbox(item) {
  $('#lightbox-img').src = item.src;
  $('#lightbox-img').alt = captionOf(item);
  lightbox.hidden = false;
  $('#lightbox-close').focus();
}
function closeLightbox() { lightbox.hidden = true; }

$('#panel-close').addEventListener('click', closePanel);
$('#panel-prev').addEventListener('click', () => openPanel((state.panel + PROJECTS.length - 1) % PROJECTS.length));
$('#panel-next').addEventListener('click', () => openPanel((state.panel + 1) % PROJECTS.length));
$('#gal-prev').addEventListener('click', () => showSlide(gallery.index - 1));
$('#gal-next').addEventListener('click', () => showSlide(gallery.index + 1));
$('#lightbox-close').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (event) => { if (event.target === lightbox) closeLightbox(); });
document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-open]');
  if (trigger) openPanel(PROJECTS.findIndex((project) => project.id === trigger.dataset.open));
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (!lightbox.hidden) closeLightbox();
    else if (state.panel >= 0) closePanel();
    else if (!$('#projects-menu').hidden) { $('#projects-menu').hidden = true; $('#projects-toggle').setAttribute('aria-expanded', 'false'); }
  } else if (state.panel >= 0 && lightbox.hidden && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')) {
    openPanel((state.panel + (event.key === 'ArrowRight' ? 1 : PROJECTS.length - 1)) % PROJECTS.length);
  } else if (event.key === 'Tab' && state.panel >= 0 && lightbox.hidden) {
    // Keep keyboard focus inside the open panel.
    const items = $$('button, a[href]', panel).filter((node) => node.offsetParent !== null);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

const menuToggle = $('#projects-toggle');
menuToggle.addEventListener('click', () => {
  const menu = $('#projects-menu');
  menu.hidden = !menu.hidden;
  menuToggle.setAttribute('aria-expanded', String(!menu.hidden));
});
document.addEventListener('pointerdown', (event) => {
  if (!event.target.closest('#projects-menu, #projects-toggle')) {
    $('#projects-menu').hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
  }
});
$('#lang').addEventListener('click', () => {
  state.lang = state.lang === 'es' ? 'en' : 'es';
  store('lang', state.lang);
  applyLang();
});

/* ------------------------------------------------------- ambient sound */
const sound = { context: null, master: null, on: false };
$('#sound').addEventListener('click', () => {
  if (!sound.context) {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return;
    const context = new Context();
    const master = context.createGain();
    master.gain.value = 0;
    master.connect(context.destination);
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = 420; filter.Q.value = 4;
    filter.connect(master);
    [[55, 'sawtooth', 0, 0.3], [82.5, 'sine', 4, 0.5], [110.4, 'triangle', -5, 0.35], [164.8, 'sine', 7, 0.22]].forEach(([hz, type, detune, level]) => {
      const oscillator = context.createOscillator();
      oscillator.type = type; oscillator.frequency.value = hz; oscillator.detune.value = detune;
      const gain = context.createGain();
      gain.gain.value = level;
      oscillator.connect(gain); gain.connect(filter); oscillator.start();
    });
    const lfo = context.createOscillator();
    lfo.frequency.value = 0.07;
    const depth = context.createGain();
    depth.gain.value = 240;
    lfo.connect(depth); depth.connect(filter.frequency); lfo.start();
    Object.assign(sound, { context, master });
  }
  sound.on = !sound.on;
  sound.context.resume();
  sound.master.gain.cancelScheduledValues(sound.context.currentTime);
  sound.master.gain.linearRampToValueAtTime(sound.on ? 0.07 : 0, sound.context.currentTime + 1.2);
  $('#sound').setAttribute('aria-pressed', String(sound.on));
  $('#sound').setAttribute('aria-label', sound.on ? copy().soundOff : copy().sound);
});

/* ============================================================== 3D world */
const SHADERS = {
  buildingVert: /* glsl */`
    attribute float aEnergy; attribute float aTint; attribute float aSeed;
    varying vec3 vWorld; varying vec3 vNormalW; varying vec2 vUv;
    varying float vEnergy; varying float vTint; varying float vSeed; varying float vH;
    void main() {
      vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
      vWorld = wp.xyz;
      vNormalW = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
      vUv = uv; vEnergy = aEnergy; vTint = aTint; vSeed = aSeed;
      vH = instanceMatrix[1][1];
      gl_Position = projectionMatrix * viewMatrix * wp;
    }`,
  buildingFrag: /* glsl */`
    uniform float uTime; uniform float uMotion; uniform float uFogDensity; uniform vec3 uFogColor;
    varying vec3 vWorld; varying vec3 vNormalW; varying vec2 vUv;
    varying float vEnergy; varying float vTint; varying float vSeed; varying float vH;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    void main() {
      vec3 n = normalize(vNormalW);
      bool top = n.y > 0.5;
      vec3 cyan = vec3(0.16, 0.86, 1.0);
      vec3 amber = vec3(1.0, 0.68, 0.26);
      vec3 accent = mix(cyan, amber, vTint);
      float yN = clamp(vWorld.y / max(vH, 0.001), 0.0, 1.0);
      vec3 col = vec3(0.010, 0.026, 0.052) * (0.55 + 0.45 * abs(n.x));
      col += vec3(0.0, 0.05, 0.09) * pow(yN, 3.0) * vEnergy;
      // windows
      vec2 g = vec2((abs(n.x) > 0.5 ? vWorld.z : vWorld.x) * 1.15, vWorld.y * 0.8);
      vec2 id = floor(g); vec2 f = fract(g);
      float lit = step(0.80 - 0.42 * vEnergy, hash(id + vSeed * 17.0));
      float flick = 0.78 + 0.22 * sin(uTime * uMotion * 2.0 + hash(id) * 30.0);
      float win = step(0.18, f.x) * step(f.x, 0.82) * step(0.25, f.y) * step(f.y, 0.70) * lit * (top ? 0.0 : 1.0);
      vec3 tone = mix(accent, amber, step(0.92, hash(id + 3.1)) * (1.0 - vTint));
      col += tone * win * flick * (0.4 + 0.95 * vEnergy);
      // data scanning upwards
      float scan = fract(vWorld.y * 0.012 - uTime * uMotion * 0.12 + vSeed);
      float band = smoothstep(0.0, 0.015, scan) * (1.0 - smoothstep(0.015, 0.06, scan));
      col += accent * band * (0.25 + 0.55 * vEnergy) * (top ? 0.0 : 1.0);
      // glowing edges and roof
      vec2 e = abs(vUv - 0.5) * 2.0;
      col += accent * smoothstep(0.93, 1.0, max(e.x, e.y)) * (0.12 + 0.55 * vEnergy);
      if (top) col += accent * (0.08 + 0.5 * vEnergy);
      float d = length(cameraPosition - vWorld);
      col = mix(col, uFogColor, clamp(1.0 - exp(-pow(d * uFogDensity, 2.0)), 0.0, 1.0));
      gl_FragColor = vec4(col, 1.0);
    }`,
  groundVert: /* glsl */`
    varying vec3 vWorld;
    void main() { vec4 wp = modelMatrix * vec4(position, 1.0); vWorld = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }`,
  groundFrag: /* glsl */`
    uniform float uTime; uniform float uMotion; uniform float uCell; uniform float uFogDensity; uniform vec3 uFogColor;
    varying vec3 vWorld;
    void main() {
      vec2 p = vWorld.xz;
      vec2 q = abs(fract(p / uCell) - 0.5);
      float line = 1.0 - smoothstep(0.0, 0.05, min(q.x, q.y));
      float r = length(p);
      float pulse = 1.0 - smoothstep(0.0, 1.0, abs(fract(r * 0.004 - uTime * uMotion * 0.07) - 0.5) * 14.0);
      vec3 col = vec3(0.006, 0.014, 0.03);
      col += vec3(0.1, 0.6, 0.8) * line * (0.28 + 0.7 * pulse);
      col += vec3(0.05, 0.3, 0.42) * exp(-r * 0.018) * 0.7;
      float d = length(cameraPosition - vWorld);
      col = mix(col, uFogColor, clamp(1.0 - exp(-pow(d * uFogDensity, 2.0)), 0.0, 1.0));
      gl_FragColor = vec4(col, 1.0);
    }`,
  skyVert: /* glsl */`
    varying vec3 vDir;
    void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  skyFrag: /* glsl */`
    uniform float uTime; uniform float uMotion; varying vec3 vDir;
    float hash31(vec3 p) { p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
    void main() {
      float h = vDir.y;
      vec3 zenith = vec3(0.003, 0.007, 0.02);
      vec3 mid = vec3(0.010, 0.034, 0.08);
      vec3 horizon = vec3(0.04, 0.16, 0.26);
      vec3 col = mix(horizon, mid, smoothstep(0.0, 0.32, h));
      col = mix(col, zenith, smoothstep(0.22, 0.9, h));
      // sun low on the horizon, at the end of the avenue
      vec3 sunDir = normalize(vec3(0.0, 0.085, -1.0));
      float s = max(dot(vDir, sunDir), 0.0);
      col += vec3(1.0, 0.42, 0.20) * pow(s, 90.0) * 1.8 + vec3(1.0, 0.58, 0.30) * pow(s, 7.0) * 0.22;
      col += vec3(2.2, 1.3, 0.7) * smoothstep(0.9993, 0.99975, s) * 2.0;
      // stars
      vec3 pd = vDir * 240.0;
      float rnd = hash31(floor(pd));
      float star = pow(max(0.0, 1.0 - length(fract(pd) - 0.5) * 2.0), 9.0) * step(0.992, rnd);
      star *= 0.55 + 0.45 * sin(uTime * uMotion * 3.0 + rnd * 60.0);
      col += vec3(0.7, 0.9, 1.0) * star * smoothstep(0.03, 0.3, h) * 1.6;
      // faint aurora
      float band = smoothstep(0.08, 0.18, h) * (1.0 - smoothstep(0.2, 0.6, h));
      float wave = 0.5 + 0.5 * sin(vDir.x * 9.0 + sin(vDir.z * 6.0 + uTime * uMotion * 0.18) * 2.6);
      col += vec3(0.05, 0.55, 0.5) * pow(wave, 3.0) * band * 0.16;
      gl_FragColor = vec4(col, 1.0);
    }`,
  trafficVert: /* glsl */`
    attribute float aLane; attribute float aAxis; attribute float aStart; attribute float aLen;
    attribute float aSpeed; attribute float aOffset; attribute float aTint;
    uniform float uTime; uniform float uMotion;
    varying vec3 vWorld; varying float vTint;
    void main() {
      float along = mod(aOffset + uTime * uMotion * aSpeed, aLen) + aStart;
      vec3 w;
      if (aAxis < 0.5) w = vec3(aLane + position.x * 0.5, 0.45 + position.y * 0.35, along + position.z * 3.2);
      else w = vec3(along + position.z * 3.2, 0.45 + position.y * 0.35, aLane + position.x * 0.5);
      vWorld = w; vTint = aTint;
      if (abs(w.x) < 43.0 && abs(w.z) < 19.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; } // keep cars out of the chart
      gl_Position = projectionMatrix * viewMatrix * vec4(w, 1.0);
    }`,
  trafficFrag: /* glsl */`
    uniform float uFogDensity; uniform vec3 uFogColor; varying vec3 vWorld; varying float vTint;
    void main() {
      vec3 col = mix(vec3(0.3, 1.2, 1.6), vec3(2.2, 1.2, 0.4), vTint) * 1.9;
      float d = length(cameraPosition - vWorld);
      col = mix(col, uFogColor, clamp(1.0 - exp(-pow(d * uFogDensity, 2.0)), 0.0, 1.0));
      gl_FragColor = vec4(col, 1.0);
    }`,
  dustVert: /* glsl */`
    attribute float aSpeed; attribute float aSize;
    uniform float uTime; uniform float uMotion; uniform float uPixel;
    varying float vAlpha;
    void main() {
      vec3 p = position;
      p.y = mod(position.y + uTime * uMotion * aSpeed, 90.0);
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      float dist = -mv.z;
      gl_PointSize = aSize * uPixel * (140.0 / max(dist, 1.0));
      vAlpha = smoothstep(0.0, 8.0, p.y) * (1.0 - smoothstep(60.0, 90.0, p.y)) * clamp(1.0 - dist / 280.0, 0.0, 1.0);
    }`,
  dustFrag: /* glsl */`
    varying float vAlpha;
    void main() {
      float d = length(gl_PointCoord - 0.5);
      gl_FragColor = vec4(vec3(0.35, 1.0, 1.4), smoothstep(0.5, 0.0, d) * vAlpha);
    }`,
  beamVert: /* glsl */`
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  beamFrag: /* glsl */`
    uniform float uTime; uniform float uMotion; uniform vec3 uColor; uniform float uBoost;
    varying vec2 vUv;
    void main() {
      float fade = pow(1.0 - vUv.y, 2.2);
      float flow = 0.7 + 0.3 * sin(vUv.y * 40.0 - uTime * uMotion * 3.0);
      gl_FragColor = vec4(uColor * (0.9 + 1.4 * uBoost), fade * flow * (0.22 + 0.4 * uBoost));
    }`,
  finalFrag: /* glsl */`
    uniform sampler2D tDiffuse; uniform float uTime; uniform float uGrain; uniform float uAb; uniform float uVig;
    varying vec2 vUv;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
      vec2 c = vUv - 0.5;
      float r2 = dot(c, c);
      vec2 off = c * uAb * (1.0 + r2 * 6.0);
      vec3 col = vec3(texture2D(tDiffuse, vUv + off).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - off).b);
      col *= 1.0 - uVig * smoothstep(0.12, 0.7, r2 * 2.2);
      col += (hash(vUv * vec2(1920.0, 1080.0) + uTime) - 0.5) * uGrain;
      gl_FragColor = vec4(col, 1.0);
    }`,
};

function mulberry32(seed) {
  let a = seed;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function valueNoise(x, y) {
  const hash = (i, j) => { const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return s - Math.floor(s); };
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
const tick = () => new Promise((resolve) => requestAnimationFrame(() => resolve()));

async function createWorld(report) {
  const canvas = $('#gl');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  } catch (error) { return null; }

  renderer.info.autoReset = false; // the composer renders several passes per frame; we reset once per frame
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  let pixelRatio = Math.min(window.devicePixelRatio || 1, LITE ? 1.25 : 1.75);
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x02050b);
  const camera = new THREE.PerspectiveCamera(LITE ? 62 : 55, window.innerWidth / window.innerHeight, 0.5, 4000);

  const FOG = new THREE.Color(0.04, 0.16, 0.26);
  const shared = {
    uTime: { value: 0 }, uMotion: { value: reduced ? 0 : 1 },
    uFogColor: { value: FOG }, uFogDensity: { value: 0.0034 },
  };
  const CELL = LITE ? 14 : 10;
  const box = new THREE.BoxGeometry(1, 1, 1);
  box.translate(0, 0.5, 0);
  const buildingMaterial = () => new THREE.ShaderMaterial({
    vertexShader: SHADERS.buildingVert, fragmentShader: SHADERS.buildingFrag,
    uniforms: { uTime: shared.uTime, uMotion: shared.uMotion, uFogColor: shared.uFogColor, uFogDensity: shared.uFogDensity },
  });
  const matrix = new THREE.Matrix4();
  const position = new THREE.Vector3(), scale = new THREE.Vector3(), identity = new THREE.Quaternion();

  function instanced(items, material) {
    const geometry = box.clone();
    const energy = new Float32Array(items.length), tint = new Float32Array(items.length), seed = new Float32Array(items.length);
    const mesh = new THREE.InstancedMesh(geometry, material, items.length);
    items.forEach((item, index) => {
      matrix.compose(position.set(item.x, 0, item.z), identity, scale.set(item.w, item.h, item.d));
      mesh.setMatrixAt(index, matrix);
      energy[index] = item.e; tint[index] = item.t; seed[index] = item.s;
    });
    geometry.setAttribute('aEnergy', new THREE.InstancedBufferAttribute(energy, 1));
    geometry.setAttribute('aTint', new THREE.InstancedBufferAttribute(tint, 1));
    geometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seed, 1));
    mesh.frustumCulled = false;
    return mesh;
  }

  /* --- sky, ground --- */
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(2500, 32, 16),
    new THREE.ShaderMaterial({ vertexShader: SHADERS.skyVert, fragmentShader: SHADERS.skyFrag, side: THREE.BackSide, depthWrite: false,
      uniforms: { uTime: shared.uTime, uMotion: shared.uMotion } }));
  sky.renderOrder = -1; sky.frustumCulled = false;
  scene.add(sky);
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(2400, 2400).rotateX(-Math.PI / 2),
    new THREE.ShaderMaterial({ vertexShader: SHADERS.groundVert, fragmentShader: SHADERS.groundFrag,
      uniforms: { uTime: shared.uTime, uMotion: shared.uMotion, uCell: { value: CELL }, uFogColor: shared.uFogColor, uFogDensity: shared.uFogDensity } }));
  ground.position.set(0, 0, -330);
  scene.add(ground);
  report(0.1); await tick();

  /* --- the real chart: 7 days x 24 hours of confirmed incidents --- */
  const HEAT_SCALE = 1.65, SPACING = 3.2;
  const flatHeat = data.heat.flat();
  const maxHeat = Math.max(...flatHeat);
  const heatItems = [];
  data.heat.forEach((row, day) => row.forEach((value, hour) => heatItems.push({
    x: (hour - 11.5) * SPACING, z: (day - 3) * SPACING, w: 2.25, d: 2.25, h: value * HEAT_SCALE,
    e: value / maxHeat, t: day === data.peak.day && hour === data.peak.hour ? 1 : 0, s: (hour * 7 + day) / 168, value, hour, day,
  })));
  const heatMesh = instanced(heatItems, buildingMaterial());
  scene.add(heatMesh);
  const setHeat = (grow) => {
    heatItems.forEach((item, index) => {
      const local = clamp(grow * 1.7 - (item.hour / 24) * 0.7, 0, 1);
      const eased = 1 - Math.pow(1 - local, 3);
      matrix.compose(position.set(item.x, 0, item.z), identity, scale.set(item.w, Math.max(item.h * eased, 0.02), item.d));
      heatMesh.setMatrixAt(index, matrix);
    });
    heatMesh.instanceMatrix.needsUpdate = true;
  };
  setHeat(reduced ? 1 : 0);
  const peakItem = heatItems.find((item) => item.t === 1);
  const peakPoint = new THREE.Vector3(peakItem.x, peakItem.h + 2, peakItem.z);
  report(0.25); await tick();

  /* --- filler city --- */
  const rng = mulberry32(2026);
  const city = [];
  for (let gx = -250; gx <= 250; gx += CELL) {
    for (let gz = -800; gz <= 24; gz += CELL) {                           // nothing in front of the plaza: the camera arrives from there
      if (Math.abs(gx) < 44 + 6 && Math.abs(gz) < 20 + 6) continue;       // the chart plaza
      if (gz < 30 && Math.abs(gx) < 22) continue;                         // the flight avenue
      if (rng() < 0.32) continue;                                          // open lots
      const noise = valueNoise(gx * 0.012, gz * 0.012);
      const falloff = clamp(1.25 - Math.abs(gx) / 230, 0.25, 1);
      const height = 3 + Math.pow(rng() * 0.55 + noise * 0.75, 2.4) * 60 * falloff;
      city.push({ x: gx + (rng() - 0.5) * 1.2, z: gz + (rng() - 0.5) * 1.2, w: CELL * 0.5 + rng() * CELL * 0.18, d: CELL * 0.5 + rng() * CELL * 0.18,
        h: height, e: clamp(height / 55 + rng() * 0.25, 0, 1), t: rng() < 0.05 ? 1 : 0, s: rng() });
    }
  }
  scene.add(instanced(city, buildingMaterial()));
  report(0.4); await tick();

  /* --- the 11 project towers, spaced along the avenue --- */
  const towers = PROJECTS.map((project, index) => ({ x: index % 2 === 0 ? -16 : 16, z: -110 - index * 40, h: project.h, w: 5.4 }));
  const towerMesh = instanced(towers.map((tower) => ({ x: tower.x, z: tower.z, w: tower.w, d: tower.w, h: tower.h, e: 1, t: 0, s: 0.5 })), buildingMaterial());
  scene.add(towerMesh);
  const towerTint = towerMesh.geometry.getAttribute('aTint');
  const beams = towers.map((tower) => {
    const material = new THREE.ShaderMaterial({ vertexShader: SHADERS.beamVert, fragmentShader: SHADERS.beamFrag, transparent: true,
      depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      uniforms: { uTime: shared.uTime, uMotion: shared.uMotion, uColor: { value: new THREE.Color(0.2, 0.85, 1.0) }, uBoost: { value: 0 } } });
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 2.2, 150, 16, 1, true), material);
    beam.position.set(tower.x, tower.h + 75, tower.z);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(tower.w * 0.9, 0.12, 8, 64).rotateX(Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(0.3, 2.0, 2.6), toneMapped: false }));
    ring.position.set(tower.x, tower.h + 0.6, tower.z);
    scene.add(beam, ring);
    return { material, ring };
  });
  report(0.55); await tick();

  /* --- traffic along the avenues, animated entirely on the GPU --- */
  const trafficCount = LITE ? 220 : 650;
  const trafficGeometry = new THREE.BoxGeometry(1, 1, 1);
  const attr = (name) => { const array = new Float32Array(trafficCount); trafficGeometry.setAttribute(name, new THREE.InstancedBufferAttribute(array, 1)); return array; };
  const lane = attr('aLane'), axis = attr('aAxis'), start = attr('aStart'), length = attr('aLen'), speed = attr('aSpeed'), offset = attr('aOffset'), tint = attr('aTint');
  for (let i = 0; i < trafficCount; i += 1) {
    const alongZ = rng() < 0.6;
    axis[i] = alongZ ? 0 : 1;
    if (alongZ) { lane[i] = Math.floor((rng() * 2 - 1) * 240 / CELL) * CELL + CELL / 2; start[i] = -800; length[i] = 940; }
    else { lane[i] = Math.floor((rng() * 940 - 800) / CELL) * CELL + CELL / 2; start[i] = -250; length[i] = 500; }
    speed[i] = (8 + rng() * 26) * (rng() < 0.5 ? 1 : -1);
    offset[i] = rng() * length[i]; tint[i] = rng() < 0.18 ? 1 : 0;
  }
  const traffic = new THREE.InstancedMesh(trafficGeometry, new THREE.ShaderMaterial({
    vertexShader: SHADERS.trafficVert, fragmentShader: SHADERS.trafficFrag,
    uniforms: { uTime: shared.uTime, uMotion: shared.uMotion, uFogColor: shared.uFogColor, uFogDensity: shared.uFogDensity } }), trafficCount);
  traffic.frustumCulled = false;
  scene.add(traffic);

  /* --- rising data dust --- */
  const dustCount = LITE ? 900 : 2600;
  const dustGeometry = new THREE.BufferGeometry();
  const dustPosition = new Float32Array(dustCount * 3), dustSpeed = new Float32Array(dustCount), dustSize = new Float32Array(dustCount);
  for (let i = 0; i < dustCount; i += 1) {
    dustPosition.set([(rng() * 2 - 1) * 130, rng() * 90, 140 - rng() * 800], i * 3);
    dustSpeed[i] = 2 + rng() * 7; dustSize[i] = 1.2 + rng() * 2.6;
  }
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPosition, 3));
  dustGeometry.setAttribute('aSpeed', new THREE.BufferAttribute(dustSpeed, 1));
  dustGeometry.setAttribute('aSize', new THREE.BufferAttribute(dustSize, 1));
  const dustUniforms = { uTime: shared.uTime, uMotion: shared.uMotion, uPixel: { value: pixelRatio } };
  const dust = new THREE.Points(dustGeometry, new THREE.ShaderMaterial({ vertexShader: SHADERS.dustVert, fragmentShader: SHADERS.dustFrag,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: dustUniforms }));
  dust.frustumCulled = false;
  scene.add(dust);
  report(0.7); await tick();

  /* --- post-processing: bloom, chromatic aberration, vignette and grain --- */
  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(pixelRatio);
  composer.setSize(window.innerWidth, window.innerHeight);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), LITE ? 0.45 : 0.6, 0.5, 1.0);
  composer.addPass(bloom);
  const finish = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uGrain: { value: LITE ? 0.03 : 0.055 }, uAb: { value: LITE ? 0 : 0.0009 }, uVig: { value: 0.5 } },
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: SHADERS.finalFrag,
  });
  composer.addPass(finish);
  composer.addPass(new OutputPass());

  /* --- camera path: one key pose per content stop, in DOM order --- */
  const KEYS = [];
  const key = (px, py, pz, lx, ly, lz) => KEYS.push({ p: new THREE.Vector3(px, py, pz), l: new THREE.Vector3(lx, ly, lz) });
  key(-70, 40, 84, -18, 8, 0);                       // chart plaza, seen from outside the city
  key(0, 42, 26, 0, 10, -70);                        // control tower: glide over the chart
  towers.forEach((tower, index) => key(tower.x * 0.1, 17 + (index % 3) * 2, tower.z + 38, tower.x + (tower.x < 0 ? 12 : -12), tower.h * 0.5, tower.z));
  key(0, 26, -545, 0, 16, -640);                     // observatory
  key(-26, 15, -575, 10, 18, -680);                  // profile district
  key(0, 7, -590, 0, 26, -1000);                     // arrival: street level facing the sun
  const curveP = new THREE.CatmullRomCurve3(KEYS.map((k) => k.p));
  const curveL = new THREE.CatmullRomCurve3(KEYS.map((k) => k.l));

  const stops = $$('[data-stop]');
  if (stops.length !== KEYS.length) console.warn(`Expected ${KEYS.length} stops, found ${stops.length}`);
  let anchors = [];
  const measure = () => { anchors = stops.map((el) => { const r = el.getBoundingClientRect(); return r.top + window.scrollY + r.height / 2; }); };
  measure();
  window.addEventListener('resize', measure);
  new ResizeObserver(measure).observe(document.body);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

  function scrollParam() {
    const y = window.scrollY + window.innerHeight * 0.5;
    const last = Math.min(anchors.length, KEYS.length) - 1;
    if (y <= anchors[0]) return 0;
    if (y >= anchors[last]) return last;
    let i = 0;
    while (i < last - 1 && y >= anchors[i + 1]) i += 1;
    return i + smooth((y - anchors[i]) / (anchors[i + 1] - anchors[i]));
  }

  /* --- floating labels over each project tower --- */
  const labelRoot = $('#labels');
  const labels = PROJECTS.map((project, index) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'tlabel'; button.tabIndex = -1;
    button.innerHTML = '<span class="tl-n"></span><span class="tl-f"></span>';
    $('.tl-n', button).textContent = String(index + 1).padStart(2, '0');
    button.addEventListener('click', () => openPanel(index));
    button.addEventListener('pointerenter', () => setHover(index));
    button.addEventListener('pointerleave', () => setHover(-1));
    labelRoot.appendChild(button);
    return button;
  });
  const refreshLabels = () => labels.forEach((button, index) => { $('.tl-f', button).textContent = tx(PROJECTS[index].figure); });
  refreshLabels();

  /* --- interaction: hover, click, focus --- */
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const tooltip = $('#tooltip');
  let pointerPixels = { x: 0, y: 0 }, pointerMoved = false;
  const parallax = { x: 0, y: 0, tx: 0, ty: 0 };

  function setHover(index) {
    if (index === state.hover) return;
    if (state.hover >= 0) { towerTint.array[state.hover] = 0; beams[state.hover].material.uniforms.uBoost.value = 0; labels[state.hover].classList.remove('hot'); }
    state.hover = index;
    if (index >= 0) { towerTint.array[index] = 1; beams[index].material.uniforms.uBoost.value = 1; labels[index].classList.add('hot'); }
    towerTint.needsUpdate = true;
    canvas.style.cursor = index >= 0 ? 'pointer' : '';
    if (index < 0) tooltip.hidden = true;
    else {
      tooltip.hidden = false;
      tooltip.innerHTML = `<b></b><span></span>`;
      $('b', tooltip).textContent = tx(PROJECTS[index].title);
      $('span', tooltip).textContent = copy().open;
    }
  }
  function pick(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    pointer.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObject(towerMesh, false)[0];
    return hit ? hit.instanceId : -1;
  }
  window.addEventListener('pointermove', (event) => {
    pointerPixels = { x: event.clientX, y: event.clientY };
    pointerMoved = true;
    parallax.tx = (event.clientX / window.innerWidth - 0.5) * 2;
    parallax.ty = (event.clientY / window.innerHeight - 0.5) * 2;
    if (!tooltip.hidden) tooltip.style.transform = `translate(${event.clientX + 16}px, ${event.clientY + 16}px)`;
  }, { passive: true });
  canvas.addEventListener('click', (event) => { if (state.panel < 0) { const index = pick(event.clientX, event.clientY); if (index >= 0) openPanel(index); } });

  /* --- per-frame state --- */
  const camPos = new THREE.Vector3(), camLook = new THREE.Vector3();
  const vPos = new THREE.Vector3(), vLook = new THREE.Vector3(), tmp = new THREE.Vector3();
  let focusIndex = -1, s = 0, clock = 0, intro = reduced ? 1 : 0, introStart = null, growStart = null, started = false;
  let frames = 0, slow = 0, fast = 0;
  const readoutZone = $('#ro-zone'), readoutAlt = $('#ro-alt'), railFill = $('#rail-fill'), peakEl = $('#peak');

  function targetPose() {
    if (focusIndex >= 0) {
      const tower = towers[focusIndex];
      vPos.set(tower.x + 4, tower.h * 0.5 + 4, tower.z + 26);
      vLook.set(tower.x + (LITE ? 0 : 12), LITE ? tower.h * 0.1 : tower.h * 0.42, tower.z);
    } else {
      const t = clamp(s / (KEYS.length - 1), 0, 1);
      curveP.getPoint(t, vPos); curveL.getPoint(t, vLook);
    }
  }
  targetPose(); camPos.copy(vPos); camLook.copy(vLook);

  // Places an HTML element over a 3D point. maxY keeps labels of very tall towers inside the view.
  function project(point, el, { near = 140, maxY = 2 } = {}) {
    tmp.copy(point).project(camera);
    const visible = tmp.z < 1 && Math.abs(tmp.x) < 1.15 && tmp.y > -1.1 && tmp.y < 1.6;
    const distance = camera.position.distanceTo(point);
    const opacity = visible ? clamp(1 - (distance - near * 0.55) / (near * 0.45), 0, 1) : 0;
    const y = Math.min(tmp.y, maxY);
    el.style.opacity = String(opacity);
    el.style.transform = `translate(${((tmp.x + 1) / 2) * window.innerWidth}px, ${((1 - y) / 2) * window.innerHeight}px) translate(-50%, -120%)`;
    return opacity;
  }

  const labelPoint = new THREE.Vector3();
  function frame(now) {
    window.requestAnimationFrame(frame);
    const dt = Math.min((now - (frame.last || now)) / 1000, 0.1);
    frame.last = now;
    if (!reduced) clock += dt;
    shared.uTime.value = reduced ? 6 : clock;
    finish.uniforms.uTime.value = clock;

    if (started && introStart === null) { introStart = now; growStart = now; }
    if (introStart !== null && intro < 1) intro = clamp((now - introStart) / 3600, 0, 1);
    if (growStart !== null && !reduced) {
      const grow = clamp((now - growStart) / 2400, 0, 1);
      if (grow < 1 || !frame.grown) { setHeat(grow); frame.grown = grow >= 1; }
    }

    s += (scrollParam() - s) * (reduced ? 1 : 1 - Math.exp(-dt * 5));
    targetPose();
    const follow = reduced ? 1 : 1 - Math.exp(-dt * (focusIndex >= 0 ? 2.6 : 5.5));
    camPos.lerp(vPos, follow); camLook.lerp(vLook, follow);
    parallax.x += (parallax.tx - parallax.x) * 0.05; parallax.y += (parallax.ty - parallax.y) * 0.05;
    const lift = 1 - (1 - Math.pow(1 - intro, 3));          // 1 at the start, 0 when the intro ends
    camera.position.copy(camPos);
    if (!reduced) {
      camera.position.x += Math.sin(clock * 0.23) * 0.6 + (LITE ? 0 : parallax.x * 1.4) + lift * -30;
      camera.position.y += Math.sin(clock * 0.31) * 0.4 + (LITE ? 0 : -parallax.y * 0.8) + lift * 55;
      camera.position.z += lift * 110;
    }
    camera.lookAt(camLook);
    sky.position.copy(camera.position);

    if (pointerMoved && state.panel < 0 && !LITE) { pointerMoved = false; setHover(pick(pointerPixels.x, pointerPixels.y)); }

    // labels on towers (only the ones near the camera are shown)
    towers.forEach((tower, index) => {
      labelPoint.set(tower.x, tower.h + 5, tower.z);
      const opacity = state.panel >= 0 && state.panel !== index ? 0 : project(labelPoint, labels[index], { near: 150, maxY: 0.74 });
      labels[index].classList.toggle('on', opacity > 0.4);
    });
    // callout on the tallest bar of the opening chart
    const peakOpacity = clamp(1.25 - s, 0, 1) * clamp(intro * 1.4 - 0.5, 0, 1);
    project(peakPoint, peakEl, { near: 260 });
    peakEl.style.opacity = String(Math.min(Number(peakEl.style.opacity) || 0, peakOpacity));
    if (frames % 8 === 0) {
      peakEl.textContent = copy().peak(data.days[state.lang][data.peak.day], data.peak.hour, peakItem.value.toFixed(1));
      readoutZone.textContent = zoneName(Math.round(s));
      readoutAlt.textContent = `${String(Math.max(0, Math.round(camera.position.y))).padStart(3, '0')} m`;
      railFill.style.height = `${(s / (KEYS.length - 1)) * 100}%`;
    }
    frames += 1;

    renderer.info.reset();
    composer.render();

    // adapt quality: if frames are slow, lower the resolution a little
    if (dt > 0.026) slow += 1; else fast += 1;
    if (slow + fast >= 90) {
      if (slow > 45 && pixelRatio > 0.6) { pixelRatio = Math.max(0.6, pixelRatio - 0.2); applyRatio(); }
      slow = 0; fast = 0;
    }
  }

  function applyRatio() {
    renderer.setPixelRatio(pixelRatio); composer.setPixelRatio(pixelRatio);
    composer.setSize(window.innerWidth, window.innerHeight); dustUniforms.uPixel.value = pixelRatio;
  }
  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight, false); composer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', resize);

  composer.render(); // compile every shader before the loader fades out
  report(1);
  window.requestAnimationFrame(frame);

  return {
    start() { started = true; },
    focus(index) { focusIndex = index; setHover(-1); },
    release() { focusIndex = -1; },
    refreshLabels,
    stats: () => ({ calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, pixelRatio, s, instances: heatItems.length + city.length + towers.length + trafficCount }),
  };
}

/* ------------------------------------------------------------------ boot */
const loaderBar = $('#loader-bar'), loaderPct = $('#loader-pct');
const setProgress = (fraction) => {
  const percent = Math.round(clamp(fraction, 0, 1) * 100);
  loaderBar.style.width = `${percent}%`; loaderPct.textContent = `${percent}%`;
};

applyLang();

async function boot() {
  const images = PROJECTS.map((project) => new Promise((resolve) => {
    const image = new Image(); image.onload = image.onerror = resolve; image.src = `assets/charts/${project.id}.png`;
  }));
  let done = 0;
  images.forEach((promise) => promise.then(() => { done += 1; }));
  world = await createWorld((fraction) => setProgress(fraction * 0.85));
  if (!world) document.documentElement.classList.add('no-webgl');
  await Promise.all(images);
  setProgress(1);

  if (manifest.overlay) {
    const overlay = $('#overlay');
    overlay.src = manifest.overlay;
    overlay.addEventListener('canplay', () => { overlay.classList.add('on'); overlay.play().catch(() => {}); }, { once: true });
    overlay.load();
  }
  await new Promise((resolve) => window.setTimeout(resolve, 350));
  $('#loader').classList.add('done');
  if (world) world.start();
}
boot();

window.__skyline = { state, stats: () => (world ? world.stats() : null) }; // handy for performance checks in devtools
