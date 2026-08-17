import {TrackedEvent, AnalyticsTransport, AnalyticsConfig} from './type';

function generatedId(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`;
}

export class AnalyticsCollector {
    private buffer : TrackedEvent[]= [];
    private transports : AnalyticsTransport[];
    private bufferSize : number;    
    private flushIntervals : number;
    private globalProperties : Record<string,unknown>
    private timer : ReturnType<typeof setInterval> | null =null;

    constructor(config : AnalyticsConfig){
        this.transports = config.transports;
        this.bufferSize=config.bufferSize ?? 50
        this.flushIntervals=config.flushIntervals?? 5_000;
        this.globalProperties=config.globalProperties ?? {};

        if(this.flushIntervals>0){
            this.timer=setInterval(()=>this.flush(),this.flushIntervals)
        }
    }

    track(
        name: string, 
        opts :{
            userId?: string | null;
            serverId?: string | null;
            payload? : Record<string,unknown>;
        }={},
    ) : void {
        const event : TrackedEvent = {
            id: generatedId(),
            userId : opts.userId ?? null,
            serverId : opts.serverId ?? null,
            payload : {
                ...this.globalProperties,
                ...opts.payload
            },
            createdAt : new Date(),
            name
        }

        this.buffer.push(event);


        if(this.buffer.length >= this.bufferSize){
            void this.flush();
        }
    }


    async flush() : Promise<void>{
        if(this.buffer.length === 0) return;

        const events = [...this.buffer];
        this.buffer = [];
        const sendPromises = events.flatMap((events)=>{
            return this.transports.map((t)=>t.send(events).catch(()=>{}))
        })
        await Promise.allSettled([sendPromises]);

        const flushPromises = this.transports.filter((t) : t is AnalyticsTransport & {flush(): Promise<void>}=> !!t.flush).map((t)=>t.flush());

        await Promise.allSettled([flushPromises]);
    }


    async shutdown () : Promise<void>{
        if(this.timer){
            clearInterval(this.timer);
            this.timer=null;
        }
        await this.flush();
    }

    getBufferSize() : number{
        return this.buffer.length;
    }
}