import { Event } from './util';

export const PositionEvent = new Event();
export const UpdateEvent = new Event();

window.addEventListener('message', (event : any) => { // messages from the extension
    const message = event.data; // The JSON data our extension sent
    switch (message.command) 
    { 
        case 'position' : 
            PositionEvent.fire(message.data);
            let selected = document.getElementsByClassName("selected")[0];
            if(selected)
                selected.scrollIntoView({block: "center"});
        break;
        case 'update' : UpdateEvent.fire(message.data); break;
    }
});