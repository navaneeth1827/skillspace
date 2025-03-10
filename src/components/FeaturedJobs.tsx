
import { ArrowUpRight, Briefcase, DollarSign, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedCard from "./AnimatedCard";

// Sample job data
const jobs = [
  {
    id: 1,
    title: "Senior React Developer",
    company: "TechGiant Inc.",
    location: "Remote",
    salary: "$80k - $120k",
    type: "Full-time",
    description: "We're looking for an experienced React developer to join our team building innovative web applications.",
    tags: ["React", "TypeScript", "Redux"],
  },
  {
    id: 2,
    title: "UI/UX Designer",
    company: "Creative Studios",
    location: "New York, USA",
    salary: "$70k - $90k",
    type: "Contract",
    description: "Design intuitive interfaces for our suite of products. Must have a strong portfolio.",
    tags: ["Figma", "UI Design", "User Research"],
  },
  {
    id: 3,
    title: "Content Writer",
    company: "ContentHub",
    location: "Remote",
    salary: "$50k - $70k",
    type: "Part-time",
    description: "Create engaging content for technology blogs and websites. SEO knowledge a plus.",
    tags: ["Writing", "SEO", "Editing"],
  },
  {
    id: 4,
    title: "Full Stack Developer",
    company: "Startup.io",
    location: "San Francisco, USA",
    salary: "$100k - $140k",
    type: "Full-time",
    description: "Build and maintain our core product features. Experience with Node.js and React required.",
    tags: ["Node.js", "React", "MongoDB"],
  },
];

const FeaturedJobs = () => {
  return (
    <section className="w-full py-12 md:py-24 border-b border-white/5">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Featured Jobs</h2>
          <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
            Discover opportunities that match your expertise and career goals
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mt-8">
          {jobs.map((job, index) => (
            <AnimatedCard 
              key={job.id} 
              className="card-hover"
              delay={`${index * 0.1}s`}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">{job.title}</h3>
                  <p className="text-muted-foreground">{job.company}</p>
                </div>
                <Link 
                  to={`/jobs/${job.id}`} 
                  className="text-primary hover:text-primary/90 transition-colors"
                >
                  <ArrowUpRight className="h-5 w-5" />
                </Link>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3">
                <div className="inline-flex items-center rounded-md border border-white/10 px-2.5 py-0.5 text-xs font-semibold">
                  <Briefcase className="mr-1 h-3 w-3" />
                  {job.type}
                </div>
                <div className="inline-flex items-center rounded-md border border-white/10 px-2.5 py-0.5 text-xs font-semibold">
                  <MapPin className="mr-1 h-3 w-3" />
                  {job.location}
                </div>
                <div className="inline-flex items-center rounded-md border border-white/10 px-2.5 py-0.5 text-xs font-semibold">
                  <DollarSign className="mr-1 h-3 w-3" />
                  {job.salary}
                </div>
              </div>
              
              <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
                {job.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mt-4">
                {job.tags.map((tag) => (
                  <span 
                    key={tag} 
                    className="inline-flex items-center rounded-md bg-white/5 px-2 py-1 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </AnimatedCard>
          ))}
        </div>
        
        <div className="flex justify-center mt-10">
          <Link 
            to="/jobs" 
            className="inline-flex items-center justify-center rounded-md bg-white/5 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10"
          >
            View All Jobs
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedJobs;
