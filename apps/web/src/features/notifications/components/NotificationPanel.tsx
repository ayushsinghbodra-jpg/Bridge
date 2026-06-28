"use client";

interface Notification {
  id: string;
  message: string;
  createdAt: string;
}

const NotificationPanel = () => {
  const notifications: Notification[] = [
    {
      id: "1",
      message: "John sent a message",
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      message: "New server invite received",
      createdAt: new Date().toISOString(),
    },
  ];

  return (
    <div className="w-full max-w-md bg-gray-900 rounded-lg p-4">
      <h2 className="text-lg font-bold text-white mb-4">
        Notifications
      </h2>

      <div className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="p-3 bg-gray-800 rounded-md"
          >
            <p className="text-white">
              {notification.message}
            </p>

            <span className="text-xs text-gray-400">
              {new Date(
                notification.createdAt
              ).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationPanel;