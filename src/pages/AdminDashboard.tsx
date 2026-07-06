import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Megaphone,
  Inbox,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Counts {
  termine: number;
  termineNeu: number;
  leads: number;
  leadsNeu: number;
  anfragen: number;
  anfragenNeu: number;
  leadsBySource: Record<string, number>;
  leadsByStatus: Record<string, number>;
}

const SOURCE_LABELS: Record<string, string> = {
  tiktok: "TikTok",
  meta: "Meta",
  landingpage: "Landingpage",
  unbekannt: "Unbekannt",
};

const LEAD_STATUS_LABELS: Record<string, string> = {
  neu: "Neu",
  kontaktiert: "Kontaktiert",
  nicht_erreicht: "Nicht erreicht",
  rueckruf: "Rückruf",
  terminiert: "Terminiert",
  kein_interesse: "Kein Interesse",
  abgeschlossen: "Abgeschlossen",
};

const AdminDashboard = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [termineRes, leadsRes, anfragenRes] = await Promise.all([
        supabase.from("beratungstermine").select("status"),
        supabase.from("leads").select("status,quelle"),
        supabase.from("anfragen").select("status"),
      ]);

      const err =
        termineRes.error || leadsRes.error || anfragenRes.error;
      if (err) {
        toast({
          title: "Fehler beim Laden",
          description: err.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const termine = termineRes.data ?? [];
      const leads = leadsRes.data ?? [];
      const anfragen = anfragenRes.data ?? [];

      const leadsBySource: Record<string, number> = {};
      const leadsByStatus: Record<string, number> = {};
      for (const l of leads) {
        leadsBySource[l.quelle] = (leadsBySource[l.quelle] ?? 0) + 1;
        leadsByStatus[l.status] = (leadsByStatus[l.status] ?? 0) + 1;
      }

      setCounts({
        termine: termine.length,
        termineNeu: termine.filter((t) => t.status === "neu").length,
        leads: leads.length,
        leadsNeu: leads.filter((l) => l.status === "neu").length,
        anfragen: anfragen.length,
        anfragenNeu: anfragen.filter((a) => a.status === "neu").length,
        leadsBySource,
        leadsByStatus,
      });
      setLoading(false);
    };
    load();
  }, [toast]);

  const kpis = useMemo(
    () => [
      {
        label: "Termine",
        icon: CalendarDays,
        total: counts?.termine ?? 0,
        neu: counts?.termineNeu ?? 0,
        to: "/admin/termine",
      },
      {
        label: "Kampagnen Leads",
        icon: Megaphone,
        total: counts?.leads ?? 0,
        neu: counts?.leadsNeu ?? 0,
        to: "/admin/leads",
      },
      {
        label: "Anfragen",
        icon: Inbox,
        total: counts?.anfragen ?? 0,
        neu: counts?.anfragenNeu ?? 0,
        to: "/admin/anfragen",
      },
    ],
    [counts]
  );

  return (
    <div className="mx-auto px-6 py-8" style={{ maxWidth: 1280 }}>
      <div className="mb-6">
        <h1
          className="font-arial text-ssm-primaer"
          style={{ fontSize: 24, fontWeight: 900 }}
        >
          Dashboard
        </h1>
        <p
          className="font-verdana text-ssm-grau"
          style={{ fontSize: 13, marginTop: 4 }}
        >
          Überblick über Termine, Leads und Anfragen.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center font-verdana text-ssm-grau">
          Kennzahlen werden geladen…
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {kpis.map((k) => (
              <Link
                key={k.label}
                to={k.to}
                className="group rounded-lg border border-ssm-akzent/40 bg-white p-5 transition-colors hover:border-ssm-primaer/50"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-ssm-cream text-ssm-primaer">
                    <k.icon size={20} />
                  </span>
                  <ArrowRight
                    size={18}
                    className="text-ssm-grau transition-transform group-hover:translate-x-1"
                  />
                </div>
                <div
                  className="font-arial text-ssm-primaer"
                  style={{ fontSize: 34, fontWeight: 900, marginTop: 14 }}
                >
                  {k.total}
                </div>
                <div
                  className="font-arial font-bold uppercase text-ssm-grau"
                  style={{ fontSize: 11, letterSpacing: "0.5px" }}
                >
                  {k.label}
                </div>
                <div
                  className="font-verdana text-ssm-status-positiv"
                  style={{ fontSize: 12, marginTop: 6 }}
                >
                  {k.neu} neu
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-ssm-akzent/40 bg-white p-5">
              <h2
                className="mb-4 flex items-center gap-2 font-arial text-ssm-primaer"
                style={{ fontSize: 15, fontWeight: 900 }}
              >
                <TrendingUp size={16} /> Leads nach Quelle
              </h2>
              <BarList
                data={counts?.leadsBySource ?? {}}
                labels={SOURCE_LABELS}
                total={counts?.leads ?? 0}
              />
            </div>

            <div className="rounded-lg border border-ssm-akzent/40 bg-white p-5">
              <h2
                className="mb-4 flex items-center gap-2 font-arial text-ssm-primaer"
                style={{ fontSize: 15, fontWeight: 900 }}
              >
                <TrendingUp size={16} /> Leads nach Status
              </h2>
              <BarList
                data={counts?.leadsByStatus ?? {}}
                labels={LEAD_STATUS_LABELS}
                total={counts?.leads ?? 0}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const BarList = ({
  data,
  labels,
  total,
}: {
  data: Record<string, number>;
  labels: Record<string, string>;
  total: number;
}) => {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) {
    return (
      <p className="font-verdana text-ssm-grau" style={{ fontSize: 13 }}>
        Noch keine Daten.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {entries.map(([key, value]) => {
        const pct = total ? Math.round((value / total) * 100) : 0;
        return (
          <div key={key}>
            <div
              className="mb-1 flex items-center justify-between font-verdana text-ssm-grau"
              style={{ fontSize: 12 }}
            >
              <span>{labels[key] ?? key}</span>
              <span className="font-arial font-bold text-ssm-primaer">
                {value} · {pct}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-ssm-cream">
              <div
                className="h-full rounded-full bg-ssm-primaer"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminDashboard;
