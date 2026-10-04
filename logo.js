// Resolves the official app logo. The supplied asset at assets/images/sing_logo.png
// takes precedence everywhere; emblem.svg is only used while that file is absent.
// The logo is never redrawn or substituted for text.
(function () {
  const OFFICIAL = 'assets/images/sing_logo.png';
  const FALLBACK = 'emblem.svg';

  window.APP_LOGO = { official: OFFICIAL, fallback: FALLBACK, current: null };

  function applyLogo(src) {
    document.querySelectorAll('img[data-logo]').forEach((img) => {
      if (img.getAttribute('src') !== src) img.setAttribute('src', src);
    });
  }

  function finish(src, source) {
    document.documentElement.setAttribute('data-logo-source', source);
    window.APP_LOGO.current = src;
    applyLogo(src);
    // views rendered later (Home / More / About) listen for this and re-render
    try {
      document.dispatchEvent(new CustomEvent('logoresolved', { detail: { src: src, source: source } }));
    } catch (e) { /* ignore */ }
  }

  function useOfficial() {
    const probe = new Image();
    probe.onload = () => {
      if (!probe.naturalWidth) return useFallback();
      finish(OFFICIAL, 'official');
    };
    probe.onerror = useFallback;
    probe.src = OFFICIAL;
  }

  function useFallback() {
    finish(FALLBACK, 'fallback');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', useOfficial);
  } else {
    useOfficial();
  }
})();
