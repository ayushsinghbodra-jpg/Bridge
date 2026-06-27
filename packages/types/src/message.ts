export interface Message {
  id: string;
  channelId: string;
  userId: string;
  content: string;
  role: "owner" | "admin" | "moderator" | "member"; 
}