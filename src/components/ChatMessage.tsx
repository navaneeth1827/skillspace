
import { ProfileData } from "@/types/profile";
import UserAvatar from "./UserAvatar";
import { formatDistanceToNow } from "date-fns";

type ChatMessageProps = {
  content: string;
  senderData: ProfileData | null;
  timestamp: string;
  isCurrentUser: boolean;
};

const ChatMessage = ({ content, senderData, timestamp, isCurrentUser }: ChatMessageProps) => {
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-[80%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`${isCurrentUser ? 'ml-3' : 'mr-3'}`}>
          <UserAvatar 
            username={senderData?.full_name || "User"} 
            avatarUrl={senderData?.avatar_url} 
            size="sm" 
          />
        </div>
        <div 
          className={`
            rounded-2xl p-4 
            ${isCurrentUser 
              ? 'bg-navy-accent/30 text-white rounded-tr-none' 
              : 'bg-white/10 text-white rounded-tl-none'}
          `}
        >
          <p className="mb-1">{content}</p>
          <div className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
