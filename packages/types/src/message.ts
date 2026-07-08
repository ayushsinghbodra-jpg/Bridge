export interface MessageAuthor {
  id:string;
  username : string;
  displayname : string | null ;
  avatarUrl : string | null;
  role: "owner" | "admin" | "moderator" | "member";

}

export interface MessageResponse {
  id: string;
  channelId: string;
  userId: MessageAuthor;
  content: string;
  editedAt : Date;
  deleted : boolean;
  createdAt: string;
}



export interface messagePage {
  message : MessageResponse[];
  nextCursor : string | null;
}