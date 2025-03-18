<template>
	<view class="container">
		<view class="header">
			<text class="title">谱面统计数据</text>
		</view>
		
		<!-- 按游玩次数排序的前20首歌曲 -->
		<view class="stats-section">
			<view class="section-title">按游玩次数排序的前20首歌曲</view>
			<view class="loading-indicator" v-if="loading">加载中...</view>
			
			<view class="chart-list" v-else>
				<view v-for="(chart, index) in topCharts" :key="index" class="chart-item" @click="navigateToDetail(chart.songId, chart.difficulty)">
					<view class="chart-rank">{{ index + 1 }}</view>
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
		</view>
		
		<!-- 简化列表 -->
		<view class="stats-section">
			<view class="section-title">简化列表 (ID和难度)</view>
			<view class="simple-list">
				<view v-for="(item, index) in simpleList.slice(0, 10)" :key="index" class="simple-item">
					歌曲ID: {{ item.songId }}, 难度: {{ getDifficultyName(item.difficulty) }}
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { sortChartStatsByPlayCount, getSortedChartList } from '@/utils/chartStatsUtils';
import SongService from '@/utils/SongService';

// 状态变量
const loading = ref(true);
const topCharts = ref([]);
const simpleList = ref([]);
const songService = ref(null);

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
		// 从本地存储获取谱面统计数据
		const stats = uni.getStorageSync('chartStats');
		if (!stats) {
			uni.showToast({
				title: '未找到谱面统计数据',
				icon: 'none'
			});
			return;
		}
		
		// 使用工具函数处理数据
		const sortedCharts = sortChartStatsByPlayCount(stats);
		topCharts.value = sortedCharts.slice(0, 20); // 只显示前20个
		
		// 获取简化列表
		simpleList.value = getSortedChartList(stats);
		
		// 使用静态导入的 SongService
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
</script>

<style>
.container {
	padding: 20px;
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
	background-color: #BA1A1A;
}

.simple-list {
	margin-top: 10px;
}

.simple-item {
	padding: 8px 0;
	border-bottom: 1px solid #eee;
	font-size: 14px;
}
</style> 