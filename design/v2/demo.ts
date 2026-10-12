export type Medicine = {
  id: string;
  name: string;
  dosage: number;
  unit: string;
  stock: number;
  times: string[];
  color: string;
  archived?: boolean;
};
export type Group = {
  id: string;
  name: string;
  medicineIds: string[];
  time: string;
};
export type DemoState = {
  medicines: Medicine[];
  records: Record<string, { deducted: number }>;
  groups: Group[];
  reminders: boolean;
  guardian: { email: string; status: "none" | "pending" | "connected" };
};
export type Action =
  | { type: "add"; medicine: Medicine }
  | { type: "update"; medicine: Medicine }
  | { type: "toggle"; medicineId: string; day: number; time: string }
  | { type: "group"; group: Group }
  | { type: "reminders"; enabled: boolean }
  | { type: "guardian"; email: string; status: DemoState["guardian"]["status"] }
  | { type: "reset" };

export const vitamin: Medicine = {
  id: "vitamin-d",
  name: "비타민 D",
  dosage: 1,
  unit: "정",
  stock: 30,
  times: ["13:00"],
  color: "amber",
};

export function initialState(): DemoState {
  return {
    medicines: [
      {
        id: "morning",
        name: "아침 처방약",
        dosage: 1,
        unit: "정",
        stock: 14,
        times: ["08:00"],
        color: "blue",
      },
      {
        id: "evening",
        name: "저녁 처방약",
        dosage: 1,
        unit: "정",
        stock: 14,
        times: ["20:00"],
        color: "pink",
      },
    ],
    records: {},
    groups: [],
    reminders: true,
    guardian: { email: "", status: "none" },
  };
}
export function doseKey(id: string, day: number, time: string) {
  return `${id}|${day}|${time}`;
}
export function dailyDoses(state: DemoState) {
  return state.medicines
    .filter((m) => !m.archived)
    .flatMap((medicine) => {
      const groupTimes = state.groups
        .filter((group) => group.medicineIds.includes(medicine.id))
        .map((group) => group.time);
      return [...new Set([...medicine.times, ...groupTimes])].map((time) => ({
        medicine,
        time,
      }));
    })
    .sort(
      (a, b) =>
        a.time.localeCompare(b.time) ||
        a.medicine.name.localeCompare(b.medicine.name),
    );
}
export function demoReducer(state: DemoState, action: Action): DemoState {
  switch (action.type) {
    case "add":
      if (state.medicines.some((m) => m.id === action.medicine.id))
        return state;
      return { ...state, medicines: [...state.medicines, action.medicine] };
    case "update":
      return {
        ...state,
        medicines: state.medicines.map((m) =>
          m.id === action.medicine.id ? action.medicine : m,
        ),
      };
    case "toggle": {
      const medicine = state.medicines.find((m) => m.id === action.medicineId);
      if (!medicine || medicine.archived) return state;
      const key = doseKey(medicine.id, action.day, action.time);
      const previous = state.records[key];
      const records = { ...state.records };
      const deducted = Math.min(medicine.stock, medicine.dosage);
      if (previous) delete records[key];
      else records[key] = { deducted };
      return {
        ...state,
        records,
        medicines: state.medicines.map((m) =>
          m.id === medicine.id
            ? {
                ...m,
                stock:
                  Math.round(
                    (previous
                      ? m.stock + previous.deducted
                      : m.stock - deducted) * 1e6,
                  ) / 1e6,
              }
            : m,
        ),
      };
    }
    case "group":
      return {
        ...state,
        groups: [
          ...state.groups.filter((g) => g.id !== action.group.id),
          action.group,
        ],
      };
    case "reminders":
      return { ...state, reminders: action.enabled };
    case "guardian":
      return {
        ...state,
        guardian: { email: action.email, status: action.status },
      };
    case "reset":
      return initialState();
  }
}
