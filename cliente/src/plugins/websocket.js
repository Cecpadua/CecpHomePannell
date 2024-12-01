export default {
  install(app) {
      // 定义 WebSocket 实例
      let socket = null;
      const listeners = {
          onConnection: [], // 连接成功监听器
          onMessage: [], // 消息监听器
          onDisconnection: [], // 断开连接监听器
          onError: [], // 错误监听器
      };

      // 重新连接逻辑
      const retryConnection = () => {
        if (socket && (socket.readyState === WebSocket.CLOSED || socket.readyState === WebSocket.CLOSING)) {
            const retry = setInterval(() => {
                if (socket.readyState === WebSocket.CLOSED || socket.readyState === WebSocket.CLOSING) {
                    console.log('Attempting to reconnect WebSocket...');
                    socket = createSocket(); // 重新创建 WebSocket
                } else if (socket.readyState === WebSocket.OPEN) {
                    console.log('WebSocket reconnected');
                    clearInterval(retry);
                }
            }, 1500);
        }
    };

      // 创建 WebSocket 并初始化事件
      const createSocket = () => {
          const ws = new WebSocket(`ws://${window.location.hostname}:3001`);

          ws.onopen = () => {
              console.log('WebSocket connected');
              listeners.onConnection.forEach((callback) => callback());
          };

          ws.onmessage = (event) => {
              console.log('Message from server:', event.data);
              listeners.onMessage.forEach((callback) => callback(event.data));
          };

          ws.onclose = () => {
              console.log('WebSocket disconnected');
              listeners.onDisconnection.forEach((callback) => callback());
              retryConnection();
          };

          ws.onerror = (error) => {
              console.error('WebSocket error:', error);
              listeners.onError.forEach((callback) => callback(error));
              retryConnection();
          };

          return ws;
      };

      // 初始化 WebSocket
      socket = createSocket();

      // 添加监听方法
      const addListener = (type, callback) => {
          if (listeners[type]) {
              listeners[type].push(callback);
          } else {
              console.warn(`Unsupported listener type: ${type}`);
          }
      };

      // 移除监听方法
      const removeListener = (type, callback) => {
          if (listeners[type]) {
              listeners[type] = listeners[type].filter((cb) => cb !== callback);
          } else {
              console.warn(`Unsupported listener type: ${type}`);
          }
      };

      // 暴露给 Vue 应用
      const wsService = {
          send: (data) => {
              if (socket.readyState === WebSocket.OPEN) {
                  socket.send(data);
                  console.log(' > Message sent to server:', data);
              } else {
                  console.error('WebSocket is not connected');
              }
          },
          addOnConnectionListener: (callback) => addListener('onConnection', callback),
          addOnMessageListener: (callback) => addListener('onMessage', callback),
          addOnDisconnectionListener: (callback) => addListener('onDisconnection', callback),
          addOnErrorListener: (callback) => addListener('onError', callback),
          removeOnConnectionListener: (callback) => removeListener('onConnection', callback),
          removeOnMessageListener: (callback) => removeListener('onMessage', callback),
          removeOnDisconnectionListener: (callback) => removeListener('onDisconnection', callback),
          removeOnErrorListener: (callback) => removeListener('onError', callback),
      };

      // 使用 provide 提供给 Vue 应用
      app.provide('$socketService', wsService);
  },
};
