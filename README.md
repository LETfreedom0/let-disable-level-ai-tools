# 残疾等级评定助手

基于uni-app和Coze API开发的残疾等级评定助手应用，通过AI对话方式帮助用户进行残疾等级的初步评估。

## 功能特点

- 智能对话：通过自然语言交互收集用户信息
- 专业评估：基于国家标准进行残疾等级初步评定
- 结果报告：生成评估报告和专业建议
- 美观界面：简洁直观的用户界面设计

## 技术栈

- 前端框架：uni-app
- AI对话：Coze API
- 界面设计：自适应布局，支持多端运行

## 使用说明

### 配置Coze API

在使用前，需要先配置Coze API密钥和Bot ID。请修改 `utils/cozeApi.js` 文件中的以下配置：

```javascript
// Coze API配置
const cozeConfig = {
	apiKey: 'YOUR_COZE_API_KEY', // 替换为您的Coze API密钥
	botId: 'YOUR_BOT_ID', // 替换为您的Coze Bot ID
	apiUrl: 'https://api.coze.com/v1/chat/completions' // Coze API地址
};
```

### 运行项目

1. 安装依赖

```bash
npm install
```

2. 运行项目

```bash
npm run dev:h5  # 运行H5版本
# 或
npm run dev:mp-weixin  # 运行微信小程序版本
```

## 页面说明

### 首页

首页展示应用介绍和主要功能，用户可以点击"开始评估"按钮进入对话评估界面。

### 聊天评估页

聊天评估页面通过AI对话的方式，引导用户提供相关信息，进行残疾等级的初步评估。评估完成后，会显示评估结果，包括残疾类别、等级、说明和建议。

## Coze Bot 配置建议

为了获得更好的评估效果，建议在Coze平台上配置Bot时：

1. 设置专业的残疾评定知识库
2. 配置结构化输出格式，便于应用解析评估结果
3. 添加相关的残疾等级评定标准和指南

## 注意事项

- 本应用提供的评估结果仅供参考，不能替代专业医疗机构的正式评定
- 使用前请确保已正确配置Coze API密钥和Bot ID
- 建议在网络良好的环境下使用，以确保AI对话的流畅性