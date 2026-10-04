export type Role = "admin" | "resident"

export type ChargerStatus = "available" | "charging" | "reserved" | "offline"

export type Charger = {
  id: string
  name: string
  location: string
  connector: string
  power: number
  status: ChargerStatus
  user?: string
  energy?: number
  nextAvailable: string
}

export type BookingStatus = "upcoming" | "active" | "completed" | "cancelled"

export type Booking = {
  id: string
  resident: string
  chargerId: string
  date: string
  time: string
  duration: number
  status: BookingStatus
}

export type ChargingSession = {
  id: string
  resident: string
  chargerId: string
  date: string
  duration: number
  energy: number
  cost: number
  status: "active" | "completed"
}

export type Charge = {
  id: string
  resident: string
  unit: string
  energy: number
  amount: number
  status: "paid" | "pending" | "overdue"
}

export type AssistantAction = {
  label: string
  path: string
}

export type AssistantMessage = {
  id: string
  sender: "assistant" | "user"
  text: string
  timestamp: string
  actions?: AssistantAction[]
}
