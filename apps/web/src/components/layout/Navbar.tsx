import React from "react";

const Navbar: React.FC = () => {
    return (        
        <nav className="h-16 w-full bg-gray-900 border-b border-gray-700 flex flex-row items-center justify-between px-6">
            <h1 className="text-white text-xl font-bold">Bridge</h1>

            <div className="flex flex-row items-center gap-4">
                <button className="flex items-center text-white hover:text-blue-500">
                    Notifications
                </button>
                <button className="flex items-center text-white hover:text-blue-500">
                    Profile
                </button>
            </div>
        </nav>
    );
};

export default Navbar;