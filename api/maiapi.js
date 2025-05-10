/**
 * 封装请求函数，统一处理错误、超时和重试
 * @param {Object} options - 请求选项
 * @returns {Promise} - 请求结果
 */
import {remoteRoute, aliasRoute, divingFishRoute, proxyConfig,ProxyDivingFishRoute} from '@/static/apiconfig.js'
import {request} from '../api/customRequest.js'
import {addAPICount} from '../api/myapi.js'
export async function maiGetUid(qrcode) {
	try {
		addAPICount('getuid')
		console.log('获取UID请求开始:', qrcode)
		const result = await request({
			url: `${remoteRoute}/apiqr?qr_code=${qrcode}`,
			method: "GET"
		});
		console.log('获取UID请求成功:', result)
		return result;
	} catch (error) {
		console.error('获取UID失败:', error);
		return { error };
	}
}

export async function maiGetUserMusicData(userID) {
	try {
		console.log('获取用户音乐数据请求开始:', userID)
		const result = await request({
			url: `${remoteRoute}/getUserMusic?userID=${userID}`,
			method: "GET"
		});
		console.log('获取用户音乐数据请求成功:', result)
		return result;
	} catch (error) {
		console.error('获取用户音乐数据失败:', error);
		return { error };
	}
}
export async function maiGetUserPreview(userID) {
	try {
		console.log('获取用户预览数据请求开始:', userID)
		const result = await request({
			url: `${remoteRoute}/getUserPreview?userID=${userID}`,
			method: "GET"
		});
		console.log('获取用户预览数据请求成功:', result)
		return result;
	} catch (error) {
		console.error('获取用户预览数据失败:', error);
		return { error };
	}
}

export async function divingFishUpdateData(musicdata, importToken) {
	try {
		addAPICount('updatedata')
		// #ifdef H5
		console.log('H5环境：通过代理更新');
		const h5Result = await request({
			url: `${ProxyDivingFishRoute}/api/maimaidxprober/player/update_records`,
			header: {
				'import-token': importToken
			},
			method: "POST",
			data: musicdata
		});
		console.log('H5环境刷新导入token请求成功:', h5Result)
		return h5Result;
		// #endif
		// 非H5和小程序环境，需要判断是否为iOS设备
		// #ifndef H5 || MP
		const systemInfo = uni.getSystemInfoSync();
		const isIOS = systemInfo.osName === 'ios';
		console.log('在条件编译后的系统信息', systemInfo)
		if (isIOS) {
			// iOS设备使用代理
			console.log('iOS设备：使用代理进行更新');
			const iosResult = await request({
			url: `${ProxyDivingFishRoute}/api/maimaidxprober/player/update_records`,
			header: {
				'import-token': importToken
			},
			method: "POST",
			data: musicdata
		   });
			console.log('iOS设备更新成功:', iosResult)
			return iosResult;
		} else {
			// 其他设备直接请求
			console.log('非iOS设备：直接更新');
			const otherResult = await request({
			url: `${divingFishRoute}/api/maimaidxprober/player/update_records`,
			header: {
				'import-token': importToken
			},
			method: "POST",
			data: musicdata
		   });
			console.log('非iOS设备更新成功:', otherResult)
			return otherResult;
		}
		// #endif
		
		
		
		
	} catch (error) {
		console.error('更新数据失败:', error);
		return { error };
	}
}

export async function divingFishGetMusic() {
	try {
		addAPICount('getmusic')
		console.log('获取音乐数据请求开始')
		const resp = await request({
			url: `${divingFishRoute}/api/maimaidxprober/music_data`,
			method: "GET"
		});
		console.log('获取音乐数据请求成功:', { dataLength: resp.data.length })
		return resp.data;
	} catch (error) {
		console.error('获取音乐数据失败:', error);
		return { error };
	}
}

export async function divingFishgetb50(qqid, username) {
	try {
		addAPICount('b50')
		console.log('获取b50数据请求开始:', { qqid, username })
		const result = await request({
			url: `${divingFishRoute}/api/maimaidxprober/query/player`,
			data: {
				"qqid": qqid,
				"username": username,
				"b50": true,
			},
			method: 'POST'
		});
		console.log('获取b50数据请求成功:', result)
		return result;
	} catch (error) {
		console.error('获取b50数据失败:', error);
		return { error };
	}
}

export async function divingFishLogin(username, password) {
	try {
		addAPICount('login')
		const systemInfo = uni.getSystemInfoSync();
		console.log('登录请求开始:', { username, systemInfo })
		
		// #ifdef H5
		// H5环境
		console.log('H5环境：使用代理登录');
		const h5Result = await request({
			url: `${proxyConfig.getApiUrl('/api/login')}`,
			method: "POST",
			data: {
				"username": username,
				"password": password,
			}
		});
		console.log('H5环境登录请求成功:', h5Result)
		return h5Result;
		// #endif
		
		// #ifdef MP
		// 小程序环境
		console.log('小程序环境：直接登录');
		const mpResult = await request({
			url: `${divingFishRoute}/api/maimaidxprober/login`,
			method: "POST",
			data: {
				"username": username,
				"password": password,
			}
		});
		console.log('小程序环境登录请求成功:', mpResult)
		return mpResult;
		// #endif
		
		// #ifndef H5 || MP
		// 非H5和小程序环境，需要判断是否为iOS设备
		const isIOS = systemInfo.osName === 'ios';
		console.log('在条件编译后的系统信息', systemInfo)
		if (isIOS) {
			// iOS设备使用代理
			console.log('iOS设备：使用代理登录');
			const iosResult = await request({
				url: `${proxyConfig.getApiUrl('/api/login')}`,
				method: "POST",
				data: {
					"username": username,
					"password": password,
				}
			});
			console.log('iOS设备登录请求成功:', iosResult)
			return iosResult;
		} else {
			// 其他设备直接请求
			console.log('非iOS设备：直接登录');
			const otherResult = await request({
				url: `${divingFishRoute}/api/maimaidxprober/login`,
				method: "POST",
				data: {
					"username": username,
					"password": password,
				}
			});
			console.log('非iOS设备登录请求成功:', otherResult)
			return otherResult;
		}
		// #endif
	} catch (error) {
		console.error('登录请求失败:', error);
		return { error };
	}
}

export async function divingFishGetProfile(jwt_token) {
	try {
		console.log('获取用户资料请求开始:', { tokenLength: jwt_token.length })
		
		// #ifdef H5
		// H5环境
		console.log('H5环境：通过代理获取用户资料');
		const h5Result = await request({
			url: `${proxyConfig.getApiUrl('/api/profile')}`,
			method: "GET",
			header: {
				"Authorization": `Bearer ${jwt_token}`
			}
		});
		console.log('H5环境获取用户资料请求成功:', h5Result)
		return h5Result;
		// #endif
		
		// #ifdef MP
		// 小程序环境
		console.log('小程序环境：直接获取用户资料');
		const mpResult = await request({
			url: `${divingFishRoute}/api/maimaidxprober/player/profile`,
			method: "GET",
			header: {
				"Cookie": `jwt_token=${jwt_token}`
			}
		});
		console.log('小程序环境获取用户资料请求成功:', mpResult)
		return mpResult;
		// #endif
		
		// #ifndef H5 || MP
		// 非H5和小程序环境，需要判断是否为iOS设备
		const systemInfo = uni.getSystemInfoSync();
		console.log('获取用户资料系统信息:', systemInfo)
		const isIOS = systemInfo.osName === 'ios';
		
		if (isIOS) {
			// iOS设备使用代理
			console.log('iOS设备：通过代理获取用户资料');
			const iosResult = await request({
				url: `${proxyConfig.getApiUrl('/api/profile')}`,
				method: "GET",
				header: {
					"Authorization": `Bearer ${jwt_token}`
				}
			});
			console.log('iOS设备获取用户资料请求成功:', iosResult)
			return iosResult;
		} else {
			// 其他设备直接请求
			console.log('非iOS设备：直接获取用户资料');
			const otherResult = await request({
				url: `${divingFishRoute}/api/maimaidxprober/player/profile`,
				method: "GET",
				header: {
					"Cookie": `jwt_token=${jwt_token}`
				}
			});
			console.log('非iOS设备获取用户资料请求成功:', otherResult)
			return otherResult;
		}
		// #endif
	} catch (error) {
		console.error('获取用户资料失败:', error);
		return { error };
	}
}

export async function divingFishGetRecords(jwt_token) {
	try {
		addAPICount('divingFishGetRecords')
		console.log('获取用户记录请求开始:', { tokenLength: jwt_token.length })
		
		// #ifdef H5
		// H5环境
		console.log('H5环境：通过代理获取用户记录');
		const h5Result = await request({
			url: `${proxyConfig.getApiUrl('/api/records')}`,
			method: "GET",
			header: {
				"Authorization": `Bearer ${jwt_token}`
			}
		});
		console.log('H5环境获取用户记录请求成功:', h5Result)
		return h5Result;
		// #endif
		
		// #ifdef MP
		// 小程序环境
		console.log('小程序环境：直接获取用户记录');
		const mpResult = await request({
			url: `${divingFishRoute}/api/maimaidxprober/player/records`,
			method: "GET",
			header: {
				"Cookie": `jwt_token=${jwt_token}`
			}
		});
		console.log('小程序环境获取用户记录请求成功:', mpResult)
		return mpResult;
		// #endif
		
		// #ifndef H5 || MP
		// 非H5和小程序环境，需要判断是否为iOS设备
		const systemInfo = uni.getSystemInfoSync();
		const isIOS = systemInfo.osName === 'ios';
		console.log('获取用户记录系统信息:', systemInfo)
		
		if (isIOS) {
			// iOS设备使用代理
			console.log('iOS设备：通过代理获取用户记录');
			const iosResult = await request({
				url: `${proxyConfig.getApiUrl('/api/records')}`,
				method: "GET",
				header: {
					"Authorization": `Bearer ${jwt_token}`
				}
			});
			console.log('iOS设备获取用户记录请求成功:', iosResult)
			return iosResult;
		} else {
			// 其他设备直接请求
			console.log('非iOS设备：直接获取用户记录');
			const otherResult = await request({
				url: `${divingFishRoute}/api/maimaidxprober/player/records`,
				method: "GET",
				header: {
					"Cookie": `jwt_token=${jwt_token}`
				}
			});
			console.log('非iOS设备获取用户记录请求成功:', otherResult)
			return otherResult;
		}
		// #endif
	} catch (error) {
		console.error('获取用户记录失败:', error);
		return { error };
	}
}

export async function divingFishGetJwtToken(username, password) {
	try {
		console.log('获取JWT Token开始:', { username })
		let res = await divingFishLogin(username, password);
		if (res.error) {
			console.error('登录失败，无法获取JWT Token:', res.error)
			return null;
		}
		
		if (res.data.message != '登录成功') {
			console.error('登录失败，服务器返回:', res.data.message)
			uni.showToast({
				title: res.data.message || '登录失败',
				icon: 'none'
			});
			return null;
		}
		
		let headerCookie = res.header['set-cookie'];
		if (!headerCookie) {
			console.error('获取token失败，响应头中没有set-cookie')
			uni.showToast({
				title: '获取token失败',
				icon: 'none'
			});
			return null;
		}
		
		let jwt_token = headerCookie.split(';', 1)[0].split('=')[1];
		console.log('成功获取JWT Token:', { tokenLength: jwt_token.length })
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


export async function divingFishSetProfileRegister(nickname,jwt_token) {
	try {
		console.log('设置注册用户资料请求开始:')
		
		// #ifdef H5
		console.log('H5环境：通过代理设置用户资料');
		try {
			const h5Result = request({
				url: `${proxyConfig.getApiUrl('/api/profile')}`,
				method: "POST",
				header: {
					"Authorization": `Bearer ${jwt_token}`
				},
				data: {
			
					"nickname": nickname,
					"privacy": false,
					"mask": false,
					"accept_agreement":true
				}
			});
			console.log('H5环境设置用户资料请求成功:', h5Result)
			return h5Result;
		} catch (h5Error) {
			console.error('H5环境设置用户资料请求失败:', h5Error);
			throw h5Error;
		}
		// #endif
		
		// #ifdef MP
		// 小程序环境
		console.log('小程序环境：直接设置用户资料');
		try {
			// 尝试使用完整请求数据打印
			console.log('小程序环境设置用户资料请求详情:', {
				url: `${divingFishRoute}/api/maimaidxprober/player/profile`,
				method: "POST",
				header: {
					"Cookie": `jwt_token=${jwt_token}`
				},
				data: {	
					"nickname": nickname,
					"privacy": false,
					"mask": false,
					"accept_agreement":true
				}
			});
			
			const mpResult = request({
				url: `${divingFishRoute}/api/maimaidxprober/player/profile`,
				method: "POST",
				header: {
					"Cookie": `jwt_token=${jwt_token}`
				},
				data: {
							
					"nickname": nickname,
					"privacy": false,
					"mask": false,
					"accept_agreement":true
				}
			});
			console.log('小程序环境设置用户资料请求成功:', mpResult)
			return mpResult;
		} catch (mpError) {
			console.error('小程序环境设置用户资料请求失败:', mpError);
			// 尝试获取更多错误信息
			if (mpError.statusCode) {
				console.error(`状态码: ${mpError.statusCode}`);
			}
			if (mpError.data) {
				console.error('错误响应数据:', mpError.data);
			}
			throw mpError;
		}
		// #endif
		
		// #ifndef H5 || MP
		// 非H5和小程序环境，需要判断是否为iOS设备
		const systemInfo = uni.getSystemInfoSync();
		console.log('设置用户资料系统信息:', systemInfo)
		const isIOS = systemInfo.osName === 'ios';
		if (isIOS) {
			// iOS设备使用代理
			console.log('iOS设备：通过代理设置用户资料');
			try {
				const iosResult = await request({
					url: `${proxyConfig.getApiUrl('/api/profile')}`,
					method: "POST",
					header: {
						"Authorization": `Bearer ${jwt_token}`
					},
				data: {							
					"nickname": nickname,
					"privacy": false,
					"mask": false,
					"accept_agreement":true
				}
				});
				console.log('iOS设备设置用户资料请求成功:', iosResult)
				return iosResult;
			} catch (iosError) {
				console.error('iOS设备设置用户资料请求失败:', iosError);
				throw iosError;
			}
		} else {
			// 其他设备直接请求
			console.log('非iOS设备：直接设置用户资料');
			try {
				const otherResult = await request({
					url: `${divingFishRoute}/api/maimaidxprober/player/profile`,
					method: "POST",
					header: {
						"Cookie": `jwt_token=${jwt_token}`
					},
				data: {						
					"nickname": nickname,
					"privacy": false,
					"mask": false,
					"accept_agreement":true
				}
				});
				console.log('非iOS设备设置用户资料请求成功:', otherResult)
				return otherResult;
			} catch (otherError) {
				console.error('非iOS设备设置用户资料请求失败:', otherError);
				throw otherError;
			}
		}
		// #endif
	} catch (error) {
		console.error('设置用户资料失败:', error);
		// 尝试提取更多错误信息
		if (error.response) {
			console.error('错误响应:', error.response);
		}
		if (error.data) {
			console.error('错误数据:', error.data);
		}
		return { 
			error,
			errorDetail: {
				message: error.message,
				statusCode: error.statusCode || '未知',
				data: error.data || '无数据'
			}
		};
	}
}


export async function divingFishSetProfile(nickname, bind_qq, qq_channel_uid, jwt_token) {
	try {
		console.log('设置用户资料请求开始:', { nickname, bind_qq, qq_channel_uid, tokenLength: jwt_token.length })
		
		// #ifdef H5
		console.log('H5环境：通过代理设置用户资料');
		try {
			const h5Result = await request({
				url: `${proxyConfig.getApiUrl('/api/profile')}`,
				method: "POST",
				header: {
					"Authorization": `Bearer ${jwt_token}`
				},
				data: {
					"bind_qq": bind_qq,
					"qq_channel_uid": qq_channel_uid,
					"nickname": nickname,
				}
			});
			console.log('H5环境设置用户资料请求成功:', h5Result)
			return h5Result;
		} catch (h5Error) {
			console.error('H5环境设置用户资料请求失败:', h5Error);
			throw h5Error;
		}
		// #endif
		
		// #ifdef MP
		// 小程序环境
		console.log('小程序环境：直接设置用户资料');
		try {
			// 尝试使用完整请求数据打印
			console.log('小程序环境设置用户资料请求详情:', {
				url: `${divingFishRoute}/api/maimaidxprober/player/profile`,
				method: "POST",
				header: {
					"Cookie": `jwt_token=${jwt_token}`
				},
				data: {
					"bind_qq": bind_qq,
					"qq_channel_uid": qq_channel_uid,
					"nickname": nickname,
				}
			});
			
			const mpResult = await request({
				url: `${divingFishRoute}/api/maimaidxprober/player/profile`,
				method: "POST",
				header: {
					"Cookie": `jwt_token=${jwt_token}`
				},
				data: {
					"bind_qq": bind_qq,
					"qq_channel_uid": qq_channel_uid,
					"nickname": nickname,
				}
			});
			console.log('小程序环境设置用户资料请求成功:', mpResult)
			return mpResult;
		} catch (mpError) {
			console.error('小程序环境设置用户资料请求失败:', mpError);
			// 尝试获取更多错误信息
			if (mpError.statusCode) {
				console.error(`状态码: ${mpError.statusCode}`);
			}
			if (mpError.data) {
				console.error('错误响应数据:', mpError.data);
			}
			throw mpError;
		}
		// #endif
		
		// #ifndef H5 || MP
		// 非H5和小程序环境，需要判断是否为iOS设备
		const systemInfo = uni.getSystemInfoSync();
		console.log('设置用户资料系统信息:', systemInfo)
		const isIOS = systemInfo.osName === 'ios';
		if (isIOS) {
			// iOS设备使用代理
			console.log('iOS设备：通过代理设置用户资料');
			try {
				const iosResult = await request({
					url: `${proxyConfig.getApiUrl('/api/profile')}`,
					method: "POST",
					header: {
						"Authorization": `Bearer ${jwt_token}`
					},
					data: {
						"bind_qq": bind_qq,
						"qq_channel_uid": qq_channel_uid,
						"nickname": nickname,
					}
				});
				console.log('iOS设备设置用户资料请求成功:', iosResult)
				return iosResult;
			} catch (iosError) {
				console.error('iOS设备设置用户资料请求失败:', iosError);
				throw iosError;
			}
		} else {
			// 其他设备直接请求
			console.log('非iOS设备：直接设置用户资料');
			try {
				const otherResult = await request({
					url: `${divingFishRoute}/api/maimaidxprober/player/profile`,
					method: "POST",
					header: {
						"Cookie": `jwt_token=${jwt_token}`
					},
					data: {
						"bind_qq": bind_qq,
						"qq_channel_uid": qq_channel_uid,
						"nickname": nickname,
					}
				});
				console.log('非iOS设备设置用户资料请求成功:', otherResult)
				return otherResult;
			} catch (otherError) {
				console.error('非iOS设备设置用户资料请求失败:', otherError);
				throw otherError;
			}
		}
		// #endif
	} catch (error) {
		console.error('设置用户资料失败:', error);
		// 尝试提取更多错误信息
		if (error.response) {
			console.error('错误响应:', error.response);
		}
		if (error.data) {
			console.error('错误数据:', error.data);
		}
		return { 
			error,
			errorDetail: {
				message: error.message,
				statusCode: error.statusCode || '未知',
				data: error.data || '无数据'
			}
		};
	}
}

export async function divingFishRefreshImportToken(jwt_token) {
	try {
		console.log('刷新导入token请求开始:', { tokenLength: jwt_token.length })
		
		// #ifdef H5
		console.log('H5环境：通过代理刷新导入token');
		const h5Result = await request({
			url: `${proxyConfig.getApiUrl('/api/import_token')}`,
			method: "PUT",
			header: {
				"Authorization": `Bearer ${jwt_token}`
			}
		});
		console.log('H5环境刷新导入token请求成功:', h5Result)
		return h5Result;
		// #endif
		
		// #ifdef MP
		// 小程序环境
		console.log('小程序环境：直接刷新导入token');
		const mpResult = await request({
			url: `${divingFishRoute}/api/maimaidxprober/player/import_token`,
			method: "PUT",
			header: {
				"jwt-token": jwt_token
			}
		});
		console.log('小程序环境刷新导入token请求成功:', mpResult)
		return mpResult;
		// #endif
		
		// #ifndef H5 || MP
		// 非H5和小程序环境，需要判断是否为iOS设备
		const systemInfo = uni.getSystemInfoSync();
		console.log('刷新导入token系统信息:', systemInfo)
		const isIOS = systemInfo.osName === 'ios';
		if (isIOS) {
			// iOS设备使用代理
			console.log('iOS设备：通过代理刷新导入token');
			
			const iosResult = await request({
				url: `${proxyConfig.getApiUrl('/api/import_token')}`,
				method: "PUT",
				header: {
					"Authorization": `Bearer ${jwt_token}`
				}
			});
			console.log('iOS设备刷新导入token请求成功:', iosResult)
			return iosResult;
		} else {
			// 其他设备直接请求
			console.log('非iOS设备：直接刷新导入token');
			const otherResult = await request({
				url: `${divingFishRoute}/api/maimaidxprober/player/import_token`,
				method: "PUT",
				header: {
					"jwt-token": jwt_token
				}
			});
			console.log('非iOS设备刷新导入token请求成功:', otherResult)
			return otherResult;
		}
		// #endif
	} catch (error) {
		console.error('刷新导入token失败:', error);
		return { error };
	}
}

export async function divingFishRegister(username, password) {
	try {
		addAPICount('register')
		console.log('注册请求开始:', { username })
		const result = await request({
			url: `${divingFishRoute}/api/maimaidxprober/register`,
			method: "POST",
			data: {
				"username": username,
				"password": password,
			}
		});
		console.log('注册请求成功:', result)
		return result;
	} catch (error) {
		console.error('注册失败:', error);
		return { error };
	}
}

export async function divingFishAgrement(jwt_token) {
	try {
		console.log('接受协议请求开始:', { tokenLength: jwt_token.length })
		
		// #ifdef H5
		console.log('H5环境：通过代理接受协议');
		const h5Result = request({
			url: `${proxyConfig.getApiUrl('/api/agreement')}`,
			method: "POST",
			data: {
				"accept_agreement": true
			},
			header: {
				"Authorization": `Bearer ${jwt_token}`
			}
		});
		console.log('H5环境接受协议请求成功:', h5Result)
		return h5Result;
		// #endif
		
		// #ifdef MP
		// 小程序环境
		console.log('小程序环境：直接接受协议');
		const mpResult = request({
			url: `${divingFishRoute}/api/maimaidxprober/player/agreement`,
			method: "POST",
			data: {
				"accept_agreement": true
			},
			header: {
				"jwt-token": jwt_token
			}
		});
		console.log('小程序环境接受协议请求成功:', mpResult)
		return mpResult;
		// #endif
		
		// #ifndef H5 || MP
		// 非H5和小程序环境，需要判断是否为iOS设备
		const systemInfo = uni.getSystemInfoSync();
		const isIOS = systemInfo.osName === 'ios';
		console.log('接受协议系统信息:', systemInfo)
		console.log(isIOS)
		if (isIOS) {
			// iOS设备使用代理
			console.log('iOS设备：通过代理接受协议');
			const iosResult = request({
				url: `${proxyConfig.getApiUrl('/api/agreement')}`,
				method: "POST",
				data: {
					"accept_agreement": true
				},
				header: {
					"Authorization": `Bearer ${jwt_token}`
				}
			});
			console.log('iOS设备接受协议请求成功:', iosResult)
			return iosResult;
		} else {
			// 其他设备直接请求
			console.log('非iOS设备：直接接受协议');
			const otherResult = request({
				url: `${divingFishRoute}/api/maimaidxprober/player/agreement`,
				method: "POST",
				data: {
					"accept_agreement": true
				},
				header: {
					"jwt-token": jwt_token
				}
			});
			console.log('非iOS设备接受协议请求成功:', otherResult)
			return otherResult;
		}
		// #endif
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
		console.log('获取谱面统计请求开始')
		const response = await request({
			url: `${divingFishRoute}/api/maimaidxprober/chart_stats`,
			method: 'GET'
		});
		console.log('获取谱面统计请求成功:', response)
		return response;
	} catch (error) {
		console.error('获取谱面统计失败:', error);
		return { error };
	}
}

export async function getChartStats() {
	try {
		console.log('获取谱面统计请求开始')
		const resp = await request({
			url: `${divingFishRoute}/api/maimaidxprober/chart_stats`,
			method: 'GET'
		});
		console.log('获取谱面统计请求成功:', resp)
		return resp.data;
	} catch (error) {
		console.error('获取谱面统计失败:', error);
		return { error };
	}
}

export async function getAliasData() {
	try {
		addAPICount('getalias')
		console.log('获取别名数据请求开始')
		const resp = await request({
			url: `${aliasRoute}`,
			method: 'GET'
		});
		console.log('获取别名数据请求成功:', resp)
		return resp;
	} catch (error) {
		console.error('获取别名数据失败:', error);
		return { error };
	}
}

export async function divingFishRecovery(qq) {
	try {
		console.log('账号恢复请求开始:', { qq })
		const response = await request({
			url: `${divingFishRoute}/api/maimaidxprober/recovery?qq=${qq}`,
			method: 'POST',
			data:{
				"qq":qq,
			}
		});
		console.log('账号恢复请求成功:', response)
		return response;
	} catch (error) {
		console.error('账号恢复失败:', error);
		return { error };
	}
}

/**
 * 刷新所有基础数据 API
 * 包括：音乐数据、别名数据、谱面统计数据
 * @returns {Promise<Object>} 包含刷新结果的对象
 */
export async function refreshAllBaseData() {
	const results = {
		success: true,
		musicData: false,
		aliasData: false,
		chartStats: false,
		errors: []
	};

	try {
		console.log('开始刷新所有基础数据')
		// 刷新音乐数据
		try {
			console.log('开始刷新音乐数据')
			const musicData = await divingFishGetMusic();
			uni.setStorageSync('musicData', musicData);
			results.musicData = true;
			console.log('音乐数据刷新成功')
		} catch (error) {
			console.error('刷新音乐数据失败:', error);
			results.errors.push({ type: 'musicData', error });
			results.success = false;
		}

		// 刷新别名数据
		try {
			console.log('开始刷新别名数据')
			const response = await getAliasData();
			if (response.data) {
				uni.setStorageSync('aliasData', response.data);
				results.aliasData = true;
				console.log('别名数据刷新成功')
			} else {
				results.errors.push({ type: 'aliasData', error: '返回数据为空' });
				results.success = false;
				console.error('别名数据刷新失败: 返回数据为空')
			}
		} catch (error) {
			console.error('刷新别名数据失败:', error);
			results.errors.push({ type: 'aliasData', error });
			results.success = false;
		}

		// 刷新谱面统计数据
		try {
			console.log('开始刷新谱面统计数据')
			const chartStats = await getChartStats();
			uni.setStorageSync('chartStats', chartStats);
			results.chartStats = true;
			console.log('谱面统计数据刷新成功')
		} catch (error) {
			console.error('刷新谱面统计数据失败:', error);
			results.errors.push({ type: 'chartStats', error });
			results.success = false;
		}

		console.log('所有基础数据刷新完成:', results)
		return results;
	} catch (error) {
		console.error('刷新基础数据失败:', error);
		results.success = false;
		results.errors.push({ type: 'general', error });
		return results;
	}
}

export async function divingFishLoginViaProxy(username, password) {
	try {
		addAPICount('login')
		console.log('通过代理登录请求开始:', { username })
		const result = await request({
			url: `${proxyConfig.getApiUrl('/api/login')}`,
			method: "POST",
			data: {
				"username": username,
				"password": password,
			}
		});
		console.log('通过代理登录请求成功:', result)
		return result;
	} catch (error) {
		console.error('代理登录失败:', error);
		return { error };
	}
}
