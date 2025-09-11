/**
 * Coze API 测试脚本 (uni-app环境模拟)
 */

// 模拟uni对象
global.uni = {
  request: async function(options) {
    console.log('模拟uni.request调用:', options);
    
    // 模拟网络请求
    return new Promise((resolve, reject) => {
      // 使用fetch API实际发送请求
      fetch(options.url, {
        method: options.method,
        headers: options.header,
        body: JSON.stringify(options.data)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        resolve({
          statusCode: 200,
          data: data
        });
      })
      .catch(error => {
        console.error('请求失败:', error);
        reject({
          statusCode: 500,
          errMsg: error.message
        });
      });
    });
  }
};

// 导入cozeApi模块
import { sendMessageToCoze, generateUUID } from './utils/cozeApi.js';

// 确保Bot ID已设置为用户提供的智能体ID: 7548074605521682470

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
    console.log('AI回复:', response.message);
    if (response.assessmentResult) {
      console.log('评估结果:', response.assessmentResult);
    }
  })
  .catch(error => {
    console.error('API调用失败:', error);
  });