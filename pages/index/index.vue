<template>
	<view class="container">
		<view class="header">
			<image class="logo" src="/static/logo.svg"></image>
			<text class="title">残疾等级评定助手</text>
			<text class="subtitle">智能评估 · 专业指导</text>
		</view>
		
		<view class="intro-card">
			<button class="start-btn" @click="startAssessment">开启智能评估</button>
		</view>
		
		<view class="features">
			<view class="feature-item">
				<view class="feature-icon-wrapper">
					<text class="feature-icon">🔍</text>
				</view>
				<text class="feature-title">专业评估</text>
			</view>
			<view class="feature-item">
				<view class="feature-icon-wrapper">
					<text class="feature-icon">💬</text>
				</view>
				<text class="feature-title">智能对话</text>
			</view>
			<view class="feature-item">
				<view class="feature-icon-wrapper">
					<text class="feature-icon">📋</text>
				</view>
				<text class="feature-title">结果报告</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				title: '残疾等级评定助手'
			}
		},
		onLoad() {
			
		},
		methods: {
			startAssessment() {
				uni.navigateTo({
					url: '/pages/chat/chat'
				});
			}
		}
	}
</script>

<style>
	.container {
		padding: 40rpx;
		background: linear-gradient(180deg, #f0f7ff 0%, #ffffff 100%);
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		padding-top: var(--status-bar-height);
	}
	
	.header {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 80rpx;
		padding-top: 60rpx;
	}
	
	.logo {
		height: 120rpx;
		width: 120rpx;
		margin-bottom: 24rpx;
	}
	
	.title {
		font-size: 48rpx;
		font-weight: bold;
		color: #1e3a8a;
	}

	.subtitle {
		font-size: 28rpx;
		color: #3b82f6;
		margin-top: 12rpx;
	}
	
	.intro-card {
		background-color: #ffffff;
		border-radius: 24rpx;
		padding: 80rpx 40rpx;
		margin-bottom: 60rpx;
		box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.08);
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}
	
	.start-btn {
		background: linear-gradient(45deg, #3b82f6 0%, #2563eb 100%);
		color: #ffffff;
		border-radius: 50rpx;
		font-size: 32rpx;
		font-weight: bold;
		padding: 28rpx 100rpx;
		box-shadow: 0 8rpx 20rpx rgba(59, 130, 246, 0.3);
		border: none;
		transition: all 0.3s ease;
	}
	
	.start-btn:active {
		opacity: 0.9;
		transform: scale(0.96);
	}
	
	.features {
		display: flex;
		justify-content: space-around;
		gap: 20rpx;
		margin-top: 40rpx;
	}
	
	.feature-item {
		background-color: transparent;
		padding: 20rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}
	
	.feature-icon-wrapper {
		background-color: #ffffff;
		border-radius: 50%;
		width: 100rpx;
		height: 100rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 20rpx;
		box-shadow: 0 6rpx 15rpx rgba(0, 0, 0, 0.07);
	}

	.feature-icon {
		font-size: 48rpx;
	}
	
	.feature-title {
		font-size: 26rpx;
		font-weight: 500;
		color: #334155;
	}
</style>
