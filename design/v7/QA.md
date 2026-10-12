# PillNote Web — v7 검증 기록

2026-10-12. 한글 입력·동작 속도·팝업 배경 수정 당시 기록.

- 실제 포커스 검색창, 검색 결과, 보호자 초대 전 페이지를 추가해 총27개 캡처를 사용했다.
- 한글 IME 조합과 커서는 스크롤 위치로만 계산했다. 입력 중 진행도0.298287에서 정지 후 입력 DOM과 레이어가 동일함을 확인했다.
- 전환·터치·장면 출구 거리를 화면 높이 단위로 통일했다.
- 보호자 팝업의 고정 배경과 dim을 분리했다. 진행도0.296331에서 닫힘 중 흰 틈이 없음을 확인했다.
- 시간 선택 진행도0.565039에서 내부 dim과 화면 개구부 배경의 dim이 일치했다.
- 320×568에서 가로 넘침이 없고 기기 배경이 채워지는 것을 확인했다.
- `npm test`:27개 통과. TypeScript/Vite 빌드 통과.
- Flutter showcase: `00:12 +1: All tests passed!`. 앱 저장소 임시 파일 제거 및 production source clean.

당시 검색 캡처의 desktop compact 밀도와 기존 모바일 캡처 밀도가 다른 문제는 v8에서 통일했다. 증빙은 `design/screenshots/v7-typing.jpg`, `v7-guardian-backdrop.jpg`, `v7-time-picker.jpg`다.
