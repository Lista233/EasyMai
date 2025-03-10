<template>
	<view class="record-card" @click.stop>
		<text class="song-id" selectable>ID:{{record.song_id}}</text>
		<!-- 封面图片部分 -->
		<view class="song-cover-container">
			<text class="index-number" selectable>No.{{index}}</text>
			<view class="song-cover">
				<image 
					class="cover-image" 
					:class="[
						'level-' + record.level_index,
						
					]" 
					:src="getCoverUrl(record.song_id)" 
					mode="aspectFill"
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
					<text class="stat-item fc-fs">
						{{formatCombo(record.fc)}} | {{formatFS(record.fs)}}
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
	import {getCoverUrl} from '../../util/coverManager.js'
	import {defineProps, reactive, computed} from 'vue'

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

	// 根据连击情况返回对应的样式类
	const getComboClass = (fc, fs) => {
		if (fs?.includes('ap')) return 'all-perfect'
		if (fs?.includes('fs')) return 'full-sync'
		if (fc?.includes('fc')) return 'full-combo'
		return 'normal'
	}

	// 格式化连击显示
	const formatCombo = (fc) => {
		return fc?.replace('p', '+') || ''
	}

	// 格式化FS显示
	const formatFS = (fs) => {
		return fs?.replace('p', '+')
			.replace('ap', 'ap')
			.replace('app', 'ap+')
			.replace('sync', 'sc') || ''
	}

	// 获取评级徽章样式
	const getRateBadgeClass = (rate) => {
		return {
			'rainbow': rate?.includes('sss'),
			'gold': rate?.includes('ss') && !rate?.includes('sss'),
			'silver': rate?.includes('s') && !rate?.includes('ss'),
		}
	}

	// 格式化评级显示
	const formatRate = (rate) => {
		return rate?.endsWith('p') ? rate.slice(0, -1) + '+' : rate
	}
</script>

<style lang="scss">
.record-card {
	position: relative;
	width: 100%;

	background: white;
	border-radius: 20rpx;
	padding: 44rpx;
	padding-top:65rpx ;
	padding-bottom:65rpx ;
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
			flex-wrap: wrap;
			gap: 12rpx 16rpx;
			
			.stat-item {
				font-size: 28rpx;
				padding: 4rpx 12rpx;
				border-radius: 6rpx;
				background: #f8fafc;
				
				&.achievements {
					color: #ffa502;
					font-weight: 600;
					background: rgba(255, 165, 2, 0.1);
				}
				
				&.ra {
					color: #2196F3;
					font-weight: 600;
					background: rgba(33, 150, 243, 0.1);
				}
			}

			.fc-fs-container {
				width: 100%;
				
				.fc-fs {
					color: #2ecc71;
					font-weight: 500;
					background: rgba(46, 204, 113, 0.1);
					width: fit-content;
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
		
		&.rainbow {
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
		}
		
		&.gold {
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