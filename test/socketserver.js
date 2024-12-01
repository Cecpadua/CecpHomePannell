const net = require('net');

const server = net.createServer((socket) => {
    console.log('客户端已连接');
    
    socket.on('data', (data) => {
        console.log('收到客户端数据:', data.toString());
        socket.write('你好，客户端！');
    });
    
    socket.on('end', () => {
        console.log('客户端已断开连接');
    });
    socket.on('error', (err) => {
        console.error('Socket Error:', err.message);
    });
});

server.listen(7071, () => {
    console.log('服务器已启动，监听端口 7070');
});

server.on('error', (err) => {
    console.error('Server Error:', err.message);
});
