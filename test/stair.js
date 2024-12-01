const { SerialPort } = require('serialport');
const fs = require('fs');
const path = require('path');

// 替换为你的串口设备名称
const portName = 'COM9';

// 输出文件路径
const outputFilePath = path.join(__dirname, 'Left_stop.txt');

// 初始化串口
const port = new SerialPort({
    path: portName,
    baudRate: 9600, // 根据遥控器设置波特率
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
});

// 打开串口
port.on('open', () => {
    console.log(`Serial port ${portName} opened successfully.`);
    console.log(`Hex data will be saved to ${outputFilePath}`);
});

// 创建写入流
const writeStream = fs.createWriteStream(outputFilePath, { flags: 'a' }); // 'a' 表示追加写入

// 监听数据事件
port.on('data', (data) => {
    const hexData = data.toString('hex'); // 将数据转换为十六进制字符串
    console.log(`Received (Hex): ${hexData}`);

    // 写入到文件
    writeStream.write(`${hexData}\n`); // 每行保存一条十六进制数据
});

// 错误处理
port.on('error', (err) => {
    console.error(`Serial port error: ${err.message}`);
});

// 关闭应用时，关闭写入流
process.on('SIGINT', () => {
    console.log('Closing application...');
    writeStream.end(); // 关闭写入流
    port.close(() => {
        console.log('Serial port closed.');
        process.exit();
    });
});
