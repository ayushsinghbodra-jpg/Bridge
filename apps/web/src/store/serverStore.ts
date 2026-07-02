import { create } from "zustand";
import { Server } from "@bridge/types"; 

interface ServerState {
  servers: Server[];
  activeServer: Server | null;

  setServers: (servers: Server[]) => void;
  setActiveServer: (server: Server) => void;
}

const useServerStore = create<ServerState>((set) => ({
  servers: [],
  activeServer: null,

  setServers: (servers) =>
    set({
      servers,
    }),

  setActiveServer: (server) =>
    set({
      activeServer: server,
    }),
}));

export default useServerStore;