const { SerialPort } = require('serialport');
const fs = require('fs');
const path = require('path');

// 串口设备路径
const portName = 'COM9';  // 根据实际情况修改串口名称
const inputFilePath = path.join(__dirname, 'Left_down.txt');  // 你的 .bin 文件路径

// 初始化串口
const port = new SerialPort({
  path: portName,
  baudRate: 9600,  // 与 Arduino 的串口设置匹配
  dataBits: 8,
  stopBits: 1,
  parity: 'none',
});

// 打开串口
port.on('open', () => {
  console.log(`Serial port ${portName} opened successfully.`);

  // 读取 .bin 文件并将数据发送到 Arduino
  fs.readFile(inputFilePath, (err, data) => {
    if (err) {
      console.error('Error reading .bin file:', err);
      return;
    }

    console.log(`Sending data to Arduino: ${data}`);

    // 将二进制数据发送到 Arduino
    port.write(data, (err) => {
      if (err) {
        console.error(`Error writing to serial port: ${err.message}`);
      } else {
        console.log('Data sent to Arduino.');
      }
    });
  });
});

// 错误处理
port.on('error', (err) => {
  console.error(`Serial port error: ${err.message}`);
});
