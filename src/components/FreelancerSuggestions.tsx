
import { ArrowUpRight, Briefcase, Star } from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedCard from "./AnimatedCard";

// Sample freelancer data
const freelancers = [
  {
    id: 1,
    name: "Alex Morgan",
    title: "Full Stack Developer",
    rating: 4.9,
    jobs: 58,
    skills: ["React", "Node.js", "TypeScript"],
    hourlyRate: "$75/hr"
  },
  {
    id: 2,
    name: "Samantha Chen",
    title: "UI/UX Designer",
    rating: 4.8,
    jobs: 43,
    skills: ["Figma", "Adobe XD", "Web Design"],
    hourlyRate: "$65/hr"
  },
  {
    id: 3,
    name: "Michael Brown",
    title: "DevOps Engineer",
    rating: 4.7,
    jobs: 32,
    skills: ["AWS", "Docker", "Kubernetes"],
    hourlyRate: "$85/hr"
  },
  {
    id: 4,
    name: "Emma Wilson",
    title: "Content Strategist",
    rating: 4.9,
    jobs: 67,
    skills: ["SEO", "Content Writing", "Marketing"],
    hourlyRate: "$55/hr"
  }
];

const FreelancerSuggestions = () => {
  return (
    <section className="w-full py-12 md:py-24 border-b border-white/5">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Top Freelancers</h2>
          <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
            Connect with the best talent in our community
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {freelancers.map((freelancer, index) => (
            <AnimatedCard 
              key={freelancer.id} 
              className="card-hover"
              delay={`${index * 0.1}s`}
            >
              <div className="flex flex-col items-center text-center">
                <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold">{freelancer.name.charAt(0)}</span>
                </div>
                
                <h3 className="font-semibold text-lg">{freelancer.name}</h3>
                <p className="text-primary text-sm">{freelancer.title}</p>
                
                <div className="flex items-center gap-1 mt-2">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span className="text-sm">{freelancer.rating}</span>
                  <span className="text-sm text-muted-foreground">
                    ({freelancer.jobs} jobs)
                  </span>
                </div>
                
                <div className="w-full border-t border-white/10 my-4"></div>
                
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {freelancer.skills.map((skill) => (
                    <span 
                      key={skill} 
                      className="inline-flex items-center rounded-md bg-white/5 px-2 py-1 text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-medium">{freelancer.hourlyRate}</span>
                  <Link 
                    to={`/freelancers/${freelancer.id}`}
                    className="text-primary hover:text-primary/90 transition-colors"
                  >
                    <ArrowUpRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
        
        <div className="flex justify-center mt-10">
          <Link 
            to="/freelancers" 
            className="inline-flex items-center justify-center rounded-md bg-white/5 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10"
          >
            View All Freelancers
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FreelancerSuggestions;
