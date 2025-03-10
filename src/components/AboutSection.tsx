
import { Check } from "lucide-react";
import AnimatedCard from "./AnimatedCard";

const AboutSection = () => {
  const features = [
    "Verified freelancer profiles with skill validation",
    "Secure payment protection for clients and freelancers",
    "Advanced matching algorithm for perfect project fits",
    "Dedicated support team available 24/7",
    "Community forums and networking opportunities",
    "Fair pricing with transparent fee structure"
  ];

  return (
    <section id="about" className="w-full py-16 md:py-24 border-b border-white/5">
      <div className="container px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-block rounded-lg bg-navy-accent/10 px-3 py-1 text-sm backdrop-blur-md border border-navy-accent/30">
              About Us
            </div>
            
            <h2 className="text-3xl font-bold tracking-tighter">
              <span className="text-gradient">Connecting Talent </span>
              <span className="neon-text">Worldwide</span>
            </h2>
            
            <p className="text-muted-foreground">
              Freelancer Hub Nexus was born from a simple idea: create a platform where exceptional 
              freelancers and quality clients can connect without the noise and complications of 
              traditional freelance marketplaces.
            </p>
            
            <p className="text-muted-foreground">
              Our mission is to empower freelancers to build successful careers while helping 
              businesses find the perfect talent to bring their visions to life.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full flex items-center justify-center bg-navy-accent/20 mt-0.5">
                    <Check className="h-3 w-3 text-navy-accent" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -z-10 h-80 w-80 rounded-full bg-navy-accent/5 blur-3xl"></div>
            
            <div className="grid grid-cols-2 gap-4">
              <AnimatedCard className="aspect-square bg-navy-light backdrop-blur-2xl p-4 flex flex-col justify-center items-center text-center" delay="0.1s">
                <div className="text-4xl font-bold text-navy-accent mb-2">10K+</div>
                <div className="text-sm text-muted-foreground">Skilled Freelancers</div>
              </AnimatedCard>
              
              <AnimatedCard className="aspect-square bg-navy-light backdrop-blur-2xl p-4 flex flex-col justify-center items-center text-center" delay="0.2s" direction="right">
                <div className="text-4xl font-bold text-navy-accent mb-2">5K+</div>
                <div className="text-sm text-muted-foreground">Active Clients</div>
              </AnimatedCard>
              
              <AnimatedCard className="aspect-square bg-navy-light backdrop-blur-2xl p-4 flex flex-col justify-center items-center text-center" delay="0.3s">
                <div className="text-4xl font-bold text-navy-accent mb-2">98%</div>
                <div className="text-sm text-muted-foreground">Client Satisfaction</div>
              </AnimatedCard>
              
              <AnimatedCard className="aspect-square bg-navy-light backdrop-blur-2xl p-4 flex flex-col justify-center items-center text-center" delay="0.4s" direction="right">
                <div className="text-4xl font-bold text-navy-accent mb-2">30M+</div>
                <div className="text-sm text-muted-foreground">Paid to Freelancers</div>
              </AnimatedCard>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
