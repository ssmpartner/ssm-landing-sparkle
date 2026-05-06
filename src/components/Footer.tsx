type LinkItem = { label: string; href: string };

const themen: LinkItem[] = [
  { label: "Vorsorge & Säule 3a", href: "#themen" },
  { label: "Eigenheim & Hypothek", href: "#themen" },
  { label: "Steuern optimieren", href: "#themen" },
  { label: "Auto-Versicherung", href: "#themen" },
  { label: "Lohn-Lücke schliessen", href: "#lücke" },
];

const unternehmen: LinkItem[] = [
  { label: "Ueber uns", href: "#" },
  { label: "Team", href: "#" },
  { label: "Karriere", href: "#" },
  { label: "Standorte", href: "#" },
];

const ColTitle = ({ children }: { children: React.ReactNode }) => (
  <h5
    className="font-arial font-bold uppercase text-white"
    style={{ fontSize: 13, letterSpacing: "1.5px", marginBottom: 18 }}
  >
    {children}
  </h5>
);

const FootLink = ({
  href,
  children,
  className = "",
  style,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <a
    href={href}
    className={`block font-verdana transition-colors hover:text-ssm-akzent ${className}`}
    style={{
      fontSize: 13,
      color: "rgba(255,255,255,0.7)",
      paddingTop: 6,
      paddingBottom: 6,
      ...style,
    }}
  >
    {children}
  </a>
);

const Footer = () => {
  return (
    <footer
      className="bg-ssm-primaer-dark px-6 md:px-[50px]"
      style={{
        paddingTop: 60,
        paddingBottom: 30,
        color: "rgba(255,255,255,0.8)",
      }}
    >
      <div
        className="mx-auto grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr]"
        style={{
          maxWidth: 1180,
          gap: 40,
          paddingBottom: 40,
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* Spalte 1 */}
        <div className="col-span-2 md:col-span-1">
          <img
            src="/ssm_logo.svg"
            alt="SSM Partner AG"
            style={{
              height: 30,
              display: "block",
              filter: "brightness(0) invert(1)",
            }}
          />
          <div
            className="font-verdana"
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.7,
              marginTop: 18,
            }}
          >
            SSM Partner AG
            <br />
            Stationsstrasse 90/92
            <br />
            CH-6023 Rothenburg
          </div>
          <div
            className="font-verdana"
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.7,
              marginTop: 12,
            }}
          >
            Gebundener Vermittler gemäss VAG
            <br />
            MWST CHE-488.322.203
          </div>
        </div>

        {/* Spalte 2 */}
        <div>
          <ColTitle>THEMEN</ColTitle>
          {themen.map((l) => (
            <FootLink key={l.label} href={l.href}>
              {l.label}
            </FootLink>
          ))}
        </div>

        {/* Spalte 3 */}
        <div>
          <ColTitle>UNTERNEHMEN</ColTitle>
          {unternehmen.map((l) => (
            <FootLink key={l.label} href={l.href}>
              {l.label}
            </FootLink>
          ))}
        </div>

        {/* Spalte 4 */}
        <div>
          <ColTitle>KONTAKT</ColTitle>
          <FootLink href="tel:+41412202050">+41 41 220 20 50</FootLink>
          <FootLink href="mailto:info@ssmpartner.ch">
            info@ssmpartner.ch
          </FootLink>
          <FootLink href="#" style={{ marginTop: 12 }}>
            Mo-Fr 08:00-18:00
          </FootLink>
          <a
            href="#termin"
            className="block font-verdana font-bold text-ssm-akzent transition-opacity hover:opacity-80"
            style={{ fontSize: 13, paddingTop: 10 }}
          >
            → Termin buchen
          </a>
        </div>
      </div>

      {/* Footer Bottom */}
      <div
        className="mx-auto flex flex-col flex-wrap items-start justify-between gap-4 md:flex-row md:items-center"
        style={{
          maxWidth: 1180,
          paddingTop: 24,
        }}
      >
        <div
          className="font-arial"
          style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}
        >
          © 2026 SSM Partner AG · Alle Rechte vorbehalten
        </div>
        <div
          className="font-arial"
          style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}
        >
          Datenschutz · Impressum · AGB · Cookie-Einstellungen
        </div>
      </div>
    </footer>
  );
};

export default Footer;
