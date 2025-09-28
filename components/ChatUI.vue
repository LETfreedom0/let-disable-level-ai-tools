<template>
	<view class="chat-container">
		<view class="chat-header" :style="{ 
			paddingTop: (safeAreaInsets.top + statusBarHeight + 10) + 'px',
			height: (44 + safeAreaInsets.top + statusBarHeight + 10) + 'px'
		}">
			<view class="back-btn" @click="goBack">
				<text class="back-icon">‹</text>
			</view>
			<view class="chat-title">{{ title }}</view>
		</view>

		<scroll-view 
			class="chat-content" 
			scroll-y="true" 
			:scroll-top="scrollTop"
			:scroll-into-view="scrollIntoView"
			scroll-with-animation="true"
			:style="{
				paddingTop: (44 + safeAreaInsets.top + statusBarHeight + 20) + 'px',
				paddingBottom: (100 + safeAreaInsets.bottom) + 'px'
			}"
		>
			<view class="chat-list" id="chatList">
				<view class="message-wrapper">
					<view class="message-item ai">
						<view class="message-avatar">
							<image class="avatar-img" src="/static/logo.svg"></image>
						</view>
						<view class="message-bubble">
							<text class="message-text">{{ welcomeMessage }}</text>
						</view>
					</view>
					<view class="message-time">{{formatTime(startTime)}}</view>
				</view>

				<block v-for="(msg, index) in messages" :key="index">
					<view class="message-wrapper" :id="'msg-' + index">
						<view class="message-item" :class="[msg.role, msg.isNew ? 'message-new' : '']">
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

				<view class="message-wrapper" v-if="isLoading" id="loading-msg">
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

		<view class="chat-input-area" :style="{ 
			paddingBottom: (safeAreaInsets.bottom + 20) + 'px',
			bottom: (keyboardHeight > 0 ? keyboardHeight : safeAreaInsets.bottom + 30) + 'px'
		}">
			<view class="input-container">
				<textarea 
					class="chat-input" 
					v-model="inputMessage" 
					auto-height 
					:placeholder="placeholder" 
					:disabled="isLoading"
					@focus="onInputFocus"
					@blur="onInputBlur"
					:adjust-position="false"
				></textarea>
				<button class="send-btn" :class="{disabled: !inputMessage.trim() || isLoading}" @click="sendMessage">
					<text class="send-icon">↑</text>
				</button>
			</view>
		</view>
	</view>
</template>

<script>
	import { sendMessageToCoze, parseAssessmentResult, generateUUID } from '../utils/cozeApi.js';

	export default {
		name: "ChatUI",
		props: {
			title: {
				type: String,
				default: '智能咨询'
			},
			welcomeMessage: {
				type: String,
				default: '您好，请问有什么可以帮助您？'
			},
			placeholder: {
				type: String,
				default: '请输入您的问题...'
			},
			botId: {
				type: String,
				required: true
			}
		},
		data() {
			return {
				messages: [],
				inputMessage: '',
				isLoading: false,
				scrollTop: 0,
				scrollIntoView: '',
				conversationId: null,
				startTime: new Date(),
				statusBarHeight: 0,
				safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
				keyboardHeight: 0,
				isInputFocused: false
			}
		},
		onLoad() {
			this.conversationId = generateUUID();
			const systemInfo = uni.getSystemInfoSync();
			this.statusBarHeight = systemInfo.statusBarHeight || 0;
			
			console.log('系统信息:', systemInfo);
			
			// 获取安全区域信息 - 优先使用safeAreaInsets
			if (systemInfo.safeAreaInsets) {
				this.safeAreaInsets = {
					top: systemInfo.safeAreaInsets.top || 0,
					bottom: systemInfo.safeAreaInsets.bottom || 0,
					left: systemInfo.safeAreaInsets.left || 0,
					right: systemInfo.safeAreaInsets.right || 0
				};
			} else if (systemInfo.safeArea) {
				// 兼容处理 - 计算安全区域
				this.safeAreaInsets = {
					top: systemInfo.safeArea.top || 0,
					bottom: Math.max(0, systemInfo.screenHeight - systemInfo.safeArea.bottom) || 0,
					left: systemInfo.safeArea.left || 0,
					right: Math.max(0, systemInfo.screenWidth - systemInfo.safeArea.right) || 0
				};
			} else {
				// 默认值 - 为iPhone X系列设备设置默认安全区域
				if (systemInfo.model && systemInfo.model.includes('iPhone')) {
					this.safeAreaInsets = {
						top: 44, // iPhone X系列刘海高度
						bottom: 34, // iPhone X系列底部安全区域
						left: 0,
						right: 0
					};
				}
			}
			
			console.log('安全区域信息:', this.safeAreaInsets);
			
			// 监听键盘高度变化
			uni.onKeyboardHeightChange((res) => {
				this.keyboardHeight = res.height;
				if (res.height > 0 && this.isInputFocused) {
					// 键盘弹出时滚动到底部
					setTimeout(() => {
						this.scrollToBottom();
					}, 100);
				}
			});
		},
		onUnload() {
			// 移除键盘监听
			uni.offKeyboardHeightChange();
		},
		methods: {
			goBack() {
				uni.navigateBack();
			},
			
			onInputFocus() {
				this.isInputFocused = true;
				// 延迟滚动，等待键盘完全弹出
				setTimeout(() => {
					this.scrollToBottom();
				}, 300);
			},
			
			onInputBlur() {
				this.isInputFocused = false;
			},
			
			sendMessage() {
				if (this.isLoading || !this.inputMessage.trim()) return;
				
				const userMessage = {
					role: 'user',
					content: this.inputMessage.trim(),
					time: new Date(),
					isNew: true
				};
				this.messages.push(userMessage);
				
				// 移除新消息标记
				setTimeout(() => {
					userMessage.isNew = false;
				}, 500);
				
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
					time: new Date(),
					isNew: true
				};
				this.messages.push(aiMessage);

				sendMessageToCoze(this.botId, messageHistory, this.conversationId, (streamData) => {
					if (streamData.message) {
						aiMessage.content = streamData.message;
						this.scrollToBottom();
					}
					if (streamData.isCompleted) {
						this.isLoading = false;
						// 移除新消息标记
						setTimeout(() => {
							aiMessage.isNew = false;
						}, 500);
						this.$emit('response-completed', aiMessage.content);
					}
				}).catch(err => {
					console.error('API请求失败:', err);
					this.isLoading = false;
					aiMessage.content = '抱歉，网络连接出现问题，请稍后再试。';
					// 移除新消息标记
					setTimeout(() => {
						aiMessage.isNew = false;
					}, 500);
				});
			},
			
			scrollToBottom() {
				this.$nextTick(() => {
					if (this.isLoading) {
						this.scrollIntoView = 'loading-msg';
					} else if (this.messages.length > 0) {
						this.scrollIntoView = 'msg-' + (this.messages.length - 1);
					}
					
					// 备用滚动方案
					setTimeout(() => {
						const query = uni.createSelectorQuery().in(this);
						query.select('#chatList').boundingClientRect(data => {
							if (data) {
								this.scrollTop = data.height + 1000; // 确保滚动到底部
							}
						}).exec();
					}, 100);
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
.chat-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #F2F2F7;
	position: relative;
	overflow: hidden;
}



.chat-header {
	background-color: #FFFFFF;
	padding: 0 32rpx;
	display: flex;
	align-items: flex-end;
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	border-bottom: 1rpx solid #e5e5e5;
	z-index: 100;
	padding-bottom: 18rpx;
	text-align: center;
}

.back-btn {
	width: 88rpx;
	height: 88rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	position: absolute;
	left: 0;
	bottom: 18rpx;
}

.back-icon {
	font-size: 64rpx;
	color: #007AFF;
	font-weight: 300;
}

.chat-title {
	flex: 1;
	text-align: center;
	font-size: 34rpx;
	font-weight: 600;
	color: #000000;
	/* 让文字垂直居中在 header 的可用区域，刘海以下 */
	line-height: 10rpx;
	margin-top: var(--status-bar-height, 0);
}

.chat-content {
	flex: 1;
	padding: 16px;
	overflow-y: auto;
}

.chat-list {
	display: flex;
	flex-direction: column;
	min-height: 100%;
	padding-top: 20px;
}

.message-wrapper {
	margin-bottom: 16px;
}

.message-item {
	display: flex;
	max-width: 80%;
}

.message-item.user {
	flex-direction: row-reverse;
	margin-left: auto;
}

.message-item.ai {
	margin-right: auto;
}

.message-avatar {
	width: 36px;
	height: 36px;
	border-radius: 18px;
	margin: 0 8px;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #E9E9EB;
	overflow: hidden;
	flex-shrink: 0;
}

.avatar-img {
	width: 36px;
	height: 36px;
}

.avatar-text {
	font-size: 16px;
	color: #FFFFFF;
	background-color: #007AFF;
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.message-bubble {
	padding: 10px 14px;
	border-radius: 18px;
	background-color: #E9E9EB;
	position: relative;
	max-width: 100%;
	word-wrap: break-word;
}

.message-item.user .message-bubble {
	background-color: #007AFF;
}

.message-text {
	font-size: 16px;
	line-height: 1.4;
	word-break: break-word;
}

.message-item.user .message-text {
	color: #FFFFFF;
}

.message-time {
	font-size: 12px;
	color: #8E8E93;
	margin-top: 4px;
	text-align: center;
}

.chat-input-area {
	background-color: #FFFFFF;
	padding: 20rpx 32rpx;
	border-top: 1rpx solid #E9E9EB;
	position: fixed;
	left: 0;
	right: 0;
	z-index: 99;
	transition: bottom 0.3s ease-out;
	/* 适当上移以适配iPhone底部横条 */
	margin-bottom: 20rpx;
}

.input-container {
	display: flex;
	align-items: flex-end;
	background-color: #F2F2F7;
	border-radius: 40rpx;
	padding: 16rpx 24rpx;
	min-height: 80rpx;
}

.chat-input {
	flex: 1;
	font-size: 32rpx;
	min-height: 40rpx;
	max-height: 240rpx;
	padding: 0;
	background-color: transparent;
	border: none;
	resize: none;
	outline: none;
}

.send-btn {
	width: 64rpx;
	height: 64rpx;
	border-radius: 32rpx;
	background-color: #007AFF;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-left: 16rpx;
	padding: 0;
	border: none;
	flex-shrink: 0;
}

.send-btn.disabled {
	background-color: #C7C7CC;
}

.send-icon {
	color: #FFFFFF;
	font-size: 36rpx;
}

.loading-dots {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 20px;
}

.dot {
	width: 8px;
	height: 8px;
	border-radius: 4px;
	background-color: #8E8E93;
	margin: 0 2px;
	animation: pulse 1.5s infinite ease-in-out;
}

.dot:nth-child(2) {
	animation-delay: 0.2s;
}

.dot:nth-child(3) {
	animation-delay: 0.4s;
}

@keyframes pulse {
	0%, 100% {
		transform: scale(0.8);
		opacity: 0.6;
	}
	50% {
		transform: scale(1.2);
		opacity: 1;
	}
}

/* 消息动画效果 */
.message-new {
	animation: message-fade-in 0.3s ease-out;
	transform-origin: bottom;
}

.message-item.user.message-new {
	transform-origin: bottom right;
}

.message-item.ai.message-new {
	transform-origin: bottom left;
}

@keyframes message-fade-in {
	0% {
		opacity: 0;
		transform: translateY(10px) scale(0.95);
	}
	100% {
		opacity: 1;
		transform: translateY(0) scale(1);
	}
}
</style>