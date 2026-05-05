import { useState, type FormEvent } from "react";
import { ArrowRight, Lock } from "lucide-react";

const topics = ["Vorsorge / 3a", "Eigenheim", "Steuern", "Allgemein"];
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

const labelClass =
  "font-arial font-bold uppercase text-ssm-primaer";
const labelStyle: React.CSSProperties = {
  fontSize: 12,
  letterSpacing: "0.8px",
  display: "block",
  marginBottom: 10,
};

const BookingCard = () => {
  const [topic, setTopic] = useState(topics[0]);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [time, setTime] = useState(times[0]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log({ topic, name, contact, time });
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
      {/* top accent stripe */}
      <div
        aria-hidden
        className="absolute bg-ssm-akzent"
        style={{ height: 6, top: 0, left: 24, right: 24, borderRadius: 4 }}
      />

      {/* Availability tag */}
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

      {/* Step indicator */}
      <div className="flex" style={{ gap: 6, marginTop: 20, marginBottom: 24 }}>
        <div className="flex-1 bg-ssm-primaer" style={{ height: 4, borderRadius: 9999 }} />
        <div className="flex-1" style={{ height: 4, borderRadius: 9999, background: "#f2f2f2" }} />
        <div className="flex-1" style={{ height: 4, borderRadius: 9999, background: "#f2f2f2" }} />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: 18 }}>
        <div>
          <label className={labelClass} style={labelStyle}>
            Welches Thema interessiert dich?
          </label>
          <div className="grid grid-cols-2" style={{ gap: 10 }}>
            {topics.map((t) => {
              const active = topic === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTopic(t)}
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
                  {t}
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
            placeholder="z.B. Maria Mueller"
            style={inputBaseStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#6A7C76")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#d4d2c7")}
          />
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
            placeholder="So erreichen wir dich"
            style={inputBaseStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#6A7C76")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#d4d2c7")}
          />
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
          className="font-arial font-bold uppercase bg-ssm-primaer text-white transition-colors hover:bg-ssm-primaer-dark inline-flex items-center justify-center"
          style={{
            padding: 16,
            borderRadius: 4,
            fontSize: 16,
            marginTop: 8,
            gap: 8,
          }}
        >
          Termin reservieren <ArrowRight size={18} />
        </button>

        <div
          className="flex items-center justify-center font-verdana text-ssm-grau"
          style={{ gap: 4, fontSize: 11 }}
        >
          <Lock size={12} />
          <span>Deine Daten bleiben in der Schweiz. Kein Newsletter.</span>
        </div>
      </form>
    </div>
  );
};

export default BookingCard;
