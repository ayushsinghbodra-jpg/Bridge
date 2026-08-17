"use client";

import ServerCard from "./ServerCard";
import useServer from "@/hooks/useServer";

const ServerList = () => {
  const {
    servers,
    setActiveServer,
  } = useServer();

  return (
    <div className="space-y-3">
      {servers.map((server) => (
        <ServerCard
          key={server.id}
          server={server}
          onClick={setActiveServer}
        />
      ))}
    </div>
  );
};

export default ServerList;