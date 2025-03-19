<template>
	<view class="container">
		<!-- 头部信息 -->
		<view class="header">
			<view class="header-title">推分乐曲推荐</view>
		</view>
		
		<!-- 输入部分 -->
		<view class="input-section">
			<view class="section-title">输入您的 Rating</view>
			<input 
				class="rating-input" 
				type="number" 
				v-model="userRating" 
				placeholder="请输入您的 Rating"
			/>
			
			<!-- 添加筛选选项 -->
			<view class="filter-options">
				<view class="filter-title">筛选选项：</view>
				<view class="filter-row">
					<checkbox :checked="filterCompleted" @click="toggleFilterCompleted" />
					<text class="filter-label">筛选乐曲</text>
					<picker 
						:value="completionThresholdIndex" 
						:range="completionThresholds" 
						@change="onThresholdChange"
						:disabled="!filterCompleted"
						class="threshold-picker"
					>
						<view class="picker-text" :class="{ 'disabled': !filterCompleted }">
							隐藏达成率 ≥ {{ completionThresholds[completionThresholdIndex] }}%的乐曲
						</view>
					</picker>
				</view>
			</view>
			
			<button class="recommend-button" @click="generateRecommendations">生成推荐</button>
		</view>
		
		<!-- 推荐结果部分 -->
		<view class="recommendation-section" v-if="recommendations">
			<view class="section-title">
				推荐结果 (平均定数: {{ recommendations.averageDs.toFixed(1) }}, 范围: {{ recommendations.range.min.toFixed(1) }}-{{ recommendations.range.max.toFixed(1) }})
				<text class="result-count" v-if="filteredRecommendations.length !== activeRecommendations.length">
					(已筛选: {{ filteredRecommendations.length }}/{{ activeRecommendations.length }})
				</text>
			</view>
			
			<view class="tab-header">
				<view 
					class="tab-item" 
					:class="{ active: activeTab === 'fit' }" 
					@click="activeTab = 'fit'"
				>
					平均达成率推荐
				</view>
				<view 
					class="tab-item" 
					:class="{ active: activeTab === 'diff' }" 
					@click="activeTab = 'diff'"
				>
					定数差值推荐
				</view>
			</view>
			
			<view class="chart-list">
				<view 
					v-for="(chart, index) in paginatedRecommendations" 
					:key="index" 
					class="chart-item"
					@click="navigateToDetail(chart.songId, chart.difficulty)"
				>
					<view class="chart-rank">{{ (currentPage - 1) * pageSize + index + 1 }}</view>
					<view class="song-cover">
						<image :src="getSongCover(chart.songId)" mode="aspectFill" class="cover-image" :class="`level-${chart.difficulty}`"></image>
						<view class="difficulty-badge" :class="getDifficultyClass(chart.difficulty)">
							{{ chart.ds }}
						</view>
					</view>
					<view class="chart-info">
						<view class="song-title">{{ chart.title }}</view>
						<view class="chart-details">
							<view class="stat-item sample-count">
								<text class="stat-label">统计样本:</text>
								<text class="stat-value">{{ chart.cnt }}</text>
							</view>
							<view class="stat-item achievement">
								<text class="stat-label">平均达成:</text>
								<text class="stat-value">{{ chart.avg }}%</text>
								<text v-if="chart.playerAchievement" class="player-achievement">
									(您: {{ chart.playerAchievement.toFixed(2) }}%)
								</text>
							</view>
							<view class="stat-item difficulty">
								<text class="stat-label">{{ activeTab === 'diff' ? '拟合定数:' : '拟合定数:' }}</text>
								<text class="stat-value">
									{{ activeTab === 'diff' ? 
										// chart.ds + ' / ' + 
										chart.fit_diff + ' (差值: ' + chart.dsDifference + ')' : 
										chart.fit_diff }}
								</text>
							</view>
							<!-- <view class="stat-item score" v-if="chart.score && activeTab !== 'diff'">
								<text class="stat-label">推荐得分:</text>
								<text class="stat-value">{{ chart.score }}</text>
							</view> -->
						</view>
					</view>
				</view>
				
				<!-- 无结果提示 -->
				<view class="no-results" v-if="filteredRecommendations.length === 0">
					没有找到符合条件的推荐歌曲。请尝试调整筛选条件或输入不同的 Rating。
				</view>
				
				<!-- 分页控制 -->
				<view class="pagination" v-if="filteredRecommendations.length > 0">
					<view class="page-info">
						第 {{ currentPage }} / {{ totalPages }} 页
						<text class="total-count">共 {{ filteredRecommendations.length }} 条记录</text>
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
		</view>
		
		<!-- 添加一个链接到谱面统计页面 -->
	<!-- 	<view class="navigation-section">
			<button class="nav-button" @click="navigateToChartStats">查看谱面统计数据</button>
		</view> -->
	</view>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { getComprehensiveRecommendations } from '@/utils/recommendationUtils';
import SongService from '@/utils/SongService';
import {getCoverUrl} from '@/util/coverManager.js'
import playerRecordService from '@/utils/PlayerRecordService';

// 状态变量
const songService = ref(null);
const isPlayerDataInitialized = ref(false);

// 推荐相关变量
const userRating = ref('');
const recommendations = ref(null);
const activeTab = ref('fit');

// 筛选相关变量
const filterCompleted = ref(true); // 默认启用筛选
const completionThresholds = ['99.0','99.5','100.0', '100.5']; // 达成率阈值选项
const completionThresholdIndex = ref(3); // 默认选择100.0%

// 分页相关变量
const currentPage = ref(1);
const pageSize = ref(10); // 每页显示10条记录

// 计算属性：根据当前选中的标签返回对应的推荐列表
const activeRecommendations = computed(() => {
	if (!recommendations.value) return [];
	if (activeTab.value === 'fit') return recommendations.value.fitRecommendations;
	if (activeTab.value === 'diff') return recommendations.value.diffRecommendations;
	return [];
});

// 计算属性：应用筛选条件后的推荐列表
const filteredRecommendations = computed(() => {
	if (!activeRecommendations.value) return [];
	
	// 如果不启用筛选或玩家数据未初始化，返回全部推荐
	if (!filterCompleted.value || !isPlayerDataInitialized.value) return activeRecommendations.value;
	
	// 获取选中的达成率阈值
	const threshold = parseFloat(completionThresholds[completionThresholdIndex.value]);
	console.log('筛选阈值:', threshold);
	
	// 筛选掉已达到阈值的歌曲
	const filtered = activeRecommendations.value.filter(chart => {
		// 获取玩家对该歌曲的达成率
		const achievement = playerRecordService.getAchievement(chart.songId, chart.difficulty);
		// console.log(`歌曲 ${chart.title} (${chart.songId}, 难度 ${chart.difficulty}) 达成率: ${achievement}`);
		
		// 如果没有达成率记录，或者达成率低于阈值，则保留该推荐
		return achievement === null || achievement < threshold;
	});
	
	// console.log(`筛选前: ${activeRecommendations.value.length} 首, 筛选后: ${filtered.length} 首`);
	return filtered;
});

// 计算属性：总页数
const totalPages = computed(() => {
	if (!filteredRecommendations.value || filteredRecommendations.value.length === 0) return 1;
	return Math.ceil(filteredRecommendations.value.length / pageSize.value);
});

// 计算属性：当前页的推荐列表
const paginatedRecommendations = computed(() => {
	if (!filteredRecommendations.value) return [];
	
	const startIndex = (currentPage.value - 1) * pageSize.value;
	const endIndex = Math.min(startIndex + pageSize.value, filteredRecommendations.value.length);
	
	return filteredRecommendations.value.slice(startIndex, endIndex);
});

// 监听标签切换，重置页码
watch(activeTab, () => {
	currentPage.value = 1;
});

// 监听筛选条件变化，重置页码
watch([filterCompleted, completionThresholdIndex], () => {
	currentPage.value = 1;
});

// 切换筛选开关
const toggleFilterCompleted = () => {
	filterCompleted.value = !filterCompleted.value;
	console.log('筛选状态:', filterCompleted.value ? '启用' : '禁用');
};

// 更改达成率阈值
const onThresholdChange = (e) => {
	completionThresholdIndex.value = parseInt(e.detail.value);
	console.log('达成率阈值更改为:', completionThresholds[completionThresholdIndex.value]);
};

// 生成推荐
const generateRecommendations = async () => {
	if (!userRating.value) {
		uni.showToast({
			title: '请输入 Rating',
			icon: 'none'
		});
		return;
	}

	try {
		// 获取谱面统计数据
		const chartStats = uni.getStorageSync('chartStats');
		if (!chartStats) {
			uni.showToast({
				title: '未找到谱面统计数据',
				icon: 'none'
			});
			return;
		}

		// 初始化 SongService
		if (!songService.value) {
			const musicData = uni.getStorageSync('musicData');
			if (!musicData) {
				uni.showToast({
					title: '未找到歌曲数据',
					icon: 'none'
				});
				return;
			}
			songService.value = new SongService(musicData);
		}

		// 获取推荐结果
		recommendations.value = getComprehensiveRecommendations(
			parseFloat(userRating.value),
			songService.value,
			chartStats,
			200 // 增加返回的记录数量
		);
		
		// 为每个推荐添加玩家达成率信息
		if (isPlayerDataInitialized.value) {
			console.log('添加玩家达成率信息');
			recommendations.value.fitRecommendations.forEach(chart => {
				const achievement = playerRecordService.getAchievement(chart.songId, chart.difficulty);
				if (achievement !== null) {
					chart.playerAchievement = achievement;
					// console.log(`歌曲 ${chart.title} 达成率: ${achievement}%`);
				}
			});
			
			recommendations.value.diffRecommendations.forEach(chart => {
				const achievement = playerRecordService.getAchievement(chart.songId, chart.difficulty);
				if (achievement !== null) {
					chart.playerAchievement = achievement;
				}
			});
		} else {
			console.log('玩家数据未初始化，跳过添加达成率信息');
		}
		
		// 重置页码
		currentPage.value = 1;
	} catch (error) {
		console.error('生成推荐失败:', error);
		uni.showToast({
			title: '生成推荐失败',
			icon: 'none'
		});
	}
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

// 获取歌曲封面
const getSongCover = (songId) => {
	return getCoverUrl(songId);
};

// 跳转到歌曲详情页
const navigateToDetail = (songId, difficulty) => {
	if (!songId) return;
	
	uni.navigateTo({
		url: `/pages/song-detail/song-detail?songId=${songId}&difficulty=${difficulty}`,
		animationType: 'pop-in',
		animationDuration: 200
	});
};

// 跳转到谱面统计页面
const navigateToChartStats = () => {
	uni.navigateTo({
		url: '/pages/chart-stats/chart-stats',
		animationType: 'pop-in',
		animationDuration: 200
	});
};

// 初始化 SongService 和 PlayerRecordService
const initServices = async () => {
	try {
		// 初始化 SongService
		const musicData = uni.getStorageSync('musicData');
		if (musicData) {
			songService.value = new SongService(musicData);
		}
		
		// 初始化 PlayerRecordService
		const recordsData = uni.getStorageSync('divingFish_records').data;
		if (recordsData) {
			console.log('找到玩家记录数据',recordsData);
			
			// 如果是字符串，尝试解析为 JSON
			let parsedData = recordsData;
			if (typeof recordsData === 'string') {
				try {
					parsedData = JSON.parse(recordsData);
				} catch (e) {
					console.error('解析玩家记录数据失败:', e);
					return;
				}
			}
			
			// 初始化 PlayerRecordService
			try {
				playerRecordService.initPlayerData(parsedData);
				isPlayerDataInitialized.value = true;
				console.log('PlayerRecordService 初始化成功',playerRecordService);
				
				// 尝试获取玩家的 Rating 作为默认值
				const playerInfo = playerRecordService.getPlayerInfo();
				if (playerInfo && playerInfo.rating) {
					userRating.value = (playerInfo.rating);
					console.log('设置默认 Rating:', userRating.value);
				}
			} catch (e) {
				console.error('初始化 PlayerRecordService 失败:', e);
			}
		} else {
			console.log('未找到玩家记录数据');
		}
	} catch (error) {
		console.error('初始化服务失败:', error);
	}
};

// 页面加载时初始化数据
onMounted(() => {
	console.log('页面加载，初始化服务');
	initServices();
});
</script>

<style>
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
}

.header-title {
	font-size: 38rpx;
	font-weight: bold;
	margin-bottom: 16rpx;
	color: #1e293b;
}

.input-section {
	margin-bottom: 20px;
	background-color: #fff;
	border-radius: 20rpx;
	padding: 32rpx 40rpx;
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
	border: 1px solid rgba(255, 255, 255, 0.7);
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	margin-bottom: 20rpx;
	color: #1e293b;
}

.result-count {
	font-size: 24rpx;
	color: #64748b;
	font-weight: normal;
	margin-left: 10rpx;
}

.rating-input {
	height: 80rpx;
	border: 1px solid #ddd;
	border-radius: 10rpx;
	padding: 0 20rpx;
	margin: 20rpx 0;
	font-size: 28rpx;
	transition: all 0.3s ease;
}

.rating-input:focus {
	border-color: #a5b4fc;
	box-shadow: 0 0 0 4px rgba(165, 180, 252, 0.1);
	background: white;
}

/* 筛选选项样式 */
.filter-options {
	margin: 20rpx 0;
	padding: 20rpx;
	background-color: #f8fafc;
	border-radius: 10rpx;
	border: 1px solid #e2e8f0;
}

.filter-title {
	font-size: 28rpx;
	font-weight: 500;
	margin-bottom: 16rpx;
	color: #1e293b;
}

.filter-row {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 16rpx;
}

.filter-label {
	font-size: 26rpx;
	color: #475569;
}

.threshold-picker {
	margin-left: auto;
}

.picker-text {
	font-size: 26rpx;
	color: #475569;
	padding: 8rpx 16rpx;
	background-color: #e2e8f0;
	border-radius: 6rpx;
	transition: all 0.3s ease;
}

.picker-text.disabled {
	opacity: 0.5;
}

.recommend-button {
	margin-top: 30rpx;
	background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
	color: white;
	border: none;
	border-radius: 16rpx;
	height: 88rpx;
	line-height: 88rpx;
	font-size: 28rpx;
	font-weight: 500;
	box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
	transition: all 0.3s ease;
}

.recommend-button:active {
	transform: scale(0.98) translateY(1px);
	box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
}

.recommendation-section {
	background-color: #fff;
	border-radius: 20rpx;
	padding: 32rpx 40rpx;
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
	border: 1px solid rgba(255, 255, 255, 0.7);
	margin-bottom: 20rpx;
}

.tab-header {
	display: flex;
	border-bottom: 1px solid #e2e8f0;
	margin-bottom: 20rpx;
}

.tab-item {
	padding: 16rpx 30rpx;
	font-size: 28rpx;
	color: #64748b;
	position: relative;
	cursor: pointer;
	transition: all 0.3s ease;
}

.tab-item.active {
	color: #6366f1;
	font-weight: 500;
}

.tab-item.active::after {
	content: '';
	position: absolute;
	bottom: -1px;
	left: 0;
	right: 0;
	height: 3px;
	background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
	border-radius: 3px 3px 0 0;
}

.chart-list {
	margin-top: 20rpx;
}

.chart-item {
	display: flex;
	align-items: center;
	padding: 24rpx;
	border-bottom: 1px solid #f1f5f9;
	position: relative;
	gap: 20rpx;
	transition: all 0.3s ease;
	border-radius: 16rpx;
	margin-bottom: 16rpx;
	background: white;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.02);
}

.chart-item:hover {
	transform: translateY(-2rpx);
	box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.05);
}

.chart-item:active {
	transform: scale(0.99);
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.02);
}

.chart-rank {
	font-size: 28rpx;
	font-weight: bold;
	color: #64748b;
	width: 40rpx;
	text-align: center;
	background: #f8fafc;
	height: 40rpx;
	line-height: 40rpx;
	border-radius: 50%;
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
}

.song-cover {
	position: relative;
	width: 120rpx;
	height: 150rpx; /* 增加高度以容纳难度标签 */
	margin-right: 16rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	flex-shrink: 0;
}

.cover-image {
	width: 120rpx;
	height: 120rpx;
	object-fit: cover;
	border: 6rpx solid transparent;
	border-radius: 8rpx;
	box-sizing: border-box;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

/* 不同难度的边框颜色 */
.cover-image.level-0 {
	border-color: rgba(46, 204, 113, 1);
	box-shadow: 0 2rpx 8rpx rgba(46, 204, 113, 0.5);
}

.cover-image.level-1 {
	border-color: rgba(241, 196, 15, 1);
	box-shadow: 0 2rpx 8rpx rgba(241, 196, 15, 0.5);
}

.cover-image.level-2 {
	border-color: rgba(231, 76, 60, 1);
	box-shadow: 0 2rpx 8rpx rgba(231, 76, 60, 0.5);
}

.cover-image.level-3 {
	border-color: rgba(155, 89, 182, 1);
	box-shadow: 0 2rpx 8rpx rgba(155, 89, 182, 0.5);
}

.cover-image.level-4 {
	border-color: rgba(190, 170, 245, 1);
	box-shadow: 0 2rpx 8rpx rgba(190, 170, 245, 0.5);
}

.difficulty-badge {
	position: absolute;
	bottom: 0;
	left: 50%;
	transform: translateX(-50%);
	padding: 4rpx 12rpx;
	border-radius: 6rpx;
	font-size: 20rpx;
	color: white;
	display: inline-block;
	font-weight: 500;
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
	white-space: nowrap;
	width: 90%;
	text-align: center;
}

.chart-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 8rpx;
	overflow: hidden;
}

.song-title {
	font-weight: bold;
	margin-bottom: 10rpx;
	font-size: 28rpx;
	color: #1e293b;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.chart-details {
	display: flex;
	flex-direction: column;
	font-size: 24rpx;
	color: #64748b;
	gap: 8rpx;
}

.stat-item {
	display: flex;
	align-items: center;
	background-color: #f8fafc;
	padding: 6rpx 12rpx;
	border-radius: 6rpx;
	margin-bottom: 4rpx;
}

.stat-label {
	color: #64748b;
	margin-right: 8rpx;
	font-size: 22rpx;
}

.stat-value {
	color: #1e293b;
	font-weight: 500;
}

.player-achievement {
	margin-left: 8rpx;
	color: #6366f1;
	font-weight: 500;
}

.sample-count {
	background-color: #f1f5f9;
}

.achievement {
	background-color: #f0f9ff;
}

.difficulty {
	background-color: #f0fdf4;
}

.score {
	background-color: #fef2f2;
}

.basic {
	background: linear-gradient(135deg, #2ecc71, #27ae60);
}

.advanced {
	background: linear-gradient(135deg, #f1c40f, #f39c12);
}

.expert {
	background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.master {
	background: linear-gradient(135deg, #9b59b6, #8e44ad);
}

.remaster {
	background: linear-gradient(135deg, #d6c0ff, #c4b0ff);
}

/* 无结果提示 */
.no-results {
	padding: 40rpx;
	text-align: center;
	color: #64748b;
	font-size: 28rpx;
	background-color: #f8fafc;
	border-radius: 16rpx;
	margin: 20rpx 0;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);
}

/* 分页样式 */
.pagination {
	margin-top: 40rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 20rpx;
}

.page-info {
	font-size: 26rpx;
	color: #64748b;
	background: rgba(248, 250, 252, 0.8);
	padding: 8rpx 20rpx;
	border-radius: 20rpx;
}

.total-count {
	margin-left: 10rpx;
	color: #94a3b8;
}

.page-controls {
	display: flex;
	gap: 20rpx;
}

.page-btn {
	background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
	color: #64748b;
	border: 1px solid #e2e8f0;
	border-radius: 12rpx;
	padding: 12rpx 32rpx;
	font-size: 26rpx;
	font-weight: 500;
	transition: all 0.3s ease;
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.02);
}

.page-btn:not(:disabled):active {
	transform: scale(0.98) translateY(1px);
	background: #e2e8f0;
}

.page-btn:not(:disabled):hover {
	background: #e2e8f0;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.page-btn:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.navigation-section {
	margin-bottom: 20px;
}

.nav-button {
	background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
	color: white;
	border: none;
	border-radius: 16rpx;
	padding: 20rpx 0;
	font-weight: 500;
	box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
	transition: all 0.3s ease;
}

.nav-button:active {
	transform: scale(0.98) translateY(1px);
	box-shadow: 0 2px 8px rgba(79, 70, 229, 0.2);
}
</style>
