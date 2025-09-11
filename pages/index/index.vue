<template>
	<view class="container">
		<view class="header">
			<image class="logo" src="/static/logo.svg"></image>
			<text class="title">残疾等级评定助手</text>
		</view>
		
		<view class="intro-card">
			<text class="intro-title">欢迎使用残疾等级评定助手</text>
			<text class="intro-text">通过智能AI对话，帮助您进行残疾等级初步评估。请点击下方按钮开始对话评估。</text>
			<button class="start-btn" @click="startAssessment">开始评估</button>
		</view>
		
		<view class="features">
			<view class="feature-item">
				<text class="feature-icon">🔍</text>
				<text class="feature-title">专业评估</text>
				<text class="feature-desc">基于国家标准进行评定</text>
			</view>
			<view class="feature-item">
				<text class="feature-icon">💬</text>
				<text class="feature-title">智能对话</text>
				<text class="feature-desc">通过对话收集评估信息</text>
			</view>
			<view class="feature-item">
				<text class="feature-icon">📋</text>
				<text class="feature-title">结果报告</text>
				<text class="feature-desc">生成评估报告和建议</text>
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
		background-color: #f8f8f8;
		min-height: 100vh;
	}
	
	.header {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 60rpx;
	}
	
	.logo {
		height: 180rpx;
		width: 180rpx;
		margin-bottom: 20rpx;
	}
	
	.title {
		font-size: 48rpx;
		font-weight: bold;
		color: #333;
	}
	
	.intro-card {
		background-color: #ffffff;
		border-radius: 20rpx;
		padding: 40rpx;
		margin-bottom: 40rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	}
	
	.intro-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
		display: block;
	}
	
	.intro-text {
		font-size: 28rpx;
		color: #666;
		line-height: 1.6;
		margin-bottom: 30rpx;
		display: block;
	}
	
	.start-btn {
		background-color: #007AFF;
		color: #fff;
		border-radius: 50rpx;
		font-size: 32rpx;
		font-weight: bold;
		margin-top: 20rpx;
	}
	
	.features {
		display: flex;
		justify-content: space-between;
		margin-top: 20rpx;
	}
	
	.feature-item {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 30rpx;
		width: 28%;
		display: flex;
		flex-direction: column;
		align-items: center;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	}
	
	.feature-icon {
		font-size: 60rpx;
		margin-bottom: 16rpx;
	}
	
	.feature-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 10rpx;
	}
	
	.feature-desc {
		font-size: 24rpx;
		color: #999;
		text-align: center;
	}
</style>
