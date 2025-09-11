# Coze API 使用指南

## 概述

本文档介绍如何在残疾等级评定助手应用中使用Coze API进行AI对话。

## API配置

在`utils/cozeApi.js`文件中，已配置以下内容：

```javascript
// Coze API配置
const cozeConfig = {
  apiKey: 'sat_UXg8wyvJc55T3yNTaEIhgbM7pvlAn0spj8V9u1tGBldJ2YSRMXUG4BIx00RdS328', // API密钥
  botId: '7548074605521682470', // 从用户提供的链接中提取的Bot ID
  apiUrl: 'https://api.coze.cn/v3/chat' // 中国区API地址
};
```

**注意：** Bot ID已经配置为用户提供的智能体ID。

## 使用方法

### 1. 在Vue组件中调用

```javascript
import { sendMessageToCoze, generateUUID } from '../../utils/cozeApi.js';

// 生成用户ID
const userId = generateUUID();

// 构建消息历史（只需要包含最后一条用户消息）
const messageHistory = [
  {
    role: 'user',
    content: '用户消息内容'
  }
];

// 调用API
sendMessageToCoze(messageHistory, userId)
  .then(response => {
    // 处理AI回复
    const aiMessage = response.message;
    console.log('AI回复:', aiMessage);
    
    // 检查是否有评估结果
    if (response.assessmentResult) {
      console.log('评估结果:', response.assessmentResult);
    }
  })
  .catch(error => {
    console.error('API调用失败:', error);
  });
```

### 2. 测试脚本

项目中提供了以下测试脚本：

- `test-coze-api.html` - 浏览器环境测试页面
- `test-simple-coze-api.js` - Node.js环境测试脚本

## API响应格式

成功响应示例 (v3 API)：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "chat": {
      "id": "chat_123456789",
      "status": "completed",
      "usage": {
        "prompt_tokens": 123,
        "completion_tokens": 456,
        "total_tokens": 579
      }
    },
    "messages": [
      {
        "role": "assistant",
        "content": "根据《中华人民共和国残疾人证管理办法》，残疾等级评定分为四级...",
        "content_type": "text"
      }
    ]
  }
}
```

## 评估结果解析

系统会自动解析AI回复中的评估结果，格式如下：

```json
{
  "type": "肢体残疾",
  "level": "三级",
  "description": "根据您提供的信息，您的情况符合肢体残疾三级标准...",
  "suggestion": "建议您携带相关医疗证明前往当地残联进行正式评定..."
}
```

## 注意事项

1. API密钥请妥善保管，不要泄露
2. 在生产环境中，建议将API密钥存储在服务器端
3. 确保Bot已在Coze平台正确配置，并具有评估残疾等级的能力

## 参考文档

- [Coze API认证文档](https://www.coze.cn/open/docs/developer_guides/authentication)
- [Coze API聊天完成文档](https://www.coze.cn/open/docs/api-reference/chat/completions)