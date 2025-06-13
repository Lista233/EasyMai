import {remoteRoute,aliasRoute,statsRoute,VersionRoute} from '@/static/apiconfig.js'
import {request} from './customRequest.js'


export async function getVersion() {
	try {
		console.log("我在更新");
		let res= await request({
			url: `${VersionRoute}`,
			method: "GET",
			
		});
		console.log(res.data)
		return res;
		//return null;
	} catch (error) {
		console.error('获取版本号失败:', error);
		return { error };
	}
}
export async function addAPICount(apiName) {
	try {
		return uni.request({
			url: `${statsRoute}/stats/record`,
			method: "POST",
			data:{"api_name":apiName}
		});
		return null;
	} catch (error) {
		console.error('发送请求统计失败:', error);
		return { error };
	}
}