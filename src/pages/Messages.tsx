import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ProfileData } from "@/types/profile";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; 
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { parseSkills } from "@/types/profile";
import { v4 as uuidv4 } from "uuid";

const Messages = () => {
  const { user } = useAuth();
  const [userProfiles, setUserProfiles] = useState<ProfileData[]>([]);
  const [currentChatUser, setCurrentChatUser] = useState<ProfileData | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase.from('profiles').select('*').neq('id', user.id).order('full_name', {
          ascending: true
        });
        if (error) {
          console.error('Error fetching profiles:', error);
          toast({
            title: "Error",
            description: "Failed to load user profiles",
            variant: "destructive"
          });
          return;
        }
        if (data) {
          const formattedProfiles = data.map((profile) => {
            return {
              id: profile.id,
              full_name: profile.full_name || "",
              title: profile.title || "",
              location: profile.location || "",
              bio: profile.bio || "",
              hourly_rate: profile.hourly_rate || 0,
              skills: parseSkills(profile.skills),
              avatar_url: profile.avatar_url,
              user_type: profile.user_type || "freelancer",
              company_name: profile.company_name,
              website: profile.website,
              created_at: profile.created_at,
              updated_at: profile.updated_at
            };
          });
          
          const combinedProfiles = [...formattedProfiles];
          if (currentChatUser && !combinedProfiles.some(p => p.id === currentChatUser.id)) {
            combinedProfiles.push(currentChatUser);
          }
          
          setUserProfiles(combinedProfiles);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    const fetchMessages = async () => {
      if (!user || !currentChatUser) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${currentChatUser.id}),and(sender_id.eq.${currentChatUser.id},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: true });
        
        if (error) {
          console.error('Error fetching messages:', error);
          toast({
            title: "Error",
            description: "Failed to load messages",
            variant: "destructive",
          });
          return;
        }
        
        if (data) {
          setMessages(data);
          
          const unreadMessages = data.filter(msg => msg.receiver_id === user.id && !msg.read);
          if (unreadMessages.length > 0) {
            const messageIds = unreadMessages.map(msg => msg.id);
            const { error: updateError } = await supabase
              .from('chat_messages')
              .update({ read: true })
              .in('id', messageIds);
              
            if (updateError) {
              console.error('Error marking messages as read:', updateError);
            }
          }
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfiles();
    
    if (currentChatUser) {
      fetchMessages();
    }
    
    const channel = supabase
      .channel('public:chat_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `or(and(sender_id.eq.${user?.id},receiver_id.eq.${currentChatUser?.id}),and(sender_id.eq.${currentChatUser?.id},receiver_id.eq.${user?.id}))`
      }, (payload) => {
        if (payload.new) {
          setMessages(prevMessages => [...prevMessages, payload.new]);
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, currentChatUser, toast]);

  const handleSendMessage = async () => {
    if (!user || !currentChatUser || !newMessage.trim()) return;
    
    try {
      const messageId = uuidv4();
      
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          id: messageId,
          sender_id: user.id,
          receiver_id: currentChatUser.id,
          content: newMessage.trim(),
          read: false
        });
        
      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive",
        });
        return;
      }
      
      setNewMessage("");
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="w-full py-12 md:py-20 border-b border-white/5">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-1">
                <h2 className="text-2xl font-bold tracking-tighter mb-4">Messages</h2>
                <div className="relative mb-4">
                  <Input
                    placeholder="Search users..."
                    className="pl-10"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <ScrollArea className="h-[400px] rounded-md">
                  <div className="space-y-2">
                    {userProfiles.map((profile) => (
                      <Button
                        key={profile.id}
                        variant="ghost"
                        className={`w-full justify-start rounded-md ${currentChatUser?.id === profile.id ? 'bg-secondary hover:bg-secondary' : 'hover:bg-secondary/5'}`}
                        onClick={() => setCurrentChatUser(profile)}
                      >
                        <Avatar className="mr-2 h-8 w-8">
                          <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.full_name} />
                          <AvatarFallback>{profile.full_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{profile.full_name}</span>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              
              <div className="md:col-span-3">
                {currentChatUser ? (
                  <div className="flex flex-col h-full">
                    <div className="border-b border-white/10 p-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={currentChatUser.avatar_url || "/placeholder.svg"} alt={currentChatUser.full_name} />
                          <AvatarFallback>{currentChatUser.full_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-semibold">{currentChatUser.full_name}</h3>
                          <p className="text-sm text-muted-foreground">{currentChatUser.title || 'User'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4" ref={chatContainerRef}>
                      {loading ? (
                        <div className="flex justify-center items-center h-full">
                          <div className="animate-spin h-8 w-8 border-2 border-navy-accent rounded-full border-t-transparent"></div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex flex-col ${message.sender_id === user?.id ? 'items-end' : 'items-start'}`}
                            >
                              <div
                                className={`rounded-lg px-4 py-2 max-w-[80%] ${message.sender_id === user?.id ? 'bg-navy-accent text-white' : 'bg-secondary text-foreground'}`}
                              >
                                {message.content}
                              </div>
                              <span className="text-xs text-muted-foreground mt-1">
                                {new Date(message.created_at).toLocaleTimeString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4 border-t border-white/10">
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSendMessage();
                            }
                          }}
                        />
                        <Button onClick={handleSendMessage}>
                          Send
                          <Send className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-xl text-muted-foreground">Select a user to start chatting</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <FooterSection />
    </div>
  );
};

export default Messages;
