export async function request(options) {
	const { url, method = 'GET', data = {}, header = {}, showError = true, retries = 2 } = options;
	
	// 设置合理的超时时间
	const timeout = 12000; // 12秒
	
	// 定义重试逻辑
	const executeRequest = async (retriesLeft) => {
		try {
			const response = await uni.request({
				url,
				method,
				data,
				header,
				timeout,
			});
			
			// 检查状态码
			if (response.statusCode !== 200) {
				const errorMsg = `请求失败: ${response.statusCode} ${response.errMsg || ''}`;
				console.error(errorMsg, url);
				
				if (showError) {
					uni.showToast({
						title: errorMsg,
						icon: 'none',
						duration: 2000
					});
				}
				
				// 特定状态码可以尝试重试
				if ((response.statusCode === 408 || response.statusCode >= 500) && retriesLeft > 0) {
					console.log(`请求失败，准备重试，剩余重试次数: ${retriesLeft}`);
					return await executeRequest(retriesLeft - 1);
				}
				
				throw new Error(errorMsg);
			}
			
			return response;
		} catch (error) {
			console.error('请求异常:', error, url);
			
			// 如果是超时错误和网络错误，可以尝试重试
			if ((error.errMsg && (error.errMsg.includes('timeout') || error.errMsg.includes('net::ERR'))) && retriesLeft > 0) {
				console.log(`请求超时，准备重试，剩余重试次数: ${retriesLeft}`);
				return await executeRequest(retriesLeft - 1);
			}
			
			if (showError) {
				uni.showToast({
					title: error.errMsg || '网络请求失败',
					icon: 'none',
					duration: 2000
				});
			}
			
			throw error;
		}
	};
	
	return executeRequest(retries);
}