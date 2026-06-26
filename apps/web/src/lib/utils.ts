export function cn(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
}

export function truncate(text : string , length: number){
    if(text.length<= length) return text;
    return text.slice(0,length)+"...";
}