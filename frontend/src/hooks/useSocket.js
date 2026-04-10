import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';
import useVpnStore from '../store/vpnStore';

let socketInstance = null;

export const getSocket = () => socketInstance;

export const useSocket = () => {
  const { accessToken } = useAuthStore();
  const { setActiveUsers } = useVpnStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';
    socketInstance = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketInstance.on('connect', () => {
      socketInstance.emit('subscribe:servers');
    });

    socketInstance.on('stats:update', (data) => {
      setActiveUsers(data.activeUsers);
    });

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
        initialized.current = false;
      }
    };
  }, []);

  return socketInstance;
};

export const useServerUpdates = (callback) => {
  useEffect(() => {
    if (!socketInstance) return;
    socketInstance.on('servers:load-update', callback);
    return () => socketInstance?.off('servers:load-update', callback);
  }, [callback]);
};
