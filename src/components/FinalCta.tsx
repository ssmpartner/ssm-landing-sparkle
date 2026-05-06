import { Phone } from "lucide-react";

const FinalCta = () => {
  return (
    <section
      className="relative overflow-hidden px-6 py-[60px] text-center md:px-[50px] md:py-[90px]"
      style={{
        background: "linear-gradient(135deg, #324642 0%, #6A7C76 100%)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at left center, rgba(179,182,156,0.2), transparent 60%)",
        }}
      />

      <div
        className="relative mx-auto"
        style={{ maxWidth: 1180 }}
      >
        <div
          className="mx-auto bg-ssm-akzent"
          style={{ width: 60, height: 4, marginBottom: 20 }}
        />
        <h2
          className="mx-auto font-arial text-white"
          style={{
            fontSize: 46,
            fontWeight: 900,
            letterSpacing: "-1px",
            lineHeight: 1.1,
            maxWidth: 820,
          }}
        >
          30 Minuten heute.{" "}
          <em
            className="text-ssm-akzent"
            style={{ fontStyle: "italic", fontWeight: 400 }}
          >
            Klarheit für dein Leben.
          </em>
        </h2>
        <p
          className="mx-auto font-verdana"
          style={{
            fontSize: 19,
            lineHeight: 1.6,
            marginTop: 20,
            marginBottom: 36,
            maxWidth: 620,
            color: "rgba(255,255,255,0.88)",
          }}
        >
          Buch dir deinen kostenlosen Beratungstermin. Online,
          unverbindlich, ohne Verkaufsdruck. Wir melden uns innerhalb
          von 24 Stunden mit einem Vorschlag.
        </p>

        <div
          className="flex flex-wrap items-center justify-center"
          style={{ gap: 16 }}
        >
          <a
            href="#termin"
            className="inline-block bg-ssm-akzent font-arial font-bold text-ssm-primaer transition-transform hover:-translate-y-0.5"
            style={{
              fontSize: 16,
              padding: "16px 32px",
              borderRadius: 4,
            }}
          >
            Jetzt Termin reservieren
          </a>
          <span
            className="font-arial"
            style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}
          >
            oder
          </span>
          <a
            href="tel:+41220020"
            className="inline-flex items-center font-arial font-bold text-white transition-colors hover:bg-white/10"
            style={{
              fontSize: 16,
              padding: "14px 28px",
              borderRadius: 4,
              border: "2px solid rgba(255,255,255,0.3)",
              background: "transparent",
              gap: 10,
            }}
          >
            <Phone size={18} color="#ffffff" strokeWidth={2.5} />
            Direkt anrufen
          </a>
        </div>
      </div>
    </section>
  );
};

export default FinalCta;
