import React from "react";
interface ButtonProps {
    children: React.ReactNode;
    onClick ?: () =>void;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    className?: string;
}
const Button : React.FC<ButtonProps>=({
    children,
    onClick,
    type ="button",
    disabled = false,
    className = "",
})=>{
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className= {`px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 ${className}`}
            >
            {children}
        </button>
    );
};

export default Button;