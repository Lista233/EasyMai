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

<style>
.container {
	padding: 20px;
	padding-bottom: 100px;
	background-color: #f5f5f5;
	min-height: 100vh;
}

.header {
	margin-bottom: 20px;
}

.title {
	font-size: 20px;
	font-weight: bold;
}

.stats-section {
	margin-bottom: 30px;
	background-color: #fff;
	border-radius: 10px;
	padding: 15px;
	box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.section-title {
	font-size: 16px;
	font-weight: bold;
	margin-bottom: 10px;
	color: #333;
}

.loading-indicator {
	text-align: center;
	padding: 20px;
	color: #666;
}

.chart-list {
	margin-top: 10px;
}

.chart-item {
	display: flex;
	padding: 10px;
	border-bottom: 1px solid #eee;
	align-items: center;
	cursor: pointer;
}

.chart-item:hover {
	background-color: #f5f5f5;
}

.chart-rank {
	width: 30px;
	height: 30px;
	background-color: #f0f0f0;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 15px;
	font-weight: bold;
}

.chart-info {
	flex: 1;
}

.song-title {
	font-weight: bold;
	margin-bottom: 5px;
}

.chart-details {
	display: flex;
	align-items: center;
	font-size: 12px;
	color: #666;
}

.difficulty-badge {
	padding: 2px 6px;
	border-radius: 4px;
	margin-right: 8px;
	font-size: 10px;
	color: white;
}

.basic {
	background-color: #1EA15D;
}

.advanced {
	background-color: #F6B40C;
}

.expert {
	background-color: #E9485D;
}

.master {
	background-color: #9E45E2;
}

.remaster {
	background-color: rgba(190, 170, 245, 1);
}

.simple-list {
	margin-top: 10px;
}

.simple-item {
	padding: 8px 0;
	border-bottom: 1px solid #eee;
	font-size: 14px;
}

.pagination-container {
	position: fixed;
	bottom: 20px;
	left: 0;
	right: 0;
	display: flex;
	justify-content: center;
	z-index: 100;
}

.pagination-wrapper {
	background: rgba(255, 255, 255, 0.9);
	backdrop-filter: blur(10px);
	padding: 10px 20px;
	border-radius: 40px;
	box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
	transform: scale(0.9);
}

.page-controls {
	display: flex;
	align-items: center;
	gap: 12px;
}

.page-btn {
	background: #6366f1;
	color: white;
	border: none;
	padding: 6px 16px;
	border-radius: 20px;
	font-size: 14px;
	min-width: 80px;
}

.page-btn:disabled {
	background: #ccc;
	cursor: not-allowed;
}

.page-input-container {
	display: flex;
	align-items: center;
	gap: 5px;
}

.page-input {
	width: 50px;
	height: 30px;
	text-align: center;
	border: 1px solid #ddd;
	border-radius: 6px;
	font-size: 14px;
}

.page-total {
	font-size: 14px;
	color: #666;
}
</style> 