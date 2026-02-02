import React, { useState } from "react";
import { Coffee, Lock } from "lucide-react";
import { apiFetch } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      login(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center gap-16 px-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 text-coffee-200">
            <Coffee className="h-10 w-10" />
            <div>
              <p className="text-2xl font-semibold">Café Premium</p>
              <p className="text-sm text-slate-400">Gestion complète du coffee shop</p>
            </div>
          </div>
          <h1 className="mt-8 text-4xl font-semibold leading-tight">
            Connectez-vous pour piloter vos ventes
          </h1>
          <p className="mt-4 text-slate-300">
            Accédez au tableau de bord, au POS et à l'inventaire en toute sécurité.
          </p>
        </div>

        <div className="w-full max-w-md">
          <div className="card p-8">
            <div className="flex items-center gap-2 text-coffee-200">
              <Lock className="h-5 w-5" />
              <p className="text-sm font-semibold">Connexion sécurisée</p>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="text-xs text-slate-400">Email</label>
                <input
                  className="input mt-1 w-full"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="barista@cafe.com"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Mot de passe</label>
                <input
                  className="input mt-1 w-full"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <button type="submit" className="button-primary w-full" disabled={loading}>
                {loading ? "Connexion..." : "Se connecter"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
