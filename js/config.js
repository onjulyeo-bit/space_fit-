/* ============================================================
   config.js — 집다움 스타일 파인더 진단 설정 (단일 출처)
   PRD 7장(진단 로직)·8장(콘텐츠)을 코드 수정 없이 값만 바꿀 수 있게
   하나의 CONFIG 객체로 정리한다. Amy가 가중치·금액·문구를 여기서 보정한다.

   스타일 코드: MOD 모던 · MIN 미니멀호텔식 · NAT 내추럴 ·
               SCA 북유럽 · CLA 클래식 · MCL 모던클래식
   ============================================================ */

const CONFIG = {

  /* ----------------------------------------------------------
     폼 백엔드 (Web3Forms) — PRD 10-3 · CLAUDE.md 규칙 6
     FORM_ENDPOINT는 Web3Forms 공통 주소(고정). 바꿀 필요 없음.
     ★★ WEB3FORMS_ACCESS_KEY 한 곳에만 발급받은 키를 붙여넣으면 폼이 작동합니다. ★★
        (가입·키 발급 방법은 README/대화 안내 참고. 키가 비어 있으면 제출 시 안내 메시지 표시)
     ---------------------------------------------------------- */
  FORM_ENDPOINT: "https://api.web3forms.com/submit",
  WEB3FORMS_ACCESS_KEY: "a0dcb7ea-915b-4341-b7ab-83e5c497103b", // Web3Forms 발급 키 (공개 키)

  /* ----------------------------------------------------------
     STYLES — 스타일 유형 6종 (PRD 7-1)
     body(결과 본문)는 플레이스홀더. 3단계 이후 Amy 톤으로 채운다.
     ---------------------------------------------------------- */
  STYLES: {
    MOD: {
      code: "MOD",
      name: "모던",
      tagline: "깔끔한 직선, 무채색, 절제된 마감. 가장 보편적.",
      body: "", // TODO: Amy 톤으로 2~3문장
    },
    MIN: {
      code: "MIN",
      name: "미니멀·호텔식",
      tagline: "아이보리·베이지톤, 무몰딩, 호텔 같은 정돈. 현 시장 최대 수요.",
      body: "",
    },
    NAT: {
      code: "NAT",
      name: "내추럴",
      tagline: "우드톤, 식물, 천연 소재. 꾸준하고 강한 수요.",
      body: "",
    },
    SCA: {
      code: "SCA",
      name: "북유럽·스칸디나비안",
      tagline: "밝은 우드, 화이트 베이스, 파스텔 포인트, 아늑함.",
      body: "",
    },
    CLA: {
      code: "CLA",
      name: "클래식·앤티크",
      tagline: "중후한 마감, 몰딩, 고급 자재. 높은 객단가.",
      body: "",
    },
    MCL: {
      code: "MCL",
      name: "모던 클래식",
      tagline: "클래식의 우아함 + 현대적 절제. 고급스럽되 부담 없는 중간 지대.",
      body: "",
    },
  },

  /* ----------------------------------------------------------
     QUESTIONS — 진단 7문항 (PRD 8-1)
     Q1~Q4: 스타일 점수(scores). 각 선택지가 6종 스타일에 0~3점 부여.
     Q5~Q7: 예산·업체군 산출용 (점수 없음, 보정 키 보유).
     type: "image" | "text"
     이미지 선택형 옵션의 image 경로는 추후 Amy 포트폴리오로 교체.
     ---------------------------------------------------------- */
  QUESTIONS: [
    /* ---------- Q1 (이미지) 거실 ---------- */
    {
      id: "Q1",
      type: "image",
      kind: "style",
      title: "가장 살고 싶은 거실은?",
      options: [
        { id: "Q1-MOD", label: "모던 거실",      image: "", scores: { MOD: 3, MIN: 1, NAT: 0, SCA: 0, CLA: 0, MCL: 1 } },
        { id: "Q1-MIN", label: "미니멀·호텔 거실", image: "", scores: { MOD: 1, MIN: 3, NAT: 0, SCA: 0, CLA: 0, MCL: 1 } },
        { id: "Q1-NAT", label: "내추럴 거실",     image: "", scores: { MOD: 0, MIN: 0, NAT: 3, SCA: 1, CLA: 0, MCL: 0 } },
        { id: "Q1-SCA", label: "북유럽 거실",     image: "", scores: { MOD: 0, MIN: 0, NAT: 1, SCA: 3, CLA: 0, MCL: 0 } },
        { id: "Q1-CLA", label: "클래식 거실",     image: "", scores: { MOD: 0, MIN: 0, NAT: 0, SCA: 0, CLA: 3, MCL: 1 } },
        { id: "Q1-MCL", label: "모던클래식 거실",  image: "", scores: { MOD: 1, MIN: 1, NAT: 0, SCA: 0, CLA: 1, MCL: 3 } },
      ],
    },

    /* ---------- Q2 (이미지) 색감 ---------- */
    {
      id: "Q2",
      type: "image",
      kind: "style",
      title: "끌리는 색감은?",
      options: [
        { id: "Q2-1", label: "무채색·그레이",   image: "assets/images/q2-gray.svg",     scores: { MOD: 3, MIN: 1, NAT: 0, SCA: 0, CLA: 0, MCL: 1 } },
        { id: "Q2-2", label: "아이보리·베이지", image: "assets/images/q2-ivory.svg",    scores: { MOD: 1, MIN: 3, NAT: 1, SCA: 1, CLA: 0, MCL: 1 } },
        { id: "Q2-3", label: "우드·그린",       image: "assets/images/q2-woodgreen.svg", scores: { MOD: 0, MIN: 0, NAT: 3, SCA: 1, CLA: 0, MCL: 0 } },
        { id: "Q2-4", label: "화이트·파스텔",   image: "assets/images/q2-pastel.svg",   scores: { MOD: 0, MIN: 1, NAT: 1, SCA: 3, CLA: 0, MCL: 0 } },
        { id: "Q2-5", label: "딥브라운·골드",   image: "assets/images/q2-brown.svg",    scores: { MOD: 0, MIN: 0, NAT: 0, SCA: 0, CLA: 3, MCL: 1 } },
        { id: "Q2-6", label: "뉴트럴+포인트",   image: "assets/images/q2-neutral.svg",  scores: { MOD: 1, MIN: 1, NAT: 0, SCA: 0, CLA: 1, MCL: 3 } },
      ],
    },

    /* ---------- Q3 (텍스트) 분위기 키워드 ----------
       PRD 8-2: Q2와 동일 매핑 구조(해당 스타일 +3, 인접 +1). */
    {
      id: "Q3",
      type: "text",
      kind: "style",
      title: "선호하는 분위기 키워드는?",
      options: [
        { id: "Q3-1", label: "깔끔·모던",            scores: { MOD: 3, MIN: 1, NAT: 0, SCA: 0, CLA: 0, MCL: 1 } },
        { id: "Q3-2", label: "호텔 같은 정돈",         scores: { MOD: 1, MIN: 3, NAT: 1, SCA: 1, CLA: 0, MCL: 1 } },
        { id: "Q3-3", label: "자연스럽고 편안",        scores: { MOD: 0, MIN: 0, NAT: 3, SCA: 1, CLA: 0, MCL: 0 } },
        { id: "Q3-4", label: "밝고 아늑",            scores: { MOD: 0, MIN: 1, NAT: 1, SCA: 3, CLA: 0, MCL: 0 } },
        { id: "Q3-5", label: "고급스럽고 중후",        scores: { MOD: 0, MIN: 0, NAT: 0, SCA: 0, CLA: 3, MCL: 1 } },
        { id: "Q3-6", label: "우아하되 과하지 않게",    scores: { MOD: 1, MIN: 1, NAT: 0, SCA: 0, CLA: 1, MCL: 3 } },
      ],
    },

    /* ---------- Q4 (이미지) 마감 소재 ----------
       PRD 8-2: Q2와 동일 매핑 구조(해당 스타일 +3, 인접 +1). */
    {
      id: "Q4",
      type: "image",
      kind: "style",
      title: "끌리는 마감 소재는?",
      options: [
        { id: "Q4-1", label: "매끈한 무광·메탈",  image: "",   scores: { MOD: 3, MIN: 1, NAT: 0, SCA: 0, CLA: 0, MCL: 1 } },
        { id: "Q4-2", label: "대리석·세라믹",     image: "",  scores: { MOD: 1, MIN: 3, NAT: 1, SCA: 1, CLA: 0, MCL: 1 } },
        { id: "Q4-3", label: "원목·라탄",        image: "",    scores: { MOD: 0, MIN: 0, NAT: 3, SCA: 1, CLA: 0, MCL: 0 } },
        { id: "Q4-4", label: "밝은 우드·패브릭",  image: "",  scores: { MOD: 0, MIN: 1, NAT: 1, SCA: 3, CLA: 0, MCL: 0 } },
        { id: "Q4-5", label: "몰딩·진한 우드",    image: "", scores: { MOD: 0, MIN: 0, NAT: 0, SCA: 0, CLA: 3, MCL: 1 } },
        { id: "Q4-6", label: "우드+간결한 디테일", image: "",  scores: { MOD: 1, MIN: 1, NAT: 0, SCA: 0, CLA: 1, MCL: 3 } },
      ],
    },

    /* ---------- Q5 (텍스트) 공간 규모 → 예산 평형 키 ---------- */
    {
      id: "Q5",
      type: "text",
      kind: "budget",
      title: "리모델링 공간 규모는?",
      options: [
        { id: "Q5-20", label: "20평대",      size: "20" },
        { id: "Q5-30", label: "30평대",      size: "30" },
        { id: "Q5-40", label: "40평대",      size: "40" },
        { id: "Q5-50", label: "50평 이상",   size: "50" },
      ],
    },

    /* ---------- Q6 (텍스트) 예산/시공 범위 → 예산 티어 키 ----------
       budgetTier는 BUDGET 표의 열(partial/standard/premium)과 연결. */
    {
      id: "Q6",
      type: "text",
      kind: "budget",
      title: "생각하는 예산 / 시공 범위는?",
      options: [
        { id: "Q6-part",   label: "부분 시공",        budgetTier: "partial" },
        { id: "Q6-value",  label: "전체(합리적)",      budgetTier: "standard" },
        { id: "Q6-mid",    label: "전체(중급)",        budgetTier: "standard" },
        { id: "Q6-premium", label: "고급 마감",        budgetTier: "premium" },
      ],
    },

    /* ---------- Q7 (텍스트) 우선순위 → 업체군·공정 보정 ---------- */
    {
      id: "Q7",
      type: "text",
      kind: "vendor",
      title: "무엇을 가장 중요하게 생각하세요?",
      options: [
        { id: "Q7-value",   label: "가성비",        priority: "value" },
        { id: "Q7-design",  label: "디자인 완성도",  priority: "design" },
        { id: "Q7-durable", label: "내구성·관리",    priority: "durability" },
        { id: "Q7-fast",    label: "빠른 시공",      priority: "speed" },
      ],
    },
  ],

  /* ----------------------------------------------------------
     판정 규칙 (PRD 8-2)
     ---------------------------------------------------------- */
  JUDGE: {
    subStyleThreshold: 2, // 2위가 1위와 이 점수 이내면 "서브 스타일"로 함께 제시
    tiebreakQuestionId: "Q1", // 동점이면 Q1(거실 사진) 가중치 우선
  },

  /* ----------------------------------------------------------
     BUDGET — 예산대 산출표 (PRD 7-3, 2025~2026 시장 데이터)
     BUDGET[size][tier] = 금액 범위 문자열.
     size: 20/30/40/50  ·  tier: partial(부분) / standard(전체 중급) / premium(고급)
     ※ 출처: 오늘의집 원가검수센터 등. 현장 경험으로 보정.
     ---------------------------------------------------------- */
  BUDGET: {
    "20": { partial: "800만~1,500만 원",   standard: "2,500만~4,000만 원", premium: "4,000만 원~" },
    "30": { partial: "1,500만~2,500만 원", standard: "4,000만~7,000만 원", premium: "7,000만~9,500만 원" },
    "40": { partial: "2,000만~3,500만 원", standard: "6,000만~9,000만 원", premium: "1억 원~" },
    "50": { partial: "3,000만 원~",        standard: "8,000만 원~",        premium: "1억 원 이상" },
  },

  /* 예산대 근거 한 줄 (결과에 함께 표기) */
  BUDGET_NOTE: "전체 리모델링·중급 마감·철거 포함 기준. 가구/조명 일부 별도. 평당 단가: 일반 120~150만 · 중급 180~220만 · 고급 250~300만 원.",

  /* ----------------------------------------------------------
     HIDDEN_COSTS — 견적서에 잘 안 잡히는 숨은 비용 (PRD 7-3, "투명" 가치)
     ---------------------------------------------------------- */
  HIDDEN_COSTS: [
    { label: "구축(15년 이상) 분전반·급배수관 교체", amount: "100만~300만 원", note: "거의 필수" },
    { label: "창호 교체", amount: "평당 20만~40만 원", note: "" },
    { label: "시스템에어컨", amount: "대당 100만~200만 원", note: "" },
    { label: "폐기물 처리비", amount: "별도인 경우 많음", note: "‘철거 포함’ 표기에도 별도 청구되곤 함" },
    { label: "붙박이장·아트월·간접조명", amount: "기본 비용의 10~15% 추가", note: "" },
  ],

  /* ----------------------------------------------------------
     VENDORS — 업체군 매핑 규칙 (PRD 7-4)
     스타일·예산 특성 조합으로 적합 업체군 + 공정 가이드를 매핑.
     match: 판정에 쓰는 조건(result.js 3단계에서 사용).
       styles: 이 규칙이 우선 적용되는 스타일 코드 배열(빈 배열이면 스타일 무관)
       budgetTiers: 적용 예산 티어 배열(빈 배열이면 티어 무관)
     규칙은 위에서부터 평가하고, 어디에도 안 맞으면 default 사용.
     ---------------------------------------------------------- */
  VENDORS: {
    rules: [
      {
        id: "partial",
        match: { styles: [], budgetTiers: ["partial"] },
        group: "부분 시공 전문 / 반셀프",
        process: "공정별 분리 발주, 직영 가능. 소규모·부분 시공에 적합.",
      },
      {
        id: "premium-design",
        match: { styles: ["CLA", "MCL"], budgetTiers: ["premium"] },
        group: "디자인 전문 스튜디오",
        process: "설계와 시공 분리 발주 권장, 감리 포함. 고급 마감·디자인 중심.",
      },
      {
        id: "scandi-value",
        match: { styles: ["SCA"], budgetTiers: ["standard", "partial"] },
        group: "종합 업체 / 시공 패키지",
        process: "자재 등급 차등으로 예산 조절. 밝고 경쾌한 스타일에 합리적.",
      },
    ],
    /* 표준 스타일(모던·미니멀·내추럴) + 중간 예산 등 그 외 전부 */
    default: {
      id: "standard",
      group: "종합 인테리어 업체",
      process: "디자인→철거→설비→목공→마감 일괄 발주.",
    },
  },

  /* ----------------------------------------------------------
     Q7 우선순위별 공정 가이드 보정 문구 (PRD 8-1 Q7)
     업체군 매핑 결과 위에 한 줄 덧붙이는 보정 메시지.
     ---------------------------------------------------------- */
  PRIORITY_NOTES: {
    value:      "가성비 우선 — 자재 등급을 차등해 핵심 공간에 예산을 집중하세요.",
    design:     "디자인 완성도 우선 — 포트폴리오와 감리 여부를 꼭 확인하세요.",
    durability: "내구성·관리 우선 — 자재 보증·하자 보수 조건을 계약서에 명시하세요.",
    speed:      "빠른 시공 우선 — 공정표와 준공일을 사전에 합의하세요.",
  },

  /* ----------------------------------------------------------
     RESULT_COPY — 결과 리포트 문구 (PRD 8-3 구조)
     섹션 제목·안내 문구를 코드와 분리. Amy가 톤을 보정한다.
     스타일별 본문은 STYLES[*].body 에 채운다(지금은 빈 플레이스홀더).
     ---------------------------------------------------------- */
  RESULT_COPY: {
    eyebrow: "진단 결과 · 내 집의 방향",
    bodyPlaceholder: "(이 스타일을 설명하는 2~3문장을 여기에 채워주세요. — Amy 톤)",
    subStyleHeading: "함께 어울리는 서브 스타일",
    subStyleNote: "1위와 점수가 근소해, 두 스타일을 섞으면 더 잘 맞을 수 있어요.",
    budgetHeading: "추천 예산대",
    vendorHeading: "적합한 업체군 · 공정 가이드",
    hiddenHeading: "견적서에 잘 안 잡히는 숨은 비용",
    hiddenIntro: "상담 전에 미리 알려드려요. 견적을 비교할 때 이 항목들이 포함됐는지 꼭 확인하세요.",
    whyHeading: "왜 이 결과인가요?",
    // {picks}=선택 요약, {style}=스타일명 으로 치환
    whyTemplate: "{picks} 을(를) 고르셨어요. 이 선택들이 ‘{style}’에 가장 높은 점수를 줬습니다.",
  },

  /* ----------------------------------------------------------
     개인정보 동의 문구 (CLAUDE.md 규칙 7 · PRD 9)
     ---------------------------------------------------------- */
  PRIVACY_NOTICE: "입력하신 정보는 상담 연결 목적으로만 사용합니다.",
};

/* 다른 스크립트에서 전역으로 참조 (정적 페이지, 모듈 번들 미사용) */
window.CONFIG = CONFIG;
