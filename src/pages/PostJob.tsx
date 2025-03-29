
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import Button from "@/components/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Plus, X } from "lucide-react";

const PostJob = () => {
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [salary, setSalary] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAddSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!jobTitle || !company || !location || !jobType || !salary || !description || !category || skills.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to post a job",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Insert job into database
      const { data, error } = await supabase
        .from('jobs')
        .insert({
          title: jobTitle,
          company: company,
          location: location,
          job_type: jobType,
          salary: salary,
          description: description,
          category: category,
          skills: skills,
          recruiter_id: user.id,
          status: 'active'
        })
        .select();
        
      if (error) {
        console.error("Error posting job:", error);
        throw error;
      }
      
      // Success
      toast({
        title: "Job Posted",
        description: "Your job has been posted successfully"
      });
      
      // Reset form
      setJobTitle("");
      setCompany("");
      setLocation("");
      setJobType("");
      setSalary("");
      setDescription("");
      setCategory("");
      setSkills([]);
      
      // Redirect to jobs page
      navigate('/jobs');
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post job. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="w-full py-12 md:py-20 border-b border-white/5">
          <div className="container px-4 md:px-6 max-w-3xl">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Post a Job</h1>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                Find the perfect freelancer for your project
              </p>
            </div>
            
            <div className="glass-card p-6 md:p-8 animate-fade-up">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="job-title">Job Title</Label>
                    <Input 
                      id="job-title" 
                      placeholder="e.g. Senior React Developer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="bg-background/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input 
                      id="company" 
                      placeholder="e.g. Your Company Inc."
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="bg-background/50"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        id="location" 
                        placeholder="e.g. Remote, New York, etc."
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="bg-background/50"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="job-type">Job Type</Label>
                      <Select value={jobType} onValueChange={setJobType}>
                        <SelectTrigger id="job-type" className="bg-background/50">
                          <SelectValue placeholder="Select job type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Full-time">Full-time</SelectItem>
                          <SelectItem value="Part-time">Part-time</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                          <SelectItem value="Freelance">Freelance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="salary">Salary Range</Label>
                      <Input 
                        id="salary" 
                        placeholder="e.g. $70k - $90k"
                        value={salary}
                        onChange={(e) => setSalary(e.target.value)}
                        className="bg-background/50"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger id="category" className="bg-background/50">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Development">Development</SelectItem>
                          <SelectItem value="Design">Design</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Writing">Writing</SelectItem>
                          <SelectItem value="Data Science">Data Science</SelectItem>
                          <SelectItem value="Product">Product</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Job Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Describe the role and responsibilities..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-[150px] bg-background/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="skills">Required Skills</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="skills" 
                        placeholder="e.g. React"
                        value={currentSkill}
                        onChange={(e) => setCurrentSkill(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSkill();
                          }
                        }}
                        className="bg-background/50"
                      />
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={handleAddSkill}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {skills.map((skill) => (
                          <div 
                            key={skill} 
                            className="inline-flex items-center justify-between rounded-md bg-white/5 px-2.5 py-0.5 text-sm"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              className="ml-2 hover:text-red-400"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full group"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Posting..." : "Post Job"}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <FooterSection />
    </div>
  );
};

export default PostJob;
