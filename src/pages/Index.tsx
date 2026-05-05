import Topbar from "@/components/Topbar";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";

const Index = () => {
  return (
    <div className="min-h-screen bg-ssm-cream">
      <Topbar />
      <Navigation />
      <Hero />
      <TrustBar />
    </div>
  );
};

export default Index;

