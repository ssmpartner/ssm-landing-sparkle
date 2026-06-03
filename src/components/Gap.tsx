import { useEffect, useRef, useState } from "react";

type Bar = {
  label: string;
  amount: string;
  amountColor: string;
  width: number;
  fillBg: string;
  fillTextColor: string;
  fillText: string;
};

const bars: Bar[] = [
  {
    label: "Dein heutiger Bruttolohn",
    amount: "100% · CHF 5'000",
    amountColor: "#B3B69C",
    width: 100,
    fillBg: "#D4E5DC",
    fillTextColor: "#4F7A5F",
    fillText: "CHF 5'000 / Monat",
  },
  {
    label: "Nur IV + Pensionskasse",
    amount: "~50% · CHF 2'500",
    amountColor: "#e8a89e",
    width: 50,
    fillBg: "#e8a89e",
    fillTextColor: "#A4503D",
    fillText: "Lücke: CHF 2'500",
  },
  {
    label: "Mit Versicherungs-3a",
    amount: "90% · CHF 4'500",
    amountColor: "#B3B69C",
    width: 90,
    fillBg: "#B3B69C",
    fillTextColor: "#324642",
    fillText: "Lücke fast geschlossen",
  },
];

const Gap = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setAnimate(true);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="lücke"
      className="bg-ssm-primaer px-6 py-[60px] md:px-[50px] md:py-[90px]"
    >
      <div className="mx-auto" style={{ maxWidth: 1180 }}>
        <div
          className="bg-ssm-akzent"
          style={{ width: 60, height: 4, marginBottom: 20 }}
        />
        <div
          className="font-arial font-bold uppercase text-ssm-akzent"
          style={{ fontSize: 13, letterSpacing: "1.5px" }}
        >
          Realitäts-Check IV
        </div>
        <h2
          className="font-arial text-white"
          style={{
            fontSize: 42,
            fontWeight: 900,
            letterSpacing: "-0.8px",
            lineHeight: 1.1,
            marginTop: 14,
          }}
        >
          5'000 Lohn?
          <br />
          Was wirklich{" "}
          <em
            className="text-ssm-akzent"
            style={{ fontStyle: "italic", fontWeight: 400 }}
          >
            übrig bleibt.
          </em>
        </h2>
        <p
          className="font-verdana"
          style={{
            fontSize: 17,
            lineHeight: 1.65,
            maxWidth: 720,
            marginTop: 20,
            color: "rgba(255,255,255,0.8)",
          }}
        >
          Wenn du als Erwerbstätige:r invalid wirst, decken IV und
          Pensionskasse zusammen oft nur einen Teil deines Lohns ab.
          Hier ist, wie das in Zahlen aussieht - und wie wir die Lücke
          schliessen.
        </p>

        <div
          className="grid grid-cols-1 items-center md:grid-cols-[1.4fr_1fr]"
          style={{ gap: 60, marginTop: 48 }}
        >
          {/* LEFT: bargraphs */}
          <div
            ref={wrapRef}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              padding: 36,
            }}
          >
            <div className="flex flex-col" style={{ gap: 24 }}>
              {bars.map((b) => (
                <div key={b.label}>
                  <div
                    className="flex justify-between font-arial font-bold text-white"
                    style={{ fontSize: 13, marginBottom: 8 }}
                  >
                    <span>{b.label}</span>
                    <span style={{ color: b.amountColor, fontSize: 14 }}>
                      {b.amount}
                    </span>
                  </div>
                  <div
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      height: 36,
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      className="flex h-full items-center font-arial font-bold"
                      style={{
                        width: animate ? `${b.width}%` : "0%",
                        background: b.fillBg,
                        color: b.fillTextColor,
                        fontSize: 13,
                        paddingLeft: 14,
                        transition: "width 1s ease-out",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {b.fillText}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: text + CTA */}
          <div>
            <h3
              className="font-arial text-white"
              style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.25 }}
            >
              Die meisten merken die Lücke{" "}
              <em
                className="text-ssm-akzent"
                style={{ fontStyle: "italic", fontWeight: 400 }}
              >
                erst, wenn es zu spät ist.
              </em>
            </h3>
            <p
              className="font-verdana"
              style={{
                fontSize: 16,
                lineHeight: 1.7,
                marginTop: 18,
                marginBottom: 28,
                color: "rgba(255,255,255,0.85)",
              }}
            >
              Dabei kostet das Schliessen oft weniger als ein
              Streaming-Abo pro Monat - wenn man früh anfängt. Im
              Beratungstermin rechnen wir deine persönliche Lücke aus
              und zeigen dir, wie sie ohne Mehrkosten geschlossen werden
              kann.
            </p>
            <a
              href="#termin"
              className="inline-block bg-ssm-akzent font-arial font-bold text-ssm-primaer transition-transform hover:-translate-y-0.5"
              style={{
                fontSize: 16,
                padding: "16px 32px",
                borderRadius: 4,
              }}
            >
              Meine Lücke berechnen lassen →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Gap;
