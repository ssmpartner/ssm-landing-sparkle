import { ShieldCheck, Coins, Calendar, BadgeCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Item = {
  Icon: LucideIcon;
  number: string;
  em?: string;
  label: string;
};

const items: Item[] = [
  {
    Icon: ShieldCheck,
    number: "90",
    em: "%",
    label: "Lohnabsicherung mit der richtigen 3a-Loesung",
  },
  {
    Icon: Coins,
    number: "CHF 7'258",
    label: "Maximaler Saeule-3a-Steuerabzug 2026",
  },
  {
    Icon: Calendar,
    number: "30",
    em: " Min.",
    label: "Beratungstermin · kostenlos & unverbindlich",
  },
  {
    Icon: BadgeCheck,
    number: "VAG",
    label: "Gebundener Vermittler · CHE-488.322.203",
  },
];

const TrustBar = () => {
  return (
    <section
      className="bg-ssm-cream"
      style={{
        borderBottom: "1px solid #ebe9e0",
        padding: "36px 50px",
      }}
    >
      <div
        className="mx-auto grid grid-cols-2 text-center md:grid-cols-4"
        style={{ maxWidth: 1180, gap: 32 }}
      >
        {items.map(({ Icon, number, em, label }) => (
          <div key={label} className="flex flex-col items-center">
            <div
              className="flex items-center justify-center"
              style={{ width: 44, height: 44 }}
            >
              <Icon size={32} className="text-ssm-primaer" strokeWidth={2} />
            </div>
            <div
              className="font-arial text-ssm-primaer"
              style={{
                fontSize: 40,
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: "-1px",
                marginTop: 8,
              }}
            >
              {number}
              {em && (
                <em
                  className="text-ssm-sekundaer not-italic"
                  style={{
                    fontStyle: "italic",
                    fontSize: 28,
                    fontWeight: 400,
                  }}
                >
                  {em}
                </em>
              )}
            </div>
            <div
              className="font-arial text-ssm-grau"
              style={{ fontSize: 13, lineHeight: 1.4, marginTop: 8 }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrustBar;
