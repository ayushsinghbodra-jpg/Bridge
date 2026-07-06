import {z} from 'zod';
export interface TrackedEvent {
    id: string;
    payload : Record<string,unknown>;
    createdAt: Date;
    name : string ;
    serverId : string | null;
    userId : string | null;
}

export interface AnalyticsTransport {
    send(event: TrackedEvent): Promise<void>;
    flush?(): Promise<void>;
}

export interface AnalyticsConfig {
    trannsports : AnalyticsTransport[];
    globalProperties? :Record<string,unknown>;
    bufferSize?: number;
    flushIntervals?: number;   
}