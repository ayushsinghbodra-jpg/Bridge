import { create } from "zustand";
import { Server } from "@bridge/types"; 
import { AsyncState } from "@/types/state";

interface ServerState extends AsyncState {
  servers: Server[];
  activeServer: Server | null;


  setServers: (servers: Server[]) => void;
  setActiveServer: (server: Server) => void;
  setLoading: (isLoading : boolean) => void;
  setError: (error : string | null) => void;
}

const useServerStore = create<ServerState>((set) => ({
  servers: [],
  activeServer: null,
  isLoading: false,
  error: null,

  setServers: (servers) =>
    set({
      servers,
    }),

  setActiveServer: (server) =>
    set({
      activeServer: server,
    }),
  setLoading: (isLoading) =>
    set({
      isLoading,
    }),
  setError: (error) =>
    set({
      error,
    }),
}));

export default useServerStore;