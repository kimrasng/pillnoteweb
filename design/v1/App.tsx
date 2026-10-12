import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Check,
  ChevronRight,
  Cloud,
  Heart,
  House,
  Layers,
  Mail,
  MapPin,
  Menu,
  Pill,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Signal,
  Smartphone,
  Users,
  Wifi,
  X,
} from "lucide-react";

type Screen = "daily" | "box" | "reminder";
const days = ["월", "화", "수", "목", "금"];
const medicines = [
  {
    name: "아침에 먹는 약",
    time: "08:00",
    color: "mint",
    note: "아침 복용",
    stock: 14,
  },
  {
    name: "점심에 먹는 약",
    time: "13:00",
    color: "peach",
    note: "점심 복용",
    stock: 21,
  },
  {
    name: "저녁에 먹는 약",
    time: "20:00",
    color: "lavender",
    note: "저녁 복용",
    stock: 7,
  },
];
const faqs = [
  {
    question: "PillNote는 언제 사용할 수 있나요?",
    answer:
      "PillNote는 현재 정식 출시를 준비하고 있어요. iOS와 Android에서 만나볼 수 있도록 개발 중이며, 출시 일정과 다운로드 링크는 준비가 끝나면 이 페이지에서 안내할 예정이에요.",
  },
  {
    question: "로그인하지 않아도 사용할 수 있나요?",
    answer:
      "네. 약 등록, 복용 일정, 복용 기록과 내 복용 시간 알림은 로그인 없이 사용할 수 있어요. 데이터는 먼저 내 기기에 저장돼요. 여러 기기에서 데이터를 이어 쓰거나 보호자와 연결하려면 이메일 로그인이 필요해요.",
  },
  {
    question: "보호자에게는 어떤 알림이 가나요?",
    answer:
      "정해진 시간 이후에도 복용 기록이 확인되지 않으면, 연결한 보호자에게 기록 확인을 요청하는 알림을 보내요. 실제로 약을 먹지 않았다고 확정하는 알림은 아니에요. 양쪽의 로그인, 보호자의 초대 수락과 알림 기기 등록, 알림 설정이 필요하며 네트워크와 기기 상황에 따라 도착이 늦어질 수 있어요.",
  },
  {
    question: "인터넷 연결이 없어도 쓸 수 있나요?",
    answer:
      "기기에 저장된 약, 복용 일정과 기록은 인터넷 없이도 사용할 수 있어요. 의약품 검색, 주변 약국 조회, 로그인과 데이터 동기화에는 인터넷 연결이 필요해요. 오프라인에서 남긴 기록은 연결 후 동기화되기 전까지 보호자 알림 판정에 반영되지 않을 수 있어요.",
  },
  {
    question: "약 검색과 약국 찾기는 어떻게 동작하나요?",
    answer:
      "약 이름으로 검색해 식품의약품안전처의 낱알식별 정보와 e약은요 의약품 정보를 확인할 수 있어요. 주변 약국은 위치 권한을 허용하거나 지도에서 원하는 지역을 선택해 찾아요. 약국의 영업 여부는 방문 전 전화로 확인해 주세요.",
  },
];

function Brand({ light = false }: { light?: boolean }) {
  return (
    <a
      className={`brand ${light ? "brand-light" : ""}`}
      href="#home"
      aria-label="PillNote 처음으로"
    >
      <img src="/images/app-icon.png" alt="" width="38" height="38" />
      <span>
        pillnote<span className="brand-dot">.</span>
      </span>
    </a>
  );
}

function PillShape({ color = "mint" }: { color?: string }) {
  return (
    <span className={`pill-shape ${color}`} aria-hidden="true">
      <span />
    </span>
  );
}

function AppPhone({
  screen = "daily",
  compact = false,
}: {
  screen?: Screen;
  compact?: boolean;
}) {
  const [day, setDay] = useState(0);
  const [records, setRecords] = useState<Record<number, boolean[]>>({
    0: [true, false, false],
  });
  const [reminders, setReminders] = useState(true);
  const [notice, setNotice] = useState("");
  const taken = records[day] ?? [false, false, false];
  const count = taken.filter(Boolean).length;
  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(""), 2400);
    return () => window.clearTimeout(timeout);
  }, [notice]);
  function toggle(index: number) {
    const next = [...taken];
    next[index] = !next[index];
    setRecords({ ...records, [day]: next });
    setNotice(next[index] ? "복용을 기록했어요" : "복용 기록을 취소했어요");
  }
  function reset() {
    setRecords({ 0: [true, false, false] });
    setDay(0);
    setReminders(true);
    setNotice("예시를 처음으로 돌렸어요");
  }
  return (
    <div className={`phone ${compact ? "phone-compact" : ""}`}>
      <div className="phone-status">
        <span>9:41</span>
        <div className="dynamic-island" />
        <span className="phone-system">
          <Signal size={13} fill="currentColor" />
          <Wifi size={14} />
          <span className="battery" />
        </span>
      </div>
      <div className="phone-content" key={screen}>
        <div className="phone-heading">
          <span className="phone-eyebrow">PILLNOTE</span>
          <button
            onClick={reset}
            className="phone-reset"
            aria-label="복약 예시 초기화"
            title="예시 초기화"
          >
            <RotateCcw size={14} />
          </button>
        </div>
        {screen === "daily" && (
          <>
            <h3>
              오늘도, 잘 챙겨요<span className="greeting-dot">.</span>
            </h3>
            <p className="phone-subtitle">나를 위한 작은 약속</p>
            <div className="demo-calendar" aria-label="예시 날짜 선택">
              {days.map((d, i) => (
                <button
                  key={d}
                  onClick={() => setDay(i)}
                  aria-pressed={day === i}
                  aria-label={`예시 ${d}요일`}
                  className={day === i ? "selected" : ""}
                >
                  <span>{d}</span>
                  <strong>{12 + i}</strong>
                  <i />
                </button>
              ))}
            </div>
            <div className="daily-progress">
              <div>
                <span>오늘의 복약</span>
                <strong>
                  {count}
                  <small> / 3</small>
                </strong>
              </div>
              <div className="progress-track">
                <span style={{ width: `${(count / 3) * 100}%` }} />
              </div>
              <p>
                {count === 3
                  ? "오늘의 약을 모두 챙겼어요. 잘했어요!"
                  : "하나씩 체크하며 나를 챙겨요."}
              </p>
            </div>
            <div className="medication-list">
              {medicines.map((med, i) => (
                <div
                  className={`medication-item ${taken[i] ? "taken" : ""}`}
                  key={med.name}
                >
                  <div className="medication-time">
                    <span>{med.time}</span>
                    {taken[i] && <small>복용 완료</small>}
                  </div>
                  <div className="medication-row">
                    <span className={`medication-avatar ${med.color}`}>
                      <PillShape color={med.color} />
                    </span>
                    <div>
                      <strong>{med.name}</strong>
                      <span>1회 1정</span>
                    </div>
                    <button
                      className={`dose-check ${taken[i] ? "checked" : ""}`}
                      aria-label={`${med.name} ${taken[i] ? "복용 기록 취소" : "복용 완료"}`}
                      aria-pressed={taken[i]}
                      onClick={() => toggle(i)}
                    >
                      {taken[i] && <Check size={15} strokeWidth={3} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {screen === "box" && (
          <>
            <h3>내 약 상자</h3>
            <p className="phone-subtitle">약과 복용 일정을 한눈에</p>
            <div className="phone-search">
              <Search size={15} />
              <span>내 약 이름 찾기</span>
            </div>
            <div className="box-filter">
              <span>관리 중 3</span>
              <span>보관 · 종료 0</span>
            </div>
            <div className="box-list">
              {medicines.map((med, i) => (
                <div className="box-item" key={med.name}>
                  <span className={`medication-avatar ${med.color}`}>
                    <PillShape color={med.color} />
                  </span>
                  <div>
                    <strong>{med.name}</strong>
                    <p>매일 {med.time} · 1회 1정</p>
                    <span className="stock-label">
                      남은 수량{" "}
                      {med.stock -
                        Object.values(records).filter((record) => record[i])
                          .length}
                      정
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="group-panel">
              <Layers size={20} />
              <div>
                <strong>약 묶음 관리</strong>
                <p>함께 먹는 약의 공통 일정</p>
              </div>
              <ChevronRight size={17} />
            </div>
            <div className="phone-info">
              <Check size={14} />
              <span>복용을 기록하면 수량도 자동으로 줄어요.</span>
            </div>
          </>
        )}
        {screen === "reminder" && (
          <>
            <h3>
              잊지 않도록,
              <br />
              가볍게 알려드려요.
            </h3>
            <p className="phone-subtitle">나의 하루에 맞춘 복용 알림</p>
            <div className="reminder-orbit">
              <div className="orbit-ring ring-one" />
              <div className="orbit-ring ring-two" />
              <div className="bell-center">
                <Bell size={38} strokeWidth={1.7} />
              </div>
              <span className="orbit-dot" />
            </div>
            <div className="reminder-setting">
              <div>
                <strong>복용 시간에 알림 받기</strong>
                <span>이 기기에서 받아요</span>
              </div>
              <button
                role="switch"
                aria-label="예시 복용 시간 알림"
                aria-checked={reminders}
                className={`switch ${reminders ? "on" : ""}`}
                onClick={() => {
                  setReminders(!reminders);
                  setNotice(
                    reminders ? "예시 알림을 껐어요" : "예시 알림을 켰어요",
                  );
                }}
              >
                <span />
              </button>
            </div>
            <div className={`next-reminder ${reminders ? "" : "disabled"}`}>
              <span>다음 알림</span>
              <strong>
                {reminders ? "오늘 오후 1:00" : "알림이 꺼져 있어요"}
              </strong>
              <p>
                {reminders
                  ? "정해둔 시간에 나를 챙기는 순간"
                  : "스위치를 눌러 다시 켜보세요"}
              </p>
            </div>
            <p className="reminder-footnote">
              앱에서 알림 권한을 허용하면
              <br />
              복용 시간에 알려드려요.
            </p>
          </>
        )}
      </div>
      <div className="phone-bottom-nav" aria-hidden="true">
        <span className={screen === "daily" ? "active" : ""}>
          <House size={19} />홈
        </span>
        <span className={screen === "box" ? "active" : ""}>
          <Pill size={19} />내 약 상자
        </span>
        <span>
          <MapPin size={19} />
          약국
        </span>
        <span className={screen === "reminder" ? "active" : ""}>
          <Menu size={19} />
          설정
        </span>
      </div>
      <div className={`demo-toast ${notice ? "visible" : ""}`} role="status">
        <Check size={15} />
        {notice}
      </div>
      <div className="home-indicator" />
    </div>
  );
}

function LaunchDialog({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
      previousFocus?.focus();
    };
  }, []);
  return (
    <dialog
      className="launch-dialog"
      ref={dialogRef}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        )
          onClose();
      }}
      aria-labelledby="launch-title"
    >
      <button
        className="dialog-close"
        onClick={onClose}
        aria-label="출시 안내 닫기"
      >
        <X size={22} />
      </button>
      <img
        src="/images/app-icon.png"
        alt="PillNote 앱 아이콘"
        width="84"
        height="84"
      />
      <span className="eyebrow">COMING SOON</span>
      <h2 id="launch-title">
        조금 더 가벼운 매일,
        <br />곧 만나요.
      </h2>
      <p>
        PillNote는 정식 출시를 준비하고 있어요.
        <br />
        다운로드가 가능해지면 이곳에서 안내할게요.
      </p>
      <div className="dialog-platforms">
        <span>
          <Smartphone size={17} />
          iOS 출시 예정
        </span>
        <span>
          <Smartphone size={17} />
          Android 출시 예정
        </span>
      </div>
      <a className="button button-blue" href="mailto:me@kimrasng.kr">
        <Mail size={17} />
        개발자에게 문의하기
        <ArrowUpRight size={17} />
      </a>
      <button className="dialog-return" onClick={onClose}>
        계속 둘러보기
      </button>
    </dialog>
  );
}

export default function App() {
  const [launchOpen, setLaunchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [screen, setScreen] = useState<Screen>("daily");
  const [activeSection, setActiveSection] = useState("home");
  const [step, setStep] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const revealObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 },
    );
    document.querySelectorAll(".reveal").forEach((element) => {
      if (reduced) element.classList.add("is-visible");
      else revealObserver.observe(element);
    });
    const sectionObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }),
      { rootMargin: "-20% 0px -55% 0px", threshold: 0 },
    );
    document
      .querySelectorAll("[data-section]")
      .forEach((element) => sectionObserver.observe(element));
    let animationFrame = 0;
    function updateScroll() {
      animationFrame = 0;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      // Update the progress bar without re-rendering the whole page on each scroll.
      if (progressRef.current)
        progressRef.current.style.transform = `scaleX(${height > 0 ? window.scrollY / height : 0})`;
      const targetY = window.innerHeight * 0.5;
      let closest = 0,
        distance = Infinity;
      stepRefs.current.forEach((element, index) => {
        if (!element) return;
        const rect = element.getBoundingClientRect();
        const d = Math.abs(rect.top + rect.height / 2 - targetY);
        if (d < distance) {
          distance = d;
          closest = index;
        }
      });
      setStep(closest);
    }
    function onScroll() {
      if (!animationFrame)
        animationFrame = window.requestAnimationFrame(updateScroll);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      revealObserver.disconnect();
      sectionObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);
  useEffect(() => {
    setScreen((["daily", "box", "reminder"] as Screen[])[step]);
  }, [step]);
  useEffect(() => {
    if (!menuOpen) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);
  function navigate() {
    setMenuOpen(false);
  }
  const sections = [
    { id: "home", name: "시작" },
    { id: "experience", name: "복약 관리" },
    { id: "together", name: "함께 돌봄" },
    { id: "discover", name: "약과 약국" },
    { id: "faq", name: "궁금한 점" },
  ];
  return (
    <>
      <a className="skip-link" href="#main">
        본문으로 바로가기
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Brand />
          <nav
            className={menuOpen ? "nav-open" : ""}
            id="main-nav"
            aria-label="주요 메뉴"
          >
            <a
              className={
                ["experience", "together", "discover"].includes(activeSection)
                  ? "current"
                  : ""
              }
              href="#experience"
              onClick={navigate}
            >
              서비스 소개
            </a>
            <a
              href="#experience"
              onClick={() => {
                setScreen("daily");
                navigate();
              }}
            >
              미리 체험하기
            </a>
            <a
              className={activeSection === "faq" ? "current" : ""}
              href="#faq"
              onClick={navigate}
            >
              궁금한 점
            </a>
            <a href="mailto:me@kimrasng.kr" onClick={navigate}>
              문의하기
              <ArrowUpRight size={13} />
            </a>
          </nav>
          <button className="header-launch" onClick={() => setLaunchOpen(true)}>
            <span className="status-dot" />
            출시 예정
            <ArrowUpRight size={15} />
          </button>
          <button
            className="mobile-menu"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="main-nav"
            aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        <div
          className="reading-progress"
          ref={progressRef}
          style={{ transform: "scaleX(0)" }}
        />
      </header>
      <aside className="section-nav" aria-label="페이지 구간">
        {sections.map((section, index) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className={activeSection === section.id ? "active" : ""}
            aria-label={section.name}
            aria-current={activeSection === section.id ? "location" : undefined}
          >
            <span className="section-nav-line" />
            <span className="section-nav-label">
              0{index + 1} {section.name}
            </span>
          </a>
        ))}
      </aside>
      <main id="main">
        <section className="hero" id="home" data-section>
          <div className="hero-image" />
          <div className="hero-shade" />
          <div className="hero-inner">
            <div className="hero-copy">
              <span className="hero-eyebrow">
                <span />
                나를 챙기는 작은 습관
              </span>
              <h1>
                가벼워지는
                <br />
                매일의 <span>복약.</span>
              </h1>
              <p>
                약을 챙기는 일부터 소중한 사람을 돌보는 마음까지.
                <br className="desktop-break" /> PillNote와 함께, 일상에 안심을
                더해요.
              </p>
              <div className="hero-actions">
                <a className="button button-blue" href="#experience">
                  PillNote 알아보기
                  <ArrowDown size={17} />
                </a>
                <span className="hero-coming">iOS & Android · 출시 예정</span>
              </div>
            </div>
            <div className="hero-product">
              <div className="hero-phone-wrap">
                <AppPhone compact />
                <div className="floating-notification">
                  <span className="notification-icon">
                    <Bell size={20} />
                  </span>
                  <div>
                    <span>
                      PillNote <small>지금</small>
                    </span>
                    <strong>나를 챙길 시간이에요</strong>
                    <p>오늘도 작은 약속을 이어가요.</p>
                  </div>
                </div>
                <div className="floating-complete">
                  <span>
                    <Check size={17} strokeWidth={3} />
                  </span>
                  한 번의 체크로, 오늘도 가볍게
                </div>
              </div>
            </div>
          </div>
          <a className="hero-scroll" href="#intro">
            <span>조금씩 내려보세요</span>
            <ArrowDown size={16} />
          </a>
          <span className="hero-index">01 — A LITTLE CARE, EVERY DAY</span>
          <span className="hero-demo-label">서비스 화면 예시</span>
        </section>
        <section className="intro section-container" id="intro">
          <div className="reveal">
            <span className="eyebrow">SMALL HABITS, BETTER DAYS</span>
            <h2>
              복잡했던 약 챙기기,
              <br />
              <span>이제 내 일상의 일부로.</span>
            </h2>
            <p>
              “오늘 약 먹었나?” 하는 순간도, 여러 약을 정리하는 수고도.
              <br />
              PillNote가 덜어드릴게요. 당신은 오늘의 일상에 집중하세요.
            </p>
            <div className="intro-line">
              <span>
                <Pill size={18} />
                쉽게 챙기고
              </span>
              <i />
              <span>
                <Check size={18} />
                가볍게 기록하고
              </span>
              <i />
              <span>
                <Heart size={18} />
                함께 돌봐요
              </span>
            </div>
          </div>
        </section>
        <section className="experience" id="experience" data-section>
          <div className="experience-inner">
            <div className="story-steps">
              <article
                className="story-step"
                ref={(element) => {
                  stepRefs.current[0] = element;
                }}
              >
                <div className="reveal">
                  <span className="step-label">01 / 오늘의 복약</span>
                  <h2>
                    챙겼다면,
                    <br />
                    <span>한 번의 체크로.</span>
                  </h2>
                  <p>
                    오늘 먹어야 할 약을 시간순으로 확인하고,
                    <br />
                    복용했다면 가볍게 체크하세요.
                    <br />
                    작은 기록이 쌓여 나만의 루틴이 돼요.
                  </p>
                  <div className="feature-note">
                    <span>
                      <Check size={19} />
                    </span>
                    <div>
                      <strong>날짜별 기록을 한눈에</strong>
                      <p>체크를 잘못 눌렀다면 언제든 취소할 수 있어요.</p>
                    </div>
                  </div>
                  <div className="try-hint">
                    <span className="hint-dot" />
                    예시 화면의 체크 버튼을 직접 눌러보세요
                    <ArrowRight size={15} />
                  </div>
                </div>
              </article>
              <article
                className="story-step"
                ref={(element) => {
                  stepRefs.current[1] = element;
                }}
              >
                <div className="reveal">
                  <span className="step-label">02 / 내 약 상자</span>
                  <h2>
                    여러 약도,
                    <br />
                    <span>한곳에 가지런히.</span>
                  </h2>
                  <p>
                    약 이름, 복용 시간, 남은 수량까지.
                    <br />
                    흩어져 있던 약 정보를 한곳에 모으세요.
                    <br />
                    함께 먹는 약은 묶음으로 관리할 수 있어요.
                  </p>
                  <div className="feature-note">
                    <span>
                      <Layers size={19} />
                    </span>
                    <div>
                      <strong>기록하면 수량도 알아서</strong>
                      <p>복용한 만큼 자동으로 차감해 관리가 편해져요.</p>
                    </div>
                  </div>
                  <span className="small-tag">
                    수량 관리 · 복용 기간 · 약 묶음
                  </span>
                </div>
              </article>
              <article
                className="story-step"
                ref={(element) => {
                  stepRefs.current[2] = element;
                }}
              >
                <div className="reveal">
                  <span className="step-label">03 / 나를 위한 알림</span>
                  <h2>
                    기억하는 일은,
                    <br />
                    <span>PillNote에게.</span>
                  </h2>
                  <p>
                    분주한 일상에서 놓치기 쉬운 복용 시간.
                    <br />
                    내가 정한 시간에 알림을 받아보세요.
                    <br />
                    앱을 열지 않아도 나를 챙길 수 있도록.
                  </p>
                  <div className="feature-note">
                    <span>
                      <Bell size={19} />
                    </span>
                    <div>
                      <strong>내 일정에 맞춘 리마인더</strong>
                      <p>기기의 알림 권한을 허용하면 사용할 수 있어요.</p>
                    </div>
                  </div>
                  <div className="try-hint">
                    <span className="hint-dot" />
                    알림 스위치를 켜고 꺼보세요
                    <ArrowRight size={15} />
                  </div>
                </div>
              </article>
            </div>
            <div className="story-device">
              <div className="device-backdrop">
                <span className="device-orbit orbit-a" />
                <span className="device-orbit orbit-b" />
                <span className="device-float-pill">
                  <PillShape />
                </span>
                <AppPhone screen={screen} />
              </div>
              <div className="screen-tabs" aria-label="서비스 예시 화면">
                {(["daily", "box", "reminder"] as Screen[]).map((value, i) => (
                  <button
                    key={value}
                    aria-pressed={screen === value}
                    onClick={() => setScreen(value)}
                  >
                    {["오늘의 복약", "내 약 상자", "복용 알림"][i]}
                  </button>
                ))}
              </div>
              <p className="demo-caption">
                직접 눌러볼 수 있는 예시 화면이에요.
                <br />
                입력한 기록은 실제 앱에 저장되지 않아요.
              </p>
            </div>
          </div>
        </section>
        <section className="together" id="together" data-section>
          <div className="together-inner">
            <div className="together-copy reveal">
              <span className="eyebrow">A LITTLE CLOSER</span>
              <h2>
                멀리 있어도,
                <br />
                돌보는 마음은
                <br />
                <span>가까이.</span>
              </h2>
              <p>
                나를 위한 기록이,
                <br />
                소중한 사람을 위한 안심으로 이어져요.
                <br />
                보호자를 연결하고 함께 챙겨보세요.
              </p>
              <div className="care-condition">
                <Users size={17} />
                이메일 로그인 후 보호자를 초대할 수 있어요.
              </div>
            </div>
            <div className="care-visual reveal">
              <div className="care-connection">
                <span className="care-person">
                  <span className="avatar avatar-self">
                    <span>나</span>
                  </span>
                  <strong>나의 기록</strong>
                </span>
                <span className="connection-line">
                  <span />
                  <Heart size={23} />
                  <span />
                </span>
                <span className="care-person">
                  <span className="avatar avatar-family">
                    <Users size={33} />
                  </span>
                  <strong>보호자의 관심</strong>
                </span>
              </div>
              <div className="care-notification">
                <div className="care-notification-head">
                  <span>
                    <img src="/images/app-icon.png" alt="" />
                    PillNote
                  </span>
                  <small>알림 예시</small>
                </div>
                <h3>복용 기록을 확인해 주세요</h3>
                <p>
                  연결한 가족의 복용 기록이 아직 없어요.
                  <br />잘 챙겼는지 따뜻하게 안부를 건네보세요.
                </p>
                <div>
                  <span>
                    <Heart size={14} />
                    함께 챙기는 하루
                  </span>
                  <span>지금</span>
                </div>
              </div>
              <p className="care-footnote">
                미복용 알림은 복용 기록의 확인을 요청해요.
                <br />
                초대 수락과 알림 설정이 필요하며, 동기화·기기 상태에 따라 달라질
                수 있어요.
              </p>
            </div>
          </div>
        </section>
        <section
          className="discover section-container"
          id="discover"
          data-section
        >
          <div className="discover-heading reveal">
            <span className="eyebrow">CARE, CONNECTED</span>
            <h2>
              필요한 순간,
              <br />
              <span>필요한 정보까지.</span>
            </h2>
            <p>약을 알아보고, 가까운 약국을 찾는 일도 PillNote 안에서.</p>
          </div>
          <div className="discovery-grid">
            <article className="discovery-card drug-card reveal">
              <div className="discovery-copy">
                <span className="card-kicker">
                  <Search size={16} />
                  의약품 검색
                </span>
                <h3>
                  이 약이 궁금할 때,
                  <br />
                  이름으로 찾아보세요.
                </h3>
                <p>
                  제품 이미지와 의약품 정보를 확인하고,
                  <br />내 약 상자에 등록할 수 있어요.
                </p>
              </div>
              <div
                className="drug-illustration"
                aria-label="의약품 검색 화면 예시"
              >
                <div className="illustration-search">
                  <Search size={18} />
                  <span>약 이름을 검색해 보세요</span>
                  <span className="search-enter">
                    <ArrowRight size={16} />
                  </span>
                </div>
                <div className="drug-result">
                  <span className="drug-photo">
                    <PillShape color="peach" />
                    <PillShape color="peach" />
                  </span>
                  <div>
                    <small>의약품 정보</small>
                    <strong>약 이름으로 찾은 정보</strong>
                    <span>제품 이미지 · 상세 정보</span>
                  </div>
                  <ChevronRight size={18} />
                </div>
                <span className="data-source">
                  식품의약품안전처 낱알식별 · e약은요 정보
                </span>
              </div>
            </article>
            <article className="discovery-card pharmacy-card reveal">
              <div className="discovery-copy">
                <span className="card-kicker">
                  <MapPin size={16} />
                  주변 약국
                </span>
                <h3>
                  가까운 약국도,
                  <br />
                  헤매지 않고.
                </h3>
                <p>
                  현재 위치 주변의 약국을 지도에서 확인해요.
                  <br />
                  원하는 지역을 직접 찾아볼 수도 있어요.
                </p>
              </div>
              <div
                className="map-illustration"
                aria-label="주변 약국 지도 예시"
              >
                <div className="map-block block-one" />
                <div className="map-block block-two" />
                <div className="map-block block-three" />
                <div className="map-park" />
                <div className="map-road road-one" />
                <div className="map-road road-two" />
                <div className="map-road road-three" />
                <span className="map-pin pin-one">
                  <Plus size={19} strokeWidth={3} />
                </span>
                <span className="map-pin pin-two">
                  <Plus size={17} strokeWidth={3} />
                </span>
                <span className="map-pin pin-three">
                  <Plus size={17} strokeWidth={3} />
                </span>
                <span className="my-location">
                  <span />
                </span>
                <div className="map-label">
                  <span>
                    <MapPin size={17} />
                  </span>
                  <div>
                    <strong>내 주변 약국 찾기</strong>
                    <p>가까운 곳부터 지도에서 확인해요</p>
                  </div>
                  <ChevronRight size={19} />
                </div>
                <small className="map-sample">지도 예시</small>
              </div>
            </article>
          </div>
          <p className="discover-footnote">
            의약품 검색과 약국 조회에는 인터넷 연결이 필요해요. 약국 영업 여부는
            방문 전 전화로 확인해 주세요.
          </p>
        </section>
        <section className="privacy section-container">
          <div className="privacy-inner reveal">
            <div className="privacy-symbol">
              <ShieldCheck size={39} strokeWidth={1.5} />
            </div>
            <div>
              <span className="eyebrow">YOUR CARE, YOUR CHOICE</span>
              <h2>
                시작은 가볍게.
                <br />내 기록은 소중하게.
              </h2>
              <p>
                회원가입 없이 내 기기에서 먼저 시작하세요.
                <br />
                필요할 때 로그인하고, 여러 기기에서 이어서 사용할 수 있어요.
              </p>
            </div>
            <div className="privacy-facts">
              <div>
                <Smartphone size={20} />
                <span>
                  <strong>기기에 먼저 저장</strong>
                  <small>기본 복약 관리는 로그인 없이</small>
                </span>
              </div>
              <div>
                <Cloud size={20} />
                <span>
                  <strong>필요할 때 동기화</strong>
                  <small>이메일 로그인으로 기기 간 연결</small>
                </span>
              </div>
              <div>
                <ShieldCheck size={20} />
                <span>
                  <strong>권한은 필요한 순간에</strong>
                  <small>알림과 위치 기능을 선택할 때 요청</small>
                </span>
              </div>
            </div>
          </div>
        </section>
        <section className="faq section-container" id="faq" data-section>
          <div className="faq-heading reveal">
            <span className="eyebrow">GOOD TO KNOW</span>
            <h2>조금 더 궁금한가요?</h2>
            <p>시작하기 전, 미리 알아두면 좋은 이야기.</p>
          </div>
          <div className="faq-list reveal">
            {faqs.map((faq, index) => (
              <details key={faq.question}>
                <summary>
                  <span className="faq-number">0{index + 1}</span>
                  <span>{faq.question}</span>
                  <span className="faq-expand">
                    <Plus size={21} />
                  </span>
                </summary>
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </section>
        <section className="launch-section">
          <div className="launch-inner reveal">
            <div className="launch-app-icon">
              <img src="/images/app-icon.png" alt="PillNote 앱 아이콘" />
            </div>
            <span className="launch-status">
              <span className="status-dot" />
              COMING SOON
            </span>
            <h2>
              더 가벼운 매일을 위해.
              <br />
              곧, PillNote.
            </h2>
            <p>당신의 일상에 자연스럽게 스며들 준비를 하고 있어요.</p>
            <button
              className="button button-dark"
              onClick={() => setLaunchOpen(true)}
            >
              출시 안내 보기
              <ArrowUpRight size={18} />
            </button>
            <div className="launch-platforms">
              <Smartphone size={15} />
              <span>iOS & Android 출시 예정</span>
            </div>
          </div>
          <span className="launch-deco deco-one">
            <PillShape />
          </span>
          <span className="launch-deco deco-two">
            <PillShape color="lavender" />
          </span>
        </section>
      </main>
      <footer className="footer">
        <div className="footer-top">
          <div>
            <Brand />
            <p>나를 챙기는 작은 습관.</p>
          </div>
          <div className="footer-links">
            <a href="#experience">서비스 소개</a>
            <a href="#faq">궁금한 점</a>
            <a href="mailto:me@kimrasng.kr">
              문의하기
              <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} PillNote. All rights reserved.
          </span>
          <div>
            <span>
              Designed & developed by <strong>Dohyun Kim</strong>
            </span>
            <a href="mailto:me@kimrasng.kr">
              me@kimrasng.kr
              <ArrowUpRight size={13} />
            </a>
          </div>
        </div>
        <p className="footer-note">
          PillNote는 복약 기록과 일정 관리를 돕는 서비스이며, 의학적 진단이나
          전문적인 복약 지도를 대신하지 않아요.
        </p>
      </footer>
      {launchOpen && <LaunchDialog onClose={() => setLaunchOpen(false)} />}
    </>
  );
}
