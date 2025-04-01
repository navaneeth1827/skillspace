
import { ArrowRight } from "lucide-react";
import Button from "./Button";
import { useState, useEffect } from "react";
import AuthModal from "./AuthModal";

const HeroSection = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Trigger animation after component mounts
    setIsVisible(true);
  }, []);

  return (
    <section className="w-full py-12 md:py-20 lg:py-28 border-b border-white/5 flex items-center justify-center relative">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0e1217] to-black opacity-70 z-0"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-70 z-0"></div>
      
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PGcgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMjAyMDIwIiBzdHJva2Utd2lkdGg9IjEiPjxwYXRoIGQ9Ik0tMSA2MXYtNjJoNjJ2NjJ6Ii8+PC9nPjwvc3ZnPg==')] opacity-20 z-0"></div>
      
      <div className="container px-4 md:px-6 max-w-5xl text-center relative z-10">
        <div className="space-y-12">
          <div 
            className={`space-y-4 transition-all duration-1000 transform ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <div className="inline-block rounded-lg bg-white/5 px-3 py-1 text-sm backdrop-blur-md border border-white/10 mb-4">
              Welcome to Freelancer Hub Nexus
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-tight">
              <div className="overflow-hidden py-1">
                <span className="text-gradient inline-block transform transition-transform duration-700 hover:scale-105">
                  Connect, 
                </span>
              </div>
              <div className="overflow-hidden py-1">
                <span className="accent-gradient inline-block transform transition-transform duration-700 hover:scale-105 delay-100">
                  Create, 
                </span>
              </div>
              <div className="overflow-hidden py-1">
                <span className="bg-cyber-gradient bg-clip-text text-transparent inline-block transform transition-transform duration-700 hover:scale-105 delay-200">
                  Collaborate
                </span>
              </div>
            </h1>
            
            <p className="text-muted-foreground text-xl md:text-2xl max-w-3xl mx-auto mt-6 transition-all duration-700 delay-300 transform hover:translate-y-1">
              The premium marketplace where exceptional freelancers and forward-thinking clients find each other. No noise, just quality connections.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 transition-all duration-700 delay-400">
              <Button 
                size="lg" 
                className="group text-lg py-6 px-8" 
                onClick={() => setIsAuthModalOpen(true)}
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg py-6 px-8"
                onClick={() => window.location.href = '/jobs'}
              >
                Browse Jobs
              </Button>
            </div>
          </div>

          <div className="relative overflow-hidden h-8 w-full max-w-md mx-auto rounded-full bg-white/5 mt-20 hidden md:block">
            <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-primary to-purple-400 animate-pulse-soft rounded-full"></div>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white/80">
              Join over 10,000+ freelancers and businesses
            </div>
          </div>
        </div>
      </div>
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </section>
  );
};

export default HeroSection;
