<template>
  <view class="user-center">
    <!-- 顶部用户信息区域 -->
    <view class="user-info-container">
      <view class="user-card">
      <view class="avatar-container" @click="showAvatarSelector">
          <image class="avatar" :src="avatar || '/static/default-avatar.jpg'" mode="aspectFill"></image>
        </view>
        <view class="user-details">
          <view class="username">{{ nickname || username || '请先登录' }}</view>
          <view class="user-id" v-if="(uid !== -1)&& isLoggedIn">绑定账号: {{ mainame }}</view>
          <view v-show="(uid == '' || uid == -1 || uid == null||uid==undefined) && isLoggedIn" class="user-id hint-text" v-else @click="handleQrCode">绑定二维码关联舞萌账号</view>
        </view>
        <RatingDisplay 
          :b35rating="b35rating" 
          :b15rating="b15rating"
          :isLoggedIn="isLoggedIn"
        />
      </view>
    </view>
    
    <!-- 功能模块区域 - 仅在登录后显示 -->
    <view class="modules-container" v-if="isLoggedIn">
      <view class="section-title has-data">
        <view class="title-content">功能中心</view>
      </view>
      
      <view class="function-grid">
        <!-- 乐曲搜索 -->
        <view class="function-item song-search" @click="handleSongSearch">
          <view class="function-icon">
            <view class="icon-image" style="-webkit-mask-image: url('/static/icons/search.png'); mask-image: url('/static/icons/search.png');"></view>
          </view>
          <view class="function-name">乐曲搜索</view>
          <view class="function-desc">查询舞萌曲库所有歌曲</view>
        </view>
        
        <!-- 成绩查询 -->
        <view class="function-item my-scores" @click="handlePlayerRecords">
          <view class="function-icon">
            <view class="icon-image" style="-webkit-mask-image: url('/static/icons/record.png'); mask-image: url('/static/icons/record.png');"></view>
          </view>
          <view class="function-name">成绩查询</view>
          <view class="function-desc">查看你的游玩数据</view>
        </view>
        
        <!-- 歌曲推荐 -->
        <view class="function-item song-recommend" @click="navigateToRecommend">
          <view class="function-icon">
            <view class="icon-image" style="-webkit-mask-image: url('/static/icons/recommend.png'); mask-image: url('/static/icons/recommend.png');"></view>
          </view>
          <view class="function-name">歌曲推荐</view>
          <view class="function-desc">基于你的水平推荐歌曲</view>
        </view>
        
		<!-- 数据分析 -->
		<view class="function-item data-analysis" @click="handleB50">
		  <view class="function-icon">
		    <view class="icon-image" style="-webkit-mask-image: url('/static/icons/b50.png'); mask-image: url('/static/icons/b50.png');"></view>
		  </view>
		  <view class="function-name">B50查询</view>
		  <view class="function-desc">来查查你的Best50</view>
		</view>
		
        <!-- 热门乐曲排行 -->
        <view class="function-item chart-stats" @click="navigateToChartStats">
          <view class="function-icon">
            <view class="icon-image" style="-webkit-mask-image: url('/static/icons/random.png'); mask-image: url('/static/icons/random.png');"></view>
          </view>
          <view class="function-name">Mai什么</view>
          <view class="function-desc">抽取1~4首随机乐曲进行游玩</view>
        </view>
        
        <!-- 工具箱 -->
        <view class="function-item toolbox" @click="navigateToToolbox">
          <view class="function-icon">
            <view class="icon-image" style="-webkit-mask-image: url('/static/icons/tools.png'); mask-image: url('/static/icons/tools.png');"></view>
          </view>
          <view class="function-name">工具箱</view>
          <view class="function-desc">实用工具与小功能</view>
        </view>
        
   
      </view>
      
      <view class="section-title has-data">
        <view class="title-content">用户相关</view>
      </view>
      
      <view class="function-grid account-grid">
        <!-- 绑定二维码 -->
     
		
		<view class="function-item favorite" @click="navigateToFavorite">
		  <view class="function-icon">
		    <view class="icon-image" style="-webkit-mask-image: url('/static/icons/favorites.png'); mask-image: url('/static/icons/favorites.png');"></view>
		  </view>
		  <view class="function-name">我的收藏</view>
		  <view class="function-desc">查看我收藏的乐曲</view>
		</view>
		
    <view class="function-item update-scores" @click="divingFishUpdate">
		  <view class="function-icon">
		    <view class="icon-image" style="-webkit-mask-image: url('/static/icons/upload.png'); mask-image: url('/static/icons/upload.png');"></view>
		  </view>
		  <view class="function-name">更新成绩</view>
		  <view class="function-desc">更新水鱼查分器成绩</view>
		</view>
        <!-- 账号设置 -->
        <view class="function-item account-settings" @click="handleAccountSettings">
          <view class="function-icon">
            <view class="icon-image" style="-webkit-mask-image: url('/static/icons/settings.png'); mask-image: url('/static/icons/settings.png');"></view>
          </view>
          <view class="function-name">账号设置</view>
          <view class="function-desc">管理个人账号</view>
        </view>
        
        <view class="function-item qr-code" @click="handleQrCode">
          <view class="function-icon">
            <view class="icon-image" style="-webkit-mask-image: url('/static/icons/qrcode.png'); mask-image: url('/static/icons/qrcode.png');"></view>
          </view>
          <view class="function-name">绑定二维码</view>
          <view class="function-desc">关联舞萌DX账号</view>
        </view>

		
		
	

    <view class="function-item refresh-api" @click="handleRefreshAPI">
          <view class="function-icon">
            <view class="icon-image" style="-webkit-mask-image: url('/static/icons/refresh.png'); mask-image: url('/static/icons/refresh.png');"></view>
          </view>
          <view class="function-name">刷新API</view>
          <view class="function-desc">重新从API获取数据(功能异常时使用)</view>
        </view>
        
        <!-- 添加检查更新按钮 -->
        <view class="function-item check-update" @click="checkForUpdates">
          <view class="function-icon">
            <view class="icon-image" style="-webkit-mask-image: url('/static/icons/update.png'); mask-image: url('/static/icons/update.png');"></view>
          </view>
          <view class="function-name">检查更新</view>
          <view class="function-desc">检查应用是否有新版本</view>
        </view>
      </view>
    </view>
    
    <!-- 登录/登出按钮 -->
    <view class="login-button" @click="isLoggedIn ? handleLogout() : navigateToLogin()">
      <view class="login-text">{{ isLoggedIn ? '退出登录' : '点击登录' }}</view>
    </view>

    <!-- 二维码绑定组件 -->
    <QrCodeModal 
      v-model:visible="showQrModal" 
      @confirm="handleQrConfirm" 
    />

    <!-- 账号设置组件 -->
    <AccountSettingsModal 
      v-model:visible="showSettingsModal"
      :user-data="{
        nickname,
        importToken,
        bind_qq: qqid,
        qq_channel_uid
      }"
      @confirm="handleSettingsConfirm"
      @refresh-token="refreshToken"
    />

    <!-- 头像选择器弹窗 -->
    <uni-popup ref="avatarPopup" type="bottom">
      <view class="avatar-selector">
        <view class="avatar-selector-header">
          <text class="avatar-selector-title">选择头像</text>
          <text class="close-btn" @click="closeAvatarSelector">×</text>
        </view>
        <scroll-view scroll-y class="avatar-grid">
          <view class="avatar-list">
            <view 
              v-for="(icon, index) in avatarList" 
              :key="index" 
              class="avatar-item"
              @click="selectAvatar(icon)"
            >
              <image :src="icon" mode="aspectFill" class="avatar-option"></image>
            </view>
          </view>
        </scroll-view>
      </view>
    </uni-popup>

    <!-- 添加更新检查器组件 -->
   <UpdateChecker
     ref="updateChecker"
     :current-version="currentVersion"
     :auto-check="false"
     @api-refreshed="handleApiRefreshed"
   />
  </view>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import * as maiApi from '../../api/maiapi.js';
import {onLoad} from '@dcloudio/uni-app'
import QrCodeModal from '@/components/QrCodeModal.vue';
import AccountSettingsModal from '@/components/AccountSettingsModal.vue';
import RatingDisplay from '@/components/RatingDisplay.vue';
import UpdateChecker from '@/components/UpdateChecker.vue'; // 导入更新检查器组件
import {b50adapter} from '@/util/b50adapter.js'
import { avatarList as importedAvatarList } from '../../utils/avatarList.js';
import {addAPICount,getVersion} from '@/api/myapi.js';
// 确保导入 uni-popup 组件
import uniPopup from '@/uni_modules/uni-popup/components/uni-popup/uni-popup.vue'
import { remoteRoute, version } from '../../apiconfig.js';

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
let avatar=ref('../../static/maiicon/UI_Icon_409503.jpg')
let QrCode=ref('');
let uid=ref(-1);

let mainame=ref('')

// 计算属性：根据rating值返回对应的样式类名
const ratingClass = computed(() => {
  const rating = b15rating.value+b35rating.value;
  if (!rating) return 'default';
  
  if (rating >= 15000) return 'rainbow';
  if (rating >= 14500) return 'bright-gold';
  if (rating >= 14000) return 'gold';
  if (rating >= 13000) return 'blue';
  if (rating >= 12000) return 'copper';
  return 'default';
});

// 从本地获取b50数据并计算rating
function calculateRatingFromLocalB50() {
  try {
    // 尝试从本地存储获取b50数据
    const b50Data = uni.getStorageSync('b50Data');
    
    if (!b50Data) {
      console.log('本地无b50数据');
      return null;
    }
    
    // 解析b50数据
    const musicData = JSON.parse(b50Data);
    
    if (!musicData || !musicData.charts || !musicData.charts.length) {
      console.log('b50数据格式无效');
      return null;
    }
    
    // 获取新旧曲目的成绩并计算rating
    const newChartsWithRating = [];
    const oldChartsWithRating = [];
    
    musicData.charts.forEach(chart => {
      if (chart && chart.ds && chart.ra && chart.achievements) {
        const chartWithRating = {
          ds: chart.ds,
          ra: chart.ra,
          achievements: chart.achievements
        };
        
        if (chart.is_new) {
          newChartsWithRating.push(chartWithRating);
        } else {
          oldChartsWithRating.push(chartWithRating);
        }
      }
    });
    
    // 按照rating排序
    newChartsWithRating.sort((a, b) => b.ra - a.ra);
    oldChartsWithRating.sort((a, b) => b.ra - a.ra);
    
    // 取新曲最好的10首和旧曲最好的40首
    const newChartsRating = newChartsWithRating.slice(0, 10).reduce((sum, chart) => sum + chart.ra, 0);
    const oldChartsRating = oldChartsWithRating.slice(0, 40).reduce((sum, chart) => sum + chart.ra, 0);
    
    // 计算总rating
    const totalRating = newChartsRating + oldChartsRating;
    
    return {
      rating: totalRating,
      lastUpdate: new Date(musicData.updateTime || Date.now()).toLocaleString('zh-CN', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  } catch (error) {
    console.error('计算本地b50 rating失败:', error);
    return null;
  }
}

// 从API获取b50数据并计算rating

// 加载用户资料 - 与maib50完全相同
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
	console.log(records)
	uni.setStorageSync('divingFish_records',records.value)
	
}
onLoad(async () => {
	console.log(1)
	// coverlist.value = await fileutil.getDirectoryFiles(localroute)
	qqid.value = uni.getStorageSync('divingFish_qqid');
	nickname.value = uni.getStorageSync('divingFish_nickname');
	importToken.value = uni.getStorageSync('divingFish_importToken');
	records.value = uni.getStorageSync('divingFish_records');
	uid.value = uni.getStorageSync('uid');
	mainame.value=uni.getStorageSync('mainame');
	// 判断uid是否为数字，如果不是则设置为-1
	uid.value = typeof uid.value === 'number' ? uid.value : -1;
	console.log('uid', uid.value)
	username.value = uni.getStorageSync('divingFish_username')
	qq_channel_uid.value=uni.getStorageSync('qq_channel_uid')
	jwt_token.value = uni.getStorageSync('divingFish_jwt_token');
	console.log('nickname'+nickname.value)
	await getb50local();
	
	// 加载用户头像
	const savedAvatar = uni.getStorageSync('user_avatar');
	if (savedAvatar) {
		avatar.value = savedAvatar;
		console.log('已加载保存的头像:', avatar.value);
	}
	
	// 加载头像列表
	loadAvatarList();
	
	await getb50local();
});
// 其他处理函数保持不变
const handleSettings = () => {
	
  uni.navigateTo({
    url: '/pages/settings/index'
  });
};



const handlePlayerRecords = () => {	
  uni.navigateTo({
    url: '/pages/PlayerRecords/PlayerRecords'
  });
  addAPICount('PlayerRecords')
};

const handleB50 = () => {
  uni.navigateTo({
    url: '/pages/maiupdate/maib50'
  });
  addAPICount('MaiB50')
};

const handleSongSearch = () => {
  uni.navigateTo({
    url: '/pages/song-search/song-search'
  });
  addAPICount('SongSearch')
};


const handleLogout = () => {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success: (res) => {
		if(res.cancel){
			return
		}
      if (res.confirm) {
        // 清除用户凭证
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
        uni.removeStorageSync('mainame')
        // 清除 rating 相关数据
        uni.removeStorageSync('b35rating');
        uni.removeStorageSync('b15rating');
        uni.removeStorageSync('totalRating');
        
        // 重置响应式变量
        b35.value = '';
        b15.value = '';
        b15rating.value = 0;
        b35rating.value = 0;
        username.value = '';
        password.value = '';
        nickname.value = '';
        qqid.value = '';
        importToken.value = '';
        qq_channel_uid.value = '';
        jwt_token.value = '';
        records.value = '';
        avatar.value = '../../static/maiicon/UI_Icon_409503.jpg';
        QrCode.value = '';
        uid.value = -1;
        mainame.value='';
        uni.showToast({
          title: '已退出登录',
          icon: 'none',
          position:'center'
        });
        
        // setTimeout(() => {
        //   uni.navigateTo({
        //     url: '/pages/login/login'
        //   });
        // }, 100);
      }
    }
  });
};

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

// 添加状态变量控制显示/隐藏
const showQrModal = ref(false);
const showSettingsModal = ref(false);

// 处理二维码绑定
function handleQrCode() {	
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

// 处理二维码提交
async function handleQrConfirm(qrContent) {
  if (!qrContent) return;
  
  try {
	  console.log('二维码'+qrContent)
    // 这里应该有处理二维码的逻辑
    // 假设getUidFromQrCode方法已经存在
    const uidResult = await maiApi.maiGetUid(qrContent);
    console.log(uidResult)
	if(uidResult.data.userID==-1)
	{
		uni.showToast({
		  title: '您输入的有误或已过期',
		  icon: 'none'
		});
	}
   else if (uidResult && (uidResult.data.userID!=-1)) {
      uid.value = uidResult.data.userID;
      uni.setStorageSync('uid', uidResult.data.userID);
	  mainame.value=(await maiApi.maiGetUserPreview(uid.value)).data.userName;
	  uni.setStorageSync('mainame', mainame.value);
      await divingFishUpdate();
      uni.showToast({
        title: '二维码绑定成功',
        icon: 'success'
      });
    }
  } catch (error) {
    console.error('二维码绑定失败:', error);
    uni.showToast({
      title: '绑定失败，请重试',
      icon: 'none'
    });
  }
}

// 处理账号设置
function handleAccountSettings() {
  showSettingsModal.value = true;
}

// 处理设置提交
 async function handleSettingsConfirm(formData) {
  // 更新设置
try {
		if (!jwt_token.value) {
			uni.showToast({
				title: '登录已过期，请重新登录',
				icon: 'none',
				duration: 2000
			});
			return;
		}
		
		const res = await maiApi.divingFishSetProfile(formData.nickname,formData.bind_qq,formData.qq_channel_uid,jwt_token.value)
		console.log(res);
		if (res.statusCode==200) {  // 成功时会返回用户信息
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
			  showSettingsModal.value = false;
			
		}else
		{
			throw(res.data);
		}
		
	
	} catch (error) {
		
		uni.showModal({
			title: '更新失败',
			content: '网络请求失败或QQ/频道ID已被绑定',
			showCancel: false,
			confirmText: '知道了',
			confirmColor: '#818cf8'
		});
	}
}

// 刷新Token
async function refreshToken() {
  try {
    uni.showModal({
    	title:'重置导入Token',
    	content:'您确定要重置导入Token吗,这会使你原来的Token失效',
    	success:(async(e)=>{
    		if(e.confirm){
    	   let res=await maiApi.divingFishRefreshImportToken(jwt_token.value)
    	
    	   importToken.value=res.data.token;
		  uni.showToast({
		    title: 'Token已更新',
		    icon: 'success'
		  });
    	  }
    	}),
    })
   
  } catch (error) {
    console.error('刷新Token失败:', error);
    uni.showToast({
      title: '刷新失败',
      icon: 'error'
    });
  }
}

// 计算用户是否已登录
const isLoggedIn = computed(() => {
  return  !(jwt_token.value=='')
});

// 登录页面跳转
function navigateToLogin() {
  uni.navigateTo({
    url: '/pages/login/login'  // 目前使用maib50作为登录页面
  });
}

// 添加新的导航函数
const navigateToRecommend = () => {

  uni.navigateTo({
    url: '/pages/song-recommend/song-recommend'
  });
  	addAPICount('SongRecommend')
};

const navigateToFavorite = () =>{
	uni.navigateTo({
	  url: '/pages/favorites/favorites'
	});
	addAPICount('Favorites')
}

const navigateToChartStats = () => {

  uni.navigateTo({
    url: '/pages/song-lottery/song-lottery'
  });
  	addAPICount('SongLottery')
};

const navigateToToolbox = () => {
 
  uni.navigateTo({
    url: '/pages/toolbox/toolbox'
  });
   addAPICount('ToolBox')
};

// 刷新API数据
const handleRefreshAPI = async () => {
	
  try {
    uni.showLoading({
      title: '刷新中...',
      mask: true
    });
    
    // 刷新基础数据
    const baseDataResults = await maiApi.refreshAllBaseData();
    
    
    uni.hideLoading();
   
   
    if (baseDataResults.success) {
		  addAPICount('RefreshAPI')
      uni.showToast({
        title: '数据已全部更新',
        icon: 'success'
      });
    } else {
      // 部分更新成功
      const successCount = [
        baseDataResults.musicData,
        baseDataResults.aliasData, 
        baseDataResults.chartStats
      ].filter(Boolean).length;
      
      uni.showToast({
        title: `部分数据更新成功(${successCount}/3)`,
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('刷新数据失败:', error);
    uni.hideLoading();
    uni.showToast({
      title: '刷新失败',
      icon: 'none'
    });
  }
};

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
	async function updateMusicData(musicScoreList){
		
		let res = await maiApi.divingFishUpdateData(musicScoreList, importToken.value);
		console.log(res)
		return res;
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
	const timeCutDown=10000;
		let cutDownTime=0;
		let isProcessing=ref(false);
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
			await getb50();
			uni.hideLoading();
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
				title:'网络异常或导入Token失效,请尝试重新登录',
				icon:"fail",
				position:"center"
			})
		} finally {
			isProcessing.value = false;
			cutDownTime=new Date().getTime()+timeCutDown;
		}
	}

// 添加头像选择器相关变量
const avatarPopup = ref(null);
const avatarList = ref([]);

// 加载头像列表
const loadAvatarList = () => {
  try {
    // 使用导入的头像列表
    avatarList.value = importedAvatarList;
    console.log('头像列表已加载:', avatarList.value.length);
  } catch (error) {
    console.error('加载头像列表失败:', error);
    
    // 出错时使用默认列表
    const icons = [];
    for (let i = 1; i <= 50; i++) {
      const formattedNumber = String(i).padStart(6, '0');
      icons.push(`../../static/maiicon/UI_Icon_${formattedNumber}.jpg`);
    }
    avatarList.value = icons;
  }
};

// 显示头像选择器
const showAvatarSelector = () => {
  if (isLoggedIn.value) {
    console.log('打开头像选择器');
    if (avatarPopup.value) {
      avatarPopup.value.open();
    } else {
      console.error('avatarPopup 引用为空');
      // 尝试在下一个渲染周期获取引用
      setTimeout(() => {
        if (avatarPopup.value) {
          avatarPopup.value.open();
        } else {
          uni.showToast({
            title: '无法打开头像选择器',
            icon: 'none'
          });
        }
      }, 100);
    }
  } else {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    });
  }
};

// 关闭头像选择器
const closeAvatarSelector = () => {
  console.log('关闭头像选择器');
  if (avatarPopup.value) {
    avatarPopup.value.close();
  }
};

// 选择头像
const selectAvatar = (iconPath) => {
  console.log('选择头像:', iconPath);
  avatar.value = iconPath;
  // 保存到本地存储
  uni.setStorageSync('user_avatar', iconPath);
  closeAvatarSelector();
  uni.showToast({
    title: '头像已更新',
    icon: 'success'
  });
};

// 确保在组件挂载后初始化弹窗
onMounted(() => {
  console.log('组件已挂载');
  // 确保弹窗组件已正确初始化
  setTimeout(() => {
    if (avatarPopup.value) {
      console.log('弹窗组件已初始化');
    } else {
      console.warn('弹窗组件未初始化');
    }
  }, 500);
});

// 添加当前版本号和更新检查器引用
const currentVersion = ref(version);
const updateChecker = ref(null);

// 修改检查更新的方法
const checkForUpdates = async () => {
 
   if (updateChecker.value) {
     uni.showLoading({
       title: '检查更新中...'
     });
	 // const response = await getVersion();
  //        if (response.data && response.data.version) {
  //          // 比较版本号
		//     uni.hideLoading();
  //          if (response.data.version === currentVersion.value) {
  //            uni.showToast({
  //              title: '已是最新版本',
  //              icon: 'success',
  //              duration: 2000
  //            });
			 
  //            return;
  //          }
  //    	}
     // 调用UpdateChecker组件的checkUpdate方法，传入true表示强制检查
     updateChecker.value.checkUpdate(true).then(hasUpdate => {
       uni.hideLoading();
       
       // 如果没有更新，显示已是最新版本的提示
       if (!hasUpdate) {
         uni.showToast({
           title: '已是最新版本',
           icon: 'success',
           duration: 2000
         });
       }
     }).catch(error => {
       uni.hideLoading();
       uni.showToast({
         title: '检查更新失败',
         icon: 'none',
         duration: 2000
       });
       console.error('检查更新失败:', error);
     });
   } else {
     uni.showToast({
       title: '更新组件未初始化',
       icon: 'none'
     });
   }

	
};

// 处理API刷新完成事件
const handleApiRefreshed = (data) => {
  console.log('API已刷新:', data);
  uni.showToast({
    title: 'API数据已更新',
    icon: 'success'
  });
};
</script>

<style lang="scss" scoped>
.user-center {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #f7f9ff 0%, #eff0fd 100%);
  padding: 40rpx 20rpx 60rpx;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  box-sizing: border-box;
  
  .user-info-container {
    max-width: 750rpx;
    margin: 0 auto 40rpx;
    
    .user-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 24rpx;
      padding: 40rpx 30rpx;
      box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      border: 1px solid rgba(255, 255, 255, 0.7);
      animation: fadeInDown 1s;
      
      .avatar-container {
        position: relative;
        cursor: pointer;
        padding: 4rpx;
      }
      
      .avatar {
        width: 150rpx;
        height: 150rpx;
        border-radius: 16rpx;
        border: 4rpx solid #fff;
        box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
        box-sizing: border-box;
        display: block;
      }
      
      .user-details {
        flex: 1;
        width: 100%;
        justify-content: center;
        align-items: center;
        text-align: center;
        margin: 16rpx 0;
        
        .username {
          font-size: 36rpx;
          font-weight: bold;
          color: black;
          margin-bottom: 8rpx;
          text-align: center;
          width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          padding: 0 20rpx;
          box-sizing: border-box;
        }
        
        .user-id {
          font-size: 24rpx;
          color: black;
          text-align: center;
          display: block;
          width: 100%;
          margin-top: 4rpx;
        }
        
        .hint-text {
          color: #3b82f6 !important;
          text-decoration: underline;
          font-weight: 500;
          cursor: pointer;
          display: block;
          width: 100%;
          margin-top: 4rpx;
        }
      }
      
      .rating-card {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 20rpx;
        padding: 20rpx 40rpx;
        margin: 10rpx;
        box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
        text-align: center;
        width: 80%;
        border: 1px solid rgba(255, 255, 255, 0.7);
        position: relative;
        
        .rating-title {
          font-size: 24rpx;
          font-weight: 500;
          letter-spacing: 2rpx;
          opacity: 0.7;
          text-transform: uppercase;
          margin-bottom: 8rpx;
          position: relative;
          z-index: 1;
        }
        
        .rating-value {
          font-size: 56rpx;
          font-weight: 800;
          line-height: 1.2;
          position: relative;
          z-index: 1;
          margin: 4rpx 0;
        }
        
        .rating-subtitle {
          font-size: 20rpx;
          font-weight: 500;
          opacity: 0.5;
          letter-spacing: 1rpx;
          margin-top: 4rpx;
        }
        
        // 默认样式（<12000）
        &.default {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95));
          .rating-title, .rating-subtitle { color: #64748b; }
          .rating-value { color: #1e293b; }
        }
        
        // 铜色样式（12000+）
        &.copper {
          background: linear-gradient(135deg, #fde4cf 0%, #d6a285 100%);
          .rating-title, .rating-subtitle { color: rgba(124, 45, 18, 0.8); }
          .rating-value {
              background: linear-gradient(135deg, #c2410c, #9a3412);
              -webkit-background-clip: text;
              color: transparent;
          }
        }
        
        // 蓝色样式（13000+）
        &.blue {
          background: linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%);
          .rating-title, .rating-subtitle { color: rgba(30, 58, 138, 0.8); }
          .rating-value {
              background: linear-gradient(135deg, #3b82f6, #1d4ed8);
              -webkit-background-clip: text;
              color: transparent;
          }
        }
        
        // 金色样式（14000+）
        &.gold {
          background: linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%);
          .rating-title, .rating-subtitle { color: rgba(146, 64, 14, 0.8); }
          .rating-value {
              background: linear-gradient(135deg, #d97706, #92400e);
              -webkit-background-clip: text;
              color: transparent;
          }
        }
        
        // 亮金色样式（14500+）
        &.bright-gold {
          background: linear-gradient(135deg, #fef9c3 0%, #fde047 100%);
          .rating-title, .rating-subtitle { color: rgba(133, 77, 14, 0.8); }
          .rating-value {
              background: linear-gradient(135deg, #facc15, #eab308);
              -webkit-background-clip: text;
              color: transparent;
          }
        }
        
        // 彩虹色样式（15000+）
        &.rainbow {
          background: linear-gradient(135deg, #fff8f8 0%, #fff4f4 100%);
          &::before {
              content: '';
              position: absolute;
              top: 0;
              left: -50%;
              right: -50%;
              bottom: 0;
              background: linear-gradient(
                  90deg,
                  rgba(255, 82, 82, 0.2),
                  rgba(255, 186, 0, 0.2),
                  rgba(0, 255, 127, 0.2),
                  rgba(0, 191, 255, 0.2),
                  rgba(148, 0, 211, 0.2),
                  rgba(255, 82, 82, 0.2),
              );
              background-size: 400% 100%;
              animation: rainbow-bg 16s linear infinite;
              filter: blur(8px);
              opacity: 0.6;
          }
          
          .rating-title, .rating-subtitle { 
              color: rgba(30, 41, 59, 0.7);
          }
          
          .rating-value {
              background: linear-gradient(
                  90deg,
                  #ff3232,
                  #ffb511,
                  #11dd88,
                  #00bfff,
                  #8965d3,
                  #ff3232
              );
              background-size: 300% 100%;
              -webkit-background-clip: text;
              color: transparent;
              animation: rainbow-text 24s linear infinite;
          }
        }
      }
    }
  }
  
  .modules-container {
    max-width: 750rpx;
    margin: 0 auto 40rpx;
    
    .section-title {
      font-size: 32rpx;
      font-weight: 800;
      margin: 28rpx auto;
      margin-bottom: 20rpx;
      margin-top: -15rpx;
      color: black;
      padding: 10rpx 20rpx;
      border-radius: 12rpx;
      position: relative;
      overflow: hidden;
      display: inline-block;
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      min-width: 150rpx;
      padding-top: 15rpx;
      padding-bottom: 25rpx;
      text-align: center;
      background: transparent;
      box-shadow: none;
      transform: translateX(-20rpx);
      opacity: 0.7;
      
      .title-content {
        position: relative;
        display: inline-block;
        padding: 0 30rpx;
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        transform: translateX(0);
        
        &::before,
        &::after {
          content: '';
          position: absolute;
          top: 50%;
          width: 0;
          height: 70%;
          background: linear-gradient(to bottom, #2196F3, #4CAF50);
          border-radius: 4rpx;
          transform: translateY(-50%);
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 0;
        }
        
        &::before {
          left: 0;
        }
        
        &::after {
          right: 0;
        }
      }
      
      &.has-data {
        display: block;
        text-align: center;
        width: calc(95% - 20rpx);
        margin-left: auto;
        margin-right: auto;
        background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.9));
        box-shadow: 0 4rpx 12rpx rgba(99,102,241,0.08);
        backdrop-filter: blur(10px);
        transform: translateX(0);
        opacity: 1;
        
        .title-content {
          transform: translateX(0);
          
          &::before,
          &::after {
            width: 8rpx;
            opacity: 1;
          }
        }
      }
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 2rpx;
       // background: linear-gradient(to bottom, #2196F3, #4CAF50);
        transform: scaleX(0);
        transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        transform-origin: left;
      }
      
      &.has-data::after {
        transform: scaleX(1);
      }
    }
    
    .function-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15rpx;
      margin-bottom: 40rpx;
      
      &.account-grid {
        grid-template-columns: repeat(2, 1fr);
        
        // 第一行 - 蓝紫色系列
        .function-item:nth-child(1), 
        .function-item:nth-child(2) {
          &::before {
            background: linear-gradient(90deg, #97a1ff, #768bf3);
          }
          
          .function-icon {
            color: #8b5cf6;
             background: rgba(255, 255, 255, 0.85);
          }
        }
        
        // 第一行微调 - 第二个元素稍微深一点
        .function-item:nth-child(2) {
          &::before {
            background: linear-gradient(90deg, #97a1ff, #768bf3);
          }
          
          .function-icon {
            color: #7c3aed;
            background: rgba(255, 255, 255, 0.85);
          }
        }
        
        // 第二行 - 靛蓝色系列
        .function-item:nth-child(3), 
        .function-item:nth-child(4) {
        &::before {
          background: linear-gradient(90deg, #ffc2e4, #f483be);
        }
        
        .function-icon {
          color: #e864a6;
           background: rgba(255, 255, 255, 0.85);
        }
        }
        
        // 第二行微调 - 第二个元素稍微深一点
        .function-item:nth-child(4) {
          &::before {
            background: linear-gradient(90deg, #ffc2e4, #f483be);
                   }
                   
                   .function-icon {
                     color: #ec4899;
                      background: rgba(255, 255, 255, 0.85);
                   }
        }
        
        // 第三行 - 紫色系列
        .function-item:nth-child(5), 
        .function-item:nth-child(6) {
          &::before {
            background: linear-gradient(90deg, #cca2ff, #894bf4);
          }
          
          .function-icon {
            color: #a855f7;
            background: rgba(255, 255, 255, 0.85);
          }
        }
        
        // 第三行微调 - 第二个元素稍微深一点
        .function-item:nth-child(6) {
          &::before {
            background: linear-gradient(90deg, #cba5f9, #894bf4);
          }
          
          .function-icon {
            color: #9333ea;
             background: rgba(255, 255, 255, 0.85);
          }
        }
      }
      
      .function-item {
        background: white;
        border-radius: 16rpx;
        padding: 25rpx 20rpx 30rpx;
        box-shadow: 0 4rpx 12rpx rgba(99,102,241,0.08);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        
        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 140rpx;
          border-top-left-radius: 16rpx;
          border-top-right-radius: 16rpx;
          opacity: 0.25;
          z-index: 0;
        }
        
        .function-icon {
          font-size: 48rpx;
          margin-bottom: 20rpx;
          background: transparent;
          width: 100rpx;
          height: 100rpx;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16rpx;
          position: relative;
          box-shadow: none;
          z-index: 1;
          color: #ffffff;
          
          &::after, &::before {
            display: none;
          }
        }
        
        .function-name {
          font-size: 32rpx;
          font-weight: 600;
          color: #1e293b;
		  margin-top:15rpx;
          margin-bottom:3rpx;
          position: relative;
          z-index: 1;
        }
        
        .function-desc {
          font-size: 22rpx;
          color: #64748b;
          line-height: 1.4;
          position: relative;
          z-index: 1;
        }
        
        &:active {
          transform: translateY(2rpx) scale(0.98);
          box-shadow: 0 2rpx 6rpx rgba(99,102,241,0.05);
        }
        
        // 统一使用蓝紫粉色调
        &.refresh-api {
          &::before {
            background: linear-gradient(90deg, #818cf8, #6366f1);
          }
          
          .function-icon {
            color: #6366f1;
            background: rgba(255, 255, 255, 0.85);
          }
        }
        
        &.account-settings {
          &::before {
            background: linear-gradient(90deg, #a78bfa, #8b5cf6);
          }
          
          .function-icon {
            background-color: #f765ae;
           background: rgba(255, 255, 255, 0.85);
          }
        }
      
        &.qr-code {
          &::before {
            background: linear-gradient(90deg, #c4b5fd, #a78bfa);
          }
          
          .function-icon {
            background-color: #f765ae;
          background: rgba(255, 255, 255, 0.85);
          }
        }
        
        &.my-scores {
          &::before {
            background: linear-gradient(90deg, #97a1ff, #768bf3);
          }
          
          .function-icon {
            color: #8b5cf6;
           background: rgba(255, 255, 255, 0.85);
          }
        }
        
    
        
        &.song-search {
          &::before {
             background: linear-gradient(90deg, #97a1ff, #768bf3);
          }
          
          .function-icon {
            color: #6366f1;
          background: rgba(255, 255, 255, 0.85);
          }
        }
        
        &.song-recommend {
          &::before {
            background: linear-gradient(90deg, #ffc2e4, #f483be);
          }
          
          .function-icon {
            color: #ec4899;
            background: rgba(255, 255, 255, 0.85);
          }
        }
&.data-analysis {
	
		  &::before {
		    background: linear-gradient(90deg, #ffc2e4, #f483be);
		  }
		  
		  .function-icon {
		    color: #e864a6;
		   background: rgba(255, 255, 255, 0.85);
		  }
		}
        
        &.chart-stats {
            &::before {
              background: linear-gradient(90deg, #cba5f9, #894bf4);
		    }
		  
		    .function-icon {
		    color: #e864fc;
		   background: rgba(255, 255, 255, 0.85);
        }
        }
		
		
        &.toolbox {
		  &::before {
        background: linear-gradient(90deg, #c4b5fd 0%, #7c3aed 100%);
		  }
		  
		  .function-icon {
		    color: #6366f1;
		    background: rgba(255, 255, 255, 0.9);
		  }
        }
        
        &.update-data {
          &::before {
            background: linear-gradient(90deg, #8b5cf6, #7c3aed);
          }
          
          .function-icon {
            color: #7c3aed;
           background: rgba(255, 255, 255, 0.85);
          }
        }
        
        &.check-update {
         &::before {
           background: linear-gradient(90deg, #a78bfa, #8b5cf6);
         }
         
         .function-icon {
           color: #8b5cf6;
          background: rgba(255, 255, 255, 0.9);
         }
        }
        
        // 为"我的收藏"添加独特样式
        &.favorite {
          &::before {
            background: linear-gradient(90deg, #fcd34d, #f59e0b);
          }
          
          .function-icon {
            color: #f59e0b;
            background: rgba(255, 255, 255, 0.85);
          }
        }
        
        // 为"更新成绩"添加独特样式
        &.update-scores {
          &::before {
            background: linear-gradient(90deg, #34d399, #10b981);
          }
          
          .function-icon {
            color: #10b981;
           background: rgba(255, 255, 255, 0.85);
          }
        }
      }
    }
  }
  
  .login-button {
    margin: 40rpx auto;
    width: 80%;
    height: 88rpx;
    background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
    border-radius: 44rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4rpx 12rpx rgba(99, 102, 241, 0.2);
    
    .login-text {
      color: white;
      font-size: 32rpx;
      font-weight: 600;
    }
    
    &:active {
      transform: scale(0.98);
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    }
  }
  
  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-20rpx);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes rainbow-bg {
    0% { background-position: 0% 50%; }
    100% { background-position: 300% 50%; }
  }
  
  @keyframes rainbow-text {
    0% { background-position: 0% 50%; }
    100% { background-position: 300% 50%; }
  }
  
  @keyframes gold-shine {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }
}

// 添加UID提示样式
.hint-text {
  color: #3b82f6 !important;
  text-decoration: underline;
  font-weight: 500;
  cursor: pointer;
}

.avatar-selector {
  background: white;
  border-radius: 24rpx 24rpx 0 0;
  padding-bottom: env(safe-area-inset-bottom, 40rpx);
  max-height: 70vh;
  box-sizing: border-box;
  
  .avatar-selector-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 2rpx solid #f1f5f9;
    
    .avatar-selector-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #1e293b;
    }
    
    .close-btn {
      font-size: 40rpx;
      color: #64748b;
      padding: 0 20rpx;
    }
  }
  
  .avatar-grid {
    max-height: 60vh;
    padding: 20rpx;
    box-sizing: border-box;
    
    .avatar-list {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20rpx;
      padding-bottom: 40rpx;
      
      .avatar-item {
        aspect-ratio: 1;
        border-radius: 16rpx;
        overflow: hidden;
        box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
        transition: all 0.3s ease;
        
        &:active {
          transform: scale(0.95);
        }
        
        .avatar-option {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
  }
}

// 添加图标图片样式
.function-icon {
  .icon-image {
    width: 70rpx;
    height: 70rpx;
    -webkit-mask-size: contain;
    mask-size: contain;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    -webkit-mask-position: center;
    mask-position: center;
  }
}

// 功能中心图标样式
.function-item {
  &.song-search .function-icon {
    background: rgba(255, 255, 255, 0.9);
    
    .icon-image {
      background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
      opacity: 0.9;
    }
  }
  
  &.my-scores .function-icon {
    background: rgba(255, 255, 255, 0.9);
    
    .icon-image {
      background: linear-gradient(135deg, #93c5fd 0%, #6366f1 100%);
      opacity: 0.9;
    }
  }
  
  &.song-recommend .function-icon {
    background: rgba(255, 255, 255, 0.9);
    
    .icon-image {
      background: linear-gradient(135deg, #fda4cf 0%, #f472b6 100%);
      opacity: 0.9;
    }
  }
  
  &.data-analysis .function-icon {
    background: rgba(255, 255, 255, 0.9);
    
    .icon-image {
      transform: scale(1.2); 
      background: linear-gradient(135deg, #fda4cf 0%, #f472b6 100%);
      opacity: 0.9;
    }
  }
  
  &.chart-stats .function-icon {
    background: rgba(255, 255, 255, 0.9);

    .icon-image {
      background: linear-gradient(135deg, #a78bfa 0%, #6d28d9 100%);
      opacity: 0.9;
    }
  }
  
  &.toolbox .function-icon {
    background: rgba(255, 255, 255, 0.9);
    
    .icon-image {
      background: linear-gradient(135deg, #c4b5fd 0%, #7c3aed 100%);
      opacity: 0.95;
    }
  }
  
  &.qr-code .function-icon {
    background: rgba(255, 255, 255, 0.9);
    
    .icon-image {
      background: linear-gradient(135deg, #f9a8d4 0%, #db2777 100%);
      opacity: 0.85;
    }
  }
  
  &.account-settings .function-icon {
    background: rgba(255, 255, 255, 0.9);
   
    .icon-image {
      background: linear-gradient(135deg, #fda4cf 0%, #e11d48 100%);
      opacity: 0.85;
    }
  }
  
  &.favorite .function-icon {
    background: rgba(255, 255, 255, 0.9);
    
    .icon-image {
      background: linear-gradient(135deg, #a5b4fc 0%, #6366f1 100%);
      opacity: 0.9;
    }
  }
  
  &.update-scores .function-icon {
    background: rgba(255, 255, 255, 0.9);
    
    .icon-image {
      transform: scale(1.1);
      background: linear-gradient(135deg, #a5b4fc 0%, #6366f1 100%);
      opacity: 0.9;
    }
  }
  
  &.refresh-api .function-icon {
    background: rgba(255, 255, 255, 0.9);
    
    .icon-image {
      background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%);
      opacity: 0.95;
    }
  }
  
  &.check-update .function-icon {
    background: rgba(255, 255, 255, 0.9);
    
    .icon-image {
      transform: scale(1.2);
      background: linear-gradient(135deg, #a78bfa 0%, #6d28d9 100%);
      opacity: 0.95;
    }
  }
}

// 账号相关图标样式 - 使用nth-child选择器保持原有的行颜色设计

</style>