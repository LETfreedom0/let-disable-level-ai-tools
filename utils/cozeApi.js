/**
 * Coze API 服务
 * 用于处理与Coze API的交互
 */

// Coze API配置
const cozeConfig = {
	apiKey: 'sat_yV6QwGnlKYVZUVfjycLLUvMzN20jb0PXA3wToLssIYmFmMJTVxa5B7n8zbKSgU09', // 用户提供的Coze API密钥
	botId: '7548074605521682470', // 从用户提供的链接中提取的Bot ID
	apiUrl: 'https://api.coze.cn/v3/chat' // Coze API地址（中国区域）
};

// 输出配置信息用于调试
console.log('[DEBUG] Coze API配置:', {
	botId: cozeConfig.botId,
	apiUrl: cozeConfig.apiUrl,
	apiKeyLength: cozeConfig.apiKey.length // 不输出完整API密钥，只输出长度
});

/**
 * 发送消息到Coze API并获取回复
 * @param {Array} messages - 消息历史记录
 * @param {String} conversationId - 会话ID
 * @returns {Promise} - 返回包含消息和评估结果的Promise对象
 */
export async function sendMessageToCoze(messages, conversationId, onStreamUpdate) {
	try {
		// 获取最后一条用户消息
		const lastUserMessage = messages.length > 0 ? messages[messages.length - 1] : { content: '' };
		console.log('[DEBUG] 最后一条用户消息:', lastUserMessage);
		
		// 构建请求体 - 适配v3 API格式
		const requestBody = {
			bot_id: cozeConfig.botId,
			user_id: conversationId || generateUUID(), // 使用会话ID作为用户ID
			stream: true,
			auto_save_history: true,
			additional_messages: [
				{
					role: 'user',
					content: lastUserMessage.content,
					content_type: 'text'
				}
			]
		};
		console.log('[DEBUG] 请求体:', JSON.stringify(requestBody, null, 2));
		console.log('[DEBUG] 请求URL:', cozeConfig.apiUrl);
		
		// 处理流式响应的方式
		if (requestBody.stream) {
			console.log('[DEBUG] 使用流式响应模式');
			return new Promise((resolve, reject) => {
				// 使用原生请求以支持流式响应
				uni.request({
					url: cozeConfig.apiUrl,
					method: 'POST',
					header: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${cozeConfig.apiKey}`,
						'Accept': 'text/event-stream'
					},
					data: requestBody,
					success: (res) => {
						console.log('[DEBUG] 流式响应成功:', res.statusCode);
						if (res.statusCode !== 200) {
							console.error('[DEBUG] API请求失败:', res.statusCode, res.data);
							reject(new Error(`API请求失败: ${res.statusCode}`));
							return;
						}
						
						// 记录完整的流式响应数据
						console.log('[DEBUG] 完整响应数据:', JSON.stringify(res.data, null, 2));
						
						// 解析流式响应
						let fullMessage = '';
						let messageId = '';
						let isCompleted = false;
						
						// 检查是否为字符串类型的响应（可能包含多个事件）
						if (typeof res.data === 'string') {
							console.log('[DEBUG] 收到字符串类型的流式响应');
							
							// 按事件分割响应
							const events = res.data.split('\n\n').filter(event => event.trim());
							console.log('[DEBUG] 解析到', events.length, '个事件');
							
							// 处理每个事件
							events.forEach(event => {
								const lines = event.split('\n');
								const eventType = lines[0].replace('event:', '');
								let data = '';
								
								// 提取data部分
								for (let i = 1; i < lines.length; i++) {
									if (lines[i].startsWith('data:')) {
										data = lines[i].replace('data:', '');
										break;
									}
								}
								
								console.log(`[DEBUG] 事件类型: ${eventType}, 数据: ${data.substring(0, 100)}${data.length > 100 ? '...' : ''}`);
								
								// 处理消息增量事件
								if (eventType === 'conversation.message.delta') {
									try {
										const deltaData = JSON.parse(data);
										if (deltaData.role === 'assistant' && deltaData.content) {
											fullMessage += deltaData.content;
											messageId = deltaData.id;
											
											// 如果提供了流更新回调，则调用它
											if (typeof onStreamUpdate === 'function') {
												onStreamUpdate({
													message: fullMessage,
													delta: deltaData.content,
													messageId: messageId,
													isCompleted: false
												});
											}
										}
									} catch (e) {
										console.error('[DEBUG] 解析delta数据失败:', e);
									}
								}
								
								// 处理聊天完成事件
								if (eventType === 'conversation.chat.completed') {
									console.log('[DEBUG] 聊天完成，最终消息:', fullMessage);
									isCompleted = true;
									
									// 如果提供了流更新回调，通知完成
									if (typeof onStreamUpdate === 'function') {
										onStreamUpdate({
											message: fullMessage,
											delta: '',
											messageId: messageId,
											isCompleted: true
										});
									}
								}
							});
						} else {
							console.log('[DEBUG] 收到非字符串类型的响应:', typeof res.data);
							// 尝试从非流式响应中提取消息
							if (res.data && res.data.data && res.data.data.messages && res.data.data.messages.length > 0) {
								fullMessage = res.data.data.messages[0].content;
							}
						}
						
						// 检查是否包含评估结果
						const assessmentResult = parseAssessmentResult(fullMessage);
						console.log('[DEBUG] 解析的评估结果:', assessmentResult);
						
						// 返回完整消息和评估结果
						resolve({
							message: fullMessage || '无法获取回复',
							assessmentResult: assessmentResult,
							messageId: messageId,
							isCompleted: isCompleted
						});
					},
					fail: (err) => {
						console.error('[DEBUG] 请求失败:', err);
						reject(err);
					}
				});
			});
		} else {
			// 非流式响应处理（原有逻辑）
			console.log('[DEBUG] 使用非流式响应模式');
			const response = await uni.request({
				url: cozeConfig.apiUrl,
				method: 'POST',
				header: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${cozeConfig.apiKey}`
				},
				data: requestBody
			});
			
			// 检查响应状态
			console.log('[DEBUG] 响应状态码:', response.statusCode);
			if (response.statusCode !== 200) {
				console.error('[DEBUG] API请求失败:', response.statusCode, response.data);
				throw new Error(`API请求失败: ${response.statusCode}`);
			}
			
			// 解析并返回AI回复 - 适配v3 API响应格式
			const responseData = response.data;
			console.log('[DEBUG] 完整响应数据:', JSON.stringify(responseData, null, 2));
			
			// v3 API返回格式可能是 data.messages[0].content
			const aiMessage = responseData.data && responseData.data.messages && responseData.data.messages.length > 0 
				? responseData.data.messages[0].content 
				: '无法获取回复';
			console.log('[DEBUG] 提取的AI回复:', aiMessage);
			
			// 检查是否包含评估结果
			const assessmentResult = parseAssessmentResult(aiMessage);
			console.log('[DEBUG] 解析的评估结果:', assessmentResult);
			
			return {
				message: aiMessage,
				assessmentResult: assessmentResult
			};
		}
	} catch (error) {
		console.error('[DEBUG] Coze API调用失败:', error);
		throw error;
	}
}

/**
 * 解析评估结果
 * @param {String} message - AI回复消息
 * @returns {Object|null} - 返回评估结果对象，如果没有评估结果则返回null
 */
export function parseAssessmentResult(message) {
	// 这里可以根据AI回复的特定格式或关键词来解析评估结果
	// 实际实现应根据Coze Bot的回复格式进行定制
	console.log('[DEBUG] 开始解析评估结果，消息长度:', message.length);
	console.log('[DEBUG] 消息内容前100字符:', message.substring(0, 100) + (message.length > 100 ? '...' : ''));
	
	// 示例：检测是否包含"评估结果"关键词
	const hasAssessmentKeyword = message.includes('评估结果');
	const hasDisabilityLevelKeyword = message.includes('残疾等级');
	console.log('[DEBUG] 关键词检测结果 - 评估结果:', hasAssessmentKeyword, '残疾等级:', hasDisabilityLevelKeyword);
	
	if (hasAssessmentKeyword || hasDisabilityLevelKeyword) {
		console.log('[DEBUG] 检测到评估结果关键词，开始提取具体信息');
		// 这里应该实现实际的解析逻辑
		// 示例实现（实际应根据AI回复格式定制）
		const typeMatch = message.match(/残疾类别[：:]\s*([^\n\r,，。；;]+)/);
		const levelMatch = message.match(/残疾等级[：:]\s*([^\n\r,，。；;]+)/);
		const descMatch = message.match(/评估说明[：:]\s*([^\n\r]+)/);
		const suggMatch = message.match(/建议[：:]\s*([^\n\r]+)/);
		
		console.log('[DEBUG] 正则匹配结果 - 类别:', typeMatch, '等级:', levelMatch);
		console.log('[DEBUG] 正则匹配结果 - 说明:', descMatch ? '找到' : '未找到', '建议:', suggMatch ? '找到' : '未找到');
		
		if (typeMatch || levelMatch) {
			const result = {
				type: typeMatch ? typeMatch[1].trim() : '未指定',
				level: levelMatch ? levelMatch[1].trim() : '未指定',
				description: descMatch ? descMatch[1].trim() : '根据您提供的信息进行评估',
				suggestion: suggMatch ? suggMatch[1].trim() : '建议前往专业机构进行正式评定'
			};
			console.log('[DEBUG] 成功提取评估结果:', JSON.stringify(result, null, 2));
			return result;
		} else {
			console.log('[DEBUG] 虽然检测到关键词，但未能提取到具体评估信息');
		}
	} else {
		console.log('[DEBUG] 未检测到评估结果关键词');
	}
	
	return null;
}

/**
 * 生成UUID作为会话ID
 * @returns {String} - 返回UUID字符串
 */
export function generateUUID() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		const r = Math.random() * 16 | 0;
		const v = c === 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}