
import { useState } from "react";
import { SendIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Button from "./Button";
import { useToast } from "@/hooks/use-toast";

const ContactSection = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call with setTimeout
    setTimeout(() => {
      toast({
        title: "Message sent!",
        description: "Thank you for reaching out. We'll get back to you soon."
      });
      
      // Reset form
      setName("");
      setEmail("");
      setMessage("");
      setLoading(false);
    }, 1000);
  };

  return (
    <section id="contact" className="w-full py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="inline-block rounded-lg bg-navy-accent/10 px-3 py-1 text-sm backdrop-blur-md border border-navy-accent/30">
              Get In Touch
            </div>
            
            <h2 className="text-3xl font-bold tracking-tighter">
              <span className="text-gradient">Have a Question? </span> 
              <span className="neon-text">Contact Us</span>
            </h2>
            
            <p className="text-muted-foreground">
              We're here to help freelancers and businesses connect and succeed. 
              Whether you have a question about our platform or need assistance, reach out to us.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center bg-navy-accent/10 border border-navy-accent/30">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-navy-accent">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-sm">Phone</p>
                  <p className="text-muted-foreground text-sm">+1 (555) 123-4567</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center bg-navy-accent/10 border border-navy-accent/30">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-navy-accent">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-sm">Email</p>
                  <p className="text-muted-foreground text-sm">support@freelancerhub.com</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center bg-navy-accent/10 border border-navy-accent/30">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-navy-accent">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-sm">Address</p>
                  <p className="text-muted-foreground text-sm">123 Freelancer St, San Francisco, CA 94107</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Name</label>
                <Input 
                  id="name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-navy-light border-navy-accent/30 focus-visible:ring-navy-accent"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input 
                  id="email" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-navy-light border-navy-accent/30 focus-visible:ring-navy-accent"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">Message</label>
                <Textarea 
                  id="message" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-navy-light border-navy-accent/30 focus-visible:ring-navy-accent min-h-[120px]"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full group bg-navy-accent text-navy hover:bg-navy-accent/90"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Message"}
                <SendIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
