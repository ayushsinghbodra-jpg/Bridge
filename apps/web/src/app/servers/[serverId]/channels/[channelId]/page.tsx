import MainLayout from "@/components/layout/MainLayout";
import MessageList from "@/features/messages/components/MessageList";
import MessageInput from "@/features/messages/components/MessageInput";

export default function ChannelPage() {
  return (
    <MainLayout>
      <div className="flex flex-col h-full">
        <MessageList />
        <MessageInput />
      </div>
    </MainLayout>
  );
}