<template>
	<view class="webview-container">
		<web-view :src="url" @message="handleMessage" @onPostMessage="handlePostMessage"></web-view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const url = ref('https://map.bemanicn.com/')

// 处理消息
const handleMessage = (event) => {
	console.log('收到消息:', event.detail)
}

// 处理 postMessage
const handlePostMessage = (event) => {
	console.log('收到 postMessage:', event.detail)
}

onLoad((options) => {
	// 如果有传入 url 参数，则使用传入的 url
	if (options && options.url) {
		url.value = decodeURIComponent(options.url)
	}
})
</script>

<style>
.webview-container {
	width: 100%;
	height: 100vh;
}
</style>
