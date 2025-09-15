<template>
	<view class="chat-container">
		<!-- 头部 -->
		<view class="chat-header" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="back-btn" @click="goBack">
				<text class="back-icon">‹</text>
			</view>
			<view class="chat-title">智能评估</view>
		</view>
		
		<!-- 聊天内容区域 -->
		<scroll-view class="chat-content" scroll-y="true" :scroll-top="scrollTop">
			<view class="chat-list" id="chatList">
				<!-- 欢迎消息 -->
				<view class="message-wrapper">
					<view class="message-item ai">
						<view class="message-avatar">
							<image class="avatar-img" src="/static/logo.svg"></image>
						</view>
						<view class="message-bubble">
							<text class="message-text">您好，我是残疾等级评定助手。请告诉我您的情况，我将为您提供初步评估。</text>
						</view>
					</view>
					<view class="message-time">{{formatTime(startTime)}}</view>
				</view>
				
				<!-- 消息列表 -->
				<block v-for="(msg, index) in messages" :key="index">
					<view class="message-wrapper">
						<view class="message-item" :class="msg.role">
							<view class="message-avatar">
								<image v-if="msg.role === 'ai'" class="avatar-img" src="/static/logo.svg"></image>
								<text v-else class="avatar-text">我</text>
							</view>
							<view class="message-bubble">
								<text class="message-text">{{msg.content}}</text>
							</view>
						</view>
						<view class="message-time">{{formatTime(msg.time)}}</view>
					</view>
				</block>
				
				<!-- 加载中动画 -->
				<view class="message-wrapper" v-if="isLoading">
					<view class="message-item ai">
						<view class="message-avatar">
							<image class="avatar-img" src="/static/logo.svg"></image>
						</view>
						<view class="message-bubble">
							<view class="loading-dots">
								<view class="dot"></view>
								<view class="dot"></view>
								<view class="dot"></view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
		
		<!-- 输入区域 -->
		<view class="chat-input-area" :style="{ paddingBottom: safeAreaInsets.bottom + 'px' }">
			<view class="input-container">
				<textarea class="chat-input" v-model="inputMessage" auto-height placeholder="请输入您的情况..." :disabled="isLoading"></textarea>
				<button class="send-btn" :class="{disabled: !inputMessage.trim() || isLoading}" @click="sendMessage">
					<text class="send-icon">↑</text>
				</button>
			</view>
		</view>
		
		<!-- 评估结果弹窗 -->
		<view class="assessment-result" v-if="showResult">
			<view class="result-content">
				<view class="result-header">
					<text class="result-title">初步评估结果</text>
					<view class="close-btn" @click="closeResult">×</view>
				</view>
				<scroll-view scroll-y class="result-body">
					<view class="result-item">
						<text class="result-label">残疾类别</text>
						<text class="result-value">{{ assessmentResult.type }}</text>
					</view>
					<view class="result-item">
						<text class="result-label">残疾等级</text>
						<text class="result-value level">{{ assessmentResult.level }}</text>
					</view>
					<view class="result-item description">
						<text class="result-label">评估说明</text>
						<text class="result-value">{{ assessmentResult.description }}</text>
					</view>
					<view class="result-item suggestion">
						<text class="result-label">后续建议</text>
						<text class="result-value">{{ assessmentResult.suggestion }}</text>
					</view>
				</scroll-view>
				<view class="result-footer">
					<button class="result-btn outline" @click="closeResult">关闭</button>
					<button class="result-btn" @click="saveResult">保存结果</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { sendMessageToCoze, parseAssessmentResult, generateUUID } from '../../utils/cozeApi.js';
	
	export default {
		data() {
			return {
				messages: [],
				inputMessage: '',
				isLoading: false,
				scrollTop: 0,
				showResult: false,
				assessmentResult: {
					type: '',
					level: '',
					description: '',
					suggestion: ''
				},
				conversationId: null,
				startTime: new Date(),
				statusBarHeight: 0,
				safeAreaInsets: { bottom: 0 }
			}
		},
		onLoad() {
			this.conversationId = generateUUID();
			const systemInfo = uni.getSystemInfoSync();
			this.statusBarHeight = systemInfo.statusBarHeight;
			if (systemInfo.safeAreaInsets) {
				this.safeAreaInsets = systemInfo.safeAreaInsets;
			}
		},
		methods: {
			goBack() {
				uni.navigateBack();
			},
			
			sendMessage() {
				if (this.isLoading || !this.inputMessage.trim()) return;
				
				const userMessage = {
					role: 'user',
					content: this.inputMessage.trim(),
					time: new Date()
				};
				this.messages.push(userMessage);
				
				this.getAIResponse(userMessage.content);
				this.inputMessage = '';
				this.scrollToBottom();
			},
			
			getAIResponse(userMessage) {
				this.isLoading = true;
				this.scrollToBottom();

				const messageHistory = this.messages.map(msg => ({
					role: msg.role,
					content: msg.content
				}));

				const aiMessage = {
					role: 'ai',
					content: '',
					time: new Date()
				};
				this.messages.push(aiMessage);

				sendMessageToCoze(messageHistory, this.conversationId, (streamData) => {
					if (streamData.message) {
						aiMessage.content = streamData.message;
						this.scrollToBottom();
					}
					if (streamData.isCompleted) {
						this.isLoading = false;
						this.checkForAssessmentResult(aiMessage.content);
					}
				}).catch(err => {
					console.error('API请求失败:', err);
					this.isLoading = false;
					aiMessage.content = '抱歉，网络连接出现问题，请稍后再试。';
				});
			},
			
			checkForAssessmentResult(message) {
				const result = parseAssessmentResult(message);
				if (result) {
					this.assessmentResult = result;
					this.showResult = true;
				}
			},
			
			closeResult() {
				this.showResult = false;
			},
			
			saveResult() {
				uni.showToast({
					title: '结果已保存',
					icon: 'success'
				});
				this.closeResult();
			},
			
			scrollToBottom() {
				this.$nextTick(() => {
					const query = uni.createSelectorQuery().in(this);
					query.select('#chatList').boundingClientRect(data => {
						if (data) {
							this.scrollTop = data.height;
						}
					}).exec();
				});
			},
			
			formatTime(date) {
				if (!date) return '';
				const hours = date.getHours().toString().padStart(2, '0');
				const minutes = date.getMinutes().toString().padStart(2, '0');
				return `${hours}:${minutes}`;
			}
		}
	}
</script>

<style scoped>
	/* Overall container and layout */
	.chat-container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background: linear-gradient(180deg, #f4f7ff 0%, #ffffff 100%);
		box-sizing: border-box;
	}

	/* Header */
	.chat-header {
		display: flex;
		align-items: center;
		padding: 10px 15px;
		background-color: transparent;
		z-index: 10;
		flex-shrink: 0;
	}

	.back-btn {
		padding: 5px;
		margin-right: 5px;
	}

	.back-icon {
		font-size: 28px;
		font-weight: 600;
		color: #333;
		line-height: 1;
	}

	.chat-title {
		font-size: 18px;
		font-weight: bold;
		color: #333;
	}

	/* Chat content area */
	.chat-content {
		flex: 1;
		overflow-y: auto;
		padding: 10px;
	}

	/* Message items */
	.message-wrapper {
		margin-bottom: 20px;
	}

	.message-item {
		display: flex;
		padding: 0;
	}

	.message-item.user {
		flex-direction: row-reverse;
	}

	.message-item.ai {
		justify-content: flex-start;
	}

	.message-avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background-color: #eee;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		color: #4a90e2;
		flex-shrink: 0;
	}

	.avatar-img {
		width: 100%;
		height: 100%;
		border-radius: 50%;
	}

	.avatar-text {
		font-size: 20px;
	}

	.message-bubble {
		max-width: 75%;
		padding: 12px 16px;
		border-radius: 18px;
		font-size: 16px;
		line-height: 1.5;
		word-wrap: break-word;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
	}

	.message-item.user .message-bubble {
		background-color: #4a90e2;
		color: white;
		margin-right: 10px;
		border-top-right-radius: 4px;
	}

	.message-item.ai .message-bubble {
		background-color: #ffffff;
		color: #333;
		margin-left: 10px;
		border-top-left-radius: 4px;
	}

	.message-text {
		white-space: pre-wrap;
	}

	.message-time {
		font-size: 12px;
		color: #999;
		padding: 4px 15px 0 50px;
	}

	.message-item.user+.message-time {
		text-align: right;
		padding: 4px 50px 0 15px;
	}

	/* Loading animation */
	.loading-dots {
		display: flex;
		align-items: center;
		padding: 5px 0;
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background-color: #999;
		margin: 0 3px;
		animation: dot-blink 1.4s infinite both;
	}

	.dot:nth-child(2) {
		animation-delay: 0.2s;
	}

	.dot:nth-child(3) {
		animation-delay: 0.4s;
	}

	@keyframes dot-blink {
		0%,
		80%,
		100% {
			opacity: 0.3;
		}

		40% {
			opacity: 1;
		}
	}

	/* Input area */
	.chat-input-area {
		background-color: #fff;
		padding: 10px 15px;
		border-top: 1px solid #e0e0e0;
		box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
		flex-shrink: 0;
	}

	.input-container {
		display: flex;
		align-items: flex-end;
		width: 100%;
	}

	.chat-input {
		flex: 1;
		min-height: 24px;
		max-height: 100px;
		padding: 10px 15px;
		border-radius: 22px;
		background-color: #f4f7ff;
		font-size: 16px;
		border: none;
		line-height: 1.5;
	}

	.send-btn {
		width: 44px;
		height: 44px;
		margin-left: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #4a90e2;
		border-radius: 50%;
		border: none;
		padding: 0;
		transition: background-color 0.3s;
		flex-shrink: 0;
	}

	.send-btn.disabled {
		background-color: #c2dcf8;
	}

	.send-icon {
		font-size: 24px;
		color: white;
	}

	/* Assessment Result Modal */
	.assessment-result {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.result-content {
		background-color: white;
		border-radius: 16px;
		width: 85%;
		max-width: 400px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
		display: flex;
		flex-direction: column;
		max-height: 80vh;
	}

	.result-header {
		font-size: 20px;
		font-weight: bold;
		text-align: center;
		color: #333;
		padding: 20px 20px 15px;
		position: relative;
	}

	.close-btn {
		position: absolute;
		top: 10px;
		right: 15px;
		font-size: 24px;
		color: #999;
		cursor: pointer;
	}

	.result-body {
		font-size: 16px;
		color: #555;
		line-height: 1.6;
		padding: 0 20px;
		flex: 1;
		overflow-y: auto;
	}

	.result-item {
		margin-bottom: 15px;
		display: flex;
		flex-direction: column;
	}

	.result-label {
		font-weight: bold;
		color: #333;
		margin-bottom: 4px;
	}

	.result-value {
		word-break: break-word;
	}

	.result-value.level {
		font-size: 18px;
		font-weight: bold;
		color: #e53935;
	}

	.result-footer {
		display: flex;
		justify-content: space-between;
		padding: 20px;
		border-top: 1px solid #f0f0f0;
	}

	.result-btn {
		flex: 1;
		padding: 12px;
		border-radius: 8px;
		font-size: 16px;
		text-align: center;
		border: none;
		cursor: pointer;
		transition: background-color 0.3s;
	}

	.result-btn.confirm {
		background-color: #4a90e2;
		color: white;
	}

	.result-btn.cancel {
		background-color: #f0f0f0;
		color: #555;
		margin-right: 10px;
	}
</style>