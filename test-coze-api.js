/**
 * Coze API 测试脚本
 * 用于测试与Coze API的连接
 */

import { sendMessageToCoze, generateUUID } from './utils/cozeApi.js';

// 测试消息
const testMessages = [
  {
    role: 'user',
    content: '你好，我想了解残疾等级评定的标准'
  }
];

// 生成会话ID
const conversationId = generateUUID();

// 测试API调用
console.log('开始测试Coze API调用...');
console.log('会话ID:', conversationId);
console.log('发送消息:', testMessages[0].content);

sendMessageToCoze(testMessages, conversationId)
  .then(response => {
    console.log('API调用成功!');
    console.log('AI回复:', response);
  })
  .catch(error => {
    console.error('API调用失败:', error);
  });