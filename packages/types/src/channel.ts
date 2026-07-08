import type { ChannelType as ContractChannelType } from "@bridge/contracts";

export type ChannelType = ContractChannelType;

export interface Channel {
    id: string;
    name: string;
    type : ChannelType;
    serverId: string;
}

export interface ChannelResponse {
    id: string;
    name :string;
    serverId : string;
    topic : string |null;
    postion : number;
    createdAt : Date;
    type : ChannelType;
}