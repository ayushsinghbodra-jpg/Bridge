export const createSocketConnection=()=>{
    return new WebSocket("ws://localhost:5000");
};