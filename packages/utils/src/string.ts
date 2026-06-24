export function truncate(text : string, length : number) : string {
    if (text.length<length) return text;
    return text.substring(0,length) + "...";
}
export function slugify(text:string):string {
    return text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');
}