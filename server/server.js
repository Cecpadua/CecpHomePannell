const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const WebSocket = require('ws');
const cors = require('cors');
const { json } = require('stream/consumers');
const net = require('net');


// Create Express app
const app = express();
const port = 3001;

// Enable CORS
app.use(cors());

// Open SQLite database
const db = new sqlite3.Database(path.join(__dirname, 'database/database.db'));

// Middleware to parse JSON bodies
app.use(express.json());

// Example route to fetch data from SQLite
app.get('/api/camera', (req, res) => {
  db.all('SELECT * FROM cameras', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ data: rows });
  });
});
app.delete('/api/camera/:id', (req, res) => {
  db.run('DELETE FROM cameras WHERE id = ?', req.params.id, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Camera deleted' });
  });
});
app.post('/api/camera', (req, res) => {
  db.run('INSERT INTO cameras ("name", "ip", "cmdUp", "cmdDown", "cmdStop") VALUES (?, ?, ?, ?, ?)', [req.body.name, req.body.ip, req.body.cmdUp, req.body.cmdDown, req.body.cmdStop],
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Camera added' });
    }
  );
});
app.put('/api/camera/:id', (req, res) => {

  db.run('UPDATE cameras SET name = ?, ip = ?, cmdUp = ?, cmdDown = ?, cmdStop = ? WHERE id = ?', [req.body.name, req.body.ip, req.body.cmdUp, req.body.cmdDown, req.body.cmdStop, req.params.id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Camera updated' });
    }
  );
});


app.get('/api/light', (req, res) => {
  db.all('SELECT * FROM lights order by name', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ data: rows });
  });
});
app.delete('/api/light/:id', (req, res) => {
  db.run('DELETE FROM lights WHERE id = ?', req.params.id, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Light deleted' });
  });
});
app.post('/api/light', (req, res) => {
  function _do() {
    db.run('INSERT INTO lights ("name", "ip","channel", "cmdOn", "cmdOff", "lightgroup_id") VALUES (?, ?,?, ?, ?, ?)', [req.body.name, req.body.ip, req.body.channel, req.body.cmdOn, req.body.cmdOff, req.body.lightgroup_id],
      (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Light added' });
      }
    );
  }

  // 判断channel是否存在 如果存在把他设置为空
  db.all('SELECT * FROM lights WHERE channel = ?', req.body.channel, (err, rows) => {
    if (rows.length > 0) {
      db.run('UPDATE lights SET channel = ? WHERE channel = ?', [null, req.body.channel], (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        _do();
      }
      );
    } else {
      _do();
    }
  });

  x

});
app.put('/api/light/:id', (req, res) => {
  function _do() {
    db.run('UPDATE lights SET name = ?, ip = ?,channel = ?, cmdOn = ?, cmdOff = ?, lightgroup_id = ? WHERE id = ?', [req.body.name, req.body.ip, req.body.channel, req.body.cmdOn, req.body.cmdOff,req.body.lightgroup_id, req.params.id],
      (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Light updated' });
      }
    );
  }
  db.all('SELECT * FROM lights WHERE channel = ? and id <> ? order by name', [req.body.channel,req.params.id], (err, rows) => {
    if (rows.length > 0) {
      db.run('UPDATE lights SET channel = ? WHERE channel = ?', [null, req.body.channel], (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        _do();
      }
      );
    } else {
      _do();
    }
  });

});


app.get('/api/lightgroup', (req, res) => {
  db.all('SELECT * FROM lightgroup order by name', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ data: rows });
  });
});
app.delete('/api/lightgroup/:id', (req, res) => {
  db.run('DELETE FROM lightgroup WHERE id = ?', req.params.id, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Lightgroup deleted' });
  });
});
app.post('/api/lightgroup', (req, res) => {
  db.run('INSERT INTO lightgroup ("name") VALUES (?)', [req.body.name],
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Lightgroup added' });
    }
  );
});
app.put('/api/lightgroup/:id', (req, res) => {
  db.run('UPDATE lightgroup SET name = ? WHERE id = ?', [req.body.name, req.params.id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Lightgroup updated' });
    }
  );
}
);

app.get('/api/stair', (req, res) => {
  db.all('SELECT * FROM stairs', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ data: rows });
  });
});
app.delete('/api/stair/:id', (req, res) => {
  db.run('DELETE FROM stairs WHERE id = ?', req.params.id, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Stair deleted' });
  });
});
app.post('/api/stair', (req, res) => {
  db.run('INSERT INTO stairs ("name", "ip", "cmdUp", "cmdDown", "cmdStop") VALUES (?, ?, ?, ?, ?)', [req.body.name, req.body.ip, req.body.cmdUp, req.body.cmdDown, req.body.cmdStop],
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Stair added' });
    }
  );
});
app.put('/api/stair/:id', (req, res) => {
  db.run('UPDATE stairs SET name = ?, ip = ?, cmdUp = ?, cmdDown = ?, cmdStop = ? WHERE id = ?', [req.body.name, req.body.ip, req.body.cmdUp, req.body.cmdDown, req.body.cmdStop, req.params.id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Stair updated' });
    }
  );
});

// Create an HTTP server using the express app
const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Create a WebSocket server attached to the HTTP server
const wss = new WebSocket.Server({ server });

let total = 0; // 在线人数
// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('New WebSocket connection established');
  // 在线人数+1
  total++;
  // 发送在线人数
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(`{"type": "total", "data": ${total}}`);
    }
  });

  console.log('Total clients:', wss.clients.size);

  // 如果有信息来，重新发送给所有人
  ws.on('message', (message) => {
    doAction(message.toString(), ws);

    if (total > 1)
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message.toString());
        }
      });
  });

  // Handle WebSocket close event
  ws.on('close', () => {
    console.log('WebSocket connection closed');
    // 在线人数-1
    total--;
    // 发送在线人数
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(`{"type": "total", "data": ${total}}`);
      }
    }
    );
  });
});


const creatingRequest = (ipport, cmd, callback) => {
  // 将十六进制字符串转换为 Buffer
  const command = Buffer.from(cmd, "hex");

  // 服务器地址和端口
  const ip = ipport.split(':')[0]; // 替换为目标 IP
  const port = ipport.split(':')[1]; // 替换为目标端口

  // 创建 TCP 客户端并连接到服务器
  const client = new net.Socket();
  client.connect(port, ip, () => {
    console.log(`Connected to server ${ip}:${port}`);

    // 发送字节数组
    client.write(command, () => {
      console.log('Command sent:', command);
    });
  });

  // 监听服务器回馈数据
  client.on('data', (data) => {
      console.log('Received from server:', data.toString('hex')); // 以十六进制格式显示数据
      callback(data.toString('hex'));
      // 根据需求处理数据后关闭连接
      client.end(); // 如果需要保持连接，删除这一行
  });

  // 监听错误事件
  client.on('error', (err) => {
    console.error('Error:', err.message);
  });

  // 监听连接关闭事件
  client.on('close', () => {
    console.log('Connection closed');
  });

}

// cmd is string
const doAction = (cmd, ws) => {
  // if cmd != null    ip !=null  ip is xxx:port
  try {
  cmd = JSON.parse(cmd);
  if (cmd.cmd != null && cmd.ip != null) {
    creatingRequest(cmd.ip, cmd.cmd.replaceAll(" ", ""), (data) => {
      ws.send(JSON.stringify({ type: 'response', from: cmd.ip, data: data }));
    });
  }} catch (e) {
    console.log(e);
  }
}