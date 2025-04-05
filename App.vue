<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import * as maiApi from './api/maiapi.js'
import {addAPICount} from '@/api/myapi.js'
import { ref, onMounted, provide } from 'vue'



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
		'divingFish_records', // 添加别名数据的存储key
		'b35rating',         // 添加 B35 rating 存储
		'b15rating',         // 添加 B15 rating 存储
		'totalRating',       // 添加总 rating 存储
		'lastLaunchDate',     // 添加上次启动日期存储
		'isDarkMode'         // 添加深色模式存储
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

	// 检查启动日期并记录每日启动
	const checkLaunchDate = () => {
		// 获取当前日期（格式：YYYY-MM-DD）
		const now = new Date()
		const currentDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
		
		// 获取上次启动日期
		const lastLaunchDate = uni.getStorageSync('lastLaunchDate')
		
		// 如果日期不同，则更新日期并记录每日启动
		if (lastLaunchDate !== currentDate) {
			// 更新启动日期
			uni.setStorageSync('lastLaunchDate', currentDate)
			
			// 记录每日启动
			addAPICount('DailyLaunch')
			console.log('记录每日启动:', currentDate)
		}
	}

	// 创建全局深色模式状态
	const isDarkMode = ref(uni.getStorageSync('isDarkMode') === 'true' ? true : false);

	// 提供给整个应用的全局状态和方法
	provide('isDarkMode', isDarkMode);

	// 提供切换主题的方法
	function toggleDarkMode() {
		isDarkMode.value = !isDarkMode.value;
		// 保存到本地存储
		uni.setStorageSync('isDarkMode', isDarkMode.value.toString());
		// 应用主题
		applyTheme();
	}
	provide('toggleDarkMode', toggleDarkMode);

	// 应用主题到页面，添加延时执行
	function applyTheme(retryCount = 0) {
		const maxRetries = 3; // 最大重试次数
		
		// 延时执行，给系统一些准备时间
		setTimeout(() => {
			// 设置颜色配置
			const config = {
				frontColor: isDarkMode.value ? '#ffffff' : '#000000',
				backgroundColor: isDarkMode.value ? '#1c1c1e' : '#f8f8f8',
				animation: {
					duration: 200,
					timingFunc: 'easeIn'
				}
			};
			
			// 使用标准API设置导航栏颜色
			uni.setNavigationBarColor({
				...config,
				success: () => {
					console.log('导航栏颜色设置成功');
				},
				fail: (err) => {
					console.error('导航栏颜色设置失败:', err);
					
					// 如果失败且未超过最大重试次数，则延迟后重试
					if (retryCount < maxRetries) {
						console.log(`尝试重新设置导航栏颜色 (${retryCount + 1}/${maxRetries})`);
						// 递增延迟时间，避免过快重试
						const delay = 300 + (retryCount * 150);
						setTimeout(() => {
							applyTheme(retryCount + 1);
						}, delay);
					}
				}
			});
			
			// 设置TabBar颜色 (如果有)
			try {
				// #ifdef APP-PLUS || MP
				if (isDarkMode.value) {
					uni.setTabBarStyle({
						color: '#8E8E93',
						selectedColor: '#818cf8',
						backgroundColor: '#1c1c1e',
						borderStyle: 'black'
					});
				} else {
					uni.setTabBarStyle({
						color: '#8E8E93',
						selectedColor: '#6366f1',
						backgroundColor: '#ffffff',
						borderStyle: 'white'
					});
				}
				// #endif
			} catch (e) {
				console.error('设置TabBar样式异常:', e);
			}
		}, 150); // 初始延时150ms
	}
	provide('applyTheme', applyTheme);

	// 初始化主题
	function initTheme() {
		applyTheme();
	}

	// App 生命周期
	onLaunch(() => {
		console.log('App Launch')
		//uni.clearStorageSync()
		// 初始化所有数据
		addAPICount('launch')
		initStorage()
		initUid()
		initMusicData()
		initChartStats()
		initAliasData() // 添加别名数据初始化
		checkLaunchDate() // 检查启动日期并记录每日启动
	})

	onShow(() => {
		console.log('App Show')
		// 移除每次显示应用时的日期检查
	})

	onHide(() => {
		console.log('App Hide')
	})
</script>

<template>

</template>

<style>

</style>
