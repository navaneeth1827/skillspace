
import { Message } from "@/hooks/useChat";
import UserAvatar from "./UserAvatar";
import { formatDistanceToNow } from "date-fns";

type ChatMessageProps = {
  message: Message;
  isOwnMessage: boolean;
};

const ChatMessage = ({ message, isOwnMessage }: ChatMessageProps) => {
  // Use the message object directly
  const { content, created_at } = message;
  
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-[80%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`${isOwnMessage ? 'ml-3' : 'mr-3'}`}>
          {/* We don't have sender data directly in the Message object, 
              so we'll just use default avatar for now */}
          <UserAvatar 
            username={isOwnMessage ? "You" : "User"} 
            size="sm" 
          />
        </div>
        <div 
          className={`
            rounded-2xl p-4 
            ${isOwnMessage 
              ? 'bg-primary/10 text-foreground rounded-tr-none' 
              : 'bg-muted text-foreground rounded-tl-none'}
          `}
        >
          <p className="mb-1">{content}</p>
          <div className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
