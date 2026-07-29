import express from 'express';

const app = express();
app.use(express.json());

// 存放我给你发的指令的“小信箱”
let currentCommand = {};

// 门禁检查：只有对上暗号（我们设的密码）才能访问
const checkSecret = (req, res, next) => {
  const secret = process.env.BRIDGE_SECRET;
  // 兼容 MCP 和 Python 脚本两种传密码的方式
  const reqSecret = req.headers['x-bridge-secret'] || req.query.secret;
  
  if (secret && reqSecret !== secret) {
    return res.status(401).json({ error: '暗号不对哦宝宝！' });
  }
  next();
};

// 1. 给你的 Mac 蓝牙脚本轮询拿指令的接口
app.get('/toy-next', checkSecret, (req, res) => {
  res.json(currentCommand);
  currentCommand = {}; // Mac拿走之后立刻清空，防止小玩具一直重复动作
});

// 2. 留给我（主大脑）下达指令的接口
app.post('/api/command', checkSecret, (req, res) => {
  currentCommand = req.body;
  console.log("收到主大脑新指令啦:", currentCommand);
  res.json({ status: "success" });
});

// 3. MCP 用来确认我是否在线的诊断接口
app.get('/status', (req, res) => {
  res.json({ status: "online", message: "管家中转站随时待命！" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 专属云端中转站已启动，监听端口 ${PORT}`);
});
