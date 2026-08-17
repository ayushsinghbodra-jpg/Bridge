export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
export function validateUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}
export function validatePassword(password: string): boolean {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return passwordRegex.test(password);
}
export function validateServerName(name: string): boolean {
  const serverNameRegex = /^[a-zA-Z0-9_ ]{3,50}$/;
  return serverNameRegex.test(name);
}
export function validateChannelName(name: string): boolean {
  const channelNameRegex = /^[a-zA-Z0-9_ ]{3,50}$/;
  return channelNameRegex.test(name);
}
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
}