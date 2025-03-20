<template>
	<view class="webview-container">
		<web-view :src="url" @message="handleMessage" @onPostMessage="handlePostMessage" @downloadComplete="handleDownloadComplete"></web-view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const url = ref('https://lista233.lanzouk.com/EasyMai')

// 处理消息
const handleMessage = (event) => {
	console.log('收到消息:', event.detail)
	// 检查是否为下载完成消息
	if (event.detail && event.detail.type === 'downloadComplete') {
		handleDownloadComplete(event.detail.data)
	}
}

// 处理 postMessage
const handlePostMessage = (event) => {
	console.log('收到 postMessage:', event.detail)
}

// 处理下载完成
const handleDownloadComplete = (fileInfo) => {
	// #ifdef APP-PLUS
	uni.showModal({
		title: '下载完成',
		content: '新版本已下载完成，是否立即安装？',
		success: (res) => {
			if (res.confirm) {
				// 安装应用
				plus.runtime.install(
					fileInfo.tempFilePath, 
					{
						force: false
					},
					() => {
						console.log('安装成功');
						plus.runtime.restart(); // 安装成功后重启应用
					},
					(error) => {
						console.error('安装失败:', error);
						uni.showToast({
							title: '安装失败',
							icon: 'none'
						});
					}
				);
			}
		}
	});
	// #endif
}

// 监听下载进度
const listenDownloadProgress = () => {
	// #ifdef APP-PLUS
	plus.downloader.enumerate(function(downloaders) {
		downloaders.forEach((downloader) => {
			downloader.addEventListener('statechanged', function(download, status) {
				switch (download.state) {
					case 4: // 下载完成
						handleDownloadComplete({
							tempFilePath: download.filename,
							statusCode: 200
						});
						break;
					case 3: // 下载失败
						uni.showToast({
							title: '下载失败，请重试',
							icon: 'none'
						});
						break;
				}
			});
		});
	});
	// #endif
}

onLoad((options) => {
	// 如果有传入 url 参数，则使用传入的 url
	if (options && options.url) {
		url.value = decodeURIComponent(options.url)
	}
	
	// 开始监听下载进度
	listenDownloadProgress()
})
</script>

<style>
.webview-container {
	width: 100%;
	height: 100vh;
}
</style>
