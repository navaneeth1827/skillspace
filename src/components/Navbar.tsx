
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LogOut, MessageSquare, Calendar, Users, Home, Briefcase, UserPlus, LogIn, PlusCircle, CheckSquare } from "lucide-react";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Determine if we're on the landing page
  const isLandingPage = location.pathname === "/";

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-4xl bg-background/20 backdrop-blur-lg rounded-full border border-white/10 shadow-lg mb-16">
      <div className="container mx-auto flex items-center justify-between px-6 py-3">
        <Link to="/" className="font-bold text-xl text-gradient">
          SkillSpace
        </Link>

        <div className="hidden md:flex items-center space-x-4">
          {!isLandingPage && user ? (
            <>
              <Link to="/dashboard" className="px-2 text-sm hover:text-primary transition-colors">
                <Home className="inline h-4 w-4 mr-1" />
                Dashboard
              </Link>
              <Link to="/jobs" className="px-2 text-sm hover:text-primary transition-colors">
                <Briefcase className="inline h-4 w-4 mr-1" />
                Find Jobs
              </Link>
              <Link to="/community" className="px-2 text-sm hover:text-primary transition-colors">
                <Users className="inline h-4 w-4 mr-1" />
                Community
              </Link>
              <Link to="/calendar" className="px-2 text-sm hover:text-primary transition-colors">
                <Calendar className="inline h-4 w-4 mr-1" />
                Calendar
              </Link>
              <Link to="/tasks" className="px-2 text-sm hover:text-primary transition-colors">
                <CheckSquare className="inline h-4 w-4 mr-1" />
                Tasks
              </Link>
            </>
          ) : null}
          
          {user ? (
            <>
              <Link to="/messages" className="px-2 text-sm hover:text-primary transition-colors">
                <MessageSquare className="inline h-4 w-4 mr-1" />
                Messages
              </Link>
              <Link to="/post-job" className="px-2 text-sm hover:text-primary transition-colors">
                <PlusCircle className="inline h-4 w-4 mr-1" />
                Post Job
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 rounded-full ml-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.full_name} />
                      <AvatarFallback>{user?.user_metadata?.full_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 glass-card" align="end" forceMount>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={`/profile/${user.id}`}>Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-jobs">My Jobs</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/post-job">Post a Job</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    Sign Out
                    <LogOut className="ml-auto h-4 w-4" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/sign-in" className="px-2 text-sm hover:text-primary transition-colors">
                <LogIn className="inline h-4 w-4 mr-1" />
                Sign In
              </Link>
              <Link to="/sign-up" className="neon-button px-4 py-2 text-sm flex items-center ml-2">
                <UserPlus className="h-4 w-4 mr-1" />
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Button variant="outline" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} className="rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            <span className="sr-only">Toggle Menu</span>
          </Button>

          {isMenuOpen && (
            <div className="absolute top-full right-0 mt-2 py-2 w-48 glass-card rounded-2xl shadow-lg border border-white/10 flex flex-col items-start z-50">
              {!isLandingPage && user ? (
                <>
                  <Link to="/dashboard" className="block w-full px-4 py-2 text-sm hover:bg-white/5 hover:text-primary rounded-lg">
                    Dashboard
                  </Link>
                  <Link to="/jobs" className="block w-full px-4 py-2 text-sm hover:bg-white/5 hover:text-primary rounded-lg">
                    Find Jobs
                  </Link>
                  <Link to="/community" className="block w-full px-4 py-2 text-sm hover:bg-white/5 hover:text-primary rounded-lg">
                    Community
                  </Link>
                  <Link to="/calendar" className="block w-full px-4 py-2 text-sm hover:bg-white/5 hover:text-primary rounded-lg">
                    Calendar
                  </Link>
                  <Link to="/tasks" className="block w-full px-4 py-2 text-sm hover:bg-white/5 hover:text-primary rounded-lg">
                    Tasks
                  </Link>
                </>
              ) : null}
              
              {user ? (
                <>
                  <Link to="/messages" className="block w-full px-4 py-2 text-sm hover:bg-white/5 hover:text-primary rounded-lg">
                    Messages
                  </Link>
                  <Link to="/post-job" className="block w-full px-4 py-2 text-sm hover:bg-white/5 hover:text-primary rounded-lg">
                    Post Job
                  </Link>
                  <Link to={`/profile/${user.id}`} className="block w-full px-4 py-2 text-sm hover:bg-white/5 hover:text-primary rounded-lg">
                    Profile
                  </Link>
                  <Link to="/my-jobs" className="block w-full px-4 py-2 text-sm hover:bg-white/5 hover:text-primary rounded-lg">My Jobs</Link>
                  <button onClick={handleSignOut} className="flex items-center w-full px-4 py-2 text-sm hover:bg-white/5 hover:text-primary rounded-lg">
                    Sign Out
                    <LogOut className="ml-auto h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <Link to="/sign-in" className="block w-full px-4 py-2 text-sm hover:bg-white/5 hover:text-primary rounded-lg">
                    Sign In
                  </Link>
                  <Link to="/sign-up" className="block w-full px-4 py-2 text-sm hover:bg-white/5 hover:text-primary rounded-lg">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
