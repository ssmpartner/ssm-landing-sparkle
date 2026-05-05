import Topbar from "@/components/Topbar";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import Topics from "@/components/Topics";
import Comparison from "@/components/Comparison";

const Index = () => {
  return (
    <div className="min-h-screen bg-ssm-cream">
      <Topbar />
      <Navigation />
      <Hero />
      <TrustBar />
      <Topics />
      <Comparison />
    </div>
  );
};

export default Index;

