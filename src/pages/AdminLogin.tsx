import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const inputStyle: React.CSSProperties = {
  padding: "13px 14px",
  border: "1.5px solid #d4d2c7",
  borderRadius: 4,
  fontFamily: "Verdana, Geneva, sans-serif",
  fontSize: 14,
  width: "100%",
  outline: "none",
  background: "white",
};

const AdminLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAdmin, loading, refreshRole } = useAdminAuth();

  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate("/admin", { replace: true });
    }
  }, [loading, user, isAdmin, navigate]);

  useEffect(() => {
    if (searchParams.get("denied")) {
      setError(
        "Dieses Konto hat keine Admin-Berechtigung. Bitte mit einem Admin-Konto anmelden."
      );
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) throw signInError;

      await refreshRole();

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("role", "admin")
        .maybeSingle();

      if (roleData) {
        navigate("/admin", { replace: true });
      } else {
        setInfo(
          "Dieses Konto hat keine Admin-Berechtigung – bitte von einem bestehenden Admin freischalten lassen."
        );
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Etwas ist schiefgelaufen.";
      setError(
        message.includes("Invalid login")
          ? "E-Mail oder Passwort ist falsch."
          : message
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ssm-cream px-6 py-12">
      <div
        className="w-full bg-white"
        style={{
          maxWidth: 420,
          borderRadius: 16,
          padding: 36,
          boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
        }}
      >
        <div
          className="mb-6 bg-ssm-akzent"
          style={{ width: 50, height: 4, borderRadius: 4 }}
        />
        <h1
          className="font-arial text-ssm-primaer"
          style={{ fontSize: 26, fontWeight: 900, lineHeight: 1.2 }}
        >
          Admin-Bereich
        </h1>
        <p
          className="font-verdana text-ssm-grau"
          style={{ fontSize: 14, marginTop: 8 }}
        >
          Melde dich an, um eingehende Leads zu verwalten.
        </p>

        {error && (
          <div
            className="font-verdana"
            style={{
              background: "#FBE7E1",
              color: "#A4503D",
              border: "1px solid #e8a89e",
              borderRadius: 4,
              padding: "10px 14px",
              fontSize: 13,
              marginTop: 18,
            }}
          >
            {error}
          </div>
        )}
        {info && (
          <div
            className="font-verdana bg-ssm-status-positiv-bg text-ssm-status-positiv"
            style={{
              borderRadius: 4,
              padding: "10px 14px",
              fontSize: 13,
              marginTop: 18,
            }}
          >
            {info}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex flex-col"
          style={{ gap: 16, marginTop: 22 }}
        >
          <div>
            <label
              className="font-arial font-bold uppercase text-ssm-primaer"
              style={{
                fontSize: 12,
                letterSpacing: "0.8px",
                display: "block",
                marginBottom: 8,
              }}
            >
              E-Mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              placeholder="admin@beispiel.ch"
            />
          </div>
          <div>
            <label
              className="font-arial font-bold uppercase text-ssm-primaer"
              style={{
                fontSize: 12,
                letterSpacing: "0.8px",
                display: "block",
                marginBottom: 8,
              }}
            >
              Passwort
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="font-arial font-bold uppercase bg-ssm-primaer text-white transition-colors hover:bg-ssm-primaer-dark disabled:opacity-50"
            style={{
              padding: 15,
              borderRadius: 4,
              fontSize: 15,
              marginTop: 6,
            }}
          >
            {busy ? "Bitte warten…" : "Anmelden"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
