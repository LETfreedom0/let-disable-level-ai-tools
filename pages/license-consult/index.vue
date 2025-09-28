<template>
  <ChatUI 
    :title="title"
    :welcomeMessage="welcomeMessage"
    :placeholder="placeholder"
    :botId="botId"
  />
</template>

<script>
import ChatUI from '../../components/ChatUI.vue';

export default {
  components: {
    ChatUI
  },
  data() {
    return {
      title: '驾照咨询',
      welcomeMessage: '您好，我是驾照咨询助手。请问有什么关于残疾人驾照的问题我可以帮助您？',
      placeholder: '请输入您的问题...',
      botId: '7396875584555040834' // Replace with your actual bot ID
    };
  }
};
</script>

<style>
/* Styles are now handled by the ChatUI component */
</style>