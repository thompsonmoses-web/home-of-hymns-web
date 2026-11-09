const { collections, hymns } = window.HYMNS_DATA;

const LANG_NAMES = {
  en: 'English', fr: 'French', de: 'German', es: 'Spanish', la: 'Latin',
  yo: 'Yoruba', ig: 'Igbo', sw: 'Swahili', xh: 'Xhosa', zu: 'Zulu',
  el: 'Greek', ru: 'Russian', pt: 'Portuguese', hu: 'Hungarian', nl: 'Dutch'
};

function langName(l) { return LANG_NAMES[l] || l; }

const state = {
  view: 'home',
  libTab: 'favorites',
  collection: null,
  search: '',
  hymnOpen: null,
  lang: 'all',
  section: 'main',
  hymnLang: (function () { try { return localStorage.getItem('hymnLang') || 'orig'; } catch (e) { return 'orig'; } })(),
  colSearch: '',
  chip: 'all',
  // collections the user has switched to Yoruba via the per-denomination icon
  yoCollections: (function () {
    try { return new Set(JSON.parse(localStorage.getItem('yoCollections') || '[]')); }
    catch (e) { return new Set(); }
  })(),
  shuffle: false,
  notesOpen: false,
  autoplay: false,
  tempo: (function () {
    try { const t = parseFloat(localStorage.getItem('tempo')); return [0.75, 1, 1.25, 1.5].includes(t) ? t : 1; }
    catch (e) { return 1; }
  })()
};

const TRANSLATIONS = window.TRANSLATIONS || { yo: {}, en: {} };

function yoFor(h) {
  return (TRANSLATIONS.yo && TRANSLATIONS.yo[h.id]) || null;
}

function yoCount(c) {
  return hymns.filter((h) => h.collections.includes(c.id) && yoFor(h)).length;
}

function yoOn(c) {
  return state.yoCollections.has(c.id);
}

function toggleYo(c) {
  if (yoOn(c)) state.yoCollections.delete(c.id);
  else state.yoCollections.add(c.id);
  try { localStorage.setItem('yoCollections', JSON.stringify([...state.yoCollections])); } catch (e) { /* ignore */ }
  render();
}

// Yoruba is on for a collection the user switched, unless they picked a language by hand
function useYo(h) {
  if (state.hymnLang !== 'orig') return state.hymnLang === 'yo' && !!yoFor(h);
  const owners = state.collection ? [state.collection] : h.collections;
  return owners.some((c) => state.yoCollections.has(c)) && !!yoFor(h);
}

function hymnOriginalLang(h) {
  return h.lang || 'en';
}

function activeHymnText(h) {
  if (useYo(h)) {
    const t = yoFor(h);
    return { title: t.title || h.title, lyrics: t.lyrics, chorus: t.chorus };
  }
  if (state.hymnLang !== 'orig') {
    const t = TRANSLATIONS[state.hymnLang] && TRANSLATIONS[state.hymnLang][h.id];
    if (t) return { title: t.title || h.title, lyrics: t.lyrics, chorus: t.chorus };
  }
  return { title: h.title, lyrics: h.lyrics, chorus: h.chorus };
}

function hymnLangs(h) {
  const orig = hymnOriginalLang(h);
  const opts = [{ v: 'orig', l: langName(orig) + ' (Original)' }];
  Object.keys(TRANSLATIONS).forEach((code) => {
    if (code === orig) return;
    if (TRANSLATIONS[code] && TRANSLATIONS[code][h.id]) opts.push({ v: code, l: langName(code) });
  });
  return opts;
}

// The select must mirror what is on screen, so "original" reads as Yoruba when the
// per-collection Yoruba switch is what put Yoruba on screen.
function currentLangValue(h) {
  return useYo(h) ? 'yo' : state.hymnLang;
}

function setHymnLang(code) {
  state.hymnLang = code;
  try { localStorage.setItem('hymnLang', code); } catch (e) { /* ignore */ }
}

const store = {
  get favorites() { return JSON.parse(localStorage.getItem('favs') || '[]'); },
  set favorites(v) { localStorage.setItem('favs', JSON.stringify(v)); },
  get history() { return JSON.parse(localStorage.getItem('hist') || '[]'); },
  set history(v) { localStorage.setItem('hist', JSON.stringify(v)); }
};

function langOptionsHtml(sel) {
  return [['en', 'English'], ['yo', 'Yoruba'], ['fr', 'French'], ['de', 'German'],
    ['es', 'Spanish'], ['la', 'Latin'], ['ru', 'Russian'], ['el', 'Greek'],
    ['sw', 'Swahili'], ['xh', 'Xhosa'], ['zu', 'Zulu'],
    ['pt', 'Portuguese'], ['nl', 'Dutch']]
    .map(([v, l]) => `<option value="${v}" ${v === sel ? 'selected' : ''}>${l}</option>`).join('');
}

function esc(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

// The official app logo (resolved by logo.js); emblem.svg only until then.
function logoSrc() {
  return (window.APP_LOGO && window.APP_LOGO.current) || 'emblem.svg';
}

// logo.js resolves after first paint — re-render so every view shows the real logo
document.addEventListener('logoresolved', () => {
  try {
    const gate = el('#entryGate');
    if (gate && !gate.hidden && !gatePhoto) updateGateAvatar();
    render();
  } catch (e) { /* ignore */ }
});

function collectionName(id) {
  const c = collections.find((c) => c.id === id);
  return c ? c.name : id;
}

function collectionColor(id) {
  const c = collections.find((c) => c.id === id);
  return c ? c.color : '#888';
}

// Text color for a colored FILL (chips, badges, play buttons): white or ink by luminance.
function tintText(hex) {
  const h = String(hex || '').replace('#', '');
  if (h.length !== 6) return '#fff';
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const lin = (v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return L > 0.4 ? '#16130b' : '#ffffff';
}

// Readable hue for colored TEXT on a panel: keeps the hue in night mode,
// darkens it on the light theme until it passes contrast.
function shadeText(hex) {
  if (document.body.classList.contains('night')) return hex;
  const h = String(hex || '').replace('#', '');
  if (h.length !== 6) return hex;
  const mix = (ch) => Math.round(ch * (1 - 0.62) + 23 * 0.62);
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const to = (v) => v.toString(16).padStart(2, '0');
  return '#' + to(mix(r)) + to(mix(g)) + to(mix(b));
}

function collectionBy(id) { return collections.find((c) => c.id === id); }

function collectionLogo(c) {
  return `<img class="coll-logo" src="${c.logo}" alt="${c.name}">`;
}

// Per-denomination Yoruba switch. Rendered as a sibling of the card, not inside it,
// so clicking it never also opens the collection.
function yoBadge(c) {
  const n = yoCount(c);
  const on = yoOn(c);
  if (!n) {
    return `<span class="yo-badge off" title="No Yoruba translation available in this hymnal" aria-disabled="true">YO</span>`;
  }
  return `<button class="yo-badge ${on ? 'on' : ''}" data-yo-toggle="${c.id}" style="--yc:${c.color};--yct:${tintText(c.color)}"
    title="${on ? 'Showing Yoruba' : 'Show Yoruba'} · ${n} of ${collCount(c)} hymns translated"
    aria-pressed="${on ? 'true' : 'false'}"><span class="yo-globe" aria-hidden="true"></span>YO</button>`;
}

function hymnAccent(h) {
  return collectionColor(h.collections[0]);
}

function hymnNo(h) {
  const nums = h.numbers;
  if (nums) {
    if (state.collection && nums[state.collection] != null) return nums[state.collection];
    const primary = nums[h.collections[0]];
    if (primary != null) return primary;
    const vals = Object.values(nums).filter((v) => v != null);
    if (vals.length) return vals[0];
  }
  return h.number != null ? h.number : 0;
}

// Numbers can be plain (800) or suffixed (1A); sort numerically, then by suffix.
function compareHymnNo(a, b) {
  const mx = String(a).match(/^(\d+)(.*)$/);
  const my = String(b).match(/^(\d+)(.*)$/);
  if (mx && my) return Number(mx[1]) - Number(my[1]) || mx[2].localeCompare(my[2]);
  return String(a).localeCompare(String(b), undefined, { numeric: true });
}

const el = (sel) => document.querySelector(sel);
const view = el('#view');

function renderSidebar() {
  const list = el('#collectionList');
  if (list) {
    list.innerHTML = '<ul>' + collections.map((c) => {
      const n = hymns.filter((h) => h.collections.includes(c.id)).length;
      const active = state.view === 'collection' && state.collection === c.id;
      return `
      <li class="collection-item ${active ? 'active' : ''}" data-collection="${c.id}" aria-current="${active ? 'true' : 'false'}">
        ${collectionLogo(c)}
        <span style="color:${shadeText(c.color)}">${c.name}</span>
        <span class="count" style="background:${c.color};color:${tintText(c.color)}">${n}</span>
      </li>`;
    }).join('') + '</ul>';
  }
  const fc = el('#favCount');
  if (fc) fc.textContent = store.favorites.length ? store.favorites.length : '';
}

function activeNavTab() {
  const map = { home: 'home', hymns: 'hymns', favorites: 'library', history: 'library', library: 'library',
    collections: 'collections', collection: 'collections', more: 'more', about: 'more' };
  return map[state.view] || 'home';
}

function updateActiveNav() {
  const tab = activeNavTab();
  document.querySelectorAll('.nav-item').forEach((n) => n.classList.toggle('active', n.dataset.view === tab));
}

function setView(name, collection = null) {
  state.view = name;
  state.collection = collection;
  state.hymnOpen = null;
  if (name === 'collection') state.section = 'main';
  updateActiveNav();
  view.scrollTop = 0;
  render();
}

// Yoruba and other tonal languages carry heavy diacritics, so fold them for matching
function fold(s) {
  return String(s == null ? '' : s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’‘]/g, "'");
}

function matchesSearch(h) {
  const q = fold(state.search.trim());
  if (!q) return true;
  const parts = [h.title, hymnNo(h), h.author, ...h.lyrics.flat(), ...(h.chorus || []), langName(h.lang || 'en')];
  for (const v of Object.values(h.numbers || {})) if (v != null) parts.push(v);
  const en = TRANSLATIONS.en && TRANSLATIONS.en[h.id];
  if (en) parts.push(en.title, ...(en.lyrics || []).flat(), ...(en.chorus || []));
  const yo = yoFor(h);
  if (yo) parts.push(yo.title, ...(yo.lyrics || []).flat(), ...(yo.chorus || []));
  return fold(parts.join(' ')).includes(q);
}

// Song identity used to hide book reprints: some source books print the same
// text at two numbers (alternate tunes/settings), and the list must show each
// distinct song only once — at its first number. Jump-to-number still opens
// the hidden variant directly, and no data is dropped. (Mirror of Flutter
// state.dart songKey / _buildCollectionList so both apps list identically.)
function songKey(h) {
  if (!h.lyrics || !h.lyrics.length) return 't:' + fold(h.title);
  let buf = '';
  for (const v of h.lyrics) buf += v.join(' ') + ' ';
  if (h.chorus) buf += h.chorus.join(' ');
  return fold(buf).replace(/[^a-z0-9]+/g, ' ').trim();
}

// Common words are dropped so that short shared phrases ("king", "lord"…)
// cannot make two different songs look alike.
const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'was', 'are', 'has', 'have',
  'had', 'his', 'her', 'thy', 'thou', 'thee', 'you', 'your', 'our', 'ours',
  'mine', 'me', 'my', 'we', 'us', 'who', 'whom', 'not', 'but', 'all', 'any',
  'can', 'may', 'will', 'shall', 'be', 'been', 'by', 'in', 'on', 'of', 'to',
  'at', 'as', 'is', 'it', 'its', 'or', 'if', 'from', 'into', 'than', 'then',
  'when', 'where', 'over', 'under', 'out', 'up', 'down', 'no', 'yes', 'do',
  'does', 'did', 'he', 'she', 'they', 'them', 'there', 'here', 'what',
  'which', 'how', 'before', 'after', 'between', 'again', 'once', 'each',
  'every', 'both', 'few', 'more', 'most', 'other', 'such', 'only', 'own',
  'same', 'so', 'very', 's', 't', 'don', 'now', 'let', 'lets', 'o', 'a',
  'an', 'i',
]);

function songContentTokens(h) {
  let buf = '';
  if (!h.lyrics || !h.lyrics.length) {
    buf = h.title;
  } else {
    for (const v of h.lyrics) buf += v.join(' ') + ' ';
    if (h.chorus) buf += h.chorus.join(' ');
  }
  const out = new Set();
  for (const w of fold(buf).split(/[^a-z0-9]+/)) {
    if (w.length > 2 && !STOP_WORDS.has(w)) out.add(w);
  }
  return out;
}

// Two token sets describe the same song when they share nearly everything
// of the shorter one and a good part of the longer one.
function isSameSongTokens(a, b) {
  if (!a.size || !b.size) return false;
  const mn = Math.min(a.size, b.size);
  const mx = Math.max(a.size, b.size);
  if (mn < 6) return false;
  let it = 0;
  for (const w of a) if (b.has(w)) it++;
  return it / mn >= 0.85 && it / mx >= 0.55;
}

const collListCache = new Map();

function buildCollectionList(coll, section) {
  const src = hymns
    .filter((h) => h.collections.includes(coll) && (section === 'appendix' ? h.section === 'appendix' : !h.section))
    .sort((a, b) => compareHymnNo(hymnNo(a), hymnNo(b)));
  const seenText = new Set();
  const result = [];
  const keptTokens = [];
  for (const h of src) {
    const k = songKey(h);
    if (seenText.has(k)) continue; // exact reprint
    seenText.add(k);
    const t = songContentTokens(h);
    let dup = false;
    for (const kept of keptTokens) {
      if (isSameSongTokens(t, kept)) { dup = true; break; }
    }
    if (dup) continue; // reworded reprint of an already listed song
    keptTokens.push(t);
    result.push(h);
  }
  return result;
}

function visibleHymns() {
  let list = hymns;
  if (state.view === 'favorites') list = hymns.filter((h) => store.favorites.includes(h.id));
  if (state.view === 'history') list = store.history.map((id) => hymns.find((h) => h.id === id)).filter(Boolean);
  if (state.view === 'library') list = state.libTab === 'favorites'
    ? hymns.filter((h) => store.favorites.includes(h.id))
    : store.history.map((id) => hymns.find((h) => h.id === id)).filter(Boolean);
  if (state.view === 'collection') {
    const ck = state.collection + '|' + state.section;
    if (!collListCache.has(ck)) collListCache.set(ck, buildCollectionList(state.collection, state.section));
    list = collListCache.get(ck);
  }
  if (state.lang !== 'all') list = list.filter((h) => (h.lang || 'en') === state.lang);
  return list.filter(matchesSearch);
}

function sectionTabs() {
  const main = hymns.filter((h) => h.collections.includes(state.collection)).length;
  const app = hymns.filter((h) => h.collections.includes(state.collection) && h.section === 'appendix').length;
  const c = collectionBy(state.collection);
  const label = (c && c.sectionLabel) || 'Appendix';
  if (!app) return `<div class="section-tabs"><button class="tab on" data-section="main" style="--tc:${collectionColor(state.collection)}">All (${main})</button></div>`;
  return `
  <div class="section-tabs">
    <button class="tab ${state.section !== 'appendix' ? 'on' : ''}" data-section="main" style="--tc:${collectionColor(state.collection)}">Main (${main - app})</button>
    <button class="tab ${state.section === 'appendix' ? 'on' : ''}" data-section="appendix" style="--tc:${collectionColor(state.collection)}">${label} (${app})</button>
  </div>`;
}

function hymnCards(list) {
  if (!list.length) return '<div class="empty">No hymns found.</div>';
  return `<div class="hymn-list">` + list.map((h) => {
    const accent = hymnAccent(h);
    const chips = h.collections.map((cid) => {
      const col = collections.find((x) => x.id === cid);
      const cc = collectionColor(cid);
      return `<span class="chip" style="background:${cc};color:${tintText(cc)}">${collectionLogo(col)}<span>${collectionName(cid)}</span></span>`;
    }).join('');
    const lang = (h.lang || 'en') !== 'en' ? `<span class="lang-chip">${h.lang}</span> ` : '';
    const t = activeHymnText(h);
    const title = t.title || h.title;
    // flag hymns that the Yoruba switch cannot cover, so the list is never silently mixed
    const yoNote = useYo(h) ? '' :
      (state.collection && state.yoCollections.has(state.collection) && !yoFor(h)
        ? '<span class="yo-missing" title="No Yoruba translation for this hymn">EN</span>' : '');
    return `
      <div class="hymn-card" data-open="${h.id}" style="border-top:4px solid ${accent}" tabindex="0">
<span class="num" style="background:${accent};color:${tintText(accent)}">No. ${hymnNo(h)}</span>
        <h3 style="color:${shadeText(accent)}">${lang}${esc(title)} ${yoNote}</h3>
        <div class="author">${byline(h)}${h.chorus ? ' · with refrain' : ''}</div>
        <div class="chips">${chips}</div>
        <div class="card-foot">
          <span class="card-dur" style="color:${shadeText(accent)}">${fmtDur(hymnDuration(h))}</span>
          <span class="card-play" style="background:${accent};color:${tintText(accent)}">♪</span>
        </div>
      </div>`;
  }).join('') + '</div>';
}

/* ------------------------------------------------------------------
 *  Category + duration derived from the hymn data (no audio files)
 * ------------------------------------------------------------------ */

const CATEGORIES = [
  ['Grace & Salvation', ['grace', 'save', 'redeem', 'blood', 'forgive', 'mercy', 'sinner']],
  ['Faith & Trust', ['faith', 'trust', 'believe', 'hope', 'abide', 'cling']],
  ['Praise & Worship', ['praise', 'worship', 'glory', 'hallelu', 'holy', 'king', 'majesty', 'magnify', 'exalt']],
  ['Comfort & Peace', ['peace', 'rest', 'comfort', 'strength', 'battle', 'help', 'guide', 'tender']],
  ['Love & Devotion', ['love', 'heart', 'devotion', 'friend', 'dwell', 'crown']],
  ['Christmas & Advent', ['christmas', 'advent', 'born', 'manger', 'angel', 'tidings', 'wise men']],
  ['Morning & Evening', ['morning', 'evening', 'dawn', 'night', 'golden', 'sunrise']],
  ['Trial & Courage', ['trial', 'storm', 'courage', 'march', 'onward', 'victory', 'shield', 'armor']]
];

function hymnCategory(h) {
  if (h.category) return h.category;
  const hay = (h.title + ' ' + h.author + ' ' + (h.lyrics[0] || []).join(' ')).toLowerCase();
  for (const [cat, keys] of CATEGORIES) {
    if (keys.some((k) => hay.includes(k))) return cat;
  }
  return 'Worship & Devotion';
}

function byline(h) {
  const a = h.author || 'Traditional';
  return h.year ? `${a}, ${h.year}` : a;
}

function hymnDuration(h) {
  const tp = state.tempo || 1;
  const embed = TUNES && TUNES[h.id];
  if (typeof embed === 'string') {
    let sec = 0;
    embed.split('|').forEach((line) => {
      sec += 0.21;
      line.trim().split(/\s+/).filter(Boolean).forEach((tok) => {
        const n = parseTuneToken(tok);
        if (n) sec += n.dur;
      });
    });
    return Math.max(30, Math.round(Math.max(55, Math.min(240, Math.round(sec))) / tp));
  }
  const text = activeHymnText(h);
  const lines = [...(text.lyrics && text.lyrics[0] ? text.lyrics[0] : []), ...(text.chorus || [])];
  const syll = lines.reduce((a, l) => a + lyricSyllables(l).reduce((x, y) => x + y, 0), 0);
  return Math.max(30, Math.round((Math.max(55, Math.round(syll * 0.62 + lines.length * 0.42))) / tp));
}

function fmtDur(s) {
  const m = Math.floor(s / 60);
  const ss = Math.round(s % 60);
  return m + ':' + String(ss).padStart(2, '0');
}

/* ------------------------------------------------------------------
 *  SCREENS
 * ------------------------------------------------------------------ */

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Good Evening';
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function renderHome() {
  const featured = hymns.find((h) => h.id === 1) || hymns[0];
  const accent = hymnAccent(featured);
  const favs = store.favorites.length;
  const recent = store.history.length;
  const langCount = [...new Set(hymns.map((h) => h.lang || 'en'))].length;
  const traditions = collections.filter((c) => c.region);
  const prof = loadUserProfile();
  const who = prof && prof.name ? String(prof.name).trim().split(/\s+/)[0] : '';
  // Hymn of the Day — the same pick for everyone on a given date, new each day
  const dayNo = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const daily = hymns[(dayNo * 7919) % hymns.length];
  const dailyAccent = hymnAccent(daily);
  const isFavF = store.favorites.includes(daily.id);

  view.innerHTML = `
  <div class="home-view">
    <h1 class="home-hello">${greeting()},<br><span>Welcome Back${who ? ', ' + esc(who) : ''}</span> <span class="pray">🙏</span></h1>
    <p class="home-verse">“Let everything that has breath praise the Lord. Praise the Lord!” — Psalm 150:6</p>

    <div class="home-stats">
      <span>🌍 ${collections.length} hymnals</span><i>·</i><span>${langCount} languages</span><i>·</i><span>${hymns.length} hymns</span>
    </div>

    <button class="home-search" data-focus-search>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
      <span>Search hymns, titles or numbers...</span>
    </button>

    <div class="featured" data-feat-play="${featured.id}" style="--fc:${accent};--fct:${tintText(accent)}">
      <div class="featured-cross"><img data-logo src="${logoSrc()}" alt="Home of Hymns"><span class="cross-glyph">✟</span></div>
      <div class="featured-body">
        <span class="featured-tag">Featured Hymn</span>
        <h2>${esc(featured.title)}</h2>
        <p>No. ${hymnNo(featured)} · ${esc(hymnCategory(featured))} · ${esc(byline(featured))}</p>
      </div>
      <button class="featured-play" data-feat-play="${featured.id}" title="Play tune">▶</button>
    </div>

    <div class="daily-card" data-feat-play="${daily.id}" style="--dc:${dailyAccent}">
      <div class="daily-left">
        <span class="daily-tag">☀️ Hymn of the Day</span>
        <b>${esc(daily.title)}</b>
        <small>No. ${hymnNo(daily)} · ${collectionName(daily.collections[0])}${isFavF ? ' · ★ saved' : ''}</small>
      </div>
      <button class="daily-open" data-feat-play="${daily.id}" style="--tint:${tintText(dailyAccent)}">Open</button>
    </div>

    ${traditions.length ? `
    <div class="home-traditions">
      <div class="traditions-title">Global Traditions</div>
      <div class="traditions-scroll">
        ${traditions.map((c) => `
          <div class="trad-cell">
            <button class="trad-card" data-open-collection="${c.id}" style="--cc:${c.color}">
              ${collectionLogo(c)}
              <div class="trad-card-text"><b>${esc(c.region)}</b><small>${esc(c.name)} · ${collCount(c)}</small></div>
            </button>
            ${yoBadge(c)}
          </div>`).join('')}
      </div>
    </div>` : ''}

    <div class="quick-grid">
      <button class="quick-btn" data-quick="collections"><span class="qi" style="color:var(--accent)">📚</span><b>Hymn Collections</b><small>${collections.length} hymnals</small></button>
      <button class="quick-btn" data-quick="favorites"><span class="qi" style="color:#f59e0b">⭐</span><b>Favorites</b><small>${favs} saved</small></button>
      <button class="quick-btn" data-quick="history"><span class="qi" style="color:#0ea5e9">🕘</span><b>Recently Played</b><small>${recent} hymns</small></button>
      <button class="quick-btn" data-quick="more"><span class="qi" style="color:#a78bfa">☰</span><b>More</b><small>Settings & more</small></button>
    </div>
  </div>`;
  const fs = el('.home-search');
  if (fs) fs.addEventListener('click', () => {
    const s = el('#search');
    if (!s) return;
    const wrap = s.closest('.search-wrap');
    if (wrap) {
      wrap.classList.remove('flash');
      void wrap.offsetWidth;
      wrap.classList.add('flash');
      setTimeout(() => wrap.classList.remove('flash'), 1700);
    }
    try { s.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) { /* ignore */ }
    el('#view').scrollTop = 0;
    s.focus();
  });
  renderSidebar();
}

function renderHymnsPage() {
  const list = visibleHymns();
  view.innerHTML = `<h1 class="view-title" style="color:var(--accent);border-bottom:3px solid var(--accent)">All Hymns <small>${list.length} total</small></h1>` + hymnCards(list);
  renderSidebar();
  const langSel = el('#langFilter');
  if (langSel && langSel.value !== state.lang) langSel.value = state.lang;
}

const CHIP_COLLECTIONS = [
  { label: 'All', id: 'all' },
  { label: 'TACN', id: 'tac' },
  { label: 'CAC', id: 'cac' },
  { label: 'RCCG', id: 'redeemed' },
  { label: 'NBH 1926', id: 'nbh1926' },
  { label: 'Catholic', id: 'catholic' }
];

function collCount(c) { return hymns.filter((h) => h.collections.includes(c.id)).length; }

function renderCollections() {
  const q = state.colSearch.trim().toLowerCase();
  const shown = collections.filter((c) =>
    (state.chip === 'all' || c.id === state.chip) &&
    (!q || (c.name + ' ' + c.id).toLowerCase().includes(q))
  );
  const chips = CHIP_COLLECTIONS.filter((ch) => ch.id === 'all' || collections.some((c) => c.id === ch.id))
    .map((ch) => `<button class="chip-filter ${state.chip === ch.id ? 'on' : ''}" data-chip="${ch.id}">${ch.label}</button>`).join('');

  view.innerHTML = `
  <h1 class="view-title" style="color:var(--accent);border-bottom:3px solid var(--accent)">Hymn Collections <small>${collections.length} hymnals</small></h1>
  <div class="coll-search-wrap">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" class="search-ic"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
    <input id="colSearch" class="coll-search" placeholder="Search collections...">
  </div>
  <div class="chip-row">${chips}</div>
  <div class="coll-grid">
    ${shown.map((c) => `
      <div class="coll-cell">
        <button class="coll-card ${yoOn(c) ? 'yo-active' : ''}" data-open-collection="${c.id}" style="--cc:${c.color}">
          <span class="coll-card-bg">${collectionLogo(c)}</span>
          ${collectionLogo(c)}
          <div class="coll-card-text">
            <b>${c.name}</b>
            <small>${c.region || 'Traditional hymnal'} · ${collCount(c)} hymns</small>
            ${yoOn(c) ? '<span class="coll-yo-tag">YORUBA</span>' : ''}
          </div>
          <span class="coll-arrow">›</span>
        </button>
        ${yoBadge(c)}
      </div>`).join('') || '<div class="empty">No collections found.</div>'}
  </div>`;
  const cs = el('#colSearch');
  if (cs) { cs.value = state.colSearch; cs.addEventListener('input', (e) => { state.colSearch = e.target.value; renderCollections(); }); }
  renderSidebar();
}

function renderLibrary() {
  const list = visibleHymns();
  const tabs = [
    ['favorites', 'Favorites', '⭐'],
    ['collections', 'Collections', '📚'],
    ['history', 'History', '🕘']
  ];
  if (state.libTab === 'collections') {
    view.innerHTML = `
  <h1 class="view-title" style="color:var(--accent);border-bottom:3px solid var(--accent)">Library <small>your collections</small></h1>
  <div class="section-tabs lib-tabs">
    ${tabs.map(([id, label, icon]) => `<button class="tab ${state.libTab === id ? 'on' : ''}" data-libtab="${id}" style="--tc:var(--accent)">${icon} ${label}</button>`).join('')}
  </div>
  <div class="coll-grid">
    ${collections.map((c) => `
      <button class="coll-card" data-open-collection="${c.id}" style="--cc:${c.color}">
        ${collectionLogo(c)}
        <div class="coll-card-text">
          <b>${c.name}</b>
          <small>${collCount(c)} hymns</small>
        </div>
        <span class="coll-arrow">›</span>
      </button>`).join('')}
  </div>`;
    renderSidebar();
    return;
  }
  view.innerHTML = `
  <h1 class="view-title" style="color:var(--accent);border-bottom:3px solid var(--accent)">Library <small>your saved hymns</small></h1>
  <div class="section-tabs lib-tabs">
    ${tabs.map(([id, label, icon]) => `<button class="tab ${state.libTab === id ? 'on' : ''}" data-libtab="${id}" style="--tc:var(--accent)">${icon} ${label}</button>`).join('')}
  </div>
  ${list.length
    ? `<div class="lib-rows">` + list.map((h) => {
        const accent = hymnAccent(h);
        const cover = collectionBy(h.collections[0]);
        return `
        <div class="lib-row" data-open="${h.id}">
          <span class="lib-cover" style="border-color:${accent}">${cover ? collectionLogo(cover) : '🎵'}</span>
          <div class="lib-main">
            <b>No. ${hymnNo(h)} · ${esc(h.title)}</b>
            <small>${esc(hymnCategory(h))} · ${esc(byline(h))}</small>
          </div>
          <button class="lib-menu" data-libmenu="${h.id}" title="Menu">⋮</button>
        </div>`;
      }).join('') + `</div>`
    : `<div class="empty">${state.libTab === 'favorites' ? 'No favorites yet — tap ☆ on any hymn.' : 'No hymns read yet.'}</div>`}`;
  renderSidebar();
}

function renderMore() {
  const notif = localStorage.getItem('notif') === '1';
  const dark = document.body.classList.contains('night');
  const p = loadUserProfile();
  const name = p && p.name ? String(p.name).trim() : '';
  const first = name ? name.split(/\s+/)[0] : '';
  const initial = name ? name[0].toUpperCase() : '';
  const photo = p && p.photo ? p.photo : '';
  const sub = name ? (p.church || p.contact || 'Member') : 'Timeless Hymns for Every Generation';
  const favs = store.favorites.length;
  const recent = store.history.length;
  const langCount = [...new Set(hymns.map((h) => h.lang || 'en'))].length;

  view.innerHTML = `
  <h1 class="view-title" style="color:var(--accent);border-bottom:3px solid var(--accent)">More</h1>
  <div class="more-head">
    <div class="more-avatar ${photo ? 'has-photo' : initial ? 'has-initial' : ''}" data-avatar-upload title="Click to change your profile photo">${photo ? `<img src="${photo}" alt="Profile photo">` : initial ? esc(initial) : `<img data-logo src="${logoSrc()}" alt="Home of Hymns">`}</div>
    <div class="more-id"><b>${esc(first || 'Guest')}</b><small>${esc(sub)}</small></div>
    ${name ? `<button class="more-edit" data-edit-profile>Edit</button>` : `<button class="more-edit" data-edit-profile>Set up</button>`}
  </div>
  <div class="more-stats">
    <div class="more-stat"><b>${hymns.length.toLocaleString()}</b><small>Hymns</small></div>
    <div class="more-stat"><b>${collections.length}</b><small>Hymnals</small></div>
    <div class="more-stat"><b>${langCount}</b><small>Languages</small></div>
    <div class="more-stat"><b>${favs}</b><small>Favorites</small></div>
  </div>
  <div class="more-group-label">Preferences</div>
  <div class="more-list">
    <div class="more-row"><span>🔔</span><b>Notifications</b><label class="switch"><input type="checkbox" id="notifToggle" ${notif ? 'checked' : ''}></label></div>
    <div class="more-row"><span>🌓</span><b>Appearance</b><small class="more-side">${dark ? 'Night' : 'Day'}</small><label class="switch"><input type="checkbox" id="appearanceToggle" ${dark ? 'checked' : ''}></label></div>
    <div class="more-row"><span>🗣</span><b>Language</b><select id="moreLang" class="more-select">${langOptionsHtml('en')}</select></div>
  </div>
  <div class="more-group-label">Library</div>
  <div class="more-list">
    <button class="more-row" data-quick="favorites"><span>⭐</span><b>Favorites</b><small class="more-side">${favs} saved ›</small></button>
    <button class="more-row" data-quick="history"><span>🕘</span><b>Recently Read</b><small class="more-side">${recent} hymns ›</small></button>
  </div>
  <div class="more-group-label">App</div>
  <div class="more-list">
    <button class="more-row accent-row" data-more="about"><span>✟</span><b>About Home of Hymns</b><small class="more-side">v1.0.0 ›</small></button>
  </div>
  <div class="more-foot">Home of Hymns · Timeless Hymns for Every Generation<br>v1.0.0 · Works offline · Your data stays on this device</div>`;

  if (el('#notifToggle')) {
    el('#notifToggle').addEventListener('change', (e) => {
      localStorage.setItem('notif', e.target.checked ? '1' : '0');
      toast(e.target.checked ? 'Notifications on' : 'Notifications off');
    });
  }
  if (el('#appearanceToggle')) {
    el('#appearanceToggle').addEventListener('change', (e) => {
      const n = el('#nightMode');
      if (n) { n.checked = e.target.checked; n.dispatchEvent(new Event('change', { bubbles: true })); }
      else document.body.classList.toggle('night', e.target.checked);
      const side = e.target.closest('.more-row') ? e.target.closest('.more-row').querySelector('.more-side') : null;
      if (side) side.textContent = e.target.checked ? 'Night' : 'Day';
    });
  }
  if (el('#moreLang')) {
    const cur = state.lang === 'all' ? 'en' : state.lang;
    if (el('#moreLang').querySelector('option[value="' + cur + '"]')) el('#moreLang').value = cur;
    el('#moreLang').addEventListener('change', (e) => {
      const n = el('#langFilter');
      const val = e.target.value;
      if (n) { n.value = val; n.dispatchEvent(new Event('change', { bubbles: true })); }
      else { state.lang = val; render(); }
    });
  }
  renderSidebar();
}

/* ------------------------------------------------------------------
 *  ABOUT — full app info screen
 * ------------------------------------------------------------------ */

function renderAbout() {
  const total = hymns.length;
  const langCount = [...new Set(hymns.map((h) => h.lang || 'en'))].length;
  const favs = store.favorites.length;
  const yoTotal = hymns.filter((h) => yoFor(h)).length;
  const tuneCount = Object.keys(TUNES).length;
  const p = loadUserProfile();
  const first = p && p.name ? String(p.name).trim().split(/\s+/)[0] : '';

  const SOURCES = {
    tac: 'The Apostolic Church (Nigeria) hymnal — full text',
    cac: 'Christ Apostolic Church praise & worship hymns',
    redeemed: 'Redeemed Christian Church of God hymns',
    nbh1926: 'New Baptist Hymnal, first edition (1926)',
    anglican: 'Hymns Ancient and Modern (Standard ed., 1924)',
    cs: 'Cherubim & Seraphim hymn book (865 hymns, English & Yoruba)',
    methodist: 'Methodist Hymn-Book, London (1904) — full text',
    lutheran: 'The Lutheran Hymnal (1941) & Lutheran Service Book',
    catholic: 'Catholic hymns for Mass and devotions',
    gospel: 'Gospel songbook favourites',
    spirituals: 'African-American spirituals',
    winners: 'Winners Chapel praise hymns',
    deeperlife: 'Deeper Life Church hymns',
    latino: 'Spanish-language hymnal',
    deutsche: 'German hymnal',
    francais: 'French hymnal',
    african: 'African praise collection',
    gregorian: 'Gregorian & Orthodox chant'
  };

  const FEATURES = [
    ['📖', 'Read offline', `All ${total.toLocaleString()} hymns live on this device — no internet needed.`],
    ['🎶', 'Play the tune', tuneCount ? `Real melodies for ${tuneCount.toLocaleString()} hymns — with tempo control and a sing-along line highlight.` : 'Built-in tone player with tempo control and sing-along highlight.'],
    ['🎼', 'Tune names & sharing', 'See each hymn\u2019s tune name (like EVENTIDE) and copy lyrics to share.'],
    ['🇳🇬', 'Yoruba & world languages', `${langCount} languages, including Yoruba translations for ${yoTotal.toLocaleString()} hymns.`],
    ['⭐', 'Favorites & history', 'Star the hymns you love and pick up right where you left off.'],
    ['🔎', 'Jump by number', 'Press / or just start typing a number to open a hymn instantly.'],
    ['🌙', 'Night mode & big text', 'Dark theme and adjustable text for evening service and easy reading.']
  ];

  const stats = [
    [total.toLocaleString(), 'Hymns'],
    [collections.length, 'Hymnals'],
    [langCount, 'Languages'],
    [favs, 'Favorites']
  ];

  view.innerHTML = `
  <div class="about-view">
    <button class="about-back" data-about-back>← More</button>

    <div class="about-hero">
      <span class="hero-sheen"></span>
      <div class="about-emblem"><img data-logo src="${logoSrc()}" alt="Home of Hymns"><span class="cross-glyph">✟</span></div>
      <h1>Home of Hymns</h1>
      <p class="about-tag">Timeless Hymns for Every Generation</p>
      <span class="about-version">Version 1.0.0</span>
      ${first ? `<p class="about-user">Grace & peace, ${esc(first)} 🙏</p>` : ''}
    </div>

    <div class="about-stats">
      ${stats.map(([n, l]) => `<div class="about-stat"><b>${n}</b><small>${l}</small></div>`).join('')}
    </div>

    <div class="about-section">About this app</div>
    <div class="about-panel about-intro">
      <p>Home of Hymns brings together hymnals from Nigeria and around the world — Apostolic, Christ Apostolic, Redeemed, Baptist, Methodist, Lutheran, Catholic and more — in one simple app for church, family and personal worship.</p>
      <p>Everything works fully offline. Your favorites, reading history and profile never leave this device.</p>
    </div>

    <div class="about-section">What you can do</div>
    <div class="about-panel about-features">
      ${FEATURES.map(([i, t, d]) => `
        <div class="feature-row"><span class="feature-ic">${i}</span><div><b>${t}</b><small>${d}</small></div></div>`).join('')}
    </div>

    <div class="about-section">Your library <small>${collections.length} hymnals</small></div>
    <div class="about-grid">
      ${collections.map((c) => `
        <button class="about-card" data-open-collection="${c.id}" style="--cc:${c.color}">
          ${collectionLogo(c)}
          <b>${esc(c.name)}</b>
          <small>${collCount(c)} hymns</small>
        </button>`).join('')}
    </div>

    <div class="about-section">Sources & credits</div>
    <div class="about-panel about-credits">
      ${collections.map((c) => `
        <div class="credit-row"><i style="background:${c.color}"></i>
          <div><b>${esc(c.name)}</b><small>${SOURCES[c.id] || 'Hymn collection'}</small></div>
        </div>`).join('')}
    </div>

    <div class="about-section">Keyboard shortcuts</div>
    <div class="about-panel about-keys">
      <div><span class="kbd-set"><kbd>/</kbd></span><span>Open jump-to-number</span></div>
      <div><span class="kbd-set"><kbd>0</kbd>–<kbd>9</kbd></span><span>Start typing a hymn number</span></div>
      <div><span class="kbd-set"><kbd>←</kbd><kbd>→</kbd></span><span>Previous / next hymn</span></div>
      <div><span class="kbd-set"><kbd>↑</kbd><kbd>↓</kbd></span><span>Scroll verses</span></div>
      <div><span class="kbd-set"><kbd>Esc</kbd></span><span>Go back</span></div>
    </div>

    <div class="about-note">🔒 <b>Private by design</b> — no account, no tracking, no internet required. Everything stays on this device.</div>

    <div class="about-foot">
      <b>Home of Hymns</b>
      <span>“Let everything that has breath praise the Lord. Praise the Lord!” — Psalm 150:6</span>
      <small>Made with 🙏 · v1.0.0 · Timeless Hymns for Every Generation</small>
    </div>
  </div>`;
  renderSidebar();
}

/* ------------------------------------------------------------------
 *  PLAYER  (hymn detail / now playing)
 * ------------------------------------------------------------------ */

function hymnView(h) {
  addToHistory(h.id);
  const accent = hymnAccent(h);
  const isFav = store.favorites.includes(h.id);
  const text = activeHymnText(h);
  const dur = hymnDuration(h);
  const vs = visibleHymns();
  const idx = vs.findIndex((x) => x.id === h.id);
  const next = vs.slice(idx + 1, idx + 4);

  const notes = `<div class="notes-panel ${state.notesOpen ? 'open' : ''}">
    <b>About this hymn</b>
    <p>No. ${hymnNo(h)} · “${esc(h.title)}” by ${esc(byline(h))}. Categories: ${esc(hymnCategory(h))} · ${h.collections.map((c) => collectionName(c)).join(', ')}.</p>
    <p>Learn it from the numbered verses below, sing along to the tune, and save it to your favorites.</p>
  </div>`;

  const verses = text.lyrics.map((v, i) => `
    <div class="verse">
      <div class="chorus-label" style="color:${accent}">
        <span class="verse-num" style="border-color:${accent};color:${accent}">${i + 1}</span>Verse ${i + 1}
      </div>${v.map((line) => `<div class="line">${line}</div>`).join('\n')}
    </div>`).join('');

  const chorus = text.chorus ? `<div class="chorus" style="border-left:4px solid ${accent}">
      <div class="chorus-label" style="color:${accent}">Refrain</div>${text.chorus.map((l) => `<div class="line">${l}</div>`).join('\n')}
    </div>` : '';

  const langOpts = hymnLangs(h);

  const nextHtml = next.length ? `<div class="upnext">
    <div class="upnext-title" style="color:${accent}">Up Next</div>
    ${next.map((n) => `<button class="upnext-row" data-open="${n.id}"><b>No. ${hymnNo(n)}</b><span>${esc(n.title)}</span><i>${fmtDur(hymnDuration(n))}</i></button>`).join('')}
  </div>` : '';

  return `
  <div class="player-view">
    <div class="player-hero" style="--hc:${accent};background:
        radial-gradient(120% 100% at 50% 120%, color-mix(in srgb, ${accent} 26%, transparent) 0%, color-mix(in srgb, ${accent} 9%, transparent) 45%, #15071d 100%)">
      <span class="hero-sheen"></span>
      <span class="hero-num">${String(hymnNo(h)).padStart(2, '0')}</span>
      <div class="hero-emblem-row">
        ${h.collections.slice(0, 3).map((c) => `<div class="hero-coin" style="border-color:${collectionColor(c)}">${collectionLogo(collections.find((x) => x.id === c))}</div>`).join('')}
      </div>
      <span class="cross-glyph big">✟</span>
      <div class="hero-caption">${collectionName(h.collections[0])}</div>
    </div>

    <div class="player-head" style="--pc:${accent}">
      <div class="player-meta"><span class="num" style="background:${accent};color:${tintText(accent)}">No. ${hymnNo(h)}</span> <span class="player-cat">${esc(hymnCategory(h))}</span></div>
      <h2>${text.title}</h2>
      <p class="author">${byline(h)} · ${h.collections.map((c) => collectionName(c)).join(' · ')}</p>
      ${window.TUNE_NAMES && window.TUNE_NAMES[h.id] ? `<div class="tune-chip">♩ ${window.TUNE_NAMES[h.id].startsWith('Tune ') ? '' : 'Tune: '}${esc(window.TUNE_NAMES[h.id])}</div>` : ''}
    </div>

    <div class="player-controls" style="--pc:${accent}">
      <button data-shuffle class="${state.shuffle ? 'on' : ''}" title="Shuffle">🔀</button>
      <button data-prev title="Previous">⏮</button>
      <button data-fav="${h.id}" class="play-fav ${isFav ? 'faved' : ''}" style="border-color:${accent};color:${isFav ? tintText(accent) : shadeText(accent)};background:${isFav ? accent : 'transparent'}">${isFav ? '★ Saved' : '☆'}</button>
      <button data-next title="Next">⏭</button>
      <button data-tune title="Play tune">${playingTune ? '■ Stop' : '♪ Play'}</button>
    </div>

    <div class="timeline">
      <span class="tl-cur" id="tlCur">0:00</span>
      <div class="tl-track"><div class="tl-fill" id="tlFill"></div></div>
      <span class="tl-dur">${fmtDur(dur)}</span>
    </div>

    <div class="player-tools">
      <button data-aa="-">A−</button>
      <button data-aa="+">A+</button>
      <button data-tempo title="Playback speed">♩ ${state.tempo}×</button>
      <button data-copy title="Copy these lyrics">⎘ Copy</button>
      <button data-notes>${state.notesOpen ? 'Hide Notes' : 'Show Notes'}</button>
      <button data-fav="${h.id}" class="${isFav ? 'faved' : ''}">${isFav ? '★ Favorite' : '☆ Add to Favorites'}</button>
    </div>

    <div class="hymn-actions player-visible">
      <button data-back>← Back</button>
    </div>
    <div class="hymn-lang-row" style="--lc:${accent}">
      <span class="hymn-lang-label">🌐 Read in</span>
      <select class="hymn-lang-select" data-langsel aria-label="Read this hymn in another language">
        ${langOpts.map((o) => `<option value="${o.v}" ${currentLangValue(h) === o.v ? 'selected' : ''}>${esc(o.l)}</option>`).join('')}
      </select>
    </div>

    ${notes}
    <div class="hymn-keys"><kbd>←</kbd> prev &middot; <kbd>→</kbd> next hymn &middot; <kbd>↑</kbd><kbd>↓</kbd> verses &middot; <kbd>/</kbd> jump &middot; <kbd>Esc</kbd> back</div>
    <div class="lyrics" style="--pc:${accent}">${verses}${chorus}</div>
    ${nextHtml}
    <div class="byline">Hymn ${h.id} · ${h.title}</div>
  </div>`;
}

function render() {
  updateActiveNav();
  if (state.hymnOpen) {
    const h = hymns.find((x) => x.id === state.hymnOpen);
    if (h) { view.innerHTML = hymnView(h); startPlayerClock(h); return; }
  }
  if (state.view === 'home') { renderHome(); return; }
  if (state.view === 'hymns') { renderHymnsPage(); return; }
  if (state.view === 'collections') { renderCollections(); return; }
  if (state.view === 'more') { renderMore(); return; }
  if (state.view === 'about') { renderAbout(); return; }
  if (state.view === 'library' || state.view === 'favorites' || state.view === 'history') { renderLibrary(); return; }
  if (state.view === 'collection') {
    const t = titleFor();
    const tabs = sectionTabs();
    const c = collectionBy(state.collection);
    const yoBar = c ? `<div class="yo-bar">${yoBadge(c)}<span class="yo-bar-note">${yoOn(c)
      ? `Showing Yoruba where translated (${yoCount(c)} of ${collCount(c)} hymns)`
      : 'Switch this hymnal to Yoruba'}</span></div>` : '';
    view.innerHTML = `<h1 class="view-title" style="color:${t.color};border-bottom:3px solid ${t.color}">${t.html}</h1>${tabs}${yoBar}` + hymnCards(visibleHymns());
    renderSidebar();
  }
}

function addToHistory(id) {
  let h = store.history.filter((x) => x !== id);
  h.unshift(id);
  store.history = h.slice(0, 50);
  renderSidebar();
}

/* ------------------------------------------------------------------
 *  Tunes engine (unchanged behaviour)
 * ------------------------------------------------------------------ */

const TUNES = window.TUNES || {};
const TUNE_STEP = 0.3;
const SCALE_SEMI = [0, 2, 4, 5, 7, 9, 11, 12];

let audioCtx = null;
let tuneNodes = [];
let tuneTimer = null;
let playingTune = false;
let playerClock = null;

function tuneLines(h) {
  const lines = [];
  h.lyrics.forEach((v) => v.forEach((l) => lines.push(l)));
  if (h.chorus) h.chorus.forEach((l) => lines.push(l));
  return lines;
}

function parseTuneToken(tok) {
  const chars = [...tok];
  const digits = chars.filter((c) => /[0-7]/.test(c));
  const octs = chars.filter((c) => c === "'" || c === '.');
  const holds = chars.filter((c) => c === '-').length;
  if (digits.length !== 1 || chars.length !== digits.length + octs.length + holds) {
    if (/^-+$/.test(tok)) return { freq: 0, dur: TUNE_STEP * tok.length * 0.6 };
    return null;
  }
  const deg = Number(digits[0]);
  if (deg === 0) return { freq: 0, dur: TUNE_STEP * (holds + 1) };
  const base = 261.63 * Math.pow(2, (SCALE_SEMI[deg - 1] || 0) / 12);
  let f = base;
  for (const ch of octs) f = ch === '.' ? f / 2 : f * 2;
  return { freq: f, dur: TUNE_STEP * (holds + 1) };
}

function embeddedSeq(h) {
  const str = TUNES[h.id];
  const notes = [];
  const MAX_SEC = 240;
  let t = 0;
  let stop = false;
  str.split('|').forEach((line) => {
    if (stop) return;
    line.trim().split(/\s+/).filter(Boolean).forEach((tok) => {
      if (stop) return;
      const n = parseTuneToken(tok);
      if (!n) return;
      t += n.dur;
      if (t > MAX_SEC) { stop = true; return; }
      notes.push(n);
    });
    if (stop) return;
    const last = notes[notes.length - 1];
    if (last) last.gap = TUNE_STEP * 0.7;
    if (t > MAX_SEC - 15) stop = true;
  });
  return notes;
}

function countSyllables(word) {
  const base = (word.toLowerCase().match(/[aeiouà-ÿ]/g) || []).length;
  return Math.max(1, base);
}

function lyricSyllables(line) {
  return line.replace(/[^A-Za-zÀ-ÿ\' \-]/g, '')
    .trim().split(/\s+/).filter(Boolean).map(countSyllables);
}

function generatedSeq(h) {
  const text = activeHymnText(h);
  const lines = [];
  if (text.lyrics[0]) lines.push(...text.lyrics[0]);
  if (text.chorus) lines.push(...text.chorus);
  if (!lines.length) return [];
  const PHRASES = [
    { start: 1, arch: 5, cad: 5 },
    { start: 5, arch: 3, cad: 1 },
    { start: 3, arch: 6, cad: 5 },
    { start: 5, arch: 2, cad: 1 }
  ];
  const degFreq = (d) => 261.63 * Math.pow(2, SCALE_SEMI[Math.min(7, Math.max(1, d)) - 1] / 12);
  const lerpDeg = (a, b, t) => Math.round(a + (b - a) * t);
  const notes = [];
  lines.forEach((line, li) => {
    const p = PHRASES[li % PHRASES.length];
    const sylls = lyricSyllables(line);
    const total = sylls.reduce((a, b) => a + b, 0);
    if (!total) return;
    const lastLine = li === lines.length - 1;
    let si = 0;
    let prev = p.start;
    sylls.forEach((n, wi) => {
      const wordLast = wi === sylls.length - 1;
      for (let k = 0; k < n; k++) {
        const frac = total === 1 ? 1 : si / (total - 1);
        let target;
        if (total === 1) target = p.cad;
        else if (frac <= 0.5) target = lerpDeg(p.start, p.arch, frac * 2);
        else target = lerpDeg(p.arch, p.cad, (frac - 0.5) * 2);
        let deg = target;
        if (Math.abs(deg - prev) > 2) deg = prev + Math.sign(deg - prev) * 2;
        else if (deg === prev && target !== prev) deg = prev + Math.sign(target - prev);
        deg = Math.min(7, Math.max(1, deg));
        if (lastLine && wordLast && k === n - 1) deg = p.cad;
        prev = deg;
        let units = 2;
        if (k < n - 1) units = 1;
        else if (wordLast) units = lastLine ? 5 : 3;
        notes.push({ freq: degFreq(deg), dur: TUNE_STEP * units });
        si++;
      }
    });
    const last = notes[notes.length - 1];
    if (last) last.gap = TUNE_STEP * 1.4;
  });
  return notes;
}

let masterBus = null;
function masterGain() {
  if (!masterBus) {
    const g = audioCtx.createGain();
    g.gain.value = 0.85;
    const comp = audioCtx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.knee.value = 20;
    comp.ratio.value = 6;
    comp.attack.value = 0.004;
    comp.release.value = 0.25;
    g.connect(comp);
    comp.connect(audioCtx.destination);
    masterBus = { g, comp };
  }
  return masterBus.g;
}

const CHORD_PROG = [
  [130.81, 164.81, 196.0],
  [98.0, 123.47, 146.83],
  [110.0, 130.81, 164.81],
  [87.31, 130.81, 174.61]
];
const CHORD_BAR = TUNE_STEP * 8;

function padChord(freqs, t, dur) {
  const f = audioCtx.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = 950;
  f.Q.value = 0.4;
  freqs.forEach((fr) => {
    const o = audioCtx.createOscillator();
    o.type = 'sine';
    o.frequency.value = fr;
    const og = audioCtx.createGain();
    og.gain.value = 1 / freqs.length;
    o.connect(og);
    og.connect(f);
    o.start(t);
    o.stop(t + dur);
    tuneNodes.push(o, og);
  });
  const g = audioCtx.createGain();
  const atk = Math.min(0.6, dur * 0.3);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.055, t + atk);
  g.gain.setValueAtTime(0.055, t + Math.max(atk, dur - 0.45));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  f.connect(g);
  g.connect(masterGain());
  tuneNodes.push(f, g);
}

function note(t, freq, dur, vol, type) {
  const g = audioCtx.createGain();
  const o1 = audioCtx.createOscillator();
  o1.type = type || 'triangle';
  o1.frequency.value = freq;
  const o2 = audioCtx.createOscillator();
  o2.type = 'sine';
  o2.frequency.value = freq * 2;
  const g2 = audioCtx.createGain();
  g2.gain.value = 0.22;
  o1.connect(g);
  o2.connect(g2);
  g2.connect(g);
  const peak = vol;
  const atk = Math.min(0.045, dur * 0.25);
  const dec = Math.min(dur * 0.45, atk + 0.15);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + atk);
  g.gain.exponentialRampToValueAtTime(peak * 0.72, t + Math.max(atk + 0.01, dec));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  if (dur >= 0.5) {
    const lfo = audioCtx.createOscillator();
    lfo.frequency.value = 5.2;
    const lg = audioCtx.createGain();
    lg.gain.value = 4;
    lfo.connect(lg);
    lg.connect(o1.detune);
    lg.connect(o2.detune);
    lfo.start(t + 0.12);
    lfo.stop(t + dur);
    tuneNodes.push(lfo, lg);
  }
  g.connect(masterGain());
  o1.start(t);
  o1.stop(t + dur + 0.01);
  o2.start(t);
  o2.stop(t + dur + 0.01);
  tuneNodes.push(o1, o2, g, g2);
}

function scheduleTune(h) {
  audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const embedded = typeof TUNES[h.id] === 'string';
  const seq = embedded ? embeddedSeq(h) : generatedSeq(h);
  if (!seq.length) { stopTune(); return; }
  const tp = state.tempo || 1;
  if (tp !== 1) seq.forEach((n) => { n.dur /= tp; if (n.gap) n.gap /= tp; });
  let t = audioCtx.currentTime + 0.15;
  const musicStart = t;
  let total = 0;
  seq.forEach((n) => { total += n.dur + (n.gap || 0); });
  for (let ct = 0; ct < total; ct += CHORD_BAR) {
    padChord(CHORD_PROG[Math.floor(ct / CHORD_BAR) % CHORD_PROG.length],
      musicStart + ct, CHORD_BAR + 0.35);
  }
  seq.forEach((n) => {
    if (n.freq > 0) note(t, n.freq, n.dur, embedded ? 0.17 : 0.15);
    t += n.dur;
    if (n.gap) t += n.gap;
  });
  tuneTimer = setTimeout(() => stopTune(), (t - audioCtx.currentTime + 0.4) * 1000);
}

function startPlayerClock(h) {
  clearInterval(playerClock);
  const dur = hymnDuration(h);
  const fill = el('#tlFill');
  const cur = el('#tlCur');
  if (!fill || !cur) { clearInterval(playerClock); return; }
  const t0 = Date.now();
  playerClock = setInterval(() => {
    if (!playingTune) { fill.style.width = '0%'; cur.textContent = '0:00'; return; }
    const e = Math.min(1, (Date.now() - t0) / 1000 / dur);
    fill.style.width = (e * 100) + '%';
    cur.textContent = fmtDur(e * dur);
  }, 250);
}

function stopTune() {
  clearTimeout(tuneTimer);
  tuneTimer = null;
  tuneNodes.forEach((n) => { try { n.stop(); } catch (e) {} });
  tuneNodes = [];
  const btn = el('[data-tune]');
  if (btn) { btn.textContent = '♪ Play'; btn.classList.remove('tune-on'); }
  playingTune = false;
  view.querySelectorAll('.lyrics .line-on').forEach((l) => l.classList.remove('line-on'));
}

function playTune() {
  if (playingTune) { stopTune(); return; }
  const h = hymns.find((x) => x.id === state.hymnOpen);
  if (!h) return;
  playingTune = true;
  const btn = el('[data-tune]');
  if (btn) { btn.classList.add('tune-on'); btn.textContent = '■ Stop'; }
  const t0 = Date.now();
  const dur = hymnDuration(h);
  const fill = el('#tlFill');
  const cur = el('#tlCur');
  const lines = [...view.querySelectorAll('.lyrics .line')];
  let lastLi = -1;
  clearInterval(playerClock);
  playerClock = setInterval(() => {
    const e = Math.min(1, (Date.now() - t0) / 1000 / dur);
    if (fill) fill.style.width = (e * 100) + '%';
    if (cur) cur.textContent = fmtDur(e * dur);
    if (lines.length) {
      const li = Math.min(lines.length - 1, Math.floor(e * lines.length));
      if (li !== lastLi) {
        if (lastLi >= 0 && lines[lastLi]) lines[lastLi].classList.remove('line-on');
        if (lines[li]) {
          lines[li].classList.add('line-on');
          if (lines[li].scrollIntoView) lines[li].scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
        lastLi = li;
      }
    }
  }, 250);
  scheduleTune(h);
}

function openHymn(id) {
  stopTune();
  state.hymnOpen = Number(id);
  updateActiveNav();
  render();
}

/* ------------------------------------------------------------------
 *  Click delegation
 * ------------------------------------------------------------------ */

function copyText(txt) {
  const done = () => toast('Lyrics copied to clipboard');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).then(done, () => fallbackCopy(txt, done));
  } else fallbackCopy(txt, done);
}

function fallbackCopy(txt, done) {
  try {
    const ta = document.createElement('textarea');
    ta.value = txt;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    done();
  } catch (e) { toast('Copy failed'); }
}

view.addEventListener('click', (e) => {
  const feat = e.target.closest('[data-feat-play]');
  if (feat) { const id = Number(feat.dataset.featPlay); openHymn(id); el('#view').scrollTop = 0; return; }

  const quick = e.target.closest('[data-quick]');
  if (quick) {
    const q = quick.dataset.quick;
    if (q === 'collections') setView('collections');
    else if (q === 'favorites') { state.libTab = 'favorites'; setView('library'); }
    else if (q === 'history') { state.libTab = 'history'; setView('library'); }
    else setView('more');
    return;
  }

  const chip = e.target.closest('[data-chip]');
  if (chip) { state.chip = chip.dataset.chip; renderCollections(); return; }

  // Yoruba switch must be handled before the card click, and must stop propagation
  const yoBtn = e.target.closest('[data-yo-toggle]');
  if (yoBtn) {
    e.preventDefault();
    e.stopPropagation();
    const c = collectionBy(yoBtn.dataset.yoToggle);
    if (c) toggleYo(c);
    return;
  }

  const collCard = e.target.closest('[data-open-collection]');
  if (collCard) { setView('collection', collCard.dataset.openCollection); return; }

  const libTab = e.target.closest('[data-libtab]');
  if (libTab) { state.libTab = libTab.dataset.libtab; render(); return; }

  if (e.target.closest('.lib-menu')) {
    const id = Number(e.target.closest('.lib-menu').dataset.libmenu);
    if (state.libTab === 'favorites') {
      store.favorites = store.favorites.filter((x) => x !== id);
      toast('Removed from favorites');
    } else {
      store.history = store.history.filter((x) => x !== id);
      toast('Removed from history');
    }
    render();
    return;
  }

  const moreBtn = e.target.closest('[data-more]');
  if (moreBtn) {
    if (moreBtn.dataset.more === 'about') setView('about');
    return;
  }

  if (e.target.closest('[data-about-back]')) { setView('more'); return; }

  if (e.target.closest('[data-edit-profile]')) { openGate(); return; }

  if (e.target.closest('[data-avatar-upload]')) {
    pickProfilePhoto((dataUrl) => {
      const p = loadUserProfile() || {};
      p.photo = dataUrl;
      saveUserProfile(p);
      renderUserChip();
      render();
      toast('Profile photo updated');
    });
    return;
  }

  const sectBtn = e.target.closest('[data-section]');
  if (sectBtn && state.view === 'collection') {
    state.section = sectBtn.dataset.section;
    render();
    return;
  }

  const langBtn = e.target.closest('[data-lang]');
  if (langBtn && state.hymnOpen) {
    stopTune();
    state.hymnLang = langBtn.dataset.lang;
    render();
    return;
  }

  const tune = e.target.closest('[data-tune]');
  if (tune && state.hymnOpen) {
    if (playingTune) stopTune(); else playTune();
    return;
  }

  const shuffleBtn = e.target.closest('[data-shuffle]');
  if (shuffleBtn && state.hymnOpen) {
    state.shuffle = !state.shuffle;
    toast(state.shuffle ? 'Shuffle on' : 'Shuffle off');
    render();
    return;
  }

  const prevBtn = e.target.closest('[data-prev]');
  if (prevBtn && state.hymnOpen) {
    const list = visibleHymns();
    const idx = list.findIndex((h) => h.id === state.hymnOpen);
    if (idx > 0) openHymn(list[idx - 1].id); else toast('Already at the first hymn');
    return;
  }

  const nextBtn = e.target.closest('[data-next]');
  if (nextBtn && state.hymnOpen) {
    const list = visibleHymns();
    if (state.shuffle) {
      const others = list.filter((h) => h.id !== state.hymnOpen);
      if (others.length) openHymn(others[Math.floor(Math.random() * others.length)].id);
      return;
    }
    const idx = list.findIndex((h) => h.id === state.hymnOpen);
    if (idx > -1 && idx < list.length - 1) openHymn(list[idx + 1].id); else toast('End of the list');
    return;
  }

  const aaBtn = e.target.closest('[data-aa]');
  if (aaBtn && state.hymnOpen) {
    const s = el('#fontSize');
    if (s) {
      const v = Math.max(14, Math.min(34, (parseInt(s.value, 10) || 19) + (aaBtn.dataset.aa === '+' ? 2 : -2)));
      s.value = v;
      applyFont();
    }
    return;
  }

  const notesBtn = e.target.closest('[data-notes]');
  if (notesBtn && state.hymnOpen) {
    state.notesOpen = !state.notesOpen;
    render();
    return;
  }

  const tempoBtn = e.target.closest('[data-tempo]');
  if (tempoBtn && state.hymnOpen) {
    const opts = [0.75, 1, 1.25, 1.5];
    state.tempo = opts[(Math.max(0, opts.indexOf(state.tempo)) + 1) % opts.length];
    try { localStorage.setItem('tempo', String(state.tempo)); } catch (e2) { /* ignore */ }
    if (playingTune) stopTune();
    toast('Tempo ' + state.tempo + '×');
    render();
    return;
  }

  const copyBtn = e.target.closest('[data-copy]');
  if (copyBtn && state.hymnOpen) {
    const h = hymns.find((x) => x.id === state.hymnOpen);
    if (!h) return;
    const t = activeHymnText(h);
    const tn = window.TUNE_NAMES && window.TUNE_NAMES[h.id];
    const parts = [`No. ${hymnNo(h)} — ${t.title}`];
    parts.push(byline(h) + ' · ' + h.collections.map((c) => collectionName(c)).join(' · '));
    if (tn) parts.push(tn.startsWith('Tune ') ? tn : 'Tune: ' + tn);
    parts.push('');
    t.lyrics.forEach((v, i2) => {
      parts.push(i2 + 1 + '.');
      v.forEach((l) => parts.push(l));
      parts.push('');
    });
    if (t.chorus) {
      parts.push('Refrain:');
      t.chorus.forEach((l) => parts.push(l));
      parts.push('');
    }
    parts.push('— Copied from Home of Hymns');
    copyText(parts.join('\n'));
    return;
  }

  const fav = e.target.closest('[data-fav]');
  if (fav) {
    const id = Number(fav.dataset.fav);
    let favs = store.favorites;
    if (favs.includes(id)) favs = favs.filter((x) => x !== id);
    else favs.push(id);
    store.favorites = favs;
    toast(favs.includes(id) ? 'Added to favorites' : 'Removed from favorites');
    render();
    return;
  }

  if (e.target.closest('[data-back]')) { stopTune(); setView('hymns'); return; }

  const card = e.target.closest('[data-open]');
  if (card) openHymn(card.dataset.open);
});

view.addEventListener('change', (e) => {
  const sel = e.target.closest('[data-langsel]');
  if (sel && state.hymnOpen) {
    stopTune();
    // picking the original must beat the per-collection Yoruba switch, so turn it off
    if (sel.value === 'orig' && state.collection && state.yoCollections.has(state.collection)) {
      state.yoCollections.delete(state.collection);
      try { localStorage.setItem('yoCollections', JSON.stringify([...state.yoCollections])); } catch (err) { /* ignore */ }
    }
    setHymnLang(sel.value);
    toast('Reading this hymn in ' + (sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].text : ''));
    render();
  }
});

el('#collectionList').addEventListener('click', (e) => {
  const item = e.target.closest('[data-collection]');
  if (item) setView('collection', item.dataset.collection);
});

document.querySelectorAll('.nav-item').forEach((n) => {
  n.addEventListener('click', () => setView(n.dataset.view));
});

el('#search').addEventListener('input', (e) => {
  state.search = e.target.value;
  if (state.view === 'home' && e.target.value) setView('hymns');
  else render();
});

// Clicking anywhere in the search bar (icon, padding) activates the field
const searchWrap = document.querySelector('.search-wrap');
if (searchWrap) searchWrap.addEventListener('click', (e) => {
  const s = el('#search');
  if (s && e.target !== s) s.focus();
});

// Brand logo/title returns home
const brandEl = document.querySelector('.brand');
if (brandEl) brandEl.addEventListener('click', () => setView('home'));

function populateLangFilter() {
  const langs = [...new Set(hymns.map((h) => h.lang || 'en'))].sort();
  const sel = el('#langFilter');
  sel.innerHTML = '<option value="all">All Languages</option>' +
    langs.map((l) => `<option value="${l}">${langName(l)}</option>`).join('');
  sel.value = state.lang;
}

el('#langFilter').addEventListener('change', (e) => {
  state.lang = e.target.value;
  render();
});

function applyFont() {
  view.style.fontSize = el('#fontSize').value + 'px';
  localStorage.setItem('fontSize', el('#fontSize').value);
}

el('#fontSize').value = localStorage.getItem('fontSize') || '19';
el('#nightMode').checked = localStorage.getItem('night') === '1';
applyFont();
if (el('#nightMode').checked) document.body.classList.add('night');

el('#fontSize').addEventListener('input', applyFont);
el('#nightMode').addEventListener('change', () => {
  document.body.classList.toggle('night', el('#nightMode').checked);
  localStorage.setItem('night', el('#nightMode').checked ? '1' : '0');
  render();
  renderSidebar();
});

populateLangFilter();

/* ------------------------------------------------------------------
 *  Splash (login-free boot straight into Home)
 * ------------------------------------------------------------------ */

function startApp() {
  const splash = el('#splash');
  if (splash) { splash.classList.add('hide'); setTimeout(() => { splash.hidden = true; splash.remove(); }, 450); }
  initGate();
}

/* ------------------------------------------------------------------
 *  Profile photo — pick an image, crop to a square, keep it local
 * ------------------------------------------------------------------ */

let gatePhoto = null;
let photoPicker = null;

function pickProfilePhoto(cb) {
  if (!photoPicker) {
    photoPicker = document.createElement('input');
    photoPicker.type = 'file';
    photoPicker.accept = 'image/*';
    document.body.appendChild(photoPicker);
  }
  photoPicker.value = '';
  photoPicker.onchange = () => {
    const f = photoPicker.files && photoPicker.files[0];
    photoPicker.onchange = null;
    if (f) cropToAvatar(f, cb);
  };
  photoPicker.click();
}

function cropToAvatar(file, cb) {
  const fr = new FileReader();
  fr.onerror = () => toast('Could not read that image');
  fr.onload = () => {
    const img = new Image();
    img.onerror = () => toast('Unsupported image format');
    img.onload = () => {
      const S = 256;
      try {
        const c = document.createElement('canvas');
        c.width = S;
        c.height = S;
        const ctx = c.getContext('2d');
        const side = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, S, S);
        cb(c.toDataURL('image/jpeg', 0.85));
      } catch (e) { toast('Could not read that image'); }
    };
    img.src = fr.result;
  };
  fr.readAsDataURL(file);
}

function updateGateAvatar() {
  const btn = el('#gateAvatar');
  const img = btn && btn.querySelector('img');
  if (!img) return;
  const photo = gatePhoto || '';
  if (photo) {
    img.removeAttribute('data-logo');
    img.src = photo;
    img.classList.add('photo');
    btn.title = 'Change profile photo';
  } else {
    img.setAttribute('data-logo', '');
    img.src = logoSrc();
    img.classList.remove('photo');
    btn.title = 'Add a profile photo';
  }
  const rm = el('#gatePhotoRemove');
  if (rm) rm.hidden = !photo;
}

/* ------------------------------------------------------------------
 *  Entry gate — user details are required before entering the app
 * ------------------------------------------------------------------ */

function loadUserProfile() {
  try { return JSON.parse(localStorage.getItem('userInfo') || 'null'); } catch (e) { return null; }
}

function saveUserProfile(p) {
  try { localStorage.setItem('userInfo', JSON.stringify(p)); } catch (e) { /* ignore */ }
}

function renderUserChip() {
  const chip = el('#userChip');
  if (!chip) return;
  const p = loadUserProfile();
  if (!p || !p.name) { chip.hidden = true; return; }
  const first = String(p.name).trim().split(/\s+/)[0];
  chip.hidden = false;
  chip.innerHTML = (p.photo ? `<img src="${p.photo}" alt="">` : '') + 'Welcome, ' + esc(first);
  chip.title = p.name + (p.church ? ' · ' + p.church : '') + ' — click to edit';
}

function openGate() {
  const gate = el('#entryGate');
  if (!gate) return;
  const p = loadUserProfile() || {};
  el('#gateName').value = p.name || '';
  el('#gateContact').value = p.contact || '';
  el('#gateChurch').value = p.church || '';
  el('#gateError').hidden = true;
  gatePhoto = p.photo || '';
  updateGateAvatar();
  gate.hidden = false;
  setTimeout(() => { const n = el('#gateName'); if (n) n.focus(); }, 60);
}

function closeGate() {
  const gate = el('#entryGate');
  if (gate) gate.hidden = true;
}

function initGate() {
  const form = el('#gateForm');
  if (form && !form.dataset.bound) {
    form.dataset.bound = '1';
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = (el('#gateName').value || '').trim();
      if (!name) { el('#gateError').hidden = false; el('#gateName').focus(); return; }
      saveUserProfile({
        name,
        contact: (el('#gateContact').value || '').trim(),
        church: (el('#gateChurch').value || '').trim(),
        photo: gatePhoto || '',
        enteredAt: Date.now()
      });
      closeGate();
      renderUserChip();
      render();
      toast('Welcome, ' + name.split(/\s+/)[0] + '!');
    });
  }
  const avatar = el('#gateAvatar');
  if (avatar && !avatar.dataset.bound) {
    avatar.dataset.bound = '1';
    avatar.addEventListener('click', () => {
      pickProfilePhoto((dataUrl) => {
        gatePhoto = dataUrl;
        updateGateAvatar();
        toast('Photo added — press Enter to save');
      });
    });
  }
  const rm = el('#gatePhotoRemove');
  if (rm && !rm.dataset.bound) {
    rm.dataset.bound = '1';
    rm.addEventListener('click', () => {
      gatePhoto = '';
      updateGateAvatar();
    });
  }
  const chip = el('#userChip');
  if (chip && !chip.dataset.bound) { chip.dataset.bound = '1'; chip.addEventListener('click', () => openGate()); }
  renderUserChip();
  if (!loadUserProfile()) openGate();
}

/* ------------------------------------------------------------------
 *  Keyboard navigation + jump-to-number
 * ------------------------------------------------------------------ */
let jumpOpen = false;
let jumpDigits = '';
let jumpToastTimer = null;

function toast(msg) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(jumpToastTimer);
  jumpToastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

function backToList() { if (state.hymnOpen) stopTune(); setView('hymns'); }

function openJump(digit) {
  const box = el('#jumpBox');
  if (!box) return;
  jumpOpen = true;
  jumpDigits = digit || '';
  box.hidden = false;
  const inp = el('#jumpInput');
  inp.value = jumpDigits;
  inp.focus();
  updateJumpPreview();
}

function closeJump() {
  jumpOpen = false;
  const box = el('#jumpBox');
  if (box) box.hidden = true;
  if (document.activeElement && document.activeElement.id === 'jumpInput') document.activeElement.blur();
}

function addJumpDigit(k) {
  jumpDigits = (jumpDigits + k).slice(0, 4);
  el('#jumpInput').value = jumpDigits;
  updateJumpPreview();
}

function backJump() {
  jumpDigits = jumpDigits.slice(0, -1);
  el('#jumpInput').value = jumpDigits;
  updateJumpPreview();
}

function jumpCandidate() {
  const n = parseInt(jumpDigits, 10);
  if (!Number.isFinite(n) || n < 1) return null;
  const scope = state.view === 'collection'
    ? hymns.filter((h) => h.collections.includes(state.collection))
    : hymns;
  return scope.find((h) => hymnNo(h) === n) || null;
}

function jumpScopeName() {
  return state.view === 'collection' ? collectionName(state.collection) : 'all hymns';
}

function updateJumpPreview() {
  const p = el('#jumpPreview');
  if (!p) return;
  if (!jumpDigits) { p.textContent = ''; p.classList.remove('found'); return; }
  const c = jumpCandidate();
  if (c) { p.textContent = hymnNo(c) + ' · ' + c.title; p.classList.add('found'); }
  else { p.textContent = 'none in ' + jumpScopeName(); p.classList.remove('found'); }
}

function submitJump() {
  const c = jumpCandidate();
  if (c) { closeJump(); openHymn(c.id); return; }
  toast(jumpDigits ? 'No hymn #' + jumpDigits + ' in ' + jumpScopeName() : 'Type a hymn number');
  closeJump();
}

function scrollVerse(dir) {
  const vs = Array.from(document.querySelectorAll('.lyrics .verse'));
  const sp = el('#view');
  if (!vs.length || !sp) return;
  const cp = sp.getBoundingClientRect();
  let cur = 0;
  vs.forEach((v, i) => { if (v.getBoundingClientRect().top < cp.top + 80) cur = i; });
  const next = Math.max(0, Math.min(vs.length - 1, cur + dir));
  const delta = vs[next].getBoundingClientRect().top - cp.top - 30;
  sp.scrollBy({ top: delta, behavior: 'smooth' });
}

document.addEventListener('keydown', (e) => {
  const gate = document.getElementById('entryGate');
  if (gate && !gate.hidden) return;
  const tag = (e.target.tagName || '').toLowerCase();
  const typing = tag === 'input' || tag === 'select' || tag === 'textarea';

  if (typing && e.target.id !== 'jumpInput') {
    if (e.key === 'Escape' && jumpOpen) { e.preventDefault(); closeJump(); }
    return;
  }

  if (jumpOpen || e.target.id === 'jumpInput') {
    if (e.key === 'Escape') { e.preventDefault(); closeJump(); }
    else if (e.key === 'Enter') { e.preventDefault(); submitJump(); }
    else if (e.key === 'Backspace') { e.preventDefault(); backJump(); }
    else if (/^[0-9]$/.test(e.key)) { e.preventDefault(); addJumpDigit(e.key); }
    return;
  }

  if (e.key === '/' && !typing) { e.preventDefault(); openJump(); return; }
  if (/^[0-9]$/.test(e.key) && !typing) { e.preventDefault(); openJump(e.key); return; }

  if (state.view === 'about' && e.key === 'Escape') { e.preventDefault(); setView('more'); return; }

  if (state.hymnOpen) {
    const list = visibleHymns();
    const idx = list.findIndex((h) => h.id === state.hymnOpen);
    if (e.key === 'ArrowRight' && idx > -1 && idx < list.length - 1) { e.preventDefault(); openHymn(list[idx + 1].id); }
    else if (e.key === 'ArrowLeft' && idx > 0) { e.preventDefault(); openHymn(list[idx - 1].id); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); scrollVerse(-1); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); scrollVerse(1); }
    else if (e.key === 'Escape') { e.preventDefault(); backToList(); }
  }
});

document.addEventListener('click', (e) => {
  if (jumpOpen && !e.target.closest('#jumpBox') && !e.target.closest('#jumpBtn')) closeJump();
});

if (el('#jumpBtn')) {
  el('#jumpBtn').addEventListener('click', () => (jumpOpen ? closeJump() : openJump()));
}

if (el('#jumpInput')) {
  el('#jumpInput').addEventListener('input', (e) => {
    jumpDigits = e.target.value.replace(/\D+/g, '').slice(0, 4);
    el('#jumpInput').value = jumpDigits;
    updateJumpPreview();
  });
}

function titleFor() {
  if (state.view === 'favorites') return { html: `Favorites <small>${visibleHymns().length} saved</small>`, color: '#f59e0b' };
  if (state.view === 'history') return { html: `History <small>recently read</small>`, color: '#0ea5e9' };
  if (state.view === 'collection') {
    const s = state.section === 'appendix' ? 'Appendix' : 'Main';
    const c = collections.find((x) => x.id === state.collection);
    return { html: `${c ? collectionLogo(c) : ''} <span>${collectionName(state.collection)}</span> <small>${s} · ${visibleHymns().length} hymns</small>`, color: collectionColor(state.collection) };
  }
  return { html: `All Hymns <small>${visibleHymns().length} total</small>`, color: 'var(--accent)' };
}

render();
updateActiveNav();
setTimeout(() => startApp(), 1100);