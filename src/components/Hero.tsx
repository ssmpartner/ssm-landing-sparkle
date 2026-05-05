import { Check } from "lucide-react";
import BookingCard from "./BookingCard";

const trustPoints = [
  "Kostenlos & unverbindlich",
  "Online oder bei dir",
  "Keine Verkaufsanrufe",
];

const Hero = () => {
  return (
    <section
      id="termin"
      className="relative overflow-hidden px-6 py-[60px] md:px-[50px] md:py-[80px] md:pb-[90px]"
      style={{
        background:
          "linear-gradient(135deg, #324642 0%, #1f2c29 100%)",
      }}
    >
      {/* Glow ::before */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at top right, rgba(179,182,156,0.15), transparent 60%)",
        }}
      />
      {/* Stripe ::after */}
      <div
        aria-hidden
        className="absolute bottom-0 left-0 bg-ssm-akzent"
        style={{ height: 6, width: 80 }}
      />

      <div
        className="relative mx-auto grid grid-cols-1 items-center md:grid-cols-[1.2fr_1fr]"
        style={{ maxWidth: 1180, gap: 60 }}
      >
        {/* LEFT */}
        <div>
          <div
            className="mb-7 inline-flex items-center font-arial font-bold uppercase text-ssm-akzent"
            style={{
              background: "rgba(179,182,156,0.18)",
              padding: "8px 16px",
              borderRadius: 9999,
              fontSize: 12,
              letterSpacing: "1px",
              gap: 10,
            }}
          >
            <span
              className="inline-block bg-ssm-akzent"
              style={{ width: 6, height: 6, borderRadius: 9999 }}
            />
            Vorsorge · Eigenheim · Steuern
          </div>

          <h1
            className="font-arial text-white"
            style={{
              fontSize: "clamp(38px, 5vw, 56px)",
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: "-1.5px",
            }}
          >
            Vorsorge die mehr kann als{" "}
            <span
              className="italic text-ssm-akzent"
              style={{ fontWeight: 400 }}
            >
              nur Steuern sparen.
            </span>
          </h1>

          <p
            className="font-verdana text-white"
            style={{
              fontSize: 19,
              lineHeight: 1.6,
              opacity: 0.88,
              maxWidth: 540,
              marginTop: 24,
              marginBottom: 36,
            }}
          >
            Bank-3a deckt 2 Beduerfnisse. Eine durchdachte
            Versicherungs-Loesung deckt 4: Altersvorsorge, Steuerabzug,
            Lohnschutz bei Invaliditaet und Familienabsicherung. Bei
            gleichem Steuerabzug. Wir zeigen dir wie - in einem
            30-Minuten-Termin.
          </p>

          <div
            className="flex flex-wrap"
            style={{
              marginTop: 40,
              paddingTop: 28,
              borderTop: "1px solid rgba(255,255,255,0.12)",
              gap: 28,
            }}
          >
            {trustPoints.map((t) => (
              <div key={t} className="flex items-center" style={{ gap: 8 }}>
                <Check size={18} className="text-ssm-akzent" strokeWidth={3} />
                <span
                  className="font-arial"
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.75)",
                  }}
                >
                  {t}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <BookingCard />
      </div>
    </section>
  );
};

export default Hero;
