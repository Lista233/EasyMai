<template>
	<view class="container">
		<view class="test-section">
			<text class="section-title">按ID搜索测试</text>
			<input @blur="(e)=>changeSongValue(e)" placeholder="输入歌曲ID"> </input>
			<view class="result">
				<text>结果：</text>
				<text>{{song}}</text>
			</view>
		</view>

		<view class="test-section">
			<text class="section-title">按版本搜索测试</text>
			<view class="button-group">
				<button @click="testGetSongsByVersion('maimai')">搜索maimai版本</button>
				<button @click="testGetSongsByVersion(['maimai', 'deluxe'])">搜索多个版本</button>
				<button @click="testGetSongsByVersion('mai', { exact: false })">模糊搜索版本</button>
			</view>
			<view class="result">
				<text>结果：</text>
				<text>{{versionSearchResult}}</text>
			</view>
		</view>

		<view class="test-section">
			<text class="section-title">按定数范围搜索测试</text>
			<view class="button-group">
				<button @click="testGetSongsByDs({ min: 12, max: 13 })">搜索12-13定数</button>
				<button @click="testGetSongsByDs({ min: 7, max: 8 }, { difficulty: 1 })">搜索进阶7-8定数</button>
				<button @click="testGetSongsByDs({ min: 10 })">搜索定数≥10</button>
			</view>
			<view class="result">
				<text>结果：</text>
				<text>{{dsSearchResult}}</text>
			</view>
		</view>

		<view class="test-section">
			<text class="section-title">组合搜索测试</text>
			<view class="button-group">
				<button @click="testSearchSongs({
					version: 'maimai',
					dsRange: { min: 12, max: 13 }
				})">maimai版本12-13定数</button>
				<button @click="testSearchSongs({
					version: 'maimai',
					dsRange: { min: 7, max: 8 }
				}, { difficulty: 1 })">maimai版本进阶7-8定数</button>
			</view>
			<view class="result">
				<text>结果：</text>
				<text>{{combinedSearchResult}}</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import SongService from '@/utils/songService.js'
import * as maiApi from '../../api/maiapi.js'
import {onLoad} from '@dcloudio/uni-app'

// 响应式变量声明
const song = ref('')
const songService = ref(null)
const versionSearchResult = ref([])
const dsSearchResult = ref([])
const combinedSearchResult = ref([])

// 正确使用 onMounted 钩子
onMounted(() => {
	console.log('初始化 SongService')
	const musicList = uni.getStorageSync('musicData')
	// 初始化 songService
	songService.value = new SongService(musicList)
	// 获取歌曲信息
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
