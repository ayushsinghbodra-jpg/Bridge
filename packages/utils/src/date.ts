export function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  return date.toLocaleString("en-US", options);
}
export function timeAgo(date: Date): string {
  const now = new Date();
  const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000);

  let timeAgo = "";
  if (secondsAgo < 60) {
    timeAgo = `${secondsAgo} seconds ago`;
  } else if (secondsAgo < 3600) {
    timeAgo = `${Math.floor(secondsAgo / 60)} minutes ago`;
  } else if (secondsAgo < 86400) {
    timeAgo = `${Math.floor(secondsAgo / 3600)} hours ago`;
  } else {
    timeAgo = `${Math.floor(secondsAgo / 86400)} days ago`;
  }

  return timeAgo;
}