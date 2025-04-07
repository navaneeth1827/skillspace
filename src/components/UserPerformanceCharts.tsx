
import { useState, useEffect } from "react";
import { Activity, Zap, CheckCircle, XCircle, BarChart4 } from "lucide-react";
import { 
  AreaChart, 
  Area, 
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const UserPerformanceCharts = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [statusDistribution, setStatusDistribution] = useState([]);
  const [jobTypeDistribution, setJobTypeDistribution] = useState([]);
  const [isRecruiter, setIsRecruiter] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Check if user is a recruiter
    setIsRecruiter(user.user_metadata?.user_type === 'recruiter');

    // Fetch data based on user type
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Generate dates for the past week
        const dates = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          dates.push({
            date: date,
            name: date.toLocaleDateString('en-US', { weekday: 'short' })
          });
        }

        // Get the timestamp for 7 days ago
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        if (isRecruiter) {
          // For recruiters: job postings and applications received
          
          // 1. Weekly activity: jobs posted and applications received
          const jobPostingsPromises = dates.map(async ({ date, name }) => {
            const dayStart = new Date(date);
            dayStart.setHours(0, 0, 0, 0);
            
            const dayEnd = new Date(date);
            dayEnd.setHours(23, 59, 59, 999);
            
            // Count jobs posted on this day
            const { count: jobsPosted, error: jobsError } = await supabase
              .from('jobs')
              .select('*', { count: 'exact', head: true })
              .eq('recruiter_id', user.id)
              .gte('created_at', dayStart.toISOString())
              .lt('created_at', dayEnd.toISOString());
              
            // Count applications received on this day
            const { data: postedJobs } = await supabase
              .from('jobs')
              .select('id')
              .eq('recruiter_id', user.id);
              
            const jobIds = postedJobs?.map(job => job.id) || [];
            
            let applicationsReceived = 0;
            if (jobIds.length > 0) {
              const { count: appCount, error: appError } = await supabase
                .from('job_applications')
                .select('*', { count: 'exact', head: true })
                .in('job_id', jobIds)
                .gte('created_at', dayStart.toISOString())
                .lt('created_at', dayEnd.toISOString());
                
              applicationsReceived = appCount || 0;
            }
            
            return {
              name,
              jobsPosted: jobsPosted || 0,
              applicationsReceived: applicationsReceived || 0
            };
          });
          
          const weeklyData = await Promise.all(jobPostingsPromises);
          setWeeklyActivity(weeklyData);
          
          // 2. Status distribution of received applications
          const { data: jobsData } = await supabase
            .from('jobs')
            .select('id')
            .eq('recruiter_id', user.id);
            
          const recruiterJobIds = jobsData?.map(job => job.id) || [];
          
          if (recruiterJobIds.length > 0) {
            // Get application status counts
            const { data: applicationData } = await supabase
              .from('job_applications')
              .select('status')
              .in('job_id', recruiterJobIds);
              
            // Process the status counts manually
            const statusCounts = {};
            applicationData?.forEach(app => {
              const status = app.status || 'pending';
              statusCounts[status] = (statusCounts[status] || 0) + 1;
            });
            
            const processedStatusData = Object.entries(statusCounts).map(([name, count]) => ({
              name: name.charAt(0).toUpperCase() + name.slice(1),
              value: count
            }));
            
            setStatusDistribution(processedStatusData);
          }
          
          // 3. Get job type distribution
          const { data: jobsQuery } = await supabase
            .from('jobs')
            .select('job_type')
            .eq('recruiter_id', user.id);
            
          // Process job type counts manually
          const jobTypeCounts = {};
          jobsQuery?.forEach(job => {
            const jobType = job.job_type || 'other';
            jobTypeCounts[jobType] = (jobTypeCounts[jobType] || 0) + 1;
          });
          
          const processedJobTypeData = Object.entries(jobTypeCounts).map(([name, count]) => ({
            name,
            value: count
          }));
          
          setJobTypeDistribution(processedJobTypeData);
        } else {
          // For freelancers/job seekers: applications submitted and their statuses
          
          // 1. Weekly activity: applications submitted
          const applicationsPromises = dates.map(async ({ date, name }) => {
            const dayStart = new Date(date);
            dayStart.setHours(0, 0, 0, 0);
            
            const dayEnd = new Date(date);
            dayEnd.setHours(23, 59, 59, 999);
            
            // Count applications submitted on this day
            const { count: applicationsSubmitted, error: appError } = await supabase
              .from('job_applications')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user.id)
              .gte('created_at', dayStart.toISOString())
              .lt('created_at', dayEnd.toISOString());
            
            // Count interviews (accepted applications) on this day
            const { count: interviews, error: interviewError } = await supabase
              .from('job_applications')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user.id)
              .eq('status', 'accepted')
              .gte('created_at', dayStart.toISOString())
              .lt('created_at', dayEnd.toISOString());
              
            return {
              name,
              applications: applicationsSubmitted || 0,
              interviews: interviews || 0
            };
          });
          
          const weeklyData = await Promise.all(applicationsPromises);
          setWeeklyActivity(weeklyData);
          
          // 2. Application status distribution
          const { data: statusQuery } = await supabase
            .from('job_applications')
            .select('status')
            .eq('user_id', user.id);
            
          // Process the status counts manually
          const statusCounts = {};
          statusQuery?.forEach(app => {
            const status = app.status || 'pending';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
          });
          
          const processedStatusData = Object.entries(statusCounts).map(([name, count]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value: count
          }));
          
          setStatusDistribution(processedStatusData);
          
          // 3. Job type distribution for applied jobs
          const { data: jobTypeData } = await supabase
            .from('job_applications')
            .select(`
              job:jobs(job_type)
            `)
            .eq('user_id', user.id);
            
          // Count job types
          const jobTypeCounts = {};
          jobTypeData?.forEach(item => {
            const jobType = item.job?.job_type || 'Unknown';
            jobTypeCounts[jobType] = (jobTypeCounts[jobType] || 0) + 1;
          });
          
          const processedJobTypeData = Object.entries(jobTypeCounts).map(([name, count]) => ({
            name,
            value: count
          }));
          
          setJobTypeDistribution(processedJobTypeData);
        }
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscriptions for data changes
    const applicationChannel = supabase
      .channel('job_applications_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'job_applications',
        filter: isRecruiter ? undefined : `user_id=eq.${user.id}`
      }, () => {
        // Refresh data on any changes
        fetchData();
      })
      .subscribe();

    // For recruiters, also listen to jobs changes
    let jobsChannel;
    if (isRecruiter) {
      jobsChannel = supabase
        .channel('jobs_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'jobs',
          filter: `recruiter_id=eq.${user.id}`
        }, () => {
          // Refresh data on any changes
          fetchData();
        })
        .subscribe();
    }

    return () => {
      supabase.removeChannel(applicationChannel);
      if (jobsChannel) supabase.removeChannel(jobsChannel);
    };
  }, [user, isRecruiter]);

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 mb-10">
      {/* Activity Chart */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Weekly Activity
          </CardTitle>
          <CardDescription>
            {isRecruiter 
              ? "Your job posting and application activity over the past week" 
              : "Your job search activity over the past week"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Skeleton className="h-[250px] w-full" />
              </div>
            ) : (
              <ChartContainer 
                config={isRecruiter ? {
                  jobsPosted: {
                    label: "Jobs Posted",
                    color: "hsl(var(--primary))",
                  },
                  applicationsReceived: {
                    label: "Applications Received",
                    color: "hsl(var(--primary) / 0.5)",
                  },
                } : {
                  applications: {
                    label: "Applications",
                    color: "hsl(var(--primary))",
                  },
                  interviews: {
                    label: "Interviews",
                    color: "hsl(var(--primary) / 0.5)",
                  },
                }}
              >
                <AreaChart data={weeklyActivity} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                  />
                  {isRecruiter ? (
                    <>
                      <Area 
                        type="monotone" 
                        dataKey="jobsPosted" 
                        fill="var(--color-jobsPosted)" 
                        stroke="var(--color-jobsPosted)" 
                        fillOpacity={0.6} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="applicationsReceived" 
                        fill="var(--color-applicationsReceived)" 
                        stroke="var(--color-applicationsReceived)" 
                        fillOpacity={0.6} 
                      />
                    </>
                  ) : (
                    <>
                      <Area 
                        type="monotone" 
                        dataKey="applications" 
                        fill="var(--color-applications)" 
                        stroke="var(--color-applications)" 
                        fillOpacity={0.6} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="interviews" 
                        fill="var(--color-interviews)" 
                        stroke="var(--color-interviews)" 
                        fillOpacity={0.6} 
                      />
                    </>
                  )}
                </AreaChart>
              </ChartContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Application Status Chart */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart4 className="h-5 w-5 text-primary" />
            {isRecruiter ? "Posted Jobs by Type" : "Applied Jobs by Type"}
          </CardTitle>
          <CardDescription>
            {isRecruiter 
              ? "Distribution of your posted jobs by job type" 
              : "Types of jobs you've applied for"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Skeleton className="h-[250px] w-full" />
              </div>
            ) : jobTypeDistribution.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                {isRecruiter 
                  ? "No job postings found. Start posting jobs to see analytics." 
                  : "No job applications found. Start applying to jobs to see analytics."}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={jobTypeDistribution}
                  margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}`, 'Count']} />
                  <Legend />
                  <Bar dataKey="value" name="Count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Application Status Distribution */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            Application Status Distribution
          </CardTitle>
          <CardDescription>
            {isRecruiter 
              ? "Status breakdown of applications to your job postings" 
              : "Status of your job applications"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Skeleton className="h-[250px] w-full" />
              </div>
            ) : statusDistribution.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                {isRecruiter 
                  ? "No applications received yet. Share your job postings to attract candidates." 
                  : "No applications submitted yet. Start applying to jobs to see analytics."}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value}`, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserPerformanceCharts;
