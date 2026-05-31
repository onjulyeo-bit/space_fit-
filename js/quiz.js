/* ============================================================
   quiz.js — 진단 흐름 + 화면 전환 제어 (2단계)
   config.js의 CONFIG.QUESTIONS를 읽어 질문을 렌더하고,
   progress-stepper·선택·내비게이션·화면 전환을 담당한다.
   진단 답변은 브라우저 메모리 상태로만 보관(저장소 미사용 — CLAUDE.md).
   결과 계산/렌더는 result.js(3단계), 폼 전송은 4단계에서 연결.
   ============================================================ */
(function () {
  "use strict";

  var CONFIG = window.CONFIG;
  if (!CONFIG) { console.error("CONFIG 없음 — config.js 로드 확인"); return; }
  var questions = CONFIG.QUESTIONS;

  /* ---- 메모리 상태 ---- */
  var state = {
    index: 0,       // 현재 질문 인덱스
    answers: {},    // questionId -> optionId
  };
  window.JipdaumState = state;

  /* ---- DOM 캐시 ---- */
  var el = {
    progress: document.getElementById("progress"),
    counter: document.getElementById("quiz-counter"),
    title: document.getElementById("quiz-title"),
    grid: document.getElementById("choice-grid"),
    prev: document.getElementById("btn-prev"),
    next: document.getElementById("btn-next"),
    resultRoot: document.getElementById("result-root"),
    form: document.getElementById("lead-form"),
  };

  /* ---- 화면 전환 ---- */
  function showScreen(name) {
    var screens = document.querySelectorAll(".screen");
    for (var i = 0; i < screens.length; i++) screens[i].classList.remove("is-active");
    var target = document.getElementById("screen-" + name);
    if (target) target.classList.add("is-active");
    window.scrollTo(0, 0);
  }
  window.showScreen = showScreen;

  /* ---- 진단 입력값을 result.js가 쓸 형태로 노출 ----
     반환: { Q1: optionObj|null, ... Q7: optionObj|null } */
  window.getDiagnosisInput = function () {
    var picked = {};
    questions.forEach(function (q) {
      var optId = state.answers[q.id];
      picked[q.id] = optId ? findOption(q, optId) : null;
    });
    return picked;
  };

  function findOption(q, optId) {
    for (var i = 0; i < q.options.length; i++) {
      if (q.options[i].id === optId) return q.options[i];
    }
    return null;
  }

  /* ---- progress-stepper ---- */
  function renderStepper() {
    el.progress.innerHTML = "";
    questions.forEach(function (q, i) {
      if (i > 0) {
        var line = document.createElement("span");
        line.className = "step-line";
        el.progress.appendChild(line);
      }
      var dot = document.createElement("span");
      dot.className = "step-dot";
      if (i < state.index) dot.classList.add("step-dot--done");
      else if (i === state.index) dot.classList.add("step-dot--current");
      el.progress.appendChild(dot);
    });
  }

  /* ---- 질문 렌더 ---- */
  function renderQuestion() {
    var q = questions[state.index];
    renderStepper();
    el.counter.textContent = "QUESTION " + (state.index + 1) + " / " + questions.length;
    el.title.textContent = q.title;

    el.grid.className = "choice-grid choice-grid--" + (q.type === "image" ? "image" : "text");
    el.grid.innerHTML = "";

    var selectedId = state.answers[q.id];
    q.options.forEach(function (opt) {
      var card = document.createElement("button");
      card.type = "button";
      card.className = "choice-card choice-card--" + q.type;
      if (opt.id === selectedId) card.classList.add("is-selected");

      if (q.type === "image") {
        var media = document.createElement("span");
        media.className = "choice-card__media";
        if (opt.image) {
          var img = document.createElement("img");
          img.src = opt.image;
          img.alt = opt.label;
          img.addEventListener("error", function () {
            img.style.display = "none";
            media.classList.add("is-empty");
          });
          media.appendChild(img);
        } else {
          media.classList.add("is-empty"); // 이미지 경로가 비면 '이미지 준비중' 표시
        }
        card.appendChild(media);
      }

      var label = document.createElement("span");
      label.className = "choice-card__label";
      label.textContent = opt.label;
      card.appendChild(label);

      card.addEventListener("click", function () { onSelect(q, opt.id); });
      el.grid.appendChild(card);
    });

    el.next.textContent = (state.index === questions.length - 1) ? "결과 보기" : "다음";
    el.next.disabled = !selectedId;
    el.prev.textContent = (state.index === 0) ? "그만두기" : "이전";
  }

  var advanceTimer = null;
  function onSelect(q, optId) {
    state.answers[q.id] = optId;
    renderQuestion();
    // 선택하면 강조를 잠깐 보여준 뒤 자동으로 다음으로 (모바일에서 '다음' 버튼을 못 찾는 문제 해결)
    if (advanceTimer) clearTimeout(advanceTimer);
    advanceTimer = setTimeout(function () { advanceTimer = null; goNext(); }, 350);
  }

  /* ---- 내비게이션 ---- */
  function goNext() {
    if (advanceTimer) { clearTimeout(advanceTimer); advanceTimer = null; }
    var q = questions[state.index];
    if (!state.answers[q.id]) return; // 미선택 방어
    if (state.index < questions.length - 1) {
      state.index++;
      renderQuestion();
    } else {
      finish();
    }
  }
  function goPrev() {
    if (advanceTimer) { clearTimeout(advanceTimer); advanceTimer = null; }
    if (state.index === 0) { showScreen("landing"); return; }
    state.index--;
    renderQuestion();
  }

  function startQuiz() {
    state.index = 0;
    showScreen("quiz");
    renderQuestion();
  }
  function restart() {
    state.index = 0;
    state.answers = {};
    showScreen("landing");
  }

  /* ---- 진단 완료 → 로딩 → 결과 ---- */
  function finish() {
    showScreen("loading");
    setTimeout(function () {
      var input = window.getDiagnosisInput();
      if (window.Result && typeof window.Result.render === "function") {
        window.Result.render(input); // 3단계에서 연결
      } else {
        renderResultPlaceholder(input);
      }
      showScreen("result");
    }, 1400);
  }

  /* ---- 결과 플레이스홀더 (3단계에서 result.js가 대체) ---- */
  function renderResultPlaceholder(input) {
    if (!el.resultRoot) return;
    var picks = questions.map(function (q) {
      return input[q.id] ? input[q.id].label : "—";
    }).join(" · ");
    el.resultRoot.innerHTML =
      '<div class="result-card">' +
        '<p class="eyebrow">진단 결과</p>' +
        '<h2 class="result-card__title">결과 계산 로직은 3단계에서 연결됩니다</h2>' +
        '<div class="info-tile">선택한 답변<br />' + picks + "</div>" +
      "</div>";
  }

  /* ---- 이벤트 와이어링 ---- */
  document.addEventListener("click", function (e) {
    var trigger = e.target.closest ? e.target.closest("[data-action]") : null;
    if (!trigger) return;
    e.preventDefault();
    var action = trigger.getAttribute("data-action");
    if (action === "start") startQuiz();
    else if (action === "restart") restart();
    else if (action === "to-form") showScreen("form");
  });

  if (el.next) el.next.addEventListener("click", goNext);
  if (el.prev) el.prev.addEventListener("click", goPrev);

  /* 폼: Web3Forms 표준 POST 전송 → 성공 시 완료 화면, 실패 시 안내 메시지 */
  if (el.form) {
    var submitBtn = document.getElementById("lead-submit");
    var errorEl = document.getElementById("lead-error");

    function showFormError(msg) {
      if (!errorEl) return;
      errorEl.textContent = msg;
      errorEl.hidden = false;
    }
    function clearFormError() { if (errorEl) { errorEl.hidden = true; errorEl.textContent = ""; } }

    // 진단 결과 스타일을 hidden 필드에 채운다(메인 + 서브)
    function fillDiagnosedStyle() {
      var styleField = document.getElementById("lead-style");
      if (!styleField) return;
      var r = window.JipdaumResult;
      var text = "(미진단)";
      if (r && r.style && r.style.main) {
        text = r.style.main.name;
        if (r.style.sub) text += " (+서브: " + r.style.sub.name + ")";
        if (r.budget && r.budget.range) text += " · 예산대 " + r.budget.range;
        if (r.vendor && r.vendor.group) text += " · " + r.vendor.group;
      }
      styleField.value = text;
    }

    el.form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearFormError();

      // 기본 검증
      var nameEl = document.getElementById("lead-name");
      var contactEl = document.getElementById("lead-contact");
      var agreeEl = document.getElementById("lead-agree");
      if (!nameEl.value.trim() || !contactEl.value.trim()) {
        showFormError("이름과 연락처를 입력해 주세요.");
        return;
      }
      if (!agreeEl.checked) {
        showFormError("개인정보 수집·이용에 동의해 주세요.");
        return;
      }

      // access key 주입 (config 한 곳에서 관리)
      var keyField = document.getElementById("lead-access-key");
      if (keyField) keyField.value = CONFIG.WEB3FORMS_ACCESS_KEY || "";
      if (!CONFIG.WEB3FORMS_ACCESS_KEY) {
        showFormError("폼이 아직 연결되지 않았어요(관리자: config.js에 Web3Forms access key를 넣어주세요).");
        return;
      }
      fillDiagnosedStyle();

      // 전송 중 상태
      var originalText = submitBtn ? submitBtn.textContent : "";
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "전송 중…"; }

      // UTF-8 JSON으로 전송(한글 필드명 라벨이 메일에서 깨지지 않도록).
      var payload = {};
      new FormData(el.form).forEach(function (v, k) { payload[k] = v; });
      fetch(CONFIG.FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (res) { return res.json().catch(function () { return {}; }).then(function (d) { return { ok: res.ok, data: d }; }); })
        .then(function (r) {
          if (r.ok && r.data && r.data.success) {
            showScreen("done");
          } else {
            showFormError((r.data && r.data.message) ? r.data.message : "제출에 실패했어요. 잠시 후 다시 시도해 주세요.");
          }
        })
        .catch(function () {
          showFormError("네트워크 오류로 제출하지 못했어요. 연결 상태를 확인하고 다시 시도해 주세요.");
        })
        .then(function () {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalText; }
        });
    });
  }

  /* 초기 화면 */
  showScreen("landing");
})();
