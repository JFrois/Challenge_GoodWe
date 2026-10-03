import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import AppShell from "@/app/AppShell"
import {
  AdminBilling,
  AdminOperations,
  AdminOverview,
} from "@/features/admin/AdminPages"
import {
  ResidentBookings,
  ResidentChargers,
  ResidentOverview,
  ResidentUsage,
} from "@/features/resident/ResidentPages"
import { AppStateProvider, useAppState } from "@/state/AppState"

function HomeRedirect() {
  const { role } = useAppState()
  return (
    <Navigate
      replace
      to={role === "admin" ? "/admin/overview" : "/resident/overview"}
    />
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route element={<HomeRedirect />} index />
        <Route element={<AdminOverview />} path="admin/overview" />
        <Route element={<AdminOperations />} path="admin/operations" />
        <Route element={<AdminBilling />} path="admin/billing" />
        <Route element={<ResidentOverview />} path="resident/overview" />
        <Route element={<ResidentChargers />} path="resident/chargers" />
        <Route element={<ResidentBookings />} path="resident/bookings" />
        <Route element={<ResidentUsage />} path="resident/usage" />
        <Route element={<HomeRedirect />} path="*" />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppStateProvider>
        <AppRoutes />
      </AppStateProvider>
    </BrowserRouter>
  )
}
