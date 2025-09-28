<template>
  <ChatUI 
    :title="title"
    :welcomeMessage="welcomeMessage"
    :placeholder="placeholder"
    :botId="botId"
    @response-completed="handleResponse"
  />
</template>

<script>
import { parseAssessmentResult } from '@/utils/cozeApi.js';

export default {
  data() {
    return {
      type: 'disability', // 默认为残疾等级评定
      title: '残疾等级评定',
      welcomeMessage: '您好，我是残疾等级评定助手。请告诉我您的情况，我将为您提供初步评估。',
      placeholder: '请输入您的情况...',
      botIds: {
        disability: '7396873195281907778', // 残疾等级评定机器人ID
        license: '7396873195281907778',    // 驾照咨询机器人ID (暂用相同ID)
        exam: '7396873195281907778'        // 公考咨询机器人ID (暂用相同ID)
      },
      botId: '7396873195281907778',
      showResult: false,
      assessmentResult: null
    };
  },
  onLoad(options) {
    // 从URL参数获取功能类型、标题和欢迎消息
    if (options.type) {
      this.type = options.type;
      
      // 设置对应的机器人ID
      if (this.botIds[this.type]) {
        this.botId = this.botIds[this.type];
      }
    }
    
    // 如果有传入标题，则使用传入的标题
    if (options.title) {
      this.title = decodeURIComponent(options.title);
    }
    
    // 如果有传入欢迎消息，则使用传入的欢迎消息
    if (options.welcomeMessage) {
      this.welcomeMessage = decodeURIComponent(options.welcomeMessage);
    }
    
    // 根据功能类型设置不同的占位符文本
    switch (this.type) {
      case 'disability':
        this.placeholder = '请描述您的残疾情况...';
        break;
      case 'license':
        this.placeholder = '请输入您关于驾照申领的问题...';
        break;
      case 'exam':
        this.placeholder = '请输入您关于公考政策的问题...';
        break;
    }
  },
  methods: {
    handleResponse(response) {
      // 只有残疾等级评定功能需要解析评估结果
      if (this.type === 'disability') {
        const result = parseAssessmentResult(response);
        if (result) {
          this.assessmentResult = result;
          this.showResult = true;
          // 显示评估结果弹窗
          uni.showModal({
            title: '初步评估结果',
            content: `残疾类别: ${result.type}\n残疾等级: ${result.level}\n评估说明: ${result.description}\n后续建议: ${result.suggestion}`,
            showCancel: false,
            confirmText: '确定'
          });
        }
      }
    }
  }
};
</script>

<style>
/* Styles can be minimal as they are handled by the ChatUI component */
</style>