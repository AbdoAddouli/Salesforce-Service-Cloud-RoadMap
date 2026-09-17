/* =============================================================================
 * Service Cloud Consultant Academy — app
 * Client-side learning app: hash routing, lesson renderer, quiz engine,
 * progress persistence (localStorage), search, keyboard shortcuts.
 * ============================================================================= */

/* ------------------------- theme ------------------------- */

function getTheme() {
  return document.documentElement.getAttribute('data-theme') || 'dark';
}
function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('sccacademy-theme', t);
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = t === 'dark' ? '🌙' : '☀️';
}

/* ------------------------- small helpers ------------------------- */

const $  = (s, c) => (c || document).querySelector(s);
const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

const esc = (s = '') => s.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
const cyrb53 = s => { let h = 9; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 2654435761); return (h ^ h >>> 9) >>> 0; };

/* Repository artifacts live outside the published /docs folder, so link to their
   GitHub blob (works locally and on GitHub Pages). */
const REPO_BLOB = 'https://github.com/AbdoAddouli/Salesforce-Service-Cloud-RoadMap/blob/main/';
const artifactHref = h => /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(h) ? h : REPO_BLOB + h.split('/').map(encodeURIComponent).join('/');

const MODULES = ACADEMY;

/* ------------------------- progress store ------------------------- */

const KEY = 'sccacademy-v1';
let store = load();

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || defaultStore(); }
  catch (e) { return defaultStore(); }
}
function defaultStore() {
  return { done: {}, quiz: {}, best: {}, stars: {}, guide: {}, bookmarks: {}, notes: {}, name: '', lastOpen: null };
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {}
}
function lessonDone(mid, li)  { return !!store.done[mid + ':' + li]; }
function markDone(mid, li, v) { store.done[mid + ':' + li] = v; save(); }
function guideRead(mid)       { return !!(store.guide && store.guide[mid]); }
function markGuideRead(mid, v) { if (!store.guide) store.guide = {}; store.guide[mid] = v; save(); }

/* bookmarks + notes */
function lessonKey(mid, li) { return mid + ':' + li; }
function isBookmarked(mid, li) { return !!(store.bookmarks && store.bookmarks[lessonKey(mid, li)]); }
function toggleBookmark(mid, li) {
  if (!store.bookmarks) store.bookmarks = {};
  const k = lessonKey(mid, li);
  if (store.bookmarks[k]) delete store.bookmarks[k]; else store.bookmarks[k] = 1;
  save();
  return !!store.bookmarks[k];
}
function bookmarkCount() { return store.bookmarks ? Object.keys(store.bookmarks).length : 0; }
function getNote(mid, li) { return (store.notes && store.notes[lessonKey(mid, li)]) || ''; }
function setNote(mid, li, v) {
  if (!store.notes) store.notes = {};
  const k = lessonKey(mid, li);
  if (v && v.trim()) store.notes[k] = v; else delete store.notes[k];
  save();
}
function noteCount() { return store.notes ? Object.keys(store.notes).length : 0; }
function moduleProgress(mid) {
  const m = byId(mid);
  if (!m) return { done: 0, total: 0, pct: 0, quizPct: 0, complete: 0, totalUnits: 0 };
  const lessons = m.lessons.length;
  let done = 0;
  if (guideRead(mid)) {
    done = lessons;
  } else {
    m.lessons.forEach((_, i) => { if (lessonDone(mid, i)) done++; });
  }
  const units = lessons * 2 + 1;
  const earned = done * 2 + (store.quiz[mid] ? 1 : 0);
  const pct = Math.round((earned / units) * 100);
  const complete = earned >= units;
  return { done, total: lessons, pct, quizPct: quizPctOf(mid), complete, earned, units };
}
function quizPctOf(mid) {
  const m = byId(mid);
  if (!m || !store.best[mid]) return 0;
  return Math.round((store.best[mid] / m.quiz.questions.length) * 100);
}
function overallPct() {
  const rows = MODULES.map(m => {
    const p = moduleProgress(m.id);
    return p.units ? p.earned / p.units * 100 : 0;
  });
  return Math.round(rows.reduce((a, b) => a + b, 0) / rows.length);
}
function minutesLeft() {
  let left = 0;
  MODULES.forEach(m => {
    if (guideRead(m.id)) return;
    m.lessons.forEach((l, i) => { if (!lessonDone(m.id, i)) left += l.mins; });
    if (!store.quiz[m.id]) left += m.quiz.mins;
  });
  return left;
}
function nextIncomplete(limit) {
  const out = [];
  for (const m of MODULES) {
    if (guideRead(m.id)) continue;
    for (let i = 0; i < m.lessons.length; i++) {
      if (!lessonDone(m.id, i)) { out.push({ m, i }); if (out.length >= limit) return out; }
    }
  }
  return out;
}

function byId(id) { return MODULES.find(m => m.id === id); }

/* ------------------------- routing ------------------------- */

let route = { view: 'home', mid: null, li: null };

function navigate(view, mid, li) {
  route = { view, mid, li: li != null ? li : null };
  history.replaceState(null, '', '#' + hashFor());
  render();
}
function hashFor() {
  if (route.view === 'phase') return '/phase/' + route.mid;
  if (route.view === 'lesson') return '/lesson/' + route.mid + '/' + route.li;
  if (route.view === 'quiz')  return '/quiz/' + route.mid;
  if (route.view === 'guide') return '/guide/' + route.mid + (route.anchor ? '/' + route.anchor : '');
  if (route.view === 'bookmarks') return '/bookmarks';
  if (route.view === 'certificate') return '/certificate';
  return '/';
}
function parseHash() {
  const h = decodeURIComponent((location.hash || '#/').replace(/^#/, ''));
  const parts = h.split('/').filter(Boolean);
  if (parts[0] === 'phase') return { view: 'phase', mid: parts[1] };
  if (parts[0] === 'lesson') return { view: 'lesson', mid: parts[1], li: Number(parts[2]) };
  if (parts[0] === 'quiz')   return { view: 'quiz', mid: parts[1] };
  if (parts[0] === 'guide')  return { view: 'guide', mid: parts[1], anchor: parts[2] || null };
  if (parts[0] === 'bookmarks') return { view: 'bookmarks' };
  if (parts[0] === 'certificate') return { view: 'certificate' };
  return { view: 'home' };
}

/* ------------------------- renderer ------------------------- */

const view = $('#view');

function render() {
  if (quizKeyHandler) { document.removeEventListener('keydown', quizKeyHandler); quizKeyHandler = null; }
  const mod = route.mid ? byId(route.mid) : null;
  const r = parseHash();
  let titleSuffix = mod ? ' · ' + mod.title : '';
  if (r.view === 'bookmarks') titleSuffix = ' · Bookmarks';
  if (r.view === 'certificate') titleSuffix = ' · Certificate';
  document.title = 'Service Cloud Consultant Academy' + titleSuffix;

  renderSidebar();

  const tp = $('#topPct');
  if (tp) tp.textContent = overallPct() + '%';
  const tbar = $('#topBar');
  if (tbar) tbar.style.width = overallPct() + '%';
  bindTopSearch();

  if (r.view === 'phase')  return renderModule(mod);
  if (r.view === 'lesson') return renderLesson(mod, Math.min(Number(r.li) || 0, mod.lessons.length - 1));
  if (r.view === 'quiz')   return renderQuiz(mod);
  if (r.view === 'guide')  return renderGuide(mod);
  if (r.view === 'bookmarks') return renderBookmarks();
  if (r.view === 'certificate') return renderCertificate();
  renderHome();
}

/* ------------------------- sidebar ------------------------- */

function renderSidebar() {
  const aside = $('aside.sidebar');
  aside.innerHTML = `
    <div class="side-brand">
      <div class="logo">&#9745;</div>
      <div><b>Service Cloud Consultant Academy</b><span>${MODULES.length}-phase roadmap</span></div>
    </div>`;

  const nav = document.createElement('nav');
  nav.className = 'side-nav';
  nav.id = 'sidebarNav';

  const mkLink = (href, viewName, icon, label, extra) => {
    const a = document.createElement('a');
    a.href = href;
    const active = route.view === viewName;
    a.className = 'side-link' + (active ? ' active' : '');
    if (active) a.setAttribute('aria-current', 'page');
    a.innerHTML = `<span class="sli">${icon}</span> ${label}${extra || ''}`;
    return a;
  };
  nav.appendChild(mkLink('#/', 'home', '&#127968;', 'Dashboard'));
  nav.appendChild(mkLink('#/bookmarks', 'bookmarks', '&#9733;', 'Bookmarks', bookmarkCount() ? `<span class="sl-count">${bookmarkCount()}</span>` : ''));

  MODULES.forEach(m => {
    const p = moduleProgress(m.id);
    const a = document.createElement('a');
    a.href = '#/phase/' + m.id;
    a.className = 'side-phase' + (route.mid === m.id ? ' active' : '');
    if (route.mid === m.id) a.setAttribute('aria-current', 'page');
    a.innerHTML = `
      <span class="sp-n" style="border-color:${m.color}">${String(m.n).padStart(2, '0')}</span>
      <span class="sp-body">
        <span class="sp-title">${m.title}</span>
        <span class="sp-bar"><i style="width:${p.pct}%;background:${m.color}"></i></span>
      </span>
      <span class="sp-pct">${p.pct}%</span>
      ${p.complete ? '<span class="sp-ok">&#10003;</span>' : ''}`;
    nav.appendChild(a);
  });

  aside.appendChild(nav);

  const tools = document.createElement('div');
  tools.className = 'side-tools';
  tools.innerHTML = `
    <button class="tool-btn" id="exportBtn" title="Download your progress as a file">&#11015;&#65039; Export</button>
    <button class="tool-btn" id="importBtn" title="Restore progress from a file">&#11014;&#65039; Import</button>
    <button class="tool-btn danger" id="resetBtn" title="Erase all progress">&#8634; Reset</button>`;
  aside.appendChild(tools);
  $("#exportBtn", tools).addEventListener('click', exportProgress);
  $("#importBtn", tools).addEventListener('click', pickImport);
  $("#resetBtn", tools).addEventListener('click', () => {
    if (confirm('Erase all progress, bookmarks and notes? This cannot be undone.')) {
      store = defaultStore(); save(); navigate('home'); toast('Progress reset');
    }
  });

  const progWrap = document.createElement('div');
  progWrap.className = 'side-progress';
  const op = overallPct();
  progWrap.innerHTML = `<div class="sp-bar big"><i style="width:${op}%"></i></div>
    <div class="side-prog-label"><b>${op}%</b> of roadmap complete</div>`;
  aside.appendChild(progWrap);
}

/* ------------------------- progress export / import ------------------------- */

function exportProgress() {
  try {
    const blob = new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'service-cloud-academy-progress.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast('Progress exported &#11015;&#65039;');
  } catch (e) { toast('Export failed'); }
}
function pickImport() {
  let input = $('#importFile');
  if (!input) {
    input = document.createElement('input');
    input.type = 'file'; input.accept = 'application/json,.json'; input.id = 'importFile';
    input.style.display = 'none';
    document.body.appendChild(input);
    input.addEventListener('change', () => {
      if (input.files && input.files[0]) importProgress(input.files[0]);
      input.value = '';
    });
  }
  input.click();
}
function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data || typeof data !== 'object') throw new Error('bad');
      store = Object.assign(defaultStore(), data);
      save(); navigate('home');
      toast('Progress imported &#11014;&#65039;');
    } catch (e) { toast('Could not read that file'); }
  };
  reader.readAsText(file);
}

/* ------------------------- home ------------------------- */

function renderHome() {
  const op = overallPct();
  const totalLessons = MODULES.reduce((a, m) => a + m.lessons.length, 0);
  const totalMin = MODULES.reduce((a, m) => a + m.lessons.reduce((x, l) => x + l.mins, 0), 0) + MODULES.reduce((a, m) => a + m.quiz.mins, 0);
  const totalDone = MODULES.reduce((a, m) => a + moduleProgress(m.id).earned, 0);
  const totalUnits = MODULES.reduce((a, m) => a + moduleProgress(m.id).units, 0);
  const left = minutesLeft();

  let next = null;
  for (const m of MODULES) {
    for (let i = 0; i < m.lessons.length; i++) {
      if (!lessonDone(m.id, i)) { next = { m, i }; break; }
    }
    if (next) break;
  }
  if (!next) next = { m: MODULES[0], i: 0 };
  let resume = null;
  if (store.lastOpen && byId(store.lastOpen.mid)) {
    const lm = byId(store.lastOpen.mid);
    resume = { m: lm, li: Math.max(0, Math.min(store.lastOpen.li, lm.lessons.length - 1)) };
  }
  if (!resume) resume = { m: next.m, li: next.i };
  const rm = resume.m;
  const upcoming = nextIncomplete(3);

  view.innerHTML = `
    <div class="home-hero reveal">
      <div>
        <div class="hero-kicker">Salesforce Service Cloud · study for certification</div>
        <h1 class="hero-title">Become <span class="grad">Service Cloud certified</span>, phase by phase.</h1>
        <p class="hero-sub">${MODULES.length} guided modules, ${totalLessons} lessons, ${MODULES.length} quizzes — with real metadata in the repo to deploy and practice on.</p>
        <div class="hero-actions">
          <button class="btn primary" id="startBtn">${next ? '&#9654; Continue learning' : '&#127881; Restart'}</button>
          <button class="btn ghost" id="phasesBtn">Browse all phases</button>
          <button class="btn ghost" id="searchBtn2">&#128269; Search <span class="kbd">/</span></button>
          <span class="hero-meta">&#128197; ${MODULES.length} phases · ${totalLessons} lessons · ~${left} min left</span>
        </div>
      </div>
      <div class="ring-wrap">
        <div class="ring" style="--p:${op}"><span>${op}<small>%</small></span></div>
        <div class="ring-caption">roadmap progress</div>
      </div>
    </div>

    <div class="stats reveal">
      <div class="stat"><div class="st-n">${totalDone}<small>/${totalUnits}</small></div><div class="st-l">units completed</div></div>
      <div class="stat"><div class="st-n">${MODULES.filter(m => moduleProgress(m.id).complete).length}<small>/</small></div><div class="st-l">phases mastered</div></div>
      <div class="stat"><div class="st-n">${MODULES.filter(m => store.best[m.id] >= m.quiz.questions.length).length}<small>/</small></div><div class="st-l">quizzes passed</div></div>
      <div class="stat"><div class="st-n">${left}<small> min</small></div><div class="st-l">~ study time left</div></div>
    </div>

    ${op >= 100 ? `
    <a class="cert-banner reveal" href="#/certificate">
      <span class="cb-ico">&#127891;</span>
      <span class="cb-body"><b>Roadmap complete!</b><span>You finished all ${MODULES.length} phases — claim your certificate.</span></span>
      <span class="cb-go">Get certificate &#8594;</span>
    </a>` : ''}

    <div class="home-cards">
      <div class="card continue-card" style="--c:${rm.color}">
        <div class="cc-top"><span class="cc-label">Continue where you left off</span><span class="pill">Phase ${rm.n}</span></div>
        <h3>${resume.li != null && resume.li < rm.lessons.length ? rm.lessons[resume.li].title : rm.lessons[0].title}</h3>
        <div class="cc-sub">${rm.title}</div>
        <div class="sp-bar"><i style="width:${moduleProgress(rm.id).pct}%;background:${rm.color}"></i></div>
        <button class="btn primary sm" id="resumeBtn">Resume &#8594;</button>
      </div>
      <div class="card next-card" style="--c:${next.m.color}">
        <div class="cc-top"><span class="cc-label">Next up</span><span class="pill">Phase ${next.m.n}</span></div>
        <h3>${next.i != null && next.i < next.m.lessons.length ? next.m.lessons[next.i].title : next.m.lessons[0].title}</h3>
        <div class="cc-sub">${next.m.lessons[next.i].mins} min · ${next.m.lessons.length} lessons · ${next.m.quiz.questions.length}-question quiz</div>
        <button class="btn sm" id="nextBtn">Open &#8594;</button>
      </div>
      <div class="card plan-card" style="--c:#e8b93d">
        <div class="cc-top"><span class="cc-label">Your next steps</span><span class="pill">${upcoming.length}</span></div>
        <ol class="plan-list">
          ${upcoming.length ? upcoming.map(x => `
            <li>
              <a href="#/lesson/${x.m.id}/${x.i}">
                <span class="pl-n" style="background:${x.m.color}">${String(x.m.n).padStart(2, '0')}</span>
                <span class="pl-t">${esc(x.m.lessons[x.i].title)}<small>${esc(x.m.title)} · ${x.m.lessons[x.i].mins} min</small></span>
              </a>
            </li>`).join('') : '<li class="pl-done">&#127881; Nothing left &mdash; every lesson is complete!</li>'}
        </ol>
      </div>
    </div>

    <div class="grid-head reveal"><h2>Your roadmap</h2><span id="gridCount"></span></div>
    <div class="grid-tools reveal">
      <span class="gt-ico">&#128269;</span>
      <input id="phaseFilter" type="search" placeholder="Filter phases — try omni, knowledge, entitlement, SLA, bot…" autocomplete="off" />
    </div>
    <div class="module-grid reveal" id="modGrid"></div>`;

  $('#startBtn').addEventListener('click', () => navigate('lesson', resume.m.id, resume.li != null && resume.li < rm.lessons.length ? resume.li : 0));
  $('#resumeBtn').addEventListener('click', () => navigate('lesson', resume.m.id, resume.li != null && resume.li < rm.lessons.length ? resume.li : 0));
  $('#nextBtn').addEventListener('click', () => navigate('lesson', next.m.id, next.i));
  $('#phasesBtn').addEventListener('click', () => navigate('phase', MODULES[0].id));
  const sb2 = $('#searchBtn2');
  if (sb2) sb2.addEventListener('click', openSearch);

  const grid = $('#modGrid');
  const countEl = $('#gridCount');
  function drawGrid(q) {
    q = (q || '').trim().toLowerCase();
    grid.innerHTML = '';
    const list = !q ? MODULES : MODULES.filter(m =>
      (m.title + ' ' + m.tagline + ' ' + m.objectives.join(' ') + ' ' + m.lessons.map(l => l.title).join(' ')).toLowerCase().includes(q));
    if (countEl) countEl.textContent = q
      ? list.length + ' of ' + MODULES.length + ' phases match'
      : MODULES.length + ' phases · study in order or jump anywhere';
    if (!list.length) {
      const empty = document.createElement('div');
      empty.className = 'grid-empty';
      empty.textContent = 'No phases match "' + q + '".';
      grid.appendChild(empty);
      return;
    }
    list.forEach(m => {
      const p = moduleProgress(m.id);
      const card = document.createElement('a');
      card.href = '#/phase/' + m.id;
      card.className = 'mod-card';
      card.style.setProperty('--c', m.color);
      card.innerHTML = `
        <div class="mc-top">
          <span class="mc-num">${String(m.n).padStart(2, '0')}</span>
          <span class="mc-ico">${m.icon}</span>
          ${p.complete ? '<span class="mc-done">&#10003; completed</span>' : ''}
        </div>
        <h3>${esc(m.title)}</h3>
        <div class="mc-tag">${esc(m.tagline)}</div>
        <div class="mc-prog">
          <div class="sp-bar"><i style="width:${p.pct}%;background:${m.color}"></i></div>
          <div class="mc-sub">${p.done}/${p.total} lessons · ${p.quizPct}% quiz</div>
        </div>
        <div class="mc-foot">
          <span>${m.lessons.length} lessons · ${m.quiz.questions.length} quiz</span>
          <span class="mc-arrow">&#8594;</span>
        </div>`;
      grid.appendChild(card);
    });
  }
  drawGrid('');
  const pf = $('#phaseFilter');
  if (pf) pf.addEventListener('input', () => drawGrid(pf.value));
}

/* ------------------------- module/phase page ------------------------- */

function renderModule(mod) {
  const p = moduleProgress(mod.id);
  const quizScore = store.best[mod.id];
  view.innerHTML = `
    <div class="crumb reveal"><a href="#/">Dashboard</a> <span>&#8250;</span> <b>${mod.title}</b></div>

    <div class="phase-hero reveal" style="--c:${mod.color}">
      <div class="ph-ico">${mod.icon}</div>
      <div class="ph-body">
        <div class="ph-kicker">Phase ${String(mod.n).padStart(2, '0')} · ${mod.tagline}</div>
        <h1>${mod.title}</h1>
        <div class="ph-obj"><span>By the end you can:</span>
          <ul>${mod.objectives.map(o => `<li>${esc(o)}</li>`).join('')}</ul>
        </div>
      </div>
      <div class="ph-side">
        <div class="ring sm" style="--p:${p.pct};--c:${mod.color}"><span>${p.pct}<small>%</small></span></div>
        <div class="ph-stats">
          <span>${p.done}/${p.total} lessons</span>
          <span>${store.quiz[mod.id] ? '&#10003; quiz taken' : 'quiz pending'}</span>
        </div>
        <a class="btn primary sm" href="#/guide/${mod.id}">&#128214; Read the full guide</a>
      </div>
    </div>

    <div class="lessons reveal">
      <a class="lesson-row guide-row" href="#/guide/${mod.id}" style="--c:${mod.color}">
        <span class="lr-state guide">&#128214;</span>
        <span class="lr-info">
          <b>Full module guide</b>
          <span class="lr-meta">complete walkthrough · sections, tables, code &amp; checklists${guideRead(mod.id) ? ' · read &#10003;' : ''}</span>
        </span>
        <span class="lr-arrow">&#8594;</span>
      </a>
      ${mod.lessons.map((l, i) => `
        <a class="lesson-row" href="#/lesson/${mod.id}/${i}" style="--c:${mod.color}">
          <span class="lr-state">${lessonDone(mod.id, i) ? '<span class="lr-done">&#10003;</span>' : String(i + 1).padStart(2, '0')}</span>
          <span class="lr-info">
            <b>${l.title}</b>
            <span class="lr-meta">${l.mins} min</span>
          </span>
          <span class="lr-arrow">&#8594;</span>
        </a>`).join('')}
    </div>

    <div class="quiz-card reveal" style="--c:${mod.color}">
      <div class="qc-left">
        <div class="qc-ico">&#129504;</div>
        <div>
          <h3>Module quiz · check your understanding</h3>
          <p>${mod.quiz.questions.length} questions · ${mod.quiz.mins} min.
             ${quizScore != null ? `Your best: <b>${quizScore}/${mod.quiz.questions.length}</b> (${Math.round(quizScore / mod.quiz.questions.length * 100)}%).` : 'Not attempted yet.'}
          </p>
        </div>
      </div>
      <div class="qc-right">
        ${quizScore != null && quizScore === mod.quiz.questions.length ? '<span class="qc-perfect">&#9733; perfect</span>' : ''}
        <a class="btn primary" href="#/quiz/${mod.id}">${quizScore != null ? 'Retake quiz' : 'Take quiz &#8594;'}</a>
      </div>
    </div>

    <div class="artifacts reveal">
      <h3>&#128230; Real artifacts in this repo</h3>
      <div class="artifacts-grid">
        ${mod.art.map(a => `
          <a class="artifact" target="_blank" rel="noopener"
             href="${artifactHref(a.href)}" style="--c:${mod.color}">
            <span class="a-ico">&#128444;&#65039;</span> <span>${a.label}</span>
          </a>`).join('')}
      </div>
    </div>

    <div class="phase-nav reveal">
      ${mod.n > 1 ? `<a class="btn ghost" href="#/phase/${MODULES[mod.n - 2].id}">&#8592; ${MODULES[mod.n - 2].title}</a>` : '<span></span>'}
      ${mod.n < MODULES.length
        ? `<a class="btn primary" href="#/phase/${MODULES[mod.n].id}">${MODULES[mod.n].title} &#8594;</a>`
        : `<a class="btn primary" href="#/quiz/${mod.id}">&#127919; Take the final quiz</a>`}
    </div>`;
}

/* ------------------------- lesson page ------------------------- */

function renderLesson(mod, li) {
  const lesson = mod.lessons[li];
  const prevI = li > 0 ? li - 1 : null;
  const nextI = li < mod.lessons.length - 1 ? li + 1 : null;
  const done = lessonDone(mod.id, li);
  const bm = isBookmarked(mod.id, li);
  const note = getNote(mod.id, li);

  view.innerHTML = `
    <div class="crumb reveal"><a href="#/">Dashboard</a> <span>&#8250;</span> <a href="#/phase/${mod.id}">${mod.title}</a> <span>&#8250;</span> <b>${lesson.title}</b></div>

    <div class="lesson-wrap reveal">
      <aside class="lesson-toc">
        <div class="toc-title">${mod.title}</div>
        ${mod.lessons.map((l, i) => `
          <a href="#/lesson/${mod.id}/${i}" class="toc-item ${i === li ? 'active' : ''}">
            <span class="toc-state">${lessonDone(mod.id, i) ? '&#10003;' : i + 1}</span>
            <span>${l.title}<span class="toc-min">${l.mins}&#8242;</span></span>
          </a>`).join('')}
        <a href="#/guide/${mod.id}" class="toc-item toc-guide" style="--c:${mod.color}">
          <span class="toc-state">&#128214;</span><span>Full module guide</span>
        </a>
        <a href="#/quiz/${mod.id}" class="toc-item toc-quiz" style="--c:${mod.color}">
          <span class="toc-state">&#129504;</span><span>Module quiz</span>
        </a>
      </aside>

      <article class="lesson article" style="--c:${mod.color}">
        <div class="lesson-head" style="--c:${mod.color}">
          <div class="lh-meta">Phase ${String(mod.n).padStart(2, '0')} · Lesson ${li + 1} of ${mod.lessons.length} · ${lesson.mins} min</div>
          <h1>${lesson.title}</h1>
        </div>
        <div class="chips">
          ${mod.objectives.map((o, i) => `<span class="chip-o">${o}</span>`).join('')}
        </div>

        <div class="blocks">${lesson.blocks.map(renderBlock).join('')}</div>

        <div class="lesson-foot">
          <div class="lf-left">
            ${done
              ? '<button class="btn ghost sm" id="unbtn">&#8617; Mark as unlearned</button>'
              : `<button class="btn primary" id="doneBtn">&#10003; Mark lesson complete</button>`}
            <button class="btn ghost sm bm-btn${bm ? ' on' : ''}" id="bmBtn" aria-pressed="${bm ? 'true' : 'false'}" title="Bookmark this lesson (press B)">${bm ? '&#9733; Bookmarked' : '&#9734; Bookmark'}</button>
            <button class="btn ghost sm" id="noteBtn" title="Notes (press N)">&#128221; Notes${note ? ' &bull;' : ''}</button>
          </div>
          <div class="lf-right">
            ${prevI != null ? `<a class="btn ghost sm" href="#/lesson/${mod.id}/${prevI}">&#8592; Prev</a>` : ''}
            ${nextI != null
              ? `<a class="btn primary sm" href="#/lesson/${mod.id}/${nextI}">Next &#8594;</a>`
              : `<a class="btn primary sm" href="#/quiz/${mod.id}">Take the quiz &#8594;</a>`}
          </div>
        </div>
      </article>
    </div>

    <div class="notes-panel reveal" id="notesPanel"${note ? '' : ' hidden'}>
      <div class="np-head"><span>&#128221; Notes for this lesson</span><span class="np-saved" id="npStatus"></span></div>
      <textarea id="noteArea" rows="4" placeholder="Type notes, gotchas or questions — saved automatically in your browser.">${esc(note)}</textarea>
      <div class="np-foot"><span class="np-hint">Stored locally · autosaved</span><button class="btn ghost sm" id="noteClear">Clear notes</button></div>
    </div>`;

  const b = $('#doneBtn'); const u = $('#unbtn');
  if (b) b.addEventListener('click', () => { markDone(mod.id, li, true); store.lastOpen = { mid: mod.id, li }; save(); toast('Lesson complete! &#127881;'); render(); });
  if (u) u.addEventListener('click', () => { markDone(mod.id, li, false); render(); });

  const bmb = $('#bmBtn');
  if (bmb) bmb.addEventListener('click', () => {
    const on = toggleBookmark(mod.id, li);
    bmb.classList.toggle('on', on);
    bmb.setAttribute('aria-pressed', on ? 'true' : 'false');
    bmb.innerHTML = on ? '&#9733; Bookmarked' : '&#9734; Bookmark';
    renderSidebar();
    toast(on ? 'Bookmarked &#9733;' : 'Bookmark removed');
  });
  const noteBtn = $('#noteBtn');
  const notePanel = $('#notesPanel');
  if (noteBtn && notePanel) noteBtn.addEventListener('click', () => {
    notePanel.hidden = !notePanel.hidden;
    if (!notePanel.hidden) { const ta = $('#noteArea'); if (ta) ta.focus(); }
  });
  const noteArea = $('#noteArea');
  const npStatus = $('#npStatus');
  if (noteArea) {
    let noteTimer;
    noteArea.addEventListener('input', () => {
      if (npStatus) npStatus.textContent = 'Saving…';
      clearTimeout(noteTimer);
      noteTimer = setTimeout(() => {
        setNote(mod.id, li, noteArea.value);
        if (npStatus) npStatus.textContent = noteArea.value.trim() ? 'Saved ✓' : '';
      }, 600);
    });
  }
  const noteClear = $('#noteClear');
  if (noteClear) noteClear.addEventListener('click', () => {
    if (noteArea) noteArea.value = '';
    setNote(mod.id, li, '');
    if (npStatus) npStatus.textContent = '';
    toast('Notes cleared');
  });

  store.lastOpen = { mid: mod.id, li }; save();
  requestAnimationFrame(() => window.scrollTo(0, 0));
}

/* Minimal markdown renderer */
let mdToc = [];

function slugify(txt) {
  return String(txt || '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'section';
}

function mdInline(t) {
  return String(t)
    .replace(/`([^`]+)`/g, (m, c) => '\u0001' + c + '\u0002')
    .replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>')
    .replace(/(^|[^*\u0001\u0002])\*([^*\n\u0001\u0002]+?)\*(?!\*)/g, '$1<i>$2</i>')
    .replace(/\u0001([^\u0002]*)\u0002/g, '<code class="inline">$1</code>');
}

function md(src, opts) {
  opts = opts || {};
  const lines = String(src || '').split(/\r?\n/);
  const html = [];
  const seen = new Set();
  mdToc = [];
  let i = 0, inFence = false, fenceBuf = [], fenceLang = '';

  while (i < lines.length) {
    const line = lines[i];

    if (!inFence && /^```/.test(line)) {
      inFence = true; fenceLang = (line.match(/^```(\w*)/) || [])[1] || 'text'; fenceBuf = []; i++; continue;
    }
    if (inFence) {
      if (/^```/.test(line)) {
        html.push(renderCode(fenceLang, fenceBuf));
        inFence = false; fenceBuf = []; fenceLang = ''; i++; continue;
      }
      fenceBuf.push(line); i++; continue;
    }
    if (/^\s*---\s*$/.test(line)) { i++; continue; }

    const head = line.match(/^(#{1,4})\s+(.*)/);
    if (head) {
      const hl = head[1].length;
      if (opts.skipH1 && hl === 1 && !seen.has('h1')) { seen.add('h1'); i++; continue; }
      const lvl = hl + (opts.shift || 0);
      const txt = esc(head[2]);
      const label = mdInline(txt).replace(/<[^>]+>/g, '');
      let slug = slugify(label), base = slug, n = 2;
      while (seen.has(slug)) { slug = base + '-' + n; n++; }
      seen.add(slug);
      if (lvl <= 4) mdToc.push({ lvl, slug, label });
      html.push(`<h${lvl} id="${slug}">${mdInline(txt)}</h${lvl}>`);
      i++; continue;
    }

    if (/^\|/.test(line)) {
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) { rows.push(lines[i]); i++; }
      html.push(mdTable(rows));
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      const isTask = /^\s*[-*]\s+\[[ xX]\]/.test(line);
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { items.push(lines[i]); i++; }
      if (isTask) {
        html.push('<ul class="task-list">' + items.map(x => {
          const m = x.match(/^\s*[-*]\s+\[([ xX])\]\s+(.*)/);
          if (!m) return `<li>${mdInline(esc(x.replace(/^\s*[-*]\s+/, '')))}</li>`;
          const done = m[1] === 'x' || m[1] === 'X';
          return `<li class="task ${done ? 'done' : ''}"><span class="t-box">${done ? '&#10003;' : ''}</span><span class="t-text">${mdInline(esc(m[2]))}</span></li>`;
        }).join('') + '</ul>');
      } else {
        html.push(`<ul class="tick-list">${items.map(x => `<li>${mdInline(esc(x.replace(/^\s*[-*]\s+/, '')))}</li>`).join('')}</ul>`);
      }
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*\d+\.\s+/, '')); i++; }
      html.push(`<ol>${items.map(x => `<li>${mdInline(esc(x))}</li>`).join('')}</ol>`);
      continue;
    }
    if (/^\s*$/.test(line)) { i++; continue; }

    const para = [];
    while (i < lines.length) {
      const l = lines[i];
      if (/^\s*$/.test(l) || /^```/.test(l) || /^\|/.test(l) || /^\s*[-*]\s+/.test(l) || /^\s*\d+\.\s+/.test(l) || /^(#{1,4})\s+/.test(l) || /^\s*---\s*$/.test(l)) break;
      para.push(l); i++;
    }
    if (para.length) html.push(`<p>${mdInline(esc(para.join(' ')))}</p>`);
  }

  if (inFence && fenceBuf.length) html.push(renderCode(fenceLang, fenceBuf));
  return html.join('');
}

function renderCode(lang, buf) {
  return `<div class="codeblock"><div class="cb-head"><span class="cb-lang">${esc(lang || 'text')}</span></div><pre><code>${buf.map(esc).join('\n')}</code></pre></div>`;
}

function mdTable(rows) {
  const parseRow = r => r.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
  let head = [], body = [], sep = false;
  for (let idx = 0; idx < rows.length; idx++) {
    const r = rows[idx];
    if (idx === 1 && /^[\s|:-]+$/.test(r.replace(/^\|/, '').replace(/\|$/, ''))) { sep = true; head = parseRow(rows[0]); continue; }
    if (sep) body.push(parseRow(r)); else head = parseRow(r);
  }
  if (!sep) { body = rows.map(parseRow); head = []; }
  const thead = head.length ? `<thead><tr>${head.map(h => `<th>${mdInline(esc(h))}</th>`).join('')}</tr></thead>` : '';
  const tbody = `<tbody>${body.map(r => `<tr>${r.map(c => `<td>${mdInline(esc(c))}</td>`).join('')}</tr>`).join('')}</tbody>`;
  return `<div class="tbl"><table>${thead}${tbody}</table></div>`;
}

function renderBlock(b) {
  switch (b.t) {
    case 'p': return `<p>${esc(b.x)}</p>`;
    case 'h': return `<h2>${esc(b.x)}</h2>`;
    case 'list': return `<ul class="tick-list">${b.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>`;
    case 'num': return `<ol>${b.items.map(i => `<li>${esc(i)}</li>`).join('')}</ol>`;
    case 'table': return `
      <div class="tbl"><table>
        <thead><tr>${b.head.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead>
        <tbody>${b.rows.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></div>`;
    case 'code': {
      const cid = 'c' + cyrb53(b.x);
      const bT = b.lang || 'text';
      return `<div class="codeblock">
        <div class="cb-head"><span class="cb-lang">${esc(bT)}</span><button class="cb-copy" data-copy="${cid}" title="Copy">&#9881; Copy</button></div>
        <pre id="${cid}" class="lang-${esc(bT)}"><code>${esc(b.x)}</code></pre>
      </div>`;
    }
    case 'callout': {
      const icons = { tip: '&#128161;', warn: '&#9888;&#65039;' };
      return `<div class="callout ${esc(b.kind)}"><div class="co-ico">${icons[b.kind] || '&#128161;'}</div><div>${esc(b.x)}</div></div>`;
    }
    case 'selfcheck': return `
      <div class="selfcheck">
        <div class="sc-head"><span class="sc-qmark">?</span> <span>Check yourself</span></div>
        <div class="sc-q">${esc(b.q)}</div>
        <div class="sc-actions"><button class="btn sm ghost showA">Show answer</button></div>
        <div class="sc-a" hidden>${esc(b.a)}</div>
      </div>`;
    case 'ex':
    case 'proj': {
      const isProject = b.t === 'proj';
      const items = b.steps || b.reqs || [];
      const lis = items.map(i =>
        typeof i === 'string'
          ? `<li>${esc(i)}</li>`
          : `<li class="ex-group"><b>${esc(i.h)}</b><ul>${i.items.map(x => `<li>${esc(x)}</li>`).join('')}</ul></li>`
      ).join('');
      const stars = '&#9733;'.repeat(b.stars) + '&#9734;'.repeat(Math.max(0, 4 - b.stars));
      const code = b.code ? renderBlock({ t: 'code', ...b.code }) : '';
      const footer = isProject
        ? `<div class="ex-verify">&#127919; Success — ${esc(b.success)}</div>`
        : `<div class="ex-verify">&#10004; Verify — ${esc(b.verify)}</div>`;
      const hasAnswer = typeof EXERCISE_ANSWERS !== 'undefined' && EXERCISE_ANSWERS[b.id];
      const answer = hasAnswer
        ? `<details class="ex-answer"><summary><span class="ea-ico">&#128161;</span><span>Show answer</span><span class="ea-caret">&#9662;</span></summary><div class="ex-answer-body">${md(EXERCISE_ANSWERS[b.id])}</div></details>`
        : '';
      return `
        <div class="ex-card ${isProject ? 'proj' : ''}" data-stars="${b.stars}">
          <div class="ex-head">
            <span class="ex-id">${esc(b.id)}</span>
            <span class="ex-stars">${stars}</span>
          </div>
          <h3 class="ex-title">${esc(b.title)}</h3>
          <p class="ex-obj">${esc(b.obj)}</p>
          ${code}
          <div class="ex-label">${isProject ? '&#128203; Requirements' : '&#129513; Instructions'}</div>
          <ol class="ex-list">${lis}</ol>
          ${footer}
          ${answer}
        </div>`;
    }
    default: return '';
  }
}

/* ------------------------- full guide page ------------------------- */

const GUIDE_DIR = 'guide/';
const guideCache = {};

function fetchGuide(mod) {
  const key = mod.guide;
  if (guideCache[key]) return Promise.resolve(guideCache[key]);
  if (!window.fetch) return Promise.reject(new Error('fetch unavailable'));
  return fetch(GUIDE_DIR + key)
    .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
    .then(t => { guideCache[key] = t; return t; });
}

function renderGuide(mod) {
  const p = moduleProgress(mod.id);
  const read = guideRead(mod.id);

  view.innerHTML = `
    <div class="crumb reveal"><a href="#/">Dashboard</a> <span>&#8250;</span> <a href="#/phase/${mod.id}">${mod.title}</a> <span>&#8250;</span> <b>Full guide</b></div>

    <div class="guide-hero reveal" style="--c:${mod.color}">
      <div class="ph-ico">${mod.icon}</div>
      <div class="ph-body">
        <div class="ph-kicker">Phase ${String(mod.n).padStart(2, '0')} · complete guide</div>
        <h1>${mod.title}</h1>
        <p class="qc-sub">The full roadmap guide is rendered right here — every section, table, code sample and checklist from ${esc(mod.guide)}. ${read ? '<b>You marked this guide as read.</b>' : 'Read it end-to-end, then mark it as read to complete the module.'}</p>
        <div class="guide-meta">
          ${mod.art.map(a => `<a class="artifact" target="_blank" rel="noopener" href="${artifactHref(a.href)}" style="--c:${mod.color}"><span class="a-ico">&#128444;&#65039;</span> <span>${a.label}</span></a>`).join('')}
        </div>
      </div>
      <div class="ph-side">
        <div class="ring sm" style="--p:${p.pct};--c:${mod.color}"><span>${p.pct}<small>%</small></span></div>
        <div class="ph-stats"><span>${read ? '&#10003; guide read' : 'guide unread'}</span></div>
      </div>
    </div>

    <div class="guide-wrap reveal">
      <aside class="guide-toc" aria-label="Table of contents">
        <div class="toc-title">On this guide</div>
        <div id="guideToc"><div class="gt-loading">…</div></div>
      </aside>
      <article class="article guide-article" style="--c:${mod.color}">
        <div class="guide-loading"><span class="spinner"></span> Loading the full guide…</div>
      </article>
    </div>

    <div class="lesson-foot reveal">
      <div class="lf-left">
        <button class="btn primary" id="greadBtn">${read ? '&#10003; Guide read — toggle' : '&#10004; Mark guide as read'}</button>
      </div>
      <div class="lf-right">
        ${mod.n > 1 ? `<a class="btn ghost sm" href="#/guide/${MODULES[mod.n - 2].id}">&#8592; ${MODULES[mod.n - 2].title}</a>` : ''}
        ${mod.n < MODULES.length
          ? `<a class="btn primary sm" href="#/guide/${MODULES[mod.n].id}">${MODULES[mod.n].title} &#8594;</a>`
          : `<a class="btn primary sm" href="#/quiz/${mod.id}">&#127919; Take the final quiz &#8594;</a>`}
      </div>
    </div>`;

  fetchGuide(mod).then(src => {
    const article = $('.guide-article');
    article.innerHTML = md(src, { skipH1: true });
    buildGuideToc();
    if (route.anchor) {
      const el = document.getElementById(route.anchor);
      if (el) requestAnimationFrame(() => el.scrollIntoView({ block: 'start' }));
    }
    const fail = $('.guide-loading', article);
    if (fail) fail.remove();
  }).catch(() => {
    const article = $('.guide-article');
    article.innerHTML = `
      <div class="guide-fail">
        <div class="gf-ico">&#9888;&#65039;</div>
        <h3>Could not load the guide file</h3>
        <p>The full guide is served from <code class="inline">docs/guide/${esc(mod.guide)}</code> in this repo. If you are viewing a local file (not through GitHub Pages), the fetch may be blocked.</p>
      </div>`;
  });

  const rb = $('#greadBtn');
  if (rb) rb.addEventListener('click', () => { markGuideRead(mod.id, !guideRead(mod.id)); toast(guideRead(mod.id) ? 'Guide marked as read — module complete! &#127881;' : 'Guide marked as unread'); render(); });

  store.lastOpen = { mid: mod.id, li: 0 }; save();
  requestAnimationFrame(() => window.scrollTo(0, 0));
}

function buildGuideToc() {
  const toc = $('#guideToc');
  if (!toc) return;
  toc.innerHTML = '';
  if (!mdToc.length) { toc.innerHTML = '<div class="gt-empty">Smooth reading — no section headings in this file.</div>'; return; }
  mdToc.forEach(t => {
    const a = document.createElement('a');
    a.className = 'gt-item lvl' + t.lvl;
    a.textContent = t.label;
    a.href = '#/guide/' + route.mid + '/' + t.slug;
    a.addEventListener('click', e => {
      e.preventDefault();
      const el = document.getElementById(t.slug);
      if (el) {
        route.anchor = t.slug;
        history.replaceState(null, '', '#' + hashFor());
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    toc.appendChild(a);
  });
}

/* ------------------------- quiz page ------------------------- */

let quizKeyHandler = null;

function renderQuiz(mod, opts) {
  opts = opts || {};
  const all = mod.quiz.questions;
  const idxs = opts.indices || all.map((_, i) => i);
  const practice = !!opts.practice;
  const n = idxs.length;
  const prevBest = store.quiz[mod.id];
  const keyHint = Math.min(9, Math.max.apply(null, idxs.map(i => all[i].opts.length)));

  view.innerHTML = `
    <div class="crumb reveal"><a href="#/">Dashboard</a> <span>&#8250;</span> <a href="#/phase/${mod.id}">${mod.title}</a> <span>&#8250;</span> <b>Quiz${practice ? ' · practice' : ''}</b></div>

    <div class="quiz-top reveal" style="--c:${mod.color}">
      <div>
        <div class="ph-kicker">Phase ${String(mod.n).padStart(2, '0')} · ${mod.quiz.title}${practice ? ' · practice mode' : ''}</div>
        <h1>${mod.icon} ${mod.title} — Quiz</h1>
        <p class="qc-sub">${n} question${n === 1 ? '' : 's'}. ${practice ? 'Re-try only the ones you missed. ' : ''}Tip: answer with <span class="kbd">1</span>&ndash;<span class="kbd">${keyHint}</span> or <span class="kbd">A</span>&ndash;<span class="kbd">D</span>.</p>
      </div>
      <div class="quiz-best">
        ${prevBest != null
          ? `Best: <b>${Math.round(prevBest * all.length)}/${all.length}</b> · ${Math.round(prevBest * 100)}%`
          : 'No score yet'}
      </div>
    </div>

    ${practice ? '' : `<div class="quiz-meter reveal"><div class="qm-bar"><i id="quizBar"></i></div><span class="qm-count" id="quizCount">0 / ${n} answered</span></div>`}

    <div class="quiz-list reveal" id="quizList"></div>
    <div class="quiz-summary" id="quizSummary" hidden></div>
    <div class="lesson-foot reveal" id="quizFoot"></div>`;

  const list = $('#quizList');
  idxs.forEach((srcIndex, pos) => {
    const q = all[srcIndex];
    const item = document.createElement('div');
    item.className = 'q-item';
    item.dataset.qi = pos;
    item.dataset.src = srcIndex;
    item.innerHTML = `
      <div class="q-head"><span class="q-num">Q${pos + 1}</span><span class="q-prog"></span></div>
      <div class="q-text">${esc(q.q)}</div>
      <div class="q-opts">
        ${q.opts.map((o, oi) => `
          <button class="q-opt" data-oi="${oi}">
            <span class="q-letter">${String.fromCharCode(65 + oi)}</span>
            <span class="q-otext">${esc(o)}</span>
            <span class="q-mark"></span>
          </button>`).join('')}
      </div>
      <div class="q-why" hidden><div class="qw-label"></div><div class="qw-text">${esc(q.why)}</div></div>`;
    list.appendChild(item);
  });

  const foot = $('#quizFoot');
  foot.innerHTML = `
    <div class="lf-left"><button class="btn ghost sm" id="resetQuiz">&#8634; Reset</button></div>
    <div class="lf-right">
      ${practice ? '' : '<button class="btn primary" id="saveScore" disabled>&#10003; Save my score</button>'}
      <a class="btn ghost sm" href="#/phase/${mod.id}">Back to module</a>
    </div>`;

  $('#resetQuiz').addEventListener('click', () => renderQuiz(mod, opts));

  const saveBtn = $('#saveScore');
  const bar = $('#quizBar');
  const count = $('#quizCount');
  let answered = 0, score = 0;
  const wrong = [];

  function answer(item, oi) {
    if (item.dataset.state) return;
    const src = +item.dataset.src;
    const q = all[src];
    const prog = $('.q-prog', item);
    const correct = oi === q.a;
    item.dataset.state = correct ? 'right' : 'wrong';
    prog.textContent = correct ? '&#10003; correct' : '&#10007;';
    prog.classList.add(correct ? 'ok' : 'bad');

    $$('.q-opt', item).forEach(o => {
      const t = +o.dataset.oi;
      o.classList.add(t === q.a ? 'right' : 'dim');
      if (t === oi && !correct) o.classList.add('wrong');
      o.disabled = true;
    });
    const why = $('.q-why', item);
    why.hidden = false;
    $('.qw-label', why).textContent = correct ? '&#127881; That&#8217;s right' : '&#128584; Not quite';
    why.classList.add(correct ? 'ok' : 'bad');

    answered++; if (correct) score++; else wrong.push(src);
    if (bar) bar.style.width = Math.round(answered / n * 100) + '%';
    if (count) count.textContent = answered + ' / ' + n + ' answered';
    if (saveBtn) saveBtn.disabled = answered < n;
    if (answered === n) finish();
  }

  function finish() {
    const pct = Math.round(score / n * 100);
    toast(`Quiz complete: ${score}/${n} (${pct}%)`);
    if (pct === 100) confetti();
    const sum = $('#quizSummary');
    if (!sum) return;
    sum.hidden = false;
    const missed = n - score;
    sum.innerHTML = `
      <div class="qs-head" style="--c:${mod.color}">
        <div class="qs-score"><b>${score}</b><small>/${n}</small></div>
        <div class="qs-body">
          <h3>${pct === 100 ? '&#127942; Perfect score!' : missed <= Math.ceil(n * 0.25) ? '&#128170; Almost there' : '&#128218; Keep studying'}</h3>
          <p>${missed ? `You missed ${missed} question${missed === 1 ? '' : 's'}. Review the explanations above${practice ? '.' : ' or practice just those.'}` : 'You answered every question correctly.'}</p>
        </div>
      </div>
      ${(!practice && wrong.length) ? `<button class="btn primary" id="practiceWrong">&#127919; Practice ${wrong.length} missed question${wrong.length === 1 ? '' : 's'}</button>` : ''}
      ${practice ? '<button class="btn ghost" id="backFull">&#8617; Back to the full quiz</button>' : ''}`;
    const pw = $('#practiceWrong');
    if (pw) pw.addEventListener('click', () => renderQuiz(mod, { indices: wrong.slice(), practice: true }));
    const bf = $('#backFull');
    if (bf) bf.addEventListener('click', () => renderQuiz(mod));
    requestAnimationFrame(() => sum.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
  }

  $$('.q-item', list).forEach(item => {
    $$('.q-opt', item).forEach(btn => {
      btn.addEventListener('click', () => answer(item, +btn.dataset.oi));
    });
  });

  function onKey(e) {
    const ae = document.activeElement;
    if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA')) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const item = $$('.q-item', list).find(it => !it.dataset.state);
    if (!item) return;
    let oi = -1;
    if (/^[1-9]$/.test(e.key)) oi = +e.key - 1;
    else if (/^[a-dA-D]$/.test(e.key)) oi = e.key.toUpperCase().charCodeAt(0) - 65;
    if (oi < 0) return;
    const optEls = $$('.q-opt', item);
    if (oi >= optEls.length) return;
    e.preventDefault();
    answer(item, oi);
    item.scrollIntoView({ block: 'center', behavior: 'smooth' });
    item.classList.add('kb-flash');
    setTimeout(() => item.classList.remove('kb-flash'), 500);
  }
  quizKeyHandler = onKey;
  document.addEventListener('keydown', onKey);

  if (saveBtn) saveBtn.addEventListener('click', () => {
    if (practice) return;
    const pct = score / all.length;
    if (prevBest == null || pct > prevBest) {
      store.quiz[mod.id] = pct;
      store.best[mod.id] = Math.round(pct * all.length);
      save();
      toast('Score saved — keep it up! &#127942;');
      saveBtn.innerHTML = '&#10003; Saved — nice work!';
      saveBtn.disabled = true;
    }
    renderSidebar();
  });
}

/* ------------------------- bookmarks page ------------------------- */

function renderBookmarks() {
  const rows = [];
  MODULES.forEach(m => m.lessons.forEach((l, i) => {
    if (isBookmarked(m.id, i)) rows.push({ m, l, i, note: getNote(m.id, i) });
  }));
  const notes = noteCount();
  view.innerHTML = `
    <div class="crumb reveal"><a href="#/">Dashboard</a> <span>&#8250;</span> <b>Bookmarks</b></div>
    <div class="phase-hero reveal" style="--c:var(--accent)">
      <div class="ph-ico">&#9733;</div>
      <div class="ph-body">
        <div class="ph-kicker">Saved for later</div>
        <h1>Your bookmarks</h1>
        <p class="qc-sub">${rows.length} saved lesson${rows.length === 1 ? '' : 's'}${notes ? ' · ' + notes + ' note' + (notes === 1 ? '' : 's') : ''}. Bookmark a lesson with the &#9734; button, or press <span class="kbd">B</span>.</p>
      </div>
    </div>
    ${rows.length ? `<div class="lessons reveal">${rows.map(r => `
      <a class="lesson-row" href="#/lesson/${r.m.id}/${r.i}" style="--c:${r.m.color}">
        <span class="lr-state">&#9733;</span>
        <span class="lr-info">
          <b>${esc(r.l.title)}</b>
          <span class="lr-meta">${esc(r.m.title)} · ${r.l.mins} min${lessonDone(r.m.id, r.i) ? ' · completed &#10003;' : ''}</span>
          ${r.note ? `<span class="bm-note">&#128221; ${esc(r.note.slice(0, 160))}${r.note.length > 160 ? '&hellip;' : ''}</span>` : ''}
        </span>
        <span class="lr-arrow">&#8594;</span>
      </a>`).join('')}</div>`
      : `<div class="empty-state reveal"><div class="es-ico">&#9734;</div><h3>No bookmarks yet</h3><p>While reading a lesson, tap <b>Bookmark</b> (or press <span class="kbd">B</span>) to save it here.</p><a class="btn primary" href="#/">Back to the dashboard</a></div>`}`;
}

/* ------------------------- certificate page ------------------------- */

function renderCertificate() {
  const op = overallPct();
  const complete = op >= 100;
  const name = store.name || '';
  const totalLessons = MODULES.reduce((a, m) => a + m.lessons.length, 0);
  const date = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  view.innerHTML = `
    <div class="crumb reveal"><a href="#/">Dashboard</a> <span>&#8250;</span> <b>Certificate</b></div>
    ${complete ? '' : `<div class="callout warn reveal"><div class="co-ico">&#9888;&#65039;</div><div>You are at <b>${op}%</b>. Finish every lesson, guide and quiz to unlock the certificate. You can preview it below.</div></div>`}
    <div class="cert reveal" id="cert">
      <div class="cert-inner">
        <div class="cert-top"><span class="cert-logo">&#9745;</span><span class="cert-brand">Service Cloud Consultant Academy</span></div>
        <div class="cert-kicker">Certificate of Completion</div>
        <div class="cert-name" id="certName">${name ? esc(name) : 'Your name here'}</div>
        <div class="cert-copy">has successfully completed the <b>Salesforce Service Cloud Consultant</b> roadmap &mdash; ${MODULES.length} phases, ${totalLessons} lessons and ${MODULES.length} assessments.</div>
        <div class="cert-row">
          <div><span class="cert-lab">Progress</span><b>${op}%</b></div>
          <div><span class="cert-lab">Date</span><b>${date}</b></div>
          <div><span class="cert-lab">Phases complete</span><b>${MODULES.filter(m => moduleProgress(m.id).complete).length}/${MODULES.length}</b></div>
        </div>
        <div class="cert-seal${complete ? ' on' : ''}">${complete ? 'COMPLETE' : 'PREVIEW'}</div>
      </div>
    </div>
    <div class="cert-tools reveal">
      <input id="certNameInput" type="text" placeholder="Type your name&hellip;" value="${esc(name)}" maxlength="60" aria-label="Name on certificate" />
      <button class="btn primary" id="printCert">&#128424; Print / Save as PDF</button>
      <button class="btn ghost" id="backHome">&#8592; Dashboard</button>
    </div>`;

  const ni = $('#certNameInput');
  if (ni) ni.addEventListener('input', () => {
    store.name = ni.value; save();
    const el = $('#certName');
    if (el) el.textContent = ni.value.trim() ? ni.value : 'Your name here';
  });
  const pc = $('#printCert');
  if (pc) pc.addEventListener('click', () => window.print());
  const bh = $('#backHome');
  if (bh) bh.addEventListener('click', () => navigate('home'));
}

/* ------------------------- toast ------------------------- */

let toastTimer;
function toast(msg) {
  let t = $('#toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ------------------------- confetti ------------------------- */

function confetti() {
  const colors = ['#00A1E0', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#e8b93d'];
  for (let i = 0; i < 90; i++) {
    const p = document.createElement('i');
    p.className = 'confetti';
    const x = Math.random() * 100;
    const d = Math.random() * 2.4 + 1.2;
    const s = 8 + Math.random() * 8;
    p.style.left = x + '%';
    p.style.background = colors[i % colors.length];
    p.style.animationDuration = d + 's';
    p.style.width = p.style.height = s + 'px';
    p.style.setProperty('--tx', (Math.random() * 160 - 80) + 'px');
    document.body.appendChild(p);
    setTimeout(() => p.remove(), d * 1000 + 400);
  }
}

/* ------------------------- events wiring ------------------------- */

document.addEventListener('click', e => {
  const sc = e.target.closest('.selfcheck');
  if (sc) {
    const a = $('.sc-a', sc); const btn = $('.showA', sc);
    if (a.hidden) { a.hidden = false; btn.textContent = 'Hide answer'; }
    else { a.hidden = true; btn.textContent = 'Show answer'; }
    return;
  }
  const copy = e.target.closest('.cb-copy');
  if (copy) {
    const pre = document.getElementById(copy.dataset.copy);
    if (pre) {
      const txt = pre.innerText;
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject())
        .then(() => { copy.textContent = '&#10003; Copied'; setTimeout(() => copy.textContent = '&#9881; Copy', 1400); })
        .catch(() => { const r = document.createRange(); r.selectNodeContents(pre); const s = window.getSelection(); s.removeAllRanges(); s.addRange(r); document.execCommand('copy'); copy.textContent = '&#10003; Copied'; setTimeout(() => copy.textContent = '&#9881; Copy', 1400); });
    }
  }
});

/* search / command palette */
let searchBox = null;
let searchItems = [];
let searchActive = -1;

function ensureSearch() {
  if (searchBox) return searchBox;
  searchBox = document.createElement('div');
  searchBox.className = 'search-wrap';
  searchBox.setAttribute('role', 'dialog');
  searchBox.setAttribute('aria-label', 'Search the academy');
  searchBox.innerHTML = `
    <div class="sw-top"><span class="sw-ico">&#128269;</span>
      <input id="globalQ" type="search" placeholder="Search lessons, guides, quizzes…" autocomplete="off" aria-label="Search" />
      <span class="kbd">esc</span>
    </div>
    <div class="search-results" id="searchRes"></div>
    <div class="sw-foot"><span id="swCount"></span><span class="sw-keys"><span class="kbd">&#8593;</span><span class="kbd">&#8595;</span> navigate · <span class="kbd">&#9166;</span> open</span></div>`;
  document.body.appendChild(searchBox);

  const input = $('#globalQ', searchBox);
  input.addEventListener('input', runSearch);
  input.addEventListener('focus', () => { if (input.value.trim().length >= 1) { searchBox.classList.add('open'); runSearch(); } });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); moveSearchActive(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); moveSearchActive(-1); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      const r = searchItems[searchActive] || searchItems[0];
      if (r) { closeSearch(); location.hash = r.href; }
    } else if (e.key === 'Escape') { closeSearch(); }
  });
  return searchBox;
}

function runSearch() {
  const sb = searchBox || ensureSearch();
  const input = $('#globalQ', sb);
  const wrap = $('#searchRes', sb);
  const count = $('#swCount', sb);
  const q = input.value.trim().toLowerCase();
  searchItems = [];
  searchActive = -1;
  wrap.innerHTML = '';
  if (q.length < 1) {
    wrap.innerHTML = '<div class="sr-hint">Start typing — try "case", "entitlement", "omnichannel", "bot".</div>';
    if (count) count.textContent = '';
    return;
  }

  const results = [];
  MODULES.forEach(m => {
    if ((m.title + ' ' + m.tagline + ' ' + m.objectives.join(' ')).toLowerCase().includes(q)) {
      results.push({ href: '#/phase/' + m.id, ico: m.icon, label: m.title, sub: 'Phase overview & lessons' });
    }
    m.lessons.forEach((l, i) => {
      const hay = (m.title + ' ' + m.tagline + ' ' + l.title + ' ' + m.objectives.join(' ') + ' ' + l.blocks.map(bd => bd.x || (bd.items || []).join(' ')).join(' ')).toLowerCase();
      if (hay.includes(q)) results.push({ href: '#/lesson/' + m.id + '/' + i, ico: m.icon, label: l.title, sub: m.title });
    });
    m.quiz.questions.forEach(qq => {
      if ((qq.q + ' ' + qq.why).toLowerCase().includes(q)) {
        results.push({ href: '#/quiz/' + m.id, ico: '&#129504;', label: 'Quiz · ' + m.title, sub: qq.q.slice(0, 70) + '…' });
      }
    });
  });

  const seen = new Set(); const uniq = [];
  results.forEach(r => { const k = r.href + '|' + r.label; if (!seen.has(k)) { seen.add(k); uniq.push(r); } });
  const top = uniq.slice(0, 12);
  searchItems = top;

  if (!top.length) {
    wrap.innerHTML = '<div class="sr-empty">No results for &ldquo;' + esc(q) + '&rdquo; — try "case", "entitlement", "omnichannel".</div>';
    if (count) count.textContent = '0 results';
  } else {
    top.forEach((r, i) => {
      const a = document.createElement('a');
      a.className = 'sr-item' + (i === 0 ? ' active' : '');
      a.href = r.href;
      a.innerHTML = `<span class="sr-ico">${r.ico}</span><span class="sr-txt"><b>${esc(r.label)}</b><small>${esc(r.sub)}</small></span><span class="sr-go">&#8594;</span>`;
      a.addEventListener('click', closeSearch);
      a.addEventListener('mouseenter', () => setSearchActive(i));
      wrap.appendChild(a);
    });
    if (count) count.textContent = top.length + (uniq.length > top.length ? '+' : '') + ' result' + (uniq.length === 1 ? '' : 's');
  }
  sb.classList.add('open');
}

function setSearchActive(i) {
  if (!searchBox) return;
  const items = $$('.sr-item', searchBox);
  if (!items.length) { searchActive = -1; return; }
  searchActive = (i + items.length) % items.length;
  items.forEach((el, k) => el.classList.toggle('active', k === searchActive));
  const el = items[searchActive];
  if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
}
function moveSearchActive(d) {
  if (!searchBox) return;
  const items = $$('.sr-item', searchBox);
  if (!items.length) return;
  setSearchActive(searchActive < 0 ? (d > 0 ? 0 : items.length - 1) : searchActive + d);
}

function openSearch() {
  const sb = ensureSearch();
  sb.classList.add('open');
  const inp = $('#globalQ', sb);
  inp.focus();
  const top = $('#topSearch');
  if (top && top.value && !inp.value) inp.value = top.value;
  runSearch();
}
function closeSearch() {
  if (searchBox) { searchBox.classList.remove('open'); const inp = $('#globalQ', searchBox); inp.value = ''; searchActive = -1; }
}

/* hotkey */
window.addEventListener('keydown', e => {
  const ae = document.activeElement;
  const typing = ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA');
  if ((e.key === '/' || e.key === 'f') && !e.ctrlKey && !e.metaKey) {
    if (!typing) { e.preventDefault(); openSearch(); }
    return;
  }
  if (e.key === 'Escape') {
    if (searchBox && searchBox.classList.contains('open')) { closeSearch(); e.preventDefault(); return; }
  }
  if (e.key === 'ArrowLeft' && !typing && route.view === 'lesson') {
    if (route.li > 0) navigate('lesson', route.mid, route.li - 1);
  }
  if (e.key === 'ArrowRight' && !typing && route.view === 'lesson') {
    const mod = byId(route.mid);
    if (route.li < mod.lessons.length - 1) navigate('lesson', route.mid, route.li + 1);
  }
  if (!typing && route.view === 'lesson') {
    if (e.key === 'b' || e.key === 'B') { const bb = $('#bmBtn'); if (bb) { e.preventDefault(); bb.click(); } }
    if (e.key === 'n' || e.key === 'N') { const nb = $('#noteBtn'); if (nb) { e.preventDefault(); nb.click(); } }
  }
});

function bindTopSearch() {
  const topQ = $('#topSearch');
  if (!topQ || topQ.dataset.bound) return;
  topQ.dataset.bound = '1';
  topQ.addEventListener('focus', () => {
    const sb = ensureSearch();
    sb.classList.add('open');
    $('#globalQ', sb).value = topQ.value;
    runSearch();
  });
  topQ.addEventListener('input', () => {
    const sb = ensureSearch();
    sb.classList.add('open');
    $('#globalQ', sb).value = topQ.value;
    runSearch();
  });
}

/* ------------------------- global UI wiring ------------------------- */
/* Bound before the first render so a single bad route can never disable
   the theme switch or the mobile menu. */

/* theme toggle */
const themeBtn = $('#themeToggle');
if (themeBtn) {
  themeBtn.textContent = getTheme() === 'dark' ? '&#127769;' : '&#9728;&#65039;';
  themeBtn.addEventListener('click', () => {
    setTheme(getTheme() === 'dark' ? 'light' : 'dark');
  });
}

/* mobile menu */
const menuBtn = $('#menuBtn');
if (menuBtn) {
  menuBtn.addEventListener('click', () => {
    document.body.classList.toggle('sb-open');
    const open = document.body.classList.contains('sb-open');
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      const first = $('.side-phase');
      if (first) first.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  });
}
document.addEventListener('click', e => {
  if (document.body.classList.contains('sb-open') && !e.target.closest('.sidebar') && !e.target.closest('#menuBtn')) {
    document.body.classList.remove('sb-open');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
  }
});

/* reading progress bar */
function updateReadBar() {
  const bar = document.getElementById('readBar');
  if (!bar) return;
  const h = document.documentElement.scrollHeight - window.innerHeight;
  const p = h > 0 ? Math.max(0, Math.min(100, (window.scrollY / h) * 100)) : 0;
  bar.style.width = p + '%';
}
window.addEventListener('scroll', updateReadBar, { passive: true });
window.addEventListener('resize', updateReadBar);

/* ------------------------- lazy event (hashchange) ------------------------- */
window.addEventListener('hashchange', () => { route = parseHash(); safeRender(); requestAnimationFrame(updateReadBar); });

/* ------------------------- boot ------------------------- */
/* A failure in one view must not break navigation or the controls. */
function safeRender() {
  try {
    render();
  } catch (err) {
    console.error('Render failed', err);
    const view = $('#view');
    if (view) view.innerHTML = '<div class="empty"><h2>This page failed to load</h2><p>Pick another phase from the menu.</p><a class="btn primary" href="#/">Back to dashboard</a></div>';
  }
}
route = parseHash();
safeRender();