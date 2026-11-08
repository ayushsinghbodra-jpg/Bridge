export const MENTION_REGEX = {
    USER: /@([a-zA-Z0-9_]{3,20})/g,
    ROLE: /@&([a-zA-Z0-9_]{3,20})/g,
    CHANNEL: /#([a-zA-Z0-9_]{3,20})/g
};

export const MAX_MENTIONS_PER_MESSAGE = 10;