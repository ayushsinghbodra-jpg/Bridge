export interface Server{
    id: string;
    name: string;
    ownerId: string;
}

export interface ServerResponse {
    id: string;
    name: string;
    slug: string;
    description : string | null;
    iconUrl: string | null;
    bannerUrl : string | null;
    ownerId : string;
    visibility :"public" | "private";
    memberCount : number;
    createdAt : Date;
}

export interface MemberResponse{
    id: string;
    userId : string;
    serverId : string;
    nickname : string | null;
    role : "owner" | "admin" | "moderator" | "member";
    joineAt : Date;
    user: {
        id:string;
        username : string;
        displayName : string | null;
        avatarUrl : string | null;
    };
}

export interface InviteResponse {
    id : string;
    code : string;
    serverId : string;
    maxUses : number | null;
    uses : number;
    expiresAt : Date | null;
    createdAt : Date;
    server : {
        id : string;
        name : string ;
        iconUrl : string | null;
        memberCount : number;
    }
}
