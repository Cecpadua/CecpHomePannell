
export const sendCommand = (socketService, cmd, ip) => {
  if (cmd == null) {
    throw new Error('Command not found');
  }
  if (ip == null) {
    throw new Error('IP not found');
  }
  let command = JSON.stringify(
    {
      type: 'light',
      cmd: cmd.replaceAll(' ', ''),
      ip: ip
    }
  );
  socketService.send(
    command
  )
  //console.info(`Light command send: ${command}`);
}

// once
export const onCommandResponse = (socketService, callback, ip) => {
  let handler = (message) => {
    // JSON.stringify({ type: 'response', from: cmd.ip, data: data })
    message = JSON.parse(message);
    if (message.type == 'response' && message.from == ip) {
      callback(message.data);
    }
  }
  socketService.addOnMessageListener(handler);
}

const calcCrc = (cmd) => {
  const cmdArr = cmd.split(' ').map((v) => parseInt(v, 16)); // 转换为十六进制数组
  // 计算 CRC-16 (Modbus)
  const crc = calculateCRC16Modbus(cmdArr);
  const crcLow = (crc & 0xFF).toString(16).padStart(2, '0').toUpperCase(); // CRC低字节
  const crcHigh = ((crc >> 8) & 0xFF).toString(16).padStart(2, '0').toUpperCase(); // CRC高字节
  return cmd + ' ' + crcLow + ' ' + crcHigh;
};

const calculateCRC16Modbus = (buffer) => {
  let crc = 0xFFFF; // Modbus CRC 初始值为 0xFFFF
  for (const byte of buffer) {
    crc ^= byte; // 与字节异或
    for (let i = 0; i < 8; i++) { // 循环移位8次
      if (crc & 0x0001) {
        crc = (crc >> 1) ^ 0xA001; // 右移并异或多项式 0xA001
      } else {
        crc >>= 1; // 仅右移
      }
    }
  }
  return crc;
};

const decToHex = (dec) => {
  return dec.toString(16).padStart(2, '0').toUpperCase();
};

const hexToDec = (hex) => {
  return parseInt(hex, 16);
}

// [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1] => 'FF FF FF FF'
const arrToBitHex = (arr) => {
  let hex = '';
  for (let i = 0; i < arr.length; i += 8) {
    let byte = arr.slice(i, i + 8).join('');
    hex += decToHex(parseInt(byte, 2)) + ' ';
  }
  hex = hex.trim();
  return hex;
}

const bitHexToArr = (hex) => {
  hex = hex.replaceAll(' ', '');
  let arr = [];
  for (let i = 0; i < hex.length; i++) {
    let byte = parseInt(hex[i], 16).toString(2).padStart(4, '0');
    // to int array arr = arr.concat(byte.split('')); 
    for (let j = 0; j < byte.length; j++) {
      arr.push(parseInt(byte[j]));
    }

  }
  return arr;
}

////////////////////////////////////////



export const LIGHT_ON = 'FF 00'; // 开灯
export const LIGHT_OFF = '00 00'; // 关灯
export const LIGHT_FLIP = '55 00'; // 翻转

const ALL_LIGHTS = '00 FF'; // 所有灯

export const ALL_GROUPS = '00'; // 所有组
export const GROUP1 = '01'; // 组1
export const GROUP2 = '02'; // 组2
//..
export const READ = '01'; // 读取命令
const READ_ADDRESS_VERSION = '03'; // 读取地址命令
export const WRITE = '05'; // 写入命令
const SET_BAUDRATE_ADDRESS = '06'; // 设置波特率命令
export const WRITE_MULTI = '0F'; // 写入多个命令

const getLightAddress = (channel) => {
  if (channel < 0 || channel > 30) {
    throw new Error('Channel out of range');
  }
  return '00 ' + decToHex(channel - 1);
}

// cdm = "0005000e0000add8"
export const readResult = (cmd) => {
  let crc = cmd.slice(-4).match(/.{2}/g).join(' ');
  let data = cmd.slice(0, -4).match(/.{2}/g).join(' ');
  if (crc != calcCrc(data).slice(-5).trim()) {
    throw new Error('CRC error');
  } else {
    console.log('CRC OK');
  }
  let deviceAddress = cmd.slice(0, 2);
  let cmdType = cmd.slice(2, 4);
  if (cmdType == READ) { // 读取命令
    let bytes = hexToDec(cmd.slice(4, 6));
    let queryResult = cmd.slice(6, 6 + bytes * 2);
    return { type: READ, data: bitHexToArr(queryResult).reverse() };

  } else if (cmdType == WRITE) {
    let address = cmd.slice(4, 8);
    let data = cmd.slice(8, 12);
    let status = (data.slice(0, 2) + ' ' + data.slice(2, 4)) == LIGHT_ON;
    if (address == ALL_LIGHTS.replace(' ', '')) {
      return { type: WRITE, address: 255, data: status };
    } else {
      return { type: WRITE, address: hexToDec(address.slice(2, 4)), data: status };
    }
  } else if (cmdType == WRITE_MULTI) {
    return { type: WRITE_MULTI };
  } else {
    console.log('Unknown command');
  }
}

export const readReceiveCmd = (action, cmd) => {
  let cmdArr = cmd.split(' ');
  let command = cmdArr.slice(0, -2).join(' ').trim();
  let crc = cmdArr.slice(-2).join(' ').trim();
  if (crc != calcCrc(command).slice(-5).trim()) {
    throw new Error('CRC error');
  } else {
    console.log('CRC OK');
  }

  if (action == 'single' || action == 'all') {
    let device_address = cmdArr[0];
    let cmd_type = cmdArr[1];
    let light_address = cmdArr[2] + ' ' + cmdArr[3];
    let command = cmdArr[4] + ' ' + cmdArr[5];
    return { device_address, cmd_type, light_address, command };
  } else if (action == 'read') { // tested
    let device_address = cmdArr[0];
    let cmd_type = cmdArr[1];
    let bytes = hexToDec(cmdArr[2]);
    let queryResult = cmdArr.slice(3, 3 + bytes);
    console.log(queryResult.join(' '));
    arr = bitHexToArr(queryResult.join(' '));
    arr = arr.reverse();
    return arr;
  } else if (action == 'write') {
    let device_address = cmdArr[0];
    let cmd_type = cmdArr[1];
    let start_address = cmdArr[2] + ' ' + cmdArr[3];
    let number = cmdArr[4] + ' ' + cmdArr[5];
  } else if (action == 'set_baudrate') {
    let device_address = cmdArr[0];
    let cmd_type = cmdArr[1];
    let start_address = cmdArr[2] + ' ' + cmdArr[3];
    let number = cmdArr[4] + ' ' + cmdArr[5];
  } else if (action == 'set_address') {
    let device_address = cmdArr[0];
    let cmd_type = cmdArr[1];
    let start_address = cmdArr[2] + ' ' + cmdArr[3];
    let number = cmdArr[4] + ' ' + cmdArr[5];
  } else if (action == 'read_address') {
    let device_address = cmdArr[0];
    let cmd_type = cmdArr[1];
    let bytes = hexToDec(cmdArr[2]);
    let queryResult = cmdArr.slice(3, 3 + bytes);
  }
}

export const singleControll = (device_address, light_address, command) => {
  light_address--; // 0-31
  if (light_address < 0 || light_address > 31) {
    throw new Error('Light address out of range');
  }
  let cmd = device_address + ' ' + WRITE + ' 00 ' + decToHex(light_address) + ' ' + command;
  return calcCrc(cmd);
}

export const allControll = (device_address, command) => {
  let cmd = device_address + ' ' + WRITE + ' ' + ALL_LIGHTS + ' ' + command;
  return calcCrc(cmd);
}

export const readStatus = (device_address) => {
  let cmd = device_address + ' ' + READ + ' ' + '00 00' + ' ' + '00 20';
  return calcCrc(cmd);
}
export const decodeStatus = (status) => {
  return readReceiveCmd('read', status);
}

export const turnOffBit = (socketService, ipport, bitArray, channels) => {
  readStatus(ALL_GROUPS);
  onCommandResponse(socketService, (data) => {
    let status = decodeStatus(data);
    channels.forEach((channel) => {
      status[channel] = 0;
    });
    writeStatus(ALL_GROUPS, status);
  }, ipport);
}

export const turnOnBit = (socketService, ipport, channels) => {
  sendCommand(socketService, readStatus(ALL_GROUPS), ipport);
  onCommandResponse(socketService, (data) => {
    let status = decodeStatus(data);
    channels.forEach((channel) => {
      status[channel] = 1;
    });
    sendCommand(writeStatus(ALL_GROUPS, status));
  }, ipport);
}


export const writeStatus = (device_address, bitArray) => {
  // reverse
  bitArray = bitArray.reverse();
  let cmd = device_address + ' ' + WRITE_MULTI + ' ' + '00 00' + ' ' + '00 20' + ' ' + '04' + ' ' + arrToBitHex(bitArray);
  return calcCrc(cmd);
}

/**
0x00 for no parity, 0x01 for even check, 0x02 for odd parity

0x00: 4800
0x01: 9600
0x02: 19200
0x03: 38400
0x04: 57600
0x05: 115200
0x06: 128000
0x07: 256000
*/
export const setBaudrate = (device_address, baudrate, parity) => {
  let cmd = device_address + ' ' + SET_BAUDRATE_ADDRESS + ' ' + '20 00' + ' ' + parity + ' ' + baudrate;
  return calcCrc(cmd);
}
/**
* address: 1-255
*/
export const setAddress = (device_address, address) => {
  if (address < 1 || address > 255) {
    throw new Error('Address out of range');
  }
  let cmd = device_address + ' ' + SET_BAUDRATE_ADDRESS + ' ' + '40 00' + ' ' + '00' + ' ' + decToHex(address);
  return calcCrc(cmd);
}
export const readAddress = (device_address) => {
  let cmd = device_address + ' ' + READ_ADDRESS_VERSION + ' ' + '40 00' + ' ' + '00 01';
  return calcCrc(cmd);
}

export default {
  ALL_GROUPS,
  GROUP1,
  GROUP2,
  LIGHT_ON,
  LIGHT_OFF,
  singleControll,
  allControll,
  readStatus,
  decodeStatus,
  writeStatus,
  setBaudrate,
  setAddress,
  readAddress,
  readResult,
  sendCommand,
  onCommandResponse,
  turnOffBit,
  turnOnBit
}


// test
console.log(singleControll(GROUP1, getLightAddress(1), LIGHT_ON) == '01 05 00 00 FF 00 8C 3A'); //true
console.log(singleControll(GROUP1, getLightAddress(1), LIGHT_OFF) == '01 05 00 00 00 00 CD CA');// true
console.log(singleControll(GROUP1, getLightAddress(2), LIGHT_ON) == '01 05 00 01 FF 00 DD FA');// true
console.log(singleControll(GROUP1, getLightAddress(2), LIGHT_OFF) == '01 05 00 01 00 00 9C 0A');// true

// console.log(allControll(GROUP1, LIGHT_ON) == '01 05 00 FF FF 00 BC 0A'); //true
// console.log(allControll(GROUP1, LIGHT_OFF) == '01 05 00 FF 00 00 FD FA'); //true

// console.log(writeStatus(GROUP1, [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]) == '01 0F 00 00 00 20 04 FF FF FF FF C5 1C');
// console.log(writeStatus(GROUP1, [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])=='01 0F 00 00 00 20 04 00 00 00 00 C4 88');
// console.log(writeStatus(GROUP1, [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])=='01 0F 00 00 00 20 04 00 00 00 03 84 89');

// console.log(readStatus(GROUP1) == '01 01 00 00 00 20 3D D2'); // true

// // console.log(JSON.stringify(decodeStatus('01 01 04 00 00 00 00 FB D1')) == JSON.stringify([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])); //true
// // console.log(JSON.stringify(decodeStatus('01 01 04 00 00 00 01 3A 11')) == JSON.stringify([1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1])); //true
// // console.log(JSON.stringify(decodeStatus('01 01 04 00 00 00 41 3B E1')) == JSON.stringify([1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])); //true


// console.log(setBaudrate(ALL_GROUPS, '00', '00') == '00 06 20 00 00 00 83 DB'); //true
// console.log(setBaudrate(ALL_GROUPS, '01', '00') == '00 06 20 00 00 01 42 1B');  //true
// console.log(setBaudrate(ALL_GROUPS, '05', '00') == '00 06 20 00 00 05 43 D8');  //true

// console.log(setAddress(ALL_GROUPS, 1) == '00 06 40 00 00 01 5C 1B'); //true
// console.log(setAddress(ALL_GROUPS, 2) == '00 06 40 00 00 02 1C 1A'); //true
// console.log(setAddress(ALL_GROUPS, 3) == '00 06 40 00 00 03 DD DA'); //true

// console.log(readAddress(ALL_GROUPS) == '00 03 40 00 00 01 90 1B'); 