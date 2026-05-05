import { Check, Minus } from "lucide-react";

type Row = { ok: boolean; text: string };

const bankRows: Row[] = [
  { ok: true, text: "Altersparen mit Verzinsung" },
  { ok: true, text: "Steuerabzug (CHF 7'258 in 2026)" },
  { ok: false, text: "Kein Schutz bei Invaliditaet" },
  { ok: false, text: "Keine Familienabsicherung" },
];

const versRows: Row[] = [
  { ok: true, text: "Altersparen mit garantiertem Kapital" },
  { ok: true, text: "Steuerabzug (identisch zur Bank)" },
  { ok: true, text: "Lohnschutz bei Invaliditaet bis 90%" },
  { ok: true, text: "Todesfallabsicherung fuer die Familie" },
];

const Pill = ({ ok }: { ok: boolean }) => (
  <span
    className="flex shrink-0 items-center justify-center rounded-full"
    style={{
      width: 28,
      height: 28,
      padding: 4,
      background: ok ? "#D4E5DC" : "#ebe9e0",
      opacity: ok ? 1 : 0.7,
    }}
  >
    {ok ? (
      <Check size={16} className="text-ssm-primaer" strokeWidth={3} />
    ) : (
      <Minus size={16} className="text-ssm-grau" strokeWidth={3} />
    )}
  </span>
);

const RowItem = ({ ok, text }: Row) => (
  <li
    className="flex items-center font-verdana"
    style={{
      padding: "16px 0",
      borderBottom: "1px solid #f2f2f2",
      gap: 14,
      fontSize: 15,
    }}
  >
    <Pill ok={ok} />
    <span className="text-ssm-primaer">{text}</span>
  </li>
);

const Comparison = () => {
  return (
    <section
      id="vergleich"
      className="bg-ssm-cream px-6 py-[60px] md:px-[50px] md:py-[90px]"
    >
      <div className="mx-auto" style={{ maxWidth: 1180 }}>
        <div
          className="bg-ssm-akzent"
          style={{ width: 60, height: 4, marginBottom: 20 }}
        />
        <div
          className="font-arial font-bold uppercase text-ssm-sekundaer"
          style={{ fontSize: 13, letterSpacing: "1.5px" }}
        >
          Saeule 3a · Direkt-Vergleich
        </div>
        <h2
          className="font-arial text-ssm-primaer"
          style={{
            fontSize: 42,
            fontWeight: 900,
            letterSpacing: "-0.8px",
            lineHeight: 1.1,
            marginTop: 14,
          }}
        >
          Bank deckt 2 Vorteile.
          <br />
          Versicherung deckt{" "}
          <em
            className="text-ssm-sekundaer"
            style={{ fontStyle: "italic", fontWeight: 400 }}
          >
            vier.
          </em>
        </h2>
        <p
          className="font-verdana text-ssm-grau"
          style={{
            fontSize: 17,
            lineHeight: 1.65,
            maxWidth: 720,
            marginTop: 20,
          }}
        >
          Gleicher Steuerabzug. Gleiches Altersparen. Aber zwei
          zusaetzliche Bausteine, die zwischen «es geht weiter» und «es
          geht nicht mehr» entscheiden.
        </p>

        <div
          className="grid grid-cols-1 md:grid-cols-2"
          style={{ gap: 24, marginTop: 32 }}
        >
          {/* Spalte 1 - Bank */}
          <div
            className="bg-white"
            style={{
              borderRadius: 8,
              padding: 36,
              border: "2px solid #e0ded3",
              opacity: 0.92,
            }}
          >
            <h4
              className="font-arial text-ssm-primaer"
              style={{ fontSize: 24, fontWeight: 900, lineHeight: 1.2 }}
            >
              Saeule 3a bei der Bank
            </h4>
            <div
              className="font-arial font-bold uppercase text-ssm-grau"
              style={{
                fontSize: 12,
                letterSpacing: "1.5px",
                marginTop: 8,
                marginBottom: 28,
              }}
            >
              2 Vorteile
            </div>
            <ul className="m-0 list-none p-0">
              {bankRows.map((r) => (
                <RowItem key={r.text} {...r} />
              ))}
            </ul>
          </div>

          {/* Spalte 2 - Versicherung */}
          <div
            className="relative bg-white"
            style={{
              borderRadius: 8,
              padding: 36,
              border: "2px solid #6A7C76",
              boxShadow: "0 16px 40px rgba(50,70,66,0.1)",
            }}
          >
            <span
              className="absolute bg-ssm-primaer font-arial font-bold uppercase text-white"
              style={{
                top: -13,
                right: 24,
                fontSize: 11,
                letterSpacing: "1px",
                padding: "5px 14px",
                borderRadius: 4,
              }}
            >
              EMPFEHLUNG
            </span>
            <h4
              className="font-arial text-ssm-primaer"
              style={{ fontSize: 24, fontWeight: 900, lineHeight: 1.2 }}
            >
              Saeule 3a bei der Versicherung
            </h4>
            <div
              className="font-arial font-bold uppercase text-ssm-sekundaer"
              style={{
                fontSize: 12,
                letterSpacing: "1.5px",
                marginTop: 8,
                marginBottom: 28,
              }}
            >
              4 Vorteile · gleicher Steuerabzug
            </div>
            <ul className="m-0 list-none p-0">
              {versRows.map((r) => (
                <RowItem key={r.text} {...r} />
              ))}
            </ul>
            <div className="flex justify-center" style={{ marginTop: 28 }}>
              <a
                href="#termin"
                className="inline-block bg-ssm-primaer font-arial font-bold uppercase text-white transition-colors hover:bg-ssm-primaer-dark"
                style={{
                  fontSize: 15,
                  padding: "16px 28px",
                  borderRadius: 4,
                  letterSpacing: "0.5px",
                }}
              >
                Meine Loesung berechnen lassen
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Comparison;
