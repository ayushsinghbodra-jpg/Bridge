import useServerStore from "@/store/serverStore";
import { getServers } from "@/services/api/server.service";

const useServer = () => {
  const { servers, activeServer, setServers, setActiveServer, setLoading, setError } =
    useServerStore();

  const fetchServers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getServers();
      setServers(data);
    } catch (error) {
      setError("Failed to fetch servers");
    } finally {
      setLoading(false);
    }
  };

  return {
    servers,
    activeServer,
    setActiveServer,
    fetchServers,
    setLoading,
    setError,
  };
};

export default useServer;
  
