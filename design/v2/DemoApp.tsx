import { useEffect, useState, type Dispatch, type FormEvent } from "react";
import {
  ArrowLeft,
  Bell,
  Check,
  ChevronRight,
  Clock3,
  House,
  Layers,
  MapPin,
  Menu,
  Minus,
  Pill,
  Plus,
  Search,
  Users,
  X,
} from "lucide-react";
import {
  dailyDoses,
  doseKey,
  vitamin,
  type Action,
  type DemoState,
  type Medicine,
} from "./demo";
import PharmacyMap, { pharmacies } from "./PharmacyMap";

export type View =
  | "home"
  | "search"
  | "form"
  | "edit"
  | "saved"
  | "box"
  | "detail"
  | "groups"
  | "reminders"
  | "notification"
  | "care"
  | "guardian-notification"
  | "pharmacy";
type Props = {
  state: DemoState;
  dispatch: Dispatch<Action>;
  view: View;
  onNavigate: (view: View) => void;
  onNotify: (message: string) => void;
  query: string;
  onQuery: (query: string) => void;
  selection: Medicine;
  onSelection: (medicine: Medicine) => void;
  autoTarget: string;
  toast: string;
};

function AppHeading({
  title,
  subtitle,
  back,
  right,
}: {
  title: string;
  subtitle?: string;
  back?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <div className="app-heading">
      {back && (
        <button
          className="app-back icon-button"
          aria-label="이전 화면"
          onClick={back}
        >
          <ArrowLeft size={22} />
        </button>
      )}
      <div className="app-title-row">
        <h2>{title}</h2>
        {right}
      </div>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}
function MedicineIcon({ medicine }: { medicine: Medicine }) {
  return (
    <span className={`medicine-icon ${medicine.color}`}>
      <Pill size={25} strokeWidth={1.6} />
    </span>
  );
}
function formatTime(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return `${hour < 12 ? "오전" : "오후"} ${hour % 12 || 12}:${String(minute).padStart(2, "0")}`;
}
function dayDate(offset: number) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date;
}

function MedicineForm({
  medicine,
  editing,
  onSave,
  onBack,
  autoTarget,
}: {
  medicine: Medicine;
  editing: boolean;
  onSave: (medicine: Medicine) => void;
  onBack: () => void;
  autoTarget: string;
}) {
  const [name, setName] = useState(medicine.name);
  const [dosage, setDosage] = useState(medicine.dosage);
  const [stock, setStock] = useState(medicine.stock);
  const [unit, setUnit] = useState(medicine.unit);
  const [times, setTimes] = useState(medicine.times);
  const [error, setError] = useState("");
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setError("약 이름을 입력해 주세요.");
      return;
    }
    if (
      !Number.isFinite(dosage) ||
      dosage <= 0 ||
      !Number.isFinite(stock) ||
      stock < 0
    ) {
      setError("복용량과 보유 수량을 확인해 주세요.");
      return;
    }
    if (
      !times.length ||
      times.some((time) => !/^([01]\d|2[0-3]):[0-5]\d$/.test(time))
    ) {
      setError("복용 시간을 한 개 이상 설정해 주세요.");
      return;
    }
    onSave({
      ...medicine,
      name: name.trim(),
      dosage,
      stock,
      unit,
      times: [...new Set(times)].sort(),
    });
  }
  return (
    <>
      <AppHeading
        title={editing ? "약 수정" : "복용 일정 설정"}
        subtitle={
          editing
            ? "필요한 정보를 바꿔 주세요."
            : "2단계 · 이 약을 어떻게 챙길까요?"
        }
        back={onBack}
      />
      <form className="medicine-form" onSubmit={submit}>
        <label>
          약 이름
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            maxLength={40}
            aria-label="등록할 약 이름"
          />
        </label>
        <div className="form-columns">
          <label>
            1회 복용량
            <input
              type="number"
              min="0.1"
              step="0.1"
              max="100"
              value={dosage}
              onChange={(event) => setDosage(Number(event.target.value))}
              required
              aria-label="1회 복용량"
            />
          </label>
          <label>
            단위
            <select
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
              aria-label="복용 단위"
            >
              <option>정</option>
              <option>캡슐</option>
              <option>포</option>
              <option>mL</option>
            </select>
          </label>
        </div>
        <fieldset className={autoTarget === "time" ? "auto-highlight" : ""}>
          <legend>복용 시간</legend>
          {times.map((time, index) => (
            <div className="time-input-row" key={index}>
              <Clock3 size={19} />
              <input
                type="time"
                value={time}
                onChange={(event) =>
                  setTimes(
                    times.map((value, i) =>
                      i === index ? event.target.value : value,
                    ),
                  )
                }
                aria-label={`복용 시간 ${index + 1}`}
                required
              />
              <button
                type="button"
                className="icon-button"
                onClick={() => setTimes(times.filter((_, i) => i !== index))}
                aria-label={`복용 시간 ${index + 1} 삭제`}
              >
                <Minus size={17} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="inline-button"
            onClick={() =>
              setTimes([...times, times.includes("20:00") ? "08:00" : "20:00"])
            }
          >
            <Plus size={16} />
            시간 추가
          </button>
        </fieldset>
        <label>
          보유 수량
          <div className="stock-input">
            <input
              type="number"
              min="0"
              max="100000"
              step="0.1"
              value={stock}
              onChange={(event) => setStock(Number(event.target.value))}
              required
              aria-label="보유 수량"
            />
            <span>{unit}</span>
          </div>
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button
          className={`app-primary ${autoTarget === "register" ? "auto-highlight" : ""}`}
          type="submit"
        >
          {editing ? "저장하기" : "등록하기"}
        </button>
        <p className="app-explanation">
          화면에 입력한 내용은 웹 미리보기 안에서만 사용돼요.
        </p>
      </form>
    </>
  );
}

export default function DemoApp({
  state,
  dispatch,
  view,
  onNavigate,
  onNotify,
  query,
  onQuery,
  selection,
  onSelection,
  autoTarget,
  toast,
}: Props) {
  const [day, setDay] = useState(0);
  useEffect(() => {
    if (autoTarget === "take") setDay(0);
  }, [autoTarget]);
  const [boxQuery, setBoxQuery] = useState("");
  const [archived, setArchived] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState(0);
  const [guardianEmail, setGuardianEmail] = useState("family@example.com");
  const [groupName, setGroupName] = useState("함께 먹는 약");
  const [groupIds, setGroupIds] = useState<string[]>([]);
  const [groupTime, setGroupTime] = useState("08:00");
  const doses = dailyDoses(state);
  const completed = doses.filter(
    (dose) => state.records[doseKey(dose.medicine.id, day, dose.time)],
  ).length;
  const todayCompleted = doses.filter(
    (dose) => state.records[doseKey(dose.medicine.id, 0, dose.time)],
  ).length;
  const selected =
    state.medicines.find((m) => m.id === selection.id) ?? selection;
  const fullScreenNotification =
    view === "notification" || view === "guardian-notification";
  const subpage = [
    "search",
    "form",
    "edit",
    "saved",
    "detail",
    "groups",
  ].includes(view);
  const activeTab = [
    "box",
    "detail",
    "groups",
    "form",
    "edit",
    "search",
    "saved",
  ].includes(view)
    ? "box"
    : view === "pharmacy"
      ? "pharmacy"
      : ["reminders", "care"].includes(view)
        ? "reminders"
        : "home";
  function choose(medicine: Medicine) {
    onSelection(medicine);
    onNavigate("form");
  }
  function save(medicine: Medicine) {
    const value =
      view === "edit"
        ? medicine
        : {
            ...medicine,
            id: state.medicines.some((m) => m.id === medicine.id)
              ? crypto.randomUUID()
              : medicine.id,
          };
    dispatch({ type: view === "edit" ? "update" : "add", medicine: value });
    onSelection(value);
    onNavigate(view === "edit" ? "detail" : "saved");
    onNotify(
      view === "edit"
        ? "변경 내용을 저장했어요."
        : "약과 복용 일정을 등록했어요.",
    );
  }
  function toggle(medicine: Medicine, time: string) {
    const wasTaken = Boolean(state.records[doseKey(medicine.id, day, time)]);
    dispatch({ type: "toggle", medicineId: medicine.id, day, time });
    onNotify(wasTaken ? "복용 기록을 취소했어요." : "복용을 기록했어요.");
  }
  return (
    <div
      className={`device-screen ${fullScreenNotification ? "lock-screen" : ""}`}
    >
      <div className="native-status">
        <span>9:41</span>
        <span className="camera-island" />
        <div className="system-icons">
          <span className="cell-bars">▂▄▆█</span>
          <span className="wifi-symbol" />
          <span className="battery-symbol" />
        </div>
      </div>
      {fullScreenNotification ? (
        <div className="notification-screen">
          <div className="lock-date">
            {new Intl.DateTimeFormat("ko-KR", {
              month: "long",
              day: "numeric",
              weekday: "long",
            }).format(dayDate(0))}
          </div>
          <div className="lock-time">
            {view === "notification" ? (doses[0]?.time ?? "08:00") : "08:00"}
          </div>
          <div className="os-notification">
            <div>
              <img src="/images/app-icon.png" alt="" />
              <span>PillNote</span>
              <small>지금</small>
            </div>
            <strong>
              {view === "notification"
                ? "복용 시간이에요"
                : "복용 기록을 확인해 주세요"}
            </strong>
            <p>
              {view === "notification"
                ? "PillNote에서 오늘의 복약을 확인해 보세요."
                : "연결한 가족의 복용 기록이 아직 확인되지 않았어요."}
            </p>
          </div>
          <button
            className="notification-open"
            onClick={() =>
              onNavigate(view === "notification" ? "home" : "care")
            }
          >
            알림 열기
            <ChevronRight size={18} />
          </button>
          <p className="notification-note">알림 화면 예시</p>
        </div>
      ) : (
        <div
          className={`native-content ${view === "pharmacy" ? "map-content" : ""}`}
          key={view}
        >
          {view === "home" && (
            <>
              <AppHeading
                title={
                  day === 0
                    ? "오늘의 복약"
                    : `${dayDate(day).getMonth() + 1}월 ${dayDate(day).getDate()}일 복약`
                }
                subtitle={`${new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", weekday: "long" }).format(dayDate(day))}`}
                right={
                  <button
                    className="icon-button"
                    aria-label="복용 알림 설정"
                    onClick={() => onNavigate("reminders")}
                  >
                    <Bell size={22} />
                  </button>
                }
              />
              <div className="native-calendar" aria-label="복약 날짜">
                {[-2, -1, 0, 1, 2].map((offset) => (
                  <button
                    key={offset}
                    className={day === offset ? "selected" : ""}
                    aria-pressed={day === offset}
                    aria-label={
                      offset === 0
                        ? "오늘 복약"
                        : `${offset < 0 ? "이전" : "다음"} ${Math.abs(offset)}일 복약`
                    }
                    onClick={() => setDay(offset)}
                  >
                    <span>
                      {new Intl.DateTimeFormat("ko-KR", {
                        weekday: "short",
                      }).format(dayDate(offset))}
                    </span>
                    <strong>{dayDate(offset).getDate()}</strong>
                    {offset === 0 && <i />}
                  </button>
                ))}
              </div>
              <div
                className={`native-progress ${completed === doses.length && doses.length ? "all-complete" : ""}`}
              >
                <div>
                  <strong>
                    {completed === doses.length && doses.length
                      ? "오늘의 복약 완료"
                      : "오늘 챙길 약"}
                  </strong>
                  <span>
                    <b>{completed}</b> / {doses.length}
                  </span>
                </div>
                <div className="native-progress-track">
                  <span
                    style={{
                      width: `${doses.length ? (completed / doses.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
              <div className="native-dose-list">
                {doses.map(({ medicine, time }, index) => {
                  const taken = Boolean(
                    state.records[doseKey(medicine.id, day, time)],
                  );
                  return (
                    <div className="native-dose" key={`${medicine.id}-${time}`}>
                      {(index === 0 || doses[index - 1].time !== time) && (
                        <div className="dose-time">{formatTime(time)}</div>
                      )}
                      <div className="native-dose-row">
                        <MedicineIcon medicine={medicine} />
                        <button
                          className="medicine-name"
                          onClick={() => {
                            onSelection(medicine);
                            onNavigate("detail");
                          }}
                        >
                          <strong>{medicine.name}</strong>
                          <span>
                            1회 {medicine.dosage}
                            {medicine.unit}
                            {taken ? " · 복용 완료" : ""}
                          </span>
                        </button>
                        <button
                          className={`native-check ${taken ? "checked" : ""} ${autoTarget === "take" && index === 0 ? "demo-tap-target" : ""}`}
                          aria-label={`${medicine.name} ${taken ? "복용 취소" : "복용 체크"}`}
                          aria-pressed={taken}
                          onClick={() => toggle(medicine, time)}
                        >
                          {taken && <Check size={20} strokeWidth={3} />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                className="native-add inline-button"
                onClick={() => {
                  onQuery("");
                  onNavigate("search");
                }}
              >
                <Plus size={18} />약 추가
              </button>
            </>
          )}
          {view === "search" && (
            <>
              <AppHeading
                title="약 추가"
                subtitle="1단계 · 약을 검색하거나 직접 입력하세요."
                back={() => onNavigate("box")}
              />
              <label
                className={`native-search ${autoTarget === "search" ? "auto-highlight" : ""}`}
              >
                <Search size={20} />
                <input
                  placeholder="약 이름을 입력해 주세요"
                  value={query}
                  onChange={(event) => onQuery(event.target.value)}
                  aria-label="추가할 약 검색"
                />
                <button
                  className="icon-button"
                  type="button"
                  onClick={() => onQuery("")}
                  aria-label="검색어 지우기"
                >
                  <X size={16} />
                </button>
              </label>
              <div className="search-results">
                {(query.trim()
                  ? [
                      vitamin,
                      {
                        ...vitamin,
                        id: "vitamin-c",
                        name: "비타민 C",
                        color: "pink",
                      },
                    ].filter((m) =>
                      m.name.toLowerCase().includes(query.trim().toLowerCase()),
                    )
                  : []
                ).map((medicine) => (
                  <button
                    className="native-search-result"
                    key={medicine.id}
                    onClick={() => choose(medicine)}
                  >
                    <MedicineIcon medicine={medicine} />
                    <span>
                      <strong>{medicine.name}</strong>
                      <small>미리보기 약 정보</small>
                    </span>
                    <ChevronRight size={20} />
                  </button>
                ))}
                {!query.trim() && (
                  <div className="native-empty">
                    <Search size={36} strokeWidth={1.3} />
                    <strong>포장에 적힌 이름으로 찾아보세요</strong>
                    <p>예시로 ‘비타민 D’를 검색해 볼 수 있어요.</p>
                  </div>
                )}
                {query.trim() &&
                  ![vitamin.name, "비타민 C"].some((name) =>
                    name.toLowerCase().includes(query.trim().toLowerCase()),
                  ) && (
                    <div className="native-empty">
                      <strong>예시에 없는 약이에요</strong>
                      <p>아래에서 이름을 직접 등록할 수 있어요.</p>
                    </div>
                  )}
              </div>
              <button
                className="app-primary"
                onClick={() =>
                  choose({
                    ...vitamin,
                    id: crypto.randomUUID(),
                    name: query.trim() || "내 약",
                    stock: 14,
                    color: "blue",
                  })
                }
              >
                검색 없이 직접 입력
              </button>
              <p className="app-explanation">
                실제 앱에서는 식약처 의약품 정보를 검색해요.
                <br />이 웹에서는 예시 검색 결과를 사용해요.
              </p>
            </>
          )}
          {(view === "form" || view === "edit") && (
            <MedicineForm
              key={`${view}-${selection.id}`}
              medicine={view === "edit" ? selected : selection}
              editing={view === "edit"}
              onSave={save}
              onBack={() => onNavigate(view === "edit" ? "detail" : "search")}
              autoTarget={autoTarget}
            />
          )}
          {view === "saved" && (
            <div className="saved-screen">
              <div className="saved-check">
                <Check size={45} strokeWidth={2.7} />
              </div>
              <h2>약을 등록했어요</h2>
              <p>{selected.name}</p>
              <div className="saved-summary">
                <div>
                  <span>복용 시간</span>
                  <strong>{selected.times.map(formatTime).join(" · ")}</strong>
                </div>
                <div>
                  <span>1회 복용량</span>
                  <strong>
                    {selected.dosage}
                    {selected.unit}
                  </strong>
                </div>
                <div>
                  <span>보유 수량</span>
                  <strong>
                    {selected.stock}
                    {selected.unit}
                  </strong>
                </div>
              </div>
              <button
                className="app-primary"
                onClick={() => onNavigate("home")}
              >
                오늘의 복약 보기
              </button>
              <button
                className="app-secondary"
                onClick={() => {
                  onQuery("");
                  onNavigate("search");
                }}
              >
                다른 약 추가
              </button>
            </div>
          )}
          {view === "box" && (
            <>
              <AppHeading
                title="내 약 상자"
                subtitle="약과 복용 일정을 한눈에 확인해요."
                right={
                  <button
                    className="icon-button"
                    aria-label="약 추가"
                    onClick={() => {
                      onQuery("");
                      onNavigate("search");
                    }}
                  >
                    <Plus size={23} />
                  </button>
                }
              />
              <label className="native-search">
                <Search size={19} />
                <input
                  value={boxQuery}
                  onChange={(event) => setBoxQuery(event.target.value)}
                  placeholder="내 약 이름 찾기"
                  aria-label="내 약 검색"
                />
              </label>
              <div className="native-filters">
                <button
                  className={!archived ? "selected" : ""}
                  aria-pressed={!archived}
                  onClick={() => setArchived(false)}
                >
                  관리 중 {state.medicines.filter((m) => !m.archived).length}
                </button>
                <button
                  className={archived ? "selected" : ""}
                  aria-pressed={archived}
                  onClick={() => setArchived(true)}
                >
                  보관 {state.medicines.filter((m) => m.archived).length}
                </button>
              </div>
              <div className="native-box-list">
                {state.medicines
                  .filter(
                    (m) =>
                      Boolean(m.archived) === archived &&
                      m.name.toLowerCase().includes(boxQuery.toLowerCase()),
                  )
                  .map((medicine) => (
                    <button
                      className="native-box-item"
                      key={medicine.id}
                      onClick={() => {
                        onSelection(medicine);
                        onNavigate("detail");
                      }}
                    >
                      <MedicineIcon medicine={medicine} />
                      <span>
                        <strong>{medicine.name}</strong>
                        <small>
                          매일 {medicine.times.join(" · ")} · {medicine.dosage}
                          {medicine.unit}
                        </small>
                        <span
                          className={
                            autoTarget === "stock"
                              ? "stock-value stock-highlight"
                              : "stock-value"
                          }
                        >
                          남은 수량{" "}
                          <b>
                            {medicine.stock}
                            {medicine.unit}
                          </b>
                        </span>
                      </span>
                      <ChevronRight size={18} />
                    </button>
                  ))}
              </div>
              {!state.medicines.some(
                (m) =>
                  Boolean(m.archived) === archived &&
                  m.name.toLowerCase().includes(boxQuery.toLowerCase()),
              ) && (
                <div className="native-empty">
                  <Pill size={30} />
                  <strong>
                    {boxQuery ? "찾는 약이 없어요" : "보관한 약이 없어요"}
                  </strong>
                </div>
              )}
              <button
                className="native-setting-row"
                onClick={() => onNavigate("groups")}
              >
                <span className="setting-icon">
                  <Layers size={21} />
                </span>
                <span>
                  <strong>약 묶음 관리</strong>
                  <small>함께 먹는 약을 한 번에</small>
                </span>
                <ChevronRight size={19} />
              </button>
              <button
                className="app-primary"
                onClick={() => {
                  onQuery("");
                  onNavigate("search");
                }}
              >
                약 추가
              </button>
            </>
          )}
          {view === "detail" && (
            <>
              <AppHeading title="약 상세" back={() => onNavigate("box")} />
              <div className="medicine-detail">
                <MedicineIcon medicine={selected} />
                <h2>{selected.name}</h2>
                <p>{selected.archived ? "보관 중" : "관리 중"}</p>
              </div>
              <div className="detail-properties">
                <div>
                  <span>남은 수량</span>
                  <strong>
                    {selected.stock}
                    {selected.unit}
                  </strong>
                </div>
                <div>
                  <span>1회 복용량</span>
                  <strong>
                    {selected.dosage}
                    {selected.unit}
                  </strong>
                </div>
                <div>
                  <span>복용 시간</span>
                  <strong>{selected.times.map(formatTime).join(" · ")}</strong>
                </div>
              </div>
              <button
                className="app-primary"
                onClick={() => {
                  onSelection(selected);
                  onNavigate("edit");
                }}
              >
                약과 일정 수정
              </button>
              <button
                className="app-secondary"
                onClick={() => {
                  dispatch({
                    type: "update",
                    medicine: { ...selected, archived: !selected.archived },
                  });
                  onNotify(
                    selected.archived
                      ? "다시 관리 중인 약으로 가져왔어요."
                      : "약을 보관했어요.",
                  );
                  onNavigate("box");
                }}
              >
                {selected.archived ? "다시 관리하기" : "약 보관하기"}
              </button>
            </>
          )}
          {view === "groups" && (
            <>
              <AppHeading
                title="약 묶음"
                subtitle="함께 먹는 약의 공통 시간을 정해요."
                back={() => onNavigate("box")}
              />
              {state.groups.map((group) => (
                <div className="native-group-summary" key={group.id}>
                  <Layers size={20} />
                  <div>
                    <strong>{group.name}</strong>
                    <p>
                      {state.medicines
                        .filter((m) => group.medicineIds.includes(m.id))
                        .map((m) => m.name)
                        .join(" · ")}
                      <br />
                      {formatTime(group.time)}
                    </p>
                  </div>
                </div>
              ))}
              <form
                className="group-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!groupIds.length) {
                    onNotify("묶을 약을 선택해 주세요.");
                    return;
                  }
                  dispatch({
                    type: "group",
                    group: {
                      id: crypto.randomUUID(),
                      name: groupName,
                      medicineIds: groupIds,
                      time: groupTime,
                    },
                  });
                  setGroupIds([]);
                  onNotify("약 묶음을 만들었어요.");
                }}
              >
                <label>
                  묶음 이름
                  <input
                    value={groupName}
                    onChange={(event) => setGroupName(event.target.value)}
                    required
                    maxLength={40}
                  />
                </label>
                <fieldset>
                  <legend>함께 먹는 약</legend>
                  {state.medicines
                    .filter((m) => !m.archived)
                    .map((m) => (
                      <label className="group-checkbox" key={m.id}>
                        <input
                          type="checkbox"
                          checked={groupIds.includes(m.id)}
                          onChange={() =>
                            setGroupIds(
                              groupIds.includes(m.id)
                                ? groupIds.filter((id) => id !== m.id)
                                : [...groupIds, m.id],
                            )
                          }
                        />
                        <span>{m.name}</span>
                      </label>
                    ))}
                </fieldset>
                <label>
                  공통 복용 시간
                  <input
                    type="time"
                    value={groupTime}
                    onChange={(event) => setGroupTime(event.target.value)}
                    required
                  />
                </label>
                <button className="app-primary">약 묶음 만들기</button>
                <p className="app-explanation">
                  개별 일정과 같은 시간은 한 번만 표시돼요.
                </p>
              </form>
            </>
          )}
          {view === "reminders" && (
            <>
              <AppHeading
                title="복용 시간 알림"
                subtitle="내가 정한 시간에 알려드려요."
              />
              <div className="reminder-hero-icon">
                <Bell size={48} strokeWidth={1.4} />
              </div>
              <div className="native-switch-row">
                <div>
                  <strong>복용 시간에 알림 받기</strong>
                  <span>이 기기에서 받아요</span>
                </div>
                <button
                  className={`native-switch ${state.reminders ? "on" : ""}`}
                  role="switch"
                  aria-checked={state.reminders}
                  aria-label="복용 시간 알림"
                  onClick={() => {
                    dispatch({ type: "reminders", enabled: !state.reminders });
                    onNotify(
                      state.reminders
                        ? "복용 알림을 껐어요."
                        : "복용 알림을 켰어요.",
                    );
                  }}
                >
                  <span />
                </button>
              </div>
              <div className="next-alarm">
                <span>설정한 알림 시간</span>
                <strong>
                  {state.reminders && doses.length
                    ? [...new Set(doses.map((dose) => dose.time))]
                        .map(formatTime)
                        .join(" · ")
                    : "예약된 알림이 없어요"}
                </strong>
              </div>
              <button
                className="app-secondary"
                disabled={!state.reminders || !doses.length}
                onClick={() => onNavigate("notification")}
              >
                알림 화면 보기
              </button>
              <button
                className="native-setting-row"
                onClick={() => onNavigate("care")}
              >
                <span className="setting-icon">
                  <Users size={22} />
                </span>
                <span>
                  <strong>보호자 연결</strong>
                  <small>복용 기록이 없으면 확인 요청</small>
                </span>
                <ChevronRight size={18} />
              </button>
              <p className="app-explanation">
                실제 앱에서 기기의 알림 권한을 허용하면
                <br />
                앱을 열지 않아도 알림을 받을 수 있어요.
              </p>
            </>
          )}
          {view === "care" && (
            <>
              <AppHeading
                title="보호자 연결"
                subtitle="함께 복약을 챙길 사람을 연결해요."
                back={() => onNavigate("reminders")}
              />
              <div className="care-account">
                <span>예시 계정</span>
                <strong>나의 PillNote</strong>
              </div>
              {state.guardian.status === "none" ? (
                <form
                  className="guardian-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    dispatch({
                      type: "guardian",
                      email: guardianEmail,
                      status: "pending",
                    });
                    onNotify("보호자 초대 예시를 만들었어요.");
                  }}
                >
                  <label>
                    보호자 이메일
                    <input
                      type="email"
                      value={guardianEmail}
                      onChange={(event) => setGuardianEmail(event.target.value)}
                      required
                      aria-label="보호자 이메일"
                    />
                  </label>
                  <button className="app-primary">보호자 초대하기</button>
                </form>
              ) : (
                <div className="guardian-person">
                  <div className="guardian-avatar">
                    <Users size={29} />
                  </div>
                  <div>
                    <strong>가족</strong>
                    <span>{state.guardian.email}</span>
                  </div>
                  <span
                    className={`guardian-status ${state.guardian.status === "connected" ? "connected" : ""}`}
                  >
                    {state.guardian.status === "connected"
                      ? "연결됨"
                      : "초대 대기"}
                  </span>
                </div>
              )}
              {state.guardian.status === "pending" && (
                <button
                  className="app-primary"
                  onClick={() => {
                    dispatch({
                      type: "guardian",
                      email: state.guardian.email,
                      status: "connected",
                    });
                    onNotify("보호자가 초대를 수락했어요.");
                  }}
                >
                  보호자의 초대 수락 체험
                </button>
              )}
              {state.guardian.status === "connected" && (
                <>
                  <div className="guardian-record-state">
                    <span>오늘의 복용 기록</span>
                    <strong>
                      {todayCompleted} / {doses.length}
                    </strong>
                    <p>
                      {todayCompleted === doses.length
                        ? "예정된 약을 모두 기록했어요."
                        : "아직 확인되지 않은 복용 기록이 있어요."}
                    </p>
                  </div>
                  <button
                    className="app-primary"
                    disabled={todayCompleted === doses.length}
                    onClick={() => onNavigate("guardian-notification")}
                  >
                    보호자 알림 보기
                  </button>
                  <button
                    className="app-secondary"
                    onClick={() => {
                      dispatch({ type: "guardian", email: "", status: "none" });
                      onNotify("보호자 연결 예시를 해제했어요.");
                    }}
                  >
                    연결 해제
                  </button>
                </>
              )}
              <p className="app-explanation">
                앱에서는 양쪽의 이메일 로그인과 초대 수락,
                <br />
                알림 설정이 필요해요. 웹에서는 이메일이 발송되지 않아요.
              </p>
              <p className="care-note">
                보호자 알림은 복용 기록의 확인을 요청해요.
                <br />
                실제 미복용을 확정하는 알림은 아니에요.
              </p>
            </>
          )}
          {view === "pharmacy" && (
            <>
              <div className="map-app-heading">
                <AppHeading
                  title="주변 약국"
                  subtitle="서울시청 주변 · 미리보기 위치"
                />
              </div>
              <PharmacyMap
                selected={selectedPharmacy}
                onSelect={setSelectedPharmacy}
              />
              <div className="pharmacy-sheet">
                <div className="sheet-handle" />
                <span className="sheet-kicker">
                  지도에서 약국을 눌러 보세요
                </span>
                <div className="pharmacy-details">
                  <span className="pharmacy-avatar">
                    <Plus size={24} />
                  </span>
                  <div>
                    <strong>{pharmacies[selectedPharmacy].name}</strong>
                    <span>
                      {pharmacies[selectedPharmacy].distance} ·{" "}
                      {pharmacies[selectedPharmacy].address}
                    </span>
                  </div>
                </div>
                <div className="pharmacy-options">
                  {pharmacies.map((pharmacy, index) => (
                    <button
                      key={pharmacy.name}
                      onClick={() => setSelectedPharmacy(index)}
                      className={selectedPharmacy === index ? "selected" : ""}
                      aria-pressed={selectedPharmacy === index}
                    >
                      {String.fromCharCode(65 + index)} {pharmacy.distance}
                    </button>
                  ))}
                </div>
                <p>약국 정보와 위치는 시연용 예시예요.</p>
              </div>
            </>
          )}
        </div>
      )}
      {!fullScreenNotification && !subpage && (
        <nav className="native-tabbar" aria-label="앱 하단 메뉴">
          {(
            [
              { key: "home", label: "홈", icon: House },
              { key: "box", label: "내 약 상자", icon: Pill },
              { key: "pharmacy", label: "약국", icon: MapPin },
              { key: "reminders", label: "설정", icon: Menu },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              className={activeTab === tab.key ? "active" : ""}
              aria-current={activeTab === tab.key ? "page" : undefined}
              onClick={() => onNavigate(tab.key)}
            >
              <tab.icon size={23} strokeWidth={1.6} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      )}
      {toast && !fullScreenNotification && (
        <div className="native-toast" role="status">
          <Check size={16} />
          {toast}
        </div>
      )}
      <div className="native-home-indicator" />
    </div>
  );
}
