<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import * as maiApi from './api/maiapi.js'

	/*
	本地存储:
	mai接口相关：
	maiUid;
	maiPlayData
	水鱼相关:
	b50;
	musicData;
	chartStats;
	divingFish_qqid;
	divingFish_username;
	divingFish_nickname
	divingFish_importToken
	divingFish_records;
	qq_channel_uid;
	*/

	// 需要初始化的key列表
	const initKeys = [
		'maiUid',
		'maiPlayData',
		'divingFish_qqid',
		'divingFish_username',
		'divingFish_importToken',
		'divingFish_nickname',
		'musicData',
		'b50',
		'divingFish_password',
		'chartStats',
		'aliasData',
		 'divingFish_records'// 添加别名数据的存储key
	]
   // uni.clearStorage()
	// 初始化本地存储
	const initStorage = () => {
		const info = uni.getStorageInfoSync()
		
		// 初始化所有需要的key
		for (const key of initKeys) {
			if (!info.keys.includes(key)) {
				uni.setStorageSync(key, '')
			}
		}
	}

	// 初始化UID
	const initUid = () => {
		let uid = uni.getStorageSync('uid')
		if (uid === '') {
			uid = -1
			uni.setStorageSync('uid', uid)
		}
	}

	// 获取并存储音乐数据
	const initMusicData = async () => {
		const musicData = uni.getStorageSync('musicData')
		if (musicData === '') {
			try {
				const data = await maiApi.divingFishGetMusic()
				uni.setStorageSync('musicData', data)
			} catch (error) {
				console.error('获取音乐数据失败:', error)
			}
		}
	}

	// 获取并存储谱面统计数据
	const initChartStats = async () => {
		const chartStats = uni.getStorageSync('chartStats')
		if (chartStats === '') {
			try {
				const data = await maiApi.getChartStats()
				uni.setStorageSync('chartStats', data)
			} catch (error) {
				console.error('获取谱面统计数据失败:', error)
			}
		}
	}

	// 获取并存储别名数据
	const initAliasData = async () => {
	   console.log(3)
		const aliasData = uni.getStorageSync('aliasData')
		// console.log(aliasData)
		if (!aliasData) {
			try {
				const response=await maiApi.getAliasData()
				console.log(response)
				if (response.data) {
					uni.setStorageSync('aliasData', response.data)
				}
			} catch (error) {
				console.error('获取别名数据失败:', error)
			}
		}
	}

	// App 生命周期
	onLaunch(() => {
		console.log('App Launch')
		//uni.clearStorageSync()
		// 初始化所有数据
		initStorage()
		initUid()
		initMusicData()
		initChartStats()
		initAliasData() // 添加别名数据初始化
	
	})

	onShow(() => {
		console.log('App Show')

	})

	onHide(() => {
		console.log('App Hide')
	})
</script>

<style>
	/*每个页面公共css */
</style>
