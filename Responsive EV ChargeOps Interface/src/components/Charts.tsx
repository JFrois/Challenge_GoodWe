import { useMemo } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { useAppState } from "@/state/AppState"

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid var(--color-line)",
  background: "var(--color-surface)",
  boxShadow: "var(--shadow-card)",
  color: "var(--color-ink)",
}

export function EnergyAreaChart({ showForecast = false }: { showForecast?: boolean }) {
  const { chartData, previsao } = useAppState()
  
  const displayData = useMemo(() => {
    if (showForecast && previsao?.serie_prevista?.length) {
      const hist = (previsao.serie_historica || []).map((h) => ({
        label: h.data.slice(5),
        consumo: h.kwh,
        demanda: h.pico_kw,
        projecao: null,
      }))
      const prev = (previsao.serie_prevista.slice(0, 14) || []).map((p) => ({
        label: `${p.data.slice(5)}*`,
        consumo: null,
        demanda: p.pico_kw,
        projecao: p.kwh,
      }))
      return [...hist, ...prev]
    }
    return chartData
  }, [chartData, previsao, showForecast])

  return (
    <ResponsiveContainer height={260} width="100%">
      <AreaChart data={displayData} margin={{ left: -24, right: 8, top: 16 }}>
        <defs>
          <linearGradient id="energy-fill" x1="0" x2="0" y1="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-info)"
              stopOpacity={0.35}
            />
            <stop offset="100%" stopColor="var(--color-info)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="forecast-fill" x1="0" x2="0" y1="0" y2="1">
            <stop
              offset="0%"
              stopColor="#10b981"
              stopOpacity={0.25}
            />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          stroke="var(--color-line)"
          strokeDasharray="4 6"
          vertical={false}
        />
        <XAxis
          axisLine={false}
          dataKey="label"
          fontSize={12}
          stroke="var(--color-ink-subtle)"
          tickLine={false}
        />
        <YAxis
          axisLine={false}
          fontSize={12}
          stroke="var(--color-ink-subtle)"
          tickLine={false}
        />
        <Tooltip contentStyle={tooltipStyle} />
        <Area
          dataKey="consumo"
          fill="url(#energy-fill)"
          name="Consumo Real (kWh)"
          stroke="var(--color-info)"
          strokeWidth={3}
          type="monotone"
        />
        <Area
          dataKey="demanda"
          fill="transparent"
          name="Demanda Pico (kW)"
          stroke="var(--color-brand)"
          strokeWidth={2}
          type="monotone"
        />
        {showForecast && (
          <Area
            dataKey="projecao"
            fill="url(#forecast-fill)"
            name="Projeção IA (kWh)"
            stroke="#10b981"
            strokeDasharray="5 5"
            strokeWidth={2.5}
            type="monotone"
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function ResidentBarChart() {
  const { chartData } = useAppState()
  
  return (
    <ResponsiveContainer height={220} width="100%">
      <BarChart
        data={chartData}
        margin={{ left: -28, right: 4, top: 12 }}
      >
        <CartesianGrid
          stroke="var(--color-line)"
          strokeDasharray="4 6"
          vertical={false}
        />
        <XAxis
          axisLine={false}
          dataKey="label"
          fontSize={12}
          stroke="var(--color-ink-subtle)"
          tickLine={false}
        />
        <YAxis
          axisLine={false}
          fontSize={12}
          stroke="var(--color-ink-subtle)"
          tickLine={false}
        />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar
          dataKey="consumo"
          fill="var(--color-info)"
          name="Consumo (kWh)"
          radius={[6, 6, 2, 2]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
