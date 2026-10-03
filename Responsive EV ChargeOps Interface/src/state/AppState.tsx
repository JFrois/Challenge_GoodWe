import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react"
import {
  bookings as initialBookings,
  charges as initialCharges,
  chargers as initialChargers,
  sessions as initialSessions,
} from "@/data/mockData"
import type {
  AssistantMessage,
  Booking,
  Charge,
  Charger,
  ChargingSession,
  Role,
} from "@/types/domain"

type Toast = {
  id: string
  message: string
  tone: "success" | "info" | "danger"
}

type State = {
  role: Role
  chargers: Charger[]
  bookings: Booking[]
  sessions: ChargingSession[]
  charges: Charge[]
  messages: AssistantMessage[]
  toasts: Toast[]
}

type SetRoleAction = {
  type: "set-role"
  role: Role
}

type AddBookingAction = {
  type: "add-booking"
  booking: Booking
}

type IdAction = {
  type: "cancel-booking" | "toggle-maintenance" | "mark-paid" | "dismiss-toast"
  id: string
}

type EndSessionAction = {
  type: "end-session"
  chargerId: string
}

type AddMessageAction = {
  type: "add-message"
  message: AssistantMessage
}

type ToastAction = {
  type: "toast"
  toast: Toast
}

type SimpleAction = {
  type: "clear-messages" | "reset"
}

type Action = SetRoleAction | AddBookingAction | IdAction | EndSessionAction | AddMessageAction | ToastAction | SimpleAction

const STORAGE_KEY = "chargeops-state-v1"

const baseState: State = {
  role: "admin",
  chargers: initialChargers,
  bookings: initialBookings,
  sessions: initialSessions,
  charges: initialCharges,
  messages: [],
  toasts: [],
}

function restoreState(): State {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return baseState
    const parsed = JSON.parse(saved) as Partial<State>
    if (parsed.role !== "admin" && parsed.role !== "resident") return baseState
    return {
      ...baseState,
      role: parsed.role,
      bookings: Array.isArray(parsed.bookings)
        ? parsed.bookings
        : baseState.bookings,
      chargers: Array.isArray(parsed.chargers)
        ? parsed.chargers
        : baseState.chargers,
      charges: Array.isArray(parsed.charges)
        ? parsed.charges
        : baseState.charges,
      messages: Array.isArray(parsed.messages)
        ? parsed.messages.slice(-20)
        : [],
    }
  } catch {
    return baseState
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "set-role":
      return { ...state, role: action.role }
    case "add-booking":
      return {
        ...state,
        bookings: [action.booking, ...state.bookings],
        chargers: state.chargers.map((item) =>
          item.id === action.booking.chargerId && item.status === "available"
            ? { ...item, status: "reserved" }
            : item,
        ),
      }
    case "cancel-booking": {
      const booking = state.bookings.find((item) => item.id === action.id)
      return {
        ...state,
        bookings: state.bookings.map((item) =>
          item.id === action.id ? { ...item, status: "cancelled" } : item,
        ),
        chargers: state.chargers.map((item) =>
          item.id === booking?.chargerId && item.status === "reserved"
            ? { ...item, status: "available", user: undefined }
            : item,
        ),
      }
    }
    case "toggle-maintenance":
      return {
        ...state,
        chargers: state.chargers.map((item) =>
          item.id === action.id
            ? {
                ...item,
                status: item.status === "offline" ? "available" : "offline",
              }
            : item,
        ),
      }
    case "end-session":
      return {
        ...state,
        chargers: state.chargers.map((item) =>
          item.id === action.chargerId
            ? {
                ...item,
                status: "available",
                user: undefined,
                energy: undefined,
              }
            : item,
        ),
        sessions: state.sessions.map((item) =>
          item.chargerId === action.chargerId && item.status === "active"
            ? { ...item, status: "completed" }
            : item,
        ),
      }
    case "mark-paid":
      return {
        ...state,
        charges: state.charges.map((item) =>
          item.id === action.id ? { ...item, status: "paid" } : item,
        ),
      }
    case "add-message":
      return {
        ...state,
        messages: [...state.messages, action.message].slice(-20),
      }
    case "clear-messages":
      return { ...state, messages: [] }
    case "toast":
      return { ...state, toasts: [...state.toasts, action.toast] }
    case "dismiss-toast":
      return {
        ...state,
        toasts: state.toasts.filter((item) => item.id !== action.id),
      }
    case "reset":
      return { ...baseState, role: state.role }
  }
}

type AppStateValue = State & {
  dispatch: React.Dispatch<Action>
  notify: (message: string, tone?: Toast["tone"]) => void
}

const AppStateContext = createContext<AppStateValue | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, restoreState)

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        role: state.role,
        chargers: state.chargers,
        bookings: state.bookings,
        charges: state.charges,
        messages: state.messages,
      }),
    )
  }, [
    state.role,
    state.chargers,
    state.bookings,
    state.charges,
    state.messages,
  ])

  const value = useMemo<AppStateValue>(
    () => ({
      ...state,
      dispatch,
      notify: (message, tone = "success") => {
        const id = crypto.randomUUID()
        dispatch({ type: "toast", toast: { id, message, tone } })
        window.setTimeout(() => dispatch({ type: "dismiss-toast", id }), 3500)
      },
    }),
    [state],
  )

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  )
}

export function useAppState() {
  const value = useContext(AppStateContext)
  if (!value)
    throw new Error("useAppState must be used inside AppStateProvider")
  return value
}
