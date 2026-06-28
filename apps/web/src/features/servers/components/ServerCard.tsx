"use client";

import { Server } from "../types/server.types";

interface ServerCardProps {
  server: Server;
  onClick: (server: Server) => void;
}

const ServerCard = ({
  server,
  onClick,
}: ServerCardProps) => {
  return (
    <div
      onClick={() => onClick(server)}
      className="p-4 rounded-lg bg-gray-800 cursor-pointer hover:bg-gray-700 transition"
    >
      <h3 className="font-semibold text-white">
        {server.name}
      </h3>
    </div>
  );
};

export default ServerCard;