
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import Button from "./Button";
import { useToast } from "@/hooks/use-toast";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isFreelancer, setIsFreelancer] = useState(true);
  const [signupStep, setSignupStep] = useState(1);
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Login successful",
      description: "Welcome back to Nexus!"
    });
    onClose();
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupStep(2);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Account created",
      description: "Welcome to Freelancer Hub Nexus!"
    });
    onClose();
    // Reset the state for next time
    setSignupStep(1);
  };

  const handleCloseModal = () => {
    setSignupStep(1); // Reset step when closing
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="sm:max-w-[425px] backdrop-blur-xl bg-navy-light border border-white/10">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">Welcome to Nexus</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@example.com" 
                  className="bg-navy/50 border-navy-accent/30 focus-visible:ring-navy-accent"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="bg-navy/50 border-navy-accent/30 focus-visible:ring-navy-accent"
                  required
                />
              </div>
              
              <Button type="submit" className="w-full bg-navy-accent text-navy hover:bg-navy-accent/90">
                Login
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            {signupStep === 1 ? (
              <form onSubmit={handleNextStep} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe" 
                    className="bg-navy/50 border-navy-accent/30 focus-visible:ring-navy-accent"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email-signup">Email</Label>
                  <Input 
                    id="email-signup" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@example.com" 
                    className="bg-navy/50 border-navy-accent/30 focus-visible:ring-navy-accent"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password-signup">Password</Label>
                  <Input 
                    id="password-signup" 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="bg-navy/50 border-navy-accent/30 focus-visible:ring-navy-accent"
                    required
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="freelancer" 
                    checked={isFreelancer}
                    onCheckedChange={(checked) => 
                      setIsFreelancer(checked as boolean)
                    }
                  />
                  <Label htmlFor="freelancer">I am a freelancer</Label>
                </div>
                
                <Button type="submit" className="w-full bg-navy-accent text-navy hover:bg-navy-accent/90">
                  {isFreelancer ? "Next: Profile Details" : "Create Account"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="skills">Skills (comma separated)</Label>
                  <Input 
                    id="skills" 
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="JavaScript, React, UI Design" 
                    className="bg-navy/50 border-navy-accent/30 focus-visible:ring-navy-accent"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input 
                    id="experience" 
                    type="number"
                    min="0"
                    max="50" 
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="5" 
                    className="bg-navy/50 border-navy-accent/30 focus-visible:ring-navy-accent"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Short Bio</Label>
                  <Textarea 
                    id="bio" 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell clients about yourself and your expertise..." 
                    className="bg-navy/50 border-navy-accent/30 focus-visible:ring-navy-accent resize-none min-h-[80px]"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                  <Input 
                    id="hourlyRate" 
                    type="number"
                    min="1"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    placeholder="50" 
                    className="bg-navy/50 border-navy-accent/30 focus-visible:ring-navy-accent"
                    required
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline"
                    className="flex-1 border-navy-accent/30 hover:bg-navy-accent/10"
                    onClick={() => setSignupStep(1)}
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-navy-accent text-navy hover:bg-navy-accent/90"
                  >
                    Create Account
                  </Button>
                </div>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
