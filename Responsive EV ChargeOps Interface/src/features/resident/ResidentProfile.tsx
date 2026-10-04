import { useAppState } from "@/state/AppState"
import { useEffect, useState } from "react"



import { Button, Card, Heading, Input } from "@/components/ui"



import { User, Car, Save } from "lucide-react"







export function ResidentProfile() {
  const { authToken } = useAppState()




  const [profile, setProfile] = useState<any>({ nome: "", email: "", telefone: "" })



  const [loading, setLoading] = useState(false)



  const [saving, setSaving] = useState(false)







  useEffect(() => {



    fetch((import.meta.env.VITE_API_URL || 'http://localhost:8000') + "/api/me", {



      headers: { "Authorization": `Bearer ${authToken}` }



    }).then(r => r.json()).then(data => {



      setProfile({



        nome: data.nome || "",



        email: data.email || "",



        telefone: data.telefone || "",



        veículo_modelo: data.veículo_modelo || "",



        veículo_bateria_kwh: data.veículo_bateria_kwh || "",



        id_rfid: data.id_rfid || ""



      })



    }).catch(console.error)



  }, [])







  const handleSave = async () => {



    setSaving(true)



    try {



      await fetch((import.meta.env.VITE_API_URL || 'http://localhost:8000') + "/api/me", {



        method: "PATCH",



        headers: { 



          "Authorization": `Bearer ${authToken}`,



          "Content-Type": "application/json"



        },



        body: JSON.stringify({



          nome: profile.nome,



          email: profile.email,



          telefone: profile.telefone,



          veículo_modelo: profile.veículo_modelo,



          veículo_bateria_kwh: parseFloat(profile.veículo_bateria_kwh) || 0



        })



      })



      alert("Perfil atualizado com sucesso!")



    } catch (e) {



      console.error(e)



      alert("Erro ao atualizar")



    } finally {



      setSaving(false)



    }



  }







  return (



    <div className="p-6 md:p-10 max-w-[900px] mx-auto space-y-8 animate-in fade-in duration-500">



      <div>



        <Heading level={2} className="mb-1 text-ink">Meu Perfil e Veículo</Heading>



        <p className="text-ink-muted">Atualize seus dados pessoais e informações do veículo.</p>



      </div>







      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">



        <Card className="p-6 border border-line bg-surface space-y-6">



          <div className="flex items-center gap-3 border-b border-line pb-4">



            <div className="p-2 bg-brand/20 rounded-lg text-brand">



              <User size={24} />



            </div>



            <h3 className="text-xl font-semibold text-ink">Dados Pessoais</h3>



          </div>



          



          <div className="space-y-4">



            <div className="space-y-2">



              <label className="text-sm font-medium text-ink-muted">Nome Completo</label>



              <Input placeholder="Seu nome" value={profile.nome} onChange={e => setProfile({...profile, nome: e.target.value})} />



            </div>



            <div className="space-y-2">



              <label className="text-sm font-medium text-ink-muted">E-mail</label>



              <Input type="email" placeholder="seuemail@exemplo.com" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} />



            </div>



            <div className="space-y-2">



              <label className="text-sm font-medium text-ink-muted">Telefone</label>



              <Input placeholder="(11) 99999-9999" value={profile.telefone} onChange={e => setProfile({...profile, telefone: e.target.value})} />



            </div>



          </div>



        </Card>







        <Card className="p-6 border border-line bg-surface space-y-6">



          <div className="flex items-center gap-3 border-b border-line pb-4">



            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">



              <Car size={24} />



            </div>



            <h3 className="text-xl font-semibold text-ink">Meu Veículo</h3>



          </div>



          



          <div className="space-y-4">



            <div className="space-y-2">



              <label className="text-sm font-medium text-ink-muted">Modelo</label>



              <Input placeholder="Ex: BYD Dolphin" value={profile.veículo_modelo} onChange={e => setProfile({...profile, veículo_modelo: e.target.value})} />



            </div>



            <div className="space-y-2">



              <label className="text-sm font-medium text-ink-muted">Capacidade da Bateria (kWh)</label>



              <Input type="number" placeholder="Ex: 45" value={profile.veículo_bateria_kwh} onChange={e => setProfile({...profile, veículo_bateria_kwh: e.target.value})} />



            </div>



            <div className="space-y-2">



              <label className="text-sm font-medium text-ink-muted">TAG RFID Atual</label>



              <Input value={profile.id_rfid || "Sem TAG"} disabled className="bg-surface-muted text-slate-500" />



            </div>



          </div>



        </Card>



      </div>







      <div className="flex justify-end">



        <Button onClick={handleSave} disabled={saving} className="px-8">



          {saving ? "Salvando..." : (



            <>



              <Save size={18} className="mr-2" />



              Salvar Alterações



            </>



          )}



        </Button>



      </div>



    </div>



  )



}



