
import { ArrowRight } from "lucide-react";
import Button from "./Button";
import { useState } from "react";
import AuthModal from "./AuthModal";

const HeroSection = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 border-b border-white/5">
      <div className="container px-4 md:px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="space-y-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="inline-block rounded-lg bg-white/5 px-3 py-1 text-sm backdrop-blur-md border border-white/10">
              Welcome to Freelancer Hub Nexus
            </div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              <span className="text-gradient">Connect, Create, </span> 
              <span className="accent-gradient">Collaborate</span>
            </h1>
            <p className="text-muted-foreground md:text-xl">
              The premium marketplace where exceptional freelancers and forward-thinking clients find each other. No noise, just quality connections.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="group" 
                onClick={() => setIsAuthModalOpen(true)}
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => window.location.href = '/jobs'}>
                Browse Jobs
              </Button>
            </div>
          </div>
          <div className="relative animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <div className="glass-card overflow-hidden rounded-lg">
              <div className="aspect-video overflow-hidden rounded-lg">
                <div className="bg-gradient-to-br from-secondary to-background/50 p-6 md:p-10 h-full flex flex-col justify-center">
                  <div className="space-y-2 animate-pulse-soft">
                    <div className="h-2.5 bg-white/10 rounded-full w-3/4"></div>
                    <div className="h-2.5 bg-white/10 rounded-full w-1/2"></div>
                    <div className="h-2.5 bg-white/10 rounded-full w-5/6"></div>
                  </div>
                  <div className="mt-8 space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-white/10"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-2.5 bg-white/10 rounded-full w-1/3"></div>
                        <div className="h-2.5 bg-white/10 rounded-full w-1/4"></div>
                      </div>
                      <div className="h-8 w-20 rounded-md bg-primary/20"></div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-white/10"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-2.5 bg-white/10 rounded-full w-1/3"></div>
                        <div className="h-2.5 bg-white/10 rounded-full w-1/4"></div>
                      </div>
                      <div className="h-8 w-20 rounded-md bg-primary/20"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-6 -right-6 h-24 w-24 rotate-12 rounded-lg bg-primary/20 blur-3xl"></div>
            <div className="absolute -top-6 -left-6 h-24 w-24 -rotate-12 rounded-lg bg-primary/20 blur-3xl"></div>
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
