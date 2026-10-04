import {
  AlertTriangle,
  BatteryCharging,
  Bolt,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Download,
  Filter,
  Gauge,
  Leaf,
  MoreHorizontal,
  Power,
  Search,
  UsersRound,
  WalletCards,
  Wrench,
  Zap,
} from "lucide-react"
import { useMemo, useState } from "react"
import { EnergyAreaChart } from "@/components/Charts"
import MetricCard from "@/components/MetricCard"
import {
  Button,
  Card,
  Heading,
  Input,
  Modal,
  Select,
  StatusBadge,
} from "@/components/ui"
import { energyData } from "@/data/mockData"
import { useAppState } from "@/state/AppState"
import type { Charger, ChargerStatus } from "@/types/domain"

const statusMap: Record<ChargerStatus, {
  label: string
  tone: "success" | "warning" | "danger" | "info"
}> = {
  available: { label: "Disponível", tone: "success" },
  charging: { label: "Carregando", tone: "info" },
  reserved: { label: "Reservado", tone: "warning" },
  offline: { label: "Offline", tone: "danger" },
}

export function AdminOverview() {
  const { chargers, sessions, bookings } = useAppState()
  const active = chargers.filter((item) => item.status !== "offline").length
  const occupancy = Math.round(
    (chargers.filter(
      (item) => item.status === "charging" || item.status === "reserved",
    ).length /
      chargers.length) *
      100,
  )

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl bg-navy p-5 text-white shadow-brand sm:p-6">
        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-300">
              <span className="size-2 rounded-full bg-cyan-300 shadow-[0_0_16px_var(--color-info)]" />
              Operação em tempo real
            </div>
            <Heading className="text-white" level={1}>
              Energia inteligente, operação tranquila.
            </Heading>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Todos os pontos estão sincronizados. A demanda atual está 12%
              abaixo do pico contratado.
            </p>
          </div>
          <div className="flex min-w-48 items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <div className="flex size-12 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-300">
              <Gauge size={26} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">
                Demanda agora
              </p>
              <p className="text-2xl font-bold">18,4 kW</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          accent="teal"
          change="+1 unidade"
          icon={Zap}
          label="Carregadores ativos"
          value={`${active}/${chargers.length}`}
        />
        <MetricCard
          accent="cyan"
          change="+8,2%"
          icon={BatteryCharging}
          label="Energia no mês"
          value="1.284 kWh"
        />
        <MetricCard
          accent="orange"
          change="+4,1%"
          icon={UsersRound}
          label="Taxa de ocupação"
          value={`${occupancy}%`}
        />
        <MetricCard
          accent="brand"
          change="+11,6%"
          icon={CircleDollarSign}
          label="Receita rateada"
          value="R$ 1.516"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.75fr)]">
        <Card className="p-4 sm:p-5">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
            <div>
              <Heading level={2}>Consumo e demanda</Heading>
              <p className="mt-1 text-sm text-ink-subtle">
                Últimos 7 dias · dados simulados
              </p>
            </div>
            <Select aria-label="Período do gráfico" defaultValue="week">
              <option value="week">Esta semana</option>
              <option value="month">Este mês</option>
            </Select>
          </div>
          <EnergyAreaChart />
          <div className="flex flex-wrap gap-4 border-t border-line pt-4 text-xs font-semibold text-ink-muted">
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-info" /> Consumo:{" "}
              {energyData.reduce((sum, item) => sum + item.consumo, 0)} kWh
            </span>
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-brand" /> Pico: 128 kW
            </span>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <Heading level={2}>Status da rede</Heading>
              <p className="mt-1 text-sm text-ink-subtle">
                5 pontos monitorados
              </p>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-success/10 text-success">
              <Leaf size={21} />
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {([
              "available",
              "charging",
              "reserved",
              "offline",
            ] as ChargerStatus[]).map((status) => {
              const count = chargers.filter(
                (charger) => charger.status === status,
              ).length
              const colors = {
                available: "bg-success",
                charging: "bg-info",
                reserved: "bg-warning",
                offline: "bg-danger",
              }
              return (
                <div key={status}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-ink-muted">
                      {statusMap[status].label}
                    </span>
                    <span className="font-bold text-ink">{count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                    <div
                      className={`h-full rounded-full ${colors[status]}`}
                      style={{
                        width: `${Math.max((count / chargers.length) * 100, 3)}%`,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-6 rounded-xl border border-warning/20 bg-warning/5 p-3">
            <div className="flex gap-3">
              <AlertTriangle
                className="mt-0.5 shrink-0 text-warning"
                size={18}
              />
              <div>
                <p className="text-sm font-bold text-ink">
                  Manutenção preventiva
                </p>
                <p className="mt-1 text-xs leading-5 text-ink-muted">
                  ChargePoint C1 requer inspeção do conector.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-5 flex items-center justify-between">
            <Heading level={2}>Sessões recentes</Heading>
            <StatusBadge tone="info">
              {sessions.filter((item) => item.status === "active").length} ativa
            </StatusBadge>
          </div>
          <div className="space-y-1">
            {sessions.slice(0, 3).map((session) => (
              <div
                key={session.id}
                className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-surface-muted"
              >
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                    session.status === "active"
                      ? "bg-info/10 text-info"
                      : "bg-success/10 text-success"
                  }`}
                >
                  <Bolt size={19} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink">
                    {session.resident}
                  </p>
                  <p className="truncate text-xs text-ink-subtle">
                    {session.id} · {session.energy} kWh
                  </p>
                </div>
                <p className="text-sm font-bold text-ink">
                  R$ {session.cost.toFixed(2).replace(".", ",")}
                </p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <div className="mb-5 flex items-center justify-between">
            <Heading level={2}>Próximas reservas</Heading>
            <StatusBadge tone="warning">
              {bookings.filter((item) => item.status === "upcoming").length}{" "}
              agendadas
            </StatusBadge>
          </div>
          <div className="space-y-2">
            {bookings
              .filter((item) => item.status === "upcoming")
              .slice(0, 3)
              .map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center gap-3 rounded-xl border border-line p-3"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-warning/10 text-warning">
                    <Clock3 size={19} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink">
                      {booking.resident}
                    </p>
                    <p className="text-xs text-ink-subtle">
                      {booking.time} · {booking.duration} min
                    </p>
                  </div>
                  <p className="text-xs font-bold text-ink-muted">
                    {booking.chargerId.toUpperCase()}
                  </p>
                </div>
              ))}
          </div>
        </Card>
      </section>
    </div>
  )
}

export function AdminOperations() {
  const { chargers, dispatch, notify, authToken } = useAppState()
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<ChargerStatus | "all">("all")
  const [selected, setSelected] = useState<Charger | null>(null)
  const filtered = useMemo(
    () =>
      chargers.filter(
        (item) =>
          (filter === "all" || item.status === filter) &&
          `${item.name} ${item.location}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [chargers, filter, query],
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-ink-muted">
            Monitore disponibilidade, sessões e manutenção em tempo real.
          </p>
        </div>
        <Button
          onClick={() =>
            notify(
              "Sincronização concluída. Todos os pontos estão atualizados.",
              "info",
            )
          }
        >
          <Power size={18} /> Sincronizar rede
        </Button>
      </div>
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle"
              size={18}
            />
            <Input
              aria-label="Buscar carregador"
              className="pl-10"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por ponto ou localização"
              value={query}
            />
          </div>
          <Select
            aria-label="Filtrar por status"
            onChange={(event) =>
              setFilter(event.target.value as ChargerStatus | "all")
            }
            value={filter}
          >
            <option value="all">Todos os status</option>
            <option value="available">Disponíveis</option>
            <option value="charging">Carregando</option>
            <option value="reserved">Reservados</option>
            <option value="offline">Offline</option>
          </Select>
          <Button variant="secondary">
            <Filter size={18} /> Mais filtros
          </Button>
        </div>
      </Card>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((charger) => (
          <Card key={charger.id} className="overflow-hidden">
            <div
              className={`h-1.5 ${
                charger.status === "available"
                  ? "bg-success"
                  : charger.status === "charging"
                    ? "bg-info"
                    : charger.status === "reserved"
                      ? "bg-warning"
                      : "bg-danger"
              }`}
            />
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-navy text-cyan-300">
                    <Zap size={21} />
                  </div>
                  <div>
                    <Heading level={3}>{charger.name}</Heading>
                    <p className="mt-1 text-xs text-ink-subtle">
                      {charger.location}
                    </p>
                  </div>
                </div>
                <Button
                  aria-label={`Detalhes de ${charger.name}`}
                  onClick={() => setSelected(charger)}
                  size="icon"
                  variant="ghost"
                >
                  <MoreHorizontal size={20} />
                </Button>
              </div>
              <div className="my-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-surface-muted p-3">
                  <p className="text-[11px] font-semibold text-ink-subtle">
                    POTÊNCIA
                  </p>
                  <p className="mt-1 font-bold text-ink">{charger.power} kW</p>
                </div>
                <div className="rounded-xl bg-surface-muted p-3">
                  <p className="text-[11px] font-semibold text-ink-subtle">
                    CONECTOR
                  </p>
                  <p className="mt-1 font-bold text-ink">{charger.connector}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <StatusBadge tone={statusMap[charger.status].tone}>
                  {statusMap[charger.status].label}
                </StatusBadge>
                <p className="text-xs font-semibold text-ink-muted">
                  {charger.user ?? charger.nextAvailable}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </section>
      {filtered.length === 0 && (
        <Card className="p-10 text-center">
          <Heading level={3}>Nenhum carregador encontrado</Heading>
          <p className="mt-2 text-sm text-ink-subtle">
            Tente remover filtros ou buscar outro termo.
          </p>
        </Card>
      )}
      <Modal
        onClose={() => setSelected(null)}
        open={Boolean(selected)}
        title={selected?.name ?? "Detalhes"}
      >
        {selected && (
          <div className="space-y-5">
            <div className="rounded-2xl bg-navy p-5 text-white">
              <div className="flex items-center justify-between">
                <StatusBadge tone={statusMap[selected.status].tone}>
                  {statusMap[selected.status].label}
                </StatusBadge>
                <span className="text-sm font-bold">{selected.power} kW</span>
              </div>
              <p className="mt-6 text-lg font-bold">{selected.location}</p>
              <p className="mt-1 text-sm text-slate-400">
                {selected.connector} · ID {selected.id.toUpperCase()}
              </p>
            </div>
            {selected.user && (
              <div className="rounded-xl border border-line p-4">
                <p className="text-xs font-semibold text-ink-subtle">
                  USUÁRIO ATUAL
                </p>
                <p className="mt-1 font-bold">{selected.user}</p>
                {selected.energy && (
                  <p className="mt-1 text-sm text-ink-muted">
                    {selected.energy} kWh entregues
                  </p>
                )}
              </div>
            )}
            <div className="flex flex-col gap-2 sm:flex-row">
              {selected.status === "charging" && (
                <Button
                  className="flex-1"
                  onClick={() => {
                    dispatch({ type: "end-session", chargerId: selected.id })
                    notify("Sessão encerrada e ponto liberado.")
                    setSelected(null)
                  }}
                >
                  <CheckCircle2 size={18} /> Encerrar sessão
                </Button>
              )}
              <Button
                className="flex-1"
                onClick={async () => {
                    const newStatus = selected.status === "offline" ? "online" : "offline"
                    try {
                      await fetch(`${(import.meta.env.VITE_API_URL || 'http://localhost:8000')}/api/admin/carregadores/${selected.id.replace('ch-', '')}/status`, {
                        method: "PUT",
                        headers: { 
                          "Authorization": `Bearer ${authToken}`,
                          "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ status: newStatus })
                      })
                      dispatch({ type: "toggle-maintenance", id: selected.id })
                      notify(
                        newStatus === "online" ? "Ponto reativado." : "Ponto colocado em manutenção.",
                        "info"
                      )
                    } catch (e) {
                      console.error(e)
                    }
                    setSelected(null)
                  }}
                variant="secondary"
              >
                <Wrench size={18} />{" "}
                {selected.status === "offline"
                  ? "Reativar ponto"
                  : "Manutenção"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export function AdminBilling() {
  const { charges, dispatch, notify, authToken } = useAppState()
  const total = charges.reduce((sum, item) => sum + item.amount, 0)
  const paid = charges
    .filter((item) => item.status === "paid")
    .reduce((sum, item) => sum + item.amount, 0)

  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          accent="cyan"
          change="+8,2%"
          icon={Bolt}
          label="Energia rateada"
          value="1.284 kWh"
        />
        <MetricCard
          accent="brand"
          change="+11,6%"
          icon={WalletCards}
          label="Faturamento"
          value={`R$ ${total.toFixed(2).replace(".", ",")}`}
        />
        <MetricCard
          accent="teal"
          change="+6,4%"
          icon={CheckCircle2}
          label="Recebido"
          value={`R$ ${paid.toFixed(2).replace(".", ",")}`}
        />
        <MetricCard
          accent="orange"
          change="-2,1%"
          icon={CreditCard}
          label="Adimplência"
          value="94,2%"
          trend="down"
        />
      </section>
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Heading level={2}>Cobranças de abril</Heading>
            <p className="mt-1 text-sm text-ink-subtle">
              Rateio calculado a R$ 1,18 por kWh
            </p>
          </div>
          <Button
            onClick={() =>
              notify("Relatório preparado para demonstração.", "info")
            }
            variant="secondary"
          >
            <Download size={18} /> Exportar relatório
          </Button>
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted text-xs uppercase tracking-wider text-ink-subtle">
              <tr>
                <th className="px-5 py-3">Morador</th>
                <th className="px-5 py-3">Unidade</th>
                <th className="px-5 py-3">Consumo</th>
                <th className="px-5 py-3">Valor</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {charges.map((charge) => (
                <tr key={charge.id} className="hover:bg-surface-muted/60">
                  <td className="px-5 py-4 font-bold text-ink">
                    {charge.resident}
                  </td>
                  <td className="px-5 py-4 text-ink-muted">{charge.unit}</td>
                  <td className="px-5 py-4 text-ink-muted">
                    {charge.energy} kWh
                  </td>
                  <td className="px-5 py-4 font-bold">
                    R$ {charge.amount.toFixed(2).replace(".", ",")}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge
                      tone={
                        charge.status === "paid"
                          ? "success"
                          : charge.status === "overdue"
                            ? "danger"
                            : "warning"
                      }
                    >
                      {charge.status === "paid"
                        ? "Pago"
                        : charge.status === "overdue"
                          ? "Atrasado"
                          : "Pendente"}
                    </StatusBadge>
                  </td>
                  <td className="px-5 py-4 text-right">
                    {charge.status !== "paid" && (
                      <Button
                        onClick={() => {
                          dispatch({ type: "mark-paid", id: charge.id })
                          notify("Pagamento confirmado.")
                        }}
                        size="sm"
                        variant="secondary"
                      >
                        Marcar pago
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="divide-y divide-line md:hidden">
          {charges.map((charge) => (
            <div key={charge.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{charge.resident}</p>
                  <p className="mt-1 text-xs text-ink-subtle">
                    Unidade {charge.unit} · {charge.energy} kWh
                  </p>
                </div>
                <StatusBadge
                  tone={
                    charge.status === "paid"
                      ? "success"
                      : charge.status === "overdue"
                        ? "danger"
                        : "warning"
                  }
                >
                  {charge.status === "paid"
                    ? "Pago"
                    : charge.status === "overdue"
                      ? "Atrasado"
                      : "Pendente"}
                </StatusBadge>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="font-bold">
                  R$ {charge.amount.toFixed(2).replace(".", ",")}
                </p>
                {charge.status !== "paid" && (
                  <Button
                    onClick={() => {
                      dispatch({ type: "mark-paid", id: charge.id })
                      notify("Pagamento confirmado.")
                    }}
                    size="sm"
                    variant="secondary"
                  >
                    Marcar pago
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export * from './AdminResidents';
export * from './AdminSettings';
