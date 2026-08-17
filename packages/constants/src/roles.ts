export const ROLES={
    ADMIN : "admin",
    MODERATOR : "moderator",
    MEMBER : "member",
    OWNER : "owner",
};
export const ROLE_PERMISSIONS={
    ADMIN : ["create_server", "delete_server", "manage_roles", "ban_user", "kick_user"],
    MODERATOR : ["ban_user", "kick_user"],
    MEMBER : ["send_message"],
    OWNER : ["create_server", "delete_server", "manage_roles", "ban_user", "kick_user"],
};