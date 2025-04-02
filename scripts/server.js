const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// 原始 API 的基础 URL - 确保没有尾部斜杠
const API_BASE_URL = 'https://www.diving-fish.com'; // 替换为你的实际 API URL

// 中间件配置
app.use(cors({
  origin: '*', // 允许所有来源，生产环境中应该限制为你的应用域名
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 登录代理端点
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log(`尝试登录: ${username}`);
    
    // 调用原始 API
    const response = await axios.post(`${API_BASE_URL}/api/maimaidxprober/login`, {
      username,
      password
    }, {
      // 允许获取完整响应，包括头信息
      validateStatus: () => true
    });
    
    console.log('登录响应状态:', response.status);
    
    // 从响应头中提取 cookie
    const cookies = response.headers['set-cookie'];
    let token = null;
    
    if (cookies && cookies.length > 0) {
      console.log('找到 cookies:', cookies);
      // 提取 JWT token
      const jwtCookie = cookies.find(cookie => cookie.includes('jwt_token='));
      if (jwtCookie) {
        token = jwtCookie.split(';')[0].split('=')[1];
        console.log('提取的 token:', token);
      }
    }
    
    // 构建响应
    const responseData = {
      ...response.data,
      token: token // 将 token 添加到响应体中
    };
    
    // 返回给客户端
    return res.status(response.status).json(responseData);
  } catch (error) {
    console.error('代理登录请求失败:', error.message);
    return res.status(500).json({
      error: '代理请求失败',
      message: error.message
    });
  }
});

// 用户资料代理端点
app.get('/api/profile', async (req, res) => {
  try {
    console.log('代理获取用户资料');
    
    // 从请求头中获取 token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未提供有效的授权令牌' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    console.log('使用 token:', token);
    
    // 调用原始 API
    const response = await axios.get(`${API_BASE_URL}/api/maimaidxprober/player/profile`, {
      headers: {
        'Cookie': `jwt_token=${token}`
      },
      validateStatus: () => true
    });
    
    console.log('资料响应状态:', response.status);
    
    // 返回给客户端
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('获取用户资料失败:', error.message);
    return res.status(500).json({
      error: '获取用户资料失败',
      message: error.message
    });
  }
});

// 修改密码代理端点
app.post('/api/password', async (req, res) => {
  try {
    console.log('代理修改密码');
    
    // 从请求头中获取 token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未提供有效的授权令牌' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { oldPassword, newPassword } = req.body;
    
    // 调用原始 API
    const response = await axios.post(`${API_BASE_URL}/api/maimaidxprober/user/change_password`, {
      old_password: oldPassword,
      new_password: newPassword
    }, {
      headers: {
        'Cookie': `jwt_token=${token}`
      },
      validateStatus: () => true
    });
    
    console.log('修改密码响应状态:', response.status);
    
    // 返回给客户端
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('修改密码失败:', error.message);
    return res.status(500).json({
      error: '修改密码失败',
      message: error.message
    });
  }
});

// 更新用户信息代理端点
app.post('/api/user/update', async (req, res) => {
  try {
    console.log('代理更新用户信息');
    
    // 从请求头中获取 token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未提供有效的授权令牌' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // 调用原始 API
    const response = await axios.post(`${API_BASE_URL}/api/maimaidxprober/user/update`, req.body, {
      headers: {
        'Cookie': `jwt_token=${token}`
      },
      validateStatus: () => true
    });
    
    console.log('更新用户信息响应状态:', response.status);
    
    // 返回给客户端
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('更新用户信息失败:', error.message);
    return res.status(500).json({
      error: '更新用户信息失败',
      message: error.message
    });
  }
});

// 设置用户资料代理端点
app.post('/api/profile', async (req, res) => {
  try {
    console.log('代理设置用户资料');
    
    // 从请求头中获取 token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未提供有效的授权令牌' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    console.log('使用 token:', token);
    
    // 从请求体中获取数据
    const { bind_qq, qq_channel_uid, nickname } = req.body;
    
    // 调用原始 API
    const response = await axios.post(`${API_BASE_URL}/api/maimaidxprober/player/profile`, {
      bind_qq,
      qq_channel_uid,
      nickname
    }, {
      headers: {
        'Cookie': `jwt_token=${token}`
      },
      validateStatus: () => true
    });
    
    console.log('设置用户资料响应状态:', response.status);
    
    // 返回给客户端
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('设置用户资料失败:', error.message);
    return res.status(500).json({
      error: '设置用户资料失败',
      message: error.message
    });
  }
});

// 用户记录代理端点
app.get('/api/records', async (req, res) => {
  try {
    console.log('代理获取用户记录');
    
    // 从请求头中获取 token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未提供有效的授权令牌' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    console.log('使用 token:', token);
    
    // 调用原始 API
    const response = await axios.get(`${API_BASE_URL}/api/maimaidxprober/player/records`, {
      headers: {
        'Cookie': `jwt_token=${token}`
      },
      validateStatus: () => true
    });
    
    console.log('记录响应状态:', response.status);
    
    // 返回给客户端
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('获取用户记录失败:', error.message);
    return res.status(500).json({
      error: '获取用户记录失败',
      message: error.message
    });
  }
});

// 刷新导入token代理端点
app.put('/api/import_token', async (req, res) => {
  try {
    console.log('代理刷新导入token');
    
    // 从请求头中获取 token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未提供有效的授权令牌' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    console.log('使用 token:', token);
    
    // 调用原始 API
    const response = await axios.put(`${API_BASE_URL}/api/maimaidxprober/player/import_token`, {}, {
      headers: {
        'Cookie': `jwt_token=${token}`
      },
      validateStatus: () => true
    });
    
    console.log('刷新导入token响应状态:', response.status);
    
    // 返回给客户端
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('刷新导入token失败:', error.message);
    return res.status(500).json({
      error: '刷新导入token失败',
      message: error.message
    });
  }
});

// 接受协议代理端点
app.post('/api/agreement', async (req, res) => {
  try {
    console.log('代理接受协议');
    
    // 从请求头中获取 token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未提供有效的授权令牌' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    console.log('使用 token:', token);
    
    // 调用原始 API
    const response = await axios.post(`${API_BASE_URL}/api/maimaidxprober/player/agreement`, {
      accept_agreement: true
    }, {
      headers: {
        'Cookie': `jwt_token=${token}`
      },
      validateStatus: () => true
    });
    
    console.log('接受协议响应状态:', response.status);
    
    // 返回给客户端
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('接受协议失败:', error.message);
    return res.status(500).json({
      error: '接受协议失败',
      message: error.message
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`代理服务器运行在 http://localhost:${PORT}`);
});