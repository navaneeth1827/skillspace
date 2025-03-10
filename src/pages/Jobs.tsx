
import { useState } from "react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { Briefcase, DollarSign, Filter, MapPin, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Button from "@/components/Button";
import AnimatedCard from "@/components/AnimatedCard";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Sample job data
const allJobs = [
  {
    id: 1,
    title: "Senior React Developer",
    company: "TechGiant Inc.",
    location: "Remote",
    salary: "$80k - $120k",
    type: "Full-time",
    category: "Development",
    description: "We're looking for an experienced React developer to join our team building innovative web applications.",
    tags: ["React", "TypeScript", "Redux"],
    postedDate: "2 days ago"
  },
  {
    id: 2,
    title: "UI/UX Designer",
    company: "Creative Studios",
    location: "New York, USA",
    salary: "$70k - $90k",
    type: "Contract",
    category: "Design",
    description: "Design intuitive interfaces for our suite of products. Must have a strong portfolio.",
    tags: ["Figma", "UI Design", "User Research"],
    postedDate: "3 days ago"
  },
  {
    id: 3,
    title: "Content Writer",
    company: "ContentHub",
    location: "Remote",
    salary: "$50k - $70k",
    type: "Part-time",
    category: "Writing",
    description: "Create engaging content for technology blogs and websites. SEO knowledge a plus.",
    tags: ["Writing", "SEO", "Editing"],
    postedDate: "5 days ago"
  },
  {
    id: 4,
    title: "Full Stack Developer",
    company: "Startup.io",
    location: "San Francisco, USA",
    salary: "$100k - $140k",
    type: "Full-time",
    category: "Development",
    description: "Build and maintain our core product features. Experience with Node.js and React required.",
    tags: ["Node.js", "React", "MongoDB"],
    postedDate: "1 week ago"
  },
  {
    id: 5,
    title: "Marketing Specialist",
    company: "GrowthHackers",
    location: "Remote",
    salary: "$60k - $85k",
    type: "Full-time",
    category: "Marketing",
    description: "Lead our digital marketing efforts including social media, SEO, and content marketing.",
    tags: ["Digital Marketing", "Social Media", "SEO"],
    postedDate: "1 week ago"
  },
  {
    id: 6,
    title: "Data Scientist",
    company: "DataDriven Tech",
    location: "Boston, USA",
    salary: "$90k - $130k",
    type: "Full-time",
    category: "Data Science",
    description: "Analyze complex data sets and develop machine learning models for our predictive analytics platform.",
    tags: ["Python", "Machine Learning", "Statistics"],
    postedDate: "2 weeks ago"
  },
  {
    id: 7,
    title: "Product Manager",
    company: "InnovateCorp",
    location: "Remote",
    salary: "$95k - $125k",
    type: "Full-time",
    category: "Product",
    description: "Lead product development cycles from conception to launch. Work closely with design and engineering teams.",
    tags: ["Product Strategy", "Agile", "User Experience"],
    postedDate: "2 weeks ago"
  },
  {
    id: 8,
    title: "JavaScript Developer",
    company: "WebTech Solutions",
    location: "Berlin, Germany",
    salary: "€50k - €70k",
    type: "Contract",
    category: "Development",
    description: "Develop responsive web applications using modern JavaScript frameworks.",
    tags: ["JavaScript", "Vue.js", "CSS"],
    postedDate: "3 weeks ago"
  }
];

const Jobs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Get all unique tags
  const allTags = Array.from(
    new Set(
      allJobs.flatMap(job => job.tags)
    )
  );

  // Filter jobs
  const filteredJobs = allJobs.filter(job => {
    // Search filter
    const matchesSearch = 
      searchTerm === "" || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Type filter
    const matchesType = 
      selectedType === "" || 
      job.type === selectedType;
    
    // Category filter
    const matchesCategory = 
      selectedCategory === "" || 
      job.category === selectedCategory;
    
    // Tags filter
    const matchesTags = 
      selectedTags.length === 0 || 
      selectedTags.some(tag => job.tags.includes(tag));
    
    return matchesSearch && matchesType && matchesCategory && matchesTags;
  });

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="w-full py-12 md:py-20 border-b border-white/5">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Find Your Next Job</h1>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                Browse through the latest opportunities matching your skills and interests
              </p>
            </div>
            
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs by title, company, or keywords..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2 md:flex md:w-auto">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="min-w-[150px]">
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="min-w-[150px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="Development">Development</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Writing">Writing</SelectItem>
                    <SelectItem value="Data Science">Data Science</SelectItem>
                    <SelectItem value="Product">Product</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </Button>
                
                {(selectedType || selectedCategory || selectedTags.length > 0) && (
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-2"
                    onClick={() => {
                      setSelectedType("");
                      setSelectedCategory("");
                      setSelectedTags([]);
                      setSearchTerm("");
                    }}
                  >
                    <X className="h-4 w-4" />
                    <span>Clear</span>
                  </Button>
                )}
              </div>
            </div>
            
            {showFilters && (
              <div className="mt-4 p-4 rounded-lg glass-card animate-fade-in">
                <h3 className="font-medium mb-3">Filter by skills</h3>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <div 
                      key={tag} 
                      className="flex items-center space-x-2"
                    >
                      <Checkbox 
                        id={`tag-${tag}`} 
                        checked={selectedTags.includes(tag)}
                        onCheckedChange={() => toggleTag(tag)}
                      />
                      <Label 
                        htmlFor={`tag-${tag}`}
                        className="text-sm cursor-pointer"
                      >
                        {tag}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-6">
                {filteredJobs.length} 
                {filteredJobs.length === 1 ? ' Job' : ' Jobs'} Found
              </h2>
              
              <div className="space-y-4">
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job, index) => (
                    <AnimatedCard
                      key={job.id}
                      className="hover-shadow"
                      delay={`${index * 0.05}s`}
                    >
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg">{job.title}</h3>
                          <p className="text-muted-foreground">{job.company}</p>
                          
                          <div className="flex flex-wrap gap-2 mt-2">
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
                          
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
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
                          <Button>Apply Now</Button>
                        </div>
                      </div>
                    </AnimatedCard>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No jobs match your filters. Try adjusting your search criteria.</p>
                  </div>
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

export default Jobs;
