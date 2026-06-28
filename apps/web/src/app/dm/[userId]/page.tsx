import MainLayout from "@/components/layout/MainLayout";
import MessageInput from "@/features/messages/components/MessageInput";
import MessageList from "@/features/messages/components/MessageList";

interface DMChatPageProps {
  params: {
    userId: string;
  };
}

export default function DMChatPage({
  params,
}: DMChatPageProps) {
  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        <div className="border-b border-gray-800 pb-4 mb-4">
          <h1 className="text-xl font-semibold text-white">
            Chat with User #{params.userId}
          </h1>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <MessageList />
          <MessageInput />
        </div>
      </div>
    </MainLayout>
  );
}