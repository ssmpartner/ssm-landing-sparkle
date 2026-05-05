import {
  Calculator,
  TrendingDown,
  Home,
  PiggyBank,
  Car,
  MessageCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Card = {
  Icon: LucideIcon;
  number: string;
  title: string;
  text: string;
  cta: string;
  href: string;
};

const cards: Card[] = [
  {
    Icon: Calculator,
    number: "01/05",
    title: "Bank vs. Versicherung",
    text:
      "Beide bieten Saeule 3a. Doch nur die Versicherungs-Loesung schuetzt dich bei Invaliditaet und sichert deine Familie ab - bei gleichem Steuerabzug.",
    cta: "Vergleich ansehen",
    href: "#vergleich",
  },
  {
    Icon: TrendingDown,
    number: "02/05",
    title: "Die Lohn-Luecke bei IV",
    text:
      "1. und 2. Saeule decken oft nur 40-60% deines Lohns ab. Was bleibt, wenn du krank wirst? Wir schliessen die Luecke auf 90%.",
    cta: "Luecke verstehen",
    href: "#luecke",
  },
  {
    Icon: Home,
    number: "03/05",
    title: "Eigenheim ohne Lohn-Loch",
    text:
      "Indirekte Amortisation: Hypothek bleibt steuerlich abzugsfaehig, Saeule 3a waechst - tausende Franken Steuerersparnis pro Jahr.",
    cta: "Termin buchen",
    href: "#termin",
  },
  {
    Icon: PiggyBank,
    number: "04/05",
    title: "Steuern intelligent senken",
    text:
      "Drei Hebel, die kaum jemand voll nutzt: 3a-Maximum, PK-Einkauf und indirekte Amortisation. Zusammen ergibt das vierstellige Ersparnisse.",
    cta: "Termin buchen",
    href: "#termin",
  },
  {
    Icon: Car,
    number: "05/05",
    title: "Autoversicherung vergleichen",
    text:
      "Bis zu CHF 600 jaehrliche Differenz bei gleicher Deckung. In 60 Sekunden checken - ohne Spam-Anrufe danach.",
    cta: "Termin buchen",
    href: "#termin",
  },
];

const TopicCard = ({ Icon, number, title, text, cta, href }: Card) => (
  <a
    href={href}
    className="group relative block overflow-hidden bg-white transition-all duration-300 hover:-translate-y-1"
    style={{
      border: "1px solid #ebe9e0",
      borderRadius: 8,
      padding: "32px 28px 28px 28px",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = "#6A7C76";
      e.currentTarget.style.boxShadow = "0 16px 40px rgba(50,70,66,0.12)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = "#ebe9e0";
      e.currentTarget.style.boxShadow = "none";
    }}
  >
    <span
      aria-hidden
      className="absolute left-0 top-0 origin-left scale-x-0 bg-ssm-sekundaer transition-transform duration-300 group-hover:scale-x-100"
      style={{ height: 4, width: "100%" }}
    />
    <div
      className="flex items-center justify-center bg-ssm-akzent-hell"
      style={{ width: 56, height: 56, borderRadius: 8, marginBottom: 18 }}
    >
      <Icon size={30} className="text-ssm-primaer" strokeWidth={2} />
    </div>
    <div
      className="font-arial text-ssm-akzent"
      style={{ fontSize: 12, fontWeight: 900, letterSpacing: "1.5px" }}
    >
      {number}
    </div>
    <h3
      className="font-arial text-ssm-primaer"
      style={{
        fontSize: 22,
        lineHeight: 1.25,
        fontWeight: 900,
        marginTop: 10,
        marginBottom: 12,
      }}
    >
      {title}
    </h3>
    <p
      className="font-verdana text-ssm-grau"
      style={{ fontSize: 14, lineHeight: 1.65, marginBottom: 20 }}
    >
      {text}
    </p>
    <span
      className="font-arial font-bold text-ssm-primaer"
      style={{
        fontSize: 13,
        borderBottom: "2px solid #B3B69C",
        paddingBottom: 2,
      }}
    >
      {cta} →
    </span>
  </a>
);

const SpecialCard = () => (
  <a
    href="#termin"
    className="group relative block overflow-hidden bg-ssm-primaer transition-all duration-300 hover:-translate-y-1"
    style={{
      borderRadius: 8,
      padding: "32px 28px 28px 28px",
    }}
  >
    <div
      className="flex items-center justify-center"
      style={{
        width: 56,
        height: 56,
        borderRadius: 8,
        marginBottom: 18,
        background: "rgba(179,182,156,0.2)",
      }}
    >
      <MessageCircle size={30} color="#ffffff" strokeWidth={2} />
    </div>
    <div
      className="font-arial text-ssm-akzent"
      style={{ fontSize: 12, fontWeight: 900, letterSpacing: "1.5px" }}
    >
      PERSOENLICH
    </div>
    <h3
      className="font-arial text-white"
      style={{
        fontSize: 22,
        lineHeight: 1.25,
        fontWeight: 900,
        marginTop: 10,
        marginBottom: 12,
      }}
    >
      Du hast ein anderes Anliegen?
    </h3>
    <p
      className="font-verdana"
      style={{
        fontSize: 14,
        lineHeight: 1.65,
        marginBottom: 20,
        color: "rgba(255,255,255,0.8)",
      }}
    >
      Schreib uns, was dich beschaeftigt. Im Termin gehen wir konkret
      darauf ein - egal ob Pension, Sach- oder Lebensversicherung.
    </p>
    <span
      className="font-arial font-bold text-ssm-akzent"
      style={{
        fontSize: 13,
        borderBottom: "2px solid #B3B69C",
        paddingBottom: 2,
      }}
    >
      Termin vereinbaren →
    </span>
  </a>
);

const Topics = () => {
  return (
    <section
      id="themen"
      className="bg-ssm-cream px-6 py-[60px] md:px-[50px] md:py-[90px]"
    >
      <div
        className="mx-auto"
        style={{ maxWidth: 1180 }}
      >
        <div
          className="bg-ssm-akzent"
          style={{ width: 60, height: 4, marginBottom: 20 }}
        />
        <div
          className="font-arial font-bold uppercase text-ssm-sekundaer"
          style={{ fontSize: 13, letterSpacing: "1.5px" }}
        >
          Worum es im Termin geht
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
          Fuenf Bereiche, in denen wir dir{" "}
          <em
            className="text-ssm-sekundaer"
            style={{ fontStyle: "italic", fontWeight: 400 }}
          >
            konkret helfen.
          </em>
        </h2>
        <p
          className="font-verdana text-ssm-grau"
          style={{
            fontSize: 17,
            lineHeight: 1.65,
            maxWidth: 720,
            marginTop: 20,
            marginBottom: 56,
          }}
        >
          Jedes dieser Themen kann im 30-Minuten-Termin individuell auf
          deine Situation angewendet werden. Ohne Verkaufsdruck, ohne
          Standardloesungen.
        </p>

        <div
          className="grid grid-cols-1 md:grid-cols-3"
          style={{ gap: 24 }}
        >
          {cards.map((c) => (
            <TopicCard key={c.number} {...c} />
          ))}
          <SpecialCard />
        </div>
      </div>
    </section>
  );
};

export default Topics;
