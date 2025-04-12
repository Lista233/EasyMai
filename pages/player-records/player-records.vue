<template>
	<view class="player-records" :class="{ 'dark-mode': isDarkMode }">
		<!-- 加载状态 -->
		<view class="loading-container" v-if="isLoading">
			<view class="loading-spinner"></view>
			<text class="loading-text">正在加载数据...</text>
		</view>
		
		<!-- 主内容区域 -->
		<view v-else>
			<!-- 头部信息 -->
			<view class="header">
				<view class="header-title">玩家记录</view>
				<view class="player-info" v-if="currentStats">
					<text class="nickname">{{ playerRecordService.getPlayerInfo()?.nickname || playerRecordService.getPlayerInfo()?.username || '未知玩家' }}</text>
					<text class="rating">Rating: {{ playerRecordService.getPlayerInfo()?.rating || 0 }}</text>
				</view>
				
				<!-- 统计信息 - 第一行 -->
				<view class="stats-row" v-if="currentStats">
					<view class="stat-item">
						<view class="stat-value">{{ currentStats.totalSongs }}</view>
						<view class="stat-label">总曲目数</view>
					</view>
					<view class="stat-item">
						<view class="stat-value">{{ currentStats.rateStats.sssp }}</view>
						<view class="stat-label">SSS+</view>
					</view>
					<view class="stat-item">
						<view class="stat-value">{{ currentStats.rateStats.sss }}</view>
						<view class="stat-label">SSS</view>
					</view>
				</view>
				
				<!-- 统计信息 - 第二行 -->
				<view class="stats-row fc-row" v-if="currentStats">
					<view class="stat-item">
						<view class="stat-value">{{ currentStats.fcStats.fc + currentStats.fcStats.fcp }}</view>
						<view class="stat-label">FC/FC+</view>
					</view>
					<view class="stat-item">
						<view class="stat-value">{{ currentStats.fcStats.ap + currentStats.fcStats.app }}</view>
						<view class="stat-label">AP/AP+</view>
					</view>
					<view class="stat-item">
						<view class="stat-value">{{ currentStats.fcStats.fs + currentStats.fcStats.fsp }}</view>
						<view class="stat-label">FS/FS+</view>
					</view>
					<view class="stat-item">
						<view class="stat-value">{{ currentStats.fcStats.fsd + currentStats.fcStats.fsdp }}</view>
						<view class="stat-label">FSD/FSD+</view>
					</view>
				</view>
			</view>
			
			<!-- 筛选按钮 -->
			<view class="filter-buttons">
				<button class="filter-btn" @click="showSortFilter">
					<view class="btn-content">
						<text class="btn-title">排序方式</text>
						<text class="filter-active" v-if="sortBy">{{ getSortLabel(sortBy) }}</text>
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
						<text v-if="dsFilter.min || dsFilter.max" class="filter-active">
							{{formatDsFilterText}}
						</text>
					</view>
				</button>
				<button class="filter-btn" @click="showDifficultyFilter">
					<view class="btn-content">
						<text class="btn-title">难度筛选</text>
						<text class="filter-active" v-if="selectedDifficulty !== null">{{ difficultyLabels[selectedDifficulty] }}</text>
					</view>
				</button>
			</view>
			
			<!-- 添加达成率筛选按钮 -->
			<view class="filter-buttons second-row">
				<button class="filter-btn" @click="showAchievementFilter">
					<view class="btn-content">
						<text class="btn-title">达成率筛选</text>
						<text class="filter-active" v-if="achievementFilter.min || achievementFilter.max">
							{{formatAchievementFilterText}}
						</text>
					</view>
				</button>
				<button class="filter-btn" @click="showFcFsFilter">
					<view class="btn-content">
						<text class="btn-title">FC/FS筛选</text>
						<text class="filter-active" v-if="selectedFcType || selectedFsType">
							{{formatFcFsFilterText}}
						</text>
					</view>
				</button>
			</view>
			
			<!-- 添加视图控制栏 -->
			<view class="view-controls">
				<view class="view-mode">
					<text 
						class="mode-btn"
						:class="{ active: viewMode === 'grid' }"
						@click="setViewMode('grid')"
					>网格</text>
					<text 
						class="mode-btn"
						:class="{ active: viewMode === 'list' }"
						@click="setViewMode('list')"
					>列表</text>
				</view>
				<view class="grid-options" v-if="viewMode === 'grid'">
					<view class="grid-size">
						<text class="size-label">{{gridSize}}列</text>
						<slider 
							:min="2" 
							:max="5" 
							:value="gridSize" 
							:step="1"
							:block-size="16"
							@change="onGridSizeChange"
							show-value
							activeColor="#818cf8"
							backgroundColor="#e2e8f0"
							blockColor="#6366f1"
							class="custom-slider"
						/>
					</view>
					<view class="icon-toggle">
						<text
							class="toggle-btn"
							:class="{ active: iconDisplay === 'rate' }"
							@click="setIconDisplay('rate')"
						>评级</text>
						<text 
							class="toggle-btn"
							:class="{ active: iconDisplay === 'fc' }"
							@click="setIconDisplay('fc')"
						>FC</text>
						<text 
							class="toggle-btn"
							:class="{ active: iconDisplay === 'fs' }"
							@click="setIconDisplay('fs')"
						>FS</text>
						
					</view>
				</view>
			</view>
			
			<!-- 修改歌曲列表容器 -->
			<view 
				class="songs-container"
				:class="[
					viewMode === 'grid' ? 'grid-view' : 'list-view',
					`grid-size-${gridSize}`
				]"
			>
				<!-- 网格视图下的歌曲项 -->
				<template v-if="viewMode === 'grid'">
					<view 
						v-for="record in paginatedRecords" 
						:key="record.id"
						class="song-item"
						@click="navigateToDetail(record.song_id, record.level_index)"
					>
						<view class="cover-image" :class="`level-${record.level_index}`">
							<image 
								:src="getSongCover(record.song_id)" 
								mode="aspectFill" 
								lazy-load 
								@error="handleImageError"
								style="width: 100%; height: 100%; position: absolute; top: 0; left: 0;"
							/>
							
							<!-- 灰色遮罩 -->
							<view class="icon-overlay" v-if="shouldShowIcon(record)"></view>
							
							<!-- 图标容器 - 新增 -->
							<view class="icon-container" v-if="shouldShowIcon(record)">
								<!-- FC图标 -->
								<image 
									v-if="iconDisplay === 'fc' && record.fc && record.fc !== 'none'" 
									class="icon-badge"
									:src="`../../static/maiFCFS/${record.fc}.png`"
								/>
								
								<!-- FS图标 - 不显示sync -->
								<image 
									v-if="iconDisplay === 'fs' && record.fs && record.fs !== 'none' && record.fs !== 'sync'" 
									class="icon-badge"
									:src="`../../static/maiFCFS/${record.fs}.png`"
								/>
								
								<!-- Rate图标 -->
								<image 
									v-if="iconDisplay === 'rate' && record.rate" 
									class="icon-badge icon-rate"
									:src="`../../static/maiFCFS/${record.rate}.png`"
								/>
							</view>
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
				</template>
				
				<!-- 列表视图下的歌曲项 -->
				<template v-else>
					<!-- 记录列表 -->
					<view class="record-list">
						<view class="list-header">
							<text class="list-title">歌曲记录</text>
							<text class="record-count">总计: {{ filteredRecords.length }}</text>
						</view>

						<view class="song-records">
							<view v-for="(record, index) in paginatedRecords" :key="index" class="song-card" @click="navigateToDetail(record.song_id, record.level_index)">
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
										<view v-if="record.fc" class="stat-item fc-fs">{{ record.fc.replace('app', 'ap+').replace('ap', 'ap').replace('fcp', 'fc+').toUpperCase() }}丨{{ record.fs.replace('p', '+').toUpperCase() }}</view>
									</view>
								</view>
								<view class="rate-badge" :class="record.rate.toLowerCase()">{{ record.rate.replace('p','+').toUpperCase() }}</view>
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
				</template>
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
								:class="{ active: tempSortBy === 'ra' }"
								@click="selectSortBy('ra')"
							>
								<text>Rating</text>
							</view>
							<view 
								class="option-item"
								:class="{ active: tempSortBy === 'achievements' }"
								@click="selectSortBy('achievements')"
							>
								<text>达成率</text>
							</view>
							<view 
								class="option-item"
								:class="{ active: tempSortBy === 'ds' }"
								@click="selectSortBy('ds')"
							>
								<text>难度</text>
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
					<view class="popup-content">
						<scroll-view 
							scroll-y 
							class="option-list"
							:style="{ height: '500rpx' }"
						>
							<view 
								v-for="version in versions" 
								:key="version"
								class="option-item"
								:class="{ active: tempVersion === version }"
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
						<view class="form-item ds-range">
							<input 
								type="digit" 
								v-model="dsFilter.min" 
								placeholder="最小值"
							
								@focus="onInputFocus"
								@blur="onInputBlur"
								maxlength="5"
							/>
							<text class="range-separator">至</text>
							<input 
								type="digit" 
								v-model="dsFilter.max" 
								placeholder="最大值"
							
								@focus="onInputFocus"
								@blur="onInputBlur"
								maxlength="5"
							/>
						</view>
						<view class="range-tips">
							<text>* 定数范围: 1.0-15.0</text>
						</view>
						<view class="quick-select">
							<text class="section-title">快速选择</text>
							<view class="option-grid">
								<view 
									v-for="range in dsRanges" 
									:key="range.label"
									class="option-chip"
									:class="{ active: isQuickRangeSelected(range) }"
									@click="selectQuickRange(range)"
								>
									<text>{{range.label}}</text>
								</view>
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
								:class="{ active: tempDifficulty === null }"
								@click="selectDifficulty(null)"
							>
								<text>全部</text>
							</view>
							<view 
								v-for="(label, index) in difficultyLabels" 
								:key="index"
								class="option-item difficulty-option"
								:class="{ 
									active: tempDifficulty === index,
									basic: index === 0,
									advanced: index === 1,
									expert: index === 2,
									master: index === 3,
									remaster: index === 4
								}"
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
			
			<!-- 达成率筛选弹窗 -->
			<uni-popup ref="achievementPopup" type="center">
				<view class="filter-popup">
					<view class="popup-header">
						<text class="title">达成率范围筛选</text>
						<text class="close-btn" @click="closeAchievementFilter">×</text>
					</view>
					<view class="popup-content">
						<view class="form-item ds-range">
							<input 
								type="digit" 
								v-model="tempAchievementFilter.min" 
								placeholder="最小值"
								@focus="onInputFocus"
								@blur="onInputBlur"
								maxlength="6"
							/>
							<text class="range-separator">至</text>
							<input 
								type="digit" 
								v-model="tempAchievementFilter.max" 
								placeholder="最大值"
								@focus="onInputFocus"
								@blur="onInputBlur"
								maxlength="6"
							/>
						</view>
						<view class="range-tips">
							<text>* 达成率范围: 0-101.0%</text>
						</view>
						<view class="quick-select">
							<text class="section-title">快速选择</text>
							<view class="option-grid">
								<view 
									v-for="range in achievementRanges" 
									:key="range.label"
									class="option-chip"
									:class="{ active: isQuickAchievementRangeSelected(range) }"
									@click="selectQuickAchievementRange(range)"
								>
									<text>{{range.label}}</text>
								</view>
							</view>
						</view>
					</view>
					<view class="popup-footer">
						<button class="cancel-btn" @click="closeAchievementFilter">取消</button>
						<button class="confirm-btn" @click="applyAchievementFilter">确定</button>
					</view>
				</view>
			</uni-popup>
			
			<!-- FC/FS筛选弹窗 -->
			<uni-popup ref="fcFsPopup" type="center">
				<view class="filter-popup">
					<view class="popup-header">
						<text class="title">FC/FS筛选</text>
						<text class="close-btn" @click="closeFcFsFilter">×</text>
					</view>
					<view class="popup-content">
						<view class="fc-fs-tabs">
							<view 
								class="tab-item" 
								:class="{ active: fcFsTab === 'fc' }"
								@click="fcFsTab = 'fc'"
							>FC状态</view>
							<view 
								class="tab-item" 
								:class="{ active: fcFsTab === 'fs' }"
								@click="fcFsTab = 'fs'"
							>FS状态</view>
						</view>
						
						<view class="option-list" v-if="fcFsTab === 'fc'">
							<view 
								class="option-item"
								:class="{ active: tempFcType === null }"
								@click="selectFcType(null)"
							>
								<text>全部</text>
							</view>
							<view 
								v-for="(label, type) in fcTypes" 
								:key="type"
								class="option-item"
								:class="{ active: tempFcType === type }"
								@click="selectFcType(type)"
							>
								<text>{{label}}</text>
							</view>
						</view>
						
						<view class="option-list" v-else>
							<view 
								class="option-item"
								:class="{ active: tempFsType === null }"
								@click="selectFsType(null)"
							>
								<text>全部</text>
							</view>
							<view 
								v-for="(label, type) in fsTypes" 
								:key="type"
								class="option-item"
								:class="{ active: tempFsType === type }"
								@click="selectFsType(type)"
							>
								<text>{{label}}</text>
							</view>
						</view>
					</view>
					<view class="popup-footer">
						<button class="cancel-btn" @click="closeFcFsFilter">取消</button>
						<button class="confirm-btn" @click="applyFcFsFilter">确定</button>
					</view>
				</view>
			</uni-popup>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, inject, watch, onBeforeMount } from 'vue'
import SongService from '@/utils/songService.js'
import playerRecordService from '@/utils/PlayerRecordService.js'
import { getCoverUrl } from '../../utils/coverManager.js'
import {updateNativeTabBar} from '@/utils/updateNativeTabBar.js'

// 注入深色模式变量
const isDarkMode = inject('isDarkMode');
const applyTheme = inject('applyTheme');


    

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

// 定数筛选相关
const dsFilter = ref({
	min: '',
	max: ''
})

// 预定义的定数范围
const dsRanges = [
	{ label: '全部', min: 1, max: 15 },
	{ label: '13', min: 13.0, max: 13.6 },
	{ label: '13+', min: 13.7, max: 13.9 },
	{ label: '14', min: 14.0, max: 14.6 },
	{ label: '14+', min: 14.7, max: 14.9 },
]

// 添加简化的版本映射
const versionMap = {
	'maimai': 'maimai',
	'maimai PLUS': 'maimai+',
	'maimai GreeN': 'GreeN',
	'maimai GreeN PLUS': 'GreeN+',
	'maimai ORANGE': 'ORANGE',
	'maimai ORANGE PLUS': 'ORANGE+',
	'maimai PiNK': 'PiNK',
	'maimai PiNK PLUS': 'PiNK+',
	'maimai MURASAKi': 'MURASAKi',
	'maimai MURASAKi PLUS': 'MURASAKi+',
	'maimai MiLK': 'MiLK',
	'MiLK PLUS': 'MiLK+',
	'maimai FiNALE': 'FiNALE',
	'maimai でらっくす': '舞萌DX2020',
	'maimai でらっくす Splash': '舞萌DX2021',
	'maimai でらっくす UNiVERSE': '舞萌DX2022',
	'maimai でらっくす FESTiVAL': '舞萌DX2023',
	'maimai でらっくす BUDDiES': '舞萌DX2024'
}

// 修改反向映射关系，从显示名称映射到原始值
const reverseVersionMap = {
  '任意版本': '',
  '(真)-maimai': 'maimai',
  '(真)-maimai PLUS': 'maimai PLUS',
  '(超)-GreeN': 'maimai GreeN',
  '(檄)-GreeN PLUS': 'maimai GreeN PLUS',
  '(橙)-ORANGE': 'maimai ORANGE',
  '(暁)-ORANGE PLUS': 'maimai ORANGE PLUS',
  '(桃)-PiNK': 'maimai PiNK',
  '(櫻)-PiNK PLUS': 'maimai PiNK PLUS',
  '(紫)-MURASAKi': 'maimai MURASAKi',
  '(菫)-MURASAKi PLUS': 'maimai MURASAKi PLUS',
  '(白)-MiLK': 'maimai MiLK',
  '(雪)-MiLK PLUS': 'MiLK PLUS',
  '(輝)-FiNALE': 'maimai FiNALE',
  '(熊華)-舞萌DX2020': 'maimai でらっくす',
  '(爽煌)-舞萌DX2021': 'maimai でらっくす Splash',
  '(宙星)-舞萌DX2022': 'maimai でらっくす UNiVERSE',
  '(祭祝)-舞萌DX2023': 'maimai でらっくす FESTiVAL',
  '(双宴)-舞萌DX2024': 'maimai でらっくす BUDDiES'
}

// 版本列表（使用显示名称）
const versions = [
	'任意版本',
	'(真)-maimai',
	'(真)-maimai PLUS',
	'(超)-GreeN',
	'(檄)-GreeN PLUS',
	'(橙)-ORANGE',
	'(暁)-ORANGE PLUS',
	'(桃)-PiNK',
	'(櫻)-PiNK PLUS',
	'(紫)-MURASAKi',
	'(菫)-MURASAKi PLUS',
	'(白)-MiLK',
	'(雪)-MiLK PLUS',
	'(輝)-FiNALE',
	'(熊華)-舞萌DX2020',
	'(爽煌)-舞萌DX2021',
	'(宙星)-舞萌DX2022',
	'(祭祝)-舞萌DX2023',
	'(双宴)-舞萌DX2024'
]

// 当前统计信息
const currentStats = ref(null)

// 添加分页相关的响应式变量
const currentPage = ref(1)
const pageSize = computed(() => {
	// 根据网格大小调整每页显示的元素数量
	switch (gridSize.value) {
		case 2:
			return 10; // 2列显示10个元素(5行)
		case 3:
			return 15; // 3列显示15个元素(5行)
		case 4:
			return 20; // 4列显示20个元素(5行)
		case 5:
			return 35; // 5列显示35个元素(7行)
		default:
			return 20;
	}
})

// 添加难度相关的常量和响应式变量
const difficultyLabels = ['Basic', 'Advanced', 'Expert', 'Master', 'Re:Master']

// 输入框焦点状态
const inputFocused = ref(false)

// 添加视图控制相关的响应式变量
const viewMode = ref('grid') // 'grid' 或 'list'
const gridSize = ref(5) // 默认4列

// 添加图标显示控制
const iconDisplay = ref('fc') // 'fc', 'fs', 'rate'

// 添加达成率筛选相关
const achievementPopup = ref(null)
const achievementFilter = ref({
	min: '',
	max: ''
})
const selectedAchievementRange = ref(null)
const tempAchievementFilter = ref({
	min: '',
	max: ''
})

// 添加FC/FS筛选相关
const fcFsPopup = ref(null)
const fcFsTab = ref('fc') // 'fc' 或 'fs'
const selectedFcType = ref(null)
const selectedFsType = ref(null)
const tempFcType = ref(null)
const tempFsType = ref(null)

// FC类型映射
const fcTypes = {
	'none': '未FC',
	'fc': 'FC',
	'fcp': 'FC+',
	'ap': 'AP',
	'app': 'AP+'
}

// FS类型映射
const fsTypes = {
	'none': '未FS',
	'fs': 'FS',
	'fsp': 'FS+',
	'fsd': 'FSD',
	'fsdp': 'FSD+'
}

// 预定义的达成率范围
const achievementRanges = [
	{ label: '全部', min: 0, max: 101 },
	{ label: 'SSS+', min: 100.5, max: 101 },
	{ label: 'SSS', min: 100, max: 100.49 },
	{ label: 'SS+', min: 99.5, max: 99.99 },
	{ label: 'SS', min: 99, max: 99.49 },
	{ label: 'S+', min: 98, max: 98.99 },
	{ label: 'S', min: 97, max: 97.99 },
	{ label: 'AAA', min: 94, max: 96.99 },
	{ label: '未SSS', min: 0, max: 99.99 }
]

// 检查是否选中了快速选择达成率范围
const isQuickAchievementRangeSelected = (range) => {
	if (!tempAchievementFilter.value.min && !tempAchievementFilter.value.max && range.label === '全部') {
		return true
	}
	
	return parseFloat(tempAchievementFilter.value.min) === range.min && 
		   parseFloat(tempAchievementFilter.value.max) === range.max
}

// 快速选择达成率范围
const selectQuickAchievementRange = (range) => {
	if (range.label === '全部') {
		tempAchievementFilter.value.min = ''
		tempAchievementFilter.value.max = ''
	} else {
		tempAchievementFilter.value.min = range.min.toString()
		tempAchievementFilter.value.max = range.max.toString()
	}
}

// 显示达成率筛选弹窗
const showAchievementFilter = () => {
	// 复制当前筛选值到临时变量
	tempAchievementFilter.value = {
		min: achievementFilter.value.min,
		max: achievementFilter.value.max
	}
	achievementPopup.value.open()
}

// 关闭达成率筛选弹窗
const closeAchievementFilter = () => {
	achievementPopup.value?.close()
}

// 应用达成率筛选
const applyAchievementFilter = () => {
	// 从临时变量复制到实际筛选值
	achievementFilter.value = {
		min: tempAchievementFilter.value.min,
		max: tempAchievementFilter.value.max
	}
	
	// 解析输入值
	let min = achievementFilter.value.min === '' ? 0 : parseFloat(achievementFilter.value.min)
	let max = achievementFilter.value.max === '' ? 101 : parseFloat(achievementFilter.value.max)
	
	// 验证范围
	if (min > max) {
		const temp = min
		min = max
		max = temp
	}
	
	// 更新选中的达成率范围
	if (min === 0 && max === 101) {
		selectedAchievementRange.value = null // 全部范围视为未筛选
	} else {
		selectedAchievementRange.value = { min, max }
	}
	
	closeAchievementFilter() // 确保弹窗关闭
	currentPage.value = 1 // 重置页码
	updateStats()
}

// 格式化达成率筛选文本
const formatAchievementFilterText = computed(() => {
	if (!achievementFilter.value.min && !achievementFilter.value.max) return '';
	
	if (achievementFilter.value.min && achievementFilter.value.max) {
		return `${achievementFilter.value.min}%~${achievementFilter.value.max}%`;
	} else if (achievementFilter.value.min) {
		return `≥ ${achievementFilter.value.min}%`;
	} else {
		return `≤ ${achievementFilter.value.max}%`;
	}
})

// 显示FC/FS筛选弹窗
const showFcFsFilter = () => {
	tempFcType.value = selectedFcType.value
	tempFsType.value = selectedFsType.value
	fcFsPopup.value.open()
}

// 关闭FC/FS筛选弹窗
const closeFcFsFilter = () => {
	fcFsPopup.value?.close()
}

// 选择FC类型
const selectFcType = (type) => {
	tempFcType.value = type
}

// 选择FS类型
const selectFsType = (type) => {
	tempFcType.value = null;
	tempFsType.value = type;
}

// 应用FC/FS筛选
const applyFcFsFilter = () => {
	selectedFcType.value = tempFcType.value
	selectedFsType.value = tempFsType.value
	closeFcFsFilter()
	currentPage.value = 1 // 重置页码
	updateStats()
}

// 格式化FC/FS筛选文本
const formatFcFsFilterText = computed(() => {
	const fcText = selectedFcType.value ? fcTypes[selectedFcType.value] : '';
	const fsText = selectedFsType.value ? fsTypes[selectedFsType.value] : '';
	
	if (fcText && fsText) {
		return `${fcText}/${fsText}`;
	} else if (fcText) {
		return fcText;
	} else if (fsText) {
		return fsText;
	}
	
	return '';
})

// 检查是否选中了快速选择范围
const isQuickRangeSelected = (range) => {
	if (!dsFilter.value.min && !dsFilter.value.max && range.label === '全部') {
		return true
	}
	
	return parseFloat(dsFilter.value.min) === range.min && 
		   parseFloat(dsFilter.value.max) === range.max
}

// 处理定数输入
const onDsInput = (type) => {
  // 简单清除非数字和小数点字符
  let value = dsFilter.value[type];
  value = value.replace(/[^\d.]/g, '');
  dsFilter.value[type] = value;
};

// 输入框焦点事件
const onInputFocus = () => {
	inputFocused.value = true
}

const onInputBlur = () => {
	inputFocused.value = false
}

// 快速选择定数范围
const selectQuickRange = (range) => {
	if (range.label === '全部') {
		dsFilter.value.min = ''
		dsFilter.value.max = ''
	} else {
		dsFilter.value.min = range.min.toString()
		dsFilter.value.max = range.max.toString()
	}
}

// 应用定数筛选
const applyDsFilter = () => {
	// 解析输入值
	let min = dsFilter.value.min === '' ? 1 : parseFloat(dsFilter.value.min)
	let max = dsFilter.value.max === '' ? 15 : parseFloat(dsFilter.value.max)
	
	// 验证范围
	if (min > max) {
		const temp=min
		min=max
		max=temp
	}
	
	// 更新选中的定数范围
	if (min === 1 && max === 15) {
		selectedDsRange.value = null // 全部范围视为未筛选
	} else {
		selectedDsRange.value = { min, max }
	}
	
	dsPopup.value?.close() // 确保弹窗关闭
	currentPage.value = 1 // 重置页码
	updateStats()
}

// 显示定数筛选弹窗
const showDsFilter = () => {
	dsPopup.value.open()
}

// 格式化定数筛选文本
const formatDsFilterText = computed(() => {
	if (!dsFilter.value.min && !dsFilter.value.max) return '';
	
	if (dsFilter.value.min && dsFilter.value.max) {
		return `${dsFilter.value.min}~${dsFilter.value.max}`;
	} else if (dsFilter.value.min) {
		return `≥ ${dsFilter.value.min}`;
	} else {
		return `≤ ${dsFilter.value.max}`;
	}
})

// 修改 filteredRecords 计算属性，添加缓存机制
const cachedRecords = ref([])
const lastFilterParams = ref(null)

const filteredRecords = computed(() => {
	if (!songService.value) return []
	
	// 创建当前筛选参数的快照
	const currentParams = {
		version: selectedVersion.value,
		difficulty: selectedDifficulty.value,
		dsMin: dsFilter.value.min ? parseFloat(dsFilter.value.min) : 1,
		dsMax: dsFilter.value.max ? parseFloat(dsFilter.value.max) : 15,
		achievementMin: achievementFilter.value.min ? parseFloat(achievementFilter.value.min) : undefined,
		achievementMax: achievementFilter.value.max ? parseFloat(achievementFilter.value.max) : undefined,
		sortBy: sortBy.value,
		fcType: selectedFcType.value,
		fsType: selectedFsType.value
	}
	
	// 检查参数是否与上次相同，如果相同则返回缓存结果
	if (lastFilterParams.value && 
		JSON.stringify(lastFilterParams.value) === JSON.stringify(currentParams)) {
		return cachedRecords.value
	}
	
	// 创建一个本地过滤函数来处理'none'类型
	let records = playerRecordService.filterRecordsByMultipleConditions(songService.value, {
		version: selectedVersion.value,
		difficultyIndex: selectedDifficulty.value,
		dsRange: (dsFilter.value.min || dsFilter.value.max) ? {
			min: dsFilter.value.min ? parseFloat(dsFilter.value.min) : 1,
			max: dsFilter.value.max ? parseFloat(dsFilter.value.max) : 15
		} : null,
		achievementRange: selectedAchievementRange.value,
		sortBy: sortBy.value,
		order: 'desc'
	})
	
	// 额外处理FC筛选
	if (selectedFcType.value) {
		if (selectedFcType.value === 'none') {
			// 筛选无FC的记录
			records = records.filter(record => !record.fc || record.fc === 'none');
		} else {
			// 筛选特定FC类型的记录
			records = records.filter(record => record.fc === selectedFcType.value);
		}
	}
	
	// 额外处理FS筛选
	if (selectedFsType.value) {
		if (selectedFsType.value === 'none') {
			// 筛选无FS的记录
			records = records.filter(record => !record.fs || record.fs === 'none' || record.fs === 'sync');
		} else {
			// 筛选特定FS类型的记录
			records = records.filter(record => record.fs === selectedFsType.value);
		}
	}
	
	// 更新缓存和参数
	lastFilterParams.value = currentParams
	cachedRecords.value = records
	
	return records;
})

// 计算分页后的记录
const paginatedRecords = computed(() => {
	const start = (currentPage.value - 1) * pageSize.value;
	const end = start + pageSize.value;
	return filteredRecords.value.slice(start, end);
})

// 计算总页数
const totalPages = computed(() => {
	return Math.ceil(filteredRecords.value.length / pageSize.value);
})

// 格式化版本文本
const formatVersionText = computed(() => {
	if (!selectedVersion.value) return '任意版本';
	// 简化版本名称显示
	return versionMap[selectedVersion.value] || selectedVersion.value;
})

// 添加加载状态
const isLoading = ref(true)
const isDataReady = ref(false)

// 初始化
onBeforeMount(()=>{
	applyTheme();
	updateNativeTabBar(isDarkMode.value);
})
onMounted(async () => {
	// 先设置加载状态，让页面框架先渲染出来
	isLoading.value = true
	

	// 使用nextTick确保UI先渲染
	await nextTick()
	
	// 使用setTimeout让主线程先处理UI渲染
	setTimeout(async () => {
		try {
			const musicList = uni.getStorageSync('musicData')
			const playerData = uni.getStorageSync('divingFish_records')
			
			songService.value = new SongService(musicList)
			playerRecordService.initPlayerData(playerData.data)
			
			// 设置默认值
			selectedDsRange.value = dsRanges[0]
			
			// 更新统计信息
			updateStats()
			
			// 数据准备完毕
			isDataReady.value = true
		} catch (error) {
			console.error('加载数据出错:', error)
		} finally {
			// 无论成功失败都关闭加载状态
			isLoading.value = false
		}
	}, 100) // 给UI渲染一点时间
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
	updateStats()
}

// 显示版本筛选弹窗
const showVersionFilter = () => {
	// 将原始版本值转换为显示名称
	tempVersion.value = selectedVersion.value ? 
		(versionMap[selectedVersion.value] || selectedVersion.value) : 
		'任意版本'
	
	versionPopup.value.open()
}

const closeVersionFilter = () => {
	versionPopup.value.close()
}

// 选择版本
const selectVersion = (version) => {
	tempVersion.value = version
}

// 应用版本筛选
const applyVersionFilter = () => {
	if (tempVersion.value === '任意版本') {
		selectedVersion.value = ''
	} else {
		// 将显示名称转换回原始值
		selectedVersion.value = reverseVersionMap[tempVersion.value] || tempVersion.value
	}
	
	closeVersionFilter()
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
	const records = filteredRecords.value
	
	currentStats.value = {
		totalSongs: records.length,
		rateStats: {
			sssp: records.filter(r => r.rate === 'sssp').length,
			sss: records.filter(r => r.rate === 'sss').length,
			ssp: records.filter(r => r.rate === 'ssp').length,
			ss: records.filter(r => r.rate === 'ss').length,
			sp: records.filter(r => r.rate === 'sp').length,
			s: records.filter(r => r.rate === 's').length,
			aaa: records.filter(r => r.rate === 'aaa').length,
			aa: records.filter(r => r.rate === 'aa').length,
			a: records.filter(r => r.rate === 'a').length,
			bbb: records.filter(r => r.rate === 'bbb').length,
			bb: records.filter(r => r.rate === 'bb').length,
			b: records.filter(r => r.rate === 'b').length,
			c: records.filter(r => r.rate === 'c').length,
			d: records.filter(r => r.rate === 'd').length
		},
		fcStats: {
			fc: records.filter(r => r.fc === 'fc').length,
			fcp: records.filter(r => r.fc === 'fcp').length,
			ap: records.filter(r => r.fc === 'ap').length,
			app: records.filter(r => r.fc === 'app').length,
			fs: records.filter(r => r.fs === 'fs').length,
			fsp: records.filter(r => r.fs === 'fsp').length,
			fsd: records.filter(r => r.fs === 'fsd').length,
			fsdp: records.filter(r => r.fs === 'fsdp').length
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

// 获取歌曲封面并处理错误
const getSongCover = (songId) => {
	try {
		const coverUrl = getCoverUrl(songId);
		return coverUrl || '../../static/default_cover.jpg';
	} catch (error) {
		console.error('获取封面出错:', error, songId);
		return '../../static/default_cover.jpg';
	}
}

// 处理图片加载错误
const handleImageError = (e) => {
	console.log('图片加载失败:', e);
}

// 修改 navigateToDetail 函数，添加难度索引参数
const navigateToDetail = (songId, levelIndex) => {
	uni.navigateTo({
		url: `/pages/song-detail/song-detail?songId=${songId}&difficulty=${levelIndex}`,
		animationType: 'pop-in',
		animationDuration: 200
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

// 修改排序按钮显示文本
const getSortLabel = (type) => {
	const labels = {
		'ra': 'Rating',
		'achievements': '达成率',
		'ds': '难度'
	}
	return labels[type] || ''
}

// 关闭定数筛选弹窗
const closeDsFilter = () => {
	dsPopup.value?.close() // 添加可选链操作符，防止 dsPopup 为空
}

// 设置视图模式
const setViewMode = (mode) => {
	viewMode.value = mode
}

// 处理网格大小变化
const onGridSizeChange = (e) => {
	gridSize.value = Number(e.detail.value)
}

// 设置图标显示类型
const setIconDisplay = (type) => {
	iconDisplay.value = type
}

// 添加判断是否应该显示图标的方法
const shouldShowIcon = (record) => {
	if (iconDisplay.value === 'fc' && record.fc && record.fc !== 'none') {
		return true;
	}
	if (iconDisplay.value === 'fs' && record.fs && record.fs !== 'none' && record.fs !== 'sync') {
		return true;
	}
	if (iconDisplay.value === 'rate' && record.rate && ['sssp', 'sss'].includes(record.rate.toLowerCase())) {
		return true;
	}
	return false;
}

// 更新网格大小的方法
const updateGridSize = (size) => {
	gridSize.value = size;
	// 当切换到2列时，移除滑块
	if (size === 2) {
		// 可以在这里添加逻辑来移除或禁用滑块
	}
	// 重置到第一页，避免页码超出范围
	currentPage.value = 1;
};


</script>

<style lang="scss">
// 先定义文本省略混入
@import '@/pages/player-records/dark-player-records.scss';


@mixin text-ellipsis {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.player-records {
	padding: 40rpx 20rpx 20rpx 10rpx;
	background: linear-gradient(135deg, #f0f4ff 0%, #e6e9ff 100%);
	min-height: 100vh;
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
	box-sizing: border-box;


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
		
		&.fc-row {
			margin-top: 12rpx;
			
			.stat-item {
				min-width: 120rpx;
				padding: 12rpx;
				
				.stat-value {
					font-size: 28rpx;
				}
				
				.stat-label {
					font-size: 22rpx;
				}
			}
		}
		
		.stat-item {
			background-color: rgba(255, 255, 255, 0.9);
			border-radius: 16rpx;
			padding: 16rpx;
			flex: 1;
			min-width: 140rpx;
			box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.05);
			
			.stat-value {
				font-size: 32rpx;
				font-weight: bold;
				color: #1e293b;
				margin-bottom: 8rpx;
				text-align: center;
			}
			
			.stat-label {
				font-size: 24rpx;
				color: #64748b;
				text-align: center;
			}
		}
	}
}

.filter-buttons {
	display: flex;
	flex-wrap: wrap; // 添加换行支持
	gap: 12rpx; // 增加间距
	margin-bottom: 16rpx;
	padding: 0 10rpx;
	
	.filter-btn {
		flex: 1;
		min-width: 160rpx; // 设置最小宽度
		height: 90rpx; // 稍微减小高度
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
			height: 100rpx; // 调整高度
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 8rpx; // 减小间距
			
			.btn-title {
				margin: 0;
				padding: 0;
				font-size: 24rpx; // 稍微增大字体
				color: #ffffff;
				text-align: center;
				line-height: 1; // 设置行高为1
			}
			
			.filter-active {
				margin: 0;
				padding: 0;
				font-size: 22rpx;
				color: rgba(255, 255, 255, 0.9);
				text-align: center;
				line-height: 1; // 设置行高为1
				@include text-ellipsis; // 添加文本省略
				max-width: 140rpx; // 限制最大宽度
			}
		}
	}
}

// 移除第二行类，因为现在使用flex-wrap
.second-row {
	margin-top: 0; // 移除顶部边距
}

.view-controls {
	display: flex;
	flex-direction: column;
	background: #fff;
	border-radius: 16rpx;
	margin-bottom: 3rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	
	.view-mode {
		display: flex;
		gap: 20rpx;
		padding: 20rpx 30rpx;
		border-bottom: 1px solid #f0f0f0;
		
		.mode-btn {
			padding: 12rpx 24rpx;
			border-radius: 8rpx;
			font-size: 26rpx;
			color: #64748b;
			background: #f1f5f9;
			transition: all 0.3s ease;
			
			&.active {
				color: #fff;
				background: #6366f1;
			}
			
			&:active {
				opacity: 0.8;
			}
		}
	}
	
	.grid-options {
		padding: 20rpx 30rpx;
		
		.grid-size {
			display: flex;
			align-items: center;
			gap: 20rpx;
			margin-bottom: 20rpx;
			
			.size-label {
				font-size: 24rpx;
				color: #64748b;
				min-width: 70rpx;
			}
			
			slider {
				flex: 1;
			}
		}
		
		.icon-toggle {
			display: flex;
			gap: 20rpx;
			
			.toggle-btn {
				padding: 10rpx 24rpx;
				border-radius: 8rpx;
				font-size: 24rpx;
				color: #64748b;
				background: #f1f5f9;
				transition: all 0.3s ease;
				
				&.active {
					color: #fff;
					background: #6366f1;
				}
				
				&:active {
					opacity: 0.8;
				}
			}
		}
	}
}

.songs-container {
	&.grid-view {
		position: relative;
		display: flex;  
		flex-wrap: wrap;  
		gap: 1rpx; // 保持水平间距
		row-gap: 1rpx; // 特别设置垂直间距更小
		padding: 8rpx; // 保持内边距
		padding-bottom: 120rpx;
		justify-content:  center;
		align-content: center;
		&.grid-size-2 .song-item {
			width: calc((100% - 2rpx) / 2);  
		}
		
		&.grid-size-3 .song-item {
			width: calc((100% - 4rpx) / 3);  
		}
		
		&.grid-size-4 .song-item {
			width: calc((100% - 6rpx) / 4);  
		}
		
		&.grid-size-5 .song-item {
			width: calc((100% - 8rpx) / 5);  
		}
		
		.song-item {
			position: relative;
			border-radius: 2rpx;
			overflow: hidden;
			margin-bottom: 0; // 移除底部间距，因为我们现在使用row-gap
			box-sizing: border-box;
			border: 1px solid rgba(0,0,0,0.08);
			box-shadow: 0 2rpx 4rpx rgba(0,0,0,0.04);
			
			&::before {
				content: "";
				display: block;
				padding-top: 100%;
			}
			
			.cover-image {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				border-radius: 6px;
				border: 5rpx solid transparent;
				box-sizing: border-box;
				
				&.level-0 {
					border-color: #1EA15D;
				}
				
				&.level-1 {
					border-color: #F6B40C;
				}
				
				&.level-2 {
					border-color: #E9485D;
				}
				
				&.level-3 {
					border-color: #9E45E2;
				}
				
				&.level-4 {
					border-color: rgb(253, 159, 255);
				}
				
				image {
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					
					object-fit: cover;
					z-index: 1;
				}
				
				// 灰色遮罩
				.icon-overlay {
					position: absolute;
					left: 0;
					right: 0;
					bottom: 0;
					height: 80%;
					background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%);
					z-index: 5;
				}
				
				// 图标容器
				.icon-container {
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					display: flex;
					justify-content: center;
					align-items: center;
					z-index: 10;
					
					// 确保图标本身也居中
					.icon-badge, .icon-rate {
						align-self: center;
						justify-self: center;
						position: absolute;
						top: 50%;
						left: 50%;
						transform: translate(-50%, -50%);
					}
				}
				
				// 基础图标样式
				.icon-badge {
					width: 100rpx;
					height: 100rpx;
				}
				
				// Rate图标特定样式
				.icon-rate {
					width: 120rpx;
					height: 56rpx;
				}
			}
		}
		
		.pagination {
			position: fixed;
			bottom: 0;
			left: 0;
			right: 0;
			background: rgba(255, 255, 255, 0.95);
			backdrop-filter: blur(10px);
			padding: 20rpx 30rpx;
			display: flex;
			justify-content: space-between;
			align-items: center;
			box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
			z-index: 100;
		}
	}
	
	&.list-view {
		.song-item {
			display: flex;
			padding: 20rpx;
			background: #fff;
			border-radius: 12rpx;
			margin-bottom: 20rpx;
			box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
			
			.cover-image {
				width: 120rpx;
				height: 120rpx;
				border-radius: 8rpx;
				overflow: hidden;
				margin-right: 20rpx;
				
				image {
					width: 100%;
					height: 100%;
					object-fit: cover;
				}
			}
			
			.song-info {
				flex: 1;
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				
				.title {
					font-size: 28rpx;
					font-weight: 500;
					color: #1e293b;
					@include text-ellipsis;
				}
				
				.difficulty {
					font-size: 26rpx;
					color: #64748b;
				}
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
				border: 2px solid transparent;
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
					border-color:  rgb(236, 199, 254);
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
					 background-color: rgb(236, 199, 254);
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
						color: #ffa502;
						font-weight: 500;
						background-color: #f5f5f5;
					}
					
					&.ra {
						color: #2196F3;
						font-weight: 500;
						background-color: #f5f5f5;
					}
					
					&.fc-fs {
						color: #2ecc71;
						background-color: #f5f5f5;
					}
				}
			}
		}
		
		.rate-badge {
			position: absolute;
			top: 16rpx;
			right: 16rpx;
			padding: 4rpx 12rpx;
			border-radius: 8rpx;
			font-size: 22rpx;
			font-weight: bold;
			color: white;
			box-shadow: 0 2rpx 4rpx rgba(0,0,0,0.2);
			
			&.sssp, &.sss {
				background: none;
				background-clip: text;
				-webkit-background-clip: text;
				background-image: linear-gradient(45deg, 
					#ff4757,
					#ff7f50,
					#ffa502,
					#70a1ff,
					#7f50ff,
					#ff6b81
				);
				color: transparent;
				font-weight: 800;
				text-shadow: none;
				background-color: rgba(255, 255, 255, 0.9);
				box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
			}
			
			&.ssp, &.ss {
				background: none;
				background-clip: text;
				-webkit-background-clip: text;
				background-image: linear-gradient(45deg, 
					#ffd700,
					#ffa500,
					#ffd700
				);
				color: transparent;
				font-weight: 800;
				text-shadow: none;
				background-color: rgba(255, 255, 255, 0.9);
				box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
			}
			
			&.sp, &.s {
				background: none;
				background-clip: text;
				-webkit-background-clip: text;
				background-image: linear-gradient(45deg, 
					#ffd700,
					#ffa500,
					#ffd700
				);
				color: transparent;
				font-weight: 800;
				text-shadow: none;
				background-color: rgba(255, 255, 255, 0.9);
				box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
			}
			
			&.aaa, &.aa {
				color: #000;
				background: linear-gradient(135deg, #ffffff, #ffffff);
			}
			
			&.a {
				color: #000;
				background: linear-gradient(135deg, #ffffff, #ffffff);
			}
			
			&.bbb, &.bb, &.b {
				color: #000;
				background: linear-gradient(135deg, #ffffff, #ffffff);
			}
			
			&.c, &.d {
				color: #000;
				background: linear-gradient(135deg, #ffffff, #ffffff);
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

.filter-popup {
	width: 600rpx;
	background-color: #fff;
	border-radius: 20rpx;
	overflow: hidden;
	max-height: 80vh;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
	
	.popup-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 26rpx 30rpx;
		border-bottom: 2rpx solid #f0f0f0;
		background: linear-gradient(to bottom, #fcfcfc, #f9f9f9);
		
		.title {
			font-size: 34rpx;
			font-weight: bold;
			color: #333;
			text-shadow: 0 1rpx 0 rgba(255, 255, 255, 0.8);
		}
		
		.close-btn {
			font-size: 40rpx;
			color: #999;
			padding: 10rpx;
			width: 60rpx;
			height: 60rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			border-radius: 50%;
			transition: all 0.2s ease;
			
			&:active {
				background-color: rgba(0, 0, 0, 0.05);
			}
		}
	}
	
	.popup-content {
		padding: 30rpx;
		
		.option-list {
			max-height: 500rpx;
			overflow-y: auto;
			
			.option-item {
				position: relative;
				padding: 24rpx 40rpx;
				
				&.active {
					color: #6366f1;
					font-weight: bold;
					background-color: rgba(99, 102, 241, 0.1);
					
					&::before {
						content: '';
						position: absolute;
						left: 0;
						top: 0;
						bottom: 0;
						width: 6rpx;
						background-color: #6366f1;
						border-radius: 0 3rpx 3rpx 0;
					}
				}
			}
		}
		
		.form-item {
			margin-bottom: 30rpx;
			
			&.ds-range {
				display: flex;
				align-items: center;
				
				input {
					flex: 1;
					height: 70rpx;
					border: 2rpx solid #ddd;
					border-radius: 8rpx;
					padding: 0 20rpx;
					font-size: 28rpx;
					background-color: #f5f5f5;
					margin: 0 10rpx;
					width: 120rpx;
					transition: all 0.3s ease;
				}
				
				.range-separator {
					margin: 0 10rpx;
					color: #999;
				}
			}
		}
		
		.range-tips {
			font-size: 22rpx;
			color: #888;
			margin: 0 10rpx 20rpx 10rpx;
		}
		
		.quick-select {
			margin-top: 20rpx;
			
			.section-title {
				font-size: 28rpx;
				font-weight: 500;
				color: #666;
				margin-bottom: 16rpx;
				display: block;
			}
			
			.option-grid {
				display: flex;
				flex-wrap: wrap;
				gap: 16rpx;
				
				.option-chip {
					padding: 12rpx 24rpx;
					border-radius: 40rpx;
					font-size: 24rpx;
					background-color: #f5f5f5;
					color: #666;
					text-align: center;
					transition: all 0.3s ease;
					
					&.active {
						background-color: #6366f1;
						color: #fff;
						box-shadow: 0 2rpx 8rpx rgba(99, 102, 241, 0.3);
					}
					
					&:active {
						opacity: 0.8;
						transform: translateY(2rpx);
					}
				}
			}
		}
	}
	
	.popup-footer {
		display: flex;
		padding: 20rpx;
		gap: 20rpx;
		border-top: 2rpx solid #f0f0f0;
		background: linear-gradient(to bottom, #f9f9f9, #fcfcfc);
		
		button {
			flex: 1;
			height: 80rpx;
			border-radius: 40rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 28rpx;
			transition: all 0.3s ease;
			
			&.cancel-btn {
				background-color: #f5f5f5;
				color: #666;
				box-shadow: inset 0 0 0 1rpx rgba(0, 0, 0, 0.05);
				
				&:active {
					background-color: #eaeaea;
					box-shadow: inset 0 2rpx 5rpx rgba(0, 0, 0, 0.05);
				}
			}
			
			&.confirm-btn {
				background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
				color: #fff;
				box-shadow: 0 4rpx 12rpx rgba(99, 102, 241, 0.2);
				
				&:active {
					box-shadow: inset 0 2rpx 5rpx rgba(0, 0, 0, 0.2);
					transform: translateY(2rpx);
				}
			}
		}
	}
}

// 难度筛选特殊样式
.difficulty-option {
	&.basic { color: #4cd137 !important; }
	&.advanced { color: #fbc531 !important; }
	&.expert { color: #e84118 !important; }
	&.master { color: #9c88ff !important; }
	&.remaster { color: rgba(190, 170, 245, 1) !important; }
	
	&.active {
		
		
		&.basic::before { background-color: #4cd137 !important; }
		&.advanced::before { background-color: #fbc531 !important; }
		&.expert::before { background-color: #e84118 !important; }
		&.master::before { background-color: #9c88ff !important; }
		&.remaster::before { background-color: rgba(190, 170, 245, 1) !important; }
	}
}

/* 网格视图中的封面图片难度边框 */
.grid-view .cover-image {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  border: 2px solid transparent;
  box-sizing: border-box;
}

/* 不同难度的边框颜色 */
.grid-view .cover-image.level-0 {
  border-color: #1EA15D; /* Basic - 绿色 */
}

.grid-view .cover-image.level-1 {
  border-color: #F6B40C; /* Advanced - 黄色 */
}

.grid-view .cover-image.level-2 {
  border-color: #E9485D; /* Expert - 红色 */
}

.grid-view .cover-image.level-3 {
  border-color: #9E45E2; /* Master - 紫色 */
}

.grid-view .cover-image.level-4 {
	border-color: rgb(255, 183, 255); /* Re:Master - 更亮更鲜艳的紫粉色 */
}

/* 确保图片填满容器 */
.grid-view .cover-image image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fc-fs-tabs {
	display: flex;
	margin-bottom: 20rpx;
	border-radius: 12rpx;
	overflow: hidden;
	border: 1rpx solid #eaeaea;
	
	.tab-item {
		flex: 1;
		text-align: center;
		padding: 16rpx 0;
		font-size: 28rpx;
		color: #64748b;
		background-color: #f8fafc;
		position: relative;
		transition: all 0.3s ease;
		
		&.active {
			color: #6366f1;
			font-weight: 500;
			background-color: #fff;
			box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
			
			&::after {
				content: '';
				position: absolute;
				bottom: 0;
				left: 20%;
				right: 20%;
				height: 4rpx;
				background-color: #6366f1;
				border-radius: 4rpx;
			}
		}
		
		&:active {
			opacity: 0.8;
		}
	}
}

// 添加加载状态样式
.loading-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 80vh;
	
	.loading-spinner {
		width: 80rpx;
		height: 80rpx;
		border: 6rpx solid rgba(99, 102, 241, 0.1);
		border-top: 6rpx solid #6366f1;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 30rpx;
	}
	
	.loading-text {
		font-size: 30rpx;
		color: #64748b;
	}
}

@keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}
}
</style>