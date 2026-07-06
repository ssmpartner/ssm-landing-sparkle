import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Megaphone,
  MessageSquare,
  Pencil,
  RefreshCw,
  Save,
  StickyNote,
  X,
  Check,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logLeadActivity, type LeadActivityType } from "@/lib/leadActivity";

export interface Lead {
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

interface Activity {
  id: string;
  created_at: string;
  actor: string;
  type: string;
  description: string;
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

const statusLabel = (v: string) =>
  STATUS_OPTIONS.find((s) => s.value === v)?.label ?? v;
const sourceLabel = (v: string) =>
  SOURCE_OPTIONS.find((s) => s.value === v)?.label ?? v;

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

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const activityIcon = (type: string) => {
  switch (type) {
    case "status":
      return RefreshCw;
    case "quelle":
      return Megaphone;
    case "edit":
      return Pencil;
    case "note":
      return StickyNote;
    case "created":
      return Sparkles;
    default:
      return MessageSquare;
  }
};

interface Props {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actor: string;
  onChanged: () => void;
}

const emptyForm = (l: Lead | null) => ({
  vorname: l?.vorname ?? "",
  nachname: l?.nachname ?? "",
  email: l?.email ?? "",
  telefon: l?.telefon ?? "",
  plz: l?.plz ?? "",
  ort: l?.ort ?? "",
  quelle: l?.quelle ?? "unbekannt",
});

const LeadModal = ({ lead, open, onOpenChange, actor, onChanged }: Props) => {
  const { toast } = useToast();
  const [current, setCurrent] = useState<Lead | null>(lead);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyForm(lead));
  const [saving, setSaving] = useState(false);

  const [noteDraft, setNoteDraft] = useState(lead?.notes ?? "");
  const [savingNote, setSavingNote] = useState(false);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [comment, setComment] = useState("");
  const [addingComment, setAddingComment] = useState(false);

  // Sync when a different lead is opened.
  useEffect(() => {
    setCurrent(lead);
    setForm(emptyForm(lead));
    setNoteDraft(lead?.notes ?? "");
    setEditing(false);
    setComment("");
  }, [lead?.id, lead]);

  const fetchActivities = useCallback(async (leadId: string) => {
    setLoadingActivities(true);
    const { data, error } = await supabase
      .from("lead_activities")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false });
    if (!error) setActivities(data as Activity[]);
    setLoadingActivities(false);
  }, []);

  useEffect(() => {
    if (open && current?.id) fetchActivities(current.id);
  }, [open, current?.id, fetchActivities]);

  const refreshActivities = () => {
    if (current?.id) fetchActivities(current.id);
  };

  const log = async (type: LeadActivityType, description: string) => {
    if (!current) return;
    await logLeadActivity(current.id, actor, type, description);
    refreshActivities();
  };

  const handleStatusChange = async (status: string) => {
    if (!current) return;
    const prev = current;
    setCurrent({ ...current, status });
    const { error } = await supabase
      .from("leads")
      .update({ status })
      .eq("id", current.id);
    if (error) {
      setCurrent(prev);
      toast({ title: "Status nicht gespeichert", description: error.message, variant: "destructive" });
      return;
    }
    await log("status", `Status: ${statusLabel(prev.status)} → ${statusLabel(status)}`);
    onChanged();
  };

  const handleSaveEdit = async () => {
    if (!current) return;
    setSaving(true);
    const changes: string[] = [];
    const fields: (keyof ReturnType<typeof emptyForm>)[] = [
      "vorname",
      "nachname",
      "email",
      "telefon",
      "plz",
      "ort",
      "quelle",
    ];
    const labels: Record<string, string> = {
      vorname: "Vorname",
      nachname: "Nachname",
      email: "E-Mail",
      telefon: "Telefon",
      plz: "PLZ",
      ort: "Ort",
      quelle: "Quelle",
    };
    for (const f of fields) {
      const before = (current as unknown as Record<string, string>)[f] ?? "";
      const after = form[f] ?? "";
      if (before !== after) {
        const b = f === "quelle" ? sourceLabel(before) : before || "—";
        const a = f === "quelle" ? sourceLabel(after) : after || "—";
        changes.push(`${labels[f]}: "${b}" → "${a}"`);
      }
    }
    if (changes.length === 0) {
      setEditing(false);
      setSaving(false);
      return;
    }
    const { error } = await supabase.from("leads").update(form).eq("id", current.id);
    if (error) {
      toast({ title: "Nicht gespeichert", description: error.message, variant: "destructive" });
      setSaving(false);
      return;
    }
    setCurrent({ ...current, ...form });
    setEditing(false);
    setSaving(false);
    toast({ title: "Änderungen gespeichert" });
    await log("edit", changes.join(" · "));
    onChanged();
  };

  const handleSaveNote = async () => {
    if (!current) return;
    setSavingNote(true);
    const { error } = await supabase
      .from("leads")
      .update({ notes: noteDraft })
      .eq("id", current.id);
    if (error) {
      toast({ title: "Notiz nicht gespeichert", description: error.message, variant: "destructive" });
      setSavingNote(false);
      return;
    }
    setCurrent({ ...current, notes: noteDraft });
    setSavingNote(false);
    toast({ title: "Notiz gespeichert" });
    await log("note", "Notiz aktualisiert");
    onChanged();
  };

  const handleAddComment = async () => {
    const text = comment.trim();
    if (!text || !current) return;
    setAddingComment(true);
    await log("comment", text);
    setComment("");
    setAddingComment(false);
  };

  const fullName = useMemo(
    () => `${current?.vorname ?? ""} ${current?.nachname ?? ""}`.trim() || "Ohne Namen",
    [current]
  );

  if (!current) return null;
  const sc = statusColor(current.status);
  const noteDirty = noteDraft !== (current.notes ?? "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 p-0">
        <DialogHeader className="border-b border-ssm-akzent/40 px-6 py-4">
          <div className="flex items-center gap-3">
            <DialogTitle className="font-arial text-ssm-primaer" style={{ fontSize: 19, fontWeight: 900 }}>
              {fullName}
            </DialogTitle>
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
              {statusLabel(current.status)}
            </span>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="mx-6 mt-4 grid w-[calc(100%-3rem)] grid-cols-2">
            <TabsTrigger value="details" className="font-arial">Details</TabsTrigger>
            <TabsTrigger value="aktivitaet" className="font-arial">Aktivität</TabsTrigger>
          </TabsList>

          {/* DETAILS */}
          <TabsContent value="details" className="max-h-[60vh] overflow-y-auto px-6 py-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="font-verdana text-ssm-grau" style={{ fontSize: 12 }}>
                  Status:
                </label>
                <select
                  value={current.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="rounded border border-ssm-akzent/60 bg-white font-verdana text-ssm-primaer"
                  style={{ padding: "6px 10px", fontSize: 13, outline: "none" }}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-2 rounded border border-ssm-akzent/60 px-3 py-2 font-arial font-bold text-ssm-primaer transition-colors hover:bg-ssm-cream"
                  style={{ fontSize: 13 }}
                >
                  <Pencil size={14} /> Bearbeiten
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setEditing(false); setForm(emptyForm(current)); }}
                    className="inline-flex items-center gap-1 rounded border border-ssm-akzent/60 px-3 py-2 font-arial text-ssm-grau transition-colors hover:bg-ssm-cream"
                    style={{ fontSize: 13 }}
                  >
                    <X size={14} /> Abbrechen
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="inline-flex items-center gap-1 rounded bg-ssm-primaer px-3 py-2 font-arial font-bold text-white transition-colors hover:bg-ssm-primaer-dark disabled:opacity-50"
                    style={{ fontSize: 13 }}
                  >
                    <Check size={14} /> {saving ? "Speichert…" : "Speichern"}
                  </button>
                </div>
              )}
            </div>

            {editing ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Vorname" value={form.vorname} onChange={(v) => setForm({ ...form, vorname: v })} />
                <Field label="Nachname" value={form.nachname} onChange={(v) => setForm({ ...form, nachname: v })} />
                <Field label="E-Mail" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
                <Field label="Telefon" value={form.telefon} onChange={(v) => setForm({ ...form, telefon: v })} />
                <Field label="PLZ" value={form.plz} onChange={(v) => setForm({ ...form, plz: v })} />
                <Field label="Ort" value={form.ort} onChange={(v) => setForm({ ...form, ort: v })} />
                <div>
                  <FieldLabel>Quelle</FieldLabel>
                  <select
                    value={form.quelle}
                    onChange={(e) => setForm({ ...form, quelle: e.target.value })}
                    className="w-full rounded border border-ssm-akzent/60 bg-white font-verdana text-ssm-primaer"
                    style={{ padding: "9px 10px", fontSize: 14, outline: "none" }}
                  >
                    {SOURCE_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                <ReadRow label="Vorname" value={current.vorname} />
                <ReadRow label="Nachname" value={current.nachname} />
                <ReadRow label="E-Mail" value={current.email} link={current.email ? `mailto:${current.email}` : undefined} />
                <ReadRow label="Telefon" value={current.telefon} link={current.telefon ? `tel:${current.telefon}` : undefined} />
                <ReadRow label="PLZ" value={current.plz} />
                <ReadRow label="Ort" value={current.ort} />
                <ReadRow label="Quelle" value={sourceLabel(current.quelle)} />
                <ReadRow label="Erstellt" value={formatDate(current.created_at)} />
              </div>
            )}

            {/* Notes */}
            <div className="mt-6">
              <FieldLabel>Notizen</FieldLabel>
              <div className="flex flex-col gap-2 sm:flex-row">
                <textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  rows={3}
                  placeholder="Interne Notiz…"
                  className="flex-1 rounded border border-ssm-akzent/60 bg-white font-verdana"
                  style={{ padding: "10px 12px", fontSize: 13, outline: "none", resize: "vertical" }}
                />
                <button
                  onClick={handleSaveNote}
                  disabled={!noteDirty || savingNote}
                  className="inline-flex items-center justify-center gap-2 self-start rounded bg-ssm-primaer px-4 py-2 font-arial font-bold text-white transition-colors hover:bg-ssm-primaer-dark disabled:opacity-40"
                  style={{ fontSize: 13 }}
                >
                  <Save size={15} /> {savingNote ? "Speichert…" : "Speichern"}
                </button>
              </div>
            </div>
          </TabsContent>

          {/* AKTIVITÄT */}
          <TabsContent value="aktivitaet" className="max-h-[60vh] overflow-y-auto px-6 py-5">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddComment(); }}
                placeholder="Kommentar / Ereignis dokumentieren…"
                className="flex-1 rounded border border-ssm-akzent/60 bg-white font-verdana"
                style={{ padding: "10px 12px", fontSize: 13, outline: "none" }}
              />
              <button
                onClick={handleAddComment}
                disabled={!comment.trim() || addingComment}
                className="inline-flex items-center justify-center gap-2 rounded bg-ssm-primaer px-4 py-2 font-arial font-bold text-white transition-colors hover:bg-ssm-primaer-dark disabled:opacity-40"
                style={{ fontSize: 13 }}
              >
                <MessageSquare size={15} /> Hinzufügen
              </button>
            </div>

            {loadingActivities ? (
              <p className="font-verdana text-ssm-grau" style={{ fontSize: 13 }}>Wird geladen…</p>
            ) : (
              <div className="relative flex flex-col gap-4">
                {activities.map((a) => {
                  const Icon = activityIcon(a.type);
                  return (
                    <div key={a.id} className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ssm-cream text-ssm-primaer">
                        <Icon size={15} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-verdana text-ssm-primaer" style={{ fontSize: 13, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                          {a.description}
                        </p>
                        <p className="font-verdana text-ssm-grau" style={{ fontSize: 11, marginTop: 2 }}>
                          {formatDate(a.created_at)}
                          {a.actor ? ` · ${a.actor}` : ""}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {/* Baseline creation event */}
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ssm-cream text-ssm-primaer">
                    <Sparkles size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-verdana text-ssm-primaer" style={{ fontSize: 13 }}>
                      Lead erfasst
                    </p>
                    <p className="font-verdana text-ssm-grau" style={{ fontSize: 11, marginTop: 2 }}>
                      {formatDate(current.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label
    className="font-arial font-bold uppercase text-ssm-primaer"
    style={{ fontSize: 11, letterSpacing: "0.6px", display: "block", marginBottom: 6 }}
  >
    {children}
  </label>
);

const Field = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <div>
    <FieldLabel>{label}</FieldLabel>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded border border-ssm-akzent/60 bg-white font-verdana"
      style={{ padding: "9px 10px", fontSize: 14, outline: "none" }}
    />
  </div>
);

const ReadRow = ({
  label,
  value,
  link,
}: {
  label: string;
  value: string;
  link?: string;
}) => (
  <div>
    <div className="font-arial font-bold uppercase text-ssm-grau" style={{ fontSize: 10, letterSpacing: "0.5px" }}>
      {label}
    </div>
    <div className="font-verdana text-ssm-primaer" style={{ fontSize: 14, marginTop: 2 }}>
      {value ? (
        link ? (
          <a href={link} className="text-ssm-primaer underline">{value}</a>
        ) : (
          value
        )
      ) : (
        "—"
      )}
    </div>
  </div>
);

export default LeadModal;
