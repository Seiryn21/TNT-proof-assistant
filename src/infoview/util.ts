export class Event {
    handlers : ((data : any) => void)[] = [];

    on(handler : (data : any) => void) {
        this.handlers.push(handler);
    }

    fire(event : any)
    {
        for (const h of this.handlers) {
            h(event);
        }
    }
}