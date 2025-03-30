import { useState, useEffect } from "react";
import { ArrowUpRight, Briefcase, DollarSign, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AnimatedCard from "./AnimatedCard";
import { Job, parseSkills } from "@/types/profile";

const FeaturedJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(4);

        if (error) {
          console.error("Error fetching jobs:", error);
          return;
        }

        if (data) {
          const transformedJobs: Job[] = data.map(item => {
            return {
              id: item.id,
              title: item.title,
              company: item.company || 'Unknown Company',
              location: item.location || 'Remote',
              job_type: item.job_type || 'Full-time',
              salary: item.budget_min && item.budget_max ? 
                `$${item.budget_min} - $${item.budget_max}` : 
                (item.salary || 'Competitive'),
              category: item.category || 'Development',
              description: item.description || '',
              skills: parseSkills(item.skills),
              recruiter_id: item.recruiter_id,
              status: item.status || 'active',
              budget_min: item.budget_min,
              budget_max: item.budget_max,
              created_at: item.created_at,
              updated_at: item.updated_at
            };
          });
          setJobs(transformedJobs);
        }
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();

    // Set up real-time subscription for jobs
    const channel = supabase
      .channel('public:jobs')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'jobs' 
        }, 
        (payload) => {
          console.log('Change received!', payload);
          // Refetch jobs when changes occur
          fetchJobs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section className="w-full py-12 md:py-24 border-b border-white/5">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Featured Jobs</h2>
          <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
            Discover opportunities that match your expertise and career goals
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin h-8 w-8 border-2 border-navy-accent rounded-full border-t-transparent"></div>
          </div>
        ) : jobs.length > 0 ? (
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
                    {job.job_type}
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
                  {job.skills.slice(0, 3).map((tag) => (
                    <span 
                      key={tag} 
                      className="inline-flex items-center rounded-md bg-white/5 px-2 py-1 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {job.skills.length > 3 && (
                    <span className="inline-flex items-center rounded-md bg-white/5 px-2 py-1 text-xs">
                      +{job.skills.length - 3} more
                    </span>
                  )}
                </div>
              </AnimatedCard>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No jobs available at the moment.</p>
            <Link 
              to="/post-job" 
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white mt-4"
            >
              Post a Job
            </Link>
          </div>
        )}
        
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
