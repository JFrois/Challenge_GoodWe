import type { Charge, Charger, ChargingSession } from "@/types/domain";

const API_URL = import.meta.env.VITE_API_URL + "/api";

function getHeaders(token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export async function fetchAdminDashboard(token: string, periodo = "2026-06"): Promise<{
  charges: Charge[],
  chargers: Charger[],
  chartData: any[],
  metrics: any,
  previsao?: any,
  alertas?: any[]
}> {
  const res = await fetch(`${API_URL}/admin/dashboard?periodo=${periodo}`, { headers: getHeaders(token) });
  if (!res.ok) throw new Error(`Erro ao buscar dashboard do admin: ${res.status}`);
  const data = await res.json();
  
  const charges: Charge[] = (data.faturas || []).map((f: any) => ({
    id: `fat-${f.id_fatura}`,
    resident: f.tipo === "morador" ? `Morador ${f.cd_unidade}` : f.cd_unidade,
    unit: f.cd_unidade,
    energy: f.energia_total_kwh,
    amount: f.valor_total_brl,
    status: f.status_pgto === "pago" ? "paid" : f.status_pgto === "vencido" ? "overdue" : "pending"
  }));

  const chargers: Charger[] = (data.carregadores || []).map((c: any) => ({
    id: `ch-${c.id_carregador}`,
    name: c.fabricante_modelo || c.nome_carregador || `Carregador ${c.id_carregador}`,
    location: c.localizacao || "Indisponível",
    connector: c.tipo_conector || "Tipo 2",
    status: c.estado_operacional === "online" ? "available" : c.estado_operacional === "in_use" ? "charging" : "offline",
    power: Number(c.potencia_nominal_kw || c.potencia_kw || 7.4),
    nextAvailable: c.estado_operacional === "online" ? "Disponível" : "Em manutenção"
  }));

  const chartData = (data.consumo || []).map((c: any) => ({
    label: `${String(c.hora).padStart(2, '0')}:00`,
    consumo: c.energia_kwh,
    demanda: c.sessões * 7 
  }));

  return { charges, chargers, chartData, metrics: data.metrics, previsao: data.previsao, alertas: data.alertas };
}

export async function fetchResidentDashboard(token: string, periodo = "2026-06"): Promise<{
  sessions: ChargingSession[],
  charge: Charge | null,
  chargers: Charger[],
  metrics?: {
    totalEnergy: number
    totalCost: number
    avgDurationMinutes: number
  },
  usuario?: {
    id_usuario: number
    nome: string
    username: string
  }
}> {
  const res = await fetch(`${API_URL}/resident/dashboard?periodo=${periodo}`, { headers: getHeaders(token) });
  
  // C5 Fix: If res is not ok, include status code so AppState can intercept 401/403
  if (!res.ok) {
    throw new Error(`Erro ao buscar dashboard do morador: ${res.status}`);
  }
  
  const data = await res.json();
  
  const sessions: ChargingSession[] = (data.sessões || []).map((s: any) => ({
    id: `EV-${s.id_sessao}`,
    resident: s.motorista,
    chargerId: `ch-${s.id_carregador}`,
    date: s.dt_inicio,
    duration: s.dt_fim ? Math.round((new Date(s.dt_fim).getTime() - new Date(s.dt_inicio).getTime()) / 60000) : 0,
    energy: s.energia_kwh,
    cost: (s.energia_kwh || 0) * 0.92, 
    status: s.status_final === "concluida" ? "completed" : "active"
  }));

  let charge: Charge | null = null;
  if (data.fatura) {
    charge = {
      id: `fat-${data.fatura.id_fatura}`,
      resident: "Você",
      unit: data.fatura.cd_unidade || "",
      energy: data.fatura.energia_total_kwh,
      amount: data.fatura.valor_total_brl,
      status: data.fatura.status_pgto === "pago" ? "paid" : data.fatura.status_pgto === "vencido" ? "overdue" : "pending"
    };
  }

  const chargers: Charger[] = (data.carregadores || []).map((c: any) => ({
    id: `ch-${c.id_carregador}`,
    name: c.fabricante_modelo || c.nome_carregador || `Carregador ${c.id_carregador}`,
    location: c.localizacao || "Indisponível",
    connector: c.tipo_conector || "Tipo 2",
    status: c.estado_operacional === "online" ? "available" : c.estado_operacional === "in_use" ? "charging" : "offline",
    power: Number(c.potencia_nominal_kw || c.potencia_kw || 7.4),
    nextAvailable: c.estado_operacional === "online" ? "Disponível" : "Em manutenção"
  }));

  return { sessions, charge, chargers, metrics: data.metrics, usuario: data.usuario };
}

export async function fetchReservations(token: string, idCarregador?: number | string): Promise<any[]> {
  const query = idCarregador !== undefined && idCarregador !== null
    ? `?id_carregador=${encodeURIComponent(String(idCarregador).replace("ch-", ""))}`
    : "";
  const res = await fetch(`${API_URL}/reservations${query}`, { headers: getHeaders(token) });
  if (!res.ok) throw new Error(`Erro ao buscar reservas: ${res.status}`);
  return res.json();
}

export async function cancelReservationApi(token: string, idReserva: number | string): Promise<any> {
  const res = await fetch(`${API_URL}/reservations/${idReserva}/cancel`, {
    method: "PATCH",
    headers: getHeaders(token)
  });
  if (!res.ok) throw new Error(`Erro ao cancelar reserva: ${res.status}`);
  return res.json();
}

export async function markInvoicePaid(token: string, idFatura: number | string): Promise<any> {
  const numId = String(idFatura).replace("fat-", "");
  const res = await fetch(`${API_URL}/admin/faturas/${numId}/pago`, {
    method: "PUT",
    headers: getHeaders(token)
  });
  if (!res.ok) throw new Error(`Erro ao marcar fatura como paga: ${res.status}`);
  return res.json();
}

