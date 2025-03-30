
import React, { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ChatMessage from "@/components/ChatMessage";
import { useChat } from "@/hooks/useChat";
import { useProfileData } from "@/hooks/useProfileData";
import Navbar from "@/components/Navbar";
import { ProfileData } from "@/types/profile";

const Messages = () => {
  const { user } = useAuth();
  const profileData = useProfileData(user?.id);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [contacts, setContacts] = useState<ProfileData[]>([]);
  const { messages, sendMessage, loading } = useChat(selectedUser);
  
  useEffect(() => {
    if (!user) return;
    
    const fetchContacts = async () => {
      try {
        // Get users who have exchanged messages with the current user
        const { data: sentMessages, error: sentError } = await supabase
          .from('chat_messages')
          .select('receiver_id')
          .eq('sender_id', user.id);
          
        const { data: receivedMessages, error: receivedError } = await supabase
          .from('chat_messages')
          .select('sender_id')
          .eq('receiver_id', user.id);
        
        if (sentError || receivedError) {
          console.error("Error fetching messages:", sentError || receivedError);
          return;
        }
        
        // Extract unique user IDs
        const sentUserIds = sentMessages?.map(msg => msg.receiver_id) || [];
        const receivedUserIds = receivedMessages?.map(msg => msg.sender_id) || [];
        const uniqueUserIds = [...new Set([...sentUserIds, ...receivedUserIds])];
        
        if (uniqueUserIds.length === 0) return;
        
        // Fetch user profiles
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', uniqueUserIds);
          
        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
          return;
        }
        
        setContacts(profiles || []);
        
        // Auto-select the first contact if none is selected
        if (!selectedUser && profiles && profiles.length > 0) {
          setSelectedUser(profiles[0].id);
        }
      } catch (error) {
        console.error("Error in fetching contacts:", error);
      }
    };
    
    fetchContacts();
  }, [user, selectedUser]);
  
  const handleSendMessage = async () => {
    if (!message.trim() || !selectedUser || !user) return;
    
    const result = await sendMessage(message);
    
    setMessage("");
  };
  
  const getUserInfo = (userId: string) => {
    const contact = contacts.find(c => c.id === userId);
    return {
      id: contact?.id || '',
      full_name: contact?.full_name || '',
      title: contact?.title || '',
      location: contact?.location || '',
      bio: contact?.bio || '',
      hourly_rate: contact?.hourly_rate || 0,
      skills: contact?.skills || [],
      avatar_url: contact?.avatar_url || '',
      user_type: contact?.user_type || '',
      company_name: contact?.company_name || '',
      website: contact?.website || '',
      created_at: contact?.created_at || '',
      updated_at: contact?.updated_at || ''
    };
  };
  
  if (!user) {
    return (
      <div>
        <Navbar />
        <div className="container py-8">
          <h1 className="text-2xl font-bold mb-6">Messages</h1>
          <p>Please sign in to view your messages.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <Navbar />
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Contacts Sidebar */}
          <Card className="md:col-span-1">
            <CardContent className="p-4">
              <h2 className="font-semibold mb-4">Contacts</h2>
              {contacts.length === 0 ? (
                <p className="text-muted-foreground text-sm">No contacts yet.</p>
              ) : (
                <div className="space-y-2">
                  {contacts.map((contact) => (
                    <div 
                      key={contact.id} 
                      className={`flex items-center gap-3 p-2 rounded-md cursor-pointer ${selectedUser === contact.id ? 'bg-secondary/20' : 'hover:bg-secondary/10'}`}
                      onClick={() => setSelectedUser(contact.id)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={contact.avatar_url || ''} alt={contact.full_name} />
                        <AvatarFallback>{contact.full_name?.charAt(0) || '?'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{contact.full_name}</p>
                        <p className="text-xs text-muted-foreground">{contact.title || 'No title'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Chat Area */}
          <Card className="md:col-span-3">
            <CardContent className="p-4">
              {selectedUser ? (
                <div className="flex flex-col h-[600px]">
                  {/* Chat Header */}
                  <div className="flex items-center gap-3 p-3 border-b">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={getUserInfo(selectedUser).avatar_url} alt={getUserInfo(selectedUser).full_name} />
                      <AvatarFallback>{getUserInfo(selectedUser).full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{getUserInfo(selectedUser).full_name}</p>
                      <p className="text-xs text-muted-foreground">{getUserInfo(selectedUser).title}</p>
                    </div>
                  </div>
                  
                  {/* Messages List */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <p className="text-center text-muted-foreground">No messages yet. Start the conversation!</p>
                    ) : (
                      messages.map((msg) => (
                        <ChatMessage
                          key={msg.id}
                          content={msg.content}
                          senderData={msg.sender_id === user.id ? null : getUserInfo(msg.sender_id)}
                          timestamp={msg.created_at}
                          isCurrentUser={msg.sender_id === user.id}
                        />
                      ))
                    )}
                  </div>
                  
                  {/* Message Input */}
                  <div className="p-3 border-t flex gap-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage} disabled={loading}>Send</Button>
                  </div>
                </div>
              ) : (
                <div className="h-[600px] flex items-center justify-center">
                  <p className="text-muted-foreground">Select a contact to start chatting</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Messages;
