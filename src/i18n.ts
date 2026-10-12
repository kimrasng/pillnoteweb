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
  about: { title: string; features: string; release: string };
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
    skip: "제품 요약으로 이동",
    navigation: "웹 메뉴",
    language: "언어",
    menu: "메뉴 열기",
    explore: "앱 소개",
    guide: "제품 요약",
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
      platform: "Android APK · GitHub Releases 배포",
      features: "기능 보기",
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
        detail: "알림 권한과 기기 설정이 필요한 복용 시간 알림.",
      },
      guardian: {
        label: "보호자 연결",
        title: "기록을 놓친 날엔,\n함께 확인해요.",
        description:
          "연결한 보호자에게 복약 상태 확인을 요청해요.\n로그인·초대 수락·기기 등록·알림 설정이 필요해요.",
        detail: "로그인·초대 수락·기기 등록·알림 설정 후 확인 알림.",
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
          "현재 공개 배포는 Android APK 직접 설치 방식입니다. 최신 GitHub 릴리즈의 Assets에서 .apk 파일을 받을 수 있어요. GitHub 계정은 필요하지 않아요. 설치 과정은 다운로드 안내에서 확인하세요.",
        link: { href: "#download", label: "APK 설치 안내 보기" },
      },
      {
        question: "로그인이 꼭 필요한가요?",
        answer:
          "약 등록·관리, 복용 일정·기록과 기기 복용 알림은 로그인 없이 이용할 수 있어요. 약 검색과 약국 조회에는 인터넷 연결이 필요해요. 기기 간 동기화에는 이메일 로그인이 필요하며, 보호자 연결에는 본인과 보호자 양쪽의 로그인과 초대 수락이 필요해요. 보호자 알림에는 연결 활성화·보호자 기기 등록 및 알림 허용·본인의 보호자 알림 설정·동기화도 필요해요.",
      },
      {
        question: "복용 시간 알림이 오려면 무엇이 필요한가요?",
        answer:
          "복용 시간·기간을 저장하고 설정 → 내 복용 시간 알림을 켠 뒤 기기 알림 권한을 허용해주세요. Android의 알람 및 리마인더 권한이 없으면 일반 예약으로 동작해 알림이 늦을 수 있어요. 절전·강제 중지 등 기기 설정도 영향을 줍니다. 예약 가능한 일정 수와 기간에는 한도가 있어 앱을 주기적으로 열어 다음 예약 상태를 확인해주세요.",
      },
      {
        question: "보호자 알림은 실제 미복용을 의미하나요?",
        answer:
          "동기화된 일정에 복용 기록이 없는 경우 확인을 요청하는 알림입니다. 실제 복용 여부를 확정하지 않아요. 오프라인에서 남긴 기록은 동기화 전까지 반영되지 않고, 푸시는 운영체제와 네트워크 상황에 따라 늦어질 수 있어요.",
      },
      {
        question: "개인정보와 데이터 삭제 방법은 어디서 확인하나요?",
        answer:
          "페이지 하단의 개인정보·데이터 안내에서 기기 저장, 로그인·동기화, 보호자와 위치정보의 흐름을 확인할 수 있어요. 계정·데이터 삭제 안내에는 서버 백업 삭제, 이메일 인증을 통한 계정 삭제와 다른 기기의 로컬 기록 정리 방법을 설명합니다.",
        link: { href: "#privacy", label: "개인정보·데이터 안내 보기" },
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
      "A medication management app for people taking regular medication and their caregivers. Explore schedules, records, medications, reminders and caregiver connections through real app screens.",
    skip: "Skip to product overview",
    navigation: "Main navigation",
    language: "Language",
    menu: "Open menu",
    explore: "Explore",
    guide: "Overview",
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
      platform: "Android APK · Distributed via GitHub Releases",
      features: "View features",
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
        detail:
          "Dose reminders require notification permission and device settings.",
      },
      guardian: {
        label: "Caregiver connection",
        title: "A missed record.\nA shared check-in.",
        description:
          "Ask a connected caregiver for a medication check-in.\nRequires sign-in, invitation acceptance, device registration and notification settings.",
        detail:
          "Check-in alerts require sign-in, an accepted invitation, device registration and notification settings.",
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
          "The current public distribution is an Android APK installed directly. Download the .apk file from Assets in the latest GitHub release. No GitHub account is needed. See the download guide for installation steps.",
        link: { href: "#download", label: "View APK installation guide" },
      },
      {
        question: "Do I need to sign in?",
        answer:
          "Medication management, dose schedules and records, and local dose reminders work without sign-in. Medication search and pharmacy lookup require internet access. Sync across devices requires email sign-in. Caregiver connections require sign-in on both sides and invitation acceptance. Caregiver alerts also require an active connection, caregiver device registration and notification permission, the medication user's caregiver alert setting, and sync.",
      },
      {
        question: "What do dose reminders need to work?",
        answer:
          "Save dose times and periods, turn on Settings → My dose reminders, and allow device notifications. Without Android's Alarms & reminders permission, inexact scheduling is used and notifications may be delayed. Battery saving and force-stop settings also affect reminders. Scheduling has limits on count and date range, so open the app periodically to check upcoming reservations.",
      },
      {
        question: "Does a caregiver alert mean a dose was missed?",
        answer:
          "It requests a check-in when a synced schedule has no dose record. It does not confirm whether a dose was taken. Offline records are reflected after sync, and push delivery may be delayed by the operating system or network.",
      },
      {
        question: "Where can I learn about privacy and data deletion?",
        answer:
          "The privacy and data guide at the bottom of this page explains device storage, sign-in and sync, caregivers and location data. The account and data deletion guide explains server backup deletion, account deletion with email verification, and clearing local records on other devices.",
        link: { href: "#privacy", label: "View privacy and data guide" },
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
