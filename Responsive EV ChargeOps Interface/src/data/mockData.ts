import type { Booking, Charge, Charger, ChargingSession } from "@/types/domain"

export const chargers: Charger[] = [
  {
    id: "ch-01",
    name: "ChargePoint A1",
    location: "Garagem G1 · Vaga 04",
    connector: "Type 2",
    power: 22,
    status: "charging",
    user: "Marina Costa",
    energy: 18.4,
    nextAvailable: "10:30",
  },
  {
    id: "ch-02",
    name: "ChargePoint A2",
    location: "Garagem G1 · Vaga 05",
    connector: "Type 2",
    power: 22,
    status: "available",
    nextAvailable: "Agora",
  },
  {
    id: "ch-03",
    name: "ChargePoint B1",
    location: "Garagem G2 · Vaga 18",
    connector: "CCS 2",
    power: 50,
    status: "reserved",
    user: "Rafael Lima",
    nextAvailable: "14:00",
  },
  {
    id: "ch-04",
    name: "ChargePoint B2",
    location: "Garagem G2 · Vaga 19",
    connector: "Type 2",
    power: 22,
    status: "available",
    nextAvailable: "Agora",
  },
  {
    id: "ch-05",
    name: "ChargePoint C1",
    location: "Visitantes · Vaga 02",
    connector: "Type 2",
    power: 11,
    status: "offline",
    nextAvailable: "Em manutenção",
  },
]

export const bookings: Booking[] = [
  {
    id: "bk-2031",
    resident: "Ana Martins",
    chargerId: "ch-02",
    date: "2026-04-15",
    time: "18:30",
    duration: 90,
    status: "upcoming",
  },
  {
    id: "bk-2029",
    resident: "Rafael Lima",
    chargerId: "ch-03",
    date: "2026-04-15",
    time: "12:00",
    duration: 120,
    status: "upcoming",
  },
]

export const sessions: ChargingSession[] = [
  {
    id: "EV-8342",
    resident: "Marina Costa",
    chargerId: "ch-01",
    date: "Hoje, 08:12",
    duration: 118,
    energy: 18.4,
    cost: 21.71,
    status: "active",
  },
  {
    id: "EV-8338",
    resident: "Ana Martins",
    chargerId: "ch-04",
    date: "Ontem, 19:40",
    duration: 86,
    energy: 14.8,
    cost: 17.46,
    status: "completed",
  },
  {
    id: "EV-8329",
    resident: "Carlos Souza",
    chargerId: "ch-02",
    date: "13 abr, 21:05",
    duration: 142,
    energy: 24.6,
    cost: 29.03,
    status: "completed",
  },
  {
    id: "EV-8321",
    resident: "Ana Martins",
    chargerId: "ch-01",
    date: "11 abr, 18:20",
    duration: 72,
    energy: 12.2,
    cost: 14.4,
    status: "completed",
  },
]

export const charges: Charge[] = [
  {
    id: "fat-01",
    resident: "Ana Martins",
    unit: "804 B",
    energy: 42.6,
    amount: 50.27,
    status: "paid",
  },
  {
    id: "fat-02",
    resident: "Marina Costa",
    unit: "302 A",
    energy: 68.2,
    amount: 80.48,
    status: "pending",
  },
  {
    id: "fat-03",
    resident: "Rafael Lima",
    unit: "1201 B",
    energy: 57.9,
    amount: 68.32,
    status: "paid",
  },
  {
    id: "fat-04",
    resident: "Carlos Souza",
    unit: "506 A",
    energy: 31.4,
    amount: 37.05,
    status: "overdue",
  },
  {
    id: "fat-05",
    resident: "Beatriz Alves",
    unit: "1102 A",
    energy: 45.1,
    amount: 53.22,
    status: "pending",
  },
]

export const energyData = [
  { label: "Seg", consumo: 148, demanda: 72 },
  { label: "Ter", consumo: 210, demanda: 94 },
  { label: "Qua", consumo: 184, demanda: 82 },
  { label: "Qui", consumo: 252, demanda: 116 },
  { label: "Sex", consumo: 232, demanda: 105 },
  { label: "Sáb", consumo: 294, demanda: 128 },
  { label: "Dom", consumo: 268, demanda: 119 },
]

export const residentEnergyData = [
  { label: "Jan", consumo: 22 },
  { label: "Fev", consumo: 31 },
  { label: "Mar", consumo: 27 },
  { label: "Abr", consumo: 42.6 },
]

export const timeSlots = [
  "07:00",
  "08:30",
  "10:00",
  "12:00",
  "14:00",
  "16:30",
  "18:30",
  "20:00",
  "21:30",
]
