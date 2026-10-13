# PillNote Web

실제 PillNote Flutter 앱 화면을 캡처해 사용 과정을 애니메이션으로 소개하는 React 웹입니다. 공개 주소는 https://pillnote.app/이며, 설치 안내에서 GitHub 릴리즈의 Android APK로 연결합니다.

## 실행

```sh
npm install
npm run dev
```

로컬 주소: http://127.0.0.1:5173/

```sh
npm test
npm run build
npm run preview
```

`npm run build`는 TypeScript 검사와 프로덕션 빌드를 수행합니다. 정적 빌드 결과는 `dist/`입니다.

## 소개 방식

첫 화면은 “복약 관리도 간편하게. PillNote” 문구가 있는 전체 화면 컨테이너입니다. 스크롤하면 컨테이너와 문구가 줄어들고 실제 앱 화면이 나타납니다. 이어지는 오늘의 복용 → 약 등록 → 복용 기록 → 내 약 상자 → 시간 알림 → 보호자 연결 → 주변 약국도 같은 휴대폰 안에서 연결됩니다.

첫 화면에 대상 사용자, 일정·기록 관리 용도, 보호자 이용 조건과 다운로드·기능 보기 버튼을 함께 표시합니다. `#features`의 정적 요약, `#product`의 제품·개발 현황, `#download`의 APK 설치 안내, `#privacy`의 데이터 흐름 안내와 `#data-deletion`의 삭제 절차는 스크롤 연출을 끝까지 재생하지 않아도 바로 읽을 수 있습니다. 상단·푸터 로고는 중간 장면을 거치지 않고 첫 화면으로 이동합니다. 작은 화면과 글자 확대 환경에서는 첫 화면의 긴 본문을 내부에서 스크롤할 수 있습니다.

## 회사 정보와 Claude Startups 재신청

회사명과 앱 이름은 **PillNote**, 설립 시점은 **2026년 5월**, 최근 2년 내 투자 유치는 없습니다. 이 정보는 운영자가 2026-10-13 직접 확인했습니다. 설립일의 일자는 확인되지 않아 월까지만 표시합니다. 개발자는 **Dohyun Kim**, 공개 연락처는 **dohyun.kim@pillnote.app**입니다.

`#product`에서 회사 정보와 개발 활동을 안내합니다. `/company.html`은 JavaScript 없이 한국어·영어 회사 소개, 연락처, 공개 배포·소스·개발 이력을 제공합니다. `public/company.html`의 회사 정보·구조화 데이터와 `src/productCopy.ts`를 함께 유지해야 합니다. 홈페이지의 canonical/OG URL, JavaScript 미사용 안내, `robots.txt`, `sitemap.xml`도 공식 도메인 `https://pillnote.app/`을 사용합니다.

재신청에 사용할 영문 설명:

> PillNote is a company established in May 2026, building a medication management app under the same name. Our app helps people taking regular medication and their caregivers manage dose schedules, records, reminders, and caregiver check-in alerts. We distribute a working Android APK through public GitHub releases, with public source code and development history. We use Claude as a tool in our development process; the current app does not directly use the Claude API for in-app features. We have not raised investment in the past two years. Our official website is https://pillnote.app/ and our company profile is https://pillnote.app/company.html. Contact: dohyun.kim@pillnote.app.

재신청 전 확인:

- 회사 이름을 PillNote로 통일하고, 실제 수신 가능한 `@pillnote.app` 이메일로 신청합니다. 공개된 이메일 주소만으로 해당 메일함의 소유·수신 상태를 확인한 것은 아닙니다.
- 수정한 사이트를 기존 호스팅에 배포한 뒤 `/company.html`이 로그인 없이 열리는지 확인합니다. 로컬 빌드만으로 공개 사이트가 갱신되지는 않습니다.
- 설립 시점은 2026년 5월로 입력하고, 증빙을 요청받으면 실제 설립·사업자등록 자료를 제공합니다. 코드 최초 커밋이나 앱 출시일을 법적 설립일 증빙으로 대신하지 않습니다.
- 공식 안내와 거절 메일의 기준은 최근 5년 내 설립 또는 최근 2년 내 투자입니다. 설립 시점은 기간 기준에 해당하지만 승인 여부는 Anthropic의 회사 검증에 달려 있습니다.

공식 안내: [Claude Startups](https://claude.com/programs/startups), [프로그램 확대 안내](https://claude.com/resources/articles/were-expanding-the-claude-startups-program-to-help-founders-build). 2026-10-13 확인 시 공식 FAQ는 Claude Team 1년 및 $1,000 API 크레딧 신규 혜택이 수용 한도에 도달했다고 안내합니다. 재신청 승인과 해당 혜택 제공은 별개입니다.

## 제품 설명의 사실 확인과 유지보수

- 2026-10-13 확인한 최신 공개 릴리즈는 [v0.2.2](https://github.com/kimrasng/pillnote/releases/tag/v0.2.2)이며 첨부 파일은 `pillnote-v0.2.2.apk`입니다. 페이지에는 버전 문자열을 고정하지 않고 `/releases/latest`를 사용합니다. 새 릴리즈를 낼 때 지원 플랫폼과 안내 기능이 공개 APK에 포함되는지 대조해야 합니다. 개발 저장소의 새 화면을 이미 배포된 화면처럼 설명하지 않습니다.
- 개발자의 직접 확인에 따라 Claude를 개발 과정의 도구로 사용한다고 안내합니다. 현재 앱 내부에서 Claude API를 직접 사용하지 않으며, 구체적인 활용 작업이나 향후 API 계획을 추정하지 않습니다.
- 데이터 안내는 모바일 `LocalMedicationStore`, `SnapshotSyncService`, `SessionStore`, `ApiClient`, `DevicePrivacy`, `Pushalarm`, `Menu`, `Distanc`와 백엔드의 계정 삭제·초대·푸시 구현을 대조했습니다. 복약 정보는 기기에 저장하고 로그인 시 서버와 동기화합니다. 보호자에게 전체 복용 기록을 보여주는 기능은 확인되지 않았고, 푸시 본문은 복약 상태 확인 요청입니다.
- 공개 정책 문서는 저장소에서 발견되지 않았습니다. 현재 `#privacy`는 검증된 구현에 대한 **개인정보·데이터 안내**이며 확정된 개인정보처리방침은 아닙니다. 처리 주체, 실제 서비스 공급자·처리 지역·계약, 데이터별 보관 기간, 삭제 후 백업·로그의 보존 범위를 확인한 뒤 정식 정책과 푸터 정책 링크를 추가해야 합니다. 미확인 정책 문구나 placeholder는 공개 화면에 넣지 않습니다.
- 코드에서 확인한 외부 연동은 Resend 이메일, Firebase FCM/APNs 푸시, OpenStreetMap 지도 타일, 식약처 의약품·공공 약국 조회이며 서버 저장 구현에는 Cloudflare Workers/D1 경로가 있습니다. 이것만으로 실제 운영 계약과 국외 처리 조건을 확정하지 않습니다.
- 백엔드 코드에는 운영 집계 30일, 이메일·장애·검사 이벤트 7일의 정리 작업과 비활성 로그인 기기 30일 정리가 있습니다. 계정 삭제는 계정 참조 데이터와 인증 이메일 기록을 삭제하지만 운영 이벤트 전체·외부 서비스 로그·DB 백업까지 즉시 삭제된다는 근거는 없습니다. 코드의 정리 규칙을 서비스 전체의 확정 보관 정책으로 공개하지 않습니다.

검색 입력·커서, 화면 push/pop, 탭과 버튼 반응, 시간 선택 창, 복용 체크, 보호자 초대·입력·수락, 약국 목록과 상세 시트는 Flutter 엔진이 그린 중간 프레임을 스크롤 위치로 선택합니다. iPhone에 맞는 실제 Flutter iOS 화면 전환을 사용합니다. 복용 체크에는 체크 그리기와 작은 탄성 반응을 더했습니다. 다음 복용 카드의 위치와 라벨을 유지하며 내용·높이·진행 막대를 바꾸고, 완료 목록을 아래로 스크롤하는 단계 없이 내 약 상자로 이어집니다. 캔버스와 날짜를 같은 화면 갱신에서 반영하고 전환의 양 끝을 미리 디코딩해 중간 화면 깜빡임을 방지합니다. 잠금 화면은 아이폰 형태의 웹 알림 예시이며 화면 꺼짐·깨움, 아래쪽 알림 카드, 잠금 해제와 앱 창 확장을 보여줍니다. 복용 알림은 오늘의 복용, 보호자 알림은 보호자 연결 화면을 엽니다. 임계값 이상 스크롤하면 해당 동작이 정해진 시간에 완료되며, 반대 방향 입력도 이전 상태까지 재생합니다. 전환과 터치에 필요한 거리를 화면 높이 단위로 통일해 장면 길이에 따라 속도가 달라지지 않습니다. 팝업과 배경은 Flutter에서 함께 렌더링하며, 웹에서 화면 전체를 다시 페이드하거나 이동시키지 않습니다. 날짜는 같은 프레임의 이동·가림·어두워짐에 맞춥니다. 방문자가 앱 화면을 직접 클릭하거나 입력할 수 없습니다.

데스크톱과 세로 모바일에서는 하나의 기기가 전체 소개를 이어갑니다. 작은 세로 화면은 설명을 줄이고 기기를 크게 표시합니다. 아주 짧은 가로 화면은 일반 페이지 흐름을 사용합니다. 동작 감소 설정에서는 중간 애니메이션을 생략하고 완성된 상태로 전환합니다.

기능 설명은 장면 안에서 고정하고, 버튼 누르기·입력·화면 전환은 앱 애니메이션으로 전달합니다. 진행자 말투나 단계마다 바뀌는 조작 안내 자막은 사용하지 않습니다.

앱 소개 구간에서는 휠·트랙패드·터치·키보드 입력을 모아 일정량 이상이 되면 한 동작을 재생합니다. 임계값은 화면 높이의 40%(최소 220px, 최대 360px)이며, 750px 화면에서는 300px입니다. 임계값 전에는 화면을 유지하고, 넘으면 클릭과 정지 구간을 포함해 해당 동작을 650~1400ms 동안 끝까지 진행합니다. 다음 장면 이동은 950ms입니다. 재생 중 입력은 다음 동작으로 쌓지 않으며, 완료 후 250ms 여유를 둔 뒤 새 입력을 받습니다. 반대 방향도 한 동작씩 끝까지 되돌립니다. 목차는 각 장면의 첫 화면에 도착합니다. 정적 제품 요약 이하, 긴 첫 화면 본문의 내부 스크롤, 모션 감소·가로로 낮은 화면에서는 기본 스크롤을 유지합니다. `CHAPTER_SCROLL_SCALE = 0.4`는 캡처를 선택하는 내부 좌표만 압축하며 입력 임계값이나 재생 시간을 결정하지 않습니다.

상단의 KO/EN으로 한국어와 영어를 전환합니다. 모바일에서는 메뉴 안에서 선택합니다. 선택 표시는 하나의 스위치 안에서 움직이고, 문구 위치는 고정하고, 기존 문구를 왼쪽부터 160ms 동안 닦아낸 뒤 새 문구를 같은 방향으로 200ms 동안 드러냅니다. 현재 화면의 위쪽 텍스트부터 아래쪽 텍스트까지 최대 140ms의 시작 지연을 적용하며, 텍스트 span만 잘라내므로 컨테이너·구분선·아이콘은 유지됩니다. 빠르게 재선택하면 대기 중 전환을 정리하고 마지막 선택을 반영합니다. 모션 감소 설정에서는 즉시 전환합니다. 선택은 브라우저에 저장되고 새로고침 후 복원되며, 전환할 때 읽던 문구의 화면 내 위치를 paint 전에 복원합니다. 한국어·영어 문단 높이가 달라도 같은 내용을 보고 있도록 문서 스크롤 좌표를 보정합니다. 소개·메뉴·FAQ·접근성 문구·웹 알림 예시·문서 언어와 메타데이터가 함께 바뀝니다. 한국어만 지원하는 실제 앱의 캡처와 캡처 안의 날짜는 한국어 원본을 유지합니다.

페이지 스크롤바는 숨기되 휠·터치·키보드 스크롤을 유지합니다. 오른쪽 목차와 상단 소개 버튼은 해당 장면까지 부드럽게 스크롤합니다. 동작 감소 설정에서는 즉시 이동합니다.

앱 캡처와 중간 렌더 프레임은 780×1688픽셀, 논리 화면은 390×844입니다. [Hoverify의 기존 iPhone 18 Pro 목업](https://tryhoverify.com/tools/device-frames/iphone-18-pro/) 안에 원래 비율 그대로 배치합니다. 기기 몸체·베젤·측면 버튼·Dynamic Island는 제공된 WebP이며 CSS로 그리지 않습니다. 출처와 라이선스는 [design/device/README.md](design/device/README.md)에 있습니다. 캡처의 SafeArea에 웹 상태바와 홈 인디케이터를 배치합니다.

## 디자인 기준

흰 배경과 중립 회색, 잉크색 글자·버튼, 앱 UI의 파란색 포인트를 사용합니다. 제품 요약은 실제 앱 화면과 세로 기능 설명을 나란히 배치하며, 모바일에서는 기능 설명을 먼저 표시합니다. 약 정보·복용 기록·복용 시간 알림·주변 약국 검색 화면을 4.5초마다 400ms 페이드로 반복 순환합니다. 화면 선택과 일시정지·재생을 지원하며, 화면 밖·숨겨진 탭·모션 감소 설정에서는 자동 순환하지 않습니다. 배경색과 배치는 [Things](https://culturedcode.com/things/)와 [Bear](https://bear.app/)의 실제 제품 화면 중심 구성을 참고했습니다. 참고 사이트의 이미지나 문구는 사용하지 않습니다.

글자 크기와 굵기는 `src/design-system.css`에서 역할별로 관리합니다. 본문16px, 보조 문구14px, 라벨16px, 구성요소 제목24px, 상단·좁은 화면 메뉴16px입니다. 웹은 로컬에서 제공하는 Pretendard Variable을 사용하며, 앱 캡처의 원본 글꼴은 유지합니다. 섹션 제목과 첫 화면 문구만 화면 크기에 맞춰 커집니다. 상세 기준은 [design/DESIGN_SYSTEM.md](design/DESIGN_SYSTEM.md)에 있습니다. 모바일에서도 웹의 보조 문구를14px보다 작게 줄이지 않습니다. 실제 앱 캡처 안의 글꼴은 앱의 원래 크기와 화면 비율을 유지합니다.

검색 전·포커스·입력 후는 동일한 모바일 밀도로 캡처해 입력창 밖의 화면이 이동하지 않습니다.

## 캡처와 출시 상태

- Flutter의 실제 페이지, 앱 테마, Pretendard 글꼴과 탐색 아이콘을 사용했습니다. 입력 중 글자·커서를 포함한 UI와 애니메이션은 실제 Flutter 렌더입니다. 현재 날짜만 원래 글꼴과 프레임별 좌표로 덧그리며 생성 이미지는 사용하지 않았습니다.
- 복용 일정과 수량은 소개용 예시입니다. 타이레놀은 실제 공개 검색 API 응답과 식약처 식별 사진을 사용합니다. 실제 결과 선택·시간 추가·등록·복용 처리 코드로 체크와 14정→13정 수량 변화를 캡처했습니다.
- 웹은 저장소, 인증, 의약품 검색 API, 위치, 이메일, 푸시와 기기 알림에 연결하지 않습니다. 별도의 체험용 계정이나 입력 양식도 없습니다.
- 보호자 화면은 격리한 소개용 계정으로 실제 앱의 초대 → 대기 → 다른 계정의 수락 → 연결 과정을 캡처했습니다. 실제 사람에게 초대나 푸시를 전송하지 않았습니다.
- 잠금 화면 알림은 실제 앱·서버의 제목과 본문을 사용하는 도착 예시입니다. 날짜는 방문자의 오늘 날짜로 갱신됩니다. 앱 캡처의 날짜도 같은 실제 글꼴로 현재 날짜를 표시합니다.
- 지도와 목록은 서울역 주변 실제 약국 15곳과 센츄럴팜약국 상세를 캡처했습니다. 웹에서 타일을 요청하지 않습니다. 화면 옆에 [© OpenStreetMap contributors](https://www.openstreetmap.org/copyright)를 표시합니다.
- 다운로드 버튼은 `#download`의 APK 설치 절차로 이동합니다. 설치 안내와 제품 현황의 최신 릴리즈 버튼은 [최신 공개 릴리즈](https://github.com/kimrasng/pillnote/releases/latest)로, 이력 링크는 [PillNote 릴리즈](https://github.com/kimrasng/pillnote/releases)로 이동합니다.

자세한 캡처 출처, 재현 코드와 이미지 해시는 [design/capture/README.md](design/capture/README.md)에 있습니다.

## 주요 파일

- `src/App.tsx`: 스크롤 장면, 웹 목차, 이용 안내와 다운로드 링크
- `src/PhoneFilm.tsx`: 비율이 고정된 휴대폰과 스크롤에 맞춘 캡처 표시
- `src/film.ts`: 되돌릴 수 있는 캡처 합성과 터치 표시 계산
- `src/DoseCheckFeedback.tsx`, `src/feedback.ts`: 복용 체크 완료와 화면 전원 피드백
- `src/motion.ts`: 페이지 이동, 목록 스크롤, 팝업·알림 동작의 포즈
- `src/useWeightedScroll.ts`: 휠·터치·키보드 임계값과 동작 자동 재생 제어
- `src/playback.ts`: 동작별 시작·완료 좌표, 임계값과 재생 시간
- `src/pacing.ts`: 화면 높이 단위의 공통 전환·터치 거리
- `src/typing.ts`: 스크롤 좌표에 따른 한글 조합과 커서
- `src/scroll.ts`: 도입부와 장면의 스크롤 좌표 계산
- `test/`: 정지, 역스크롤, 장면 경계와 화면 비율 계산 회귀 검사
- `src/story.ts`: 장면별 캡처·스크롤 구간
- `src/i18n.ts`: 한국어·영어 소개 문구
- `src/ProductInfo.tsx`, `src/productCopy.ts`: 한국어·영어 정적 요약, 제품·개발 현황, 설치·데이터·삭제 안내
- `src/LocaleProvider.tsx`: 언어 선택·저장과 문서 메타데이터
- `src/styles.css`: 화면 배치와 동작 감소 설정
- `src/design-system.css`: 역할별 글자 크기·굵기·줄 간격, 버튼과 모바일 메뉴 기준
- `public/images/app/`: 실제 Flutter 앱 PNG 캡처
- `design/capture/`: 캡처 코드, 출처와 이미지 해시
- `design/QA.md`: 검증 내역
- `design/v1/`, `design/v2/`: 이전 시안 보관

개발자: **Dohyun Kim** · **dohyun.kim@pillnote.app**
