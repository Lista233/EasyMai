<!-- pages/login/index.vue -->
<template>
  <view class="login-page" :class="{ 'dark-mode': isDarkMode }">
    <view class="flex-container">
      <view class="login-container">
        <view class="login-header">
          <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
          <view class="app-name"><text>EasyMai</text></view>
          <view class="app-slogan">查歌从未如此简单( •̀ ω •́ )✧</view>
          
          <!-- 登录/注册切换tabs -->
          <view class="auth-tabs">
            <view 
              class="tab-item" 
              :class="{ 'active': !isRegisterMode }" 
              @click="isRegisterMode = false"
            >登录</view>
            <view 
              class="tab-item" 
              :class="{ 'active': isRegisterMode }" 
              @click="isRegisterMode = true"
            >注册</view>
          </view>
        </view>
        
        <!-- 登录表单 -->
        <view class="login-form" v-if="!isRegisterMode">
          <view class="input-group">
            <view class="input-label">用户名</view>
            <input
              class="form-input"
              type="text"
              v-model="loginForm.username"
              placeholder="请输入用户名"
              :disabled="isLoading"
            />
          </view>
          
          <view class="input-group">
            <text class="input-label">密码</text>
            <view class="password-input-container">
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="loginForm.password"
                placeholder="请输入密码"
                :disabled="isLoading"
              />
              <view class="toggle-password" @click="togglePasswordVisibility">
                <uni-icons :type="showPassword ? 'eye-slash' : 'eye'" size="24" color="currentColor"></uni-icons>
              </view>
            </view>
          </view>
          
          <view class="remember-forgot">
            <label class="remember-me">
              <checkbox :checked="rememberMe" @click="rememberMe = !rememberMe" color="#6366f1" scale="0.7" />
              <text>记住我</text>
            </label>
            <view class="forgot-password" @click="showRecoveryPopup">忘记密码？</view>
          </view>
          
          <button 
            class="login-button" 
            :class="{ 'loading': isLoading }" 
            @click="handleLogin"
            :disabled="isLoading"
          >
            <view class="button-content" v-if="!isLoading">登录水鱼查分器账号</view>
            <view class="loading-spinner" v-else></view>
          </button>
        </view>
        
        <!-- 注册表单 - 删除了邮箱输入框 -->
        <view class="register-form" v-else>
          <view class="input-group">
            <view class="input-label">用户名</view>
            <input
              class="form-input"
              type="text"
              v-model="registerForm.username"
              placeholder="请输入用户名"
              :disabled="isLoading"
            />
          </view>
          
          <view class="input-group">
            <text class="input-label">密码</text>
            <view class="password-input-container">
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="registerForm.password"
                placeholder="请输入密码"
                :disabled="isLoading"
              />
              <view class="toggle-password" @click="togglePasswordVisibility">
                <uni-icons :type="showPassword ? 'eye-slash' : 'eye'" size="24" color="currentColor"></uni-icons>
              </view>
            </view>
          </view>
          
          <view class="input-group">
            <text class="input-label">确认密码</text>
            <view class="password-input-container">
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="registerForm.confirmPassword"
                placeholder="请再次输入密码"
                :disabled="isLoading"
              />
              <view class="toggle-password" @click="togglePasswordVisibility">
                <uni-icons :type="showPassword ? 'eye-slash' : 'eye'" size="24" color="currentColor"></uni-icons>
              </view>
            </view>
          </view>
          
          <view class="agreement-check">
            <label class="agreement-label">
              <checkbox :checked="agreeToTerms" @click="agreeToTerms = !agreeToTerms" color="#6366f1" scale="0.7" />
              <text>我已阅读并同意</text>
              <text class="agreement-link" @click.stop="openAgreement">《用户协议》</text>
            </label>
          </view>
          
          <button 
            class="register-button" 
            :class="{ 'loading': isLoading}" 
            @click="handleRegister"
            :disabled="isLoading"
          >
            <view class="button-content" v-if="!isLoading">注册水鱼账号</view>
            <view class="loading-spinner" v-else></view>
          </button>
        </view>
        
        <!-- 底部链接提示，根据当前模式显示不同内容 -->
        <view class="mode-switch">
          <text>{{ isRegisterMode ? '已有水鱼账号？' : '还没有水鱼账号？' }}</text>
          <text class="link" @click="isRegisterMode = !isRegisterMode">
            {{ isRegisterMode ? '立即登录' : '立即注册' }}
          </text>
        </view>
      </view>
    </view>
    
    <view class="wave-container">
      <view class="wave wave1"></view>
      <view class="wave wave2"></view>
    </view>
    
    <!-- 忘记密码弹窗 -->
    <uni-popup ref="recoveryPopup" type="center">
      <view class="recovery-popup">
        <view class="recovery-title">重置账户</view>
        <view class="recovery-desc">
          该功能仅限绑定 QQ 的账户使用，我们将会往您的 QQ 邮箱发送账户重置的邮件。
        </view>
        <view class="input-group">
          <view class="input-label">QQ 号码</view>
          <input
            class="form-input"
            type="number"
            v-model="recoveryForm.qq"
            placeholder="请输入您绑定的QQ号"
            :disabled="isRecoveryLoading"
          />
        </view>
        <view class="popup-buttons">
          <button 
            class="popup-btn cancel" 
            @click="closeRecoveryPopup" 
            :disabled="isRecoveryLoading"
          >取消</button>
          <button 
            class="popup-btn confirm" 
            @click="handleRecovery"
            :disabled="isRecoveryLoading"
            :class="{ 'loading': isRecoveryLoading }"
          >
            <view v-if="!isRecoveryLoading">发送邮件</view>
            <view class="loading-spinner" v-else></view>
          </button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted,inject,onBeforeMount} from 'vue';
import * as maiApi from "../../api/maiapi.js";
import * as h5Api from "@/api/h5api.js"
import {updateNativeTabBar} from '@/utils/updateNativeTabBar.js'

// 注入深色模式变量
const isDarkMode = inject('isDarkMode');
const applyTheme = inject('applyTheme');
onBeforeMount(()=>{
	applyTheme();
	updateNativeTabBar(isDarkMode.value)
})
// 模式控制
const isRegisterMode = ref(false);

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: ''
});

// 注册表单数据
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: ''
});

// 恢复账户表单数据
const recoveryForm = reactive({
  qq: ''
});

// 状态变量
const isLoading = ref(false);
const isRecoveryLoading = ref(false);
const showPassword = ref(false);
const rememberMe = ref(false);
const loginError = ref('');
const jwt_token = ref('');
const recoveryPopup = ref(null);
const agreeToTerms = ref(false);

// 切换密码可见性
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

// 显示重置密码弹窗
const showRecoveryPopup = () => {
  recoveryPopup.value.open('center');
};

// 关闭重置密码弹窗
const closeRecoveryPopup = () => {
  recoveryPopup.value.close();
};

// 处理忘记密码
const handleRecovery = async () => {
  if (!recoveryForm.qq) {
    uni.showToast({
      title: '请输入QQ号',
      icon: 'none'
    });
    return;
  }
  
  try {
    isRecoveryLoading.value = true;
    
    // 调用忘记密码API
    const response = await maiApi.divingFishRecovery(recoveryForm.qq);
    
    // 显示API返回的消息
    uni.showToast({
      title: response.data.message || '邮件发送成功',
      icon: 'none'
    });
    
    // 关闭弹窗
    setTimeout(() => {
      closeRecoveryPopup();
      recoveryForm.qq = ''; // 清空输入
    }, 1500);
  } catch (error) {
    console.error('重置密码失败:', error);
    uni.showToast({
      title: error.message || '重置密码失败',
      icon: 'none'
    });
  } finally {
    isRecoveryLoading.value = false;
  }
};

// 设置用户资料
let profile 
async function setProfile(token) {
  try {
    profile = (await maiApi.divingFishGetProfile(token)).data;
    
    // 保存用户资料到本地存储
    uni.setStorageSync('divingFish_nickname', profile.nickname);
    uni.setStorageSync('divingFish_qqid', profile.bind_qq);
    uni.setStorageSync('divingFish_importToken', profile.import_token);
    uni.setStorageSync('qq_channel_uid', profile.qq_channel_uid);

    // 获取记录
    const records = await maiApi.divingFishGetRecords(token);
    uni.setStorageSync('divingFish_records', records);
    await getb50()

    return profile;
  } catch (error) {
    console.error('获取用户资料失败:', error);
    throw error;
  }
}

// 登录处理
const handleLogin = async () => {
  if (!loginForm.username || !loginForm.password) {
    uni.showToast({
      title: '请输入用户名和密码',
      icon: 'none'
    });
    return;
  }
  
  try {
    isLoading.value = true;
        uni.showLoading({
        	title: '登录中...',
        	mask: true
        });
    // 调用登录API
    const res = await maiApi.divingFishLogin(loginForm.username, loginForm.password);
    console.log('登录响应:', res);
    
    // 统一处理token获取
    if (res.data && res.data.token) {
      // 优先从响应数据中获取token
      jwt_token.value = res.data.token;
    } else if (res.header && res.header['set-cookie']) {
      // 如果响应数据中没有token，尝试从cookie中获取
      const cookies = Array.isArray(res.header['set-cookie']) 
        ? res.header['set-cookie'] 
        : [res.header['set-cookie']];
      
      const jwtCookie = cookies.find(cookie => cookie.includes('jwt_token='));
      if (jwtCookie) {
        jwt_token.value = jwtCookie.split(';')[0].split('=')[1];
      }
    }
    
    // 确保token不为空
    if (!jwt_token.value) {
      throw new Error('登录失败，无法获取令牌');
    }
    
    // 保存JWT令牌和用户名到本地存储
    uni.setStorageSync('divingFish_jwt_token', jwt_token.value);
    uni.setStorageSync('divingFish_username', loginForm.username);
    uni.setStorageSync('divingFish_password', loginForm.password);
	
    // 如果选择了"记住我"，则保存凭据
    if (rememberMe.value) {
      uni.setStorageSync('remember_credentials', JSON.stringify({
        username: loginForm.username,
        // 注意：密码应当加密后存储，这里只是示例
        password: loginForm.password
      }));
    }
    uni.hideLoading();
    // 获取用户资料
	
    uni.showLoading({
	    title: '获取档案中...',
	    mask: true
	});
    await setProfile(jwt_token.value);
    uni.hideLoading();
    uni.showToast({
      title: '登录成功',
	  icon:'none',
	  position:'center'
    });
    
    // 跳转到首页
    setTimeout(() => {
      uni.reLaunch({
        url: '/pages/user-center/user-center'
      });
    }, 100);
  } catch (error) {
    console.error('登录失败:', error);
    loginError.value = '用户名或密码错误';
    uni.showToast({
      title: '用户名或密码错误',
      icon: 'none'
    });
  } finally {
    isLoading.value = false;
  }
};


async function getb50(){
	try {
		uni.hideLoading()
		uni.showLoading({
			title: '加载B50中...',
			mask: true
		});
		
		let res = await maiApi.divingFishgetb50(profile.bind_qq, profile.username);
		uni.hideLoading();
		uni.setStorageSync('b50', res);
		console.log('b50',res)
		// 计算并保存 rating 值
		if (res.data) {
			let b35 = res.data.charts.sd;
			let b15 = res.data.charts.dx;
			
			// 初始化 rating 值
			let b35rating = 0;
			let b15rating = 0;
			
			// 计算 B35 rating
			for (let item of b35) {
				b35rating += Number(item.ra);
			}
			
			// 计算 B15 rating
			for (let item of b15) {
				b15rating += Number(item.ra);
			}
			
			// 将计算出的 rating 存储到本地缓存
			uni.setStorageSync('b35rating', b35rating);
			uni.setStorageSync('b15rating', b15rating);
			uni.setStorageSync('totalRating', b35rating + b15rating);
		}
	} catch (error) {
		console.error('获取数据失败:', error);
		uni.showToast({
			title: '获取数据失败，请重试',
			icon: 'none'
		});
	}
}
// 注册处理
const handleRegister = async () => {
	console.log('我点击了注册')
  if (!registerForm.username || !registerForm.password || !registerForm.confirmPassword) {
	  console.log('我没填表单')
    uni.showToast({
      title: '请填写完整信息',
      icon: 'none'
    });
    return;
  }
  
 else if (registerForm.password !== registerForm.confirmPassword) {
	 console.log('我密码不一致')
    uni.showToast({
      title: '两次密码输入不一致',
      icon: 'none'
    });
    return;
  }
  
 else if (!agreeToTerms.value) {
	console.log('我没接受协议')
    uni.showToast({
      title: '请先接受用户协议',
      icon: 'none',
      //duration: 1500
    });
    return;
  }
  
  try {
    isLoading.value = true;
    uni.showLoading({
    	title: '注册中...',
    	mask: true
    });
    // 调用注册API
    const response = await maiApi.divingFishRegister(
      registerForm.username,
      registerForm.password
    );
	uni.hideLoading();
	console.log(response)
    if (response.statusCode === 200) {
      uni.showToast({
        title: '注册成功，请登录',
        icon: 'none'
      });
	 loginForm.username = registerForm.username;
	 loginForm.password = registerForm.password;
      // 清空注册表单
      registerForm.username = '';
      registerForm.password = '';
      registerForm.confirmPassword = '';

      
      // 切换到登录模式
      isRegisterMode.value = false;
      
      // 自动填充登录表单
    
    } else {
	  uni.hideLoading();
      uni.showToast({
        title: response.data.message || '注册失败，请稍后再试',
        icon: 'none'
      });
    }
  } catch (error) {
	uni.hideLoading();
    console.error('注册失败:', error);
    const errorMessage = error.response?.data?.message || '注册失败,用户名已存在或网络异常';
    
    if (errorMessage.includes('已存在')) {
      uni.showToast({
        title: '用户名已被占用',
        icon: 'none'
      });
    } else {
      uni.showToast({
        title: errorMessage,
        icon: 'none'
      });
    }
  } finally {
    isLoading.value = false;
  }
};

// 前往注册页面
const goToRegister = () => {
  // 保持原有实现不变
};

// 页面加载时检查是否有保存的凭据
onMounted(() => {
  const savedCredentials = uni.getStorageSync('remember_credentials');
  if (savedCredentials) {
    try {
      const credentials = JSON.parse(savedCredentials);
      if (credentials && credentials.username) {
        loginForm.username = credentials.username;
        loginForm.password = credentials.password || '';
        rememberMe.value = true;
      }
    } catch (error) {
      console.error('恢复保存的凭据失败:', error);
    }
  }
});

// 打开用户协议页面
const openAgreement = () => {
  uni.navigateTo({
    url: '/pages/agreement/agreement?type=popup'
  });
};
</script>

<style lang="scss" scoped>
@import './dark-login.scss';
.login-page {
  position: relative;
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  
  .flex-container {
    display: flex;
    flex-direction: column;
    justify-content: center; /* 垂直居中 */
    align-items: center; /* 水平居中 */
    min-height: 100vh; /* 占满整个视口高度 */
    width: 100%;
    padding: 90rpx;
    box-sizing: border-box;
  }
  
  .login-container {
    position: relative;
    width: 100%;
    max-width: 750rpx;
    padding: 40rpx 30rpx 50rpx;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 30rpx;
    box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.08);
    animation: fadeIn 0.6s ease-out;
    z-index: 2;
    
    .login-header {
      text-align: center;
      margin-bottom: 10rpx; /* 减少底部间距 */
      
      .logo {
        width: 120rpx;
        height: 120rpx;
        margin-bottom: -20rpx; /* 减少间距 */
      }
      
      .app-name {
        font-size: 40rpx;
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 6rpx; /* 减少间距 */
      }
      
      .app-slogan {
        font-size: 24rpx;
        color: #64748b;
        margin-bottom: 20rpx; /* 减少间距 */
      }
      
      .auth-tabs {
        display: flex;
        background-color: #f1f5f9;
        border-radius: 12rpx;
        padding: 6rpx;
        margin: 0 auto 30rpx; /* 减少间距 */
        width: 80%;
        
        .tab-item {
          flex: 1;
          text-align: center;
          padding: 16rpx 0;
          font-size: 28rpx;
          color: #64748b;
          border-radius: 8rpx;
          transition: all 0.3s;
          
          &.active {
            background-color: white;
            color: #6366f1;
            font-weight: 500;
            box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
          }
        }
      }
    }
    
    .login-form, .register-form {
      .input-group {
        margin-bottom: 24rpx;
        position: relative;
        
        .input-label {
          font-size: 24rpx;
          color: #475569;
          margin-bottom: 8rpx;
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
          
          &::before {
            content: '';
            display: inline-block;
            width: 6rpx;
            height: 24rpx;
            background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
            margin-right: 10rpx;
            border-radius: 3rpx;
          }
        }
        
        /* 参考maiupdate的输入框样式 */
        input {
          height: 88rpx;
          padding: 0 24rpx;
          background: #f8fafc;
          border: 3rpx solid #e2e8f0;
          border-radius: 16rpx;
          font-size: 28rpx;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          width: 100%;
          box-sizing: border-box;
          transform: scale(1);
          
          &:focus {
            border-color: #a5b4fc;
            box-shadow: 0 0 0 4rpx rgba(165, 180, 252, 0.1);
            background-color: white;
            transform: scale(1.01);
          }
          
          &:hover {
            border-color: #a5b4fc;
            background-color: white;
          }
          
          &:disabled {
            background-color: #f8fafc;
            color: #94a3b8;
            transform: none;
          }
        }
        
        &:focus-within .input-label {
          color: #6366f1;
          transform: translateX(4rpx);
        }
        
        .password-input-container {
          position: relative;
          width: 100%;
          
          input {
            width: 100%;
            padding-right: 80rpx; /* 为图标留出空间 */
          }
          
          .toggle-password {
			padding-right:10rpx;
            position: absolute;
            right: 0;
            top: 0;
            height: 88rpx;
            width: 80rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            background: transparent;
            color: #64748b;
            z-index: 2;
            transition: all 0.3s ease;
            
            .uni-icons {
              font-size: 20px;
            }
            
            &:active {
              color: #6366f1;
            }
          }
        }
      }
      
      .remember-forgot {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30rpx;
        font-size: 24rpx;
        
        .remember-me {
          display: flex;
          align-items: center;
          gap: 8rpx;
          color: #4b5563;
        }
        
        .forgot-password {
          color: #6366f1;
          position: relative;
          padding-bottom: 2rpx;
          
          &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 0;
            height: 1rpx;
            background-color: #6366f1;
            transition: width 0.3s ease;
          }
          
          &:active {
            opacity: 0.8;
          }
          
          &:hover::after {
            width: 100%;
          }
        }
      }
      
      .login-button, .register-button {
        height: 88rpx;
        width: 100%;
        border-radius: 16rpx;
        background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
        color: white;
        font-size: 30rpx;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        box-shadow: 0 4rpx 12rpx rgba(99, 102, 241, 0.2);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        margin-bottom: 0;
        
        &:active:not(.loading) {
          transform: translateY(2rpx);
          box-shadow: 0 2rpx 8rpx rgba(99, 102, 241, 0.2);
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
        }
        
        &.loading {
          background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
          opacity: 0.8;
        }
        
        .loading-spinner {
          width: 40rpx;
          height: 40rpx;
          border: 4rpx solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 0.8s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      }
    }
    
    .mode-switch {
      text-align: center;
      font-size: 26rpx;
      color: #4b5563;
      margin-top: 24rpx;
      
      .link {
        color: #6366f1;
        margin-left: 10rpx;
        position: relative;
        
        &::after {
          content: '';
          position: absolute;
          bottom: -2rpx;
          left: 0;
          width: 0;
          height: 1rpx;
          background-color: #6366f1;
          transition: width 0.3s ease;
        }
        
        &:active {
          opacity: 0.8;
        }
        
        &:hover::after {
          width: 100%;
        }
      }
    }
  }
  
  .wave-container {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 150rpx; /* 再降低一点高度 */
    overflow: hidden;
    
    .wave {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 600%; /* 更宽的波浪图形 */
      height: 100%;
      background-repeat: repeat-x;
      background-position: 0 bottom;
    }
    
    .wave1 {
      background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120'><path fill='%236366f1' opacity='0.25' d='M0,36 C100,60 280,0 400,30 C520,60 600,10 720,30 C840,50 960,10 1080,20 C1200,30 1320,60 1400,30 L1400,120 L0,120 Z'/></svg>");
      opacity: 0.7;
      animation: waveAnimate 25s linear infinite;
      z-index: 1;
    }
    
    .wave2 {
      background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120'><path fill='%238b5cf6' opacity='0.25' d='M0,20 C150,40 250,10 450,40 C650,70 700,20 900,40 C1050,55 1150,20 1200,30 L1200,120 L0,120 Z'/></svg>");
      opacity: 0.5;
      animation: waveAnimate 20s linear infinite;
      animation-delay: -5s;
      z-index: 0;
    }
    
    .wave3 {
      background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120'><path fill='%234f46e5' opacity='0.25' d='M0,60 C200,30 400,70 600,40 C800,10 1000,50 1200,30 L1200,120 L0,120 Z'/></svg>");
      opacity: 0.4;
      animation: waveAnimate 30s linear infinite;
      animation-delay: -2s;
      z-index: -1;
    }
    
    .wave4 {
      background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120'><path fill='%23a78bfa' opacity='0.25' d='M0,40 C100,20 300,60 500,20 C700,50 900,10 1000,30 C1100,50 1175,20 1200,25 L1200,120 L0,120 Z'/></svg>");
      opacity: 0.3;
      animation: waveAnimate 22s linear infinite;
      animation-delay: -10s;
      z-index: -2;
    }
  }
  
  /* 修复波浪动画，确保完美循环 */
  @keyframes waveAnimate {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-16.6667%); /* 设置为图形宽度的1/6，确保无缝循环 */
    }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-20rpx); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  // 添加忘记密码弹窗样式
  .recovery-popup {
    width: 600rpx;
    background-color: white;
    border-radius: 24rpx;
    padding: 40rpx;
    box-shadow: 0 10rpx 25rpx rgba(0, 0, 0, 0.1);
    
    .recovery-title {
      font-size: 34rpx;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 20rpx;
      text-align: center;
    }
    
    .recovery-desc {
      font-size: 26rpx;
      color: #64748b;
      margin-bottom: 30rpx;
      line-height: 1.5;
    }
    
    .input-group {
      margin-bottom: 30rpx;
   
      .input-label {
        font-size: 24rpx;
        color: #475569;
        margin-bottom: 8rpx;
      }
      
      .form-input {
        height: 90rpx;
        padding: 0 24rpx;
        background: #f8fafc;
        border: 2rpx solid #e2e8f0;
        border-radius: 16rpx;
        font-size: 28rpx;
        
      
      }
    }
    
    .popup-buttons {
      display: flex;
      justify-content: space-between;
      gap: 20rpx;
      
      .popup-btn {
        flex: 1;
        height: 80rpx;
        border-radius: 16rpx;
        font-size: 28rpx;
        font-weight: 500;
        display: flex;
        align-items: center;
        justify-content: center;
        
        &.cancel {
          background-color: #f1f5f9;
          color: #64748b;
          
          &:active {
            background-color: #e2e8f0;
          }
        }
        
        &.confirm {
          background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
          color: white;
          
          &:active {
            background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          }
          
          &.loading {
            opacity: 0.8;
          }
          
          .loading-spinner {
            width: 32rpx;
            height: 32rpx;
            border: 3rpx solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 0.8s linear infinite;
          }
        }
      }
    }
  }

  // 添加用户协议勾选样式
  .agreement-check {
    margin-bottom: 36rpx;
    margin-top: 16rpx;
    display: flex;
    align-items: center;
    
    .agreement-label {
      display: flex;
      align-items: center;
      font-size: 24rpx;
      color: #4b5563;
      flex-wrap: wrap;
    }
    
    .agreement-link {
      color: #6366f1;
      margin-left: 4rpx;
      position: relative;
      
      &::after {
        content: '';
        position: absolute;
        bottom: -2rpx;
        left: 0;
        width: 0;
        height: 1rpx;
        background-color: #6366f1;
        transition: width 0.3s ease;
      }
      
      &:active {
        opacity: 0.8;
      }
      
      &:hover::after {
        width: 100%;
      }
    }
  }
}
</style>