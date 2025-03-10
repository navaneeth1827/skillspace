
import { useState } from "react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Clock, DollarSign, Filter, MapPin, Search, Star, X } from "lucide-react";

// Sample job data
const jobsData = [
  {
    id: 1,
    title: "Senior React Developer",
    company: "TechCorp",
    location: "Remote",
    type: "Full-time",
    salary: "$80K - $120K",
    skills: ["React", "TypeScript", "Node.js"],
    posted: "2 days ago",
    rating: 4.8,
    description: "We're looking for an experienced React developer to join our team and help build our next-generation web application..."
  },
  {
    id: 2,
    title: "UI/UX Designer",
    company: "DesignStudio",
    location: "New York, NY",
    type: "Contract",
    salary: "$70 - $90/hr",
    skills: ["Figma", "User Research", "Prototyping"],
    posted: "1 week ago",
    rating: 4.5,
    description: "Join our creative team to design intuitive and beautiful interfaces for our clients in the healthcare and finance sectors..."
  },
  {
    id: 3,
    title: "Backend Engineer",
    company: "DataSystems Inc",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$90K - $140K",
    skills: ["Python", "Django", "PostgreSQL", "AWS"],
    posted: "3 days ago",
    rating: 4.2,
    description: "We need a talented backend developer to help scale our data processing infrastructure and improve our API performance..."
  },
  {
    id: 4,
    title: "Mobile App Developer",
    company: "AppWorks",
    location: "Remote",
    type: "Part-time",
    salary: "$60 - $80/hr",
    skills: ["React Native", "iOS", "Android"],
    posted: "Just now",
    rating: 4.9,
    description: "Looking for a mobile developer to help create a cross-platform app for our fitness tracking service with excellent UI/UX..."
  },
  {
    id: 5,
    title: "DevOps Engineer",
    company: "CloudTech",
    location: "Austin, TX",
    type: "Full-time",
    salary: "$85K - $130K",
    skills: ["Kubernetes", "Docker", "CI/CD", "Terraform"],
    posted: "5 days ago",
    rating: 4.6,
    description: "Join our infrastructure team to help automate deployment processes and improve our cloud architecture on AWS and GCP..."
  },
  {
    id: 6,
    title: "Content Writer",
    company: "MediaGroup",
    location: "Remote",
    type: "Freelance",
    salary: "$40 - $60/hr",
    skills: ["Technical Writing", "SEO", "Content Strategy"],
    posted: "2 weeks ago",
    rating: 4.3,
    description: "We're seeking a talented content writer to create engaging technical articles, blog posts, and documentation for our SaaS products..."
  }
];

const FindJob = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [jobType, setJobType] = useState<string>("");
  
  // Filtered jobs based on search and filters
  const filteredJobs = jobsData.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !jobType || job.type === jobType;
    
    const matchesFilters = selectedFilters.length === 0 || 
                           job.skills.some(skill => selectedFilters.includes(skill));
    
    return matchesSearch && matchesType && matchesFilters;
  });
  
  const addFilter = (filter: string) => {
    if (!selectedFilters.includes(filter)) {
      setSelectedFilters([...selectedFilters, filter]);
    }
  };
  
  const removeFilter = (filter: string) => {
    setSelectedFilters(selectedFilters.filter(f => f !== filter));
  };
  
  // Extract all unique skills for filtering
  const allSkills = Array.from(new Set(jobsData.flatMap(job => job.skills)));

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container px-4 md:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 accent-gradient">Find Your Perfect Job</h1>
            <p className="text-muted-foreground">
              Browse through thousands of opportunities matching your skills and preferences
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Filters sidebar */}
            <div className="lg:col-span-1">
              <Card className="glass-card sticky top-20">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Filter className="mr-2 h-5 w-5" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Job Type Filter */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Job Type</h3>
                    <Select value={jobType} onValueChange={setJobType}>
                      <SelectTrigger className="bg-white/5">
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Types</SelectItem>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Freelance">Freelance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Skills Filter */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {allSkills.map(skill => (
                        <Badge 
                          key={skill}
                          variant="outline"
                          className={`cursor-pointer ${selectedFilters.includes(skill) ? 'bg-blue-600 text-white' : 'bg-white/5'}`}
                          onClick={() => selectedFilters.includes(skill) ? removeFilter(skill) : addFilter(skill)}
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Active Filters */}
                  {selectedFilters.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium">Active Filters</h3>
                        <Button 
                          variant="link" 
                          className="text-xs text-blue-400 p-0 h-auto"
                          onClick={() => setSelectedFilters([])}
                        >
                          Clear all
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedFilters.map(filter => (
                          <Badge key={filter} className="bg-blue-600/20 text-blue-400 flex items-center gap-1">
                            {filter}
                            <button onClick={() => removeFilter(filter)} className="hover:text-white">
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Search bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search for jobs, skills, or companies..."
                  className="pl-10 bg-white/5"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Job tabs */}
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All Jobs</TabsTrigger>
                  <TabsTrigger value="recommended">Recommended</TabsTrigger>
                  <TabsTrigger value="recent">Recent</TabsTrigger>
                  <TabsTrigger value="saved">Saved</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-4 mt-4">
                  {filteredJobs.length > 0 ? (
                    filteredJobs.map(job => (
                      <Card key={job.id} className="glass-card card-hover overflow-hidden">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-xl">{job.title}</CardTitle>
                              <div className="flex items-center mt-1 text-muted-foreground text-sm">
                                <span className="font-medium text-blue-400">{job.company}</span>
                                <span className="mx-2">•</span>
                                <span className="flex items-center">
                                  <MapPin size={14} className="mr-1" />
                                  {job.location}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center text-sm">
                              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500 mr-1" />
                              <span>{job.rating}</span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground text-sm mb-4">
                            {job.description}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {job.skills.map(skill => (
                              <Badge key={skill} variant="outline" className="bg-white/5">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Briefcase size={14} className="mr-1" />
                              {job.type}
                            </div>
                            <div className="flex items-center">
                              <DollarSign size={14} className="mr-1" />
                              {job.salary}
                            </div>
                            <div className="flex items-center">
                              <Clock size={14} className="mr-1" />
                              {job.posted}
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="border-t border-white/10 pt-4 flex justify-between">
                          <Button variant="ghost">Save Job</Button>
                          <Button>Apply Now</Button>
                        </CardFooter>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium">No jobs found</h3>
                      <p className="text-muted-foreground mt-1">
                        Try adjusting your search or filters to find more opportunities
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="recommended" className="space-y-4 mt-4">
                  <div className="text-center py-12">
                    <Star className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Personalized Recommendations</h3>
                    <p className="text-muted-foreground mt-1">
                      Complete your profile to get AI-powered job recommendations
                    </p>
                    <Button className="mt-4">Update Profile</Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="recent">
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Recent Activity</h3>
                    <p className="text-muted-foreground mt-1">
                      Jobs you've recently viewed will appear here
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="saved">
                  <div className="text-center py-12">
                    <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No Saved Jobs</h3>
                    <p className="text-muted-foreground mt-1">
                      Save jobs you're interested in to view them later
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default FindJob;
