/* ============================================================
   admin-panel.js — 디자인 실시간 조정 패널 (관리자 전용)
   주소 뒤 ?admin 일 때만 활성화. 일반 방문자에겐 DOM 자체가 생기지 않는다.

   1단계: 색 (배경·텍스트·강조·포인트·색면)
   2단계: 폰트 종류(Pretendard·나눔고딕·본고딕) + 종류별 글자 크기
   3단계: 종류별 자간(letter-spacing)·행간(line-height) + 정렬(왼쪽·가운데·오른쪽)
   4단계: 조정값 localStorage 저장(새로고침 유지) + '코드 기본값으로 내보내기'

   ※ 디자인 토큰(:root의 --color-* / --font-* / --fs-* / --ls-* / --lh-* / --align-*)만
     런타임 덮어쓴다. 저장된 값은 ?admin일 때만 다시 적용(공개 화면은 항상 기본값).
   ============================================================ */
(function () {
  "use strict";

  var params = new URLSearchParams(window.location.search);
  if (!params.has("admin")) return;

  var root = document.documentElement;
  var STORAGE_KEY = "jipdaum_admin_design_v1";

  /* ---------- 조정 대상 정의 ---------- */
  var COLOR_FIELDS = [
    { id: "canvas",       label: "배경",        desc: "펄 (Pearl)",           vars: ["--color-canvas"] },
    { id: "accentStrong", label: "강조",        desc: "점토 (Clay) · CTA",    vars: ["--color-accent-strong"] },
    { id: "accent",       label: "포인트",      desc: "토프 (Taupe) · 선택",  vars: ["--color-accent"] },
    { id: "ink",          label: "텍스트",      desc: "차콜 (Ink/Primary)",   vars: ["--color-ink", "--color-primary"] },
    { id: "blockKhaki",   label: "색면 · 카키", desc: "히어로 색면",           vars: ["--color-block-khaki"] },
    { id: "blockClay",    label: "색면 · 점토", desc: "점토 색면",             vars: ["--color-block-clay"] },
    { id: "blockTaupe",   label: "색면 · 토프", desc: "토프 색면",             vars: ["--color-block-taupe"] },
    { id: "blockLeather", label: "색면 · 차콜", desc: "차콜 색면 (푸터 위)",   vars: ["--color-block-leather"] },
  ];

  var SYS_FALLBACK = '-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif';
  var FONT_FAMILIES = [
    { id: "pretendard", label: "Pretendard", stack: '"Pretendard", ' + SYS_FALLBACK },
    { id: "nanum",      label: "나눔고딕",    stack: '"Nanum Gothic", ' + SYS_FALLBACK },
    { id: "noto",       label: "본고딕",      stack: '"Noto Sans KR", ' + SYS_FALLBACK },
  ];
  var WEBFONT_LINKS = [
    "https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&display=swap",
    "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=swap",
  ];

  // 종류별 타입. key = 토큰 접미사. align=true 만 정렬 제어.
  var TYPES = [
    { key: "display-xl", label: "헤드라인",  align: true },
    { key: "display-lg", label: "섹션 제목", align: true },
    { key: "headline",   label: "소제목",    align: true },
    { key: "subhead",    label: "서브카피",  align: true },
    { key: "card-title", label: "카드·결과", align: false },
    { key: "body",       label: "본문",      align: true },
    { key: "button",     label: "버튼",      align: false },
  ];
  var ALIGN_OPTS = [
    { v: "left", label: "왼쪽" }, { v: "center", label: "가운데" }, { v: "right", label: "오른쪽" },
  ];

  /* ---------- 유틸 ---------- */
  function getVar(name) { return getComputedStyle(root).getPropertyValue(name).trim(); }
  function inlineVar(name) { return root.style.getPropertyValue(name).trim(); }
  function toHex(v) {
    if (!v) return "#000000";
    if (v[0] === "#") {
      if (v.length === 4) return "#" + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
      return v.slice(0, 7).toLowerCase();
    }
    var m = v.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (m) return "#" + [m[1], m[2], m[3]].map(function (n) {
      return ("0" + parseInt(n, 10).toString(16)).slice(-2);
    }).join("");
    return "#000000";
  }
  function num(v) { return parseFloat(v) || 0; }

  /* ---------- 기본값 캡처 (덮어쓰기 적용 전에!) ---------- */
  var DEF = { colors: {}, fontSans: getVar("--font-sans"), fontDisplay: getVar("--font-display"), fs: {}, ls: {}, lh: {} };
  COLOR_FIELDS.forEach(function (f) { DEF.colors[f.id] = toHex(getVar(f.vars[0])); });
  TYPES.forEach(function (t) {
    DEF.fs[t.key] = Math.round(num(getVar("--fs-" + t.key)));
    DEF.ls[t.key] = Math.round(num(getVar("--ls-" + t.key)) * 10) / 10;
    DEF.lh[t.key] = Math.round(num(getVar("--lh-" + t.key)) * 100) / 100;
  });

  /* ---------- 상태 + 저장 ---------- */
  var state = { colors: {}, font: null, fs: {}, ls: {}, lh: {}, align: {} };
  function loadState() {
    try { var s = window.localStorage.getItem(STORAGE_KEY); if (s) state = JSON.parse(s); } catch (e) {}
    if (!state.colors) state.colors = {}; if (!state.fs) state.fs = {};
    if (!state.ls) state.ls = {}; if (!state.lh) state.lh = {}; if (!state.align) state.align = {};
  }
  function saveState() {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  /* ---------- 적용 함수 ---------- */
  function applyColor(id, hex, save) {
    var f; for (var i = 0; i < COLOR_FIELDS.length; i++) if (COLOR_FIELDS[i].id === id) f = COLOR_FIELDS[i];
    if (!f) return;
    f.vars.forEach(function (v) { root.style.setProperty(v, hex); });
    state.colors[id] = hex;
    var el = panel && panel.querySelector('[data-hex="' + id + '"]'); if (el) el.textContent = hex;
    if (save) saveState();
  }
  function applyFont(famId, save) {
    var fam; for (var i = 0; i < FONT_FAMILIES.length; i++) if (FONT_FAMILIES[i].id === famId) fam = FONT_FAMILIES[i];
    if (!fam) return;
    root.style.setProperty("--font-sans", fam.stack);
    root.style.setProperty("--font-display", fam.stack);
    state.font = famId;
    if (save) saveState();
  }
  function applyFs(key, px, save) {
    root.style.setProperty("--fs-" + key, px + "px");
    state.fs[key] = +px;
    var el = panel && panel.querySelector('[data-val="fs-' + key + '"]'); if (el) el.textContent = px + "px";
    if (save) saveState();
  }
  function applyLs(key, val, save) {
    root.style.setProperty("--ls-" + key, val + "px");
    state.ls[key] = +val;
    var el = panel && panel.querySelector('[data-val="ls-' + key + '"]'); if (el) el.textContent = (+val).toFixed(1) + "px";
    if (save) saveState();
  }
  function applyLh(key, val, save) {
    root.style.setProperty("--lh-" + key, val);
    state.lh[key] = +val;
    var el = panel && panel.querySelector('[data-val="lh-' + key + '"]'); if (el) el.textContent = (+val).toFixed(2);
    if (save) saveState();
  }
  function applyAlign(key, val, save) {
    if (val) root.style.setProperty("--align-" + key, val);
    else root.style.removeProperty("--align-" + key);
    state.align[key] = val;
    if (save) saveState();
  }

  /* ---------- 저장값 다시 적용 (UI 만들기 전) ---------- */
  loadState();
  Object.keys(state.colors).forEach(function (id) { applyColor(id, state.colors[id], false); });
  if (state.font) applyFont(state.font, false);
  Object.keys(state.fs).forEach(function (k) { applyFs(k, state.fs[k], false); });
  Object.keys(state.ls).forEach(function (k) { applyLs(k, state.ls[k], false); });
  Object.keys(state.lh).forEach(function (k) { applyLh(k, state.lh[k], false); });
  Object.keys(state.align).forEach(function (k) { if (state.align[k]) applyAlign(k, state.align[k], false); });

  /* ---------- 대체 웹폰트 로드 ---------- */
  WEBFONT_LINKS.forEach(function (href) {
    var l = document.createElement("link"); l.rel = "stylesheet"; l.href = href; document.head.appendChild(l);
  });

  /* ---------- 스타일 주입 ---------- */
  var style = document.createElement("style");
  style.id = "admin-panel-style";
  style.textContent = [
    ".admin-toggle{position:fixed;right:16px;bottom:16px;z-index:9999;font-family:var(--font-sans);",
    "  font-size:var(--fs-button);font-weight:var(--fw-button);background:var(--color-primary);color:var(--color-on-primary);",
    "  border:none;cursor:pointer;padding:10px 18px;min-height:44px;border-radius:var(--radius-pill);box-shadow:var(--elevation-soft);}",
    ".admin-panel{position:fixed;right:16px;bottom:72px;z-index:9999;width:330px;max-width:calc(100vw - 32px);",
    "  max-height:80vh;overflow:auto;display:none;background:var(--color-surface-soft);color:var(--color-ink);",
    "  font-family:var(--font-sans);border:1px solid var(--color-hairline);border-radius:var(--radius-lg);",
    "  padding:var(--space-lg);box-shadow:var(--elevation-modal);}",
    ".admin-panel.is-open{display:block;}",
    ".admin-panel__head{display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-md);}",
    ".admin-panel__title{font-size:var(--fs-card-title);font-weight:var(--fw-card-title);}",
    ".admin-panel__close{background:none;border:none;font-size:20px;line-height:1;cursor:pointer;color:var(--color-ink);}",
    ".admin-section-label{font-size:var(--fs-eyebrow);font-weight:var(--fw-eyebrow);letter-spacing:var(--ls-eyebrow);",
    "  text-transform:uppercase;opacity:.7;margin:var(--space-md) 0 var(--space-sm);}",
    ".admin-section-label:first-of-type{margin-top:0;}",
    ".admin-field{display:flex;align-items:center;gap:var(--space-sm);padding-block:var(--space-xs);border-top:1px solid var(--color-hairline-soft);}",
    ".admin-field.is-first{border-top:none;}",
    ".admin-field input[type=color]{width:40px;height:32px;flex:0 0 auto;padding:0;border:1px solid var(--color-hairline);border-radius:var(--radius-sm);background:none;cursor:pointer;}",
    ".admin-field__text{flex:1 1 auto;min-width:0;}",
    ".admin-field__label{font-size:var(--fs-body-sm);font-weight:600;}",
    ".admin-field__desc{font-size:var(--fs-caption);opacity:.7;}",
    ".admin-field__hex{font-size:var(--fs-caption);font-variant-numeric:tabular-nums;opacity:.8;}",
    ".admin-select{width:100%;font-family:var(--font-sans);font-size:var(--fs-body-sm);padding:10px 12px;",
    "  border:1px solid var(--color-hairline);border-radius:var(--radius-md);background:var(--color-canvas);color:var(--color-ink);cursor:pointer;}",
    ".admin-slider{padding-block:6px;border-top:1px solid var(--color-hairline-soft);}",
    ".admin-slider.is-first{border-top:none;}",
    ".admin-slider__top{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px;}",
    ".admin-slider__top span:first-child{font-size:var(--fs-body-sm);font-weight:600;}",
    ".admin-slider__val{font-size:var(--fs-caption);font-variant-numeric:tabular-nums;opacity:.8;}",
    ".admin-slider input[type=range]{width:100%;accent-color:var(--color-accent-strong);cursor:pointer;}",
    ".admin-align{display:flex;align-items:center;justify-content:space-between;gap:var(--space-sm);padding-block:6px;border-top:1px solid var(--color-hairline-soft);}",
    ".admin-align.is-first{border-top:none;}",
    ".admin-align__label{font-size:var(--fs-body-sm);font-weight:600;}",
    ".admin-align__btns{display:inline-flex;border:1px solid var(--color-hairline);border-radius:var(--radius-sm);overflow:hidden;}",
    ".admin-align__btns button{border:none;background:var(--color-canvas);color:var(--color-ink);font-family:var(--font-sans);",
    "  font-size:var(--fs-caption);padding:6px 10px;cursor:pointer;}",
    ".admin-align__btns button.is-on{background:var(--color-accent);color:var(--color-on-primary);}",
    ".admin-export{width:100%;height:140px;margin-top:var(--space-sm);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;",
    "  font-size:11px;line-height:1.45;border:1px solid var(--color-hairline);border-radius:var(--radius-md);",
    "  padding:10px;background:var(--color-canvas);color:var(--color-ink);white-space:pre;display:none;}",
    ".admin-export.is-shown{display:block;}",
    ".admin-btn{background:var(--color-canvas);color:var(--color-ink);border:1px solid var(--color-hairline);",
    "  border-radius:var(--radius-pill);padding:8px 14px;font-size:var(--fs-body-sm);cursor:pointer;}",
    ".admin-panel__foot{margin-top:var(--space-md);display:flex;gap:var(--space-sm);justify-content:flex-end;flex-wrap:wrap;}",
  ].join("\n");
  document.head.appendChild(style);

  /* ---------- UI 빌드 ---------- */
  var toggle = document.createElement("button");
  toggle.type = "button"; toggle.className = "admin-toggle"; toggle.textContent = "디자인 설정";

  var panel = document.createElement("div");
  panel.className = "admin-panel"; panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "디자인 설정");

  function val(group, key, def) {
    var s = state[group] && state[group][key];
    return (s === undefined || s === null) ? def : s;
  }

  var h = '<div class="admin-panel__head"><span class="admin-panel__title">디자인 설정</span>' +
    '<button type="button" class="admin-panel__close" aria-label="닫기">×</button></div>';

  // 색
  h += '<p class="admin-section-label">색</p>';
  COLOR_FIELDS.forEach(function (f, i) {
    var v = val("colors", f.id, DEF.colors[f.id]);
    h += '<div class="admin-field' + (i === 0 ? " is-first" : "") + '">' +
      '<input type="color" data-color="' + f.id + '" value="' + v + '" aria-label="' + f.label + '" />' +
      '<span class="admin-field__text"><span class="admin-field__label">' + f.label + "</span><br />" +
      '<span class="admin-field__desc">' + f.desc + "</span></span>" +
      '<span class="admin-field__hex" data-hex="' + f.id + '">' + v + "</span></div>";
  });

  // 폰트 종류
  h += '<p class="admin-section-label">폰트 종류</p><select class="admin-select" data-font>';
  FONT_FAMILIES.forEach(function (f) {
    h += '<option value="' + f.id + '"' + (val("font", null, "pretendard") === f.id || state.font === f.id ? " selected" : "") + ">" + f.label + "</option>";
  });
  h += "</select>";

  // 슬라이더 섹션 헬퍼
  function sliderSection(title, group, opts) {
    var s = '<p class="admin-section-label">' + title + "</p>";
    TYPES.forEach(function (t, i) {
      var def = DEF[group][t.key];
      var v = val(group, t.key, def);
      var min, max, step, disp;
      if (group === "fs") { min = Math.max(8, Math.round(def * 0.6)); max = Math.round(def * 1.6); step = 1; disp = v + "px"; }
      else if (group === "ls") { min = (def - 2).toFixed(1); max = (def + 3).toFixed(1); step = 0.1; disp = (+v).toFixed(1) + "px"; }
      else { min = 0.9; max = 2.2; step = 0.05; disp = (+v).toFixed(2); } // lh
      s += '<div class="admin-slider' + (i === 0 ? " is-first" : "") + '"><div class="admin-slider__top">' +
        "<span>" + t.label + "</span><span class=\"admin-slider__val\" data-val=\"" + group + "-" + t.key + "\">" + disp + "</span></div>" +
        '<input type="range" data-group="' + group + '" data-key="' + t.key + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + v + '" /></div>';
    });
    return s;
  }
  h += sliderSection("글자 크기", "fs");
  h += sliderSection("자간", "ls");
  h += sliderSection("행간", "lh");

  // 정렬
  h += '<p class="admin-section-label">정렬</p>';
  var alignTypes = TYPES.filter(function (t) { return t.align; });
  alignTypes.forEach(function (t, i) {
    var cur = val("align", t.key, "");
    var btns = ALIGN_OPTS.map(function (o) {
      return '<button type="button" data-align="' + t.key + '" data-av="' + o.v + '"' +
        (cur === o.v ? ' class="is-on"' : "") + ">" + o.label + "</button>";
    }).join("");
    h += '<div class="admin-align' + (i === 0 ? " is-first" : "") + '">' +
      '<span class="admin-align__label">' + t.label + "</span>" +
      '<span class="admin-align__btns">' + btns + "</span></div>";
  });

  // 내보내기 + 버튼
  h += '<p class="admin-section-label">내보내기</p>' +
    '<button type="button" class="admin-btn" data-export>현재 설정을 코드로 보기</button>' +
    '<textarea class="admin-export" data-export-out readonly></textarea>';
  h += '<div class="admin-panel__foot"><button type="button" class="admin-btn" data-reset>기본값으로</button></div>';

  panel.innerHTML = h;
  document.body.appendChild(toggle);
  document.body.appendChild(panel);

  /* 저장값이 있으면 폰트 select 동기화 */
  if (state.font) { var fsel = panel.querySelector("select[data-font]"); if (fsel) fsel.value = state.font; }

  /* ---------- 이벤트 ---------- */
  toggle.addEventListener("click", function () { panel.classList.toggle("is-open"); });
  panel.querySelector(".admin-panel__close").addEventListener("click", function () { panel.classList.remove("is-open"); });

  panel.addEventListener("input", function (e) {
    var el = e.target;
    if (el.matches('input[type="color"][data-color]')) applyColor(el.getAttribute("data-color"), el.value, true);
    else if (el.matches('input[type="range"][data-group]')) {
      var g = el.getAttribute("data-group"), k = el.getAttribute("data-key");
      if (g === "fs") applyFs(k, el.value, true);
      else if (g === "ls") applyLs(k, el.value, true);
      else if (g === "lh") applyLh(k, el.value, true);
    }
  });
  panel.addEventListener("change", function (e) {
    if (e.target.matches("select[data-font]")) applyFont(e.target.value, true);
  });
  panel.addEventListener("click", function (e) {
    var b = e.target;
    if (b.matches("button[data-align]")) {
      var key = b.getAttribute("data-align"), av = b.getAttribute("data-av");
      applyAlign(key, av, true);
      // 같은 그룹 버튼 토글 표시
      var group = b.parentNode.querySelectorAll("button[data-align]");
      for (var i = 0; i < group.length; i++) group[i].classList.toggle("is-on", group[i] === b);
    } else if (b.matches("[data-export]")) {
      var out = panel.querySelector("[data-export-out]");
      out.value = buildExport();
      out.classList.add("is-shown");
      out.focus(); out.select();
    } else if (b.matches("[data-reset]")) {
      doReset();
    }
  });

  /* ---------- 내보내기 텍스트 ---------- */
  function curHex(f) { return toHex(getVar(f.vars[0])); }
  function buildExport() {
    var css = [":root {", "  /* 색 */"];
    COLOR_FIELDS.forEach(function (f) {
      css.push("  " + f.vars.map(function (v) { return v + ": " + curHex(f); }).join("; ") + ";");
    });
    css.push("  /* 폰트 */");
    css.push("  --font-sans: " + getVar("--font-sans") + ";");
    css.push("  --font-display: " + getVar("--font-display") + ";");
    css.push("  /* 크기 / 자간 / 행간 */");
    TYPES.forEach(function (t) {
      css.push("  --fs-" + t.key + ": " + Math.round(num(getVar("--fs-" + t.key))) + "px;" +
        "  --ls-" + t.key + ": " + (Math.round(num(getVar("--ls-" + t.key)) * 10) / 10) + "px;" +
        "  --lh-" + t.key + ": " + (Math.round(num(getVar("--lh-" + t.key)) * 100) / 100) + ";");
    });
    var alignLines = [];
    TYPES.forEach(function (t) {
      if (!t.align) return;
      var a = inlineVar("--align-" + t.key);
      if (a) alignLines.push("  --align-" + t.key + ": " + a + ";");
    });
    if (alignLines.length) { css.push("  /* 정렬 */"); css = css.concat(alignLines); }
    css.push("}");

    // DESIGN.md 가이드(읽기용)
    var dz = ["", "── DESIGN.md 참고값 ──", "colors:"];
    COLOR_FIELDS.forEach(function (f) {
      f.vars.forEach(function (v) { dz.push('  ' + v.replace("--color-", "") + ': "' + curHex(f) + '"'); });
    });
    dz.push("typography:");
    dz.push("  font-sans: " + getVar("--font-sans"));
    TYPES.forEach(function (t) {
      dz.push("  " + t.key + ": { size: \"" + Math.round(num(getVar("--fs-" + t.key))) + "px\", " +
        "line-height: " + (Math.round(num(getVar("--lh-" + t.key)) * 100) / 100) + ", " +
        "letter-spacing: \"" + (Math.round(num(getVar("--ls-" + t.key)) * 10) / 10) + "px\" }");
    });
    return css.join("\n") + "\n" + dz.join("\n");
  }

  /* ---------- 초기화 ---------- */
  function doReset() {
    // 인라인 오버라이드 제거
    COLOR_FIELDS.forEach(function (f) { f.vars.forEach(function (v) { root.style.removeProperty(v); }); });
    root.style.removeProperty("--font-sans"); root.style.removeProperty("--font-display");
    TYPES.forEach(function (t) {
      root.style.removeProperty("--fs-" + t.key);
      root.style.removeProperty("--ls-" + t.key);
      root.style.removeProperty("--lh-" + t.key);
      root.style.removeProperty("--align-" + t.key);
    });
    state = { colors: {}, font: null, fs: {}, ls: {}, lh: {}, align: {} };
    saveState();
    // 컨트롤 값 복원
    COLOR_FIELDS.forEach(function (f) {
      var inp = panel.querySelector('input[data-color="' + f.id + '"]'); if (inp) inp.value = DEF.colors[f.id];
      var hx = panel.querySelector('[data-hex="' + f.id + '"]'); if (hx) hx.textContent = DEF.colors[f.id];
    });
    var fsel = panel.querySelector("select[data-font]"); if (fsel) fsel.value = "pretendard";
    TYPES.forEach(function (t) {
      setRange("fs", t.key, DEF.fs[t.key], DEF.fs[t.key] + "px");
      setRange("ls", t.key, DEF.ls[t.key], DEF.ls[t.key].toFixed(1) + "px");
      setRange("lh", t.key, DEF.lh[t.key], DEF.lh[t.key].toFixed(2));
    });
    panel.querySelectorAll("button[data-align].is-on").forEach(function (b) { b.classList.remove("is-on"); });
    var out = panel.querySelector("[data-export-out]"); if (out) out.classList.remove("is-shown");
  }
  function setRange(group, key, value, disp) {
    var r = panel.querySelector('input[data-group="' + group + '"][data-key="' + key + '"]');
    if (r) r.value = value;
    var el = panel.querySelector('[data-val="' + group + "-" + key + '"]'); if (el) el.textContent = disp;
  }
})();
