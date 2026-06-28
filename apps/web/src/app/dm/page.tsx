import MainLayout from "@/components/layout/MainLayout";
import UserCard from "@/features/users/components/UserCard";

const dummyUsers = [
  {
    id: "1",
    username: "John",
    isOnline: true,
  },
  {
    id: "2",
    username: "Mike",
    isOnline: false,
  },
];

export default function DMPage() {
  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        <div className="border-b border-gray-800 pb-4 mb-4">
          <h1 className="text-2xl font-bold text-white">
            Direct Messages
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Select a user to start chatting
          </p>
        </div>

        <div className="space-y-2">
          {dummyUsers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}