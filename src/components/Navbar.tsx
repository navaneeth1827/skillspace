import { useState } from "react";
import { Link } from "react-router-dom";
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
import { LogOut } from "lucide-react";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      navigate('/sign-in');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="bg-background/10 backdrop-blur-md sticky top-0 z-50 w-full border-b border-white/5">
      <div className="container flex items-center justify-between py-4">
        <Link to="/" className="font-bold text-xl">
          Freelance Platform
        </Link>

        <div className="hidden md:flex items-center space-x-4">
          <Link to="/jobs" className="hover:text-muted-foreground">
            Find Jobs
          </Link>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.full_name} />
                    <AvatarFallback>{user?.user_metadata?.full_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={`/profile/${user.id}`}>Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/my-jobs">My Jobs</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  Sign Out
                  <LogOut className="ml-auto h-4 w-4" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/sign-in" className="hover:text-muted-foreground">
                Sign In
              </Link>
              <Link to="/sign-up" className="primary-button">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Button variant="outline" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
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
            <div className="absolute top-full right-0 mt-2 py-2 w-48 bg-background/95 backdrop-blur-md rounded-md shadow-md border border-white/5 flex flex-col items-start z-50">
              <Link to="/jobs" className="block w-full px-4 py-2 text-sm hover:bg-secondary hover:text-white">
                Find Jobs
              </Link>
              {user ? (
                <>
                  <Link to={`/profile/${user.id}`} className="block w-full px-4 py-2 text-sm hover:bg-secondary hover:text-white">
                    Profile
                  </Link>
                  <Link to="/my-jobs" className="block w-full px-4 py-2 text-sm hover:bg-secondary hover:text-white">My Jobs</Link>
                  <button onClick={handleSignOut} className="flex items-center w-full px-4 py-2 text-sm hover:bg-secondary hover:text-white">
                    Sign Out
                    <LogOut className="ml-auto h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <Link to="/sign-in" className="block w-full px-4 py-2 text-sm hover:bg-secondary hover:text-white">
                    Sign In
                  </Link>
                  <Link to="/sign-up" className="block w-full px-4 py-2 text-sm hover:bg-secondary hover:text-white">
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
