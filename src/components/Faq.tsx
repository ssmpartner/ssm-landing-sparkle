import { useState } from "react";

type Item = { q: string; a: string };

const items: Item[] = [
  {
    q: "Ist der Beratungstermin wirklich kostenlos?",
    a: "Ja. Der 30-Minuten-Termin ist komplett kostenlos und unverbindlich. Du bezahlst nichts und gehst keine Verpflichtung ein. Wir verdienen nur, wenn wir dir wirklich helfen können - nicht für die Beratung selbst.",
  },
  {
    q: "Werde ich danach mit Anrufen bombardiert?",
    a: "Nein. Wir kontaktieren dich nur für die Terminvorbereitung und falls du danach explizit weitere Beratung wünschst. Kein Newsletter, keine Vertriebsanrufe, kein Lead-Verkauf an Dritte.",
  },
  {
    q: "Wie läuft der Termin konkret ab?",
    a: "Du bekommst einen Kalender-Link nach der Reservation. Im Termin selbst sprechen wir 5 Minuten über deine Situation, dann zeige ich dir konkrete Zahlen zu Steuern, Vorsorge und (falls relevant) Eigenheim. Am Ende bekommst du eine schriftliche Zusammenfassung per E-Mail.",
  },
  {
    q: "Was, wenn ich schon eine Säule 3a habe?",
    a: "Sehr gut - dann prüfen wir gemeinsam, ob deine bestehende Lösung optimal ist oder ob ein Wechsel zur Versicherungs-Variante mehr Vorteile bringt. In vielen Fällen lohnt sich auch eine Kombination.",
  },
  {
    q: "Was passiert mit meinen Daten?",
    a: "Alle Daten werden in der Schweiz gespeichert und ausschliesslich für die Beratung verwendet. Wir geben sie nicht an Dritte weiter. Du kannst die Löschung jederzeit per E-Mail an info@ssmpartner.ch beantragen.",
  },
  {
    q: "Ist SSM Partner AG seriös?",
    a: "Ja. SSM Partner AG ist eine Tochtergesellschaft der Visana-Gruppe und gebundener Vermittler gemäss Versicherungsaufsichtsgesetz (VAG), im Schweizer Vermittlerregister geführt. MWST-Nummer CHE-488.322.203. Wir arbeiten mit allen grossen Schweizer Versicherern zusammen.",
  },
];

const Faq = () => {
  const [open, setOpen] = useState<number>(0);

  return (
    <section
      id="faq"
      className="bg-white px-6 py-[60px] md:px-[50px] md:py-[90px]"
    >
      <div className="mx-auto text-center" style={{ maxWidth: 1180 }}>
        <div
          className="mx-auto bg-ssm-akzent"
          style={{ width: 60, height: 4, marginBottom: 20 }}
        />
        <div
          className="font-arial font-bold uppercase text-ssm-sekundaer"
          style={{ fontSize: 13, letterSpacing: "1.5px" }}
        >
          Häufige Fragen
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
          Was du{" "}
          <em
            className="text-ssm-sekundaer"
            style={{ fontStyle: "italic", fontWeight: 400 }}
          >
            wissen willst.
          </em>
        </h2>

        <div
          className="mx-auto text-left"
          style={{ maxWidth: 880, marginTop: 32 }}
        >
          {items.map((it, i) => {
            const isOpen = open === i;
            return (
              <div
                key={it.q}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="bg-ssm-cream"
                style={{
                  borderRadius: 8,
                  padding: "22px 28px",
                  marginBottom: 12,
                  borderLeft: "4px solid #6A7C76",
                  cursor: "pointer",
                }}
              >
                <h4
                  className="flex items-center justify-between font-arial text-ssm-primaer"
                  style={{ fontSize: 17, fontWeight: 900, lineHeight: 1.3 }}
                >
                  <span>{it.q}</span>
                  <span
                    className="text-ssm-sekundaer"
                    style={{
                      fontSize: 26,
                      lineHeight: 1,
                      marginLeft: 16,
                      fontWeight: 400,
                    }}
                  >
                    {isOpen ? "−" : "+"}
                  </span>
                </h4>
                {isOpen && (
                  <p
                    className="font-verdana text-ssm-grau"
                    style={{
                      fontSize: 14,
                      lineHeight: 1.7,
                      marginTop: 12,
                      paddingTop: 12,
                      borderTop: "1px solid #ebe9e0",
                    }}
                  >
                    {it.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Faq;
