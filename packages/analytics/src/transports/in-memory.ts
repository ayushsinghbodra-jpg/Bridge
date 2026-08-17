import {TrackedEvent, AnalyticsTransport } from '../type';

export class InMemoryTransport implements AnalyticsTransport{
    public event : TrackedEvent[] = [];
    
    async send(event : TrackedEvent) : Promise<void>{
        this.event.push(event);
    }

    async flush() : Promise<void> {} ;

    async clear() : Promise<void> {
        this.event = [];
    }
}
