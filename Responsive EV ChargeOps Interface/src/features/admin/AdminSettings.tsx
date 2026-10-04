import { useAppState } from "@/state/AppState"
﻿import { useEffect, useState } from "react"
import { Button, Card, Heading, Input, StatusBadge, Modal } from "@/components/ui"
import { Save, Settings2, Plus, Edit2, Trash2, BatteryCharging } from "lucide-react"

export function AdminSettings() {
    const { authToken, chargers, refreshData } = useAppState()
  
  const [isChargerModalOpen, setIsChargerModalOpen] = useState(false)
  const [editingCharger, setEditingCharger] = useState<any>(null)
  const [chargerForm, setChargerForm] = useState({
    fabricante_modelo: "",
    localizacao: "",
    potencia_nominal_kw: "7.4",
    tipo_conector: "Type 2",
    id_sems: ""
  })

  const handleEditCharger = (charger: any) => {
    // Note: the ui charger object has name, location, power, but we need the backend keys.
    // For simplicity, we just map it as best as we can or rely on what we have.
    // Ideally we should just ask the backend for the list again or use the existing ones.
    const idNum = charger.id.replace('ch-', '')
    setEditingCharger(idNum)
    setChargerForm({
      fabricante_modelo: charger.name,
      localizacao: charger.location,
      potencia_nominal_kw: charger.power.toString(),
      tipo_conector: "Type 2", // default
      id_sems: `SEMS-${idNum}` // default
    })
    setIsChargerModalOpen(true)
  }

  const handleDeleteCharger = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este carregador?")) return
    const idNum = id.replace('ch-', '')
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/admin/carregadores/${idNum}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${authToken}` }
      })
      refreshData()
    } catch (e) {
      console.error(e)
    }
  }

  const handleSaveCharger = async () => {
    try {
      const url = editingCharger 
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/admin/carregadores/${editingCharger}`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/admin/carregadores`
        
      await fetch(url, {
        method: editingCharger ? "PUT" : "POST",
        headers: { 
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fabricante_modelo: chargerForm.fabricante_modelo,
          localizacao: chargerForm.localizacao,
          potencia_nominal_kw: parseFloat(chargerForm.potencia_nominal_kw),
          tipo_conector: chargerForm.tipo_conector,
          id_sems: chargerForm.id_sems
        })
      })
      setIsChargerModalOpen(false)
      refreshData()
    } catch (e) {
      console.error(e)
    }
  }

  const openNewCharger = () => {
    setEditingCharger(null)
    setChargerForm({
      fabricante_modelo: "",
      localizacao: "",
      potencia_nominal_kw: "7.4",
      tipo_conector: "Type 2",
      id_sems: ""
    })
    setIsChargerModalOpen(true)
  }


  const [configs, setConfigs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Map to hold edited values before saving
  const [editedConfigs, setEditedConfigs] = useState<Record<string, string>>({})

  const fetchConfigs = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:8000') + "/api/admin/configuracoes", {
        headers: { "Authorization": `Bearer ${authToken}` }
      })
      if (!res.ok) throw new Error("HTTP error " + res.status);
      const data = await res.json()
      setConfigs(data)
      const map: Record<string, string> = {}
      data.forEach((c: any) => { map[c.chave] = c.valor })
      setEditedConfigs(map)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConfigs()
  }, [])

  const handleSave = async (chave: string) => {
    setSaving(true)
    try {
      await fetch((import.meta.env.VITE_API_URL || 'http://localhost:8000') + "/api/admin/configuracoes", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ chave, valor: editedConfigs[chave] })
      })
      alert("Configuracao salva com sucesso!")
    } catch (e) {
      console.error(e)
      alert("Erro ao salvar config")
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (chave: string, valor: string) => {
    setEditedConfigs(prev => ({ ...prev, [chave]: valor }))
  }

  const knownConfigs = [
    { key: "TARIFA_KWH", label: "Tarifa Energia (R$/kWh)", desc: "Valor cobrado por kWh consumido" },
    { key: "TAXA_FIXA", label: "Taxa Fixa Mensal (R$)", desc: "Valor fixo cobrado por manutencao/infraestrutura" },
    { key: "POLITICA_RATEIO", label: "Politica de Rateio", desc: "Ex: 'proporcional_kwh', 'igualmente'" }
  ]

  return (
    <div className="p-6 md:p-10 max-w-[900px] mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <Heading level={2} className="mb-1 text-ink">Configurações do Sistema</Heading>
        <p className="text-ink-muted">Ajuste parametros globais como tarifas e politicas de rateio.</p>
      </div>

      <Card className="p-6 border border-line bg-surface space-y-8">
        {loading ? (
          <div className="text-center py-8 text-ink-muted">Carregando...</div>
        ) : (
          knownConfigs.map(conf => (
            <div key={conf.key} className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-line last:border-0 last:pb-0">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-ink flex items-center gap-2">
                  <Settings2 size={18} className="text-brand" />
                  {conf.label}
                </h3>
                <p className="text-sm text-ink-muted mt-1">{conf.desc}</p>
                <p className="text-xs text-slate-500 font-mono mt-1">Chave: {conf.key}</p>
              </div>
              
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Input 
                  value={editedConfigs[conf.key] || ""}
                  onChange={e => handleChange(conf.key, e.target.value)}
                  className=" border-line w-full md:w-48"
                />
                <Button onClick={() => handleSave(conf.key)} disabled={saving}>
                  <Save size={16} />
                </Button>
              </div>
            </div>
          ))
        )}
      </Card>

        <div className="flex items-center justify-between mt-12 mb-4">
          <div>
            <Heading level={2} className="mb-1 text-ink">Gestão de Carregadores</Heading>
            <p className="text-ink-muted">Adicione, edite ou remova estações de recarga do condomínio.</p>
          </div>
          <Button onClick={openNewCharger} className="flex items-center gap-2">
            <Plus size={18} />
            Novo Carregador
          </Button>
        </div>

        <Card className="p-0 border border-line bg-surface overflow-hidden">
          <table className="w-full text-left text-sm text-ink-muted">
            <thead className="bg-surface-muted text-ink-muted uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Modelo</th>
                <th className="px-6 py-4">Localização</th>
                <th className="px-6 py-4">Potência</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {chargers.map((ch) => (
                <tr key={ch.id} className="hover:bg-surface-muted transition-colors">
                  <td className="px-6 py-4 font-mono text-ink">{ch.id}</td>
                  <td className="px-6 py-4 font-medium text-ink">{ch.name}</td>
                  <td className="px-6 py-4">{ch.location}</td>
                  <td className="px-6 py-4">{ch.power} kW</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleEditCharger(ch)} className="p-2 text-ink-subtle hover:text-brand transition-colors" title="Editar">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDeleteCharger(ch.id)} className="p-2 text-ink-subtle hover:text-danger transition-colors ml-2" title="Excluir">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {chargers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    Nenhum carregador cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        <Modal
          open={isChargerModalOpen}
          onClose={() => setIsChargerModalOpen(false)}
          title={editingCharger ? "Editar Carregador" : "Novo Carregador"}
        >
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink">Fabricante / Modelo</label>
              <Input 
                placeholder="Ex: GoodWe 7kW" 
                value={chargerForm.fabricante_modelo} 
                onChange={e => setChargerForm({...chargerForm, fabricante_modelo: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink">Localização</label>
              <Input 
                placeholder="Ex: Vaga 12A" 
                value={chargerForm.localizacao} 
                onChange={e => setChargerForm({...chargerForm, localizacao: e.target.value})} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-ink">Potência (kW)</label>
                <Input 
                  type="number" 
                  step="0.1" 
                  value={chargerForm.potencia_nominal_kw} 
                  onChange={e => setChargerForm({...chargerForm, potencia_nominal_kw: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-ink">Conector</label>
                <Input 
                  placeholder="Ex: Type 2" 
                  value={chargerForm.tipo_conector} 
                  onChange={e => setChargerForm({...chargerForm, tipo_conector: e.target.value})} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink">ID de Integração (SEMS)</label>
              <Input 
                placeholder="Ex: UUID-X" 
                value={chargerForm.id_sems} 
                onChange={e => setChargerForm({...chargerForm, id_sems: e.target.value})} 
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-6 border-t border-line mt-6">
              <Button variant="ghost" onClick={() => setIsChargerModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveCharger}>
                Salvar Carregador
              </Button>
            </div>
          </div>
        </Modal>
    </div>
  )
}
