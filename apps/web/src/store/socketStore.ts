import { create } from "zustand";
import { Socket} from "socket.io-client";


interface SocketState {
  socket : Socket | null;
  isConnected : boolean ;

  setSocket : (socket : Socket) => void;
  setConnected : (isConnedted : boolean)=> void;
  reset : () => void;
}

const useSocketStore = create<SocketState>((set) => ({
  socket : null ,
  isConnected : false,

  setSocket:(socket) => set({socket}),
  setConnected: (isConnected)=> set({isConnected}),
  reset: () =>set({socket:null, isConnected : false}),
}));

export default useSocketStore;