
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type Message = {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  read: boolean;
};

export const useChat = (receiverId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchMessages = async () => {
    if (!user || !receiverId) return;
    
    setLoading(true);
    try {
      // Fetch conversation between current user and receiver
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      setMessages(data || []);
      
      // Mark unread messages as read
      if (data) {
        const unreadMessages = data.filter(
          msg => msg.receiver_id === user.id && !msg.read
        );
        
        if (unreadMessages.length > 0) {
          for (const msg of unreadMessages) {
            await supabase
              .from('chat_messages')
              .update({ read: true })
              .eq('id', msg.id);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!user || !receiverId || !content.trim()) return null;
    
    try {
      const newMessage = {
        sender_id: user.id,
        receiver_id: receiverId,
        content: content.trim(),
        read: false
      };
      
      const { data, error } = await supabase
        .from('chat_messages')
        .insert(newMessage)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
      return null;
    }
  };

  useEffect(() => {
    if (user && receiverId) {
      fetchMessages();
      
      // Set up real-time subscription for new messages
      const channel = supabase
        .channel('public:chat_messages')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `or(and(sender_id=eq.${user.id},receiver_id=eq.${receiverId}),and(sender_id=eq.${receiverId},receiver_id=eq.${user.id}))`
        }, (payload) => {
          if (payload.new) {
            setMessages(prev => [...prev, payload.new as Message]);
            
            // Mark message as read if the current user is the receiver
            if (payload.new.receiver_id === user.id) {
              supabase
                .from('chat_messages')
                .update({ read: true })
                .eq('id', payload.new.id);
            }
          }
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, receiverId]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    fetchMessages
  };
};
