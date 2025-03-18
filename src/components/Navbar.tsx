
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Button from "./Button";
import AuthModal from "./AuthModal";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const navLinks = [
    { text: "Home", href: "/" },
    { text: "Find a Job", href: "/find-job" },
    { text: "Post a Job", href: "/post-job" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-white/10 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between">
          <Link 
            to="/" 
            className="text-xl font-bold flex items-center gap-2 text-gradient"
            onClick={closeMenu}
          >
            <span>Freelancer Hub</span>
            <span className="text-primary">Nexus</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "text-sm transition-colors hover:text-primary",
                  location.pathname === link.href ? "text-primary" : "text-muted-foreground"
                )}
              >
                {link.text}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Button 
              variant="ghost" 
              onClick={() => setIsAuthModalOpen(true)}
            >
              Login
            </Button>
            <Button onClick={() => setIsAuthModalOpen(true)}>
              Sign Up
            </Button>
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
                    "text-lg transition-colors hover:text-primary",
                    location.pathname === link.href ? "text-primary" : "text-muted-foreground"
                  )}
                  onClick={closeMenu}
                >
                  {link.text}
                </Link>
              ))}
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
