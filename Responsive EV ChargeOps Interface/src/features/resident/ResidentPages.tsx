import {
  ArrowRight,
  BatteryCharging,
  CalendarCheck2,
  CalendarDays,
  CarFront,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Gauge,
  History,
  Info,
  Leaf,
  MapPin,
  PlugZap,
  Search,
  Sparkles,
  Wallet,
  XCircle,
  Zap,
} from "lucide-react"
import { useMemo, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { ResidentBarChart } from "@/components/Charts"
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
import { timeSlots } from "@/data/mockData"
import { useAppState } from "@/state/AppState"
import type { Booking, Charger, ChargerStatus } from "@/types/domain"

const statusMap: Record<ChargerStatus, {
  label: string
  tone: "success" | "warning" | "danger" | "info"
}> = {
  available: { label: "Disponível agora", tone: "success" },
  charging: { label: "Em uso", tone: "info" },
  reserved: { label: "Reservado", tone: "warning" },
  offline: { label: "Indisponível", tone: "danger" },
}

export function ResidentOverview() {
  const { bookings, chargers, sessions } = useAppState()
  const nextBooking = bookings.find(
    (item) => item.resident === "Ana Martins" && item.status === "upcoming",
  )
  const available = chargers.filter((item) => item.status === "available")

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-3xl bg-navy p-5 text-white shadow-brand sm:p-7">
        <div className="absolute -right-20 -top-24 size-64 rounded-full bg-info/20 blur-3xl" />
        <div className="absolute bottom-0 right-10 size-32 rounded-full bg-success/15 blur-2xl" />
        <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-bold text-cyan-300">
              <Sparkles size={14} /> Sua energia hoje
            </div>
            <Heading className="max-w-xl text-white" level={1}>
              Seu carro pronto quando você estiver.
            </Heading>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Reserve um ponto em poucos passos e acompanhe seu consumo sem
              surpresas.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-bold text-white shadow-brand transition hover:bg-brand-strong"
                to="/resident/bookings"
              >
                Nova reserva <ArrowRight size={18} />
              </Link>
              <Link
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-sm font-bold text-white transition hover:bg-white/10"
                to="/resident/chargers"
              >
                Ver pontos
              </Link>
            </div>
          </div>
          <div className="flex size-36 items-center justify-center justify-self-center rounded-full border border-white/10 bg-white/5 p-4 shadow-inner md:size-44">
            <div className="flex size-full flex-col items-center justify-center rounded-full border-4 border-info/70 bg-navy">
              <p className="text-3xl font-extrabold">42,6</p>
              <p className="text-xs font-semibold text-slate-400">
                kWh em abril
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <MetricCard
          accent="cyan"
          change="+4,8 kWh"
          icon={BatteryCharging}
          label="Consumo no mês"
          value="42,6 kWh"
        />
        <MetricCard
          accent="brand"
          change="+R$ 5,66"
          icon={Wallet}
          label="Custo estimado"
          value="R$ 50,27"
        />
        <MetricCard
          accent="teal"
          change="-12 min"
          icon={Clock3}
          label="Tempo médio"
          trend="down"
          value="1h 19min"
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.7fr)]">
        <Card className="p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <Heading level={2}>Disponíveis agora</Heading>
              <p className="mt-1 text-sm text-ink-subtle">
                {available.length} pontos prontos para usar
              </p>
            </div>
            <Link
              className="text-sm font-bold text-brand hover:underline"
              to="/resident/chargers"
            >
              Ver todos
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {available.map((charger) => (
              <div
                key={charger.id}
                className="rounded-2xl border border-line p-4 transition hover:border-success/35 hover:bg-success/5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-success/10 text-success">
                    <PlugZap size={20} />
                  </div>
                  <StatusBadge tone="success">Livre</StatusBadge>
                </div>
                <p className="mt-4 font-bold text-ink">{charger.name}</p>
                <p className="mt-1 text-xs text-ink-subtle">
                  {charger.location}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs font-semibold text-ink-muted">
                  <span>{charger.power} kW</span>
                  <span>{charger.connector}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="bg-brand p-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-white/15">
                <CalendarCheck2 size={21} />
              </div>
              <StatusBadge tone="neutral">Próxima</StatusBadge>
            </div>
            <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-rose-100">
              Sua próxima reserva
            </p>
            <p className="mt-1 text-xl font-bold">
              {nextBooking ? "Hoje, 18:30" : "Nenhuma reserva"}
            </p>
          </div>
          {nextBooking ? (
            <div className="p-5">
              <p className="font-bold text-ink">
                {
                  chargers.find((item) => item.id === nextBooking.chargerId)
                    ?.name
                }
              </p>
              <p className="mt-1 text-sm text-ink-subtle">
                {nextBooking.duration} min · até 33 kWh estimados
              </p>
              <Link
                className="mt-5 flex min-h-11 items-center justify-between rounded-xl bg-surface-muted px-4 text-sm font-bold text-ink transition hover:bg-line"
                to="/resident/bookings"
              >
                Ver detalhes <ChevronRight size={18} />
              </Link>
            </div>
          ) : (
            <div className="p-5 text-sm text-ink-subtle">
              Escolha um ponto e encontre o melhor horário para você.
            </div>
          )}
        </Card>
      </section>

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <Heading level={2}>Últimas sessões</Heading>
          <Link className="text-sm font-bold text-brand" to="/resident/usage">
            Ver consumo
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {sessions
            .filter((item) => item.resident === "Ana Martins")
            .map((session) => (
              <div
                key={session.id}
                className="flex items-center gap-3 rounded-xl bg-surface-muted p-3"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-info/10 text-info">
                  <Zap size={18} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{session.date}</p>
                  <p className="text-xs text-ink-subtle">
                    {session.energy} kWh · R${" "}
                    {session.cost.toFixed(2).replace(".", ",")}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  )
}

export function ResidentChargers() {
  const { chargers } = useAppState()
  const [query, setQuery] = useState("")
  const [power, setPower] = useState("all")
  const filtered = useMemo(
    () =>
      chargers.filter(
        (item) =>
          (power === "all" || item.power >= Number(power)) &&
          `${item.name} ${item.location}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [chargers, power, query],
  )

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-ink-muted">
          Encontre o ponto ideal por disponibilidade, localização e potência.
        </p>
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
              placeholder="Buscar por garagem ou ponto"
              value={query}
            />
          </div>
          <Select
            aria-label="Filtrar potência"
            onChange={(event) => setPower(event.target.value)}
            value={power}
          >
            <option value="all">Todas as potências</option>
            <option value="22">22 kW ou mais</option>
            <option value="50">50 kW</option>
          </Select>
        </div>
      </Card>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((charger) => (
          <Card key={charger.id} className="group overflow-hidden">
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
              <div className="flex items-start justify-between">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-navy text-cyan-300 transition group-hover:scale-105">
                  <CarFront size={23} />
                </div>
                <StatusBadge tone={statusMap[charger.status].tone}>
                  {statusMap[charger.status].label}
                </StatusBadge>
              </div>
              <Heading className="mt-5" level={3}>
                {charger.name}
              </Heading>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-subtle">
                <MapPin size={13} /> {charger.location}
              </p>
              <div className="my-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-surface-muted p-3">
                  <p className="text-xs text-ink-subtle">Potência</p>
                  <p className="mt-1 font-bold">{charger.power} kW</p>
                </div>
                <div className="rounded-xl bg-surface-muted p-3">
                  <p className="text-xs text-ink-subtle">Conector</p>
                  <p className="mt-1 font-bold">{charger.connector}</p>
                </div>
              </div>
              {charger.status === "available" ? (
                <Link
                  className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-bold text-white shadow-brand transition hover:bg-brand-strong"
                  state={{ chargerId: charger.id }}
                  to="/resident/bookings"
                >
                  Reservar agora <ArrowRight size={17} />
                </Link>
              ) : (
                <div className="flex min-h-11 items-center justify-center rounded-xl bg-surface-muted text-sm font-semibold text-ink-muted">
                  Próximo horário: {charger.nextAvailable}
                </div>
              )}
            </div>
          </Card>
        ))}
      </section>
    </div>
  )
}

const days = [
  { day: "Hoje", date: "15", value: "2026-04-15" },
  { day: "Qua", date: "16", value: "2026-04-16" },
  { day: "Qui", date: "17", value: "2026-04-17" },
  { day: "Sex", date: "18", value: "2026-04-18" },
  { day: "Sáb", date: "19", value: "2026-04-19" },
  { day: "Dom", date: "20", value: "2026-04-20" },
]

export function ResidentBookings() {
  const { chargers, bookings, dispatch, notify } = useAppState()
  const location = useLocation()
  const initialCharger = (location.state as { chargerId?: string } | null)
    ?.chargerId
  const availableChargers = chargers.filter((item) => item.status !== "offline")
  const [step, setStep] = useState(initialCharger ? 2 : 1)
  const [chargerId, setChargerId] = useState(
    initialCharger ?? availableChargers[0]?.id ?? "",
  )
  const [date, setDate] = useState(days[0].value)
  const [time, setTime] = useState("")
  const [success, setSuccess] = useState(false)
  const [cancelId, setCancelId] = useState<string | null>(null)
  const residentBookings = bookings.filter(
    (item) => item.resident === "Ana Martins",
  )
  const selectedCharger = chargers.find((item) => item.id === chargerId)
  const conflictingSlots = bookings
    .filter(
      (item) =>
        item.chargerId === chargerId &&
        item.date === date &&
        item.status === "upcoming",
    )
    .map((item) => item.time)

  const confirmBooking = () => {
    if (!selectedCharger || !time) return
    if (conflictingSlots.includes(time)) {
      notify(
        "Este horário acabou de ficar indisponível. Escolha outro slot.",
        "danger",
      )
      return
    }
    const booking: Booking = {
      id: `bk-${Date.now()}`,
      resident: "Ana Martins",
      chargerId,
      date,
      time,
      duration: 90,
      status: "upcoming",
    }
    dispatch({ type: "add-booking", booking })
    setSuccess(true)
    notify("Reserva confirmada com sucesso.")
  }

  const resetFlow = () => {
    setSuccess(false)
    setStep(1)
    setTime("")
  }

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden">
        <div className="border-b border-line bg-navy p-5 text-white sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">
                Agendamento inteligente
              </p>
              <Heading className="mt-1 text-white" level={2}>
                Reserve seu próximo carregamento
              </Heading>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span className="text-white">1 Ponto</span>
              <ChevronRight size={14} />
              <span className={step >= 2 ? "text-white" : ""}>2 Horário</span>
              <ChevronRight size={14} />
              <span className={step >= 3 ? "text-white" : ""}>3 Confirmar</span>
            </div>
          </div>
        </div>
        {!success ? (
          <div className="p-5 sm:p-6">
            {step === 1 && (
              <div>
                <Heading level={3}>1. Escolha um carregador</Heading>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {availableChargers.map((charger) => (
                    <Button
                      key={charger.id}
                      className={`h-auto justify-start p-4 text-left ${
                        chargerId === charger.id
                          ? "border-brand bg-brand/5 ring-2 ring-brand/10"
                          : ""
                      }`}
                      onClick={() => setChargerId(charger.id)}
                      variant="secondary"
                    >
                      <div
                        className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                          charger.status === "available"
                            ? "bg-success/10 text-success"
                            : "bg-warning/10 text-warning"
                        }`}
                      >
                        <PlugZap size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-ink">{charger.name}</p>
                        <p className="mt-1 text-xs font-medium text-ink-subtle">
                          {charger.location} · {charger.power} kW
                        </p>
                      </div>
                      {chargerId === charger.id && (
                        <Check className="text-brand" size={20} />
                      )}
                    </Button>
                  ))}
                </div>
                <div className="mt-5 flex justify-end">
                  <Button disabled={!chargerId} onClick={() => setStep(2)}>
                    Continuar <ArrowRight size={18} />
                  </Button>
                </div>
              </div>
            )}
            {step === 2 && (
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Heading level={3}>2. Selecione data e horário</Heading>
                    <p className="mt-1 text-sm text-ink-subtle">
                      {selectedCharger?.name} · sessões de 90 minutos
                    </p>
                  </div>
                  <Button onClick={() => setStep(1)} size="sm" variant="ghost">
                    Alterar ponto
                  </Button>
                </div>
                <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
                  {days.map((item) => (
                    <Button
                      key={item.value}
                      className={`h-auto min-w-16 flex-col px-3 py-3 ${
                        date === item.value
                          ? ""
                          : "border-line bg-surface text-ink hover:bg-surface-muted"
                      }`}
                      onClick={() => {
                        setDate(item.value)
                        setTime("")
                      }}
                      variant={date === item.value ? "primary" : "secondary"}
                    >
                      <span className="text-[11px] opacity-70">{item.day}</span>
                      <span className="text-lg">{item.date}</span>
                    </Button>
                  ))}
                </div>
                <p className="mt-5 text-xs font-bold uppercase tracking-wider text-ink-subtle">
                  Horários disponíveis
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {timeSlots.map((slot) => {
                    const unavailable = conflictingSlots.includes(slot)
                    return (
                      <Button
                        key={slot}
                        className={time === slot ? "" : ""}
                        disabled={unavailable}
                        onClick={() => setTime(slot)}
                        variant={time === slot ? "primary" : "secondary"}
                      >
                        {slot}
                      </Button>
                    )
                  })}
                </div>
                <div className="mt-5 flex items-center gap-2 rounded-xl bg-info/5 p-3 text-xs leading-5 text-ink-muted">
                  <Info className="shrink-0 text-info" size={17} /> Horários
                  indisponíveis aparecem desativados. Você pode cancelar sem
                  custo até 30 minutos antes.
                </div>
                <div className="mt-5 flex justify-end">
                  <Button disabled={!time} onClick={() => setStep(3)}>
                    Revisar reserva <ArrowRight size={18} />
                  </Button>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="mx-auto max-w-2xl">
                <Heading className="text-center" level={3}>
                  3. Revise os detalhes
                </Heading>
                <div className="mt-5 rounded-2xl border border-line bg-surface-muted p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-navy text-cyan-300">
                      <PlugZap size={23} />
                    </div>
                    <div>
                      <p className="font-bold">{selectedCharger?.name}</p>
                      <p className="mt-1 text-sm text-ink-subtle">
                        {selectedCharger?.location}
                      </p>
                    </div>
                  </div>
                  <div className="my-5 border-t border-line" />
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-ink-subtle">Data</p>
                      <p className="mt-1 font-bold">15 de abril</p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-subtle">Horário</p>
                      <p className="mt-1 font-bold">
                        {time} –{" "}
                        {time
                          ? `${String((Number(time.split(":")[0]) + 1) % 24).padStart(2, "0")}:30`
                          : ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-subtle">Estimativa</p>
                      <p className="mt-1 font-bold">até R$ 38,94</p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button onClick={() => setStep(2)} variant="secondary">
                    Voltar
                  </Button>
                  <Button onClick={confirmBooking}>
                    <CalendarCheck2 size={18} /> Confirmar reserva
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center sm:p-12">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircle2 size={34} />
            </div>
            <Heading className="mt-5" level={2}>
              Reserva confirmada
            </Heading>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-muted">
              {selectedCharger?.name} reservado para {time}. Enviaremos um
              lembrete local antes do horário.
            </p>
            <Button className="mt-6" onClick={resetFlow} variant="secondary">
              Fazer outra reserva
            </Button>
          </div>
        )}
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-line p-5">
          <Heading level={2}>Suas reservas</Heading>
          <p className="mt-1 text-sm text-ink-subtle">Próximas e anteriores</p>
        </div>
        <div className="divide-y divide-line">
          {residentBookings.map((booking) => {
            const charger = chargers.find(
              (item) => item.id === booking.chargerId,
            )
            return (
              <div
                key={booking.id}
                className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
              >
                <div
                  className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                    booking.status === "cancelled"
                      ? "bg-surface-muted text-ink-subtle"
                      : "bg-brand/10 text-brand"
                  }`}
                >
                  {booking.status === "cancelled" ? (
                    <XCircle size={21} />
                  ) : (
                    <CalendarDays size={21} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">
                    {charger?.name ?? booking.chargerId}
                  </p>
                  <p className="mt-1 text-xs text-ink-subtle">
                    {booking.date.split("-").reverse().join("/")} ·{" "}
                    {booking.time} · {booking.duration} min
                  </p>
                </div>
                <StatusBadge
                  tone={
                    booking.status === "cancelled"
                      ? "neutral"
                      : booking.status === "completed"
                        ? "success"
                        : "warning"
                  }
                >
                  {booking.status === "cancelled"
                    ? "Cancelada"
                    : booking.status === "completed"
                      ? "Concluída"
                      : "Agendada"}
                </StatusBadge>
                {booking.status === "upcoming" && (
                  <Button
                    onClick={() => setCancelId(booking.id)}
                    size="sm"
                    variant="danger"
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </Card>
      <Modal
        onClose={() => setCancelId(null)}
        open={Boolean(cancelId)}
        title="Cancelar reserva?"
      >
        <p className="text-sm leading-6 text-ink-muted">
          O horário será liberado imediatamente para outros moradores. Esta ação
          não pode ser desfeita.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button onClick={() => setCancelId(null)} variant="secondary">
            Manter reserva
          </Button>
          <Button
            onClick={() => {
              if (cancelId) dispatch({ type: "cancel-booking", id: cancelId })
              setCancelId(null)
              notify("Reserva cancelada e horário liberado.", "info")
            }}
            variant="danger"
          >
            Confirmar cancelamento
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export function ResidentUsage() {
  const { sessions } = useAppState()
  const residentSessions = sessions.filter(
    (item) => item.resident === "Ana Martins",
  )
  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-3">
        <MetricCard
          accent="cyan"
          change="+12,6%"
          icon={BatteryCharging}
          label="Consumo em abril"
          value="42,6 kWh"
        />
        <MetricCard
          accent="brand"
          change="+R$ 5,66"
          icon={Wallet}
          label="Custo no mês"
          value="R$ 50,27"
        />
        <MetricCard
          accent="teal"
          change="-7,4%"
          icon={Leaf}
          label="CO₂ evitado"
          trend="down"
          value="31,8 kg"
        />
      </section>
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
        <Card className="p-5">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <Heading level={2}>Evolução do consumo</Heading>
              <p className="mt-1 text-sm text-ink-subtle">kWh por mês</p>
            </div>
            <Select aria-label="Período" defaultValue="4m">
              <option value="4m">Últimos 4 meses</option>
            </Select>
          </div>
          <ResidentBarChart />
        </Card>
        <Card className="p-5">
          <div className="flex size-11 items-center justify-center rounded-xl bg-success/10 text-success">
            <Leaf size={22} />
          </div>
          <Heading className="mt-5" level={2}>
            Impacto positivo
          </Heading>
          <p className="mt-2 text-sm leading-6 text-ink-muted">
            Seu consumo elétrico neste ano evitou aproximadamente{" "}
            <strong className="text-ink">124 kg de CO₂</strong> em comparação
            com um veículo a combustão.
          </p>
          <div className="mt-5 rounded-xl bg-success/5 p-4">
            <p className="text-xs font-semibold text-success">EQUIVALENTE A</p>
            <p className="mt-1 text-xl font-bold">5 árvores cultivadas</p>
          </div>
        </Card>
      </section>
      <Card className="overflow-hidden">
        <div className="border-b border-line p-5">
          <Heading level={2}>Histórico de sessões</Heading>
          <p className="mt-1 text-sm text-ink-subtle">
            {residentSessions.length} carregamentos registrados
          </p>
        </div>
        <div className="divide-y divide-line">
          {residentSessions.map((session) => (
            <div
              key={session.id}
              className="grid gap-3 p-4 sm:grid-cols-[auto_1fr_auto_auto] sm:items-center"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-info/10 text-info">
                <History size={18} />
              </div>
              <div>
                <p className="font-bold">{session.date}</p>
                <p className="mt-1 text-xs text-ink-subtle">
                  {session.id} · {session.duration} min
                </p>
              </div>
              <div>
                <p className="text-xs text-ink-subtle">Energia</p>
                <p className="font-bold">{session.energy} kWh</p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs text-ink-subtle">Valor</p>
                <p className="font-bold">
                  R$ {session.cost.toFixed(2).replace(".", ",")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
