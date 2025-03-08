<template>
  <view class="agreement-popup" v-if="isPopup">
    <view class="popup-overlay" @click="handleCancel"></view>
    <view class="popup-content">
      <view class="popup-header">
        <text class="header-title">用户协议</text>
      </view>
      
      <scroll-view class="popup-body" scroll-y>
        <text class="welcome-text">尊敬的用户，感谢您选择使用舞萌 DX 查分器。为了保障您的权益和确保您的信息安全，我们制定了以下用户协议，请您仔细阅读并同意以下条款：</text>
        
        <view class="agreement-section">
          <view class="section-title">
            <text>1. 注册和账号安全</text>
          </view>
          <view class="section-content">
            <view class="content-item">
              <text>1.1 为了使用完整的账号功能，您需注册一个账号并同意用户协议。</text>
            </view>
            <view class="content-item">
              <text>1.2 您应对您的账号和密码负有保密责任，请勿将其提供给任何第三方。</text>
            </view>
            <view class="content-item">
              <text>1.3 如您发现有任何未经授权使用您账号的情况，应立即通知我们。</text>
            </view>
          </view>
        </view>
        
        <view class="agreement-section">
          <view class="section-title">
            <text>2. 公开成绩信息风险</text>
          </view>
          <view class="section-content">
            <view class="content-item">
              <text>2.1 在本网站上公开您的成绩信息时，存在被不怀好意的攻击者利用并进行网络攻击的风险，成绩掩码并不能完全防止攻击者的攻击。</text>
            </view>
            <view class="content-item">
              <text>2.2 请您谨慎选择公开成绩信息，并对因此造成的任何风险和后果承担责任。如果您想要公开您的成绩信息，请在个人资料界面取消勾选"禁止其他人查询我的成绩"。</text>
            </view>
          </view>
        </view>
        
        <view class="agreement-section">
          <view class="section-title">
            <text>3. 网络攻击风险免责</text>
          </view>
          <view class="section-content">
            <view class="content-item">
              <text>3.1 本网站将采取合理的技术手段保护您的信息安全，但无法完全消除网络攻击的风险。</text>
            </view>
            <view class="content-item">
              <text>3.2 如果因为您在使用本网站时泄露了个人信息而导致被攻击，我们将不承担任何责任。</text>
            </view>
          </view>
        </view>
        
        <view class="agreement-section">
          <view class="section-title">
            <text>4. 其他</text>
          </view>
          <view class="section-content">
            <view class="content-item">
              <text>4.1 本协议适用中华人民共和国的法律法规。</text>
            </view>
          </view>
        </view>
      </scroll-view>
      
      <view class="popup-footer">
        <button class="footer-btn cancel" @click="handleCancel">不同意</button>
        <button class="footer-btn confirm" @click="handleConfirm">同意并继续</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isPopup = ref(false)

onMounted(() => {
  // 获取页面参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const eventChannel = currentPage.getOpenerEventChannel()
  
  // 检查是否为弹窗模式
  isPopup.value = currentPage.$page.options.type === 'popup'
})

const handleConfirm = () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const eventChannel = currentPage.getOpenerEventChannel()
  
  // 发送确认结果
  eventChannel.emit('agreementResult', { agreed: true })
  uni.navigateBack()
}

const handleCancel = () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const eventChannel = currentPage.getOpenerEventChannel()
  
  // 发送拒绝结果
  eventChannel.emit('agreementResult', { agreed: false })
  uni.navigateBack()
}
</script>

<style lang="scss">
.agreement-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  
  .popup-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(4px);
  }
  
  .popup-content {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 700rpx;
    background: white;
    border-radius: 20rpx;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    max-height: 85vh;
    
    .popup-header {
      padding: 30rpx;
      border-bottom: 1px solid #e2e8f0;
      
      .header-title {
        font-size: 36rpx;
        font-weight: 600;
        color: #1e293b;
      }
    }
    
    .popup-body {
      flex: 1;
      padding: 40rpx;
      max-height: 65vh;
      box-sizing: border-box;
      width: 100%;
      
      .welcome-text {
        display: block;
        font-size: 28rpx;
        color: #475569;
        line-height: 1.8;
        margin-bottom: 30rpx;
        padding: 20rpx;
        background: #f8fafc;
        border-radius: 12rpx;
        border-left: 4rpx solid #6366f1;
        width: 100%;
        box-sizing: border-box;
      }
    }
 
    .popup-footer {
	  margin-top:5% ;
      padding: 50rpx;
      display: flex;
	  justify-content: center;
      gap: 20rpx;
     
      box-sizing: border-box;
      .footer-btn {
        flex: 1;
        height: 80rpx;
        border: none;
        border-radius: 12rpx;
        font-size: 28rpx;
        font-weight: 500;
        
        &.cancel {
          background: #f1f5f9;
          color: #64748b;
        }
        
        &.confirm {
          background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
          color: white;
        }
      }
    }
  }
}

// 协议内容样式
.agreement-section {
  margin-bottom: 30rpx;
  display: flex;
  flex-direction: column;
  width: 100%;
  
  .section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 20rpx;
    display: flex;
    width: 100%;
    
    text {
      flex: 1;
      word-break: break-all;
      padding-right: 20rpx;
    }
  }
  
  .section-content {
    font-size: 28rpx;
    color: #64748b;
    line-height: 1.8;
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    width: 100%;
    
    .content-item {
      display: flex;
      padding-left: 20rpx;
      width: 100%;
      box-sizing: border-box;
      
      text {
        flex: 1;
        word-break: break-all;
        padding-right: 20rpx;
      }
    }
  }
}
</style> 