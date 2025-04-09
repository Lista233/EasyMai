<template>
	<view class="record-card" :class="{ 'dark-mode': isDarkMode }" @click.stop >
		<text class="song-id" selectable>ID:{{record.song_id}}</text>
		<!-- 封面图片部分 -->
		<view class="song-cover-container">
			<text class="index-number" selectable>No.{{index+1}}</text>
			<view class="song-cover">
				<image 
					class="cover-image" 
					:class="[
						'level-' + record.level_index,
						
					]" 
					:src="getCoverUrl(record.song_id)" 
					mode="aspectFill"
					@click.stop="navigateToSongDetail(record.song_id,record.level_index)"
				></image>
				<view class="ds-tag" :class="[
					'level-' + record.level_index,
					
				]">
					<text class="ds-value">{{Number(record.ds).toFixed(1)}}</text>
				</view>
			</view>
		</view>
		
		<!-- 歌曲信息部分 -->
		<view class="song-info">
			<view class="title-row">
				<view class="title-container">
					<text class="song-title" :style="computedTitleStyle" selectable>{{record.title}}</text>
				</view>
			</view>
			<view class="song-stats">
				<text class="stat-item achievements" :class="getAchievementClass(record.achievements)">
					{{Number(record.achievements).toFixed(4)}}%
				</text>
		
				<text class="stat-item ra" :class="getRatingClass(record.ra)">
					Rating: {{record.ra}}
				</text>

				<view class="fc-fs-container">
					<text class="fc-fs" :class="record.fc ? getFcClass(record.fc) : 'fc-none'">
						{{record.fc ? formatCombo(record.fc) : '-'}}
					</text>
					<text class="fc-fs" :class="record.fs ? getFsClass(record.fs) : 'fs-none'">
						{{record.fs ? formatFS(record.fs) : '-'}}
					</text>
				</view>
			</view>
		</view>

		<!-- 评级徽章 -->
		<text class="rate-badge" :class="getRateBadgeClass(record.rate)" selectable>
			{{formatRate(record.rate)}}
		</text>
	</view>
</template>

<script setup>
	import {getCoverUrl} from '../../utils/coverManager.js'
	import {defineProps, reactive, computed,inject,ref} from 'vue'
    const isDarkMode = inject('isDarkMode');
	const props = defineProps(['record', 'index'])
	const record = reactive({
		achievements: 0,
		ds: 0,
		dxScore: 0,
		fc: '',
		fs: '',
		level: 0,
		level_index: 0,
		level_label: '',
		ra: 0,
		rate: '',
		song_id: 0,
		title: '',
		type: '',
		...props.record
	})

	// 添加跳转到歌曲详情页的方法
	const navigateToSongDetail = (songId,difficulty) => {
		if (!songId) return;
		
		uni.navigateTo({
			url: `/pages/song-detail/song-detail?songId=${songId}&difficulty=${difficulty}`,
			animationType: 'pop-in',
			animationDuration: 200
		});
	}

	// 计算标题样式
	const computedTitleStyle = computed(() => {
		const title = record.title;
		if (!title) return { fontSize: '36rpx' };
		
		// 计算全角字符数（中文、日文、韩文等）
		const fullWidthCount = title.match(/[\u4e00-\u9fff\u3040-\u30ff\u3130-\u318f]/g)?.length || 0;
		// 计算其他字符数
		const halfWidthCount = title.length - fullWidthCount;
		// 计算等效字符长度（全角字符算2，半角字符算1）
		const effectiveLength = fullWidthCount * 2 + halfWidthCount;
		
		// 基准长度为16（相当于8个全角字符）
		const baseLength = 24;
		
		if (effectiveLength <= baseLength) {
			return { fontSize: '32rpx' };
		} else {
			// 动态计算字体大小
			const ratio = baseLength / effectiveLength;
			const fontSize = Math.max(8, Math.floor(32 * ratio)); // 最小字号24rpx
			return { 
				fontSize: `${fontSize}rpx`,
				transition: 'font-size 0.2s ease' // 添加平滑过渡
			};
		}
	});

	// 根据成绩返回对应的样式类
	const getAchievementClass = (achievement) => {
		if (achievement >= 100.5) return 'sssp'
		if (achievement >= 100.0) return 'sss'
		if (achievement >= 99.5) return 'ssp'
		if (achievement >= 99.0) return 'ss'
		if (achievement >= 98.0) return 'sp'
		if (achievement >= 97.0) return 's'
		return 'normal'
	}

	// 根据Rating返回对应的样式类
	const getRatingClass = (ra) => {
		if (ra >= 15000) return 'rainbow'
		if (ra >= 14500) return 'bright-gold'
		if (ra >= 14000) return 'gold'
		if (ra >= 13000) return 'blue'
		if (ra >= 12000) return 'copper'
		return 'default'
	}

	// 获取FC类样式
	const getFcClass = (fc) => {
		if (!fc) return '';
		
		if (fc.includes('app')) return 'fc-app';
		if (fc.includes('ap')) return 'fc-ap';
		if (fc.includes('fcp')) return 'fc-fcp';
		if (fc.includes('fc')) return 'fc-fc';
		
		return '';
	}
	
	// 获取FS类样式
	const getFsClass = (fs) => {
		if (!fs) return '';
		
		if (fs.includes('fsdp')) return 'fs-fsdp';
		if (fs.includes('fsd')) return 'fs-fsd';
		if (fs.includes('fsp')) return 'fs-fsp';
		if (fs.includes('fs')) return 'fs-fs';
		if (fs.includes('sync')) return 'fs-sc';
		
		return '';
	}

	// 格式化连击显示
	const formatCombo = (fc) => {
		if (!fc) return '';
		
		if (fc.includes('app')) return 'AP+';
		if (fc.includes('ap')) return 'AP';
		if (fc.includes('fcp')) return 'FC+';
		if (fc.includes('fc')) return 'FC';
		
		return fc;
	}

	// 格式化FS显示
	const formatFS = (fs) => {
		if (!fs) return '';
		
		if (fs.includes('fsdp')) return 'FSD+';
		if (fs.includes('fsd')) return 'FSD';
		if (fs.includes('fsp')) return 'FS+';
		if (fs.includes('fs')) return 'FS';
		if (fs.includes('sync')) return 'SC';
		
		return fs;
	}

	// 获取评级徽章样式
	const getRateBadgeClass = (rate) => {
		if (!rate) return '';
		
		if (rate === 'sssp' || rate === 'sss+') {
			return 'rainbowp'; // SSS+ 深彩色
		} else if (rate === 'sss') {
			return 'rainbow'; // SSS 淡彩色
		} else if (rate?.includes('ss')) {
			return 'gold'; // SS/SS+ 金色
		}
		return '';
	}

	// 格式化评级显示
	const formatRate = (rate) => {
		return rate?.endsWith('p') ? rate.slice(0, -1) + '+' : rate
	}
</script>

<style lang="scss">
@import './dark-record-card.scss';
.record-card {
	position: relative;
	width: 100%;
	background: white;
	border-radius: 20rpx;
	padding: 44rpx;
	padding-top: 65rpx;
	padding-bottom: 65rpx;
	box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.1);
	display: flex;
	gap: 48rpx;
	box-sizing: border-box;
	align-items: center;
	animation: slideUp 0.2s ease-out;

	.song-id {
		position: absolute;
		top: 30rpx;
		left: 65rpx;
		font-size: 28rpx;
		color: #94a3b8;
		font-weight: 500;
		z-index: 1;
	}

	.song-cover-container {
		display: flex;
		flex-direction: column;
		gap: 8rpx;
		flex-shrink: 0;
		width: 200rpx;
		position: relative;
		
		.index-number {
			position: absolute;
			font-size: 28rpx;
			color: #94a3b8;
			bottom: -65rpx;
			left: 0rpx;
			z-index: 1;
		}

		.song-cover {
			position: relative;
			width: 200rpx;
			height: 200rpx;

			.cover-image {
				width: 100%;
				height: 100%;
				border-radius: 16rpx;
				border: 6rpx solid transparent;
				box-sizing: border-box;
				box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
				cursor: pointer;
				transition: transform 0.2s ease;
				
				&:hover {
					transform: scale(1.05);
				}
				
				&:active {
					transform: scale(0.95);
				}
				
				&.level-0 {
					border-color: rgba(46, 204, 113, 1);
					box-shadow: 0 2rpx 8rpx rgba(46, 204, 113, 0.5);
				}
				
				&.level-1 {
					border-color: rgba(241, 196, 15, 1);
					box-shadow: 0 2rpx 8rpx rgba(241, 196, 15, 0.5);
				}
				
				&.level-2 {
					border-color: rgba(231, 76, 60, 1);
					box-shadow: 0 2rpx 8rpx rgba(231, 76, 60, 0.5);
				}
				
				&.level-3 {
					border-color: rgba(155, 89, 182, 1);
					box-shadow: 0 2rpx 8rpx rgba(155, 89, 182, 0.5);
				}
				
				&.level-4 {
					border-color: rgba(190, 170, 245, 1);
					box-shadow: 0 2rpx 8rpx rgba(190, 170, 245, 0.5);
				}
			}

			.ds-tag {
				position: absolute;
				bottom: -10rpx;
				right: -10rpx;
				padding: 8rpx 16rpx;
				border-radius: 10rpx;
				font-size: 28rpx;
				font-weight: bold;
				color: white;
				box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.2);
				
				&.level-0 {
					background: rgba(46, 204, 113, 1);
					box-shadow: 0 2rpx 8rpx rgba(46, 204, 113, 0.5);
				}
				
				&.level-1 {
					background: rgba(241, 196, 15, 1);
					box-shadow: 0 2rpx 8rpx rgba(241, 196, 15, 0.5);
				}
				
				&.level-2 {
					background: rgba(231, 76, 60, 1);
					box-shadow: 0 2rpx 8rpx rgba(231, 76, 60, 0.5);
				}
				
				&.level-3 {
					background: rgba(155, 89, 182, 1);
					box-shadow: 0 2rpx 8rpx rgba(155, 89, 182, 0.5);
				}
				
				&.level-4 {
					background: rgba(190, 170, 245, 1);
					box-shadow: 0 2rpx 8rpx rgba(190, 170, 245, 0.5);
				}
			}
		}
	}

	.song-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 20rpx;
		max-width: calc(100% - 248rpx);
		transform: translateY(-3%);

		.title-row {
			display: flex;
			align-items: flex-start;
			gap: 16rpx;
			width: 100%;
			
			.title-container {
				flex: 1;
				min-width: 0;
				max-width: 100%;
				display: flex;
				align-items: center;
				overflow: hidden;
				
				.song-title {
					font-weight: 600;
					color: #1e293b;
					line-height: 1.2;
					width: 100%;
					white-space: normal;
					overflow: hidden;
					text-overflow: ellipsis;
					padding-top: 4rpx;
				}
			}
		}

		.song-stats {
			display: flex;
			flex-direction: column;
			gap: 8rpx;
			width: 100%;
			
			.stat-item {
				font-size: 28rpx;
				padding: 4rpx 12rpx;
				border-radius: 6rpx;
				background: #f8fafc;
				text-align: center;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
				box-sizing: border-box;
				width: 100%;
				
				&.achievements {
					color: #ff9500;
					font-weight: 600;
					background-color: rgba(255, 149, 0, 0.1);
					padding: 4rpx 10rpx;
					border-radius: 6rpx;
					box-shadow: 0 1px 2px rgba(255, 149, 0, 0.15);
				}
				
				&.ra {
					color: #6366f1;
					font-weight: 600;
					background-color: rgba(99, 102, 241, 0.1);
					padding: 4rpx 10rpx;
					border-radius: 6rpx;
					box-shadow: 0 1px 2px rgba(99, 102, 241, 0.15);
				}
			}

			.fc-fs-container {
				display: grid;
				grid-template-columns: 1fr 1fr;
				grid-gap: 8rpx;
				width: 100%;
				
				.fc-fs {
					width: 100%;
					text-align: center;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
					box-sizing: border-box;
					padding: 4rpx 10rpx;
					border-radius: 6rpx;
					font-weight: 500;
					
					&.fc-fc {
						color: #10b981;
						background-color: rgba(16, 185, 129, 0.1);
					}
					
					&.fc-fcp {
						color: #10b981;
						background-color: rgba(16, 185, 129, 0.1);
					}
					
					&.fc-ap {
						color: #f59e0b;
						background-color: rgba(245, 158, 11, 0.1);
					}
					
					&.fc-app {
						color: #f59e0b;
						background-color: rgba(245, 158, 11, 0.1);
					}
					
					&.fs-sc, &.fs-fs {
						color: #3b82f6;
						background-color: rgba(59, 130, 246, 0.1);
					}
					
					&.fs-fsp {
						color: #3b82f6;
						background-color: rgba(59, 130, 246, 0.1);
					}
					
					&.fs-fsd {
						color: #f59e0b;
						background-color: rgba(245, 158, 11, 0.1);
					}
					
					&.fs-fsdp {
						color: #f59e0b;
						background-color: rgba(245, 158, 11, 0.1);
					}
					
					// 添加无数据时的样式类
					&.fc-none {
						color: #94a3b8;
						background-color: rgba(148, 163, 184, 0.1);
					}
					
					&.fs-none {
						color: #94a3b8;
						background-color: rgba(148, 163, 184, 0.1);
					}
				}
			}
		}
	}

	.rate-badge {
		position: absolute;
		bottom: 24rpx;
		right: 24rpx;
		font-size: 32rpx;
		font-weight: 600;
		padding: 6rpx 16rpx;
		border-radius: 8rpx;
		color: #666;
		background: rgba(0, 0, 0, 0.05);
		text-shadow: 0 2px 3px rgba(0, 0, 0, 0.2);
		
		&.rainbow {
			/* SSS 淡彩色 */
			background: linear-gradient(45deg, 
				rgba(255, 69, 58, 0.85) 0%,
				rgba(255, 149, 0, 0.85) 20%,
				rgba(255, 204, 0, 0.85) 40%,
				rgba(52, 199, 89, 0.85) 60%,
				rgba(88, 86, 214, 0.85) 80%,
				rgba(255, 45, 85, 0.85) 100%
			);
			background-clip: text;
			-webkit-background-clip: text;
			color: transparent;
			font-weight: 700;
			text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		}
		
		&.rainbowp {
			/* SSS+ 深彩色 */
			background: linear-gradient(45deg, 
				#ff2d55 0%,
				#ff9500 20%,
				#ffcc00 40%,
				#34aadc 60%,
				#5856d6 80%,
				#ff2d55 100%
			);
			background-clip: text;
			-webkit-background-clip: text;
			color: transparent;
			font-weight: 800;
			text-shadow: 0 3px 5px rgba(0, 0, 0, 0.25);
		}
		
		&.gold {
			background: linear-gradient(45deg, 
				#ffd700,
				#ffa500,
				#ffd700
			);
			background-clip: text;
			-webkit-background-clip: text;
			color: transparent;
			font-weight: 800;
			text-shadow: 0 2px 3px rgba(245, 158, 11, 0.3);
		}
	}
}

@keyframes slideUp {
	from {
		transform: translateY(15%);
		opacity: 0.5;
	}
	to {
		transform: translateY(0);
		opacity: 1;
	}
}
</style>