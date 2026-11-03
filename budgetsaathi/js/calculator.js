/* BudgetSaathi — monthly budget calculator. Pure compute + DOM wiring. */
'use strict';

function computeBudget(inp) {
  function n(v) { v = Number(v); return isFinite(v) && v > 0 ? v : 0; }
  var income = n(inp.income);
  var rent = n(inp.rent), groceries = n(inp.groceries), utilities = n(inp.utilities),
      transport = n(inp.transport), healthEdu = n(inp.healthEdu), other = n(inp.other);
  var totalExp = rent + groceries + utilities + transport + healthEdu + other;
  var savings = income - totalExp;
  var rate = income > 0 ? (savings / income) * 100 : 0;
  var needs = rent + groceries + utilities + transport;
  var wants = healthEdu + other;
  var needsPct = income > 0 ? (needs / income) * 100 : 0;
  var wantsPct = income > 0 ? (wants / income) * 100 : 0;
  var savPct = rate;
  var tips;
  if (income <= 0) tips = ['tipEmergency'];
  else if (savings < 0) tips = ['tipOverspend', 'tipEmergency'];
  else if (rate < 10) tips = ['tipLow', 'tipEmergency'];
  else if (rate < 20) tips = ['tipClose', 'tipEmergency'];
  else tips = ['tipGood', 'tipEmergency'];
  return {
    income: income, totalExp: totalExp, savings: savings, rate: rate,
    needs: needs, wants: wants,
    needsPct: needsPct, wantsPct: wantsPct, savPct: savPct,
    tips: tips
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { computeBudget: computeBudget };
}

if (typeof document !== 'undefined') {
  (function () {
    var FIELDS = ['income', 'rent', 'groceries', 'utilities', 'transport', 'healthEdu', 'other'];
    function readInputs() {
      var o = {};
      FIELDS.forEach(function (f) {
        var el = document.getElementById('in-' + f);
        o[f] = el ? el.value : 0;
      });
      return o;
    }
    function pct(x) {
      var v = Math.max(0, Math.min(100, x));
      return (Math.round(x * 10) / 10).toString() + '%';
    }
    window.BS_renderCalc = function () {
      if (!window.BS) return;
      var r = computeBudget(readInputs());
      function set(id, v) { var el = document.getElementById(id); if (el) el.textContent = v; }
      set('out-total', window.BS.fmt(r.totalExp));
      set('out-savings', window.BS.fmt(r.savings));
      set('out-rate', pct(r.rate));
      var rows = [
        { bar: 'bar-needs', fill: 'fill-needs', pct: 'pct-needs', v: r.needsPct, ideal: 50 },
        { bar: 'bar-wants', fill: 'fill-wants', pct: 'pct-wants', v: r.wantsPct, ideal: 30 },
        { bar: 'bar-sav', fill: 'fill-sav', pct: 'pct-sav', v: r.savPct, ideal: 20 }
      ];
      rows.forEach(function (row) {
        var f = document.getElementById(row.fill), m = document.getElementById(row.bar), p = document.getElementById(row.pct);
        if (f) f.style.width = Math.max(0, Math.min(100, row.v)) + '%';
        if (m) m.style.insetInlineStart = row.ideal + '%';
        if (p) p.textContent = window.BS.t('calc.actual') + ': ' + pct(row.v) + ' · ' + window.BS.t('calc.ideal') + ': ' + row.ideal + '%';
      });
      var tips = document.getElementById('tipsList');
      if (tips) {
        tips.innerHTML = '';
        r.tips.forEach(function (k) {
          var li = document.createElement('li');
          li.textContent = window.BS.t('calc.' + k);
          tips.appendChild(li);
        });
      }
    };
    function wire() {
      FIELDS.forEach(function (f) {
        var el = document.getElementById('in-' + f);
        if (el) el.addEventListener('input', window.BS_renderCalc);
      });
      window.BS_renderCalc();
    }
    window.BS_onLang = window.BS_renderCalc;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', wire);
    } else { wire(); }
  })();
}
