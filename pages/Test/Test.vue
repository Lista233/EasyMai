<template>
	<view class="container">
		

		<view class="test-section">
			<text class="section-title">成绩排序测试</text>
			<view class="button-group">
				<button @click="testSortByRa">按RA值排序(前10)</button>
				<button @click="testSortByAchievements">按达成率排序(前10)</button>
			</view>
			<view class="result">
				<text>结果：</text>
				<view v-for="(record, index) in sortResult" :key="index" class="record-item">
					<text>{{record.title || record.song_id}} - {{record.achievements}}% (RA: {{record.ra}})</text>
				</view>
			</view>
		</view>

		<view class="test-section">
			<text class="section-title">版本成绩统计测试</text>
			<view class="button-group">
				<button @click="testVersionStats('maimai でらっくす Splash')">Splash版本统计</button>
				<button @click="testVersionStats('maimai でらっくす UNiVERSE')">UNiVERSE版本统计</button>
			</view>
			<view class="result" v-if="versionStats">
				<text>版本统计：</text>
				<view class="stats-group">
					<text>总游玩数：{{versionStats.totalSongs}}</text>
					<view class="rate-stats">
						<text>评级分布：</text>
						<text>SSS+: {{versionStats.rateStats.sssp}}</text>
						<text>SSS: {{versionStats.rateStats.sss}}</text>
						<text>SS+: {{versionStats.rateStats.ssp}}</text>
						<text>SS: {{versionStats.rateStats.ss}}</text>
					</view>
					<view class="fc-stats">
						<text>FC统计：</text>
						<text>AP: {{versionStats.fcStats.ap}}</text>
						<text>FC+: {{versionStats.fcStats.fcp}}</text>
						<text>FC: {{versionStats.fcStats.fc}}</text>
					</view>
				</view>
			</view>
		</view>

		<view class="test-section">
			<text class="section-title">定数范围成绩测试</text>
			<view class="button-group">
				<button @click="testDsRangeRecords(13.7, 14.0)">13.7-14.0定数成绩</button>
				<button @click="testDsRangeRecords(14.1, 14.5)">14.1-14.5定数成绩</button>
			</view>
			<view class="result">
				<text>结果：</text>
				<view v-for="(record, index) in dsRangeResult" :key="index" class="record-item">
					<text>{{record.title || record.song_id}} ({{record.ds}}) - {{record.achievements}}%</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import SongService from '@/utils/songService.js'
import playerRecordService from '@/utils/PlayerRecordService.js'
import * as maiApi from '../../api/maiapi.js'
import {onLoad} from '@dcloudio/uni-app'

// 响应式变量声明
const song = ref('')
const songService = ref(null)
const versionSearchResult = ref([])
const dsSearchResult = ref([])
const combinedSearchResult = ref([])
const sortResult = ref([])
const versionStats = ref(null)
const dsRangeResult = ref([])

// 正确使用 onMounted 钩子
onMounted(() => {
	console.log('初始化 SongService')
	const musicList = uni.getStorageSync('musicData')
	const playerData = uni.getStorageSync('divingFish_records')
	console.log(playerData)
	songService.value = new SongService(musicList)
	playerRecordService.initPlayerData(playerData.data)
	song.value = songService.value.getSongById('8')
})

// 更改歌曲方法
const changeSongValue = (e) => {
	console.log('测试 getSongById:', e.detail.value)
	if (songService.value) {
		song.value = songService.value.getSongById(e.detail.value)
	}
}

// 测试按版本搜索
const testGetSongsByVersion = (version, options = {}) => {
	console.log('测试 getSongsByVersion:', { version, options })
	if (songService.value) {
		versionSearchResult.value = songService.value.getSongsByVersion(version, options)
	}
}

// 测试按定数范围搜索
const testGetSongsByDs = (dsRange, options = {}) => {
	console.log('测试 getSongsByDs:', { dsRange, options })
	if (songService.value) {
		dsSearchResult.value = songService.value.getSongsByDs(dsRange, options)
	}
}

// 测试组合搜索
const testSearchSongs = (query, options = {}) => {
	console.log('测试 searchSongs:', { query, options })
	if (songService.value) {
		combinedSearchResult.value = songService.value.searchSongs(query, options)
	}
}

// 测试按RA排序
const testSortByRa = () => {
	sortResult.value = playerRecordService.getTopRaRecords(10)
}

// 测试按达成率排序
const testSortByAchievements = () => {
	sortResult.value = playerRecordService.getTopAchievementsRecords(10)
}

// 测试版本统计
const testVersionStats = (version) => {
	if (songService.value) {
		versionStats.value = playerRecordService.getVersionPlayStats(songService.value, version)
	}
}

// 测试定数范围成绩
const testDsRangeRecords = (min, max) => {
	if (songService.value) {
		dsRangeResult.value = playerRecordService.getBestRecordsByDs(
			songService.value,
			{ min, max },
			{ limit: 10 }
		)
	}
}
</script>

<style lang="scss">
.container {
	padding: 20rpx;
}

.test-section {
	margin-bottom: 40rpx;
	border: 1px solid #ddd;
	padding: 20rpx;
	border-radius: 10rpx;

	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
		color: #333;
	}

	input {
		width: 80%;
		padding: 10rpx;
		border: 2rpx solid #666;
		border-radius: 6rpx;
		margin-bottom: 20rpx;
	}

	.button-group {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
		margin-bottom: 20rpx;

		button {
			background-color: #4CAF50;
			color: white;
			padding: 20rpx;
			border-radius: 6rpx;
			border: none;
			
			&:active {
				background-color: #45a049;
			}
		}
	}

	.result {
		margin-top: 20rpx;
		padding: 20rpx;
		background-color: #f5f5f5;
		border-radius: 6rpx;

		text {
			display: block;
			word-break: break-all;
			
			&:first-child {
				font-weight: bold;
				margin-bottom: 10rpx;
			}
		}
	}
}
</style>
