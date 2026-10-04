import {
  BarChart3,
  Bell,
  Bot,
  CalendarDays,
  CarFront,
  ChevronLeft,
  CreditCard,
  Gauge,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Sparkles,
  UserRound,
  UsersRound,
  X,
  Zap,
} from "lucide-react"
import { useEffect, useState } from "react"
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { Assistant } from "@/components/assistant/Assistant"
import { Button, Heading } from "@/components/ui"
import { useAppState } from "@/state/AppState"

const adminNav = [
  { to: "/admin/overview", label: "Visão geral", icon: LayoutDashboard },
  { to: "/admin/operations", label: "Operações", icon: Zap },
  { to: "/admin/billing", label: "Financeiro", icon: CreditCard },
]

const residentNav = [
  { to: "/resident/overview", label: "Início", icon: LayoutDashboard },
  { to: "/resident/chargers", label: "Carregadores", icon: CarFront },
  { to: "/resident/bookings", label: "Reservas", icon: CalendarDays },
  { to: "/resident/usage", label: "Consumo", icon: BarChart3 },
]

const titles: Record<string, string> = {
  "/admin/overview": "Central de operações",
  "/admin/operations": "Carregadores e sessões",
  "/admin/billing": "Gestão financeira",
  "/admin/residents": "Gerenciar moradores",
  "/admin/settings": "Configurações do sistema",
  "/resident/overview": "Olá, Ana",
  "/resident/chargers": "Encontrar carregador",
  "/resident/bookings": "Minhas reservas",
  "/resident/usage": "Meu consumo",
  "/resident/profile": "Meu perfil e veículo",
}

export default function AppShell() {
  const { role, dispatch, notify, isLoading, error } = useAppState()
  const [mobileMenu, setMobileMenu] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const navItems = role === "admin" ? adminNav : residentNav

  return (
    <div className="min-h-dvh bg-app text-ink">
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden border-r border-white/8 bg-navy text-white transition-[width] duration-300 lg:flex lg:flex-col ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="flex h-20 items-center gap-3 border-b border-white/8 px-5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand shadow-brand">
            <Zap fill="currentColor" size={22} />
          </div>
          {!collapsed && (
            <div>
              <p className="text-base font-extrabold tracking-tight">
                EV ChargeOps
              </p>
              <p className="text-[11px] font-medium text-slate-400">
                ENERGY MANAGEMENT
              </p>
            </div>
          )}
        </div>

        <nav
          aria-label="Navegação principal"
          className="flex-1 space-y-1 px-3 py-5"
        >
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              className={({ isActive }) =>
                `flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-white/10 text-white shadow-inner"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`
              }
              to={to}
            >
              <Icon size={20} />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-3">
          <div className="my-2 border-t border-white/8" />
          {role === "admin" ? (
            <>
              <NavLink
                to="/admin/residents"
                className={({ isActive }) =>
                  `flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors ${
                    isActive ? "bg-brand/10 text-brand" : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <UsersRound size={20} />
                {!collapsed && <span>Moradores</span>}
              </NavLink>
              <NavLink
                to="/admin/settings"
                className={({ isActive }) =>
                  `flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors ${
                    isActive ? "bg-brand/10 text-brand" : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <Settings size={20} />
                {!collapsed && <span>Configurações</span>}
              </NavLink>
            </>
          ) : (
            <NavLink
              to="/resident/profile"
              className={({ isActive }) =>
                `flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors ${
                  isActive ? "bg-brand/10 text-brand" : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <UserRound size={20} />
              {!collapsed && <span>Meu Perfil</span>}
            </NavLink>
          )}
        </div>

        <div className="border-t border-white/8 p-3">
          <Button
            className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10"
            onClick={() => {
              dispatch({ type: "logout" })
              navigate("/login")
            }}
            variant="secondary"
          >
            <LogOut size={18} />
            {!collapsed && <span>Sair da conta</span>}
          </Button>
        </div>
        <Button
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          className="absolute -right-4 top-24 size-8 min-h-8 rounded-full border-line bg-surface p-0 text-ink shadow-card hover:bg-surface-muted"
          onClick={() => setCollapsed((value) => !value)}
          variant="secondary"
        >
          <ChevronLeft
            className={`transition ${collapsed ? "rotate-180" : ""}`}
            size={16}
          />
        </Button>
      </aside>

      {mobileMenu && (
        <div
          className="fixed inset-0 z-50 bg-navy/70 backdrop-blur-sm lg:hidden"
          role="presentation"
          onMouseDown={() => setMobileMenu(false)}
        >
          <aside
            className="h-full w-[86%] max-w-sm bg-navy p-4 text-white"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-brand">
                  <Zap fill="currentColor" size={21} />
                </div>
                <span className="font-extrabold">EV ChargeOps</span>
              </div>
              <Button
                aria-label="Fechar menu"
                onClick={() => setMobileMenu(false)}
                size="icon"
                variant="ghost"
              >
                <X size={21} />
              </Button>
            </div>
            <nav aria-label="Navegação móvel" className="space-y-2">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  className={({ isActive }) =>
                    `flex min-h-12 items-center gap-3 rounded-xl px-4 font-semibold ${
                      isActive ? "bg-white/10 text-white" : "text-slate-400"
                    }`
                  }
                  onClick={() => setMobileMenu(false)}
                  to={to}
                >
                  <Icon size={20} />
                  {label}
                </NavLink>
              ))}
        </nav>

        <div className="p-3">
          <div className="my-2 border-t border-white/8" />
          {role === "admin" ? (
            <>
              <NavLink
                to="/admin/residents"
                className={({ isActive }) =>
                  `flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors ${
                    isActive ? "bg-brand/10 text-brand" : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <UsersRound size={20} />
                {!collapsed && <span>Moradores</span>}
              </NavLink>
              <NavLink
                to="/admin/settings"
                className={({ isActive }) =>
                  `flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors ${
                    isActive ? "bg-brand/10 text-brand" : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <Settings size={20} />
                {!collapsed && <span>Configurações</span>}
              </NavLink>
            </>
          ) : (
            <NavLink
              to="/resident/profile"
              className={({ isActive }) =>
                `flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors ${
                  isActive ? "bg-brand/10 text-brand" : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <UserRound size={20} />
              {!collapsed && <span>Meu Perfil</span>}
            </NavLink>
          )}
        </div>
            <Button
              className="mt-8 w-full"
              onClick={() => {
                dispatch({ type: "logout" })
                navigate("/login")
              }}
              variant="secondary"
            >
              <LogOut size={18} />
              Sair da conta
            </Button>
          </aside>
        </div>
      )}

      <div
        className={`transition-[padding] duration-300 ${
          collapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-line bg-app/88 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              aria-label="Abrir menu"
              className="lg:hidden"
              onClick={() => setMobileMenu(true)}
              size="icon"
              variant="ghost"
            >
              <Menu size={22} />
            </Button>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-ink-subtle">
                Residencial Aurora · São Paulo
              </p>
              <Heading className="truncate" level={2}>
                {titles[location.pathname] ?? "EV ChargeOps"}
              </Heading>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-full bg-success/10 px-3 py-1.5 text-xs font-bold text-success sm:flex">
              <span className="size-2 rounded-full bg-success" />
              Sistema online
            </div>
            <Button
              aria-label="Notificações"
              className="relative"
              size="icon"
              variant="ghost"
            >
              <Bell size={20} />
              <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-brand ring-2 ring-app" />
            </Button>
            <div className="flex size-10 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
              AM
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-screen-2xl px-4 pb-28 pt-5 sm:px-6 sm:pt-7 lg:px-8 lg:pb-10">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="size-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
            </div>
          ) : error ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <p className="text-lg font-semibold text-danger">Erro ao carregar os dados</p>
              <p className="mt-2 text-sm text-ink-subtle">{error}</p>
              <Button onClick={() => window.location.reload()} variant="secondary" className="mt-4">Tentar novamente</Button>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>

      <nav
        aria-label="Navegação inferior"
        className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-around rounded-2xl border border-line bg-surface/95 p-1.5 shadow-modal backdrop-blur-xl lg:hidden"
      >
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            className={({ isActive }) =>
              `flex min-w-16 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-bold transition ${
                isActive ? "bg-brand/10 text-brand" : "text-ink-subtle"
              }`
            }
            to={to}
          >
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <Assistant />
      <ToastRegion />
    </div>
  )
}

function ToastRegion() {
  const { toasts, dispatch } = useAppState()
  return (
    <div
      aria-live="polite"
      className="fixed right-4 top-22 z-[70] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 rounded-xl border bg-surface p-3 shadow-modal ${
            toast.tone === "danger"
              ? "border-danger/25"
              : toast.tone === "info"
                ? "border-info/25"
                : "border-success/25"
          }`}
        >
          {toast.tone === "info" ? (
            <Sparkles className="text-info" size={18} />
          ) : toast.tone === "danger" ? (
            <LogOut className="text-danger" size={18} />
          ) : (
            <Gauge className="text-success" size={18} />
          )}
          <p className="flex-1 text-sm font-semibold text-ink">
            {toast.message}
          </p>
          <Button
            aria-label="Dispensar aviso"
            onClick={() => dispatch({ type: "dismiss-toast", id: toast.id })}
            size="icon"
            variant="ghost"
          >
            <X size={16} />
          </Button>
        </div>
      ))}
    </div>
  )
}
