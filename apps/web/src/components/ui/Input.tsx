import React from "react";

interface InputProps {
    type?: string;
    placeholder?: string;
    value?:string;
    onCharge?:(e: React.ChangeEvent<HTMLInputElement>)=>void;
    disabled?: boolean;
    className?: string;
}

const Input: React.FC<InputProps> = ({
    type ="text",
    placeholder,
    value,
    onCharge,
    disabled=false,
    className= "",
})=>{
    return (
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onCharge}
            disabled={disabled}
            className={`px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        />   
    );
};

export default Input;