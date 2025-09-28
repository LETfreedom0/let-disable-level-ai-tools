<template>
	<view class="container">
		<view class="header">
			<text class="title">智能服务</text>
		</view>

		<view class="welcome-card">
			<text class="welcome-text">你好 👋 欢迎使用残疾人服务助手</text>
			<text class="welcome-desc">为残疾人提供等级评定、驾照申领和公考政策等专业咨询服务</text>
		</view>

		<view class="cards-container">
			<view class="card" @click="navigateToChat('disability', '残疾证等级咨询', '您好，我是残疾证等级评定助手，请描述您的情况，我将为您提供残疾等级评估咨询。')">
				<view class="card-left">
					<view class="card-icon-wrapper blue">
						<text class="card-icon">♿</text>
					</view>
				</view>
				<view class="card-content">
					<text class="card-title">残疾证等级咨询</text>
					<text class="card-desc">智能对话，快速评估您的残疾等级</text>
				</view>
				<view class="card-arrow">
					<text>〉</text>
				</view>
			</view>

			<view class="card" @click="navigateToChat('license', '残疾人驾照咨询', '您好，我是残疾人驾照咨询助手，请问您有什么关于残疾人驾照申领的问题？')">
				<view class="card-left">
					<view class="card-icon-wrapper green">
						<text class="card-icon">🚗</text>
					</view>
				</view>
				<view class="card-content">
					<text class="card-title">残疾人驾照咨询</text>
					<text class="card-desc">解答残疾人申领驾照相关问题</text>
				</view>
				<view class="card-arrow">
					<text>〉</text>
				</view>
			</view>

			<view class="card" @click="navigateToChat('exam', '残疾人公考咨询', '您好，我是残疾人公考咨询助手，请问您有什么关于残疾人公务员考试的问题？')">
				<view class="card-left">
					<view class="card-icon-wrapper orange">
						<text class="card-icon">✍️</text>
					</view>
				</view>
				<view class="card-content">
					<text class="card-title">残疾人公考咨询</text>
					<text class="card-desc">提供残疾人公务员考试政策与信息</text>
				</view>
				<view class="card-arrow">
					<text>〉</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		methods: {
			navigateToChat(type, title, welcomeMessage) {
				uni.navigateTo({
					url: `/pages/chat/chat?type=${type}&title=${encodeURIComponent(title)}&welcomeMessage=${encodeURIComponent(welcomeMessage)}`
				});
			}
		}
	}
</script>

<style>
	.container {
		background-color: #f0f0f7;
		min-height: 100vh;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
		/* iOS safe area (bottom/left/right) */
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);
		padding-left: constant(safe-area-inset-left);
		padding-left: env(safe-area-inset-left);
		padding-right: constant(safe-area-inset-right);
		padding-right: env(safe-area-inset-right);
	}

	.header {
		background-color: #ffffff;
		padding: 18rpx 30rpx;
		/* iOS safe area (top) + status bar height + extra spacing to fully avoid notch */
		padding-top: calc(var(--status-bar-height) + constant(safe-area-inset-top) + 60rpx);
		padding-top: calc(var(--status-bar-height) + env(safe-area-inset-top) + 60rpx);
		border-bottom: 1rpx solid #e5e5e5;
		text-align: center;
	}
	/* #ifdef MP-WEIXIN */
	.header { 
		padding-right: 120rpx; 
		padding-left: 120rpx; /* 左右对称，保持居中 */
	}
	/* #endif */

	.title {
		font-size: 34rpx;
		font-weight: 600;
		color: #000000;
		line-height: 10rpx;
		margin-top: var(--status-bar-height, 0);
	}

	/* Welcome prompt */
	.welcome-card {
		background: linear-gradient(to right, #f8f9ff, #f0f2ff);
		border-radius: 16rpx;
		margin: 30rpx;
		padding: 30rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
		display: flex;
		flex-direction: column;
	}
	.welcome-text {
		font-size: 34rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 12rpx;
	}
	.welcome-desc {
		font-size: 28rpx;
		color: #666;
		line-height: 1.5;
	}

	/* Cards */
	.cards-container { margin-top: 8rpx; }
.card {
	display: flex;
	align-items: center;
	margin: 16rpx 24rpx 0 24rpx;
	padding: 22rpx 24rpx;
	background-color: #ffffff;
	border: 1rpx solid #ececec;
	border-radius: 20rpx;
	box-shadow: 0 6rpx 18rpx rgba(0,0,0,0.04);
	transition: transform 0.12s ease, background-color 0.2s ease;
}
.card:active { background-color: #f8f8f8; transform: scale(0.996); }

.card-left { margin-right: 18rpx; }
.card-icon-wrapper {
	width: 64rpx;
	height: 64rpx;
	border-radius: 16rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	color: #ffffff;
}
.card-icon-wrapper.blue { background-color: #007aff; }
.card-icon-wrapper.green { background-color: #34c759; }
.card-icon-wrapper.orange { background-color: #ff9500; }
.card-icon { font-size: 40rpx; color: #ffffff; }

.card-content { flex: 1; display: flex; flex-direction: column; }
.card-title { font-size: 30rpx; font-weight: 600; color: #000000; }
.card-desc { font-size: 24rpx; color: #8e8e93; margin-top: 6rpx; }

.card-arrow { color: #c7c7cc; font-size: 28rpx; }
</style>
