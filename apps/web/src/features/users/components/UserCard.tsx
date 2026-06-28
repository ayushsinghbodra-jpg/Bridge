"use client";

interface User {
  id: string;
  username: string;
  avatar?: string;
  isOnline?: boolean;
}

interface UserCardProps {
  user: User;
}

const UserCard = ({ user }: UserCardProps) => {
  return (
    <div className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-800 cursor-pointer transition">
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold">
          {user.username.charAt(0).toUpperCase()}
        </div>

        {user.isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border border-gray-900" />
        )}
      </div>

      <span className="text-white font-medium">
        {user.username}
      </span>
    </div>
  );
};

export default UserCard;