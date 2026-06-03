import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Download,
  LogOut,
  RefreshCw,
  Search,
  Save,
  Trash2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/hooks/use-toast";

interface Lead {
  id: string;
  created_at: string;
  thema: string;
  name: string;
  kontakt: string;
  bevorzugte_zeit: string;
  status: string;
  notes: string;
}

const STATUS_OPTIONS = [
  { value: "neu", label: "Neu" },
  { value: "kontaktiert", label: "Kontaktiert" },
  { value: "termin", label: "Termin vereinbart" },
  { value: "erledigt", label: "Erledigt" },
  { value: "abgesagt", label: "Abgesagt" },
];

const THEMA_LABELS: Record<string, string> = {
  vorsorge: "Vorsorge / 3a",
  eigenheim: "Eigenheim",
  steuern: "Steuern",
  allgemein: "Allgemein",
};

const statusColor = (status: string) => {
  switch (status) {
    case "neu":
      return { bg: "#D4E5DC", fg: "#4F7A5F" };
    case "kontaktiert":
      return { bg: "#E3E4F3", fg: "#4A4F8C" };
    case "termin":
      return { bg: "#FBEFD6", fg: "#9A7320" };
    case "erledigt":
      return { bg: "#E8E8E8", fg: "#595959" };
    case "abgesagt":
      return { bg: "#FBE7E1", fg: "#A4503D" };
    default:
      return { bg: "#E8E8E8", fg: "#595959" };
  }
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAdminAuth();
  const { toast } = useToast();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("alle");
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [savingNote, setSavingNote] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("beratungstermine")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({
        title: "Fehler beim Laden",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setLeads(data as Lead[]);
      setNoteDrafts(
        Object.fromEntries((data as Lead[]).map((l) => [l.id, l.notes ?? ""]))
      );
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleStatusChange = async (id: string, status: string) => {
    const prev = leads;
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l)));
    const { error } = await supabase
      .from("beratungstermine")
      .update({ status })
      .eq("id", id);
    if (error) {
      setLeads(prev);
      toast({
        title: "Status nicht gespeichert",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSaveNote = async (id: string) => {
    setSavingNote(id);
    const notes = noteDrafts[id] ?? "";
    const { error } = await supabase
      .from("beratungstermine")
      .update({ notes })
      .eq("id", id);
    if (error) {
      toast({
        title: "Notiz nicht gespeichert",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, notes } : l)));
      toast({ title: "Notiz gespeichert" });
    }
    setSavingNote(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Diesen Lead wirklich löschen?")) return;
    const prev = leads;
    setLeads((ls) => ls.filter((l) => l.id !== id));
    const { error } = await supabase
      .from("beratungstermine")
      .delete()
      .eq("id", id);
    if (error) {
      setLeads(prev);
      toast({
        title: "Löschen fehlgeschlagen",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Lead gelöscht" });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login", { replace: true });
  };

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const matchesStatus =
        statusFilter === "alle" || l.status === statusFilter;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        l.name.toLowerCase().includes(q) ||
        l.kontakt.toLowerCase().includes(q) ||
        (THEMA_LABELS[l.thema] ?? l.thema).toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [leads, statusFilter, query]);

  const exportCsv = () => {
    const headers = [
      "Datum",
      "Name",
      "Kontakt",
      "Thema",
      "Bevorzugte Zeit",
      "Status",
      "Notizen",
    ];
    const escape = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
    const rows = filtered.map((l) =>
      [
        formatDate(l.created_at),
        l.name,
        l.kontakt,
        THEMA_LABELS[l.thema] ?? l.thema,
        l.bevorzugte_zeit,
        STATUS_OPTIONS.find((s) => s.value === l.status)?.label ?? l.status,
        l.notes,
      ]
        .map(escape)
        .join(";")
    );
    const csv = [headers.map(escape).join(";"), ...rows].join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { alle: leads.length };
    for (const l of leads) c[l.status] = (c[l.status] ?? 0) + 1;
    return c;
  }, [leads]);

  return (
    <div className="min-h-screen bg-ssm-cream">
      {/* Header */}
      <header className="border-b border-ssm-akzent/40 bg-white">
        <div
          className="mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-4"
          style={{ maxWidth: 1280 }}
        >
          <div>
            <h1
              className="font-arial text-ssm-primaer"
              style={{ fontSize: 22, fontWeight: 900 }}
            >
              Leads · Admin
            </h1>
            <p
              className="font-verdana text-ssm-grau"
              style={{ fontSize: 12, marginTop: 2 }}
            >
              {user?.email}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLeads}
              className="inline-flex items-center gap-2 rounded border border-ssm-akzent/60 px-3 py-2 font-arial text-ssm-primaer transition-colors hover:bg-ssm-cream"
              style={{ fontSize: 13 }}
            >
              <RefreshCw size={15} /> Aktualisieren
            </button>
            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-2 rounded bg-ssm-primaer px-3 py-2 font-arial font-bold text-white transition-colors hover:bg-ssm-primaer-dark"
              style={{ fontSize: 13 }}
            >
              <Download size={15} /> CSV
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded border border-ssm-akzent/60 px-3 py-2 font-arial text-ssm-grau transition-colors hover:bg-ssm-cream"
              style={{ fontSize: 13 }}
            >
              <LogOut size={15} /> Abmelden
            </button>
          </div>
        </div>
      </header>

      <main
        className="mx-auto px-6 py-8"
        style={{ maxWidth: 1280 }}
      >
        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1" style={{ minWidth: 220 }}>
            <Search
              size={16}
              className="absolute text-ssm-grau"
              style={{ left: 12, top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Suche nach Name, Kontakt, Thema…"
              className="w-full rounded border border-ssm-akzent/60 bg-white font-verdana"
              style={{ padding: "10px 12px 10px 36px", fontSize: 14, outline: "none" }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {[{ value: "alle", label: "Alle" }, ...STATUS_OPTIONS].map((s) => {
              const active = statusFilter === s.value;
              return (
                <button
                  key={s.value}
                  onClick={() => setStatusFilter(s.value)}
                  className={`rounded-full font-arial font-bold transition-colors ${
                    active
                      ? "bg-ssm-primaer text-white"
                      : "bg-white text-ssm-grau hover:text-ssm-primaer"
                  }`}
                  style={{
                    fontSize: 12,
                    padding: "7px 14px",
                    border: `1.5px solid ${active ? "#324642" : "#d8d9c6"}`,
                  }}
                >
                  {s.label}
                  {counts[s.value] ? ` (${counts[s.value]})` : ""}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center font-verdana text-ssm-grau">
            Leads werden geladen…
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-ssm-akzent/60 bg-white py-20 text-center font-verdana text-ssm-grau">
            Keine Leads gefunden.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((lead) => {
              const c = statusColor(lead.status);
              const dirty = (noteDrafts[lead.id] ?? "") !== (lead.notes ?? "");
              return (
                <div
                  key={lead.id}
                  className="rounded-lg border border-ssm-akzent/40 bg-white"
                  style={{ padding: 20 }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3
                          className="font-arial text-ssm-primaer"
                          style={{ fontSize: 17, fontWeight: 900 }}
                        >
                          {lead.name}
                        </h3>
                        <span
                          className="font-arial font-bold uppercase"
                          style={{
                            fontSize: 10,
                            letterSpacing: "0.5px",
                            padding: "3px 9px",
                            borderRadius: 999,
                            background: c.bg,
                            color: c.fg,
                          }}
                        >
                          {STATUS_OPTIONS.find((s) => s.value === lead.status)
                            ?.label ?? lead.status}
                        </span>
                      </div>
                      <div
                        className="font-verdana text-ssm-grau"
                        style={{ fontSize: 13, marginTop: 6, lineHeight: 1.7 }}
                      >
                        <div>
                          <strong>Kontakt:</strong> {lead.kontakt}
                        </div>
                        <div>
                          <strong>Thema:</strong>{" "}
                          {THEMA_LABELS[lead.thema] ?? lead.thema}
                          {"  ·  "}
                          <strong>Zeit:</strong> {lead.bevorzugte_zeit || "–"}
                        </div>
                        <div style={{ fontSize: 12, opacity: 0.8 }}>
                          Eingegangen: {formatDate(lead.created_at)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={lead.status}
                        onChange={(e) =>
                          handleStatusChange(lead.id, e.target.value)
                        }
                        className="rounded border border-ssm-akzent/60 bg-white font-verdana text-ssm-primaer"
                        style={{ padding: "8px 10px", fontSize: 13, outline: "none" }}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleDelete(lead.id)}
                        title="Lead löschen"
                        className="rounded border border-ssm-akzent/60 p-2 text-ssm-grau transition-colors hover:border-red-300 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Notes */}
                  <div style={{ marginTop: 14 }}>
                    <label
                      className="font-arial font-bold uppercase text-ssm-primaer"
                      style={{
                        fontSize: 11,
                        letterSpacing: "0.6px",
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      Notizen
                    </label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <textarea
                        value={noteDrafts[lead.id] ?? ""}
                        onChange={(e) =>
                          setNoteDrafts((d) => ({
                            ...d,
                            [lead.id]: e.target.value,
                          }))
                        }
                        rows={2}
                        placeholder="Interne Notiz hinzufügen…"
                        className="flex-1 rounded border border-ssm-akzent/60 bg-white font-verdana"
                        style={{
                          padding: "10px 12px",
                          fontSize: 13,
                          outline: "none",
                          resize: "vertical",
                        }}
                      />
                      <button
                        onClick={() => handleSaveNote(lead.id)}
                        disabled={!dirty || savingNote === lead.id}
                        className="inline-flex items-center justify-center gap-2 self-start rounded bg-ssm-primaer px-4 py-2 font-arial font-bold text-white transition-colors hover:bg-ssm-primaer-dark disabled:opacity-40"
                        style={{ fontSize: 13 }}
                      >
                        <Save size={15} />
                        {savingNote === lead.id ? "Speichert…" : "Speichern"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
