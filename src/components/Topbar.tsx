import { Phone, Mail } from "lucide-react";

const Topbar = () => {
  return (
    <div
      className="bg-ssm-primaer-dark text-white font-arial flex items-center justify-between"
      style={{ height: 36, padding: "10px 50px", fontSize: 12 }}
    >
      <img
        src="/ssm_logo.svg"
        alt="SSM Partner AG"
        style={{ height: 18, filter: "brightness(0) invert(1)" }}
      />
      <div className="flex items-center" style={{ gap: 24 }}>
        <a href="tel:+41220205000" className="flex items-center" style={{ gap: 6 }}>
          <Phone size={14} color="white" />
          <span>+41 220 20 50</span>
        </a>
        <a href="mailto:info@ssmpartner.ch" className="flex items-center" style={{ gap: 6 }}>
          <Mail size={14} color="white" />
          <span>info@ssmpartner.ch</span>
        </a>
        <span>DE | FR | IT</span>
      </div>
    </div>
  );
};

export default Topbar;
