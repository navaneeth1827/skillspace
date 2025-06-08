
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import UserMenu from './UserMenu';
import NotificationsDropdown from './NotificationsDropdown';
import SkillSpaceLogo from './SkillSpaceLogo';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isRecruiter = user?.user_metadata?.user_type === 'recruiter';

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <SkillSpaceLogo />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/jobs">
              <Button variant="ghost">Jobs</Button>
            </Link>
            {user && (
              <>
                <Link to="/my-jobs">
                  <Button variant="ghost">My Jobs</Button>
                </Link>
                {isRecruiter && (
                  <>
                    <Link to="/applications">
                      <Button variant="ghost">Applications</Button>
                    </Link>
                    <Link to="/post-job">
                      <Button variant="ghost">Post Job</Button>
                    </Link>
                  </>
                )}
                <Link to="/tasks">
                  <Button variant="ghost">Tasks</Button>
                </Link>
                <Link to="/calendar">
                  <Button variant="ghost">Calendar</Button>
                </Link>
                <Link to="/messages">
                  <Button variant="ghost">Messages</Button>
                </Link>
                <NotificationsDropdown />
                <UserMenu />
              </>
            )}
            {!user && (
              <div className="flex items-center space-x-2">
                <Link to="/signin">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            {user && <NotificationsDropdown />}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="ml-2"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-border">
              <Link to="/jobs" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">Jobs</Button>
              </Link>
              {user && (
                <>
                  <Link to="/my-jobs" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">My Jobs</Button>
                  </Link>
                  {isRecruiter && (
                    <>
                      <Link to="/applications" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">Applications</Button>
                      </Link>
                      <Link to="/post-job" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">Post Job</Button>
                      </Link>
                    </>
                  )}
                  <Link to="/tasks" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">Tasks</Button>
                  </Link>
                  <Link to="/calendar" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">Calendar</Button>
                  </Link>
                  <Link to="/messages" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">Messages</Button>
                  </Link>
                  <div className="pt-2 border-t border-border">
                    <UserMenu />
                  </div>
                </>
              )}
              {!user && (
                <div className="space-y-1">
                  <Link to="/signin" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">Sign In</Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full justify-start">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
