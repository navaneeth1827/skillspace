
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import FeaturedJobs from "@/components/FeaturedJobs";
import FreelancerSuggestions from "@/components/FreelancerSuggestions";
import FooterSection from "@/components/FooterSection";
import Navbar from "@/components/Navbar";
import AboutSection from "@/components/AboutSection";
import TestimonialSection from "@/components/TestimonialSection";
import ContactSection from "@/components/ContactSection";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard if user is logged in
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

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
