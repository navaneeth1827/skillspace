
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChatButtonProps {
  userId: string;
  className?: string;
  buttonText?: string;
}

const ChatButton = ({ userId, className, buttonText = "Message" }: ChatButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleClick = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to send messages",
        variant: "destructive"
      });
      navigate('/sign-in', { state: { from: window.location.pathname } });
      return;
    }

    setIsNavigating(true);
    navigate(`/messages/${userId}`);
  };

  return (
    <Button 
      onClick={handleClick} 
      className={className} 
      variant="outline"
      disabled={isNavigating}
    >
      <MessageSquare className="h-4 w-4 mr-2" />
      {buttonText}
    </Button>
  );
};

export default ChatButton;
