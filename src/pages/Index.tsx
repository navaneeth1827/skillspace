
import HeroSection from "@/components/HeroSection";
import FeaturedJobs from "@/components/FeaturedJobs";
import FreelancerSuggestions from "@/components/FreelancerSuggestions";
import FooterSection from "@/components/FooterSection";
import Navbar from "@/components/Navbar";
import AboutSection from "@/components/AboutSection";
import TestimonialSection from "@/components/TestimonialSection";
import ContactSection from "@/components/ContactSection";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <AboutSection />
        <FeaturedJobs />
        <FreelancerSuggestions />
        <TestimonialSection />
        <ContactSection />
      </main>
      <FooterSection />
    </div>
  );
};

export default Index;
