import useServerStore from "@/store/serverStore";
import { getServers } from "@/services/api/server.service";

const useServer = () => {
  const { servers, activeServer, setServers, setActiveServer } =
    useServerStore();

  const fetchServers = async () => {
    const data = await getServers();
    setServers(data);
  };

  return {
    servers,
    activeServer,
    setActiveServer,
    fetchServers,
  };
};

export default useServer;
  