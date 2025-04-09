<template>
	<view id="index" :class="{'dark-mode': isDarkMode}">
	
		<view class="button-group">
			<button class="nav-btn bind-btn" v-show="jwt_token" @click="handleRefresh">刷新B50(不会生图)</button>
			<!-- <button class="save-btn" @click="saveAsImage()">保存为图片</button> -->
	<!-- 		<button class="nav-btn bind-btn" @click="toggleBindForm"> 
			<text class="btn-text">{{ jwt_token ? '账号设置' : '绑定账号' }}</text>
			</button> -->
			<!-- <button class="nav-btn bind-btn" v-show="jwt_token" @click="divingFishUpdate">更新成绩</button> -->
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
		
		<view class="b50box" id="capture-area" v-else>
			<view v-if="!b35?.length && !b15?.length" class="empty-state" @click="handleEmptyStateClick">
				<view class="empty-icon">📊</view>
				<view class="empty-title">暂无数据</view>
				<view class="empty-text">{{ isLoggedIn ? '请先绑定二维码更新一次成绩后点击生成B50' : '请先登录水鱼账号' }}</view>
			</view>
			
			<view v-else>
				
				<view class="rating-container" :class="getRatingClass()">
					<view class="rating-title">总 Rating</view>
					<view class="rating-value">{{totalRating}}</view>
					<view class="rating-subtitle">B35:{{ b35rating }} + B15:{{ b15rating }}</view>
				</view>
				<view class="section-title" :class="{ 'has-data': b35?.length > 0 }">
					<view class="title-content">B35</view>
				</view>
				
				<view class="b35box">
					<view class="song-card" 
						v-for="(item,index) in b35" 
						@click="showRecordCard(item,index)"
					> 
					 	<view class="song-cover">
							<image class="cover-image" :class="'level-' + item.level_index" :src="getCoverUrl(item.song_id)"></image>
							<view class="ds-tag" :class="'level-' + item.level_index">{{Number(item.ds).toFixed(1)}}</view>
						</view>
						<view class="song-info">
							<text class="song-title">{{item.title}}</text>
							<view class="song-stats">
								<text class="stat-item achievements">{{Number(item.achievements).toFixed(4)}}%</text>
								<text class="stat-item ra">Rating: {{item.ra}}</text>
								<text v-if="item.fc" class="stat-item fc-fs" :class="getFcClass(item.fc)">{{ formatCombo(item.fc) }}</text>
								<text v-if="item.fs" class="stat-item fs-fs" :class="getFsClass(item.fs)">{{ formatFS(item.fs) }}</text>
							</view>
						</view>
						<text class="rate-badge" :class="{
							'rainbowp': item.rate?.includes('sssp'),
							'rainbow': item.rate?.includes('sss')&& !item.rate?.includes('sssp'),
						
							'gold': item.rate?.includes('ss') && !item.rate?.includes('sss')
						}">{{item.rate?.endsWith('p') ? item.rate.slice(0, -1) + '+' : item.rate}}</text>
					</view>
				</view>
				
				<view class="section-title" :class="{ 'has-data': b15?.length > 0 }">
					<view class="title-content">B15</view>
				</view>
				<view class="b15box">
					<view class="song-card" 
						v-for="(item,index) in b15" 
						@click="showRecordCard(item,index)"
					> 
						<view class="song-cover">
							<image class="cover-image" :class="'level-' + item.level_index" :src="getCoverUrl(item.song_id)"></image>
							<view class="ds-tag" :class="'level-' + item.level_index">{{Number(item.ds).toFixed(1)}}</view>
						</view>
						<view class="song-info">
							<text class="song-title">{{item.title}}</text>
							<view class="song-stats">
								<text class="stat-item achievements">{{Number(item.achievements).toFixed(4)}}%</text>
								<text class="stat-item ra">Rating: {{item.ra}}</text>
								<text v-if="item.fc" class="stat-item fc-fs" :class="getFcClass(item.fc)">{{ formatCombo(item.fc) }}</text>
								<text v-if="item.fs" class="stat-item fs-fs" :class="getFsClass(item.fs)">{{ formatFS(item.fs) }}</text>
							</view>
						</view>
						<text class="rate-badge" :class="{
							'rainbowp': item.rate?.includes('sssp'),
							'rainbow': item.rate?.includes('sss'),
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
	*/
// import * as fileutil from '../../util/fileutil.js'
import { computed, ref, onMounted, onUnmounted, nextTick, inject } from 'vue';
import * as maiApi from "../../api/maiapi.js"
import { b50adapter } from '@/utils/b50adapter.js';
import {onReady,onLoad,onInit} from '@dcloudio/uni-app'
import {getCoverUrl}  from '../../utils/coverManager.js'
import RecordCard from '../../components/record-card/record-card.vue'
import {updateNativeTabBar} from '@/utils/updateNativeTabBar.js'
// 注入深色模式变量
const isDarkMode = inject('isDarkMode');
const applyTheme = inject('applyTheme');

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

	
	await getb50();
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
    };
    
    uni.showModal({
        title: '提示信息',
        content: helpMessages[type],
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


</script>

<style lang='scss'>
@import "./maib50.scss";
@import "@/pages/maib50/dark-maib50.scss"; /* 导入深色模式样式 */

/* 添加模态框样式 */
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
  background: white;
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

/* 深色模式下的模态框样式 */
.modal-container.dark-mode,
.record-modal-content.dark-mode {
  background: $dark-card-bg !important;
  border: 1px solid $dark-card-border !important;
  color: $dark-text-primary !important;
  
  .modal-title {
    color: $dark-text-primary !important;
  }
  
  .form-item {
    .form-label {
      color: $dark-text-secondary !important;
    }
    
    .form-input {
      background: rgba(0, 0, 0, 0.2) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      color: $dark-text-primary !important;
      
      &:focus {
        border-color: #818cf8 !important;
        background: rgba(0, 0, 0, 0.3) !important;
      }
      
      &::placeholder {
        color: $dark-text-hint !important;
      }
    }
  }
  
  .modal-buttons {
    .modal-btn {
      &.cancel {
        background: rgba(0, 0, 0, 0.3) !important;
        color: $dark-text-primary !important;
      }
      
      &.confirm {
        background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%) !important;
      }
    }
  }
}
</style>
