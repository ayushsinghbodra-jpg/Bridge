export const API_ROUTES ={
    AUTH :{
        LOGIN: '/api/login',
        REGISTER: '/api/register',
        LOGOUT: '/api/logout',
    },
    USER:{
        GET_USER: '/api/user',
        UPDATE_USER: '/api/user/update',
    },
    SERVER:{
        GET_SERVERS: '/api/servers',
        CREATE_SERVER: '/api/servers/create',
    },
    CHANNEL:{
        CREATE_CHANNEL: '/api/channel/create',
        GET_CHANNELS: '/api/channel',
    },
    MESSAGE :{
        SEND: "/api/messages"
    }
}
