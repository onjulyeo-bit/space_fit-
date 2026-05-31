# 집다움 by SpaceFit — 스타일 파인더

5~7개 질문으로 내 집 인테리어 **스타일·예산대·업체군**을 진단해 주는 무료 웹앱.
정적 HTML/CSS/JS로 구현되어 어디서나 배포 가능합니다.

## 로컬 실행

```bash
python3 -m http.server 4173
# 브라우저에서 http://localhost:4173
```

## 구조

```
index.html        # 단일 페이지 (랜딩 → 진단 → 결과 → 폼 → 완료)
css/style.css     # 디자인 토큰(CSS 변수) + 컴포넌트 스타일
js/config.js      # 질문·점수표·예산대·업체군·폼 키 (설정)
js/quiz.js        # 진단 흐름·화면 전환·폼 전송
js/result.js      # 점수 합산 → 결과 계산·렌더
js/admin-panel.js # 디자인 실시간 조정 패널 (주소 뒤 ?admin 일 때만)
assets/images/    # Q1·Q4 스타일 이미지 (교체 예정)
```

## 연락처 폼 (Web3Forms)

`js/config.js`의 `WEB3FORMS_ACCESS_KEY`에 발급받은 공개 키를 넣으면 제출이 작동합니다.
제출 시 이름·연락처·메모와 진단 스타일이 이메일로 전송됩니다.

## 디자인 설정 패널

배포 주소 뒤에 `?admin`을 붙이면(예: `.../?admin`) 색·폰트·크기 등을
실시간으로 조정하는 관리자 패널이 열립니다. 일반 방문자에게는 보이지 않습니다.
