/**
 * 封装请求函数，统一处理错误、超时和重试
 * @param {Object} options - 请求选项
 * @returns {Promise} - 请求结果
 */
async function request(options) {
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

export async function maiGetUid(qrcode) {
	try {
		return await request({
			url: `http://117.72.108.255:25441/apiqr/?qr_code=${qrcode}`,
			method: "GET"
		});
	} catch (error) {
		console.error('获取UID失败:', error);
		return { error };
	}
}

export async function maiGetUserMusicData(userID) {
	try {
		return await request({
			url: `http://117.72.108.255:25441/getUserMusic/?userID=${userID}`,
			method: "GET"
		});
	} catch (error) {
		console.error('获取用户音乐数据失败:', error);
		return { error };
	}
}

export async function divingFishUpdateData(musicdata, importToken) {
	try {
		console.log(importToken);
		return await request({
			url: `https://www.diving-fish.com/api/maimaidxprober/player/update_records`,
			header: {
				'import-token': importToken
			},
			method: "POST",
			data: musicdata
		});
	} catch (error) {
		console.error('更新数据失败:', error);
		return { error };
	}
}

export async function divingFishGetMusic() {
	try {
		const resp = await request({
			url: `https://www.diving-fish.com/api/maimaidxprober/music_data`,
			method: "GET"
		});
		return resp.data;
	} catch (error) {
		console.error('获取音乐数据失败:', error);
		return { error };
	}
}

export async function divingFishgetb50(qqid, username) {
	try {
		return await request({
			url: 'https://www.diving-fish.com/api/maimaidxprober/query/player',
			data: {
				"qqid": qqid,
				"username": username,
				"b50": true,
			},
			method: 'POST'
		});
	} catch (error) {
		console.error('获取b50数据失败:', error);
		return { error };
	}
}

export async function divingFishLogin(username, password) {
	try {
		console.log('正在登录');
		return await request({
			url: `https://www.diving-fish.com/api/maimaidxprober/login`,
			method: "POST",
			data: {
				"username": username,
				"password": password,
			}
		});
	} catch (error) {
		console.error('登录失败:', error);
		return { error };
	}
}

export async function divingFishGetProfile(jwt_token) {
	try {
		console.log('获取用户资料');
		return await request({
			url: `https://www.diving-fish.com/api/maimaidxprober/player/profile`,
			method: "GET",
			header: {
				"jwt-token": jwt_token
			}
		});
	} catch (error) {
		console.error('获取用户资料失败:', error);
		return { error };
	}
}

export async function divingFishGetRecords(jwt_token) {
	try {
		console.log('获取用户记录');
		return await request({
			url: `https://www.diving-fish.com/api/maimaidxprober/player/records`,
			method: "GET",
			header: {
				"jwt-token": jwt_token
			}
		});
	} catch (error) {
		console.error('获取用户记录失败:', error);
		return { error };
	}
}

export async function divingFishGetJwtToken(username, password) {
	try {
		let res = await divingFishLogin(username, password);
		if (res.error) {
			return null;
		}
		
		if (res.data.message != '登录成功') {
			uni.showToast({
				title: res.data.message || '登录失败',
				icon: 'none'
			});
			return null;
		}
		
		let headerCookie = res.header['set-cookie'];
		if (!headerCookie) {
			uni.showToast({
				title: '获取token失败',
				icon: 'none'
			});
			return null;
		}
		
		let jwt_token = headerCookie.split(';', 1)[0].split('=')[1];
		return jwt_token;
	} catch (error) {
		console.error('获取JWT Token失败:', error);
		uni.showToast({
			title: '获取Token失败',
			icon: 'none'
		});
		return null;
	}
}

export async function divingFishSetProfile(nickname, bind_qq, qq_channel_uid, jwt_token) {
	try {
		console.log('设置用户资料');
		return await request({
			url: `https://www.diving-fish.com/api/maimaidxprober/player/profile`,
			method: "POST",
			header: {
				"jwt-token": jwt_token
			},
			data: {
				"bind_qq": bind_qq,
				"qq_channel_uid": qq_channel_uid,
				"nickname": nickname,
			}
		});
	} catch (error) {
		console.error('设置用户资料失败:', error);
		return { error };
	}
}

export async function divingFishRefreshImportToken(jwt_token) {
	try {
		return await request({
			url: `https://www.diving-fish.com/api/maimaidxprober/player/import_token`,
			method: "PUT",
			header: {
				"jwt-token": jwt_token
			}
		});
	} catch (error) {
		console.error('刷新导入token失败:', error);
		return { error };
	}
}

export async function divingFishRegister(username, password) {
	try {
		console.log('注册中');
		return await request({
			url: `https://www.diving-fish.com/api/maimaidxprober/register`,
			method: "POST",
			data: {
				"username": username,
				"password": password,
			}
		});
	} catch (error) {
		console.error('注册失败:', error);
		return { error };
	}
}

export async function divingFishAgrement(jwt_token) {
	try {
		console.log('接受协议');
		return await request({
			url: `https://www.diving-fish.com/api/maimaidxprober/player/agreement`,
			method: "POST",
			data: {
				"accept_agreement": true
			},
			header: {
				"jwt-token": jwt_token
			}
		});
	} catch (error) {
		console.error('接受协议失败:', error);
		return { error };
	}
}

export function splitJwtToken(res) {
	try {
		let headerCookie = res.header['set-cookie'];
		if (!headerCookie) {
			console.error('Cookie不存在');
			return null;
		}
		console.log(headerCookie.split(';', 1)[0].split('=')[1]);
		return headerCookie.split(';', 1)[0].split('=')[1];
	} catch (error) {
		console.error('分割JWT Token失败:', error);
		return null;
	}
}

export async function divingFishChartStats() {
	try {
		const response = await request({
			url: 'https://www.diving-fish.com/api/maimaidxprober/chart_stats',
			method: 'GET'
		});
		return response;
	} catch (error) {
		console.error('获取谱面统计失败:', error);
		return { error };
	}
}

export async function getChartStats() {
	try {
		const resp = await request({
			url: 'https://www.diving-fish.com/api/maimaidxprober/chart_stats',
			method: 'GET'
		});
		return resp.data;
	} catch (error) {
		console.error('获取谱面统计失败:', error);
		return { error };
	}
}

export async function getAliasData() {
	try {
		const resp = await request({
			url: 'https://api.yuzuchan.moe/maimaidx/maimaidxalias',
			method: 'GET'
		});
		return resp;
	} catch (error) {
		console.error('获取别名数据失败:', error);
		return { error };
	}
}

export async function divingFishRecovery(qq) {
	try {
		const response = await request({
			url: `https://www.diving-fish.com/api/maimaidxprober/recovery?qq=${qq}`,
			method: 'POST',
			data:{
				"qq":qq,
			}
		});
		return response;
	} catch (error) {
		console.error('该绑定QQ不存在:', error);
		return { error };
	}
}
