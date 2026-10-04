import { useAppState } from "@/state/AppState"
﻿import { useEffect, useState } from "react"
import { Button, Card, Heading, Input, Modal, Select, StatusBadge } from "@/components/ui"
import { Download, Plus, Upload, Trash2, Search } from "lucide-react"

export function AdminResidents() {
  const { authToken } = useAppState()

  const [residents, setResidents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setModalOpen] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const [formData, setFormData] = useState({
    nome: "", username: "", email: "", telefone: "", id_rfid: "", id_unidade: "", pin: ""
  })

  const fetchResidents = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:8000') + "/api/admin/usuarios", {
        headers: { "Authorization": `Bearer ${authToken}` }
      })
      if (!res.ok) throw new Error("HTTP error " + res.status);
      const data = await res.json()
      setResidents(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResidents()
  }, [])

  const handleCreate = async () => {
    try {
      await fetch((import.meta.env.VITE_API_URL || 'http://localhost:8000') + "/api/admin/usuarios", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          id_unidade: parseInt(formData.id_unidade),
          tipo_vinculo: "proprietario",
          role: "MORADOR"
        })
      })
      setModalOpen(false)
      fetchResidents()
    } catch (e) {
      console.error(e)
    }
  }


  const handleReativar = async (id: number) => {
    try {
      await fetch(`${(import.meta.env.VITE_API_URL || 'http://localhost:8000')}/api/admin/usuarios/${id}/reativar`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${authToken}` }
      })
      fetchResidents()
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja inativar este morador?")) return
    try {
      await fetch(`${(import.meta.env.VITE_API_URL || 'http://localhost:8000')}/api/admin/usuarios/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${authToken}` }
      })
      fetchResidents()
    } catch (e) {
      console.error(e)
    }
  }

  const handleCsvUpload = async () => {
    if (!csvFile) return
    const formData = new FormData()
    formData.append("file", csvFile)
    
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:8000') + "/api/admin/usuarios/importar-csv", {
        method: "POST",
        headers: { "Authorization": `Bearer ${authToken}` },
        body: formData
      })
      if (!res.ok) throw new Error("HTTP error " + res.status);
      const data = await res.json()
      alert(data.mensagem)
      setCsvFile(null)
      fetchResidents()
    } catch (e) {
      console.error(e)
      alert("Erro ao importar CSV")
    }
  }

  const filtered = residents.filter(r => r.nome.toLowerCase().includes(searchTerm.toLowerCase()) || r.username?.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Heading level={2} className="mb-1 text-black">Gerenciar Moradores</Heading>
          <p className="text-ink-muted">Adicione, edite e inative moradores do condominio.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-surface-muted p-1 rounded-xl">
            <input 
              type="file" 
              accept=".csv"
              className="text-sm text-ink-muted file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-white hover:file:bg-slate-600 cursor-pointer"
              onChange={e => setCsvFile(e.target.files?.[0] || null)}
            />
            <Button variant="secondary" onClick={handleCsvUpload} disabled={!csvFile}>
              <Upload size={16} className="mr-2" />
              Importar CSV
            </Button>
          </div>
          <Button variant="secondary" onClick={() => window.open((import.meta.env.VITE_API_URL || 'http://localhost:8000') + "/api/admin/usuarios/exportar", "_blank")}>
            <Download size={16} className="mr-2" />
            Exportar Excel
          </Button>
          <Button onClick={() => setModalOpen(true)}>
            <Plus size={16} className="mr-2" />
            Adicionar Morador
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden border border-line bg-surface">
        <div className="p-4 border-b border-line flex justify-between items-center bg-surface-muted">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={18} />
            <Input 
              placeholder="Buscar por nome ou unidade..." 
              className="pl-10 bg-surface border-line" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-ink-muted">
            <thead className="bg-surface-muted text-ink-muted uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Usuário (Unidade)</th>
                <th className="px-6 py-4">E-mail</th>
                <th className="px-6 py-4">Telefone</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8">Carregando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8">Nenhum morador encontrado.</td></tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.id_usuario} className="hover:bg-surface-muted transition-colors">
                    <td className="px-6 py-4 font-medium text-ink">{user.nome}</td>
                    <td className="px-6 py-4">{user.username}</td>
                    <td className="px-6 py-4">{user.email || "-"}</td>
                    <td className="px-6 py-4">{user.telefone || "-"}</td>
                    <td className="px-6 py-4">
                      {user.ativo ? (
                        <StatusBadge status="available">Ativo</StatusBadge>
                      ) : (
                        <StatusBadge status="offline">Inativo</StatusBadge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.ativo ? (
                          <Button variant="danger" onClick={() => handleDelete(user.id_usuario)} className="py-1 px-3 text-xs h-auto">
                            Inativar
                          </Button>
                        ) : (
                          <Button variant="primary" onClick={() => handleReativar(user.id_usuario)} className="py-1 px-3 text-xs h-auto bg-brand text-white hover:bg-brand/90 border-0">
                            Reativar
                          </Button>
                        )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={isModalOpen} onClose={() => setModalOpen(false)} title="Adicionar Morador">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-muted">Nome Completo</label>
              <Input placeholder="Ex: João Silva" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-muted">Username (ex: 101A)</label>
              <Input placeholder="Ex: 101A" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-muted">E-mail</label>
              <Input type="email" placeholder="email@exemplo.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-muted">Telefone</label>
              <Input placeholder="(11) 99999-9999" value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-muted">ID da Unidade</label>
              <Input type="number" placeholder="Ex: 1" value={formData.id_unidade} onChange={e => setFormData({...formData, id_unidade: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-muted">TAG RFID</label>
              <Input placeholder="Ex: TAG_101A" value={formData.id_rfid} onChange={e => setFormData({...formData, id_rfid: e.target.value})} />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium text-ink-muted">PIN de Acesso (6 dgitos)</label>
              <Input type="text" maxLength={6} placeholder="123456" value={formData.pin} onChange={e => setFormData({...formData, pin: e.target.value})} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-line">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate}>Salvar Morador</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
