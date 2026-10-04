import { useAppState } from "@/state/AppState"
import { useEffect, useState } from "react"
import { Button, Card, Heading, Input } from "@/components/ui"
import { User, Car, Save } from "lucide-react"

export function ResidentProfile() {
  const { authToken, notify, refreshData, dispatch } = useAppState()

  const [profile, setProfile] = useState<{
    nome: string
    email: string
    telefone: string
    veiculo_modelo: string
    veiculo_bateria_kwh: string | number
    id_rfid: string
  }>({
    nome: "",
    email: "",
    telefone: "",
    veiculo_modelo: "",
    veiculo_bateria_kwh: "",
    id_rfid: "",
  })

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!authToken) return
    setLoading(true)
    fetch((import.meta.env.VITE_API_URL || "http://localhost:8000") + "/api/me", {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setProfile({
          nome: data.nome || "",
          email: data.email || "",
          telefone: data.telefone || "",
          veiculo_modelo: data.veiculo_modelo || data.veículo_modelo || "",
          veiculo_bateria_kwh:
            data.veiculo_bateria_kwh !== undefined && data.veiculo_bateria_kwh !== null
              ? data.veiculo_bateria_kwh
              : data.veículo_bateria_kwh ?? "",
          id_rfid: data.id_rfid || "",
        })
      })
      .catch((err) => {
        console.error("Erro ao carregar perfil:", err)
        notify("Erro ao carregar dados do perfil", "danger")
      })
      .finally(() => setLoading(false))
  }, [authToken])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(
        (import.meta.env.VITE_API_URL || "http://localhost:8000") + "/api/me",
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome: profile.nome,
            email: profile.email,
            telefone: profile.telefone,
            veiculo_modelo: profile.veiculo_modelo,
            veículo_modelo: profile.veiculo_modelo,
            veiculo_bateria_kwh: parseFloat(String(profile.veiculo_bateria_kwh)) || 0,
            veículo_bateria_kwh: parseFloat(String(profile.veiculo_bateria_kwh)) || 0,
          }),
        },
      )

      if (res.ok) {
        notify("Perfil e informações do veículo atualizados com sucesso!", "success")
        dispatch({ type: "hydrate", payload: { userName: profile.nome } })
        refreshData()
      } else {
        const err = await res.json().catch(() => ({}))
        notify(err.detail || "Erro ao salvar informações.", "danger")
      }
    } catch (e) {
      console.error(e)
      notify("Erro de conexão ao salvar informações.", "danger")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-[900px] space-y-8 p-6 animate-in fade-in duration-500 md:p-10">
      <div>
        <Heading className="mb-1 text-ink" level={2}>
          Meu Perfil e Veículo
        </Heading>
        <p className="text-ink-muted">
          Atualize seus dados pessoais e informações do veículo.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="space-y-6 border border-line bg-surface p-6">
          <div className="flex items-center gap-3 border-b border-line pb-4">
            <div className="rounded-lg bg-brand/20 p-2 text-brand">
              <User size={24} />
            </div>
            <h3 className="text-xl font-semibold text-ink">Dados Pessoais</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-muted">
                Nome Completo
              </label>
              <Input
                placeholder="Seu nome"
                value={profile.nome}
                onChange={(e) =>
                  setProfile({ ...profile, nome: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-muted">
                E-mail
              </label>
              <Input
                placeholder="seuemail@exemplo.com"
                type="email"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-muted">
                Telefone
              </label>
              <Input
                placeholder="(11) 99999-9999"
                value={profile.telefone}
                onChange={(e) =>
                  setProfile({ ...profile, telefone: e.target.value })
                }
              />
            </div>
          </div>
        </Card>

        <Card className="space-y-6 border border-line bg-surface p-6">
          <div className="flex items-center gap-3 border-b border-line pb-4">
            <div className="rounded-lg bg-blue-500/20 p-2 text-blue-400">
              <Car size={24} />
            </div>
            <h3 className="text-xl font-semibold text-ink">Meu Veículo</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-muted">
                Modelo
              </label>
              <Input
                placeholder="Ex: BYD Dolphin"
                value={profile.veiculo_modelo}
                onChange={(e) =>
                  setProfile({ ...profile, veiculo_modelo: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-muted">
                Capacidade da Bateria (kWh)
              </label>
              <Input
                placeholder="Ex: 45"
                type="number"
                value={profile.veiculo_bateria_kwh}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    veiculo_bateria_kwh: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-muted">
                TAG RFID Atual
              </label>
              <Input
                className="bg-surface-muted text-slate-500"
                disabled
                value={profile.id_rfid || "Sem TAG"}
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button className="px-8" disabled={saving || loading} onClick={handleSave}>
          {saving ? (
            "Salvando..."
          ) : (
            <>
              <Save className="mr-2" size={18} />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
