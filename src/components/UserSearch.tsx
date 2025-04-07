
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ProfileData } from '@/types/profile';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

interface UserSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserSearch({ isOpen, onClose }: UserSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && searchQuery.length > 1) {
      searchUsers();
    }
  }, [searchQuery, isOpen]);

  const searchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`full_name.ilike.%${searchQuery}%,title.ilike.%${searchQuery}%,company_name.ilike.%${searchQuery}%`)
        .limit(10);

      if (error) {
        throw error;
      }

      setUsers(data as ProfileData[]);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to search users. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (userId: string) => {
    navigate(`/messages/${userId}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Find someone to message</DialogTitle>
        </DialogHeader>
        
        <div className="relative">
          <Input
            placeholder="Search by name, title, or company..."
            className="pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery ? (
            <X 
              className="absolute right-2 top-2 h-4 w-4 cursor-pointer text-muted-foreground" 
              onClick={() => setSearchQuery('')}
            />
          ) : (
            <Search className="absolute right-2 top-2 h-4 w-4 text-muted-foreground" />
          )}
        </div>
        
        <div className="mt-2 max-h-72 overflow-y-auto space-y-1">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
          ) : users.length > 0 ? (
            users.map((user) => (
              <Button
                key={user.id}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleUserClick(user.id)}
              >
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={user.avatar_url || undefined} alt={user.full_name} />
                  <AvatarFallback>{user.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <div className="font-medium">{user.full_name}</div>
                  <div className="text-xs text-muted-foreground truncate max-w-xs">
                    {user.title || user.company_name || user.user_type}
                  </div>
                </div>
              </Button>
            ))
          ) : searchQuery.length > 1 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No users found</div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Type to search for users
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
