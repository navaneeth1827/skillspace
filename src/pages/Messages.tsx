import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useChat, Message } from '@/hooks/useChat';
import Navbar from '@/components/Navbar';
import ChatMessage from '@/components/ChatMessage';
import UserSearch from '@/components/UserSearch';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProfileData } from '@/types/profile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, Send, ChevronLeft, Search, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const Messages = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [message, setMessage] = useState('');
  const [contacts, setContacts] = useState<ProfileData[]>([]);
  const [selectedContact, setSelectedContact] = useState<ProfileData | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showContacts, setShowContacts] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, loading, sendMessage } = useChat(userId || null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowContacts(true);
      } else if (userId) {
        setShowContacts(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [userId]);

  useEffect(() => {
    if (isMobileView && userId) {
      setShowContacts(false);
    }
  }, [userId, isMobileView]);

  useEffect(() => {
    const fetchContacts = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('sender_id, receiver_id')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

        if (error) {
          throw error;
        }

        if (data) {
          const contactIds = new Set<string>();
          
          data.forEach(msg => {
            if (msg.sender_id === user.id) {
              contactIds.add(msg.receiver_id);
            } else {
              contactIds.add(msg.sender_id);
            }
          });

          if (contactIds.size === 0) {
            return;
          }

          const contactsData = await Promise.all(
            Array.from(contactIds).map(async (id) => {
              const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', id)
                .single();
              
              return data as ProfileData;
            })
          );

          setContacts(contactsData.filter(Boolean));
        }
      } catch (error) {
        console.error('Error fetching contacts:', error);
        toast({
          title: 'Error',
          description: 'Failed to load contacts',
          variant: 'destructive'
        });
      }
    };

    fetchContacts();

    if (user) {
      const channel = supabase
        .channel('contacts_channel')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `or(sender_id=eq.${user.id},receiver_id=eq.${user.id})`
        }, () => {
          fetchContacts();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, toast]);

  useEffect(() => {
    const fetchSelectedContact = async () => {
      if (!userId || !user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          throw error;
        }

        setSelectedContact(data as ProfileData);
      } catch (error) {
        console.error('Error fetching selected contact:', error);
        toast({
          title: 'Error',
          description: 'Failed to load contact information',
          variant: 'destructive'
        });
      }
    };

    fetchSelectedContact();
  }, [userId, user, toast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId || !message.trim()) return;

    const sentMessage = await sendMessage(message.trim());
    
    if (sentMessage) {
      setMessage('');
    }
  };

  if (!user) {
    return (
      <div>
        <Navbar />
        <div className="container py-8 pt-44">
          <h1 className="text-2xl font-bold mb-6">Messages</h1>
          <p>Please sign in to view your messages.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container py-8 pt-44">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Messages</h1>
          <Button onClick={() => setIsSearchOpen(true)} variant="outline" size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            New Message
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {showContacts && (
            <div className="col-span-1 border rounded-lg overflow-hidden shadow-sm">
              <div className="bg-muted p-4">
                <h2 className="font-medium">Contacts</h2>
              </div>
              <div className="p-2 h-[500px] overflow-y-auto">
                {contacts.length === 0 && (
                  <div className="text-center p-4 text-muted-foreground">
                    <MessageSquare className="mx-auto h-8 w-8 mb-2" />
                    <p>No conversations yet</p>
                    <Button 
                      variant="link" 
                      onClick={() => setIsSearchOpen(true)}
                      className="mt-2"
                    >
                      Start a new conversation
                    </Button>
                  </div>
                )}
                {contacts.map(contact => (
                  <Button
                    key={contact.id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start mb-1",
                      userId === contact.id && "bg-accent"
                    )}
                    onClick={() => {
                      navigate(`/messages/${contact.id}`);
                      if (isMobileView) {
                        setShowContacts(false);
                      }
                    }}
                  >
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={contact.avatar_url || undefined} alt={contact.full_name} />
                      <AvatarFallback>
                        {contact.full_name?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left truncate">
                      <div>{contact.full_name}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className={`${showContacts && !isMobileView ? 'col-span-3' : 'col-span-4'}`}>
            {userId ? (
              <div className="border rounded-lg shadow-sm h-[600px] flex flex-col">
                <div className="border-b p-4 flex items-center">
                  {isMobileView && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="mr-2"
                      onClick={() => setShowContacts(true)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  )}
                  {selectedContact && (
                    <>
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage 
                          src={selectedContact.avatar_url || undefined} 
                          alt={selectedContact.full_name} 
                        />
                        <AvatarFallback>
                          {selectedContact.full_name?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{selectedContact.full_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {selectedContact.title || selectedContact.user_type}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex-grow p-4 overflow-y-auto">
                  {loading ? (
                    <div className="text-center p-4">Loading messages...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center p-4 text-muted-foreground">
                      <p>No messages yet</p>
                      <p className="text-sm">Send a message to start the conversation</p>
                    </div>
                  ) : (
                    messages.map((msg: Message) => (
                      <ChatMessage
                        key={msg.id}
                        message={msg}
                        isOwnMessage={msg.sender_id === user.id}
                      />
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="border-t p-4 flex">
                  <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-grow mr-2"
                  />
                  <Button type="submit" disabled={!message.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            ) : (
              <div className="border rounded-lg h-[600px] flex items-center justify-center">
                <div className="text-center p-4">
                  <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">Select a conversation</h3>
                  <p className="text-muted-foreground mb-4">
                    Choose a contact from the sidebar or start a new conversation
                  </p>
                  <Button onClick={() => setIsSearchOpen(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    New Message
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <UserSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};

export default Messages;
