/* BudgetSaathi — language toggle, currency switcher, i18n application. */
'use strict';
(function () {
  var CURS = [
    { id: 'usd', code: 'USD', label: 'USD' },
    { id: 'eur', code: 'EUR', label: 'EUR' },
    { id: 'gbp', code: 'GBP', label: 'GBP' },
    { id: 'cad', code: 'CAD', label: 'CAD' },
    { id: 'aud', code: 'AUD', label: 'AUD' },
    { id: 'aed', code: 'AED', label: 'AED' },
    { id: 'sar', code: 'SAR', label: 'SAR' },
    { id: 'inr', code: 'INR', label: 'INR' },
    { id: 'pkr', code: 'PKR', label: 'PKR' },
    { id: 'qar', code: 'QAR', label: 'QAR' }
  ];

  function get(o, path) {
    return String(path).split('.').reduce(function (a, k) {
      return (a && a[k] !== undefined) ? a[k] : undefined;
    }, o);
  }
  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  var lang = 'en', cur = 'usd';
  var customCur = { code: '', symbol: '' };
  (function init() {
    var l = read('bs-lang'); if (l === 'ur' || l === 'en') lang = l;
    var c = read('bs-cur'); if (c) cur = c;
    try {
      var cc = JSON.parse(read('bs-custom-cur') || 'null');
      if (cc && cc.code) customCur = cc;
    } catch (e) {}
  })();

  function curCode() {
    if (cur === 'custom') return (customCur.code || '').toUpperCase();
    for (var i = 0; i < CURS.length; i++) if (CURS[i].id === cur) return CURS[i].code;
    return 'USD';
  }

  function fmt(n) {
    n = Math.round(Number(n) || 0);
    if (cur === 'custom') {
      var code = curCode(), sym = customCur.symbol || '';
      if (/^[A-Z]{3}$/.test(code)) {
        try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: code, maximumFractionDigits: 0 }).format(n); } catch (e) {}
      }
      var g = Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return (n < 0 ? '-' : '') + (sym ? sym + ' ' : '') + g;
    }
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: curCode(), maximumFractionDigits: 0 }).format(n);
    } catch (e) {
      var g2 = Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return (n < 0 ? '-' : '') + curCode() + ' ' + g2;
    }
  }

  function t(path) {
    var v = get(STR[lang] || {}, path);
    if (v === undefined) v = get(STR.en || {}, path);
    return v;
  }

  function buildCurrencySelect(sel) {
    sel.innerHTML = '';
    CURS.forEach(function (c) {
      var o = document.createElement('option');
      o.value = c.id; o.textContent = c.label;
      sel.appendChild(o);
    });
    var oc = document.createElement('option');
    oc.value = 'custom'; oc.textContent = t('cur.custom');
    sel.appendChild(oc);
    sel.value = cur;
  }

  function applyStrings() {
    document.documentElement.lang = (lang === 'ur') ? 'ur' : 'en';
    document.documentElement.dir = STR[lang].dir;
    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      var v = t(els[i].getAttribute('data-i18n'));
      if (typeof v === 'string') els[i].innerHTML = v;
    }
    var phs = document.querySelectorAll('[data-i18n-ph]');
    for (var j = 0; j < phs.length; j++) {
      var pv2 = t(phs[j].getAttribute('data-i18n-ph'));
      if (typeof pv2 === 'string') phs[j].setAttribute('placeholder', pv2);
    }
    var page = document.body.getAttribute('data-page');
    if (page) {
      var mt = t('meta.' + page + '.title'), md = t('meta.' + page + '.desc');
      if (mt) document.title = mt;
      var mtag = document.querySelector('meta[name="description"]');
      if (mtag && md) mtag.setAttribute('content', md);
    }
    var lt = document.getElementById('langToggle');
    if (lt) lt.textContent = t('langToggle');
    var cs = document.getElementById('currency');
    if (cs) {
      buildCurrencySelect(cs);
      var box = document.getElementById('customCurBox');
      if (box) {
        if (cur === 'custom') {
          box.classList.add('show');
          var ci = document.getElementById('curCodeInput');
          var si = document.getElementById('curSymbolInput');
          if (ci && !ci.value) ci.value = customCur.code || '';
          if (si && !si.value) si.value = customCur.symbol || '';
        } else box.classList.remove('show');
      }
    }
    var post = document.body.getAttribute('data-post');
    if (post) {
      var body = document.getElementById('postBody');
      if (body) { var pv = t('posts.' + post); if (typeof pv === 'string') body.innerHTML = pv; }
    }
    var wa = document.getElementById('waShare');
    if (wa) {
      var href = (typeof location !== 'undefined') ? location.href : '';
      wa.href = 'https://wa.me/?text=' + encodeURIComponent(document.title + ' ' + href);
    }
    if (typeof window.BS_onLang === 'function') { try { window.BS_onLang(); } catch (e) {} }
    if (typeof CustomEvent !== 'undefined') {
      try { document.dispatchEvent(new CustomEvent('bs:lang', { detail: { lang: lang, cur: cur } })); } catch (e) {}
    }
  }

  function setLang(l) {
    lang = (l === 'ur') ? 'ur' : 'en';
    store('bs-lang', lang);
    applyStrings();
  }
  function setCur(c) {
    cur = c; store('bs-cur', cur); applyStrings();
  }

  window.BS = {
    t: t, fmt: fmt, curCode: curCode,
    get lang() { return lang; }, get cur() { return cur; },
    get customCur() { return customCur; },
    setLang: setLang, setCur: setCur,
    saveCustom: function (code, symbol) {
      customCur = { code: String(code || '').trim().toUpperCase(), symbol: String(symbol || '').trim() };
      store('bs-custom-cur', JSON.stringify(customCur));
      setCur('custom');
    }
  };

  function wire() {
    var lt = document.getElementById('langToggle');
    if (lt) lt.addEventListener('click', function () { setLang(lang === 'en' ? 'ur' : 'en'); });
    var cs = document.getElementById('currency');
    if (cs) cs.addEventListener('change', function () { setCur(cs.value); });
    var sv = document.getElementById('curSaveBtn');
    if (sv) sv.addEventListener('click', function () {
      var ci = document.getElementById('curCodeInput'), si = document.getElementById('curSymbolInput');
      var code = ci ? ci.value : '', sym = si ? si.value : '';
      if (!/^[A-Za-z]{3}$/.test(String(code).trim()) || !String(sym).trim()) {
        var w = document.getElementById('curWarn');
        if (w) { w.textContent = t('cur.invalid'); w.style.display = 'block'; }
        return;
      }
      var w2 = document.getElementById('curWarn'); if (w2) w2.style.display = 'none';
      window.BS.saveCustom(code, sym);
    });
    var nav = document.querySelectorAll('.nav a');
    var page = document.body.getAttribute('data-page');
    for (var i = 0; i < nav.length; i++) {
      if (nav[i].getAttribute('data-nav') === page) nav[i].classList.add('active');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { wire(); applyStrings(); });
  } else { wire(); applyStrings(); }
})();
