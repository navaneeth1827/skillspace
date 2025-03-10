
import { Github, Linkedin, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const FooterSection = () => {
  return (
    <footer className="w-full border-t border-white/10 py-10">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <Link to="/" className="text-xl font-bold flex items-center gap-2">
              <span className="text-gradient">Freelancer Hub</span>
              <span className="text-primary">Nexus</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              The premium marketplace connecting exceptional freelancers and forward-thinking clients.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">For Freelancers</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/jobs" className="hover:text-primary transition-colors">
                  Find Jobs
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Create Profile
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Payment Info
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Success Stories
                </a>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">For Clients</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/post-job" className="hover:text-primary transition-colors">
                  Post a Job
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Find Freelancers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Enterprise Solutions
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Success Stories
                </a>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Community
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Freelancer Hub Nexus. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
