
import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { Badge } from "@/components/ui/badge";
import AnimatedCard from "@/components/AnimatedCard";
import { Briefcase, DollarSign, MapPin, MessageSquare, Star, User, Zap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Button from "@/components/Button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

// Sample data for dashboard display
const recommendedJobs = [
  {
    id: 101,
    title: "Senior React Developer",
    company: "TechGiant Inc.",
    location: "Remote",
    salary: "$80k - $120k",
    matchScore: 92,
    description: "We're looking for an experienced React developer to join our team building innovative web applications.",
    tags: ["React", "TypeScript", "Redux"],
  },
  {
    id: 102,
    title: "Frontend Engineer",
    company: "StartupX",
    location: "Remote",
    salary: "$75k - $95k",
    matchScore: 87,
    description: "Join our growing team to build responsive and accessible user interfaces using modern web technologies.",
    tags: ["JavaScript", "React", "CSS"],
  },
  {
    id: 103,
    title: "UI/UX Designer with React skills",
    company: "DesignHub",
    location: "San Francisco, USA",
    salary: "$90k - $110k",
    matchScore: 78,
    description: "Looking for a designer who can also implement designs in React for our design system.",
    tags: ["UI Design", "React", "Figma"],
  },
];

const recentJobs = [
  {
    id: 201,
    title: "Full Stack JavaScript Developer",
    company: "GlobalTech",
    location: "Remote",
    salary: "$85k - $115k",
    postedDate: "2 days ago",
    description: "Build and maintain our core product features using Node.js and React.",
    tags: ["Node.js", "React", "MongoDB"],
  },
  {
    id: 202,
    title: "Mobile App Developer",
    company: "AppCorp",
    location: "New York, USA",
    salary: "$90k - $120k",
    postedDate: "3 days ago",
    description: "Develop cross-platform mobile applications using React Native.",
    tags: ["React Native", "JavaScript", "Mobile"],
  },
  {
    id: 203,
    title: "DevOps Engineer",
    company: "CloudSolutions",
    location: "Remote",
    salary: "$100k - $130k",
    postedDate: "5 days ago",
    description: "Manage our cloud infrastructure and deployment pipelines.",
    tags: ["AWS", "Docker", "Kubernetes"],
  },
];

const activeChats = [
  {
    id: 1,
    name: "Jane Smith",
    company: "TechGiant Inc.",
    role: "Hiring Manager",
    lastMessage: "Can we schedule an interview for next week?",
    time: "2 hours ago",
    unread: 2,
    avatar: "/placeholder.svg"
  },
  {
    id: 2,
    name: "Robert Johnson",
    company: "StartupX",
    role: "Founder",
    lastMessage: "Thanks for sending your portfolio, I'm impressed with your work.",
    time: "Yesterday",
    unread: 0,
    avatar: "/placeholder.svg"
  },
];

const Dashboard = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const handleApply = (jobId: number) => {
    toast({
      title: "Application submitted",
      description: `Your application for job #${jobId} has been sent to the employer.`,
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar - User Profile Summary */}
            <div className="md:w-1/4">
              <div className="glass-card p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-16 w-16 rounded-full bg-navy-accent/20 flex items-center justify-center overflow-hidden">
                    <User size={32} className="text-navy-accent" />
                  </div>
                  <div>
                    <h2 className="font-bold text-xl">John Doe</h2>
                    <p className="text-sm text-muted-foreground">Senior Developer</p>
                  </div>
                </div>
                <div className="border-t border-white/10 pt-4 mt-4">
                  <Link to="/profile" className="text-navy-accent hover:text-navy-accent/80 text-sm flex items-center gap-2 mb-2">
                    <User size={14} />
                    View complete profile
                  </Link>
                  <Link to="/messages" className="text-navy-accent hover:text-navy-accent/80 text-sm flex items-center gap-2">
                    <MessageSquare size={14} />
                    Messages <Badge variant="outline" className="ml-2 h-5 bg-navy-accent/10">{activeChats.reduce((acc, chat) => acc + chat.unread, 0)}</Badge>
                  </Link>
                </div>
              </div>

              {/* Recent Messages */}
              <div className="glass-card p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Recent Messages</h3>
                  <Link to="/messages" className="text-xs text-navy-accent hover:text-navy-accent/80">See all</Link>
                </div>
                <div className="space-y-4">
                  {activeChats.map(chat => (
                    <Link to={`/messages/${chat.id}`} key={chat.id} className="flex gap-3 hover:bg-white/5 p-2 rounded-md transition-colors">
                      <div className="h-10 w-10 rounded-full bg-navy-accent/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img src={chat.avatar} alt={chat.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-sm truncate">{chat.name}</h4>
                          <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">{chat.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{chat.company}</span>
                          {chat.unread > 0 && (
                            <Badge variant="default" className="h-5 bg-navy-accent text-navy px-1.5">{chat.unread}</Badge>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="md:w-3/4">
              <h1 className="text-2xl font-bold mb-6">Welcome back, John!</h1>
              
              {/* Search Bar */}
              <div className="relative mb-6">
                <Input
                  placeholder="Search for jobs by title, company, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <Button 
                  size="sm" 
                  className="absolute right-2 top-2"
                  variant="ghost"
                >
                  Advanced Search
                </Button>
              </div>
              
              {/* Job Tabs */}
              <Tabs defaultValue="recommended" className="mb-8">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="recommended">AI Recommended</TabsTrigger>
                  <TabsTrigger value="recent">Recent Jobs</TabsTrigger>
                  <TabsTrigger value="saved">Saved Jobs</TabsTrigger>
                </TabsList>
                
                {/* AI Recommended Jobs */}
                <TabsContent value="recommended">
                  <div className="space-y-4">
                    {recommendedJobs.map((job, index) => (
                      <AnimatedCard
                        key={job.id}
                        className="hover-shadow"
                        delay={`${index * 0.05}s`}
                      >
                        <div className="flex justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{job.title}</h3>
                              <div className="flex items-center text-navy-accent">
                                <Badge className="bg-navy-accent text-navy font-medium">
                                  <Zap className="mr-1 h-3 w-3" /> 
                                  {job.matchScore}% Match
                                </Badge>
                              </div>
                            </div>
                            <p className="text-muted-foreground">{job.company}</p>
                            
                            <div className="flex flex-wrap gap-2 mt-2">
                              <div className="inline-flex items-center rounded-md border border-white/10 px-2.5 py-0.5 text-xs font-semibold">
                                <MapPin className="mr-1 h-3 w-3" />
                                {job.location}
                              </div>
                              <div className="inline-flex items-center rounded-md border border-white/10 px-2.5 py-0.5 text-xs font-semibold">
                                <DollarSign className="mr-1 h-3 w-3" />
                                {job.salary}
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mt-2">
                              {job.description}
                            </p>
                            
                            <div className="flex flex-wrap gap-2 mt-3">
                              {job.tags.map((tag) => (
                                <span 
                                  key={tag} 
                                  className="inline-flex items-center rounded-md bg-white/5 px-2 py-1 text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex flex-col justify-between items-end gap-2">
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8"
                              >
                                <Star className="h-3.5 w-3.5 mr-1" />
                                Save
                              </Button>
                              <Button 
                                size="sm" 
                                className="h-8"
                                onClick={() => handleApply(job.id)}
                              >
                                Apply
                              </Button>
                            </div>
                          </div>
                        </div>
                      </AnimatedCard>
                    ))}
                  </div>
                </TabsContent>
                
                {/* Recent Jobs */}
                <TabsContent value="recent">
                  <div className="space-y-4">
                    {recentJobs.map((job, index) => (
                      <AnimatedCard
                        key={job.id}
                        className="hover-shadow"
                        delay={`${index * 0.05}s`}
                      >
                        <div className="flex justify-between">
                          <div className="space-y-2">
                            <h3 className="font-semibold text-lg">{job.title}</h3>
                            <p className="text-muted-foreground">{job.company}</p>
                            
                            <div className="flex flex-wrap gap-2 mt-2">
                              <div className="inline-flex items-center rounded-md border border-white/10 px-2.5 py-0.5 text-xs font-semibold">
                                <Briefcase className="mr-1 h-3 w-3" />
                                Full-time
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
                            
                            <p className="text-sm text-muted-foreground mt-2">
                              {job.description}
                            </p>
                            
                            <div className="flex flex-wrap gap-2 mt-3">
                              {job.tags.map((tag) => (
                                <span 
                                  key={tag} 
                                  className="inline-flex items-center rounded-md bg-white/5 px-2 py-1 text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex flex-col justify-between items-end gap-2">
                            <span className="text-xs text-muted-foreground">
                              Posted {job.postedDate}
                            </span>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8"
                              >
                                <Star className="h-3.5 w-3.5 mr-1" />
                                Save
                              </Button>
                              <Button 
                                size="sm" 
                                className="h-8"
                                onClick={() => handleApply(job.id)}
                              >
                                Apply
                              </Button>
                            </div>
                          </div>
                        </div>
                      </AnimatedCard>
                    ))}
                  </div>
                </TabsContent>
                
                {/* Saved Jobs */}
                <TabsContent value="saved">
                  <div className="text-center py-8">
                    <h3 className="text-lg font-medium">No saved jobs yet</h3>
                    <p className="text-muted-foreground mt-2">
                      Jobs you save will appear here for easy access.
                    </p>
                    <Button className="mt-4" asChild>
                      <Link to="/jobs">Browse Jobs</Link>
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
              
              {/* Job Categories */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Explore Job Categories</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { name: "Development", icon: <Briefcase className="h-4 w-4 mr-2" />, count: 1240 },
                    { name: "Design", icon: <Briefcase className="h-4 w-4 mr-2" />, count: 842 },
                    { name: "Marketing", icon: <Briefcase className="h-4 w-4 mr-2" />, count: 647 },
                    { name: "Writing", icon: <Briefcase className="h-4 w-4 mr-2" />, count: 513 },
                    { name: "Data Science", icon: <Briefcase className="h-4 w-4 mr-2" />, count: 324 },
                    { name: "Customer Support", icon: <Briefcase className="h-4 w-4 mr-2" />, count: 275 },
                  ].map((category) => (
                    <Link 
                      key={category.name}
                      to={`/jobs?category=${category.name}`}
                      className="flex items-center p-3 rounded-lg glass-card hover:bg-navy-accent/10 transition-colors"
                    >
                      {category.icon}
                      <span>{category.name}</span>
                      <Badge variant="outline" className="ml-auto">{category.count}</Badge>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default Dashboard;
