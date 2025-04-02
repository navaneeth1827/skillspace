
import NotificationsDropdown from './NotificationsDropdown';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import { BriefcaseIcon, MessageSquareIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const NavbarExtensions = () => {
  const { user } = useAuth();
  const isRecruiter = user?.user_metadata?.user_type === 'recruiter';

  return (
    <div className="flex items-center gap-2">
      {isRecruiter && (
        <Link to="/applications">
          <Button variant="ghost" size="icon" className="relative" aria-label="Applications">
            <BriefcaseIcon className="h-5 w-5" />
          </Button>
        </Link>
      )}
      <Link to="/messages">
        <Button variant="ghost" size="icon" className="relative" aria-label="Messages">
          <MessageSquareIcon className="h-5 w-5" />
        </Button>
      </Link>
      <NotificationsDropdown />
    </div>
  );
};
