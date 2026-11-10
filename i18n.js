/* ------------------------------------------------------------------
 *  Home of Hymns — interface language (English ⇄ Yoruba)
 *  Keys are the exact English UI strings; values are Yoruba.
 *  Any string missing from the map falls back to English automatically,
 *  so the app can never break because of a translation gap.
 * ------------------------------------------------------------------ */
(function () {
  'use strict';

  var UI_YO = {
    /* ---- static shell (index.html, via data-t / data-t-ph / data-t-title) ---- */
    'Timeless Hymns for Every Generation': 'Orin Àìparí Fún Gbogbo Ọ̀gbọ́',
    'Add a profile photo': 'Fi àwòrán profàìlì kún',
    'Remove photo': 'Yọ àwòrán kúrò',
    'Welcome to Home of Hymns': 'Ẹ kú àbọ̀ sí Home of Hymns',
    'Enter your details to continue': 'Tẹ alaye rẹ láti tẹ̀síwájú',
    'Full Name': 'Orúkọ Tìpọn',
    'e.g. John Adeyemi': 'Àpẹẹrẹ: John Adeyemi',
    'Phone or Email': 'Fóònù tàbí Ìmèèlì',
    'Optional': 'Aò bá nilo',
    'Church / Branch': 'Ilé Ijọ / Àgbàlá',
    'Please enter your name': 'Tẹ orúkọ rẹ kúrò',
    'Enter': 'Wọlé',
    'Your details stay on this device.': 'Alaye rẹ ó máa dùbúlẹ̀ nínú ètò yìí.',
    'Your profile': 'Profàìlì rẹ',
    'Font size': 'Ìwọ̀n fọ́ntì',
    'Night mode': 'Ìmọ̀lẹ̀ ọ̀ru',
    'Search title, number, lyrics, author...': 'Wá aṣọyẹ, nọ́mbà, ọ̀rọ̀ orin, olùpè...',
    'All Languages': 'Gbogbo Èdè',
    'Jump to hymn number (/)': 'Lọ sí nọ́mbà orin (/)',
    'Number': 'Nọ́mbà',
    'Home': 'Ilé',
    'Hymns': 'Orin',
    'Collections': 'Ìpàkọ̀',
    'Library': 'Ìwé Mi',
    'More': 'Míì',
    'Privacy': 'Ìkọ̀kọ̀',
    'Privacy Policy': 'Ofere Ìkọ̀kọ̀',
    'Interface language': 'Èdè Etó',
    'Switch to English': 'Padà sí Èdè Gẹ̀gẹ́ Bí Yorùbá',
    'Switch to Yoruba': 'Padà sí Èdè Yorùbá',

    /* ---- home ---- */
    'Good Morning': 'E káàárọ̀',
    'Good Afternoon': 'E káàsán',
    'Good Evening': 'E káalẹ́',
    'Welcome Back': 'Ẹ Kú Àbọ̀',
    '“Let everything that has breath praise the Lord. Praise the Lord!” — Psalm 150:6':
      '“Gbogbo ohun ńfi ẹmí rẹ̀ nyè Olúwa; Gbogbo ẹsin, e yìn Olúwa!” — Sọmọ 150:6',
    'hymnals': 'ìwé orin',
    'languages': 'èdè',
    'hymns': 'orin',
    'Search hymns, titles or numbers...': 'Wá orin, aṣọyẹ tàbí nọ́mbà...',
    'Featured Hymn': 'Orin Àkànṣe',
    'Play tune': 'Ṣeré Orin',
    'Hymn of the Day': 'Orin Ọjọ́',
    'Open': 'Ṣí',
    '★ saved': '★ ti fipamọ́',
    'Global Traditions': 'Àṣà Àgbáyé',
    'Hymn Collections': 'Ìpàkọ̀ Orin',
    'Favorites': 'Fìran',
    'saved': 'ti fipamọ́',
    'Recently Played': 'Tó ti Ṣeré',
    'Settings & more': 'Ètò àti mìíràn',

    /* ---- hymn list / collections / library ---- */
    'All Hymns': 'Gbogbo Orin',
    'total': 'lapapọ̀',
    'No hymns found.': 'Kò sí orin tó wà.',
    'No Yoruba translation for this hymn': 'Kò sí ìtumọ̀ Yoruba fún orin yìí',
    'with refrain': 'pẹ̀lú orin ẹgbẹ́',
    'Traditional hymnal': 'Ìwé orin àṣà',
    'Traditional': 'Àṣà',
    'No collections found.': 'Kò sí ìpàkọ̀ tó wà.',
    'Search collections...': 'Wá ìpàkọ̀...',
    'your collections': 'àwọn ìpàkọ̀ rẹ',
    'your saved hymns': 'àwọn orin rẹ tí a ti fipamọ́',
    'History': 'Ìtàn',
    'No favorites yet — tap ☆ on any hymn.': 'Kò sí fìran tẹ́lẹ̀ — te ☆ lórí kọ̀ọ̀kan orin.',
    'No hymns read yet.': 'Kò sí orin tó ka tẹ́lẹ̀.',
    'Menu': 'Àtọ́ka',
    'All': 'Gbogbo',
    'Main': 'Àkọ́kọ́',
    'Appendix': 'Àfikún',
    'recently read': 'tí a ti kà',

    /* ---- more / settings ---- */
    'Guest': 'Aláàbọ̀',
    'Member': 'Ọmọ Ẹgbẹ́',
    'Edit': 'Àtúnṣe',
    'Set up': 'TúnṢeto',
    'Hymnals': 'Ìwé Orin',
    'Languages': 'Èdè',
    'Preferences': 'Àṣàyàn',
    'Notifications': 'Ìkéde',
    'Appearance': 'Àwòrán',
    'Language': 'Èdè',
    'Night': 'Òru',
    'Day': 'Ọ̀sán',
    'App': 'Ètò',
    'About Home of Hymns': 'Nípa Home of Hymns',
    'Recently Read': 'Tó ti Kà',
    'Works offline': 'Ṣiṣẹ́ Láìsí Ìntánẹ́tì',
    'Your data stays on this device': 'Dáta rẹ dúbúlẹ̀ nínú ètò yìí',
    'Notifications on': 'Ìkéde ti kún',
    'Notifications off': 'Ìkéde kò sí mọ́',
    'Click to change your profile photo': 'Te láti yí àwòrán profàìlì padà',

    /* ---- about ---- */
    '← More': '← Míì',
    'Version': 'Àkójọ',
    'Grace & peace': 'Àánú àti ìfẹ́',
    'About this app': 'Nípa ètò yìí',
    'Home of Hymns brings together hymnals from Nigeria and around the world — Apostolic, Christ Apostolic, Redeemed, Baptist, Methodist, Lutheran, Catholic and more — in one simple app for church, family and personal worship.':
      'Home of Hymns jọ àwọn ìwé orin láti Nàìjíríà àti gbogbo agbègbè — Apostolic, Christ Apostolic, Redeemed, Baptist, Methodist, Lutheran, Catholic àti mìíràn — nínú ètò kan rọrùn fún ìjọ, ẹgbẹ́lérò àti ìṣẹ̀wọ̀ ẹni.',
    'Everything works fully offline. Your favorites, reading history and profile never leave this device.':
      'Gbogbo nǹkan ń ṣiṣẹ́ láìsí ìntánẹ́tì. Fìran, ìtàn ìka àti profàìlì rẹ kò ní kọjá sí ètò yìí.',
    'What you can do': 'Ohun Tó Lè Ṣe',
    'Read offline': 'Ka Láìsí Ìntánẹ́tì',
    'hymns live on this device — no internet needed.':
      'orin wà nínú ètò yìí — kò nílò ìntánẹ́tì.',
    'Play the tune': 'Ṣeré Orin',
    'Real melodies for {n} hymns — with tempo control and a sing-along line highlight.':
      'Oòrìn tó yé fún {n} orin — pẹ̀lú ìṣàkóso ìyára àti àmì líle.',
    'Built-in tone player with tempo control and sing-along highlight.':
      'Ẹrọ tẹ orin àdàyé pẹ̀lú ìṣàkóso ìyára àti àmì líle.',
    'Tune names & sharing': 'Orúkọ Orin àti Pípín',
    'See each hymn’s tune name (like EVENTIDE) and copy lyrics to share.':
      'Wo orúkọ orin kọ̀ọ̀kan (bí EVENTIDE) kópẹ̀ ọ̀rọ̀ rẹ láti pín.',
    'Yoruba & world languages': 'Yoruba àti Èdè Àgbáyé',
    '{n} languages, including Yoruba translations for {m} hymns.':
      '{n} èdè, pẹ̀lú ìtumọ̀ Yoruba fún {m} orin.',
    'Favorites & history': 'Fìran àti Ìtàn',
    'Star the hymns you love and pick up right where you left off.':
      'Fi àmì sínú àwọn orin tí o fẹ́, kí o bẹ̀rẹ̀ níbi tí o fi sí.',
    'Jump by number': 'Lọ Ní Nọ́mbà',
    'Press / or just start typing a number to open a hymn instantly.':
      'Te / tàbí bẹ̀rẹ̀ sí tẹ nọ́mbà láti ṣí orin lásìkò.',
    'Night mode & big text': 'Òru àti Ọ̀rọ̀ ńlá',
    'Dark theme and adjustable text for evening service and easy reading.':
      'Aṣọ òkùnkùn àti ọ̀rọ̀ tí o lè yí padà fún ìjọ alẹ̀ àti kíkà rọrùn.',
    'Your library': 'Ìwé Rẹ',
    'Sources & credits': 'Orí àti Ẹ̀kúnya',
    'Hymn collection': 'Ìpàkọ̀ Orin',
    'Keyboard shortcuts': 'Ọ̀nà Kíbúàdù',
    'Open jump-to-number': 'Ṣí ìwọlé nọ́mbà',
    'Start typing a hymn number': 'Bẹ̀rẹ̀ sí tẹ nọ́mbà orin',
    'Previous / next hymn': 'Orin àtijọ́ / tókàn',
    'Scroll verses': 'Yọ àwọn bẹ́kọ̀',
    'Go back': 'Padà sẹ́yìn',
    '🔒 Private by design — no account, no tracking, no internet required. Everything stays on this device.':
      '🔒 Aṣííṣe pàtàkì — kò sí ẹ̀tọ́ wọlé, kò sí ìtọ́ka, kò sí ìlò ìntánẹ́tì. Gbogbo ohun dúbúlẹ̀ nínú ètò yìí.',
    'Made with': 'Ṣe pẹ̀lú',

    /* ---- categories ---- */
    'Grace & Salvation': 'Àánú àti Ìgbàlà',
    'Faith & Trust': 'Ìgbàgbọ́ àti Ìfolàṣe',
    'Praise & Worship': 'Ìyìn àti Ìṣẹ̀wọ̀',
    'Comfort & Peace': 'Ìtẹ́lọ̀rùn àti Àlàáfíà',
    'Love & Devotion': 'Ìfẹ́ àti Ìfọ̀wọ́sí',
    'Christmas & Advent': 'Krismas àti Ìfọ̀kalẹ̀',
    'Morning & Evening': 'Òwúrọ̀ àti Alẹ̀',
    'Trial & Courage': 'Ìdánwò àti Agbára',
    'Worship & Devotion': 'Ìṣẹ̀wọ̀ àti Ìfọ̀wọ́sí',

    /* ---- player ---- */
    'About this hymn': 'Nípa Orin Yìí',
    'by': 'nipa',
    'Categories': 'Àwọn Ẹ̀ka',
    'Learn it from the numbered verses below, sing along to the tune, and save it to your favorites.':
      'Kọ́ orin yìí láti àwọn bẹ́kọ̀ tó kójọ sísìlẹ̀, lọ́wọ́ pọ̀ mọ́ orin náà, kó ó sínú fìran rẹ.',
    'Verse': 'Bẹ́kọ̀',
    'Refrain': 'Orin Ẹgbẹ́',
    'Refrain:': 'Orin ẹgbẹ́:',
    'Up Next': 'Tó Kàn',
    'prev': 'àtijọ́',
    'next hymn': 'orin tókàn',
    'verses': 'bẹ́kọ̀',
    'jump': 'wọlé',
    'back': 'padà',
    'Hymn': 'Orin',
    'Shuffle': 'Fifọ́sọrọ̀',
    'Previous': 'Àtijọ́',
    'Next': 'Tókàn',
    '★ Saved': '★ Tìfipamọ́',
    '♪ Play': '♪ Ṣeré',
    '■ Stop': '■ Dín',
    'Playback speed': 'Ìyára Ìṣeré',
    'Copy these lyrics': 'Kópẹ̀ ọ̀rọ̀ yìí',
    '⎘ Copy': '⎘ Kópẹ̀',
    'Hide Notes': 'Fihàn Àlàyé',
    'Show Notes': 'Fi Àlàyé Hàn',
    '☆ Add to Favorites': '☆ Fi Sínú Fìran',
    '★ Favorite': '★ Fìran',
    '← Back': '← Padà',
    '🌐 Read in': '🌐 Ka Nínú',
    'Read this hymn in another language': 'Ka orin yìí nínú èdè mìíràn',
    '(Original)': '(Ìpílẹ̀)',
    'Tune:': 'Tune:',

    /* ---- per-collection Yoruba switch ---- */
    'Showing Yoruba where translated': 'Ní Yoruba níbi tí a ti tọka',
    'of': 'láti',
    'Switch this hymnal to Yoruba': 'Yí ìwé orin yìí padà sí Yoruba',
    'No Yoruba translation available in this hymnal': 'Kò sí ìtumọ̀ Yoruba nínú ìwé orin yìí',
    'Showing Yoruba': 'Ní Yoruba',
    'Show Yoruba': 'Fi Yoruba Hàn',
    'hymns translated': 'orin tí a ti tọka',

    /* ---- jump to number ---- */
    'all hymns': 'gbogbo orin',
    'none in': 'kò sí nínú',
    'No hymn #': 'Kò sí orin #',
    'in': 'nínú',
    'Type a hymn number': 'Tẹ nọ́mbà orin',

    /* ---- toasts ---- */
    'Lyrics copied to clipboard': 'Ọ̀rọ̀ orin ti kópẹ̀!',
    'Copy failed': 'Kò ṣeé kópẹ̀',
    'Removed from favorites': 'Ti yọ kúrò nínú fìran',
    'Removed from history': 'Ti yọ kúrò nínú ìtàn',
    'Profile photo updated': 'Àwòrán profàìlì tiṣe àtúnṣe',
    'Shuffle on': 'Fifọ́sọrọ̀ ti kún',
    'Shuffle off': 'Fifọ́sọrọ̀ kò kún mọ́',
    'Already at the first hymn': 'Ti wà ní orin àkọ́kọ́ tẹ́lẹ̀',
    'End of the list': 'Ó ti parí',
    'Tempo': 'Ìyára',
    'Added to favorites': 'Ti fi sínú fìran',
    'Reading this hymn in': 'Kà orin yìí nínú',
    'Could not read that image': 'Kò ṣeé ka àwòrán yìí',
    'Unsupported image format': 'Ìmọ̀lẹ̀jà àwòrán kò tì',
    'Welcome': 'Ẹ kú àbọ̀',
    'Photo added — press Enter to save': 'Àwòrán ti fipamọ́ — te Enter láti fi pamọ́',
    'click to edit': 'te láti àtúnṣe',
    'Change profile photo': 'Yí àwòrán profàìlì padà',
    '— Copied from Home of Hymns': '— Ti kópẹ̀ láti Home of Hymns'
  };

  window.UI_YO = UI_YO;

  window.UI_LANG = (function () {
    try {
      // ?lang=yo / ?lang=en forces the interface language (and persists it)
      var m = /[?&]lang=(yo|en)\b/.exec(location.search);
      if (m) { localStorage.setItem('uiLang', m[1]); return m[1]; }
      return localStorage.getItem('uiLang') === 'yo' ? 'yo' : 'en';
    } catch (e) { return 'en'; }
  })();

  // English string in → current interface language out (English fallback).
  window.ui = function (s) {
    return (window.UI_LANG === 'yo' && UI_YO[s] != null) ? UI_YO[s] : s;
  };

  window.setUiLang = function (code) {
    window.UI_LANG = code === 'yo' ? 'yo' : 'en';
    try { localStorage.setItem('uiLang', window.UI_LANG); } catch (e) { /* ignore */ }
  };

  // Translate the static shell: data-t (text), data-t-ph (placeholder), data-t-title (title).
  window.applyStaticUi = function () {
    var nodes = document.querySelectorAll('[data-t]');
    for (var i = 0; i < nodes.length; i++) nodes[i].textContent = window.ui(nodes[i].getAttribute('data-t'));
    var phs = document.querySelectorAll('[data-t-ph]');
    for (var j = 0; j < phs.length; j++) phs[j].placeholder = window.ui(phs[j].getAttribute('data-t-ph'));
    var tts = document.querySelectorAll('[data-t-title]');
    for (var k = 0; k < tts.length; k++) tts[k].title = window.ui(tts[k].getAttribute('data-t-title'));

    var btn = document.getElementById('uiLangBtn');
    if (btn) {
      var spans = btn.querySelectorAll('.uil');
      for (var m = 0; m < spans.length; m++) {
        spans[m].classList.toggle('on', spans[m].getAttribute('data-lang') === window.UI_LANG);
      }
      btn.title = window.UI_LANG === 'yo'
        ? window.ui('Switch to English')
        : window.ui('Switch to Yoruba');
      btn.setAttribute('aria-label', btn.title);
    }
  };

  // Runs at parse time — i18n.js is loaded after the shell, before renderer.js.
  window.applyStaticUi();
})();
