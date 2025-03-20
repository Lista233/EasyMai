/**
 * 封装请求函数，统一处理错误、超时和重试
 * @param {Object} options - 请求选项
 * @returns {Promise} - 请求结果
 */
import {remoteRoute,aliasRoute} from '@/apiconfig.js'
import {request} from '../api/customRequest.js'
import {addAPICount} from '../api/myapi.js'
export async function maiGetUid(qrcode) {
	try {
		addAPICount('getuid')
		return await request({
			url: `http://${remoteRoute}/apiqr/?qr_code=${qrcode}`,
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
			url: `http://${remoteRoute}/getUserMusic/?userID=${userID}`,
			method: "GET"
		});
	} catch (error) {
		console.error('获取用户音乐数据失败:', error);
		return { error };
	}
}

export async function divingFishUpdateData(musicdata, importToken) {
	try {
		addAPICount('updatedata')
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
		addAPICount('getmusic')
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
		addAPICount('b50')
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
		addAPICount('login')
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
	   addAPICount('divingFishGetRecords')
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
		addAPICount('register')
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
		addAPICount('getalias')
		const resp = await request({
			url: `${aliasRoute}`,
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
