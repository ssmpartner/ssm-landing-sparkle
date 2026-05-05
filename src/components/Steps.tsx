type Step = {
  num: string;
  title: string;
  text: string;
  badge: string;
};

const steps: Step[] = [
  {
    num: "1",
    title: "Termin reservieren",
    text:
      "Online in 30 Sekunden. Du waehlst Thema und Zeitpunkt. Der Termin findet persoenlich, telefonisch oder per Video statt - wie es dir am besten passt.",
    badge: "30 Sekunden",
  },
  {
    num: "2",
    title: "Situation analysieren",
    text:
      "Wir schauen deine bestehende Vorsorge an, vergleichen Optionen, rechnen Steuerwirkung und Luecken konkret durch - mit deinen echten Zahlen.",
    badge: "30 Min. Termin",
  },
  {
    num: "3",
    title: "Empfehlung erhalten",
    text:
      "Du bekommst einen schriftlichen Vorschlag per E-Mail. Du entscheidest in Ruhe - kein Verkaufsdruck, kein Newsletter, kein Anrufmarathon danach.",
    badge: "PDF per Mail",
  },
];

const Steps = () => {
  return (
    <section
      id="ablauf"
      className="bg-white px-6 py-[60px] md:px-[50px] md:py-[90px]"
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
          So laeuft dein Beratungstermin ab
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
          Drei Schritte.{" "}
          <em
            className="text-ssm-sekundaer"
            style={{ fontStyle: "italic", fontWeight: 400 }}
          >
            Null Risiko.
          </em>
        </h2>

        <div
          className="grid grid-cols-1 md:grid-cols-3"
          style={{ gap: 32, marginTop: 56 }}
        >
          {steps.map((s) => (
            <div
              key={s.num}
              className="relative bg-ssm-cream"
              style={{
                borderRadius: 8,
                padding: "36px 28px 32px 28px",
                border: "1px solid #ebe9e0",
              }}
            >
              <div
                className="absolute flex items-center justify-center bg-ssm-primaer font-arial text-white"
                style={{
                  top: -22,
                  left: 28,
                  width: 52,
                  height: 52,
                  borderRadius: 8,
                  fontSize: 24,
                  fontWeight: 900,
                }}
              >
                {s.num}
              </div>
              <h4
                className="font-arial text-ssm-primaer"
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  marginTop: 18,
                  lineHeight: 1.25,
                }}
              >
                {s.title}
              </h4>
              <p
                className="font-verdana text-ssm-grau"
                style={{
                  fontSize: 14,
                  lineHeight: 1.65,
                  marginTop: 10,
                }}
              >
                {s.text}
              </p>
              <span
                className="inline-block bg-ssm-akzent-hell font-arial font-bold text-ssm-primaer"
                style={{
                  fontSize: 11,
                  letterSpacing: "0.5px",
                  padding: "4px 10px",
                  borderRadius: 4,
                  marginTop: 16,
                }}
              >
                {s.badge}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Steps;
