import React, { useState } from "react";
import { Coffee, Lock } from "lucide-react";
import { apiFetch } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isRtl = i18n.language === "ar";

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
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div
        className={`mx-auto flex min-h-screen w-full max-w-6xl items-center gap-16 px-6 ${
          isRtl ? "flex-row-reverse" : ""
        }`}
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 text-coffee-200">
            <Coffee className="h-10 w-10" />
            <div>
              <p className="text-2xl font-semibold">{t("auth.cafeName")}</p>
              <p className="text-sm text-slate-400">{t("auth.cafeTagline")}</p>
            </div>
          </div>
          <h1 className="mt-8 text-4xl font-semibold leading-tight">
            {t("auth.title")}
          </h1>
          <p className="mt-4 text-slate-300">{t("auth.subtitle")}</p>
        </div>

        <div className="w-full max-w-md">
          <div className="card p-8">
            <div className="flex items-center gap-2 text-coffee-200">
              <Lock className="h-5 w-5" />
              <p className="text-sm font-semibold">{t("auth.secureTitle")}</p>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="text-xs text-slate-400">{t("auth.email")}</label>
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
                <label className="text-xs text-slate-400">{t("auth.password")}</label>
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
                {loading ? t("auth.loggingIn") : t("auth.login")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
