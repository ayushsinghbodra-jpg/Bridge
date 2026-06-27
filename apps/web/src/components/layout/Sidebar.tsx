import React from "react";

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 h-screen bg-gray-900 border-r border-gray-700 p-4">
      <ul className="space-y-4">
        <li className="text-white hover:text-blue-400 cursor-pointer">
          Dashboard
        </li>

        <li className="text-white hover:text-blue-400 cursor-pointer">
          Direct Messages
        </li>

        <li className="text-gray-400 uppercase text-sm">
          Servers
        </li>

        <li className="text-white hover:text-blue-400 cursor-pointer">
          Gaming Server
        </li>

        <li className="text-white hover:text-blue-400 cursor-pointer">
          Study Server
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;