import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import AppShell from "@/app/AppShell"
import {
  AdminBilling,
  AdminOperations,
  AdminOverview,
  AdminResidents,
  AdminSettings,
} from "@/features/admin/AdminPages"
import {
  ResidentBookings,
  ResidentChargers,
  ResidentOverview,
  ResidentUsage,
  ResidentProfile,
} from "@/features/resident/ResidentPages"
import { AppStateProvider, useAppState } from "@/state/AppState"
import { Login } from "@/features/auth/Login"

function HomeRedirect() {
  const { role, authToken } = useAppState()
  if (!authToken) {
    return <Navigate replace to="/login" />
  }
  return (
    <Navigate
      replace
      to={role === "admin" ? "/admin/overview" : "/resident/overview"}
    />
  )
}

function RequireAuth({ children, requiredRole }: { children: JSX.Element, requiredRole?: "admin" | "resident" }) {
  const { authToken, role } = useAppState()
  
  if (!authToken) {
    return <Navigate replace to="/login" />
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate replace to={role === "admin" ? "/admin/overview" : "/resident/overview"} />
  }

  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Admin Routes */}
      <Route element={<RequireAuth requiredRole="admin"><AppShell /></RequireAuth>}>
        <Route element={<AdminOverview />} path="admin/overview" />
        <Route element={<AdminOperations />} path="admin/operations" />
        <Route element={<AdminBilling />} path="admin/billing" />
        <Route element={<AdminResidents />} path="admin/residents" />
        <Route element={<AdminSettings />} path="admin/settings" />
      </Route>

      {/* Resident Routes */}
      <Route element={<RequireAuth requiredRole="resident"><AppShell /></RequireAuth>}>
        <Route element={<ResidentOverview />} path="resident/overview" />
        <Route element={<ResidentChargers />} path="resident/chargers" />
        <Route element={<ResidentBookings />} path="resident/bookings" />
        <Route element={<ResidentUsage />} path="resident/usage" />
        <Route element={<ResidentProfile />} path="resident/profile" />
      </Route>

      {/* Default Fallback */}
      <Route element={<HomeRedirect />} path="*" />
      <Route element={<HomeRedirect />} path="/" index />
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
