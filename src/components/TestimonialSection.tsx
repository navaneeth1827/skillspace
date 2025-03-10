
import { Star } from "lucide-react";
import AnimatedCard from "./AnimatedCard";

interface Testimonial {
  name: string;
  position: string;
  company: string;
  content: string;
  rating: number;
}

const TestimonialSection = () => {
  const testimonials: Testimonial[] = [
    {
      name: "Sarah Johnson",
      position: "Marketing Director",
      company: "GrowthSpark",
      content: "Finding the right talent through Freelancer Hub Nexus has transformed our content marketing strategy. The quality of work and reliability of freelancers here is unmatched!",
      rating: 5,
    },
    {
      name: "Michael Chen",
      position: "CTO",
      company: "TechFusion",
      content: "As a tech startup, we needed specialized developers quickly. This platform delivered exceptional talent that understood our vision and executed flawlessly.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      position: "Freelance Designer",
      company: "Self-employed",
      content: "Since joining as a freelancer, my client base has grown steadily. The platform makes it easy to showcase my portfolio and connect with quality clients who value my work.",
      rating: 4,
    },
  ];

  return (
    <section className="w-full py-16 md:py-24 border-b border-white/5">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter text-center mb-4">
            <span className="text-gradient">What People Are </span>
            <span className="neon-text">Saying</span>
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl">
            Trusted by hundreds of businesses and thousands of freelancers worldwide.
            Join our growing community today.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <AnimatedCard 
              key={testimonial.name} 
              className="flex flex-col h-full"
              delay={`${0.1 + index * 0.1}s`}
            >
              <div className="flex mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i}
                    size={18}
                    className={i < testimonial.rating ? "fill-navy-accent text-navy-accent" : "text-gray-600"}
                  />
                ))}
              </div>
              <p className="flex-1 text-sm text-muted-foreground mb-4">{testimonial.content}</p>
              <div className="mt-auto">
                <p className="font-medium">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">
                  {testimonial.position}, {testimonial.company}
                </p>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
