import { useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";

const navLinks = [
  "Themen",
  "Bank vs. Versicherung",
  "Lohn-Luecke",
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
      <div className="flex items-center justify-between">
        <a href="/" className="flex items-center">
          <object
            data="/ssm_logo.svg"
            type="image/svg+xml"
            style={{ height: 30, pointerEvents: "none" }}
            aria-label="SSM Partner AG"
          >
            <span className="font-arial font-bold text-black" style={{ fontSize: 28 }}>
              SSM
            </span>
          </object>
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
