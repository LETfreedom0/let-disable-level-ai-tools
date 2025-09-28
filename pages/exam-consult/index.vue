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
      title: '公考咨询',
      welcomeMessage: '您好，我是公考咨询助手。请问有什么关于残疾人参加公务员考试的问题我可以帮助您？',
      placeholder: '请输入您的问题...',
      botId: '7396876298948247618' // Replace with your actual bot ID
    };
  }
};
</script>

<style>
/* Styles are now handled by the ChatUI component */
</style>