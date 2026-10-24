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
  introNavigation: string;
  faqNavigation: string;
  release: string;
  releaseShort: string;
  storyLabel: string;
  chaptersLabel: string;
  intro: {
    title: string;
    audience: string;
    description: string;
    conditions: string;
    platform: string;
    features: string;
    scroll: string;
  };
  scenes: Record<SceneId, SceneText>;
  about: { label: string; title: string; description: string; contact: string };
  faqs: {
    question: string;
    answer: string;
    link?: { href: string; label: string };
  }[];
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
      "정기적으로 약을 챙기는 사람과 보호자를 위한 복약 관리 앱. 복용 일정과 기록, 약 관리, 알림과 보호자 연결을 실제 앱 화면으로 확인하세요.",
    skip: "주요 기능으로 이동",
    navigation: "웹 메뉴",
    language: "언어",
    menu: "사이트 메뉴",
    explore: "사용 과정",
    guide: "주요 기능",
    introNavigation: "소개",
    faqNavigation: "자주하는 질문",
    release: "다운로드",
    releaseShort: "다운로드",
    storyLabel: "PillNote 서비스 소개",
    chaptersLabel: "서비스 소개 목차",
    intro: {
      title: "복약 관리도 간편하게.",
      audience: "정기적으로 약을 챙기는 사람과 보호자를 위한 복약 관리 앱",
      description:
        "복용 일정과 기록을 한곳에서 관리하고, 필요한 경우 보호자와 연결하세요.",
      conditions:
        "보호자 연결은 이메일 로그인·초대 수락 후, 알림은 기기 등록·알림 설정과 동기화 후 이용해요.",
      platform: "Android APK · 로그인 없이 시작할 수 있어요",
      features: "기능 보기",
      scroll: "스크롤해서 만나보세요",
    },
    scenes: {
      today: {
        label: "오늘의 복용",
        title: "오늘 먹을 약을,\n시간순으로.",
        description:
          "지금 챙겨야 할 약과 복용 시간을 확인해 보세요. 오늘의 일정이 시간순으로 보여요.",
        detail: "아침부터 저녁까지, 오늘의 복용을 한눈에.",
      },
      add: {
        label: "약 등록",
        title: "약을 찾고,\n시간을 정하면 끝.",
        description:
          "약 이름으로 검색해 내 약을 등록해 보세요. 복용 시간과 기간을 정해 두면 매일의 일정에 반영돼요.",
        detail: "실제 의약품 검색 결과에서 내 약을 선택해요.",
      },
      record: {
        label: "복용 기록",
        title: "먹은 약은,\n체크 한 번으로.",
        description:
          "약을 먹었다면 체크해 주세요. 어떤 약을 언제 먹었는지 기록을 다시 확인할 수 있어요.",
        detail: "체크한 약은 오늘의 복용 기록으로.",
      },
      box: {
        label: "내 약 상자",
        title: "남은 수량까지,\n함께 관리해요.",
        description:
          "등록한 약을 한곳에서 관리해 보세요. 복용 시간과 남은 수량을 확인하고, 필요할 때 수정할 수 있어요.",
        detail: "복용 기록과 함께 줄어드는 남은 수량.",
      },
      alarm: {
        label: "복용 시간 알림",
        title: "약 먹을 시간,\n휴대폰이 알려줘요.",
        description:
          "약 먹을 시간이 되면 휴대폰으로 알려드려요. 알림을 받으려면 앱의 알림 권한과 기기 설정을 확인해 주세요.",
        detail: "알림 권한과 기기 설정이 필요한 복용 시간 알림.",
      },
      guardian: {
        label: "보호자 연결",
        title: "기록을 놓친 날엔,\n함께 확인해요.",
        description:
          "보호자와 복약 상태를 함께 확인할 수 있어요. 양쪽에서 로그인하고 보호자가 초대를 수락한 뒤, 기기 등록·알림·동기화를 설정해 주세요.",
        detail: "로그인·초대 수락·기기 등록·알림 설정 후 확인 알림.",
      },
      pharmacy: {
        label: "주변 약국",
        title: "가까운 약국도,\nPillNote에서.",
        description:
          "약국이 필요할 때 지도를 열어 보세요. 현재 위치나 직접 고른 지역에서 약국의 위치와 연락처를 확인할 수 있어요.",
        detail: "서울역 주변 약국 15곳의 위치와 연락처.",
      },
    },
    about: {
      label: "자주하는 질문",
      title: "자주하는 질문",
      description:
        "시작하기 전에 궁금한 점을 확인하세요. 더 궁금한 내용은 이메일로 문의해주세요.",
      contact: "이메일로 문의하기",
    },
    faqs: [
      {
        question: "로그인이 꼭 필요한가요?",
        answer:
          "약 등록, 복용 기록과 기기 알림은 로그인 없이 쓸 수 있어요. 기기 간 동기화와 보호자 연결에는 이메일 로그인이 필요해요.",
      },
      {
        question: "복용 알림이 오지 않아요.",
        answer:
          "앱의 ‘내 복용 시간 알림’과 기기 알림 권한을 확인해주세요. Android의 ‘알람 및 리마인더’ 권한이나 절전 설정 때문에 알림이 늦을 수 있어요. 앱을 주기적으로 열어 다음 예약 상태도 확인해주세요.",
      },
      {
        question: "보호자 알림은 실제 미복용을 의미하나요?",
        answer:
          "아니요. 동기화된 일정에 복용 기록이 없어 확인을 요청하는 알림이에요. 실제 복용 여부를 확정하지 않으며, 오프라인 기록은 동기화 후 반영돼요.",
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
      "A medication management app for people taking regular medication and their caregivers. Explore schedules, records, medications, reminders and caregiver connections through real app screens.",
    skip: "Skip to features",
    navigation: "Main navigation",
    language: "Language",
    menu: "Site menu",
    explore: "App tour",
    guide: "Features",
    introNavigation: "Overview",
    faqNavigation: "FAQ",
    release: "Download",
    releaseShort: "Download",
    storyLabel: "Explore PillNote",
    chaptersLabel: "PillNote features",
    intro: {
      title: "Medication made simple.",
      audience:
        "A medication management app for people taking regular medication and their caregivers",
      description:
        "Manage dose schedules and records in one place, and connect with a caregiver when needed.",
      conditions:
        "Caregiver connections require email sign-in and an accepted invitation; alerts also require device registration, notification settings and sync.",
      platform: "Android APK · Get started without signing in",
      features: "View features",
      scroll: "Scroll to explore",
    },
    scenes: {
      today: {
        label: "Today's doses",
        title: "Your day,\none dose at a time.",
        description:
          "Check which medication is due and when to take it. Today's schedule is listed in time order.",
        detail: "Today's doses, from morning to evening.",
      },
      add: {
        label: "Add medication",
        title: "Find your medication.\nSet your schedule.",
        description:
          "Search for your medication by name to add it. Set its dose times and dates to include it in your daily schedule.",
        detail: "Choose your medication from real catalogue results.",
      },
      record: {
        label: "Dose tracking",
        title: "Taken it?\nOne tap records it.",
        description:
          "After taking a dose, check it off. You can look back at which medication you took and when.",
        detail: "A simple check keeps your dose history up to date.",
      },
      box: {
        label: "Your medications",
        title: "Keep track of\nwhat's left.",
        description:
          "Keep your registered medications together. Check dose times and remaining supplies, and update them when needed.",
        detail: "Your remaining supply updates with each dose.",
      },
      alarm: {
        label: "Dose reminders",
        title: "Time for your dose.\nRight on your phone.",
        description:
          "Your phone can remind you when a dose is due. Check the app's notification permission and your device settings to receive reminders.",
        detail:
          "Dose reminders require notification permission and device settings.",
      },
      guardian: {
        label: "Caregiver connection",
        title: "A missed record.\nA shared check-in.",
        description:
          "Connect with a caregiver for medication check-ins. Both people need to sign in. After the caregiver accepts the invitation, set up device registration, notifications and sync.",
        detail:
          "Check-in alerts require sign-in, an accepted invitation, device registration and notification settings.",
      },
      pharmacy: {
        label: "Nearby pharmacies",
        title: "A pharmacy nearby.\nRight in PillNote.",
        description:
          "Open the map when you need a pharmacy. Use your current location or choose an area to find pharmacy locations and contact details.",
        detail: "Locations and contacts for 15 pharmacies near Seoul Station.",
      },
    },
    about: {
      label: "FAQ",
      title: "Frequently asked questions",
      description:
        "A few things to know before you start. For anything else, get in touch by email.",
      contact: "Contact us by email",
    },
    faqs: [
      {
        question: "Do I need to sign in?",
        answer:
          "Adding medication, recording doses and local reminders work without signing in. Email sign-in is needed for syncing across devices and connecting with a caregiver.",
      },
      {
        question: "Why am I not receiving dose reminders?",
        answer:
          "Check My dose reminders in the app and allow device notifications. Android's Alarms & reminders permission and battery-saving settings can affect delivery. Open the app periodically to check upcoming scheduled reminders.",
      },
      {
        question: "Does a caregiver alert mean a dose was missed?",
        answer:
          "No. It requests a check-in when a synced schedule has no dose record, not confirmation of a missed dose. Offline records are reflected after syncing.",
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
