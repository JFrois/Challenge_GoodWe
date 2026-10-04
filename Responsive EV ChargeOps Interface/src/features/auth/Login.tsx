import { useState } from "react"

import { useAppState } from "@/state/AppState"

import { Button } from "@/components/ui"

import { useNavigate } from "react-router-dom"



export function Login() {

  const [username, setUsername] = useState("")

  const [pin, setPin] = useState("")

  const [errorMsg, setErrorMsg] = useState("")

  const [loading, setLoading] = useState(false)

  

  const { dispatch } = useAppState()

  const navigate = useNavigate()



  const handleLogin = async (e: React.FormEvent) => {

    e.preventDefault()

    setErrorMsg("")

    setLoading(true)



    try {

      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:8000') + "/api/auth/login", {

        method: "POST",

        headers: {

          "Content-Type": "application/json"

        },

        body: JSON.stringify({ username, pin })

      })



      if (!res.ok) throw new Error("HTTP error " + res.status);

      const data = await res.json()



      if (!res.ok) {

        throw new Error(data.detail || "Falha no login")

      }



      dispatch({
        type: "set-auth",
        role: data.role === "ADMIN" ? "admin" : "resident",
        authToken: data.access_token,
        username: data.username,
        userName: data.nome || data.username,
        unidadeId: null
      })



      navigate("/")

      

    } catch (err: any) {

      setErrorMsg(err.message)

    } finally {

      setLoading(false)

    }

  }



  return (

    <div className="flex min-h-screen items-center justify-center bg-surface-muted p-4">

      <div className="w-full max-w-md rounded-2xl bg-surface p-8 shadow-card border border-line">

        <div className="mb-8 text-center">

          <h1 className="text-2xl font-semibold text-brand">EV ChargeOps</h1>

          <p className="text-ink-muted mt-2">Acesso ao sistema</p>

        </div>



        <form onSubmit={handleLogin} className="space-y-6">

          <div>

            <label className="block text-sm font-medium text-ink mb-1">

              Unidade / Login

            </label>

            <input

              type="text"
              required
              placeholder="Ex: 42B"

              className="w-full rounded-lg border border-line bg-surface p-3 text-ink focus:border-brand focus:outline-none"

              value={username}

              onChange={(e) => setUsername(e.target.value)}

            />

          </div>



          <div>

            <label className="block text-sm font-medium text-ink mb-1">

              PIN (6 dígitos)

            </label>

            <input

              type="password"

              inputMode="numeric"

              pattern="[0-9]{6}"

              required

              maxLength={6}
              placeholder="●●●●●●"

              className="w-full rounded-lg border border-line bg-surface p-3 text-ink focus:border-brand focus:outline-none tracking-[0.2em] font-mono"

              value={pin}

              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}

            />

          </div>



          {errorMsg && (

            <div className="rounded-lg bg-danger/10 p-3 text-sm text-danger text-center">

              {errorMsg}

            </div>

          )}



          <Button 

            type="submit" 

            className="w-full py-3" 

            disabled={loading || !username || pin.length !== 6}

          >

            {loading ? "Entrando..." : "Entrar"}

          </Button>

        </form>

      </div>

    </div>

  )

}

