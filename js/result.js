/* ============================================================
   result.js — 점수 합산 → 결과 계산 → 결과 리포트 렌더 (3단계)
   - Q1~Q4: config 점수표 합산 → 메인 스타일(+근소한 2위는 서브) 판정 (PRD 8-2)
   - Q5~Q7: 예산대(BUDGET) · 업체군/공정(VENDORS) 산출 (PRD 7-3·7-4)
   - 결과 리포트: 스타일·예산·업체군·숨은비용·"왜 이 결과"·CTA (PRD 8-3)
   결과 문구 본문은 config(STYLES.body / RESULT_COPY)에서 가져온다.
   입력은 quiz.js의 window.getDiagnosisInput() → { Q1..Q7: optionObj|null }.
   ============================================================ */
(function () {
  "use strict";

  var CONFIG = window.CONFIG;
  if (!CONFIG) { console.error("CONFIG 없음 — config.js 로드 확인"); return; }

  var STYLE_CODES = Object.keys(CONFIG.STYLES); // ["MOD","MIN",...]

  /* ---------- 1) 스타일 점수 합산 + 판정 ---------- */
  function computeStyle(input) {
    var scores = {};
    STYLE_CODES.forEach(function (c) { scores[c] = 0; });

    // kind === "style" 인 질문(Q1~Q4)의 선택지 점수를 합산
    CONFIG.QUESTIONS.forEach(function (q) {
      if (q.kind !== "style") return;
      var opt = input[q.id];
      if (opt && opt.scores) {
        STYLE_CODES.forEach(function (c) { scores[c] += (opt.scores[c] || 0); });
      }
    });

    // 동점 시 Q1(거실 사진) 가중치 우선 (PRD 8-2)
    var q1 = input[CONFIG.JUDGE.tiebreakQuestionId];
    var q1Scores = (q1 && q1.scores) ? q1.scores : {};
    var ranked = STYLE_CODES.slice().sort(function (a, b) {
      if (scores[b] !== scores[a]) return scores[b] - scores[a];
      return (q1Scores[b] || 0) - (q1Scores[a] || 0);
    });

    var mainCode = ranked[0];
    var secondCode = ranked[1];
    var sub = null;
    if (
      secondCode &&
      scores[secondCode] > 0 &&
      (scores[mainCode] - scores[secondCode]) <= CONFIG.JUDGE.subStyleThreshold
    ) {
      sub = CONFIG.STYLES[secondCode];
    }

    return { main: CONFIG.STYLES[mainCode], sub: sub, scores: scores };
  }

  /* ---------- 2) 예산대 산출 ---------- */
  function computeBudget(input) {
    var q5 = input.Q5, q6 = input.Q6;
    var size = q5 && q5.size;        // "20" | "30" | "40" | "50"
    var tier = q6 && q6.budgetTier;  // "partial" | "standard" | "premium"
    var range = (size && tier && CONFIG.BUDGET[size]) ? CONFIG.BUDGET[size][tier] : null;
    return { size: size, tier: tier, range: range, note: CONFIG.BUDGET_NOTE };
  }

  /* ---------- 3) 업체군/공정 매핑 ---------- */
  function computeVendor(mainCode, tier, input) {
    var matched = null;
    var rules = CONFIG.VENDORS.rules || [];
    for (var i = 0; i < rules.length; i++) {
      var m = rules[i].match || {};
      var styleOk = !m.styles || m.styles.length === 0 || m.styles.indexOf(mainCode) !== -1;
      var tierOk = !m.budgetTiers || m.budgetTiers.length === 0 || (tier && m.budgetTiers.indexOf(tier) !== -1);
      if (styleOk && tierOk) { matched = rules[i]; break; }
    }
    if (!matched) matched = CONFIG.VENDORS.default;

    var q7 = input.Q7;
    var priorityNote = (q7 && q7.priority) ? CONFIG.PRIORITY_NOTES[q7.priority] : "";
    return { group: matched.group, process: matched.process, priorityNote: priorityNote };
  }

  /* ---------- "왜 이 결과인가" 문구 생성 ---------- */
  function buildWhy(input, mainStyle) {
    var picks = [];
    CONFIG.QUESTIONS.forEach(function (q) {
      if (q.kind === "style" && input[q.id]) picks.push("‘" + input[q.id].label + "’");
    });
    var copy = CONFIG.RESULT_COPY.whyTemplate;
    return copy
      .replace("{picks}", picks.join(", "))
      .replace("{style}", mainStyle.name);
  }

  /* ---------- 전체 계산 ---------- */
  function compute(input) {
    var style = computeStyle(input);
    var budget = computeBudget(input);
    var vendor = computeVendor(style.main.code, budget.tier, input);
    return { style: style, budget: budget, vendor: vendor, input: input };
  }

  /* ---------- 렌더 헬퍼 ---------- */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function renderHiddenCosts() {
    var items = CONFIG.HIDDEN_COSTS.map(function (h) {
      var note = h.note ? ' <span class="hidden-cost__note">(' + esc(h.note) + ")</span>" : "";
      return (
        '<li class="hidden-cost">' +
          '<span class="hidden-cost__label">' + esc(h.label) + "</span>" +
          '<span class="hidden-cost__amount">' + esc(h.amount) + note + "</span>" +
        "</li>"
      );
    }).join("");
    return '<ul class="hidden-cost-list">' + items + "</ul>";
  }

  /* ---------- 결과 리포트 렌더 ---------- */
  function render(input) {
    var root = document.getElementById("result-root");
    if (!root) return;

    var r = compute(input);
    window.JipdaumResult = r; // 4단계 폼 hidden 필드용

    var C = CONFIG.RESULT_COPY;
    var main = r.style.main;
    var sub = r.style.sub;
    var html = "";

    /* (1) 스타일 카드 */
    var bodyText = main.body && main.body.trim() ? main.body : C.bodyPlaceholder;
    html +=
      '<div class="result-card">' +
        '<p class="eyebrow">' + esc(C.eyebrow) + "</p>" +
        '<h2 class="result-style-name">' + esc(main.name) + "</h2>" +
        '<p class="result-tagline subhead">' + esc(main.tagline) + "</p>" +
        '<p class="result-body">' + esc(bodyText) + "</p>";
    if (sub) {
      html +=
        '<div class="info-tile">' +
          "<strong>" + esc(C.subStyleHeading) + "</strong> · " + esc(sub.name) +
          '<br /><span class="result-note">' + esc(C.subStyleNote) + "</span>" +
        "</div>";
    }
    html += "</div>";

    /* (2) 예산대 카드 */
    html +=
      '<div class="result-card">' +
        '<p class="eyebrow">' + esc(C.budgetHeading) + "</p>" +
        '<div class="info-tile result-budget">' +
          (r.budget.range ? esc(r.budget.range) : "예산 정보를 산출할 수 없어요") +
        "</div>" +
        '<p class="result-note">' + esc(r.budget.note) + "</p>" +
      "</div>";

    /* (3) 업체군·공정 카드 */
    html +=
      '<div class="result-card">' +
        '<p class="eyebrow">' + esc(C.vendorHeading) + "</p>" +
        '<h3 class="result-card__title">' + esc(r.vendor.group) + "</h3>" +
        "<p>" + esc(r.vendor.process) + "</p>" +
        (r.vendor.priorityNote
          ? '<div class="info-tile">' + esc(r.vendor.priorityNote) + "</div>"
          : "") +
      "</div>";

    /* (4) 숨은 비용 카드 (투명 가치) */
    html +=
      '<div class="result-card result-card--caution">' +
        '<p class="eyebrow">' + esc(C.hiddenHeading) + "</p>" +
        "<p>" + esc(C.hiddenIntro) + "</p>" +
        renderHiddenCosts() +
      "</div>";

    /* (5) 왜 이 결과인가 */
    html +=
      '<div class="result-card">' +
        '<p class="eyebrow">' + esc(C.whyHeading) + "</p>" +
        "<p>" + esc(buildWhy(input, main)) + "</p>" +
      "</div>";

    root.innerHTML = html;
  }

  /* 전역 노출 (quiz.js finish()가 window.Result.render 호출) */
  window.Result = { compute: compute, render: render };
})();
