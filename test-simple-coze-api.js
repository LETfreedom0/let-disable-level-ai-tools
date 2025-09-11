/**
 * Coze API 简单测试脚本 (使用内置https模块)
 */

const https = require('https');

// Coze API配置
const cozeConfig = {
  apiKey: 'sat_UXg8wyvJc55T3yNTaEIhgbM7pvlAn0spj8V9u1tGBldJ2YSRMXUG4BIx00RdS328',
  botId: '7548074605521682470', // 从用户提供的链接中提取的Bot ID
  apiUrl: 'api.coze.cn',
  apiPath: '/v3/chat' // 更新为v3 API端点
};

// 生成UUID作为会话ID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// 发送消息到Coze API
function sendMessageToCoze(messages, userId) {
  return new Promise((resolve, reject) => {
    // 获取最后一条用户消息
    const lastUserMessage = messages.length > 0 ? messages[messages.length - 1] : { content: '' };
    
    // 构建请求体 - 适配v3 API格式
    const requestBody = {
      bot_id: cozeConfig.botId,
      user_id: userId,
      stream: false,
      auto_save_history: true,
      additional_messages: [
        {
          role: 'user',
          content: lastUserMessage.content,
          content_type: 'text'
        }
      ]
    };
    
    const requestData = JSON.stringify(requestBody);
    console.log('发送请求:', requestData);
    
    // 请求选项
    const options = {
      hostname: cozeConfig.apiUrl,
      path: cozeConfig.apiPath,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestData),
        'Authorization': `Bearer ${cozeConfig.apiKey}`
      }
    };
    
    // 发送请求
    const req = https.request(options, (res) => {
      console.log(`状态码: ${res.statusCode}`);
      
      let responseData = '';
      
      // 接收数据
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      // 数据接收完成
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const parsedData = JSON.parse(responseData);
            console.log('API响应:', JSON.stringify(parsedData, null, 2));
            // 处理v3 API的响应格式
            resolve(parsedData);
          } catch (error) {
            console.error('解析响应失败:', error);
            reject(error);
          }
        } else {
          console.error('API请求失败:', responseData);
          reject(new Error(`API请求失败: ${res.statusCode} - ${responseData}`));
        }
      });
    });
    
    // 错误处理
    req.on('error', (error) => {
      console.error('请求错误:', error);
      reject(error);
    });
    
    // 发送请求数据
    req.write(requestData);
    req.end();
  });
}

// 测试消息
const testMessages = [
  {
    role: 'user',
    content: '你好，我想了解残疾等级评定的标准'
  }
];

// 生成用户ID
const userId = generateUUID();

// 测试API调用
console.log('开始测试Coze API调用...');
console.log('用户ID:', userId);
console.log('发送消息:', testMessages[0].content);

sendMessageToCoze(testMessages, userId)
  .then(response => {
    console.log('API调用成功!');
    // 处理v3 API的响应格式
    if (response.data && response.data.messages && response.data.messages.length > 0) {
      console.log('AI回复:', response.data.messages[0].content);
    } else {
      console.log('未收到有效回复');
    }
  })
  .catch(error => {
    console.error('API调用失败:', error);
  });