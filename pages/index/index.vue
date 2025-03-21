<template>
	<view id='index'>
		<view class="nav-container"
			 v-for="item of routelist"
			 @click="navTo(item)">
			<text>{{getName(item)}}</text>
		</view>
	</view>
</template>

<script setup>
import { reactive, ref } from 'vue';
	const routelist=ref([]);
	routelist.value=[
		'/pages/webview/webview',
		//'/pages/maiupdate/maiupdate',
		'/pages/maiupdate/maib50',
		//'/pages/song-detail/song-detail',
		'/pages/song-search/song-search',
		'/pages/Test/Test',
		'/pages/user-center/user-center',
		'/pages/login/login',
		'/pages/PlayerRecords/PlayerRecords',
		'/pages/song-recommend/song-recommend',
		'/pages/bilibili/bilibili',
		'/pages/chart-stats/chart-stats'
	]
	
	function navTo(url)
	{
		console.log(url);
		uni.navigateTo({
			url:url,
		})
	}
	function getName(url)
	{
		let lastindex=url.lastIndexOf('/')
		return url.substring(lastindex+1)
	}
</script>

<style lang="scss">
 #index{
	 display: flex;
	 flex-wrap:wrap;
	 justify-content: space-around;
	 align-items:center;
	 gap: 10rpx;
	 
	 .nav-container{
		 max-height: 200rpx;
		 	 margin-bottom:20 rpx;
		 padding: 40rpx;
		 background-color: palevioletred;
		 
		 text{
			 font-size: 40rpx;
			 color: white;
		 }
	 }
 }
</style>
