/**
 * Coze API 测试脚本 (Node.js环境)
 */

const fetch = require('node-fetch');

// Coze API配置
const cozeConfig = {
  apiKey: 'sat_UXg8wyvJc55T3yNTaEIhgbM7pvlAn0spj8V9u1tGBldJ2YSRMXUG4BIx00RdS328',
  botId: '7548074605521682470', // 从用户提供的链接中提取的Bot ID
  apiUrl: 'https://api.coze.cn/v3/chat' // 更新为v3 API端点
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
async function sendMessageToCoze(messages, userId) {
  try {
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
    
    console.log('发送请求:', JSON.stringify(requestBody, null, 2));
    
    // 发送请求到Coze API
    const response = await fetch(cozeConfig.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cozeConfig.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });
    
    // 检查响应状态
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API请求失败: ${response.status} - ${errorText}`);
    }
    
    // 解析并返回AI回复
    const responseData = await response.json();
    console.log('API响应:', JSON.stringify(responseData, null, 2));
    
    return responseData;
  } catch (error) {
    console.error('Coze API调用失败:', error);
    throw error;
  }
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