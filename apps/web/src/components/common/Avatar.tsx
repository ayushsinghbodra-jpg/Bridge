import React from "react";
 
interface AvatarProps {
    src?: string;
    alt?: string;
    size?: "small" | "medium" | "large";
    name?: string;
}

const Avatar : React.FC<AvatarProps> = ({
    src,
    alt="Avatar",
    size = "medium",
    name,
}) => {
    const sizeClasses = {
        small: "w-8 h-8 text-sm",
        medium: "w-12 h-12 text-lg",
        large: "w-16 h-16 text-xl",
    };

    if (src) {
        return (
            <img 
                src={src}
                alt={alt}
                className={`rounded-full object-cover ${sizeClasses[size]}`}
            />
        );
    }
    return (
        <div className={
            `rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold ${sizeClasses[size]}`
        }>
            {name ? name.charAt(0).toUpperCase() : "?"}
        </div>
    )
}

export default Avatar;