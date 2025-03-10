
import { useState } from "react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Button from "@/components/Button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { FileIcon, PaperclipIcon, SendIcon, User } from "lucide-react";
import { cn } from "@/lib/utils";

// Sample message data
const conversations = [
  {
    id: 1,
    contact: {
      id: 101,
      name: "Jane Smith",
      company: "TechGiant Inc.",
      role: "Hiring Manager",
      avatar: "/placeholder.svg",
      isOnline: true
    },
    unread: 2,
    lastMessageTime: "2 hours ago",
    messages: [
      {
        id: 1,
        sender: "contact",
        text: "Hi John, I came across your profile and I'm impressed with your portfolio. We have a project that might be a good fit for your skills.",
        time: "2 days ago"
      },
      {
        id: 2,
        sender: "user",
        text: "Hello Jane, thank you for reaching out. I'd be interested in learning more about the project.",
        time: "2 days ago"
      },
      {
        id: 3,
        sender: "contact",
        text: "Great! We're looking for a React developer to help us build a new dashboard for our analytics platform. The project would be for approximately 3 months. Are you available for that duration?",
        time: "1 day ago"
      },
      {
        id: 4,
        sender: "user",
        text: "Yes, I'm available for the next 3-4 months. Could you share more details about the project requirements and your expectations?",
        time: "1 day ago"
      },
      {
        id: 5,
        sender: "contact",
        text: "Sure thing. Here's a brief overview of what we need: a responsive dashboard with data visualization, real-time updates, and user management features. We'll be using our existing API.",
        time: "1 day ago"
      },
      {
        id: 6,
        sender: "contact",
        text: "I've also attached a preliminary spec document for your review. Let me know if you have any questions.",
        time: "1 day ago",
        attachment: {
          name: "Dashboard_Requirements.pdf",
          size: "2.4 MB",
          url: "#"
        }
      },
      {
        id: 7,
        sender: "contact",
        text: "Can we schedule an interview for next week to discuss further?",
        time: "2 hours ago"
      }
    ]
  },
  {
    id: 2,
    contact: {
      id: 102,
      name: "Robert Johnson",
      company: "StartupX",
      role: "Founder",
      avatar: "/placeholder.svg",
      isOnline: false
    },
    unread: 0,
    lastMessageTime: "Yesterday",
    messages: [
      {
        id: 1,
        sender: "contact",
        text: "Hi John, thanks for sending your portfolio. I'm impressed with your work on the e-commerce platform.",
        time: "3 days ago"
      },
      {
        id: 2,
        sender: "user",
        text: "Thank you for the kind words, Robert. I put a lot of effort into that project.",
        time: "3 days ago"
      },
      {
        id: 3,
        sender: "contact",
        text: "We're looking for someone to help us redesign our website. Would you be interested?",
        time: "2 days ago"
      },
      {
        id: 4,
        sender: "user",
        text: "I'd definitely be interested! Could you tell me more about what you have in mind for the redesign?",
        time: "2 days ago"
      },
      {
        id: 5,
        sender: "contact",
        text: "We want a modern, clean design that focuses on our product features. Our current site is outdated and doesn't convert well.",
        time: "Yesterday"
      }
    ]
  },
  {
    id: 3,
    contact: {
      id: 103,
      name: "Sarah Williams",
      company: "DesignHub",
      role: "Project Manager",
      avatar: "/placeholder.svg",
      isOnline: true
    },
    unread: 0,
    lastMessageTime: "3 days ago",
    messages: [
      {
        id: 1,
        sender: "user",
        text: "Hi Sarah, I'm following up on my application for the UI/UX consultant position posted last week.",
        time: "4 days ago"
      },
      {
        id: 2,
        sender: "contact",
        text: "Hello John, thanks for your follow-up. We're still reviewing applications and should have a decision by next week.",
        time: "4 days ago"
      },
      {
        id: 3,
        sender: "user",
        text: "That sounds good. I'm excited about the possibility of working with DesignHub.",
        time: "3 days ago"
      },
      {
        id: 4,
        sender: "contact",
        text: "We appreciate your enthusiasm. Your portfolio is impressive, and we'll be in touch soon.",
        time: "3 days ago"
      }
    ]
  }
];

const Messages = () => {
  const { toast } = useToast();
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredConversations = conversations.filter(convo => 
    convo.contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    convo.contact.company.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    // In a real app, we would send this to an API
    toast({
      title: "Message sent",
      description: "Your message has been sent successfully.",
    });
    
    setMessage("");
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container px-4 md:px-6">
          <h1 className="text-2xl font-bold mb-6">Messages</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[70vh]">
            {/* Conversation List */}
            <div className="glass-card p-4 md:col-span-1 overflow-hidden flex flex-col max-h-[70vh]">
              <div className="mb-4">
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="overflow-y-auto flex-1 scrollbar-none pr-2">
                {filteredConversations.length > 0 ? (
                  filteredConversations.map((convo) => (
                    <div
                      key={convo.id}
                      className={cn(
                        "p-3 rounded-lg mb-2 cursor-pointer transition-colors",
                        selectedConversation.id === convo.id 
                          ? "bg-navy-accent/20" 
                          : "hover:bg-white/5"
                      )}
                      onClick={() => setSelectedConversation(convo)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
                          <img 
                            src={convo.contact.avatar} 
                            alt={convo.contact.name} 
                            className="h-full w-full object-cover"
                          />
                          {convo.contact.isOnline && (
                            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-navy"></span>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium truncate">
                              {convo.contact.name}
                            </h3>
                            <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                              {convo.lastMessageTime}
                            </span>
                          </div>
                          
                          <p className="text-sm text-muted-foreground truncate">
                            {convo.contact.company} • {convo.contact.role}
                          </p>
                          
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-muted-foreground truncate">
                              {convo.messages[convo.messages.length - 1].text}
                            </span>
                            {convo.unread > 0 && (
                              <Badge variant="default" className="h-5 bg-navy-accent text-navy">
                                {convo.unread}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No conversations found.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Conversation Messages */}
            <div className="glass-card p-4 md:col-span-2 flex flex-col max-h-[70vh]">
              {selectedConversation ? (
                <>
                  {/* Conversation Header */}
                  <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
                    <div className="relative h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
                      <img 
                        src={selectedConversation.contact.avatar} 
                        alt={selectedConversation.contact.name} 
                        className="h-full w-full object-cover"
                      />
                      {selectedConversation.contact.isOnline && (
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-navy"></span>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-medium">
                        {selectedConversation.contact.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedConversation.contact.company} • {selectedConversation.contact.role}
                      </p>
                    </div>
                    
                    <div className="ml-auto flex gap-2">
                      <Button size="sm" variant="outline">
                        View Profile
                      </Button>
                      <Button size="sm">
                        Start Call
                      </Button>
                    </div>
                  </div>
                  
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto scrollbar-none space-y-4 mb-4">
                    {selectedConversation.messages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={cn(
                          "flex",
                          msg.sender === "user" ? "justify-end" : "justify-start"
                        )}
                      >
                        <div 
                          className={cn(
                            "max-w-[70%] rounded-lg p-3",
                            msg.sender === "user" 
                              ? "bg-navy-accent text-navy" 
                              : "bg-white/10 text-foreground"
                          )}
                        >
                          <p className="text-sm">{msg.text}</p>
                          
                          {msg.attachment && (
                            <div className="mt-2 glass-card p-2 rounded-md flex items-center gap-2">
                              <FileIcon className="h-4 w-4" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{msg.attachment.name}</p>
                                <p className="text-xs text-muted-foreground">{msg.attachment.size}</p>
                              </div>
                              <Button size="sm" variant="outline" className="h-6 px-2 text-xs">
                                View
                              </Button>
                            </div>
                          )}
                          
                          <p className="text-xs mt-1 opacity-70">{msg.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Message Input */}
                  <div>
                    <div className="relative">
                      <Textarea
                        placeholder="Type your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="min-h-[80px] pb-9 resize-none"
                      />
                      <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
                        <Button size="sm" variant="ghost" className="h-8">
                          <PaperclipIcon className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={handleSendMessage}
                          disabled={!message.trim()}
                          className="h-8 px-3"
                        >
                          <SendIcon className="h-4 w-4 mr-1" />
                          Send
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <User className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No conversation selected</h3>
                  <p className="text-muted-foreground text-center mt-1">
                    Select a conversation from the list or start a new one.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default Messages;
