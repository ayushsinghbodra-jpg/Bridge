import {TrackedEvent, AnalyticsTransport } from '../type';

export class ConsoleTransport implements AnalyticsTransport{
    private prefix : string;

    constructor(prefix="[analytics]"){
        this.prefix=prefix;
    }

    async send(event : TrackedEvent) : Promise<void>{
        try{
            console.log(`${this.prefix} ${event.name}`,{
                userId:event.userId,
                serverId: event.serverId,
                createdAt: event.createdAt.toISOString(),
                payload: event.payload,
                id:event.id
            })
        } catch (error) {
            console.error(`${this.prefix} Failed to send event ${event.name}`, error);
        }
    }
}
