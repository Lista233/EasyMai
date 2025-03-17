<template>
	<view class="container">
		<!-- 头部信息 -->
		<view class="header">
			<view class="header-title">玩家记录</view>
			<view class="player-info" v-if="currentStats">
				<text class="nickname">{{ playerRecordService.getPlayerInfo()?.nickname || '未知玩家' }}</text>
				<text class="rating">Rating: {{ playerRecordService.getPlayerInfo()?.rating || 0 }}</text>
			</view>
			
			<!-- 统计信息 -->
			<view class="stats-row" v-if="currentStats">
				<view class="stat-item">
					<view class="stat-value">{{ currentStats.totalSongs }}</view>
					<view class="stat-label">总曲目数</view>
				</view>
				<view class="stat-item">
					<view class="stat-value">{{ currentStats.rateStats.sssp + currentStats.rateStats.sss }}</view>
					<view class="stat-label">SSS+/SSS</view>
				</view>
				<view class="stat-item">
					<view class="stat-value">{{ currentStats.fcStats.ap + currentStats.fcStats.fcp + currentStats.fcStats.fc }}</view>
					<view class="stat-label">FC+</view>
				</view>
			</view>
		</view>
		
		<!-- 筛选按钮 -->
		<view class="filter-buttons">
			<button class="filter-btn" @click="showSortFilter">
				<view class="btn-content">
					<text class="btn-title">排序方式</text>
					<text class="filter-active" v-if="sortBy">{{ sortBy === 'ra' ? 'RA值' : '达成率' }}</text>
				</view>
			</button>
			<button class="filter-btn" @click="showVersionFilter">
				<view class="btn-content">
					<text class="btn-title">版本筛选</text>
					<text class="filter-active" v-if="selectedVersion">{{ formatVersionText }}</text>
				</view>
			</button>
			<button class="filter-btn" @click="showDsFilter">
				<view class="btn-content">
					<text class="btn-title">定数筛选</text>
					<text class="filter-active" v-if="selectedDsRange && selectedDsRange.label !== '全部'">{{ selectedDsRange.label }}</text>
				</view>
			</button>
			<button class="filter-btn" @click="showDifficultyFilter">
				<view class="btn-content">
					<text class="btn-title">难度筛选</text>
					<text class="filter-active" v-if="selectedDifficulty !== null">{{ difficultyLabels[selectedDifficulty] }}</text>
				</view>
			</button>
		</view>
		
		<!-- 记录列表 -->
		<view class="record-list">
			<view class="list-header">
				<text class="list-title">歌曲记录</text>
				<text class="record-count">总计: {{ filteredRecords.length }}</text>
			</view>

			<view class="song-records">
				<view v-for="(record, index) in paginatedRecords" :key="index" class="song-card" @click="navigateToDetail(record.song_id)">
					<view class="song-cover">
						<image class="cover-image" :class="`level-${record.level_index}`" :src="getSongCover(record.song_id)" mode="aspectFill"></image>
						<view class="difficulty-badge" :class="`level-${record.level_index}`">
							{{ getSongDs(record.song_id, record.level_index) }}
						</view>
					</view>
					<view class="song-info">
						<view class="song-title">{{ songService.getSongById(record.song_id)?.title || '未知歌曲' }}</view>
						<view class="song-stats">
							<view class="stat-item achievements">{{ (record.achievements).toFixed(4) }}%</view>
							<view class="stat-item ra">RA: {{ record.ra }}</view>
							<view v-if="record.fc" class="stat-item fc-fs">{{ record.fc.toUpperCase() }}</view>
						</view>
					</view>
					<view class="rate-badge" :class="record.rate.toLowerCase()">{{ record.rate.toUpperCase() }}</view>
				</view>
			</view>
			
			<!-- 分页控制 -->
			<view class="pagination" v-if="filteredRecords.length > 0">
				<view class="page-info">
					第 {{ currentPage }} / {{ totalPages }} 页
					<text class="total-count">共 {{ filteredRecords.length }} 条记录</text>
				</view>
				<view class="page-controls">
					<button class="page-btn" 
						:disabled="currentPage === 1"
						@click="currentPage--">上一页</button>
					<button class="page-btn" 
						:disabled="currentPage === totalPages"
						@click="currentPage++">下一页</button>
				</view>
			</view>
		</view>
		
		<!-- 排序弹窗 -->
		<uni-popup ref="sortPopup" type="center">
			<view class="filter-popup">
				<view class="popup-header">
					<text class="title">排序方式</text>
					<text class="close-btn" @click="closeSortFilter">×</text>
				</view>
				<view class="popup-content">
					<view class="option-list">
						<view 
							class="option-item"
							:class="{ active: sortBy === 'ra' }"
							@click="selectSortBy('ra')"
						>
							<text>RA值</text>
						</view>
						<view 
							class="option-item"
							:class="{ active: sortBy === 'achievements' }"
							@click="selectSortBy('achievements')"
						>
							<text>达成率</text>
						</view>
					</view>
				</view>
				<view class="popup-footer">
					<button class="cancel-btn" @click="closeSortFilter">取消</button>
					<button class="confirm-btn" @click="applySortFilter">确定</button>
				</view>
			</view>
		</uni-popup>
		
		<!-- 版本筛选弹窗 -->
		<uni-popup ref="versionPopup" type="center">
			<view class="filter-popup">
				<view class="popup-header">
					<text class="title">版本筛选</text>
					<text class="close-btn" @click="closeVersionFilter">×</text>
				</view>
				<view class="popup-content version-list">
					<scroll-view scroll-y class="version-scroll">
						<view 
							class="option-item"
							:class="{ active: selectedVersion === '' }"
							@click="selectVersion('')"
						>
							<text>全部</text>
						</view>
						<view 
							v-for="version in versions" 
							:key="version"
							class="option-item"
							:class="{ active: selectedVersion === version }"
							@click="selectVersion(version)"
						>
							<text>{{version}}</text>
						</view>
					</scroll-view>
				</view>
				<view class="popup-footer">
					<button class="cancel-btn" @click="closeVersionFilter">取消</button>
					<button class="confirm-btn" @click="applyVersionFilter">确定</button>
				</view>
			</view>
		</uni-popup>
		
		<!-- 定数筛选弹窗 -->
		<uni-popup ref="dsPopup" type="center">
			<view class="filter-popup">
				<view class="popup-header">
					<text class="title">定数范围筛选</text>
					<text class="close-btn" @click="closeDsFilter">×</text>
				</view>
				<view class="popup-content">
					<view class="option-list">
						<view 
							v-for="range in dsRanges" 
							:key="range.label"
							class="option-item"
							:class="{ active: selectedDsRange === range }"
							@click="selectDsRange(range)"
						>
							<text>{{range.label}}</text>
						</view>
					</view>
				</view>
				<view class="popup-footer">
					<button class="cancel-btn" @click="closeDsFilter">取消</button>
					<button class="confirm-btn" @click="applyDsFilter">确定</button>
				</view>
			</view>
		</uni-popup>
		
		<!-- 难度筛选弹窗 -->
		<uni-popup ref="difficultyPopup" type="center">
			<view class="filter-popup">
				<view class="popup-header">
					<text class="title">难度筛选</text>
					<text class="close-btn" @click="closeDifficultyFilter">×</text>
				</view>
				<view class="popup-content">
					<view class="option-list">
						<view 
							class="option-item"
							:class="{ active: selectedDifficulty === null }"
							@click="selectDifficulty(null)"
						>
							<text>全部</text>
						</view>
						<view 
							v-for="(label, index) in difficultyLabels" 
							:key="index"
							class="option-item"
							:class="{ active: selectedDifficulty === index }"
							:style="{ color: selectedDifficulty === index ? '#fff' : getDifficultyColor(index) }"
							@click="selectDifficulty(index)"
						>
							<text>{{label}}</text>
						</view>
					</view>
				</view>
				<view class="popup-footer">
					<button class="cancel-btn" @click="closeDifficultyFilter">取消</button>
					<button class="confirm-btn" @click="applyDifficultyFilter">确定</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import SongService from '@/utils/songService.js'
import playerRecordService from '@/utils/PlayerRecordService.js'
import { getCoverUrl } from '../../util/coverManager.js'

// 响应式状态
const songService = ref(null)
const sortBy = ref('ra')
const selectedVersion = ref('')
const selectedDsRange = ref(null)
const selectedDifficulty = ref(null)
const tempSortBy = ref('ra')
const tempVersion = ref('')
const tempDsRange = ref(null)
const tempDifficulty = ref(null)

// 弹窗引用
const sortPopup = ref(null)
const versionPopup = ref(null)
const dsPopup = ref(null)
const difficultyPopup = ref(null)

// 预定义的定数范围
const dsRanges = [
	{ label: '全部', min: 0, max: Infinity },
	{ label: '13+', min: 13.7, max: 13.9 },
	{ label: '14', min: 14.0, max: 14.4 },
	{ label: '14+', min: 14.5, max: 14.9 },
	{ label: '15', min: 15.0, max: Infinity }
]

// 版本列表
const versions = [
	'maimai でらっくす Splash',
	'maimai でらっくす UNiVERSE',
	'maimai でらっくす FESTiVAL',
	'maimai でらっくす BUDDiES'
]

// 当前统计信息
const currentStats = ref(null)

// 添加分页相关的响应式变量
const currentPage = ref(1)
const pageSize = ref(20)

// 添加难度相关的常量和响应式变量
const difficultyLabels = ['Basic', 'Advanced', 'Expert', 'Master', 'Re:Master']

// 计算筛选后的记录
const filteredRecords = computed(() => {
	if (!songService.value) return []
	
	return playerRecordService.filterRecordsByMultipleConditions(songService.value, {
		version: selectedVersion.value,
		difficultyIndex: selectedDifficulty.value,
		dsRange: selectedDsRange.value && selectedDsRange.value.label !== '全部' 
			? { min: selectedDsRange.value.min, max: selectedDsRange.value.max } 
			: null,
		sortBy: sortBy.value,
		order: 'desc'
	})
})

// 修改计算属性
const paginatedRecords = computed(() => {
	const startIndex = (currentPage.value - 1) * pageSize.value
	const endIndex = startIndex + pageSize.value
	return filteredRecords.value.slice(startIndex, endIndex)
})

const totalPages = computed(() => {
	return Math.ceil(filteredRecords.value.length / pageSize.value)
})

// 格式化版本文本
const formatVersionText = computed(() => {
	if (!selectedVersion.value) return '';
	// 简化版本名称显示
	const shortNames = {
		'maimai でらっくす Splash': 'Splash',
		'maimai でらっくす UNiVERSE': 'UNiVERSE',
		'maimai でらっくす FESTiVAL': 'FESTiVAL',
		'maimai でらっくす BUDDiES': 'BUDDiES'
	};
	return shortNames[selectedVersion.value] || selectedVersion.value;
})

// 初始化
onMounted(() => {
	const musicList = uni.getStorageSync('musicData')
	const playerData = uni.getStorageSync('divingFish_records')
	
	songService.value = new SongService(musicList)
	playerRecordService.initPlayerData(playerData.data)
	
	// 设置默认值
	selectedDsRange.value = dsRanges[0]
	
	updateStats()
})

// 弹窗相关方法
const showSortFilter = () => {
	tempSortBy.value = sortBy.value
	sortPopup.value.open()
}

const closeSortFilter = () => {
	sortPopup.value.close()
}

const selectSortBy = (type) => {
	tempSortBy.value = type
}

const applySortFilter = () => {
	sortBy.value = tempSortBy.value
	closeSortFilter()
	currentPage.value = 1 // 重置页码
}

const showVersionFilter = () => {
	tempVersion.value = selectedVersion.value
	versionPopup.value.open()
}

const closeVersionFilter = () => {
	versionPopup.value.close()
}

const selectVersion = (version) => {
	tempVersion.value = version
}

const applyVersionFilter = () => {
	selectedVersion.value = tempVersion.value
	closeVersionFilter()
	currentPage.value = 1 // 重置页码
	updateStats()
}

const showDsFilter = () => {
	tempDsRange.value = selectedDsRange.value
	dsPopup.value.open()
}

const closeDsFilter = () => {
	dsPopup.value.close()
}

const selectDsRange = (range) => {
	tempDsRange.value = range
}

const applyDsFilter = () => {
	selectedDsRange.value = tempDsRange.value
	closeDsFilter()
	currentPage.value = 1 // 重置页码
	updateStats()
}

const showDifficultyFilter = () => {
	tempDifficulty.value = selectedDifficulty.value
	difficultyPopup.value.open()
}

const closeDifficultyFilter = () => {
	difficultyPopup.value.close()
}

const selectDifficulty = (difficulty) => {
	tempDifficulty.value = difficulty
}

const applyDifficultyFilter = () => {
	selectedDifficulty.value = tempDifficulty.value
	closeDifficultyFilter()
	currentPage.value = 1 // 重置页码
	updateStats()
}

// 更新统计信息
const updateStats = () => {
	let records = []
	
	// 版本筛选
	if (selectedVersion.value) {
		records = playerRecordService.getRecordsByVersion(songService.value, selectedVersion.value)
	} else {
		records = playerRecordService.getAllRecords()
	}
	
	// 应用难度筛选
	if (selectedDifficulty.value !== null) {
		records = records.filter(record => record.level_index === selectedDifficulty.value)
	}
	
	// 应用定数筛选
	if (selectedDsRange.value && selectedDsRange.value.label !== '全部') {
		records = playerRecordService.getBestRecordsByDs(
			songService.value,
			{
				min: selectedDsRange.value.min,
				max: selectedDsRange.value.max
			},
			{ records } // 传入已筛选的记录
		)
	}
	
	currentStats.value = {
		totalSongs: records.length,
		rateStats: {
			sssp: records.filter(r => r.rate === 'sssp').length,
			sss: records.filter(r => r.rate === 'sss').length,
			ssp: records.filter(r => r.rate === 'ssp').length,
			ss: records.filter(r => r.rate === 'ss').length
		},
		fcStats: {
			ap: records.filter(r => r.fc === 'ap').length,
			fcp: records.filter(r => r.fc === 'fcp').length,
			fc: records.filter(r => r.fc === 'fc').length
		}
	}
}

// 获取难度颜色
const getDifficultyColor = (index) => {
	const colors = ['#1EA15D', '#F6B40C', '#E9485D', '#9E45E2', '#BA1A1A']
	return colors[index] || '#000'
}

// 获取难度样式
const getDifficultyStyle = (index) => {
	return { color: getDifficultyColor(index) }
}

// 获取难度标签
const getDifficultyLabel = (index) => {
	return difficultyLabels[index] || 'Unknown'
}

// 获取评级样式
const getRateStyle = (rate) => {
	const rateColors = {
		'sssp': '#b8860b',
		'sss': '#b8860b',
		'ssp': '#ff5722',
		'ss': '#ff5722',
		'sp': '#9c27b0',
		's': '#9c27b0',
		'aaa': '#2196f3',
		'aa': '#2196f3',
		'a': '#4caf50',
		'bbb': '#795548',
		'bb': '#795548',
		'b': '#795548',
		'c': '#9e9e9e',
		'd': '#9e9e9e'
	}
	
	return { color: rateColors[rate.toLowerCase()] || '#000' }
}

// 获取成绩样式类
const getAchievementClass = (achievement) => {
	if (achievement >= 100.5) return 'sssp'
	if (achievement >= 100.0) return 'sss'
	if (achievement >= 99.5) return 'ssp'
	if (achievement >= 99.0) return 'ss'
	if (achievement >= 98.0) return 'sp'
	if (achievement >= 97.0) return 's'
	return 'normal'
}

// 获取歌曲封面
const getSongCover = (songId) => {
	return getCoverUrl(songId)
}

// 添加跳转到歌曲详情页的方法
const navigateToDetail = (songId) => {
	if (!songId) return;
	
	uni.navigateTo({
		url: `/pages/song-detail/song-detail?songId=${songId}`,
		animationType: 'pop-in',
		animationDuration: 0
	});
}

// 添加获取难度样式的辅助方法
const getDifficultyClass = (levelIndex) => {
	const classes = ['basic', 'advanced', 'expert', 'master', 'remaster']
	return classes[levelIndex] || ''
}

// 获取歌曲定数
const getSongDs = (songId, levelIndex) => {
	const song = songService.value.getSongById(songId);
	if (!song || !song.ds || levelIndex >= song.ds.length) return '?';
	return song.ds[levelIndex];
}
</script>

<style lang="scss">
.container {
	padding: 40rpx 20rpx 20rpx 10rpx;
	background: linear-gradient(135deg, #f0f4ff 0%, #e6e9ff 100%);
	min-height: 100vh;
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
	box-sizing: border-box;
}

.header {
	margin-bottom: 20rpx;
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(10px);
	border-radius: 20rpx;
	padding: 32rpx 40rpx;
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
	border: 1px solid rgba(255, 255, 255, 0.7);
	position: relative;
	overflow: hidden;
	
	.header-title {
		font-size: 38rpx;
		font-weight: bold;
		margin-bottom: 16rpx;
		color: #1e293b;
	}
	
	.player-info {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
		
		.nickname {
			font-size: 32rpx;
			font-weight: bold;
			color: #1e293b;
			margin-right: 16rpx;
		}
		
		.rating {
			font-size: 28rpx;
			color: #6366f1;
			background-color: rgba(99, 102, 241, 0.1);
			padding: 6rpx 16rpx;
			border-radius: 30rpx;
			font-weight: bold;
		}
	}
	
	.stats-row {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
		margin-top: 16rpx;
		
		.stat-item {
			background-color: rgba(255, 255, 255, 0.9);
			border-radius: 16rpx;
			padding: 16rpx;
			flex: 1;
			min-width: 180rpx;
			box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.05);
			
			.stat-value {
				font-size: 32rpx;
				font-weight: bold;
				color: #1e293b;
				margin-bottom: 8rpx;
			}
			
			.stat-label {
				font-size: 24rpx;
				color: #64748b;
			}
		}
	}
}

.filter-buttons {
	display: flex;
	gap: 16rpx;
	margin-bottom: 24rpx;
	padding: 0 10rpx;
	
	.filter-btn {
		flex: 1;
		height: 88rpx;
		border-radius: 16rpx;
		border: none;
		font-size: 28rpx;
		font-weight: 500;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		overflow: hidden;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
		letter-spacing: 0.3px;
		background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
		
		&::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0));
			opacity: 0;
		}
		
		&:active {
			transform: scale(0.98) translateY(1px);
		}
		
		.btn-content {
			display: flex;
			flex-direction: column;
			align-items: center;
			
			.btn-title {
				font-size: 26rpx;
				color: #ffffff;
			}
			
			.filter-active {
				font-size: 22rpx;
				color: rgba(255, 255, 255, 0.9);
				margin-top: 4rpx;
			}
		}
	}
}

.record-list {
	background: rgba(255, 255, 255, 0.95);
	border-radius: 20rpx;
	padding: 24rpx;
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
	border: 1px solid rgba(255, 255, 255, 0.7);
	position: relative;
	overflow: hidden;
	
	.list-header {
		font-size: 30rpx;
		font-weight: bold;
		color: #1e293b;
		margin-bottom: 16rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		
		.list-title {
			font-size: 32rpx;
			font-weight: 600;
		}
		
		.record-count {
			font-size: 26rpx;
			color: #64748b;
			font-weight: 500;
		}
	}
}

.song-records {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
	padding: 0 10rpx;
	margin-bottom: 32rpx;
	
	.song-card {
		position: relative;
		width: 100%;
		background: white;
		border-radius: 16rpx;
		padding: 16rpx;
		box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.08);
		display: flex;
		gap: 24rpx;
		box-sizing: border-box;
		align-items: center;
		
		&:active {
			transform: scale(0.98);
			box-shadow: 0 1rpx 4rpx rgba(0,0,0,0.1);
		}
		
		.song-cover {
			position: relative;
			width: 140rpx;
			height: 140rpx;
			display: flex;
			flex-direction: column;
			align-items: center;
			flex-shrink: 0;
			
			.cover-image {
				width: 140rpx;
				height: 140rpx;
				border-radius: 8rpx;
				object-fit: cover;
				background-color: #f5f5f5;
				border: 6rpx solid transparent;
				box-sizing: border-box;
				box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
				
				&.level-0 {
					border-color: rgba(46, 204, 113, 0.8);
				}
				
				&.level-1 {
					border-color: rgba(241, 196, 15, 0.8);
				}
				
				&.level-2 {
					border-color: rgba(231, 76, 60, 0.8);
				}
				
				&.level-3 {
					border-color: rgba(155, 89, 182, 0.8);
				}
				
				&.level-4 {
					border-color: rgba(192, 57, 43, 0.8);
				}
			}
			
			.difficulty-badge {
				position: absolute;
				bottom: -10rpx;
				left: 50%;
				transform: translateX(-50%);
				padding: 4rpx 12rpx;
				border-radius: 20rpx;
				font-size: 22rpx;
				font-weight: bold;
				color: white;
				box-shadow: 0 2rpx 4rpx rgba(0,0,0,0.2);
				min-width: 60rpx;
				text-align: center;
				
				&.level-0 {
					background: linear-gradient(135deg, #2ecc71, #27ae60);
				}
				
				&.level-1 {
					background: linear-gradient(135deg, #f1c40f, #f39c12);
				}
				
				&.level-2 {
					background: linear-gradient(135deg, #e74c3c, #c0392b);
				}
				
				&.level-3 {
					background: linear-gradient(135deg, #9b59b6, #8e44ad);
				}
				
				&.level-4 {
					background: linear-gradient(135deg, #c0392b, #922b21);
				}
			}
		}
		
		.song-info {
			flex: 1;
			display: flex;
			flex-direction: column;
			justify-content: center;
			overflow: hidden;
			
			.song-title {
				font-size: 30rpx;
				font-weight: bold;
				color: #1e293b;
				margin-bottom: 12rpx;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
			
			.song-stats {
				display: flex;
				flex-wrap: wrap;
				gap: 12rpx;
				
				.stat-item {
					font-size: 24rpx;
					padding: 4rpx 12rpx;
					border-radius: 20rpx;
					background-color: #f1f5f9;
					color: #64748b;
					
					&.achievements {
						background-color: #e0f2fe;
						color: #0369a1;
						font-weight: 500;
					}
					
					&.ra {
						background-color: #fef3c7;
						color: #92400e;
						font-weight: 500;
					}
					
					&.fc-fs {
						background-color: #dcfce7;
						color: #166534;
						font-weight: 500;
					}
				}
			}
		}
		
		.rate-badge {
			position: absolute;
			top: 16rpx;
			right: 16rpx;
			padding: 4rpx 12rpx;
			border-radius: 20rpx;
			font-size: 22rpx;
			font-weight: bold;
			color: white;
			box-shadow: 0 2rpx 4rpx rgba(0,0,0,0.2);
			
			&.sssp {
				background: linear-gradient(135deg, #ffd700, #daa520);
			}
			
			&.sss {
				background: linear-gradient(135deg, #ffd700, #daa520);
			}
			
			&.ssp {
				background: linear-gradient(135deg, #ff9800, #f57c00);
			}
			
			&.ss {
				background: linear-gradient(135deg, #ff9800, #f57c00);
			}
			
			&.sp {
				background: linear-gradient(135deg, #9c27b0, #7b1fa2);
			}
			
			&.s {
				background: linear-gradient(135deg, #9c27b0, #7b1fa2);
			}
			
			&.aaa {
				background: linear-gradient(135deg, #2196f3, #1976d2);
			}
			
			&.aa {
				background: linear-gradient(135deg, #2196f3, #1976d2);
			}
			
			&.a {
				background: linear-gradient(135deg, #4caf50, #388e3c);
			}
			
			&.bbb, &.bb, &.b {
				background: linear-gradient(135deg, #795548, #5d4037);
			}
			
			&.c, &.d {
				background: linear-gradient(135deg, #9e9e9e, #757575);
			}
		}
	}
}

.pagination {
	margin-top: 20rpx;
	padding: 20rpx;
	background: rgba(255, 255, 255, 0.95);
	border-radius: 16rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
	
	.page-info {
		text-align: center;
		margin-bottom: 16rpx;
		font-size: 28rpx;
		color: #1e293b;
		
		.total-count {
			margin-left: 20rpx;
			color: #64748b;
			font-size: 24rpx;
		}
	}
	
	.page-controls {
		display: flex;
		justify-content: center;
		gap: 20rpx;
		
		.page-btn {
			font-size: 28rpx;
			padding: 12rpx 32rpx;
			border: none;
			background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
			color: #fff;
			border-radius: 40rpx;
			box-shadow: 0 4rpx 12rpx rgba(99, 102, 241, 0.2);
			
			&:disabled {
				background: #e2e8f0;
				color: #94a3b8;
				box-shadow: none;
			}
			
			&:active {
				transform: translateY(2rpx);
				box-shadow: 0 2rpx 6rpx rgba(99, 102, 241, 0.2);
			}
		}
	}
}

// 弹窗样式
.filter-popup {
	width: 600rpx;
	max-width: 90vw;
	background: white;
	border-radius: 24rpx;
	overflow: hidden;
	
	.popup-header {
		background: linear-gradient(135deg, #f0f4ff 0%, #e6e9ff 100%);
		padding: 24rpx;
		font-size: 32rpx;
		font-weight: 600;
		color: #1e293b;
		text-align: center;
	}
	
	.popup-content {
		padding: 30rpx;
		
		.filter-options {
			.option {
				padding: 20rpx;
				border-radius: 12rpx;
				margin-bottom: 16rpx;
				transition: all 0.3s ease;
				display: flex;
				align-items: center;
				
				&.active {
					background: rgba(99, 102, 241, 0.1);
					color: #6366f1;
					font-weight: bold;
					box-shadow: 0 2rpx 8rpx rgba(99, 102, 241, 0.15);
				}
			}
		}
		
		.version-list {
			max-height: 600rpx;
			
			.version-scroll {
				max-height: 600rpx;
			}
		}
	}
	
	.popup-footer {
		display: flex;
		padding: 20rpx;
		border-top: 2rpx solid #f0f0f0;
		
		button {
			flex: 1;
			height: 80rpx;
			border-radius: 40rpx;
			border: none;
			font-size: 28rpx;
			font-weight: 500;
			transition: all 0.3s ease;
			margin: 0 10rpx;
			
			&.cancel-btn {
				background-color: #f1f5f9;
				color: #64748b;
				
				&:active {
					background-color: #e5e7eb;
					transform: translateY(2rpx);
				}
			}
			
			&.confirm-btn {
				background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
				color: white;
				box-shadow: 0 4rpx 10rpx rgba(99, 102, 241, 0.25);
				
				&:active {
					background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
					box-shadow: 0 2rpx 6rpx rgba(99, 102, 241, 0.2);
					transform: translateY(2rpx);
				}
			}
		}
	}
}

@keyframes float {
	0%, 100% {
		transform: translateY(0);
	}
	50% {
		transform: translateY(-10px);
	}
}

@keyframes rainbow-text {
	0% { background-position: 0% 50%; }
	100% { background-position: 300% 50%; }
}
</style> 