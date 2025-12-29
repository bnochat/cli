import 'dotenv/config';

const baseUrl = process.env.BASE_URL || 'https://bnochat.cc';

export const config = {
  // App
  version: '1.0.1',
  repo: 'bnochat/cli',
  
  // Socket.io Server
  socketUrl: process.env.SOCKET_URL || 'wss://socket.bnochat.cc',
  
  // Base URL
  baseUrl,
  authUrl: `${baseUrl}/auth-cli`,
  apiUrl: `${baseUrl}/api`,
  
  // Auth
  authPort: parseInt(process.env.AUTH_PORT || '41567')
};

export const getCallbackUrl = () => `http://localhost:${config.authPort}/callback`;
