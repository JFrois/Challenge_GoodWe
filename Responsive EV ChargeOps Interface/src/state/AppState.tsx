import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react"
import type {
  AssistantMessage,
  Booking,
  Charge,
  Charger,
  ChargingSession,
  Role,
} from "@/types/domain"
import { fetchAdminDashboard, fetchResidentDashboard } from "@/data/apiClient"

type Toast = {
  id: string
  message: string
  tone: "success" | "info" | "danger"
}

type State = {
  role: Role | null
  authToken: string | null
  username: string | null
  unidadeId: number | null
  chargers: Charger[]
  bookings: Booking[]
  sessions: ChargingSession[]
  charges: Charge[]
  chartData: any[]
  messages: AssistantMessage[]
  toasts: Toast[]
  isLoading: boolean
  error: string | null
}

type SetAuthAction = {
  type: "set-auth"
  role: Role | null
  authToken: string | null
  username: string | null
  unidadeId: number | null
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
  type: "clear-messages" | "reset" | "logout"
}

type HydrateAction = {
  type: "hydrate"
  payload: Partial<State>
}

type FetchStateAction = {
  type: "set-fetch-state"
  isLoading: boolean
  error: string | null
}

type Action = SetAuthAction | SetRoleAction | AddBookingAction | IdAction | EndSessionAction | AddMessageAction | ToastAction | SimpleAction | HydrateAction | FetchStateAction

const STORAGE_KEY = "chargeops-state-v2"

const baseState: State = {
  role: null,
  authToken: null,
  username: null,
  unidadeId: null,
  chargers: [],
  bookings: [],
  sessions: [],
  charges: [],
  chartData: [],
  messages: [],
  toasts: [],
  isLoading: true,
  error: null,
}

function restoreState(): State {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return { ...baseState, isLoading: false }
    const parsed = JSON.parse(saved) as Partial<State>
    return {
      ...baseState,
      role: parsed.role || null,
      authToken: parsed.authToken || null,
      username: parsed.username || null,
      unidadeId: parsed.unidadeId || null,
      isLoading: false, // loaded from cache
      messages: Array.isArray(parsed.messages)
        ? parsed.messages.slice(-20)
        : [],
    }
  } catch {
    return { ...baseState, isLoading: false }
  }
}


function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "set-auth":
      return { 
        ...state, 
        role: action.role, 
        authToken: action.authToken, 
        username: action.username, 
        unidadeId: action.unidadeId 
      }
    case "set-role":
      return { ...state, role: action.role }
    case "hydrate":
      return { ...state, ...action.payload }
    case "set-fetch-state":
      return { ...state, isLoading: action.isLoading, error: action.error }
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
    case "logout":
      return { ...baseState, isLoading: false }
    case "reset":
      return { ...baseState, role: state.role, isLoading: false }
  }
}

type AppStateValue = State & {
  dispatch: React.Dispatch<Action>
  notify: (message: string, tone?: Toast["tone"]) => void
  refreshData: () => Promise<void>
}

const AppStateContext = createContext<AppStateValue | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, restoreState)

  const refreshData = async () => {
    if (!state.authToken) return;
    
    dispatch({ type: "set-fetch-state", isLoading: true, error: null })
    try {
      if (state.role === "admin") {
        const { charges, chargers, chartData } = await fetchAdminDashboard(state.authToken)
        dispatch({ type: "hydrate", payload: { charges, chargers, chartData } })
      } else {
        const { sessions, charge, chargers } = await fetchResidentDashboard(state.authToken)
          dispatch({
            type: "hydrate",
            payload: {
              sessions,
              charges: charge ? [charge] : [],
              chargers
            }
          })
      }
      dispatch({ type: "set-fetch-state", isLoading: false, error: null })
    } catch (err: any) {
      if (err.message.includes("401") || err.message.includes("403")) {
        dispatch({ type: "logout" })
      } else {
        dispatch({ type: "set-fetch-state", isLoading: false, error: err.message })
      }
    }
  }

  // Fetch real data on role change or mount
  useEffect(() => {
    refreshData()
  }, [state.role])

  // Sync basic state to localStorage
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        role: state.role,
        authToken: state.authToken,
        username: state.username,
        unidadeId: state.unidadeId,
        messages: state.messages,
      }),
    )
  }, [state.role, state.authToken, state.username, state.unidadeId, state.messages])

  const value = useMemo<AppStateValue>(
    () => ({
      ...state,
      dispatch,
      refreshData,
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
