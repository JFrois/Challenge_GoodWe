import {
  AlertTriangle,
  BatteryCharging,
  Bolt,
  Calendar,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Download,
  Filter,
  Gauge,
  Leaf,
  Loader2,
  MoreHorizontal,
  Power,
  Search,
  Sparkles,
  UsersRound,
  WalletCards,
  Wrench,
  Zap,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import {
  cancelReservationApi,
  fetchReservations,
  markInvoicePaid,
} from "@/data/apiClient"
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
  const { chargers, sessions, bookings, charges, adminMetrics, previsao, alertas } = useAppState()
  const [showForecast, setShowForecast] = useState(false)
  const active = chargers.filter((item) => item.status !== "offline").length
  const occupancy = chargers.length > 0
    ? Math.round(
        (chargers.filter(
          (item) => item.status === "charging" || item.status === "reserved",
        ).length /
          chargers.length) *
          100,
      )
    : 0

  const totalEnergy = adminMetrics?.totalEnergy ?? charges.reduce((acc, c) => acc + (c.energy || 0), 0)
  const totalRevenue = adminMetrics?.totalRevenue ?? charges.reduce((acc, c) => acc + (c.amount || 0), 0)
  const offlineChargers = chargers.filter((c) => c.status === "offline")
  const activeAlertsCount = adminMetrics?.activeAlerts ?? alertas?.length ?? 0

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl bg-navy p-5 text-white shadow-brand sm:p-6">
        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-300">
              <span className="size-2 rounded-full bg-cyan-300 shadow-[0_0_16px_var(--color-info)]" />
              Operação em tempo real · Gestão Preditiva
            </div>
            <Heading className="text-white" level={1}>
              Energia inteligente, operação tranquila.
            </Heading>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              {previsao
                ? `Modelo ML prevê ${previsao.kwh_total_previsto.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} kWh para o próximo ciclo (${previsao.taxa_ocupacao_transformador_pct}% da capacidade do transformador).`
                : "Todos os pontos estão sincronizados. A demanda atual está controlada dentro dos limites contratuais."}
            </p>
          </div>
          <div className="flex min-w-48 items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <div className="flex size-12 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-300">
              <Gauge size={26} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">
                Pico Previsto (IA)
              </p>
              <p className="text-2xl font-bold">
                {previsao ? `${previsao.pico_maximo_estimado_kw.toFixed(1)} kW` : "18,4 kW"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          accent="teal"
          change={`${chargers.length - active} em manutenção`}
          icon={Zap}
          label="Carregadores ativos"
          value={`${active}/${chargers.length}`}
        />
        <MetricCard
          accent="cyan"
          change={`${charges.length} unidades`}
          icon={BatteryCharging}
          label="Energia no mês"
          value={`${totalEnergy.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kWh`}
        />
        <MetricCard
          accent={activeAlertsCount > 0 ? "orange" : "teal"}
          change="Isolation Forest (IA)"
          icon={AlertTriangle}
          label="Alertas de Anomalia"
          value={String(activeAlertsCount)}
        />
        <MetricCard
          accent="brand"
          change={`${charges.filter((c) => c.status === "paid").length} pagas`}
          icon={CircleDollarSign}
          label="Receita rateada"
          value={`R$ ${totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        />
      </section>

      {/* Seção de Inteligência Artificial: Previsão de Demanda & Capacidade */}
      {previsao && (
        <Card className="border border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-surface to-surface p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
                Inteligência Artificial · Modelo Preditivo de Demanda (Ridge)
              </div>
              <Heading level={2} className="text-lg">
                Projeção do Próximo Ciclo & Capacidade do Transformador
              </Heading>
              <p className="text-sm text-ink-subtle max-w-3xl leading-relaxed">
                {previsao.recomendacao}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-xl border border-line bg-surface p-3 text-center min-w-[130px]">
                <p className="text-xs font-medium text-ink-muted">Projeção 30d</p>
                <p className="text-lg font-bold text-ink">
                  {previsao.kwh_total_previsto.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} kWh
                </p>
                <span className={`text-[11px] font-semibold ${previsao.variacao_percentual >= 0 ? "text-emerald-600" : "text-sky-600"}`}>
                  {previsao.variacao_percentual >= 0 ? `+${previsao.variacao_percentual}%` : `${previsao.variacao_percentual}%`} vs anterior
                </span>
              </div>
              <div className="rounded-xl border border-line bg-surface p-3 text-center min-w-[130px]">
                <p className="text-xs font-medium text-ink-muted">Pico Estimado</p>
                <p className="text-lg font-bold text-ink">{previsao.pico_maximo_estimado_kw.toFixed(1)} kW</p>
                <span className="text-[11px] text-ink-subtle">
                  Contratado: {previsao.capacidade_contratada_kw} kW
                </span>
              </div>
              <div className="rounded-xl border border-line bg-surface p-3 text-center min-w-[130px]">
                <p className="text-xs font-medium text-ink-muted">Ocupação Rede</p>
                <p className={`text-lg font-bold ${previsao.alerta_sobrecarga ? "text-danger" : "text-emerald-600"}`}>
                  {previsao.taxa_ocupacao_transformador_pct}%
                </p>
                <span className="text-[11px] font-medium text-ink-subtle">
                  {previsao.alerta_sobrecarga ? "Atenção: Sobrecarga" : "Margem Segura"}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Alertas Ativos da Rede (Isolation Forest) */}
      {alertas && alertas.length > 0 && (
        <Card className="border border-warning/30 bg-warning/5 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-warning/15 text-warning">
              <AlertTriangle size={20} />
            </div>
            <div>
              <Heading level={2} className="text-base">
                Anomalias Identificadas pela IA ({alertas.length})
              </Heading>
              <p className="text-xs text-ink-subtle">
                Triagem multivariada via Isolation Forest (análise de potência instantânea, taxa kWh/h e duração)
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {alertas.map((alerta: any, idx: number) => (
              <div
                key={alerta.id_alerta || idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-line bg-surface p-3 text-sm"
              >
                <div className="flex items-start gap-2.5">
                  <span className="mt-1.5 inline-block size-2 rounded-full bg-danger shrink-0" />
                  <div>
                    <p className="font-semibold text-ink">{alerta.mensagem}</p>
                    <p className="text-xs text-ink-subtle">
                      {alerta.criado_em ? new Date(alerta.criado_em).toLocaleString("pt-BR") : "Sessão avaliada"} · Unidade {alerta.id_unidade ? `Apto ${alerta.id_unidade}` : "Rede Geral"}
                    </p>
                  </div>
                </div>
                <span className="self-start sm:self-center shrink-0 rounded-full bg-danger/10 px-2.5 py-0.5 text-xs font-bold text-danger uppercase tracking-wide">
                  {alerta.severidade || "Alta"}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.75fr)]">
        <Card className="p-4 sm:p-5">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
            <div>
              <Heading level={2}>Consumo e Demanda</Heading>
              <p className="mt-1 text-sm text-ink-subtle">
                {showForecast ? "Projeção multivariada via modelo Ridge (próximos 14 dias)" : "Curva horária de distribuição da frota"}
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-line bg-surface-muted p-1">
              <button
                type="button"
                onClick={() => setShowForecast(false)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${!showForecast ? "bg-surface text-ink shadow-sm" : "text-ink-muted hover:text-ink"}`}
              >
                Histórico
              </button>
              <button
                type="button"
                onClick={() => setShowForecast(true)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${showForecast ? "bg-brand text-white shadow-sm" : "text-ink-muted hover:text-ink"}`}
              >
                <Sparkles size={13} /> Projeção IA (Ridge)
              </button>
            </div>
          </div>
          <EnergyAreaChart showForecast={showForecast} />
          <div className="flex flex-wrap gap-4 border-t border-line pt-4 text-xs font-semibold text-ink-muted">
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-info" /> Consumo:{" "}
              {energyData.reduce((sum, item) => sum + item.consumo, 0)} kWh
            </span>
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-brand" /> Pico: 128 kW
            </span>
            {showForecast && previsao && (
              <span className="flex items-center gap-2 text-emerald-600">
                <span className="size-2 rounded-full bg-emerald-500" /> Projeção 30d:{" "}
                {previsao.kwh_total_previsto.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} kWh
              </span>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <Heading level={2}>Status da rede</Heading>
              <p className="mt-1 text-sm text-ink-subtle">
                {chargers.length} pontos monitorados
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
                        width: `${Math.max((count / (chargers.length || 1)) * 100, 3)}%`,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          {offlineChargers.length > 0 ? (
            <div className="mt-6 rounded-xl border border-warning/20 bg-warning/5 p-3.5">
              <div className="flex gap-3">
                <AlertTriangle
                  className="mt-0.5 shrink-0 text-warning"
                  size={18}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-ink">
                    {offlineChargers.length === 1
                      ? "1 ponto em manutenção"
                      : `${offlineChargers.length} pontos em manutenção`}
                  </p>
                  <div className="mt-1.5 space-y-1 text-xs text-ink-muted">
                    {offlineChargers.map((c) => (
                      <p key={c.id}>
                        <strong className="text-ink">{c.name}</strong> ({c.location}): {c.nextAvailable && c.nextAvailable !== "Agora" ? c.nextAvailable : "Em manutenção preventiva"}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-success/20 bg-success/5 p-3.5">
              <div className="flex items-center gap-3">
                <CheckCircle2
                  className="shrink-0 text-success"
                  size={18}
                />
                <div>
                  <p className="text-sm font-bold text-ink">
                    Rede 100% operacional
                  </p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    Nenhum ponto em manutenção. Todos os {chargers.length} carregadores estão online.
                  </p>
                </div>
              </div>
            </div>
          )}
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
  const { chargers, dispatch, notify, authToken, refreshData } = useAppState()
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<ChargerStatus | "all">("all")
  const [selected, setSelected] = useState<Charger | null>(null)
  const [chargerBookings, setChargerBookings] = useState<any[]>([])
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [cancelingBookingId, setCancelingBookingId] = useState<string | number | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    if (!selected) {
      setChargerBookings((prev) => (prev.length === 0 ? prev : []))
      return
    }
    let active = true
    const load = async () => {
      setLoadingBookings(true)
      try {
        const chargerNumericId = selected.id.replace("ch-", "")
        const data = await fetchReservations(authToken || "", chargerNumericId)
        if (active) {
          setChargerBookings(data)
        }
      } catch (e) {
        console.error("Erro ao buscar agendamentos do carregador:", e)
      } finally {
        if (active) setLoadingBookings(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [selected, authToken])

  const handleCancelBooking = async (idReserva: number | string) => {
    setCancelingBookingId(idReserva)
    try {
      if (authToken) {
        await cancelReservationApi(authToken, idReserva)
      }
      setChargerBookings((prev) =>
        prev.map((b) =>
          b.id_reserva === idReserva
            ? { ...b, status_reserva: "cancelada" }
            : b,
        ),
      )
      dispatch({ type: "cancel-booking", id: String(idReserva) })
      notify("Agendamento cancelado com sucesso.", "info")
      await refreshData()
    } catch (err: any) {
      notify(
        `Erro ao cancelar agendamento: ${err?.message || "falha na requisição"}`,
        "danger",
      )
    } finally {
      setCancelingBookingId(null)
    }
  }

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
          disabled={isSyncing}
          onClick={async () => {
            setIsSyncing(true)
            try {
              await refreshData()
              notify(
                "Sincronização concluída. Carregadores e pontos atualizados diretamente do banco.",
                "success",
              )
            } catch (err: any) {
              notify("Erro ao sincronizar com o banco de dados.", "danger")
            } finally {
              setIsSyncing(false)
            }
          }}
        >
          <Power className={isSyncing ? "animate-spin" : ""} size={18} />
          {isSyncing ? "Sincronizando..." : "Sincronizar rede"}
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
          <Card
            key={charger.id}
            className="group cursor-pointer overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-md"
            onClick={() => setSelected(charger)}
          >
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
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelected(charger)
                  }}
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

            {/* Agendamentos para este carregador */}
            <div className="space-y-3 rounded-xl border border-line p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="text-brand" size={18} />
                  <h4 className="text-sm font-bold text-ink">
                    Agendamentos neste carregador
                  </h4>
                </div>
                <span className="text-xs font-medium text-ink-subtle">
                  {
                    chargerBookings.filter(
                      (b) => b.status_reserva !== "cancelada",
                    ).length
                  }{" "}
                  ativo(s)
                </span>
              </div>

              {loadingBookings ? (
                <div className="flex items-center justify-center py-6 text-xs text-ink-subtle">
                  <Loader2 className="mr-2 animate-spin text-brand" size={18} />
                  Carregando agendamentos...
                </div>
              ) : chargerBookings.length === 0 ? (
                <p className="py-2 text-xs text-ink-subtle">
                  Nenhum agendamento futuro encontrado para este carregador.
                </p>
              ) : (
                <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                  {chargerBookings.map((b) => {
                    const isCancelled = b.status_reserva === "cancelada"
                    const isCompleted = b.status_reserva === "concluida"
                    const canCancel = !isCancelled && !isCompleted

                    const start = b.dt_inicio_agendado
                      ? new Date(b.dt_inicio_agendado)
                      : null
                    const end = b.dt_fim_agendado
                      ? new Date(b.dt_fim_agendado)
                      : null
                    const dateStr = start
                      ? start.toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : ""
                    const timeStr =
                      start && end
                        ? `${start.toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })} - ${end.toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`
                        : ""

                    return (
                      <div
                        key={b.id_reserva}
                        className={`flex flex-col gap-2 rounded-lg border p-3 text-xs transition sm:flex-row sm:items-center sm:justify-between ${
                          isCancelled
                            ? "border-line bg-surface-muted/30 opacity-60"
                            : "border-line bg-surface-muted/60"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-ink">
                              {b.usuario_nome ||
                                `Morador (${b.unidade_cd || "Unidade"})`}
                            </span>
                            {b.unidade_cd && (
                              <span className="rounded border border-line bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-ink-muted">
                                Unidade {b.unidade_cd}
                              </span>
                            )}
                            <StatusBadge
                              tone={
                                isCancelled
                                  ? "danger"
                                  : isCompleted
                                    ? "success"
                                    : "warning"
                              }
                            >
                              {isCancelled
                                ? "Cancelado"
                                : isCompleted
                                  ? "Concluído"
                                  : "Agendado"}
                            </StatusBadge>
                          </div>
                          <p className="mt-1 text-ink-subtle">
                            {dateStr} às {timeStr}
                            {b.usuario_telefone &&
                              ` · Tel: ${b.usuario_telefone}`}
                          </p>
                        </div>

                        {canCancel && (
                          <Button
                            className="shrink-0 self-end text-xs text-danger hover:bg-danger/10 hover:text-danger sm:self-center"
                            disabled={cancelingBookingId === b.id_reserva}
                            onClick={() => handleCancelBooking(b.id_reserva)}
                            size="sm"
                            variant="secondary"
                          >
                            {cancelingBookingId === b.id_reserva
                              ? "Cancelando..."
                              : "Cancelar agendamento"}
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

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
                  const newStatus =
                    selected.status === "offline" ? "online" : "offline"
                  try {
                    await fetch(
                      `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/admin/carregadores/${selected.id.replace("ch-", "")}/status`,
                      {
                        method: "PUT",
                        headers: {
                          Authorization: `Bearer ${authToken}`,
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ status: newStatus }),
                      },
                    )
                    dispatch({ type: "toggle-maintenance", id: selected.id })
                    notify(
                      newStatus === "online"
                        ? "Ponto reativado."
                        : "Ponto colocado em manutenção.",
                      "info",
                    )
                    await refreshData()
                  } catch (e) {
                    console.error(e)
                  }
                  setSelected(null)
                }}
                variant={selected.status === "offline" ? "primary" : "secondary"}
              >
                <Wrench size={18} />{" "}
                {selected.status === "offline"
                  ? "Reativar ponto"
                  : "Colocar em manutenção"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export function AdminBilling() {
  const { charges, dispatch, notify, authToken, refreshData } = useAppState()
  const [markingPaidId, setMarkingPaidId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const handleMarkPaid = async (chargeId: string) => {
    setMarkingPaidId(chargeId)
    try {
      if (authToken) {
        await markInvoicePaid(authToken, chargeId)
      }
      dispatch({ type: "mark-paid", id: chargeId })
      notify("Pagamento confirmado e salvo com sucesso no banco de dados.", "success")
      await refreshData()
    } catch (err: any) {
      notify(
        `Erro ao registrar pagamento: ${err?.message || "falha na requisição"}`,
        "danger",
      )
    } finally {
      setMarkingPaidId(null)
    }
  }

  const totalEnergy = charges.reduce((sum, item) => sum + (Number(item.energy) || 0), 0)
  const total = charges.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
  const paid = charges
    .filter((item) => item.status === "paid")
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
  const adimplencia = total > 0 ? ((paid / total) * 100).toFixed(1) : "100"
  const tarifaMedia = totalEnergy > 0 ? (total / totalEnergy).toFixed(2) : "0,92"

  const filteredCharges = useMemo(() => {
    return charges.filter((c) => {
      const matchesSearch =
        c.resident.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.unit.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus =
        statusFilter === "all" || c.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [charges, searchQuery, statusFilter])

  const exportCsv = () => {
    const headers = ["ID", "Morador", "Unidade", "Energia (kWh)", "Valor (R$)", "Status"]
    const rows = filteredCharges.map((c) => [
      c.id,
      `"${c.resident}"`,
      `"${c.unit}"`,
      c.energy,
      c.amount.toFixed(2),
      c.status === "paid" ? "Pago" : c.status === "overdue" ? "Atrasado" : "Pendente"
    ])
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `faturas_rateio_2026-06.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    notify("Relatório CSV de faturas exportado com sucesso.")
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          accent="cyan"
          change={`${charges.length} unidades`}
          icon={Bolt}
          label="Energia rateada"
          value={`${totalEnergy.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kWh`}
        />
        <MetricCard
          accent="brand"
          change="Competência 2026-06"
          icon={WalletCards}
          label="Faturamento total"
          value={`R$ ${total.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        />
        <MetricCard
          accent="teal"
          change={`${charges.filter(c => c.status === "paid").length} faturas quitadas`}
          icon={CheckCircle2}
          label="Total recebido"
          value={`R$ ${paid.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        />
        <MetricCard
          accent="orange"
          change={Number(adimplencia) >= 90 ? "Saudável" : "Atenção"}
          icon={CreditCard}
          label="Taxa de adimplência"
          value={`${adimplencia}%`}
          trend={Number(adimplencia) >= 90 ? "up" : "down"}
        />
      </section>

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle"
              size={18}
            />
            <Input
              aria-label="Buscar morador ou unidade"
              className="pl-10"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por morador ou código da unidade..."
              value={searchQuery}
            />
          </div>
          <Select
            aria-label="Filtrar por status"
            onChange={(e) => setStatusFilter(e.target.value)}
            value={statusFilter}
          >
            <option value="all">Todos os status</option>
            <option value="pending">Pendentes</option>
            <option value="paid">Pagos</option>
            <option value="overdue">Atrasados</option>
          </Select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Heading level={2}>Faturamento e Rateio — Junho/2026</Heading>
            <p className="mt-1 text-sm text-ink-subtle">
              Tarifa média calculada: R$ {tarifaMedia.replace(".", ",")} por kWh · {charges.length} faturas geradas
            </p>
          </div>
          <Button onClick={exportCsv} variant="secondary">
            <Download size={18} /> Exportar relatório CSV
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
              {filteredCharges.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-ink-subtle">
                    Nenhuma fatura encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredCharges.map((charge) => (
                  <tr key={charge.id} className="hover:bg-surface-muted/60">
                    <td className="px-5 py-4 font-bold text-ink">
                      {charge.resident}
                    </td>
                    <td className="px-5 py-4 text-ink-muted">{charge.unit}</td>
                    <td className="px-5 py-4 text-ink-muted">
                      {charge.energy.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 })} kWh
                    </td>
                    <td className="px-5 py-4 font-bold">
                      R$ {charge.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                      {charge.status !== "paid" ? (
                        <Button
                          disabled={markingPaidId === charge.id}
                          onClick={() => handleMarkPaid(charge.id)}
                          size="sm"
                          variant="secondary"
                        >
                          {markingPaidId === charge.id
                            ? "Salvando..."
                            : "Marcar pago"}
                        </Button>
                      ) : (
                        <span className="text-xs font-semibold text-success">
                          ✓ Quitado
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="divide-y divide-line md:hidden">
          {filteredCharges.length === 0 ? (
            <div className="p-6 text-center text-ink-subtle">
              Nenhuma fatura encontrada.
            </div>
          ) : (
            filteredCharges.map((charge) => (
              <div key={charge.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{charge.resident}</p>
                    <p className="mt-1 text-xs text-ink-subtle">
                      Unidade {charge.unit} · {charge.energy.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 })} kWh
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
                    R$ {charge.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  {charge.status !== "paid" ? (
                    <Button
                      disabled={markingPaidId === charge.id}
                      onClick={() => handleMarkPaid(charge.id)}
                      size="sm"
                      variant="secondary"
                    >
                      {markingPaidId === charge.id
                        ? "Salvando..."
                        : "Marcar pago"}
                    </Button>
                  ) : (
                    <span className="text-xs font-semibold text-success">
                      ✓ Quitado
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}

export * from './AdminResidents';
export * from './AdminSettings';
