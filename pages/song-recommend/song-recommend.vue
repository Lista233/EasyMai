<template>
	<view class="container" :class="{ 'dark-mode': isDarkMode }">
		<!-- 头部信息 -->
		<view class="header">
			<view class="header-title">推分乐曲推荐</view>
		</view>
		
		<!-- 输入部分 -->
		<view class="input-section">
			<!-- 选择推荐模式 -->
			<view class="recommend-mode">
				<view class="mode-selector">
					<view 
						class="mode-item" 
						:class="{ active: recommendMode === 'rating' }" 
						@click="setRecommendMode('rating')"
					>
						基于Rating推荐
					</view>
					<view 
						class="mode-item" 
						:class="{ active: recommendMode === 'dsRange' }" 
						@click="setRecommendMode('dsRange')"
					>
						自定义定数范围
					</view>
				</view>
			</view>
			
			<!-- 基于Rating的输入 -->
			<view class="rating-input-container" v-if="recommendMode === 'rating'">
				<view class="input-row">
					<view class="input-label">您的目标 Rating</view>
					<input 
						class="rating-input" 
						type="number" 
						v-model="userRating" 
						placeholder="请输入您的目标 Rating"
						@confirm="generateRecommendations"
					/>
				</view>
			</view>
			
			<!-- 基于定数范围的输入 -->
			<view class="dsrange-input-container" v-if="recommendMode === 'dsRange'">
				<!-- <view class="section-title text-center">自定义定数范围</view> -->
				<view class="dsrange-inputs">
					<view class="ds-input-group">
						<label class="ds-label">最小定数</label>
						<input 
							class="ds-input" 
							type="number" 
							v-model="customDsRange.min" 
							placeholder="最小值"
						/>
					</view>
					<view class="ds-separator">-</view>
					<view class="ds-input-group">
						<label class="ds-label">最大定数</label>
						<input 
							class="ds-input" 
							type="number" 
							v-model="customDsRange.max" 
							placeholder="最大值"
						/>
					</view>
				</view>
			</view>
			
			<!-- 公共按钮部分 -->
			<button class="recommend-button" @click="generateRecommendations">生成推荐</button>
			
			<!-- 添加筛选选项 -->
			<view class="filter-options">
				<view class="filter-header">
					<view class="filter-title">筛选选项：</view>
				</view>
				<picker 
					:value="completionThresholdIndex" 
					:range="completionThresholds" 
					@change="onThresholdChange"
					class="threshold-picker"
				>
					<view class="picker-text">
						{{ completionThresholds[completionThresholdIndex] === '不筛选' ? 
							'不筛选乐曲' : 
							`隐藏达成率 ≥ ${completionThresholds[completionThresholdIndex]}%的乐曲` 
						}}
					</view>
				</picker>
			</view>
		</view>
		
		<!-- 推荐结果部分 -->
		<view class="recommendation-section" v-if="recommendations">
			<view class="section-title">
				推荐结果 
				(定数范围: {{ recommendations.range.min.toFixed(1) }}-{{ recommendations.range.max.toFixed(1) }})
				<text class="result-count" v-if="filteredRecommendations.length !== activeRecommendations.length">
				<p>	(已筛选: {{ filteredRecommendations.length }}/{{ activeRecommendations.length }})</p>
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
					<view class="song-cover-container" :class="getDifficultyClass(chart.difficulty)">
						<view class="song-cover">
							<image :src="getSongCover(chart.songId)" mode="aspectFill" class="cover-image"></image>
						</view>
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
							@click="handlePrevPage">上一页</button>
						<button class="page-btn" 
							@click="handleNextPage">下一页</button>
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
import { ref, onMounted, computed, watch, inject } from 'vue';
import { getComprehensiveRecommendations, getComprehensiveRecommendationsByDsRange } from '@/utils/recommendationUtils';
import { getRecommendedDsByRating } from '@/utils/ratingUtils';
import SongService from '@/utils/SongService';
import {getCoverUrl} from '@/utils/coverManager.js'
import playerRecordService from '@/utils/PlayerRecordService';
import {updateNativeTabBar} from '@/utils/updateNativeTabBar.js'

// 注入深色模式变量
const isDarkMode = inject('isDarkMode');

const applyTheme = inject('applyTheme');

// 状态变量
const songService = ref(null);
const isPlayerDataInitialized = ref(false);

// 推荐相关变量
const userRating = ref('');
const recommendations = ref(null);
const activeTab = ref('fit');

// 添加推荐模式和自定义定数范围
const recommendMode = ref('rating'); // 'rating' 或 'dsRange'
const customDsRange = ref({ min: 13.3, max: 13.9 }); // 默认定数范围

// 筛选相关变量
const completionThresholds = ['不筛选', '99.0', '99.5', '100.0', '100.5']; // 修改"0"为"不筛选"
const completionThresholdIndex = ref(4); // 默认选择不筛选

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
	
	// 如果选择了"不筛选"或玩家数据未初始化，返回全部推荐
	if (completionThresholds[completionThresholdIndex.value] === '不筛选' || !isPlayerDataInitialized.value) {
		return activeRecommendations.value;
	}
	
	// 获取选中的达成率阈值
	const threshold = parseFloat(completionThresholds[completionThresholdIndex.value]);
	console.log('筛选阈值:', threshold);
	
	// 筛选掉已达到阈值的歌曲
	const filtered = activeRecommendations.value.filter(chart => {
		const achievement = playerRecordService.getAchievement(chart.songId, chart.difficulty);
		return achievement === null || achievement < threshold;
	});
	
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
watch([completionThresholdIndex], () => {
	currentPage.value = 1;
});

// 更改达成率阈值
const onThresholdChange = (e) => {
	completionThresholdIndex.value = parseInt(e.detail.value);
	console.log('达成率阈值更改为:', completionThresholds[completionThresholdIndex.value]);
};

// 设置推荐模式
const setRecommendMode = (mode) => {
	recommendMode.value = mode;
};

// 生成推荐，根据不同的推荐模式调用不同的方法
const generateRecommendations = async () => {
	// 验证输入
	if (recommendMode.value === 'rating' && !userRating.value) {
		uni.showToast({
			title: '请输入 Rating',
			icon: 'none'
		});
		return;
	}
	
	if (recommendMode.value === 'dsRange') {
		// 验证定数范围
		if (!customDsRange.value.min || !customDsRange.value.max) {
			uni.showToast({
				title: '请输入完整的定数范围',
				icon: 'none'
			});
			return;
		}
		
		// 确保最小值小于最大值
		if (parseFloat(customDsRange.value.min) > parseFloat(customDsRange.value.max)) {
			uni.showToast({
				title: '最小定数不能大于最大定数',
				icon: 'none'
			});
			return;
		}
	}

	try {
		// 显示加载框
		uni.showLoading({
			title: '生成推荐中...',
			mask: true
		});

		// 获取谱面统计数据
		const chartStats = uni.getStorageSync('chartStats');
		if (!chartStats) {
			uni.hideLoading();
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
				uni.hideLoading();
				uni.showToast({
					title: '未找到歌曲数据',
					icon: 'none'
				});
				return;
			}
			songService.value = new SongService(musicData);
		}

		// 根据不同的推荐模式获取推荐结果
		if (recommendMode.value === 'rating') {
			// 基于 Rating 的推荐
			recommendations.value = getComprehensiveRecommendations(
				parseFloat(userRating.value),
				songService.value,
				chartStats,
				200
			);
		} else {
			// 基于自定义定数范围的推荐
			recommendations.value = getComprehensiveRecommendationsByDsRange(
				{
					min: parseFloat(customDsRange.value.min),
					max: parseFloat(customDsRange.value.max)
				},
				songService.value,
				chartStats,
				200
			);
		}
		
		// 过滤掉ID大于5位数的歌曲
		if (recommendations.value) {
			recommendations.value.fitRecommendations = recommendations.value.fitRecommendations.filter(chart => {
				return String(chart.songId).length <= 5;
			});
			
			recommendations.value.diffRecommendations = recommendations.value.diffRecommendations.filter(chart => {
				return String(chart.songId).length <= 5;
			});
		}
		
		// 为每个推荐添加玩家达成率信息
		if (isPlayerDataInitialized.value) {
			console.log('添加玩家达成率信息');
			recommendations.value.fitRecommendations.forEach(chart => {
				const achievement = playerRecordService.getAchievement(chart.songId, chart.difficulty);
				if (achievement !== null) {
					chart.playerAchievement = achievement;
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

		// 隐藏加载框
		uni.hideLoading();

	} catch (error) {
		// 发生错误时隐藏加载框
		uni.hideLoading();
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

// 修改初始化服务函数
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
					// 设置默认Rating值
					userRating.value = playerInfo.rating;
					console.log('设置默认 Rating:', userRating.value);
					
					// 根据Rating设置默认定数范围
					const recommendedDs = getRecommendedDsByRating(parseFloat(userRating.value));
					if (recommendedDs && recommendedDs.range) {
						customDsRange.value = {
							min: recommendedDs.range.min,
							max: recommendedDs.range.max
						};
						console.log('设置默认定数范围:', customDsRange.value);
					}
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
	applyTheme();
	updateNativeTabBar(isDarkMode.value); // 这里的调用会根据平台条件编译
	console.log('页面加载，初始化服务');
	initServices();
});

// 在 script 部分添加这两个方法
const handlePrevPage = () => {
	if (currentPage.value <= 1) {
		uni.showToast({
			title: '已经是第一页了',
			icon: 'none'
		});
		return;
	}
	currentPage.value--;
};

const handleNextPage = () => {
	if (currentPage.value >= totalPages.value) {
		uni.showToast({
			title: '已经是最后一页了',
			icon: 'none'
		});
		return;
	}
	currentPage.value++;
};

// 监听userRating变化，自动更新定数范围
watch(userRating, (newRating) => {
	if (newRating) {
		try {
			const recommendedDs = getRecommendedDsByRating(parseFloat(newRating));
			if (recommendedDs && recommendedDs.range) {
				customDsRange.value = {
					min: recommendedDs.range.min,
					max: recommendedDs.range.max
				};
				console.log('根据Rating更新定数范围:', customDsRange.value);
			}
		} catch (error) {
			console.error('更新定数范围失败:', error);
		}
	}
});
</script>

<style lang="scss">
/* 导入深色模式样式 */
@import '@/uni.scss';
@import './dark-song-recommend.scss';

.container {
	padding: 40rpx 20rpx 20rpx 10rpx;
	background: linear-gradient(135deg, #f0f4ff 0%, #e6e9ff 100%);
	min-height: 100vh;
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
	box-sizing: border-box;
}

.header {
	margin-bottom: 20rpx;
	background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(240, 244, 255, 0.95));
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
	position: relative;
	display: inline-block;
}

.header-title::after {
	content: "";
	position: absolute;
	bottom: -8rpx;
	left: 0;
	width: 230rpx;
	height: 6rpx;
	background: linear-gradient(to right, #6366f1, #818cf8);
	border-radius: 3rpx;
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
	color: #1e293b;
	margin-bottom: 20rpx;
	text-align: center;
	width: 100%;
}

.input-row {
	display: flex;
	align-items: center;
	width: 100%;
	margin-bottom: 20rpx;
}

.input-label {
	flex: 0 0 auto;
	font-size: 28rpx;
	font-weight: 600;
	color: #1e293b;
	margin-right: 20rpx;
	min-width: 180rpx;
}

.rating-input {
	flex: 1;
	height: 88rpx;
	border: 2px solid #e2e8f0;
	border-radius: 16rpx;
	padding: 0 24rpx;
	font-size: 32rpx;
	font-weight: 500;
	color: #1e293b;
	background-color: #f8fafc;
}

.ds-input {
	height: 88rpx;
	border: 2px solid #e2e8f0;
	border-radius: 16rpx;
	padding: 0 24rpx;
	font-size: 32rpx;
	font-weight: 500;
	color: #1e293b;
	background-color: #f8fafc;
	box-sizing: border-box;
}

.recommend-button {
	width: 100%;
	background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
	color: white;
	border: none;
	border-radius: 16rpx;
	height: 88rpx;
	line-height: 88rpx;
	font-size: 28rpx;
	font-weight: 500;
	box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

/* 美化筛选选项部分 */
.filter-options {
	margin-top: 30rpx;
	padding: 24rpx;
	background-color: #f1f5f9;
	border-radius: 16rpx;
	border: 1px solid #e2e8f0;
}

.filter-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16rpx;
}

.filter-controls {
	display: flex;
	align-items: center;
	gap: 10rpx;
}

.filter-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #475569;
}

.filter-label {
	font-size: 26rpx;
	color: #475569;
	font-weight: 500;
}

.threshold-picker {
	width: 100%;
}

.picker-text {
	font-size: 26rpx;
	padding: 10rpx 16rpx;
	border-radius: 8rpx;
	background-color: white;
	color: #1e293b;
	border: 1px solid #e2e8f0;
}

.picker-text.disabled {
	color: #94a3b8;
	background-color: #f8fafc;
}

/* 美化推荐结果部分 */
.recommendation-section {
	background-color: #fff;
	border-radius: 20rpx;
	padding: 32rpx 40rpx;
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
	border: 1px solid rgba(255, 255, 255, 0.7);
}

.result-count {
	font-size: 24rpx;
	color: #64748b;
	font-weight: normal;
	margin-left: 10rpx;
}

.tab-header {
	display: flex;
	margin-bottom: 20rpx;
	border-radius: 12rpx;
	overflow: hidden;
	background-color: #f1f5f9;
	padding: 4rpx;
}

.tab-item {
	flex: 1;
	text-align: center;
	padding: 16rpx 0;
	font-size: 28rpx;
	color: #64748b;
	transition: all 0.3s ease;
	border-radius: 8rpx;
}

.tab-item.active {
	background-color: #6366f1;
	color: white;
	font-weight: 500;
	box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
}

/* 美化歌曲卡片样式 */
.chart-list {
	margin-top: 20rpx;
}

.chart-item {
	display: flex;
	background-color: white;
	border-radius: 16rpx;
	overflow: hidden;
	margin-bottom: 20rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
	border: 1px solid #f1f5f9;
	
}

.chart-rank {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 60rpx;
	font-size: 28rpx;
	font-weight: 600;
	color: #64748b;
/* 	background-color: #f8fafc; */
	/* border-right: 1px solid #f1f5f9; */
}

.song-cover-container {
	width: 144rpx;
	position: relative;
	padding: 2rpx;
	border-radius: 12rpx 12rpx 0 0;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

/* 修改封面样式，添加边框 */
.song-cover {
	width: 140rpx;
	height: 140rpx;
	border-radius: 8rpx 8rpx 0 0;
	overflow: hidden;
	background-color: #000;
	display: flex;
	align-items: center;
	justify-content: center;
	
	border: 3rpx solid transparent; /* 添加透明边框 */
}

/* 根据难度设置封面边框颜色 */
.song-cover-container.basic .song-cover {
	border-color: #16a34a;
}

.song-cover-container.advanced .song-cover {
	border-color: #ca8a04;
}

.song-cover-container.expert .song-cover {
	border-color: #dc2626;
}

.song-cover-container.master .song-cover {
	border-color: #7c3aed;
}

.song-cover-container.remaster .song-cover {
	background-color: #d4a3ff;
}

/* 保持图片样式不变 */
.cover-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

/* 保持难度标签样式不变 */
.difficulty-badge {
	width: 101%;
	text-align: center;
	padding: 6rpx 0;
	font-size: 22rpx;
	font-weight: bold;
	xorm: translateY(0%); 
	border-radius: 0rpx 0rpx 20rpx 20rpx;
	color: white;
}

/* 保持难度标签背景色不变 */
.difficulty-badge.basic {
	background-color: #16a34a;
}

.difficulty-badge.advanced {
	background-color: #ca8a04;
}

.difficulty-badge.expert {
	background-color: #dc2626;
}

.difficulty-badge.master {
	background-color: #7c3aed;
}

.difficulty-badge.remaster {
	background-color: #d4a3ff;
}

.chart-info {
	flex: 1;
	padding: 24rpx 24rpx;
	overflow: hidden;
	margin-bottom: 20rpx;
}

.song-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #1e293b;
	margin-bottom: 12rpx;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.chart-details {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

/* 美化统计项目，使用不同背景色 */
.stat-item {
	display: flex;
	align-items: center;
	padding: 6rpx 12rpx;
	border-radius: 8rpx;
	font-size: 24rpx;
}

.stat-label {
	color: #64748b;
	margin-right: 0rpx;
	font-weight: 500;
	min-width: 80rpx;
}

.stat-value {
	color: #1e293b;
	font-weight: 600;
}

.player-achievement {
	margin-left: 12rpx;
	color: #6366f1;
	font-weight: 600;
}

/* 为不同类型的统计项使用不同的背景色 */
.sample-count {
	color: #2196F3;
						font-weight: 600;
						background: rgba(33, 150, 243, 0.1);
}

.achievement {
	color: #ffa502;
						font-weight: 600;
						background: rgba(255, 165, 2, 0.1);
}

.difficulty {
		color: #2ecc71;
						font-weight: 500;
						background: rgba(46, 204, 113, 0.1);
					
}

.score {
	background-color: #fef3c7; /* 浅黄色 */
}

/* 难度标签颜色 */


/* 分页样式 */
.pagination {
	margin-top: 30rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.page-info {
	font-size: 24rpx;
	color: #6366f1;
	margin-bottom: 16rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.total-count {
	font-size: 22rpx;
	color: #818cf8;
	margin-top: 4rpx;
}

.page-controls {
	display: flex;
	gap: 24rpx;
	margin-top: 12rpx;
}

.page-btn {
	background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
	color: white;
	border: none;
	border-radius: 12rpx;
	padding: 12rpx 36rpx;
	font-size: 26rpx;
	font-weight: 500;
	box-shadow: 0 4rpx 12rpx rgba(99, 102, 241, 0.2);
	transition: all 0.2s ease;
}

/* 添加推荐模式选择样式 */
.recommend-mode {
	margin-bottom: 20rpx;
}

.mode-selector {
	display: flex;
	background-color: #f1f5f9;
	border-radius: 12rpx;
	overflow: hidden;
	padding: 4rpx;
}

.mode-item {
	flex: 1;
	text-align: center;
	padding: 16rpx 0;
	font-size: 28rpx;
	color: #64748b;
	transition: all 0.3s ease;
	border-radius: 8rpx;
}

.mode-item.active {
	background-color: #6366f1;
	color: white;
	font-weight: 500;
	box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
}

/* 定数范围输入样式 */
.dsrange-input-container {
	margin-bottom: 20rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.dsrange-inputs {
	width: 100%;
	display: flex;
	align-items: center;
	gap: 16rpx;
	margin-bottom: 20rpx;
}

.ds-input-group {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.ds-label {
	font-size: 26rpx;
	color: #64748b;
	margin-bottom: 8rpx;
}

.ds-input {
	height: 88rpx;
	border: 2px solid #e2e8f0;
	border-radius: 16rpx;
	padding: 0 24rpx;
	font-size: 38rpx;
	font-weight: 500;
	color: #1e293b;
	background-color: #f8fafc;
	box-sizing: border-box;
}

.ds-input:hover {
	border-color: #6366f1;
	background: white;
}

.ds-separator {
	font-size: 32rpx;
	font-weight: 600;
	color: #64748b;
	margin: 0 8rpx;
	display: flex;
	align-items: center;
	align-self: flex-end;
	height: 88rpx;
	margin-top: 34rpx;
}

/* 如果需要调整按钮位置，可以添加以下样式 */
.recommend-button {
	margin-bottom: 20rpx;
	width: 100%;
}

/* 标题居中样式 */
.text-center {
  text-align: center;
  display: block;
}

</style>
