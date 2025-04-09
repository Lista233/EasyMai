<template>
	<view class="container">
		<view class="header">
			<text class="title">热门乐曲排行榜</text>
		</view>
		
		<view class="stats-section">
			<view class="section-title">按游玩次数排序的歌曲</view>
			<view class="loading-indicator" v-if="loading">加载中...</view>
			
			<view class="chart-list" v-else>
				<view v-for="(chart, index) in paginatedCharts" :key="index" class="chart-item" @click="navigateToDetail(chart.songId, chart.difficulty)">
					<view class="chart-rank">{{ (currentPage - 1) * pageSize + index + 1 }}</view>
					<view class="chart-info">
						<view class="song-title">{{ getSongTitle(chart.songId) }}</view>
						<view class="chart-details">
							<text class="difficulty-badge" :class="getDifficultyClass(chart.difficulty)">
								{{ getDifficultyName(chart.difficulty) }}
							</text>
							<text class="chart-stats">
								游玩次数: {{ chart.cnt.toFixed(0) }} | 
								平均达成率: {{ chart.avg ? chart.avg.toFixed(2) : '-' }}% | 
								定数: {{ chart.diff || '-' }}
							</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 分页组件 -->
			<view class="pagination-container" v-if="!loading && topCharts.length > 0">
				<view class="pagination-wrapper">
					<view class="page-controls">
						<view class="page-input-container">
							<input 
								type="number" 
								v-model="inputPage"
								class="page-input"
								@blur="handlePageInputChange"
							/>
							<text class="page-total">/ {{ totalPages }}</text>
						</view>
						
						<button class="page-btn" 
							:disabled="currentPage === 1"
							@click="onPageChange({ current: currentPage - 1 })">
							上一页
						</button>
						
						<button class="page-btn" 
							:disabled="currentPage === totalPages"
							@click="onPageChange({ current: currentPage + 1 })">
							下一页
						</button>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { sortChartStatsByPlayCount, getSortedChartList } from '@/utils/chartStatsUtils';
import SongService from '@/utils/SongService';

// 状态变量
const loading = ref(true);
const topCharts = ref([]);
const songService = ref(null);
const currentPage = ref(1);
const pageSize = ref(10);
const inputPage = ref('1');

// 获取歌曲标题
const getSongTitle = (songId) => {
	if (!songService.value) return `歌曲 ${songId}`;
	const song = songService.value.getSongById(songId);
	return song ? song.title : `歌曲 ${songId}`;
};

// 获取难度名称
function getDifficultyName(difficulty) {
	const difficultyIndex = Number(difficulty);
	if (isNaN(difficultyIndex)) return '未知';
	
	switch(difficultyIndex) {
		case 0: return 'BASIC';
		case 1: return 'ADVANCED';
		case 2: return 'EXPERT';
		case 3: return 'MASTER';
		case 4: return 'Re:MASTER';
		default: return '未知';
	}
}

// 获取难度对应的CSS类
function getDifficultyClass(difficulty) {
	const difficultyIndex = Number(difficulty);
	if (isNaN(difficultyIndex)) return '';
	
	switch(difficultyIndex) {
		case 0: return 'basic';
		case 1: return 'advanced';
		case 2: return 'expert';
		case 3: return 'master';
		case 4: return 'remaster';
		default: return '';
	}
}

// 跳转到歌曲详情页
const navigateToDetail = (songId, difficulty) => {
	if (!songId) return;
	
	uni.navigateTo({
		url: `/pages/song-detail/song-detail?songId=${songId}&difficulty=${difficulty}`,
		animationType: 'pop-in',
		animationDuration: 200
	});
};

// 初始化数据
const initData = async () => {
	loading.value = true;
	
	try {
		const stats = uni.getStorageSync('chartStats');
		if (!stats) {
			uni.showToast({
				title: '未找到谱面统计数据',
				icon: 'none'
			});
			return;
		}
		
		const sortedCharts = sortChartStatsByPlayCount(stats);
		topCharts.value = sortedCharts;
		
		const musicData = uni.getStorageSync('musicData');
		if (musicData) {
			songService.value = new SongService(musicData);
		}
	} catch (error) {
		console.error('加载数据失败:', error);
		uni.showToast({
			title: '加载数据失败',
			icon: 'none'
		});
	} finally {
		loading.value = false;
	}
};

// 页面加载时初始化数据
onMounted(() => {
	initData();
});

// 分页相关逻辑
const paginatedCharts = computed(() => {
	const start = (currentPage.value - 1) * pageSize.value;
	const end = start + pageSize.value;
	return topCharts.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(topCharts.value.length / pageSize.value));

const handlePageInputChange = () => {
	let page = parseInt(inputPage.value);
	
	// 验证输入的页码
	if (isNaN(page) || page < 1) {
		page = 1;
	} else if (page > totalPages.value) {
		page = totalPages.value;
	}
	
	// 更新当前页码和输入框的值
	currentPage.value = page;
	inputPage.value = String(page);
};

const onPageChange = (e) => {
	currentPage.value = e.current
	inputPage.value = String(e.current)
}

// 监听当前页变化,同步输入框的值
watch(currentPage, (newPage) => {
	inputPage.value = String(newPage);
});
</script>

<style lang="scss">
// 响应式变量定义 - 只针对尺寸和布局
$padding-base: 20rpx;
$padding-lg: 40rpx;
$margin-sm: 10rpx;
$margin-base: 20rpx;
$margin-lg: 30rpx;
$border-radius-sm: 8rpx;
$border-radius-md: 20rpx;
$border-radius-lg: 80rpx;
$font-size-xs: 20rpx;
$font-size-sm: 24rpx;
$font-size-base: 28rpx;
$font-size-md: 32rpx;
$font-size-lg: 40rpx;

.container {
	padding: $padding-base;
	padding-bottom: 200rpx;
	background-color: #f5f5f5;
	min-height: 100vh;
}

.header {
	margin-bottom: $margin-lg;
	
	.title {
		font-size: $font-size-lg;
		font-weight: bold;
	}
}

.stats-section {
	margin-bottom: 60rpx;
	background-color: #fff;
	border-radius: $border-radius-md;
	padding: 30rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
	
	.section-title {
		font-size: $font-size-md;
		font-weight: bold;
		margin-bottom: $margin-base;
		color: #333;
	}
}

.loading-indicator {
	text-align: center;
	padding: $padding-lg;
	color: #666;
}

.chart-list {
	margin-top: $margin-base;
}

.chart-item {
	display: flex;
	padding: $padding-base;
	border-bottom: 1rpx solid #eee;
	align-items: center;
	cursor: pointer;
	
	&:hover {
		background-color: #f5f5f5;
	}
	
	.chart-rank {
		width: 60rpx;
		height: 60rpx;
		background-color: #f0f0f0;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 30rpx;
		font-weight: bold;
		font-size: $font-size-base;
	}
	
	.chart-info {
		flex: 1;
		
		.song-title {
			font-weight: bold;
			margin-bottom: 10rpx;
			font-size: $font-size-base;
		}
		
		.chart-details {
			display: flex;
			flex-wrap: wrap; // 允许在小屏幕上换行
			align-items: center;
			font-size: $font-size-sm;
			color: #666;
			
			.chart-stats {
				line-height: 1.4; // 增加行高，提高可读性
			}
		}
	}
}

.difficulty-badge {
	padding: 4rpx 12rpx;
	border-radius: $border-radius-sm;
	margin-right: 16rpx;
	font-size: $font-size-xs;
	color: white;
	
	&.basic {
		background-color: #1EA15D;
	}
	
	&.advanced {
		background-color: #F6B40C;
	}
	
	&.expert {
		background-color: #E9485D;
	}
	
	&.master {
		background-color: #9E45E2;
	}
	
	&.remaster {
		background-color: rgba(190, 170, 245, 1);
	}
}

.simple-list {
	margin-top: $margin-base;
	
	.simple-item {
		padding: 16rpx 0;
		border-bottom: 1rpx solid #eee;
		font-size: $font-size-base;
	}
}

.pagination-container {
	position: fixed;
	bottom: $margin-lg;
	left: 0;
	right: 0;
	display: flex;
	justify-content: center;
	z-index: 100;
	
	.pagination-wrapper {
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10px);
		padding: 20rpx 40rpx;
		border-radius: $border-radius-lg;
		box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.1);
		transform: scale(0.9);
	}
	
	.page-controls {
		display: flex;
		align-items: center;
		gap: 24rpx;
	}
}

.page-btn {
	background: #6366f1;
	color: white;
	border: none;
	padding: 12rpx 32rpx;
	border-radius: 40rpx;
	font-size: $font-size-base;
	min-width: 160rpx;
	
	&:disabled {
		background: #ccc;
		cursor: not-allowed;
	}
}

.page-input-container {
	display: flex;
	align-items: center;
	gap: 10rpx;
	
	.page-input {
		width: 100rpx;
		height: 60rpx;
		text-align: center;
		border: 1rpx solid #ddd;
		border-radius: 12rpx;
		font-size: $font-size-base;
	}
	
	.page-total {
		font-size: $font-size-base;
		color: #666;
	}
}

// 小屏幕手机适配
@media screen and (max-width: 375px) {
	.container {
		padding: 15rpx;
	}
	
	.chart-item {
		padding: 15rpx;
		
		.chart-rank {
			width: 50rpx;
			height: 50rpx;
			margin-right: 20rpx;
			font-size: 24rpx;
		}
		
		.chart-info {
			.song-title {
				font-size: 26rpx;
			}
			
			.chart-details {
				font-size: 22rpx;
				
				.chart-stats {
					margin-top: 4rpx;
					width: 100%; // 在小屏幕上统计信息占满宽度
				}
			}
		}
	}
	
	.page-btn {
		font-size: 26rpx;
		min-width: 120rpx;
		padding: 10rpx 20rpx;
	}
	
	.page-input {
		width: 80rpx;
		height: 50rpx;
	}
}

// 中等屏幕手机适配
@media screen and (min-width: 376px) and (max-width: 414px) {
	.chart-details {
		.chart-stats {
			font-size: 24rpx;
		}
	}
}

// 平板设备适配 - 只调整布局，不改变颜色
@media screen and (min-width: 768px) {
	.container {
		padding: 30rpx;
	}
	
	.stats-section {
		width: 90%;
		margin-left: auto;
		margin-right: auto;
		padding: 40rpx;
	}
	
	// 移除网格布局，保持单列显示
	.chart-list {
		// 删除 display: grid
		// 删除 grid-template-columns: repeat(2, 1fr)
		max-width: 90%;
		margin-left: auto;
		margin-right: auto;
		
		.chart-item {
			// 保持底部边框样式一致
			border-bottom: 1rpx solid #eee;
			// 移除四边框样式
			// border: 1rpx solid #eee; 
			padding: 30rpx;
			margin-bottom: 10rpx;
			transition: background-color 0.2s ease;
			
			&:hover {
				// 移除上下移动效果，保持简单的背景色变化
				transform: none;
				background-color: #f5f5f5;
				box-shadow: none;
			}
			
			// 优化平板上的元素尺寸
			.chart-rank {
				width: 70rpx;
				height: 70rpx;
				font-size: 30rpx;
			}
			
			.chart-info {
				.song-title {
					font-size: 32rpx;
					margin-bottom: 12rpx;
				}
				
				.chart-details {
					font-size: 26rpx;
				}
			}
		}
	}
	
	.pagination-wrapper {
		transform: scale(1);
		padding: 15rpx 50rpx;
	}
	
	.page-btn {
		min-width: 180rpx;
		font-size: 30rpx;
		padding: 14rpx 40rpx;
	}
	
	.page-input {
		width: 120rpx;
		height: 70rpx;
		font-size: 30rpx;
	}
	
	.page-total {
		font-size: 30rpx;
	}
}

// 大屏平板/桌面设备适配 - 依然保持单列布局但增加居中效果
@media screen and (min-width: 1024px) {
	.stats-section {
		max-width: 800rpx;
		margin-left: auto;
		margin-right: auto;
	}
	
	.chart-list {
		max-width: 100%;
	}
}
</style> 