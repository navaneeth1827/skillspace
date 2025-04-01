
import NotificationsDropdown from './NotificationsDropdown';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import { MessageSquareIcon } from 'lucide-react';

export const NavbarExtensions = () => {
  return (
    <div className="flex items-center gap-2">
      <Link to="/messages">
        <Button variant="ghost" size="icon" className="relative" aria-label="Messages">
          <MessageSquareIcon className="h-5 w-5" />
        </Button>
      </Link>
      <NotificationsDropdown />
    </div>
  );
};
