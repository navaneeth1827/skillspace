
import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { 
  Briefcase, 
  Building, 
  Check, 
  Clock, 
  DollarSign, 
  Filter, 
  Home, 
  MapPin, 
  Search, 
  Sliders, 
  Star, 
  Zap 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import AnimatedCard from "@/components/AnimatedCard";

// Sample data
const jobListings = [
  {
    id: 1,
    title: "Senior React Developer",
    company: "TechGiant Inc.",
    companyLogo: "/placeholder.svg",
    location: "Remote",
    locationType: "Remote",
    contractType: "Full-time",
    salary: "$80k - $120k",
    description: "We're looking for an experienced React developer to join our team building innovative web applications.",
    responsibilities: [
      "Develop robust web applications using React and TypeScript",
      "Collaborate with designers and backend developers",
      "Optimize applications for maximum speed and scalability",
      "Implement responsive design and ensure cross-browser compatibility"
    ],
    requirements: [
      "5+ years of experience with React",
      "Strong knowledge of JavaScript, HTML, and CSS",
      "Experience with Redux or similar state management libraries",
      "Familiarity with modern frontend build pipelines and tools"
    ],
    postedDate: "2 days ago",
    matchScore: 92,
    tags: ["React", "TypeScript", "Redux", "JavaScript"],
  },
  {
    id: 2,
    title: "Frontend Developer",
    company: "StartupX",
    companyLogo: "/placeholder.svg",
    location: "New York, NY",
    locationType: "Hybrid",
    contractType: "Full-time",
    salary: "$70k - $90k",
    description: "Join our growing team to build responsive and accessible user interfaces using modern web technologies.",
    responsibilities: [
      "Implement UI components using React",
      "Write clean, maintainable code",
      "Work closely with UI/UX designers",
      "Participate in code reviews and team discussions"
    ],
    requirements: [
      "2+ years of experience with modern JavaScript frameworks",
      "Strong understanding of HTML, CSS, and responsive design",
      "Experience with Git and CI/CD workflows",
      "Knowledge of web accessibility standards"
    ],
    postedDate: "1 week ago",
    matchScore: 87,
    tags: ["React", "JavaScript", "HTML", "CSS"],
  },
  {
    id: 3,
    title: "UI/UX Designer with React skills",
    company: "DesignHub",
    companyLogo: "/placeholder.svg",
    location: "San Francisco, CA",
    locationType: "On-site",
    contractType: "Full-time",
    salary: "$90k - $110k",
    description: "Looking for a designer who can also implement designs in React for our design system.",
    responsibilities: [
      "Create user-centered designs by understanding business requirements",
      "Create wireframes, prototypes, and mockups",
      "Implement designs using React and CSS",
      "Work with the product team to iterate on the design"
    ],
    requirements: [
      "3+ years of experience in UI/UX design",
      "Proficiency with design tools like Figma or Sketch",
      "Knowledge of React and modern CSS",
      "Understanding of design systems and component libraries"
    ],
    postedDate: "3 days ago",
    matchScore: 78,
    tags: ["UI/UX", "Figma", "React", "Design"],
  },
  {
    id: 4,
    title: "Full Stack JavaScript Developer",
    company: "GlobalTech",
    companyLogo: "/placeholder.svg",
    location: "Remote",
    locationType: "Remote",
    contractType: "Contract",
    salary: "$50 - $70 per hour",
    description: "Build and maintain our core product features using Node.js and React.",
    responsibilities: [
      "Develop features across the entire stack",
      "Write clean, testable code",
      "Optimize application for maximum speed and scalability",
      "Collaborate with the team on architecture decisions"
    ],
    requirements: [
      "4+ years of experience with JavaScript",
      "Experience with Node.js and React",
      "Understanding of RESTful APIs",
      "Knowledge of database systems like MongoDB or PostgreSQL"
    ],
    postedDate: "1 month ago",
    matchScore: 75,
    tags: ["JavaScript", "Node.js", "React", "MongoDB"],
  },
  {
    id: 5,
    title: "DevOps Engineer",
    company: "CloudSolutions",
    companyLogo: "/placeholder.svg",
    location: "Remote",
    locationType: "Remote",
    contractType: "Full-time",
    salary: "$100k - $130k",
    description: "Manage our cloud infrastructure and deployment pipelines.",
    responsibilities: [
      "Design and implement CI/CD pipelines",
      "Manage cloud infrastructure using AWS or Azure",
      "Monitor system performance and reliability",
      "Implement security best practices"
    ],
    requirements: [
      "3+ years of experience in DevOps",
      "Knowledge of AWS or Azure services",
      "Experience with Docker and Kubernetes",
      "Understanding of infrastructure as code using tools like Terraform"
    ],
    postedDate: "2 weeks ago",
    matchScore: 65,
    tags: ["DevOps", "AWS", "Docker", "Kubernetes"],
  },
];

// Skills options for the form
const skillOptions = [
  "JavaScript", "React", "Vue", "Angular", "Node.js", "Express", "Next.js", 
  "TypeScript", "HTML", "CSS", "SASS/SCSS", "GraphQL", "REST API", 
  "MongoDB", "PostgreSQL", "MySQL", "Firebase", "AWS", "Azure", 
  "Docker", "Kubernetes", "CI/CD", "Git", "Redux", "Context API", 
  "UI/UX Design", "Figma", "Sketch", "Adobe XD", "Tailwind CSS", 
  "Bootstrap", "Material UI", "Testing", "Jest", "Cypress", "TDD"
];

const FindJob = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [selectedExperience, setSelectedExperience] = useState("");
  const [selectedJobType, setSelectedJobType] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [salaryRange, setSalaryRange] = useState([25, 150]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [jobView, setJobView] = useState<number | null>(null);

  // Add a skill to the selected skills
  const addSkill = (skill: string) => {
    if (!selectedSkills.includes(skill) && selectedSkills.length < 10) {
      setSelectedSkills([...selectedSkills, skill]);
    } else if (selectedSkills.length >= 10) {
      toast({
        title: "Maximum skills reached",
        description: "You can select up to 10 skills",
        variant: "destructive",
      });
    }
  };

  // Remove a skill from the selected skills
  const removeSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

  // Filter jobs based on search term, location, experience, job type, skills, and salary range
  const filteredJobs = jobListings.filter(job => {
    const matchesSearch = searchTerm === "" || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLocation = location === "" || 
      job.location.toLowerCase().includes(location.toLowerCase());
    
    const matchesExperience = selectedExperience === "" || true; // Placeholder for experience filtering
    
    const matchesJobType = selectedJobType === "" ||
      job.contractType.toLowerCase() === selectedJobType.toLowerCase();
    
    const matchesSkills = selectedSkills.length === 0 ||
      selectedSkills.some(skill => job.tags.includes(skill));
    
    // Parse salary and check if it's within range
    const matchesSalary = true; // Placeholder for salary filtering
    
    return matchesSearch && matchesLocation && matchesExperience && 
      matchesJobType && matchesSkills && matchesSalary;
  });

  // Helper to get a color class based on match score
  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 75) return "text-blue-500";
    if (score >= 60) return "text-yellow-500";
    return "text-orange-500";
  };

  // Apply to a job
  const handleApply = (jobId: number) => {
    toast({
      title: "Application submitted",
      description: `Your application for job #${jobId} has been sent to the employer.`,
    });
  };

  // Save a job
  const handleSaveJob = (jobId: number) => {
    toast({
      title: "Job saved",
      description: "This job has been added to your saved jobs.",
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-12 md:py-20 bg-gradient-to-b from-background to-background/50">
          <div className="container px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Find Your Perfect Job Match</h1>
              <p className="text-muted-foreground mb-8">
                Discover opportunities tailored to your skills and experience
              </p>
              
              {/* Main Search Bar */}
              <div className="relative mb-8">
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Job title, skills, or keywords"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-black text-white h-10"
                    />
                  </div>
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="City, state, or remote"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-10 bg-black text-white h-10"
                    />
                  </div>
                  <Button className="w-full md:w-auto md:px-8" onClick={() => console.log("Search")}>
                    <Search className="mr-2 h-4 w-4" /> Search
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 md:absolute md:right-0 md:-bottom-8 text-xs"
                  onClick={() => setFilterOpen(!filterOpen)}
                >
                  <Sliders className="mr-1 h-3 w-3" />
                  Advanced Filters
                </Button>
              </div>

              {/* Advanced Filters */}
              {filterOpen && (
                <div className="glass-card p-4 mb-8 text-left">
                  <h3 className="font-medium mb-4 flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    Advanced Filters
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Experience Level</label>
                      <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select experience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                          <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                          <SelectItem value="senior">Senior Level (5+ years)</SelectItem>
                          <SelectItem value="lead">Team Lead / Manager</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Job Type</label>
                      <Select value={selectedJobType} onValueChange={setSelectedJobType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select job type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Full-time">Full-time</SelectItem>
                          <SelectItem value="Part-time">Part-time</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                          <SelectItem value="Freelance">Freelance</SelectItem>
                          <SelectItem value="Internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Salary Range (K per year)</label>
                      <div className="px-2">
                        <Slider 
                          defaultValue={salaryRange} 
                          max={200} 
                          step={5} 
                          onValueChange={setSalaryRange} 
                        />
                        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                          <span>${salaryRange[0]}K</span>
                          <span>${salaryRange[1]}K</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="text-sm text-muted-foreground mb-1 block">Skills (select up to 10)</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedSkills.map(skill => (
                        <Badge key={skill} variant="outline" className="bg-primary/10 flex items-center gap-1">
                          {skill}
                          <button onClick={() => removeSkill(skill)} className="ml-1 hover:text-destructive">
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {skillOptions
                        .filter(skill => !selectedSkills.includes(skill))
                        .slice(0, 15)
                        .map(skill => (
                          <Badge 
                            key={skill} 
                            variant="outline" 
                            className="cursor-pointer hover:bg-primary/20"
                            onClick={() => addSkill(skill)}
                          >
                            + {skill}
                          </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      setSelectedExperience("");
                      setSelectedJobType("");
                      setSelectedSkills([]);
                      setSalaryRange([25, 150]);
                    }}>
                      Reset Filters
                    </Button>
                    <Button size="sm" onClick={() => setFilterOpen(false)}>
                      Apply Filters
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Profile and Job Listing Section */}
        <section className="py-12">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Profile and Skills Section */}
              <div className="w-full lg:w-1/3 space-y-6">
                {/* Profile Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" /> Your Profile
                    </CardTitle>
                    <CardDescription>
                      Complete your profile to get better job matches
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                        <User size={32} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">John Doe</h3>
                        <p className="text-sm text-muted-foreground">Senior Developer</p>
                        <p className="text-xs text-muted-foreground mt-1">New York, USA</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Profile Completeness</label>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-1">
                          <div className="h-full bg-primary" style={{ width: "75%" }}></div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">75% - Add more skills to improve matches</p>
                      </div>

                      <Separator />
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Your Top Skills</h4>
                        <div className="flex flex-wrap gap-1">
                          {["React", "JavaScript", "TypeScript", "Node.js", "MongoDB"].map(skill => (
                            <Badge key={skill} variant="outline" className="bg-primary/10">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Experience Level</h4>
                        <p className="text-sm">5+ years</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Preferred Job Types</h4>
                        <div className="flex flex-wrap gap-1">
                          {["Full-time", "Remote"].map(type => (
                            <Badge key={type} variant="outline">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/profile">Edit Profile</Link>
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* Job Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sliders className="h-5 w-5 text-primary" /> Job Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Salary Expectation</label>
                      <div className="flex items-center gap-2 mt-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>$80,000 - $120,000 per year</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Location Preference</label>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>Remote, New York, San Francisco</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Availability</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Available immediately</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full">
                      Update Preferences
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              {/* Job Listings */}
              <div className="w-full lg:w-2/3">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">
                    {filteredJobs.length} Jobs Matched
                  </h2>
                  <Select defaultValue="relevance">
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Most Relevant</SelectItem>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="salary-high">Highest Salary</SelectItem>
                      <SelectItem value="salary-low">Lowest Salary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {jobView === null ? (
                  /* Job List View */
                  <div className="space-y-4">
                    {filteredJobs.length > 0 ? (
                      filteredJobs.map((job, index) => (
                        <AnimatedCard 
                          key={job.id} 
                          className="hover:border-primary/50 transition-all"
                          delay={`${index * 0.05}s`}
                        >
                          <div className="flex gap-4">
                            <div className="hidden sm:flex w-12 h-12 rounded-md overflow-hidden bg-primary/10 items-center justify-center flex-shrink-0">
                              <img src={job.companyLogo} alt={job.company} className="w-full h-full object-contain" />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                                <h3 className="font-semibold text-lg">{job.title}</h3>
                                <div className="flex items-center mt-1 sm:mt-0">
                                  <Badge className={`${getMatchScoreColor(job.matchScore)} bg-black font-medium flex items-center gap-1`}>
                                    <Zap className="h-3 w-3" />
                                    {job.matchScore}% Match
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row sm:items-center gap-y-1 gap-x-4 text-sm mb-3">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Building className="h-4 w-4" />
                                  {job.company}
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <MapPin className="h-4 w-4" />
                                  {job.location} 
                                  {job.locationType === "Remote" && <Home className="h-3 w-3 ml-1" />}
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Briefcase className="h-4 w-4" />
                                  {job.contractType}
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <DollarSign className="h-4 w-4" />
                                  {job.salary}
                                </div>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {job.description}
                              </p>
                              
                              <div className="flex flex-wrap gap-1 mb-3">
                                {job.tags.slice(0, 4).map((tag) => (
                                  <Badge key={tag} variant="outline" className="bg-black text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {job.tags.length > 4 && (
                                  <Badge variant="outline" className="bg-black text-xs">
                                    +{job.tags.length - 4} more
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <div className="text-xs text-muted-foreground">
                                  Posted {job.postedDate}
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-8"
                                    onClick={() => handleSaveJob(job.id)}
                                  >
                                    <Star className="h-3.5 w-3.5 mr-1" />
                                    Save
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    className="h-8"
                                    onClick={() => setJobView(job.id)}
                                  >
                                    View Details
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </AnimatedCard>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                          <Search className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium text-lg mb-2">No jobs found</h3>
                        <p className="text-muted-foreground max-w-md mx-auto mb-6">
                          Try adjusting your search or filters to find more opportunities
                        </p>
                        <Button onClick={() => {
                          setSearchTerm("");
                          setLocation("");
                          setSelectedExperience("");
                          setSelectedJobType("");
                          setSelectedSkills([]);
                          setSalaryRange([25, 150]);
                        }}>
                          Reset Filters
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Job Detail View */
                  (() => {
                    const job = jobListings.find(j => j.id === jobView);
                    if (!job) return null;
                    
                    return (
                      <Card>
                        <CardHeader>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-fit -ml-2 -mt-1 mb-2"
                            onClick={() => setJobView(null)}
                          >
                            ← Back to results
                          </Button>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-2xl">{job.title}</CardTitle>
                              <div className="flex items-center gap-2 mt-2">
                                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                                  <img src={job.companyLogo} alt={job.company} className="w-6 h-6" />
                                </div>
                                <div className="text-muted-foreground">
                                  {job.company}
                                </div>
                              </div>
                            </div>
                            <Badge className={`${getMatchScoreColor(job.matchScore)} bg-black font-medium text-base flex items-center gap-1 px-3 py-1`}>
                              <Zap className="h-4 w-4" />
                              {job.matchScore}% Match
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              {job.location}
                              {job.locationType === "Remote" && (
                                <Badge variant="outline" className="ml-1 text-xs">Remote</Badge>
                              )}
                              {job.locationType === "Hybrid" && (
                                <Badge variant="outline" className="ml-1 text-xs">Hybrid</Badge>
                              )}
                              {job.locationType === "On-site" && (
                                <Badge variant="outline" className="ml-1 text-xs">On-site</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Briefcase className="h-4 w-4" />
                              {job.contractType}
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <DollarSign className="h-4 w-4" />
                              {job.salary}
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              Posted {job.postedDate}
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <h3 className="font-medium text-lg mb-3">Job Description</h3>
                            <p className="text-muted-foreground mb-6">
                              {job.description}
                            </p>
                            
                            <h4 className="font-medium mb-2">Responsibilities:</h4>
                            <ul className="space-y-2 mb-4">
                              {job.responsibilities.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-muted-foreground">
                                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                            
                            <h4 className="font-medium mb-2">Requirements:</h4>
                            <ul className="space-y-2 mb-4">
                              {job.requirements.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-muted-foreground">
                                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h3 className="font-medium text-lg mb-3">Skills & Expertise</h3>
                            <div className="flex flex-wrap gap-2">
                              {job.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="py-1.5 px-3 bg-primary/10">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <h3 className="font-medium text-lg mb-3">Apply for this position</h3>
                            <Textarea 
                              placeholder="Write a short cover letter or note (optional)" 
                              className="mb-4 min-h-[120px]" 
                            />
                            <div className="flex flex-col sm:flex-row gap-3">
                              <Button 
                                variant="outline" 
                                className="sm:flex-1"
                                onClick={() => handleSaveJob(job.id)}
                              >
                                <Star className="h-4 w-4 mr-2" />
                                Save for Later
                              </Button>
                              <Button 
                                className="sm:flex-1"
                                onClick={() => handleApply(job.id)}
                              >
                                <Briefcase className="h-4 w-4 mr-2" />
                                Apply Now
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })()
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <FooterSection />
    </div>
  );
};

export default FindJob;
