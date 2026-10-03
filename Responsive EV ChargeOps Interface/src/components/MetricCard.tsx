import type { LucideIcon } from "lucide-react"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { Card } from "@/components/ui"

export default function MetricCard({
  label,
  value,
  change,
  trend = "up",
  icon: Icon,
  accent = "brand",
}: {
  label: string
  value: string
  change: string
  trend?: "up" | "down"
  icon: LucideIcon
  accent?: "brand" | "cyan" | "teal" | "orange"
}) {
  const accentClasses = {
    brand: "bg-brand/10 text-brand",
    cyan: "bg-info/10 text-info",
    teal: "bg-success/10 text-success",
    orange: "bg-warning/10 text-warning",
  }
  const TrendIcon = trend === "up" ? ArrowUpRight : ArrowDownRight

  return (
    <Card className="group p-4 transition hover:-translate-y-0.5 hover:border-brand/25 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-ink">
            {value}
          </p>
        </div>
        <div
          className={`flex size-11 items-center justify-center rounded-xl ${accentClasses[accent]}`}
        >
          <Icon size={21} />
        </div>
      </div>
      <div
        className={`mt-3 flex items-center gap-1 text-xs font-semibold ${
          trend === "up" ? "text-success" : "text-danger"
        }`}
      >
        <TrendIcon size={14} />
        <span>{change}</span>
        <span className="font-medium text-ink-subtle">
          vs. período anterior
        </span>
      </div>
    </Card>
  )
}
