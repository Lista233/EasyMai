<template>
	
	<input @blur="(e)=>changeSongValue(e)"> </input>
	<view>
		{{song}}
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
	
	// 正确使用 onMounted 钩子
	onMounted(() => {
		const musicList = uni.getStorageSync('musicData')
		// 初始化 songService
		songService.value = new SongService(musicList)
		// 获取歌曲信息
		song.value = songService.value.getSongById('8')
	})
	
	// 更改歌曲方法
	const changeSongValue = (e) => {
		console.log(e)
		if (songService.value) {
			song.value = songService.value.getSongById(e.detail.value)
		}
	}

</script>

<style lang="scss">

input {
	width: 80%;
	padding: 10rpx;
	border: 5px solid slateblue;
}

</style>
