# PillNote 실제 앱 화면 캡처

## 2026-10-14: 보호자 초대 입력 힌트

실제 앱의 보호자 초대 이메일 힌트를 `example@example.com`, 이름 힌트를 `예: 홍길동`으로 지정했다. 힌트는 연한 회색 `#92949E`이며 입력한 텍스트는 기존 진한 색을 유지한다. floatingLabelBehavior.always로 입력 전에도 라벨과 힌트를 함께 표시한다. `capture_pushalarm.dart`에 같은 수정을 반영하고, 팝업 열기·포커스·이메일/이름 입력·팝업 닫기의 실제 Flutter 프레임을 다시 촬영했다. main 캡처 테스트 1개(00:47), showcase 캡처 테스트 1개(00:40) 통과. showcase는 두 힌트의 존재, 색상, floating label 설정을 검증한다. 임시 복사한 테스트 5개는 보관본과 바이트 일치를 확인한 뒤 제거했다. 이메일 입력 전 400ms 대기는 웹 재생 시계에서 그대로 유지한다.

## 2026-10-13: 약 정보 상세 캡처

기존 공개 API의 `/v1/drugs/202106092` 상세 응답을 `tylenol-detail.json`에 보존했다. `website_drug_info_test.dart`는 이 응답과 기존 식약처 제품 사진을 사용해 실제 Pillinfo 화면을 렌더한다. canSelect=false인 상세 조회 화면이며 약효·복용법·주의사항 문구를 만들거나 변경하지 않았다. 운영 API 연결은 MockClient로 격리했다. 캡처 테스트 1개 통과. `drug-info.png`(780×1688)와 PNG manifest·날짜 메타데이터를 추가했다.

재현: 이 테스트와 `native_capture_support.dart`를 앱 test 폴더에 임시 복사하고 `flutter test test/website_drug_info_test.dart --no-pub`를 실행한다. 앱의 기존 helpers를 사용한다. 테스트 후 복사한 두 파일만 제거한다. 현재 제품 요약 순환은 drug-info → home-taken → dose-notification(웹 예시) → pharmacy-list이다. 아래는 이전 기록이다.

## 2026-10-13: 약 상세 화면의 작은 상단 바

사용자 요청에 따라 앱 `lib/screen/management/pilmanagement.dart`의 ‘내 약’ 상세에 `compactHeading: true`를 적용했다. 제목은 18pt 고정이며 기존 뒤로가기 버튼을 유지한다. `stock-taken.png`와 `box-taken--stock-taken` 전환을 실제 Flutter로 다시 촬영했다. 캡처 테스트 2개(00:53), 기존 상단 제목·복약 UI 테스트 13개 통과. 24개 클립·984개 샘플·609개 WebP와 PNG/WebP 해시를 갱신했다. 아래는 이전 기록이다.

## 2026-10-13: 내 약 상자 compactHeading 반영

앱의 `lib/screen/pages/pill.dart`에 추가된 `compactHeading: true`를 실제 Flutter 렌더로 반영했다. 내 약 상자의 제목·상단 간격이 줄어든 정지 화면과 출입 전환 프레임을 함께 갱신했다. main/showcase 캡처 테스트 2개 통과(01:10). 임시 테스트 파일은 제거하고 앱의 사용자 수정은 유지했다. 현재 24개 클립·984개 샘플, 609개 무손실 WebP(36.06MiB)이며 PNG manifest와 WebP SHA-256 목록을 갱신했다. 아래는 이전 기록이다.

## 2026-10-13 (v16): 중간 깜빡임과 복용 카드 수정

NativeRaster는 캔버스를 유지하고 최신 요청만 반영한다. 디코딩 완료 후 이미지와 날짜를 같은 React commit에서 표시하고 useLayoutEffect로 paint 전에 그린다. 다른 클립의 캔버스는 새 클립을 덮지 않는다. 양 끝의 PNG와 가까운 샘플을 미리 디코딩하며 캐시는 24개로 제한한다. 새로고침이나 크기 변경 시 최초 스크롤 상태도 paint 전에 결정한다.

복용 카드는 위쪽 위치와 ‘다음으로 확인할 복용’ 라벨을 고정했다. 실제 캡처의 글자와 목록을 분리하고 카드 높이 172→144, 진행 막대와 완료 수를 같은 곡선으로 이동한다. 기존 화면 전체 페이드·이동과 진행 막대의 2.6px 어긋남을 제거했다. 체크 반응은 7%의 작은 탄성으로 줄였다. `home-taken--home-complete` 스크롤은 제거하고 실제 `home-taken--box-taken` 탭을 캡처했다.

보호자 이름은 ‘홍길동’만 입력한다. 초대 팝업은 누름 이후 열기가 끝나도록 480ms 촬영하고, 입력이 끝나도 필드의 포커스를 유지한다. 팝업 열기·입력·약 상자 이동의 마지막 중간 프레임과 완료 PNG는 RGB 픽셀이 정확히 일치한다. Flutter 두 캡처 테스트 `00:53 +2: All tests passed!`. 최신 결과는 24개 클립·984개 샘플, 무손실 WebP 605개(35.95MiB)다. 기존 RGB 해시가 있으면 재사용하며 새 파일은 무손실 method=4로 저장한다.

아래 기록은 이전 버전이다.

## 2026-10-13: 실제 타이레놀 검색·등록과 보호자 이름

[PillNote 공개 의약품 검색](https://pillnote.kimrasng.kr/v1/drugs/search?name=%ED%83%80%EC%9D%B4%EB%A0%88%EB%86%80&limit=5)의 응답을 `tylenol-search.json`에 그대로 보존했다. 제품 4개와 제조사·품목코드·식별 사진을 사용한다. 선택 제품은 타이레놀정500밀리그람(아세트아미노펜), 품목코드 202106092, 켄뷰코리아판매유한회사이며 [식약처 원본](https://nedrug.mfds.go.kr/pbp/CCBBB01/getItemDetail?itemSeq=202106092)과 대조했다. `catalogue-images/`는 이 응답이 가리키는 식약처 이미지의 원본이다. 캡처에서는 NetworkImage 캐시에 해당 원본만 로드하고 실제 Pillsearch 결과 onTap → MedicationForm → 시간 추가·확인 → 등록하기 → 완료 → 약 상자 → 홈 경로를 수행한다. 제품명·코드와 실제 저장된 시간을 검사한다. 복용 시간 08:00·1정·보유 14정은 소개용 입력이다. 보유 수량은 캡처 저장소에만 설정하며 복용 처리 후 13정임을 검증한다. 방문자 웹에서 API를 호출하거나 약을 등록하지는 않는다.

보호자 이름은 ‘홍길동 · 아들’로 입력·대기·연결 화면을 재촬영했다. 실제 사람에게 초대를 보내지 않는다. 복용 완료 목록을 실제 CustomScrollView로 스크롤하고, 보호자 화면에서 약국 화면으로 넘어가는 iOS 라우트도 촬영했다. 25개 클립·1037개 샘플을 무손실 WebP 648개로 중복 제거했다. 복용 체크에만 웹의 `DoseCheckFeedback`을 덧붙여 체크 표시 → 진행 막대 → 목록 이동 순서로 반응한다. 완료 항목은 실제 캡처 스크롤로 보여준다. `encode_native.py`는 긴 복용 애니메이션에서도 누르기 거리 0.165화면을 유지한다.

잠금 화면은 웹 예시다. 아래쪽 알림 카드와 잠금 해제 후 앱 창 확장, 시계·잠금 아이콘·시스템 바와 화면 전원 전환을 스크롤 위치로 계산한다. 복용 알림은 홈을, 보호자 알림은 보호자 연결을 연다. 보호자 알림에서 약국으로 바로 열리던 경로는 제거했다. 날짜 오버레이는 목록을 스크롤할 때 고정 헤더 뒤로 가려진다.

Flutter main 캡처 `00:19 +1: All tests passed!`, showcase 캡처 `00:46 +1: All tests passed!`. 아래 기록은 이전 버전이다.

## 2026-10-12: 터치에 별도 스크롤 거리 추가

토스 웹을 작은 간격으로 직접 스크롤하며 비교한 뒤, 캡처의 각 터치에 0.22화면을 추가했다. `src/story.ts`에서 클릭 수에 따라 동작 종료 지점·duration을 이동하고, `src/native.ts`는 늘어난 접촉 구간 뒤에 원래 캡처 시계를 이어 붙인다. 52%는 누르기, 48%는 손을 떼는 잔물결이다. 추가 거리는 클릭에만 배분하므로 이후 Flutter 프레임·입력 글자 사이의 거리는 유지된다. 보호자 입력의 두 터치도 독립적으로 적용한다. 캡처 이미지·원본 pointer-down/up·focusStages 메타데이터는 보존한다.

## 2026-10-12: 클릭 표시와 다음 동작의 순서

`src/native.ts`는 캡처의 pointer-up 인덱스를 기준으로 클릭 표시를 먼저 마친 뒤 이후 네이티브 프레임을 재생한다. 잔물결이 사라지는 동안 마지막 pointer-down 프레임을 유지하며, 보호자 입력 클립의 두 클릭에도 각각 적용한다. 단일 클릭의 화면 전환 이후 Flutter 프레임 간 간격은 기존과 같다. 터치가 포함되지 않은 스크롤·입력·자동 페이지 전환은 원래 시계를 유지한다. 원본 캡처·메타데이터는 그대로 보존했다.

## 2026-10-12: 작은 스크롤 단계의 최종 모션 점검

기본 캡처를 640ms로 늘려 64ms의 누름 이후 500ms iOS 라우트 전환을 끝까지 기록했다. 완료 화면을 저장하기 전에 모든 보이는 PageRoute의 primary/secondary animation이 끝났는지 검증한다. 주요 7개 push/pop 경로는 마지막 중간 프레임과 완료 화면의 전체 RGB 픽셀이 정확히 일치한다. 보호자 수신 화면의 `ensureVisible`과 뒤따른 덮어쓰기를 제거해 146px의 순간 스크롤을 없앴다. 수락 버튼은 원래 y=687에 유지되며 안전 영역 안에 있음을 테스트한다. 검색창은 결과 표시 후에도 포커스를 유지하고, 다음 결과를 눌러 화면을 열 때 자연스럽게 포커스가 이동한다.

Flutter 전체 캡처 테스트 `01:31 +2: All tests passed!`, 검색 포커스 수정 후 main 재캡처 `00:52 +1: All tests passed!`. 임시 Dart 파일 5개는 보관본과 바이트 일치 확인 후 제거했으며 앱 저장소의 `git status --short`는 비어 있다.

최신 산출물은 22개 클립·882개 샘플, 중복 제거한 무손실 WebP 535개(25,897,430 bytes, 24.70MiB), 기본 PNG 30개(4,382,857 bytes, 4.18MiB)다. `native-sha256.txt`는 현재 WebP 전체, `manifest.json`은 현재 PNG 전체의 SHA-256과 크기를 기록한다. 아래는 이전 캡처 기록이다.

## 2026-10-12: Flutter 엔진의 실제 애니메이션

`website_motion_test.dart`와 `website_showcase_motion_test.dart`는 앱의 실제 위젯을 동일한 ThemeData(platform iOS, VisualDensity.standard)로 렌더링한다. MaterialPageRoute의 Cupertino 전환, NavigationBar, 포커스, 버튼의 pointer-down/up과 잉크 효과, showTimePicker, 보호자 AlertDialog·입력·수락, CustomScrollView와 약국 상세 바텀시트를 16ms 간격으로 캡처했다. 앱과 실제 계정은 수정하지 않는다. 약·계정·API는 소개용 격리 데이터다.

22개 클립의 752개 샘플을 `encode_native.py`로 무손실 WebP 491개(23.54MiB)로 변환하고 중복을 제거했다. 스크롤은 Flutter의 중간 프레임을 직접 선택한다. 누르는 구간은 전환 거리의 앞 30%에 두며, pointer-up 이후 엔진 프레임은 선형 간격을 유지해 Flutter 곡선을 보존한다. 프레임 전체를 다시 페이드하거나 이동하지 않는다. Canvas에 가까운 프레임을 미리 디코딩하고 캐시는 16개로 제한한다. 자동 재생이나 사용자 앱 조작은 없다. 잠금 화면 알림은 기존 웹 예시를 유지한다.

모든 버튼과 필드의 접점은 `tester.getCenter`로 읽고 실제 pointer-down/up 프레임 번호와 함께 기록한다. 웹 터치 표시도 동일한 스크롤 좌표에서 수축·잔물결·페이드를 계산한다. 보호자 입력은 필드별로 포커스 후 320ms를 먼저 렌더한다. 빈 controller와 완전히 올라간 라벨의 위치를 검증한 다음 한 글자씩 입력한다. `focusStages`에 빈 포커스 완료 프레임과 첫 글자 프레임을 기록했다. 보호자 화면 앞에는 실제 홈→설정→보호자 연결 경로를 추가했다. 계정 저장소는 in-memory와 mocked FlutterSecureStorage이며 production 계정/앱 소스는 바꾸지 않는다.

동적인 날짜 Text를 제외한 모든 픽셀은 Flutter 렌더다. 날짜의 실제 RenderParagraph 위치·크기·스타일·조상 opacity·scale을 프레임별로 보존한다. 페이지에 가려지는 부분은 잘라내고 팝업 barrier에 맞춰 색을 어둡게 한다. Snackbar는 매 프레임 캡처 전에 제거한다.

재현: 이 디렉터리의 `website_motion_test.dart`, `website_showcase_motion_test.dart`, `native_capture_support.dart`, `capture_pushalarm.dart`, `capture_distanc.dart`를 PillNote의 test 폴더에 임시 복사한다. `flutter test test/website_motion_test.dart test/website_showcase_motion_test.dart --no-pub --concurrency=1` 실행 후 웹 프로젝트에서 Pillow가 설치된 Python으로 `design/capture/encode_native.py`를 실행한다. 캡처 경로는 스크립트에 명시되어 있다. 테스트 후 복사한 파일만 제거한다. 이전 촬영 기록은 아래에 보존한다.


## 2026-10-12: 입력 전후 모바일 밀도 통일

`website_search_test.dart`에서 검색 전·포커스·검색 결과를 같은 모바일 ThemeData(platform Android, VisualDensity.standard)로 촬영했다. 이전 캡처의 기본 밀도와 추가 촬영의 데스크톱 compact 밀도가 섞여 검색 아이콘이8px, 입력 이후 콘텐츠가8px 이동하던 문제를 제거했다. 입력창 전체 경계는(24,161,342,72), 실제 EditableText는(76,193,290,24)다. 글꼴은 Pretendard16px/400, line-height1.5, letter-spacing0.5다. 검색창과 안내 영역의 경계가 포커스 전후 동일함을 Flutter 테스트에서 검증했다. 입력란 밖의 이미지 픽셀 차이도0이다. 라벨의 포커스 변경과 커서·입력만 달라진다.

Flutter 테스트: `00:01 +1: All tests passed!`. 임시 파일은 앱 저장소에서 제거했다. 재현은 이 파일과 `website_capture_test.dart`를 앱 test폴더에 복사해 `flutter test test/website_search_test.dart --no-pub`로 실행한다. `website_showcase_test.dart`는 보호자·약국만 촬영하며 검색 캡처를 덮어쓰지 않는다. 아래는 이전 기록이다.

## 2026-10-12: 자연스러운 검색 입력과 팝업 배경 수정

`search-focused`, `search-typed`, `guardian-base`를 실제 앱에서 추가 촬영했다. 총 27개 PNG는 780×1688이다. 입력창의 실제 EditableText 좌표는 (68,189,298,24), 글꼴은 Pretendard 16px/400, line-height 1.5, letter-spacing 0.5다. 실제 포커스 상태의 라벨·검색 아이콘·밑줄은 캡처 그대로 사용하고 글자와 커서만 이 영역에 표시한다. 한글 IME 순서 ㅂ→비→빝→비타→비탐→비타미→비타민으로 조합하고, 입력이 끝난 뒤 결과를 표시한다. 조합은 스크롤 위치로만 계산되며 역스크롤로 되돌릴 수 있다. 웹 폰트에는 필요한 자모·음절을 추가했다.

보호자 초대 전 페이지를 추가해 팝업 열기와 닫기를 실제 배경과 분리했다. 팝업 영역은 x55~335, y279~585이며 모서리 반경은 28이다. 배경과 dim은 움직이지 않고 전체 화면을 채운다. 기기 개구부와 캡처의 작은 비율 차이는 같은 화면의 고정 배경으로 채워 흰 여백을 없앴다. 잠금/해제에서도 전체 화면을 작게 축소해 가장자리가 드러나는 동작을 제거했다.

모든 페이지 전환은 화면 높이 0.55, 창 열기/닫기는 0.42, 업데이트는 0.32, 터치는 0.35로 통일했다. 검색 입력은 1.4, 약국 목록 이동은 0.7이다. 장면 출구의 전환도 0.55로 일정하다. `src/pacing.ts`에서 조정한다. 최신 Flutter showcase 테스트는 `00:12 +1: All tests passed!`였으며 앱 저장소에 복사한 임시 파일은 제거했다. 다음은 이전 기록이다.

## 2026-10-12: 앱 내부 동작과 기존 기기 목업

내 약 상자에서 약 추가를 누르기 전 `box-start`, 검색 입력 전 `search-empty`, 실제 Material 시간 선택 창 `time-picker`를 추가 캡처했다. 실제 앱 테스트에서 약 추가 중심 (195,696), 시간 확인 중심 (318,642)을 읽었다. 시간 선택 창의 경계는 x=16, y=174, width=358, height=516이다. 실제 캡처 테스트는 `00:13 +1: All tests passed!`였고 임시 앱 테스트 파일은 제거했다. 전체 캡처 24개는 780×1688이다.

소개는 스크롤 좌표에 따라 실제 캡처를 이동/부분 합성한다. 검색은 캡처의 입력 영역에서 비→비타→비타민을 표시하고 결과를 나타낸다. 페이지 push/pop, 시간 선택 창 열기/닫기, 복용 체크, 알림 카드 도착/열기, 약국 목록의 315px 이동과 상세 시트의 317px 상승을 각각 구분한다. 휴대폰/시스템 바는 같은 위치에 유지한다. 스크롤을 올리면 모든 포즈와 입력 표시가 복원되며 시간 기반 자동 재생은 없다. 복용 후 약 상자는 처음부터 13정 상태를 유지한다.

기기 외곽은 [Hoverify의 기존 iPhone 18 Pro Silver WebP](https://tryhoverify.com/tools/device-frames/iphone-18-pro/)를 그대로 사용한다. 웹 사용 라이선스와 1332×2748 프레임/1206×2622 화면 개구부 좌표는 `design/device/README.md`에 기록했다. CSS로 만들었던 기기 몸체/버튼/아일랜드는 제거했다. 앱 캡처를 390/844 비율 그대로 실제 프레임의 개구부에 가운데 정렬하며 늘이지 않는다.

휠/트랙패드는 도입부와 앱 구간 모두1:1로 반영하고45ms 감속 시정수로 처리한다. 큰 입력은0.85화면, 누적 목표는1.2화면까지 허용한다. 입력 방향을 바꾸면 진행 중 목표를 즉시 리셋한다. 포인터·키보드 조작, 창 크기 변경은 대기 스크롤을 취소한다. 터치/키보드·동작 감소 설정에서는 네이티브 스크롤을 유지한다. 아래는 이전 캡처와 기능 자료다.

## 현재 소개 화면의 날짜·알림·연결·약국

2026-10-12 추가 캡처에서는 현재 SnackBar를 제거하고 실제 화면을 렌더링했다. 이미지의 날짜 Text만 캡처 중 투명하게 처리하고 실제 RenderParagraph의 좌표·크기·스타일을 `src/capture-dates.json`에 추출했다. 웹은 같은 Pretendard 글꼴로 방문자 기기의 현재 날짜를 표시한다. 달력은 오늘을 가운데에 두고 앞뒤 날짜와 요일을 계산한다. 복용 시작일과 다음 예약 알림도 현재 날짜/시간에 맞춘다. 자정과 창 재활성화 시 갱신된다. 앱 화면의 나머지 부분은 실제 Flutter 캡처 그대로다. 날짜/알림용 글꼴은 원본을 서브셋한 26KB WOFF2이고 라이선스를 `public/fonts/LICENSE-Pretendard.txt`에 보존했다.

`website_showcase_test.dart`는 실제 보호자 페이지의 초대 입력 → 요청 → 대기 → 다른 계정의 수락 요청 → 연결 완료를 수행했다. 계정과 네트워크는 in-memory SessionStore/MockClient로 격리되어 실제 사람에게 초대·메일·푸시를 보내지 않았다. `capture_pushalarm.dart`는 원본 페이지에 API/session/push 서비스 주입만 추가한 캡처용 사본이다. 기기 등록도 실제 PushNotificationService와 가짜 gateway로 검증했다. 테스트가 요청 및 accepted 상태 변경을 확인했다. 앱 production source는 변경하지 않았다.

웹의 잠금 화면은 휴대폰 알림 도착 예시다. 앱 위젯 캡처와 구분한다. 복용 알림의 제목/본문은 앱 `lib/domain/dose_reminder_plan.dart`, 보호자 알림은 백엔드 `src/push.js`의 실제 문자열이다. 보호자 알림에 약 이름/사용자 이메일/확정적인 미복용 판단을 넣지 않는다. 08:00/08:30은 소개 시나리오이고 날짜는 오늘이다. 도착·탭·다음 화면은 스크롤 좌표로만 전환된다.

서울역 좌표 37.5547, 126.9706에서 [PillNote 공개 약국 API](https://pillnote.kimrasng.kr/v1/pharmacies/search?lat=37.5547&lng=126.9706&radius=700&limit=20)를 2026-10-12에 조회했다. 실제 응답 15곳을 `seoul-station-pharmacies.json`에 보존했다. 백엔드 공급자는 건강보험심사평가원 약국정보서비스다. 센츄럴팜약국의 이름/전화는 [동국제약 목록](https://dkbrand.co.kr/cs/pharmacy.php?brand=pansidil&page=565&stext=&stype=all)에서도 확인했다. 주소는 서울특별시 중구 한강대로 405, 2층 (봉래동2가), 전화는 02-393-5505다. 운영시간이나 영업 중 여부는 만들지 않았다. `capture_distanc.dart`는 원본 페이지에 API 주입과 서울역 초기 중심을 적용한 사본이다. 지도를 움직이지 않고 목록을 스크롤한 뒤 첫 약국의 실제 상세를 열었다. OSM 정상 공개 타일을 한 화면용으로 읽고 캐시를 재사용했다.

추가 PNG는 guardian-invite/pending/received/linked, pharmacy-station/list/detail이다. 최종 showcase 테스트는 `00:09 +1: All tests passed!`였다. 재현 시 기존 capture 파일과 showcase, capture_pushalarm, capture_distanc Dart 파일을 앱 test 폴더로 복사해 실행하고 임시 파일을 제거한다. 기존 파일이나 production source를 덮어쓰지 않는다. 아래는 최초 캡처 기록이다.

2026-10-12, `/Users/kimrasng/dev/pillnote`의 Flutter 앱 위젯을 직접 렌더링했다. 웹에서 재구현한 앱 UI나 생성 이미지는 사용하지 않았다. 앱의 `MyApp` 테마, Pretendard 글꼴, MaterialIcons, 실제 SVG 탐색 아이콘과 실제 페이지 코드를 사용했다.

모든 PNG는 780 × 1688 픽셀이다. 논리 화면은 390 × 844이며 렌더링 배율은 2다. 전체 화면 비율을 고정하고 이미지에 세로/가로 크롭이나 늘이기를 적용하지 않는다. 맨 위 54 논리 픽셀과 맨 아래 34 논리 픽셀은 시스템 SafeArea다. 웹 휴대폰 껍데기의 상태바와 홈 인디케이터는 이 영역에 겹쳐야 한다. 별도의 세로 공간을 더하면 앱 화면 비율이 어긋난다.

## 캡처 화면

| PNG | 실제 Flutter 화면과 캡처 상태 |
| --- | --- |
| home-start.png | `MyApp` → `Main` → `Home`: 아침 처방약과 저녁 처방약 두 개 |
| home.png | `Home`: 비타민 D가 추가된 세 개의 복용 일정, 0/3회 완료 |
| home-taken.png | `Home`: 실제 복용 체크 처리 후 1/3회 완료 |
| box.png | `Main` → `Pill`: 아침 처방약의 남은 수량 14정 |
| box-taken.png | `Pill`: 실제 복용 기록에 따른 남은 수량 13정 |
| stock.png | `Pilmanagement`: 아침 처방약 상세, 14정 남았어요 |
| stock-taken.png | `Pilmanagement`: 아침 처방약 상세, 13정 남았어요 |
| search.png | `Pillsearch`: in-memory 검색 결과 예시 |
| schedule.png | `MedicationForm`: 비타민 D, 13:00, 한 번에 1정 |
| registered.png | `MedicationForm`: 실제 등록 처리 후 등록 완료 |
| reminders.png | `DoseReminders`: 실제 알림 설정 위젯, 가짜 기기 알림 예약 서비스 |
| guardian.png | `Menu`: 실제 로그아웃 상태의 보호자 연결 안내 |
| pharmacy-map.png | `Distanc`: 서울 시청 중심의 실제 OpenStreetMap 지도 |
| pharmacy.png | `Distanc`: 동일 지도, 원래 앱의 저작자 표시 버튼을 연 상태 |

약 데이터는 소개용 예시다. 아침 처방약은 08:00/14정, 저녁 처방약은 20:00/14정, 비타민 D는 13:00/30정으로 설정했다. 실제 앱의 복용 처리 함수를 통해 아침 처방약이 14→13정으로 감소했고, 취소하면 14정으로 돌아오는 것을 캡처 테스트에서 확인했다. 의학적 권장 복용량을 뜻하지 않는다.

검색은 실제 `Pillsearch` 위젯에 `ApiClient(MockClient)`로 격리된 결과를 주입했다. 결과에는 '소개용 예시'라는 제조사 표시를 넣었다. 실제 의약품 API나 계정 API를 호출하지 않았다. 보호자 로그인이나 초대/연결/메일/푸시를 수행하지 않았다. 보호자 캡처는 연결 완료 상태가 아니라 실제 설정 페이지의 '로그인 후 보호자를 연결할 수 있어요.' 설명이다. 알림 서비스는 기존 테스트용 `FakeDoseReminderGateway`를 사용하여 실제 기기 알림이나 권한 요청 없이 표시했다.

지도는 실제 `Distanc` 위젯의 TileLayer를 사용했다. 서울 시청 공공 좌표(37.5665, 126.9780), zoom 14, 한 번의 고정 화면에 필요한 정상 공개 타일 요청만 수행했다. 사용자 위치, 약국 API 조회, 자동 지도 이동/확대, 오프라인 다운로드는 수행하지 않았다. 요청은 앱의 User-Agent와 표준 HTTP 캐싱 동작을 사용했고 격리된 캐시는 `/private/tmp/pillnote-website-capture-map/fm_cache`에 남겨 재캡처 시 재사용할 수 있다. 웹은 팝업 없는 `pharmacy-map.png`를 사용하며 지도 장면의 소개 문구 아래에 [© OpenStreetMap contributors](https://www.openstreetmap.org/copyright)를 항상 표시한다. 앱 자체의 저작자 표시를 연 `pharmacy.png`도 보존했다.

## 애니메이션 좌표

다음 좌표는 390 × 844 논리 화면 기준이다. 휴대폰 표시 너비에 비례해 전체 이미지와 함께 균등 배율로 변환한다.

| 표시할 동작 | 중심 x, y | 실제 요소 경계 x, y, width, height |
| --- | --- | --- |
| 홈의 아침 복용 체크 | 342, 604.22 | 318, 580.22, 48, 48 |
| 약 상자의 첫 남은 수량 | 143.64, 372.5 | 110, 363, 67.28, 19 |
| 상세 화면의 남은 수량 | 101.60, 524.5 | 44, 510, 115.20, 29 |
| 검색 입력창 | 195, 197 | 24, 161, 342, 72 |
| 비타민 D 검색 결과 | 219, 286.05 | 112, 274.05, 214, 24 |
| 일정의 13:00 시간 | 59.25, 443 | 41, 433, 36.49, 20 |
| 등록하기 글자 | 195, 767 | 167.34, 757.5, 55.31, 19 |
| 알림 스위치 | 336, 289 | 306, 269, 60, 40 |
| 설정의 보호자 연결 | 197, 641.13 | 64, 629.13, 266, 24 |

## 재현 및 검증

캡처 소스는 `website_capture_test.dart`에 보존했다. 임시 테스트는 캡처 후 앱 저장소에서 제거했다. 앱의 production source는 변경하지 않았다. 재캡처하려면 이 파일을 앱의 `test/website_capture_test.dart`로 복사한 뒤 다음 명령을 실행하고 임시 파일을 제거한다. 경로 상수는 현재 로컬 저장소 위치를 가리킨다.

```sh
/Users/kimrasng/flutter/bin/flutter test test/website_capture_test.dart --no-pub --reporter expanded
```

최종 실행: `00:12 +1: All tests passed!` 실제 화면을 직접 확인했고 모든 PNG 크기를 확인했다. SHA-256 및 이미지 크기는 `manifest.json`에 기록했다. 지도 데이터/타일은 [OpenStreetMap](https://www.openstreetmap.org/copyright)의 기여자 자료이며 [공개 타일 정책](https://operations.osmfoundation.org/policies/tiles/)에 따른 한 화면 캡처였다.
