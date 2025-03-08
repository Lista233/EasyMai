<template>
	<view id="index">
		<view class="button-group">
			<button class="nav-btn refresh-btn" @click="handleRefresh">生成B50</button>
			<!-- <button class="save-btn" @click="saveAsImage()">保存为图片</button> -->
			<button class="nav-btn bind-btn" @click="toggleBindForm"> 
			<text class="btn-text">{{ jwt_token ? '账号设置' : '绑定账号' }}</text>
			</button>
			<button class="nav-btn update-btn" @click="navigateToUpdate">音游地图</button>
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
					<button class="logout-btn" @click="handleLogout">
						<text class="logout-icon">⎋登出</text>
								
					</button>
				<view class="login-contentbox">
					<!-- 添加退出登录按钮到左上角 -->
				
					
					<view class="user-info">
						<view class="user-header">
							<view class="avatar">👤</view>
							<view class="user-details">
								<view class="info-item">
									<text class="label">昵称：</text>
									<text class="value">{{ nickname?nickname:'您还未设置昵称' }}</text>
								</view>
								<view class="info-item">
									<text class="label">UID：</text>
									<text class="value">{{ uid>0 ? uid : '请先绑定舞萌二维码获取UID' }}</text>
								</view>
							</view>
						</view>
						
						<view class="action-buttons">
							<button class="action-btn qr-btn" @click="showQrCodeInput">
								<text class="btn-text">绑定二维码</text>
							</button>
							<button class="action-btn upload-btn" @click="divingFishUpdate">
								<text class="btn-text">更新成绩</text>
							</button>
							<button class="action-btn settings-btn" @click="openSettingsModal">
								<text class="btn-text">{{ jwt_token ? '账号信息' : '绑定账号' }}</text>
							</button>
						</view>
					</view>
				</view>
				</template>
			</view>
		</view>
		
		<view class="b50box" id="capture-area">
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
					<view class="song-card" v-for="(item,index) in b35"> 
						<view class="song-cover">
							<image class="cover-image" :class="'level-' + item.level_index" :src="getCoverUrl(item.song_id)"></image>
							<view class="ds-tag" :class="'level-' + item.level_index">{{Number(item.ds).toFixed(1)}}</view>
						</view>
						<view class="song-info">
							<text class="song-title">{{item.title}}</text>
							<view class="song-stats">
								<text class="stat-item achievements">{{Number(item.achievements).toFixed(4)}}%</text>
								<text class="stat-item ra">Rating: {{item.ra}}</text>
								<text class="stat-item fc-fs">{{item.fc.replace('p', '+')}} | {{item.fs.replace('p', '+').replace('ap', 'ap').replace('app', 'ap+').replace('sync', 'sc')}}</text>
							</view>
						</view>
						<text class="rate-badge" :class="{
							'rainbow': item.rate?.includes('sss'),
							'gold': item.rate?.includes('ss') && !item.rate?.includes('sss')
						}">{{item.rate?.endsWith('p') ? item.rate.slice(0, -1) + '+' : item.rate}}</text>
					</view>
				</view>
				
				<view class="section-title" :class="{ 'has-data': b15?.length > 0 }">
					<view class="title-content">B15</view>
				</view>
				<view class="b15box">
					<view class="song-card" v-for="(item,index) in b15"> 
						<view class="song-cover">
							<image class="cover-image" :class="'level-' + item.level_index" :src="getCoverUrl(item.song_id)"></image>
							<view class="ds-tag" :class="'level-' + item.level_index">{{Number(item.ds).toFixed(1)}}</view>
						</view>
						<view class="song-info">
							<text class="song-title">{{item.title}}</text>
							<view class="song-stats">
								<text class="stat-item achievements">{{Number(item.achievements).toFixed(4)}}%</text>
								<text class="stat-item ra">Rating: {{item.ra}}</text>
								<text class="stat-item fc-fs">{{item.fc.replace('p', '+')}} | {{item.fs.replace('p', '+').replace('ap', 'ap').replace('app', 'ap+').replace('sync', 'sc')}}</text>
							</view>
						</view>
						<text class="rate-badge" :class="{
							'rainbow': item.rate?.includes('sss'),
							'gold': item.rate?.includes('ss') && !item.rate?.includes('sss')
						}">{{item.rate?.endsWith('p') ? item.rate.slice(0, -1) + '+' : item.rate}}</text>
					</view>
				</view>
			</view>
		</view>
		
		<canvas canvas-id="myCanvas" style="width: 750rpx; height: 1334rpx; position: fixed; left: -9999rpx;"></canvas>
		
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
							placeholder="进入舞萌公众号界面,长按二维码识别,将字符串复制到此处,或截图通过相册导入"
							class="form-textarea"
							:maxlength="-1"
							:auto-height="true"
						/>
						<button class="import-btn" @click="chooseImage">
							<text class="btn-icon">📁</text>
							<text class="btn-text">从相册导入/扫码</text>
						</button>
					</view>
				</view>
				<view class="modal-buttons">
					<button class="modal-btn cancel" @click="closeQrModal">取消</button>
					<button class="modal-btn confirm" @click="handleQrCodeSubmit">确定</button>
				</view>
			</view>
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
	divingFish_qqid;
	divingFish_username;
	divingFish_nickname;
	divingFish_importToken;
	divingFish_records;
	*/
import * as fileutil from '../../util/fileutil.js'
import { computed, ref, onMounted, onUnmounted } from 'vue';
import * as maiApi from "../../api/maiapi.js"
import { b50adapter } from '../../util/b50adapter.js';
import {onReady,onLoad,onInit} from '@dcloudio/uni-app'

const ossroute='https://lista233.oss-cn-beijing.aliyuncs.com/maicover/'
const localroute= 'maicover';
const suffix=ref('.jpg')

let coverlist=ref([])

let b35=ref('')
let b15=ref('')
let b15rating=ref(0)
let b35rating=ref(0)

let username=ref('')
let password=ref('')
let nickname=ref('')
let qqid=ref('')
let importToken=ref('')
let records=ref('')
let QrCode=ref('');
let uid=ref(-1);
let qq_channel_uid=ref('')
let isProcessing=ref(false);

const hasLoadedB50 = ref(false);

onLoad(async () => {
	console.log(1)
	coverlist.value = await fileutil.getDirectoryFiles(localroute)
	qqid.value = uni.getStorageSync('divingFish_qqid');
	nickname.value = uni.getStorageSync('divingFish_nickname');
	importToken.value = uni.getStorageSync('divingFish_importToken');
	records.value = uni.getStorageSync('divingFish_records');
	uid.value = uni.getStorageSync('uid')
	username.value = uni.getStorageSync('divingFish_username')
	qq_channel_uid.value=uni.getStorageSync('qq_channel_uid')
	console.log('nickname'+nickname.value)
	
	// 只在首次加载且用户已登录时执行
	if (qqid.value && nickname.value) {
		await getb50local();
	
	}
	
	jwt_token.value = uni.getStorageSync('divingFish_jwt_token');
});


const loadingImages = ref(new Set()); // 记录正在加载的图片

// 用于跟踪正在下载的文件
const downloadingFiles = new Set();
function getCoverUrl(songId) {

    const fileName = songId + suffix.value;
    
    // 确保 coverlist.value 是数组
    if (Array.isArray(coverlist.value) && coverlist.value.includes(fileName)) {
        // console.log('本地获取');
        return '_doc/' + localroute + '/' + fileName;
    }
    
    // 如果本地不存在且没有在下载中，开始下载
    if (!downloadingFiles.has(fileName)) {
        downloadingFiles.add(fileName);
        loadingImages.value.add(songId); // 标记图片正在加载
        
        fileutil.downloadFileToDoc(ossroute + fileName, localroute)
            .then(async () => {
                const files = await fileutil.getDirectoryFiles(localroute);
                coverlist.value = Array.isArray(files) ? files : [];
                downloadingFiles.delete(fileName);
                loadingImages.value.delete(songId); // 移除加载标记
                
                // 强制更新组件
                if (coverlist.value.includes(fileName)) {
                    const index = b35.value.findIndex(item => item.song_id + suffix.value === fileName);
                    if (index !== -1) {
                        b35.value = [...b35.value];
                    }
                }
            })
            .catch(error => {
                console.error('下载封面图片失败:', error);
                downloadingFiles.delete(fileName);
                loadingImages.value.delete(songId); // 出错时也移除加载标记
            });
    }
    
    return ''; // 返回空字符串，表示图片正在加载中
}

// 控制绑定表单显示状态
const isBindFormVisible = ref(false);

// 添加登录状态计算属性
const isLoggedIn = computed(() => jwt_token.value)

// 添加 jwt_token 的响应式引用
let jwt_token = ref('');

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
	if (!qqid.value || !nickname.value) {
		uni.showToast({
			title: '请先绑定用户信息',
			icon: 'none'
		});
		toggleBindForm();
		return;
	}
	
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
		console.log("SADD"+a);
		return a
		
	}
	
	//传入歌曲数据进行水鱼传分
	async function updateMusicData(musicScoreList){
		let res=await maiApi.divingFishUpdateData(musicScoreList,importToken.value)
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
			uni.hideLoading();
			console.log("muiscList:"+muiscList);
			if(!muiscList) {
				uni.showToast({
					title:"用户信息错误",
					icon:"none",
					position:"center"
				})
				return
			}
			
			let res=await updateMusicData(muiscList)
			console.log(res)
			
			if(res.data.message=="更新成功"){
				uni.showToast({
					title:"上传成功",
					icon:"none",
					position:"center"
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
				title:"网络错误，请重试",
				icon:"none",
				position:"center"
			})
		} finally {
			isProcessing.value = false;
			cutDownTime=new Date().getTime()+timeCutDown;
		}
	}
	

// 修改 setb50Value 函数，确保正确计算 rating
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
async function saveAsImage() {
	try {
		// 创建画布上下文
		const ctx = uni.createCanvasContext('myCanvas');
		
		// 设置画布背景色
		ctx.fillStyle = '#f5f5f5';
		ctx.fillRect(0, 0, 750, 1334);
		
		// 获取B50容器节点信息
		const result = await new Promise((resolve, reject) => {
			const query = uni.createSelectorQuery();
			query.select('.b50box')
				.boundingClientRect(data => {
					if (data) {
						resolve(data);
					} else {
						reject(new Error('获取节点信息失败'));
					}
				})
				.exec();
		});
		
		// 初始化起始Y坐标
		let startY = 20;
		
		// 遍历并绘制 B35 数据
		if (b35.value && b35.value.length) {
			// 绘制 B35 标题
			ctx.fillStyle = '#333333';
			ctx.font = 'bold 32px sans-serif';
			ctx.fillText('B35', 20, 40);
			
			for (let i = 0; i < b35.value.length; i++) {
				const item = b35.value[i];
				const row = Math.floor(i / 2);
				const col = i % 2;
				const x = 20 + col * 355;
				const y = startY + row * 120;
				
				// 绘制卡片背景
				ctx.fillStyle = '#ffffff';
				ctx.fillRect(x, y, 335, 100);
				
				// 绘制图片
				try {
					const imageInfo = await new Promise((resolve, reject) => {
						uni.getImageInfo({
							src: route + item.song_id + '.png',
							success: resolve,
							fail: reject
						});
					});
					ctx.drawImage(imageInfo.path, x + 10, y + 10, 80, 80);
				} catch (err) {
					console.error('获取图片失败:', err);
				}
				
				// 绘制文字
				ctx.fillStyle = '#333333';
				ctx.font = '24px sans-serif';
				ctx.fillText(item.title.substring(0, 15), x + 100, y + 35);
				ctx.fillStyle = '#666666';
				ctx.font = '20px sans-serif';
				ctx.fillText(`难度: ${item.ds}`, x + 100, y + 65);
			}
			
			startY += Math.ceil(b35.value.length / 2) * 120 + 40;
		}
		
		// 遍历并绘制 B15 数据
		if (b15.value && b15.value.length) {
			// 绘制 B15 标题
			ctx.fillStyle = '#333333';
			ctx.font = 'bold 32px sans-serif';
			ctx.fillText('B15', 20, startY);
			
			startY += 40;
			
			for (let i = 0; i < b15.value.length; i++) {
				const item = b15.value[i];
				const row = Math.floor(i / 2);
				const col = i % 2;
				const x = 20 + col * 355;
				const y = startY + row * 120;
				
				// 绘制卡片背景
				ctx.fillStyle = '#ffffff';
				ctx.fillRect(x, y, 335, 100);
				
				// 绘制图片
				try {
					const imageInfo = await new Promise((resolve, reject) => {
						uni.getImageInfo({
							src: route + item.song_id + '.png',
							success: resolve,
							fail: reject
						});
					});
					ctx.drawImage(imageInfo.path, x + 10, y + 10, 80, 80);
				} catch (err) {
					console.error('获取图片失败:', err);
				}
				
				// 绘制文字
				ctx.fillStyle = '#333333';
				ctx.font = '24px sans-serif';
				ctx.fillText(item.title.substring(0, 15), x + 100, y + 35);
				ctx.fillStyle = '#666666';
				ctx.font = '20px sans-serif';
				ctx.fillText(`难度: ${item.ds}`, x + 100, y + 65);
			}
		}
		
		// 绘制完成后保存
		await new Promise((resolve) => {
			ctx.draw(false, () => {
				setTimeout(resolve, 300);
			});
		});
		
		// 将画布内容转换为图片
		const tempFilePath = await new Promise((resolve, reject) => {
			uni.canvasToTempFilePath({
				canvasId: 'myCanvas',
				success: (res) => resolve(res.tempFilePath),
				fail: reject
			});
		});
		
		// 保存到相册
		await uni.saveImageToPhotosAlbum({
			filePath: tempFilePath
		});
		
		uni.showToast({
			title: '保存成功',
			icon: 'success'
		});
		
	} catch (error) {
		console.error('保存图片失败:', error);
		uni.showToast({
			title: '保存失败，请检查相册权限',
			icon: 'none',
			duration: 2000
		});
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
		uni.removeStorageSync('uid')
		uni.removeStorageSync('divingFish_username');
		uni.removeStorageSync('qq_channel_uid')
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
		uid.value=-1;
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
	maiApi.divingFishRefreshImportToken(jwt_token.value)
	setProfile(jwt_token.value)
};

// 添加从相册导入的方法
const chooseImage = () => {
   uni.scanCode({
	scanType:['qrCode'],
   	success: function (res) {
   			qrCodeInput.value=res.result
			console.log(res.result)
   		}
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



</script>

<style lang='scss'>
@import "../../css/maib50.scss";

</style>
