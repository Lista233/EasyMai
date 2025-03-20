<template>
	<view class="webview-container">
		<web-view :src="url" @message="handleMessage" @onPostMessage="handlePostMessage"></web-view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

// 默认URL
const defaultUrl = 'https://map.bemanicn.com/'
const url = ref(defaultUrl)

// 处理消息
const handleMessage = (event) => {
	console.log('收到消息:', event.detail)
}

// 处理 postMessage
const handlePostMessage = (event) => {
	console.log('收到 postMessage:', event.detail)
}

// 页面加载时处理参数
onLoad((options) => {
	if (options) {
		// 如果有传入 url 参数，直接使用
		if (options.url) {
			url.value = decodeURIComponent(options.url)
		}
		
		// 如果有标题参数，设置页面标题
		if (options.title) {
			uni.setNavigationBarTitle({
				title: decodeURIComponent(options.title)
			})
		}
	}
})
</script>

<style>
.webview-container {
	width: 100%;
	height: 100vh;
}
</style>
