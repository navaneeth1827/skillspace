
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Calendar, Menu, MessageSquare, Settings, X, ListTodo, Users, User, LogOut } from "lucide-react";
import Button from "./Button";
import AuthModal from "./AuthModal";
import UserMenu from "./UserMenu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

// Define interface for navigation links that includes the optional icon property
interface NavLink {
  text: string;
  href: string;
  icon?: React.ReactNode;
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  // Routes that are accessible to both logged-in and non-logged-in users
  const publicNavLinks: NavLink[] = [
    { text: "Home", href: "/" },
  ];

  // Routes that are accessible only to logged-in users
  const privateNavLinks: NavLink[] = [
    { text: "Find a Job", href: "/find-job" },
    { text: "Post a Job", href: "/post-job" },
    { text: "Community", href: "/community", icon: <Users size={18} /> },
    { text: "Calendar", href: "/calendar", icon: <Calendar size={18} /> },
    { text: "Tasks", href: "/tasks", icon: <ListTodo size={18} /> },
  ];

  // Display different navigation links based on auth status
  const navLinks = user ? [...publicNavLinks, ...privateNavLinks] : publicNavLinks;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    closeMenu();
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-white/10 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between">
          <Link 
            to="/" 
            className="text-xl font-bold flex items-center gap-2 text-gradient"
            onClick={closeMenu}
          >
            <span>Skill</span>
            <span className="text-primary">Space</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "text-sm transition-colors hover:text-primary flex items-center gap-1.5",
                  location.pathname === link.href ? "text-primary" : "text-muted-foreground"
                )}
              >
                {link.icon && link.icon}
                {link.text}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons and Settings */}
          <div className="hidden md:flex items-center gap-4">
            {user && (
              <Link 
                to="/settings"
                className={cn(
                  "text-sm transition-colors hover:text-primary",
                  location.pathname === "/settings" ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Settings size={20} />
              </Link>
            )}
            
            {user ? (
              <UserMenu />
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  Login
                </Button>
                <Button onClick={() => setIsAuthModalOpen(true)}>
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="flex md:hidden p-2"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="fixed inset-0 top-16 z-40 w-full animate-fade-in bg-background/95 backdrop-blur-sm md:hidden">
            <nav className="container flex flex-col gap-6 p-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "text-lg transition-colors hover:text-primary flex items-center gap-2",
                    location.pathname === link.href ? "text-primary" : "text-muted-foreground"
                  )}
                  onClick={closeMenu}
                >
                  {link.icon && link.icon}
                  {link.text}
                </Link>
              ))}
              
              {user && (
                <Link
                  to="/settings"
                  className={cn(
                    "text-lg transition-colors hover:text-primary flex items-center gap-2",
                    location.pathname === "/settings" ? "text-primary" : "text-muted-foreground"
                  )}
                  onClick={closeMenu}
                >
                  <Settings size={18} />
                  Settings
                </Link>
              )}
              
              {user ? (
                <div className="flex flex-col gap-4 mt-4">
                  <Link
                    to="/profile"
                    className="text-lg transition-colors hover:text-primary flex items-center gap-2"
                    onClick={closeMenu}
                  >
                    <User size={18} />
                    Profile
                  </Link>
                  <Button 
                    variant="outline" 
                    onClick={handleSignOut}
                    className="w-full"
                  >
                    <LogOut size={18} className="mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-4 mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsAuthModalOpen(true);
                      closeMenu();
                    }}
                    className="w-full"
                  >
                    Login
                  </Button>
                  <Button 
                    onClick={() => {
                      setIsAuthModalOpen(true);
                      closeMenu();
                    }}
                    className="w-full"
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
};

export default Navbar;
