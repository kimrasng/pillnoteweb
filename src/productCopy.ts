import type { Locale } from "./i18n";

type TextItem = { title: string; body: string };
type ProductCopy = {
  overview: {
    label: string;
    title: string;
    description: string;
    features: TextItem[];
    companion: TextItem;
    conditions: string;
    tour: string;
    status: string;
    screenCaption: string;
    pausePreview: string;
    playPreview: string;
    previewLabels: {
      drugInfo: string;
      record: string;
      notification: string;
      pharmacy: string;
    };
  };
  download: {
    label: string;
    title: string;
    description: string;
    installTitle: string;
    steps: TextItem[];
    caution: string;
    latest: string;
    history: string;
    installHelp: string;
    installPermission: string;
  };
  data: {
    label: string;
    title: string;
    description: string;
    items: TextItem[];
  };
  deletion: {
    title: string;
    items: TextItem[];
    contact: string;
  };
  safety: string;
  privacyLink: string;
  deletionLink: string;
};

// Public copy contains only verified implementation and release facts.
// Confirm policy terms against the implementation before publishing changes.
export const productTranslations: Record<Locale, ProductCopy> = {
  ko: {
    overview: {
      label: "PillNote 한눈에",
      title: "오늘의 복용부터\n내 약 관리까지.",
      screenCaption: "실제 앱 화면 · 한국어 UI",
      pausePreview: "앱 화면 순환 일시정지",
      playPreview: "앱 화면 순환 재생",
      previewLabels: {
        drugInfo: "약 정보",
        record: "복용 기록",
        notification: "복용 시간 알림",
        pharmacy: "주변 약국 검색",
      },
      description:
        "필요한 기능부터 살펴보세요. 로그인 없이 기기에 기록하고, 필요하면 계정과 보호자를 연결할 수 있어요.",
      features: [
        {
          title: "일정과 기록을 한곳에",
          body: "시간순으로 오늘의 일정을 확인하고, 복용한 약을 체크해 날짜별 기록을 남겨요.",
        },
        {
          title: "내 약을 찾고 관리하기",
          body: "의약품 이름으로 검색해 등록하고, 복용 시간·기간과 보유 수량을 관리해요. 검색에는 인터넷 연결이 필요해요.",
        },
        {
          title: "정한 시간에 알림 받기",
          body: "기기에 복용 일정을 예약해 앱을 열지 않아도 알림을 받아요. 알림 권한과 기기 설정을 확인해주세요.",
        },
        {
          title: "보호자와 확인하기",
          body: "설정한 대기 시간이 지나도 복용 기록이 없을 때, 연결한 보호자에게 확인 알림을 보내요. 실제 복용 여부를 확정하는 알림은 아니에요.",
        },
      ],
      companion: {
        title: "함께 쓰는 보조 기능 · 주변 약국",
        body: "약국이 필요할 때 지도에서 위치와 연락처를 찾아보세요. 현재 위치 권한을 허용하거나 지도에서 검색할 지역을 선택할 수 있어요.",
      },
      conditions:
        "보호자 연결에는 양쪽의 이메일 로그인과 초대 수락이 필요해요. 알림은 연결 활성화, 보호자 기기 등록·알림 허용, 본인의 보호자 알림 설정과 데이터 동기화 후 이용할 수 있어요.",
      tour: "실제 앱 화면 둘러보기",
      status: "설치 안내 보기",
    },
    download: {
      label: "시작하기",
      title: "다운로드",
      description: "Android용 APK를 제공해요.",
      installTitle: "앱 설치 순서",
      steps: [
        {
          title: "설치 파일 받기",
          body: "GitHub 릴리즈의 Assets에서 .apk 파일을 받으세요. 계정 없이 받을 수 있어요.",
        },
        {
          title: "파일을 열어 설치하기",
          body: "받은 파일을 열고 기기의 설치 안내를 따라주세요.",
        },
        {
          title: "내 약과 시간 등록하기",
          body: "약과 복용 시간을 등록하고, 알림을 받으려면 기기의 알림 권한을 허용해주세요.",
        },
      ],
      installHelp: "설치 전 확인사항",
      installPermission:
        "기기에서 요청하면 사용 중인 브라우저 또는 파일 앱의 ‘이 출처 허용’을 설치할 때만 켜세요. 설치 후 다시 끌 수 있어요.",
      caution:
        "github.com/kimrasng/pillnote의 릴리즈인지 확인하세요. 기기가 설치를 차단하면 경고를 확인하고 진행을 중단하세요.",
      latest: "GitHub에서 APK 받기",
      history: "이전 릴리즈",
    },
    data: {
      label: "개인정보·데이터 안내",
      title: "기기에 저장하는 정보와 서버로 보내는 정보.",
      description: "앱의 기능별 데이터 흐름과 설정 방법을 안내합니다.",
      items: [
        {
          title: "기기 내 복약 관리",
          body: "등록한 약, 약 묶음, 복용 일정·기록, 관련 설정을 기기에 저장합니다. 로그인하지 않아도 사용할 수 있으며, 로그인 정보는 운영체제의 보안 저장소에 보관합니다.",
        },
        {
          title: "이메일 로그인과 동기화",
          body: "인증에 이메일과 인증번호를 서버로 전송합니다. 로그인하면 약·묶음·복용 일정·기록·설정과 기기 시간대를 계정에 연결해 서버와 동기화합니다. 처음 로그인할 때 비회원 기록도 해당 계정에 병합합니다.",
        },
        {
          title: "보호자에게 전달되는 정보",
          body: "초대에 본인과 보호자의 이메일, 지정한 보호자 이름, 연결 상태를 사용합니다. 보호자는 받은 초대에서 초대한 계정의 이메일을 확인합니다. 연결 후 받는 푸시는 복약 상태 확인 요청이며, 현재 푸시 본문에는 약 이름과 전체 복용 기록을 표시하지 않습니다.",
        },
        {
          title: "연결 동의와 해제",
          body: "보호자가 앱에서 초대를 수락하거나 거절합니다. 초대한 사용자는 설정 → 보호자 연결에서 알림을 끄거나 연결 삭제를 선택할 수 있습니다. 서버에 변경이 반영되려면 인터넷 연결이 필요합니다.",
        },
        {
          title: "로그인 기기와 푸시",
          body: "로그인한 앱의 설치별 임의 ID와 Android/iOS 구분을 계정·세션에 연결합니다. 푸시를 등록하면 기기 푸시 토큰을 서버로 보냅니다. 설정 → 기기 정보 제공에서 기종·OS 버전·앱 버전 제공을 선택할 수 있으며 기본값은 꺼짐입니다. 철회는 온라인 접속 후 서버에 반영됩니다.",
        },
        {
          title: "약 검색과 위치",
          body: "약 검색어와 선택한 의약품 식별번호를 조회에 사용합니다. 약국에서 현재 위치 사용을 선택하면 위치 권한을 요청하고 검색 중심 좌표를 서버로 전송합니다. 권한 없이 지도에서 지역을 선택해 검색할 수도 있습니다. 앱 지도는 외부 지도 타일을 요청합니다.",
        },
        {
          title: "웹사이트의 데이터",
          body: "이 소개 페이지는 앱 계정에 로그인하거나 복약 데이터·기기 위치를 요청하지 않습니다. 언어 선택을 브라우저에 저장합니다. 다운로드 링크를 누르면 GitHub로 이동합니다.",
        },
      ],
    },
    deletion: {
      title: "계정·데이터 삭제 방법.",
      items: [
        {
          title: "서버 백업 삭제",
          body: "로그인한 앱의 설정 → 클라우드 백업 삭제에서 진행합니다. 이 기기의 복약 기록과 계정은 유지됩니다. 이후 기록 변경이나 ‘지금 백업하기’로 동기화하면 서버 백업이 다시 만들어질 수 있습니다.",
        },
        {
          title: "계정 삭제",
          body: "설정 → 계정 삭제를 선택하고 이메일로 받은 인증번호로 확인합니다. 서버에 계정 삭제를 요청하고, 성공하면 현재 기기의 해당 계정 복약 데이터와 로그인 정보를 삭제합니다. 인터넷과 인증 이메일 수신이 필요합니다.",
        },
        {
          title: "다른 기기와 비회원 기록",
          body: "계정 삭제가 오프라인인 다른 기기의 로컬 기록까지 원격으로 지우지는 않습니다. 해당 기기의 앱 데이터도 기기 설정에서 삭제하세요. 비회원 기록은 Android 설정의 PillNote 앱 저장공간에서 데이터 삭제로 지울 수 있습니다. 서버 계정 삭제와 기기 데이터 삭제는 별도로 진행해주세요.",
        },
      ],
      contact: "삭제 방법에 도움이 필요하면 개발자에게 문의하세요.",
    },
    safety:
      "PillNote는 복약 일정과 기록을 지원하는 도구입니다. 진단·처방이나 의료전문가의 판단을 대체하지 않습니다. 복용 방법과 약 변경은 의료전문가와 확인해주세요.",
    privacyLink: "개인정보·데이터 안내",
    deletionLink: "계정·데이터 삭제 안내",
  },
  en: {
    overview: {
      label: "PillNote at a glance",
      title: "Daily doses.\nYour medications, organized.",
      screenCaption: "Actual app screen · Korean UI",
      pausePreview: "Pause app screen rotation",
      playPreview: "Play app screen rotation",
      previewLabels: {
        drugInfo: "Medication information",
        record: "Dose records",
        notification: "Dose reminder",
        pharmacy: "Nearby pharmacy search",
      },
      description:
        "Start with the features you need. Keep records on your device without signing in, then connect an account or caregiver when needed.",
      features: [
        {
          title: "Schedules and records together",
          body: "See today's schedule in time order and check off doses to keep records by date.",
        },
        {
          title: "Find and manage your medications",
          body: "Search by medication name, then manage dose times, treatment periods and remaining supply. Search requires an internet connection.",
        },
        {
          title: "Reminders at your chosen times",
          body: "Schedule dose reminders on your device to receive them while the app is closed. Check notification permissions and device settings.",
        },
        {
          title: "Check in with a caregiver",
          body: "When a dose record is missing after your chosen waiting period, send a check-in notification to a connected caregiver. This does not confirm whether a dose was taken.",
        },
      ],
      companion: {
        title: "A companion feature · Nearby pharmacies",
        body: "Find a pharmacy's location and contact details on the map. Allow access to your current location or choose a search area on the map.",
      },
      conditions:
        "Caregiver connections require email sign-in on both sides and an accepted invitation. Notifications also require an active connection, caregiver device registration and notification permission, your caregiver alert setting, and synced data.",
      tour: "Explore real app screens",
      status: "View installation guide",
    },
    download: {
      label: "Get started",
      title: "Download",
      description: "An APK for Android is available.",
      installTitle: "Installation steps",
      steps: [
        {
          title: "Get the installation file",
          body: "Get the .apk file from the release’s Assets. No GitHub account needed.",
        },
        {
          title: "Open the file and install",
          body: "Open the file and follow your device’s installation instructions.",
        },
        {
          title: "Add your medications",
          body: "Add medications and dose times. Allow notifications for reminders.",
        },
      ],
      installHelp: "Before you install",
      installPermission:
        "If asked, temporarily enable ‘Allow from this source’ for your browser or file app. You can turn it off after installation.",
      caution:
        "Check that the release belongs to github.com/kimrasng/pillnote. If your device blocks installation, review the warning and stop.",
      latest: "Get APK on GitHub",
      history: "Earlier releases",
    },
    data: {
      label: "Privacy and data guide",
      title: "What stays on your device and what is sent to the server.",
      description:
        "How app features handle data and where to find the relevant settings.",
      items: [
        {
          title: "Medication management on your device",
          body: "Your medications, medication groups, schedules, dose records and related settings are saved on your device and work without sign-in. Sign-in information is held in the operating system's secure storage.",
        },
        {
          title: "Email sign-in and sync",
          body: "Your email and verification code are sent to the server for authentication. After sign-in, medications, groups, schedules, dose records, settings and your device time zone are linked to your account and synced with the server. Guest records are merged into the account on first sign-in.",
        },
        {
          title: "Information shared with a caregiver",
          body: "Invitations use your email, the caregiver's email, the caregiver name you set and the connection status. The caregiver can see the inviting account's email in the invitation. After connecting, push notifications request a medication check-in; the current notification body shows neither medication names nor the complete dose history.",
        },
        {
          title: "Accepting and ending connections",
          body: "Caregivers accept or reject invitations in the app. The inviting user can turn off alerts or delete a connection under Settings → Caregiver connection. An internet connection is needed to apply changes on the server.",
        },
        {
          title: "Signed-in devices and push",
          body: "A random installation ID and Android/iOS platform are linked to your account and session. Registering push sends a device push token to the server. Sharing your device model, OS version and app version is optional under Settings → Device information and is off by default. Withdrawal is applied to the server after an online connection.",
        },
        {
          title: "Medication search and location",
          body: "Medication search uses your query and the selected medication's identifier. Choosing current location in Pharmacies requests location permission and sends the search center coordinates to the server. You can also choose an area on the map without location permission. The app map requests external map tiles.",
        },
        {
          title: "Data on this website",
          body: "This presentation page does not sign into app accounts or request medication data or device location. It saves your language preference in your browser. Download links take you to GitHub.",
        },
      ],
    },
    deletion: {
      title: "Deleting your account and data.",
      items: [
        {
          title: "Delete the server backup",
          body: "In the signed-in app, choose Settings → Delete cloud backup. Your account and this device's dose records remain. A later record change or ‘Back up now’ sync can create a server backup again.",
        },
        {
          title: "Delete your account",
          body: "Choose Settings → Delete account and confirm with the code sent to your email. The app requests server account deletion; after success, it clears that account's medication data and sign-in information on the current device. Internet access and receipt of the verification email are required.",
        },
        {
          title: "Other devices and guest records",
          body: "Account deletion does not remotely erase local records on other offline devices. Clear the app data in each device's settings too. On Android, guest records can be removed using Clear data in PillNote's app storage settings. Server account deletion and device data deletion are separate steps.",
        },
      ],
      contact: "Contact the developer if you need help with deletion.",
    },
    safety:
      "PillNote supports medication schedules and records. It does not replace diagnosis, prescriptions or a healthcare professional's judgment. Check medication instructions and changes with a healthcare professional.",
    privacyLink: "Privacy and data guide",
    deletionLink: "Account and data deletion",
  },
};
