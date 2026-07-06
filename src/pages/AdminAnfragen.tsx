import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Download, RefreshCw, Save, Search, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Anfrage {
  id: string;
  created_at: string;
  name: string;
  email: string;
  telefon: string;
  betreff: string;
  nachricht: string;
  status: string;
  notes: string;
}

const STATUS_OPTIONS = [
  { value: "neu", label: "Neu" },
  { value: "in_bearbeitung", label: "In Bearbeitung" },
  { value: "beantwortet", label: "Beantwortet" },
  { value: "erledigt", label: "Erledigt" },
  { value: "abgesagt", label: "Abgesagt" },
];

const statusColor = (status: string) => {
  switch (status) {
    case "neu":
      return { bg: "#D4E5DC", fg: "#4F7A5F" };
    case "in_bearbeitung":
      return { bg: "#FBEFD6", fg: "#9A7320" };
    case "beantwortet":
      return { bg: "#D8ECF3", fg: "#2C6B85" };
    case "erledigt":
      return { bg: "#DDE7D6", fg: "#4C6B3B" };
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

const AdminAnfragen = () => {
  const { toast } = useToast();

  const [items, setItems] = useState<Anfrage[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("alle");
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [savingNote, setSavingNote] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("anfragen")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({
        title: "Fehler beim Laden",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setItems(data as Anfrage[]);
      setNoteDrafts(
        Object.fromEntries((data as Anfrage[]).map((l) => [l.id, l.notes ?? ""]))
      );
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleStatusChange = async (id: string, status: string) => {
    const prev = items;
    setItems((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l)));
    const { error } = await supabase
      .from("anfragen")
      .update({ status })
      .eq("id", id);
    if (error) {
      setItems(prev);
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
      .from("anfragen")
      .update({ notes })
      .eq("id", id);
    if (error) {
      toast({
        title: "Notiz nicht gespeichert",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setItems((ls) => ls.map((l) => (l.id === id ? { ...l, notes } : l)));
      toast({ title: "Notiz gespeichert" });
    }
    setSavingNote(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Diese Anfrage wirklich löschen?")) return;
    const prev = items;
    setItems((ls) => ls.filter((l) => l.id !== id));
    const { error } = await supabase.from("anfragen").delete().eq("id", id);
    if (error) {
      setItems(prev);
      toast({
        title: "Löschen fehlgeschlagen",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Anfrage gelöscht" });
    }
  };

  const filtered = useMemo(() => {
    return items.filter((l) => {
      const matchesStatus =
        statusFilter === "alle" || l.status === statusFilter;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.telefon.toLowerCase().includes(q) ||
        l.betreff.toLowerCase().includes(q) ||
        l.nachricht.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [items, statusFilter, query]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { alle: items.length };
    for (const l of items) c[l.status] = (c[l.status] ?? 0) + 1;
    return c;
  }, [items]);

  const exportCsv = () => {
    const headers = [
      "Erstellt",
      "Name",
      "E-Mail",
      "Telefon",
      "Betreff",
      "Nachricht",
      "Status",
      "Notizen",
    ];
    const escape = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
    const rows = filtered.map((l) =>
      [
        formatDate(l.created_at),
        l.name,
        l.email,
        l.telefon,
        l.betreff,
        l.nachricht,
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
    a.download = `anfragen_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto px-6 py-8" style={{ maxWidth: 1280 }}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1
            className="font-arial text-ssm-primaer"
            style={{ fontSize: 24, fontWeight: 900 }}
          >
            Anfragen
          </h1>
          <p
            className="font-verdana text-ssm-grau"
            style={{ fontSize: 13, marginTop: 4 }}
          >
            Nachrichten aus dem Kontaktformular.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchItems}
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
        </div>
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
            placeholder="Suche nach Name, E-Mail, Betreff…"
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
          Anfragen werden geladen…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-ssm-akzent/60 bg-white py-20 text-center font-verdana text-ssm-grau">
          {items.length === 0
            ? "Noch keine Anfragen eingegangen."
            : "Keine Anfragen für diese Filter gefunden."}
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
                <th style={{ padding: "12px 14px", textAlign: "left" }}>E-Mail</th>
                <th style={{ padding: "12px 14px", textAlign: "left" }}>Telefon</th>
                <th style={{ padding: "12px 14px", textAlign: "left" }}>Betreff</th>
                <th style={{ padding: "12px 14px", textAlign: "left" }}>Status</th>
                <th style={{ padding: "12px 14px", textAlign: "left" }}>Erstellt</th>
                <th style={{ padding: "12px 14px", textAlign: "right" }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const c = statusColor(a.status);
                const dirty = (noteDrafts[a.id] ?? "") !== (a.notes ?? "");
                const expanded = expandedId === a.id;
                const hasNote = (a.notes ?? "").trim().length > 0;
                return (
                  <Fragment key={a.id}>
                    <tr
                      onClick={() => setExpandedId(expanded ? null : a.id)}
                      className="cursor-pointer transition-colors hover:bg-ssm-cream/60"
                      style={{ borderBottom: "1px solid #eef0e2" }}
                    >
                      <td
                        className="font-arial text-ssm-primaer"
                        style={{ padding: "11px 14px", fontWeight: 700 }}
                      >
                        {a.name || "—"}
                        {hasNote && (
                          <span
                            title="Notiz vorhanden"
                            style={{ marginLeft: 6, opacity: 0.6 }}
                          >
                            📝
                          </span>
                        )}
                      </td>
                      <td
                        className="font-verdana text-ssm-grau"
                        style={{ padding: "11px 14px" }}
                      >
                        {a.email ? (
                          <a
                            href={`mailto:${a.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-ssm-primaer underline"
                          >
                            {a.email}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td
                        className="font-verdana text-ssm-grau"
                        style={{ padding: "11px 14px", whiteSpace: "nowrap" }}
                      >
                        {a.telefon ? (
                          <a
                            href={`tel:${a.telefon}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-ssm-primaer underline"
                          >
                            {a.telefon}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td
                        className="font-verdana text-ssm-grau"
                        style={{ padding: "11px 14px" }}
                      >
                        {a.betreff || "—"}
                      </td>
                      <td
                        style={{ padding: "11px 14px" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          value={a.status}
                          onChange={(e) =>
                            handleStatusChange(a.id, e.target.value)
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
                        {formatDate(a.created_at)}
                      </td>
                      <td
                        style={{ padding: "11px 14px", textAlign: "right" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleDelete(a.id)}
                          title="Anfrage löschen"
                          className="rounded border border-ssm-akzent/60 p-1.5 text-ssm-grau transition-colors hover:border-red-300 hover:text-red-600"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                    {expanded && (
                      <tr
                        style={{
                          borderBottom: "1px solid #eef0e2",
                          background: "#fbfbf5",
                        }}
                      >
                        <td colSpan={7} style={{ padding: "14px 18px" }}>
                          <label
                            className="font-arial font-bold uppercase text-ssm-primaer"
                            style={{
                              fontSize: 11,
                              letterSpacing: "0.6px",
                              display: "block",
                              marginBottom: 6,
                            }}
                          >
                            Nachricht
                          </label>
                          <p
                            className="font-verdana text-ssm-grau"
                            style={{
                              fontSize: 13,
                              lineHeight: 1.7,
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {a.nachricht || "—"}
                          </p>

                          <label
                            className="font-arial font-bold uppercase text-ssm-primaer"
                            style={{
                              fontSize: 11,
                              letterSpacing: "0.6px",
                              display: "block",
                              margin: "14px 0 6px",
                            }}
                          >
                            Notizen
                          </label>
                          <div className="flex flex-col gap-2 sm:flex-row">
                            <textarea
                              value={noteDrafts[a.id] ?? ""}
                              onChange={(e) =>
                                setNoteDrafts((d) => ({
                                  ...d,
                                  [a.id]: e.target.value,
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
                              onClick={() => handleSaveNote(a.id)}
                              disabled={!dirty || savingNote === a.id}
                              className="inline-flex items-center justify-center gap-2 self-start rounded bg-ssm-primaer px-4 py-2 font-arial font-bold text-white transition-colors hover:bg-ssm-primaer-dark disabled:opacity-40"
                              style={{ fontSize: 13 }}
                            >
                              <Save size={15} />
                              {savingNote === a.id ? "Speichert…" : "Speichern"}
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
    </div>
  );
};

export default AdminAnfragen;
