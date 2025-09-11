<template>
	<view class="chat-container">
		<!-- 头部 -->
		<view class="chat-header">
			<view class="back-btn" @click="goBack">
				<text class="back-icon">←</text>
			</view>
			<view class="chat-title">残疾等级评定助手</view>
		</view>
		
		<!-- 聊天内容区域 -->
		<scroll-view class="chat-content" scroll-y="true" :scroll-top="scrollTop" @scrolltolower="onScrollToLower" @scroll="onScroll">
			<view class="chat-list">
				<!-- 欢迎消息 -->
				<view class="message-wrapper">
					<view class="message-item ai">
						<view class="message-role">AI</view>
						<view class="message-content">
							您好，我是残疾等级评定助手。我可以帮助您进行残疾等级的初步评估。请告诉我您的情况，例如：
							<view>1. 您的主要功能障碍是什么？</view>
							<view>2. 这种障碍对您日常生活的影响程度如何？</view>
							<view>3. 您是否已经进行过相关医疗诊断？</view>
						</view>
					</view>
					<view class="message-time">{{formatTime(startTime)}}</view>
				</view>
				
				<!-- 消息列表 -->
				<block v-for="(msg, index) in messages" :key="index">
					<view class="message-wrapper">
						<view class="message-item" :class="msg.role">
							<view class="message-role">
								{{msg.role === 'user' ? '我' : 'AI'}}
							</view>
							<view class="message-content">
								{{msg.content}}
							</view>
						</view>
						<view class="message-time">{{formatTime(msg.time)}}</view>
					</view>
				</block>
				
				<!-- 加载中动画 -->
				<view class="message-wrapper" v-if="loading">
					<view class="message-item ai">
						<view class="message-role">AI</view>
						<view class="message-content">
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
		<view class="chat-input-area">
			<view class="input-container">
				<textarea class="chat-input" v-model="inputMessage" auto-height placeholder="请输入您的问题..." @input="adjustHeight" :disabled="loading"></textarea>
				<view class="send-btn" :class="{disabled: !inputMessage.trim() || loading}" @click="sendMessage">
					<text class="send-icon">发送</text>
				</view>
			</view>
			<view class="input-tips">请详细描述您的情况，以便我提供更准确的评估</view>
		</view>
		
		<!-- 评估结果弹窗 -->
		<view class="assessment-result" v-if="showResult">
			<view class="result-content">
				<view class="result-header">
					<text class="result-title">评估结果</text>
					<view class="close-btn" @click="closeResult">×</view>
				</view>
				<view class="result-body">
					<view class="result-item">
						<text class="result-label">残疾类别：</text>
						<text class="result-value">{{ assessmentResult.type }}</text>
					</view>
					<view class="result-item">
						<text class="result-label">残疾等级：</text>
						<text class="result-value level">{{ assessmentResult.level }}</text>
					</view>
					<view class="result-item description">
						<text class="result-label">评估说明：</text>
						<text class="result-value">{{ assessmentResult.description }}</text>
					</view>
					<view class="result-item suggestion">
						<text class="result-label">建议：</text>
						<text class="result-value">{{ assessmentResult.suggestion }}</text>
					</view>
				</view>
				<view class="result-footer">
					<button class="result-btn" @click="saveResult">保存结果</button>
					<button class="result-btn outline" @click="closeResult">关闭</button>
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
				inputFocus: false,
				showResult: false,
				assessmentResult: {
					type: '',
					level: '',
					description: '',
					suggestion: ''
				},
				conversationId: null
			}
		},
		onLoad() {
			// 生成会话ID
			this.conversationId = generateUUID();
			// 记录开始时间
			this.startTime = new Date();
			// 不需要初始化消息，因为模板中已经有欢迎消息
		},
		methods: {
			// 返回上一页
			goBack() {
				uni.navigateBack();
			},
			
			// 发送消息
			sendMessage() {
				if (this.isLoading || !this.inputMessage.trim()) return;
				
				const userMessage = this.inputMessage.trim();
				this.messages.push({
					role: 'user',
					content: userMessage,
					time: new Date()
				});
				
				this.inputMessage = '';
				this.scrollToBottom();
				
				// 调用AI接口
				this.getAIResponse(userMessage);
			},
			
			// 添加AI消息
			addAIMessage(content) {
				this.messages.push({
					role: 'assistant',
					content: content,
					time: new Date()
				});
				this.scrollToBottom();
			},
			
			// 获取AI回复
			getAIResponse(userMessage) {
				this.isLoading = true;
				console.log('[DEBUG-CHAT] 开始获取AI回复，用户消息:', userMessage);
				console.log('[DEBUG-CHAT] 会话ID:', this.conversationId);
				
				// 先添加一个空的AI消息，用于流式显示
				const aiMessageIndex = this.messages.length;
				this.messages.push({
					role: 'assistant',
					content: '',
					time: new Date()
				});
				this.scrollToBottom();
				
				// 构建请求消息历史
				const messageHistory = this.messages.slice(0, -1).map(msg => ({
					role: msg.role === 'assistant' ? 'assistant' : 'user',
					content: msg.content
				}));
				console.log('[DEBUG-CHAT] 消息历史:', JSON.stringify(messageHistory, null, 2));
				
				// 定义流式更新回调函数
				const handleStreamUpdate = (streamData) => {
					console.log('[DEBUG-CHAT] 收到流式更新:', streamData.delta);
					
					// 更新已添加的AI消息
					if (aiMessageIndex < this.messages.length) {
						// 更新消息内容
						this.$set(this.messages[aiMessageIndex], 'content', streamData.message);
						
						// 每隔一定数量的更新检查一次评估结果
						// 这里使用消息长度作为检查条件，每当消息长度增加50个字符就检查一次
						if (streamData.message.length % 50 === 0) {
							console.log('[DEBUG-CHAT] 流式响应中，检查评估结果');
							this.checkForAssessmentResult(streamData.message);
						}
						
						// 如果完成了，检查评估结果
						if (streamData.isCompleted) {
							this.isLoading = false;
							console.log('[DEBUG-CHAT] 流式响应完成，最终检查评估结果');
							this.checkForAssessmentResult(streamData.message);
						}
					}
					
					// 滚动到底部
					this.$nextTick(() => {
						this.scrollToBottom();
					});
				};
				
				// 调用Coze API服务
				console.log('[DEBUG-CHAT] 调用sendMessageToCoze，参数:', messageHistory.length, '条消息,', this.conversationId);
				sendMessageToCoze(messageHistory, this.conversationId, handleStreamUpdate)
					.then(response => {
						console.log('[DEBUG-CHAT] API调用成功，响应:', JSON.stringify(response, null, 2));
						this.isLoading = false;
						
						// 从响应中获取消息内容
						const aiMessage = response.message;
						console.log('[DEBUG-CHAT] AI回复:', aiMessage.substring(0, 100) + (aiMessage.length > 100 ? '...' : ''));
						
						// 如果流式更新没有正常工作，确保最终消息被更新
						if (aiMessageIndex < this.messages.length && !this.messages[aiMessageIndex].content) {
							// 只有在消息内容为空时才更新，避免重复显示
							this.messages[aiMessageIndex].content = aiMessage;
							this.scrollToBottom();
						}
						// 移除重复添加消息的逻辑，避免消息显示两次
						
						// 检查是否包含评估结果
						if (response.assessmentResult) {
							console.log('[DEBUG-CHAT] 检测到评估结果:', response.assessmentResult);
							this.assessmentResult = response.assessmentResult;
							// 显示评估结果
							setTimeout(() => {
								this.showResult = true;
								console.log('[DEBUG-CHAT] 显示评估结果弹窗');
							}, 1000);
						} else {
							console.log('[DEBUG-CHAT] 未检测到评估结果，使用原有逻辑检查');
							// 使用原有逻辑检查消息内容
							this.checkForAssessmentResult(aiMessage);
						}
					})
					.catch(err => {
						console.error('[DEBUG-CHAT] API请求失败:', err);
						this.isLoading = false;
						
						// 如果消息已经有内容，说明流式更新已经部分工作，保留现有内容
						if (aiMessageIndex < this.messages.length) {
							if (!this.messages[aiMessageIndex].content) {
								// 只有在消息内容为空时才替换为错误消息
								this.messages[aiMessageIndex].content = '抱歉，网络连接出现问题，请稍后再试。';
							} else {
								console.log('[DEBUG-CHAT] 保留已有的部分消息内容');
							}
						}
					});
			},
			
			// 检查是否包含评估结果
			checkForAssessmentResult(message) {
				console.log('[DEBUG-CHAT] 检查消息是否包含评估结果，消息长度:', message.length);
				// 使用工具函数解析评估结果
				const result = parseAssessmentResult(message);
				console.log('[DEBUG-CHAT] parseAssessmentResult返回结果:', result);
				
				// 如果有评估结果或者对话超过10条（演示用）
				if (result || (this.messages.length > 10 && Math.random() > 0.7)) {
					console.log('[DEBUG-CHAT] 检测到评估结果或触发演示条件, 消息数量:', this.messages.length);
					// 如果有解析结果，使用解析结果；否则使用默认示例
					if (result) {
						console.log('[DEBUG-CHAT] 使用解析的评估结果:', JSON.stringify(result, null, 2));
						this.assessmentResult = result;
					} else {
						console.log('[DEBUG-CHAT] 使用默认示例评估结果');
						// 示例结果（仅用于演示）
						this.assessmentResult = {
							type: '肢体残疾',
							level: '三级',
							description: '根据您提供的信息，您的情况符合肢体残疾三级标准。主要表现为上肢活动受限，日常生活能力部分受到影响。',
							suggestion: '建议您携带相关医疗证明前往当地残联进行正式评定。同时可以考虑进行康复训练，提高生活自理能力。'
						};
					}
					
					// 如果当前不在加载状态，才显示评估结果
					// 这样可以避免在流式响应过程中过早显示评估结果
					if (!this.isLoading) {
						setTimeout(() => {
							this.showResult = true;
							console.log('[DEBUG-CHAT] 显示评估结果弹窗，结果类型:', this.assessmentResult.type, '等级:', this.assessmentResult.level);
						}, 1000);
					} else {
						console.log('[DEBUG-CHAT] 当前正在加载中，暂不显示评估结果弹窗');
					}
				} else {
					console.log('[DEBUG-CHAT] 未检测到评估结果，也未触发演示条件');
				}
			},
			
			// 关闭结果弹窗
			closeResult() {
				this.showResult = false;
			},
			
			// 保存评估结果
			saveResult() {
				// 这里可以实现保存结果的逻辑
				uni.showToast({
					title: '结果已保存',
					icon: 'success'
				});
				this.showResult = false;
			},
			
			// 滚动到底部
			scrollToBottom() {
				setTimeout(() => {
					const query = uni.createSelectorQuery().in(this);
					query.select('#chatScroll').boundingClientRect();
					query.selectAll('.message-item').boundingClientRect();
					query.exec(res => {
						if (res[0] && res[1] && res[1].length > 0) {
							let totalHeight = 0;
							res[1].forEach(item => {
								totalHeight += item.height;
							});
							this.scrollTop = totalHeight;
						}
					});
				}, 300);
			},
			
			// 加载更多消息（下拉加载历史消息，如果需要）
			loadMoreMessages() {
				// 实现加载历史消息的逻辑
				console.log('加载更多消息');
			},
			
			// 格式化时间
			formatTime(date) {
				if (!date) return '';
				const hours = date.getHours().toString().padStart(2, '0');
				const minutes = date.getMinutes().toString().padStart(2, '0');
				return `${hours}:${minutes}`;
			},
			
			// 格式化时间
			formatTime(date) {
				if (!date) return '';
				const hours = date.getHours().toString().padStart(2, '0');
				const minutes = date.getMinutes().toString().padStart(2, '0');
				return `${hours}:${minutes}`;
			}
		}
	}
</script>

<style>
	.chat-container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: #f7f7f8;
	}
	
	/* 头部样式 */
	.chat-header {
		height: 100rpx;
		background-color: #ffffff;
		color: #333;
		display: flex;
		align-items: center;
		padding: 0 30rpx;
		position: relative;
		z-index: 10;
		border-bottom: 1rpx solid #e5e5e5;
	}
	
	.back-btn {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.back-icon {
		font-size: 40rpx;
		font-weight: bold;
		color: #333;
	}
	
	.chat-title {
		flex: 1;
		text-align: center;
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		margin-right: 60rpx; /* 为了标题居中 */
	}
	
	/* 聊天内容区域 */
	.chat-content {
		flex: 1;
		overflow-y: auto;
		background-color: #f7f7f8;
	}
	
	.chat-list {
		padding-bottom: 30rpx;
	}
	
	/* 消息包装器 - ChatGPT风格 */
	.message-wrapper {
		padding: 0;
		margin-bottom: 2rpx;
	}
	
	/* 消息项 - ChatGPT风格 */
	.message-item {
		display: flex;
		padding: 30rpx 40rpx;
		position: relative;
	}
	
	.message-item.ai {
		background-color: #f7f7f8;
	}
	
	.message-item.user {
		background-color: #ffffff;
	}
	
	/* 角色标识 - ChatGPT风格 */
	.message-role {
		width: 60rpx;
		height: 60rpx;
		border-radius: 4rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 30rpx;
		flex-shrink: 0;
	}
	
	.ai .message-role {
		background-color: #10a37f;
		color: #fff;
	}
	
	.user .message-role {
		background-color: #007AFF;
		color: #fff;
	}
	
	/* 消息内容 - ChatGPT风格 */
	.message-content {
		flex: 1;
		font-size: 30rpx;
		line-height: 1.6;
		color: #333;
		word-break: break-all;
		white-space: pre-wrap;
	}
	
	.message-time {
		font-size: 24rpx;
		color: #999;
		text-align: center;
		margin: 10rpx 0 20rpx;
	}
	
	/* 加载动画 - ChatGPT风格 */
	.loading-dots {
		display: flex;
		align-items: center;
		height: 40rpx;
	}
	
	.dot {
		width: 10rpx;
		height: 10rpx;
		background-color: #10a37f;
		border-radius: 50%;
		margin: 0 6rpx;
		animation: dotPulse 1.5s infinite ease-in-out;
	}
	
	.dot:nth-child(2) {
		animation-delay: 0.2s;
	}
	
	.dot:nth-child(3) {
		animation-delay: 0.4s;
	}
	
	@keyframes dotPulse {
		0%, 100% {
			transform: scale(0.7);
			opacity: 0.5;
		}
		50% {
			transform: scale(1);
			opacity: 1;
		}
	}
	
	/* 输入区域 - ChatGPT风格 */
	.chat-input-area {
		background-color: #fff;
		padding: 20rpx 30rpx;
		display: flex;
		flex-direction: column;
		border-top: 1rpx solid #e5e5e5;
	}
	
	.input-container {
		display: flex;
		align-items: flex-end;
		position: relative;
		width: 100%;
	}
	
	.chat-input {
		flex: 1;
		min-height: 80rpx;
		max-height: 200rpx;
		font-size: 30rpx;
		line-height: 1.5;
		padding: 20rpx 100rpx 20rpx 30rpx;
		border: 1rpx solid #e5e5e5;
		border-radius: 16rpx;
		background-color: #ffffff;
	}
	
	.send-btn {
		position: absolute;
		right: 20rpx;
		bottom: 20rpx;
		width: 60rpx;
		height: 60rpx;
		background-color: #10a37f;
		color: #fff;
		border-radius: 8rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.send-btn.disabled {
		background-color: #cccccc;
		opacity: 0.7;
	}
	
	.send-icon {
		font-size: 26rpx;
		font-weight: bold;
	}
	
	.input-tips {
		margin-top: 16rpx;
		font-size: 24rpx;
		color: #999;
		text-align: center;
	}
	
	/* 评估结果弹窗 */
	.assessment-result {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
	}
	
	.result-content {
		width: 80%;
		background-color: #fff;
		border-radius: 20rpx;
		overflow: hidden;
		animation: slideUp 0.3s ease;
	}
	
	@keyframes slideUp {
		from {
			transform: translateY(50rpx);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
	
	.result-header {
		padding: 30rpx;
		border-bottom: 1rpx solid #eee;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	
	.result-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
	}
	
	.close-btn {
		font-size: 48rpx;
		color: #999;
		line-height: 1;
	}
	
	.result-body {
		padding: 30rpx;
	}
	
	.result-item {
		margin-bottom: 20rpx;
		display: flex;
	}
	
	.result-item.description,
	.result-item.suggestion {
		flex-direction: column;
	}
	
	.result-label {
		font-size: 30rpx;
		color: #666;
		margin-bottom: 10rpx;
		font-weight: bold;
		min-width: 160rpx;
	}
	
	.result-value {
		font-size: 30rpx;
		color: #333;
		flex: 1;
	}
	
	.result-value.level {
		color: #ff6600;
		font-weight: bold;
		font-size: 34rpx;
	}
	
	.result-footer {
		padding: 30rpx;
		border-top: 1rpx solid #eee;
		display: flex;
		justify-content: space-between;
	}
	
	.result-btn {
		width: 45%;
		height: 80rpx;
		line-height: 80rpx;
		background-color: #007AFF;
		color: #fff;
		border-radius: 40rpx;
		font-size: 30rpx;
	}
	
	.result-btn.outline {
		background-color: #fff;
		color: #007AFF;
		border: 1rpx solid #007AFF;
	}
</style>