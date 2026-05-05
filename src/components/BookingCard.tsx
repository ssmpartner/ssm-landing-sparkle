import { useMemo, useState, type FormEvent } from "react";
import { ArrowRight, Check, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const topics = [
  { key: "vorsorge", label: "Vorsorge / 3a" },
  { key: "eigenheim", label: "Eigenheim" },
  { key: "steuern", label: "Steuern" },
  { key: "allgemein", label: "Allgemein" },
] as const;

const times = [
  "Vormittags (08-12 Uhr)",
  "Mittags (12-14 Uhr)",
  "Nachmittags (14-18 Uhr)",
  "Abends (18-20 Uhr)",
];

const inputBaseStyle: React.CSSProperties = {
  padding: "13px 14px",
  border: "1.5px solid #d4d2c7",
  borderRadius: 4,
  fontFamily: "Verdana, Geneva, sans-serif",
  fontSize: 14,
  width: "100%",
  outline: "none",
  background: "white",
};

const labelClass = "font-arial font-bold uppercase text-ssm-primaer";
const labelStyle: React.CSSProperties = {
  fontSize: 12,
  letterSpacing: "0.8px",
  display: "block",
  marginBottom: 10,
};

const errorTextStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#A4503D",
  marginTop: 6,
  fontFamily: "Verdana, Geneva, sans-serif",
};

const isEmail = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
const isPhone = (v: string) =>
  /^[+\d][\d\s/().-]{6,}$/.test(v.trim());

const BookingCard = () => {
  const [topic, setTopic] = useState<(typeof topics)[number]["key"]>(
    topics[0].key
  );
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [time, setTime] = useState(times[0]);
  const [website, setWebsite] = useState(""); // honeypot
  const [touched, setTouched] = useState<{ name?: boolean; contact?: boolean }>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameError = useMemo(
    () => (name.trim().length < 2 ? "Bitte gib deinen Namen ein (min. 2 Zeichen)." : null),
    [name]
  );
  const contactError = useMemo(() => {
    const v = contact.trim();
    if (!v) return "Bitte gib eine E-Mail oder Telefonnummer an.";
    if (!isEmail(v) && !isPhone(v))
      return "Bitte gueltige E-Mail oder Telefonnummer angeben.";
    return null;
  }, [contact]);

  const isValid = !nameError && !contactError;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, contact: true });
    if (!isValid || isSubmitting) return;
    if (website.trim() !== "") return; // honeypot tripped

    setError(null);
    setIsSubmitting(true);
    try {
      const { error: insertError } = await supabase
        .from("beratungstermine")
        .insert({
          thema: topic,
          name: name.trim(),
          kontakt: contact.trim(),
          bevorzugte_zeit: time,
        });
      if (insertError) throw insertError;
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      setError(
        "Etwas ist schiefgelaufen. Bitte versuche es nochmal oder ruf uns direkt an."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="relative bg-white"
      style={{
        borderRadius: 16,
        padding: 36,
        boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
      }}
    >
      <div
        aria-hidden
        className="absolute bg-ssm-akzent"
        style={{ height: 6, top: 0, left: 24, right: 24, borderRadius: 4 }}
      />

      {isSuccess ? (
        <div className="flex flex-col items-center text-center" style={{ paddingTop: 12, paddingBottom: 12 }}>
          <div
            className="flex items-center justify-center bg-ssm-status-positiv-bg"
            style={{ width: 64, height: 64, borderRadius: 9999, marginBottom: 20 }}
          >
            <Check size={32} className="text-ssm-status-positiv" strokeWidth={3} />
          </div>
          <h3
            className="font-arial text-ssm-primaer"
            style={{ fontSize: 24, fontWeight: 900, lineHeight: 1.2 }}
          >
            Termin-Anfrage erhalten!
          </h3>
          <p
            className="font-verdana text-ssm-grau"
            style={{ fontSize: 14, lineHeight: 1.6, marginTop: 12, maxWidth: 320 }}
          >
            Wir melden uns innerhalb von 24 Stunden bei dir.
          </p>
        </div>
      ) : (
        <>
          <div
            className="inline-flex items-center font-arial font-bold uppercase bg-ssm-status-positiv-bg text-ssm-status-positiv"
            style={{
              fontSize: 11,
              padding: "6px 14px",
              borderRadius: 9999,
              marginBottom: 16,
              gap: 8,
            }}
          >
            <span
              className="inline-block bg-ssm-status-positiv animate-pulse-dot"
              style={{ width: 6, height: 6, borderRadius: 9999 }}
            />
            Verfuegbar diese Woche
          </div>

          <h3
            className="font-arial text-ssm-primaer"
            style={{ fontSize: 26, lineHeight: 1.2, fontWeight: 700 }}
          >
            Beratungstermin sichern.
          </h3>
          <p
            className="font-verdana text-ssm-grau"
            style={{ fontSize: 14, marginTop: 8 }}
          >
            In 30 Sekunden gebucht. Kostenlos und unverbindlich.
          </p>

          <div className="flex" style={{ gap: 6, marginTop: 20, marginBottom: 24 }}>
            <div className="flex-1 bg-ssm-primaer" style={{ height: 4, borderRadius: 9999 }} />
            <div className="flex-1" style={{ height: 4, borderRadius: 9999, background: "#f2f2f2" }} />
            <div className="flex-1" style={{ height: 4, borderRadius: 9999, background: "#f2f2f2" }} />
          </div>

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
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: 18 }}>
            {/* Honeypot */}
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              name="website"
              style={{ display: "none" }}
              aria-hidden
            />

            <div>
              <label className={labelClass} style={labelStyle}>
                Welches Thema interessiert dich?
              </label>
              <div className="grid grid-cols-2" style={{ gap: 10 }}>
                {topics.map((t) => {
                  const active = topic === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setTopic(t.key)}
                      className={`font-arial font-bold transition-colors ${
                        active
                          ? "bg-ssm-primaer text-white"
                          : "bg-white text-ssm-grau hover:text-ssm-sekundaer"
                      }`}
                      style={{
                        padding: 12,
                        borderRadius: 4,
                        border: `1.5px solid ${active ? "#324642" : "#d4d2c7"}`,
                        fontSize: 13,
                        textAlign: "center",
                      }}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className={labelClass} style={labelStyle} htmlFor="name">
                Vor- und Nachname
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={(e) => {
                  setTouched((t) => ({ ...t, name: true }));
                  e.currentTarget.style.borderColor = "#d4d2c7";
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#6A7C76")}
                placeholder="z.B. Maria Mueller"
                style={inputBaseStyle}
              />
              {touched.name && nameError && (
                <div style={errorTextStyle}>{nameError}</div>
              )}
            </div>

            <div>
              <label className={labelClass} style={labelStyle} htmlFor="contact">
                E-Mail oder Telefon
              </label>
              <input
                id="contact"
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                onBlur={(e) => {
                  setTouched((t) => ({ ...t, contact: true }));
                  e.currentTarget.style.borderColor = "#d4d2c7";
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#6A7C76")}
                placeholder="So erreichen wir dich"
                style={inputBaseStyle}
              />
              {touched.contact && contactError && (
                <div style={errorTextStyle}>{contactError}</div>
              )}
            </div>

            <div>
              <label className={labelClass} style={labelStyle} htmlFor="time">
                Bevorzugte Zeit
              </label>
              <select
                id="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                style={inputBaseStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#6A7C76")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#d4d2c7")}
              >
                {times.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="font-arial font-bold uppercase bg-ssm-primaer text-white transition-colors hover:bg-ssm-primaer-dark inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                padding: 16,
                borderRadius: 4,
                fontSize: 16,
                marginTop: 8,
                gap: 8,
              }}
            >
              {isSubmitting ? "Wird gesendet..." : "Termin reservieren"}{" "}
              {!isSubmitting && <ArrowRight size={18} />}
            </button>

            <div
              className="flex items-center justify-center font-verdana text-ssm-grau"
              style={{ gap: 4, fontSize: 11 }}
            >
              <Lock size={12} />
              <span>Deine Daten bleiben in der Schweiz. Kein Newsletter.</span>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default BookingCard;
