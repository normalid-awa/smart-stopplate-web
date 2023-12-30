const sticky_handler = (event: BeforeUnloadEvent, condition: () => boolean) => {
    if (condition()) {
        // Recommended
        event.preventDefault();
    
        // Included for legacy support, e.g. Chrome/Edge < 119
        event.returnValue = true;
    }
};
var handler: ((event: Event, condition: () => boolean) => void)[] = [];

export type StickyID = number;

export function sticky(condition: () => boolean): StickyID {
    var id: StickyID = Math.round(Math.random() * 1000);
    handler[id] = sticky_handler;
    window.addEventListener("beforeunload", (e) => handler[id](e, condition));
    return id;
}
export function remove_sticky(id: StickyID) {
    window.addEventListener("beforeunload", handler[id]);
    delete handler[id];
}
