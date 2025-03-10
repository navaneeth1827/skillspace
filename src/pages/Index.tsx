
import HeroSection from "@/components/HeroSection";
import FeaturedJobs from "@/components/FeaturedJobs";
import FreelancerSuggestions from "@/components/FreelancerSuggestions";
import FooterSection from "@/components/FooterSection";
import Navbar from "@/components/Navbar";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturedJobs />
        <FreelancerSuggestions />
      </main>
      <FooterSection />
    </div>
  );
};

export default Index;
