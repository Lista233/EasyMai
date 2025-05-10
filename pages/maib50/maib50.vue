<template>
	<sp-html2canvas-render domId="index" ref="renderRef" @renderOver="handleRenderOver"></sp-html2canvas-render>
	<view id="index" :class="{'dark-mode': isDarkMode, 'screenshot-mode': isScreenshotMode}">
	
		<view class="button-group" v-if="!isLoading&&!isScreenshotMode">
			<!-- <button class="nav-btn bind-btn" v-show="jwt_token" @click="handleRefresh">刷新B50(不会生图)</button> -->
			<!-- <button class="save-btn" @click="saveAsImage()">保存为图片</button> -->
	<!-- 		<button class="nav-btn bind-btn" @click="toggleBindForm"> 
			<text class="btn-text">{{ jwt_token ? '账号设置' : '绑定账号' }}</text>
			</button> -->
			<!-- <button class="nav-btn bind-btn" v-show="jwt_token" @click="divingFishUpdate">更新成绩</button> -->
			
			<!-- 合并导入和分享按钮 -->
			<button class="share-import-btn" @click="showShareImportOptions">
				<text class="btn-text">分享/导入</text>
			</button>
			
			<!-- 保存B50图片按钮 -->
			<button class="save-image-btn" @click="saveB50AsImage" v-if="!isIOS">
				<text class="btn-text">保存图片</text>
			</button>
			
			<!-- 修改为单个历史记录按钮 -->
			<button class="history-btn" @click="showHistoryList">
				<text class="btn-text">{{ isViewingHistory ? '返回当前' : '历史记录' }}</text>
			</button>
		</view>
		
		<!-- 绑定账号表单（下拉式） -->
		<view class="bind-form" :class="{ 'bind-form-active': isBindFormVisible }">
			<view class="popup-content">
				<!-- 未登录状态 -->
				<template v-if="!isLoggedIn">
					<!-- 添加表单类型切换按钮 -->
					<view class="form-type-switch">
						<text 
							class="switch-btn" 
							:class="{ active: !isRegisterForm }"
							@click="isRegisterForm = false"
						>登录</text>
						<text 
							class="switch-btn" 
							:class="{ active: isRegisterForm }"
							@click="isRegisterForm = true"
						>注册</text>
					</view>
					
					<!-- 登录表单 -->
					<template v-if="!isRegisterForm">
						<view class="popup-title">绑定水鱼账号</view>
						<view class="input-group">
							<view class="input-item">
								<text class="input-label">用户名：</text>
								<input 
									type="text" 
									v-model="username" 
									placeholder="请输入水鱼查分器用户名"
									class="styled-input"
								/>
							</view>
							<view class="input-item">
								<text class="input-label">密码：</text>
								<input 
									type="password"
									v-model="password" 
									placeholder="请输入密码"
									class="styled-input"
								/>
							</view>
						</view>
						<view class="popup-buttons">
							<button class="form-btn cancel-btn" @click="toggleBindForm">取消</button>
							<button class="form-btn confirm-btn" @click="confirmBind">确定</button>
						</view>
					</template>
					
					<!-- 注册表单 -->
					<template v-else>
						<view class="popup-title">注册水鱼账号</view>
						<view class="input-group">
							<view class="input-item">
								<text class="input-label">用户名：</text>
								<input 
									type="text" 
									v-model="registerForm.username" 
									placeholder="请输入用户名"
									class="styled-input"
								/>
							</view>
							<view class="input-item">
								<text class="input-label">密码：</text>
								<input 
									type="password"
									v-model="registerForm.password" 
									placeholder="请输入密码"
									class="styled-input"
								/>
							</view>
							<view class="input-item">
								<text class="input-label">确认密码：</text>
								<input 
									type="password"
									v-model="registerForm.confirmPassword" 
									placeholder="请再次输入密码"
									class="styled-input"
								/>
							</view>
						</view>
						<view class="popup-buttons">
							<button class="form-btn cancel-btn" @click="toggleBindForm">取消</button>
							<button class="form-btn confirm-btn" @click="handleRegister">注册</button>
						</view>
					</template>
				</template>
				
				<!-- 已登录状态 -->
				<template v-else>
					<!-- <button class="logout-btn" @click="handleLogout">
						<text class="logout-icon">⎋登出</text>
								
					</button> -->
				<view class="login-contentbox">
			
					
					<view class="user-info">
						<view class="user-header">
							<view class="avatar-container">
								<view class="avatar">
									<image 
										v-if="userAvatar" 
										class="avatar-image" 
										:src="userAvatar" 
										mode="aspectFill"
									></image>
									<text v-else class="avatar-placeholder">👤</text>
								</view>
							</view>
							<view class="username">{{ username || '未设置用户名' }}</view>
							<view class="user-details">
								<view class="info-item">
									<text class="label">用户昵称：</text>
									<text class="value">{{ nickname || '您还未设置水鱼账号昵称' }}</text>
								</view>
								<view class="info-item">
									<text class="label">绑定QQ：</text>
									<text class="value">{{ qqid ? qqid : '您还未绑定QQ' }}</text>
								</view>
							</view>
						</view>
						
						<view class="action-buttons">
							<!-- <button class="action-btn qr-btn" @click="showQrCodeInput">
								<text class="btn-text">绑定二维码</text>
							</button>
							<button class="action-btn upload-btn" @click="divingFishUpdate">
								<text class="btn-text">更新成绩</text>
							</button> -->
							<button class="action-btn settings-btn" @click="openSettingsModal">
								<text class="btn-text">{{ jwt_token ? '账号信息' : '绑定账号' }}</text>
							</button>
						</view>
					</view>
				</view>
				</template>
			</view>
		</view>
		
		<!-- 添加加载状态指示器 -->
		<view class="loading-container" v-if="isLoading">
			<view class="loading-spinner"></view>
			<text class="loading-text">正在加载数据...</text>
		</view>
		
		<!-- 历史记录列表 - 当选择查看历史记录时显示 -->
		<view class="history-list-container" v-else-if="showHistoryModal">
			<view class="history-header">
				<text class="history-title">历史B50记录</text>
				<view class="return-btn" @click="closeHistoryModal">返回</view>
			 </view>
				<view class="history-header-buttons">
					<button class="history-action-btn" v-if="isViewingHistory" @click="returnToCurrentB50">
						<text class="btn-text">返回当前</text>
					</button>
					<button class="save-current-btn" v-if="b35?.length || b15?.length" @click="showSaveHistoryModal">
						<text class="save-btn-text">保存当前B50</text>
					</button>
				</view>
			
		
			
			<view class="history-list" v-if="historyRecords.length > 0">
				<view 
					v-for="(item, index) in historyRecords" 
					:key="index"
					class="history-item"
				>
					<view class="history-info" @click="viewHistoryRecord(item)">
						<text v-if="item.customName" class="history-nickname">{{ item.customName }}</text>
						<text v-else-if="item.isShared" class="history-nickname">来自分享的B50</text>
						<text v-else-if="item.nickname" class="history-nickname">{{ item.nickname }}</text>
						<text class="history-date">{{ formatDate(item.date) }}</text>
						<text class="history-rating">Rating: {{ item.totalRating }}</text>
		
					</view>
					<view class="history-actions">
						<text class="view-btn" @click="viewHistoryRecord(item)">查看</text>
						<text class="edit-btn" @click="showEditHistoryNameModal(item, index)">编辑</text>
						<text class="delete-btn" @click="deleteHistoryRecord(index)">删除</text>
					</view>
				</view>
			</view>
			
			<view class="empty-history" v-else>
				<text class="empty-text">暂无历史记录</text>
			</view>
			
		
		</view>
		

		
		<view class="b50box" id="b50Container" ref="b50Container" v-show="!isLoading">
			<!-- 历史B50查看状态提示 -->
			<view class="history-view-indicator" v-if="isViewingHistory&&!isScreenshotMode">
				<text class="history-view-text">正在查看历史记录: {{ formatDate(currentHistoryRecord.date) }}</text>
				<!-- <button class="return-to-current-btn" @click="returnToCurrentB50">
					<text class="return-btn-text">返回</text>
				</button> -->
			</view>
			
			<view v-if="(!getCurrentB35()?.length && !getCurrentB15()?.length) && !isViewingHistory&& !isLoading" class="empty-state" @click="handleEmptyStateClick">
				<view class="empty-icon">📊</view>
				<view class="empty-title">暂无数据</view>
				<view class="empty-text">{{ isLoggedIn ? '请先绑定二维码更新一次成绩后点击生成B50' : '请先登录水鱼账号' }}</view>
			</view>
			
			<view v-else>
				<!-- 添加用户昵称显示 -->
				<view class="b50-user-info"
				 v-show="isScreenshotMode">
					<text class="user-nickname" >玩家名:{{ getDisplayName() }}</text>
				</view>
				
				<view class="rating-container" :class="getCurrentRatingClass()" @click="handleRefresh">
					<view class="rating-title">总 Rating</view>
					<view class="rating-value">{{ getCurrentTotalRating() }}</view>
					<view class="rating-subtitle">B35:{{ getCurrentB35Rating() }} + B15:{{ getCurrentB15Rating() }}</view>
				</view>
				
				<view class="section-title" :class="{ 'has-data': getCurrentB35()?.length > 0 }">
					<view class="title-content">B35</view>
				</view>
				
				<view class="b35box">
					<view class="song-card" 
						v-for="(item,index) in getCurrentB35()" 
						@click="showRecordCard(item,index)"
					> 
						<view class="song-cover">
							<image class="cover-image" :class="'level-' + item.level_index" :src="item._coverBase64 || getCoverUrl(item.song_id)"></image>
							<view class="ds-tag" :class="'level-' + item.level_index">{{Number(item.ds).toFixed(1)}}</view>
						</view>
						<view class="song-info">
							<text class="song-title">{{item.title}}</text>
							<view class="song-stats">
								<text class="stat-item achievements">{{Number(item.achievements).toFixed(4)}}%</text>
								<text class="stat-item ra">Rating: {{item.ra}}</text>
								<view class="fc-fs-row">
									<view class="fc-container" v-if="item.fc">
										<text class="stat-item" :class="getFcClass(item.fc)">{{ formatCombo(item.fc) }}</text>
									</view>
									<view class="fs-container" v-if="item.fs">
										<text class="stat-item" :class="getFsClass(item.fs)">{{ formatFS(item.fs) }}</text>
									</view>
								</view>
							</view>
						</view>
						<text class="rate-badge" :class="{
							'rainbowp': item.rate?.includes('sssp'),
							'rainbow': item.rate?.includes('sss') && !item.rate?.includes('sssp'),
							'gold': item.rate?.includes('ss') && !item.rate?.includes('sss')
						}">{{item.rate?.endsWith('p') ? item.rate.slice(0, -1) + '+' : item.rate}}</text>
					</view>
				</view>
				
				<view class="section-title" :class="{ 'has-data': getCurrentB15()?.length > 0 }">
					<view class="title-content">B15</view>
				</view>
				<view class="b15box">
					<view class="song-card" 
						v-for="(item,index) in getCurrentB15()" 
						@click="showRecordCard(item,index)"
					> 
						<view class="song-cover">
							<image class="cover-image" :class="'level-' + item.level_index" :src="item._coverBase64 || getCoverUrl(item.song_id)"></image>
							<view class="ds-tag" :class="'level-' + item.level_index">{{Number(item.ds).toFixed(1)}}</view>
						</view>
						<view class="song-info">
							<text class="song-title">{{item.title}}</text>
							<view class="song-stats">
								<text class="stat-item achievements">{{Number(item.achievements).toFixed(4)}}%</text>
								<text class="stat-item ra">Rating: {{item.ra}}</text>
								<view class="fc-fs-row">
									<view class="fc-container" v-if="item.fc">
										<text class="stat-item" :class="getFcClass(item.fc)">{{ formatCombo(item.fc) }}</text>
									</view>
									<view class="fs-container" v-if="item.fs">
										<text class="stat-item" :class="getFsClass(item.fs)">{{ formatFS(item.fs) }}</text>
									</view>
								</view>
							</view>
						</view>
						<text class="rate-badge" :class="{
							'rainbowp': item.rate?.includes('sssp'),
							'rainbow': item.rate?.includes('sss') && !item.rate?.includes('sssp'),
							'gold': item.rate?.includes('ss') && !item.rate?.includes('sss')
						}">{{item.rate?.endsWith('p') ? item.rate.slice(0, -1) + '+' : item.rate}}</text>
					</view>
				</view>
			</view>
		</view>
		
	
		
		<!-- 设置表单弹窗 -->
		<view class="modal-container" v-if="showSettingsModal">
			<view class="modal-overlay"></view>
			<view class="modal-content">
				<view class="modal-title">修改设置</view>
				<view class="settings-form">
					<view class="form-item">
						<view class="label-with-help">
							<text class="help-icon" @click="showHelp('token')">ⓘ</text>
							<text class="form-label">导入令牌：</text>
						</view>
						<view class="input-with-button">
							<input 
								type="text"
								:value="importToken"
								readonly
								disabled
								class="form-input readonly"
							/>
							<button class="refresh-btn" @click="refreshImportToken">
								<text class="btn-icon">🔄</text>
							</button>
						</view>
					</view>
					<view class="form-item">
						<view class="label-with-help">
							<text class="help-icon" @click="showHelp('nickname')">ⓘ</text>
							<text class="form-label">昵称：</text>
						</view>
						<input 
							type="text"
							v-model="settingsForm.nickname"
							placeholder="请输入昵称"
							class="form-input"
						/>
					</view>
					<view class="form-item">
						<view class="label-with-help">
							<text class="help-icon" @click="showHelp('qq')">ⓘ</text>
							<text class="form-label">绑定QQ：</text>
						</view>
						<input 
							type="text"
							v-model="settingsForm.bind_qq"
							placeholder="请输入QQ号"
							class="form-input"
						/>
					</view>
					<view class="form-item">
						<view class="label-with-help">
							<text class="help-icon" @click="showHelp('channel')">ⓘ</text>
							<text class="form-label">频道UID：</text>
						</view>
						<input 
							type="text"
							v-model="settingsForm.qq_channel_uid"
							placeholder="请输入QQ频道UID"
							class="form-input"
						/>
					</view>
				</view>
				<view class="modal-buttons">
					<button class="modal-btn cancel" @click="showSettingsModal = false">取消</button>
					<button class="modal-btn confirm" @click="handleSettingsSubmit">确定</button>
				</view>
			</view>
		</view>

		<!-- 二维码输入弹窗 -->
		<view class="modal-container" v-if="showQrModal">
			<view class="modal-overlay" @click="closeQrModal"></view>
			<view class="modal-content qr-modal">
				<view class="modal-title">绑定二维码获取UID</view>
				<view class="qr-form">
					<view class="form-item">
						<view class="label-with-help">
							<text class="help-icon" @click="showHelp('qrcode')">ⓘ</text>
							<text class="form-label">二维码信息：</text>
						</view>
						<textarea 
							v-model="qrCodeInput"
							placeholder="进入舞萌公众号界面->点击玩家二维码->长按二维码识别->将字符串复制到此处"
							class="form-textarea"
							:maxlength="-1"
							:auto-height="true"
						/>
			<!-- 			<button class="import-btn" @click="chooseImage">
							<text class="btn-icon">📁</text>
							<text class="btn-text">从相册导入/扫码</text>
						</button> -->
					</view>
				</view>
				<view class="modal-buttons">
					<button class="modal-btn cancel" @click="closeQrModal">取消</button>
					<button class="modal-btn confirm" @click="handleQrCodeSubmit">确定</button>
				</view>
			</view>
		</view>

		<!-- 添加 record-card 弹窗 -->
		<view class="record-modal" v-if="showRecordModal" @click="closeRecordModal">
			<record-card 
				:record="selectedRecord.record" 
				:index="selectedRecord.index"
				class="record-modal-content"
			/>
		</view>

		<!-- 分享/导入选项弹窗 -->
		<view class="modal-container" v-if="showShareImportModal">
			<view class="modal-overlay" @click="closeShareImportModal"></view>
			<view class="modal-content share-import-modal">
				<view class="modal-title">B50分享/导入</view>
				<view class="options-buttons">
					<button class="option-btn share-option" @click="showShareB50Options" v-if="jwt_token && (b35?.length || b15?.length)">
						
						<view class="option-label">分享我的B50</view>
					</button>
					<button class="option-btn import-option" @click="showImportB50Options">
						
						<view class="option-label">导入他人B50</view>
					</button>
				</view>
				<view class="modal-buttons">
					<button class="modal-btn cancel" @click="closeShareImportModal">取消</button>
				</view>
			</view>
		</view>

		<!-- 分享B50弹窗 -->
		<view class="modal-container" v-if="showShareB50Modal">
			<view class="modal-overlay" @click="closeShareModal"></view>
			<view class="modal-content share-modal">
				<view class="modal-title">分享B50</view>
				<view class="share-content">
					<view class="form-item">
						<view class="label-with-help">
							<text class="form-label">分享码：</text>
						</view>
						<view class="share-code-container">
							<input 
								type="text"
								:value="shareB50Code"
								readonly
								class="form-input readonly"
							/>
							<button class="copy-btn" @click="copyShareCode">
								<text class="btn-icon">复制</text>
							</button>
						</view>
					</view>
				</view>
				<view class="modal-buttons">
					<button class="modal-btn cancel" @click="closeShareModal">关闭</button>
				</view>
			</view>
		</view>

		<!-- 导入B50弹窗 -->
		<view class="modal-container" v-if="showImportB50Modal">
			<view class="modal-overlay" @click="closeImportModal"></view>
			<view class="modal-content import-modal">
				<view class="modal-title">导入B50</view>
				<view class="import-form">
					<view class="form-item">
						<view class="label-with-help">
							<text class="form-label">分享码：</text>
						</view>
						<input
							v-model="importB50Code"
							placeholder="请输入由他人分享的B50码"
							class="form-textarea"
							:maxlength="-1"
						/>
					</view>
				</view>
				<view class="modal-buttons">
					<button class="modal-btn cancel" @click="closeImportModal">取消</button>
					<button class="modal-btn confirm" @click="handleImportB50">导入</button>
				</view>
			</view>
		</view>

		<!-- 保存历史记录弹窗（添加自定义名称） -->
		<view class="modal-container" v-if="showSaveHistoryNameModal">
			<view class="modal-overlay" @click="closeSaveHistoryNameModal"></view>
			<view class="modal-content">
				<view class="modal-title">保存历史记录</view>
				<view class="form-item">
					<text class="form-label">自定义名称(可选)：</text>
					<input 
						type="text"
						v-model="customHistoryName"
						placeholder="为这个B50记录添加名称"
						class="form-input"
						style="padding: 30rpx;"
					/>
				</view>
				<view class="modal-buttons">
					<button class="modal-btn cancel" @click="closeSaveHistoryNameModal">取消</button>
					<button class="modal-btn confirm" @click="confirmSaveHistory">保存</button>
				</view>
			</view>
		</view>

		<!-- 编辑历史记录名称弹窗 -->
		<view class="modal-container" v-if="showEditNameModal">
			<view class="modal-overlay" @click="closeEditNameModal"></view>
			<view class="modal-content">
				<view class="modal-title">编辑历史记录名称</view>
				<view class="form-item">
					<text class="form-label">自定义名称：</text>
					<input 
						type="text"
						v-model="editingHistoryName"
						placeholder="为这个B50记录添加名称"
						class="form-input"
						style="padding: 30rpx;"
					/>
				</view>
				<view class="modal-buttons">
					<button class="modal-btn cancel" @click="closeEditNameModal">取消</button>
					<button class="modal-btn confirm" @click="confirmEditHistoryName">保存</button>
				</view>
			</view>
		</view>
		
	
	</view>
	<!-- 添加加载提示对话框 -->
	<view class="loading-overlay" v-if="loading" :class="{'dark-mode': isDarkMode}">
		<view class="loading-content">
			<view class="loading-spinner"></view>
			<text class="loading-text">{{ loadingText }}</text>
		</view>
	</view>
</template>

<script setup>
	
	/*
	本地存储:
	mai接口相关：
	maiUid;
	maiPlayData
	水鱼相关:
	b50;
	musicData;
	chart_stats
	divingFish_qqid;
	divingFish_username;
	divingFish_nickname;
	divingFish_importToken;
	divingFish_records;
	qq_channel_uid;
	// 添加历史B50存储
	b50History;
	*/
// import * as fileutil from '../../util/fileutil.js'
import { computed, ref, onMounted, onUnmounted, nextTick, inject, watch, reactive } from 'vue';
import * as maiApi from "../../api/maiapi.js"
import { b50adapter } from '@/utils/b50adapter.js';
import {onReady,onLoad,onInit} from '@dcloudio/uni-app'
import {getCoverUrl, getCoverBase64, getBatchCoverBase64}  from '../../utils/coverManager.js'
import RecordCard from '../../components/record-card/record-card.vue'
import {updateNativeTabBar} from '@/utils/updateNativeTabBar.js'
// import html2canvas from 'html2canvas';  // 注释掉原来直接使用的html2canvas

// 导入base64ToPath方法
import { base64ToPath, pathToBase64, urlToBase64 } from '@/uni_modules/sp-html2canvas-render/utils/index.js';
// 导入sp-html2canvas-render组件
import SpHtml2canvasRender from '@/uni_modules/sp-html2canvas-render/components/sp-html2canvas-render/sp-html2canvas-render.vue'
// 注入深色模式变量
const isDarkMode = inject('isDarkMode');
const applyTheme = inject('applyTheme');
const systemInfo = uni.getSystemInfoSync();
const isIOS = systemInfo.osName === 'ios';
// const ossroute='https://lista233.oss-cn-beijing.aliyuncs.com/maicover/'
// const localroute= 'maicover';
// const suffix=ref('.jpg')



let b35=ref('')
let b15=ref('')
let b15rating=ref(0)
let b35rating=ref(0)

let username=ref('')
let password=ref('')
let nickname=ref('')
let qqid=ref('')
let importToken=ref('')
let qq_channel_uid=ref('')


let jwt_token = ref('');

let records=ref('')

let QrCode=ref('');
let uid=ref(-1);

let isProcessing=ref(false);

const hasLoadedB50 = ref(false);

// 添加加载状态
const isLoading = ref(true);

// 添加用户头像
const userAvatar = ref('../../static/maiicon/UI_Icon_409503.jpg');

// 添加历史B50相关变量
const showHistoryModal = ref(false);
const isViewingHistory = ref(false);
const historyRecords = ref([]);
const currentHistoryRecord = ref(null);

// 获取当前显示的B50数据（当前数据或历史数据）
const getCurrentB35 = () => {
	if (isViewingHistory.value && currentHistoryRecord.value) {
		return currentHistoryRecord.value.b35;
	}
	return b35.value;
};

const getCurrentB15 = () => {
	if (isViewingHistory.value && currentHistoryRecord.value) {
		return currentHistoryRecord.value.b15;
	}
	return b15.value;
};

const getCurrentB35Rating = () => {
	if (isViewingHistory.value && currentHistoryRecord.value) {
		return currentHistoryRecord.value.b35rating;
	}
	return b35rating.value;
};

const getCurrentB15Rating = () => {
	if (isViewingHistory.value && currentHistoryRecord.value) {
		return currentHistoryRecord.value.b15rating;
	}
	return b15rating.value;
};

const getCurrentTotalRating = () => {
	if (isViewingHistory.value && currentHistoryRecord.value) {
		return currentHistoryRecord.value.totalRating;
	}
	return b35rating.value + b15rating.value;
};

const getCurrentRatingClass = () => {
	const total = getCurrentTotalRating();
	if (total >= 15000) return 'rainbow';
	if (total >= 14500) return 'bright-gold';
	if (total >= 14000) return 'gold';
	if (total >= 13000) return 'blue';
	if (total >= 12000) return 'copper';
	return 'default';
};

// 格式化日期函数
const formatDate = (timestamp) => {
	const date = new Date(timestamp);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	
	return `${year}/${month}/${day} ${hours}:${minutes}`;
};

// 加载历史记录函数
const loadHistoryRecords = () => {
	try {
		const history = uni.getStorageSync('b50History') || [];
		historyRecords.value = history;
	} catch (error) {
		console.error('加载历史记录失败:', error);
		historyRecords.value = [];
	}
};

// 保存历史记录函数
const saveToHistory = (customNickname = null, customName = null, isShared = false) => {
	try {
		if (!b35.value.length && !b15.value.length) {
			uni.showToast({
				title: '没有数据可保存',
				icon: 'none'
			});
			return;
		}
		
		// 创建历史记录对象
		const historyRecord = {
			date: Date.now(),
			b35: JSON.parse(JSON.stringify(b35.value)),
			b15: JSON.parse(JSON.stringify(b15.value)),
			b35rating: b35rating.value,
			b15rating: b15rating.value,
			totalRating: b35rating.value + b15rating.value,
			nickname: customNickname || nickname.value, // 添加昵称字段
			customName: customName || '', // 添加自定义名称字段
			isShared: isShared // 标记是否为分享的B50
		};
		
		// 获取现有历史记录
		const history = uni.getStorageSync('b50History') || [];
		
		// 添加新记录
		history.unshift(historyRecord);
		
		// 限制历史记录数量最多为20条
		const MAX_HISTORY = 20;
		if (history.length > MAX_HISTORY) {
			history.splice(MAX_HISTORY);
		}
		
		// 保存到本地存储
		uni.setStorageSync('b50History', history);
		
		// 更新响应式数据
		historyRecords.value = history;
		
		uni.showToast({
			title: '已保存到历史记录',
			icon: 'success'
		});
		
		return historyRecord;
	} catch (error) {
		console.error('保存历史记录失败:', error);
		uni.showToast({
			title: '保存失败，请重试',
			icon: 'none'
		});
		return null;
	}
};

// 显示历史记录列表
const showHistoryList = () => {
	// 如果正在查看历史，则返回当前B50
	if (isViewingHistory.value) {
		returnToCurrentB50();
		return;
	}
	
	// 否则显示历史记录列表
	loadHistoryRecords();
	showHistoryModal.value = !showHistoryModal.value;
};

// 关闭历史记录列表
const closeHistoryModal = () => {
	showHistoryModal.value = false;
};

// 查看历史记录
const viewHistoryRecord = (record) => {
	currentHistoryRecord.value = record;
	isViewingHistory.value = true;
	showHistoryModal.value = false;
};

// 返回当前B50
const returnToCurrentB50 = () => {
	isViewingHistory.value = false;
	currentHistoryRecord.value = null;
};

// 删除历史记录
const deleteHistoryRecord = (index) => {
	uni.showModal({
		title: '确认删除',
		content: '确定要删除这条历史记录吗？',
		success: (res) => {
			if (res.confirm) {
				try {
					// 获取现有历史记录
					const history = uni.getStorageSync('b50History') || [];
					
					// 删除指定记录
					history.splice(index, 1);
					
					// 保存到本地存储
					uni.setStorageSync('b50History', history);
					
					// 更新响应式数据
					historyRecords.value = history;
					
					uni.showToast({
						title: '删除成功',
						icon: 'success'
					});
				} catch (error) {
					console.error('删除历史记录失败:', error);
					uni.showToast({
						title: '删除失败，请重试',
						icon: 'none'
					});
				}
			}
		}
	});
};

onLoad(async () => {
	console.log(1)
	// 设置加载状态
	isLoading.value = true;
	
	// 使用nextTick确保UI先渲染
	await nextTick();
	
	// 使用setTimeout让主线程先处理UI渲染
	setTimeout(async () => {
		try {
			// coverlist.value = await fileutil.getDirectoryFiles(localroute)
			qqid.value = uni.getStorageSync('divingFish_qqid');
			nickname.value = uni.getStorageSync('divingFish_nickname');
			importToken.value = uni.getStorageSync('divingFish_importToken');
			records.value = uni.getStorageSync('divingFish_records');
			uid.value = uni.getStorageSync('uid')
			username.value = uni.getStorageSync('divingFish_username')
			qq_channel_uid.value=uni.getStorageSync('qq_channel_uid')
			
			// 从本地缓存读取 rating
			b35rating.value = uni.getStorageSync('b35rating') || 0;
			b15rating.value = uni.getStorageSync('b15rating') || 0;
			
			// 加载历史记录
			loadHistoryRecords();
			
			//await initCoverList();
			console.log('nickname'+nickname.value)
			
			// 只在首次加载且用户已登录时执行
			await getb50local();
			
			jwt_token.value = uni.getStorageSync('divingFish_jwt_token');
			
			// 获取本地存储的头像
			userAvatar.value = uni.getStorageSync('user_avatar');
			if(!userAvatar.value)
			{
				userAvatar.value='../../static/maiicon/UI_Icon_409503.jpg'
			}
		} catch (error) {
			console.error('加载数据出错:', error);
		} finally {
			// 无论成功失败都关闭加载状态
			isLoading.value = false;
		}
	}, 100);
});

// let coverlist=ref([])

// const loadingImages = ref(new Set());

// const downloadingFiles = new Set();


// 控制绑定表单显示状态
const isBindFormVisible = ref(false);

// 添加登录状态计算属性
const isLoggedIn = computed(() => jwt_token.value)

// 添加 jwt_token 的响应式引用


// 切换绑定表单显示状态
function toggleBindForm() {
	if (!isLoggedIn.value) {
		// 未登录状态下重置输入
		username.value = '';
		password.value = '';
		registerForm.value = {
			username: '',
			password: '',
			confirmPassword: ''
		};
		isRegisterForm.value = false;
	}
	isBindFormVisible.value = !isBindFormVisible.value;
}

const showQrModal = ref(false);
const qrCodeInput = ref('');

function showQrCodeInput() {
	uni.showModal({
		title:'绑定须知',
		content:'为了您的舞萌账号安全，玩家信息仅会在本地保存，不会上传至任何地方，退出登录后失效。且获取账号信息的功能与水鱼网站无关，最终解释权归开发者所有。',
		confirmText:'接受并继续',
		success:(res)=>{if(res.confirm)
		{
		showQrModal.value = true; 	
		qrCodeInput.value = '';	}
		}
	})

}
function closeQrModal(){showQrModal.value = false;}
async function handleQrCodeSubmit() {
	if (!qrCodeInput.value) {
		uni.showToast({
			title: '请输入二维码信息',
			icon: 'none'
		});e
		return;
	}
	
	try {
		QrCode.value = qrCodeInput.value;
		
		await getUid();
		
		showQrModal.value = false;
		
		
	} catch (error) {
		console.error('绑定失败:', error);
		uni.showToast({
			title: '绑定失败，请重试',
			icon: 'none'
		});
	}
}

async function getUid(){
		if(isProcessing.value) return;
		isProcessing.value = true;
		
		try {
			let resp=await maiApi.maiGetUid(QrCode.value)
			let tempuid=resp.data.userID
		
			if(tempuid==-1){
				uni.showToast({
					title:'您的二维码不合法或已过期',
					icon:'none',
					position:"center"
				})
			} else {
				
				uid.value=tempuid;
				uni.setStorageSync("uid",uid.value)
			 
			return;
			}
		} catch (error) {
			uni.showToast({
				title:'网络错误，请重试',
				icon:'none',
				position:"center"
			})
		} finally {
			isProcessing.value = false;
		}
	}
// 确认绑定
async function setProfile(jwt_token)
{
	
	let profile = (await maiApi.divingFishGetProfile(jwt_token)).data;
	nickname.value=profile.nickname;
	qqid.value=profile.bind_qq;
	importToken.value=profile.import_token;
	qq_channel_uid.value=profile.qq_channel_uid;
	uni.setStorageSync('divingFish_nickname',nickname.value)
	uni.setStorageSync('divingFish_qqid',qqid.value)
	uni.setStorageSync('divingFish_importToken',importToken.value)
	uni.setStorageSync('qq_channel_uid',profile.qq_channel_uid)
	records.value=await maiApi.divingFishGetRecords(jwt_token.value)
	console.log(records.value)
	uni.setStorageSync('divingFish_records',records.value)
	
}
async function confirmBind() {
	if (!password.value || !username.value) {
		uni.showToast({
			title: '请填写完整信息',
			icon: 'none'
		});
		return;
	}
	
	try {
		let res = await maiApi.divingFishLogin(username.value, password.value);
		let headerCookie = res.header['set-cookie'];
		jwt_token.value = headerCookie.split(';', 1)[0].split('=')[1];
		console.log(jwt_token.value)
		// 保存 jwt_token 到本地存储
		uni.setStorageSync('divingFish_jwt_token', jwt_token.value);
	    uni.setStorageSync('divingFish_username', username.value);
		console.log(nickname.value)
		setProfile(jwt_token.value);
		
		// 登录成功后自动生成B50
		await getb50();
		// 关闭表单
		//isBindFormVisible.value = false;
	} catch (error) {
		console.error('登录失败:', error);
		uni.showToast({
			title: '登录失败，请重试',
			icon: 'none'
		});
	}
}

// 处理刷新按钮点击
async function handleRefresh() {
	try {
		await getb50();
		// 添加刷新成功的弹窗提示
		uni.showToast({
			title: '刷新成功',
			icon: 'success',
			duration: 2000
		});
	} catch (error) {
		console.error('刷新失败:', error);
		uni.showToast({
			title: '刷新失败，请重试',
			icon: 'none',
			duration: 2000
		});
	}
}

// 页面加载时检查本地存储并自动获取数据


const totalRating = computed(() => b35rating.value + b15rating.value)

const getRatingClass = () => {
    const total = totalRating.value;
    if (total >= 15000) return 'rainbow';
    if (total >= 14500) return 'bright-gold';
    if (total >= 14000) return 'gold';
    if (total >= 13000) return 'blue';
    if (total >= 12000) return 'copper';
    return 'default';
}
	async function getUserMusicData(){
		let resp=await maiApi.maiGetUserMusicData(uid.value)
		console.log(resp)
		uni.setStorageSync('',resp.data)
		if(resp.data.userId==null)
		 {
			return null;
		 }
		let a=await b50adapter(resp.data)
	
		return a
		
	}
	
	//传入歌曲数据进行水鱼传分
	async function updateMusicData(musicScoreList){
		
		let res = await maiApi.divingFishUpdateData(musicScoreList, importToken.value);
		
		return res;
	}
	
	const timeCutDown=4000;
	let cutDownTime=0;
async function divingFishUpdate()
	{
		if(isProcessing.value) return;
		isProcessing.value = true;
		
		let time=new Date().getTime()
		if(cutDownTime-time>0)
		{
			uni.hideToast()
			uni.showToast({
				title:`操作过于频繁，请${Math.floor((cutDownTime-time)/1000)+1}秒后再试`,
				icon:'none'
			})
			isProcessing.value = false;
			return;
		}
		
		try {

			
			if(uid.value<=0)
			{
				uni.showToast({
					title:"您还未绑定二维码获取UID",
					icon:"none",
					position:"center"
				})
				cutDownTime=new Date().getTime()+timeCutDown
				return
			}
			
		
			
			uni.showLoading({
				title:"上传中",
				mask:true,
			})
			
			let muiscList=await getUserMusicData();
		
			console.log("muiscList:"+muiscList);
			if(!muiscList) {
				uni.hideLoading();
				uni.showToast({
					title:"用户信息错误",
					icon:"fail",
					position:"center"
				})
				return
			}
				
			let res=await updateMusicData(muiscList)
			console.log(res)
			records.value = await maiApi.divingFishGetRecords(jwt_token.value);
			console.log(records.value);
			uni.setStorageSync('divingFish_records', records.value);
			uni.hideLoading();
			await getb50();
			if(res.data.message=="更新成功"){
				uni.showToast({
					title:"上传成功",
					icon:"success"
				})
			} else {
				uni.showToast({
					title:"上传失败(出BUG了o(╥﹏╥)o)",
					icon:"none",
					position:"center"
				})
			}
		} catch (error) {
			uni.showToast({
				title:"网络错误或token失效,请尝试重新登录",
				icon:"fail",
				position:"center"
			})
		} finally {
			isProcessing.value = false;
			cutDownTime=new Date().getTime()+timeCutDown;
		}
	}
	

// 修改 setb50Value 函数，确保正确计算 rating 并存储到本地
async function setb50Value(res) {
    if (res.data) {
        b35.value = res.data.charts.sd;
        b15.value = res.data.charts.dx;

        // 重置 rating 值
        b35rating.value = 0;
        b15rating.value = 0;
        
        // 计算 B35 rating
        for (let item of b35.value) {
            b35rating.value += Number(item.ra);
        }
        
        // 计算 B15 rating
        for (let item of b15.value) {
            b15rating.value += Number(item.ra);
        }
        
        // 将计算出的 rating 存储到本地缓存
        uni.setStorageSync('b35rating', b35rating.value);
        uni.setStorageSync('b15rating', b15rating.value);
        uni.setStorageSync('totalRating', b35rating.value + b15rating.value);
    } else {
        console.log('出错了');
    }
}

async function getb50(){
	try {
		uni.showLoading({
			title: '加载中...',
			mask: true
		});
		
		let res = await maiApi.divingFishgetb50(qqid.value, username.value);
		uni.hideLoading();
		setb50Value(res);
		uni.setStorageSync('b50', res);
	} catch (error) {
		console.error('获取数据失败:', error);
		uni.showToast({
			title: '获取数据失败，请重试',
			icon: 'none'
		});
	}
}
async function getb50local(){
	try {
		uni.showLoading({
			title: '加载中...',
			mask: true
		});
		
		let res=uni.getStorageSync('b50')
		setb50Value(res)
		
		uni.hideLoading();
	} catch (error) {
			uni.hideLoading();
		console.error('获取数据失败:', error);
		// uni.showToast({
		// 	title: '获取数据失败，请重试',
		// 	icon: 'none'
		// });
	}
}


// 添加跳转函数
function navigateToUpdate() {
	uni.navigateTo({
		url: '/pages/webview/webview'
	});
}
// 添加登出处理函数
async function handleLogout() {
	try {
		// 清空本地存储
		uni.removeStorageSync('divingFish_jwt_token');
		uni.removeStorageSync('divingFish_nickname');
		uni.removeStorageSync('divingFish_qqid');
		uni.removeStorageSync('divingFish_importToken');
		uni.removeStorageSync('divingFish_qqChannelUid');
		uni.removeStorageSync('divingFish_records');
		uni.removeStorageSync('b50');
		uni.removeStorageSync('uid');
		uni.removeStorageSync('divingFish_username');
		uni.removeStorageSync('qq_channel_uid');
		
		// 清除 rating 相关缓存
		uni.removeStorageSync('b35rating');
		uni.removeStorageSync('b15rating');
		uni.removeStorageSync('totalRating');
		
		// 重置响应式数据
		jwt_token.value = '';
		username.value = '';
		password.value = '';
		nickname.value = '';
		qqid.value = '';
		importToken.value = '';
		records.value = '';
		b35.value = '';
		b15.value = '';
		b35rating.value = 0;
		b15rating.value = 0;
		uid.value = -1;
		
		// 显示提示
		uni.showToast({
			title: '已退出登录',
			icon: 'success'
		});
		
		// 关闭表单
		isBindFormVisible.value = false;
	} catch (error) {
		console.error('登出失败:', error);
		uni.showToast({
			title: '登出失败，请重试',
			icon: 'none'
		});
	}
}

// 添加设置表单弹窗
const showSettingsModal = ref(false);
const settingsForm = ref({
	import_token: '',
	nickname: '',
	bind_qq: '',
	qq_channel_uid: ''
});

const openSettingsModal = () => {
	// 填充当前用户信息
	// setProfile(jwt_token.value)
	settingsForm.value = {
		import_token: importToken.value,
		nickname: nickname.value || '', // 使用当前昵称，如果没有则为空
		bind_qq: qqid.value || '', // 使用当前QQ号，如果没有则为空
		qq_channel_uid: qq_channel_uid.value || '' // 从本地存储获取频道UID
	};
	showSettingsModal.value = true;
};
const showHelp = (type) => {
    const helpMessages = {
        token: '用于查询和导入你的成绩',
        nickname: '显示在水鱼查分器中的昵称。',
        qq: '绑定QQ用于bot查分。',
        channel: '用于在频道中使用查分功能。',
        qrcode: '打开舞萌微信公众号，扫码识别，将其中的字符串复制到此处。为保护安全玩家二维码仅会在本地保存',
        importb50: '请输入由他人分享的舞萌DX B50分享码，导入后将在历史记录中显示。',
        shareb50: '将此分享码发送给他人，他们可以导入查看您的B50数据。'
    };
    
    uni.showModal({
        title: '提示信息',
        content: helpMessages[type] || '暂无相关信息',
        showCancel: false,
        confirmText: '知道了',
        confirmColor: '#818cf8'
    });
};

async function handleSettingsSubmit() {
	try {
		if (!jwt_token.value) {
			uni.showToast({
				title: '登录已过期，请重新登录',
				icon: 'none',
				duration: 2000
			});
			return;
		}
		const form=settingsForm.value
		const res = await maiApi.divingFishSetProfile(form.nickname,form.bind_qq,form.qq_channel_uid,jwt_token.value)
		
		if (res.data.username) {  // 成功时会返回用户信息
			// 更新本地存储和响应式数据
			nickname.value = res.data.nickname;
			qqid.value = res.data.bind_qq;
			importToken.value = res.data.import_token;
			qq_channel_uid.value =res.data.qq_channel_uid
			uni.setStorageSync('divingFish_nickname', nickname.value);
			uni.setStorageSync('divingFish_qqid', qqid.value);
			uni.setStorageSync('divingFish_importToken', importToken.value);
			uni.setStorageSync('qq_channel_uid', res.data.qq_channel_uid);
			
			// 显示成功提示
			uni.showToast({
				title: '设置已更新',
				icon: 'success',
				duration: 2000
			});
			
			// 关闭弹窗
				showSettingsModal.value = false;
		}else
		{
			throw(res.data.message);
		}
		
	
	} catch (error) {
		
		uni.showModal({
			title: '更新失败',
			content: error,
			showCancel: false,
			confirmText: '知道了',
			confirmColor: '#818cf8'
		});
	}
}

 const refreshImportToken = () => {
	uni.showModal({
		title:'重置导入Token',
		content:'您确定要重置导入Token吗,这会使你原来的Token失效',
		success:(async(e)=>{
			if(e.confirm){
		  let res=await maiApi.divingFishRefreshImportToken(jwt_token.value)
		  console.log(res);
	      importToken.value=res.data.token;
		  }
		}),
	})
	
};



// 添加注册相关的响应式数据
const isRegisterForm = ref(false);
const registerForm = ref({
	username: '',
	password: '',
	confirmPassword: ''
});

// 添加一个检查协议的函数
const checkAgreement = () => {
  return new Promise((resolve, reject) => {
    uni.navigateTo({
      url: '/pages/agreement/agreement?type=popup',
      events: {
        // 监听协议确认结果
        agreementResult: function(result) {
          if (result.agreed) {
            resolve()
          } else {
            reject(new Error('用户拒绝协议'))
          }
        }
      }
    })
  })
}

// 修改 handleRegister 函数
async function handleRegister() {
  if (!registerForm.value.username || !registerForm.value.password || !registerForm.value.confirmPassword) {
    uni.showToast({
      title: '请填写完整信息',
      icon: 'none'
    });
    return;
  }
  
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    uni.showToast({
      title: '两次输入的密码不一致',
      icon: 'none'
    });
    return;
  }
     await checkAgreement()
  try {
    // 在这里添加协议确认
   
    
    // 用户同意协议后继续注册流程
    let res = await maiApi.divingFishRegister(registerForm.value.username, registerForm.value.password);
    console.log(res)
  
    if (res.data.message=='注册成功') {
  		jwt_token.value = maiApi.splitJwtToken(res);
  		maiApi.divingFishAgrement(jwt_token);
  
  
      // 清空注册表单
      registerForm.value = {
        username: '',
        password: '',
        confirmPassword: ''
      };
	  // 注册成功后切换到登录表单
	  
	  await setProfile(jwt_token.value);
	  uni.showToast({
	    title: '注册成功',
	    icon: 'success'
	  });
    }
    else{
  		
      uni.showToast({
        title:res.data.message,
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('该用户名已注册或网络异常', error);
    uni.showToast({
      title: error,
      icon: 'none'
    });
  }
}
function showAgreementModal(){}
// 处理空状态点击
const handleEmptyStateClick = async () => {
  if (!isLoggedIn.value) {
    // 未登录时显示绑定表单
    isBindFormVisible.value = true;
  } else {
    // 已登录时直接生成B50
    await getb50();
  }
}

// 添加状态管理
const showRecordModal = ref(false);
const selectedRecord = ref({record:Object,
index:0});

// 添加显示记录卡片的方法
function showRecordCard(record,index) {
  selectedRecord.value.record = record;
  selectedRecord.value.index=index;
  showRecordModal.value = true;
}

// 添加关闭记录卡片的方法
function closeRecordModal() {
  showRecordModal.value = false;
  selectedRecord.value.record  = null;
   selectedRecord.value.index=null;
}

// 获取 FC 状态的样式类
function getFcClass(fc) {
  if (!fc) return '';
  return 'fc-' + fc.toLowerCase();
}

// 获取 FS 状态的样式类
function getFsClass(fs) {
  if (!fs) return '';
  if(fs.includes('sync')){
    return 'fs-sc';
  }
  return 'fs-' + fs.toLowerCase();
}

// 格式化连击显示
const formatCombo = (fc) => fc ? fc.replace('app', 'ap+').replace('ap', 'ap').replace('fcp', 'fc+').toUpperCase() : '';

// 格式化同步显示
const formatFS = (fs) => fs ? fs.replace('p', '+').toUpperCase() .replace('SYNC','SC'): '';

// 添加上传头像的方法

// 在onMounted中添加深色模式处理
onMounted(async () => {
  // 应用深色模式到原生TabBar
  applyTheme();
  updateNativeTabBar(isDarkMode.value);
});

// 添加导入/分享B50相关变量
const showImportB50Modal = ref(false);
const showShareB50Modal = ref(false);
const importB50Code = ref('');
const shareB50Code = ref('');

// 简单的加密和解密函数（基于Base64和简单替换）
const encryptUsername = (username) => {
	if (!username) return '';
	// 先进行Base64编码
	const base64 = btoa(encodeURIComponent(username));
	// 进行一些字符替换，增加复杂度
	return 'MB50_' + base64
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=/g, '.');
};

const decryptUsername = (code) => {
	if (!code || !code.startsWith('MB50_')) return '';
	try {
		// 去掉前缀并还原替换的字符
		const base64 = code.substring(5)
			.replace(/-/g, '+')
			.replace(/_/g, '/')
			.replace(/\./g, '=');
		// 解码Base64并返回
		return decodeURIComponent(atob(base64));
	} catch(e) {
		console.error('解码失败:', e);
		return '';
	}
};

// 添加导入相关函数
const showImportModal = () => {
	importB50Code.value = '';
	showImportB50Modal.value = true;
};

const closeImportModal = () => {
	showImportB50Modal.value = false;
};

const handleImportB50 = async () => {
	if (!importB50Code.value) {
		uni.showToast({
			title: '请输入分享码',
			icon: 'none'
		});
		return;
	}
	
	try {
		const decodedUsername = decryptUsername(importB50Code.value.trim());
		if (!decodedUsername) {
			closeImportModal();
			uni.showToast({
				title: '无效的分享码',
				icon: 'error'
			});
			return;
		}
		
		// 显示加载中
		uni.showLoading({
			title: '导入中...',
			mask: true
		});
		
		// 调用API获取B50数据，qqid传0
		const res = await maiApi.divingFishgetb50('0', decodedUsername);
		
		// 保存当前B50
		const tempB35 = b35.value;
		const tempB15 = b15.value;
		const tempB35Rating = b35rating.value;
		const tempB15Rating = b15rating.value;
		
		// 设置导入的B50
		setb50Value(res);
		
		// 保存到历史记录，标记为分享的B50，不显示用户名
		saveToHistory(null, null, true);
		
		// 恢复原来的值
		setTimeout(() => {
			b35.value = tempB35;
			b15.value = tempB15;
			b35rating.value = tempB35Rating;
			b15rating.value = tempB15Rating;
		}, 0);
		
		// 查看导入的记录
		viewHistoryRecord(historyRecords.value[0]);
		
		// 关闭导入弹窗
		closeImportModal();
		
		uni.hideLoading();
		uni.showToast({
			title: '导入成功',
			icon: 'success'
		});
	} catch (error) {
		console.error('导入B50失败:', error);
		uni.hideLoading();
		uni.showToast({
			title: '导入失败，请检查分享码',
			icon: 'none'
		});
	}
};

// 添加分享相关函数
const shareB50 = () => {
	if (!username.value) {
		uni.showToast({
			title: '请先登录账号',
			icon: 'none'
		});
		return;
	}
	
	if (!b35.value.length && !b15.value.length) {
		uni.showToast({
			title: '没有数据可分享',
			icon: 'none'
		});
		return;
	}
	
	// 生成分享码
	shareB50Code.value = encryptUsername(username.value);
	showShareB50Modal.value = true;
};

const closeShareModal = () => {
	showShareB50Modal.value = false;
};

const copyShareCode = () => {
	uni.setClipboardData({
		data: shareB50Code.value,
		success: () => {
			closeShareModal();
			uni.showToast({
				title: '已复制到剪贴板',
				icon: 'success'
			});
		}
	});
};

// 添加合并分享/导入UI状态变量
const showShareImportModal = ref(false);
const showSaveHistoryNameModal = ref(false);
const customHistoryName = ref('');
const showEditNameModal = ref(false);
const editingHistoryName = ref('');
const editingHistoryIndex = ref(-1);
const editingHistoryItem = ref(null);

// 显示分享/导入选项弹窗
const showShareImportOptions = () => {
	showShareImportModal.value = true;
};

// 关闭分享/导入选项弹窗
const closeShareImportModal = () => {
	showShareImportModal.value = false;
};

// 显示分享B50选项
const showShareB50Options = () => {
	if (!username.value) {
		uni.showToast({
			title: '请先登录账号',
			icon: 'none'
		});
		return;
	}
	
	if (!b35.value.length && !b15.value.length) {
		uni.showToast({
			title: '没有数据可分享',
			icon: 'none'
		});
		return;
	}
	
	// 生成分享码
	shareB50Code.value = encryptUsername(username.value);
	showShareB50Modal.value = true;
	closeShareImportModal();
};

// 显示导入B50选项
const showImportB50Options = () => {
	importB50Code.value = '';
	showImportB50Modal.value = true;
	closeShareImportModal();
};

// 显示保存历史记录名称弹窗
const showSaveHistoryModal = () => {
	customHistoryName.value = '';
	showSaveHistoryNameModal.value = true;
};

// 关闭保存历史记录名称弹窗
const closeSaveHistoryNameModal = () => {
	showSaveHistoryNameModal.value = false;
};

// 确认保存历史记录
const confirmSaveHistory = () => {
	saveToHistory(null, customHistoryName.value);
	showSaveHistoryNameModal.value = false;
};

// 显示编辑历史记录名称弹窗
const showEditHistoryNameModal = (item, index) => {
	editingHistoryItem.value = item;
	editingHistoryIndex.value = index;
	editingHistoryName.value = item.customName || '';
	showEditNameModal.value = true;
};

// 关闭编辑历史记录名称弹窗
const closeEditNameModal = () => {
	showEditNameModal.value = false;
};

// 确认编辑历史记录名称
const confirmEditHistoryName = () => {
	if (editingHistoryIndex.value >= 0) {
		try {
			// 获取现有历史记录
			const history = uni.getStorageSync('b50History') || [];
			
			// 更新指定记录的名称
			if (history[editingHistoryIndex.value]) {
				history[editingHistoryIndex.value].customName = editingHistoryName.value;
				
				// 保存到本地存储
				uni.setStorageSync('b50History', history);
				
				// 更新响应式数据
				historyRecords.value = history;
				
				uni.showToast({
					title: '名称已更新',
					icon: 'success'
				});
			}
		} catch (error) {
			console.error('更新历史记录名称失败:', error);
			uni.showToast({
				title: '更新失败，请重试',
				icon: 'none'
			});
		}
	}
	
	showEditNameModal.value = false;
};

// 保存B50为图片的函数
const b50Container = ref(null);  // 引用容器DOM元素
const renderRef = ref(null);     // 引用html2canvas-render组件

// 保存B50为图片 - 使用html2canvas-render组件
const saveB50AsImage = async () => {
  // 创建加载提示
  loading.value = true;
  loadingText.value = '准备图片中...';
  
  try {
    // 创建一个当前B50数据的副本，用于处理图片
    const currentB50 = isViewingHistory.value ? currentHistoryRecord.value : {
      b35: b35.value,
      b15: b15.value
    };
    
    if (!currentB50.b35?.length && !currentB50.b15?.length) {
      uni.showToast({
        title: '没有B50数据可保存',
        icon: 'none'
      });
      loading.value = false;
      return;
    }
    
    // 收集所有需要处理的图片ID
    loadingText.value = '收集图片...';
    const b35SongIds = currentB50.b35 ? currentB50.b35.map(song => song.song_id) : [];
    const b15SongIds = currentB50.b15 ? currentB50.b15.map(song => song.song_id) : [];
    const allSongIds = [...b35SongIds, ...b15SongIds];
    
    // 并行处理所有图片
    loadingText.value = `正在处理${allSongIds.length}张图片...`;
    const allBase64Images = await getBatchCoverBase64(allSongIds);
    
    // 创建一个ID到base64的映射
    const idToBase64Map = {};
    allSongIds.forEach((id, index) => {
      if (allBase64Images[index]) {
        idToBase64Map[id] = allBase64Images[index];
      }
    });
    
    // 使用映射更新数据
    const processedB35Images = currentB50.b35 ? currentB50.b35.map(song => {
      const songCopy = {...song};
      if (idToBase64Map[song.song_id]) {
        songCopy._coverBase64 = idToBase64Map[song.song_id];
      }
      return songCopy;
    }) : [];
    
    const processedB15Images = currentB50.b15 ? currentB50.b15.map(song => {
      const songCopy = {...song};
      if (idToBase64Map[song.song_id]) {
        songCopy._coverBase64 = idToBase64Map[song.song_id];
      }
      return songCopy;
    }) : [];
    
    // 暂时替换B35和B15，以便渲染含有base64图片的版本
    const originalB35 = b35.value;
    const originalB15 = b15.value;
    const originalCurrentHistoryRecord = currentHistoryRecord.value;
    
    // 处理正在查看的是历史记录还是当前B50的情况
    if (isViewingHistory.value) {
      // 创建一个currentHistoryRecord的副本并修改其中的图片
      const recordCopy = {...currentHistoryRecord.value};
      recordCopy.b35 = processedB35Images;
      recordCopy.b15 = processedB15Images;
      currentHistoryRecord.value = recordCopy;
    } else {
      // 直接替换当前的b35和b15
      b35.value = processedB35Images;
      b15.value = processedB15Images;
    }
    
    // 确保DOM已更新
    await nextTick();
    
    // 添加临时类处理渐变文本问题
    loadingText.value = '正在准备渲染...';
    
    // 添加一个截图标志变量，这样在模板中可以通过条件类绑定实现
    isScreenshotMode.value = true;
    
    // #ifdef H5
    // 在H5环境下也可以直接操作DOM
    const b50Container = document.getElementById('b50Container');
    if (b50Container) {
      b50Container.classList.add('screenshot-mode');
    }
    // #endif
    
    // 准备渲染
    loadingText.value = '正在生成图片...';
    
    // 等待确保渲染完成
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 检查渲染组件是否存在
    if (!renderRef.value) {
      throw new Error('渲染组件未初始化');
    }
    
    // 设置渲染参数，增加scale提高清晰度
    const renderOptions = {
      scale: 4, // 设置更高的缩放比例提高清晰度
      useCORS: true,
      allowTaint: false,
      backgroundColor: null, // 透明背景
      logging: false, // 关闭日志，减少控制台输出
      imageTimeout: 0 // 不限制图片加载时间，防止超时
    };
    
    try {
      // #ifdef H5
      try {
        // 在H5环境中，直接调用并等待结果
        const result = await renderRef.value.h2cRenderDom(renderOptions);
        if (result) {
          handleRenderOver(result);
        } else {
          throw new Error('渲染返回结果为空');
        }
      } catch (h5Error) {
        console.error('H5渲染错误:', h5Error);
        // H5渲染失败，尝试使用默认方式
        renderRef.value.h2cRenderDom();
      }
      // #endif
      
      // #ifndef H5
      // 在非H5环境中，使用回调处理
      renderRef.value.h2cRenderDom(renderOptions);
      // #endif
      
      // 渲染结束后恢复原始数据
      setTimeout(() => {
        // 移除截图模式
        isScreenshotMode.value = false;
        
        // #ifdef H5
        if (b50Container) {
          b50Container.classList.remove('screenshot-mode');
        }
        // #endif
        
        if (isViewingHistory.value) {
          currentHistoryRecord.value = originalCurrentHistoryRecord;
        } else {
          b35.value = originalB35;
          b15.value = originalB15;
        }
      }, 1000); // 延迟恢复，确保渲染完成
    } catch (error) {
      console.error('渲染过程出错:', error);
      // 恢复原始数据
      isScreenshotMode.value = false;
      
      // #ifdef H5
      if (b50Container) {
        b50Container.classList.remove('screenshot-mode');
      }
      // #endif
      
      if (isViewingHistory.value) {
        currentHistoryRecord.value = originalCurrentHistoryRecord;
      } else {
        b35.value = originalB35;
        b15.value = originalB15;
      }
      
      loading.value = false;
      uni.showToast({
        title: '生成图片失败，请重试',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('保存B50图片失败:', error);
    loading.value = false;
    uni.showToast({
      title: '处理图片失败，请重试',
      icon: 'none'
    });
  }
};

// 添加截图模式的标志
const isScreenshotMode = ref(false);

// 处理渲染完成事件
const handleRenderOver = (result) => {
  console.log('渲染完成回调:', result);
  
  // 确保result是对象或字符串
  if (!result) {
    console.error('渲染结果为空');
    loading.value = false;
    uni.showToast({
      title: '渲染失败，结果为空',
      icon: 'none'
    });
    return;
  }
  
  // 处理不同格式的结果
  let base64Data = '';
  if (typeof result === 'object') {
    if (result.detail) {
      base64Data = result.detail;
    } else if (result.target && result.target.value) {
      // 可能是事件对象
      base64Data = result.target.value;
    } else {
      console.error('未知的渲染结果对象格式:', result);
      loading.value = false;
      uni.showToast({
        title: '渲染结果格式错误',
        icon: 'none'
      });
      return;
    }
  } else if (typeof result === 'string') {
    base64Data = result;
  } else {
    console.error('未知的渲染结果格式:', typeof result);
    loading.value = false;
    uni.showToast({
      title: '渲染结果格式错误',
      icon: 'none'
    });
    return;
  }
  
  // 检查base64Data是否有效
  if (!base64Data.startsWith('data:image')) {
    console.error('无效的base64图片数据');
    loading.value = false;
    uni.showToast({
      title: '生成的图片无效',
      icon: 'none'
    });
    return;
  }
  
  // 保存到相册
  saveImageToAlbum(base64Data);
};

// 保存图片到相册
const saveImageToAlbum = async (base64) => {
  try {
    // 转换为图片路径
    // #ifdef APP-PLUS
    // APP环境下将base64转为本地文件路径并保存到相册
    const filePath = await base64ToPath(base64);
    // 保存到相册
    uni.saveImageToPhotosAlbum({
      filePath: filePath,
      success: () => {
        loading.value = false;
        uni.showToast({
          title: '已保存到相册',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.error('保存到相册失败:', err);
        loading.value = false;
        uni.showToast({
          title: '保存到相册失败',
          icon: 'none'
        });
      }
    });
    // #endif
    
    // #ifdef H5
    // H5环境下直接下载图片
    const a = document.createElement('a');
    a.href = base64;
    a.download = `B50_${new Date().getTime()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    loading.value = false;
    uni.showToast({
      title: '图片已下载',
      icon: 'success'
    });
    // #endif
    
    // #ifdef MP-WEIXIN
    // 小程序环境下保存图片到相册
    const filePath = await base64ToPath(base64);
    uni.saveImageToPhotosAlbum({
      filePath: filePath,
      success: () => {
        loading.value = false;
        uni.showToast({
          title: '已保存到相册',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.error('保存到相册失败:', err);
        loading.value = false;
        uni.showToast({
          title: '保存到相册失败',
          icon: 'none'
        });
      }
    });
    // #endif
  } catch (error) {
    console.error('保存图片过程发生错误:', error);
    loading.value = false;
    uni.showToast({
      title: '保存图片出错',
      icon: 'none'
    });
  }
};

// 添加loading状态和文本
const loading = ref(false);
const loadingText = ref('');

// 处理截图
const handleScreenshot = () => {
  // 显示加载提示
  uni.showLoading({
    title: '生成图片中...',
    mask: true
  });
  
  // 预处理图片
  preprocessAllImages().then(() => {
    // 调用html2canvas渲染
    renderRef.value.h2cRenderDom();
  }).catch(error => {
    console.error('预处理图片失败:', error);
    uni.hideLoading();
    uni.showToast({
      title: '生成图片失败，请检查网络',
      icon: 'none'
    });
  });
};

// 预处理DOM中所有图片，将网络图片转换为base64
const preprocessAllImages = async () => {
  // 获取B50容器内的所有图片
  const images = document.querySelectorAll('#b50Container img');
  
  // 转换所有图片为base64
  const promises = Array.from(images).map(async img => {
    if (!img.src) return;
    
    // 跳过已经是base64的图片
    if (img.src.startsWith('data:')) return;
    
    try {
      // 使用urlToBase64或pathToBase64将图片转换为base64
      const base64 = await pathToBase64(img.src);
      img.src = base64;
    } catch (error) {
      console.warn('转换图片失败:', img.src, error);
    }
  });
  
  // 等待所有图片转换完成
  await Promise.all(promises);
  
  // 给DOM一些时间刷新
  return new Promise(resolve => setTimeout(resolve, 100));
};

const captureB50 = () => {
  // 显示加载提示
  uni.showLoading({
    title: '正在生成图片...',
    mask: true
  });
  
  try {
    // 使用预处理函数处理图片
    // #ifdef H5
    preprocessAllImages().then(() => {
      // 延迟执行确保DOM已经完全渲染
      setTimeout(() => {
        // 调用html2canvas-render组件的渲染方法
        renderRef.value.h2cRenderDom();
      }, 300);
    }).catch(error => {
      console.error('预处理图片失败:', error);
      uni.hideLoading();
      uni.showToast({
        title: '生成图片失败，请检查网络',
        icon: 'none'
      });
    });
    // #endif
    
    // #ifndef H5
    // 非H5环境下，直接渲染
    setTimeout(() => {
      renderRef.value.h2cRenderDom();
    }, 300);
    // #endif
  } catch (error) {
    console.error('截图过程发生错误:', error);
    uni.hideLoading();
    uni.showToast({
      title: '生成图片出错',
      icon: 'none'
    });
  }
};

// 获取显示名称（优先使用昵称，其次是用户名）
const getDisplayName = () => {
  // 如果是在查看历史记录，使用历史记录中保存的昵称
  if (isViewingHistory.value && currentHistoryRecord.value) {
    // 优先使用自定义名称
    if (currentHistoryRecord.value.customName) {
      return currentHistoryRecord.value.customName;
    }
    // 其次使用昵称
    if (currentHistoryRecord.value.nickname) {
      return currentHistoryRecord.value.nickname;
    }
    // 最后显示"来自分享的B50"或默认文本
    return currentHistoryRecord.value.isShared ? '来自分享的B50' : '未知用户';
  }
  
  // 如果是当前B50，使用当前用户信息
  if (isLoggedIn.value) {
    return nickname.value || username.value || '未知用户';
  }
  
  return '未登录用户';
};
</script>

<style lang='scss' scoped>
@import "./maib50.scss";
@import "@/pages/maib50/dark-maib50.scss"; /* 导入深色模式样式 */
.record-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.record-modal-content {
  border-radius: 12rpx;
  padding: 60rpx;
  width: 90%;
  max-width: 600rpx;
  /* animation: slideUp 0.2s ease-out; */
}

/* FC 样式 */
.fc-fc, .fc-fcp {
  color: #10b981 !important;
  background-color: rgba(16, 185, 129, 0.1) !important;
  padding: 2rpx 4rpx;
  border-radius: 4rpx;
  margin-right: -5rpx;
}

.fc-ap, .fc-app {
  color: #f59e0b !important;
  background-color: rgba(245, 158, 11, 0.1) !important;
  padding: 2rpx 4rpx;
  border-radius: 4rpx;
  margin-right: -5rpx;
}

/* FS 样式 */
.fs-sc, .fs-fs, .fs-fsp {
  color: #3b82f6 !important;
  background-color: rgba(59, 130, 246, 0.1) !important;
  padding: 2rpx 4rpx;
  border-radius: 4rpx;
  
}

.fs-fsd, .fs-fsdp {
  color: #f59e0b !important;
  background-color: rgba(245, 158, 11, 0.1) !important;
  padding: 2rpx 4rpx;
  border-radius: 4rpx;
  
}




.empty-text {
  font-size: 28rpx;
  color: #999;
}










/* 深色模式适配 */


.loading-content {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 200px;
  
  .dark-mode & {
    background-color: #252530;
    color: #f0f0f0;
  }
}


/* 截图模式 - 处理渐变文本问题 */
#index.screenshot-mode {
  /* 背景设置为纯色 */
  background-color: #f0f4f8 !important; /* 稍微发灰发蓝的背景 */
  background-image: none !important;
  
  /* 去掉B35和B15装饰线 */
  .section-title {
	border-radius: 0rpx;
    background-color: #f1f7ff !important; /* 稍微更深一点的灰蓝色 */
    background-image: none !important;
	border-top:4rpx solid #16cb8f;
	border-bottom:4rpx solid #16cb8f;
    &::before, &::after {
      display: none !important;
    }
    
    &.has-data::after {
      display: none !important;
    }
    
    .title-content::after {
      display: none !important;
    }
    
    .title-content::before {
      display: none !important;
    }
  }

  .rating-container {
    /* 默认样式（<12000）不需要修改，因为它没有使用渐变 */
    
    /* 铜色样式 - 替换渐变为纯色 */
    &.copper {
      background: #fff !important; /* 纯白背景 */
      .rating-value {
        background: none !important;
        -webkit-background-clip: unset !important;
        color: #c2410c !important;
      }
    }
    
    /* 蓝色样式 - 替换渐变为纯色 */
    &.blue {
      background: #fff !important; /* 纯白背景 */
      .rating-value {
        background: none !important;
        -webkit-background-clip: unset !important;
        color: #3b82f6 !important;
      }
    }
    
    /* 金色样式 - 替换渐变为纯色 */
    &.gold {
      background: #fff !important; /* 纯白背景 */
      .rating-value {
        background: none !important;
        -webkit-background-clip: unset !important;
        color: #dacc15 !important;
        opacity: 1 !important;
      }
    }
    
    /* 亮金色样式 - 替换渐变为纯色 */
    &.bright-gold {
      background: #fff !important; /* 纯白背景 */
      .rating-value {
        background: none !important;
        -webkit-background-clip: unset !important;
        color: #facc15 !important;
      }
    }
    
    /* 彩虹样式 - 替换渐变动画为明艳的绿色 */
    &.rainbow {
      background: #fff !important; /* 纯白背景 */
      &::before {
        display: none !important; /* 隐藏渐变背景 */
      }
      
      .rating-value {
        background: none !important;
        -webkit-background-clip: unset !important;
        color: #10b981 !important; /* 使用明艳的绿色 */
        animation: none !important;
      }
    }
  }
  
  /* 确保其他可能的渐变文本也能正确显示 */
  .rate-badge {
    /* 处理彩虹徽章，使用明艳的绿色 */
    &.rainbow, &.rainbowp {
      background: none !important;
      -webkit-background-clip: unset !important;
      background-clip: unset !important;
      color: #10b981 !important; /* 使用明艳的绿色 */
    }
    
    /* 处理金色徽章 */
    &.gold {
      background: none !important;
      -webkit-background-clip: unset !important;
      background-clip: unset !important;
      color: #facc15 !important;
    }
  }
  
  /* 歌曲卡片背景修改 */
  .song-card {
    background-color: #fff !important;
    background-image: none !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
  }
  
  /* B50容器样式修改 */
  .b50box {
    background-color: #f0f4f8 !important;
    background-image: none !important;
  }
  
  /* 用户信息背景 */
  .b50-user-info {
    .user-nickname {
      background-color: white !important;;
	  border-top:2rpx solid #16cb8f;
	  border-bottom:2rpx solid #16cb8f;
    }
  }
}

/* 深色模式截图样式 */
#index.dark-mode.screenshot-mode {
  background-color: $dark-element-bg !important;/* 深色模式下的灰蓝色背景 */
  
  .section-title {
  background-color: $dark-card-bg !important; /* 深色模式下更深的灰蓝色 */
  border-radius: 0rpx;
  border-top:4rpx solid #682de8;
  border-bottom:4rpx solid #682de8;
  }
  
  .rating-container {
    &.default {
      background: $dark-card-bg !important;
    }
    
    &.copper, &.blue, &.gold, &.bright-gold, &.rainbow {
      background: $dark-card-bg !important;
    }
    
    &.copper {
      .rating-value {
        color: #c2410c !important;
      }
    }
    
    &.blue {
      .rating-value {
        color: #3b82f6 !important;
      }
    }
    
    &.gold {
      .rating-value {
        color: #dacc15 !important;
      }
    }
    
    &.bright-gold {
      .rating-value {
        color: #facc15 !important;
      }
    }
    
    &.rainbow {
      .rating-value {
        color: #10b981 !important; /* 使用明艳的绿色 */
      }
    }
  }
  
  /* 深色模式下歌曲卡片背景修改 */
  .song-card {
    background-color: $dark-card-bg !important;
    //box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
  }
  
  /* B50容器样式修改 */
  .b50box {
    background-color:$dark-element-bg !important;
    background-image: none !important;
  }
  
  /* 用户信息背景 */
  .b50-user-info {
    .user-nickname {
      background: $dark-card-bg !important;
      color: #f0f0f0 !important;
	  border-radius: 0rpx;
      border-bottom:2rpx solid #682de8;
	  border-top:2rpx solid #682de8;

    }
  }
}

/* 加载提示样式 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* 确保显示在最上层 */
}

.loading-content {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 200px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); /* 添加阴影增强弹窗效果 */
  
  .dark-mode & {
    background-color: #252530;
    color: #f0f0f0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4); /* 深色模式下阴影更深 */
  }
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
  
  .dark-mode & {
    border: 4px solid #333;
    border-top: 4px solid #5253c7;
  }
}

.loading-text {
  font-size: 16px;
  text-align: center;
  font-weight: 500; /* 字体加粗增强可见性 */
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}





</style>
