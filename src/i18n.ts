import type { Scene, SceneId } from "./story.ts";

export type Locale = "ko" | "en";
type SceneText = Pick<Scene, "label" | "title" | "description" | "detail">;
type SiteCopy = {
  pageTitle: string;
  pageDescription: string;
  skip: string;
  navigation: string;
  language: string;
  menu: string;
  explore: string;
  guide: string;
  release: string;
  releaseShort: string;
  storyLabel: string;
  chaptersLabel: string;
  intro: { title: string; description: string; scroll: string };
  scenes: Record<SceneId, SceneText>;
  about: { title: string; features: string; release: string };
  faqs: { question: string; answer: string }[];
  developer: string;
  appScreen: string;
  appAnimation: string;
  notification: {
    example: string;
    guardianExample: string;
    doseExample: string;
    now: string;
    guardianTitle: string;
    doseTitle: string;
    guardianBody: string;
    doseBody: string;
    swipe: string;
  };
};

export const LANGUAGE_STORAGE_KEY = "pillnote-language";
export function resolveLocale(value: string | null): Locale {
  return value === "en" ? "en" : "ko";
}

export const translations: Record<Locale, SiteCopy> = {
  ko: {
    pageTitle: "PillNote — 복약 관리도 간편하게",
    pageDescription:
      "약 등록부터 복용 체크, 남은 수량과 보호자 연결까지. 실제 앱 화면으로 만나보는 PillNote.",
    skip: "이용 안내로 이동",
    navigation: "웹 메뉴",
    language: "언어",
    menu: "메뉴 열기",
    explore: "앱 소개",
    guide: "이용 안내",
    release: "다운로드",
    releaseShort: "다운로드",
    storyLabel: "PillNote 서비스 소개",
    chaptersLabel: "서비스 소개 목차",
    intro: {
      title: "복약 관리도 간편하게.",
      description: "오늘의 약과 복용 기록을 한곳에서.",
      scroll: "스크롤해서 만나보세요",
    },
    scenes: {
      today: {
        label: "오늘의 복용",
        title: "오늘 먹을 약을,\n시간순으로.",
        description:
          "아침부터 저녁까지 챙겨야 할 약.\n오늘의 일정과 복용 기록을 한눈에 확인해요.",
        detail: "아침부터 저녁까지, 오늘의 복용을 한눈에.",
      },
      add: {
        label: "약 등록",
        title: "약을 찾고,\n시간을 정하면 끝.",
        description:
          "타이레놀처럼 포장에 적힌 이름으로 찾고,\n검색 결과에서 골라 복용 시간을 정해요.",
        detail: "실제 의약품 검색 결과에서 내 약을 선택해요.",
      },
      record: {
        label: "복용 기록",
        title: "먹은 약은,\n체크 한 번으로.",
        description:
          "복용한 약을 체크하면 기록이 남아요.\n오늘 얼마나 챙겼는지도 바로 보여요.",
        detail: "체크한 약은 오늘의 복용 기록으로.",
      },
      box: {
        label: "내 약 상자",
        title: "남은 수량까지,\n함께 관리해요.",
        description:
          "복용을 기록하면 보유 수량도 줄어들어요.\n약과 일정을 수정하거나 보관할 수 있어요.",
        detail: "복용 기록과 함께 줄어드는 남은 수량.",
      },
      alarm: {
        label: "복용 시간 알림",
        title: "약 먹을 시간,\n휴대폰이 알려줘요.",
        description:
          "앱을 열어두지 않아도 정한 시간에 알림.\n기본 복용 알림은 로그인 없이 이용해요.",
        detail: "앱을 열어두지 않아도, 정한 시간에 도착하는 알림.",
      },
      guardian: {
        label: "보호자 연결",
        title: "기록을 놓친 날엔,\n함께 확인해요.",
        description:
          "연결한 보호자에게 복용 기록 확인을 요청해요.\n이메일 로그인과 초대 수락 후 이용할 수 있어요.",
        detail: "기록을 놓친 날, 연결한 보호자에게 확인 알림.",
      },
      pharmacy: {
        label: "주변 약국",
        title: "가까운 약국도,\nPillNote에서.",
        description:
          "약이 필요할 때, 내 주변 약국을 지도에서.\n앱에서 위치와 약국 정보를 함께 확인해요.",
        detail: "서울역 주변 약국 15곳의 위치와 연락처.",
      },
    },
    about: {
      title: "내 약을 챙기는 일,\nPillNote에서.",
      features: "복용 기록 · 약 관리 · 시간 알림 · 보호자 연결 · 주변 약국",
      release: "GitHub 릴리즈",
    },
    faqs: [
      {
        question: "어디서 앱을 다운로드할 수 있나요?",
        answer:
          "다운로드와 버전별 변경사항은 PillNote GitHub 릴리즈 페이지에서 안내합니다.",
      },
      {
        question: "로그인이 꼭 필요한가요?",
        answer:
          "약 등록, 복용 기록과 기본 복용 알림은 로그인 없이 이용할 수 있어요. 기기 간 동기화와 보호자 연결에는 이메일 로그인이 필요해요. 보호자 알림을 받으려면 초대 수락과 알림 설정도 필요해요.",
      },
      {
        question: "페이지에 보이는 화면은 실제 앱인가요?",
        answer:
          "앱 화면은 실제 PillNote 화면을 캡처했어요. 타이레놀 검색은 실제 의약품 목록과 식별 사진을 사용하고, 복용 일정과 수량은 소개용 예시예요. 휴대폰 알림은 앱과 서버의 알림 문구를 사용한 도착 예시예요. 보호자 연결은 소개용 계정으로 초대와 수락 과정을 재현했어요. 지도와 약국 목록은 서울역 주변 실제 검색 결과예요. 스크롤을 올리면 이전 과정으로 돌아갈 수 있어요.",
      },
    ],
    developer: "Developed by Dohyun Kim",
    appScreen: "PillNote 실제 앱 화면",
    appAnimation: "PillNote 실제 앱 화면 애니메이션",
    notification: {
      example: "휴대폰 알림 도착 예시",
      guardianExample: "보호자의 휴대폰에 도착한 복약 확인 알림 예시",
      doseExample: "복용 시간에 도착한 휴대폰 알림 예시",
      now: "지금",
      guardianTitle: "PillNote 복약 확인 알림",
      doseTitle: "PillNote 복용 시간 알림",
      guardianBody: "보호 중인 사용자의 복약 상태를 확인해주세요.",
      doseBody: "08:00 복용할 약이 1개 있어요. 오늘 일정을 확인해주세요.",
      swipe: "위로 쓸어올려서 열기",
    },
  },
  en: {
    pageTitle: "PillNote — Medication made simple",
    pageDescription:
      "Add medications, track doses, manage your supply and connect with a caregiver. Explore PillNote through real app screens.",
    skip: "Skip to information",
    navigation: "Main navigation",
    language: "Language",
    menu: "Open menu",
    explore: "Explore",
    guide: "FAQ",
    release: "Download",
    releaseShort: "Download",
    storyLabel: "Explore PillNote",
    chaptersLabel: "PillNote features",
    intro: {
      title: "Medication made simple.",
      description: "Today's medications and dose records, together.",
      scroll: "Scroll to explore",
    },
    scenes: {
      today: {
        label: "Today's doses",
        title: "Your day,\none dose at a time.",
        description:
          "From morning to evening,\nyour schedule and dose records at a glance.",
        detail: "Today's doses, from morning to evening.",
      },
      add: {
        label: "Add medication",
        title: "Find your medication.\nSet your schedule.",
        description:
          "Search the name on the packaging, like Tylenol.\nSelect your medication and set a dose time.",
        detail: "Choose your medication from real catalogue results.",
      },
      record: {
        label: "Dose tracking",
        title: "Taken it?\nOne tap records it.",
        description:
          "Check off a dose to keep a record.\nSee what you've taken today.",
        detail: "A simple check keeps your dose history up to date.",
      },
      box: {
        label: "Your medications",
        title: "Keep track of\nwhat's left.",
        description:
          "Your supply updates with each recorded dose.\nEdit your medications and schedules, or archive them.",
        detail: "Your remaining supply updates with each dose.",
      },
      alarm: {
        label: "Dose reminders",
        title: "Time for your dose.\nRight on your phone.",
        description:
          "Reminders arrive at your chosen times.\nBasic dose reminders work without signing in.",
        detail: "Reminders on time, even when the app is closed.",
      },
      guardian: {
        label: "Caregiver connection",
        title: "A missed record.\nA shared check-in.",
        description:
          "Ask a connected caregiver to check your dose record.\nAvailable after email sign-in and an accepted invitation.",
        detail: "A missing dose record can prompt a caregiver check-in.",
      },
      pharmacy: {
        label: "Nearby pharmacies",
        title: "A pharmacy nearby.\nRight in PillNote.",
        description:
          "Find nearby pharmacies on the map.\nSee their locations and contact details together.",
        detail: "Locations and contacts for 15 pharmacies near Seoul Station.",
      },
    },
    about: {
      title: "Your medication routine,\nwith PillNote.",
      features:
        "Dose tracking · Medication management · Reminders · Caregivers · Nearby pharmacies",
      release: "GitHub releases",
    },
    faqs: [
      {
        question: "Where can I download PillNote?",
        answer:
          "Visit the PillNote GitHub releases page for downloads and version notes.",
      },
      {
        question: "Do I need to sign in?",
        answer:
          "You can add medications, record doses and receive basic reminders without signing in. Syncing across devices and connecting with a caregiver require email sign-in. Caregiver notifications also require an accepted invitation and enabled notifications.",
      },
      {
        question: "Are these real app screens?",
        answer:
          "The screens are captured from the actual PillNote app. Tylenol search uses real catalogue results and identification photos; schedules and stock are presentation examples. Phone notifications demonstrate the app and server's notification messages. Caregiver invitations and acceptance use demo accounts. The map and pharmacy list show real search results around Seoul Station. Scroll up to retrace the experience. The app screenshots currently show the Korean interface.",
      },
    ],
    developer: "Developed by Dohyun Kim",
    appScreen: "Real PillNote app screen",
    appAnimation: "Real PillNote app animation",
    notification: {
      example: "Phone notification example",
      guardianExample: "Dose check-in notification on a caregiver's phone",
      doseExample: "Scheduled dose reminder on a phone",
      now: "now",
      guardianTitle: "PillNote dose check-in",
      doseTitle: "PillNote dose reminder",
      guardianBody:
        "Please check the medication status of the person you care for.",
      doseBody: "1 medication is scheduled for 08:00. Check today's schedule.",
      swipe: "Swipe up to open",
    },
  },
};
