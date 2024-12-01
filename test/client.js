const net = require('net');

const client = net.createConnection({ host:'192.168.1.158', port: 23 }, () => {
    const command = Buffer.from("000380000001AC1B", "hex");
    console.log('已连接到服务器');
    client.write(command);
});

client.on('data', (data) => {
    console.log('收到服务器数据:');
    console.log(data);
    client.end();
});

client.on('end', () => {
    console.log('断开与服务器的连接');
});

client.on('error', (err) => {
    console.error('Client Error:', err.message);
});

// device address <Buffer 01 03 02 00 01 79 84>
// veresion <Buffer 01 03 02 00 64 b9 af>