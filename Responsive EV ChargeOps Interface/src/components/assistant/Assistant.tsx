import { Bot, ChevronDown, RotateCcw, Send, Sparkles, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Button, Heading, Input } from "@/components/ui"
import { useAppState } from "@/state/AppState"
import type { AssistantAction, AssistantMessage } from "@/types/domain"

function assistantReply(
  text: string,
  role: "admin" | "resident",
): { text: string; actions?: AssistantAction[] } {
  const normalized = text.toLowerCase()

  if (
    normalized.includes("reserva") ||
    normalized.includes("agend") ||
    normalized.includes("slot") ||
    normalized.includes("horário") ||
    normalized.includes("horario") ||
    normalized.includes("cancel")
  ) {
    return role === "admin"
      ? {
          text: "Você pode monitorar todas as reservas ativas por carregador, checar conflitos e cancelar agendamentos caso precise inativar um ponto para manutenção diretamente na tela de Operações.",
          actions: [
            { label: "Ir para Operações", path: "/admin/operations" },
            { label: "Visão Geral da Rede", path: "/admin/overview" },
          ],
        }
      : {
          text: "Você pode visualizar suas reservas ativas, agendar um novo horário ou cancelar reservas feitas por você diretamente na tela de Reservas.",
          actions: [
            { label: "Minhas Reservas", path: "/resident/bookings" },
            { label: "Ver Pontos Livres", path: "/resident/chargers" },
          ],
        }
  }

  if (
    normalized.includes("consumo") ||
    normalized.includes("gastei") ||
    normalized.includes("fatura") ||
    normalized.includes("cobr") ||
    normalized.includes("pag") ||
    normalized.includes("financeiro") ||
    normalized.includes("rateio")
  ) {
    return role === "admin"
      ? {
          text: "O acompanhamento financeiro, rateio de energia e controle de recebimentos ficam no menu Financeiro. Lá você pode marcar faturas como pagas e exportar relatórios.",
          actions: [{ label: "Gestão Financeira", path: "/admin/billing" }],
        }
      : {
          text: "Você pode acompanhar o detalhamento do seu consumo em kWh, o valor das faturas e histórico mensal diretamente no menu Consumo.",
          actions: [{ label: "Meu Consumo", path: "/resident/usage" }],
        }
  }

  if (
    normalized.includes("carregador") ||
    normalized.includes("vaga") ||
    normalized.includes("ponto") ||
    normalized.includes("disponív") ||
    normalized.includes("disponiv") ||
    normalized.includes("livre") ||
    normalized.includes("offline") ||
    normalized.includes("manuten")
  ) {
    return role === "admin"
      ? {
          text: "Todos os pontos de recarga podem ser monitorados e alternados entre operacional e manutenção na aba Operações.",
          actions: [{ label: "Carregadores e Sessões", path: "/admin/operations" }],
        }
      : {
          text: "Consulte os carregadores disponíveis em tempo real com potência e localização na aba Carregadores.",
          actions: [{ label: "Encontrar Carregador", path: "/resident/chargers" }],
        }
  }

  if (
    normalized.includes("carro") ||
    normalized.includes("veículo") ||
    normalized.includes("veiculo") ||
    normalized.includes("bateria") ||
    normalized.includes("perfil")
  ) {
    return {
      text: "Você pode cadastrar e atualizar o modelo do seu veículo elétrico e capacidade da bateria (kWh) na aba Meu Perfil.",
      actions: [{ label: "Meu Perfil e Veículo", path: "/resident/profile" }],
    }
  }

  return role === "admin"
    ? {
        text: "Posso te ajudar a analisar as reservas dos moradores, verificar pontos em manutenção, checar faturas pendentes ou resumir o consumo da rede. Qual função deseja acessar?",
        actions: [
          { label: "Operações e Reservas", path: "/admin/operations" },
          { label: "Cobranças", path: "/admin/billing" },
          { label: "Status da Rede", path: "/admin/overview" },
        ],
      }
    : {
        text: "Posso te orientar a encontrar carregadores livres, consultar ou cancelar suas reservas, verificar seu consumo em kWh ou cadastrar seu veículo. O que deseja consultar?",
        actions: [
          { label: "Minhas Reservas", path: "/resident/bookings" },
          { label: "Encontrar Carregador", path: "/resident/chargers" },
          { label: "Meu Consumo", path: "/resident/usage" },
        ],
      }
}

export function Assistant() {
  const { role, authToken, username, userName, messages, dispatch } =
    useAppState()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [typing, setTyping] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const prompts =
    role === "admin"
      ? [
          "Quais pontos exigem atenção?",
          "Analisar as reservas",
          "Resuma o consumo do mês",
        ]
      : [
          "Quando há vaga hoje?",
          "Minhas reservas",
          "Quanto gastei este mês?",
        ]

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [messages, typing])

  const send = async (text = input) => {
    const clean = text.trim()
    if (!clean || typing) return
    const userMessage: AssistantMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      text: clean,
      timestamp: new Date().toISOString(),
    }
    dispatch({ type: "add-message", message: userMessage })
    setInput("")
    setTyping(true)

    try {
      const historyPayload = messages.slice(-4).map((m) => ({
        sender: m.sender,
        text: m.text,
      }))

      const res = await fetch(
        (import.meta.env.VITE_API_URL || "http://localhost:8000") + "/api/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            message: clean,
            history: historyPayload,
          }),
        },
      )

      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.detail || "Erro na resposta da IA")
      }

      const data = await res.json()

      dispatch({
        type: "add-message",
        message: {
          id: crypto.randomUUID(),
          sender: "assistant",
          text: data.reply,
          actions: data.actions || [],
          timestamp: new Date().toISOString(),
        },
      })
    } catch (err: any) {
      const fallback = assistantReply(clean, role)
      dispatch({
        type: "add-message",
        message: {
          id: crypto.randomUUID(),
          sender: "assistant",
          text: fallback.text,
          actions: fallback.actions || [],
          timestamp: new Date().toISOString(),
        },
      })
    } finally {
      setTyping(false)
    }
  }

  const firstName = (userName || username || "Morador").split(" ")[0]

  const welcome =
    role === "admin"
      ? "Olá! Estou acompanhando a operação do condomínio. Como posso ajudar com os carregadores, reservas ou cobranças?"
      : `Olá, ${firstName}! Posso ajudar você com reservas, disponibilidade de carregadores ou dúvidas de consumo.`

  return (
    <>
      <Button
        aria-expanded={open}
        aria-label="Abrir ChargeOps AI Assistant"
        className={`fixed z-40 size-14 rounded-2xl bg-navy text-white shadow-modal hover:bg-navy-soft lg:bottom-6 lg:right-6 ${
          open ? "pointer-events-none scale-90 opacity-0" : "bottom-23 right-4"
        }`}
        onClick={() => setOpen(true)}
        size="icon"
      >
        <Bot size={25} />
        <span className="absolute -right-1 -top-1 size-3 rounded-full bg-success ring-2 ring-app" />
      </Button>
      {open && (
        <aside
          aria-label="ChargeOps AI Assistant"
          className="fixed inset-x-0 bottom-0 z-50 flex h-[88dvh] flex-col overflow-hidden rounded-t-3xl border border-line bg-surface shadow-modal sm:inset-auto sm:bottom-5 sm:right-5 sm:h-[min(720px,calc(100dvh-2.5rem))] sm:w-[410px] sm:rounded-3xl"
        >
          <div className="relative overflow-hidden bg-navy p-4 text-white">
            <div className="absolute right-0 top-0 size-24 rounded-full bg-info/20 blur-2xl" />
            <div className="relative flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-warning shadow-brand">
                <Sparkles size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <Heading className="truncate text-white" level={3}>
                  ChargeOps AI Assistant
                </Heading>
                <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span className="size-1.5 rounded-full bg-success" /> powered
                  by Gemini· demo local
                </p>
              </div>
              <Button
                aria-label="Nova conversa"
                className="text-slate-300 hover:bg-white/10 hover:text-white"
                onClick={() => dispatch({ type: "clear-messages" })}
                size="icon"
                variant="ghost"
              >
                <RotateCcw size={18} />
              </Button>
              <Button
                aria-label="Minimizar assistente"
                className="text-slate-300 hover:bg-white/10 hover:text-white"
                onClick={() => setOpen(false)}
                size="icon"
                variant="ghost"
              >
                <ChevronDown size={20} />
              </Button>
            </div>
          </div>
          <div
            ref={scrollRef}
            aria-live="polite"
            className="flex-1 space-y-4 overflow-y-auto bg-app p-4"
          >
            <div className="flex gap-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-navy text-cyan-300">
                <Bot size={17} />
              </div>
              <div className="max-w-[82%] rounded-2xl rounded-tl-md border border-line bg-surface p-3 text-sm leading-6 text-ink shadow-sm">
                {welcome}
              </div>
            </div>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2.5 ${
                  message.sender === "user" ? "justify-end" : ""
                }`}
              >
                {message.sender === "assistant" && (
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-navy text-cyan-300">
                    <Bot size={17} />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-sm leading-6 ${
                    message.sender === "user"
                      ? "rounded-tr-md bg-brand text-white"
                      : "rounded-tl-md border border-line bg-surface text-ink shadow-sm"
                  }`}
                >
                  <p className="whitespace-pre-line">{message.text}</p>
                  {message.actions && message.actions.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-line/60 pt-2">
                      {message.actions.map((act, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            navigate(act.path)
                            setOpen(false)
                          }}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-brand/30 bg-brand/5 px-2.5 py-1 text-xs font-semibold text-brand transition hover:bg-brand hover:text-white"
                        >
                          <span>{act.label}</span>
                          <span className="text-[10px]">→</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-navy text-cyan-300">
                  <Bot size={17} />
                </div>
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-md border border-line bg-surface px-4 py-3">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}
          </div>
          {messages.length === 0 && (
            <div className="flex gap-2 overflow-x-auto border-t border-line bg-surface px-4 py-3">
              {prompts.map((prompt) => (
                <Button
                  key={prompt}
                  className="shrink-0"
                  onClick={() => send(prompt)}
                  size="sm"
                  variant="secondary"
                >
                  {prompt}
                </Button>
              ))}
            </div>
          )}
          <div className="border-t border-line bg-surface p-3">
            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault()
                send()
              }}
            >
              <Input
                ref={inputRef}
                aria-label="Mensagem para o assistente"
                onChange={(event) => setInput(event.target.value)}
                placeholder={
                  location.pathname.includes("booking")
                    ? "Pergunte sobre sua reserva..."
                    : "Pergunte ao ChargeOps..."
                }
                value={input}
              />
              <Button
                aria-label="Enviar mensagem"
                disabled={!input.trim() || typing}
                size="icon"
                type="submit"
              >
                <Send size={19} />
              </Button>
            </form>
          </div>
        </aside>
      )}
    </>
  )
}
