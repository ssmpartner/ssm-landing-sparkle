import Topbar from "@/components/Topbar";
import Navigation from "@/components/Navigation";

const Index = () => {
  return (
    <div className="min-h-screen bg-ssm-cream">
      <Topbar />
      <Navigation />
      <main className="flex items-center justify-center" style={{ minHeight: "60vh" }}>
        <h1
          className="font-arial font-bold text-center text-ssm-primaer tracking-tightest"
          style={{ fontSize: 48 }}
        >
          SSM Landing Page
        </h1>
      </main>
    </div>
  );
};

export default Index;
