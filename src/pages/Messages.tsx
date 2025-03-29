
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send } from "lucide-react";
import Button from "@/components/Button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ProfileData } from "@/types/profile";
import UserAvatar from "@/components/UserAvatar";
import ChatMessage from "@/components/ChatMessage";
import { useChat } from "@/hooks/useChat";
import { useToast } from "@/hooks/use-toast";
import AnimatedCard from "@/components/AnimatedCard";

// For demo purposes, we'll provide some sample contacts
const sampleContacts = [
  {
    id: "user-1",
    name: "Jane Smith",
    company: "TechGiant Inc.",
    avatar: "/placeholder.svg",
    lastMessage: "Can we schedule an interview for next week?",
    lastActive: "2 hours ago",
    unread: 2
  },
  {
    id: "user-2",
    name: "Robert Johnson",
    company: "StartupX",
    avatar: "/placeholder.svg",
    lastMessage: "Thanks for sending your portfolio, I'm impressed with your work.",
    lastActive: "Yesterday",
    unread: 0
  },
  {
    id: "user-3",
    name: "Emily Davis",
    company: "DesignHub",
    avatar: "/placeholder.svg", 
    lastMessage: "I'd like to discuss the project timeline.",
    lastActive: "2 days ago",
    unread: 0
  }
];

const Messages = () => {
  const { id: contactId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeContact, setActiveContact] = useState<string | undefined>(contactId);
  const [contactsData, setContactsData] = useState<ProfileData[]>([]);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [selectedContactData, setSelectedContactData] = useState<ProfileData | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, loading, sendMessage } = useChat(activeContact);

  useEffect(() => {
    if (contactId) {
      setActiveContact(contactId);
    }
  }, [contactId]);

  // Fetch the current user's profile
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }
        
        if (data) {
          const profileDataFormatted: ProfileData = {
            full_name: data.full_name || "",
            title: data.title || "",
            location: data.location || "",
            bio: data.bio || "",
            hourly_rate: data.hourly_rate || 0,
            skills: data.skills,
            avatar_url: data.avatar_url,
            user_type: data.user_type || "freelancer",
            company_name: data.company_name,
            website: data.website,
            created_at: data.created_at,
            updated_at: data.updated_at,
            id: data.id
          };
          
          setProfileData(profileDataFormatted);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    fetchProfileData();
  }, [user]);

  // In a real app, we would fetch contacts from the database
  // For this demo, we're using sample data and simulating API calls
  useEffect(() => {
    const fetchContacts = async () => {
      // In a real implementation, you would fetch contacts from the database
      // For this demo, we're simulating an API call with sample data
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Transform sample data to match ProfileData type
      const contacts = sampleContacts.map(contact => ({
        id: contact.id,
        full_name: contact.name,
        company_name: contact.company,
        avatar_url: contact.avatar,
        user_type: "client",
      } as ProfileData));
      
      setContactsData(contacts);
      
      // If there's an active contact, set their data
      if (activeContact) {
        const contact = contacts.find(c => c.id === activeContact);
        if (contact) {
          setSelectedContactData(contact);
        }
      }
    };
    
    fetchContacts();
  }, [activeContact]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeContact) return;
    
    const result = await sendMessage(newMessage);
    if (result) {
      setNewMessage("");
      // Scroll to bottom after message is sent
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container px-4 md:px-6">
          <h1 className="text-2xl font-bold mb-6">Messages</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contacts List */}
            <div className="md:col-span-1">
              <AnimatedCard>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold">Contacts</h2>
                  <Badge variant="outline">{contactsData.length}</Badge>
                </div>
                
                <div className="space-y-2">
                  {contactsData.map(contact => (
                    <div 
                      key={contact.id} 
                      className={`
                        flex items-center gap-3 p-3 rounded-lg cursor-pointer transition
                        ${activeContact === contact.id 
                          ? 'bg-navy-accent/20 border border-navy-accent/40' 
                          : 'hover:bg-white/5'}
                      `}
                      onClick={() => setActiveContact(contact.id)}
                    >
                      <div className="relative">
                        <UserAvatar 
                          username={contact.full_name} 
                          avatarUrl={contact.avatar_url} 
                          size="md" 
                        />
                        {sampleContacts.find(c => c.id === contact.id)?.unread && (
                          <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-navy-accent"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <h3 className="font-medium text-sm">{contact.full_name}</h3>
                          <span className="text-xs text-muted-foreground">
                            {sampleContacts.find(c => c.id === contact.id)?.lastActive}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {contact.company_name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </AnimatedCard>
            </div>
            
            {/* Chat Area */}
            <div className="md:col-span-2">
              <AnimatedCard className="h-[calc(100vh-240px)] flex flex-col">
                {!activeContact ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                    <MessageSquare className="h-12 w-12 mb-4 text-muted-foreground" />
                    <h2 className="text-xl font-semibold mb-2">Your Messages</h2>
                    <p className="text-muted-foreground mb-4">
                      Select a contact to start chatting
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-white/10 flex items-center gap-3">
                      <UserAvatar 
                        username={selectedContactData?.full_name || ""} 
                        avatarUrl={selectedContactData?.avatar_url} 
                        size="sm" 
                      />
                      <div>
                        <h3 className="font-medium">{selectedContactData?.full_name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {selectedContactData?.company_name || selectedContactData?.title}
                        </p>
                      </div>
                    </div>
                    
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {loading ? (
                        <div className="h-full flex items-center justify-center">
                          <div className="animate-spin h-6 w-6 border-2 border-navy-accent rounded-full border-t-transparent"></div>
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                          <p className="text-muted-foreground">
                            No messages yet. Send a message to start the conversation.
                          </p>
                        </div>
                      ) : (
                        messages.map(message => (
                          <ChatMessage 
                            key={message.id}
                            content={message.content}
                            senderData={message.sender_id === user?.id ? profileData : selectedContactData}
                            timestamp={message.created_at}
                            isCurrentUser={message.sender_id === user?.id}
                          />
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                    
                    {/* Message Input */}
                    <div className="p-4 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="flex-1"
                        />
                        <Button 
                          onClick={handleSendMessage} 
                          disabled={!newMessage.trim()}
                          size="icon"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </AnimatedCard>
            </div>
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default Messages;
