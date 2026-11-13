/* Portfolio site: heat map, project cards, chart viewer, language and theme. No dependencies. */
(function () {
  "use strict";

  var GITHUB = "https://github.com/martinezramirezaxelalejandro04-ui/";
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Small helpers ---------- */
  function store(key, value) {
    try {
      if (value === undefined) return window.localStorage.getItem(key);
      window.localStorage.setItem(key, value);
    } catch (error) { /* private mode: the site works without remembering the choice */ }
    return null;
  }
  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  /* ---------- Content ---------- */
  var THEMES = {
    all: { es: "Todos", en: "All" },
    marketing: { es: "Marketing y medición", en: "Marketing and measurement" },
    prices: { es: "Precios y consumo", en: "Prices and consumers" },
    city: { es: "Ciudad, salud y ambiente", en: "City, health and environment" }
  };

  var PROJECTS = [
    { id: "paid-media-kit", theme: "marketing", tools: ["Python", "SQL", "KPIs"],
      figure: { es: "3 → 1", en: "3 → 1" },
      label: { es: "plataformas de anuncios unificadas en una sola tabla", en: "ad platforms unified into a single table" },
      title: { es: "Paid Media Kit", en: "Paid Media Kit" },
      question: { es: "¿Cómo puede una ONG medir sus anuncios sin pagar una herramienta?", en: "How can a non-profit measure its ads without paying for a tool?" },
      alt: { es: "Costo por conversión por plataforma con datos de ejemplo: Google 45, Meta 73 y TikTok 167 pesos.", en: "Cost per conversion by platform on sample data: Google 45, Meta 73 and TikTok 167 pesos." } },
    { id: "pruebas-ab-sin-trampas", theme: "marketing", tools: ["Python", "NumPy", "Estadística"],
      figure: { es: "5% → 28%", en: "5% → 28%" },
      label: { es: "de falsas alarmas al revisar una prueba A/B todos los días", en: "false positives when an A/B test is checked every day" },
      title: { es: "Pruebas A/B sin trampas", en: "A/B tests without the traps" },
      question: { es: "¿Por qué tantas pruebas \"ganadoras\" no lo son?", en: "Why are so many \"winning\" tests not real wins?" },
      alt: { es: "Falsas alarmas: 5% revisando una vez, 13% cada semana y 28% cada día.", en: "False positives: 5% when checked once, 13% weekly and 28% daily." } },
    { id: "vida-de-una-tendencia", theme: "marketing", tools: ["Python", "API de Wikimedia"],
      figure: { es: "58%", en: "58%" },
      label: { es: "de las tendencias en México dura un solo día", en: "of trending topics in Mexico last a single day" },
      title: { es: "Vida de una tendencia", en: "Life of a trend" },
      question: { es: "¿Cuánto dura un tema en la atención de México?", en: "How long does a topic hold Mexico's attention?" },
      alt: { es: "De cada 100 tendencias, 42 siguen el segundo día, 22 el tercero y 6 a la semana.", en: "Out of 100 trends, 42 remain on day two, 22 on day three and 6 after a week." } },
    { id: "radar-campanas-salud", theme: "marketing", tools: ["Python", "Prueba placebo"],
      figure: { es: "76%", en: "76%" },
      label: { es: "de las mediciones de días mundiales de salud superó el ruido normal", en: "of health awareness day measurements beat ordinary noise" },
      title: { es: "Radar de Campañas de Salud", en: "Health campaign radar" },
      question: { es: "¿Los días mundiales de salud hacen que la gente busque información?", en: "Do health awareness days make people look for information?" },
      alt: { es: "Lectores alrededor de seis días mundiales de salud: suben el día de la fecha y casi todo el efecto se va en una semana.", en: "Readers around six health awareness days: a spike on the day that mostly fades within a week." } },
    { id: "canasta-basica-mx", theme: "prices", tools: ["SQL", "Python", "PROFECO"],
      figure: { es: "20%", en: "20%" },
      label: { es: "más cuesta el mismo producto en una tienda cara que en una barata", en: "more for the same product in a pricey store than in a cheap one" },
      title: { es: "Canasta Básica MX", en: "Grocery basket MX" },
      question: { es: "¿Cuánto cambia el precio según dónde compras?", en: "How much does the price change depending on where you shop?" },
      alt: { es: "Índice de precios por cadena: de 4.2% por debajo a 5.5% por encima del precio típico nacional.", en: "Price index by chain: from 4.2% below to 5.5% above the typical national price." } },
    { id: "farmacias-mx", theme: "prices", tools: ["Python", "pandas", "PROFECO"],
      figure: { es: "$1,040 → $2,268", en: "$1,040 → $2,268" },
      label: { es: "por la misma lista de 20 medicamentos, según la cadena", en: "for the same list of 20 medicines, depending on the chain" },
      title: { es: "Farmacias MX", en: "Pharmacies MX" },
      question: { es: "¿Y el mismo medicamento?", en: "And the same medicine?" },
      alt: { es: "Costo de la misma lista de 20 medicamentos en 15 cadenas, de 1,040 a 2,268 pesos.", en: "Cost of the same list of 20 medicines in 15 chains, from 1,040 to 2,268 pesos." } },
    { id: "choques-cdmx", theme: "city", tools: ["Python", "pandas", "C5 CDMX"],
      figure: { es: "Vie 19:00", en: "Fri 7 pm" },
      label: { es: "el momento de la semana con más incidentes viales", en: "the moment of the week with the most road incidents" },
      title: { es: "Choques CDMX", en: "Crashes in Mexico City" },
      question: { es: "¿Cuándo hay más choques y cuándo son más graves?", en: "When do crashes happen, and when are they worse?" },
      alt: { es: "Choques con personas lesionadas según la hora: 56% a las 5:00 y 38% a las 20:00.", en: "Share of crashes with injuries by hour: 56% at 5 am and 38% at 8 pm." } },
    { id: "calor-extremo-mx", theme: "city", tools: ["Python", "ERA5", "Series de tiempo"],
      figure: { es: "12 → 27", en: "12 → 27" },
      label: { es: "días de calor extremo al año en la ciudad típica desde los años 80", en: "very hot days per year in the typical city since the 1980s" },
      title: { es: "Calor extremo MX", en: "Extreme heat MX" },
      question: { es: "¿Cuántos días de calor extremo más hay hoy?", en: "How many more very hot days are there today?" },
      alt: { es: "Días de calor extremo por año de 1980 a 2025 en la ciudad típica; el máximo es 2024 con 56 días.", en: "Very hot days per year, 1980 to 2025, in the typical city; the peak is 2024 with 56 days." } },
    { id: "aire-cdmx", theme: "city", tools: ["Python", "CAMS", "OMS"],
      figure: { es: "10:00 y 18:00", en: "10 am & 6 pm" },
      label: { es: "las horas menos contaminadas en Ciudad de México", en: "the least polluted hours in Mexico City" },
      title: { es: "Aire CDMX", en: "Air in Mexico City" },
      question: { es: "¿A qué hora conviene hacer ejercicio al aire libre?", en: "What time is best for outdoor exercise?" },
      alt: { es: "Partículas y ozono por hora frente al límite de la OMS: cuando bajan las partículas, sube el ozono.", en: "Particles and ozone by hour against the WHO level: when particles fall, ozone rises." } },
    { id: "lectura-facil-salud", theme: "city", tools: ["Python", "Texto", "Wikipedia"],
      figure: { es: "60 de 66", en: "60 of 66" },
      label: { es: "artículos de salud son difíciles de leer", en: "health articles are hard to read" },
      title: { es: "Lectura fácil en salud", en: "Plain language in health" },
      question: { es: "¿Qué tan difícil de leer es la información de salud?", en: "How hard to read is health information?" },
      alt: { es: "Artículos por facilidad de lectura: 29 muy difíciles, 31 algo difíciles, 4 normales y 2 bastante fáciles.", en: "Articles by readability: 29 very hard, 31 somewhat hard, 4 normal and 2 fairly easy." } },
    { id: "sismos-septiembre", theme: "city", tools: ["Python", "Estadística", "USGS"],
      figure: { es: "9 de 25", en: "9 of 25" },
      label: { es: "sismos de magnitud 7+ desde 1976 cayeron en septiembre; antes, 1 de 39", en: "magnitude 7+ quakes since 1976 struck in September; before that, 1 of 39" },
      title: { es: "¿Tiembla más en septiembre?", en: "More earthquakes in September?" },
      question: { es: "¿Septiembre es el mes de los sismos?", en: "Is September earthquake month?" },
      alt: { es: "Sismos de magnitud 7 o mayor por mes: septiembre destaca en 1976-2025 pero no en 1900-1975.", en: "Magnitude 7+ earthquakes by month: September stands out in 1976-2025 but not in 1900-1975." } }
  ];

  var TEXT = {
    es: {
      viewChart: "Ver gráfica", code: "Código ↗", openRepo: "Abrir el proyecto en GitHub ↗",
      langButton: "EN", langLabel: "Switch to English",
      days: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
      daysLong: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],
      readout: function (day, hour, value) { return day + ", " + hour + ":00 · <b>" + value + "</b> incidentes por hora"; },
      title: "Axel Martínez · Análisis de datos"
    },
    en: {
      viewChart: "View chart", code: "Code ↗", openRepo: "Open the project on GitHub ↗",
      langButton: "ES", langLabel: "Cambiar a español",
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      daysLong: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      readout: function (day, hour, value) { return day + ", " + hour + ":00 · <b>" + value + "</b> incidents per hour"; },
      title: "Axel Martínez · Data analysis"
    }
  };

  /* English for every element marked with data-i18n. Spanish is read from the page itself. */
  var PAGE = { es: {}, en: {
    "skip": "Skip to projects",
    "nav.value": "What I bring", "nav.projects": "Projects", "nav.method": "Method",
    "nav.profile": "Profile", "nav.contact": "Contact",
    "hero.eyebrow": "Data analysis · Mexico City",
    "hero.title": "I turn messy data into <em>clear decisions</em>.",
    "hero.lead": "I'm Axel Alejandro Martínez Ramírez, a data analyst with a background in Mechatronics Engineering from UNAM. I like taking scattered information, organising it with SQL and Python, and explaining clearly what it shows, in Spanish and in English, so a team can decide with confidence.",
    "hero.cta1": "Let's talk", "hero.cta2": "See all 11 projects", "hero.cta3": "3D version ↗",
    "heat.title": "When do crashes happen in Mexico City?",
    "heat.subtitle": "Confirmed road incidents per hour, 2022 to 2023. Hover or tap a cell.",
    "heat.less": "fewer", "heat.more": "more",
    "heat.link": "Out of 504 thousand reports to C5, 171 thousand are confirmed incidents. Read the project ↗",
    "stats.projects": "published analysis projects", "stats.records": "real records analysed",
    "stats.tests": "automated tests", "stats.sources": "open data sources",
    "value.title": "What I can bring to your team",
    "value.intro": "Each point links to a project where you can check it yourself.",
    "value.1.t": "Obtain and clean data",
    "value.1.p": "I started from 1.46 million raw rows and arrived at comparable tables, documenting every step: how many rows were left and why I removed the rest.",
    "value.1.a": "Evidence: Canasta Básica MX ↗",
    "value.2.t": "Reproducible SQL and Python",
    "value.2.p": "I write queries with CTEs and window functions, and pipelines that run end to end with a single command, backed by 116 automated tests.",
    "value.2.a": "Evidence: SQL queries ↗",
    "value.3.t": "Marketing measurement",
    "value.3.p": "I compute paid media KPIs rigorously, evaluate A/B tests to avoid false positives, and measure campaign effectiveness with a baseline and a placebo test.",
    "value.3.a": "Evidence: Paid Media Kit ↗",
    "value.4.t": "Communicate findings",
    "value.4.p": "Each chart carries one conclusion, with numbers anyone can follow and the limitations in plain sight. In Spanish and in English (C1).",
    "value.4.a": "Evidence: More earthquakes in September? ↗",
    "projects.title": "Eleven questions, eleven answers with data",
    "projects.intro": "All of them start from open data, explain their method and make clear what cannot be claimed.",
    "eng.eyebrow": "Engineering projects",
    "eng.title": "Two projects to understand in depth the tools I use",
    "eng.intro": "A database written from scratch and a finance calculator with verified formulas. Both run in the browser, with no server, and check their results against an independent reference.",
    "eng.t1": "Cenote: a SQL engine written from scratch",
    "eng.f1": "real rows you can query", "eng.f2": "comparisons with SQLite, 0 differences", "eng.f3": "dependencies or servers",
    "eng.note": "Type a query and see its tokens, its plan, the optimizer's rewrites and how data flows. I built it with AI assistance; the design and tests are documented.",
    "eng.cta1": "Open Cenote ↗", "eng.cta2": "Code on GitHub ↗",
    "eng2.t": "My peso over time: what happened to your money?",
    "eng2.f1": "of buying power lost under the mattress since 2002", "eng2.f2": "comparisons with a decimal reference, 0 differences", "eng2.f3": "years of inflation equal to INEGI's published figures",
    "eng2.note": "Enter an amount and a date and see what became of your money in Mexico, how your personal inflation compares with the official one, and what a loan really costs. Open data up to July 2024. I built it with AI assistance; it is not financial advice.",
    "eng2.cta1": "Open the calculator ↗",
    "method.title": "How I work",
    "method.intro": "A striking result is a reason to look more carefully, not to publish right away.",
    "method.1.t": "I start with the question", "method.1.p": "Every analysis starts with a decision someone needs to make.",
    "method.2.t": "Documented cleaning", "method.2.p": "Each step states how many rows remain and why.",
    "method.3.t": "Fair comparisons", "method.3.p": "Same product, same store; KPIs on totals, never averages of averages.",
    "method.4.t": "Verifiable results", "method.4.p": "Code with automated tests and data anyone can download again.",
    "method.5.t": "Limitations in plain sight", "method.5.p": "I also write down what the data cannot support.",
    "errors.title": "Three mistakes I was about to publish",
    "errors.1.t": "A warming that did not exist",
    "errors.1.p": "The temperature source switched weather models in 2017 and created a false jump. Requesting a single model for all 46 years fixed it.",
    "errors.1.a": "Calor extremo MX ↗",
    "errors.2.t": "Sentences 487 words long",
    "errors.2.p": "Invisible characters in Wikipedia footnotes were merging sentences and overstating reading difficulty. Once cleaned, \"very hard\" articles dropped from 51 to 29.",
    "errors.2.a": "Lectura fácil en salud ↗",
    "errors.3.t": "Pork did not get 45% cheaper",
    "errors.3.p": "The national median price of pork backbone fell from $129 to $71 because the mix of visited stores changed. In the same 114 stores, the typical price did not move.",
    "errors.3.a": "Canasta Básica MX ↗",
    "profile.title": "Profile",
    "profile.job.t": "Logistics and Service Operations Intern · HONOR Mexico",
    "profile.job.p": "I prepared carrier performance reports, reconciled settlements and followed incidents from start to finish.",
    "profile.lead.t": "Head of General Secretariat · Biomedical Systems Student Society, UNAM",
    "profile.lead.p": "I was the liaison between the student society, the faculty and external organisations, and I planned and delivered projects within deadlines and budget.",
    "profile.proj.t": "Project lead · Proyect Ingenious, School of Engineering",
    "profile.proj.p": "Led a multidisciplinary team that won first place among the participating teams.",
    "profile.edu.t": "Mechatronics Engineering · School of Engineering, UNAM",
    "skills.daily": "Everyday tools", "skills.excel": "Advanced Excel",
    "skills.applied": "Applied in these projects", "skills.apis": "Open data APIs",
    "skills.tests": "Hypothesis testing", "skills.sim": "Simulation",
    "skills.certs": "Certifications",
    "cert.1": "Data Analysis with Python (Pandas) · Kaggle",
    "cert.2": "Excel: Basic to Intermediate · Santander Open Academy",
    "cert.3": "Marketing Strategy Fundamentals · SCRUMstudy",
    "cert.4": "Scrum Fundamentals Certified · SCRUMstudy",
    "skills.lang": "Languages", "lang.es": "Spanish, native", "lang.en": "English, C1",
    "contact.title": "Looking for someone who takes care of the data and knows how to explain it?",
    "contact.p": "I'm looking to join a team as a data analyst, with a special interest in digital marketing and campaign measurement. I'm based in Coyoacán, Mexico City, and I'd be glad to talk.",
    "contact.email": "Send me an email",
    "foot.sources": "Data: PROFECO and datos.gob.mx, Mexico City's C5, USGS, Wikimedia, Open-Meteo and Copernicus. Each project cites its source and licence.",
    "foot.made": "Site built with HTML, CSS and JavaScript, no dependencies."
  } };

  var marked = document.querySelectorAll("[data-i18n]");
  marked.forEach(function (node) { PAGE.es[node.dataset.i18n] = node.innerHTML; });

  var language = store("lang") === "en" ? "en" : "es";
  var activeTheme = "all";

  /* ---------- Heat map (real data: confirmed incidents per hour, C5, 2022-2023) ---------- */
  var HEAT = [
    [5.9, 4.3, 2.6, 2.0, 1.7, 2.6, 5.1, 9.0, 11.9, 11.9, 9.9, 9.0, 10.3, 11.0, 13.0, 13.1, 12.6, 12.0, 12.2, 13.6, 12.2, 11.4, 9.4, 6.1],
    [3.6, 2.0, 1.8, 1.2, 1.2, 2.4, 4.8, 9.8, 13.5, 12.6, 11.9, 11.1, 10.7, 11.8, 13.6, 14.2, 13.1, 12.3, 11.9, 14.5, 13.5, 11.8, 9.8, 6.7],
    [4.5, 2.9, 1.8, 1.4, 1.4, 2.5, 4.8, 10.4, 13.3, 13.6, 11.1, 10.5, 11.2, 11.5, 13.2, 13.9, 13.7, 12.7, 13.4, 14.7, 13.4, 12.5, 10.1, 7.1],
    [5.1, 3.4, 2.6, 1.7, 1.8, 2.8, 4.8, 9.8, 13.2, 12.7, 10.5, 10.8, 10.2, 11.4, 12.6, 13.7, 13.2, 12.3, 12.6, 15.1, 15.3, 12.2, 10.7, 8.5],
    [6.1, 5.0, 3.5, 2.9, 2.5, 3.5, 5.0, 9.1, 11.9, 11.4, 11.2, 10.4, 10.9, 11.3, 14.5, 14.8, 15.2, 14.2, 14.6, 17.3, 16.9, 16.1, 14.5, 12.8],
    [10.6, 9.7, 8.7, 8.1, 6.6, 6.8, 6.7, 7.3, 8.6, 9.2, 9.6, 11.1, 11.3, 12.5, 14.1, 14.4, 14.4, 13.4, 12.3, 14.8, 14.6, 13.4, 13.2, 11.7],
    [10.8, 10.3, 8.9, 8.9, 8.1, 6.4, 5.8, 7.0, 6.8, 7.1, 7.9, 8.4, 9.1, 10.0, 11.1, 11.9, 11.8, 11.3, 11.6, 13.3, 13.4, 13.0, 11.3, 8.7]
  ];
  var PEAK = { day: 4, hour: 19 };
  var heat = document.getElementById("heat");
  var readout = document.getElementById("heat-readout");
  var activeCell = null;

  function showReadout(day, hour) {
    readout.innerHTML = TEXT[language].readout(TEXT[language].daysLong[day], hour, HEAT[day][hour].toFixed(1));
  }
  function buildHeat() {
    var flat = [].concat.apply([], HEAT);
    var low = Math.min.apply(null, flat), high = Math.max.apply(null, flat);
    heat.textContent = "";
    HEAT.forEach(function (row, day) {
      heat.appendChild(element("span", "label", TEXT[language].days[day]));
      row.forEach(function (value, hour) {
        var cell = element("span", "cell");
        cell.dataset.day = day;
        cell.dataset.hour = hour;
        cell.style.setProperty("--level", Math.round(8 + 92 * (value - low) / (high - low)) + "%");
        cell.style.setProperty("--order", hour + day * 3);
        if (day === PEAK.day && hour === PEAK.hour) cell.classList.add("is-peak");
        heat.appendChild(cell);
      });
    });
    heat.appendChild(element("span", "label", ""));
    for (var hour = 0; hour < 24; hour += 1) {
      heat.appendChild(element("span", "hour", hour % 3 === 0 ? String(hour) : ""));
    }
    showReadout(PEAK.day, PEAK.hour);
  }
  function pointAt(target) {
    if (!target.classList || !target.classList.contains("cell")) return;
    if (activeCell) activeCell.classList.remove("is-active");
    activeCell = target;
    activeCell.classList.add("is-active");
    showReadout(Number(target.dataset.day), Number(target.dataset.hour));
  }
  heat.addEventListener("pointerover", function (event) { pointAt(event.target); });
  heat.addEventListener("pointerdown", function (event) { pointAt(event.target); });
  heat.addEventListener("pointerleave", function () {
    if (activeCell) activeCell.classList.remove("is-active");
    activeCell = null;
    showReadout(PEAK.day, PEAK.hour);
  });

  /* ---------- Project cards and filters ---------- */
  var chips = document.getElementById("chips");
  var cards = document.getElementById("cards");
  var viewer = document.getElementById("viewer");
  var viewerTitle = document.getElementById("viewer-title");
  var viewerImage = document.getElementById("viewer-img");
  var viewerLink = document.getElementById("viewer-link");

  function openViewer(project) {
    viewerTitle.textContent = project.title[language];
    viewerImage.src = "assets/charts/" + project.id + ".png";
    viewerImage.alt = project.alt[language];
    viewerLink.href = GITHUB + project.id;
    viewerLink.textContent = TEXT[language].openRepo;
    if (typeof viewer.showModal === "function") viewer.showModal();
    else window.open(viewerImage.src, "_blank", "noopener");
  }
  document.getElementById("viewer-close").addEventListener("click", function () { viewer.close(); });
  viewer.addEventListener("click", function (event) { if (event.target === viewer) viewer.close(); });

  function renderChips() {
    chips.textContent = "";
    Object.keys(THEMES).forEach(function (key) {
      var count = key === "all" ? PROJECTS.length
        : PROJECTS.filter(function (project) { return project.theme === key; }).length;
      var chip = element("button", "chip", THEMES[key][language]);
      chip.type = "button";
      chip.setAttribute("aria-pressed", String(key === activeTheme));
      chip.appendChild(element("small", "", String(count)));
      chip.addEventListener("click", function () { activeTheme = key; renderChips(); renderCards(); });
      chips.appendChild(chip);
    });
  }
  function renderCards() {
    cards.textContent = "";
    PROJECTS.filter(function (project) {
      return activeTheme === "all" || project.theme === activeTheme;
    }).forEach(function (project) {
      var card = element("article", "card");
      card.appendChild(element("p", "card-theme", THEMES[project.theme][language]));
      card.appendChild(element("p", "card-figure", project.figure[language]));
      card.appendChild(element("p", "card-label", project.label[language]));
      card.appendChild(element("h3", "", project.title[language]));
      card.appendChild(element("p", "card-question", project.question[language]));
      var tools = element("ul", "tags");
      project.tools.forEach(function (tool) { tools.appendChild(element("li", "", tool)); });
      card.appendChild(tools);
      var actions = element("div", "card-actions");
      var button = element("button", "", TEXT[language].viewChart);
      button.type = "button";
      button.addEventListener("click", function () { openViewer(project); });
      var link = element("a", "", TEXT[language].code);
      link.href = GITHUB + project.id;
      link.rel = "noopener";
      link.setAttribute("aria-label", project.title[language] + ": GitHub");
      actions.appendChild(button);
      actions.appendChild(link);
      card.appendChild(actions);
      cards.appendChild(card);
    });
  }

  /* ---------- Language ---------- */
  var languageButton = document.getElementById("lang");
  function applyLanguage() {
    document.documentElement.lang = language;
    document.title = TEXT[language].title;
    marked.forEach(function (node) {
      var text = PAGE[language][node.dataset.i18n];
      if (text !== undefined) node.innerHTML = text;
    });
    languageButton.textContent = TEXT[language].langButton;
    languageButton.setAttribute("aria-label", TEXT[language].langLabel);
    buildHeat();
    renderChips();
    renderCards();
  }
  languageButton.addEventListener("click", function () {
    language = language === "es" ? "en" : "es";
    store("lang", language);
    applyLanguage();
  });

  /* ---------- Theme ---------- */
  var root = document.documentElement;
  var savedTheme = store("theme");
  if (savedTheme === "light" || savedTheme === "dark") root.dataset.theme = savedTheme;
  document.getElementById("theme").addEventListener("click", function () {
    var systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var current = root.dataset.theme || (systemDark ? "dark" : "light");
    root.dataset.theme = current === "dark" ? "light" : "dark";
    store("theme", root.dataset.theme);
  });

  /* ---------- Count-up numbers and reveal on scroll ---------- */
  function countUp(node) {
    var target = Number(node.dataset.count);
    var decimals = Number(node.dataset.decimals || 0);
    var suffix = node.dataset.suffix || "";
    var started = null;
    function frame(now) {
      if (started === null) started = now;
      var progress = Math.min((now - started) / 900, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      node.textContent = (target * eased).toFixed(decimals) + suffix;
      if (progress < 1) window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  }
  var revealTargets = document.querySelectorAll(".block-head, .value, .error, .principles li, .timeline article, .skills, .contact");
  if ("IntersectionObserver" in window && !reducedMotion) {
    revealTargets.forEach(function (node) { node.classList.add("reveal"); });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        if (entry.target.dataset.count) countUp(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    revealTargets.forEach(function (node) { observer.observe(node); });
    document.querySelectorAll("[data-count]").forEach(function (node) { observer.observe(node); });
  }

  applyLanguage();
})();
