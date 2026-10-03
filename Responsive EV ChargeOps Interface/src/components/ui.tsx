import { X } from "lucide-react"
import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type ElementType,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from "react"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger"
  size?: "sm" | "md" | "icon"
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className = "", variant = "primary", size = "md", ...props },
    ref,
  ) {
    const variants = {
      primary: "bg-brand text-white shadow-brand hover:bg-brand-strong",
      secondary:
        "border border-line bg-surface text-ink hover:border-brand/40 hover:bg-surface-muted",
      ghost: "text-ink-muted hover:bg-surface-muted hover:text-ink",
      danger: "bg-danger/10 text-danger hover:bg-danger/20",
    }
    const sizes = {
      sm: "min-h-9 px-3 text-xs",
      md: "min-h-11 px-4 text-sm",
      icon: "size-11 p-0",
    }

    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:pointer-events-none disabled:opacity-45 ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    )
  },
)

export function Card({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-line bg-surface shadow-card ${className}`}
      {...props}
    />
  )
}

export function Heading({
  level = 2,
  className = "",
  children,
}: {
  level?: 1 | 2 | 3 | 4
  className?: string
  children: ReactNode
}) {
  const Tag: ElementType = `h${level}`
  const styles = {
    1: "text-2xl font-bold tracking-tight text-ink sm:text-3xl",
    2: "text-lg font-bold tracking-tight text-ink sm:text-xl",
    3: "text-base font-bold text-ink",
    4: "text-sm font-semibold text-ink",
  }
  return <Tag className={`${styles[level]} ${className}`}>{children}</Tag>
}

export const Input =
  forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
    function Input({ className = "", ...props }, ref) {
      return (
        <input
          ref={ref}
          className={`min-h-11 w-full rounded-xl border border-line bg-surface px-4 text-sm text-ink outline-none transition placeholder:text-ink-subtle focus:border-brand focus:ring-2 focus:ring-brand/15 ${className}`}
          {...props}
        />
      )
    },
  )

export function Select({
  className = "",
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <select
      className={`min-h-11 rounded-xl border border-line bg-surface px-3 text-sm font-medium text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}

export function StatusBadge({
  tone,
  children,
}: {
  tone: "success" | "warning" | "danger" | "info" | "neutral"
  children: ReactNode
}) {
  const styles = {
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    danger: "bg-danger/10 text-danger",
    info: "bg-info/10 text-info",
    neutral: "bg-surface-muted text-ink-muted",
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${styles[tone]}`}
    >
      {children}
    </span>
  )
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) =>
      event.key === "Escape" && onClose()
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-navy/65 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="max-h-[92dvh] w-full max-w-xl overflow-auto rounded-t-3xl border border-line bg-surface p-5 shadow-modal sm:rounded-3xl sm:p-6"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <Heading level={2} className="pr-4">
            <span id={titleId}>{title}</span>
          </Heading>
          <Button
            ref={closeRef}
            aria-label="Fechar"
            onClick={onClose}
            size="icon"
            variant="ghost"
          >
            <X size={20} />
          </Button>
        </div>
        {children}
      </div>
    </div>
  )
}
