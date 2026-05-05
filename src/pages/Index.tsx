import Topbar from "@/components/Topbar";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import Topics from "@/components/Topics";
import Comparison from "@/components/Comparison";
import Gap from "@/components/Gap";
import Steps from "@/components/Steps";
import Testimonials from "@/components/Testimonials";
import Faq from "@/components/Faq";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-ssm-cream">
      <Topbar />
      <Navigation />
      <Hero />
      <TrustBar />
      <Topics />
      <Comparison />
      <Gap />
      <Steps />
      <Testimonials />
      <Faq />
      <FinalCta />
      <Footer />
    </div>
  );
};

export default Index;

