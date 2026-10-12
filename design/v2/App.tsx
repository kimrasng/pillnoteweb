import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronDown,
  RotateCcw,
  X,
} from "lucide-react";
import DemoApp, { type View } from "./DemoApp";
import {
  demoReducer,
  doseKey,
  initialState,
  vitamin,
  type Medicine,
} from "./demo";

const scenes = [
  {
    label: "오늘의 복약",
    title: "오늘 먹을 약,\n한눈에.",
    description: "아침부터 저녁까지.\n챙겨야 할 약을 시간순으로 확인하세요.",
    hint: "약 이름을 누르면 자세히 볼 수 있어요.",
    color: "home",
  },
  {
    label: "약 등록",
    title: "약 이름부터,\n복용 시간까지.",
    description:
      "이름을 찾고, 시간과 수량을 정하면 끝.\n검색 없이 직접 입력할 수도 있어요.",
    hint: "검색창에 비타민 D를 입력해 보세요.",
    color: "register",
  },
  {
    label: "복용 기록",
    title: "먹었으면,\n한 번만 눌러요.",
    description:
      "복용한 약 옆에 체크해 주세요.\n오늘 얼마나 챙겼는지 바로 보여요.",
    hint: "체크를 다시 누르면 기록을 취소해요.",
    color: "record",
  },
  {
    label: "약 상자",
    title: "남은 수량도,\n기록에 맞춰.",
    description:
      "복용을 기록하면 남은 수량이 줄어들어요.\n수정하거나 보관할 약도 여기서 관리하세요.",
    hint: "아침 처방약의 남은 수량을 확인해 보세요.",
    color: "box",
  },
  {
    label: "시간 알림",
    title: "정해둔 시간에,\n잊지 않도록.",
    description:
      "앱을 열어두지 않아도 받을 수 있는 알림.\n기본 복용 알림은 로그인 없이 이용해요.",
    hint: "알림을 켜고 끄거나 알림 화면을 열어보세요.",
    color: "reminders",
  },
  {
    label: "보호자 연결",
    title: "놓친 기록은,\n함께 확인해요.",
    description:
      "초대를 수락한 보호자에게 확인 요청을 보내요.\n혼자 챙기기 어려운 날에도 함께.",
    hint: "초대부터 수락, 보호자 알림까지 체험해 보세요.",
    color: "care",
  },
  {
    label: "주변 약국",
    title: "가까운 약국을,\n지도에서.",
    description:
      "약이 필요할 때는 주변 약국을 찾아보세요.\n앱에서는 내 위치를 기준으로 보여드려요.",
    hint: "지도를 움직이거나 약국 표시를 눌러보세요.",
    color: "pharmacy",
  },
] as const;
function sceneForView(view: View, current: number) {
  if (["search", "form", "edit", "saved"].includes(view)) return 1;
  if (["box", "detail", "groups"].includes(view)) return 3;
  if (["reminders", "notification"].includes(view)) return 4;
  if (["care", "guardian-notification"].includes(view)) return 5;
  if (view === "pharmacy") return 6;
  return current === 2 ? 2 : 0;
}
export default function App() {
  const [state, dispatch] = useReducer(demoReducer, undefined, initialState);
  const [view, setView] = useState<View>("home");
  const [activeScene, setActiveScene] = useState(0);
  const [manual, setManual] = useState(false);
  const [query, setQuery] = useState("");
  const [selection, setSelection] = useState<Medicine>(vitamin);
  const [autoTarget, setAutoTarget] = useState("");
  const [toast, setToast] = useState("");
  const [demoSession, setDemoSession] = useState(0);
  const storyRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  const dialogRef = useRef<HTMLDialogElement>(null);
  stateRef.current = state;
  const notify = useCallback((message: string) => setToast(message), []);
  const displayScene = manual ? sceneForView(view, activeScene) : activeScene;
  const scene = scenes[displayScene];
  useEffect(() => {
    let frame = 0;
    function update() {
      frame = 0;
      if (!storyRef.current) return;
      const stickyTop = parseFloat(
        getComputedStyle(document.getElementById("experience")!).top,
      );
      const anchors = [...storyRef.current.querySelectorAll(".scene-anchor")];
      setActiveScene(
        anchors.reduce(
          (selected, anchor, index) =>
            anchor.getBoundingClientRect().top <= stickyTop + 2
              ? index
              : selected,
          0,
        ),
      );
    }
    function scroll() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    function resumeOnOuterScroll(event: Event) {
      if (
        event.target instanceof Element &&
        !event.target.closest(".device-frame")
      )
        setManual(false);
    }
    function resumeOnPageKey(event: KeyboardEvent) {
      if (
        ["PageDown", "PageUp", "ArrowDown", "ArrowUp", " "].includes(event.key)
      )
        resumeOnOuterScroll(event);
    }
    update();
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", scroll);
    window.addEventListener("wheel", resumeOnOuterScroll, { passive: true });
    window.addEventListener("touchstart", resumeOnOuterScroll, {
      passive: true,
    });
    window.addEventListener("keydown", resumeOnPageKey);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", scroll);
      window.removeEventListener("wheel", resumeOnOuterScroll);
      window.removeEventListener("touchstart", resumeOnOuterScroll);
      window.removeEventListener("keydown", resumeOnPageKey);
    };
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2300);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    setAutoTarget("");
    if (manual) return;
    const timers: number[] = [];
    const later = (delay: number, action: () => void) =>
      timers.push(window.setTimeout(action, delay));
    switch (activeScene) {
      case 0:
        setView("home");
        break;
      case 1:
        setQuery("");
        setSelection(vitamin);
        setView("search");
        setAutoTarget("search");
        later(700, () => setQuery("비타민"));
        later(1500, () => setQuery("비타민 D"));
        later(2600, () => {
          setView("form");
          setAutoTarget("time");
        });
        later(4400, () => setAutoTarget("register"));
        later(5700, () => {
          dispatch({ type: "add", medicine: vitamin });
          setView("saved");
          setAutoTarget("");
        });
        break;
      case 2:
        dispatch({ type: "add", medicine: vitamin });
        setView("home");
        later(700, () => setAutoTarget("take"));
        later(2200, () => {
          if (!stateRef.current.records[doseKey("morning", 0, "08:00")]) {
            dispatch({
              type: "toggle",
              medicineId: "morning",
              day: 0,
              time: "08:00",
            });
            notify("복용을 기록했어요.");
          }
          setAutoTarget("");
        });
        break;
      case 3:
        setView("box");
        setAutoTarget("stock");
        break;
      case 4:
        setView("reminders");
        later(3100, () => {
          if (stateRef.current.reminders) setView("notification");
        });
        break;
      case 5:
        setView("care");
        later(1300, () => {
          if (stateRef.current.guardian.status === "none")
            dispatch({
              type: "guardian",
              email: "family@example.com",
              status: "pending",
            });
        });
        later(3100, () => {
          if (stateRef.current.guardian.status === "pending")
            dispatch({
              type: "guardian",
              email: stateRef.current.guardian.email,
              status: "connected",
            });
        });
        break;
      case 6:
        setView("pharmacy");
        break;
    }
    return () => timers.forEach(clearTimeout);
  }, [activeScene, manual, notify]);
  function goToScene(index: number) {
    setManual(false);
    setActiveScene(index);
    const element = document.getElementById(`scene-${index}`);
    if (element) {
      const stickyTop = parseFloat(
        getComputedStyle(document.getElementById("experience")!).top,
      );
      window.scrollTo({
        top:
          window.scrollY +
          element.getBoundingClientRect().top -
          stickyTop +
          (index === 0 ? 0 : Math.min(window.innerHeight * 0.25, 200)),
        behavior: "instant",
      });
    }
  }
  function navigate(next: View) {
    setManual(true);
    setView(next);
  }
  function reset() {
    dispatch({ type: "reset" });
    setDemoSession((value) => value + 1);
    setQuery("");
    setSelection(vitamin);
    setToast("");
    setManual(false);
    goToScene(0);
  }
  return (
    <>
      <a className="skip-link" href="#experience">
        앱 체험으로 이동
      </a>
      <header className="site-header">
        <a
          className="brand"
          href="#scene-0"
          onClick={(event) => {
            event.preventDefault();
            goToScene(0);
          }}
        >
          <img src="/images/app-icon.png" alt="" />
          <span>PillNote</span>
        </a>
        <nav aria-label="웹 메뉴">
          <button onClick={() => goToScene(1)}>앱 둘러보기</button>
          <a href="#about">이용 안내</a>
          <button
            className="release-button"
            onClick={() => dialogRef.current?.showModal()}
          >
            출시 예정 <ArrowRight size={15} />
          </button>
        </nav>
      </header>
      <main>
        <div
          className="scroll-story"
          ref={storyRef}
          style={{ "--scene-count": scenes.length } as React.CSSProperties}
        >
          {scenes.map((item, index) => (
            <div
              className="scene-anchor"
              id={`scene-${index}`}
              key={item.label}
              style={{ top: `${index * 115}svh` }}
            />
          ))}
          <section
            className={`stage-shell stage-${scene.color}`}
            id="experience"
            aria-label="PillNote 앱 체험"
          >
            <div className="stage-layout">
              <div className="story-copy" key={displayScene}>
                <p className="scene-label">
                  <span>{String(displayScene + 1).padStart(2, "0")}</span>
                  {scene.label}
                </p>
                <h1>{scene.title}</h1>
                <p className="scene-description">{scene.description}</p>
                <div className="scene-prompt">
                  <span className="prompt-line" />
                  <p>{scene.hint}</p>
                </div>
                {displayScene === 0 && (
                  <button
                    className="start-experience"
                    onClick={() => {
                      setManual(true);
                      setQuery("");
                      setView("search");
                    }}
                  >
                    내 약 등록해 보기 <ArrowRight size={20} />
                  </button>
                )}
              </div>
              <div className="app-experience">
                <div
                  className="device-frame"
                  onPointerDownCapture={() => setManual(true)}
                  onKeyDownCapture={() => setManual(true)}
                >
                  <DemoApp
                    key={demoSession}
                    state={state}
                    dispatch={dispatch}
                    view={view}
                    onNavigate={navigate}
                    onNotify={notify}
                    query={query}
                    onQuery={setQuery}
                    selection={selection}
                    onSelection={setSelection}
                    autoTarget={manual ? "" : autoTarget}
                    toast={toast}
                  />
                </div>
                <div className="experience-controls">
                  <span>
                    <i className={manual ? "manual" : ""} />
                    {manual
                      ? "직접 체험 중"
                      : "스크롤하면 사용 과정이 이어져요"}
                  </span>
                  {manual ? (
                    <button onClick={() => setManual(false)}>
                      스크롤 시연으로 돌아가기 <RotateCcw size={12} />
                    </button>
                  ) : (
                    <span className="scroll-cue">
                      스크롤 <ArrowDown size={12} />
                    </span>
                  )}
                </div>
              </div>
            </div>
            <nav className="chapter-nav" aria-label="서비스 둘러보기">
              {scenes.map((item, index) => (
                <button
                  key={item.label}
                  onClick={() => goToScene(index)}
                  className={displayScene === index ? "active" : ""}
                  aria-label={`${index + 1}. ${item.label}`}
                  aria-current={displayScene === index ? "step" : undefined}
                >
                  <span>{item.label}</span>
                  <i />
                </button>
              ))}
            </nav>
            <div className="stage-bottom">
              <span>앱 출시 전, 웹에서 먼저 만나보세요.</span>
              <button onClick={reset} aria-label="앱 체험 처음부터 다시 시작">
                <RotateCcw size={13} />
                처음부터
              </button>
            </div>
          </section>
        </div>
        <section className="about-section" id="about">
          <div className="about-intro">
            <img src="/images/app-icon.png" alt="" />
            <h2>
              내 약을 챙기는 일,
              <br />
              PillNote에서.
            </h2>
            <p>복약 기록 · 약 관리 · 시간 알림 · 보호자 연결 · 주변 약국</p>
            <button onClick={() => dialogRef.current?.showModal()}>
              출시 소식 <ArrowRight size={18} />
            </button>
          </div>
          <div className="faq-list">
            <details>
              <summary>
                지금 앱을 다운로드할 수 있나요?
                <ChevronDown size={19} />
              </summary>
              <p>
                PillNote는 출시를 준비하고 있어요. 이 페이지에서는 앱의 사용
                흐름을 미리 체험할 수 있어요. 정식 출시 일정과 다운로드 링크는
                공개 후 안내할 예정이에요.
              </p>
            </details>
            <details>
              <summary>
                로그인이 꼭 필요한가요?
                <ChevronDown size={19} />
              </summary>
              <p>
                약 등록, 복용 기록과 기본 복용 알림은 로그인 없이 이용할 수
                있어요. 기기 간 동기화와 보호자 연결에는 이메일 로그인이
                필요해요. 보호자 알림을 받으려면 초대 수락과 알림 설정도
                필요해요.
              </p>
            </details>
            <details>
              <summary>
                웹에서 입력한 내용은 어떻게 되나요?
                <ChevronDown size={19} />
              </summary>
              <p>
                이 화면은 앱 사용 과정을 보여주는 미리보기예요. 약 정보와 복용
                기록은 현재 열린 페이지 안에서만 유지되고, 새로고침하면
                초기화돼요. 검색 결과와 약국은 예시이며 이메일과 기기 알림은
                실제로 발송되지 않아요.
              </p>
            </details>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <a
          className="brand"
          href="#scene-0"
          onClick={(event) => {
            event.preventDefault();
            goToScene(0);
          }}
        >
          <img src="/images/app-icon.png" alt="" />
          <span>PillNote</span>
        </a>
        <div>
          <span>Developed by Dohyun Kim</span>
          <a href="mailto:me@kimrasng.kr">
            me@kimrasng.kr <ArrowRight size={12} />
          </a>
        </div>
        <span>© {new Date().getFullYear()} PillNote</span>
      </footer>
      <dialog
        ref={dialogRef}
        className="release-dialog"
        aria-labelledby="release-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            const rect = event.currentTarget.getBoundingClientRect();
            if (
              event.clientX < rect.left ||
              event.clientX > rect.right ||
              event.clientY < rect.top ||
              event.clientY > rect.bottom
            )
              dialogRef.current?.close();
          }
        }}
      >
        <button
          className="dialog-close icon-button"
          onClick={() => dialogRef.current?.close()}
          aria-label="출시 안내 닫기"
        >
          <X size={22} />
        </button>
        <img src="/images/app-icon.png" alt="" />
        <span className="launch-tag">
          <Check size={13} />
          출시 준비 중
        </span>
        <h2 id="release-title">조금만 기다려 주세요.</h2>
        <p>
          PillNote를 곧 앱으로 만나볼 수 있도록 준비하고 있어요. 출시 일정과
          다운로드 링크는 이곳에서 안내할게요.
        </p>
        <a href="mailto:me@kimrasng.kr">
          개발자에게 문의하기 <ArrowRight size={17} />
        </a>
      </dialog>
    </>
  );
}
