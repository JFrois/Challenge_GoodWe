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
import { energyData, residentEnergyData } from "@/data/mockData"

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid var(--color-line)",
  background: "var(--color-surface)",
  boxShadow: "var(--shadow-card)",
  color: "var(--color-ink)",
}

export function EnergyAreaChart() {
  return (
    <ResponsiveContainer height={260} width="100%">
      <AreaChart data={energyData} margin={{ left: -24, right: 8, top: 16 }}>
        <defs>
          <linearGradient id="energy-fill" x1="0" x2="0" y1="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-info)"
              stopOpacity={0.35}
            />
            <stop offset="100%" stopColor="var(--color-info)" stopOpacity={0} />
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
          name="Consumo (kWh)"
          stroke="var(--color-info)"
          strokeWidth={3}
          type="monotone"
        />
        <Area
          dataKey="demanda"
          fill="transparent"
          name="Demanda (kW)"
          stroke="var(--color-brand)"
          strokeWidth={2}
          type="monotone"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function ResidentBarChart() {
  return (
    <ResponsiveContainer height={220} width="100%">
      <BarChart
        data={residentEnergyData}
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
