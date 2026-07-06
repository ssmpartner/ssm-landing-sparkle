import { useEffect, useState } from "react";
import {
  Facebook,
  Music2,
  Copy,
  Check,
  RefreshCw,
  Plug,
  PlugZap,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Integration = {
  id: string;
  provider: string;
  connected: boolean;
  webhook_token: string;
};

const PROVIDERS: {
  key: string;
  name: string;
  desc: string;
  trigger: string;
  icon: typeof Facebook;
  accent: string;
}[] = [
  {
    key: "meta",
    name: "Meta (Facebook / Instagram)",
    desc: "Leads aus Facebook & Instagram Lead Ads sammeln",
    trigger: "Facebook Lead Ads → Neuer Lead",
    icon: Facebook,
    accent: "#1877F2",
  },
  {
    key: "tiktok",
    name: "TikTok Ads",
    desc: "Leads aus TikTok Lead-Generierungskampagnen sammeln",
    trigger: "TikTok Ads → Neuer Lead",
    icon: Music2,
    accent: "#111111",
  },
];

const FUNCTION_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/import-lead`;

const AdminIntegrations = () => {
  const [rows, setRows] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from("integrations")
      .select("id, provider, connected, webhook_token");
    if (error) {
      toast.error("Integrationen konnten nicht geladen werden");
    } else {
      setRows((data ?? []) as Integration[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const webhookUrl = (r: Integration) =>
    `${FUNCTION_BASE}?provider=${r.provider}&token=${r.webhook_token}`;

  const copy = async (r: Integration) => {
    await navigator.clipboard.writeText(webhookUrl(r));
    setCopied(r.provider);
    setTimeout(() => setCopied(null), 1500);
    toast.success("Webhook-URL kopiert");
  };

  const toggleConnected = async (r: Integration) => {
    setBusy(r.provider);
    const { error } = await supabase
      .from("integrations")
      .update({ connected: !r.connected })
      .eq("id", r.id);
    if (error) toast.error("Fehler beim Speichern");
    else {
      toast.success(r.connected ? "Verbindung getrennt" : "Verbunden");
      await load();
    }
    setBusy(null);
  };

  const regenerate = async (r: Integration) => {
    setBusy(r.provider);
    const newToken = crypto.randomUUID().replace(/-/g, "");
    const { error } = await supabase
      .from("integrations")
      .update({ webhook_token: newToken })
      .eq("id", r.id);
    if (error) toast.error("Fehler beim Erneuern");
    else {
      toast.success("Neuer Webhook-Token erzeugt");
      await load();
    }
    setBusy(null);
  };

  const test = async (r: Integration) => {
    setBusy(r.provider);
    try {
      const res = await fetch(webhookUrl(r), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: true }),
      });
      if (res.ok) toast.success("Test erfolgreich – Webhook erreichbar");
      else toast.error(`Test fehlgeschlagen (Status ${res.status})`);
    } catch {
      toast.error("Test fehlgeschlagen – Webhook nicht erreichbar");
    }
    setBusy(null);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-ssm-primaer" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="font-arial text-2xl font-black text-ssm-primaer">
          Integrationen
        </h1>
        <p className="mt-1 font-verdana text-sm text-ssm-grau">
          Verbinden Sie Meta und TikTok über Zapier, um Leads automatisch in
          „Kampagnen Leads“ zu importieren. Die Quelle wird dabei automatisch
          zugewiesen.
        </p>
      </div>

      <div className="space-y-5">
        {PROVIDERS.map((p) => {
          const row = rows.find((r) => r.provider === p.key);
          if (!row) return null;
          const Icon = p.icon;
          const isBusy = busy === p.key;
          return (
            <div
              key={p.key}
              className="rounded-lg border border-ssm-akzent/40 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white"
                    style={{ backgroundColor: p.accent }}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="font-arial font-black text-ssm-primaer">
                      {p.name}
                    </h2>
                    <p className="font-verdana text-sm text-ssm-grau">
                      {p.desc}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-verdana text-xs font-bold ${
                    row.connected
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      row.connected ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                  {row.connected ? "Verbunden" : "Nicht verbunden"}
                </span>
              </div>

              <div className="mt-4 rounded-md bg-ssm-cream/60 p-4">
                <p className="mb-2 font-arial text-sm font-bold text-ssm-primaer">
                  Einrichtung mit Zapier
                </p>
                <ol className="list-decimal space-y-1 pl-5 font-verdana text-sm text-ssm-grau">
                  <li>Erstellen Sie einen neuen Zap in Zapier</li>
                  <li>
                    Setzen Sie den Trigger auf „{p.trigger}“
                  </li>
                  <li>
                    Fügen Sie die Aktion „Webhooks by Zapier → POST“ hinzu
                  </li>
                  <li>Kopieren Sie die Webhook-URL unten und fügen Sie sie ein</li>
                  <li>
                    Mappen Sie die Felder: <code>vorname</code>,{" "}
                    <code>nachname</code>, <code>email</code>,{" "}
                    <code>telefon</code>, <code>plz</code>, <code>ort</code>
                  </li>
                </ol>
              </div>

              <div className="mt-4">
                <label className="mb-1 block font-verdana text-xs font-bold text-ssm-grau">
                  Webhook-URL
                </label>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={webhookUrl(row)}
                    className="min-w-0 flex-1 rounded border border-ssm-akzent/50 bg-ssm-cream/40 px-3 py-2 font-mono text-xs text-ssm-grau"
                  />
                  <button
                    onClick={() => copy(row)}
                    className="inline-flex items-center gap-1.5 rounded border border-ssm-akzent/60 px-3 py-2 font-arial text-sm text-ssm-primaer transition-colors hover:bg-ssm-cream"
                  >
                    {copied === p.key ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    Kopieren
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  disabled={isBusy}
                  onClick={() => toggleConnected(row)}
                  className={`inline-flex items-center gap-1.5 rounded px-4 py-2 font-arial text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 ${
                    row.connected ? "bg-ssm-grau" : "bg-ssm-primaer"
                  }`}
                >
                  {isBusy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : row.connected ? (
                    <Plug className="h-4 w-4" />
                  ) : (
                    <PlugZap className="h-4 w-4" />
                  )}
                  {row.connected ? "Trennen" : "Verbinden"}
                </button>
                <button
                  disabled={isBusy}
                  onClick={() => test(row)}
                  className="inline-flex items-center gap-1.5 rounded border border-ssm-akzent/60 px-4 py-2 font-arial text-sm text-ssm-primaer transition-colors hover:bg-ssm-cream disabled:opacity-50"
                >
                  Test senden
                </button>
                <button
                  disabled={isBusy}
                  onClick={() => regenerate(row)}
                  className="inline-flex items-center gap-1.5 rounded border border-ssm-akzent/60 px-4 py-2 font-arial text-sm text-ssm-grau transition-colors hover:bg-ssm-cream disabled:opacity-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Token erneuern
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminIntegrations;
