import { Bot, ChevronDown, RotateCcw, Send, Sparkles, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import { Button, Heading, Input } from "@/components/ui"
import { useAppState } from "@/state/AppState"
import type { AssistantMessage } from "@/types/domain"

function assistantReply(text: string, role: "admin" | "resident") {
  const normalized = text.toLowerCase()
  if (
    normalized.includes("atenção") ||
    normalized.includes("offline") ||
    normalized.includes("manutenção")
  )
    return "O ChargePoint C1 está offline e requer inspeção do conector. Os outros 4 pontos estão operacionais; o A1 possui uma sessão ativa normal."
  if (normalized.includes("consumo") || normalized.includes("gastei"))
    return role === "admin"
      ? "O condomínio consumiu 1.284 kWh no mês, alta de 8,2%. O pico da semana ocorreu no sábado, mas permaneceu abaixo da demanda contratada."
      : "Você consumiu 42,6 kWh em abril, com custo estimado de R$ 50,27. Isso representa 12,6% a mais que o período anterior."
  if (
    normalized.includes("vaga") ||
    normalized.includes("disponível") ||
    normalized.includes("horário")
  )
    return "Há dois pontos livres agora: ChargePoint A2 e B2, ambos com 22 kW. Hoje também há horários às 16:30, 18:30 e 20:00."
  if (normalized.includes("cancel"))
    return "Abra Reservas, localize o agendamento e selecione “Cancelar”. O horário é liberado imediatamente e não há custo até 30 minutos antes."
  if (normalized.includes("conflito") || normalized.includes("agenda"))
    return "Não há conflitos críticos. Existe uma reserva às 12:00 no B1 e outra às 18:30 no A2; os demais slots seguem disponíveis."
  return role === "admin"
    ? "Posso resumir o consumo, verificar alertas da rede, analisar reservas ou ajudar com as cobranças do condomínio."
    : "Posso encontrar um horário livre, explicar seu consumo, orientar uma reserva ou ajudar a cancelar um agendamento."
}

export function Assistant() {
  const { role, messages, dispatch } = useAppState()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [typing, setTyping] = useState(false)
  const location = useLocation()
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const prompts =
    role === "admin"
      ? [
          "Quais pontos exigem atenção?",
          "Resuma o consumo do mês",
          "Há conflitos de agenda?",
        ]
      : [
          "Quando há vaga hoje?",
          "Quanto gastei este mês?",
          "Como cancelar minha reserva?",
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

  const send = (text = input) => {
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
    window.setTimeout(() => {
      dispatch({
        type: "add-message",
        message: {
          id: crypto.randomUUID(),
          sender: "assistant",
          text: assistantReply(clean, role),
          timestamp: new Date().toISOString(),
        },
      })
      setTyping(false)
    }, 650)
  }

  const welcome =
    role === "admin"
      ? "Olá! Estou acompanhando a operação do Residencial Aurora. Como posso ajudar?"
      : "Olá, Ana! Posso ajudar a encontrar um carregador ou entender seu consumo."

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
                  by Gemini · demo local
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
                  className={`max-w-[82%] rounded-2xl p-3 text-sm leading-6 ${
                    message.sender === "user"
                      ? "rounded-tr-md bg-brand text-white"
                      : "rounded-tl-md border border-line bg-surface text-ink shadow-sm"
                  }`}
                >
                  {message.text}
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
