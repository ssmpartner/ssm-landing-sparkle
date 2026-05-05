type Testimonial = {
  initials: string;
  name: string;
  info: string;
  quote: string;
};

const items: Testimonial[] = [
  {
    initials: "MK",
    name: "Markus K.",
    info: "38 · Software-Entwickler · Luzern",
    quote:
      "Ich habe 12 Jahre lang meine 3a bei der Bank gespart. Beim ersten Termin bei SSM wurde mir gezeigt, dass ich fuer gleiches Geld 4 Vorteile statt 2 haette. Heute weiss ich: meine Familie ist abgesichert, falls etwas passiert.",
  },
  {
    initials: "SR",
    name: "Sandra & Reto B.",
    info: "34 / 36 · Familie · Aargau",
    quote:
      "Wir wollten ein Eigenheim, aber die Amortisationsraten haben uns Sorgen gemacht. SSM hat uns die indirekte Amortisation erklaert - unser Steuersatz ist um CHF 2'400 pro Jahr gesunken. Das hat den Hauskauf erst moeglich gemacht.",
  },
  {
    initials: "AW",
    name: "Anita W.",
    info: "52 · Selbstaendig · Zuerich",
    quote:
      "Endlich jemand, der nicht versucht, mir etwas zu verkaufen. Im Termin wurde mir klar, dass meine bisherige Loesung sogar gut war - nur eine kleine Anpassung war noetig. So ehrliche Beratung hatte ich noch nie.",
  },
];

const Testimonials = () => {
  return (
    <section className="bg-ssm-cream px-6 py-[60px] md:px-[50px] md:py-[90px]">
      <div className="mx-auto" style={{ maxWidth: 1180 }}>
        <div
          className="bg-ssm-akzent"
          style={{ width: 60, height: 4, marginBottom: 20 }}
        />
        <div
          className="font-arial font-bold uppercase text-ssm-sekundaer"
          style={{ fontSize: 13, letterSpacing: "1.5px" }}
        >
          Stimmen unserer Kund:innen
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
          Echte Geschichten.{" "}
          <em
            className="text-ssm-sekundaer"
            style={{ fontStyle: "italic", fontWeight: 400 }}
          >
            Konkrete Wirkung.
          </em>
        </h2>

        <div
          className="grid grid-cols-1 md:grid-cols-3"
          style={{ gap: 24, marginTop: 24 }}
        >
          {items.map((t) => (
            <div
              key={t.name}
              className="bg-white"
              style={{
                borderRadius: 8,
                padding: "32px 28px",
                borderLeft: "4px solid #6A7C76",
              }}
            >
              <div
                className="text-ssm-akzent"
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: 48,
                  lineHeight: 1,
                }}
              >
                "
              </div>
              <blockquote
                className="font-verdana text-ssm-primaer"
                style={{
                  fontSize: 15,
                  fontStyle: "italic",
                  lineHeight: 1.6,
                  marginTop: 8,
                  marginBottom: 20,
                }}
              >
                {t.quote}
              </blockquote>
              <div
                className="flex items-center"
                style={{
                  gap: 14,
                  borderTop: "1px solid #f2f2f2",
                  paddingTop: 16,
                }}
              >
                <div
                  className="flex items-center justify-center bg-ssm-akzent font-arial font-bold text-ssm-primaer"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 9999,
                    fontSize: 16,
                  }}
                >
                  {t.initials}
                </div>
                <div>
                  <div
                    className="font-arial font-bold text-ssm-primaer"
                    style={{ fontSize: 14 }}
                  >
                    {t.name}
                  </div>
                  <div
                    className="font-verdana text-ssm-grau"
                    style={{ fontSize: 12 }}
                  >
                    {t.info}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
