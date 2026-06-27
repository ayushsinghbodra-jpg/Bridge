import React from "react";

const Navbar: React.FC = () => {
    return (
        <nav className = "h-16 bg-gray-900 border-b border-gray-700 flex items-center justify-between  px-6">
            <h1 className="text-white text-xl font-bold">Bridge</h1>
            
            <div className = "flex items-center gap-4">
                <button className = "text-white hover:text-blue-500">
                    Notifications
                </button>
                <button className = "text-white hover:text-blue-500">
                    Profile
                </button>
            </div>
        </nav>
    );
};

export default Navbar;