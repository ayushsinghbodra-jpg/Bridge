import { io , Socket} from "socket.io-client";
import {getAccessToken} from "@/services/storage/authStorage";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "https://localhost:4000";

let socket : Socket | null = null;

export function getSocket() : Socket {
    if(socket) return socket;

    const token = getAccessToken();

    socket = io(`${SOCKET_URL}/chat`, {
        auth : {token},
        transports : ["websocket","polling"],
        autoConnect : true,
        reconnection : true,
        reconnectionAttempts : 5,
        reconnectionDelay : 1000,
    });
    return socket;
}


export function disconnectSocket() {
    if(socket) {
        socket.disconnect();
        socket = null ;
    }
}

export function reconnectSocket() {
    disconnectSocket();
    return getSocket();
};