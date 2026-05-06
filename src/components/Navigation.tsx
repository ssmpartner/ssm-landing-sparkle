import { useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";

const navLinks = [
  "Themen",
  "Bank vs. Versicherung",
  "Lohn-Lücke",
  "So funktioniert's",
  "FAQ",
];

const Navigation = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav
      className="sticky top-0 bg-white"
      style={{
        padding: "18px 50px",
        borderBottom: "1px solid #ebe9e0",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        zIndex: 100,
      }}
    >
      <div className="mx-auto flex items-center justify-between" style={{ maxWidth: 1180 }}>
        <a href="/" className="flex items-center">
          <img src="/ssm_logo.svg" alt="SSM Partner AG" style={{ height: 30 }} />
        </a>

        <ul
          className="hidden items-center min-[900px]:flex"
          style={{ gap: 28 }}
        >
          {navLinks.map((label) => (
            <li key={label}>
              <a
                href="#"
                className="font-arial font-bold text-ssm-primaer hover:text-ssm-primaer-dark transition-colors"
                style={{ fontSize: 14 }}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center" style={{ gap: 12 }}>
          <a
            href="#termin"
            className="hidden min-[900px]:inline-flex items-center bg-ssm-primaer text-white font-arial font-bold transition-all hover:bg-ssm-primaer-dark hover:-translate-y-px"
            style={{ padding: "14px 28px", borderRadius: 4, fontSize: 15, gap: 8 }}
          >
            Termin buchen <ArrowRight size={16} />
          </a>

          <button
            type="button"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="min-[900px]:hidden text-ssm-primaer"
          >
            {open ? <Menu size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {open && (
        <ul className="min-[900px]:hidden mt-4 flex flex-col" style={{ gap: 12 }}>
          {navLinks.map((label) => (
            <li key={label}>
              <a
                href="#"
                className="font-arial font-bold text-ssm-primaer"
                style={{ fontSize: 14 }}
              >
                {label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="#termin"
              className="inline-flex items-center bg-ssm-primaer text-white font-arial font-bold"
              style={{ padding: "14px 28px", borderRadius: 4, fontSize: 15, gap: 8 }}
            >
              Termin buchen <ArrowRight size={16} />
            </a>
          </li>
        </ul>
      )}
    </nav>
  );
};

export default Navigation;
