<template>
	<view class="container" :class="{'dark-mode': isDarkMode}">
		<view class="header">
			<text class="title">查找附近的 maimai 机台</text>
		</view>
		
		<view class="search-box">
			<view class="search-input-wrapper">
				<input 
					v-model="searchCity" 
					placeholder="输入城市名称搜索 (如：青岛)" 
					class="search-input" 
					@confirm="searchByCity"
				/>
				<view class="search-btn" @click="searchByCity">搜索</view>
			</view>
		</view>
		
		<view class="status-bar" v-if="loading">
			<text>正在加载数据...</text>
		</view>
		
		<view class="location-info clickable" v-if="addressInfo" @click="fetchCurrentLocation">
			<text>当前位置: {{addressInfo.province}} {{addressInfo.city}} {{addressInfo.district}}</text>
			<text class="refresh-hint">点击刷新位置</text>
		</view>
		
		<view class="error-msg clickable" v-if="errorMsg" @click="fetchCurrentLocation">
			<text>{{errorMsg}}</text>
			<text class="refresh-hint">点击重试</text>
		</view>
		
		<view class="result-list">
			<view 
				class="result-item" 
				v-for="(item, index) in sortedMachines" 
				:key="item.id"
			>
				<view class="machine-info" @click="openMapLocation(item)">
					<view class="machine-name">{{item.name}}</view>
					
					<view class="machine-location">
						<text>{{item.province}} {{item.city}} {{item.area}}</text>
					</view>
					
					<view class="machine-address">
						<text>{{item.address}}</text>
					</view>
					
					<view class="machine-actions">
						<!-- 赞和踩放在左边 -->
						<view class="vote-actions" @click.stop>
							<view 
								class="vote-btn like-btn" 
								:class="{'active': likedMachines.includes(item.id)}"
								@click="handleVote(item.id, likedMachines.includes(item.id) ? 3 : 1)"
							>
								<text class="vote-icon">赞</text>
								<text class="vote-count">{{item.good || 0}}</text>
							</view>
							
							<view 
								class="vote-btn dislike-btn" 
								:class="{'active': dislikedMachines.includes(item.id)}"
								@click="handleVote(item.id, dislikedMachines.includes(item.id) ? 4 : 2)"
							>
								<text class="vote-icon">踩</text>
								<text class="vote-count">{{item.bad || 0}}</text>
							</view>
						</view>
						
						<!-- distance放在右边 -->
						<view class="machine-distance">
							<text>{{item.distance}}千米</text>
						</view>
					</view>
				</view>
			</view>
		</view>
		
		<view class="no-data" v-if="sortedMachines.length === 0 && !loading">
			<text>暂无数据</text>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted, computed, inject, onBeforeMount } from 'vue'
import {updateNativeTabBar} from '@/utils/updateNativeTabBar.js'


// 响应式数据
const machines = ref([])
const currentLocation = ref(null)
const addressInfo = ref(null)
const loading = ref(true)
const errorMsg = ref('')
const sortedMachines = ref([])
const searchCity = ref('')
const platform = ref('')

// 赞和踩的本地存储
const likedMachines = ref([])
const dislikedMachines = ref([])

// 注入深色模式变量
const isDarkMode = inject('isDarkMode');
const applyTheme = inject('applyTheme');


onBeforeMount(() => {
	applyTheme();
	updateNativeTabBar(isDarkMode.value);
})

// 生命周期钩子
onMounted(() => {
	// 获取系统平台信息
	uni.getSystemInfo({
		success: (res) => {
			platform.value = res.platform
			console.log('当前平台:', platform.value)
		}
	})
	fetchCurrentLocation()
	
	// 从本地存储加载赞和踩的记录
	loadVoteRecords()
})

// 从本地存储加载赞和踩的记录
const loadVoteRecords = () => {
	try {
		const likedData = uni.getStorageSync('likedMachines')
		const dislikedData = uni.getStorageSync('dislikedMachines')
		
		if (likedData) {
			likedMachines.value = JSON.parse(likedData)
		}
		
		if (dislikedData) {
			dislikedMachines.value = JSON.parse(dislikedData)
		}
	} catch (e) {
		console.error('加载投票记录失败:', e)
	}
}

// 保存投票记录到本地存储
const saveVoteRecords = () => {
	try {
		uni.setStorageSync('likedMachines', JSON.stringify(likedMachines.value))
		uni.setStorageSync('dislikedMachines', JSON.stringify(dislikedMachines.value))
	} catch (e) {
		console.error('保存投票记录失败:', e)
	}
}

// 处理投票操作
const handleVote = (id, type) => {
	// 判断是否需要先取消之前的操作
	if (type === 1 && dislikedMachines.value.includes(id)) {
		// 如果要点赞，但已经踩过，先取消踩
		handleVoteRequest(id, 4) // 先取消踩
		.then(() => {
			// 成功取消踩后再点赞
			handleVoteRequest(id, 1)
		})
	} else if (type === 2 && likedMachines.value.includes(id)) {
		// 如果要踩，但已经赞过，先取消赞
		handleVoteRequest(id, 3) // 先取消赞
		.then(() => {
			// 成功取消赞后再踩
			handleVoteRequest(id, 2)
		})
	} else {
		// 正常的赞/踩/取消操作
		handleVoteRequest(id, type)
	}
}

// 发送投票请求
const handleVoteRequest = (id, type) => {
	// 构建请求URL
	const url = `https://mais.godserver.cn/api/mai/v1/place?id=${id}&type=${type}`
	
	// 返回Promise以便链式调用
	return new Promise((resolve, reject) => {
		// 发送请求
		uni.request({
			url: url,
			method: 'GET',
			success: (res) => {
				if (res.statusCode === 200) {
					// 更新本地数据
					updateMachineVotes(id, type)
					
					// 更新本地存储
					if (type === 1) {
						// 添加赞
						if (!likedMachines.value.includes(id)) {
							likedMachines.value.push(id)
						}
					} else if (type === 2) {
						// 添加踩
						if (!dislikedMachines.value.includes(id)) {
							dislikedMachines.value.push(id)
						}
					} else if (type === 3) {
						// 取消赞
						const index = likedMachines.value.indexOf(id)
						if (index !== -1) {
							likedMachines.value.splice(index, 1)
						}
					} else if (type === 4) {
						// 取消踩
						const index = dislikedMachines.value.indexOf(id)
						if (index !== -1) {
							dislikedMachines.value.splice(index, 1)
						}
					}
					
					// 保存到本地存储
					saveVoteRecords()
					
					// 提示用户操作成功（对于链式操作只在最后一步提示）
					if ((type === 1 && !dislikedMachines.value.includes(id)) || 
						(type === 2 && !likedMachines.value.includes(id)) ||
						type === 3 || type === 4) {
						let message = ''
						switch (type) {
							case 1: message = '点赞成功'; break;
							case 2: message = '点踩成功'; break;
							// case 3: message = '取消点赞'; break;
							// case 4: message = '取消踩一下'; break;
						}
						
						uni.showToast({
							title: message,
							icon: 'none',
							duration: 1500
						})
					}
					
					resolve()
				} else {
					uni.showToast({
						title: '操作失败',
						icon: 'none',
						duration: 1500
					})
					console.error('投票请求失败:', res)
					reject(res)
				}
			},
			fail: (err) => {
				uni.showToast({
					title: '网络请求失败',
					icon: 'none',
					duration: 1500
				})
				console.error('投票请求错误:', err)
				reject(err)
			}
		})
	})
}

// 更新机台的赞和踩数量
const updateMachineVotes = (id, type) => {
	// 在sortedMachines中查找对应的机台
	const machineIndex = sortedMachines.value.findIndex(m => m.id === id)
	
	if (machineIndex !== -1) {
		const machine = sortedMachines.value[machineIndex]
		
		// 根据type更新good和bad的值
		switch (type) {
			case 1: // 增加赞
				machine.good = (machine.good || 0) + 1
				break
			case 2: // 增加踩
				machine.bad = (machine.bad || 0) + 1
				break
			case 3: // 减少赞
				machine.good = Math.max(0, (machine.good || 0) - 1)
				break
			case 4: // 减少踩
				machine.bad = Math.max(0, (machine.bad || 0) - 1)
				break
		}
	}
}

// 获取当前位置
const fetchCurrentLocation = () => {
	// 重置错误信息
	errorMsg.value = ''
	loading.value = true
	
	uni.getLocation({
		type: 'gcj02',
		geocode: true, // 设置geocode为true，获取地址信息
		success: (res) => {
			currentLocation.value = {
				latitude: res.latitude,
				longitude: res.longitude
			}
			// 保存地址信息
			if(res.address) {
				addressInfo.value = {
					country: res.address.country,
					province: res.address.province,
					city: res.address.city,
					district: res.address.district,
				}
				// 使用当前城市作为默认搜索
				if(res.address.city) {
					// 从"青岛市"提取为"青岛"
					const cityName = res.address.city.replace(/市$/, '')
					searchCity.value = cityName
					fetchMaimaiData(cityName)
				} else {
					fetchMaimaiData()
				}
			} else {
				fetchMaimaiData()
			}
			console.log('当前位置:', currentLocation.value, '地址信息:', addressInfo.value)
			
			// 提示用户位置已更新
			uni.showToast({
				title: '位置已更新',
				icon: 'success',
				duration: 1500
			})
		},
		fail: (err) => {
			console.error('获取位置失败:', err)
			errorMsg.value = '获取位置信息失败，请检查定位权限'
			loading.value = false
			// 即使获取位置失败，仍然尝试获取数据
			fetchMaimaiData()
		}
	})
}

// 根据城市搜索
const searchByCity = () => {
	loading.value = true
	errorMsg.value = ''
	fetchMaimaiData(searchCity.value)
}

// 获取maimai机台数据
const fetchMaimaiData = (city = '') => {
	const query = city.trim() // 移除首尾空格
	const url = `https://mais.godserver.cn/api/mai/v1/searchAll?query=${encodeURIComponent(query)}`
	
	uni.request({
		url: url,
		method: 'GET',
		success: (res) => {
			if (res.statusCode === 200 && res.data) {
				machines.value = res.data
				calculateDistances()
				if (machines.value.length === 0) {
					errorMsg.value = '未找到相关机台数据'
				}
			} else {
				errorMsg.value = '获取数据失败'
				console.error('API返回错误:', res)
			}
		},
		fail: (err) => {
			errorMsg.value = '网络请求失败'
			console.error('请求失败:', err)
		},
		complete: () => {
			loading.value = false
		}
	})
}

// 计算距离并排序
const calculateDistances = () => {
	if (!currentLocation.value) {
		// 如果没有位置信息，直接显示原始数据
		sortedMachines.value = [...machines.value]
		return
	}
	
	sortedMachines.value = machines.value.map(machine => {
		const distance = getDistance(
			currentLocation.value.latitude,
			currentLocation.value.longitude,
			machine.y,
			machine.x
		)
		return {
			...machine,
			distance: distance.toFixed(2)
		}
	})
	
	// 按距离排序
	sortedMachines.value.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
}

// 计算两点间的距离（使用Haversine公式）
const getDistance = (lat1, lon1, lat2, lon2) => {
	if (!lat1 || !lon1 || !lat2 || !lon2) return 9999
	
	// 转换为弧度
	const radLat1 = (lat1 * Math.PI) / 180
	const radLat2 = (lat2 * Math.PI) / 180
	const radLon1 = (lon1 * Math.PI) / 180
	const radLon2 = (lon2 * Math.PI) / 180
	
	// 地球半径 (千米)
	const R = 6371
	
	// Haversine 公式
	const dLat = radLat2 - radLat1
	const dLon = radLon2 - radLon1
	const a = 
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(radLat1) * Math.cos(radLat2) * 
		Math.sin(dLon / 2) * Math.sin(dLon / 2)
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
	const distance = R * c
	
	return distance
}

// 打开地图应用并定位到选择的机台位置
const openMapLocation = (machine) => {
	// 构建搜索关键词
	const searchKeyword = `${machine.name} ${machine.address}`
	
	// 构建地图URL（尝试打开高德地图应用）
	let mapUrl = ''
	
	if (platform.value === 'ios') {
		// iOS高德地图URL Scheme
		mapUrl = `iosamap://poi?sourceApplication=EasyMai&keywords=${encodeURIComponent(searchKeyword)}`
	} else if (platform.value === 'android') {
		// Android高德地图URL Scheme
		mapUrl = `androidamap://poi?sourceApplication=EasyMai&keywords=${encodeURIComponent(searchKeyword)}&dev=0`
	}
	
	// 使用uniapp的plus接口打开外部应用
	// #ifdef APP-PLUS
	plus.runtime.openURL(mapUrl, (err) => {
		// 如果打开失败（可能是没有安装高德地图），则使用内置地图或网页版
		if (err) {
			console.log('打开高德地图失败，尝试使用内置地图:', err)
			uni.showToast({
				title: '跳转到高德地图失败',
				icon: 'none',
				duration: 2000
			})
			openBuiltInMap(machine)
		}
	})
	// #endif
	
	// 非App环境下使用内置地图
	// #ifndef APP-PLUS
	openBuiltInMap(machine)
	// #endif
}

// 使用uni-app内置地图
const openBuiltInMap = (machine) => {
	// 确保有经纬度信息
	if (!machine.x || !machine.y) {
		uni.showToast({
			title: '无法获取位置坐标',
			icon: 'none'
		})
		return
	}
	
	uni.openLocation({
		latitude: parseFloat(machine.y),
		longitude: parseFloat(machine.x),
		name: machine.name,
		address: machine.address,
		success: () => {
			console.log('打开地图成功')
		},
		fail: (err) => {
			console.error('打开地图失败:', err)
			uni.showToast({
				title: '打开地图失败',
				icon: 'none'
			})
		}
	})
}
</script>

<style lang="scss">
	
@import './dark-find-maimai.scss';

.container {
	padding: 20rpx;
	background-color: #f5f7fa;
	min-height: 100vh;
	
	.header {
		padding: 20rpx 0;
		text-align: center;
		margin-bottom: 10rpx;
		
		.title {
			font-size: 36rpx;
			font-weight: bold;
			color: #333;
			text-shadow: 0 1rpx 0 rgba(255, 255, 255, 0.8);
		}
	}
	
	.search-box {
		margin-bottom: 10rpx;
		background-color: #fff;
		border-radius: 20rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
		padding: 20rpx;
		
		.search-input-wrapper {
			display: flex;
			align-items: center;
			background-color: #f5f5f5;
			border-radius: 40rpx;
			padding: 0 30rpx;
			transition: all 0.3s ease;
			border: 2rpx solid transparent;
			
			&:focus-within {
				background-color: #fff;
				box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
				border-color: rgba(99, 102, 241, 0.3);
			}
			
			.search-icon {
				margin-right: 20rpx;
				font-size: 32rpx;
			}
			
			.search-input {
				flex: 1;
				height: 80rpx;
				font-size: 28rpx;
				color: #333;
				background-color: transparent;
				border: none;
				
				&::placeholder {
					color: #999;
				}
			}
			
			.search-btn {
				height: 60rpx;
				padding: 0 30rpx;
				background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
				color: #fff;
				border-radius: 20rpx;
				font-size: 26rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				box-shadow: 0 4rpx 10rpx rgba(99, 102, 241, 0.25);
				
				&:active {
					transform: scale(0.96);
					box-shadow: 0 2rpx 6rpx rgba(99, 102, 241, 0.2);
				}
			}
		}
	}
	
	.status-bar, .location-info, .error-msg {
		padding: 16rpx 20rpx;
		margin-bottom: 5rpx;
		border-radius: 16rpx;
		position: relative;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
	}
	
	.status-bar {
		background-color: #e6f7ff;
	}
	
	.location-info {
		background-color: #f6ffed;
		
		&.clickable {
			display: flex;
			flex-direction: column;
			
			&:active {
				background-color: #e6ffdb;
			}
		}
	}
	
	.error-msg {
		background-color: #fff2f0;
		color: #f5222d;
		
		&.clickable {
			display: flex;
			flex-direction: column;
			
			&:active {
				background-color: #ffebe8;
			}
		}
	}
	
	.refresh-hint {
		font-size: 24rpx;
		color: #999;
		margin-top: 6rpx;
	}
	
	.result-list {
		padding: 0 0rpx;
		margin-top: 0rpx;
		
		.result-item {
			margin: 16rpx 0;
			padding: 24rpx;
			background-color: rgba(255, 255, 255, 0.98);
			border-radius: 20rpx;
			box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.08);
			transition: all 0.3s ease;
			position: relative;
			overflow: hidden;
			
			&:active {
				transform: translateY(-2rpx);
				box-shadow: 0 8rpx 20rpx rgba(99, 102, 241, 0.15);
				
				&::after {
					opacity: 1;
				}
			}
			
			&::after {
				content: '';
				position: absolute;
				left: 0;
				top: 0;
				width: 6rpx;
				height: 100%;
				background: linear-gradient(to bottom, #818cf8, #6366f1);
				opacity: 0;
				transition: opacity 0.3s ease;
			}
			
			.machine-info {
				position: relative;
				padding-bottom: 10rpx;
				
				.machine-name {
					font-size: 34rpx;
					font-weight: bold;
					color: #333;
					margin-bottom: 16rpx;
					line-height: 1.4;
					width: 100%;
					word-break: break-all;
				}
				
				.machine-location {
					font-size: 28rpx;
					color: #666;
					margin-bottom: 10rpx;
				}
				
				.machine-address {
					font-size: 26rpx;
					color: #666;
					line-height: 1.5;
					margin-bottom: 10rpx;
				}
				
				.machine-actions {
					margin-top: 30rpx;
					display: flex;
					justify-content: space-between;
					align-items: center;
				}
				
				.machine-distance {
					font-size: 26rpx;
					color: #6366f1;
					font-weight: 500;
				}
			}
			
			// 添加赞和踩的样式
			.vote-actions {
				display: flex;
				align-items: center;
				
				.vote-btn {
					display: flex;
					align-items: center;
					justify-content: center;
					margin-right: 16rpx;
					padding: 8rpx 18rpx;
					border-radius: 30rpx;
					transition: all 0.3s ease;
					border: 1rpx solid  #666;
					min-width: 90rpx;
					background-color: transparent;
					
					&:active {
						transform: scale(0.95);
					}
					
					.vote-icon {
						font-size: 26rpx;
						margin-right: 8rpx;
						color: #666;
					}
					
					.vote-count {
						font-size: 26rpx;
						color: #666;
					}
					
					&.like-btn {
						&.active {
							background-color: rgba(82, 196, 26, 0.05);
							border-color: rgba(82, 196, 26, 0.3);
							
							.vote-icon, .vote-count {
								color: #52c41a;
							}
						}
					}
					
					&.dislike-btn {
						&.active {
							background-color: rgba(255, 77, 79, 0.05);
							border-color: rgba(255, 77, 79, 0.3);
							
							.vote-icon, .vote-count {
								color: #ff4d4f;
							}
						}
					}
				}
			}
		}
	}
	
	.no-data {
		text-align: center;
		padding: 60rpx 0;
		color: #999;
		background-color: rgba(255, 255, 255, 0.8);
		border-radius: 16rpx;
		margin: 40rpx 20rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		
		text {
			font-size: 28rpx;
		}
	}
}
</style> 