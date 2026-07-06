import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  RefreshCw,
  Save,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Lead {
  id: string;
  created_at: string;
  quelle: string;
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  plz: string;
  ort: string;
  status: string;
  notes: string;
}

const STATUS_OPTIONS = [
  { value: "neu", label: "Neu" },
  { value: "kontaktiert", label: "Kontaktiert" },
  { value: "nicht_erreicht", label: "Nicht erreicht" },
  { value: "rueckruf", label: "Rückruf" },
  { value: "terminiert", label: "Terminiert" },
  { value: "kein_interesse", label: "Kein Interesse" },
  { value: "abgeschlossen", label: "Abgeschlossen" },
];

const SOURCE_OPTIONS = [
  { value: "tiktok", label: "TikTok" },
  { value: "meta", label: "Meta" },
  { value: "landingpage", label: "Landingpage" },
  { value: "unbekannt", label: "Unbekannt" },
];

const statusColor = (status: string) => {
  switch (status) {
    case "neu":
      return { bg: "#D4E5DC", fg: "#4F7A5F" };
    case "kontaktiert":
      return { bg: "#E3E4F3", fg: "#4A4F8C" };
    case "nicht_erreicht":
      return { bg: "#FBE7E1", fg: "#A4503D" };
    case "rueckruf":
      return { bg: "#FBEFD6", fg: "#9A7320" };
    case "terminiert":
      return { bg: "#D8ECF3", fg: "#2C6B85" };
    case "kein_interesse":
      return { bg: "#E8E8E8", fg: "#595959" };
    case "abgeschlossen":
      return { bg: "#DDE7D6", fg: "#4C6B3B" };
    default:
      return { bg: "#E8E8E8", fg: "#595959" };
  }
};

const sourceColor = (source: string) => {
  switch (source) {
    case "tiktok":
      return { bg: "#111111", fg: "#FFFFFF" };
    case "meta":
      return { bg: "#E7F0FE", fg: "#1B57C4" };
    case "landingpage":
      return { bg: "#D4E5DC", fg: "#3E6A4E" };
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

const normalize = (s: string) =>
  s
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

// Map a raw source string to one of our normalized source values.
const mapSource = (raw: string): string => {
  const n = normalize(raw);
  if (!n) return "unbekannt";
  if (n.includes("tiktok") || n.includes("tt")) return "tiktok";
  if (
    n.includes("meta") ||
    n.includes("facebook") ||
    n.includes("fb") ||
    n.includes("insta") ||
    n.includes("ig")
  )
    return "meta";
  if (
    n.includes("landing") ||
    n.includes("website") ||
    n.includes("webseite") ||
    n.includes("homepage") ||
    n.includes("lp") ||
    n.includes("web")
  )
    return "landingpage";
  return "unbekannt";
};

// Header aliases -> canonical field. Compared via normalize().
const FIELD_ALIASES: Record<string, string[]> = {
  quelle: ["quelle", "source", "kanal", "herkunft", "plattform", "channel"],
  vorname: ["vorname", "firstname", "first"],
  nachname: ["nachname", "name", "lastname", "last", "familienname"],
  email: ["email", "mail", "emailadresse", "mailadresse", "eemail"],
  telefon: [
    "telefon",
    "telefonnummer",
    "tel",
    "phone",
    "handy",
    "mobile",
    "natel",
    "nummer",
  ],
  plz: ["plz", "postleitzahl", "zip", "postcode"],
  ort: ["ort", "city", "stadt", "wohnort"],
  status: ["status"],
  notes: ["notes", "notiz", "notizen", "bemerkung", "bemerkungen", "kommentar"],
};

const detectMapping = (headers: string[]): Record<string, number> => {
  const map: Record<string, number> = {};
  headers.forEach((h, idx) => {
    const nh = normalize(h);
    for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
      if (map[field] !== undefined) continue;
      if (aliases.some((a) => nh === a || nh.includes(a))) {
        map[field] = idx;
      }
    }
  });
  return map;
};

const AdminLeads = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("alle");
  const [sourceFilter, setSourceFilter] = useState<string>("alle");
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [savingNote, setSavingNote] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("leads")
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

  const handleFile = async (file: File) => {
    setImporting(true);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
        header: 1,
        blankrows: false,
        defval: "",
      });

      if (rows.length < 2) {
        toast({
          title: "Keine Daten gefunden",
          description: "Die Datei enthält keine Zeilen zum Importieren.",
          variant: "destructive",
        });
        setImporting(false);
        return;
      }

      const headers = (rows[0] as unknown[]).map((c) => String(c ?? ""));
      const mapping = detectMapping(headers);

      const val = (row: unknown[], field: string): string => {
        const idx = mapping[field];
        if (idx === undefined) return "";
        return String(row[idx] ?? "").trim();
      };

      const records = (rows.slice(1) as unknown[][])
        .map((row) => {
          const vorname = val(row, "vorname");
          const nachname = val(row, "nachname");
          const email = val(row, "email");
          const telefon = val(row, "telefon");
          const plz = val(row, "plz");
          const ort = val(row, "ort");
          const quelle = mapSource(val(row, "quelle"));
          const rawStatus = normalize(val(row, "status"));
          const status =
            STATUS_OPTIONS.find((s) => normalize(s.label) === rawStatus)
              ?.value ??
            STATUS_OPTIONS.find((s) => s.value === rawStatus)?.value ??
            "neu";
          const notes = val(row, "notes");
          return {
            quelle,
            vorname,
            nachname,
            email,
            telefon,
            plz,
            ort,
            status,
            notes,
          };
        })
        // Drop fully empty rows
        .filter(
          (r) =>
            r.vorname || r.nachname || r.email || r.telefon || r.plz || r.ort
        );

      if (records.length === 0) {
        toast({
          title: "Keine gültigen Leads",
          description:
            "Es konnten keine Zeilen mit Daten gelesen werden. Prüfe die Spaltenüberschriften.",
          variant: "destructive",
        });
        setImporting(false);
        return;
      }

      const { error } = await supabase.from("leads").insert(records);
      if (error) {
        toast({
          title: "Import fehlgeschlagen",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Import erfolgreich",
          description: `${records.length} Leads wurden importiert.`,
        });
        await fetchLeads();
      }
    } catch (e) {
      toast({
        title: "Datei konnte nicht gelesen werden",
        description: e instanceof Error ? e.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    }
    setImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleStatusChange = async (id: string, status: string) => {
    const prev = leads;
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l)));
    const { error } = await supabase
      .from("leads")
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

  const handleSourceChange = async (id: string, quelle: string) => {
    const prev = leads;
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, quelle } : l)));
    const { error } = await supabase
      .from("leads")
      .update({ quelle })
      .eq("id", id);
    if (error) {
      setLeads(prev);
      toast({
        title: "Quelle nicht gespeichert",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSaveNote = async (id: string) => {
    setSavingNote(id);
    const notes = noteDrafts[id] ?? "";
    const { error } = await supabase
      .from("leads")
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
    const { error } = await supabase.from("leads").delete().eq("id", id);
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




  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const matchesStatus =
        statusFilter === "alle" || l.status === statusFilter;
      const matchesSource =
        sourceFilter === "alle" || l.quelle === sourceFilter;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        `${l.vorname} ${l.nachname}`.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.telefon.toLowerCase().includes(q) ||
        l.ort.toLowerCase().includes(q) ||
        l.plz.toLowerCase().includes(q);
      return matchesStatus && matchesSource && matchesQuery;
    });
  }, [leads, statusFilter, sourceFilter, query]);

  const statusCounts = useMemo(() => {
    const c: Record<string, number> = { alle: leads.length };
    for (const l of leads) c[l.status] = (c[l.status] ?? 0) + 1;
    return c;
  }, [leads]);

  const exportCsv = () => {
    const headers = [
      "Erstellt",
      "Quelle",
      "Vorname",
      "Nachname",
      "E-Mail",
      "Telefon",
      "PLZ",
      "Ort",
      "Status",
      "Notizen",
    ];
    const escape = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
    const rows = filtered.map((l) =>
      [
        formatDate(l.created_at),
        SOURCE_OPTIONS.find((s) => s.value === l.quelle)?.label ?? l.quelle,
        l.vorname,
        l.nachname,
        l.email,
        l.telefon,
        l.plz,
        l.ort,
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

  return (
    <div className="min-h-screen bg-ssm-cream">
      {/* Header */}
      <header className="border-b border-ssm-akzent/40 bg-white">
        <div
          className="mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-4"
          style={{ maxWidth: 1280 }}
        >
          <div>
            <div className="flex items-center gap-3">
              <Link
                to="/admin"
                className="inline-flex items-center gap-1 font-verdana text-ssm-grau transition-colors hover:text-ssm-primaer"
                style={{ fontSize: 12 }}
              >
                <ArrowLeft size={14} /> Termine
              </Link>
            </div>
            <h1
              className="font-arial text-ssm-primaer"
              style={{ fontSize: 22, fontWeight: 900, marginTop: 2 }}
            >
              Leads · Import
            </h1>
            <p
              className="font-verdana text-ssm-grau"
              style={{ fontSize: 12, marginTop: 2 }}
            >
              {user?.email}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="inline-flex items-center gap-2 rounded bg-ssm-primaer px-3 py-2 font-arial font-bold text-white transition-colors hover:bg-ssm-primaer-dark disabled:opacity-50"
              style={{ fontSize: 13 }}
            >
              <Upload size={15} />
              {importing ? "Importiert…" : "Excel importieren"}
            </button>
            <button
              onClick={fetchLeads}
              className="inline-flex items-center gap-2 rounded border border-ssm-akzent/60 px-3 py-2 font-arial text-ssm-primaer transition-colors hover:bg-ssm-cream"
              style={{ fontSize: 13 }}
            >
              <RefreshCw size={15} /> Aktualisieren
            </button>
            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-2 rounded border border-ssm-akzent/60 px-3 py-2 font-arial text-ssm-primaer transition-colors hover:bg-ssm-cream"
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

      <main className="mx-auto px-6 py-8" style={{ maxWidth: 1280 }}>
        {/* Import hint */}
        <div
          className="mb-6 rounded-lg border border-dashed border-ssm-akzent/60 bg-white font-verdana text-ssm-grau"
          style={{ padding: 16, fontSize: 13, lineHeight: 1.6 }}
        >
          <strong className="text-ssm-primaer">Excel importieren:</strong>{" "}
          Erste Zeile = Spaltenüberschriften. Erkannt werden u.a.:{" "}
          <em>Quelle, Vorname, Nachname, E-Mail, Telefon, PLZ, Ort</em>. Die
          Quelle wird automatisch zu TikTok / Meta / Landingpage zugeordnet.
        </div>

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
              placeholder="Suche nach Name, E-Mail, Telefon, Ort…"
              className="w-full rounded border border-ssm-akzent/60 bg-white font-verdana"
              style={{
                padding: "10px 12px 10px 36px",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="rounded border border-ssm-akzent/60 bg-white font-verdana text-ssm-primaer"
            style={{ padding: "9px 12px", fontSize: 13, outline: "none" }}
          >
            <option value="alle">Alle Quellen</option>
            {SOURCE_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status pills */}
        <div className="mb-6 flex flex-wrap gap-2">
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
                {statusCounts[s.value] ? ` (${statusCounts[s.value]})` : ""}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="py-20 text-center font-verdana text-ssm-grau">
            Leads werden geladen…
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-ssm-akzent/60 bg-white py-20 text-center font-verdana text-ssm-grau">
            {leads.length === 0
              ? "Noch keine Leads. Importiere eine Excel-Datei, um zu starten."
              : "Keine Leads für diese Filter gefunden."}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-ssm-akzent/40 bg-white">
            <table className="w-full border-collapse" style={{ fontSize: 13 }}>
              <thead>
                <tr
                  className="font-arial uppercase text-ssm-grau"
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.5px",
                    borderBottom: "1.5px solid #e4e5d4",
                  }}
                >
                  <th style={{ padding: "12px 14px", textAlign: "left" }}>Name</th>
                  <th style={{ padding: "12px 14px", textAlign: "left" }}>Quelle</th>
                  <th style={{ padding: "12px 14px", textAlign: "left" }}>E-Mail</th>
                  <th style={{ padding: "12px 14px", textAlign: "left" }}>Telefon</th>
                  <th style={{ padding: "12px 14px", textAlign: "left" }}>PLZ / Ort</th>
                  <th style={{ padding: "12px 14px", textAlign: "left" }}>Status</th>
                  <th style={{ padding: "12px 14px", textAlign: "left" }}>Erstellt</th>
                  <th style={{ padding: "12px 14px", textAlign: "right" }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => {
                  const c = statusColor(lead.status);
                  const sc = sourceColor(lead.quelle);
                  const dirty =
                    (noteDrafts[lead.id] ?? "") !== (lead.notes ?? "");
                  const fullName =
                    `${lead.vorname} ${lead.nachname}`.trim() || "—";
                  const expanded = expandedId === lead.id;
                  const hasNote = (lead.notes ?? "").trim().length > 0;
                  return (
                    <Fragment key={lead.id}>
                      <tr
                        key={lead.id}
                        onClick={() =>
                          setExpandedId(expanded ? null : lead.id)
                        }
                        className="cursor-pointer transition-colors hover:bg-ssm-cream/60"
                        style={{ borderBottom: "1px solid #eef0e2" }}
                      >
                        <td
                          className="font-arial text-ssm-primaer"
                          style={{ padding: "11px 14px", fontWeight: 700 }}
                        >
                          {fullName}
                          {hasNote && (
                            <span
                              title="Notiz vorhanden"
                              style={{ marginLeft: 6, opacity: 0.6 }}
                            >
                              📝
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "11px 14px" }}>
                          <span
                            className="font-arial font-bold uppercase"
                            style={{
                              fontSize: 10,
                              letterSpacing: "0.5px",
                              padding: "3px 9px",
                              borderRadius: 999,
                              background: sc.bg,
                              color: sc.fg,
                            }}
                          >
                            {SOURCE_OPTIONS.find((s) => s.value === lead.quelle)
                              ?.label ?? lead.quelle}
                          </span>
                        </td>
                        <td
                          className="font-verdana text-ssm-grau"
                          style={{ padding: "11px 14px" }}
                        >
                          {lead.email ? (
                            <a
                              href={`mailto:${lead.email}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-ssm-primaer underline"
                            >
                              {lead.email}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td
                          className="font-verdana text-ssm-grau"
                          style={{ padding: "11px 14px", whiteSpace: "nowrap" }}
                        >
                          {lead.telefon ? (
                            <a
                              href={`tel:${lead.telefon}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-ssm-primaer underline"
                            >
                              {lead.telefon}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td
                          className="font-verdana text-ssm-grau"
                          style={{ padding: "11px 14px", whiteSpace: "nowrap" }}
                        >
                          {(lead.plz || lead.ort)
                            ? `${lead.plz} ${lead.ort}`.trim()
                            : "—"}
                        </td>
                        <td
                          style={{ padding: "11px 14px" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <select
                            value={lead.status}
                            onChange={(e) =>
                              handleStatusChange(lead.id, e.target.value)
                            }
                            title="Status"
                            className="rounded border font-verdana"
                            style={{
                              padding: "5px 8px",
                              fontSize: 12,
                              outline: "none",
                              background: c.bg,
                              color: c.fg,
                              borderColor: "transparent",
                              fontWeight: 700,
                            }}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option
                                key={s.value}
                                value={s.value}
                                style={{ background: "#fff", color: "#333" }}
                              >
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td
                          className="font-verdana text-ssm-grau"
                          style={{
                            padding: "11px 14px",
                            fontSize: 12,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatDate(lead.created_at)}
                        </td>
                        <td
                          style={{ padding: "11px 14px", textAlign: "right" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleDelete(lead.id)}
                            title="Lead löschen"
                            className="rounded border border-ssm-akzent/60 p-1.5 text-ssm-grau transition-colors hover:border-red-300 hover:text-red-600"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                      {expanded && (
                        <tr
                          key={`${lead.id}-notes`}
                          style={{
                            borderBottom: "1px solid #eef0e2",
                            background: "#fbfbf5",
                          }}
                        >
                          <td colSpan={8} style={{ padding: "14px 18px" }}>
                            <div className="flex flex-wrap items-center gap-3">
                              <span
                                className="font-verdana text-ssm-grau"
                                style={{ fontSize: 12 }}
                              >
                                Quelle:
                              </span>
                              <select
                                value={lead.quelle}
                                onChange={(e) =>
                                  handleSourceChange(lead.id, e.target.value)
                                }
                                className="rounded border border-ssm-akzent/60 bg-white font-verdana text-ssm-primaer"
                                style={{
                                  padding: "5px 8px",
                                  fontSize: 12,
                                  outline: "none",
                                }}
                              >
                                {SOURCE_OPTIONS.map((s) => (
                                  <option key={s.value} value={s.value}>
                                    {s.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <label
                              className="font-arial font-bold uppercase text-ssm-primaer"
                              style={{
                                fontSize: 11,
                                letterSpacing: "0.6px",
                                display: "block",
                                margin: "12px 0 6px",
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
                                {savingNote === lead.id
                                  ? "Speichert…"
                                  : "Speichern"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminLeads;
